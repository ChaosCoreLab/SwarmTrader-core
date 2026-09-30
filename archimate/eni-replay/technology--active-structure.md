---
use_case: eni-replay
layer: technology
aspect: active-structure
elements:
  - id: tech_browser
    type: node
    name: Browser runtime
    role: Loads the embedded ENI snapshot, validates its SHA-256, runs SimulationController frame-by-frame and renders candles, volume, IIR, state transitions and broker fills with no runtime backend.
    tech: "ES module entry src/main.js; lightweight-charts v5 + IBM Plex fonts; snapshot imported from src/data/eni-ohlcv.json; served by GitHub Pages under /SwarmTrader-core/app/ (vite.config.js base)"
  - id: tech_node
    type: node
    name: Node.js offline toolchain
    role: Runs the data refresh, build, test and ArchiMate generation scripts offline; never serves the browser app and makes no network request except the explicit Borsa Italiana snapshot update.
    tech: "Node >=20 (package.json engines); scripts/fetch-eni-data.mjs for snapshot POST; `node --test` for unit tests; playwright test for E2E; scripts/gen-archimate.mjs for diagram generation"
  - id: tech_vite
    type: system-software
    name: npm/Vite toolchain
    role: Bundles the static app and provides the local dev/preview server; builds the dist/ output that GitHub Pages serves as the PoC UI.
    tech: "vite ^7.0.0 (devDependency); vite.config.js with build target es2022, outDir dist, base switching for GH_PAGES; npm scripts dev/build/preview"
relationships:
  - from: tech_browser
    to: tech_vite
    type: used-by
  - from: tech_node
    to: tech_vite
    type: used-by
last_verified: 2026-09-29
---

# Technology / Active structure

The **Browser runtime** runs the static app; **Node.js** is used only offline for data refresh/build/test via the **npm/Vite toolchain**.

## Riferimenti
- [Development operations](../../docs/operations/development.md)
