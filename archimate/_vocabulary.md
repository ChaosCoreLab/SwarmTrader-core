# ArchiMate Vocabulary (minimal)

last_verified: 2026-09-29

Minimal vocabulary for the cell-based ArchiMate source pattern. Each cell file in `archimate/<use-case>/<layer>--<aspect>.md` declares `elements[]` and `relationships[]` in its YAML frontmatter; types MUST come from this vocabulary (the generator warns on unknown types and fails on unknown relationship types).

## Layers

| Layer | Key |
|-------|-----|
| Business | `business` |
| Application | `application` |
| Technology | `technology` |
| Physical | `physical` |

## Aspects

| Aspect | Key |
|---------|-----|
| Motivation | `motivation` |
| Active structure | `active-structure` |
| Behaviour | `behaviour` |
| Passive structure | `passive-structure` |

## Element types by (layer, aspect)

A cell may only declare elements whose type is listed for its (layer, aspect). Motivation-aspect elements are cross-layer (the same motivation types apply to every layer).

### Motivation (any layer)

`goal`, `outcome`, `requirement`, `principle`, `constraint`, `meaning`, `value`

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
| active-structure | `node`, `system-software` |
| behaviour | `technology-service` |
| passive-structure | `artifact` |

### Physical

| Aspect | Element types |
|--------|---------------|
| active-structure | `equipment`, `facility` |
| behaviour | `distribution-network` |
| passive-structure | `material` |

## Relationship types

| Type | Direction | Meaning |
|------|-----------|---------|
| `used-by` | A → B | A uses B (active → passive/service) |
| `realizes` | A → B | A realizes B (component → service) |
| `assigned-to` | A → B | A is assigned to B (actor → role, role → process) |
| `flows-to` | A → B | A flows to B (process → process) |
| `composes` | A → B | A composes B (parent → child) |
| `specializes` | A → B | A specializes B |
| `triggers` | A → B | A triggers B (event → process) |
| `accesses` | A → B | A accesses B (process → data-object) |

## PlantUML mapping

The generator renders each element as an ArchiMate-style box with a label derived from its type, grouped by layer. Relationships become arrows labelled with their type. The mapping is internal to `scripts/gen-archimate.mjs` and follows the PlantUML ArchiMate conventions (one package per layer, element shape per type).
