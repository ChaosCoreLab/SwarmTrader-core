# Validation Matrix

last_updated: 2026-09-29
provisional: false

## Targets

| Target | Scope | Verification procedure | Owner | Status |
|--------|-------|------------------------|-------|--------|
| local-static-ui | User-facing HTML/JavaScript at `http://127.0.0.1:5173/` | `npm.cmd run build`; `npm.cmd run test:e2e` (NRC-A03, desktop + 390 px); human session NRC-H01 | U422756 | Configured |
| simulation-engine | Fixed-genome replay (`src/engine`, vendored Consilium) | `npm.cmd test` (NRC-A01) including the upstream golden comparison (NRC-A02) | U422756 | Configured |
| data-snapshot | Versioned `public/data/eni-ohlcv.json` (Borsa Italiana reuse confirmed by the Owner 2026-09-29) | Hash checked in browser and tests; `npm.cmd run data:update` only to refresh, then regenerate golden | U422756 | Configured |
| github-pages | Published site at `https://chaoscorelab.github.io/SwarmTrader-core/` (app + docs + ArchiMate SVG) | CI workflow `.github/workflows/pages.yml` builds app (GH_PAGES base), generates SVG, Jekyll build, deploys; first published site is PENDING_HUMAN (Owner confirms visual rendering) | U422756 | Configured (first deploy PENDING_HUMAN) |

A production deployment target (github-pages) is now in scope. No VALIDATOR role is configured in `instance.yaml`; the Owner acts as validator and approved these procedures on 2026-09-29 (versioned snapshot, golden, Playwright, Pages). The SCIENTIST records actual outcomes in the cycle file. Non-regression items: `non_regression_checklist.md`.
