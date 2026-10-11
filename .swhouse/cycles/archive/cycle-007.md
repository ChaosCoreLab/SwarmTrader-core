---
cycle: 007
status: closed
opened: 2026-10-05
closed: 2026-10-11
decision: ACCEPTED
problem: "Rebuild the ENI replay ArchiMate model per the Owner review, in one editable file per layer, with automated model checks and a full-width diagram"
track: M
---

## Step 1 — COORDINATOR

**Agent:** claude-opus-5-5
**Track:** M — feature work on the product documentation, applying the rules decided in cycle 006.

**Problem:** the published model was wrong in content (Owner review, `human-interaction/02-human-feedback-of-archimate-doc.md`) and hard to edit (11 YAML cell files).
**Scope IN:** new model content; one file per layer (Owner choice); generator checks with Italian messages; edit link and live preview; full-width diagram; stale references across the docs; NRC items.
**Scope OUT:** the latent sell-marker bug in `src/main.js` (see Step 9; proposed as cycle 008); new use cases.
**Context check:** memory `archimate-model-scope`, error `2026-10-05-archimate-model-semantic-defects`, protocol `archimate-modeling.md` (cycle 006). Modules touched: `archimate/**`, `scripts/gen-archimate.mjs`, docs, layout/CSS, `assets/js/archimate-browser.js`; `src/` untouched. NRC-H02 (new) triggered.

## Step 2 — PRODUCT OWNER

**Who:** the Owner and stakeholders reading the use-case page.
**AC — content (Rule 6):**
- AC-01: every point of the Owner review is resolved.
- AC-02: no delivery-organization element, no code helper as element (Rules 1–2).
- AC-03: no isolated element; every layer linked to the one above (Rule 3).
- AC-04: role/tech texts true against the code; no stale paths.
**AC — editability and rendering:**
- AC-05: one Markdown file per layer; relations in the `from` element's file.
- AC-06: checks fail with Italian messages naming file and line; run in CI.
- AC-07: edit link per element; live preview on save.
- AC-08: the diagram spans the page width.
- AC-09: NRC-H02 Owner walkthrough passed (gate for ACCEPTED).

## Step 3 — ARCHITECT

- Format: `### Name` + `- field: value` per element (readable prose), relations as a table (short fields). Chosen over wide tables (long role text unreadable) and YAML (harder to hand-edit).
- Relations owned by the `from` element's file: a deterministic home for cross-layer relations.
- ArchiMate relation names (`serves` instead of `used-by`): source and diagram read the same way; the direction-reversal hack is removed.
- Generator split into exported functions (parse, load, check, build) so tests and the watch script reuse them.
- Layout: diagram section outside the nav grid, page width up to 1680 px; nav (180 px) beside the prose below.

## Step 5 — CRITIC

- Renaming elements to business names may confuse the Owner, who referred to code names → keep the code name in parentheses.
- Checks catch structure, not meaning → independent model review (Step 9) and NRC-H02 remain necessary.
- Edit link requires GitHub write access → acceptable for the Owner; documented in ADR-005.

## Step 7 — BUILDER

- `archimate/eni-replay/{motivation,business,application,technology}layer.md` (old 11 cell files removed); `_vocabulary.md` (driver/stakeholder/device; `serves`, `influences`, `association`, `aggregates`).
- `scripts/gen-archimate.mjs` rewritten around the per-layer parser and `checkModel` (isolated elements, layer links, types, ids, relation file, stale paths; warning for data objects without business object); SVG emitter removed; `--check` covers the HTML fragment too.
- `scripts/archimate-watch.mjs` (live preview, reload on save); `tests/archimate.test.js` (4 tests).
- `assets/js/archimate-browser.js`: edit link in the element detail. `_layouts/use-case.html` + `style.css`: full-width diagram.
- Docs: use-case page, ADR-005 (new), ADR-002/004 status, MAP, operations, simulator overview and README (stale `public/data` paths, source links to GitHub), `_data/docs.yml`; NRC-A05/H02; memory patterns.
- CI: `archimate:check` replaces the SVG step.

**Self-Test Log:**
```
Component: model + generator
  Test: npm run archimate:check
  Actual: valid, 32 elements, 51 relations, generated files up to date
  Before (cycle 005): 37 elements, 22 relations, 0 cross-layer, 11 isolated, 7 stale paths
  After: 16 cross-layer relations, 0 isolated, 0 stale paths
  Result: PASS
Component: unit tests
  Test: npm test
  Actual: 20 pass, 0 fail (16 existing + 4 archimate)
  Result: PASS
Component: ArchiMate browser (live preview)
  Test: Playwright headless at 1440 and 390 px — hover, click, edit link, console
  Actual: 32 boxes, arrows drawn, highlight on hover, detail opens with edit URL, no page overflow, no console errors
  Result: PASS
```

## Step 8 — OPTIMIZER

Removed the unused SVG emitter and `archimate:svg`/`archimate:html` scripts; one command (`archimate:gen`) writes every output.

## Step 9 — SCIENTIST

**Independent model review** (separate agent, content only, against Rules 1–3, the Owner review and the code). Verdict: all Owner points resolved; fixes required before walkthrough. Applied:
- F-1 broker operations: closes are genome sell / take-profit / stop-loss (no "signal" sell).
- F-2 chart: two price IIR lines (volume IIR in inspector), state-change markers optional.
- F-3 replay engine composes the market data loader and the consistency checker (matches the constructor).
- F-4 app files realize all four components and embed the price file.
- F-5/R1-b toolchain = data refresh only; Owner-confirmation date removed from Borsa's role.
- F-6 display reads the replay record only. F-8 "owner" → "analyst".
- R1-a analyst no longer assigned to data acquisition (maintenance step, Rule 1).
- J-5 consistency check serves the replay process (it runs inside it).
- Business-readable names with code names in parentheses.

**Finding outside scope (latent product bug):** `src/main.js` labels a genome sell (close reason `'sell'`) as "SL" on the chart, and the ledger shows the raw reason. Latent for ENI: all 36 closes in the golden trace are take-profit. Proposed as cycle 008 (Track S, red test first).

**Open questions for the Owner (judgement):**
1. Should the Consilium trading engine appear as its own Application element?
2. Should the trace consistency check stay in the business-facing "Replay findings", given the decision to hide data-integrity checks?

**NRC:** Type-A: NRC-A01/A02/A05 via `npm test` + `archimate:check` — pass. NRC-A03/A04 not triggered (`src/` untouched). **NRC-H02: PENDING_HUMAN** — Owner walkthrough on the published page.

### Step 9 — resumed 2026-10-11 (Owner walkthrough)

**NRC-H02: ✅ VERIFIED** — Owner (Simone, U422756) walked through the published model (deploy of `ed2aeb0`, Pages run successful 2026-10-05). Verdict: pass ("esito ottimo"), no disagreement noted.

**Owner answers to the open questions:**
1. The Consilium trading engine is its own Application element → added `app_consilium` "Trading engine (Consilium)" (application-component): serves the replay engine, reads the engine-format genome, writes the broker operations; realized by the published app files. The replay engine's `tech` text now points to it instead of naming the vendored modules.
2. The trace consistency check stays in "Replay findings" → no change.

**Re-check after the change:** `npm run archimate:check` → valid, 33 elements, 55 relations, generated files up to date; `npm test` → 20 pass, 0 fail. The change adds one element and four relations required by the Owner's answer; it does not alter the walked-through content, so NRC-H02 is not repeated.

## Step 10 — LIBRARIAN

- Memory updated: `errors/2026-10-05-archimate-model-semantic-defects.md` (resolution: cycle 007 accepted on Owner content walkthrough, first application of Rule 6).
- NRC: NRC-H02 marked ✅ VERIFIED 2026-10-11. No human-reported product bug fixed in this cycle, so no new NRC item is required; NRC-A05 and NRC-H02 were added in Step 7.
- Documentation: `docs/MAP.md` dates for the use-case page and the layer files; ADR-005 written in Step 7; operations updated in Step 7.

**Close checklist:**
- [x] `metrics/summary.yaml` — `total_cycles` 7, status counts, `last_updated` 2026-10-11
- [x] Memory entry updated (error record above)
- [x] Failures logged: the semantic-defect error is the one that opened cycles 006–007; no new failure in this cycle
- [x] No deployment target added or removed: validation matrix unchanged
- [x] `docs/MAP.md` updated; architecture page `last_verified` updated by the generator run; ADR-005 present; operations reflects `archimate:watch`/`gen`/`check`

## Step 11 — EVOLUTION MASTER

**Cycle quality score:** 4 — the rules from cycle 006 turned into automated checks and a content gate that worked: the independent review (Step 9) caught the remaining content errors before the Owner saw the model, and the Owner walkthrough passed at the first attempt.
**Process observation:** the cycle stayed open six days waiting for NRC-H02 while a second operator worked in parallel; the same cycle number (006) was used on two machines and the follow-up proposal "cycle 008" in Step 9 was taken by another cycle. Cycle numbers should be assigned after checking open PRs and remote branches (see `memory/decisions/2026-10-11-parallel-cycle-exception.md` in branch `epic-genoma-non-fsm`).

## Step 12 — ARBITER

**Decision:** ACCEPTED.
**Rationale:** every content and editability AC (AC-01–AC-08) is met and verified by `archimate:check`, the unit tests and the Step 9 independent review. AC-09, the Owner model walkthrough (NRC-H02), passed on 2026-10-11, and the Owner's two open questions are answered and applied. The Type-A NRC items for the touched modules pass, and the Step 10 close checklist is complete.
**Carried forward:** the latent sell-marker bug in `src/main.js` (Step 9) is still open; it goes to the next free cycle number (not 008, which is already used), Track S, red test first.
