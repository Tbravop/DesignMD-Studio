import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code,
  Compass,
  FileCode2,
  FileUp,
  Globe,
  Image as ImageIcon,
  Layers,
  Moon,
  Sparkles,
  Sun,
  Wand2,
} from 'lucide-react';
import {
  ARCHETYPES,
  CHANNELS,
  type ChannelId,
  type DesignSystemState,
} from '../../data/archetypes';
import {
  HARMONY_LABELS,
  generatePaletteFromSeed,
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

export type IngestionMode = 'wizard' | 'image' | 'url-css' | 'markdown';

interface IngestionHubProps {
  state: DesignSystemState;
  onUpdateState: (patch: Partial<DesignSystemState>) => void;
  onSelectArchetypePreset: (archetypeId: string) => void;
  onUpdateSeedAndHarmony: (seedHex: string, harmony: HarmonyRule, isDark: boolean) => void;
  onToggleChannel: (channelId: ChannelId) => void;
  onEnterStudio: () => void;
}

const SAMPLE_CSS_SNIPPETS: Record<string, { label: string; css: string }> = {
  editorial: {
    label: 'Ejemplo CSS Editorial SaaS',
    css: `/* Editorial Design Tokens */
:root {
  --primary: #1D4ED8;
  --accent: #0D9488;
  --canvas: #F8FAFC;
  --ink: #0F172A;
}
.hero-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0F172A;
}
.card-surface {
  font-family: 'Inter', sans-serif;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
}
.cta-btn {
  background-color: #1D4ED8;
  border-radius: 8px;
}`,
  },
  brutalist: {
    label: 'Ejemplo CSS Neo-Brutalista',
    css: `/* Neo-Brutalist Raw CSS */
.poster-shell {
  font-family: 'Space Grotesk', sans-serif;
  background-color: #FFFBEB;
  color: #111827;
  border: 2px solid #111827;
  border-radius: 0px;
}
.action-tag {
  font-family: 'Space Mono', monospace;
  background: #EA580C;
  color: #FFFFFF;
  border-radius: 0px;
}
.badge-secondary {
  background: #4F46E5;
}`,
  },
  telemetry: {
    label: 'Ejemplo URL + HUD Telemetry',
    css: `https://telemetry.stitch.dev/hud
.hud-panel {
  font-family: 'Chakra Petch', sans-serif;
  background: #090D16;
  color: #06B6D4;
  border: 1px solid #1E293B;
  border-radius: 4px;
}
.metric-value {
  font-family: 'JetBrains Mono', monospace;
  color: #06B6D4;
}`,
  },
};

export function IngestionHub({
  state,
  onUpdateState,
  onSelectArchetypePreset,
  onUpdateSeedAndHarmony,
  onToggleChannel,
  onEnterStudio,
}: IngestionHubProps): React.ReactElement {
  const [activeMode, setActiveMode] = useState<IngestionMode>('wizard');
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);

  // Estado explícito para extracción de Imagen (null = sin iniciar, 'loading', 'error', 'resolved')
  const [imageStatus, setImageStatus] = useState<'idle' | 'loading' | 'error' | 'resolved'>('idle');
  const [imageErrorMsg, setImageErrorMsg] = useState<string>('');
  const [imagePreviewSrc, setImagePreviewSrc] = useState<string>('');
  const [imageResult, setImageResult] = useState<ImageExtractionResult | null>(null);

  // Estado para URL / CSS Crudo
  const [cssInput, setCssInput] = useState<string>(SAMPLE_CSS_SNIPPETS.editorial.css);
  const [cssResult, setCssResult] = useState<CssUrlExtractionResult | null>(null);

  // Estado para DESIGN.md Existente
  const [markdownInput, setMarkdownInput] = useState<string>('');
  const [markdownResult, setMarkdownResult] = useState<ParsedMarkdownResult | null>(null);

  // Handler para procesar imagen con <canvas> K-Means
  const handleProcessImageSource = async (src: string, labelName?: string) => {
    setImageStatus('loading');
    setImageErrorMsg('');
    setImagePreviewSrc(src);
    try {
      const extracted = await extractPaletteFromImageSource(src);
      setImageResult(extracted);
      setImageStatus('resolved');
      onUpdateState({
        projectName: labelName || state.projectName,
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
        void handleProcessImageSource(reader.result, cleanName || state.projectName);
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

  // Handler para parsear URL o bloque CSS crudo
  const handleParseCssOrUrl = (rawText: string) => {
    const res = extractTokensFromCssOrUrl(rawText);
    setCssResult(res);
    const matchedArchetype = ARCHETYPES[res.archetypeId] || ARCHETYPES.minimalist;
    onUpdateState({
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

  // Handler para parsear DESIGN.md existente
  const handleParseMarkdown = (rawMd: string) => {
    if (!rawMd.trim()) return;
    const parsed = parseDesignMarkdown(rawMd);
    setMarkdownResult(parsed);
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

  const INGESTION_CARDS: {
    id: IngestionMode;
    title: string;
    subtitle: string;
    badge: string;
    Icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'wizard',
      title: 'Crear desde Cero (Wizard)',
      subtitle: 'Asistente de 3 pasos: Arquetipo, Armonía Cromática y Modo Claro/Oscuro.',
      badge: 'Recomendado',
      Icon: Wand2,
    },
    {
      id: 'image',
      title: 'Desde una Imagen',
      subtitle: 'Extrae colores dominantes en un <canvas> HTML5 (K-Means) por luminancia.',
      badge: 'Canvas K-Means',
      Icon: ImageIcon,
    },
    {
      id: 'url-css',
      title: 'Desde una URL o CSS',
      subtitle: 'Analiza bloques CSS o URLs con Regex para detectar fuentes, radios y HEX.',
      badge: 'Regex Parser',
      Icon: Globe,
    },
    {
      id: 'markdown',
      title: 'Cargar DESIGN.md existente',
      subtitle: 'Importa o pega un archivo .md de Google Stitch para editarlo en vivo.',
      badge: 'Stitch Spec',
      Icon: FileCode2,
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex flex-col">
      {/* Top Welcome Bar */}
      <header className="bg-surface border-b border-border-subtle px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Compass className="w-6 h-6 text-brand-primary shrink-0" aria-hidden="true" />
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-lg tracking-tight text-ink-primary">
                  DesignMD Studio
                </span>
                <span
                  translate="no"
                  className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-elevated text-brand-primary border border-border-subtle"
                >
                  Google Stitch Spec • $0 Client-Side
                </span>
              </div>
              <p className="text-xs text-ink-muted">
                Compilador determinista No-Code de sistemas de diseño y plantillas multi-canal
              </p>
            </div>
          </div>

          <button
            type="button"
            data-attr="hub-header-launch-studio"
            onClick={onEnterStudio}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors shadow-sm"
          >
            <span>Abrir Estudio Live</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 flex-1">
        {/* STEP 1: PUNTO DE PARTIDA (4 TARJETAS SELECCIONABLES) */}
        <section aria-labelledby="step-1-heading" className="space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <span
                translate="no"
                className="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary"
              >
                PASO 01 DE 02 • INGESTA DETERMINISTA
              </span>
              <h1 id="step-1-heading" className="text-h2 font-bold text-ink-primary mt-0.5">
                Selecciona tu Punto de Partida
              </h1>
            </div>
            <p className="text-xs text-ink-muted">
              100% ejecutado en tu navegador sin llamadas a APIs externas
            </p>
          </div>

          {/* 4 Selectable Ingestion Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INGESTION_CARDS.map(({ id, title, subtitle, badge, Icon }) => {
              const isSelected = activeMode === id;
              return (
                <button
                  key={id}
                  type="button"
                  data-attr={`hub-mode-card-${id}`}
                  aria-pressed={isSelected}
                  onClick={() => setActiveMode(id)}
                  className={`min-h-[44px] p-5 rounded-xl border text-left flex flex-col justify-between gap-4 transition-all ${
                    isSelected
                      ? 'bg-surface border-2 border-brand-primary shadow-md'
                      : 'bg-surface border-border-subtle hover:border-brand-primary/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      {/* Regla estricta: Icono limpio sin caja decorativa con fondo */}
                      <Icon className="w-5 h-5 text-brand-primary shrink-0" />
                      <span
                        translate="no"
                        className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-elevated text-ink-muted"
                      >
                        {badge}
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-ink-primary">{title}</h2>
                    <p className="text-xs text-ink-muted leading-relaxed">{subtitle}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs font-semibold">
                    <span className={isSelected ? 'text-brand-primary' : 'text-ink-muted'}>
                      {isSelected ? 'Modo Activo' : 'Seleccionar'}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-brand-primary' : 'text-ink-muted'
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Ingestion Mode Workspace */}
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm">
            {/* MODO 1: WIZARD DE 3 PASOS */}
            {activeMode === 'wizard' && (
              <div className="space-y-6">
                {/* Wizard Stepper Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border-subtle">
                  <div className="flex flex-wrap items-center gap-2">
                    {(
                      [
                        { step: 1, label: '1. Proyecto y Arquetipo' },
                        { step: 2, label: '2. Semilla y Armonía Cromática' },
                        { step: 3, label: '3. Modo Claro / Oscuro' },
                      ] as const
                    ).map((item) => {
                      const isCurrent = wizardStep === item.step;
                      const isCompleted = wizardStep > item.step;
                      return (
                        <button
                          key={item.step}
                          type="button"
                          data-attr={`wizard-step-btn-${item.step}`}
                          onClick={() => setWizardStep(item.step)}
                          className={`min-h-[44px] px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-2 border transition-colors ${
                            isCurrent
                              ? 'bg-brand-primary text-white border-brand-primary'
                              : isCompleted
                                ? 'bg-elevated text-ink-primary border-border-subtle'
                                : 'bg-canvas text-ink-muted border-border-subtle'
                          }`}
                        >
                          {isCompleted && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    {wizardStep > 1 && (
                      <button
                        type="button"
                        data-attr="wizard-prev-step"
                        onClick={() =>
                          setWizardStep((prev) => (prev === 3 ? 2 : 1))
                        }
                        className="min-h-[44px] px-3 rounded-lg border border-border-subtle bg-canvas text-ink-primary text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                        <span>Anterior</span>
                      </button>
                    )}
                    {wizardStep < 3 && (
                      <button
                        type="button"
                        data-attr="wizard-next-step"
                        onClick={() =>
                          setWizardStep((prev) => (prev === 1 ? 2 : 3))
                        }
                        className="min-h-[44px] px-4 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <span>Siguiente Paso</span>
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {/* WIZARD PASO 1: NOMBRE + ARQUETIPO ESTÉTICO */}
                {wizardStep === 1 && (
                  <div className="space-y-5">
                    <div className="max-w-md">
                      <label
                        htmlFor="wizard-project-name"
                        className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5"
                      >
                        Nombre del Proyecto / Sistema de Diseño
                      </label>
                      <input
                        id="wizard-project-name"
                        data-attr="wizard-project-name-input"
                        type="text"
                        value={state.projectName}
                        onChange={(e) => onUpdateState({ projectName: e.target.value })}
                        placeholder="Ej. Stitch Quantum UI"
                        className="w-full min-h-[44px] px-3.5 rounded-lg border border-border-subtle bg-canvas text-ink-primary text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">
                        Selecciona uno de los 6 Arquetipos Estéticos (con vista previa geométrica)
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.values(ARCHETYPES).map((arch) => {
                          const isSelected = state.archetypeId === arch.id;
                          return (
                            <button
                              key={arch.id}
                              type="button"
                              data-attr={`wizard-archetype-${arch.id}`}
                              onClick={() => onSelectArchetypePreset(arch.id)}
                              className={`min-h-[44px] p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all ${
                                isSelected
                                  ? 'border-2 border-brand-primary bg-elevated/70 shadow-sm'
                                  : 'border-border-subtle bg-canvas hover:bg-elevated/40'
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-bold text-ink-primary">
                                    {arch.label}
                                  </span>
                                  {isSelected && (
                                    <CheckCircle2
                                      className="w-4 h-4 text-brand-primary shrink-0"
                                      aria-hidden="true"
                                    />
                                  )}
                                </div>
                                <p className="text-xs text-ink-muted leading-relaxed">
                                  {arch.description}
                                </p>
                              </div>

                              {/* Mini Visual Preview Card of Archetype Geometry & Typography */}
                              <div
                                style={{
                                  borderRadius: `${arch.geometry.borderRadius}px`,
                                  borderWidth: `${Math.max(1, arch.geometry.borderWidth)}px`,
                                  borderColor: arch.defaultSeed,
                                  boxShadow:
                                    arch.geometry.shadowStyle === 'hard'
                                      ? '3px 3px 0px 0px #0F172A'
                                      : 'none',
                                }}
                                className="p-2.5 bg-surface border flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <div
                                    translate="no"
                                    className="text-xs font-bold text-ink-primary truncate"
                                  >
                                    {arch.fonts.heading}
                                  </div>
                                  <div
                                    translate="no"
                                    className="text-xs font-mono text-ink-muted truncate"
                                  >
                                    r:{arch.geometry.borderRadius}px • b:{arch.geometry.borderWidth}
                                    px • {arch.geometry.shadowStyle}
                                  </div>
                                </div>
                                <span
                                  style={{
                                    backgroundColor: arch.defaultSeed,
                                    borderRadius: `${Math.min(8, arch.geometry.borderRadius)}px`,
                                  }}
                                  className="w-6 h-6 shrink-0 inline-block"
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* WIZARD PASO 2: COLOR SEMILLA + REGLA DE ARMONÍA CROMÁTICA */}
                {wizardStep === 2 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      {/* Seed Color Picker */}
                      <div className="md:col-span-4 space-y-3 bg-canvas p-4 rounded-xl border border-border-subtle">
                        <label
                          htmlFor="wizard-seed-color"
                          className="block text-xs font-bold uppercase tracking-wider text-ink-muted"
                        >
                          Color Semilla Primario
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            id="wizard-seed-color"
                            data-attr="wizard-seed-color-picker"
                            type="color"
                            value={state.seedColor}
                            onChange={(e) =>
                              onUpdateSeedAndHarmony(
                                e.target.value.toUpperCase(),
                                state.harmony,
                                state.isDark
                              )
                            }
                            className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                          />
                          <div>
                            <div
                              translate="no"
                              className="text-sm font-mono font-bold text-ink-primary"
                            >
                              {state.seedColor}
                            </div>
                            <div className="text-xs text-ink-muted">
                              Matiz base para superficies y acentos
                            </div>
                          </div>
                        </div>

                        {/* Quick Seed Presets */}
                        <div className="pt-2">
                          <span className="block text-xs text-ink-muted mb-2">
                            Semillas sugeridas:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {[
                              '#2563EB',
                              '#EA580C',
                              '#6366F1',
                              '#06B6D4',
                              '#DB2777',
                              '#059669',
                              '#B45309',
                            ].map((hex) => (
                              <button
                                key={hex}
                                type="button"
                                data-attr={`wizard-preset-seed-${hex.replace('#', '')}`}
                                onClick={() =>
                                  onUpdateSeedAndHarmony(hex, state.harmony, state.isDark)
                                }
                                aria-label={`Aplicar semilla ${hex}`}
                                className="min-h-[44px] min-w-[44px] p-1.5 rounded-lg border border-border-subtle bg-surface inline-flex items-center justify-center"
                              >
                                <span
                                  style={{ backgroundColor: hex }}
                                  className="w-6 h-6 rounded inline-block"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 6 Chromatic Harmony Rules */}
                      <div className="md:col-span-8 space-y-3">
                        <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">
                          Regla de Armonía Cromática (6 Algoritmos Deterministas)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(Object.keys(HARMONY_LABELS) as HarmonyRule[]).map((ruleKey) => {
                            const info = HARMONY_LABELS[ruleKey];
                            const previewPal = generatePaletteFromSeed(
                              state.seedColor,
                              ruleKey,
                              state.isDark
                            );
                            const isSelected = state.harmony === ruleKey;
                            return (
                              <button
                                key={ruleKey}
                                type="button"
                                data-attr={`wizard-harmony-${ruleKey}`}
                                onClick={() =>
                                  onUpdateSeedAndHarmony(
                                    state.seedColor,
                                    ruleKey,
                                    state.isDark
                                  )
                                }
                                className={`min-h-[44px] p-3.5 rounded-xl border text-left space-y-2 transition-all ${
                                  isSelected
                                    ? 'border-2 border-brand-primary bg-elevated'
                                    : 'border-border-subtle bg-canvas hover:bg-elevated/50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-ink-primary">
                                    {info.label}
                                  </span>
                                  <span
                                    translate="no"
                                    className="text-xs font-mono text-ink-muted"
                                  >
                                    {ruleKey}
                                  </span>
                                </div>
                                <div className="text-xs text-ink-muted">{info.angleSummary}</div>
                                <div className="flex items-center gap-1.5 pt-1">
                                  {[
                                    previewPal.bgCanvas,
                                    previewPal.bgSurface,
                                    previewPal.brandPrimary,
                                    previewPal.accentSecondary,
                                    previewPal.accentTertiary,
                                    previewPal.textPrimary,
                                  ].map((hex, idx) => (
                                    <span
                                      key={`${ruleKey}-${idx}`}
                                      style={{ backgroundColor: hex }}
                                      className="h-5 flex-1 rounded border border-black/15 inline-block"
                                      title={hex}
                                    />
                                  ))}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* WIZARD PASO 3: SELECCIÓN DE MODO CLARO / OSCURO */}
                {wizardStep === 3 && (
                  <div className="space-y-4">
                    <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">
                      Selecciona la Polaridad de Luminancia del Sistema
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          dark: false,
                          title: 'Modo Claro (Daylight High-Luminance)',
                          desc: 'Lienzo claro tintado sutilmente con el matiz semilla, tarjetas blancas puras y texto oscuro de alto contraste.',
                          Icon: Sun,
                        },
                        {
                          dark: true,
                          title: 'Modo Oscuro (Low-Luminance Telemetry)',
                          desc: 'Lienzo nocturno profundo con reducción de fatiga visual, ideal para entornos técnicos, HUD y espaciales.',
                          Icon: Moon,
                        },
                      ].map(({ dark, title, desc, Icon }) => {
                        const preview = generatePaletteFromSeed(
                          state.seedColor,
                          state.harmony,
                          dark
                        );
                        const isSelected = state.isDark === dark;
                        return (
                          <button
                            key={String(dark)}
                            type="button"
                            data-attr={`wizard-mode-${dark ? 'dark' : 'light'}`}
                            onClick={() =>
                              onUpdateSeedAndHarmony(state.seedColor, state.harmony, dark)
                            }
                            className={`min-h-[44px] p-5 rounded-xl border text-left space-y-4 transition-all ${
                              isSelected
                                ? 'border-2 border-brand-primary bg-elevated'
                                : 'border-border-subtle bg-canvas hover:bg-elevated/50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Icon
                                  className="w-5 h-5 text-brand-primary shrink-0"
                                  aria-hidden="true"
                                />
                                <span className="text-sm font-bold text-ink-primary">
                                  {title}
                                </span>
                              </div>
                              {isSelected && (
                                <CheckCircle2
                                  className="w-4 h-4 text-brand-primary shrink-0"
                                  aria-hidden="true"
                                />
                              )}
                            </div>

                            <p className="text-xs text-ink-muted leading-relaxed">{desc}</p>

                            {/* Mini Surface Mockup */}
                            <div
                              style={{
                                backgroundColor: preview.bgCanvas,
                                color: preview.textPrimary,
                                borderColor: preview.borderColor,
                              }}
                              className="p-4 rounded-lg border space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">{state.projectName}</span>
                                <span
                                  translate="no"
                                  style={{
                                    backgroundColor: preview.brandPrimary,
                                    color: preview.brandText,
                                  }}
                                  className="text-xs font-mono px-2.5 py-1 rounded font-bold"
                                >
                                  CTA Primario
                                </span>
                              </div>
                              <p
                                style={{ color: preview.textSecondary }}
                                className="text-xs"
                              >
                                Superficie verificada con contraste automático WCAG 2.1.
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODO 2: DESDE UNA IMAGEN (<canvas> HTML5 K-MEANS) */}
            {activeMode === 'image' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-ink-primary">
                      Extracción Cromática por Luminancia en &lt;canvas&gt;
                    </h3>
                    <p className="text-xs text-ink-muted">
                      Sube un PNG/JPG o prueba un lienzo generativo para ejecutar el agrupamiento
                      K-Means y asignar automáticamente <code>--bg-canvas</code>,{' '}
                      <code>--text-primary</code> y <code>--brand-primary</code>.
                    </p>
                  </div>

                  <label
                    htmlFor="hub-image-upload"
                    className="min-h-[120px] p-5 rounded-xl border-2 border-dashed border-border-subtle hover:border-brand-primary bg-canvas flex flex-col items-center justify-center gap-2 cursor-pointer text-center transition-colors"
                  >
                    <FileUp className="w-6 h-6 text-brand-primary" aria-hidden="true" />
                    <span className="text-xs font-bold text-ink-primary">
                      Haz clic para seleccionar una imagen PNG / JPG
                    </span>
                    <span className="text-xs text-ink-muted">
                      Procesamiento local 100% privado en navegador
                    </span>
                    <input
                      id="hub-image-upload"
                      data-attr="hub-image-file-input"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageFileUpload}
                      className="sr-only"
                    />
                  </label>

                  <div className="space-y-2">
                    <span className="block text-xs font-semibold text-ink-muted">
                      O prueba al instante con un lienzo HTML5 de muestra:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        data-attr="hub-sample-img-sunset"
                        onClick={() =>
                          handleLoadSampleCanvasImage('editorial-sunset', 'Editorial Terracotta')
                        }
                        className="min-h-[44px] px-3 rounded-lg border border-border-subtle bg-canvas hover:bg-elevated text-xs font-semibold text-ink-primary"
                      >
                        Muestra 1: Editorial Sunset
                      </button>
                      <button
                        type="button"
                        data-attr="hub-sample-img-cyber"
                        onClick={() =>
                          handleLoadSampleCanvasImage('cyber-hud', 'Cyber Telemetry HUD')
                        }
                        className="min-h-[44px] px-3 rounded-lg border border-border-subtle bg-canvas hover:bg-elevated text-xs font-semibold text-ink-primary"
                      >
                        Muestra 2: Cyber HUD
                      </button>
                      <button
                        type="button"
                        data-attr="hub-sample-img-forest"
                        onClick={() =>
                          handleLoadSampleCanvasImage('forest-paper', 'Botanical Paper')
                        }
                        className="min-h-[44px] px-3 rounded-lg border border-border-subtle bg-canvas hover:bg-elevated text-xs font-semibold text-ink-primary"
                      >
                        Muestra 3: Papel Botánico
                      </button>
                    </div>
                  </div>
                </div>

                {/* Strict Resolution Order: Loading -> Error -> Empty/Idle -> Resolved */}
                <div className="lg:col-span-7 bg-canvas border border-border-subtle rounded-xl p-5">
                  {imageStatus === 'loading' ? (
                    <div className="py-10 text-center space-y-2">
                      <Sparkles
                        className="w-6 h-6 text-brand-primary mx-auto animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                      <p className="text-xs font-semibold text-ink-primary">
                        Muestreando píxeles en &lt;canvas&gt; y ejecutando clustering K-Means...
                      </p>
                    </div>
                  ) : imageStatus === 'error' ? (
                    <div className="py-8 text-center space-y-2 text-status-error">
                      <p className="text-xs font-bold">{imageErrorMsg}</p>
                    </div>
                  ) : imageResult === null ? (
                    <div className="py-8 text-center space-y-2">
                      <ImageIcon
                        className="w-6 h-6 text-ink-muted mx-auto"
                        aria-hidden="true"
                      />
                      <p className="text-xs font-semibold text-ink-primary">
                        Ninguna imagen analizada todavía
                      </p>
                      <p className="text-xs text-ink-muted">
                        Sube un archivo PNG/JPG o pulsa una de las 3 muestras para extraer su
                        paleta cromática.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-status-success inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                          <span>{imageResult.summary}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        {imagePreviewSrc && (
                          <div className="sm:col-span-5">
                            <img
                              src={imagePreviewSrc}
                              alt="Previsualización de imagen procesada"
                              className="w-full h-28 object-cover rounded-lg border border-border-subtle"
                            />
                          </div>
                        )}
                        <div className="sm:col-span-7 space-y-2">
                          <span className="block text-xs font-semibold text-ink-muted">
                            Asignación automática por luminancia:
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              {
                                token: '--bg-canvas',
                                hex: imageResult.palette.bgCanvas,
                              },
                              {
                                token: '--text-primary',
                                hex: imageResult.palette.textPrimary,
                              },
                              {
                                token: '--brand-primary',
                                hex: imageResult.palette.brandPrimary,
                              },
                            ].map((item) => (
                              <div
                                key={item.token}
                                className="p-2 rounded-lg bg-surface border border-border-subtle"
                              >
                                <div
                                  style={{ backgroundColor: item.hex }}
                                  className="w-full h-6 rounded border border-black/15 mb-1"
                                />
                                <div
                                  translate="no"
                                  className="text-xs font-mono font-bold text-ink-primary truncate"
                                >
                                  {item.token}
                                </div>
                                <div
                                  translate="no"
                                  className="text-xs font-mono text-ink-muted"
                                >
                                  {item.hex}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MODO 3: DESDE UNA URL O CSS CRUDO */}
            {activeMode === 'url-css' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor="hub-css-url-textarea"
                      className="text-xs font-bold uppercase tracking-wider text-ink-muted"
                    >
                      Pega una URL o bloque CSS crudo
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(SAMPLE_CSS_SNIPPETS).map(([key, sample]) => (
                        <button
                          key={key}
                          type="button"
                          data-attr={`hub-css-sample-${key}`}
                          onClick={() => {
                            setCssInput(sample.css);
                            handleParseCssOrUrl(sample.css);
                          }}
                          className="min-h-[44px] px-2.5 rounded-lg border border-border-subtle bg-canvas hover:bg-elevated text-xs font-semibold text-ink-primary"
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    id="hub-css-url-textarea"
                    data-attr="hub-css-textarea"
                    rows={6}
                    value={cssInput}
                    onChange={(e) => setCssInput(e.target.value)}
                    placeholder="Pega aquí variables :root, reglas CSS o una URL..."
                    className="w-full p-3.5 rounded-xl border border-border-subtle bg-canvas font-mono text-xs text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />

                  <button
                    type="button"
                    data-attr="hub-parse-css-btn"
                    onClick={() => handleParseCssOrUrl(cssInput)}
                    className="min-h-[44px] px-4 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold inline-flex items-center gap-2"
                  >
                    <Code className="w-4 h-4" aria-hidden="true" />
                    <span>Extraer Fuentes, Radios y Colores HEX con Regex</span>
                  </button>
                </div>

                <div className="lg:col-span-5 bg-canvas border border-border-subtle rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                    Resultado del Parser Regex
                  </h3>
                  {cssResult ? (
                    <div className="space-y-3 text-xs">
                      <p className="font-semibold text-status-success">{cssResult.summary}</p>
                      <div>
                        <span className="text-ink-muted font-medium">Fuentes detectadas: </span>
                        <strong translate="no" className="font-mono text-ink-primary">
                          {cssResult.detectedFonts.join(', ') || 'Fallback del Arquetipo'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-ink-muted font-medium">
                          Border-radius detectado:{' '}
                        </span>
                        <strong translate="no" className="font-mono text-ink-primary">
                          {cssResult.detectedRadiusPx}px
                        </strong>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-ink-muted font-medium block">
                          Colores HEX más frecuentes:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {cssResult.detectedColors.slice(0, 6).map((item) => (
                            <span
                              key={item.hex}
                              translate="no"
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface border border-border-subtle font-mono text-xs"
                            >
                              <span
                                style={{ backgroundColor: item.hex }}
                                className="w-3.5 h-3.5 rounded-sm border border-black/15 inline-block"
                              />
                              <span>
                                {item.hex} ({item.count}x)
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-ink-muted">
                      Pulsa &ldquo;Extraer Fuentes, Radios y Colores HEX con Regex&rdquo; para
                      poblar los tokens del estudio.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* MODO 4: CARGAR DESIGN.MD EXISTENTE */}
            {activeMode === 'markdown' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor="hub-markdown-textarea"
                      className="text-xs font-bold uppercase tracking-wider text-ink-muted"
                    >
                      Sube o pega un archivo DESIGN.md
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        htmlFor="hub-md-file-input"
                        className="min-h-[44px] px-3 rounded-lg border border-border-subtle bg-canvas hover:bg-elevated text-xs font-semibold text-ink-primary inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileUp className="w-3.5 h-3.5 text-brand-primary" aria-hidden="true" />
                        <span>Subir archivo .md</span>
                        <input
                          id="hub-md-file-input"
                          data-attr="hub-md-file-upload"
                          type="file"
                          accept=".md,text/markdown,text/plain"
                          onChange={handleMarkdownFileUpload}
                          className="sr-only"
                        />
                      </label>

                      <button
                        type="button"
                        data-attr="hub-load-sample-md"
                        onClick={handleLoadSampleMarkdown}
                        className="min-h-[44px] px-3 rounded-lg border border-border-subtle bg-canvas hover:bg-elevated text-xs font-semibold text-ink-primary"
                      >
                        Cargar DESIGN.md de ejemplo
                      </button>
                    </div>
                  </div>

                  <textarea
                    id="hub-markdown-textarea"
                    data-attr="hub-markdown-textarea"
                    rows={6}
                    value={markdownInput}
                    onChange={(e) => setMarkdownInput(e.target.value)}
                    placeholder="Pega el contenido de tu DESIGN.md con frontmatter YAML y tokens CSS..."
                    className="w-full p-3.5 rounded-xl border border-border-subtle bg-canvas font-mono text-xs text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />

                  <button
                    type="button"
                    data-attr="hub-parse-markdown-btn"
                    onClick={() => handleParseMarkdown(markdownInput)}
                    className="min-h-[44px] px-4 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold inline-flex items-center gap-2"
                  >
                    <FileCode2 className="w-4 h-4" aria-hidden="true" />
                    <span>Parsear DESIGN.md y Sincronizar Tokens</span>
                  </button>
                </div>

                <div className="lg:col-span-5 bg-canvas border border-border-subtle rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                    Estado de Importación DESIGN.md
                  </h3>
                  {markdownResult ? (
                    <div className="space-y-2 text-xs">
                      <p className="font-semibold text-status-success">
                        {markdownResult.summary}
                      </p>
                      <p className="text-ink-muted">
                        Todos los tokens han sido cargados en memoria. Pulsa &ldquo;Abrir Estudio
                        Live&rdquo; para inspeccionarlos y editarlos en tiempo real.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-ink-muted">
                      Sube un archivo <code>.md</code> o carga el ejemplo para reconstruir sus
                      variables mediante expresiones regulares.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* STEP 2: SELECTOR DE CANALES DESTINO (CHECKBOXES MÚLTIPLES) */}
        <section aria-labelledby="step-2-heading" className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <span
                translate="no"
                className="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary"
              >
                PASO 02 DE 02 • PLANTILLAS MULTI-CANAL REACTIVAS
              </span>
              <h2 id="step-2-heading" className="text-h2 font-bold text-ink-primary mt-0.5">
                Selecciona los Canales Destino
              </h2>
            </div>
            <span translate="no" className="text-xs font-mono font-semibold text-ink-muted">
              {state.activeChannels.length} DE 4 CANALES ACTIVOS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CHANNELS.map((channel) => {
              const isChecked = state.activeChannels.includes(channel.id);
              return (
                <button
                  key={channel.id}
                  type="button"
                  role="checkbox"
                  aria-checked={isChecked}
                  data-attr={`hub-channel-checkbox-${channel.id}`}
                  onClick={() => onToggleChannel(channel.id)}
                  className={`min-h-[44px] p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all ${
                    isChecked
                      ? 'bg-surface border-2 border-brand-primary shadow-sm'
                      : 'bg-surface border-border-subtle opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        translate="no"
                        className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-elevated text-brand-primary"
                      >
                        {channel.badge}
                      </span>
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center border ${
                          isChecked
                            ? 'bg-brand-primary border-brand-primary text-white'
                            : 'border-border-subtle bg-canvas'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-ink-primary">{channel.label}</h3>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      {channel.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border-subtle text-xs text-ink-muted">
                    {channel.ruleSummary}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Bottom Action Footer */}
        <footer className="bg-surface border border-border-subtle rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-brand-primary shrink-0" aria-hidden="true" />
            <div>
              <div className="text-sm font-bold text-ink-primary">
                Sistema listo: {state.projectName} (
                {ARCHETYPES[state.archetypeId]?.label || 'Editorial'})
              </div>
              <div className="text-xs text-ink-muted">
                Se inyectarán 14 variables CSS dinámicas a 60fps en {state.activeChannels.length}{' '}
                canales seleccionados.
              </div>
            </div>
          </div>

          <button
            type="button"
            data-attr="hub-footer-launch-studio"
            onClick={onEnterStudio}
            className="min-h-[44px] px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold inline-flex items-center gap-2 transition-colors shadow-sm"
          >
            <span>Entrar al Estudio Live No-Code</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </footer>
      </main>
    </div>
  );
}
