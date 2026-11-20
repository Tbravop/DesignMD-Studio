# DesignMD Studio — Visual No-Code Compiler for Google Stitch `DESIGN.md`

**DesignMD Studio** es una aplicación web **100% client-side** (`$0` de costo de operación, sin dependencias de APIs de IA pagas ni servidores externos) diseñada para generar, auditar, previsualizar en tiempo real a `60fps` y compilar archivos `DESIGN.md` alineados con la especificación abierta de **Google Stitch**, junto con plantillas multi-canal reactivas listas para producción.

---

## ✨ Características Principales

### 1. Hub de Ingesta Determinista (4 Puntos de Partida)
- **Crear desde Cero (Wizard de 3 pasos):**
  1. Selección de nombre del proyecto y uno de los **6 Arquetipos Estéticos** preconfigurados (*Minimalismo Editorial*, *Neo-Brutalismo Digital*, *Glassmorphism / Espacial*, *Futurismo Técnico / HUD*, *Maximalismo Expresivo*, *Retro / Neo-Analógico*).
  2. Selector de color semilla (`HEX`) y **6 reglas de armonía cromática** (*Monocromático*, *Análogo*, *Complementario*, *Complementario Dividido*, *Triádico*, *Tetrádico*).
  3. Selección de polaridad de luminancia (*Modo Claro* / *Modo Oscuro*) con cálculo automático de contraste accesible WCAG 2.1.
- **Desde una Imagen (`<canvas>` HTML5 K-Means):**
  - Arrastra o sube cualquier imagen `PNG` / `JPG` / `WebP` (o utiliza los lienzos generativos de prueba integrados).
  - Un algoritmo determinista de cuantización / clustering **K-Means** en TypeScript muestrea los píxeles en un `<canvas>` oculto y asigna automáticamente los clusters por luminancia relativa a `--bg-canvas`, `--text-primary` y `--brand-primary`.
- **Desde una URL o Bloque CSS Crudo (Regex Parser):**
  - Analiza bloques CSS o URLs mediante expresiones regulares para detectar las familias tipográficas (`font-family`), radios (`border-radius`) y colores hexadecimales más frecuentes.
- **Cargar `DESIGN.md` Existente:**
  - Importa o pega cualquier archivo `.md` existente para reconstruir sus tokens y editarlos visualmente en el estudio.

### 2. Estudio Live No-Code (Previsualización Multi-Canal a 60fps)
- **Barra Superior:** Edición en vivo del nombre del sistema, selectores para activar/desactivar canales en el lienzo, visor modal con copiado rápido al portapapeles y descarga directa de `DESIGN.md` vía `Blob` y `URL.createObjectURL`.
- **Panel Izquierdo de Controles Visuales (3 Pestañas):**
  - **Colores:** Selector de semilla, selector de armonía (incluyendo vista comparativa `All`), switch Claro/Oscuro y 8 swatches semánticos editables individualmente con insignia de contraste WCAG en tiempo real.
  - **Tipografía:** 6 pares curados de **Google Fonts** cargados dinámicamente en `<head>`, edición directa de familias CSS (`--font-heading`, `--font-body`, `--font-mono`) y selector de escala modular (*Compacta 1.125*, *Equilibrada 1.250*, *Expresiva 1.333*).
  - **Geometría y Aire:** Sliders en tiempo real para `--radius` (`0px` a `24px`), `--border-width` (`0px` a `3px`), estilo de elevación (`none`, `hard`, `soft`, `glass`) y densidad espacial (`compact`, `comfortable`, `spacious`).
- **4 Plantillas Multi-Canal 100% Reactivas a Variables CSS:**
  1. **Landing Page Web:** Navbar + Hero con jerarquía display + grilla de 3 Feature Cards con iconografía `lucide-react` limpia + bloque CTA.
  2. **Dashboard Analítico:** 3 tarjetas KPI con `tabular-nums` + gráfico de barras en CSS puro + tabla técnica de telemetría.
  3. **Social Media Post / Carrusel (`1:1`):** Pieza cuadrada `1080×1080` escalada con numeración de slide, titular de impacto y bloque de token activo.
  4. **Broadcast / Streaming Overlay (`16:9`):** Overlay de transmisión en vivo con lower-third y **reserva inferior obligatoria del 12.5%** libre de gráficos estáticos para subtítulos automáticos en vivo (*Closed Captions Safe Zone*).

### 3. Compilador Determinista `DESIGN.md`
Genera un contrato declarativo estructurado con:
1. Frontmatter YAML (`name`, `spec: "google-stitch-design-md/v1.0"`, `archetype`, `harmony`, `mode`, `base_unit: 8px`).
2. `# 1. Design Rationale & Atmosphere`
3. `# 2. Color Tokens & Semantic Roles` (HEX, aproximación perceptual OKLCH, contrastes WCAG y bloque `:root`)
4. `# 3. Typography & Hierarchy`
5. `# 4. Geometry, Elevation & Channel Rules`
6. `# 5. Anti-Patterns`

---

## 🚀 Cómo Utilizar el Proyecto

El proyecto soporta **dos modos de ejecución**: con **Node.js / Vite** o directamente mediante **cualquier servidor estático** (como Python `http.server`) gracias a su cargador de módulos TypeScript integrado en `index.html`.

### Opción A: Ejecución Instantánea con Python (Sin instalar dependencias)

Si tienes Python 3 instalado, puedes levantar el estudio inmediatamente desde la raíz del proyecto:

```bash
python -m http.server 5173 --bind 127.0.0.1
```

Luego abre en tu navegador:
- **http://localhost:5173**

### Opción B: Ejecución con Node.js y Vite

Si utilizas Node.js (`v18+`):

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo Vite
npm run dev

# 3. Compilar para producción
npm run build
```

---

## 📂 Estructura del Proyecto

```text
├── DESIGN.md                                  # Tokens OKLCH y reglas del sistema anfitrión
├── index.html                                 # Punto de entrada Vite + cargador estático TS/TSX
├── package.json                               # Configuración de scripts y dependencias
├── tailwind.config.js                         # Mapeo de tokens OKLCH y escalas tipográficas
├── vite.config.ts                             # Configuración de Vite + React
└── src/
    ├── App.tsx                                # Orquestador principal (Hub <-> Estudio Live)
    ├── main.tsx                               # Montaje en el DOM de React 18
    ├── index.css                              # Variables primitivas OKLCH, clamp() y a11y
    ├── data/
    │   └── archetypes.ts                      # 6 arquetipos, 4 canales y escalas tipográficas
    ├── utils/
    │   ├── colorEngine.ts                     # Conversión HEX/HSL, luminancia WCAG y armonías
    │   ├── extractors.ts                      # K-Means en <canvas>, parser Regex CSS/URL y MD
    │   └── markdownCompiler.ts                # Compilador determinista de DESIGN.md y descarga Blob
    └── components/
        ├── hub/
        │   └── IngestionHub.tsx               # Vista 1: Hub de Ingesta (4 modos + canales)
        └── studio/
            ├── StudioHeader.tsx               # Barra superior y toggles de canales en vivo
            ├── StudioSidebar.tsx              # Panel izquierdo No-Code (Colores, Fuentes, Geometría)
            ├── PreviewCanvas.tsx              # Lienzo central con inyección de variables CSS a 60fps
            ├── MarkdownModal.tsx              # Visor modal y copiador del DESIGN.md compilado
            └── templates/
                ├── WebLandingTemplate.tsx     # Canal 01: Landing Page Web
                ├── DashboardTemplate.tsx      # Canal 02: Dashboard Analítico
                ├── SocialPostTemplate.tsx     # Canal 03: Social Media Post 1:1 (1080x1080)
                └── BroadcastOverlayTemplate.tsx # Canal 04: Broadcast 16:9 (12.5% CC Safe Area)
```

---

## 🛠️ Flujo de Trabajo Recomendado

1. **Selecciona tu punto de partida en el Hub de Ingesta:**
   - Usa el **Wizard** si deseas partir de un arquetipo curado, o usa **Desde una Imagen**, **URL/CSS** o **Cargar `DESIGN.md`** para extraer tokens de un activo existente.
2. **Elige los canales destino:**
   - Marca las plantillas que deseas auditar simultáneamente (*Landing Page Web*, *Dashboard Analítico*, *Social Media 1:1*, *Broadcast 16:9*).
3. **Ajusta en el Estudio Live No-Code:**
   - Modifica el color semilla, cambia la regla de armonía cromática, alterna entre modo claro/oscuro o afina cada token individualmente verificando su insignia de contraste WCAG (`>= 4.5:1`).
   - Prueba distintas combinaciones de Google Fonts, radios de borde (`0px` a `24px`), grosores (`0px` a `3px`), sombras y densidad espacial.
4. **Exporta tu `DESIGN.md`:**
   - Haz clic en **"Ver/Copiar `DESIGN.md`"** para inspeccionar el documento compilado o en **"Descargar `DESIGN.md`"** para guardarlo e integrarlo en la raíz de tu repositorio frontend.
