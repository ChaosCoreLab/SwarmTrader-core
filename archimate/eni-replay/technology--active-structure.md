---
use_case: eni-replay
layer: technology
aspect: active-structure
elements:
  - id: tech_browser
    type: node
    name: Browser runtime
  - id: tech_node
    type: node
    name: Node.js offline toolchain
  - id: tech_vite
    type: system-software
    name: npm/Vite toolchain
relationships:
  - from: tech_browser
    to: tech_vite
    type: used-by
  - from: tech_node
    to: tech_vite
    type: used-by
last_verified: 2026-09-29
---

# Technology / Active structure

The **Browser runtime** runs the static app; **Node.js** is used only offline for data refresh/build/test via the **npm/Vite toolchain**.

## Riferimenti
- [Development operations](../../docs/operations/development.md)
