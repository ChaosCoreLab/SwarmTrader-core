---
discovered: 2026-10-11
cycle: 010
topic: Where a genome form gets its memory of the past, and how close each form is to a state machine
---

The operator's requirement for the epic (issue #4) is that state memory should come from qualified financial indicators, not from a state machine coded in the genome. Cycle 010 (issue #5, R1) found that this is not a yes/no property of a form: it depends on the variant. Details and sources are in `docs/architecture/genome-forms-review.md` (chapters 3, 6, 8); this entry keeps only the facts that R2-R6 and E2 must not lose.

- **Two classes of memory.** "Upstream" memory: the form is a feedforward reading of indicators whose own history (windows, recursive filters, see [[consilium-iir-filter-orientation]]) carries the past. "In the reader" memory: the form keeps its own state (HMM belief, Kalman state, recurrent NEAT connections, GP registers). Memory is a causal function of the history; only some indicators are linear filters (maximum/minimum over N bars is not), so the framing is a classification, not a model of every indicator.
- **HMM is a probabilistic state machine.** K hidden regimes, a transition matrix and a regime-to-action map have the same structure as the nine-state FSM, with soft states and transitions computed through the observation probabilities. Its memory and interpretability hold for K hidden states, not for zero states. Estimating its parameters (Baum-Welch) and Viterbi decoding use the whole sequence: a look-ahead risk unless parameters are evolved by the GA or estimated only on data preceding the evaluation (R6).
- **"Indicators only" versus "with internal memory".** For GP (registers) and for NEAT/MLP (recurrent connections) the review describes both variants with the same yardstick and does not pick one; "indicators only" is a design choice, not a property of the form. **Open question (Q2 of cycle 010, operator asked for clarification):** are registers and recurrences admitted? R3, R4 and E2 depend on the answer; the operator's answer to Q1 (see [[2026-10-11-non-fsm-requirement-reading]]) already admits HMM and recurrent networks as forms to evaluate.
- **Crossover on equivalent genotypes.** Permuting regimes (HMM) or hidden nodes (networks) gives the same model with a different genotype, so naive crossover is destructive ("competing conventions", NEAT paper). This is for R3.
- **Continuous output versus `labels`.** The contract needs a finite non-empty `labels` list; forms with a continuous output derive labels from bands of the output (information kept in `describe().indicators`). Only the HMM has natural labels. Contract extension is for E2 (see [[2026-10-11-strategy-contract]]).

Status of the choice of form: **not made** (Luca decides; candidates A and B are proposals in the review). Do not read this entry as a choice.
