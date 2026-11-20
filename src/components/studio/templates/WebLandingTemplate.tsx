import React from 'react';
import { ArrowRight, CheckCircle2, Globe, Layers, ShieldCheck, Sparkles } from 'lucide-react';

interface WebLandingTemplateProps {
  projectName: string;
  archetypeLabel: string;
}

const FEATURES = [
  {
    id: 'tokens',
    title: 'Tokens Semánticos en Vivo',
    description:
      'Propagación instantánea a 60fps mediante variables CSS nativas sin recargas ni compiladores externos.',
    metric: '0ms latency',
    Icon: Layers,
  },
  {
    id: 'contrast',
    title: 'Contraste Auditado WCAG',
    description:
      'Cálculo determinista de luminancia relativa para garantizar legibilidad AA/AAA en cada superficie.',
    metric: '4.5:1 min',
    Icon: ShieldCheck,
  },
  {
    id: 'stitch',
    title: 'Estándar Google Stitch',
    description:
      'Compilación limpia a DESIGN.md lista para agentes de código y sistemas multi-plataforma.',
    metric: '100% spec',
    Icon: Globe,
  },
];

export function WebLandingTemplate({
  projectName,
  archetypeLabel,
}: WebLandingTemplateProps): React.ReactElement {
  return (
    <section
      aria-label="Previsualización Landing Page Web"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        borderRadius: 'var(--radius)',
        border: 'var(--border-width) solid var(--border-color)',
        boxShadow: 'var(--shadow)',
        padding: 'var(--density-pad)',
      }}
      className="transition-colors duration-150"
    >
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: 'var(--border-width) solid var(--border-color)',
          paddingBottom: '1rem',
          marginBottom: 'var(--density-pad)',
        }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Sparkles
            className="w-5 h-5 shrink-0"
            style={{ color: 'var(--brand-primary)' }}
            aria-hidden="true"
          />
          <span
            style={{ fontFamily: 'var(--font-heading)' }}
            className="font-bold text-base tracking-tight"
          >
            {projectName}
          </span>
          <span
            translate="no"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              borderColor: 'var(--border-color)',
              borderWidth: 'var(--border-width)',
              borderRadius: 'var(--radius)',
            }}
            className="text-xs px-2.5 py-1 border"
          >
            {archetypeLabel}
          </span>
        </div>

        <nav aria-label="Navegación de plantilla" className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-attr="template-web-nav-specs"
            style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
            }}
            className="min-h-[44px] px-3 text-sm font-medium hover:opacity-80 transition-opacity"
          >
            Arquitectura
          </button>
          <button
            type="button"
            data-attr="template-web-nav-tokens"
            style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
            }}
            className="min-h-[44px] px-3 text-sm font-medium hover:opacity-80 transition-opacity"
          >
            Tokens
          </button>
          <button
            type="button"
            data-attr="template-web-nav-cta"
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'var(--brand-text)',
              borderRadius: 'var(--radius)',
              border: 'var(--border-width) solid var(--border-color)',
              fontFamily: 'var(--font-heading)',
            }}
            className="min-h-[44px] px-4 text-sm font-semibold inline-flex items-center gap-2 transition-transform active:scale-95"
          >
            <span>Explorar Sistema</span>
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <div
        style={{ marginBottom: 'var(--density-pad)' }}
        className="max-w-3xl space-y-4"
      >
        <div className="inline-flex items-center gap-2">
          <CheckCircle2
            className="w-4 h-4 shrink-0"
            style={{ color: 'var(--accent-secondary)' }}
            aria-hidden="true"
          />
          <span
            translate="no"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-secondary)',
            }}
            className="text-xs font-semibold uppercase tracking-wider"
          >
            GOOGLE STITCH OPEN SPECIFICATION • V1.0
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--scale-h1)',
            color: 'var(--text-primary)',
            lineHeight: 1.12,
          }}
          className="font-bold tracking-tight"
        >
          Infraestructura visual coherente para {projectName}
        </h1>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--scale-body)',
            lineHeight: 1.6,
          }}
          className="max-w-2xl"
        >
          Unifica tokens cromáticos, escalas tipográficas y geometría espacial en un único
          contrato declarativo consumible por humanos y agentes de diseño.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            data-attr="template-web-hero-primary"
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'var(--brand-text)',
              borderRadius: 'var(--radius)',
              border: 'var(--border-width) solid var(--border-color)',
              boxShadow: 'var(--shadow)',
              fontFamily: 'var(--font-heading)',
            }}
            className="min-h-[44px] px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
          >
            <span>Implementar Tokens</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            data-attr="template-web-hero-secondary"
            style={{
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius)',
              border: 'var(--border-width) solid var(--border-color)',
              fontFamily: 'var(--font-heading)',
            }}
            className="min-h-[44px] px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
          >
            <span>Auditar Contraste</span>
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div
        style={{
          gap: 'var(--density-gap)',
          marginBottom: 'var(--density-pad)',
        }}
        className="grid grid-cols-1 md:grid-cols-3"
      >
        {FEATURES.map(({ id, title, description, metric, Icon }) => (
          <article
            key={id}
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius)',
              border: 'var(--border-width) solid var(--border-color)',
              boxShadow: 'var(--shadow)',
              padding: 'var(--density-pad)',
              backdropFilter: 'var(--surface-backdrop)',
            }}
            className="flex flex-col justify-between gap-3"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                {/* Regla estricta: Icono limpio sin encerrar en caja con fondo */}
                <Icon
                  className="w-5 h-5 shrink-0"
                  style={{ color: 'var(--brand-primary)' }}
                  aria-hidden="true"
                />
                <span
                  translate="no"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                  }}
                  className="text-xs font-medium"
                >
                  {metric}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--scale-h3)',
                  color: 'var(--text-primary)',
                }}
                className="font-semibold"
              >
                {title}
              </h3>

              <p
                style={{
                  color: 'var(--text-secondary)',
                }}
                className="text-sm leading-relaxed"
              >
                {description}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Bottom CTA Banner */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius)',
          border: 'var(--border-width) solid var(--border-color)',
          boxShadow: 'var(--shadow)',
          padding: 'var(--density-pad)',
        }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--scale-h2)',
              color: 'var(--text-primary)',
            }}
            className="font-bold"
          >
            Sincronización determinista multi-canal
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
            Listo para exportar a repositorios frontend sin costos de API ni latencia de red.
          </p>
        </div>

        <button
          type="button"
          data-attr="template-web-bottom-cta"
          style={{
            backgroundColor: 'var(--brand-primary)',
            color: 'var(--brand-text)',
            borderRadius: 'var(--radius)',
            border: 'var(--border-width) solid var(--border-color)',
            fontFamily: 'var(--font-heading)',
          }}
          className="min-h-[44px] px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
        >
          <span>Compilar DESIGN.md</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
