---
discovered: 2026-10-19
cycle: 011
updated: 2026-11-15 (cycle 012 — two passing rounds at 4/5, defects found by each)
applicability: "A document whose reader must take a decision without the domain knowledge (research documents of the epic for Luca), before it is handed over"
---

## Problem
A document can be correct, verified and still unusable by the person who must decide. Cycle 010 delivered a review that Luca understood "little or nothing" of. In cycle 011 the Optimizer read the whole catalog "as a beginner" and fixed 23 points (Step 8), yet the first independent reader still scored it **3/5**: the author's self-reading does not replace an independent one.

## Solution
1. **Reader.** A subagent that has not written or corrected the document, given only the document (no guide, code, scripts, cycle file or previous reports) and the profile of the real reader (Luca: technical-scientific, no finance, no machine learning, must answer the open questions).
2. **Task.** Answer the decision questions after the summary only, **before** reading the rest, with a reason; then read everything, list every point where it gets lost (by position), answer a set of comprehension questions (cycle 011: 33, then 45) and score readability 1-5. Optionally recompute numbers from the declared dataset and formulas.
3. **Exit threshold** set before the reading: readability **>= 4/5** and every open question answerable **and motivable** from the summary alone.
4. **Below the threshold:** a correction round on the reader's findings (and the verifier's defects), then a **new** reader with no access to earlier versions or reports. Cycle 011: 3/5 (26/33 correct, summary not self-sufficient, two parameter sets with one name, undefined terms) → corrections → 4/5 (about 91 %, 39/45, D1-D4 answerable with reasons, about 200 values recomputed, none wrong).
5. **Record** each report in the persistent work folder (`reviews/`), the score and the decision of the coordinator in the cycle file; a targeted correction after the passing round is checked by scripts, not necessarily by a third reading (declare it).

## Example
Cycle 011, `.swhouse/cycles/archive/cycle-011.md`, sections "Lettura simulata indipendente" and "Seconda lettura simulata indipendente"; reports in `/home/luca/Workspace/swarmtrader-r2-work/reviews/`. Error it prevents: [[2026-10-19-document-unreadable-first-independent-reading]].

## Cycle 012 (R3, genome encoding)
Applied as written, with the threshold fixed in `reviews/reader-brief.md` before the first reading (readability >= 4/5, each of Q1-Q11 answerable and motivable from «In breve» alone, about 85 % comprehension). Both rounds passed, each **at the limit**, and each still found defects worth fixing:
- **Reading 1: 4/5.** 11/11 questions answerable from the summary, 8 fully motivable, 3 only partly (Q1, Q4, Q8: warm-up, R6, synthetic series and "typical value" not defined; no order of magnitude for the cost of the fingerprint; tie rule and neutral inputs not stated); 45/45 comprehension, 43 sure; no numeric error in its recomputations. Findings L1-L19, among them a wrong cross-reference to a catalog rule (L8). Corrected together with the Scientist's D1-D11.
- **Reading 2 (new reader): 4/5.** 45/45 (44 sure); reserve on Q7 (no criterion for the value 2), Q9 (criterion relied on a fact explained only in 3.2), Q10 c (operator named, not described). Main finding: summary too long (about 3,400 words) and each question written three times. Findings L2.1-L2.21, 5 serious, including an option of Q6 that silently carried a choice of Q10 ([[2026-11-15-implicit-choice-stated-as-fact]]). Targeted round checked by scripts, no third reading (point 5).
- Lesson: passing the threshold does not end the loop; the second reader found the most serious content defect of the cycle. The length cost is in [[2026-11-15-summary-grew-past-reading-target]].

Reports: `/home/luca/Workspace/swarmtrader-r3-work/reviews/lettore-indipendente-1.md`, `lettore-indipendente-2.md`; cycle file sections "Correzioni dopo lo Step 9 e la prima lettura simulata" and "Seconda lettura simulata e correzioni mirate".

## Known limitations
- The reader is a model: its "memory" and reading times are estimates, it marks deduced answers as uncertain; it is not Luca. Luca's own reading remains the real test.
- Same model family as the authors: independence is of task and context, not of mind (as in [[independent-verification-chain-research]]).
- Each round costs a full read of a long document (27,000 words in cycle 011).
