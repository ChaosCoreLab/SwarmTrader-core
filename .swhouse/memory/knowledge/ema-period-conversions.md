---
discovered: 2026-10-18
cycle: 011
topic: Converting a literature "period N" to the coefficient c of an EMA, and measuring its memory and warm-up
---

All formulas use the Consilium orientation `e[t] = e[t-1] * (1 - c) + x[t] * c`, `c` = weight of the new value ([[consilium-iir-filter-orientation]]). Checked by the Critic (Step 5), the Builder's scripts and the Scientist's independent Python (Step 9); the table below recomputed again at Step 10.

- **Standard EMA:** `c = 2 / (N + 1)`. TA-Lib writes `k = 2/(period+1)`, `EMA = (price - EMA_prev) * k + EMA_prev`, so `k = c` (TA-Lib EMA page, read).
- **Wilder average** (RSI, ATR): `c = 1 / N`; TA-Lib writes `ATR = (ATR_prev * (N-1) + TR) / N` and the same recursion for RSI (pages read). It is an EMA.
- **Equivalence:** Wilder N ≡ standard EMA with period `2N - 1` (`2/((2N-1)+1) = 1/N`). Wilder 14 = `c` 0.0714 = "EMA 27".
- **Memory: one definition.** Mean age of the data in the average = **`(1 - c) / c`** bars (the centre of mass of the weights, exact for infinite history; numeric sum 7.500051 for `iir_volume_1`). `1/c` is only a rule of thumb for small `c`; for large `c` it misleads (`iir_price_2`: `1/c` = 1.01, mean age 0.01). A third measure, `-1/ln(1-c)`, was dropped to avoid three numbers for one thing.
- **Warm-up:** bars until the seed value weighs less than 5 % = first `t` with `(1 - c)^t < 0.05`.

| Filter | `c` | mean age | `1/c` | standard period `2/c - 1` | warm-up bars (5 %) |
|---|---|---|---|---|---|
| `iir_price_1` | 0.731 | 0.37 | 1.37 | 1.74 | 3 |
| `iir_price_2` | 0.990 | 0.01 | 1.01 | 1.02 | 1 |
| `iir_volume_1` | 0.1176 | 7.50 | 8.50 | 16.00 | 24 |
| `iir_volume_2` | 0.396 | 1.52 | 2.52 | 4.05 | 6 |
| EMA 20 | 0.095 | 9.50 | 10.50 | 20.00 | 30 |
| Wilder 14 | 0.071 | 13.00 | 14.00 | 27.00 | 41 |

- **Seeding differs.** TA-Lib seeds the EMA (and RSI, ATR) with the simple mean of the first N values and outputs nothing before; Consilium and the cycle 011 catalog seed at the first value (ratios of EMAs, as in the RSI, start from zero). The difference decays as `(1-c)^t` (verified on the decay law; the exact gaps depend on the series).
- **Scale depends on `c`.** The standard deviation of `ln(C / EMA)` on ENI ranges from 1.7e-4 (`c` 0.99) to 6.2e-2 (`c` 2/51): if `c` evolves, the same weight means different things. Options (normalise by volatility, or bound `c` away from 1) are left to R3.

Source document: `docs/architecture/genome-indicators-catalog.md`, sections 2.2-2.3 and 5.3.
