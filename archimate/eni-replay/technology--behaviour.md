---
use_case: eni-replay
layer: technology
aspect: behaviour
elements:
  - id: tech_svc_render
    type: technology-service
    name: Local static load and render
    role: Serves the bundled app and the embedded ENI snapshot to the browser with no runtime backend, so the replay UI loads, validates the SHA-256 hash and renders candles, IIR and broker fills purely from local static assets.
    tech: "Vite-bundled ES modules at src/main.js; snapshot imported as a JSON module from src/data/eni-ohlcv.json (no runtime fetch), validated by src/engine/snapshotValidator.js; chart render in the Browser runtime"
  - id: tech_svc_borsa
    type: technology-service
    name: Borsa POST (explicit update only)
    role: Performed solely by the offline Node refresh script when an operator explicitly updates the snapshot; it POSTs to the Borsa Italiana chart service, normalizes and validates the OHLCV rows, then atomically writes the versioned JSON with its SHA-256 manifest — never invoked by the browser runtime.
    tech: "scripts/fetch-eni-data.mjs; fetch(ENDPOINT, {method:'POST'}) to https://charts.borsaitaliana.it/...GetPricesWithVolume; createHash('sha256'); atomic rename to src/data/eni-ohlcv.json"
relationships:
  - from: tech_browser
    to: tech_svc_render
    type: realizes
  - from: tech_node
    to: tech_svc_borsa
    type: realizes
last_verified: 2026-09-29
---

# Technology / Behaviour

The browser realizes local static load+render; Node realizes the Borsa POST, performed only during an explicit data update.

## Riferimenti
- [fetch-eni-data.mjs](../../scripts/fetch-eni-data.mjs)
