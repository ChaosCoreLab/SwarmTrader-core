---
use_case: eni-replay
layer: application
aspect: passive-structure
elements:
  - id: app_data_stockdata
    type: data-object
    name: StockData
    role: In-memory OHLCV bars for ENI.MTA from 2016-09-29 to 2026-09-28, fed one at a time to Consilium Life during replay.
    tech: StockData instances from src/vendor/consilium/stockStream.js; built by DataTrainer.read() at src/engine/dataTrainer.js from snapshot.bars
  - id: app_data_genome
    type: data-object
    name: genome
    role: The immutable fixed trader genome replayed over ENI; carries IIR coefficients, buy/margin percentages, stop/take-profit thresholds and a 9-state transition table.
    tech: FIXED_GENOME constant + createConsiliumGenome() at src/engine/genome.js; mapped to Genoma from src/vendor/consilium/algorithm.js
  - id: app_data_trace
    type: data-object
    name: trace frames
    role: Per-bar frame capturing algorithm state, IIR values, portfolio totals and broker operations, appended at each Life.feed() step for chart rendering and validation.
    tech: captureFrame() at src/engine/simulationController.js#L90; pushed to this.trace at src/engine/simulationController.js#L69
  - id: app_data_ops
    type: data-object
    name: broker operations
    role: Buy fills and closed-position sells (signal, take-profit, stop-loss) extracted per bar from the Consilium broker and overlaid on the chart as markers.
    tech: individual.trader.broker.operationsByTimestamp + portfolio.closedPositions at src/engine/simulationController.js#L95-L113
  - id: app_data_validation
    type: data-object
    name: validation result
    role: Outcome of FitnessValidator over the full trace at EOF; checks chronological frames, finite IIR, OHLC/trade coherence and position-quantity invariants, reported by the UI as complete or visible errors.
    tech: FitnessValidator.validate() at src/engine/fitnessValidator.js; stored as this.validation by SimulationController.validateTrace()
relationships:
  - from: app_svc_capture
    to: app_data_trace
    type: accesses
  - from: app_svc_capture
    to: app_data_ops
    type: accesses
  - from: app_svc_verify
    to: app_data_validation
    type: accesses
last_verified: 2026-09-29
---

# Application / Passive structure

Passive data objects consumed/produced by the services: `StockData`, the genome, trace frames, broker operations, and the validation result.

## Riferimenti
- [captureFrame output](../../src/engine/simulationController.js#L116)
