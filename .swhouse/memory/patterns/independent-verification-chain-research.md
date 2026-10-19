---
discovered: 2026-10-11
cycle: 010
updated: 2026-10-19 (cycle 011 — computation as the check, clean-room recomputation, simulated reading)
applicability: "Research cycles whose product is a document with claims, sources and numbers (no product code), run with role subagents"
---

## Problem
A research document with many sourced claims fails silently: a plausible citation, a formula written from memory or a figure copied wrongly all read well. The agent that wrote a claim is the worst one to check it.

## Solution
Separate who proposes, who checks sources, who writes and who verifies, and give each check a different object:

1. **Explorer proposes** (Step 4) and marks each claim `verified` or `[ipotesi, fonte da verificare]`; it does not certify.
2. **Critic checks sources on the text** (Step 5): download the PDF or page, search for the claim, record *supported / partly / not supported* per claim, and check formulas against the **code**. Cycle 010: 6 sources checked, 5 claims not supported by the cited source (use of an HMM in markets cited to a speech-recognition paper, a Kalman/exponential-smoothing equivalence, a misattributed institution, a term absent from the page, a paper's rules read as a "minimal form"); checked against the code, the IIR formula had inverted roles and a premise ("every window indicator is a linear filter") was false.
3. **Builder collects sources before writing** (Step 7) and records per source *read / card only / not read*; claims without a read source stay `[ipotesi]` and are listed under "what could not be established". No reference written from memory.
4. **Scientist re-checks independently** (Step 9): every URL, all references against the downloaded text, every number by script, every code citation (file and line) against the code, acceptance criteria by script. Cycle 010: 18 of 18 references checked, 16 supported, 2 with reserve, 0 unsupported; one real defect in a contract listing (D1) and the rendering overflow found only here.
5. **Coordinator applies corrections and re-runs the checks** (tests, Liquid grep, rendering) and records each defect with its fix in the cycle file.

Keep the document's own statement of source status (read / card only) honest at every step: the Scientist's count must match what the document declares.

## Example
Cycle 010, `.swhouse/cycles/archive/cycle-010.md` Steps 5, 7, 9 and the corrections table after Step 9; product `docs/architecture/genome-forms-review.md`. The error caught by step 2: [[2026-10-11-iir-formula-inverted-coefficient]].

## Cycle 011 (R2, indicators catalog)
The chain held and was extended:
- the Critic checked **identities by computing them** (residuals 1e-16), correcting two Explorer formulations, and followed the sell path in the code to a fact no step had (sell at the bar average);
- the Optimizer rederived an identity by hand and corrected the Builder's wording ([[2026-10-18-identity-claims-imprecise]]);
- the Scientist recomputed in another language without reading the author's scripts: [[clean-room-recomputation-other-language]] (1,041 table values, 0 differences; undeclared conventions found);
- readability got its own independent check with an exit threshold: [[two-round-independent-simulated-reading]];
- all scripts in a persistent folder: [[persistent-research-work-folder]].

## Known limitations
- All roles ran on the same model; independence is of task and object, not of mind.
- "Text read" means converted and searched for key phrases, not a full re-read of every paper; the Scientist declares this.
- Sources behind anti-robot filters (HTTP 403 with some user agents) can only be checked on an abstract or card; the document must say so.
- It costs about as much as writing the document; use it where claims are the product.
