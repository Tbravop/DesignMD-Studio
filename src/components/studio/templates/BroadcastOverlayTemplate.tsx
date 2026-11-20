import React from 'react';
import { Mic, Radio, Subtitles, Tv } from 'lucide-react';

interface BroadcastOverlayTemplateProps {
  projectName: string;
  archetypeLabel: string;
}

export function BroadcastOverlayTemplate({
  projectName,
  archetypeLabel,
}: BroadcastOverlayTemplateProps): React.ReactElement {
  return (
    <section
      aria-label="Previsualización Broadcast Overlay 16:9 con reserva del 12.5% para subtítulos"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        borderRadius: 'var(--radius)',
        border: 'var(--border-width) solid var(--border-color)',
        boxShadow: 'var(--shadow)',
      }}
      className="aspect-video w-full relative overflow-hidden flex flex-col justify-between transition-colors duration-150"
    >
      {/* Active Broadcast Area (Top 87.5% of 16:9 frame) */}
      <div
        style={{ height: '87.5%', padding: 'var(--density-pad)' }}
        className="w-full flex flex-col justify-between relative"
      >
        {/* Top Bugs & Telemetry Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius)',
              border: 'var(--border-width) solid var(--border-color)',
              boxShadow: 'var(--shadow)',
            }}
            className="px-3 py-1.5 inline-flex items-center gap-2"
          >
            <Radio
              className="w-4 h-4 shrink-0"
              style={{ color: 'var(--brand-primary)' }}
              aria-hidden="true"
            />
            <span
              translate="no"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
              }}
              className="text-xs font-bold tracking-wider uppercase"
            >
              LIVE 16:9 • {projectName}
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius)',
              border: 'var(--border-width) solid var(--border-color)',
            }}
            className="px-3 py-1.5 inline-flex items-center gap-2"
          >
            <Tv
              className="w-4 h-4 shrink-0"
              style={{ color: 'var(--accent-secondary)' }}
              aria-hidden="true"
            />
            <span
              translate="no"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
              }}
              className="text-xs font-semibold"
            >
              1920×1080 • 60FPS
            </span>
          </div>
        </div>

        {/* Lower-Third Speaker Chyron placed strictly above the 12.5% caption safe zone */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius)',
            border: 'var(--border-width) solid var(--border-color)',
            boxShadow: 'var(--shadow)',
            backdropFilter: 'var(--surface-backdrop)',
          }}
          className="p-3.5 max-w-lg flex items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Mic
                className="w-4 h-4 shrink-0"
                style={{ color: 'var(--brand-primary)' }}
                aria-hidden="true"
              />
              <span
                translate="no"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--brand-primary)',
                }}
                className="text-xs font-bold uppercase tracking-wider"
              >
                ARQUITECTURA DE SISTEMAS EN VIVO
              </span>
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--scale-h3)',
                color: 'var(--text-primary)',
              }}
              className="font-bold leading-snug"
            >
              Estándar {archetypeLabel}: Tokens &amp; Canales
            </h3>
          </div>

          <span
            translate="no"
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'var(--brand-text)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-mono)',
            }}
            className="px-2.5 py-1 text-xs font-bold shrink-0"
          >
            CH-04
          </span>
        </div>
      </div>

      {/* Mandatory 12.5% Bottom Reservation Zone for Live Closed Captions */}
      <div
        style={{
          height: '12.5%',
          borderTop: '2px dashed var(--accent-secondary)',
          backgroundColor: 'var(--bg-surface)',
        }}
        className="w-full px-4 flex items-center justify-between gap-2 opacity-95"
      >
        <div className="flex items-center gap-2">
          <Subtitles
            className="w-4 h-4 shrink-0"
            style={{ color: 'var(--accent-secondary)' }}
            aria-hidden="true"
          />
          <span
            translate="no"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
            }}
            className="text-xs font-semibold tracking-wide"
          >
            ZONA SEGURA SUBTÍTULOS EN VIVO (12.5% INFERIOR LIBRE DE GRÁFICOS)
          </span>
        </div>

        <span
          translate="no"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
          }}
          className="text-xs hidden sm:inline"
        >
          CC SAFE AREA • 135PX @ 1080P
        </span>
      </div>
    </section>
  );
}
