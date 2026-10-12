---
cycle: 006
status: closed
opened: 2026-10-05
closed: 2026-10-05
decision: ACCEPTED
problem: "Turn the Owner's ArchiMate content review into framework rules so the delivery process stops producing visually correct but semantically wrong models"
track: SA
---

## Step 1 — COORDINATOR

**Agent:** claude-opus-5-5
**Track:** SA — process retrospective and framework modification (single-model deployment).

**Problem:** the Owner's review (`human-interaction/02-human-feedback-of-archimate-doc.md`) rejected the content of the ENI replay ArchiMate model that cycle 005 had accepted on visual confirmation. Measured: 0 cross-layer relations, 11/37 isolated elements, framework roles and code helpers modeled as architecture, 7 stale `tech` paths.

**Scope IN:** framework rules (what goes into a model, relation completeness, editable per-layer source, automated checks, content acceptance separate from rendering); project error record.
**Scope OUT:** rebuilding the ENI model (cycle 007).

**Owner decisions (2026-10-05):** coordinate labels in the feedback file corrected (Business Layer, not Motivation Layer); actors = analyst + Borsa Italiana; data integrity is not shown to stakeholders (remove Validate snapshot and its motivation element); one md file per layer; sequence 006 framework → 007 product; terminology "supplied fixed genome" (not "mock").

**Context check:** memory `archimate-model-scope`, error `2026-10-05-archimate-model-semantic-defects`, ADR-002, ADR-004. No NRC module touched (framework text only). No H-item triggered.

## Step 2 — PRODUCT OWNER

**Who:** the Owner and every future project that documents use cases in ArchiMate.
**Value:** models that are correct in content, not just in looks; fewer review rounds.
**Cost of not solving:** each new use case repeats the same defects; the Owner becomes the only quality gate.
**AC:**
- AC-01: a framework protocol states what belongs in a model (scope, significance, relation completeness).
- AC-02: the source layout is per layer, with relations owned by the `from` element's file.
- AC-03: automated checks are specified (isolated elements, layer links, vocabulary, stale paths).
- AC-04: Step 2 of the operational cycle separates content AC from rendering AC.
- AC-05: Owner content walkthrough is a required gate.
- AC-06: the failure is logged in `memory/errors/`.

## Step 3 — ARCHITECT

Decomposition: one new protocol (`archimate-modeling.md`) holding Rules 1–6; small edits to `documentation.md` (per-layer layout, link to the protocol), `operational-cycle.md` Step 2 (content vs rendering, universal), `07-librarian.md` (DWOs against layer files).
Alternative considered: put all rules into `documentation.md`. Rejected: that protocol is about where docs live; modeling content is a different question (single-question rule).

## Step 5 — CRITIC

- Risk: Rule 2 (significance) is a judgement call. Mitigation: phrased as a test question; the Owner walkthrough is the final gate.
- Risk: per-layer files reverse ADR-002 (Owner's own cycle-003 choice). Mitigation: Owner chose the per-layer layout explicitly on 2026-10-05; ADR-005 in cycle 007 will supersede ADR-002.
- Universality (Article 21): the rules name ArchiMate concepts and a review contract, not a tool. The Step 2 rule applies to any representational deliverable. Passes.

## Step 7 — BUILDER

- Created `software-house-ai/protocols/archimate-modeling.md` (Rules 1–6).
- `protocols/documentation.md`: per-layer layout, superseded note, link to the modeling protocol.
- `protocols/operational-cycle.md` Step 2: content vs rendering AC.
- `agents/07-librarian.md`, `protocols/documentation-presentation.md`: "cells" → "layer files".
- `.swhouse/memory/errors/2026-10-05-archimate-model-semantic-defects.md`.
- Feedback file coordinates corrected per Owner (item 1).

Self-Test: documentation-only change; checked that no framework file still points to the per-cell layout as current (`grep cells` → only matrix-cell wording remains). Result: PASS.

## Step 8 — OPTIMIZER

Rules kept to six; the automated checks are listed, not implemented here (implementation belongs to the product generator in cycle 007).

## Step 9 — SCIENTIST

Verification: read-through against the Owner's feedback items — every item maps to a rule (roles/AC → Rule 1; FixedGenomeGA/Adapt genome → Rule 2; missing arrows → Rule 3; editability → Rule 4; stale paths → Rule 5; accepted-on-looks → Rule 6). Open hypothesis: whether the rules prevent recurrence is verified by applying them in cycle 007 (lint + Owner walkthrough).
NRC: no NRC module touched.

## Step 10 — LIBRARIAN

New: framework protocol, error record. Updated: framework docs above. Memory link: error ↔ `archimate-model-scope`. Close checklist: metrics updated at archive; memory entry written; failure logged; no deployment target changed; project `docs/` unchanged in this cycle (ADR-005 and MAP update are planned in cycle 007).

## Step 11 — EVOLUTION MASTER

**Cycle quality score:** 4 — the review turned five separate complaints into root causes, and the protocol now blocks each one at a specific step.
**Process observation:** the earlier verification workflow had four lenses and none of them was "is the model right?"; lens choice should start from what the deliverable claims, not from how it is built.

## Step 12 — ARBITER

**Decision:** ACCEPTED.
**Rationale:** all AC are met by the protocol and the edits. The Owner validated the strategy and its sequence on 2026-10-05. The protocol's effectiveness is tested in cycle 007, which must apply Rules 1–6 and pass the Owner walkthrough before it can be accepted.
