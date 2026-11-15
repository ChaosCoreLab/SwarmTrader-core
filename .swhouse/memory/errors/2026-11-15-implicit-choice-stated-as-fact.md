---
date: 2026-11-15
cycle: 012
title: An option of one open question described with a choice that belonged to another question
severity: medium
logged_at: Step 10 (from the cycle file; found by the second independent simulated reading)
---

## What happened
In `docs/architecture/genome-encoding.md` (cycle 012, R3), option (b) of **Q6** ("memory gene: `c` with a linear step instead of `τ`") was described as "`c` with reflection in `[c_min, c_max]`", as if reflection at the bounds were part of choosing `c`. The second independent reader flagged the inconsistency between «In breve», 4.3 and chapter 11 (finding L2.6, graded serious). Checking the scripts showed the truth: no script in `ref/` implements the `c` variant; the only measurement on `c` is the walk with Consilium's saturation (`ref/check-ops.mjs`), while reflection is what the proposed mutation does on `τ` (`ref/operators.mjs`, `reflect`). The bound handling is the subject of **Q10** (reflection with Q10 a, saturation with Q10 b), so "reflection" in Q6 b was an implicit choice of Q10 a presented as a fact of Q6.

## How it was handled
Q6 (b) was rewritten the same way in «In breve», 4.3 and chapter 11: `c` as gene with a linear step; bound handling is not part of Q6 but of Q10; the interval `[0.0099; 0.6667]` replaced the undefined `c_min`, `c_max`. Q1-Q11 remain open for Luca.

## Prevention
When a decision is split into several open questions, each option must be described only by what that question changes; anything that depends on another question is written as "with Q10 a / with Q10 b", never folded in. Before handing over, check every option description against the code that measured it: an option that no script implements must say so, and its numbers must come from the variant actually run. Same family as [[2026-10-18-identity-claims-imprecise]] (a statement wider than what was shown). Caught by [[two-round-independent-simulated-reading]], not by the verifier: the Scientist checked numbers and consistency of the three views of each question, not whether an option silently borrowed another question's choice.
