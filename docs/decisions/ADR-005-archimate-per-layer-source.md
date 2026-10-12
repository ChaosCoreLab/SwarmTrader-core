---
title: "ADR-005: ArchiMate source in one file per layer"
layout: doc
last_verified: 2026-10-05
---

# ADR-005: ArchiMate source in one file per layer

Date: 2026-10-05
Cycle: 007
Status: active — supersedes the one-file-per-cell layout of ADR-002 and item 4 of ADR-004

## Context

The Owner's review of the ENI replay page (`human-interaction/02-human-feedback-of-archimate-doc.md`) found the model wrong in content: software-house-ai roles and acceptance criteria in the Business layer, code helpers as elements, and missing arrows between data and business objects. The published model had no relation between layers and 11 of 37 elements without any relation. The one-file-per-cell source (ADR-002) gave cross-layer relations no natural home, and editing meant touching up to 11 YAML files. The Owner also asked for a source that a person can correct quickly.

## Decision

1. **One Markdown file per layer** in `archimate/<use-case>/`: `motivationlayer.md`, `businesslayer.md`, `applicationlayer.md`, `technologylayer.md` (Owner choice, 2026-10-05). Each element is a `### Name` section with `- id`, `- aspect`, `- type`, `- role`, `- tech` lines. Each relation is a row of the file's Relations table, written in the file of its `from` element.
2. **ArchiMate relation names and directions** (`realizes`, `serves`, `accesses`, `assigned-to`, `flows-to`, `influences`, `association`…), so the source reads like the diagram. The old `used-by` type, which needed reversing, is gone.
3. **Automated checks with Italian messages** (`npm run archimate:check`, also run in CI): unknown types, unknown ids, relations in the wrong file, elements without relations, layers not linked to the layer above, file paths in `tech` that no longer exist. Data objects that realize no business object raise a warning.
4. **Fast correction loop:** the element detail in the published diagram links to the layer file on GitHub ("✎ Edit this element"); `npm run archimate:watch` regenerates and reloads a local preview on every save.
5. **One generator output for the page:** `_includes/use-cases/<use-case>.html` (the ArchiMate browser), plus the PlantUML block and the matrix in the use-case document. The SVG emitter of ADR-003/ADR-004 is removed.

What goes into the model is governed by `software-house-ai/protocols/archimate-modeling.md` (cycle 006).

## Consequences

**Easier:** a person edits one readable file per layer; cross-layer relations always have a place; a broken or disconnected model fails CI with a message that names file, line and fix.

**Harder:** the layer files are now the only source, so the generator's parser is a contract (covered by `tests/archimate.test.js`). The edit link goes to GitHub's web editor, which requires write access to the repository.

## Confidence

High for the format and the checks (unit-tested, run in CI). Model content is accepted only after the Owner walkthrough (NRC-H02).
