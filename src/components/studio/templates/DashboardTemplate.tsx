import React from 'react';
import { Activity, BarChart3, CheckCircle, Clock, TrendingUp, Zap } from 'lucide-react';

interface DashboardTemplateProps {
  projectName: string;
}

const KPI_METRICS = [
  {
    id: 'consistency',
    label: 'Cobertura de Tokens',
    value: '99.4%',
    delta: '+4.2% vs v0.9',
    Icon: Zap,
    accentVar: 'var(--brand-primary)',
  },
  {
    id: 'contrast',
    label: 'Índice WCAG AA/AAA',
    value: '14.8:1',
    delta: 'Óptimo perceptual',
    Icon: Activity,
    accentVar: 'var(--accent-secondary)',
  },
  {
    id: 'frame-budget',
    label: 'Tiempo de Inyección CSS',
    value: '0.42ms',
    delta: '60fps estables',
    Icon: Clock,
    accentVar: 'var(--accent-tertiary)',
  },
];

const BAR_SERIES = [
  { label: 'Web', primary: 88, secondary: 64 },
  { label: 'SaaS', primary: 94, secondary: 78 },
  { label: 'Social', primary: 76, secondary: 82 },
  { label: 'Stream', primary: 91, secondary: 70 },
  { label: 'Mobile', primary: 84, secondary: 60 },
  { label: 'Docs', primary: 96, secondary: 88 },
];

const TELEMETRY_ROWS = [
  {
    token: '--brand-primary',
    channel: 'Landing Hero CTA',
    status: 'Verificado AA',
    latency: '0.12ms',
  },
  {
    token: '--bg-surface',
    channel: 'Dashboard Cards',
    status: 'Sincronizado',
    latency: '0.09ms',
  },
  {
    token: '--accent-secondary',
    channel: 'Broadcast Telemetry',
    status: 'Safe Zone OK',
    latency: '0.15ms',
  },
];

export function DashboardTemplate({ projectName }: DashboardTemplateProps): React.ReactElement {
  return (
    <section
      aria-label="Previsualización Dashboard Analítico"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        borderRadius: 'var(--radius)',
        border: 'var(--border-width) solid var(--border-color)',
        boxShadow: 'var(--shadow)',
        padding: 'var(--density-pad)',
      }}
      className="space-y-5 transition-colors duration-150"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <BarChart3
            className="w-5 h-5 shrink-0"
            style={{ color: 'var(--brand-primary)' }}
            aria-hidden="true"
          />
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--scale-h3)',
                color: 'var(--text-primary)',
              }}
              className="font-bold"
            >
              Telemetría de Diseño • {projectName}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }} className="text-xs">
              Monitoreo determinista de tokens, contraste y rendimiento de renderizado
            </p>
          </div>
        </div>

        <span
          translate="no"
          style={{
            fontFamily: 'var(--font-mono)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius)',
            border: 'var(--border-width) solid var(--border-color)',
          }}
          className="text-xs px-3 py-1.5 font-medium inline-flex items-center gap-2"
        >
          <TrendingUp
            className="w-3.5 h-3.5"
            style={{ color: 'var(--brand-primary)' }}
            aria-hidden="true"
          />
          <span>LIVE ENGINE • 60FPS</span>
        </span>
      </div>

      {/* KPI Cards */}
      <div
        style={{ gap: 'var(--density-gap)' }}
        className="grid grid-cols-1 sm:grid-cols-3"
      >
        {KPI_METRICS.map(({ id, label, value, delta, Icon, accentVar }) => (
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
            className="space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                style={{ color: 'var(--text-secondary)' }}
                className="text-xs font-medium"
              >
                {label}
              </span>
              {/* Icono limpio sin contenedor con fondo */}
              <Icon
                className="w-4 h-4 shrink-0"
                style={{ color: accentVar }}
                aria-hidden="true"
              />
            </div>

            <div
              translate="no"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--scale-h2)',
                color: 'var(--text-primary)',
              }}
              className="font-bold tabular-nums tracking-tight"
            >
              {value}
            </div>

            <div
              translate="no"
              style={{
                fontFamily: 'var(--font-mono)',
                color: accentVar,
              }}
              className="text-xs font-medium"
            >
              {delta}
            </div>
          </article>
        ))}
      </div>

      {/* CSS Bar Chart + Data Table */}
      <div
        style={{ gap: 'var(--density-gap)' }}
        className="grid grid-cols-1 lg:grid-cols-12"
      >
        {/* Pure CSS Bar Chart */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius)',
            border: 'var(--border-width) solid var(--border-color)',
            boxShadow: 'var(--shadow)',
            padding: 'var(--density-pad)',
          }}
          className="lg:col-span-5 flex flex-col justify-between space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-primary)',
              }}
              className="text-sm font-semibold"
            >
              Adherencia por Canal (%)
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                  className="w-2.5 h-2.5 inline-block"
                />
                <span style={{ color: 'var(--text-secondary)' }}>Primario</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  style={{ backgroundColor: 'var(--accent-secondary)' }}
                  className="w-2.5 h-2.5 inline-block"
                />
                <span style={{ color: 'var(--text-secondary)' }}>Secundario</span>
              </span>
            </div>
          </div>

          <div className="h-36 flex items-end justify-between gap-1 sm:gap-2 pt-4 px-1 min-w-0 overflow-hidden">
            {BAR_SERIES.map((item) => (
              <div
                key={item.label}
                className="flex-1 min-w-0 flex flex-col items-center gap-2 h-full justify-end"
              >
                <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-28">
                  <div
                    style={{
                      height: `${item.primary}%`,
                      backgroundColor: 'var(--brand-primary)',
                      borderTopLeftRadius: 'var(--radius)',
                      borderTopRightRadius: 'var(--radius)',
                    }}
                    className="w-2 sm:w-3 transition-all duration-200"
                    title={`${item.label} Primario: ${item.primary}%`}
                  />
                  <div
                    style={{
                      height: `${item.secondary}%`,
                      backgroundColor: 'var(--accent-secondary)',
                      borderTopLeftRadius: 'var(--radius)',
                      borderTopRightRadius: 'var(--radius)',
                    }}
                    className="w-2 sm:w-3 transition-all duration-200"
                    title={`${item.label} Secundario: ${item.secondary}%`}
                  />
                </div>
                <span
                  translate="no"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                  }}
                  className="text-[10px] sm:text-[11px] truncate max-w-full"
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Telemetry Table */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius)',
            border: 'var(--border-width) solid var(--border-color)',
            boxShadow: 'var(--shadow)',
            padding: 'var(--density-pad)',
          }}
          className="lg:col-span-7 overflow-x-auto"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-primary)',
              }}
              className="text-sm font-semibold"
            >
              Auditoría de Variables CSS en Tiempo Real
            </h3>
            <span
              translate="no"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
              }}
              className="text-xs whitespace-nowrap shrink-0"
            >
              3/3 ACTIVOS
            </span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                style={{
                  borderBottom: 'var(--border-width) solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                }}
                className="text-xs uppercase"
              >
                <th className="py-2 pr-3 font-semibold">Token</th>
                <th className="py-2 px-3 font-semibold">Destino</th>
                <th className="py-2 px-3 font-semibold">Estado</th>
                <th className="py-2 pl-3 font-semibold text-right">Render</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {TELEMETRY_ROWS.map((row) => (
                <tr
                  key={row.token}
                  style={{
                    borderBottom: 'var(--border-width) solid var(--border-color)',
                  }}
                >
                  <td
                    translate="no"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--brand-primary)',
                    }}
                    className="py-2.5 pr-3 text-xs font-semibold"
                  >
                    {row.token}
                  </td>
                  <td
                    style={{ color: 'var(--text-primary)' }}
                    className="py-2.5 px-3 text-xs"
                  >
                    {row.channel}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      style={{
                        color: 'var(--text-primary)',
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-medium"
                    >
                      <CheckCircle
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: 'var(--accent-secondary)' }}
                        aria-hidden="true"
                      />
                      <span>{row.status}</span>
                    </span>
                  </td>
                  <td
                    translate="no"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                    }}
                    className="py-2.5 pl-3 text-xs text-right tabular-nums"
                  >
                    {row.latency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
