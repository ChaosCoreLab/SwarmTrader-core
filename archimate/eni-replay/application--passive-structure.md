---
use_case: eni-replay
layer: application
aspect: passive-structure
elements:
  - id: app_data_stockdata
    type: data-object
    name: StockData
  - id: app_data_genome
    type: data-object
    name: genome
  - id: app_data_trace
    type: data-object
    name: trace frames
  - id: app_data_ops
    type: data-object
    name: broker operations
  - id: app_data_validation
    type: data-object
    name: validation result
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
