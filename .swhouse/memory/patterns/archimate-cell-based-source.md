---
discovered: 2026-09-29
cycle: 003
applicability: "Projects that need granular, drift-free ArchiMate coverage across use cases"
---

# ArchiMate cell-based structured source

## Problem

Documenting an ArchiMate use case as free-text prose (a 4×4 matrix) is human-readable but not a data source: a diagram cannot be derived from it without manual transcription, and a hand-drawn diagram drifts from the prose. Maintaining both by hand doubles the effort per use case.

## Solution

Keep ArchiMate as a **structured data source** in a top-level `archimate/` directory, one markdown file per pertinent cell (Service Layer × Aspect), each with a YAML frontmatter declaring `elements[]` and `relationships[]` validated against a minimal vocabulary (`archimate/_vocabulary.md`). A generator (`scripts/gen-archimate.mjs`) derives the PlantUML diagram block and the 4×4 matrix from the cells and injects them idempotently into the use case document between markers. A `--check` mode regenerates and diffs against the committed block, so drift between source and diagram is a CI failure.

A use case populates only the pertinent cells; the generator still emits a complete 4×4 matrix with empty cells marked `—`, preserving a uniform derived view.

## Example

`archimate/eni-replay/` contains 11 pertinent cell files (business all four aspects, application active/behaviour/passive, technology active/behaviour/passive, physical active-structure only). `npm run archimate:gen` produces the PlantUML view and matrix injected into `docs/architecture/use-case-eni-replay.md`. See [ADR-002](../../../docs/decisions/ADR-002-archimate-structured-source.md).

## Known limitations

- PlantUML does not render natively in every CI environment; the code block is the authoritative artifact, rendering is a supplement (render validation is a follow-up).
- The vocabulary is minimal; new element types require an ADR extension.
- Cross-use-case element identity (the same physical element reused across use cases) is not modeled yet; each use case declares its own ids.
