---
use_case: eni-replay
layer: business
aspect: behaviour
elements:
  - id: bus_proc_acquire
    type: business-process
    name: Acquire approved snapshot
    role: The operator runs the offline fetch script to download ENI OHLCV from Borsa Italiana and validate its SHA-256, cutoff date and schema before the snapshot is committed to Git and loaded by the browser.
    tech: "scripts/fetch-eni-data.mjs → public/data/eni-ohlcv.json; validated by src/engine/snapshotValidator.js (REQUIRED_CUTOFF_DATE 2026-09-28, SHA-256)"
  - id: bus_proc_replay
    type: business-process
    name: Replay fixed genome
    role: Creates exactly one Individual from the fixed genome via FixedGenomeGA, loads the in-memory StockStream through DataTrainer, and advances one bar at a time via Life.feed() while capturing state, IIR, portfolio and broker closes into a trace.
    tech: "src/engine/simulationController.js (start/step/captureFrame); src/engine/fixedGenomeGA.js; src/engine/dataTrainer.js; src/engine/genome.js"
  - id: bus_proc_inspect
    type: business-process
    name: Inspect and document results
    role: At EOF the FitnessValidator checks the complete trace for chronological frames, finite IIR values, OHLC/trade coherence and position-quantity invariants, and the browser UI reports completion or visible errors for the documented replay findings.
    tech: "src/engine/fitnessValidator.js (validate trace); src/main.js (browser UI renders findings); findings recorded in docs/architecture/use-case-eni-replay.md"
relationships:
  - from: bus_proc_acquire
    to: bus_proc_replay
    type: flows-to
  - from: bus_proc_replay
    to: bus_proc_inspect
    type: flows-to
last_verified: 2026-09-29
---

# Business / Behaviour

Three business processes flow in sequence: **acquire** an approved snapshot, **replay** the fixed genome, then **inspect and document** results.

## Riferimenti
- [Use case main flow](../../docs/architecture/use-case-eni-replay.md)
