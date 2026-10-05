---
title: "Documentation Map"
layout: doc
last_verified: 2026-10-05
---

# Documentation Map

last_verified: 2026-10-05

| File | Domain | One-line topic | Last verified |
|------|--------|----------------|--------------|
| architecture/simulator-overview.md | architecture | Browser simulator components, data flow, and replay state | 2026-09-30 |
| architecture/use-case-eni-replay.md | architecture | ENI replay use case; interactive ArchiMate diagram and matrix generated from `archimate/eni-replay/` | 2026-10-05 |
| decisions/ADR-001-static-snapshot.md | decisions | Why the PoC uses a static OHLCV snapshot and no runtime backend; Consilium engine v1 choice | 2026-09-29 |
| decisions/ADR-002-archimate-structured-source.md | decisions | ArchiMate as a structured source with generated views (layout superseded by ADR-005) | 2026-10-05 |
| decisions/ADR-003-github-pages-rendering.md | decisions | GitHub Pages hosting, Jekyll native, app under /app/ | 2026-09-29 |
| decisions/ADR-004-stakeholder-docs-ui.md | decisions | Stakeholder-grade Jekyll UI: custom layouts, value-frame landing, Mermaid CDN (item 4 superseded) | 2026-10-05 |
| decisions/ADR-005-archimate-per-layer-source.md | decisions | ArchiMate source in one file per layer, automated model checks, edit links and live preview | 2026-10-05 |
| operations/development.md | operations | Install, build, unit/golden/e2e tests, update ENI data, run the PoC, edit and check ArchiMate, GitHub Pages | 2026-10-05 |

## Structured sources (outside `docs/`)

| Path | Role | Last verified |
|------|------|---------------|
| `archimate/_vocabulary.md` | Allowed ArchiMate element and relation types | 2026-10-05 |
| `archimate/eni-replay/*layer.md` | ENI replay model, one file per layer (Motivation, Business, Application, Technology) | 2026-10-05 |
| `scripts/gen-archimate.mjs` | Checks the model and generates the diagram fragment, the PlantUML block and the matrix; `--check` fails on errors or stale outputs | 2026-10-05 |
| `scripts/archimate-watch.mjs` | Local live preview while editing the model | 2026-10-05 |
| `_layouts/`, `_includes/`, `assets/` | Jekyll layout system and assets for the Pages UI (see ADR-004, ADR-005) | 2026-10-05 |
