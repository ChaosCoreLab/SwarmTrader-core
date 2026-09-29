---
use_case: eni-replay
layer: business
aspect: behaviour
elements:
  - id: bus_proc_acquire
    type: business-process
    name: Acquire approved snapshot
  - id: bus_proc_replay
    type: business-process
    name: Replay fixed genome
  - id: bus_proc_inspect
    type: business-process
    name: Inspect and document results
relationships:
  - from: bus_proc_acquire
    to: bus_proc_replay
    type: flows-to
  - from: bus_proc_replay
    to: bus_proc_inspect
    type: flows-to
last_verified: 2026-09-29
---

# Business / Behaviour

Three business processes flow in sequence: **acquire** an approved snapshot, **replay** the fixed genome, then **inspect and document** results.

## Riferimenti
- [Use case main flow](../../docs/architecture/use-case-eni-replay.md)
