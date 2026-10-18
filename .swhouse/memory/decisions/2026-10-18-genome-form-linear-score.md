---
date: 2026-10-18
cycle: 010
title: First non-FSM genome form is the linear score with thresholds, memory only in indicators
status: active
superseded_by: null
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
- Supersedes the "question 2 pending" note of [[2026-10-11-non-fsm-requirement-reading]].

## Confidence
High (explicit operator choice). The merit of the form against the FSM is untested.
