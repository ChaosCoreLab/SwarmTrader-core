---
title: "ADR-001: Static Snapshot and Browser Replay"
layout: default
---

# ADR-001: Static Snapshot and Browser Replay

last_verified: 2026-09-29

## Status

Accepted for the PoC. Amended 29/09/2026: the Owner confirmed Borsa Italiana terms permit reuse, so the snapshot is versioned.

## Context

The Product Owner requires an HTML/JavaScript browser simulation without a runtime backend, repeatable OHLCV and fixed-genome runs, and reuse of Consilium classes. Consilium's browser provider ordinarily requests CSV from its Express server; its server scraper uses Borsa Italiana's `GetPricesWithVolume` endpoint. Direct browser CORS availability is unverified.

## Decision

Use an explicit offline Node refresh script to produce a locally validated, hash-addressed OHLCV JSON snapshot. The static browser app feeds that snapshot through a memory-backed `IStockStreamProvider` into the pinned Consilium browser engine. No backend is started for replay. Version the validated snapshot in Git so a clean clone replays the same hash without network access.

## Alternatives

- Direct browser fetch from Borsa: rejected as the sole data source because CORS and response stability are unverified and the same run would not be reproducible.
- Consilium `/simulation/data/.../csv`: rejected at runtime because it requires Express and violates the no-backend constraint.
- Static snapshot + manifest and optional derived trace: selected because it allows offline replay and exact source/date/hash reporting.

## Consequences

- The refresh is a manual operation and depends on the endpoint returning the requested history.
- Replays remain deterministic for the same snapshot, genome and pinned engine.
- A fresh clone replays the versioned snapshot directly; `data:update` is needed only to refresh the data window.
- The vendor fork must preserve the MIT license and document any browser-only dead-code removals.

## Addendum 2026-09-29 — Consilium engine v1, not v2

Consilium `30ae93f` ships two engines. `algorithm_v2.js` consumes snake_case genomes and multiplies margins as-is (`avgPriceIIR * margin_percent_1`). `algorithm.js` (v1) uses fractional camelCase fields. The GA that produces snake_case genomes such as the PoC one (`public/browser-worker.worker.js`) imports the v1 engine and loads each genome with `Individual.fromJSON(genome, 10000)`, which divides every percentage field by 100. The PoC therefore uses v1 and `src/engine/genome.js` mirrors `Individual.fromJSON`; `tests/engine.test.js` asserts field-by-field equality and `tests/golden.test.js` compares the full replay with the upstream `Life.cycle()` trace.
