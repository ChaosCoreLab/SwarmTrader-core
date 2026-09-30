---
use_case: eni-replay
layer: application
aspect: active-structure
elements:
  - id: app_sim_ctrl
    type: application-component
    name: SimulationController
    role: Connects Consilium Life, the fixed-genome Individual and DataTrainer; advances one bar at a time via Life.feed() and records state, IIR, portfolio and broker closes into a trace consumed by the Chart UI and FitnessValidator.
    tech: "ES module class at src/engine/simulationController.js; captureFrame() reads algo.getCurrentName(), ema/ema2/emaV/emaV2, broker.operationsByTimestamp and portfolio.closedPositions"
  - id: app_data_trainer
    type: application-component
    name: DataTrainer
    role: Validates the embedded ENI OHLCV snapshot (schema, symbol, ordering, OHLCV bounds, date range) and serves an in-memory Consilium StockStream to Life; performs no network request in the browser runtime.
    tech: "ES module class at src/engine/dataTrainer.js; extends IStockStreamProvider; read(SYMBOL='ENI.MTA', period) builds a StockStream of StockData for 2016-09-29..2026-09-28"
  - id: app_ga
    type: application-component
    name: FixedGenomeGA
    role: Supplies exactly one Individual from the fixed ENI genome; does not mutate, cross, or evolve the genome, so every replay of the same snapshot is deterministic.
    tech: "ES module class at src/engine/fixedGenomeGA.js; extends GA; createNewChild() returns new Individual(INITIAL_CAPITAL=10000, createConsiliumGenome(FIXED_GENOME))"
  - id: app_validator
    type: application-component
    name: FitnessValidator
    role: Checks the complete trace after replay for chronological frames, finite IIR values, valid algorithm states, OHLC/trade coherence and position-quantity invariants; reports errors and warnings without evaluating profitability.
    tech: "ES module class at src/engine/fitnessValidator.js; validate(trace) returns {valid, checkedBars, checkedOperations, errors, warnings}"
  - id: app_chart_ui
    type: application-component
    name: Chart UI
    role: Static browser UI that loads the embedded ENI snapshot, drives SimulationController.start()/step()/playToEnd(), and renders candles, volume, IIR, state transitions and broker buy/sell/stop/take-profit markers.
    tech: "ES module at src/main.js; imports lightweight-charts (CandlestickSeries/HistogramSeries/LineSeries) and @fontsource IBM Plex; snapshot imported from src/data/eni-ohlcv.json"
relationships:
  - from: app_sim_ctrl
    to: app_data_trainer
    type: used-by
  - from: app_sim_ctrl
    to: app_ga
    type: used-by
  - from: app_chart_ui
    to: app_sim_ctrl
    type: used-by
last_verified: 2026-09-29
---

# Application / Active structure

Active application components. The **Chart UI** uses **SimulationController**, which uses **DataTrainer** and **FixedGenomeGA**. **FitnessValidator** validates the trace.

## Riferimenti
- [SimulationController](../../src/engine/simulationController.js)
