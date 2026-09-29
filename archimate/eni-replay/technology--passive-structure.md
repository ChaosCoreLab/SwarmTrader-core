---
use_case: eni-replay
layer: technology
aspect: passive-structure
elements:
  - id: tech_art_snapshot
    type: artifact
    name: public/data/eni-ohlcv.json
  - id: tech_art_hash
    type: artifact
    name: SHA-256 manifest
  - id: tech_art_bundle
    type: artifact
    name: bundled JS/CSS/fonts
relationships:
  - from: tech_svc_render
    to: tech_art_bundle
    type: accesses
  - from: tech_svc_render
    to: tech_art_snapshot
    type: accesses
  - from: tech_svc_borsa
    to: tech_art_snapshot
    type: accesses
  - from: tech_svc_borsa
    to: tech_art_hash
    type: accesses
last_verified: 2026-09-29
---

# Technology / Passive structure

Technology artifacts: the versioned snapshot, its SHA-256 manifest, and the bundled JS/CSS/fonts served statically.

## Riferimenti
- [ADR-001 static snapshot](../../docs/decisions/ADR-001-static-snapshot.md)
