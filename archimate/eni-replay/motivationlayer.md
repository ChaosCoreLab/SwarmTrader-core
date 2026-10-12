---
use_case: eni-replay
layer: motivation
last_verified: 2026-10-05
---

# Motivation layer — ENI replay

<!--
Come modificare questo file
- Ogni elemento è una sezione "### Nome" seguita da righe "- campo: valore".
  Campi: id (univoco, senza spazi), aspect, type, role, tech (facoltativo).
- Ogni relazione è una riga della tabella "Relations", scritta nel file del livello dell'elemento "from".
- Tipi ammessi: archimate/_vocabulary.md. Regole: software-house-ai/protocols/archimate-modeling.md.
- Anteprima immediata: npm run archimate:watch. Verifica: npm run archimate:check.
-->

## Elements

### Need to evaluate a trader genome
- id: mot_driver_evaluate
- aspect: motivation
- type: driver
- role: Before trusting a trader genome, an analyst needs to see how it would actually have behaved on real market history.
- tech: Stated in the value frame ("Who") of docs/architecture/use-case-eni-replay.md.

### Inspect how the supplied fixed genome would have traded ENI
- id: mot_goal_inspect
- aspect: motivation
- type: goal
- role: Show, bar by bar, what the supplied fixed genome decides and trades on ten years of ENI daily prices, with every trade traceable to the engine step that produced it.
- tech: Stated in docs/architecture/use-case-eni-replay.md (Goal).

### Historical analysis only
- id: mot_con_historical
- aspect: motivation
- type: constraint
- role: The replay uses past data only. It executes no real trades and makes no claim about future profitability.
- tech: Disclaimer in the site footer and in docs/architecture/simulator-overview.md (Purpose).

## Relations

| from | relation | to | label |
|------|----------|----|-------|
| mot_driver_evaluate | influences | mot_goal_inspect | |
| mot_con_historical | influences | mot_goal_inspect | |
