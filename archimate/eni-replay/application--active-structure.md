---
use_case: eni-replay
layer: application
aspect: active-structure
elements:
  - id: app_sim_ctrl
    type: application-component
    name: SimulationController
  - id: app_data_trainer
    type: application-component
    name: DataTrainer
  - id: app_ga
    type: application-component
    name: FixedGenomeGA
  - id: app_validator
    type: application-component
    name: FitnessValidator
  - id: app_chart_ui
    type: application-component
    name: Chart UI
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
