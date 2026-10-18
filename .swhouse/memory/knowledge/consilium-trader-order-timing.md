---
discovered: 2026-10-11
cycle: 009
topic: When Consilium orders execute and in what order a bar's events happen
---

`Trader.buy()` and `Trader.sell()` only set the position state (`BUYING`, `SELLING`); they take no order. The order executes in the next `Trader.update(stockData)`, at that bar's **open** (`buyOperation` uses `stockData.open`). Inside `update`, the pending order runs first, then `Broker.update` checks stop loss and take profit on every open position, including one bought a moment earlier on the same bar.

So within one bar the chronological order is: buy at open, then stop or take-profit closes. A position can be opened and closed by take profit on the same bar; a ledger that lists closes before buys shows a sell with no preceding buy (the replay frame does, for such a bar). In the ENI replay with the fixed genome there are 4 bars with a buy and a close together, always for different positions.

Per-bar order of `Algorithm.feed`, reproduced by `StrategyIndividual.feed`: update indicators → `trader.update` → decide → `trader.buy()` or `trader.sell()`.

`Algorithm.codifyGenoma()` reads `genoma.NW` and similar fields that the adapted genome does not have; do not use it to serialise a genome. See also [[consilium-holding-semantics]].
