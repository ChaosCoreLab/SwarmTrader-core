---
date: 2026-10-18
cycle: 010
title: First non-FSM genome form is the linear score with thresholds, memory only in indicators
status: active
superseded_by: null
updated: 2026-11-15 (cycle 012 — R3 Step 1 answers; encoding pending); 2026-10-19 (cycle 011 — R2 constraints linked)
---

## Context
Cycle 010 (R1, issue #5, epic #4) compared genome forms against the strategy contract. The operator answered the open questions on the guide `docs/architecture/genome-forms-guide.md` and then chose the form.

## Decision
Operator answers (2026-10-18):
- Q2: memory of the past lives **only in the indicators** (EMAs of price and volume and similar). No variables carried by the genome, no portfolio state supplied by the engine, no free recurrent state. HMM and recurrent networks stay admitted as forms by [[2026-10-11-non-fsm-requirement-reading]] but are not compatible with this reading of Q2.
- Q3: the decision must be intuitable, not necessarily computable by hand; the effort spent on interpretability in R4 stays balanced, not a dominant constraint.
- Q4: start with **one form**.
- Q5: the null experiment is kept in mind, following section 2.6.5 of the guide (three separate data sets); detailed design goes to R6.
- Choice: **linear score of indicators with buy/sell thresholds**. Rule list is the natural next step if volume interactions turn out to matter; trees/GP stay a later option.

## Rationale
Fixed-length vector of weights fits the existing crossover/mutation, reads at a glance, has few parameters for the null experiment, and compares directly with the FSM genome.

## Consequences
- R2 (indicators), R3 (encoding), R4 (buy/stay/sell equations), R5 (fitness) and R6 (selection, null experiment) work on the linear score; E2 implements it through the strategy contract ([[2026-10-11-strategy-contract]]).
- The indicator pool must include several speeds of EMA and volume ratios, since interactions cannot be expressed by the form itself.
- R2 (cycle 011, issue #6): input constraints (close, counting rule C2, at most 10 inputs or 12 if strategic, evolvable families) in [[2026-10-18-indicator-catalog-constraints]]; the list of inputs is chosen by Luca on `docs/architecture/genome-indicators-catalog.md`.
- Supersedes the "question 2 pending" note of [[2026-10-11-non-fsm-requirement-reading]].
- R3 (cycle 012, issue #7): operator answers at Step 1 (2026-11-14): the 7 inputs are **always active** (fixed length, no presence gene; a useless input shows as a small weight); duplicates are recognised **by behaviour** (canonical form removing the symmetries that leave decisions unchanged, hash on it) and **only flagged**, removal left to E3 (#13). The encoding itself is **not decided**: Q1-Q11 of `docs/architecture/genome-encoding.md` are open for Luca, and the document's proposal (15 genes, centre `b` with half-width 1, `τ` = log of mean age, block crossover, Gaussian mutation with reflection, exact hex hash) is a proposal, not a decision. Facts found on the way: [[consilium-duplicate-genomes]], [[float-serialisation-node-python]].

## Confidence
High (explicit operator choice). The merit of the form against the FSM is untested.
