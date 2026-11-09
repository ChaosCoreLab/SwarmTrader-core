---
discovered: 2026-10-19
cycle: 011
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

## Known limitations
- The reader is a model: its "memory" and reading times are estimates, it marks deduced answers as uncertain; it is not Luca. Luca's own reading remains the real test.
- Same model family as the authors: independence is of task and context, not of mind (as in [[independent-verification-chain-research]]).
- Each round costs a full read of a long document (27,000 words in cycle 011).
