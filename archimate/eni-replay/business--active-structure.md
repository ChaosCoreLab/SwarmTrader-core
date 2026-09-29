---
use_case: eni-replay
layer: business
aspect: active-structure
elements:
  - id: bus_actor_operator
    type: business-actor
    name: Operator
  - id: bus_role_owner
    type: business-role
    name: Product Owner
  - id: bus_role_librarian
    type: business-role
    name: Librarian
relationships:
  - from: bus_role_owner
    to: bus_role_librarian
    type: composes
    label: documentation governance
last_verified: 2026-09-29
---

# Business / Active structure

The **Operator** drives the replay; the **Product Owner** owns acceptance and the **Librarian** keeps documentation current. The Owner composes the Librarian role for documentation governance.

## Riferimenti
- [NRC-H01 procedure](../../.swhouse/memory/validation/non_regression_checklist.md)
