---
date: 2026-10-11
cycle: 009
title: Exception to the single-open-cycle rule while cycle 007 awaits the Owner
status: active
superseded_by: null
---

## Context
Cycle 007 (Owner: Simone, Track M, ArchiMate model) is open in `.swhouse/cycles/current.md` on `main` and stays open until its human verification (NRC-H02) is done. The protocol and `/open-cycle` allow one open cycle at a time. The epic "non-FSM genome" (issue #4, branch `epic-genoma-non-fsm`) cannot wait for that verification.

## Decision
Operator Luca authorises, for this epic only, a second open cycle in the epic branch:
- Cycle 007's `current.md` is not touched in this branch. Cycle 009 lives in `.swhouse/cycles/current-009.md`; later cycles of the epic use `current-NNN.md` while 007 is open.
- Cycle 009 may run Steps 1–11. Step 12 (close), the archive move and every update of `metrics/summary.yaml`, `reputation/scores.yaml`, the non-regression checklist and `docs/MAP.md` wait until cycle 007 is closed or DEFERRED on `main` and this branch has merged it. Then `npm test` and `npm run archimate:check` are rerun on the merged branch before Step 12.
- Cycle 009 does not edit `archimate/**`, `scripts/gen-archimate.mjs`, `_includes/use-cases/*` or `docs/architecture/use-case-eni-replay.md` while NRC-H02 is pending. Model updates caused by the epic go to a later cycle.
- Cycle numbers are taken from the highest number on `main` or in the epic branch, not from `total_cycles`.

## Rationale
The two cycles touch disjoint areas (documentation model versus `src/engine`). The shared state files are the only conflict source (17 conflicts when cycle 008 was merged with `main`), so they are written once, after cycle 007 has closed.

## Consequences
- A session that reads `current.md` finds cycle 007, which is not the epic's cycle: sessions on this branch must read `current-009.md` as well.
- Operator Luca informs cycle 007's Owner (Simone) of the exception; the confirmation is recorded in the cycle 009 file when received.
- The exception ends when cycle 007 is closed and merged; the cycle file is then renamed to `cycles/archive/cycle-009.md` at close as usual.

## Confidence
Medium — a deviation from the protocol, bounded by the conditions above; not verified by a prior run.
