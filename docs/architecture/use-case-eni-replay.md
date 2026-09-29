# Use Case: Replay ENI with Fixed Genome

last_verified: 2026-09-28

## Goal

Inspect the behavior of the supplied fixed trader genome against an immutable ENI daily OHLCV snapshot, with every chart marker traceable to the Consilium engine frame that produced it.

## ArchiMate Service Layer × Aspect

| Service Layer | Motivation | Active structure | Behaviour | Passive structure |
|---------------|------------|-----------------|-----------|-------------------|
| Business | Reproducible inspection of historical buy/sell behavior; no profitability promise | Operator, Product Owner, Librarian | Acquire an approved snapshot, replay a fixed genome, inspect and document results | Acceptance criteria, historical OHLCV snapshot, replay findings |
| Application | Static SwarmTrader browser PoC | `SimulationController`, `DataTrainer`, `FixedGenomeGA`, `FitnessValidator`, chart UI | Validate snapshot, adapt genome, feed bars, capture state/IIR/trades, verify invariants | `StockData`, genome, trace frames, broker operations, validation result |
| Technology | Browser with JavaScript modules; Node.js only for offline refresh/build/test | Browser runtime, Node acquisition script, npm/Vite toolchain | Local static fetch and chart rendering; POST to Borsa only during explicit data update | `public/data/eni-ohlcv.json`, SHA-256 manifest, bundled JS/CSS/fonts |
| Physical | Developer workstation and Borsa Italiana public web service | Operator workstation/network; external Borsa endpoint | Run `npm.cmd run data:update`; serve local Vite preview; inspect interactively | Local filesystem snapshot and browser viewport |

## Preconditions

- The local snapshot exists and its SHA-256, schema, cutoff and bars validate.
- The fixed genome maps to the Consilium `Genoma` model without mutating source values.
- `FitnessValidator` has no blocking errors.

## Main flow

1. The operator opens the browser UI; the static snapshot loads and its hash is checked.
2. The UI shows actual date coverage, bar count, and source metadata.
3. Starting replay creates one Individual via `FixedGenomeGA`, then loads the in-memory stream.
4. Each step feeds exactly one bar to `Life`; state, IIR, portfolio and broker operations are captured.
5. The chart overlays IIR and actual Broker buy/sell/stop/take-profit fills; the optional state layer marks transitions.
6. At EOF, `FitnessValidator` checks the complete trace and the UI reports completion or visible errors.

## Failure paths

- Missing/corrupt snapshot or hash mismatch: show an error; keep controls disabled.
- Invalid OHLCV or date coverage: reject before creating the Individual.
- `Life.feed()` fails before EOF: stop replay and show an error; never label it complete.
- Borsa endpoint unavailable during refresh: preserve the last valid snapshot atomically; no browser runtime request is made.