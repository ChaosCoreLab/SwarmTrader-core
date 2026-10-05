---
use_case: eni-replay
layer: business
last_verified: 2026-10-05
---

# Business layer — ENI replay

<!--
Come modificare questo file
- Ogni elemento è una sezione "### Nome" seguita da righe "- campo: valore".
  Campi: id (univoco, senza spazi), aspect, type, role, tech (facoltativo).
- Ogni relazione è una riga della tabella "Relations", scritta nel file del livello dell'elemento "from".
- Tipi ammessi: archimate/_vocabulary.md. Regole: software-house-ai/protocols/archimate-modeling.md.
- Anteprima immediata: npm run archimate:watch. Verifica: npm run archimate:check.
-->

## Elements

### Analyst
- id: bus_role_analyst
- aspect: active-structure
- type: business-role
- role: Runs the replay of the supplied fixed genome on ENI history and inspects its states, IIR lines and trades.
- tech: Uses the published app (GitHub Pages, /app/) or npm run dev locally.

### Borsa Italiana
- id: bus_actor_borsa
- aspect: active-structure
- type: business-actor
- role: Market operator that publishes ENI daily prices; the source of the historical data.
- tech: Public chart service queried by scripts/fetch-eni-data.mjs; data reused under Borsa Italiana terms.

### Acquire ENI market history
- id: bus_proc_acquire
- aspect: behaviour
- type: business-process
- role: Download ENI daily prices from Borsa Italiana for 29/09/2016–28/09/2026 and freeze them as the snapshot used by every replay.
- tech: npm run data:update runs scripts/fetch-eni-data.mjs and writes src/data/eni-ohlcv.json, versioned in Git.

### Replay supplied fixed genome
- id: bus_proc_replay
- aspect: behaviour
- type: business-process
- role: Run the supplied fixed genome day by day over the ENI price history and record what it decides and trades on each day.
- tech: SimulationController.start() and step() in src/engine/simulationController.js.

### Inspect replay
- id: bus_proc_inspect
- aspect: behaviour
- type: business-process
- role: Review the price chart, the trade markers, the optional state-change markers and the trade ledger to understand how the genome behaved and when it bought or sold.
- tech: Browser UI in src/main.js (chart, inspector, ledger).

### ENI price history (historical OHLCV snapshot)
- id: bus_obj_snapshot
- aspect: passive-structure
- type: business-object
- role: Ten years of ENI daily prices (open, high, low, close) and volumes up to 28/09/2026, frozen once; the fixed input of every replay.
- tech: src/data/eni-ohlcv.json (2,517 bars).

### Supplied fixed genome
- id: bus_obj_genome
- aspect: passive-structure
- type: business-object
- role: The trader genome supplied for evaluation: smoothing-filter (IIR) coefficients, buy and margin percentages, stop-loss and take-profit thresholds, and a 9-state transition table. It is replayed as given and never evolved.
- tech: FIXED_GENOME in src/engine/genome.js.

### Replay findings
- id: bus_obj_findings
- aspect: passive-structure
- type: business-object
- role: What the analyst learns from a replay: the genome's state and smoothing-filter (IIR) values on each trading day, every buy and sell with its reason, portfolio value over time, and the engine consistency check.
- tech: Trace and broker operations from src/engine/simulationController.js; consistency check in src/engine/fitnessValidator.js.

## Relations

| from | relation | to | label |
|------|----------|----|-------|
| bus_role_analyst | assigned-to | bus_proc_replay | |
| bus_role_analyst | assigned-to | bus_proc_inspect | |
| bus_actor_borsa | association | bus_proc_acquire | provides market data |
| bus_proc_acquire | flows-to | bus_proc_replay | |
| bus_proc_replay | flows-to | bus_proc_inspect | |
| bus_proc_acquire | accesses | bus_obj_snapshot | |
| bus_proc_replay | accesses | bus_obj_snapshot | |
| bus_proc_replay | accesses | bus_obj_genome | |
| bus_proc_replay | accesses | bus_obj_findings | |
| bus_proc_inspect | accesses | bus_obj_findings | |
| bus_proc_inspect | realizes | mot_goal_inspect | |
