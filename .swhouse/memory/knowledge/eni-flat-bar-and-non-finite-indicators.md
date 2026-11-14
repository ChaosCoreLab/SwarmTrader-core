---
discovered: 2026-10-18
cycle: 011
topic: The flat ENI bar 2023-08-15 and what a non-finite value does to an indicator and to the replay
---

**The bar.** In `src/data/eni-ohlcv.json` (2,517 bars) index **1738**, `2023-08-15`, has `open = high = low = close = 14.014` and `volume = 0`. It is the **only** bar with `high == low` and the only one with `volume == 0` (recounted at Step 10). The previous bar is `2023-08-11` (close 14.048): 2023-08-14 is missing. That the source filled a holiday is `[ipotesi]`. `validateSnapshot` accepts it (`volume >= 0`, `low <= min(open, close)`; `src/engine/dataTrainer.js` 30-36), so the bar really reaches the engine.

**What breaks on it.** Close location value `((C-L)-(H-C))/(H-L)` = 0/0 = `NaN` (CLV, CMF); `ln(V)` = `-Infinity` (log relative volume). Finite on it: true range (0.034, thanks to the previous close), volume ratios `V/EMA(V)` = 0.

**Why it matters.**
- A `NaN` entering an EMA **stays `NaN` for ever**: 779 bars (1738-2516) for CLV in an EMA. JavaScript comparisons with `NaN` are all false, so a `NaN` score that is not exposed yields only `hold`, silently, for the rest of the replay `[ipotesi on E2's decide()]`.
- If it is exposed: `FitnessValidator` requires every value of `frame.strategy.indicators` (copied from `describe()`) to be finite (`src/engine/fitnessValidator.js` 26-31) and `simulationController.validateTrace` throws at the end of the replay (lines 90-94): the whole replay fails.
- The controller captures the first frame right after `init` (`simulationController.js` 43), so `describe()` must be finite **from bar 1**, before any warm-up.

**Rule adopted by the catalog** (`docs/architecture/genome-indicators-catalog.md` 3.2-3.3, for E2): on a zero denominator or `log(0)` the indicator **skips the update** of that bar (as TA-Lib ADOSC, "only when high>low"); skipping is not equivalent to feeding 0, which pulls the EMA towards zero by `c`. `max(V, 1)` is rejected: it gives about -16 in `ln(V/EMA(V))`. Before warm-up each indicator exposes a declared finite neutral value (e.g. RSI 0 in centred form).

Related: [[consilium-trader-order-timing]] (bar order), [[2026-10-11-strategy-contract]] (hooks `initIndicators`, `updateIndicators`, `resetIndicators`).
