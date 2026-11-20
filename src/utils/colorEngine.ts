export type HarmonyRule =
  | 'monochromatic'
  | 'analogous'
  | 'complementary'
  | 'split-complementary'
  | 'triadic'
  | 'tetradic';

export interface GeneratedPalette {
  bgCanvas: string;
  bgSurface: string;
  textPrimary: string;
  textSecondary: string;
  brandPrimary: string;
  brandText: string;
  accentSecondary: string;
  accentTertiary: string;
  borderColor: string;
}

export const HARMONY_LABELS: Record<HarmonyRule, { label: string; angleSummary: string }> = {
  monochromatic: { label: 'Monocromático', angleSummary: '0° (Un solo matiz, variación L/S)' },
  analogous: { label: 'Análogo', angleSummary: '0°, +30°, -30° (Cercanía cromática)' },
  complementary: { label: 'Complementario', angleSummary: '0°, +180° (Máximo contraste)' },
  'split-complementary': {
    label: 'Complementario Dividido',
    angleSummary: '0°, +150°, +210° (Tensión equilibrada)',
  },
  triadic: { label: 'Triádico', angleSummary: '0°, +120°, +240° (Triángulo equidistante)' },
  tetradic: { label: 'Tetrádico', angleSummary: '0°, +90°, +180° (Riqueza de cuatro polos)' },
};

function normalizeHex(hex: string): string {
  const clean = hex.trim().replace('#', '');
  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    return `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`.toUpperCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return `#${clean}`.toUpperCase();
  }
  return '#2563EB';
}

// Conversión HEX -> HSL
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const safeHex = normalizeHex(hex);
  const clean = safeHex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Conversión HSL -> HEX
export function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.max(0, Math.min(100, s)) / 100;
  const lig = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (hue < 60) {
    r = c;
    g = x;
  } else if (hue < 120) {
    r = x;
    g = c;
  } else if (hue < 180) {
    g = c;
    b = x;
  } else if (hue < 240) {
    g = x;
    b = c;
  } else if (hue < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Cálculo de luminancia relativa para contraste accesible (WCAG 2.1)
export function getLuminance(hex: string): number {
  const safeHex = normalizeHex(hex);
  const clean = safeHex.replace('#', '');
  const rgb = [0, 2, 4].map((i) => {
    const v = parseInt(clean.substring(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

// Cálculo de razón de contraste WCAG entre dos colores HEX
export function getContrastRatio(hexA: string, hexB: string): number {
  const lumA = getLuminance(hexA);
  const lumB = getLuminance(hexB);
  const brightest = Math.max(lumA, lumB);
  const darkest = Math.min(lumA, lumB);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

// Aproximación determinista de coordenadas OKLCH para documentación en DESIGN.md
export function hexToApproxOklch(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  const okL = (l / 100).toFixed(2);
  const okC = ((s / 100) * 0.24 * (1 - Math.abs(2 * (l / 100) - 1) * 0.5)).toFixed(3);
  return `oklch(${okL} ${okC} ${h})`;
}

export function getAccessibleBrandText(brandHex: string): string {
  const contrastWithWhite = getContrastRatio(brandHex, '#FFFFFF');
  const contrastWithDark = getContrastRatio(brandHex, '#0F172A');
  return contrastWithWhite >= contrastWithDark ? '#FFFFFF' : '#0F172A';
}

export function generatePaletteFromSeed(
  seedHex: string,
  harmony: HarmonyRule,
  isDark: boolean
): GeneratedPalette {
  const normalizedSeed = normalizeHex(seedHex);
  const { h, s, l } = hexToHsl(normalizedSeed);

  // 1. Cálculo de ángulos armónicos
  let secondaryHue = h;
  let tertiaryHue = h;

  switch (harmony) {
    case 'monochromatic':
      secondaryHue = h;
      tertiaryHue = h;
      break;
    case 'analogous':
      secondaryHue = h + 30;
      tertiaryHue = h - 30;
      break;
    case 'complementary':
      secondaryHue = h + 180;
      tertiaryHue = h;
      break;
    case 'split-complementary':
      secondaryHue = h + 150;
      tertiaryHue = h + 210;
      break;
    case 'triadic':
      secondaryHue = h + 120;
      tertiaryHue = h + 240;
      break;
    case 'tetradic':
      secondaryHue = h + 90;
      tertiaryHue = h + 180;
      break;
  }

  // 2. Ajuste de saturación y luminosidad para acentos
  const brandPrimary = hslToHex(h, Math.max(s, 55), isDark ? Math.max(l, 55) : Math.min(l, 48));
  const accentSecondary =
    harmony === 'monochromatic'
      ? hslToHex(h, Math.max(20, s - 25), isDark ? 72 : 35)
      : hslToHex(secondaryHue, Math.max(50, s), isDark ? 60 : 46);
  const accentTertiary =
    harmony === 'monochromatic'
      ? hslToHex(h, Math.max(15, s - 35), isDark ? 38 : 75)
      : hslToHex(tertiaryHue, Math.max(45, s - 10), 52);

  // 3. Superficies neutras tintadas sutilmente con el matiz semilla (h)
  const bgCanvas = isDark ? hslToHex(h, 14, 7) : hslToHex(h, 18, 97);
  const bgSurface = isDark ? hslToHex(h, 12, 12) : '#FFFFFF';
  const textPrimary = isDark ? hslToHex(h, 10, 95) : hslToHex(h, 25, 11);
  const textSecondary = isDark ? hslToHex(h, 10, 72) : hslToHex(h, 14, 36);
  const borderColor = isDark ? hslToHex(h, 12, 22) : hslToHex(h, 16, 84);

  // 4. Texto seguro sobre el botón primario (WCAG)
  const brandText = getAccessibleBrandText(brandPrimary);

  return {
    bgCanvas,
    bgSurface,
    textPrimary,
    textSecondary,
    brandPrimary,
    brandText,
    accentSecondary,
    accentTertiary,
    borderColor,
  };
}
