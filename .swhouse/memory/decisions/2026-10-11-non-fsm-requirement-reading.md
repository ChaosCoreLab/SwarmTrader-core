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

**Still open:** question 2 — whether recurrences (NEAT) and registers (GP) are admitted, or only feedforward variants with the memory in upstream indicators. The review describes both variants and does not choose. The **choice of the form itself** is not made and is not recorded here.

## Rationale
It avoids discarding forms in advance on a reading of the requirement the operator does not hold, and keeps the comparison on the same yardstick for every form.

## Consequences
- HMM and recurrent NEAT are valid for R3, R4 and E2 if the operator chooses them; the look-ahead risk of HMM parameter estimation goes to R6.
- When question 2 is answered, supersede or extend this entry.

## Confidence
High for what was answered (question 1); question 2 pending.
