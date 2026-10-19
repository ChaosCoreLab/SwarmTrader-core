---
discovered: 2026-10-18
cycle: 011
topic: The "price" Consilium feeds to its filters is (O+H+L+C)/4, and averaging creates persistence in returns
---

**Fact (code).** The four IIR filters and the price comparisons of the Consilium genome do not use the close: they use `StockData.getActualValue()` = `(close + max + min + open) / 4` (`src/vendor/consilium/stockStream.js`, lines 32-34; `algorithm.js` 343-348 at `init` and 366-372 at each bar). The same average values the portfolio and prices the sell on signal ([[consilium-trader-order-timing]]). The snapshot enters the engine through `src/engine/dataTrainer.js` lines 65-72, `new StockData(t, open, low, high, close, volume)`, matching the constructor order `(t, open, min, max, close, volume)` (`stockStream.js` 19): `min = low`, `max = high`. It does **not** go through `StockData.fromJSON`.

**Effect (measured).** The average of several prices inside the same bar makes day-to-day returns positively autocorrelated even when prices are a random walk (Working 1960 and Cowles 1960; Cowles abstract read, Working's text not accessible). First-order autocorrelation of log returns:

| Series | close | (O+H+L+C)/4 |
|---|---|---|
| ENI snapshot, 2,517 bars | 0.031 | 0.232 |
| synthetic random walk of cycle 011 (seed 20261018) | 0.009 | 0.242 |
| Critic's random walk, 390 intraday steps + night step | 0.001 | 0.31 |

ENI values recomputed at Step 10 (0.0313 and 0.2322). So most of the persistence of the OHLC/4 series is **built by the average**, not by the market. It is not exploitable as such with the current orders (buy at the open of `t+1`, sell at the average of `t+1`), but it makes indicators computed on OHLC/4 differ from the literature and from TA-Lib, which define EMA, RSI, ATR, OBV and stochastic on the close.

**Operator decision (cycle 011, Q1):** the indicators of the new genome use the **close** ([[2026-10-18-indicator-catalog-constraints]]). Cost, declared in `docs/architecture/genome-indicators-catalog.md` section 2.4: an EMA of the catalog is no longer identical to a Consilium filter with the same `c`, and a PoC comparison between the linear genome and the FSM mixes the effect of the form with that of the price.

See also [[consilium-iir-filter-orientation]] and [[ema-period-conversions]].
