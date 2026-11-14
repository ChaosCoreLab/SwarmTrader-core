---
date: 2026-10-19
cycle: 011
title: Research document scored 3/5 by the first independent reader after the author's own readability pass
severity: medium
logged_at: Step 10 (from the cycle file and the reader's report)
---

## What happened
The catalog `docs/architecture/genome-indicators-catalog.md` had a readability pass at Step 8 by the Optimizer, reading "as a beginner" (23 problems fixed, glossary 32 → 69 entries, worked examples added). The first independent simulated reader (profile: Luca, no finance) still gave **3/5**: 26/33 comprehension answers correct, the summary took 12-15 minutes instead of the promised 10 and did not let it **motivate** answers to D1-D4; terms used before definition (genome, cycle, epic, bar, snapshot, Consilium, ATR, OBV, MACD, warm-up); two parameter sets both called "example parameters"; inconsistencies (MACD 0.97 vs 0.9968, one code N15 for two proposals, a threshold rule defined after its use and looking like a double standard); dependence on the earlier guide and process jargon (Step, Builder, line numbers). It is the same failure as cycle 010, where Luca understood "little or nothing" of the first review.

## How it was handled
The coordinator did not accept 3/5: one correction round (reader findings and the Scientist's D1-D13), then a new reader with no access to earlier versions → **4/5**, about 91 % comprehension, D1-D4 answerable with reasons; a last targeted round on its findings, checked by scripts.

## Prevention
Readability for a non-expert decider is verified only by an independent reader with an exit threshold fixed in advance, not by the author's self-check: [[two-round-independent-simulated-reading]]. Write the summary last and test it alone; define every term in the summary itself; give each parameter set its own name; keep process vocabulary out of the reader's text. Conventions: [[2026-10-11-research-document-conventions]].
