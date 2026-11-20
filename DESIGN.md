# DESIGN.md: DesignMD Studio — Host Application Design System Tokens & Foundations

This document is the single source of truth for the **DesignMD Studio** host application interface tokens, OKLCH color coordinates, fluid typography scales, 4px spatial grid, and accessibility rules.

---

## 🎨 1. Color Tokens (OKLCH Perceptual Space)

All host UI surfaces and controls use decomposed OKLCH coordinates (`L C H`) so alpha channels can be composed natively via `oklch(var(--token-raw) / <alpha>)`.

### 1.1 Primitive Tokens
| Token Name | OKLCH Coordinate String | Approximate Hex | Role |
| :--- | :--- | :--- | :--- |
| `--studio-slate-50-raw` | `0.98 0.005 260` | `#F8FAFC` | Light mode app canvas |
| `--studio-slate-100-raw` | `0.94 0.008 260` | `#EEF2F6` | Subtle panel background & dividers |
| `--studio-slate-200-raw` | `0.88 0.012 260` | `#E2E8F0` | Structural borders |
| `--studio-slate-700-raw` | `0.36 0.022 260` | `#334155` | Secondary muted text (WCAG AA > 7:1 on light) |
| `--studio-slate-900-raw` | `0.16 0.025 260` | `#0F172A` | Primary ink & headings |
| `--studio-brand-600-raw` | `0.51 0.195 264` | `#4338CA` | Primary interactive studio brand accent |
| `--studio-brand-700-raw` | `0.44 0.185 264` | `#3730A3` | Hover state for primary interactive controls |
| `--studio-emerald-600-raw` | `0.58 0.165 152` | `#047857` | Accessible success validation |
| `--studio-amber-600-raw` | `0.62 0.160 68` | `#B45309` | Warning and safe-zone indicators |
| `--studio-rose-600-raw` | `0.55 0.210 18` | `#BE123C` | Error & destructive states |

### 1.2 Semantic Mapping
```css
:root {
  --color-bg-canvas: oklch(var(--studio-slate-50-raw));
  --color-bg-surface: oklch(1 0 0);
  --color-bg-elevated: oklch(var(--studio-slate-100-raw));
  --color-border-subtle: oklch(var(--studio-slate-200-raw));
  --color-text-primary: oklch(var(--studio-slate-900-raw));
  --color-text-muted: oklch(var(--studio-slate-700-raw));
  --color-brand-primary: oklch(var(--studio-brand-600-raw));
  --color-brand-hover: oklch(var(--studio-brand-700-raw));
  --color-status-success: oklch(var(--studio-emerald-600-raw));
  --color-status-warning: oklch(var(--studio-amber-600-raw));
  --color-status-error: oklch(var(--studio-rose-600-raw));
}
```

---

## 🔤 2. Fluid Typography Scales (`clamp()`)

- **Minimum Font Size Floor:** `0.75rem` (`12px`). No text element may render below `12px`.
- **Font Stack:** `'Plus Jakarta Sans', 'Inter', system-ui, sans-serif` for UI; `'JetBrains Mono', monospace` for token identifiers and code.

| Role | Token | Fluid `clamp()` Expression |
| :--- | :--- | :--- |
| **Display H1** | `--fs-h1` | `clamp(1.75rem, 1.35rem + 1.8vw, 2.75rem)` |
| **Section Title H2** | `--fs-h2` | `clamp(1.25rem, 1.08rem + 0.85vw, 1.75rem)` |
| **Panel Heading H3** | `--fs-h3` | `clamp(1.0rem, 0.95rem + 0.3vw, 1.2rem)` |
| **Body Default** | `--fs-body` | `clamp(0.875rem, 0.84rem + 0.15vw, 1.0rem)` |
| **Micro Label / Token** | `--fs-small` | `clamp(0.75rem, 0.72rem + 0.15vw, 0.875rem)` |

---

## 📐 3. Spatial Grid & Touch Targets

- **Base Unit:** `4px` (`0.25rem`) spatial grid rhythm (`--space-xs: 4px`, `--space-sm: 8px`, `--space-md: 16px`, `--space-lg: 24px`, `--space-xl: 32px`).
- **Hitbox Rule:** Every interactive control (`<button>`, `<a>`, checkbox label, tab trigger) must enforce a minimum touch target of `44×44px` (`min-h-[44px]`).
- **Iconography Rule (`lucide-react`):** Keep icons clean (`2px` stroke, `currentColor`) without enclosing non-interactive icons in background boxes. Only interactive buttons may have button surface backgrounds.
- **Reduced Motion:** Respect `@media (prefers-reduced-motion: reduce)` across all transitions.
