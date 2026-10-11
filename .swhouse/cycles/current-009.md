---
cycle: 009
status: open
opened: 2026-10-11
problem: "Il replay, il validatore e la UI conoscono solo il genoma a macchina a stati: manca un confine che permetta a un secondo tipo di genoma di essere eseguito dallo stesso motore (issue #11, epica #4)"
track: M
parallel_with: "007 (aperto su main, in attesa della verifica umana NRC-H02); eccezione in memory/decisions/2026-10-11-parallel-cycle-exception.md"
---

## Step 1 — COORDINATOR: Open the Problem

**Agent:** claude-opus-5-5
**Instance:** ubuntu-workstation (operator: Luca)
**Issue:** [#11 E1](https://github.com/ChaosCoreLab/SwarmTrader-core/issues/11), epica [#4](https://github.com/ChaosCoreLab/SwarmTrader-core/issues/4). Repository di lavoro: SwarmTrader-core, branch `epic-genoma-non-fsm`.
**Track:** M — refactor con una decisione di design contenuta (la forma del confine) e rischio di regressione alto sul replay. Explorer (Step 4) e Destroyer (Step 6) non sono omessi in partenza: l'Architect (Step 3) dichiara se servono.
**Ciclo in parallelo:** il 007 (Owner Simone) è aperto in `.swhouse/cycles/current.md` e non viene toccato; questo ciclo vive in `current-009.md`. Condizioni dell'eccezione: `memory/decisions/2026-10-11-parallel-cycle-exception.md`. In sintesi: Step 12 e aggiornamento dei file di stato solo dopo la chiusura del 007 e il suo assorbimento nel branch; nessuna modifica a `archimate/**` finché NRC-H02 è pendente.

**Problem statement**
Il motore di replay è costruito attorno al genoma a macchina a stati di Consilium. Dal codice:
1. `Individual` costruisce direttamente `Algorithm` a partire dal genoma e dal `Trader` (`src/vendor/consilium/individual.js`).
2. `SimulationController` legge dall'algoritmo i nomi degli stati (`getCurrentName()`) e i quattro valori IIR (`ema`, `ema2`, `emaV`, `emaV2`) per comporre il fotogramma (`src/engine/simulationController.js:125-129`).
3. `FitnessValidator` accetta solo i nove stati NW…SE e richiede quattro IIR finiti (`src/engine/fitnessValidator.js`); il Genome adapter e la UI mostrano gli stessi concetti.
Non esiste quindi un confine entro cui un genoma di altro tipo possa fornire decisioni e stato interno senza modificare controller, validatore e UI. Senza quel confine le attività E2–E6 dell'epica non hanno dove inserirsi.

**Why now**
È la base dell'epica #4 e non dipende dalle ricerche R1–R6; farla per prima permette di lavorare in parallelo alla ricerca e di fissare la non regressione sul genoma FSM prima di introdurne un altro.

**Scope — IN**
- Definizione del confine tra motore di replay e genoma: che cosa il motore chiede al genoma (inizializzazione, ingestione di una barra, decisione, stato esposto, serializzazione) e come il fotogramma e il validatore si adattano a genomi diversi.
- Il genoma FSM attuale passa attraverso il confine senza cambiare comportamento.
- Test di non regressione e aggiornamento dei test dove il fotogramma cambia forma.
- Aggiornamento di `docs/architecture/simulator-overview.md` e di una decisione in `memory/decisions/` se cambia l'architettura.

**Scope — OUT**
- Qualsiasi genoma non-FSM (E2), l'evoluzione (E3), l'integrazione nel PoC e il confronto affiancato (E4), la parità tra Consilium e SwarmTrader (E6).
- Modifiche a `src/vendor/consilium/*` oltre al minimo necessario (il vendor è verificato dal golden con il codice upstream); l'Architect motiva ogni eventuale eccezione.
- `archimate/**`, `scripts/gen-archimate.mjs`, `_includes/use-cases/*`, `docs/architecture/use-case-eni-replay.md` (NRC-H02 pendente sul 007); gli aggiornamenti del modello vanno a un ciclo successivo.
- Aggiornamento di `metrics/summary.yaml`, `reputation/scores.yaml`, checklist NRC e `docs/MAP.md`: solo allo Step 12, dopo l'assorbimento del 007.

**Estimated complexity:** Medium (due moduli di motore, validatore, UI e test coinvolti; nessuna logica nuova di trading).

**Context check**
- Memory lookup: `decisions/2026-09-29-consilium-v1-golden-reference` (engine v1 come riferimento, verificato da una traccia golden upstream), `patterns/upstream-golden-replay`, `patterns/static-historical-replay`, `knowledge/consilium-holding-semantics` (`isHolding()` non significa posizione aperta: il fotogramma usa `positionOpen`).
- Validation matrix: il target `github-pages` è toccato indirettamente (il bundle dell'app cambia): va verificata la build.
- NRC check — moduli in modifica: `src/engine/*`, `src/main.js`. Type-A **NRC-A01, A02, A03, A04** da rieseguire. **NRC-H01** (UI nel suo insieme, già VERIFIED) va rivalutato se `src/main.js` cambia in modo visibile. NRC-A05 e NRC-H02 non toccati (nessuna modifica ad `archimate/**`).
- Memory errors: `2026-09-29-golden-no-checkout-clone` (il golden non va rigenerato senza autorizzazione dell'Owner; `npm run golden` scarica codice da GitLab).

**Prossimo step:** Step 2 — PRODUCT OWNER, in una nuova sessione.
