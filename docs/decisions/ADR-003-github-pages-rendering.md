# ADR-003: GitHub Pages rendering for ArchiMate and the PoC app

Date: 2026-09-29
Cycle: 004
Status: active

## Context

Cycle 003 delivered the ArchiMate cell-based structured source and a PlantUML block as the diagram-as-code authoritative view. The block is not rendered on GitHub. The Owner wants a GitHub Pages site that hosts the PoC app and the documentation, with the ArchiMate diagrams rendered as images.

Rendering options: (a) pre-render PlantUML to SVG in CI with `plantuml.jar`/Kroki Docker (requires Java/Docker in CI), (b) generate SVG directly from the YAML cell source with no PlantUML/Java, (c) inline Kroki/PlantUML server (external runtime dependency).

## Decision

Generate the rendered SVG **directly from the YAML cell source** (`scripts/gen-archimate.mjs --emit svg/--write-svg`), with no PlantUML runtime and no external service. The PlantUML block remains the diagram-as-code authoritative source (ADR-002); the SVG is the rendered view consumed by GitHub Pages.

Host the site with **Jekyll native GitHub Pages** (no non-allowlisted plugins). The PoC app (Vite build) is served under `/app/`; the documentation (`docs/`) is served as Jekyll pages. A GitHub Actions workflow builds the app with the Pages base path, generates the SVG, builds the Jekyll site, and deploys.

## Rationale

- Direct SVG generation avoids Java/Docker in CI (heavy, slow) and any external render service (Kroki), keeping the pipeline self-contained and fast.
- The SVG is derived from the same YAML source as the PlantUML block, so there is one source of truth; drift between the two is impossible by construction (both come from `gen-archimate.mjs`).
- Jekyll native keeps the markdown docs (already written for the framework) as the source of pages, with no extra generator dependency.
- Serving the app under `/app/` isolates the Vite `index.html` from Jekyll Liquid processing (avoids `{{ }}` conflicts).

## Consequences

**Easier:**
- The ArchiMate diagrams are visible on the published site; a cell change propagates to the SVG and the deployed site automatically.
- No CI Java/Docker dependency; the workflow is Node + Ruby/Jekyll only.
- The PoC app is reachable online for inspection.

**Harder:**
- The hand-made SVG is less polished than a PlantUML render; acceptable for an internal documentation view.
- Cross-layer relationship routing is simple (cubic curves) and may overlap on complex models; acceptable for the pilot use case.
- First deployment is a `PENDING_HUMAN` target: the Owner must confirm visual rendering after the initial Pages deploy.
- The Jekyll `baseurl` and Vite `base` must stay aligned with the repo name; renaming the repo or adding a custom domain requires updating both.

## Confidence

Medium-High — the SVG generation, Pages build, and base path are verified locally; the published site is pending the first deploy (PENDING_HUMAN).
