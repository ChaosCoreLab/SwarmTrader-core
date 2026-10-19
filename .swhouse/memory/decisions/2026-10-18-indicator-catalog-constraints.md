---
date: 2026-10-18
cycle: 011
title: Constraints for the input indicators of the linear-score genome (R2, issue #6)
status: active
superseded_by: null
---

## Context
Cycle 011 (R2, issue #6, epic #4) builds the catalog of streaming indicators that the linear score ([[2026-10-18-genome-form-linear-score]]) may use as inputs and as its only memory of the past. The operator answered two questions at Step 1 and four at Step 5 (all on 2026-10-18; recorded in the cycle file).

## Decision
- **Evolvable families admitted** (Step 1, answer 1): an indicator may carry parameters (e.g. the `c` of an EMA) as genes evolved by the GA, besides fixed inputs.
- **At most 10 inputs**, up to **12 only if strategic**, with the reason written in the document (Step 1, answer 2). "Input" = a term of the weighted sum; parameters are genes and do not count in the limit (they count in the genome size, R3). The catalog may be wider than the admitted list.
- **Q1 — price of the indicators: the close**, not `(O+H+L+C)/4` as in the Consilium filters (see [[consilium-ohlc4-input-price]]).
- **Q2 — counting rule C2:** every term of the sum counts one, and a term that is an exact linear combination of other present inputs is not admitted (e.g. log MACD next to two distances with the same speeds; %B next to the Bollinger z; see [[indicator-algebraic-identities]]).
- **Q3 — evidence of redundancy:** algebraic identities and a synthetic series are the main proof; the ENI snapshot is only a declared boundary check and does not drive the choice of inputs (it is the data R6 will evaluate on).
- **Q4 — simulator sell price:** the sell on signal at the bar average and stops at the threshold ([[consilium-trader-order-timing]]) are **declared as a risk to R6 and E2**; Consilium's code is not touched and no separate issue is opened.

**Not decided here:** the final list of inputs and questions D1-D4 of the catalog (list, level/trend block, ATR as a direct input, distance from the maximum). They are Luca's, open at the time of writing, and go into the cycle file's `## Human Verification`.

## Rationale
The close keeps formulas checkable against TA-Lib and avoids persistence built by averaging; C2 makes the limit measure information instead of names; identities and synthetic data avoid choosing inputs on the evaluation data; leaving the vendor untouched keeps the golden comparison valid ([[2026-09-29-consilium-v1-golden-reference]]).

## Consequences
- R3 receives the admitted inputs, their genes (continuous `c` preferred to integer windows, which change state size and warm-up) and the gene count; R4 receives normalised, dimensionless inputs; R6 receives the sell-price risk, the warm-up per input and the warning that ENI correlations are unstable between stretches.
- E2 implements the admitted indicators on the close through the strategy contract ([[2026-10-11-strategy-contract]]), with the skip rule for zero denominators ([[eni-flat-bar-and-non-finite-indicators]]).
- Document: `docs/architecture/genome-indicators-catalog.md`.

## Confidence
High for the six operator answers (explicit). The final input list is pending.
