import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, FileCode2, X } from 'lucide-react';
import type { DesignSystemState } from '../../data/archetypes';
import { compileDesignMarkdown } from '../../utils/markdownCompiler';

interface MarkdownModalProps {
  state: DesignSystemState;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export function MarkdownModal({
  state,
  isOpen,
  onClose,
  onDownload,
}: MarkdownModalProps): React.ReactElement | null {
  const [copied, setCopied] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const compiledMarkdown = compileDesignMarkdown(state);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(compiledMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = compiledMarkdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="markdown-modal-title"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
    >
      <div className="bg-surface border border-border-subtle rounded-2xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <header className="px-6 py-4 border-b border-border-subtle flex flex-wrap items-center justify-between gap-3 bg-elevated">
          <div className="flex items-center gap-2.5">
            <FileCode2 className="w-5 h-5 text-brand-primary shrink-0" aria-hidden="true" />
            <div>
              <h2 id="markdown-modal-title" className="text-base font-bold text-ink-primary">
                Especificación Compilada • DESIGN.md
              </h2>
              <p className="text-xs text-ink-muted">
                Alineado con Google Stitch Design System Specification (100% determinista)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-attr="modal-copy-markdown"
              onClick={handleCopy}
              className="min-h-[44px] px-3.5 rounded-lg border border-border-subtle bg-surface hover:bg-canvas text-ink-primary text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-status-success" aria-hidden="true" />
                  <span>¡Copiado al portapapeles!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-brand-primary" aria-hidden="true" />
                  <span>Copiar Markdown</span>
                </>
              )}
            </button>

            <button
              type="button"
              data-attr="modal-download-markdown"
              onClick={onDownload}
              className="min-h-[44px] px-4 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Descargar DESIGN.md</span>
            </button>

            <button
              ref={closeButtonRef}
              type="button"
              data-attr="modal-close-markdown"
              onClick={onClose}
              aria-label="Cerrar vista de DESIGN.md"
              className="min-h-[44px] min-w-[44px] rounded-lg border border-border-subtle bg-surface hover:bg-canvas text-ink-primary inline-flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Compiled Markdown Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-canvas">
          <pre
            translate="no"
            className="text-xs font-mono text-ink-primary bg-surface border border-border-subtle rounded-xl p-5 overflow-x-auto whitespace-pre-wrap leading-relaxed"
          >
            {compiledMarkdown}
          </pre>
        </div>
      </div>
    </div>
  );
}
