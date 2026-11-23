import React, { useState } from 'react';
import {
  ChannelSelectorColumn,
  type CanvasChannelSelection,
} from './components/studio/ChannelSelectorColumn';
import { ConfigTokensPanel } from './components/studio/ConfigTokensPanel';
import { OriginRail, type IngestionMode } from './components/studio/OriginRail';
import { PreviewCanvas } from './components/studio/PreviewCanvas';
import {
  ARCHETYPES,
  type DesignSystemState,
  type TypographyScaleId,
} from './data/archetypes';
import {
  generatePaletteFromSeed,
  getAccessibleBrandText,
  type GeneratedPalette,
  type HarmonyRule,
} from './utils/colorEngine';
import { downloadDesignMarkdown } from './utils/markdownCompiler';

function createInitialState(): DesignSystemState {
  const defaultArch = ARCHETYPES.minimalist;
  return {
    projectName: `${defaultArch.label} — Design System`,
    archetypeId: defaultArch.id,
    seedColor: defaultArch.defaultSeed,
    harmony: defaultArch.defaultHarmony,
    isDark: defaultArch.defaultDark,
    palette: generatePaletteFromSeed(
      defaultArch.defaultSeed,
      defaultArch.defaultHarmony,
      defaultArch.defaultDark
    ),
    fonts: {
      presetId: defaultArch.id,
      heading: defaultArch.fonts.heading,
      body: defaultArch.fonts.body,
      mono: defaultArch.fonts.mono,
      googleFontsUrl: defaultArch.fonts.googleFontsUrl,
      scale: 'balanced',
    },
    geometry: {
      ...defaultArch.geometry,
    },
    activeChannels: ['web-landing', 'dashboard', 'social-post', 'broadcast-overlay'],
  };
}

export function App(): React.ReactElement {
  const [activeMode, setActiveMode] = useState<IngestionMode>('wizard');
  const [state, setState] = useState<DesignSystemState>(createInitialState);
  // Column 3 starts closed and unfolds automatically once Block 5 (Geometry) is interacted with
  const [isChannelColumnOpen, setIsChannelColumnOpen] = useState<boolean>(false);
  const [selectedChannel, setSelectedChannel] =
    useState<CanvasChannelSelection>('web-landing');

  const handleSelectOriginMode = (nextMode: IngestionMode) => {
    if (nextMode !== activeMode) {
      setActiveMode(nextMode);
      setIsChannelColumnOpen(false);
    }
  };

  const handleUpdateState = (patch: Partial<DesignSystemState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  const handleSelectArchetypePreset = (archetypeId: string) => {
    const preset = ARCHETYPES[archetypeId];
    if (!preset) return;
    const newPalette = generatePaletteFromSeed(
      preset.defaultSeed,
      preset.defaultHarmony,
      preset.defaultDark
    );
    setState((prev) => ({
      ...prev,
      projectName: `${preset.label} — Design System`,
      archetypeId: preset.id,
      seedColor: preset.defaultSeed,
      harmony: preset.defaultHarmony,
      isDark: preset.defaultDark,
      palette: newPalette,
      fonts: {
        presetId: preset.id,
        heading: preset.fonts.heading,
        body: preset.fonts.body,
        mono: preset.fonts.mono,
        googleFontsUrl: preset.fonts.googleFontsUrl,
        scale: prev.fonts.scale,
      },
      geometry: {
        ...preset.geometry,
      },
    }));
  };

  const handleUpdateSeedAndHarmony = (
    seedHex: string,
    harmony: HarmonyRule,
    isDark: boolean
  ) => {
    const nextPalette = generatePaletteFromSeed(seedHex, harmony, isDark);
    setState((prev) => ({
      ...prev,
      seedColor: seedHex.toUpperCase(),
      harmony,
      isDark,
      palette: nextPalette,
    }));
  };

  const handleUpdateTokenColor = (
    tokenKey: keyof GeneratedPalette,
    hexValue: string
  ) => {
    setState((prev) => {
      const updatedPalette = {
        ...prev.palette,
        [tokenKey]: hexValue,
      };
      if (tokenKey === 'brandPrimary') {
        updatedPalette.brandText = getAccessibleBrandText(hexValue);
      }
      return {
        ...prev,
        palette: updatedPalette,
      };
    });
  };

  const handleSelectArchetypeFonts = (archetypeId: string) => {
    const preset = ARCHETYPES[archetypeId];
    if (!preset) return;
    setState((prev) => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        presetId: preset.id,
        heading: preset.fonts.heading,
        body: preset.fonts.body,
        mono: preset.fonts.mono,
        googleFontsUrl: preset.fonts.googleFontsUrl,
      },
    }));
  };

  const handleUpdateCustomFont = (
    field: 'heading' | 'body' | 'mono',
    value: string
  ) => {
    setState((prev) => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [field]: value,
      },
    }));
  };

  const handleUpdateTypographyScale = (scale: TypographyScaleId) => {
    setState((prev) => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        scale,
      },
    }));
  };

  const handleUpdateGeometry = (
    patch: Partial<DesignSystemState['geometry']>
  ) => {
    setState((prev) => ({
      ...prev,
      geometry: {
        ...prev.geometry,
        ...patch,
      },
    }));
  };

  const handleSelectChannel = (selection: CanvasChannelSelection) => {
    setSelectedChannel(selection);
    setState((prev) => ({
      ...prev,
      activeChannels:
        selection === 'all'
          ? ['web-landing', 'dashboard', 'social-post', 'broadcast-overlay']
          : [selection],
    }));
  };

  const handleDownloadMarkdown = () => {
    downloadDesignMarkdown(state);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-canvas text-ink-primary flex">
      {/* Columna 1 — Rail de Origen (64px fijo a la izquierda) */}
      <OriginRail activeMode={activeMode} onSelectMode={handleSelectOriginMode} />

      {/* Columna 2 — Panel de Configuración y Tokens (320px, despliegue progresivo bloque a bloque 1..5) */}
      <ConfigTokensPanel
        key={activeMode}
        activeMode={activeMode}
        state={state}
        isChannelColumnOpen={isChannelColumnOpen}
        onUpdateState={handleUpdateState}
        onSelectArchetypePreset={handleSelectArchetypePreset}
        onUpdateSeedAndHarmony={handleUpdateSeedAndHarmony}
        onUpdateTokenColor={handleUpdateTokenColor}
        onSelectArchetypeFonts={handleSelectArchetypeFonts}
        onUpdateCustomFont={handleUpdateCustomFont}
        onUpdateTypographyScale={handleUpdateTypographyScale}
        onUpdateGeometry={handleUpdateGeometry}
        onToggleChannelColumn={() => setIsChannelColumnOpen((prev) => !prev)}
        onAutoOpenChannelColumn={() => setIsChannelColumnOpen(true)}
      />

      {/* Columna 3 — Selector de Canal / Template (220px, se auto-despliega al completar Bloque 5) */}
      <ChannelSelectorColumn
        isVisible={isChannelColumnOpen}
        selectedChannel={selectedChannel}
        state={state}
        onSelectChannel={handleSelectChannel}
        onCollapse={() => setIsChannelColumnOpen(false)}
      />

      {/* Columna 4 — Lienzo de Previsualización Live (Siempre visible desde el inicio con Landing Page por defecto) */}
      <PreviewCanvas
        state={state}
        selectedChannel={selectedChannel}
        isChannelColumnOpen={isChannelColumnOpen}
        onExpandChannelColumn={() => setIsChannelColumnOpen(true)}
        onDownloadMarkdown={handleDownloadMarkdown}
      />
    </div>
  );
}
