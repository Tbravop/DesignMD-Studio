import React from 'react';
import {
  Compass,
  FileCode2,
  Globe,
  Image as ImageIcon,
  Wand2,
} from 'lucide-react';

export type IngestionMode = 'wizard' | 'image' | 'url-css' | 'markdown';

interface OriginRailProps {
  activeMode: IngestionMode;
  onSelectMode: (mode: IngestionMode) => void;
}

const ORIGIN_ITEMS: {
  id: IngestionMode;
  shortLabel: string;
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'wizard',
    shortLabel: 'Crear',
    title: '1. Crear desde 0 (Wizard rápido)',
    Icon: Wand2,
  },
  {
    id: 'image',
    shortLabel: 'Imagen',
    title: '2. Extraer desde Imagen (Canvas K-Means)',
    Icon: ImageIcon,
  },
  {
    id: 'url-css',
    shortLabel: 'URL/CSS',
    title: '3. Extraer desde URL / CSS',
    Icon: Globe,
  },
  {
    id: 'markdown',
    shortLabel: 'DESIGN.md',
    title: '4. Cargar DESIGN.md existente',
    Icon: FileCode2,
  },
];

export function OriginRail({
  activeMode,
  onSelectMode,
}: OriginRailProps): React.ReactElement {
  return (
    <nav
      aria-label="Rail de origen del sistema de diseño"
      className="w-16 shrink-0 h-full bg-surface border-r border-border-subtle flex flex-col items-center py-3 select-none z-20"
    >
      {/* Top Studio Mark */}
      <div
        className="w-10 h-10 flex items-center justify-center text-brand-primary mb-4"
        title="DesignMD Studio — Google Stitch Spec"
      >
        <Compass className="w-6 h-6" aria-hidden="true" />
      </div>

      {/* 4 Clean Vertical Origin Icons (No background boxes on inactive icons) */}
      <div className="flex-1 flex flex-col items-center gap-3 w-full px-1">
        {ORIGIN_ITEMS.map((item) => {
          const isActive = activeMode === item.id;
          const IconComponent = item.Icon;
          return (
            <button
              key={item.id}
              type="button"
              data-attr={`origin-rail-${item.id}`}
              aria-pressed={isActive}
              aria-label={item.title}
              title={item.title}
              onClick={() => onSelectMode(item.id)}
              className={`relative w-full min-h-[52px] py-1.5 flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive
                  ? 'text-brand-primary font-bold'
                  : 'bg-transparent text-ink-muted hover:text-ink-primary font-medium'
              }`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand-primary"
                />
              )}
              <IconComponent className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="text-[10px] leading-none tracking-tight">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Stitch Spec Indicator */}
      <div
        translate="no"
        className="text-[9px] font-mono font-semibold text-ink-muted uppercase tracking-tighter text-center px-1"
        title="100% Client-Side Deterministic Engine"
      >
        STITCH
        <br />
        v2.0
      </div>
    </nav>
  );
}
