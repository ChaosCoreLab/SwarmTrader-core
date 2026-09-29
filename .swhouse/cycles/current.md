---
cycle: 002
status: open
opened: 2026-09-29
problem: "L'etichetta 'Posizione' dell'ispettore mostra 'Nessuna' mentre il broker ha azioni aperte (condizione C1 del ciclo 001)"
---

**Track:** S — Sprint (Steps 1 · 7 · 9 · 10 · 11 · 12): correzione su un solo componente di presentazione, design già deciso dall'Arbiter del ciclo 001; Steps 10 e 11 inclusi perché obbligatori in ogni traccia.

## Step 1 — Coordinator

**[COORDINATOR]:**

**Problema.** Nell'ispettore la voce "Posizione" deriva da `frame.holding = trader.isHolding()`, che è vero solo quando il trader è in stato HOPING. Dopo alcuni acquisti il trader resta in BUYING con azioni in portafoglio, quindi la UI mostra "Nessuna" con una posizione aperta: 1,211 frame su 2,517, in 26 intervalli dal 18/05/2020; a fine replay 828 azioni, 20,286 €.

**Perché ora.** Condizione C1 dell'Arbiter del ciclo 001 (ACCEPTED WITH CONDITIONS); richiesta dell'Owner di aprire il ciclo, 29/09/2026.

**In scope:**
- Nuovo campo di frame che esprime le posizioni aperte del broker; l'etichetta "Posizione" lo usa.
- Test riproduttivo rosso prima del fix (`protocols/bug-fix.md`): unit test sul controller + e2e sull'etichetta, con verità calcolata dal ledger (Σ buy − Σ sell), non da un flag del motore.
- Nuovo item NRC Type-A.

**Out of scope:**
- Modifiche al motore Consilium vendorizzato o alla semantica di `isHolding()`; il campo `holding` resta per il confronto golden.
- Altre etichette o layout dell'ispettore.

**Complexity estimate:** Low
**Rationale for estimate:** un campo derivato nel controller e una riga di rendering, più i test.

### Context check
- **Memory lookup:** `memory/knowledge/consilium-holding-semantics.md` (causa e intervalli), `memory/decisions/2026-09-29-consilium-v1-golden-reference.md` (il golden confronta `final.holding`, che resta invariato), `memory/patterns/upstream-golden-replay.md`. Nessun errore pregresso in questo dominio.
- **Validation matrix:** target `local-static-ui` e `simulation-engine` coperti; procedure invariate (`npm test`, `npm run test:e2e`, NRC-H01).
- **NRC H-item check:** file previsti in modifica: `src/engine/simulationController.js`, `src/main.js`, `tests/engine.test.js`, `tests/e2e/ui.spec.js`. Moduli NRC: NRC-A01/A02 → `src/engine/*`; NRC-A03 → `src/main.js`, `src/engine/*`; **NRC-H01 → UI as a whole**. **NRC-H01 è attivato (module trigger)**: allo Step 9 serve una sessione umana, limitata ai passi che coinvolgono l'ispettore (passi 4–6 della procedura) più un controllo di non-regressione generale.

**Stato:** Step 1 completato; prossimo Step 7 — BUILDER.

## Step 7 — Builder

**[BUILDER]:**

Sequenza `protocols/bug-fix.md` rispettata: test riproduttivi scritti e visti **rossi** prima del fix.

- **Unit (rosso → verde):** `tests/engine.test.js` › "positionOpen follows the shares held according to the ledger, not trader.isHolding()". Sul replay ENI completo richiede `frame.positionOpen === (Σ buy − Σ sell > 0)` per ogni frame e che lo snapshot contenga ancora frame con `holding false` e azioni in portafoglio. Prima del fix: FAIL al frame 0 (campo assente).
- **E2E (rosso → verde):** `tests/e2e/ui.spec.js` › replay. La pausa ora cade nel primo intervallo di ≥100 barre con `isHolding()` falso e azioni in portafoglio (frame 969–1109, 30/07/2020–19/02/2021, target 989). L'etichetta è confrontata con le azioni del ledger, non con un flag del motore. Prima del fix: FAIL "Expected Aperta, Received Nessuna" su desktop e mobile. Timeout del test portato a 120 s (replay ~30 s).
- **Fix:** `src/engine/simulationController.js` aggiunge `positionOpen: trader.broker.hasPositions()` al frame; `src/main.js` usa `frame.positionOpen` per "Posizione". `holding` resta invariato: il golden confronta `final.holding` con l'upstream.
- **Esito:** `npm test` 12/12 PASS (golden incluso: motore invariato), `npm run test:e2e` 12/12 PASS, `npm run build` OK.
- **NRC:** aggiunto NRC-A04; passo 5 della procedura NRC-H01 precisato sull'etichetta "Posizione". `docs/operations/development.md` aggiornato.

**Stato:** Step 7 completato; prossimo Step 9 — SCIENTIST, che richiede la sessione umana NRC-H01 (module trigger).
