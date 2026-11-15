---
date: 2026-10-18
cycle: 011
title: Identities between indicators stated from reasoning, wrong in their exact wording
severity: medium
logged_at: Step 10 (from the cycle file; all corrected before the document went to the verifier or to Luca)
updated: 2026-11-15 (cycle 012 — recurrence D1-D3 in the encoding document)
---

## What happened
Three claims of "this indicator is (almost) that one" were written without computing them on the exact formulas:
- **Step 4 (EXPLORER), N3:** "the EMA slope is N1 with a one-day delay". Computed by the Critic (I2): the slope is a monotone function of the log distance **of the same bar** (correlation 0.995 with `d[t]`, 0.916 with `d[t-1]`).
- **Step 4, N2 / %B:** "the z-score N2 absorbs %B". Computed (I4): %B is affine to **its own** z-score (SMA and standard deviation of the window prices); N2 divides by the volatility of returns and is only close (correlation 0.92-0.93).
- **Step 7 (BUILDER), I5:** "centred RSI is the distance from the mean divided by the mean absolute change". Redone by hand by the Optimizer (Step 8): the distance is **in euro** (`C - e`, not the log distance N1) and there is a factor `c/(1-c)`: `rsi_c = c/(1-c) * (C - e) / B`. The conclusion (RSI admitted for gap 4) did not change; the Scientist re-proved the corrected form.

## How it was handled
Each was caught by the next role, by computation: the Critic recomputed every identity claimed by the Explorer (residuals 1e-16) before accepting it; the Optimizer rederived I5 instead of rewording it; the Scientist proved I1-I5 again in Python ([[clean-room-recomputation-other-language]]). Correct forms: [[indicator-algebraic-identities]].

## Recurrence (cycle 012)
Same family in the genome encoding document (R3), caught by the Scientist's clean-room recomputation at Step 9, all Medium and all corrected before the readings were closed:
- **D1:** "two genomes with the same hash always decide the same" holds exactly only with the proposed 15-gene form (Q5 a); with two free thresholds the canonical division rounds, and a constructed counter-example has the same hash and different decisions (`hold` against `buy` on day 12 of the toy dataset).
- **D2:** "scores equal in the bits" holds only inside one program: the decoder did not fix `c = f(τ)` to the bit, and Node and Python differ in 7.6 % of `c` ([[float-serialisation-node-python]]).
- **D3:** "24 bits of mantissa" gave the document's own example only when read as 24 **fraction** bits.
A related slip, an option of one question described with a choice of another, is [[2026-11-15-implicit-choice-stated-as-fact]].

## Prevention
An identity or an "is the same as" between indicators is a mathematical claim: write it with the exact quantities (units, constants, seeding, which bar) and check it by script on a series **and** by a two-line derivation before it is used to admit or exclude an input. "Approximately equal" needs its number (correlation or R²) and the parameters it holds for. Same family of error as [[2026-10-11-iir-formula-inverted-coefficient]]: a formula from memory used as a frame.
