import React, { useEffect } from 'react';
import { Eye, Layers } from 'lucide-react';
import {
  ARCHETYPES,
  CHANNELS,
  TYPOGRAPHY_SCALES,
  type ChannelId,
  type DesignSystemState,
} from '../../data/archetypes';
import { HARMONY_LABELS } from '../../utils/colorEngine';
import { resolveShadowCss } from '../../utils/markdownCompiler';
import { BroadcastOverlayTemplate } from './templates/BroadcastOverlayTemplate';
import { DashboardTemplate } from './templates/DashboardTemplate';
import { SocialPostTemplate } from './templates/SocialPostTemplate';
import { WebLandingTemplate } from './templates/WebLandingTemplate';

interface PreviewCanvasProps {
  state: DesignSystemState;
  onEnableAllChannels: () => void;
}

export function PreviewCanvas({
  state,
  onEnableAllChannels,
}: PreviewCanvasProps): React.ReactElement {
  const archetype = ARCHETYPES[state.archetypeId] || ARCHETYPES.minimalist;
  const harmonyInfo = HARMONY_LABELS[state.harmony] || HARMONY_LABELS.analogous;
  const scalePreset = TYPOGRAPHY_SCALES[state.fonts.scale] || TYPOGRAPHY_SCALES.balanced;

  // Carga dinámica de Google Fonts en <head>
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

  // Superficie con soporte translúcido si el estilo de sombra es glass
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

  const hasChannel = (id: ChannelId) => state.activeChannels.includes(id);

  // Estado Vacío explícito si todos los canales fueron desactivados
  if (state.activeChannels.length === 0) {
    return (
      <main className="flex-1 p-8 flex items-center justify-center bg-canvas">
        <div className="max-w-md w-full bg-surface border border-border-subtle rounded-xl p-8 text-center space-y-4">
          <Eye className="w-8 h-8 text-brand-primary mx-auto" aria-hidden="true" />
          <h2 className="text-lg font-bold text-ink-primary">
            Ningún canal activo en el lienzo
          </h2>
          <p className="text-sm text-ink-muted">
            Activa al menos un canal de destino en la barra superior para previsualizar
            las variables CSS del sistema en tiempo real.
          </p>
          <button
            type="button"
            data-attr="canvas-enable-all-channels"
            onClick={onEnableAllChannels}
            className="min-h-[44px] px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <Layers className="w-4 h-4" aria-hidden="true" />
            <span>Activar los 4 Canales</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      aria-label="Lienzo de previsualización multi-canal en tiempo real"
      style={injectedCssVariables}
      className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-canvas space-y-8"
    >
      {/* Live Token Strip Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border border-border-subtle rounded-xl px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-bold text-ink-primary">
            Arquetipo: <span className="text-brand-primary">{archetype.label}</span>
          </span>
          <span className="text-ink-muted">•</span>
          <span className="font-medium text-ink-muted">
            Armonía: <strong className="text-ink-primary">{harmonyInfo.label}</strong>
          </span>
          <span className="text-ink-muted">•</span>
          <span translate="no" className="font-mono text-ink-muted">
            --radius: {state.geometry.borderRadius}px | --border-width:{' '}
            {state.geometry.borderWidth}px
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {Object.entries(state.palette).map(([key, hex]) => (
            <span
              key={key}
              style={{ backgroundColor: hex }}
              title={`${key}: ${hex}`}
              className="w-5 h-5 rounded border border-black/20 inline-block"
            />
          ))}
        </div>
      </div>

      {/* 1. Web Landing Page Channel */}
      {hasChannel('web-landing') && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Canal 01 • {CHANNELS[0].label} ({CHANNELS[0].badge})
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

      {/* 2. Analytical Dashboard Channel */}
      {hasChannel('dashboard') && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Canal 02 • {CHANNELS[1].label} ({CHANNELS[1].badge})
            </span>
            <span translate="no" className="text-xs font-mono text-ink-muted">
              KPI Cards + CSS Bar Chart + Telemetry Table
            </span>
          </div>
          <DashboardTemplate projectName={state.projectName} />
        </div>
      )}

      {/* 3 & 4. Social Media 1:1 and Broadcast 16:9 Grid */}
      {(hasChannel('social-post') || hasChannel('broadcast-overlay')) && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {hasChannel('social-post') && (
            <div className="xl:col-span-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Canal 03 • {CHANNELS[2].label}
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

          {hasChannel('broadcast-overlay') && (
            <div className="xl:col-span-7 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Canal 04 • {CHANNELS[3].label}
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
    </main>
  );
}
