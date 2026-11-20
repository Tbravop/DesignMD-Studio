import React, { useState } from 'react';
import {
  Moon,
  Palette,
  RotateCcw,
  Sliders,
  Sun,
  Type,
} from 'lucide-react';
import {
  ARCHETYPES,
  TYPOGRAPHY_SCALES,
  type DesignSystemState,
  type TypographyScaleId,
} from '../../data/archetypes';
import {
  HARMONY_LABELS,
  generatePaletteFromSeed,
  getContrastRatio,
  type GeneratedPalette,
  type HarmonyRule,
} from '../../utils/colorEngine';

interface StudioSidebarProps {
  state: DesignSystemState;
  onUpdateSeedAndHarmony: (seedHex: string, harmony: HarmonyRule, isDark: boolean) => void;
  onUpdateTokenColor: (tokenKey: keyof GeneratedPalette, hexValue: string) => void;
  onSelectArchetypeFonts: (archetypeId: string) => void;
  onUpdateCustomFont: (field: 'heading' | 'body' | 'mono', value: string) => void;
  onUpdateTypographyScale: (scale: TypographyScaleId) => void;
  onUpdateGeometry: (patch: Partial<DesignSystemState['geometry']>) => void;
  onResetToArchetype: (archetypeId: string) => void;
}

type SidebarTabId = 'colors' | 'typography' | 'geometry';

const TOKEN_FIELDS: {
  key: keyof GeneratedPalette;
  cssVar: string;
  label: string;
  contrastAgainst?: keyof GeneratedPalette;
}[] = [
  { key: 'bgCanvas', cssVar: '--bg-canvas', label: 'Fondo Lienzo' },
  { key: 'bgSurface', cssVar: '--bg-surface', label: 'Superficie / Tarjeta' },
  {
    key: 'textPrimary',
    cssVar: '--text-primary',
    label: 'Texto Primario',
    contrastAgainst: 'bgCanvas',
  },
  {
    key: 'textSecondary',
    cssVar: '--text-secondary',
    label: 'Texto Secundario',
    contrastAgainst: 'bgCanvas',
  },
  {
    key: 'brandPrimary',
    cssVar: '--brand-primary',
    label: 'Acento Primario',
  },
  {
    key: 'brandText',
    cssVar: '--brand-text',
    label: 'Texto sobre Primario',
    contrastAgainst: 'brandPrimary',
  },
  {
    key: 'accentSecondary',
    cssVar: '--accent-secondary',
    label: 'Acento Secundario',
  },
  {
    key: 'borderColor',
    cssVar: '--border-color',
    label: 'Color de Borde',
  },
];

const HARMONY_KEYS: HarmonyRule[] = [
  'monochromatic',
  'analogous',
  'complementary',
  'split-complementary',
  'triadic',
  'tetradic',
];

export function StudioSidebar({
  state,
  onUpdateSeedAndHarmony,
  onUpdateTokenColor,
  onSelectArchetypeFonts,
  onUpdateCustomFont,
  onUpdateTypographyScale,
  onUpdateGeometry,
  onResetToArchetype,
}: StudioSidebarProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<SidebarTabId>('colors');
  const [harmonyFilter, setHarmonyFilter] = useState<'all' | HarmonyRule>(state.harmony);

  const handleHarmonySelectChange = (val: string) => {
    if (val === 'all') {
      setHarmonyFilter('all');
    } else {
      const rule = val as HarmonyRule;
      setHarmonyFilter(rule);
      onUpdateSeedAndHarmony(state.seedColor, rule, state.isDark);
    }
  };

  return (
    <aside
      aria-label="Controles visuales sin código"
      className="w-full lg:w-96 shrink-0 bg-surface border-b lg:border-b-0 lg:border-r border-border-subtle flex flex-col"
    >
      {/* Top Tab Bar */}
      <div
        role="tablist"
        aria-label="Pestañas de configuración de diseño"
        className="grid grid-cols-3 border-b border-border-subtle bg-elevated p-1 gap-1"
      >
        <button
          type="button"
          role="tab"
          data-attr="sidebar-tab-colors"
          aria-selected={activeTab === 'colors'}
          onClick={() => setActiveTab('colors')}
          className={`min-h-[44px] px-2 rounded-md text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'colors'
              ? 'bg-surface text-brand-primary shadow-sm'
              : 'text-ink-muted hover:text-ink-primary'
          }`}
        >
          <Palette className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Colores</span>
        </button>

        <button
          type="button"
          role="tab"
          data-attr="sidebar-tab-typography"
          aria-selected={activeTab === 'typography'}
          onClick={() => setActiveTab('typography')}
          className={`min-h-[44px] px-2 rounded-md text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'typography'
              ? 'bg-surface text-brand-primary shadow-sm'
              : 'text-ink-muted hover:text-ink-primary'
          }`}
        >
          <Type className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Tipografía</span>
        </button>

        <button
          type="button"
          role="tab"
          data-attr="sidebar-tab-geometry"
          aria-selected={activeTab === 'geometry'}
          onClick={() => setActiveTab('geometry')}
          className={`min-h-[44px] px-2 rounded-md text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'geometry'
              ? 'bg-surface text-brand-primary shadow-sm'
              : 'text-ink-muted hover:text-ink-primary'
          }`}
        >
          <Sliders className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Geometría</span>
        </button>
      </div>

      {/* Tab Content Panel */}
      <div className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-130px)]">
        {/* TAB 1: COLORES */}
        {activeTab === 'colors' && (
          <div className="space-y-5">
            {/* Seed Color + Light/Dark Mode Switch */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="seed-color-picker"
                  className="text-xs font-bold uppercase tracking-wider text-ink-muted"
                >
                  Color Semilla &amp; Modo
                </label>
                <button
                  type="button"
                  data-attr="sidebar-reset-archetype"
                  onClick={() => onResetToArchetype(state.archetypeId)}
                  className="min-h-[44px] px-2.5 text-xs font-semibold text-brand-primary hover:underline inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Restaurar Arquetipo</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2 p-1.5 rounded-lg border border-border-subtle bg-canvas">
                  <input
                    id="seed-color-picker"
                    data-attr="sidebar-seed-color-input"
                    type="color"
                    value={state.seedColor}
                    onChange={(e) =>
                      onUpdateSeedAndHarmony(e.target.value, state.harmony, state.isDark)
                    }
                    className="w-9 h-9 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    aria-label="Código HEX del color semilla"
                    value={state.seedColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                        onUpdateSeedAndHarmony(val, state.harmony, state.isDark);
                      }
                    }}
                    className="w-full bg-transparent font-mono text-xs font-bold text-ink-primary focus:outline-none"
                  />
                </div>

                {/* Light / Dark Mode Switch */}
                <button
                  type="button"
                  data-attr="sidebar-toggle-dark-mode"
                  onClick={() =>
                    onUpdateSeedAndHarmony(state.seedColor, state.harmony, !state.isDark)
                  }
                  className="min-h-[44px] px-3 rounded-lg border border-border-subtle bg-canvas hover:bg-elevated text-ink-primary text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  {state.isDark ? (
                    <>
                      <Moon className="w-4 h-4 text-brand-primary" aria-hidden="true" />
                      <span>Modo Oscuro</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4 text-brand-primary" aria-hidden="true" />
                      <span>Modo Claro</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Chromatic Harmony Selector */}
            <div className="space-y-2">
              <label
                htmlFor="studio-harmony-select"
                className="block text-xs font-bold uppercase tracking-wider text-ink-muted"
              >
                Regla de Armonía Cromática
              </label>
              <select
                id="studio-harmony-select"
                data-attr="sidebar-harmony-select"
                value={harmonyFilter}
                onChange={(e) => handleHarmonySelectChange(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-lg border border-border-subtle bg-canvas text-ink-primary text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="all">All (Explorar todas las armonías)</option>
                <option value="monochromatic">Monochromatic (Monocromático)</option>
                <option value="analogous">Analogous (Análogo)</option>
                <option value="complementary">Complementary (Complementario)</option>
                <option value="split-complementary">
                  Split Complementary (Complementario Dividido)
                </option>
                <option value="triadic">Triadic (Triádico)</option>
                <option value="tetradic">Tetradic (Tetrádico)</option>
              </select>

              {/* Quick Harmony Comparison Strip when 'all' is selected or for instant switching */}
              {harmonyFilter === 'all' && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {HARMONY_KEYS.map((rule) => {
                    const previewPal = generatePaletteFromSeed(
                      state.seedColor,
                      rule,
                      state.isDark
                    );
                    const isCurrent = state.harmony === rule;
                    return (
                      <button
                        key={rule}
                        type="button"
                        data-attr={`sidebar-harmony-card-${rule}`}
                        onClick={() =>
                          onUpdateSeedAndHarmony(state.seedColor, rule, state.isDark)
                        }
                        className={`min-h-[44px] p-2 rounded-lg border text-left transition-all ${
                          isCurrent
                            ? 'border-brand-primary bg-elevated'
                            : 'border-border-subtle bg-canvas hover:bg-elevated/60'
                        }`}
                      >
                        <div className="text-xs font-semibold text-ink-primary truncate">
                          {HARMONY_LABELS[rule].label}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[
                            previewPal.bgCanvas,
                            previewPal.brandPrimary,
                            previewPal.accentSecondary,
                            previewPal.accentTertiary,
                          ].map((hex, i) => (
                            <span
                              key={`${rule}-${i}`}
                              style={{ backgroundColor: hex }}
                              className="w-4 h-3 rounded-sm border border-black/15 inline-block"
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Individual Semantic Token Swatches */}
            <div className="space-y-2.5 pt-2 border-t border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Tokens Semánticos Editables
                </span>
                <span className="text-xs font-mono text-ink-muted" translate="no">
                  8 VARIABLES
                </span>
              </div>

              <div className="space-y-2">
                {TOKEN_FIELDS.map(({ key, cssVar, label, contrastAgainst }) => {
                  const hexValue = state.palette[key];
                  const contrastValue = contrastAgainst
                    ? getContrastRatio(hexValue, state.palette[contrastAgainst])
                    : null;
                  const passesAA = contrastValue ? contrastValue >= 4.5 : true;

                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border-subtle bg-canvas"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <label
                          htmlFor={`swatch-${key}`}
                          className="sr-only"
                        >
                          Editar color de {label} ({cssVar})
                        </label>
                        <input
                          id={`swatch-${key}`}
                          data-attr={`sidebar-token-${key}`}
                          type="color"
                          value={hexValue}
                          onChange={(e) => onUpdateTokenColor(key, e.target.value.toUpperCase())}
                          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-ink-primary truncate">
                            {label}
                          </div>
                          <div
                            translate="no"
                            className="text-xs font-mono text-ink-muted truncate"
                          >
                            {cssVar}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {contrastValue !== null && (
                          <span
                            translate="no"
                            title="Razón de contraste WCAG 2.1"
                            className={`text-xs font-mono px-1.5 py-0.5 rounded font-semibold ${
                              passesAA
                                ? 'bg-status-success/15 text-status-success'
                                : 'bg-status-warning/15 text-status-warning'
                            }`}
                          >
                            {contrastValue}:1
                          </span>
                        )}
                        <span
                          translate="no"
                          className="text-xs font-mono font-bold text-ink-primary"
                        >
                          {hexValue}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TIPOGRAFÍA */}
        {activeTab === 'typography' && (
          <div className="space-y-5">
            {/* Curated Google Font Pairs */}
            <div className="space-y-2.5">
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">
                Pares de Google Fonts Curados
              </span>
              <div className="space-y-2">
                {Object.values(ARCHETYPES).map((arch) => {
                  const isSelected = state.fonts.presetId === arch.id;
                  return (
                    <button
                      key={arch.id}
                      type="button"
                      data-attr={`sidebar-font-preset-${arch.id}`}
                      onClick={() => onSelectArchetypeFonts(arch.id)}
                      className={`w-full min-h-[44px] p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-brand-primary bg-elevated'
                          : 'border-border-subtle bg-canvas hover:bg-elevated/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-ink-primary">
                          {arch.label}
                        </span>
                        <span
                          translate="no"
                          className="text-xs font-mono text-brand-primary font-semibold"
                        >
                          {arch.fonts.heading}
                        </span>
                      </div>
                      <div
                        translate="no"
                        className="text-xs text-ink-muted mt-1 font-mono"
                      >
                        Body: {arch.fonts.body} • Mono: {arch.fonts.mono}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typographic Scale Selector */}
            <div className="space-y-2.5 pt-3 border-t border-border-subtle">
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">
                Escala Modular Tipográfica
              </span>
              <div className="space-y-2">
                {Object.values(TYPOGRAPHY_SCALES).map((scale) => {
                  const isSelected = state.fonts.scale === scale.id;
                  return (
                    <button
                      key={scale.id}
                      type="button"
                      data-attr={`sidebar-font-scale-${scale.id}`}
                      onClick={() => onUpdateTypographyScale(scale.id)}
                      className={`w-full min-h-[44px] p-2.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-brand-primary bg-elevated'
                          : 'border-border-subtle bg-canvas hover:bg-elevated/60'
                      }`}
                    >
                      <div className="text-xs font-bold text-ink-primary">
                        {scale.label}
                      </div>
                      <div className="text-xs text-ink-muted mt-0.5">
                        {scale.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct Family Override Inputs */}
            <div className="space-y-3 pt-3 border-t border-border-subtle">
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">
                Variables de Familia CSS
              </span>

              <div>
                <label
                  htmlFor="font-heading-input"
                  className="block text-xs font-mono text-ink-muted mb-1"
                  translate="no"
                >
                  --font-heading
                </label>
                <input
                  id="font-heading-input"
                  type="text"
                  value={state.fonts.heading}
                  onChange={(e) => onUpdateCustomFont('heading', e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-lg border border-border-subtle bg-canvas text-ink-primary text-xs font-semibold"
                />
              </div>

              <div>
                <label
                  htmlFor="font-body-input"
                  className="block text-xs font-mono text-ink-muted mb-1"
                  translate="no"
                >
                  --font-body
                </label>
                <input
                  id="font-body-input"
                  type="text"
                  value={state.fonts.body}
                  onChange={(e) => onUpdateCustomFont('body', e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-lg border border-border-subtle bg-canvas text-ink-primary text-xs font-semibold"
                />
              </div>

              <div>
                <label
                  htmlFor="font-mono-input"
                  className="block text-xs font-mono text-ink-muted mb-1"
                  translate="no"
                >
                  --font-mono
                </label>
                <input
                  id="font-mono-input"
                  type="text"
                  value={state.fonts.mono}
                  onChange={(e) => onUpdateCustomFont('mono', e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-lg border border-border-subtle bg-canvas text-ink-primary text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GEOMETRÍA Y AIRE */}
        {activeTab === 'geometry' && (
          <div className="space-y-6">
            {/* Border Radius Slider (0px to 24px) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="slider-border-radius"
                  className="text-xs font-bold uppercase tracking-wider text-ink-muted"
                >
                  Radio de Borde (--radius)
                </label>
                <span
                  translate="no"
                  className="text-xs font-mono font-bold text-brand-primary"
                >
                  {state.geometry.borderRadius}px
                </span>
              </div>
              <input
                id="slider-border-radius"
                data-attr="sidebar-slider-radius"
                type="range"
                min={0}
                max={24}
                step={1}
                value={state.geometry.borderRadius}
                onChange={(e) =>
                  onUpdateGeometry({ borderRadius: parseInt(e.target.value, 10) })
                }
                className="w-full accent-brand-primary cursor-pointer h-2 rounded-lg"
              />
              <div
                translate="no"
                className="flex justify-between text-xs font-mono text-ink-muted"
              >
                <span>0px (Brutal)</span>
                <span>8px</span>
                <span>16px</span>
                <span>24px (Pill)</span>
              </div>
            </div>

            {/* Border Width Slider (0px to 3px) */}
            <div className="space-y-2 pt-3 border-t border-border-subtle">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="slider-border-width"
                  className="text-xs font-bold uppercase tracking-wider text-ink-muted"
                >
                  Grosor de Borde (--border-width)
                </label>
                <span
                  translate="no"
                  className="text-xs font-mono font-bold text-brand-primary"
                >
                  {state.geometry.borderWidth}px
                </span>
              </div>
              <input
                id="slider-border-width"
                data-attr="sidebar-slider-border-width"
                type="range"
                min={0}
                max={3}
                step={1}
                value={state.geometry.borderWidth}
                onChange={(e) =>
                  onUpdateGeometry({ borderWidth: parseInt(e.target.value, 10) })
                }
                className="w-full accent-brand-primary cursor-pointer h-2 rounded-lg"
              />
              <div
                translate="no"
                className="flex justify-between text-xs font-mono text-ink-muted"
              >
                <span>0px</span>
                <span>1px (Sutil)</span>
                <span>2px (Marcado)</span>
                <span>3px (Heavy)</span>
              </div>
            </div>

            {/* Shadow Style Selector */}
            <div className="space-y-2.5 pt-3 border-t border-border-subtle">
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">
                Estilo de Sombra (--shadow)
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'none', label: 'Ninguna (Flat)' },
                    { id: 'hard', label: 'Dura (Brutalista)' },
                    { id: 'soft', label: 'Suave (Ambient)' },
                    { id: 'glass', label: 'Glass (Translúcida)' },
                  ] as const
                ).map((item) => {
                  const isSelected = state.geometry.shadowStyle === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-attr={`sidebar-shadow-${item.id}`}
                      onClick={() => onUpdateGeometry({ shadowStyle: item.id })}
                      className={`min-h-[44px] px-3 rounded-lg border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-brand-primary bg-elevated text-brand-primary'
                          : 'border-border-subtle bg-canvas text-ink-primary hover:bg-elevated/60'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Density Selector */}
            <div className="space-y-2.5 pt-3 border-t border-border-subtle">
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">
                Densidad de Espaciado (Unidad Base 8px)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'compact', label: 'Compacto' },
                    { id: 'comfortable', label: 'Cómodo' },
                    { id: 'spacious', label: 'Amplio' },
                  ] as const
                ).map((item) => {
                  const isSelected = state.geometry.density === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-attr={`sidebar-density-${item.id}`}
                      onClick={() => onUpdateGeometry({ density: item.id })}
                      className={`min-h-[44px] px-2 rounded-lg border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-brand-primary bg-elevated text-brand-primary'
                          : 'border-border-subtle bg-canvas text-ink-primary hover:bg-elevated/60'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
