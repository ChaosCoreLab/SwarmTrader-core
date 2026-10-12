---
discovered: 2026-09-29
cycle: 003
updated: 2026-10-05 (cycle 007 — per-layer layout)
applicability: "Projects that document use cases in ArchiMate and want a source that people can edit and a generator can check"
---

# ArchiMate structured source (per-layer layout)

*File name kept for history; the pattern started as one file per cell (cycle 003) and became one file per layer in cycle 007 (ADR-005).*

## Problem

A prose matrix cannot generate a diagram, and a hand-drawn diagram drifts from the text. The first fix (one YAML file per Layer × Aspect cell) produced a generator-friendly source but a disconnected model: relations between layers had no file to live in, and editing meant touching up to 11 files.

## Solution

- One Markdown file per layer in `archimate/<use-case>/` (`motivationlayer.md`, `businesslayer.md`, `applicationlayer.md`, `technologylayer.md`).
- Elements as `### Name` sections with `- id/aspect/type/role/tech` lines; relations as a table in the file of their `from` element, using ArchiMate relation names and directions.
- `scripts/gen-archimate.mjs` checks the model (no isolated elements, every layer linked to the one above, known types and ids, no stale paths in `tech`) and generates the browser fragment, the PlantUML block and the matrix; `--check` runs in CI.
- Edit link from each element in the published diagram; `npm run archimate:watch` for a live local preview.

## Example

ENI replay: 32 elements, 49 relations, every layer linked (cycle 007). Content rules: `software-house-ai/protocols/archimate-modeling.md`.

## Known limitations

- The checks catch structural defects, not wrong meaning: the Owner walkthrough (NRC-H02) is still required.
- Cross-use-case element reuse is not modeled; each use case declares its own ids.
