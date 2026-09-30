---
discovered: 2026-09-30
cycle: 005
applicability: "Projects publishing the three-domain docs tree to GitHub Pages (Jekyll nativo) for a stakeholder audience"
---

# Jekyll stakeholder-grade docs UI (project pattern)

## Problem

The framework's `documentation-presentation.md` contract (diagrams-first, responsive, value-frame, scalable to many use cases) must be implemented on GitHub Pages with Jekyll nativo (no non-allowlisted plugins).

## Solution

A self-contained Jekyll layout system (no theme gem):

- `_layouts/`: `default.html` (shell), `home.html` (landing), `doc.html` (architecture/decisions/operations), `use-case.html` (the flagship template with the interactive ArchiMate diagram).
- `_includes/`: `head.html`, `header.html` (sticky), `footer.html`, `use-case-nav.html` (data-driven sidebar), `mermaid.html` (pinned CDN + onerror fallback).
- `assets/css/style.css`: light-clean tokens (`--bg #fbfcfa`, layer colors as CSS custom properties reused from the SVG generator), system font stack, mobile-first grid that collapses ≤768px.
- `assets/js/use-case.js`: layer tabs (viewer-controlled, no auto-advance), hover tooltips, click-to-cell scroll, `prefers-reduced-motion` guard.
- `_data/use_cases.yml`: registry driving nav + landing cards (scales to N use cases).
- `_data/docs.yml`: nav grouped by domain (mirrors MAP.md as presentation layer).
- ArchiMate SVG inlined via `{% include use-cases/<uc>.svg %}` from `gen-archimate.mjs --write-svg` (responsive `width="100%"` + `viewBox`; `data-layer`/`data-type`/`data-id`/`data-cell` for interactivity). No `<img src>` (avoids baseurl path 404).
- Mermaid via `mermaid@11.4.0` CDN `defer` + `onerror` fallback, included only when page frontmatter has `mermaid: true`.

## Example

SwarmTrader `docs/architecture/use-case-eni-replay.md` uses `layout: use-case`, `archimate_svg: eni-replay`, and a `value:` frontmatter block. The diagram, matrix, and nav are derived; the page adds prose and technical-depth links. See [ADR-004](../../../docs/decisions/ADR-004-stakeholder-docs-ui.md).

## Known limitations

- Jekyll-specific (Liquid, `_includes`); not portable to non-Jekyll sites. The universal contract lives in `software-house-ai/protocols/documentation-presentation.md`.
- Mermaid depends on a CDN at view time (graceful fallback to the code block).
- SVG interactivity requires JS (the SVG is legible without it; tabs/click do not).
- The layout/CSS/JS is a maintenance surface owned by the project.
