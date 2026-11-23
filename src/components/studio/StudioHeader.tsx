import React from 'react';
import {
  ArrowLeft,
  Check,
  Code2,
  Download,
  Eye,
  FileCode,
} from 'lucide-react';
import { CHANNELS, type ChannelId, type DesignSystemState } from '../../data/archetypes';

interface StudioHeaderProps {
  state: DesignSystemState;
  onUpdateProjectName: (name: string) => void;
  onToggleChannel: (channelId: ChannelId) => void;
  onOpenMarkdownModal: () => void;
  onDownloadMarkdown: () => void;
  onBackToHub: () => void;
}

export function StudioHeader({
  state,
  onUpdateProjectName,
  onToggleChannel,
  onOpenMarkdownModal,
  onDownloadMarkdown,
  onBackToHub,
}: StudioHeaderProps): React.ReactElement {
  return (
    <header className="bg-surface border-b border-border-subtle px-3 sm:px-4 py-2 flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 sticky top-0 z-30">
      {/* Left: Back to Hub + Editable Project Name */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          data-attr="studio-back-hub"
          onClick={onBackToHub}
          className="min-h-[44px] px-2.5 sm:px-3 rounded-lg border border-border-subtle bg-elevated text-ink-primary hover:bg-border-subtle/60 text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          title="Volver al Hub de Ingesta"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>
            Hub<span className="hidden 2xl:inline"> de Ingesta</span>
          </span>
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="w-5 h-5 text-brand-primary shrink-0 hidden sm:block" aria-hidden="true" />
          <label htmlFor="studio-project-name" className="sr-only">
            Nombre editable del proyecto
          </label>
          <input
            id="studio-project-name"
            data-attr="studio-project-name-input"
            type="text"
            value={state.projectName}
            onChange={(e) => onUpdateProjectName(e.target.value)}
            placeholder="Nombre del Sistema..."
            className="min-h-[44px] px-2.5 sm:px-3 py-1.5 rounded-lg border border-border-subtle bg-canvas text-ink-primary font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary w-32 sm:w-40 xl:w-44 min-w-0"
          />
        </div>
      </div>

      {/* Center: Channel Visibility Toggles */}
      <div
        role="group"
        aria-label="Canales visibles en el lienzo"
        className="order-3 lg:order-2 w-full lg:w-auto flex items-center gap-1 sm:gap-1.5 overflow-x-auto"
      >
        <span className="text-xs font-semibold text-ink-muted mr-1 hidden 2xl:inline-flex items-center gap-1 shrink-0">
          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Canales:</span>
        </span>
        {CHANNELS.map((channel) => {
          const isActive = state.activeChannels.includes(channel.id);
          return (
            <button
              key={channel.id}
              type="button"
              data-attr={`studio-toggle-channel-${channel.id}`}
              aria-pressed={isActive}
              onClick={() => onToggleChannel(channel.id)}
              className={`min-h-[44px] px-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 border transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-canvas text-ink-muted border-border-subtle hover:text-ink-primary'
              }`}
            >
              {isActive && <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
              <span>{channel.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Inspect / Copy & Download DESIGN.md */}
      <div className="order-2 lg:order-3 flex items-center gap-2 shrink-0">
        <button
          type="button"
          data-attr="studio-open-markdown-modal"
          onClick={onOpenMarkdownModal}
          title="Ver/Copiar DESIGN.md"
          className="min-h-[44px] px-2.5 sm:px-3 rounded-lg border border-border-subtle bg-surface text-ink-primary hover:bg-elevated text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
        >
          <Code2 className="w-4 h-4 text-brand-primary shrink-0" aria-hidden="true" />
          <span>
            <span className="sm:hidden">Ver MD</span>
            <span className="hidden sm:inline 2xl:hidden">Ver DESIGN.md</span>
            <span className="hidden 2xl:inline">Ver/Copiar DESIGN.md</span>
          </span>
        </button>

        <button
          type="button"
          data-attr="studio-download-markdown"
          onClick={onDownloadMarkdown}
          title="Descargar DESIGN.md"
          className="min-h-[44px] px-3 sm:px-3.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap"
        >
          <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>
            Descargar<span className="hidden 2xl:inline"> DESIGN.md</span>
          </span>
        </button>
      </div>
    </header>
  );
}
