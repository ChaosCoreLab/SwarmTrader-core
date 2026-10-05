# ArchiMate Vocabulary (minimal)

last_verified: 2026-10-05

Minimal vocabulary for the per-layer ArchiMate source. Each use case has one file per layer in `archimate/<use-case>/` (`motivationlayer.md`, `businesslayer.md`, `applicationlayer.md`, `technologylayer.md`). Element and relation types MUST come from this vocabulary; the generator rejects anything else. What belongs in a model is governed by `software-house-ai/protocols/archimate-modeling.md`.

## Layers

| Layer | Key | File |
|-------|-----|------|
| Motivation | `motivation` | `motivationlayer.md` |
| Business | `business` | `businesslayer.md` |
| Application | `application` | `applicationlayer.md` |
| Technology | `technology` | `technologylayer.md` |
| Physical | `physical` | (optional, inside `technologylayer.md` with `layer: physical`) |

## Aspects

| Aspect | Key |
|---------|-----|
| Motivation | `motivation` |
| Active structure | `active-structure` |
| Behaviour | `behaviour` |
| Passive structure | `passive-structure` |

## Element types by (layer, aspect)

An element may only use a type listed for its (layer, aspect). Motivation-layer elements always use the `motivation` aspect.

### Motivation (any layer)

`stakeholder`, `driver`, `assessment`, `goal`, `outcome`, `principle`, `requirement`, `constraint`, `meaning`, `value`

### Business

| Aspect | Element types |
|--------|---------------|
| active-structure | `business-actor`, `business-role` |
| behaviour | `business-process`, `business-service`, `business-function` |
| passive-structure | `business-object`, `representation` |

### Application

| Aspect | Element types |
|--------|---------------|
| active-structure | `application-component` |
| behaviour | `application-service`, `application-function` |
| passive-structure | `data-object` |

### Technology

| Aspect | Element types |
|--------|---------------|
| active-structure | `node`, `device`, `system-software` |
| behaviour | `technology-service` |
| passive-structure | `artifact` |

### Physical

| Aspect | Element types |
|--------|---------------|
| active-structure | `equipment`, `facility` |
| behaviour | `distribution-network` |
| passive-structure | `material` |

## Relationship types

Use the ArchiMate name and direction: the arrow goes from `from` to `to`.

| Type | Direction | Meaning |
|------|-----------|---------|
| `realizes` | A → B | A realizes B (data object → business object, component → service, process → goal) |
| `serves` | A → B | A provides its functionality to B (service → process or component) |
| `assigned-to` | A → B | A performs or hosts B (role → process, node → artifact) |
| `accesses` | A → B | A reads or writes B (behaviour → passive structure) |
| `flows-to` | A → B | A passes control or data to B (process → process) |
| `triggers` | A → B | A starts B |
| `composes` | A → B | B is part of A |
| `aggregates` | A → B | A groups B |
| `influences` | A → B | A affects B (motivation elements) |
| `specializes` | A → B | A is a kind of B |
| `association` | A → B | A is related to B (when no stronger relation applies) |
