---
discovered: 2026-11-15
cycle: 012
topic: Writing and recomputing binary64 numbers identically in Node and Python (exact hash, exp, rounding keys)
---

The genome runs in Node (E2, E3); the independent verifications of the research cycles recompute numbers and hashes in Python (`python3 -I`). Cycle 012 (R3, genome encoding) measured where the two disagree. All figures below were produced by the author's scripts and recomputed independently in Python (Step 9; corrections after Step 9, D2 and D3).

**1. An exact hash needs a text without decimal numbers.** Decimal JSON is not written the same way by the two languages, although the digits agree on the examples tried:

| number or operation | Node | Python |
|---|---|---|
| `1e-7` in JSON | `1e-7` | `1e-07` |
| `-0.0` | `0` | `-0.0` |
| `9007199254740992` | `9007199254740992` | `9007199254740992.0` |
| `NaN` in JSON | `null` (no error) | `NaN` |
| 2.5 rounded to an integer | `Math.round` 3 | `round` 2 |
| `1/(1+e^710)` | 0 | `OverflowError` |

Writing every number as the **16 lowercase hex digits of its binary64 bits, big-endian, after turning -0 into 0** (Node `DataView.setFloat64`; Python `struct.pack('>d', x).hex()`) gives the same text by construction; an object of only ASCII keys in fixed order, strings and `null` is also its own RFC 8785 canonical form. With it the 10 SHA-256 hashes and 3 canonical texts of the document were reproduced byte for byte in Python. Whether the encoding adopts hex or RFC 8785 decimals is open question **Q11**, not decided.

**2. `exp` does not give the same bits.** On 200,000 `τ` uniform in `[ln 0.5, ln 100]`: `exp(-|τ|)` differs in the last binary digit between `Math.exp` and `math.exp` in 10.1 % of cases; `c = f(τ)` in **7.6 %** (at most 2 last digits). Two forms equal in exact arithmetic (`e^-τ/(1+e^-τ)` and `1/(1+e^τ)`) differ in 39.4 % of `τ` even inside Node, so a decoder must fix the formula and the order of operations. Effect measured on 200 genomes × 5,537 bars (toy dataset 20, synthetic series 3,000, ENI 2,517) = 1,107,400 evaluations: scores differ in the last digit in 18.0 %, **decisions changed: 0**, behaviour fingerprints changed: 0/200. The hash does not change (it is computed on `τ`, not on `c`). Consequence: "scores equal in the bits" holds only inside one program; a decision can still differ when a score falls within one or two last digits of a threshold. `ln` was not measured `[ipotesi]`.

**3. A "24-bit" rounding key must say *fraction* bits.** binary64 has 1 implicit bit plus 52 fraction bits. A quasi-duplicate key "rounded to 24 bits of mantissa" is ambiguous: read as 24 significant bits (like a `float32`, which has 23 fraction bits) it does **not** give the document's Example 5; it does with **24 fraction bits after the implicit bit** (25 significant bits, about 7.5 decimal digits). 25.000001430511475 = `25 + 1.5·2^-20` is exactly a midpoint at that precision (ties to even → `25 + 2^-19`; its predecessor → `25 + 2^-20`); with 23 fraction bits the pair gets the same key. Specify it as an integer operation on the 64 bits (drop the last 28 of the 52 fraction bits, round half to even, carry into the exponent allowed, subnormals rounded on the same field); written that way Node and Python agree on 20,022 values. Whether such a key is used at all is open question **Q3**.

Lesson behind 2 and 3: the Scientist's defects D2 and D3 (cycle 012) were specifications worded more loosely than they hold, the family of [[2026-10-18-identity-claims-imprecise]]. Method: [[clean-room-recomputation-other-language]].

Source document: `docs/architecture/genome-encoding.md`, sections 1.4 ("Limite"), 7.2, 7.3, 7.4 and Example 5. Scripts: `/home/luca/Workspace/swarmtrader-r3-work/ref/numfmt.mjs`, `ref/check-corrections.mjs`; verifier `verify/expcmp.py`. Related: [[consilium-duplicate-genomes]].
