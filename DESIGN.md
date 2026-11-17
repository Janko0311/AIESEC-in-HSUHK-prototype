# DESIGN.md — AIESEC in HSUHK Design System

This document is the single source of truth for visual consistency on the
**AIESEC in HSUHK** website. It records the colours, typography, spacing, and
component rules actually used in the codebase so every new change stays on-brand.

## 1. Source of truth

| Concern | Authoritative file |
| :--- | :--- |
| Colours, tokens, layout, components, breakpoints | `src/styles/global.css` (`:root`, lines 1–14 and all rules below) |
| 3D-only colours and materials | `src/scripts/flight3D.js` |
| Markup / class names | `src/index.html` |
| Intended brand direction (reference) | `AGENTS.md` |

> `src/dist/` contains generated build output. Never edit it or treat it as a
> design source — always change `src/styles/global.css` and rebuild.

## 2. Brand colour palette

### 2.1 Core brand colours (non-negotiable)

These are the AIESEC brand anchors. Do not alter their hex values.

| Token | Hex | Name | Where it is used |
| :--- | :--- | :--- | :--- |
| `--aiesec-blue` | `#0A8EA0` | Brand cyan-blue | Base brand colour; tail of fallback 3D aircraft. |
| `--aiesec-bright-blue` | `#007DFF` | Primary accent blue | Global nav background, CTA text + icon badge, 3D wing/marker. |
| `--pure-white` | `#FFFFFF` | White | Nav/brand/link text, hero text, CTA background, metric values. |

### 2.2 Neutral & surface colours

| Token | Value | Purpose |
| :--- | :--- | :--- |
| `--text-dark` | `#222222` | Body/heading text on light surfaces. |
| `--surface-light` | `#F5F9FF` | Background of light content sections. |
| `--text-muted` | `rgba(255, 255, 255, 0.82)` | Muted text on dark/photo surfaces (hero subtitle). |
| body background | `#0A1020` | Page/dark background behind the transparent hero and panels. |

### 2.3 Overlays

| Token | Value | Purpose |
| :--- | :--- | :--- |
| `--overlay-deep` | `rgba(0, 0, 0, 0.60)` | **Actual** hero photo tint (`.hero-container::before`). |
| `--overlay-dark` | `rgba(0, 0, 0, 0.45)` | Spec'd hero tint from `AGENTS.md`; currently **unused** in CSS. |

### 2.4 Glass / translucent surfaces (hardcoded rgba)

Used for the glassmorphic story cards and metrics laid over the 3D canvas:

| Value | Usage |
| :--- | :--- |
| `rgba(10, 16, 32, 0.42)` | `.panel-content` card background |
| `rgba(255, 255, 255, 0.12)` | Card border, `.panel-label` opacity |
| `rgba(255, 255, 255, 0.14)` | `.metric-card` border |
| `rgba(255, 255, 255, 0.08)` | `.metric-card` background |
| `rgba(255, 255, 255, 0.86)` | Card body copy |
| `rgba(255, 255, 255, 0.75)` | `.metric-card span`, `.panel-label` |
| `rgba(255, 255, 255, 0.45)` | `.secondary-link` underline |

### 2.5 Shadows

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--shadow-card` | `0 16px 40px rgba(0, 0, 0, 0.12)` | `.panel-content` |
| `--shadow-soft` | `0 8px 30px rgba(0, 0, 0, 0.15)` | Reserved; unused |
| nav shadow | `0 6px 16px rgba(0, 0, 0, 0.12)` | `.global-nav` |
| CTA shadow | `0 4px 15px rgba(0, 0, 0, 0.15)` → hover `0 6px 20px rgba(0, 0, 0, 0.2)` | `.cta-pill-button` |

### 2.6 3D scene colours (`flight3D.js`)

| Hex | Usage |
| :--- | :--- |
| `#FFFFFF` | Ambient/key light, stars, clouds |
| `#66CCFF` | Rim light (sky blue) |
| `#E8EEFC` | Fallback aircraft fuselage |
| `#007DFF` | Fallback aircraft wing + landing marker cone |
| `#0A8EA0` | Fallback aircraft tail |
| `#16375C` | Landing marker base |
| `#51B8FF` | Landing marker ring |

Renderer uses `THREE.SRGBColorSpace` — keep colour management on so these hex
values render as expected.

### 2.7 Colour rules

- **Always use tokens** for brand colours in CSS: `var(--aiesec-blue)`,
  `var(--aiesec-bright-blue)`, `var(--pure-white)`. Never paste a raw hex for
  these three values.
- In JS, keep numeric hex equivalents in sync with the CSS tokens
  (`0x0a8ea0` ↔ `#0A8EA0`, `0x007dff` ↔ `#007DFF`).
- White text belongs **only** on dark/photo/blue surfaces; `#222222` belongs
  **only** on light surfaces. Never mix.
- Do not introduce new accent hues. Sky blues (`#66CCFF`, `#51B8FF`) are
  reserved for 3D lighting/markers, not UI chrome.

## 3. Typography

- **Family:** `Inter` only, loaded from Google Fonts (weights 400, 500, 600,
  700, 800, 900) in `src/index.html`; `font-family: 'Inter', sans-serif` on
  `body`. No other font family is used.
- **Headings:** `font-weight: 900`, `text-transform: uppercase` for hero;
  section headings `font-weight: 900` via `h2` default.
- **Scale (fluid, via `clamp()`):**

| Element | Size |
| :--- | :--- |
| `.hero-title` | `clamp(3rem, 8vw, 6.5rem)`, letter-spacing `-2px`, line-height `0.95` |
| `.hero-kicker` | `clamp(1rem, 2vw, 2rem)`, weight 700, uppercase |
| `.hero-subtitle` | `clamp(1.1rem, 2vw, 2rem)`, `--text-muted` |
| `.panel-content h2`, `.content-shell h2` | `clamp(2rem, 5vw, 4rem)`, line-height 1 |
| body copy / `.panel-content p` | `1.05rem`, line-height 1.7 |
| `.nav-item` | `0.95rem`, weight 500 |
| `.brand` | `2rem`, weight 900, letter-spacing -1px |
| `.panel-label` | `0.8rem`, uppercase, letter-spacing `0.18em` |

- At `max-width: 640px`, hero letter-spacing reduces to `-1px`.

## 4. Layout tokens

| Token | Value | Purpose |
| :--- | :--- | :--- |
| `--nav-height` | `70px` | Fixed nav height + hero top padding |
| `--container` | `min(1180px, calc(100% - 3rem))` | Max width of content shells and story cards |

- Sections are full-viewport (`min-height: 100vh`) with `.scroll-story-wrapper`
  at `z-index: 1`, fixed canvas at `z-index: 0`, nav at `z-index: 1000`, and
  light content sections at `z-index: 2`.
- Cards: `border-radius: 24px` (20px on mobile), `padding: 2rem`
  (1.4rem on mobile), `max-width: 620px`.
- Metrics grid: 3 columns, `gap: 1rem`, single column below 860px.

## 5. Component rules

| Component | Required styling |
| :--- | :--- |
| `.global-nav` | `--aiesec-bright-blue` bg, white text, 70px tall, `padding: 0 2rem`, `z-index: 1000` |
| `.brand` | White, 2rem, weight 900 |
| `.nav-item` | White, 0.95rem, weight 500, opacity .96 → 1 on hover |
| `.hero-container` | `100vh`, `/assets/hsuhk-team-bg.jpg` cover, `--overlay-deep` tint via `::before` |
| `.cta-pill-button` | White bg, `--aiesec-bright-blue` text, pill radius 999px, weight 800, lift on hover |
| `.cta-icon` | `--aiesec-bright-blue` circle with white glyph |
| `.panel-content` | Dark glass card (rgba(10,16,32,.42) + blur 8px), white text, `--shadow-card` |
| `.metric-card` | White 8% bg, white 14% border, 18px radius |
| `.secondary-link` | White text, 2px white/45% underline |
| `.content-section` | `--surface-light` bg, `--text-dark` text, `padding: 6rem 0` |

## 6. Responsive breakpoints

| Width | Changes |
| :--- | :--- |
| ≤ 1100px | Nav padding 1rem, link gap 1rem, nav font 0.88rem |
| ≤ 860px | Nav scrolls horizontally, brand 1.5rem, metrics single column, panels stretch full width |
| ≤ 640px | Hero letter-spacing -1px, card padding 1.4rem / radius 20px |

## 7. Consistency checklist before merging

- [ ] Brand hex values unchanged (`#0A8EA0`, `#007DFF`, `#FFFFFF`).
- [ ] Brand colours referenced via CSS variables, not raw hex.
- [ ] JS numeric colours still match CSS tokens.
- [ ] New text passes contrast: white on dark/blue, `#222222` on light.
- [ ] No new font families or accent colours introduced.
- [ ] Build regenerated (`npm run build`) and checked at 1100/860/640px.

## 8. Known documentation discrepancies

These are tracked here so they are not mistaken for intentional design decisions:

1. `AGENTS.md` / `README.md` describe `--overlay-dark` (`rgba(0,0,0,.45)`) as the
   hero tint, but the implementation uses `--overlay-deep` (`rgba(0,0,0,.6)`).
   **Implementation wins until the spec is deliberately updated.**
2. `--aiesec-blue`, `--overlay-dark`, and `--shadow-soft` are defined but unused
   in CSS. Keep them — they are reserved brand tokens.
3. `README.md` claims a CSS gradient fallback behind the hero image; none
   exists. The real fallback is the dark `#0A1020` body background plus overlay.
4. `README.md` asset sizes are stale; actual files are larger (~298 KB hero,
   ~578 KB + ~705 KB models, ~1.3 MB total — still within the 3 MB budget).
5. `WHITE_SCREEN_FIX_REPORT.md` references `hsuhk_campus_mesh.glb`; the actual
   landing asset is `a320_takeoff_scene.glb`.
