---
use_case: eni-replay
layer: application
aspect: behaviour
elements:
  - id: app_svc_validate
    type: application-service
    name: Validate snapshot
    role: Checks the embedded ENI OHLCV snapshot for schema version, symbol, strict date ordering, finite OHLCV numbers, valid OHLC bounds and the 2016-09-29..2026-09-28 range before DataTrainer exposes any stream to Life; rejects corrupt or out-of-range data before replay starts.
    tech: "validateSnapshot() in src/engine/dataTrainer.js (also src/engine/snapshotValidator.js for cutoff/SHA-256); throws on schemaVersion, SYMBOL='ENI.MTA', isIsoDate, OHLCV bounds, START_DATE/CUTOFF_DATE"
  - id: app_svc_adapt
    type: application-service
    name: Adapt genome
    role: Maps the fixed snake_case ENI genome to the fractional camelCase Genoma expected by Consilium, validating IIR coefficients in (0,1), transition keys and condition IDs, then freezing the result so the replay is deterministic and the source values are never mutated.
    tech: "createConsiliumGenome(FIXED_GENOME) in src/engine/genome.js; toFraction() for buy/margin/stop/take-profit; new Genoma() from src/vendor/consilium/algorithm.js"
  - id: app_svc_feed
    type: application-service
    name: Feed bars
    role: Advances the Consilium Life by exactly one ENI bar per SimulationController.step(), reading the next StockData from the in-memory StockStream and pushing it to the Individual's algorithm and trader; stops with an error if Life.feed() does not consume the expected bar.
    tech: "Life.feed() called in step() at src/engine/simulationController.js; stream.stream[indexBefore] from DataTrainer.read() in src/engine/dataTrainer.js"
  - id: app_svc_capture
    type: application-service
    name: Capture state/IIR/trades
    role: Builds one immutable trace frame per bar holding the OHLCV values, the current algorithm state name, the four IIR values (ema/ema2/emaV/emaV2), broker buy events and newly closed positions, plus capital/portfolio/total value and holding flags, so every chart marker is traceable to the frame that produced it.
    tech: "captureFrame(stockData) at src/engine/simulationController.js; reads algo.getCurrentName(), broker.operationsByTimestamp[timestamp], portfolio.closedPositions.slice(closedPositionCursor)"
  - id: app_svc_verify
    type: application-service
    name: Verify invariants
    role: Inspects the complete trace at EOF for chronologically ordered frames, finite IIR values, valid algorithm states, OHLC/trade coherence (buy at open, take-profit/stop-loss thresholds reached) and position-quantity invariants; reports errors and warnings without evaluating profitability.
    tech: "FitnessValidator.validate(trace) in src/engine/fitnessValidator.js; VALID_STATES (NW..SE), VALID_REASONS (signal/sell/take profit/stop loss), returns {valid, checkedBars, checkedOperations, errors, warnings}"
relationships:
  - from: app_sim_ctrl
    to: app_svc_feed
    type: realizes
  - from: app_sim_ctrl
    to: app_svc_capture
    type: realizes
  - from: app_validator
    to: app_svc_verify
    type: realizes
  - from: app_data_trainer
    to: app_svc_validate
    type: realizes
  - from: app_ga
    to: app_svc_adapt
    type: realizes
last_verified: 2026-09-29
---

# Application / Behaviour

Application services realized by the components: validate snapshot, adapt genome, feed bars, capture state/IIR/trades, verify invariants.

## Riferimenti
- [Simulator overview](../../docs/architecture/simulator-overview.md)
