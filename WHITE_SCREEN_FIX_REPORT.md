# White Screen Fix Report — AIESEC in HSUHK Portal

Date: 2026-11-17

## 1. Symptom

Opening the site showed a blank white screen. No page content was rendered in development, and the production build failed entirely.

## 2. Root Cause

The Vite configuration file was misspelled:

- Existing file: `vite.copnfig.js` (typo: `copnfig`)

Because Vite only recognises `vite.config.js`, the configuration was never loaded. The project's entry HTML lives at `src/index.html`, but with no config, Vite defaulted its root to the project directory (`/`) and looked for `/index.html` there.

Result:

- `GET /` returned **HTTP 404** → blank white screen in the browser.
- `npm run build` failed with `Could not resolve entry module "index.html"`.

Secondary issues found during investigation:

- `public/assets/hsuhk-team-bg.jpg` was referenced by the hero CSS but did not exist (HTTP 404).
- WebGL context creation was unguarded, producing an uncaught `Error creating WebGL context.` on browsers/devices without WebGL support.

## 3. Fixes Applied

| # | Change | File |
|---|--------|------|
| 1 | Removed the misspelled `vite.copnfig.js` and created a correct `vite.config.js` with `root: 'src'` and `publicDir: '../public'` | `vite.config.js` |
| 2 | Updated asset URLs for the new Vite root: `/src/styles/global.css` → `/styles/global.css`, `/src/scripts/main.js` → `/scripts/main.js` | `src/index.html` |
| 3 | Generated the missing hero background image from the existing preview asset | `public/assets/hsuhk-team-bg.jpg` |
| 4 | Added a gradient fallback behind the hero background image | `src/styles/global.css` |
| 5 | Wrapped `THREE.WebGLRenderer` creation in `try/catch` so unsupported devices degrade gracefully instead of throwing an uncaught error | `src/scripts/flight3D.js` |

## 4. Proof of Fix

### 4.1 Before — dev server root returned 404

```text
$ curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5173/
404

$ npm run build
error during build:
Could not resolve entry module "index.html".
```

### 4.2 After — all routes and assets return 200

```text
$ curl ... http://127.0.0.1:5173/

/                                  200
/styles/global.css                 200
/scripts/main.js                   200
/scripts/flight3D.js               200
/models/airplane.glb               200
/models/hsuhk_campus_mesh.glb      200
/assets/hsuhk-team-bg.jpg          200
```

### 4.3 Production build succeeds

```text
$ npm run build
vite v5.4.21 building for production...
✓ 13 modules transformed.
✓ built in 615ms
```

Output: `dist/index.html`, `dist/assets/index-*.css`, `dist/assets/index-*.js`, plus copied public assets (models and hero image).

### 4.4 Real browser render (headless Chrome)

Rendered DOM contains the expected page content:

```text
AIESEC in HSUHK
Welcome To
Find your global runway
Explore overseas opportunities
Build your future with AIESEC
```

No uncaught JavaScript errors. With software WebGL enabled (`--use-angle=swiftshader`), the Three.js scene initialised with zero console errors, confirming the 3D flight animation also works.

### 4.5 Production preview verified

```text
$ npm run preview
GET http://127.0.0.1:4173/ → 200
Page contains "AIESEC in HSUHK" and "Welcome To"
```

## 5. Status

**Fixed.** The site now loads correctly in both development and production, with all assets resolving and no runtime JavaScript errors.
