---
discovered: 2026-10-11
cycle: 009
updated: 2026-10-19 (cycle 011 — execution prices: the earlier text said every order executes at the open; true for buys only)
topic: When Consilium orders execute, at which price, and in what order a bar's events happen
---

`Trader.buy()` and `Trader.sell()` only set the position state (`BUYING`, `SELLING`); they take no order. The order executes in the next `Trader.update(stockData)` (`src/vendor/consilium/trader.js`, lines 430-443), that is on bar `t+1` for a decision taken with the data of bar `t`. Inside `update`, the pending order runs first, then `Broker.update` checks stop loss and take profit on every open position, including one bought a moment earlier on the same bar.

**Execution prices (corrected in cycle 011, Step 5 F-code-4, re-read on the code at Step 10):**

| Event | Price | Code |
|---|---|---|
| Buy on signal | **open** of bar `t+1` | `buyOperation` (`trader.js` 372-376) → `Broker.buy`, `stockPrice = stockData.open` (line 97) |
| Sell on signal | **`(O+H+L+C)/4` of bar `t+1`** (`getActualValue()`) | `Broker.sell`, `currPrice = stockData.getActualValue()` (line 153) → `Portfolio.remove`, line 215; positions closed at that price |
| Stop loss / take profit | **the threshold price**, triggered by `min <= stopLossPrice` / `max >= takeProfitPrice` of the bar | `portfolio.js` 63, 71 (trigger), 291, 298 (`markAsClosed` at the threshold); if both trigger, stop loss wins (the take-profit list is filtered against stop-loss keys) |
| Portfolio value and gain | `(O+H+L+C)/4` of the current bar | `getCurrentValue`, `getCurrentGain` (`portfolio.js` 359-382) |

Consequences:
- The sell-on-signal price contains high, low and close of bar `t+1`, which are not known at its open: it is "selling at the day's average". It is not look-ahead in the decision (taken at the end of `t`), but no real order placed at the open can obtain it. `FitnessValidator` accepts it because it only checks that the price lies in `[low, high]` (`src/engine/fitnessValidator.js`, 57-58).
- Stops close at the threshold even when the open has already gapped past it (optimistic stop, pessimistic take profit).
- Operator decision (cycle 011, Q4): the vendor code is not changed and no issue is opened; the fact is passed to R6 and E2 as a declared risk ([[2026-10-18-indicator-catalog-constraints]]).

So within one bar the chronological order is: pending buy at open (or pending sell at the bar average), then stop or take-profit closes at their thresholds. A position can be opened and closed by take profit on the same bar; a ledger that lists closes before buys shows a sell with no preceding buy (the replay frame does, for such a bar). In the ENI replay with the fixed genome there are 4 bars with a buy and a close together, always for different positions.

Per-bar order of `Algorithm.feed`, reproduced by `StrategyIndividual.feed` (`src/engine/strategy.js` 46-55): update indicators → `trader.update` → decide → `trader.buy()` or `trader.sell()`. The first bar goes to `init` (`life.js` 622-623), which sets the indicators and calls no `trader.update`; the controller captures a frame right after it, so `describe()` must already be finite at bar 1 (see [[eni-flat-bar-and-non-finite-indicators]]).

The price that enters the indicator filters is a separate fact: [[consilium-ohlc4-input-price]].

`Algorithm.codifyGenoma()` reads `genoma.NW` and similar fields that the adapted genome does not have; do not use it to serialise a genome. See also [[consilium-holding-semantics]].
