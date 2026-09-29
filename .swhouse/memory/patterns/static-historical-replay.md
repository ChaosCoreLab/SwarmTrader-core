---
discovered: 2026-09-28
cycle: 001
applicability: "Browser-only deterministic simulations that consume historical third-party data."
---

## Problem
A browser app needs current or historical data, but runtime network access introduces CORS, availability and reproducibility risks; a server API may violate a no-backend constraint.

## Solution
Use a separate explicit refresh script to fetch and validate data, filter the requested inclusive UTC date range, write the snapshot atomically, and record source, actual coverage, bar count and content hash. The browser loads only that local asset through an in-memory provider and reports missing/corrupt snapshots visibly.

## Example
SwarmTrader fetches Borsa Italiana ENI OHLCV into `public/data/eni-ohlcv.json`, then passes a validated subset to Consilium `StockStream` through `DataTrainer`. The data asset is versioned after the Owner confirmed the reuse terms.

## Known limitations
An immutable snapshot reproduces runs but can become stale. A public endpoint does not itself grant redistribution rights. Keep data acquisition explicit and refresh only after checking source terms.