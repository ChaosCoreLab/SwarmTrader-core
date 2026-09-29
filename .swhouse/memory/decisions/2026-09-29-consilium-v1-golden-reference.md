---
date: 2026-09-29
cycle: 001
title: Consilium engine v1 as reference, verified by an upstream golden trace
status: active
superseded_by: null
---

## Context
Consilium ships two trading engines. `algorithm_v2.js` uses margin values as-is; the GA worker that produces snake_case genomes (`public/browser-worker.worker.js`) runs engine v1 and loads genomes with `Individual.fromJSON(genome, 10000)`, which divides every percentage field by 100. The PoC genome is a snake_case genome from that GA.

## Decision
Replay with engine v1 semantics. The project adapter `createConsiliumGenome` mirrors `Individual.fromJSON`, fixed by an equivalence test. AC-04 is verified by `scripts/golden-consilium.mjs`, which runs the unmodified upstream modules at commit `30ae93f` through `Life.cycle()` and writes `tests/golden/eni-fixed-genome.golden.json`; `tests/golden.test.js` requires exact equality with the step-by-step controller.

## Rationale
The golden is produced by upstream code the project does not modify, from the genome as written in the PO requirement, so it detects transcription errors in `FIXED_GENOME`, adapter drift, and differences between batch `Life.cycle()` and step-by-step `Life.feed()`.

## Consequences
- Regenerate the golden only together with a snapshot refresh or a change of the pinned engine commit, and commit both together.
- Result on 2026-09-29: 2,517 frames with identical state and 4 IIR values, 70 broker operations, 36 closed positions, final total value 20,295.07 €.
- `npm run golden` downloads and executes Consilium code from GitLab; run it only with Owner authorization.

## Confidence
High — exact equality on every frame and on the full broker log.
