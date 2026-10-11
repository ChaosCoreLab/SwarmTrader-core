---
date: 2026-10-11
cycle: 010
title: Conventions for research documents of the epic
status: active
superseded_by: null
---

## Context
The epic "non-FSM genome" (issue #4) has research issues (R1-R6) whose product is a document in `docs/`, not code. The existing docs are in English and written for engineers; the operator and the readers of these documents (Luca, Simone) are technical-scientific but not necessarily financial. Cycle 010 (R1, issue #5) set the conventions below.

## Decision
- **Language: Italian** (operator answer 1, cycle 010), although the other `docs/` documents are in English; the document says so in its opening.
- **Mathematics: intermediate level** (operator answer 2): sums, thresholds, activation functions, simple recursions; symbols defined at first appearance; no proofs.
- **Finance terms** are explained at first occurrence and collected in a short glossary (operator answer 2).
- **Opening summary for the decision** (the reader who must choose reads chapter 1 and the comparison grid; the rest is reference).
- **No promise of profitability:** no return figure without a source; an external result is quoted as the result of that study, with its conditions; forms are compared on expressiveness, searchability, interpretability, evaluation cost and integration, never on expected return.
- **Every non-trivial claim carries a source** (reference, verified URL, or `path/to/code` with lines) **or is marked `[ipotesi]`** (`[ipotesi, fonte da verificare]` when a source is expected); each source states whether it was read, or only its card or abstract. Commercial material and non-reproducible backtests are not admitted as proof (acceptance criteria AC-04 and AC-06 of cycle 010).
- **Length:** the operator accepts a document above the stated criterion when the criteria for completeness require it (cycle 010: about 8,400 words against 5,500-6,500; reading path via the summary and the grid). A length target is a goal, not a reason to drop a required dimension of the review.
- **The choice stays with the operator:** a research document proposes 1-2 candidates with discard conditions and what could not be established; the choice is recorded in the cycle file under `## Human Verification`.

## Rationale
The operator stated the first, second and third points in cycle 010; the no-promise and source rules are acceptance criteria that the cycle's Product Owner derived from the project principle (the PoC is a tool for historical inspection, not a trading promise); the opening summary was asked by the coordinator at Step 8; the length exception is an explicit operator decision. Having them in one place avoids re-asking in R2-R6.

## Consequences
- R2-R6 documents start from these conventions unless the operator changes them for a cycle.
- Documents in Italian live in the English-language docs tree; the menu entry and the front matter are the only link to the other docs.
- Reviews of such documents use [[independent-verification-chain-research]].

## Confidence
Medium — language, mathematics, glossary and length are explicit operator answers; the other points come from cycle 010's acceptance criteria and coordinator choices, and are extended here to the epic's research cycles without a new explicit confirmation by the operator.
