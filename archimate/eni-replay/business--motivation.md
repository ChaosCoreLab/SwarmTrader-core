---
use_case: eni-replay
layer: business
aspect: motivation
elements:
  - id: bus_goal_inspect
    type: goal
    name: Reproducible inspection of historical behavior
    role: Lets an operator replay the fixed Consilium genome over the immutable ENI snapshot and verify every chart marker traces back to a specific engine frame — inspection, not prediction.
    tech: "Stated in docs/architecture/use-case-eni-replay.md §Goal and docs/architecture/simulator-overview.md §Purpose; no runtime code."
  - id: bus_val_noprofit
    type: value
    name: No profitability promise
    role: Explicitly disclaims that the ENI replay is a profitability claim or trading system; the tool only inspects historical behavior reproducibly.
    tech: "Asserted in docs/architecture/simulator-overview.md §Purpose and docs/architecture/use-case-eni-replay.md frontmatter value.not_solving; no runtime code."
  - id: bus_req_snapshot
    type: requirement
    name: Immutable approved snapshot
    role: Mandates an immutable, SHA-256-verified ENI OHLCV snapshot with the approved 2026-09-28 cutoff as the sole replay input; sourced offline from Borsa Italiana and never mutated at runtime.
    tech: "src/data/eni-ohlcv.json; validated by src/engine/snapshotValidator.js (REQUIRED_CUTOFF_DATE='2026-09-28', dataSha256); written by scripts/fetch-eni-data.mjs; versioned in Git, Owner-confirmed Borsa Italiana reuse 2026-09-29."
last_verified: 2026-09-29
---

# Business / Motivation

The fixed-genome replay exists to let an operator **inspect** historical buy/sell behavior reproducibly. It explicitly carries **no profitability promise** (value). It requires an **immutable, approved ENI snapshot** as input (requirement), sourced offline from Borsa Italiana.

## Riferimenti
- [ADR-001 static snapshot](../../docs/decisions/ADR-001-static-snapshot.md)
