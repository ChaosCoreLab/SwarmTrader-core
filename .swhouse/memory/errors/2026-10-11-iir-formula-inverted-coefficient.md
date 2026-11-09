---
date: 2026-10-11
cycle: 010
title: Research framing used an IIR formula with the coefficient role inverted, and a contract listing that did not match the code
severity: medium
updated: 2026-10-19 (cycle 011 — recurrence on a code path and on a memory note)
logged_at: Step 10 (reconstructed from the cycle file; the defects were corrected before the document was published)
---

## What happened
- **Step 4 (EXPLORER)** proposed as the base of a framing the formula `y[t] = a*y[t-1] + (1-a)*x[t]` with `a` read as the genome coefficient. In the code the filter is `ema = ema*(1-c) + x*c` and `c` weights the **new** datum (`algorithm.js` 369-372): with `iir_price_2 = 0.990` the filter has almost no memory, while the proposed formula would read it as almost all memory. The same step also assumed that every window indicator is a linear filter (false for maximum/minimum over N bars).
- **Step 9 (SCIENTIST)** found the same kind of gap in the finished document: chapter 7 listed `decide()` among the members required by `assertStrategy` and omitted `trader`; `decide()` is a hook of `StrategyIndividual` (defect D1, corrected).

## How it was handled
The CRITIC (Step 5) read `genome.js` and `algorithm.js` before accepting the framing and recorded the inversion (2a) and the false premise (2b). The BUILDER wrote the formula as in the code, with a numeric example (recomputed by the SCIENTIST: all 12 cells match). D1 was corrected after Step 9.

## Prevention
Before a formula or a list of requirements becomes the frame of a document, check it against the code line by line and cite the lines. A coefficient named "greater than 0 and less than 1" does not say which side it weights. Fact: [[consilium-iir-filter-orientation]]. Process: [[independent-verification-chain-research]].

## Recurrence (cycle 011)
- **Step 2 (PRODUCT OWNER)** cited `StockData.fromJSON` (`stockStream.js` 70-73) as the path by which the snapshot fields enter the engine. The **ARCHITECT** (Step 3) read the code: the path is `src/engine/dataTrainer.js` 65-72 (`new StockData(t, open, low, high, close, volume)`); field names unchanged, path corrected.
- AC-05 of cycle 011 took the timing of execution from the memory note [[consilium-trader-order-timing]], which said every order executes at the open. The **CRITIC** (Step 5) followed the sell path to `Portfolio.remove`: sells execute at `(O+H+L+C)/4`, stops at the threshold. The note was incomplete; corrected at Step 10. A memory note is a pointer to the code, not a substitute for it.
- Identities stated without computation in the same cycle: [[2026-10-18-identity-claims-imprecise]].
