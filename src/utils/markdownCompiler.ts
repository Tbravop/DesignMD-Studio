import {
  ARCHETYPES,
  CHANNELS,
  TYPOGRAPHY_SCALES,
  type DesignSystemState,
} from '../data/archetypes';
import {
  HARMONY_LABELS,
  getContrastRatio,
  hexToApproxOklch,
} from './colorEngine';

export function resolveShadowCss(
  shadowStyle: DesignSystemState['geometry']['shadowStyle'],
  borderColor: string,
  textPrimary: string,
  isDark: boolean
): string {
  switch (shadowStyle) {
    case 'none':
      return 'none';
    case 'hard':
      return `4px 4px 0px 0px ${isDark ? borderColor : textPrimary}`;
    case 'soft':
      return isDark
        ? '0 12px 28px -6px rgba(0, 0, 0, 0.55)'
        : '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04)';
    case 'glass':
      return isDark
        ? '0 16px 36px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.14)'
        : '0 16px 36px -8px rgba(15, 23, 42, 0.10), inset 0 1px 0 0 rgba(255, 255, 255, 0.7)';
  }
}

export function compileDesignMarkdown(state: DesignSystemState): string {
  const archetype = ARCHETYPES[state.archetypeId] || ARCHETYPES.minimalist;
  const harmonyInfo = HARMONY_LABELS[state.harmony] || HARMONY_LABELS.analogous;
  const scaleInfo = TYPOGRAPHY_SCALES[state.fonts.scale] || TYPOGRAPHY_SCALES.balanced;
  const modeLabel = state.isDark ? 'dark' : 'light';
  const shadowCss = resolveShadowCss(
    state.geometry.shadowStyle,
    state.palette.borderColor,
    state.palette.textPrimary,
    state.isDark
  );

  const densityMap = {
    compact: {
      label: 'Compacto (Alta Densidad Técnica)',
      cardPadding: '16px (2 unidades base)',
      gridGap: '12px (1.5 unidades base)',
      sectionGap: '24px (3 unidades base)',
    },
    comfortable: {
      label: 'Cómodo (Equilibrio SaaS / Producto)',
      cardPadding: '24px (3 unidades base)',
      gridGap: '16px (2 unidades base)',
      sectionGap: '32px (4 unidades base)',
    },
    spacious: {
      label: 'Amplio (Respiración Editorial)',
      cardPadding: '32px (4 unidades base)',
      gridGap: '24px (3 unidades base)',
      sectionGap: '48px (6 unidades base)',
    },
  }[state.geometry.density];

  const textContrast = getContrastRatio(state.palette.bgCanvas, state.palette.textPrimary);
  const surfaceContrast = getContrastRatio(state.palette.bgSurface, state.palette.textPrimary);
  const brandButtonContrast = getContrastRatio(
    state.palette.brandPrimary,
    state.palette.brandText
  );

  const selectedChannelRules = CHANNELS.filter((ch) =>
    state.activeChannels.includes(ch.id)
  );

  const channelSectionLines =
    selectedChannelRules.length > 0
      ? selectedChannelRules
          .map(
            (ch) =>
              `- **${ch.label} (\`${ch.id}\` — ${ch.badge}):** ${ch.ruleSummary}`
          )
          .join('\n')
      : '- **Omnicanal Estándar:** Aplicar variables semánticas sin valores hexadecimales estáticos.';

  const antiPatternLines = archetype.antiPatterns
    .map((rule) => `- ${rule}`)
    .join('\n');

  return `---
name: "${state.projectName}"
spec: "google-stitch-design-md/v1.0"
archetype: "${archetype.id}"
harmony: "${state.harmony}"
mode: "${modeLabel}"
base_unit: 8px
---

# 1. Design Rationale & Atmosphere

**${state.projectName}** adopta el arquetipo **${archetype.label}** en modo **${
    state.isDark ? 'Oscuro (Low-Luminance Canvas)' : 'Claro (High-Luminance Daylight)'
  }**. ${archetype.rationale}

- **Atmósfera Cromática:** Construida a partir de la semilla \`${
    state.seedColor
  }\` bajo una regla de armonía **${harmonyInfo.label}** (${
    harmonyInfo.angleSummary
  }), garantizando coherencia perceptual entre acentos interactivos y superficies neutras tintadas.
- **Ritmo Espacial:** Densidad configurada en modo **${
    densityMap.label
  }** sobre una unidad base estricta de \`8px\` (con sub-retícula de \`4px\` para micro-alineaciones y áreas táctiles mínimas de \`44x44px\`).

---

# 2. Color Tokens & Semantic Roles

Todos los componentes y plantillas multi-canal deben consumir exclusivamente las siguientes variables CSS semánticas. Queda prohibido inyectar valores hexadecimales estáticos fuera de \`:root\`.

| Token CSS | Valor HEX | Aproximación OKLCH | Rol Semántico y Regla de Uso |
| :--- | :--- | :--- | :--- |
| \`--bg-canvas\` | \`${state.palette.bgCanvas}\` | \`${hexToApproxOklch(state.palette.bgCanvas)}\` | Lienzo estructural de fondo general de la aplicación. |
| \`--bg-surface\` | \`${state.palette.bgSurface}\` | \`${hexToApproxOklch(state.palette.bgSurface)}\` | Tarjetas, paneles modulares, tablas y contenedores elevados. |
| \`--text-primary\` | \`${state.palette.textPrimary}\` | \`${hexToApproxOklch(state.palette.textPrimary)}\` | Titulares y cuerpo principal (Contraste sobre lienzo: **${textContrast}:1**, sobre superficie: **${surfaceContrast}:1**). |
| \`--text-secondary\` | \`${state.palette.textSecondary}\` | \`${hexToApproxOklch(state.palette.textSecondary)}\` | Subtítulos, metadatos, etiquetas de ejes y descripciones de apoyo. |
| \`--brand-primary\` | \`${state.palette.brandPrimary}\` | \`${hexToApproxOklch(state.palette.brandPrimary)}\` | Acciones primarias (CTAs), enlaces activos, indicadores clave y foco de teclado. |
| \`--brand-text\` | \`${state.palette.brandText}\` | \`${hexToApproxOklch(state.palette.brandText)}\` | Texto e iconografía sobre \`--brand-primary\` (Contraste verificado: **${brandButtonContrast}:1**). |
| \`--accent-secondary\` | \`${state.palette.accentSecondary}\` | \`${hexToApproxOklch(state.palette.accentSecondary)}\` | Series secundarias en visualización de datos, badges y realces complementarios. |
| \`--accent-tertiary\` | \`${state.palette.accentTertiary}\` | \`${hexToApproxOklch(state.palette.accentTertiary)}\` | Variación armónica terciaria para gráficos multi-serie y etiquetas de estado. |
| \`--border-color\` | \`${state.palette.borderColor}\` | \`${hexToApproxOklch(state.palette.borderColor)}\` | Líneas divisorias, contornos de tarjetas y bordes de controles de formulario. |

\`\`\`css
:root {
  --bg-canvas: ${state.palette.bgCanvas};
  --bg-surface: ${state.palette.bgSurface};
  --text-primary: ${state.palette.textPrimary};
  --text-secondary: ${state.palette.textSecondary};
  --brand-primary: ${state.palette.brandPrimary};
  --brand-text: ${state.palette.brandText};
  --accent-secondary: ${state.palette.accentSecondary};
  --accent-tertiary: ${state.palette.accentTertiary};
  --border-color: ${state.palette.borderColor};
}
\`\`\`

---

# 3. Typography & Hierarchy

- **Fuente de Titulares (\`--font-heading\`):** \`'${state.fonts.heading}', sans-serif\` (Pesos recomendados: \`600\`, \`700\`).
- **Fuente de Cuerpo (\`--font-body\`):** \`'${state.fonts.body}', sans-serif\` (Pesos recomendados: \`400\`, \`500\`, \`600\`).
- **Fuente Monoespaciada (\`--font-mono\`):** \`'${state.fonts.mono}', monospace\` (Uso obligatorio en KPIs numéricos con \`font-variant-numeric: tabular-nums\`, códigos, tokens y telemetría).
- **Escala Modular:** **${scaleInfo.label}** (Factor \`${scaleInfo.ratioLabel}\`).
- **Piso Tipográfico Accesible:** Ningún texto renderizado puede ser inferior a \`12px\` (\`0.75rem\`).
- **Importación Google Fonts:**
  \`${state.fonts.googleFontsUrl}\`

| Nivel Jerárquico | Proporción Base | Interlineado (\`line-height\`) | Tracking (\`letter-spacing\`) |
| :--- | :--- | :--- | :--- |
| **Display / Hero H1** | \`${scaleInfo.h1Size}\` | \`1.12\` | \`-0.025em\` |
| **Section Title H2** | \`${scaleInfo.h2Size}\` | \`1.20\` | \`-0.015em\` |
| **Component Heading H3** | \`${scaleInfo.h3Size}\` | \`1.30\` | \`-0.01em\` |
| **Body Copy** | \`${scaleInfo.bodySize}\` | \`1.60\` | \`0em\` |
| **Caption / Technical Mono** | \`0.75rem (12px min)\` | \`1.40\` | \`+0.04em\` |

---

# 4. Geometry, Elevation & Channel Rules

### 4.1 Parámetros Estructurales
- **Radio de Borde (\`--radius\`):** \`${state.geometry.borderRadius}px\`
- **Grosor de Borde (\`--border-width\`):** \`${state.geometry.borderWidth}px\` sólido \`var(--border-color)\`
- **Estilo de Elevación (\`--shadow\`):** \`${state.geometry.shadowStyle}\` → \`${shadowCss}\`
- **Densidad y Aire:**
  - Padding interno de tarjetas: \`${densityMap.cardPadding}\`
  - Separación entre celdas de grilla: \`${densityMap.gridGap}\`
  - Separación entre bloques de sección: \`${densityMap.sectionGap}\`

### 4.2 Reglas Específicas por Canal Activo
${channelSectionLines}
- **Regla de Oro Broadcast 16:9:** En toda pieza de streaming o video \`16:9\`, el **12.5% inferior del contenedor** debe permanecer libre de textos fijos, logotipos o tickers para evitar colisiones con los subtítulos automáticos en vivo (*Live Closed Captions*).

---

# 5. Anti-Patterns

${antiPatternLines}
- NO utilizar iconos decorativos encerrados en cajas con fondo coloreado a menos que representen botones interactivos reales con área táctil mínima de \`44x44px\`.
- NO omitir el estado \`:focus-visible\` ni la directiva \`@media (prefers-reduced-motion: reduce)\` en componentes interactivos.
`;
}

export function downloadDesignMarkdown(state: DesignSystemState): void {
  const markdownContent = compileDesignMarkdown(state);
  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeSlug = state.projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  link.href = url;
  link.download = safeSlug ? `${safeSlug}-DESIGN.md` : 'DESIGN.md';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
