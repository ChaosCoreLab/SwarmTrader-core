---
use_case: eni-replay
layer: technology
aspect: passive-structure
elements:
  - id: tech_art_snapshot
    type: artifact
    name: src/data/eni-ohlcv.json
    role: "Immutable ENI daily OHLCV snapshot embedded in the PoC bundle at build time; DataTrainer reads it into an in-memory StockStream, so no runtime backend is needed."
    tech: "JSON at src/data/eni-ohlcv.json; written atomically by scripts/fetch-eni-data.mjs as {bars, cutoffDate:'2026-09-28', dataSha256}; consumed by DataTrainer in src/engine/dataTrainer.js"
  - id: tech_art_hash
    type: artifact
    name: SHA-256 manifest
    role: "Integrity manifest embedded in the snapshot so the browser can reject any tampering or truncation before replay starts, satisfying the 'immutable approved snapshot' requirement."
    tech: "Hex digest stored in snapshot.dataSha256 = sha256(JSON.stringify(bars)); recomputed by validateSnapshot() in src/engine/snapshotValidator.js against required cutoff 2026-09-28"
  - id: tech_art_bundle
    type: artifact
    name: bundled JS/CSS/fonts
    role: "Statically served JS/CSS/fonts bundle that runs the entire ENI replay PoC in the browser with no server-side runtime, so the operator can inspect the replay offline."
    tech: "Vite-bundled ES modules from src/ (main.js → SimulationController, Chart UI) plus pinned src/vendor/consilium/ browser modules; emitted to dist/ as static assets"
relationships:
  - from: tech_svc_render
    to: tech_art_bundle
    type: accesses
  - from: tech_svc_render
    to: tech_art_snapshot
    type: accesses
  - from: tech_svc_borsa
    to: tech_art_snapshot
    type: accesses
  - from: tech_svc_borsa
    to: tech_art_hash
    type: accesses
last_verified: 2026-09-29
---

# Technology / Passive structure

Technology artifacts: the versioned snapshot, its SHA-256 manifest, and the bundled JS/CSS/fonts served statically.

## Riferimenti
- [ADR-001 static snapshot](../../docs/decisions/ADR-001-static-snapshot.md)
