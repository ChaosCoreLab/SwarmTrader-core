---
use_case: eni-replay
layer: technology
aspect: behaviour
elements:
  - id: tech_svc_render
    type: technology-service
    name: Local static fetch and render
  - id: tech_svc_borsa
    type: technology-service
    name: Borsa POST (explicit update only)
relationships:
  - from: tech_browser
    to: tech_svc_render
    type: realizes
  - from: tech_node
    to: tech_svc_borsa
    type: realizes
last_verified: 2026-09-29
---

# Technology / Behaviour

The browser realizes local static fetch+render; Node realizes the Borsa POST, performed only during an explicit data update.

## Riferimenti
- [fetch-eni-data.mjs](../../scripts/fetch-eni-data.mjs)
