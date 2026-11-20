import type { GeneratedPalette, HarmonyRule } from '../utils/colorEngine';

export interface ArchetypePreset {
  id: string;
  label: string;
  description: string;
  defaultSeed: string;
  defaultHarmony: HarmonyRule;
  defaultDark: boolean;
  fonts: {
    heading: string;
    body: string;
    mono: string;
    googleFontsUrl: string;
  };
  geometry: {
    borderRadius: number;
    borderWidth: number;
    shadowStyle: 'none' | 'hard' | 'soft' | 'glass';
    density: 'compact' | 'comfortable' | 'spacious';
  };
  rationale: string;
  antiPatterns: string[];
}

export type ChannelId =
  | 'web-landing'
  | 'dashboard'
  | 'social-post'
  | 'broadcast-overlay';

export interface ChannelDefinition {
  id: ChannelId;
  label: string;
  shortLabel: string;
  badge: string;
  description: string;
  ruleSummary: string;
}

export type TypographyScaleId = 'compact' | 'balanced' | 'expressive';

export interface TypographyScalePreset {
  id: TypographyScaleId;
  label: string;
  ratio: number;
  ratioLabel: string;
  description: string;
  h1Size: string;
  h2Size: string;
  h3Size: string;
  bodySize: string;
}

export interface DesignSystemState {
  projectName: string;
  archetypeId: string;
  seedColor: string;
  harmony: HarmonyRule;
  isDark: boolean;
  palette: GeneratedPalette;
  fonts: {
    presetId: string;
    heading: string;
    body: string;
    mono: string;
    googleFontsUrl: string;
    scale: TypographyScaleId;
  };
  geometry: {
    borderRadius: number;
    borderWidth: number;
    shadowStyle: 'none' | 'hard' | 'soft' | 'glass';
    density: 'compact' | 'comfortable' | 'spacious';
  };
  activeChannels: ChannelId[];
}

export const ARCHETYPES: Record<string, ArchetypePreset> = {
  minimalist: {
    id: 'minimalist',
    label: 'Minimalismo Editorial',
    description: 'Retículas limpias, alto contraste tipográfico y mucho aire visual.',
    defaultSeed: '#2563EB',
    defaultHarmony: 'monochromatic',
    defaultDark: false,
    fonts: {
      heading: 'Plus Jakarta Sans',
      body: 'Inter',
      mono: 'JetBrains Mono',
      googleFontsUrl:
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@600;700&display=swap',
    },
    geometry: {
      borderRadius: 8,
      borderWidth: 1,
      shadowStyle: 'none',
      density: 'spacious',
    },
    rationale:
      'Sistema editorial de alta legibilidad que prioriza la jerarquía tipográfica y el espacio negativo por encima de la ornamentación.',
    antiPatterns: [
      'NO utilizar sombras paralelas difusas ni efectos 3D.',
      'NO mezclar más de dos familias tipográficas en la misma vista.',
      'NO encerrar iconos sueltos dentro de contenedores con fondo si no son botones interactivos.',
    ],
  },
  brutalist: {
    id: 'brutalist',
    label: 'Neo-Brutalismo Digital',
    description: 'Bordes negros marcados, sombras duras sin difuminar y estética directa.',
    defaultSeed: '#EA580C',
    defaultHarmony: 'complementary',
    defaultDark: false,
    fonts: {
      heading: 'Space Grotesk',
      body: 'Work Sans',
      mono: 'Space Mono',
      googleFontsUrl:
        'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Space+Mono:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap',
    },
    geometry: {
      borderRadius: 0,
      borderWidth: 2,
      shadowStyle: 'hard',
      density: 'comfortable',
    },
    rationale:
      'Estética cruda y funcionalista basada en estructuras explícitas, trazos de alto contraste (2px sólidos) y desplazamientos rígidos.',
    antiPatterns: [
      'NO redondear esquinas (mantener border-radius en 0px).',
      'NO aplicar desenfoques (blur) ni degradados suaves en superficies.',
      'NO usar colores pastel de bajo contraste para bordes estructurales.',
    ],
  },
  glassmorphism: {
    id: 'glassmorphism',
    label: 'Glassmorphism / Espacial',
    description: 'Superficies translúcidas, desenfoque de fondo y bordes sutiles iluminados.',
    defaultSeed: '#6366F1',
    defaultHarmony: 'analogous',
    defaultDark: true,
    fonts: {
      heading: 'Outfit',
      body: 'DM Sans',
      mono: 'Fira Code',
      googleFontsUrl:
        'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fira+Code:wght@400;500&family=Outfit:wght@600;700&display=swap',
    },
    geometry: {
      borderRadius: 16,
      borderWidth: 1,
      shadowStyle: 'glass',
      density: 'spacious',
    },
    rationale:
      'Arquitectura en capas que simula profundidad física mediante transparencias controladas, desenfoque gaussiano y reflejos de borde.',
    antiPatterns: [
      'NO colocar texto pequeño sobre fondos translúcidos sin verificar contraste mínimo 4.5:1.',
      'NO apilar más de dos niveles de tarjetas translúcidas una encima de otra.',
      'NO usar bordes opacos gruesos que rompan la ligereza del cristal.',
    ],
  },
  futuristic: {
    id: 'futuristic',
    label: 'Futurismo Técnico / HUD',
    description:
      'Estética de telemetría, fondos profundos, acentos eléctricos y datos monoespaciados.',
    defaultSeed: '#06B6D4',
    defaultHarmony: 'split-complementary',
    defaultDark: true,
    fonts: {
      heading: 'Chakra Petch',
      body: 'IBM Plex Sans',
      mono: 'JetBrains Mono',
      googleFontsUrl:
        'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap',
    },
    geometry: {
      borderRadius: 4,
      borderWidth: 1,
      shadowStyle: 'none',
      density: 'compact',
    },
    rationale:
      'Interfaz inspirada en sistemas de telemetría e ingeniería aeroespacial, optimizada para densidad de datos y lectura rápida de métricas.',
    antiPatterns: [
      'NO usar fondos blancos puros (#FFFFFF) en áreas extensas.',
      'NO emplear bordes muy redondeados tipo píldora en contenedores de datos.',
      'NO saturar más del 15% del lienzo con el color de acento primario.',
    ],
  },
  maximalist: {
    id: 'maximalist',
    label: 'Maximalismo Expresivo',
    description: 'Tipografía display audaz, bloques cromáticos vibrantes y alto dinamismo.',
    defaultSeed: '#DB2777',
    defaultHarmony: 'triadic',
    defaultDark: false,
    fonts: {
      heading: 'Syne',
      body: 'Plus Jakarta Sans',
      mono: 'Space Mono',
      googleFontsUrl:
        'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=Space+Mono:wght@400&family=Syne:wght@700;800&display=swap',
    },
    geometry: {
      borderRadius: 20,
      borderWidth: 2,
      shadowStyle: 'soft',
      density: 'comfortable',
    },
    rationale:
      'Sistema de comunicación de alto impacto que utiliza contrastes cromáticos audaces y tipografía expresiva para capturar atención inmediata.',
    antiPatterns: [
      'NO usar jerarquías tipográficas tímidas; los títulos deben dominar el bloque.',
      'NO dejar grandes zonas neutras sin anclaje visual.',
      'NO comprometer la legibilidad del cuerpo de texto con fuentes decorativas.',
    ],
  },
  retro: {
    id: 'retro',
    label: 'Retro / Neo-Analógico',
    description: 'Calidez editorial, tonos papel/tinta, tipografías serif clásicas y ritmo pausado.',
    defaultSeed: '#B45309',
    defaultHarmony: 'analogous',
    defaultDark: false,
    fonts: {
      heading: 'Fraunces',
      body: 'Source Sans 3',
      mono: 'IBM Plex Mono',
      googleFontsUrl:
        'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400&family=Source+Sans+3:wght@400;600&display=swap',
    },
    geometry: {
      borderRadius: 6,
      borderWidth: 1,
      shadowStyle: 'soft',
      density: 'spacious',
    },
    rationale:
      'Evoca la autoridad de los medios impresos clásicos mediante superficies cálidas tipo papel, tintas profundas y serifas de alto carácter.',
    antiPatterns: [
      'NO utilizar colores neón o saturaciones digitales puras.',
      'NO usar negro puro (#000000) ni blanco puro (#FFFFFF); preferir tintas cálidas y papel crudo.',
      'NO comprimir excesivamente el interlineado de los párrafos.',
    ],
  },
};

export const CHANNELS: ChannelDefinition[] = [
  {
    id: 'web-landing',
    label: 'Landing Page Web',
    shortLabel: 'Web Hero',
    badge: 'Desktop / Responsive',
    description: 'Hero principal + grilla de 3 features con iconografía limpia + bloque CTA.',
    ruleSummary:
      'Contenedor fluido con jerarquía H1 display, límite de 65ch por línea y contraste AA en botones primarios.',
  },
  {
    id: 'dashboard',
    label: 'Dashboard Analítico',
    shortLabel: 'Dashboard UI',
    badge: 'Data App / SaaS',
    description: 'Tarjetas KPI con deltas + gráfico de barras CSS + tabla técnica de telemetría.',
    ruleSummary:
      'Alineación tabular-nums en métricas monoespaciadas, densidad controlada y codificación semántica de estados.',
  },
  {
    id: 'social-post',
    label: 'Social Media Post / Carrusel',
    shortLabel: 'Social 1:1',
    badge: '1080×1080 (1:1)',
    description: 'Pieza cuadrada 1:1 escalada con numeración de slide, titular de impacto y firma.',
    ruleSummary:
      'Margen perimetral seguro del 8% (86px en 1080×1080), máximo 3 niveles tipográficos y foco cromático directo.',
  },
  {
    id: 'broadcast-overlay',
    label: 'Broadcast / Streaming Overlay',
    shortLabel: 'Broadcast 16:9',
    badge: '16:9 Safe Zone',
    description:
      'Overlay 16:9 con marcador en vivo, lower-third y reserva inferior del 12.5% para subtítulos.',
    ruleSummary:
      'Reserva obligatoria del 12.5% inferior libre de gráficos estáticos para closed-captions / subtítulos en vivo.',
  },
];

export const TYPOGRAPHY_SCALES: Record<TypographyScaleId, TypographyScalePreset> = {
  compact: {
    id: 'compact',
    label: 'Compacta (1.125 — Segunda Mayor)',
    ratio: 1.125,
    ratioLabel: '1.125',
    description: 'Proporción contenida para interfaces de alta densidad y paneles de datos.',
    h1Size: '1.85rem',
    h2Size: '1.4rem',
    h3Size: '1.125rem',
    bodySize: '0.925rem',
  },
  balanced: {
    id: 'balanced',
    label: 'Equilibrada (1.250 — Tercera Mayor)',
    ratio: 1.25,
    ratioLabel: '1.250',
    description: 'Escala universal versátil para aplicaciones web, editorial y producto digital.',
    h1Size: '2.25rem',
    h2Size: '1.65rem',
    h3Size: '1.25rem',
    bodySize: '1rem',
  },
  expressive: {
    id: 'expressive',
    label: 'Expresiva (1.333 — Cuarta Justa)',
    ratio: 1.333,
    ratioLabel: '1.333',
    description: 'Contraste dramático entre titulares display y cuerpo de lectura.',
    h1Size: '2.65rem',
    h2Size: '1.85rem',
    h3Size: '1.35rem',
    bodySize: '1.025rem',
  },
};
