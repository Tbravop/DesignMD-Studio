import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code,
  FileCode2,
  FileUp,
  Layers,
  Lock,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
} from 'lucide-react';
import {
  ARCHETYPES,
  TYPOGRAPHY_SCALES,
  type DesignSystemState,
  type TypographyScaleId,
} from '../../data/archetypes';
import {
  HARMONY_LABELS,
  getContrastRatio,
  type GeneratedPalette,
  type HarmonyRule,
} from '../../utils/colorEngine';
import {
  createSampleCanvasDataUrl,
  extractPaletteFromImageSource,
  extractTokensFromCssOrUrl,
  parseDesignMarkdown,
  type CssUrlExtractionResult,
  type ImageExtractionResult,
  type ParsedMarkdownResult,
} from '../../utils/extractors';
import { compileDesignMarkdown } from '../../utils/markdownCompiler';
import type { IngestionMode } from './OriginRail';

interface ConfigTokensPanelProps {
  activeMode: IngestionMode;
  state: DesignSystemState;
  isChannelColumnOpen: boolean;
  onUpdateState: (patch: Partial<DesignSystemState>) => void;
  onSelectArchetypePreset: (archetypeId: string) => void;
  onUpdateSeedAndHarmony: (seedHex: string, harmony: HarmonyRule, isDark: boolean) => void;
  onUpdateTokenColor: (tokenKey: keyof GeneratedPalette, hexValue: string) => void;
  onSelectArchetypeFonts: (archetypeId: string) => void;
  onUpdateCustomFont: (field: 'heading' | 'body' | 'mono', value: string) => void;
  onUpdateTypographyScale: (scale: TypographyScaleId) => void;
  onUpdateGeometry: (patch: Partial<DesignSystemState['geometry']>) => void;
  onToggleChannelColumn: () => void;
  onAutoOpenChannelColumn: () => void;
}

const HARMONY_KEYS: HarmonyRule[] = [
  'monochromatic',
  'analogous',
  'complementary',
  'split-complementary',
  'triadic',
  'tetradic',
];

const QUICK_SEEDS = [
  '#2563EB',
  '#EA580C',
  '#6366F1',
  '#06B6D4',
  '#DB2777',
  '#B45309',
  '#059669',
];

const TOKEN_FIELDS: {
  key: keyof GeneratedPalette;
  cssVar: string;
  label: string;
  contrastAgainst?: keyof GeneratedPalette;
}[] = [
  { key: 'bgCanvas', cssVar: '--bg-canvas', label: 'Fondo Lienzo' },
  { key: 'bgSurface', cssVar: '--bg-surface', label: 'Superficie' },
  {
    key: 'textPrimary',
    cssVar: '--text-primary',
    label: 'Texto Primario',
    contrastAgainst: 'bgCanvas',
  },
  {
    key: 'textSecondary',
    cssVar: '--text-secondary',
    label: 'Texto Secundario',
    contrastAgainst: 'bgCanvas',
  },
  { key: 'brandPrimary', cssVar: '--brand-primary', label: 'Acento Primario' },
  {
    key: 'brandText',
    cssVar: '--brand-text',
    label: 'Texto s/ Primario',
    contrastAgainst: 'brandPrimary',
  },
  { key: 'accentSecondary', cssVar: '--accent-secondary', label: 'Acento Secundario' },
  { key: 'borderColor', cssVar: '--border-color', label: 'Color de Borde' },
];

const SAMPLE_CSS_SNIPPETS: Record<string, { label: string; css: string }> = {
  editorial: {
    label: 'Editorial SaaS',
    css: `:root {\n  --primary: #1D4ED8;\n  --accent: #0D9488;\n  --canvas: #F8FAFC;\n  --ink: #0F172A;\n}\n.card {\n  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;\n  border-radius: 10px;\n}`,
  },
  brutalist: {
    label: 'Neo-Brutalista',
    css: `.poster {\n  font-family: 'Space Grotesk', sans-serif;\n  background-color: #FFFBEB;\n  color: #111827;\n  border: 2px solid #111827;\n  border-radius: 0px;\n}\n.cta { background: #EA580C; }`,
  },
  telemetry: {
    label: 'HUD Telemetry',
    css: `https://telemetry.stitch.dev/hud\n.hud {\n  font-family: 'Chakra Petch', sans-serif;\n  background: #090D16;\n  color: #06B6D4;\n  border-radius: 4px;\n}`,
  },
};

const MODE_HEADERS: Record<IngestionMode, { badge: string; title: string; subtitle: string }> = {
  wizard: {
    badge: 'ORIGEN 01 • CASCADA PROGRESIVA',
    title: 'Crear desde 0',
    subtitle: 'Completa cada bloque para desbloquear el siguiente y abrir los canales.',
  },
  image: {
    badge: 'ORIGEN 02 • CANVAS K-MEANS',
    title: 'Extraer desde Imagen',
    subtitle: 'Sube o procesa una imagen para desbloquear el ajuste fino de tokens.',
  },
  'url-css': {
    badge: 'ORIGEN 03 • PARSER REGEX',
    title: 'Extraer desde URL / CSS',
    subtitle: 'Analiza una URL o bloque CSS para desbloquear los tokens extraídos.',
  },
  markdown: {
    badge: 'ORIGEN 04 • STITCH SPEC',
    title: 'Cargar DESIGN.md',
    subtitle: 'Importa un archivo DESIGN.md para desbloquear sus controles.',
  },
};

export function ConfigTokensPanel({
  activeMode,
  state,
  isChannelColumnOpen,
  onUpdateState,
  onSelectArchetypePreset,
  onUpdateSeedAndHarmony,
  onUpdateTokenColor,
  onSelectArchetypeFonts,
  onUpdateCustomFont,
  onUpdateTypographyScale,
  onUpdateGeometry,
  onToggleChannelColumn,
  onAutoOpenChannelColumn,
}: ConfigTokensPanelProps): React.ReactElement {
  // Progressive sub-step state (1..5) for "Crear desde 0", plus completion tracking
  const [unlockedSubStep, setUnlockedSubStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [hasCompletedAllBlocks, setHasCompletedAllBlocks] = useState(false);
  const [hasPickedArchetype, setHasPickedArchetype] = useState(false);

  const [showAdvancedTokens, setShowAdvancedTokens] = useState(false);
  const [showCustomFonts, setShowCustomFonts] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Image Extraction state
  const [imageStatus, setImageStatus] = useState<'idle' | 'loading' | 'error' | 'resolved'>('idle');
  const [imageErrorMsg, setImageErrorMsg] = useState('');
  const [imagePreviewSrc, setImagePreviewSrc] = useState('');
  const [imageResult, setImageResult] = useState<ImageExtractionResult | null>(null);

  // URL / CSS Extraction state
  const [cssInput, setCssInput] = useState(SAMPLE_CSS_SNIPPETS.editorial.css);
  const [cssResult, setCssResult] = useState<CssUrlExtractionResult | null>(null);

  // DESIGN.md Extraction state
  const [markdownInput, setMarkdownInput] = useState('');
  const [markdownResult, setMarkdownResult] = useState<ParsedMarkdownResult | null>(null);

  const unlockNextSubStep = (target: 2 | 3 | 4 | 5) => {
    setUnlockedSubStep((prev) => (prev < target ? target : prev));
  };

  // Auto-scroll smoothly when a new block unlocks in Column 2
  useEffect(() => {
    if (unlockedSubStep > 1 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
  }, [unlockedSubStep]);

  const handleCompleteBlock5AndAutoAdvance = (
    geometryPatch: Partial<DesignSystemState['geometry']>
  ) => {
    onUpdateGeometry(geometryPatch);
    if (!hasCompletedAllBlocks) {
      setHasCompletedAllBlocks(true);
    }
    onAutoOpenChannelColumn();
  };

  const handleProcessImageSource = async (src: string, labelName?: string) => {
    setImageStatus('loading');
    setImageErrorMsg('');
    setImagePreviewSrc(src);
    try {
      const extracted = await extractPaletteFromImageSource(src);
      setImageResult(extracted);
      setImageStatus('resolved');
      setUnlockedSubStep(5);
      const fallbackName = `${
        (ARCHETYPES[state.archetypeId] || ARCHETYPES.minimalist).label
      } — Design System`;
      onUpdateState({
        projectName: labelName ? `${labelName} — Design System` : fallbackName,
        seedColor: extracted.seedColor,
        isDark: extracted.isDark,
        palette: extracted.palette,
      });
    } catch (err) {
      setImageStatus('error');
      setImageErrorMsg(
        err instanceof Error ? err.message : 'Error al procesar la imagen en el canvas.'
      );
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        void handleProcessImageSource(reader.result, cleanName);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSampleCanvasImage = (
    preset: 'editorial-sunset' | 'cyber-hud' | 'forest-paper',
    title: string
  ) => {
    const dataUrl = createSampleCanvasDataUrl(preset);
    void handleProcessImageSource(dataUrl, title);
  };

  const handleParseCssOrUrl = (rawText: string) => {
    const res = extractTokensFromCssOrUrl(rawText);
    setCssResult(res);
    setUnlockedSubStep(5);
    const matchedArchetype = ARCHETYPES[res.archetypeId] || ARCHETYPES.minimalist;
    onUpdateState({
      projectName: `${matchedArchetype.label} — Design System`,
      archetypeId: res.archetypeId,
      seedColor: res.seedColor,
      isDark: res.isDark,
      palette: res.palette,
      fonts: {
        presetId: res.archetypeId,
        heading: res.detectedFonts[0] || matchedArchetype.fonts.heading,
        body: res.detectedFonts[1] || res.detectedFonts[0] || matchedArchetype.fonts.body,
        mono: matchedArchetype.fonts.mono,
        googleFontsUrl: matchedArchetype.fonts.googleFontsUrl,
        scale: state.fonts.scale,
      },
      geometry: {
        ...state.geometry,
        borderRadius: res.detectedRadiusPx,
      },
    });
  };

  const handleParseMarkdown = (rawMd: string) => {
    if (!rawMd.trim()) return;
    const parsed = parseDesignMarkdown(rawMd);
    setMarkdownResult(parsed);
    setUnlockedSubStep(5);
    onUpdateState(parsed.statePatch);
  };

  const handleMarkdownFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMarkdownInput(reader.result);
        handleParseMarkdown(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSampleMarkdown = () => {
    const sampleMd = compileDesignMarkdown(state);
    setMarkdownInput(sampleMd);
    handleParseMarkdown(sampleMd);
  };

  const isOriginReady =
    activeMode === 'wizard' ||
    (activeMode === 'image' && imageStatus === 'resolved') ||
    (activeMode === 'url-css' && cssResult !== null) ||
    (activeMode === 'markdown' && markdownResult !== null);

  const effectiveUnlockedStep: 1 | 2 | 3 | 4 | 5 =
    activeMode === 'wizard' ? unlockedSubStep : 5;

  const headerMeta = MODE_HEADERS[activeMode];
  const currentArchetype = ARCHETYPES[state.archetypeId] || ARCHETYPES.minimalist;
  const primaryContrast = getContrastRatio(state.palette.bgCanvas, state.palette.textPrimary);

  return (
    <aside
      aria-label="Panel de configuración y tokens"
      className="w-80 shrink-0 h-full bg-surface border-r border-border-subtle flex flex-col overflow-hidden z-10"
    >
      {/* Column 2 Header + Discreet Quick Access to Column 3 */}
      <div className="px-4 py-3 border-b border-border-subtle bg-elevated/60 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-primary">
            {headerMeta.badge}
          </span>
          <button
            type="button"
            data-attr="config-discreet-toggle-channels"
            onClick={onToggleChannelColumn}
            title={
              isChannelColumnOpen
                ? 'Ocultar columna de canales'
                : 'Abrir columna de canales manualmente'
            }
            className="px-2 py-0.5 rounded border border-border-subtle bg-surface hover:bg-elevated text-[10px] font-semibold text-ink-muted hover:text-ink-primary inline-flex items-center gap-1 transition-colors"
          >
            <Layers className="w-3 h-3 text-brand-primary" aria-hidden="true" />
            <span>{isChannelColumnOpen ? 'Canales abiertos' : 'Canales'}</span>
          </button>
        </div>

        <div>
          <h1 className="text-sm font-bold text-ink-primary">{headerMeta.title}</h1>
          <p className="text-[11px] text-ink-muted leading-snug mt-0.5">
            {headerMeta.subtitle}
          </p>
        </div>

        {/* 5-Block Progress Dots for "Crear desde 0" */}
        {activeMode === 'wizard' && (
          <div
            aria-label={`Progreso de configuración: bloque ${unlockedSubStep} de 5`}
            className="flex items-center gap-1.5 pt-0.5"
          >
            {([1, 2, 3, 4, 5] as const).map((stepNum) => {
              const isUnlocked = unlockedSubStep >= stepNum;
              const isResolved =
                (stepNum < unlockedSubStep) ||
                (stepNum === 5 && hasCompletedAllBlocks);
              return (
                <div
                  key={stepNum}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    isResolved
                      ? 'bg-status-success'
                      : isUnlocked
                        ? 'bg-brand-primary'
                        : 'bg-border-subtle'
                  }`}
                />
              );
            })}
            <span translate="no" className="text-[10px] font-mono font-bold text-ink-muted ml-1">
              {hasCompletedAllBlocks ? '5/5' : `${unlockedSubStep}/5`}
            </span>
          </div>
        )}
      </div>

      {/* Scrollable Progressive Blocks Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-5"
      >
        {/* TOP EXTRACTION ZONE FOR MODES 2, 3, 4 */}
        {activeMode === 'image' && (
          <section className="p-3 rounded-xl border border-border-subtle bg-canvas space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-primary">
                Fuente de Imagen (K-Means)
              </span>
              {imageStatus === 'resolved' && (
                <span className="text-[10px] font-mono font-bold text-status-success inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                  Extraído
                </span>
              )}
            </div>

            <label
              htmlFor="cascade-image-upload"
              className="flex items-center justify-center gap-2 w-full min-h-[44px] px-3 py-2 border border-dashed border-brand-primary/60 rounded-lg bg-surface hover:bg-elevated/70 cursor-pointer text-xs font-semibold text-ink-primary transition-colors"
            >
              <FileUp className="w-4 h-4 text-brand-primary shrink-0" aria-hidden="true" />
              <span>Subir PNG / JPG / WebP</span>
              <input
                id="cascade-image-upload"
                data-attr="cascade-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageFileUpload}
                className="sr-only"
              />
            </label>

            <div className="space-y-1.5">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                O probar lienzo generativo:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'editorial-sunset', label: 'Atardecer', title: 'Sunset Editorial' },
                    { id: 'cyber-hud', label: 'Cyber HUD', title: 'Cyber HUD' },
                    { id: 'forest-paper', label: 'Botánico', title: 'Botanical Editorial' },
                  ] as const
                ).map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    data-attr={`cascade-image-sample-${sample.id}`}
                    onClick={() => handleLoadSampleCanvasImage(sample.id, sample.title)}
                    className="min-h-[38px] px-2 rounded-lg border border-border-subtle bg-surface hover:bg-elevated text-[11px] font-semibold text-ink-primary transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {imageStatus === 'error' && (
              <p className="text-xs text-status-error font-medium">{imageErrorMsg}</p>
            )}

            {imageStatus === 'resolved' && imageResult && (
              <div className="pt-2 border-t border-border-subtle space-y-2">
                <div className="flex items-center gap-2">
                  {imagePreviewSrc && (
                    <img
                      src={imagePreviewSrc}
                      alt="Muestra procesada"
                      className="w-10 h-10 rounded object-cover border border-border-subtle shrink-0"
                    />
                  )}
                  <p className="text-[11px] text-ink-muted leading-tight">{imageResult.summary}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {imageResult.dominantSwatches.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => onUpdateSeedAndHarmony(hex, state.harmony, state.isDark)}
                      title={`Usar ${hex} como semilla`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border-subtle bg-surface text-[10px] font-mono font-semibold"
                    >
                      <span
                        style={{ backgroundColor: hex }}
                        className="w-3 h-3 rounded-sm border border-black/20"
                      />
                      <span translate="no">{hex}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {activeMode === 'url-css' && (
          <section className="p-3 rounded-xl border border-border-subtle bg-canvas space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="cascade-css-textarea"
                className="text-[11px] font-bold uppercase tracking-wider text-ink-primary"
              >
                URL o Bloque CSS
              </label>
              <div className="flex items-center gap-1">
                {Object.entries(SAMPLE_CSS_SNIPPETS).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    data-attr={`cascade-css-sample-${key}`}
                    onClick={() => {
                      setCssInput(item.css);
                      handleParseCssOrUrl(item.css);
                    }}
                    className="px-1.5 py-0.5 rounded border border-border-subtle bg-surface hover:bg-elevated text-[10px] font-semibold text-ink-primary"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              id="cascade-css-textarea"
              data-attr="cascade-css-textarea"
              rows={4}
              value={cssInput}
              onChange={(e) => setCssInput(e.target.value)}
              placeholder="Pega una URL o reglas CSS..."
              className="w-full p-2.5 rounded-lg border border-border-subtle bg-surface text-ink-primary font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />

            <button
              type="button"
              data-attr="cascade-parse-css-button"
              onClick={() => handleParseCssOrUrl(cssInput)}
              className="w-full min-h-[40px] px-3 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <Code className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Extraer Tokens CSS</span>
            </button>

            {cssResult && (
              <p className="text-[11px] text-status-success font-medium leading-tight pt-1">
                {cssResult.summary}
              </p>
            )}
          </section>
        )}

        {activeMode === 'markdown' && (
          <section className="p-3 rounded-xl border border-border-subtle bg-canvas space-y-2.5">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-primary">
                Archivo DESIGN.md
              </span>
              <div className="flex items-center gap-1.5">
                <label
                  htmlFor="cascade-md-upload"
                  className="px-2 py-1 rounded border border-border-subtle bg-surface hover:bg-elevated text-[10px] font-semibold text-ink-primary cursor-pointer inline-flex items-center gap-1"
                >
                  <FileUp className="w-3 h-3 text-brand-primary" aria-hidden="true" />
                  <span>Subir .md</span>
                  <input
                    id="cascade-md-upload"
                    data-attr="cascade-md-upload"
                    type="file"
                    accept=".md,text/markdown,text/plain"
                    onChange={handleMarkdownFileUpload}
                    className="sr-only"
                  />
                </label>
                <button
                  type="button"
                  data-attr="cascade-load-sample-md"
                  onClick={handleLoadSampleMarkdown}
                  className="px-2 py-1 rounded border border-border-subtle bg-surface hover:bg-elevated text-[10px] font-semibold text-brand-primary"
                >
                  Ejemplo
                </button>
              </div>
            </div>

            <textarea
              id="cascade-md-textarea"
              data-attr="cascade-md-textarea"
              rows={4}
              value={markdownInput}
              onChange={(e) => setMarkdownInput(e.target.value)}
              placeholder="# Design System Specification..."
              className="w-full p-2.5 rounded-lg border border-border-subtle bg-surface text-ink-primary font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />

            <button
              type="button"
              data-attr="cascade-parse-md-button"
              onClick={() => handleParseMarkdown(markdownInput)}
              className="w-full min-h-[40px] px-3 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileCode2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Aplicar DESIGN.md</span>
            </button>

            {markdownResult && (
              <p className="text-[11px] text-status-success font-medium leading-tight pt-1">
                {markdownResult.summary}
              </p>
            )}
          </section>
        )}

        {/* HINT WHEN EXTRACTION ORIGIN HAS NOT BEEN PROCESSED YET */}
        {!isOriginReady && (
          <div
            data-attr="cascade-awaiting-extraction"
            className="p-3.5 rounded-xl border border-dashed border-border-subtle bg-elevated/40 text-center space-y-1.5"
          >
            <Lock className="w-4 h-4 text-ink-muted mx-auto" aria-hidden="true" />
            <p className="text-xs font-semibold text-ink-primary">
              Procesa el insumo superior para continuar
            </p>
            <p className="text-[11px] text-ink-muted leading-snug">
              Una vez extraídos los tokens, aquí se desplegarán los controles de ajuste fino.
            </p>
          </div>
        )}

        {/* PROGRESSIVE BLOCKS (1 -> 2 -> 3 -> 4 -> 5) */}
        {isOriginReady && (
          <div className="space-y-5">
            {activeMode !== 'wizard' && (
              <div className="flex items-center gap-2 pt-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary shrink-0" aria-hidden="true" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Ajuste Fino de Tokens Extraídos
                </span>
              </div>
            )}

            {/* BLOQUE 1: ARQUETIPO ESTÉTICO (Siempre visible al iniciar en Crear desde 0) */}
            <section
              data-attr="cascade-block-1-archetype"
              className="space-y-2 transition-all duration-300 ease-out"
            >
              <div className="flex items-center justify-between">
                <label
                  htmlFor="config-archetype-select"
                  className="text-[11px] font-bold uppercase tracking-wider text-ink-muted inline-flex items-center gap-1.5"
                >
                  <span className="w-4 h-4 rounded-full bg-brand-primary/15 text-brand-primary font-mono text-[10px] inline-flex items-center justify-center">
                    1
                  </span>
                  <span>Arquetipo Estético</span>
                </label>
                {hasPickedArchetype && (
                  <button
                    type="button"
                    data-attr="config-reset-archetype"
                    onClick={() => {
                      onSelectArchetypePreset(state.archetypeId);
                      unlockNextSubStep(2);
                    }}
                    className="text-[11px] font-semibold text-brand-primary hover:underline inline-flex items-center gap-1"
                    title="Restaurar valores por defecto del arquetipo"
                  >
                    <RotateCcw className="w-3 h-3" aria-hidden="true" />
                    <span>Restaurar</span>
                  </button>
                )}
              </div>

              <select
                id="config-archetype-select"
                data-attr="config-archetype-select"
                value={
                  activeMode === 'wizard' && !hasPickedArchetype ? '' : state.archetypeId
                }
                onChange={(e) => {
                  if (!e.target.value) return;
                  setHasPickedArchetype(true);
                  onSelectArchetypePreset(e.target.value);
                  unlockNextSubStep(2);
                }}
                className="w-full min-h-[40px] px-3 rounded-lg border border-border-subtle bg-canvas text-ink-primary text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {activeMode === 'wizard' && !hasPickedArchetype && (
                  <option value="" disabled>
                    Selecciona un arquetipo estético...
                  </option>
                )}
                {Object.values(ARCHETYPES).map((arch) => (
                  <option key={arch.id} value={arch.id}>
                    {arch.label}
                  </option>
                ))}
              </select>

              <p className="text-[11px] text-ink-muted leading-snug">
                {currentArchetype.description}
              </p>
            </section>

            {/* BLOQUE 2: POLARIDAD LUMÍNICA (Claro / Oscuro) */}
            {effectiveUnlockedStep >= 2 && (
              <section
                data-attr="cascade-block-2-polarity"
                className="space-y-2 pt-3 border-t border-border-subtle transition-all duration-300 ease-out"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted inline-flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-brand-primary/15 text-brand-primary font-mono text-[10px] inline-flex items-center justify-center">
                      2
                    </span>
                    <span>Polaridad Lumínica</span>
                  </span>
                  <span
                    translate="no"
                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-status-success"
                  >
                    WCAG {primaryContrast}:1
                  </span>
                </div>

                <div
                  role="group"
                  aria-label="Selector de modo claro u oscuro"
                  className="grid grid-cols-2 gap-1.5 p-1 rounded-xl border border-border-subtle bg-elevated"
                >
                  <button
                    type="button"
                    data-attr="config-mode-light"
                    aria-pressed={!state.isDark}
                    onClick={() => {
                      onUpdateSeedAndHarmony(state.seedColor, state.harmony, false);
                      unlockNextSubStep(3);
                    }}
                    className={`min-h-[38px] px-2.5 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all ${
                      !state.isDark
                        ? 'bg-surface text-brand-primary shadow-sm border border-border-subtle'
                        : 'text-ink-muted hover:text-ink-primary'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Claro</span>
                  </button>
                  <button
                    type="button"
                    data-attr="config-mode-dark"
                    aria-pressed={state.isDark}
                    onClick={() => {
                      onUpdateSeedAndHarmony(state.seedColor, state.harmony, true);
                      unlockNextSubStep(3);
                    }}
                    className={`min-h-[38px] px-2.5 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all ${
                      state.isDark
                        ? 'bg-surface text-brand-primary shadow-sm border border-border-subtle'
                        : 'text-ink-muted hover:text-ink-primary'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Oscuro</span>
                  </button>
                </div>
              </section>
            )}

            {/* BLOQUE 3: COLOR SEMILLA & ARMONÍA OKLCH */}
            {effectiveUnlockedStep >= 3 && (
              <section
                data-attr="cascade-block-3-color"
                className="space-y-2.5 pt-3 border-t border-border-subtle transition-all duration-300 ease-out"
              >
                <label
                  htmlFor="config-seed-color"
                  className="text-[11px] font-bold uppercase tracking-wider text-ink-muted inline-flex items-center gap-1.5"
                >
                  <span className="w-4 h-4 rounded-full bg-brand-primary/15 text-brand-primary font-mono text-[10px] inline-flex items-center justify-center">
                    3
                  </span>
                  <span>Color Semilla &amp; Armonía OKLCH</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    id="config-seed-color"
                    data-attr="config-seed-color-picker"
                    type="color"
                    value={state.seedColor}
                    onChange={(e) => {
                      onUpdateSeedAndHarmony(e.target.value, state.harmony, state.isDark);
                      unlockNextSubStep(4);
                    }}
                    className="w-10 h-10 rounded-lg border border-border-subtle cursor-pointer bg-canvas p-0.5 shrink-0"
                  />
                  <input
                    type="text"
                    aria-label="Código HEX del color semilla"
                    value={state.seedColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                        onUpdateSeedAndHarmony(val, state.harmony, state.isDark);
                        unlockNextSubStep(4);
                      }
                    }}
                    className="w-24 min-h-[40px] px-2.5 rounded-lg border border-border-subtle bg-canvas text-ink-primary font-mono text-xs uppercase font-bold"
                  />
                  <div className="flex-1 flex items-center justify-end gap-1 flex-wrap">
                    {QUICK_SEEDS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        data-attr={`config-quick-seed-${hex.replace('#', '')}`}
                        aria-label={`Semilla rápida ${hex}`}
                        title={`Semilla ${hex}`}
                        onClick={() => {
                          onUpdateSeedAndHarmony(hex, state.harmony, state.isDark);
                          unlockNextSubStep(4);
                        }}
                        style={{ backgroundColor: hex }}
                        className={`w-5 h-5 rounded-full border transition-transform ${
                          state.seedColor.toUpperCase() === hex
                            ? 'scale-110 ring-2 ring-brand-primary border-white'
                            : 'border-black/20 hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="config-harmony-select"
                    className="block text-[10px] font-semibold uppercase tracking-wider text-ink-muted"
                  >
                    Regla de Armonía Cromática
                  </label>
                  <select
                    id="config-harmony-select"
                    data-attr="config-harmony-select"
                    value={state.harmony}
                    onChange={(e) => {
                      onUpdateSeedAndHarmony(
                        state.seedColor,
                        e.target.value as HarmonyRule,
                        state.isDark
                      );
                      unlockNextSubStep(4);
                    }}
                    className="w-full min-h-[38px] px-2.5 rounded-lg border border-border-subtle bg-canvas text-ink-primary text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    {HARMONY_KEYS.map((ruleKey) => (
                      <option key={ruleKey} value={ruleKey}>
                        {HARMONY_LABELS[ruleKey].label} ({HARMONY_LABELS[ruleKey].angleSummary})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Collapsible Individual Token Pickers */}
                <button
                  type="button"
                  data-attr="config-toggle-advanced-tokens"
                  aria-expanded={showAdvancedTokens}
                  onClick={() => setShowAdvancedTokens((prev) => !prev)}
                  className="w-full min-h-[36px] px-2.5 rounded-lg border border-border-subtle bg-elevated/60 hover:bg-elevated text-[11px] font-semibold text-ink-primary flex items-center justify-between transition-colors"
                >
                  <span>Tokens Semánticos ({TOKEN_FIELDS.length})</span>
                  {showAdvancedTokens ? (
                    <ChevronUp className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                  )}
                </button>

                {showAdvancedTokens && (
                  <div className="space-y-1.5 pt-1">
                    {TOKEN_FIELDS.map((field) => {
                      const hexVal = state.palette[field.key];
                      const bgRef = field.contrastAgainst
                        ? state.palette[field.contrastAgainst]
                        : null;
                      const ratio = bgRef ? getContrastRatio(bgRef, hexVal) : null;
                      return (
                        <div
                          key={field.key}
                          className="p-2 rounded-lg border border-border-subtle bg-canvas flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="block text-[11px] font-semibold text-ink-primary truncate">
                              {field.label}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <code
                                translate="no"
                                className="text-[10px] font-mono text-ink-muted"
                              >
                                {field.cssVar}
                              </code>
                              {ratio !== null && (
                                <span
                                  translate="no"
                                  className={`text-[9px] font-mono font-bold px-1 rounded ${
                                    ratio >= 4.5
                                      ? 'bg-emerald-500/15 text-status-success'
                                      : 'bg-amber-500/15 text-status-warning'
                                  }`}
                                >
                                  {ratio}:1
                                </span>
                              )}
                            </div>
                          </div>
                          <input
                            type="color"
                            aria-label={`Editar token ${field.label}`}
                            value={hexVal}
                            onChange={(e) => {
                              onUpdateTokenColor(field.key, e.target.value.toUpperCase());
                              unlockNextSubStep(4);
                            }}
                            className="w-7 h-7 rounded border border-border-subtle cursor-pointer bg-surface p-0.5 shrink-0"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* BLOQUE 4: PAR TIPOGRÁFICO Y ESCALA */}
            {effectiveUnlockedStep >= 4 && (
              <section
                data-attr="cascade-block-4-typography"
                className="space-y-2.5 pt-3 border-t border-border-subtle transition-all duration-300 ease-out"
              >
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="config-font-pair-select"
                    className="text-[11px] font-bold uppercase tracking-wider text-ink-muted inline-flex items-center gap-1.5"
                  >
                    <span className="w-4 h-4 rounded-full bg-brand-primary/15 text-brand-primary font-mono text-[10px] inline-flex items-center justify-center">
                      4
                    </span>
                    <span>Par Tipográfico y Escala</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCustomFonts((prev) => !prev)}
                    className="text-[10px] font-semibold text-brand-primary hover:underline"
                  >
                    {showCustomFonts ? 'Ocultar familias' : 'Personalizar'}
                  </button>
                </div>

                <select
                  id="config-font-pair-select"
                  data-attr="config-font-pair-select"
                  value={state.fonts.presetId}
                  onChange={(e) => {
                    onSelectArchetypeFonts(e.target.value);
                    unlockNextSubStep(5);
                  }}
                  className="w-full min-h-[38px] px-2.5 rounded-lg border border-border-subtle bg-canvas text-ink-primary text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  {Object.values(ARCHETYPES).map((arch) => (
                    <option key={arch.id} value={arch.id}>
                      {arch.fonts.heading} + {arch.fonts.body}
                    </option>
                  ))}
                </select>

                {showCustomFonts && (
                  <div className="grid grid-cols-1 gap-2 p-2.5 rounded-lg border border-border-subtle bg-canvas">
                    {(
                      [
                        {
                          id: 'heading',
                          label: 'Títulos (--font-heading)',
                          val: state.fonts.heading,
                        },
                        { id: 'body', label: 'Cuerpo (--font-body)', val: state.fonts.body },
                        { id: 'mono', label: 'Código (--font-mono)', val: state.fonts.mono },
                      ] as const
                    ).map((f) => (
                      <div key={f.id}>
                        <label className="block text-[10px] font-semibold text-ink-muted mb-0.5">
                          {f.label}
                        </label>
                        <input
                          type="text"
                          value={f.val}
                          onChange={(e) => {
                            onUpdateCustomFont(f.id, e.target.value);
                            unlockNextSubStep(5);
                          }}
                          className="w-full min-h-[34px] px-2.5 rounded border border-border-subtle bg-surface text-xs text-ink-primary"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-1">
                  {Object.values(TYPOGRAPHY_SCALES).map((scaleItem) => {
                    const isSelected = state.fonts.scale === scaleItem.id;
                    return (
                      <button
                        key={scaleItem.id}
                        type="button"
                        data-attr={`config-scale-${scaleItem.id}`}
                        aria-pressed={isSelected}
                        onClick={() => {
                          onUpdateTypographyScale(scaleItem.id);
                          unlockNextSubStep(5);
                        }}
                        className={`min-h-[36px] px-2 rounded-lg border text-[11px] font-semibold transition-colors ${
                          isSelected
                            ? 'border-brand-primary bg-elevated text-brand-primary'
                            : 'border-border-subtle bg-canvas text-ink-muted hover:text-ink-primary'
                        }`}
                      >
                        {scaleItem.label.replace('Escala ', '')}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* BLOQUE 5: GEOMETRÍA, BORDES Y DENSIDAD (Interactuar aquí despliega automáticamente la Columna 3) */}
            {effectiveUnlockedStep >= 5 && (
              <section
                data-attr="cascade-block-5-geometry"
                className="space-y-3 pt-3 border-t border-border-subtle transition-all duration-300 ease-out"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted inline-flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-brand-primary/15 text-brand-primary font-mono text-[10px] inline-flex items-center justify-center">
                      5
                    </span>
                    <span>Geometría, Bordes y Densidad</span>
                  </span>
                  {hasCompletedAllBlocks && (
                    <span className="text-[10px] font-mono font-bold text-status-success inline-flex items-center gap-0.5">
                      <Check className="w-3 h-3" aria-hidden="true" />
                      Canales listos
                    </span>
                  )}
                </div>

                {/* Border Radius Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="config-radius-slider" className="font-semibold text-ink-primary">
                      Radio de Borde
                    </label>
                    <span
                      translate="no"
                      className="font-mono text-[11px] font-bold text-brand-primary"
                    >
                      {state.geometry.borderRadius}px
                    </span>
                  </div>
                  <input
                    id="config-radius-slider"
                    data-attr="config-radius-slider"
                    type="range"
                    min={0}
                    max={28}
                    step={2}
                    value={state.geometry.borderRadius}
                    onChange={(e) =>
                      handleCompleteBlock5AndAutoAdvance({
                        borderRadius: Number(e.target.value),
                      })
                    }
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>

                {/* Border Width Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="config-border-slider" className="font-semibold text-ink-primary">
                      Grosor de Trazo
                    </label>
                    <span
                      translate="no"
                      className="font-mono text-[11px] font-bold text-brand-primary"
                    >
                      {state.geometry.borderWidth}px
                    </span>
                  </div>
                  <input
                    id="config-border-slider"
                    data-attr="config-border-slider"
                    type="range"
                    min={0}
                    max={4}
                    step={1}
                    value={state.geometry.borderWidth}
                    onChange={(e) =>
                      handleCompleteBlock5AndAutoAdvance({
                        borderWidth: Number(e.target.value),
                      })
                    }
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>

                {/* Shadow Style */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                    Elevación / Sombra
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {(
                      [
                        { id: 'none', label: 'Plana' },
                        { id: 'hard', label: 'Dura' },
                        { id: 'soft', label: 'Suave' },
                        { id: 'glass', label: 'Cristal' },
                      ] as const
                    ).map((item) => {
                      const isSelected = state.geometry.shadowStyle === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          data-attr={`config-shadow-${item.id}`}
                          aria-pressed={isSelected}
                          onClick={() =>
                            handleCompleteBlock5AndAutoAdvance({ shadowStyle: item.id })
                          }
                          className={`min-h-[34px] px-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${
                            isSelected
                              ? 'border-brand-primary bg-elevated text-brand-primary'
                              : 'border-border-subtle bg-canvas text-ink-muted hover:text-ink-primary'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Spacing Density */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                    Densidad Espacial
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        { id: 'compact', label: 'Compacto' },
                        { id: 'comfortable', label: 'Cómodo' },
                        { id: 'spacious', label: 'Amplio' },
                      ] as const
                    ).map((item) => {
                      const isSelected = state.geometry.density === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          data-attr={`config-density-${item.id}`}
                          aria-pressed={isSelected}
                          onClick={() =>
                            handleCompleteBlock5AndAutoAdvance({ density: item.id })
                          }
                          className={`min-h-[36px] px-2 rounded-lg border text-[11px] font-semibold transition-colors ${
                            isSelected
                              ? 'border-brand-primary bg-elevated text-brand-primary'
                              : 'border-border-subtle bg-canvas text-ink-muted hover:text-ink-primary'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
