---
date: 2026-10-18
cycle: 011
title: Identities between indicators stated from reasoning, wrong in their exact wording
severity: medium
logged_at: Step 10 (from the cycle file; all corrected before the document went to the verifier or to Luca)
---

## What happened
Three claims of "this indicator is (almost) that one" were written without computing them on the exact formulas:
- **Step 4 (EXPLORER), N3:** "the EMA slope is N1 with a one-day delay". Computed by the Critic (I2): the slope is a monotone function of the log distance **of the same bar** (correlation 0.995 with `d[t]`, 0.916 with `d[t-1]`).
- **Step 4, N2 / %B:** "the z-score N2 absorbs %B". Computed (I4): %B is affine to **its own** z-score (SMA and standard deviation of the window prices); N2 divides by the volatility of returns and is only close (correlation 0.92-0.93).
- **Step 7 (BUILDER), I5:** "centred RSI is the distance from the mean divided by the mean absolute change". Redone by hand by the Optimizer (Step 8): the distance is **in euro** (`C - e`, not the log distance N1) and there is a factor `c/(1-c)`: `rsi_c = c/(1-c) * (C - e) / B`. The conclusion (RSI admitted for gap 4) did not change; the Scientist re-proved the corrected form.

## How it was handled
Each was caught by the next role, by computation: the Critic recomputed every identity claimed by the Explorer (residuals 1e-16) before accepting it; the Optimizer rederived I5 instead of rewording it; the Scientist proved I1-I5 again in Python ([[clean-room-recomputation-other-language]]). Correct forms: [[indicator-algebraic-identities]].

## Prevention
An identity or an "is the same as" between indicators is a mathematical claim: write it with the exact quantities (units, constants, seeding, which bar) and check it by script on a series **and** by a two-line derivation before it is used to admit or exclude an input. "Approximately equal" needs its number (correlation or R²) and the parameters it holds for. Same family of error as [[2026-10-11-iir-formula-inverted-coefficient]]: a formula from memory used as a frame.
