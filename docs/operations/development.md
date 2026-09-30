---
title: "Development and Operations"
layout: doc
last_verified: 2026-09-30
---

# Development and Operations

last_verified: 2026-09-30

## Requirements

- Node.js 20 or newer and npm.
- Windows PowerShell: use `npm.cmd` to avoid execution-policy issues with `npm.ps1`.
- Borsa Italiana network access only when refreshing data.

## Install

```powershell
npm.cmd install
```

With npm versions that gate lifecycle scripts, review and approve only the `esbuild` install script required by Vite, then run the install again if npm requests it.

## Update local ENI snapshot

```powershell
npm.cmd run data:update
```

The script requests daily OHLCV from Borsa Italiana for `ENI.MTA`, validates row shape, ordering, finite numeric values and OHLC bounds, filters inclusive dates 29/09/2016–28/09/2026, and atomically writes `src/data/eni-ohlcv.json`. It prints actual bar count, first/last dates and SHA-256. If the endpoint is unavailable or malformed, it fails without replacing the prior snapshot. The snapshot is embedded into the app bundle at build time (`import` in `src/main.js`), so there is no runtime fetch and no base-path dependency.

The data asset is versioned in Git (Owner confirmed Borsa Italiana reuse terms on 29/09/2026). Commit a refreshed snapshot only together with its new hash and coverage in the cycle log.

## Run locally

```powershell
npm.cmd run dev
```

Open `http://127.0.0.1:5173/`. The static page reports a visible error if the local snapshot is missing or fails integrity validation.

## Build and test

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

The build output is static under `dist/`; no Node server is required during replay. Tests include a full replay of the local ENI snapshot and representative invalid-data and trade-invariant cases.

## Golden reference trace

```powershell
npm.cmd run golden
```

`scripts/golden-consilium.mjs` clones Consilium into `.cache/consilium-ref` (or uses `CONSILIUM_REF_DIR`), checks out the pinned commit `30ae93fca6a9a2eab59123a87f0ffdfbe993db45`, refuses a dirty `public/src`, and runs the **unmodified** upstream modules: the genome is read from `human-interaction/01-first-poc.md`, converted by upstream `Individual.fromJSON`, and fed by upstream `Life.cycle()`. It writes `tests/golden/eni-fixed-genome.golden.json` (per-bar state and IIR, broker operations, closed positions, final capital).

`tests/golden.test.js` then replays the same snapshot through `SimulationController` (step-by-step `Life.feed()`, project genome adapter) and requires exact equality. The test is skipped, not failed, while the golden file is absent. Regenerate the golden only when the snapshot or the pinned engine commit changes, and commit it together with that change.

## Browser smoke check

```powershell
npm.cmd run test:e2e
```

`playwright.config.js` starts the Vite dev server on port 5173 (or reuses a running one) and runs `tests/e2e/*.spec.js` in Chromium at desktop size and at 390 px width. Expected values are not hard-coded: the spec replays the same snapshot through `SimulationController` in Node and formats them like the UI. It covers:

1. Snapshot coverage, bar count, and hash prefix; chart rendered.
2. Each step shows exactly the engine frame (state, date, IIR, total value); reset returns to the first bar.
3. Replay past the first trade (fake clock): the ledger lists exactly the Broker operations up to the paused bar, and "Posizione" reflects the shares held per the ledger. The pause lands in a bar range where Consilium `trader.isHolding()` is false with shares held, so the label must use `frame.positionOpen`.
4. IIR and state overlays toggle without altering the simulation.
5. No horizontal overflow; a tampered snapshot is rejected with a visible error.
6. No console errors or page errors in any test.

First run on a new machine: `npx.cmd playwright install chromium`. The human counterpart of this check is NRC-H01 in `.swhouse/memory/validation/non_regression_checklist.md`.

## Generate ArchiMate views

```powershell
npm.cmd run archimate:gen
npm.cmd run archimate:check
```

`scripts/gen-archimate.mjs` reads the cell files under `archimate/<use-case>/`, validates elements and relationships against `archimate/_vocabulary.md`, and injects the PlantUML diagram block and the Service Layer × Aspect matrix into `docs/architecture/use-case-<use-case>.md` between idempotent markers. `archimate:check` regenerates and fails if the committed block differs from the source (drift detection). `archimate:svg` writes a responsive interactive SVG to `_includes/use-cases/<use-case>.svg` (rendered directly from the YAML, no PlantUML/Java), inlined into the use-case page via Jekyll `{% raw %}{% include %}{% endraw %}`. See ADR-002, ADR-004 and `docs/MAP.md` for the structured source pattern.

## GitHub Pages

A GitHub Actions workflow (`.github/workflows/pages.yml`) builds the PoC app with the Pages base path (`GH_PAGES=1`), generates the ArchiMate SVG, builds the Jekyll site, and deploys to GitHub Pages. The site is served at `https://chaoscorelab.github.io/SwarmTrader-core/`: the landing page links to the app (`/app/`) and the documentation (`docs/`). The app build uses `vite.config.js` with `base` derived from the `GH_PAGES` env var; locally the base is `/`.

First deployment requires enabling Pages in the repository settings (Source: GitHub Actions). The first published site is a `PENDING_HUMAN` target — the Owner must confirm visual rendering after the initial deploy.

## Data and financial disclaimer

The PoC is historical analysis only. It does not execute real trades or claim profitability. Borsa Italiana reuse of the snapshot was confirmed by the Owner on 29/09/2026; keep the source attribution in the snapshot metadata.