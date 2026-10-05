---
date: 2026-10-05
cycle: outside-cycle
severity: medium
occurred_at: 2026-09-30T15:00
logged_at: 2026-10-05T10:00
---

## What was attempted
Publish the ENI replay ArchiMate model (cycles 003–005) and accept it after the Owner confirmed the rendering.

## What was observed
Owner review (`human-interaction/02-human-feedback-of-archimate-doc.md`) found wrong content: software-house-ai roles (Product Owner, Librarian) and acceptance criteria in the Business layer, code helpers (FixedGenomeGA, Adapt genome) as elements, missing arrows between data and business objects. Measured on the published model: 37 elements, 22 relations, **0 cross-layer relations**, 11 isolated elements (the whole Motivation row among them), 7 `tech` texts quoting the obsolete path `public/data/eni-ohlcv.json`.

## Root cause
1. The delivery organization was modeled instead of the product.
2. Code classes were mapped one-to-one instead of filtering for architectural significance.
3. One file per cell gave cross-layer relations no home, so none were written.
4. Verification checked rendering, JavaScript and data consistency, never model correctness; enrichment agents read stale docs.
5. Cycle 005 acceptance criteria covered appearance only, so a visually correct model was accepted.

## How it was detected
Owner content review of the published page, after cycle 005 had closed ACCEPTED on visual confirmation.

## Resolution
Cycle 006 (Track SA) added `software-house-ai/protocols/archimate-modeling.md` and the content-vs-rendering rule in `operational-cycle.md` Step 2. Cycle 007 rebuilds the model in per-layer files with automated checks.

## Lesson
A model is accepted on content, not on looks. Model the product only; keep significant elements; connect every element and every layer; check `tech` text against the code. The Owner's content walkthrough is a separate gate from visual confirmation.

## Related
[[archimate-model-scope]] · cycles 003, 004, 005 · ADR-002, ADR-004
