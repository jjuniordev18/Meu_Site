# AGENTS.md

Project-level instructions for AI coding agents.

## Project Overview

A personal portfolio SPA for Josué Gomes — Telecom & Software Engineering. Built as
vanilla HTML/CSS/JavaScript, deployed to GitHub Pages. No build step, no framework.

## Stack

- **HTML** — semantic, WCAG 2.1 AA compliant
- **CSS** — custom design system with OKLCH color tokens, 4pt spacing scale, CSS
  variables for theming (dark/light via `data-theme` attribute)
- **JS** — vanilla ES6+ inside an IIFE, `"use strict"` mode, no transpilation
- **Dependencies** — GSAP 3.12.5 (CDN, lazy-loaded for hover-capable devices only),
  web-vitals 4.0.0 (CDN, for Core Web Vitals reporting to GA4)
- **Analytics** — Google Analytics 4 (gtag.js)
- **PWA** — service worker (sw.js) for offline caching, Web App Manifest (manifest.json)

## Architecture Decisions

1. **No framework** — Chose vanilla JS to minimize bundle size and maximize
   performance on low-end devices. State is minimal (theme preference in localStorage).
2. **Lazy-load GSAP** — Animation library (~80KB) loaded dynamically only on
   hover-capable devices. Touch-only/mobile users never download it.
3. **Lazy background images** — Section backgrounds (`data-bg`) load via
   `IntersectionObserver` with 500px root margin.
4. **Reduced motion respected** — All non-essential animations disabled when
   `prefers-reduced-motion: reduce`. The custom cursor effect is the sole exception
   (user's conscious design choice for an animated showcase).
5. **WebP images** — All raster images use WebP format. Consider AVIF as a next
   optimization for ~30% smaller payloads.

## File Structure

```
/
├── index.html        # Single-page app: hero, about, skills, timeline, projects, contact
├── style.css         # ~2100 lines, custom design system (OKLCH tokens, 4pt scale)
├── script.js         # ~530 lines, IIFE with: theme, nav, reveal, scrollspy, etc.
├── sw.js             # Service worker: cache-first for assets, stale-while-revalidate
├── manifest.json     # PWA manifest: standalone display, dark theme color
├── 404.html          # 404 page (same structure as index.html minus JS)
├── curriculo.pdf     # Downloadable CV (64KB)
├── robots.txt        # Allows all, points to sitemap
├── sitemap.xml       # Single-page sitemap
└── img/              # All assets: WebP backgrounds, icons, profile photo, OG image
```

## Code Conventions

- **JavaScript** — IIFE pattern `(function() { "use strict"; ... })();`, ES6+,
  `var` declarations (pre-ES6 style for broad compatibility), feature-detect
  before use (`IntersectionObserver` in window, `navigator.clipboard`),
  event delegation, passive event listeners for scroll/resize.
- **CSS** — CSS Custom Properties for all values (colors, spacing, typography,
  motion durations), BEM-style class naming, `oklch()` color space, `clamp()`
  for fluid typography, `@media (prefers-reduced-motion)` support, `content-visibility`
  consideration for sections.
- **HTML** — Semantic elements (`<header>`, `<main>`, `<section>`, `<footer>`),
  `aria-*` attributes on interactive elements, `alt` text on all images,
  `loading="lazy"` and `decoding="async"` on off-screen images, `fetchpriority="high"`
  on hero image.

## Quality Gates

Before any change, run:

1. **Lighthouse** (Chrome DevTools or `lhci autorun`):
   - Performance ≥ 90
   - Accessibility ≥ 95
   - Best Practices ≥ 90
   - SEO ≥ 90

2. **Manual checks**:
   - Theme toggle persists across reload (localStorage)
   - Mobile nav: opens/closes, focus trap, Escape closes
   - Reduced motion: disables animations (except cursor effect)
   - All sections visible at: 320px, 768px, 1024px, 1440px
   - Tab navigation: all interactive elements reachable, no traps
   - Copy email button: works, shows confirmation state

3. **Service worker** — verify offline mode still works after asset changes

## Conventions for Agents

- **Do not** add frameworks, build tools, or npm dependencies
- **Do not** change image formats or sources without maintaining WebP
- **Do** respect the existing IIFE structure and coding style in script.js
- **Do** use CSS variables for new colors/sizes — never raw values
- **When adding animations** — guard behind `finePointer` and `!reduceMotion`
- **When adding scripts** — lazy-load non-critical scripts, add to CSP allowlist

## Key Variables & Selectors (CSS)

- Theme: `html[data-theme="light"]` overrides `:root` dark-mode variables
- Fine pointer: `html.has-cursor` class added when `pointer: fine` and `hover` match
- Scroll progress: `.scroll-progress` element, `--p` custom property
