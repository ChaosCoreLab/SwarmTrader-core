---
use_case: eni-replay
layer: application
last_verified: 2026-10-05
---

# Application layer — ENI replay

<!--
Come modificare questo file
- Ogni elemento è una sezione "### Nome" seguita da righe "- campo: valore".
  Campi: id (univoco, senza spazi), aspect, type, role, tech (facoltativo).
- Ogni relazione è una riga della tabella "Relations", scritta nel file del livello dell'elemento "from".
- Tipi ammessi: archimate/_vocabulary.md. Regole: software-house-ai/protocols/archimate-modeling.md.
- Anteprima immediata: npm run archimate:watch. Verifica: npm run archimate:check.
-->

## Elements

### Replay engine (SimulationController)
- id: app_sim_ctrl
- aspect: active-structure
- type: application-component
- role: Runs the replay: creates the trader from the supplied fixed genome, hands the Consilium trading engine one ENI trading day at a time and records what happened on each day.
- tech: src/engine/simulationController.js, using the vendored Consilium engine in src/vendor/consilium/. FixedGenomeGA and the genome adapter are internal helpers of this component.

### Market data loader (DataTrainer)
- id: app_data_trainer
- aspect: active-structure
- type: application-component
- role: Turns the ENI price file into the in-memory sequence of trading days that the engine reads; makes no network request.
- tech: src/engine/dataTrainer.js; read('ENI.MTA', period) returns a Consilium StockStream. Created by the replay engine.

### Consistency checker (FitnessValidator)
- id: app_validator
- aspect: active-structure
- type: application-component
- role: After the last trading day, checks the whole replay record for consistency (days in order, finite filter values, trades within the day's price range, position quantities). It does not judge profitability.
- tech: src/engine/fitnessValidator.js; validate(trace). Created by the replay engine.

### Replay screen (Chart UI)
- id: app_chart_ui
- aspect: active-structure
- type: application-component
- role: The page the analyst uses: daily candles and volume, the two price smoothing-filter (IIR) lines, buy and sell markers, optional state-change markers, an inspector for the current day and a trade ledger, with step, play and reset controls.
- tech: src/main.js with lightweight-charts; the volume IIR values appear in the inspector only; the price file src/data/eni-ohlcv.json is embedded at build time.

### Advance one trading day
- id: app_svc_feed
- aspect: behaviour
- type: application-service
- role: Moves the replay forward by exactly one trading day per step, and stops with a visible error if the engine does not process that day.
- tech: SimulationController.step() calls Life.feed() (src/engine/simulationController.js).

### Record decisions and trades
- id: app_svc_capture
- aspect: behaviour
- type: application-service
- role: Records, for each trading day, the genome's state, the four smoothing-filter (IIR) values, buys and closed positions, and portfolio values, so every chart marker traces back to the day that produced it.
- tech: captureFrame() in src/engine/simulationController.js.

### Check replay consistency
- id: app_svc_verify
- aspect: behaviour
- type: application-service
- role: Runs the consistency checks at the end of the replay and reports any problem in the UI.
- tech: SimulationController.validateTrace() calls FitnessValidator.validate() (src/engine/fitnessValidator.js).

### Display replay
- id: app_svc_display
- aspect: behaviour
- type: application-service
- role: Shows the recorded days to the analyst as chart, inspector and trade ledger, step by step or as a timed replay.
- tech: Rendering functions in src/main.js; buy and sell markers and the ledger are read from the replay record.

### ENI trading days in memory (StockData)
- id: app_data_stockdata
- aspect: passive-structure
- type: data-object
- role: The ENI price bars in memory, one per trading day, read by the engine in date order.
- tech: StockData from src/vendor/consilium/stockStream.js, built by DataTrainer.

### Fixed genome, engine format (Genoma)
- id: app_data_genome
- aspect: passive-structure
- type: data-object
- role: The supplied fixed genome in the form the Consilium engine reads.
- tech: createConsiliumGenome(FIXED_GENOME) in src/engine/genome.js produces a Genoma (src/vendor/consilium/algorithm.js).

### Day-by-day replay record (trace)
- id: app_data_trace
- aspect: passive-structure
- type: data-object
- role: One entry per trading day with the genome's state, the filter values, portfolio values and that day's buys and sells.
- tech: SimulationController.trace, filled by captureFrame() (src/engine/simulationController.js).

### Broker operations
- id: app_data_ops
- aspect: passive-structure
- type: data-object
- role: Every buy (genome signal) and every closed position (genome sell signal, take-profit, stop-loss) with date, price and quantity, as kept by the engine's broker.
- tech: broker.operationsByTimestamp and portfolio.closedPositions (close reasons 'sell', 'take profit', 'stop loss' in src/vendor/consilium/portfolio.js), read by captureFrame().

### Consistency check result
- id: app_data_validation
- aspect: passive-structure
- type: data-object
- role: The outcome of the consistency check over the whole replay: valid or not, with the list of errors and warnings.
- tech: Return value of FitnessValidator.validate(), stored as SimulationController.validation.

## Relations

| from | relation | to | label |
|------|----------|----|-------|
| app_sim_ctrl | composes | app_data_trainer | |
| app_sim_ctrl | composes | app_validator | |
| app_sim_ctrl | realizes | app_svc_feed | |
| app_sim_ctrl | realizes | app_svc_capture | |
| app_validator | realizes | app_svc_verify | |
| app_chart_ui | realizes | app_svc_display | |
| app_sim_ctrl | serves | app_chart_ui | |
| app_data_trainer | accesses | app_data_stockdata | writes |
| app_svc_feed | accesses | app_data_stockdata | reads |
| app_sim_ctrl | accesses | app_data_genome | reads |
| app_svc_capture | accesses | app_data_ops | reads |
| app_svc_capture | accesses | app_data_trace | writes |
| app_svc_verify | accesses | app_data_trace | reads |
| app_svc_verify | accesses | app_data_validation | writes |
| app_svc_display | accesses | app_data_trace | reads |
| app_data_stockdata | realizes | bus_obj_snapshot | |
| app_data_genome | realizes | bus_obj_genome | |
| app_data_trace | realizes | bus_obj_findings | |
| app_data_ops | realizes | bus_obj_findings | |
| app_data_validation | realizes | bus_obj_findings | |
| app_svc_feed | serves | bus_proc_replay | |
| app_svc_capture | serves | bus_proc_replay | |
| app_svc_verify | serves | bus_proc_replay | |
| app_svc_display | serves | bus_proc_inspect | |
