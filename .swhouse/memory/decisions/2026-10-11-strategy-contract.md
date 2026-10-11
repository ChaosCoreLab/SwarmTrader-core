---
date: 2026-10-11
cycle: 009
updated: 2026-10-11 (cycle 010 — crossover/mutate note)
title: Strategy contract at the child level, vendor untouched
status: active
superseded_by: null
---

## Context
The replay engine was tied to the Consilium state-machine genome: `Individual` builds `Algorithm` from the FSM genome, the controller read state names and four IIR values from the algorithm, and the validator accepted only the nine states. The epic "non-FSM genome" (issue #4) needs a second kind of genome to run in the same engine.

## Decision
`Life` only calls `init`, `feed`, `getCAGR` and `getPerformanceSummary` on the child that `FixedGenomeGA.createNewChild()` returns. The contract sits at that level (`src/engine/strategy.js`): `kind`, `labels`, `trader`, those methods plus `reset`, `describe()` and `serialize()`. `assertStrategy` checks it. `StrategyIndividual` is a base class for new kinds; `FsmIndividual` presents the existing genome through the contract. `src/vendor/consilium/*` is not modified. Frames gain `strategy { kind, label, indicators }`; the flat `iirPrice1…` fields stay for the `fsm` kind so the UI and the golden comparison do not change.

## Rationale
The golden trace is only evidence while the vendor code equals upstream ([[2026-09-29-consilium-v1-golden-reference]]). Replacing `Algorithm` would require changing `Individual`. Contract at the child level adds code only in `src/engine`.

## Consequences
- New genome kinds implement the six hooks of `StrategyIndividual`; E2 (#12) is the first.
- The UI still shows state-machine panels only for `fsm`; E4 (#15) generalises it.
- The validator applies buys before closes of the same bar; frames still list closes first (display order to fix in E4).
- `Algorithm.codifyGenoma()` cannot serialise the adapted genome; `serialize()` copies the raw genome instead.
- `assertStrategy` does not require `crossover` or `mutate`, but the Consilium GA calls `parent1.crossover(parent2)` and `child.mutate(rate)` on the child (`src/vendor/consilium/ga.js`, lines 116-125 and 345-351). A form that evolves must implement both: to settle in R3 (genetic encoding) and E2. Found in cycle 010; see `docs/architecture/genome-forms-review.md`, chapter 7, and [[genome-forms-state-memory]].
- Cycle 010 reviewed the contract on paper against six alternative forms: forms with a continuous output need derived `labels` (a contract extension request for E2); only an HMM has natural labels. The contract is still proven only with one test strategy (confidence unchanged).

## Confidence
Medium — proven with one test-only second strategy; adequacy for real genomes is checked in E2.
