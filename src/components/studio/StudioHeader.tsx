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
    <header className="bg-surface border-b border-border-subtle px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Back to Hub + Editable Project Name */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-attr="studio-back-hub"
          onClick={onBackToHub}
          className="min-h-[44px] px-3 rounded-lg border border-border-subtle bg-elevated text-ink-primary hover:bg-border-subtle/60 text-sm font-medium inline-flex items-center gap-2 transition-colors"
          title="Volver al Hub de Ingesta"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Hub de Ingesta</span>
        </button>

        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-brand-primary shrink-0" aria-hidden="true" />
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
            className="min-h-[44px] px-3 py-1.5 rounded-lg border border-border-subtle bg-canvas text-ink-primary font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary w-48 sm:w-60"
          />
        </div>
      </div>

      {/* Center: Channel Visibility Toggles */}
      <div
        role="group"
        aria-label="Canales visibles en el lienzo"
        className="flex flex-wrap items-center gap-1.5"
      >
        <span className="text-xs font-semibold text-ink-muted mr-1.5 hidden xl:inline-flex items-center gap-1">
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
              className={`min-h-[44px] px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 border transition-colors ${
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
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          data-attr="studio-open-markdown-modal"
          onClick={onOpenMarkdownModal}
          className="min-h-[44px] px-3.5 rounded-lg border border-border-subtle bg-surface text-ink-primary hover:bg-elevated text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors"
        >
          <Code2 className="w-4 h-4 text-brand-primary shrink-0" aria-hidden="true" />
          <span>Ver/Copiar DESIGN.md</span>
        </button>

        <button
          type="button"
          data-attr="studio-download-markdown"
          onClick={onDownloadMarkdown}
          className="min-h-[44px] px-4 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Descargar DESIGN.md</span>
        </button>
      </div>
    </header>
  );
}
