---
date: 2026-09-28
cycle: 001
title: Static browser replay with local ENI snapshot
status: active
superseded_by: null
---

## Context
The first PoC must run as HTML/JavaScript in a browser without a runtime backend, reuse the Consilium trading engine, and reproduce a fixed-genome ENI simulation through 28/09/2026 inclusive.

## Decision
Refresh Borsa Italiana data offline into a locally validated, hash-addressed JSON snapshot. Feed it through an in-memory `IStockStreamProvider` to the pinned Consilium browser engine. Do not request market data during browser replay. Version the snapshot in Git (reuse confirmed by the Owner on 2026-09-29).

## Rationale
Consilium's existing browser stock provider depends on its Express endpoint; direct Borsa browser CORS and response stability are unverified. A local snapshot makes the app backend-free and replays deterministic for the same hash, genome and engine revision. The explicit refresh path reports actual coverage and never fabricates missing dates.

## Consequences
- Fresh clones replay the versioned snapshot; the refresh is only needed to move the data window.
- The current locally acquired snapshot contains 2,517 bars from 29/09/2016 through 28/09/2026.
- Redistribution: Owner confirmed Borsa Italiana terms permit reuse (2026-09-29).
- The fixed-genome adapter maps percentage values to Consilium fractional values and must stay covered by tests.

## Confidence
High — implementation, browser replay and data schema are verified; the upstream Consilium golden trace matches exactly (2026-09-29, see `2026-09-29-consilium-v1-golden-reference.md`).