---
use_case: eni-replay
layer: business
aspect: motivation
elements:
  - id: bus_goal_inspect
    type: goal
    name: Reproducible inspection of historical behavior
  - id: bus_val_noprofit
    type: value
    name: No profitability promise
  - id: bus_req_snapshot
    type: requirement
    name: Immutable approved snapshot
last_verified: 2026-09-29
---

# Business / Motivation

The fixed-genome replay exists to let an operator **inspect** historical buy/sell behavior reproducibly. It explicitly carries **no profitability promise** (value). It requires an **immutable, approved ENI snapshot** as input (requirement), sourced offline from Borsa Italiana.

## Riferimenti
- [ADR-001 static snapshot](../../docs/decisions/ADR-001-static-snapshot.md)
