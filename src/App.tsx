import React, { useState } from 'react';
import { IngestionHub } from './components/hub/IngestionHub';
import { MarkdownModal } from './components/studio/MarkdownModal';
import { PreviewCanvas } from './components/studio/PreviewCanvas';
import { StudioHeader } from './components/studio/StudioHeader';
import { StudioSidebar } from './components/studio/StudioSidebar';
import {
  ARCHETYPES,
  type ChannelId,
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
    projectName: 'Aurora Design System',
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
  const [currentView, setCurrentView] = useState<'hub' | 'studio'>('hub');
  const [state, setState] = useState<DesignSystemState>(createInitialState);
  const [isMarkdownModalOpen, setIsMarkdownModalOpen] = useState<boolean>(false);

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

  const handleUpdateTokenColor = (tokenKey: keyof GeneratedPalette, hexValue: string) => {
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

  const handleUpdateCustomFont = (field: 'heading' | 'body' | 'mono', value: string) => {
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

  const handleUpdateGeometry = (patch: Partial<DesignSystemState['geometry']>) => {
    setState((prev) => ({
      ...prev,
      geometry: {
        ...prev.geometry,
        ...patch,
      },
    }));
  };

  const handleToggleChannel = (channelId: ChannelId) => {
    setState((prev) => {
      const exists = prev.activeChannels.includes(channelId);
      const nextChannels = exists
        ? prev.activeChannels.filter((id) => id !== channelId)
        : [...prev.activeChannels, channelId];
      return {
        ...prev,
        activeChannels: nextChannels,
      };
    });
  };

  const handleEnableAllChannels = () => {
    setState((prev) => ({
      ...prev,
      activeChannels: ['web-landing', 'dashboard', 'social-post', 'broadcast-overlay'],
    }));
  };

  const handleDownloadMarkdown = () => {
    downloadDesignMarkdown(state);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex flex-col">
      {currentView === 'hub' ? (
        <IngestionHub
          state={state}
          onUpdateState={handleUpdateState}
          onSelectArchetypePreset={handleSelectArchetypePreset}
          onUpdateSeedAndHarmony={handleUpdateSeedAndHarmony}
          onToggleChannel={handleToggleChannel}
          onEnterStudio={() => setCurrentView('studio')}
        />
      ) : (
        <div className="min-h-screen flex flex-col">
          <StudioHeader
            state={state}
            onUpdateProjectName={(name) => handleUpdateState({ projectName: name })}
            onToggleChannel={handleToggleChannel}
            onOpenMarkdownModal={() => setIsMarkdownModalOpen(true)}
            onDownloadMarkdown={handleDownloadMarkdown}
            onBackToHub={() => setCurrentView('hub')}
          />

          <div className="flex-1 flex flex-col lg:flex-row">
            <StudioSidebar
              state={state}
              onUpdateSeedAndHarmony={handleUpdateSeedAndHarmony}
              onUpdateTokenColor={handleUpdateTokenColor}
              onSelectArchetypeFonts={handleSelectArchetypeFonts}
              onUpdateCustomFont={handleUpdateCustomFont}
              onUpdateTypographyScale={handleUpdateTypographyScale}
              onUpdateGeometry={handleUpdateGeometry}
              onResetToArchetype={handleSelectArchetypePreset}
            />

            <PreviewCanvas
              state={state}
              onEnableAllChannels={handleEnableAllChannels}
            />
          </div>
        </div>
      )}

      <MarkdownModal
        state={state}
        isOpen={isMarkdownModalOpen}
        onClose={() => setIsMarkdownModalOpen(false)}
        onDownload={handleDownloadMarkdown}
      />
    </div>
  );
}
