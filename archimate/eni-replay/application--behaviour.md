---
use_case: eni-replay
layer: application
aspect: behaviour
elements:
  - id: app_svc_validate
    type: application-service
    name: Validate snapshot
  - id: app_svc_adapt
    type: application-service
    name: Adapt genome
  - id: app_svc_feed
    type: application-service
    name: Feed bars
  - id: app_svc_capture
    type: application-service
    name: Capture state/IIR/trades
  - id: app_svc_verify
    type: application-service
    name: Verify invariants
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
