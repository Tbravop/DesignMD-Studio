import React from 'react';
import { ArrowUpRight, Compass, Share2 } from 'lucide-react';

interface SocialPostTemplateProps {
  projectName: string;
  archetypeLabel: string;
  harmonyLabel: string;
}

export function SocialPostTemplate({
  projectName,
  archetypeLabel,
  harmonyLabel,
}: SocialPostTemplateProps): React.ReactElement {
  return (
    <section
      aria-label="Previsualización Social Media Post 1:1 (1080x1080 escalado)"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        borderRadius: 'var(--radius)',
        border: 'var(--border-width) solid var(--border-color)',
        boxShadow: 'var(--shadow)',
        padding: 'var(--density-pad)',
      }}
      className="flex flex-col justify-between aspect-square w-full max-w-[460px] mx-auto relative overflow-hidden transition-colors duration-150"
    >
      {/* Top Meta Row */}
      <header className="flex items-center justify-between gap-2 z-10">
        <div className="inline-flex items-center gap-2">
          <Compass
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
            {projectName}
          </span>
        </div>

        <span
          translate="no"
          style={{
            fontFamily: 'var(--font-mono)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius)',
            border: 'var(--border-width) solid var(--border-color)',
          }}
          className="text-xs px-2.5 py-1 font-semibold"
        >
          01 / 04 • 1080×1080
        </span>
      </header>

      {/* Main Focal Point */}
      <div className="my-auto py-4 space-y-4 z-10">
        <div
          translate="no"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-secondary)',
          }}
          className="text-xs font-semibold uppercase tracking-widest"
        >
          SISTEMA DE DISEÑO • {harmonyLabel}
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--scale-h1)',
            color: 'var(--text-primary)',
            lineHeight: 1.1,
          }}
          className="font-bold tracking-tight"
        >
          Arquitectura {archetypeLabel} sin fricción.
        </h2>

        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius)',
            border: 'var(--border-width) solid var(--border-color)',
            boxShadow: 'var(--shadow)',
            padding: '0.875rem 1rem',
            backdropFilter: 'var(--surface-backdrop)',
          }}
          className="flex items-center justify-between gap-3"
        >
          <div>
            <div
              style={{ color: 'var(--text-secondary)' }}
              className="text-xs font-medium"
            >
              Token Primario Activo
            </div>
            <div
              translate="no"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--brand-primary)',
              }}
              className="text-sm font-bold"
            >
              var(--brand-primary)
            </div>
          </div>

          <span
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'var(--brand-text)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-mono)',
            }}
            translate="no"
            className="px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1"
          >
            <span>STITCH SPEC</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>

      {/* Carousel Footer */}
      <footer
        style={{
          borderTop: 'var(--border-width) solid var(--border-color)',
          paddingTop: '0.75rem',
        }}
        className="flex items-center justify-between gap-2 z-10"
      >
        <div className="flex items-center gap-2">
          <span
            style={{ backgroundColor: 'var(--brand-primary)' }}
            className="w-6 h-1.5 inline-block"
          />
          <span
            style={{ backgroundColor: 'var(--accent-secondary)' }}
            className="w-2.5 h-1.5 inline-block opacity-70"
          />
          <span
            style={{ backgroundColor: 'var(--border-color)' }}
            className="w-2.5 h-1.5 inline-block"
          />
          <span
            style={{ backgroundColor: 'var(--border-color)' }}
            className="w-2.5 h-1.5 inline-block"
          />
        </div>

        <button
          type="button"
          data-attr="template-social-share"
          style={{
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius)',
            border: 'var(--border-width) solid var(--border-color)',
            fontFamily: 'var(--font-mono)',
          }}
          className="min-h-[44px] px-3 text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Desliza →</span>
        </button>
      </footer>
    </section>
  );
}
