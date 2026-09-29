# Documentation Map

last_verified: 2026-09-29

| File | Domain | One-line topic | Last verified |
|------|--------|----------------|--------------|
| architecture/simulator-overview.md | architecture | Browser simulator components, data flow, and replay state | 2026-09-29 |
| architecture/use-case-eni-replay.md | architecture | Fixed-genome ENI replay use case; ArchiMate diagram and matrix derived from `archimate/eni-replay/` cells | 2026-09-29 |
| decisions/ADR-001-static-snapshot.md | decisions | Why the PoC uses a static OHLCV snapshot and no runtime backend; Consilium engine v1 choice | 2026-09-29 |
| decisions/ADR-002-archimate-structured-source.md | decisions | ArchiMate as a cell-based structured data source with generated diagram and matrix | 2026-09-29 |
| decisions/ADR-003-github-pages-rendering.md | decisions | GitHub Pages hosting: SVG rendered directly from YAML, Jekyll native, app under /app/ | 2026-09-29 |
| operations/development.md | operations | Install, build, unit/golden/e2e tests, update ENI data, run the PoC, generate ArchiMate, GitHub Pages | 2026-09-29 |

## Structured sources (outside `docs/`)

| Path | Role | Last verified |
|------|------|---------------|
| `archimate/_vocabulary.md` | Minimal ArchiMate element/relationship vocabulary for the cell-based pattern | 2026-09-29 |
| `archimate/eni-replay/` | One file per pertinent cell (Service Layer × Aspect) for the ENI replay use case | 2026-09-29 |
| `scripts/gen-archimate.mjs` | Generates the PlantUML block and matrix from `archimate/` cells; `--check` detects drift | 2026-09-29 |