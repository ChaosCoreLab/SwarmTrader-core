---
date: 2026-11-15
cycle: 012
title: Decision summary of a research document grew with every correction round and stayed above its target
severity: low
logged_at: Step 10 (from the cycle file; measured with `wc` and `check-doc.mjs`)
---

## What happened
In `docs/architecture/genome-encoding.md` (cycle 012, R3) the summary «In breve», where Luca must be able to answer Q1-Q11, grew at each step that fixed a readability finding:

| Moment | Words of «In breve» | Why it grew |
|---|---|---|
| Step 7 (Builder) | 1,009 | first draft; 11 questions in a short table, not answerable from it |
| Step 8 (Optimizer) | 2,705 | each question made self-sufficient (problem, options with effect, proposal, criterion) and a worked example from genes to hash |
| after Step 9 and first reading (4/5) | **3,381** (about 40 minutes) | definitions and reasons added for Q1, Q4, Q8 and the hash guarantee |
| after second reading (4/5) | **2,318** (-31 %) | cut on the reader's main finding: summary too long and every question written three times (summary, "Domanda Qx" blocks, chapter 11) |

The indicative target of 1,500-2,000 words was **not reached**: the rest is the worked example (about 240 words), the proposal table and, per question, problem, options with effect, proposal and criterion (about 1,300 words); cutting more would have removed effects or criteria. Both readings passed the threshold (4/5, at the limit), so the length was a cost, not a failure of the check.

## How it was handled
The second reader's finding was applied as a targeted round (cycle file, "Seconda lettura simulata e correzioni mirate", L2.1, L2.11): the "Domanda Qx" blocks of chapters 3-8 became links plus only what is not said elsewhere; file names and test details moved out of the summary into 5.3 and 7.4. Checked by scripts (`check-doc.mjs` 17/17), not by a third reading.

## Prevention
Each correction round adds text to the summary because that is where readers get lost; nobody removes. Set the word budget of the summary at Step 2 or 3, measure it after every round (as `check-doc.mjs` already counts words) and, when a fix adds to the summary, move detail out of it in the same round. Write each open question in one place in full and link the other views, instead of three full copies. Related: [[2026-10-19-document-unreadable-first-independent-reading]], [[two-round-independent-simulated-reading]], [[2026-10-11-research-document-conventions]].
