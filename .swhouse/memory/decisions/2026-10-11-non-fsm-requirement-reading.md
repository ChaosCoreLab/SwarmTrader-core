---
date: 2026-10-11
cycle: 010
title: The requirement "not a state machine" is not strict; HMM and recurrent networks are admitted as forms to evaluate
status: active
superseded_by: null
---

## Context
The operator asked for a genome that is not a state machine, with the memory of the past coming from qualified financial indicators. In cycle 010 (R1, issue #5) the CRITIC showed that this is ambiguous: an HMM is a probabilistic state machine, NEAT admits recurrent connections, GP admits registers (see [[genome-forms-state-memory]]), and asked the operator which reading holds.

## Decision
Operator answer to question 1 (2026-10-11): the requirement is **not strict**. HMM (hidden states) and networks with recurrent connections are admitted as forms to evaluate. The review treats them as ordinary candidates and reports their closeness to a state machine where it exists.

**Resolved 2026-10-18:** question 2 answered (only feedforward variants with the memory in upstream indicators); the form chosen is the linear score, see [[2026-10-18-genome-form-linear-score]].

## Rationale
It avoids discarding forms in advance on a reading of the requirement the operator does not hold, and keeps the comparison on the same yardstick for every form.

## Consequences
- HMM and recurrent NEAT are valid for R3, R4 and E2 if the operator chooses them; the look-ahead risk of HMM parameter estimation goes to R6.
- Question 2 answered 2026-10-18: memory only in indicators; see [[2026-10-18-genome-form-linear-score]]. HMM and recurrent networks therefore are not chosen, though they remain admitted as forms.

## Confidence
High. Question 2 resolved in [[2026-10-18-genome-form-linear-score]].
