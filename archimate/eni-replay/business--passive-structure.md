---
use_case: eni-replay
layer: business
aspect: passive-structure
elements:
  - id: bus_obj_acceptance
    type: business-object
    name: Acceptance criteria
    role: Cycle-001 acceptance criteria the ENI replay PoC must satisfy (static HTML/JS app with no runtime backend, fixed non-mutating genome, deterministic replay of the 29/09/2016-28/09/2026 ENI snapshot, every fill traceable to its engine frame, no profitability claim).
    tech: "Versioned in Git; cycle-001 decision ACCEPTED WITH CONDITIONS, closed 2026-09-29; archived at .swhouse/cycles/archive/cycle-001.md"
  - id: bus_obj_snapshot
    type: business-object
    name: Historical OHLCV snapshot
    role: Immutable ENI daily OHLCV snapshot consumed by the replay; bars are date, open, high, low, close, volume with no duplicates or post-cutoff records, so the same genome on the same data reproduces the same run.
    tech: "public/data/eni-ohlcv.json; SHA-256 + cutoff validated by validateSnapshot() in src/engine/snapshotValidator.js (REQUIRED_CUTOFF_DATE='2026-09-28'); acquired offline by scripts/fetch-eni-data.mjs"
  - id: bus_obj_findings
    type: business-object
    name: Replay findings
    role: Deterministic output of inspecting the fixed genome over the snapshot: an ordered trace of per-bar state, IIR values, portfolio totals and broker operations, plus the FitnessValidator verdict the operator documents.
    tech: "Trace frames built by SimulationController.captureFrame() at src/engine/simulationController.js; validation result from FitnessValidator.validate(trace); rendered by src/main.js"
last_verified: 2026-09-29
---

# Business / Passive structure

The business consumes/produces three passive objects: **acceptance criteria**, the **historical OHLCV snapshot**, and the **replay findings** produced by inspection.

## Riferimenti
- [Cycle acceptance criteria](../../.swhouse/cycles/archive/cycle-001.md)
