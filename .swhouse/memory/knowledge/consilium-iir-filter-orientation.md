---
discovered: 2026-10-11
cycle: 010
updated: 2026-10-19 (cycle 011 — mean age as the single memory measure; input price)
topic: Orientation of the IIR coefficient in the Consilium genome and what it means for memory
---

The four indicator filters of the Consilium genome are first-order recursive averages written `ema = ema * (1 - c) + x * c` (`src/vendor/consilium/algorithm.js`, lines 369-372). **`c` weights the new observation, not the past.** Equivalent form: `y[t] = y[t-1] + c * (x[t] - y[t-1])`. Memory: since cycle 011 the measure is the **mean age** `(1 - c) / c` bars; `1/c` (the column below) is only a rule of thumb for small `c` and overstates the memory of the price filters (mean age 0.37 and 0.01 bars), see [[ema-period-conversions]]. The input `x` of the price filters is `(O+H+L+C)/4`, not the close: [[consilium-ohlc4-input-price]]. A filter starts at the first value (`init`, lines 345-348), not at zero. `genome.js` requires `c` strictly between 0 and 1.

Values of the fixed ENI genome (`FIXED_GENOME` in `src/engine/genome.js`):

| filter | `c` | about `1/c` bars |
|---|---|---|
| `iir_price_2` | 0.990 | 1.0 (almost no memory: it follows the price) |
| `iir_price_1` | 0.731 | 1.4 |
| `iir_volume_2` | 0.396 | 2.5 |
| `iir_volume_1` | 0.118 | 8.5 |

So in the current genome the memory of the past sits mostly in the nine states and in the slow volume filter, not in the price filters. That is the factual base of the operator's requirement that memory should come from qualified indicators.

Margins are proportional to the filter, not to the price: `marginAbs = ema * marginPercent` (lines 381-384); `genome.js` divides the percentages by 100 (`toFraction`); one price margin of the fixed genome is negative (`margin_percent_2 = -1.10`).

Worked example with the four real coefficients: `docs/architecture/genome-forms-review.md`, section 3.1 (values recomputed by the SCIENTIST in cycle 010, Step 9). See also [[2026-10-11-iir-formula-inverted-coefficient]] (the mistake this fact prevents) and [[genome-forms-state-memory]].
