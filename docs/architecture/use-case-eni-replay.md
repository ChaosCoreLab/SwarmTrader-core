---
title: "Use Case: Replay ENI with Fixed Genome"
layout: use-case
last_verified: 2026-10-05
status: active
archimate_model: eni-replay
value:
  who: "An analyst who needs to see how a supplied trader genome would have behaved on real market history before trusting it."
  problem: "Replay the supplied fixed genome bar by bar over ten years of ENI daily prices from Borsa Italiana, with every trade traceable to the engine step that produced it."
  impact: "A replay the analyst can inspect step by step: every buy and sell maps to a broker operation and every state to an algorithm transition."
  not_solving: "The genome stays a black box; there is no way to tell a genuine replay from a curated narrative."
---

## Goal

Inspect how the supplied fixed genome would have traded ENI on its daily price history, with every chart marker traceable to the Consilium engine step that produced it. Historical analysis only: no real trades, no profitability claim.

## ArchiMate source

The model is written in four Markdown files, one per layer, in [`archimate/eni-replay/`](https://github.com/ChaosCoreLab/SwarmTrader-core/tree/main/archimate/eni-replay): `motivationlayer.md`, `businesslayer.md`, `applicationlayer.md` and `technologylayer.md`. The diagram above and the matrix below are generated from those files by `scripts/gen-archimate.mjs`; do not edit them by hand. To change an element, click it in the diagram and follow **✎ Edit this element**, or edit the layer file and preview it with `npm run archimate:watch`.

## Layer × Aspect matrix (derived)

<!-- archimate:matrix start -->
| Layer | Active structure | Behaviour | Passive structure | Motivation |
|---|---|---|---|---|
| Motivation | — | — | — | Need to evaluate a trader genome, Inspect how the supplied fixed genome would have traded ENI, Historical analysis only |
| Business | Analyst, Borsa Italiana | Acquire ENI market history, Replay supplied fixed genome, Inspect replay | ENI price history (historical OHLCV snapshot), Supplied fixed genome, Replay findings | — |
| Application | Replay engine (SimulationController), Market data loader (DataTrainer), Consistency checker (FitnessValidator), Replay screen (Chart UI) | Advance one trading day, Record decisions and trades, Check replay consistency, Display replay | ENI trading days in memory (StockData), Fixed genome, engine format (Genoma), Day-by-day replay record (trace), Broker operations, Consistency check result | — |
| Technology | Web browser, GitHub Pages, Node.js toolchain, Borsa Italiana chart service | Static hosting, Price data refresh | ENI price file (src/data/eni-ohlcv.json), Published app files (dist/) | — |
<!-- archimate:matrix end -->

## Preconditions

- The ENI snapshot has been acquired from Borsa Italiana and is embedded in the app.
- The supplied fixed genome maps to the Consilium `Genoma` model without changing its values.

## Main flow

1. The analyst opens the browser UI; the embedded snapshot loads.
2. The UI shows actual date coverage, bar count, and source metadata.
3. Starting the replay creates one trader from the supplied fixed genome, then loads the in-memory bar stream.
4. Each step feeds exactly one bar to `Life`; state, IIR, portfolio and broker operations are captured.
5. The chart overlays IIR and actual Broker buy/sell/stop/take-profit fills; the optional state layer marks transitions.
6. At EOF, `FitnessValidator` checks the complete trace and the UI reports completion or visible errors.

## Failure paths

- Missing/corrupt snapshot or hash mismatch: show an error; keep controls disabled.
- Invalid OHLCV or date coverage: reject before creating the Individual.
- `Life.feed()` fails before EOF: stop replay and show an error; never label it complete.
- Borsa endpoint unavailable during refresh: preserve the last valid snapshot atomically; no browser runtime request is made.

## Technical depth

- [Simulator overview](../simulator-overview/) — components, data flow, replay lifecycle.
- [ADR-001: Static snapshot](../../decisions/ADR-001-static-snapshot/) — why a static snapshot and no runtime backend.
- [ADR-005: ArchiMate source in one file per layer](../../decisions/ADR-005-archimate-per-layer-source/) — how the model is written, checked and edited.
- Source: [`src/engine/simulationController.js`](https://github.com/ChaosCoreLab/SwarmTrader-core/blob/main/src/engine/simulationController.js) · [`src/engine/dataTrainer.js`](https://github.com/ChaosCoreLab/SwarmTrader-core/blob/main/src/engine/dataTrainer.js) · [`src/engine/fitnessValidator.js`](https://github.com/ChaosCoreLab/SwarmTrader-core/blob/main/src/engine/fitnessValidator.js)

<!-- archimate:gen start -->
```plantuml
@startuml
archimate
skinparam linetype ortho

package "motivation" {
  usecase "Need to evaluate a trader genome" as mot_driver_evaluate
  usecase "Inspect how the supplied fixed genome would have traded ENI" as mot_goal_inspect
  usecase "Historical analysis only" as mot_con_historical
}

package "business" {
  rectangle "Analyst" as bus_role_analyst
  rectangle "Borsa Italiana" as bus_actor_borsa
  rectangle "Acquire ENI market history" as bus_proc_acquire
  rectangle "Replay supplied fixed genome" as bus_proc_replay
  rectangle "Inspect replay" as bus_proc_inspect
  folder "ENI price history (historical OHLCV snapshot)" as bus_obj_snapshot
  folder "Supplied fixed genome" as bus_obj_genome
  folder "Replay findings" as bus_obj_findings
}

package "application" {
  component "Replay engine (SimulationController)" as app_sim_ctrl
  component "Market data loader (DataTrainer)" as app_data_trainer
  component "Consistency checker (FitnessValidator)" as app_validator
  component "Replay screen (Chart UI)" as app_chart_ui
  hexagon "Advance one trading day" as app_svc_feed
  hexagon "Record decisions and trades" as app_svc_capture
  hexagon "Check replay consistency" as app_svc_verify
  hexagon "Display replay" as app_svc_display
  folder "ENI trading days in memory (StockData)" as app_data_stockdata
  folder "Fixed genome, engine format (Genoma)" as app_data_genome
  folder "Day-by-day replay record (trace)" as app_data_trace
  folder "Broker operations" as app_data_ops
  folder "Consistency check result" as app_data_validation
}

package "technology" {
  node "Web browser" as tech_browser
  node "GitHub Pages" as tech_pages
  node "Node.js toolchain" as tech_node
  node "Borsa Italiana chart service" as tech_borsa
  hexagon "Static hosting" as tech_svc_hosting
  hexagon "Price data refresh" as tech_svc_refresh
  artifact "ENI price file (src/data/eni-ohlcv.json)" as tech_art_snapshot
  artifact "Published app files (dist/)" as tech_art_bundle
}

app_sim_ctrl *-- app_data_trainer : composes
app_sim_ctrl *-- app_validator : composes
app_sim_ctrl ..> app_svc_feed : realizes
app_sim_ctrl ..> app_svc_capture : realizes
app_validator ..> app_svc_verify : realizes
app_chart_ui ..> app_svc_display : realizes
app_sim_ctrl --> app_chart_ui : serves
app_data_trainer ..> app_data_stockdata : writes
app_svc_feed ..> app_data_stockdata : reads
app_sim_ctrl ..> app_data_genome : reads
app_svc_capture ..> app_data_ops : reads
app_svc_capture ..> app_data_trace : writes
app_svc_verify ..> app_data_trace : reads
app_svc_verify ..> app_data_validation : writes
app_svc_display ..> app_data_trace : reads
app_data_stockdata ..> bus_obj_snapshot : realizes
app_data_genome ..> bus_obj_genome : realizes
app_data_trace ..> bus_obj_findings : realizes
app_data_ops ..> bus_obj_findings : realizes
app_data_validation ..> bus_obj_findings : realizes
app_svc_feed --> bus_proc_replay : serves
app_svc_capture --> bus_proc_replay : serves
app_svc_verify --> bus_proc_replay : serves
app_svc_display --> bus_proc_inspect : serves
bus_role_analyst --> bus_proc_replay : assigned-to
bus_role_analyst --> bus_proc_inspect : assigned-to
bus_actor_borsa -- bus_proc_acquire : provides market data
bus_proc_acquire --> bus_proc_replay : flows-to
bus_proc_replay --> bus_proc_inspect : flows-to
bus_proc_acquire ..> bus_obj_snapshot : accesses
bus_proc_replay ..> bus_obj_snapshot : accesses
bus_proc_replay ..> bus_obj_genome : accesses
bus_proc_replay ..> bus_obj_findings : accesses
bus_proc_inspect ..> bus_obj_findings : accesses
bus_proc_inspect ..> mot_goal_inspect : realizes
mot_driver_evaluate ..> mot_goal_inspect : influences
mot_con_historical ..> mot_goal_inspect : influences
tech_pages ..> tech_svc_hosting : realizes
tech_pages --> tech_art_bundle : stores
tech_svc_hosting --> tech_browser : serves
tech_browser --> tech_art_bundle : runs
tech_node ..> tech_svc_refresh : realizes
tech_borsa --> tech_svc_refresh : serves
tech_svc_refresh ..> tech_art_snapshot : writes
tech_art_bundle o-- tech_art_snapshot : embeds at build
tech_art_snapshot ..> app_data_stockdata : realizes
tech_art_bundle ..> app_chart_ui : realizes
tech_art_bundle ..> app_sim_ctrl : realizes
tech_art_bundle ..> app_data_trainer : realizes
tech_art_bundle ..> app_validator : realizes
tech_svc_refresh --> bus_proc_acquire : serves
@enduml
```
<!-- archimate:gen end -->
