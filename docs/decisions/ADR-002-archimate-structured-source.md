---
title: "ADR-002: ArchiMate as structured data source"
layout: default
---

# ADR-002: ArchiMate as structured data source

Date: 2026-09-29
Cycle: 003
Status: active

## Context

The fixed-genome ENI replay use case was documented with a 4×4 Service Layer × Aspect matrix in free prose (`docs/architecture/use-case-eni-replay.md`). The matrix is human-readable but is not a data source: an ArchiMate diagram cannot be derived from it without manual transcription, and a hand-drawn diagram would drift from the prose.

The Owner wants minimal artifacts that reflect the granularity of each ArchiMate cell (Layer × Aspect), usable as a data source to generate the diagram, and wants the pattern to be promotable to the `software-house-ai` framework.

## Decision

Adopt a **cell-based structured source** for ArchiMate, in a top-level `archimate/` directory, with one markdown file per pertinent cell. Each cell carries a YAML frontmatter (elements, relationships) validated against a minimal vocabulary (`archimate/_vocabulary.md`). A generator (`scripts/gen-archimate.mjs`) derives the PlantUML diagram block and the Service Layer × Aspect matrix from the cells and injects them idempotently into the use case document. A `--check` mode detects drift between the committed block and the source.

Chosen over: (a) JSON/YAML-only source (loses human-readable context), (b) one file per element (explodes file count, loses the cell as navigation unit), (c) diagram-as-primary-source with cells derived from it (contradicts the "data source to generate the diagram" intent), (d) Mermaid output (no first-class ArchiMate, loses Layer × Aspect semantics).

## Rationale

- The cell (Layer × Aspect) is the requested granularity; one file per cell makes each cell independently versionable and navigable.
- A use case populates only the pertinent cells; the generator still emits a complete 4×4 matrix with empty cells marked, preserving a uniform derived view.
- Markdown + frontmatter keeps each cell readable by humans and parseable by agents, consistent with the framework's documentation principle.
- PlantUML expresses ArchiMate semantics (layers, element shapes) better than Mermaid; the protocol already accepts PlantUML as diagram-as-code.
- The generator with `--check` makes drift between source and committed diagram a CI failure, not a silent inconsistency.

## Consequences

**Easier:**
- Adding a use case means populating only the pertinent cells; the diagram and matrix come for free.
- A cell change propagates to the diagram without manual editing.
- The pattern is portable: a project adopts it by creating `archimate/`, the vocabulary, and pointing the generator at its use cases.

**Harder:**
- A new top-level directory (`archimate/`) is introduced; the framework protocol and Librarian agent must admit it (done in this cycle).
- PlantUML does not render natively in all CI environments; the authoritative artifact is the code block, rendering is a supplement.
- The vocabulary is minimal; extending it for new element types is an ADR.

## Confidence

High — the generator validates elements and relationships, the pilot use case produces a coherent diagram, and `--check` is idempotent. The only open follow-up is PlantUML render validation in CI.
