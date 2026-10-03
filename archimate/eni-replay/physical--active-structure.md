---
use_case: eni-replay
layer: physical
aspect: active-structure
elements:
  - id: phys_workstation
    type: equipment
    name: Operator workstation
    role: Hosts the browser runtime where the operator opens the static UI, loads the embedded ENI snapshot, and steps or plays through the fixed-genome replay; no runtime backend runs on it.
    tech: "Local browser running the bundle with the embedded src/data/eni-ohlcv.json snapshot; UI entry point src/main.js; static bundle, no runtime backend (ADR-001)"
  - id: phys_borsa
    type: facility
    name: Borsa Italiana endpoint
    role: External Borsa Italiana market-data endpoint that supplies the ENI daily OHLCV snapshot; contacted only by the offline Node.js refresh script, never by the browser runtime during replay.
    tech: "Offline POST via scripts/fetch-eni-data.mjs; snapshot versioned in Git; Owner-confirmed Borsa Italiana reuse 2026-09-29"
last_verified: 2026-09-29
---

# Physical / Active structure

The operator workstation and the external Borsa Italiana facility.

## Riferimenti
- [Data disclaimer](../../docs/operations/development.md)
