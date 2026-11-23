import React, { useEffect, useState } from 'react';
import {
  Check,
  ChevronRight,
  Code2,
  Copy,
  Download,
  Eye,
  ImageDown,
} from 'lucide-react';
import {
  ARCHETYPES,
  CHANNELS,
  TYPOGRAPHY_SCALES,
  type DesignSystemState,
} from '../../data/archetypes';
import { HARMONY_LABELS } from '../../utils/colorEngine';
import {
  compileDesignMarkdown,
  resolveShadowCss,
} from '../../utils/markdownCompiler';
import type { CanvasChannelSelection } from './ChannelSelectorColumn';
import { BroadcastOverlayTemplate } from './templates/BroadcastOverlayTemplate';
import { DashboardTemplate } from './templates/DashboardTemplate';
import { SocialPostTemplate } from './templates/SocialPostTemplate';
import { WebLandingTemplate } from './templates/WebLandingTemplate';

export type CanvasViewMode = 'template' | 'code';

interface PreviewCanvasProps {
  state: DesignSystemState;
  selectedChannel: CanvasChannelSelection;
  isChannelColumnOpen: boolean;
  onExpandChannelColumn: () => void;
  onDownloadMarkdown: () => void;
}

function exportDesignViewAsPng(
  state: DesignSystemState,
  selectedChannel: CanvasChannelSelection,
  archetypeLabel: string,
  harmonyLabel: string
): void {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { palette, geometry, fonts } = state;

  // Background Canvas
  ctx.fillStyle = palette.bgCanvas;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header Surface Card
  ctx.fillStyle = palette.bgSurface;
  ctx.strokeStyle = palette.borderColor;
  ctx.lineWidth = Math.max(1, geometry.borderWidth);
  ctx.beginPath();
  ctx.roundRect(48, 44, 1504, 150, Math.min(24, geometry.borderRadius));
  ctx.fill();
  ctx.stroke();

  // Brand Accent Pill
  ctx.fillStyle = palette.brandPrimary;
  ctx.beginPath();
  ctx.roundRect(80, 72, 220, 32, Math.min(12, geometry.borderRadius));
  ctx.fill();

  ctx.fillStyle = palette.brandText;
  ctx.font = `bold 14px "${fonts.mono}", monospace`;
  ctx.fillText('GOOGLE STITCH • DESIGN.MD', 96, 93);

  // Project Name & Archetype
  ctx.fillStyle = palette.textPrimary;
  ctx.font = `bold 36px "${fonts.heading}", sans-serif`;
  ctx.fillText(state.projectName, 80, 148);

  ctx.fillStyle = palette.textSecondary;
  ctx.font = `500 18px "${fonts.body}", sans-serif`;
  ctx.fillText(
    `${archetypeLabel}  •  Armonía: ${harmonyLabel}  •  Canal: ${selectedChannel.toUpperCase()}`,
    80,
    176
  );

  // Main Template Preview Card
  ctx.fillStyle = palette.bgSurface;
  ctx.strokeStyle = palette.borderColor;
  ctx.lineWidth = Math.max(1, geometry.borderWidth);
  ctx.beginPath();
  ctx.roundRect(48, 224, 1504, 540, Math.min(28, geometry.borderRadius));
  ctx.fill();
  ctx.stroke();

  // Hero Accent Header inside Preview
  ctx.fillStyle = palette.brandPrimary;
  ctx.beginPath();
  ctx.roundRect(88, 264, 1424, 180, Math.min(20, geometry.borderRadius));
  ctx.fill();

  ctx.fillStyle = palette.brandText;
  ctx.font = `bold 40px "${fonts.heading}", sans-serif`;
  ctx.fillText(`${state.projectName} — ${archetypeLabel}`, 124, 345);

  ctx.font = `500 20px "${fonts.body}", sans-serif`;
  ctx.fillText(
    `Tipografía: ${fonts.heading} + ${fonts.body} (${fonts.mono}) • Radio: ${geometry.borderRadius}px • Trazo: ${geometry.borderWidth}px`,
    124,
    392
  );

  // 3 Feature / Metric Blocks inside Preview
  const cardWidth = 452;
  const titles = [
    '01 • Colorimetría OKLCH',
    '02 • Escala Tipográfica Fluida',
    '03 • Geometría Multi-Canal',
  ];
  const descriptions = [
    `Semilla ${state.seedColor} (${state.isDark ? 'Modo Oscuro' : 'Modo Claro'})`,
    `Heading: ${fonts.heading} | Body: ${fonts.body}`,
    `Radius: ${geometry.borderRadius}px | Shadow: ${geometry.shadowStyle}`,
  ];

  for (let i = 0; i < 3; i++) {
    const x = 88 + i * (cardWidth + 34);
    const y = 478;
    ctx.fillStyle = palette.bgCanvas;
    ctx.strokeStyle = palette.borderColor;
    ctx.beginPath();
    ctx.roundRect(x, y, cardWidth, 240, Math.min(18, geometry.borderRadius));
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = palette.accentSecondary;
    ctx.font = `bold 15px "${fonts.mono}", monospace`;
    ctx.fillText(titles[i], x + 28, y + 48);

    ctx.fillStyle = palette.textPrimary;
    ctx.font = `bold 22px "${fonts.heading}", sans-serif`;
    ctx.fillText(descriptions[i], x + 28, y + 98);

    ctx.fillStyle = palette.brandPrimary;
    ctx.beginPath();
    ctx.roundRect(x + 28, y + 146, 180, 48, Math.min(12, geometry.borderRadius));
    ctx.fill();

    ctx.fillStyle = palette.brandText;
    ctx.font = `bold 15px "${fonts.body}", sans-serif`;
    ctx.fillText('Token Verificado', x + 52, y + 176);
  }

  // Bottom Swatch Strip
  const swatchEntries = Object.entries(palette);
  const swatchW = Math.floor(1504 / swatchEntries.length) - 12;
  swatchEntries.forEach(([key, hex], idx) => {
    const sx = 48 + idx * (swatchW + 13);
    const sy = 796;
    ctx.fillStyle = hex;
    ctx.strokeStyle = palette.borderColor;
    ctx.beginPath();
    ctx.roundRect(sx, sy, swatchW, 110, Math.min(14, geometry.borderRadius));
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = palette.textPrimary;
    ctx.font = `bold 13px "${fonts.mono}", monospace`;
    ctx.fillText(`${key}: ${hex}`, sx + 4, sy + 138);
  });

  const slug =
    state.projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'design-system';

  const link = document.createElement('a');
  link.download = `${slug}-${selectedChannel}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function PreviewCanvas({
  state,
  selectedChannel,
  isChannelColumnOpen,
  onExpandChannelColumn,
  onDownloadMarkdown,
}: PreviewCanvasProps): React.ReactElement {
  const [canvasView, setCanvasView] = useState<CanvasViewMode>('template');
  const [copiedMd, setCopiedMd] = useState(false);

  const archetype = ARCHETYPES[state.archetypeId] || ARCHETYPES.minimalist;
  const harmonyInfo = HARMONY_LABELS[state.harmony] || HARMONY_LABELS.analogous;
  const scalePreset = TYPOGRAPHY_SCALES[state.fonts.scale] || TYPOGRAPHY_SCALES.balanced;

  // Dynamic Google Fonts loader
  useEffect(() => {
    const linkId = 'designmd-dynamic-google-fonts';
    let linkEl = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.id = linkId;
      linkEl.rel = 'stylesheet';
      document.head.appendChild(linkEl);
    }
    if (linkEl.href !== state.fonts.googleFontsUrl) {
      linkEl.href = state.fonts.googleFontsUrl;
    }
  }, [state.fonts.googleFontsUrl]);

  const densityPadding = {
    compact: '1rem',
    comfortable: '1.5rem',
    spacious: '2rem',
  }[state.geometry.density];

  const densityGap = {
    compact: '0.75rem',
    comfortable: '1rem',
    spacious: '1.5rem',
  }[state.geometry.density];

  const shadowCss = resolveShadowCss(
    state.geometry.shadowStyle,
    state.palette.borderColor,
    state.palette.textPrimary,
    state.isDark
  );

  const bgSurfaceResolved =
    state.geometry.shadowStyle === 'glass'
      ? state.isDark
        ? `${state.palette.bgSurface}CC`
        : `${state.palette.bgSurface}D9`
      : state.palette.bgSurface;

  const injectedCssVariables: React.CSSProperties = {
    '--bg-canvas': state.palette.bgCanvas,
    '--bg-surface': bgSurfaceResolved,
    '--text-primary': state.palette.textPrimary,
    '--text-secondary': state.palette.textSecondary,
    '--brand-primary': state.palette.brandPrimary,
    '--brand-text': state.palette.brandText,
    '--accent-secondary': state.palette.accentSecondary,
    '--accent-tertiary': state.palette.accentTertiary,
    '--border-color': state.palette.borderColor,
    '--radius': `${state.geometry.borderRadius}px`,
    '--border-width': `${state.geometry.borderWidth}px`,
    '--shadow': shadowCss,
    '--font-heading': `'${state.fonts.heading}', system-ui, sans-serif`,
    '--font-body': `'${state.fonts.body}', system-ui, sans-serif`,
    '--font-mono': `'${state.fonts.mono}', monospace`,
    '--density-pad': densityPadding,
    '--density-gap': densityGap,
    '--scale-h1': scalePreset.h1Size,
    '--scale-h2': scalePreset.h2Size,
    '--scale-h3': scalePreset.h3Size,
    '--scale-body': scalePreset.bodySize,
    '--surface-backdrop':
      state.geometry.shadowStyle === 'glass' ? 'blur(12px)' : 'none',
  } as React.CSSProperties;

  const compiledMarkdown = compileDesignMarkdown(state);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(compiledMarkdown);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = compiledMarkdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    }
  };

  const activeChannelMeta =
    selectedChannel === 'all'
      ? { label: 'Vista Grilla (4 Canales)', badge: 'MULTI-CANAL' }
      : CHANNELS.find((c) => c.id === selectedChannel) || CHANNELS[0];

  const showLanding = selectedChannel === 'web-landing' || selectedChannel === 'all';
  const showDashboard = selectedChannel === 'dashboard' || selectedChannel === 'all';
  const showSocial = selectedChannel === 'social-post' || selectedChannel === 'all';
  const showBroadcast =
    selectedChannel === 'broadcast-overlay' || selectedChannel === 'all';

  return (
    <main
      aria-label="Lienzo de previsualización live en tiempo real"
      className="flex-1 h-full flex flex-col bg-canvas relative overflow-hidden min-w-0"
    >
      {/* Top Canvas Bar: Discreet Col 3 Expand + Project/Archetype Badge + View Toggle */}
      <header className="px-4 py-2.5 bg-surface border-b border-border-subtle flex flex-wrap items-center justify-between gap-2.5 shrink-0 z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          {!isChannelColumnOpen && (
            <button
              type="button"
              data-attr="canvas-expand-channel-col"
              onClick={onExpandChannelColumn}
              aria-label="Desplegar columna de canales y templates"
              title="Mostrar selector de canales (Columna 3)"
              className="min-h-[38px] px-2.5 rounded-lg border border-border-subtle bg-elevated hover:bg-border-subtle/60 text-ink-primary text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-brand-primary" aria-hidden="true" />
              <span>Canales</span>
            </button>
          )}

          {/* Project Name & Active Archetype Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle bg-canvas min-w-0">
            <span
              style={{ backgroundColor: state.palette.brandPrimary }}
              className="w-2.5 h-2.5 rounded-full shrink-0"
              aria-hidden="true"
            />
            <span className="text-xs font-bold text-ink-primary truncate">
              {state.projectName}
            </span>
            <span className="text-ink-muted text-xs" aria-hidden="true">
              •
            </span>
            <span className="text-xs font-semibold text-brand-primary truncate">
              {archetype.label}
            </span>
            <span className="hidden xl:inline text-ink-muted text-xs" aria-hidden="true">
              •
            </span>
            <span
              translate="no"
              className="hidden xl:inline text-[11px] font-mono text-ink-muted whitespace-nowrap"
            >
              {activeChannelMeta.label}
            </span>
          </div>

          {/* Live Color Swatches Pill */}
          <div
            aria-label="Paleta cromática activa"
            className="hidden 2xl:flex items-center gap-1 px-2 py-1 rounded-lg border border-border-subtle bg-canvas shrink-0"
          >
            {Object.entries(state.palette).map(([key, hex]) => (
              <span
                key={key}
                style={{ backgroundColor: hex }}
                title={`${key}: ${hex}`}
                className="w-3.5 h-3.5 rounded-sm border border-black/20 inline-block"
              />
            ))}
          </div>
        </div>

        {/* Toggle between Vista Template and Vista Código DESIGN.md */}
        <div
          role="group"
          aria-label="Alternar entre Vista Template y Vista Código DESIGN.md"
          className="inline-flex items-center p-1 rounded-xl border border-border-subtle bg-elevated shrink-0"
        >
          <button
            type="button"
            data-attr="canvas-view-template"
            aria-pressed={canvasView === 'template'}
            onClick={() => setCanvasView('template')}
            className={`min-h-[34px] px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
              canvasView === 'template'
                ? 'bg-surface text-brand-primary shadow-sm border border-border-subtle'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Vista Template</span>
          </button>

          <button
            type="button"
            data-attr="canvas-view-code"
            aria-pressed={canvasView === 'code'}
            onClick={() => setCanvasView('code')}
            className={`min-h-[34px] px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
              canvasView === 'code'
                ? 'bg-surface text-brand-primary shadow-sm border border-border-subtle'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Vista Código DESIGN.md</span>
          </button>
        </div>
      </header>

      {/* Scrollable Live Canvas Body */}
      <div
        style={injectedCssVariables}
        className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 space-y-6"
      >
        {canvasView === 'template' ? (
          <>
            {/* 1. Web Landing Page Template */}
            {showLanding && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                    Template • {CHANNELS[0].label} ({CHANNELS[0].badge})
                  </span>
                  <span translate="no" className="text-xs font-mono text-ink-muted">
                    Hero + 3 Features + CTA
                  </span>
                </div>
                <WebLandingTemplate
                  projectName={state.projectName}
                  archetypeLabel={archetype.label}
                />
              </div>
            )}

            {/* 2. Analytical Dashboard Template */}
            {showDashboard && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                    Template • {CHANNELS[1].label} ({CHANNELS[1].badge})
                  </span>
                  <span translate="no" className="text-xs font-mono text-ink-muted">
                    KPI Cards + CSS Bar Chart + Telemetry Table
                  </span>
                </div>
                <DashboardTemplate projectName={state.projectName} />
              </div>
            )}

            {/* 3 & 4. Social Post 1:1 & Broadcast 16:9 */}
            {(showSocial || showBroadcast) && (
              <div
                className={
                  showSocial && showBroadcast
                    ? 'grid grid-cols-1 xl:grid-cols-12 gap-6 items-start'
                    : 'max-w-4xl mx-auto'
                }
              >
                {showSocial && (
                  <div className={showBroadcast ? 'xl:col-span-5 space-y-2' : 'space-y-2'}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                        Template • {CHANNELS[2].label}
                      </span>
                      <span translate="no" className="text-xs font-mono text-ink-muted">
                        1:1 (1080×1080)
                      </span>
                    </div>
                    <SocialPostTemplate
                      projectName={state.projectName}
                      archetypeLabel={archetype.label}
                      harmonyLabel={harmonyInfo.label}
                    />
                  </div>
                )}

                {showBroadcast && (
                  <div className={showSocial ? 'xl:col-span-7 space-y-2' : 'space-y-2'}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                        Template • {CHANNELS[3].label}
                      </span>
                      <span translate="no" className="text-xs font-mono text-ink-muted">
                        16:9 • 12.5% Bottom CC Safe Area
                      </span>
                    </div>
                    <BroadcastOverlayTemplate
                      projectName={state.projectName}
                      archetypeLabel={archetype.label}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Live Compiled DESIGN.md Code View */
          <section
            aria-label="Código compilado DESIGN.md en tiempo real"
            className="max-w-4xl mx-auto bg-surface border border-border-subtle rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-border-subtle bg-elevated flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-ink-primary">
                  Especificación Compilada • DESIGN.md
                </h2>
                <p className="text-xs text-ink-muted">
                  Sincronizada en tiempo real con cada cambio de la Columna 2 (Google Stitch Spec)
                </p>
              </div>
              <button
                type="button"
                data-attr="canvas-copy-markdown"
                onClick={handleCopyMarkdown}
                className="min-h-[38px] px-3 rounded-lg border border-border-subtle bg-surface hover:bg-canvas text-ink-primary text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                {copiedMd ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-status-success" aria-hidden="true" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-brand-primary" aria-hidden="true" />
                    <span>Copiar Markdown</span>
                  </>
                )}
              </button>
            </div>
            <pre
              translate="no"
              className="p-5 text-xs font-mono text-ink-primary bg-surface overflow-x-auto whitespace-pre-wrap leading-relaxed"
            >
              {compiledMarkdown}
            </pre>
          </section>
        )}
      </div>

      {/* Bottom-Right Floating / Anchored Export Bar */}
      <div
        role="region"
        aria-label="Acciones de exportación"
        className="absolute bottom-4 right-5 z-20 flex items-center gap-2.5 bg-surface/95 backdrop-blur-md border border-border-subtle p-1.5 rounded-2xl shadow-xl"
      >
        <button
          type="button"
          data-attr="canvas-export-png"
          onClick={() =>
            exportDesignViewAsPng(
              state,
              selectedChannel,
              archetype.label,
              harmonyInfo.label
            )
          }
          title="Exportar vista actual como imagen PNG"
          className="min-h-[42px] px-3.5 rounded-xl border border-border-subtle bg-elevated hover:bg-canvas text-ink-primary text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
        >
          <ImageDown className="w-4 h-4 text-brand-primary shrink-0" aria-hidden="true" />
          <span>Exportar PNG</span>
        </button>

        <button
          type="button"
          data-attr="canvas-download-markdown"
          onClick={onDownloadMarkdown}
          className="min-h-[42px] px-4 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors shadow-md"
        >
          <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Descargar DESIGN.md</span>
        </button>
      </div>
    </main>
  );
}
