import { ARCHETYPES, type DesignSystemState } from '../data/archetypes';
import {
  generatePaletteFromSeed,
  getAccessibleBrandText,
  getContrastRatio,
  getLuminance,
  hexToHsl,
  hslToHex,
  type GeneratedPalette,
  type HarmonyRule,
} from './colorEngine';

export interface ImageExtractionResult {
  dominantSwatches: string[];
  seedColor: string;
  isDark: boolean;
  palette: GeneratedPalette;
  summary: string;
}

export interface CssUrlExtractionResult {
  detectedColors: { hex: string; count: number }[];
  detectedFonts: string[];
  detectedRadiusPx: number;
  seedColor: string;
  isDark: boolean;
  palette: GeneratedPalette;
  archetypeId: string;
  summary: string;
}

export interface ParsedMarkdownResult {
  statePatch: Partial<DesignSystemState>;
  parsedTokenCount: number;
  summary: string;
}

interface RgbPoint {
  r: number;
  g: number;
  b: number;
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g)
    .toString(16)
    .padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`.toUpperCase();
}

function colorDistanceSq(a: RgbPoint, b: RgbPoint): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

/**
 * Algoritmo determinista K-Means sobre píxeles de un ImageData de <canvas> HTML5
 */
export function extractPaletteFromImageData(imageData: ImageData): ImageExtractionResult {
  const { data, width, height } = imageData;
  const samples: RgbPoint[] = [];
  const totalPixels = width * height;
  const step = Math.max(1, Math.floor(totalPixels / 1200));

  for (let i = 0; i < data.length; i += 4 * step) {
    const alpha = data[i + 3];
    if (alpha < 128) continue;
    samples.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
  }

  if (samples.length === 0) {
    const fallback = generatePaletteFromSeed('#2563EB', 'analogous', false);
    return {
      dominantSwatches: ['#2563EB', '#0F172A', '#F8FAFC'],
      seedColor: '#2563EB',
      isDark: false,
      palette: fallback,
      summary: 'Imagen sin píxeles opacos; paleta base aplicada.',
    };
  }

  // Inicialización determinista de k=5 centroides espaciados uniformemente
  const k = 5;
  const centroids: RgbPoint[] = [];
  for (let c = 0; c < k; c++) {
    const idx = Math.min(samples.length - 1, Math.floor(((c + 0.5) * samples.length) / k));
    centroids.push({ ...samples[idx] });
  }

  const counts = new Array<number>(k).fill(0);

  // 8 iteraciones de agrupamiento K-Means
  for (let iter = 0; iter < 8; iter++) {
    const sums = Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0, count: 0 }));

    for (const pt of samples) {
      let bestCluster = 0;
      let bestDist = Infinity;
      for (let c = 0; c < k; c++) {
        const dist = colorDistanceSq(pt, centroids[c]);
        if (dist < bestDist) {
          bestDist = dist;
          bestCluster = c;
        }
      }
      sums[bestCluster].r += pt.r;
      sums[bestCluster].g += pt.g;
      sums[bestCluster].b += pt.b;
      sums[bestCluster].count += 1;
    }

    for (let c = 0; c < k; c++) {
      counts[c] = sums[c].count;
      if (sums[c].count > 0) {
        centroids[c] = {
          r: sums[c].r / sums[c].count,
          g: sums[c].g / sums[c].count,
          b: sums[c].b / sums[c].count,
        };
      }
    }
  }

  // Ordenar clusters por peso poblacional
  const clusters = centroids
    .map((pt, index) => {
      const hex = rgbToHex(pt.r, pt.g, pt.b);
      const hsl = hexToHsl(hex);
      const lum = getLuminance(hex);
      return {
        hex,
        weight: counts[index],
        lum,
        hsl,
      };
    })
    .filter((c) => c.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  // Deduplicar swatches cercanos
  const dominantSwatches = Array.from(new Set(clusters.map((c) => c.hex)));

  // Determinar si la atmósfera dominante es oscura o clara según el cluster de mayor área
  const primaryAreaCluster = clusters[0];
  const isDark = primaryAreaCluster.lum < 0.28;

  // Ordenar por luminancia para asignar --bg-canvas y --text-primary
  const byLuminance = [...clusters].sort((a, b) => a.lum - b.lum);
  const darkest = byLuminance[0];
  const lightest = byLuminance[byLuminance.length - 1];

  // Elegir el cluster con mayor croma/saturación para --brand-primary
  const bySaturation = [...clusters].sort(
    (a, b) => b.hsl.s * (1 - Math.abs(b.hsl.l - 50) / 70) - a.hsl.s * (1 - Math.abs(a.hsl.l - 50) / 70)
  );
  const mostVibrant = bySaturation[0] || primaryAreaCluster;
  const secondVibrant = bySaturation[1] || mostVibrant;

  const seedHsl = mostVibrant.hsl;
  const bgCanvas = isDark
    ? darkest.lum < 0.08
      ? darkest.hex
      : hslToHex(darkest.hsl.h, Math.min(25, darkest.hsl.s), 8)
    : lightest.lum > 0.78
      ? lightest.hex
      : hslToHex(lightest.hsl.h, Math.min(24, lightest.hsl.s), 96);

  const bgSurface = isDark
    ? hslToHex(seedHsl.h, 14, 13)
    : '#FFFFFF';

  let textPrimary = isDark ? lightest.hex : darkest.hex;
  if (getContrastRatio(bgCanvas, textPrimary) < 7) {
    textPrimary = isDark ? hslToHex(seedHsl.h, 10, 95) : hslToHex(seedHsl.h, 24, 11);
  }

  const textSecondary = isDark
    ? hslToHex(seedHsl.h, 10, 72)
    : hslToHex(seedHsl.h, 14, 36);

  const brandPrimary = hslToHex(
    seedHsl.h,
    Math.max(55, seedHsl.s),
    isDark ? Math.max(55, Math.min(72, seedHsl.l)) : Math.min(50, Math.max(36, seedHsl.l))
  );

  const accentSecondary = hslToHex(
    secondVibrant.hsl.h,
    Math.max(48, secondVibrant.hsl.s),
    isDark ? 62 : 45
  );

  const accentTertiary = hslToHex((seedHsl.h + 120) % 360, 52, isDark ? 58 : 48);
  const borderColor = isDark
    ? hslToHex(seedHsl.h, 14, 23)
    : hslToHex(seedHsl.h, 16, 84);
  const brandText = getAccessibleBrandText(brandPrimary);

  return {
    dominantSwatches,
    seedColor: brandPrimary,
    isDark,
    palette: {
      bgCanvas,
      bgSurface,
      textPrimary,
      textSecondary,
      brandPrimary,
      brandText,
      accentSecondary,
      accentTertiary,
      borderColor,
    },
    summary: `Extraídos ${dominantSwatches.length} clusters cromáticos vía K-Means en <canvas> (${
      isDark ? 'Modo Oscuro' : 'Modo Claro'
    } detectado por luminancia).`,
  };
}

/**
 * Procesa un archivo o URL de imagen en un <canvas> oculto de 96x96px
 */
export function extractPaletteFromImageSource(src: string): Promise<ImageExtractionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 96;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo inicializar el contexto 2D del canvas.'));
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size);
      resolve(extractPaletteFromImageData(imageData));
    };
    img.onerror = () => {
      reject(new Error('No se pudo decodificar la imagen seleccionada.'));
    };
    img.src = src;
  });
}

/**
 * Genera un lienzo PNG en base64 para probar el extractor K-Means sin requerir archivos externos
 */
export function createSampleCanvasDataUrl(
  preset: 'editorial-sunset' | 'cyber-hud' | 'forest-paper'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (preset === 'editorial-sunset') {
    ctx.fillStyle = '#FAF6F0';
    ctx.fillRect(0, 0, 240, 140);
    ctx.fillStyle = '#1C1917';
    ctx.fillRect(18, 20, 90, 26);
    ctx.fillStyle = '#C2410C';
    ctx.beginPath();
    ctx.arc(175, 70, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F766E';
    ctx.fillRect(18, 64, 100, 52);
  } else if (preset === 'cyber-hud') {
    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, 240, 140);
    ctx.fillStyle = '#06B6D4';
    ctx.fillRect(20, 22, 110, 42);
    ctx.fillStyle = '#EC4899';
    ctx.beginPath();
    ctx.arc(185, 74, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(20, 82, 95, 34);
  } else {
    ctx.fillStyle = '#F4F1EA';
    ctx.fillRect(0, 0, 240, 140);
    ctx.fillStyle = '#14532D';
    ctx.fillRect(20, 20, 120, 65);
    ctx.fillStyle = '#B45309';
    ctx.fillRect(152, 24, 68, 92);
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(20, 96, 120, 24);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Parsea un bloque CSS crudo o URL con expresiones regulares para extraer fuentes, radios y colores HEX
 */
export function extractTokensFromCssOrUrl(rawInput: string): CssUrlExtractionResult {
  const input = rawInput.trim();

  // 1. Extraer colores hexadecimales y contar frecuencia
  const hexRegex = /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
  const matches = input.match(hexRegex) || [];
  const freqMap = new Map<string, number>();

  for (const rawHex of matches) {
    const clean = rawHex.replace('#', '');
    const normalized =
      clean.length === 3
        ? `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`.toUpperCase()
        : `#${clean}`.toUpperCase();
    freqMap.set(normalized, (freqMap.get(normalized) || 0) + 1);
  }

  // Si es una URL sin colores explícitos, derivar semilla determinista del hostname
  if (freqMap.size === 0 && /^https?:\/\//i.test(input)) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }
    const derivedHue = Math.abs(hash) % 360;
    const primaryHex = hslToHex(derivedHue, 72, 46);
    const secondaryHex = hslToHex((derivedHue + 35) % 360, 65, 52);
    freqMap.set(primaryHex, 4);
    freqMap.set(secondaryHex, 2);
    freqMap.set('#0F172A', 3);
    freqMap.set('#F8FAFC', 5);
  }

  const detectedColors = Array.from(freqMap.entries())
    .map(([hex, count]) => ({ hex, count }))
    .sort((a, b) => b.count - a.count);

  // 2. Extraer familias tipográficas con Regex
  const fontRegex = /font-family\s*:\s*([^;}\n]+)/gi;
  const fontSet = new Set<string>();
  let fontMatch: RegExpExecArray | null = fontRegex.exec(input);
  while (fontMatch !== null) {
    const firstFamily = fontMatch[1]
      .split(',')[0]
      .replace(/['"]/g, '')
      .trim();
    if (
      firstFamily &&
      !['sans-serif', 'serif', 'monospace', 'inherit', 'system-ui'].includes(
        firstFamily.toLowerCase()
      )
    ) {
      fontSet.add(firstFamily);
    }
    fontMatch = fontRegex.exec(input);
  }
  const detectedFonts = Array.from(fontSet);

  // 3. Extraer border-radius con Regex
  const radiusRegex = /border-radius\s*:\s*([0-9.]+)\s*(px|rem)/gi;
  const radiiPx: number[] = [];
  let radiusMatch: RegExpExecArray | null = radiusRegex.exec(input);
  while (radiusMatch !== null) {
    const val = parseFloat(radiusMatch[1]);
    const unit = radiusMatch[2].toLowerCase();
    if (!Number.isNaN(val)) {
      const px = unit === 'rem' ? Math.round(val * 16) : Math.round(val);
      radiiPx.push(Math.max(0, Math.min(24, px)));
    }
    radiusMatch = radiusRegex.exec(input);
  }

  const detectedRadiusPx =
    radiiPx.length > 0
      ? Math.round(radiiPx.reduce((acc, v) => acc + v, 0) / radiiPx.length)
      : 8;

  // 4. Determinar color semilla (el más frecuente con saturación cromática > 20%)
  const chromaticCandidate = detectedColors.find((item) => hexToHsl(item.hex).s >= 22);
  const seedColor = chromaticCandidate?.hex || detectedColors[0]?.hex || '#4F46E5';

  // Detectar si hay fondos oscuros explícitos
  const darkSurfaceCandidate = detectedColors.find((item) => getLuminance(item.hex) < 0.08);
  const lightSurfaceCandidate = detectedColors.find((item) => getLuminance(item.hex) > 0.85);
  const isDark = Boolean(darkSurfaceCandidate && !lightSurfaceCandidate);

  // Inferir arquetipo según radio detectado
  let archetypeId = 'minimalist';
  if (detectedRadiusPx === 0) archetypeId = 'brutalist';
  else if (detectedRadiusPx >= 15) archetypeId = 'glassmorphism';
  else if (detectedRadiusPx <= 4 && isDark) archetypeId = 'futuristic';

  const palette = generatePaletteFromSeed(seedColor, 'analogous', isDark);

  return {
    detectedColors,
    detectedFonts,
    detectedRadiusPx,
    seedColor,
    isDark,
    palette,
    archetypeId,
    summary: `Detectados ${detectedColors.length} colores HEX, ${
      detectedFonts.length
    } fuentes y radio promedio de ${detectedRadiusPx}px.`,
  };
}

/**
 * Parsea un documento DESIGN.md existente mediante Regex y reconstruye el estado del Estudio
 */
export function parseDesignMarkdown(markdown: string): ParsedMarkdownResult {
  const text = markdown.trim();
  let parsedTokenCount = 0;

  const extractFrontmatterField = (key: string): string | null => {
    const regex = new RegExp(`^${key}\\s*:\\s*["']?([^"'\\n\\r]+)["']?`, 'mi');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  const extractCssVarHex = (varName: string): string | null => {
    const regex = new RegExp(`${varName}\\s*[:|]\\s*\`?(#[0-9a-fA-F]{6})\`?`, 'i');
    const match = text.match(regex);
    if (match) {
      parsedTokenCount += 1;
      return match[1].toUpperCase();
    }
    return null;
  };

  const name = extractFrontmatterField('name') || 'Sistema Importado';
  const rawArchetype = extractFrontmatterField('archetype') || 'minimalist';
  const archetypeId = ARCHETYPES[rawArchetype] ? rawArchetype : 'minimalist';

  const rawHarmony = extractFrontmatterField('harmony') as HarmonyRule | null;
  const validHarmonies: HarmonyRule[] = [
    'monochromatic',
    'analogous',
    'complementary',
    'split-complementary',
    'triadic',
    'tetradic',
  ];
  const harmony: HarmonyRule =
    rawHarmony && validHarmonies.includes(rawHarmony) ? rawHarmony : 'analogous';

  const rawMode = extractFrontmatterField('mode');
  const isDark = rawMode ? rawMode.toLowerCase() === 'dark' : false;

  const preset = ARCHETYPES[archetypeId];
  const fallbackPalette = generatePaletteFromSeed(preset.defaultSeed, harmony, isDark);

  const bgCanvas = extractCssVarHex('--bg-canvas') || fallbackPalette.bgCanvas;
  const bgSurface = extractCssVarHex('--bg-surface') || fallbackPalette.bgSurface;
  const textPrimary = extractCssVarHex('--text-primary') || fallbackPalette.textPrimary;
  const textSecondary = extractCssVarHex('--text-secondary') || fallbackPalette.textSecondary;
  const brandPrimary = extractCssVarHex('--brand-primary') || fallbackPalette.brandPrimary;
  const brandText = extractCssVarHex('--brand-text') || getAccessibleBrandText(brandPrimary);
  const accentSecondary =
    extractCssVarHex('--accent-secondary') || fallbackPalette.accentSecondary;
  const accentTertiary =
    extractCssVarHex('--accent-tertiary') || fallbackPalette.accentTertiary;
  const borderColor = extractCssVarHex('--border-color') || fallbackPalette.borderColor;

  // Extraer radio y borde
  const radiusMatch = text.match(/--radius\s*[:|]\s*`?(\d+)px`?/i);
  const borderRadius = radiusMatch
    ? Math.max(0, Math.min(24, parseInt(radiusMatch[1], 10)))
    : preset.geometry.borderRadius;
  if (radiusMatch) parsedTokenCount += 1;

  const borderWidthMatch = text.match(/--border-width\s*[:|]\s*`?(\d+)px`?/i);
  const borderWidth = borderWidthMatch
    ? Math.max(0, Math.min(3, parseInt(borderWidthMatch[1], 10)))
    : preset.geometry.borderWidth;
  if (borderWidthMatch) parsedTokenCount += 1;

  // Extraer fuentes
  const extractFontVar = (varName: string, fallbackFont: string): string => {
    const regex = new RegExp(`${varName}\\s*[:|]\\s*\`?['"]?([^'";\\n\`|]+)['"]?\`?`, 'i');
    const match = text.match(regex);
    if (match) {
      parsedTokenCount += 1;
      return match[1].split(',')[0].replace(/['"]/g, '').trim() || fallbackFont;
    }
    return fallbackFont;
  };

  const headingFont = extractFontVar('--font-heading', preset.fonts.heading);
  const bodyFont = extractFontVar('--font-body', preset.fonts.body);
  const monoFont = extractFontVar('--font-mono', preset.fonts.mono);

  return {
    statePatch: {
      projectName: name,
      archetypeId,
      seedColor: brandPrimary,
      harmony,
      isDark,
      palette: {
        bgCanvas,
        bgSurface,
        textPrimary,
        textSecondary,
        brandPrimary,
        brandText,
        accentSecondary,
        accentTertiary,
        borderColor,
      },
      fonts: {
        presetId: archetypeId,
        heading: headingFont,
        body: bodyFont,
        mono: monoFont,
        googleFontsUrl: preset.fonts.googleFontsUrl,
        scale: 'balanced',
      },
      geometry: {
        borderRadius,
        borderWidth,
        shadowStyle: preset.geometry.shadowStyle,
        density: preset.geometry.density,
      },
    },
    parsedTokenCount,
    summary: `Proyecto "${name}" importado con ${parsedTokenCount} tokens verificados (${preset.label}).`,
  };
}
