---
discovered: 2026-09-29
cycle: 001
topic: Consilium trader position flags
---

`Trader.isHolding()` returns `positionState === HOPING && broker.hasPositions()`. It is a trader-state flag, not "a position is open": after some buys the trader stays in `BUYING` while the broker holds shares.

On the ENI fixed-genome replay, 1,211 of 2,517 frames (from 2020-05-18 to the end) have `isHolding() === false` with open broker positions; at EOF 828 shares (20,286 €) are open with `positionState BUYING`. The golden `final.holding: false` is therefore upstream-consistent.

To show whether a position is open, use `broker.hasPositions()` or `portfolioValue > 0`; keep `isHolding()` only when the trader state itself is meant. Since cycle 002 the frame carries `positionOpen` (broker positions) and the inspector label uses it; `holding` stays for the golden comparison (NRC-A04).
