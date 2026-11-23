import React, { useEffect, useRef } from 'react';
import {
  BarChart3,
  ChevronLeft,
  Globe,
  LayoutGrid,
  Radio,
  Share2,
} from 'lucide-react';
import type { ChannelId, DesignSystemState } from '../../data/archetypes';

export type CanvasChannelSelection = ChannelId | 'all';

interface ChannelSelectorColumnProps {
  isVisible: boolean;
  selectedChannel: CanvasChannelSelection;
  state: DesignSystemState;
  onSelectChannel: (selection: CanvasChannelSelection) => void;
  onCollapse: () => void;
}

const CHANNEL_CARDS: {
  id: ChannelId;
  shortTitle: string;
  subtitle: string;
  ratioBadge: string;
  microHint: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'web-landing',
    shortTitle: 'Landing',
    subtitle: 'Landing Page Web',
    ratioBadge: '16:10',
    microHint: 'Hero • 3 Features • CTA',
    Icon: Globe,
  },
  {
    id: 'dashboard',
    shortTitle: 'Dashboard',
    subtitle: 'Panel Analítico',
    ratioBadge: 'SaaS',
    microHint: 'KPIs • Barras • Telemetría',
    Icon: BarChart3,
  },
  {
    id: 'social-post',
    shortTitle: 'Social',
    subtitle: 'Post / Carrusel 1:1',
    ratioBadge: '1:1',
    microHint: '1080×1080 • Focal central',
    Icon: Share2,
  },
  {
    id: 'broadcast-overlay',
    shortTitle: 'Broadcast',
    subtitle: 'Overlay Streaming 16:9',
    ratioBadge: '16:9',
    microHint: 'Zona segura CC 12.5% inf.',
    Icon: Radio,
  },
];

export function ChannelSelectorColumn({
  isVisible,
  selectedChannel,
  state,
  onSelectChannel,
  onCollapse,
}: ChannelSelectorColumnProps): React.ReactElement {
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = asideRef.current as (HTMLElement & { inert?: boolean }) | null;
    if (el) {
      el.inert = !isVisible;
    }
  }, [isVisible]);

  return (
    <aside
      ref={asideRef}
      aria-label="Selector de canal y template"
      aria-hidden={!isVisible}
      className={`shrink-0 h-full bg-surface flex flex-col overflow-hidden z-10 transition-all duration-300 ease-out ${
        isVisible
          ? 'w-[220px] opacity-100 border-r border-border-subtle'
          : 'w-0 opacity-0 border-r-0 pointer-events-none'
      }`}
    >
      <div className="w-[220px] h-full flex flex-col">
        {/* Header + Discreet Collapse Button */}
        <div className="px-3.5 py-3 border-b border-border-subtle bg-elevated/40 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-brand-primary">
              COL 03 • CANALES
            </span>
            <h2 className="text-xs font-bold text-ink-primary truncate">
              Selector de Template
            </h2>
          </div>

          <button
            type="button"
            data-attr="channel-col-collapse"
            onClick={onCollapse}
            aria-label="Colapsar columna de canales para ampliar el lienzo"
            title="Colapsar selector de canales"
            className="w-8 h-8 rounded-lg border border-border-subtle bg-surface hover:bg-elevated text-ink-muted hover:text-ink-primary inline-flex items-center justify-center shrink-0 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* 4 Vertical Channel Cards + "Ver todos en grilla" */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {CHANNEL_CARDS.map((card) => {
            const isSelected = selectedChannel === card.id;
            const IconComponent = card.Icon;
            return (
              <button
                key={card.id}
                type="button"
                data-attr={`channel-card-${card.id}`}
                aria-pressed={isSelected}
                onClick={() => onSelectChannel(card.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all space-y-2 relative ${
                  isSelected
                    ? 'border-brand-primary bg-elevated/90 shadow-sm ring-1 ring-brand-primary'
                    : 'border-border-subtle bg-canvas hover:bg-elevated/40'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="inline-flex items-center gap-1.5 min-w-0">
                    <span
                      aria-hidden="true"
                      style={{
                        backgroundColor: isSelected
                          ? state.palette.brandPrimary
                          : state.palette.borderColor,
                      }}
                      className="w-2 h-2 rounded-full shrink-0"
                    />
                    <IconComponent
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-brand-primary' : 'text-ink-muted'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-bold text-ink-primary truncate">
                      {card.shortTitle}
                    </span>
                  </div>

                  <span
                    translate="no"
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-brand-primary text-white'
                        : 'bg-surface text-ink-muted border border-border-subtle'
                    }`}
                  >
                    {card.ratioBadge}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-ink-primary leading-tight">
                    {card.subtitle}
                  </p>
                  <p className="text-[10px] text-ink-muted leading-tight">
                    {card.microHint}
                  </p>
                </div>

                {/* Micro Visual Geometry Indicator */}
                <div
                  aria-hidden="true"
                  style={{
                    backgroundColor: state.palette.bgCanvas,
                    borderColor: state.palette.borderColor,
                  }}
                  className="h-6 rounded border px-2 flex items-center justify-between overflow-hidden"
                >
                  <div className="flex items-center gap-1">
                    <span
                      style={{
                        backgroundColor: state.palette.brandPrimary,
                        borderRadius: `${Math.min(6, state.geometry.borderRadius)}px`,
                      }}
                      className="w-4 h-2.5 inline-block"
                    />
                    <span
                      style={{ backgroundColor: state.palette.textPrimary }}
                      className="w-6 h-1.5 rounded-sm opacity-75 inline-block"
                    />
                  </div>
                  {card.id === 'broadcast-overlay' ? (
                    <span
                      translate="no"
                      style={{ color: state.palette.accentSecondary }}
                      className="text-[8px] font-mono font-bold"
                    >
                      CC 12.5%
                    </span>
                  ) : (
                    <span
                      style={{ backgroundColor: state.palette.accentSecondary }}
                      className="w-2 h-2 rounded-full inline-block"
                    />
                  )}
                </div>
              </button>
            );
          })}

          {/* Option to view all 4 templates in a grid */}
          <div className="pt-2 border-t border-border-subtle">
            <button
              type="button"
              data-attr="channel-card-all"
              aria-pressed={selectedChannel === 'all'}
              onClick={() => onSelectChannel('all')}
              className={`w-full min-h-[42px] px-3 py-2 rounded-xl border text-xs font-bold inline-flex items-center justify-between transition-all ${
                selectedChannel === 'all'
                  ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                  : 'border-border-subtle bg-canvas hover:bg-elevated text-ink-primary'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Ver todos en grilla</span>
              </span>
              <span translate="no" className="text-[10px] font-mono opacity-80">
                4x
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
