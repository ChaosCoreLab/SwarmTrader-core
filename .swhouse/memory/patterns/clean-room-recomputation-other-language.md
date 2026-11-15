---
discovered: 2026-10-19
cycle: 011
updated: 2026-11-15 (cycle 012 — hashes and canonical texts byte for byte; Node/Python differences)
applicability: "Verifying a document whose numbers were produced by the author's scripts (Step 9 of research cycles)"
---

## Problem
A verifier who runs or reads the author's scripts inherits their conventions and bugs: the check confirms the scripts, not the document. Conventions that the scripts know but the text does not say stay invisible.

## Solution
1. The author keeps implementations in `ref/` and outputs in `out/`; the verifier works in a separate `verify/` and **does not read or run** `ref/` or `out/` (see [[persistent-research-work-folder]]).
2. The verifier rewrites the computations **in another language** (cycle 011: author in Node `.mjs`, Scientist in Python run with `python3 -I`), from the formulas **written in the document** and from the raw data only (the toy dataset regenerated from the rule stated in the text and compared with the JSON: 100/100; the ENI snapshot read-only).
3. Tables are parsed from the Markdown and compared cell by cell at the rounding shown; text numbers are listed and recomputed; identities are re-proved by hand.
4. Every mismatch is either a defect of the document or an **undeclared convention**; both are reported.

## Example
Cycle 011 Step 9: 1,041 table values and about 110 text values recomputed, 0 differences; the method found what a re-run could not: the synthetic series was not reproducible (seed given, generator not; D1), the ENI checks used an unwritten convention (first 100 bars excluded, 40/60 split of the rest; D4), several secondary numbers had undeclared parameters (D12). All were fixed by declaring them in the document. The Builder's wrong first wording of identity I5 had already been caught by the Optimizer redoing it by hand ([[2026-10-18-identity-claims-imprecise]]).

## Cycle 012 (R3, genome encoding)
Same set-up (author in Node `ref/`, Scientist in Python `verify/`, run with `python3 -I`, `ref/` and `out/` read only after finishing, section 8 of Step 9). About 330 deterministic values recomputed, **0 differences**: the 10 SHA-256 hashes and the 3 canonical texts **byte for byte**, the hex table, worked examples bit for bit, 0 invalid children on 100,000 per operator with Python's own generator. What only the second language could show: Node and Python give different `c = f(τ)` in 7.6 % of cases (0 decisions changed) and decimal JSON differs between them ([[float-serialisation-node-python]]). Defects: 0 Critical or High, **3 Medium** (D1 "same hash ⇒ same decisions" true exactly only with the proposed 15-gene form; D2 decoder not fixing `c = f(τ)` to the bit; D3 "24 bits of mantissa" ambiguous), **8 Low** (D4-D11: a catalog count, statistics from one series, a source status, a line range, two unmarked author choices, undeclared constructions behind statistics, a source attributed to both languages, 77163 → 77164). Statistical numbers built on unwritten constructions reproduced only in order of magnitude (D9), as in cycle 011's D12.

## Known limitations
- Random series reproduce only with the same generator: when it differs, compare statistically over several seeds (cycle 011: 8 seeds) and accept "about" values in the text.
- Doubles the computing work; worth it where numbers are the product.
- Complements, does not replace, the source checks of [[independent-verification-chain-research]].
