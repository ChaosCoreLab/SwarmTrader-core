---
use_case: eni-replay
layer: business
aspect: passive-structure
elements:
  - id: bus_obj_acceptance
    type: business-object
    name: Acceptance criteria
  - id: bus_obj_snapshot
    type: business-object
    name: Historical OHLCV snapshot
  - id: bus_obj_findings
    type: business-object
    name: Replay findings
last_verified: 2026-09-29
---

# Business / Passive structure

The business consumes/produces three passive objects: **acceptance criteria**, the **historical OHLCV snapshot**, and the **replay findings** produced by inspection.

## Riferimenti
- [Cycle acceptance criteria](../../.swhouse/cycles/archive/cycle-001.md)
