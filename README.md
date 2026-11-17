# AIESEC in HSUHK Website Prototype

Official local committee website for **AIESEC in The Hang Seng University of Hong Kong** 

A single-page site built around an immersive, scroll-driven "flight journey": a stylised aircraft takes off, cruises past global-exchange metrics, and lands on a runway marker — rendered live in 3D on a fixed canvas behind the page content.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture Notes](#architecture-notes)
- [Features](#features)
- [The 3D Scroll Journey](#the-3d-scroll-journey)
- [Design System](#design-system)
- [Assets](#assets)
- [Troubleshooting](#troubleshooting)
- [Scripts](#scripts)

---

## Tech Stack

- **[Vite](https://vite.dev/)** 5 — dev server and bundler
- **[Three.js](https://threejs.org/)** 0.169 — WebGL scene, GLTF models, and procedural geometry
- **[GSAP](https://gsap.com/)** + ScrollTrigger — scroll-scrubbed animation timeline
- **Vanilla HTML / CSS / JavaScript** (ES modules) — no framework, no preprocessor

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** (bundled with Node)
- A browser with WebGL support (the site degrades gracefully if WebGL is unavailable)

### Install and run

```bash
npm install
npm run dev
```

Vite prints the local dev URL (typically `http://localhost:5173`) in the terminal.

### Production build and preview

```bash
npm run build      # bundles into src/dist/
npm run preview    # serves the built site at http://localhost:4173
```

> **Note:** The build output lands in `src/dist/`, not a root-level `dist/`. This is because Vite's `root` is set to `src` and no `build.outDir` override is configured.

---

## Project Structure

```text
.
├── public/                        # Static assets (served from site root)
│   ├── assets/
│   │   └── hsuhk-team-bg.jpg      # Hero background photo
│   └── models/
│       ├── airplane.glb           # Stylised aircraft
│       └── a320_takeoff_scene.glb # End-journey runway / landing scene
├── src/
│   ├── index.html                 # Single-page document + section markup
│   ├── styles/
│   │   └── global.css             # Design tokens, layout, components, responsive rules
│   ├── scripts/
│   │   ├── main.js                # Entrypoint: boots the scene on DOMContentLoaded
│   │   └── flight3D.js            # Three.js scene + GSAP ScrollTrigger timeline
│   └── dist/                      # Generated build output (npm run build)
├── package.json
├── package-lock.json
├── vite.config.js
├── AGENTS.md                      # Design / development specification
└── WHITE_SCREEN_FIX_REPORT.md     # History of a past white-screen fix
```

---

## Architecture Notes

The Vite configuration is intentionally non-standard:

```js
export default defineConfig({
  root: 'src',
  publicDir: '../public'
});
```

- The application root is **`src/`**, so `index.html` lives there rather than at the project root.
- Static assets live in **`public/`** at the project root and are served from the site root.
- Because of this, all URLs in HTML/CSS/JS are **root-relative** (`/styles/global.css`, `/scripts/main.js`, `/models/airplane.glb`, `/assets/hsuhk-team-bg.jpg`). They resolve relative to `src/` during development and to the built output in production.

`src/main.js` imports `initFlightScene()` and calls it once the DOM is ready. All 3D logic is encapsulated in `flight3D.js`, which exports that single named function.

---

## Features

- **Fixed full-viewport 3D canvas** behind all content (`pointer-events: none` so scrolling and clicks pass through).
- **Responsive single-page layout** with a fixed global nav, full-height hero, three story panels, and supporting content sections.
- **Scroll-scrubbed aircraft animation** across three narrative stages.
- **Procedural star field and clouds** that drift continuously in the render loop.
- **Graceful degradation**:
  - WebGL context creation is wrapped in `try/catch`; the canvas is hidden on failure.
  - If a `.glb` model fails to load, procedural stand-in geometry is used instead.
  - A CSS gradient sits behind the hero image as a fallback.
- **Section reveal animations**: each story panel fades and slides into view as it enters the viewport.
- **Accessible, semantic markup**: `<main>`/`<section>` landmarks, hash-based navigation, and `aria-hidden` on the decorative canvas.

---

## The 3D Scroll Journey

A GSAP timeline is bound to `.scroll-story-wrapper` with `scrub: 1`, mapping scroll progress (0–100%) onto three stages:

| Scroll zone | Story state | Camera / aircraft motion |
| :--- | :--- | :--- |
| **0–30%** | Takeoff | Aircraft pitches up and climbs; camera pulls back and rises. |
| **30–70%** | Cruising & opportunities | Aircraft levels out and drifts laterally past clouds and metrics; camera tracks alongside. |
| **70–100%** | Landing | Aircraft noses down and descends; the runway marker scales up into frame as the camera re-centres. |

The page sections mirror these checkpoints:

1. **Hero** — "Welcome To / AIESEC in HSUHK" with a "Join Us!" CTA.
2. **01 / Takeoff** — "Find your global runway".
3. **02 / Cruising** — "Explore overseas opportunities" with a metrics grid.
4. **03 / Landing** — "Build your future with AIESEC".
5. **For Partners**, **Stories & Blog**, and **Contact** sections close the page.

---

## Design System

Brand tokens are defined as CSS custom properties in `src/styles/global.css`:

| Token | Value | Purpose |
| :--- | :--- | :--- |
| `--aiesec-blue` | `#0A8EA0` | Base brand cyan-blue |
| `--aiesec-bright-blue` | `#007DFF` | Navigation / accent blue |
| `--overlay-dark` | `rgba(0, 0, 0, 0.45)` | Hero photo tint |
| `--text-dark` | `#222222` | Body text on light surfaces |
| `--nav-height` | `70px` | Fixed navigation height |

Typography uses **Inter** (loaded from Google Fonts) with `clamp()`-scaled headings. Story cards use a translucent glassmorphic style with `backdrop-filter`. Layout adapts at 1100px, 860px, and 640px breakpoints.

---

## Assets

Assets served from `public/`:

| Asset | Approx. size | Notes |
| :--- | :--- | :--- |
| `hsuhk-team-bg.jpg` | 96 KB | Hero background |
| `airplane.glb` | 568 KB | Aircraft model |
| `a320_takeoff_scene.glb` | 692 KB | Landing scene; embedded `A320_Root` is hidden at runtime to avoid a duplicate aircraft |

The two 3D models total roughly **1.3 MB**, within the project's 3 MB asset budget.

Additional authoring/reference files kept at the project root (not shipped): `a320_takeoff_scene.blend`, preview PNGs, and the model reference picture.

---

## Troubleshooting

- **Blank white screen / build fails to find `index.html`:** Ensure the Vite config is named exactly `vite.config.js` (a past typo, `vite.copnfig.js`, caused this) and that `root: 'src'` / `publicDir: '../public'` are set. See `WHITE_SCREEN_FIX_REPORT.md` for the full history.
- **Hero image or models 404:** Asset URLs must be root-relative (e.g. `/assets/hsuhk-team-bg.jpg`), not `/src/...`.
- **No 3D scene on unsupported devices:** WebGL failures are caught and the canvas hidden; the page remains usable with its CSS gradient fallback and procedural geometry stand-ins.

---

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the Vite development server with hot reload. |
| `npm run build` | Build the production bundle into `src/dist/`. |
| `npm run preview` | Preview the production build locally. |
