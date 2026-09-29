---
cycle: 002
status: closed
decision: ACCEPTED
closed: 2026-09-29
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

## Step 9 — Scientist

**Confidence:** High
**Assumptions:**
- La verità sulla posizione è il saldo azioni del ledger broker (Σ buy − Σ sell), indipendente dai flag del trader.

### Claims verified
| Claim | Method | Result | Confidence |
|-------|--------|--------|-----------|
| "Posizione" riflette le azioni in portafoglio su ogni barra | Unit test su 2,517 frame (NRC-A04) | PASS; rosso prima del fix | High |
| L'etichetta nella UI è corretta dentro un gap di `isHolding()` | E2E replay in pausa a ~989 (NRC-A04), desktop + 390 px | PASS; rosso prima del fix ("Nessuna") | High |
| Motore invariato | Golden upstream (NRC-A02) | PASS, identità esatta | High |
| Nessuna regressione automatica | NRC-A01, A02, A03 | `npm test` 12/12, `npm run test:e2e` 12/12, build OK | High |
| Nessuna regressione per l'utente | Sessione Owner NRC-H01 | Vedi sotto | High |

```
NRC-ID: NRC-H01
Procedure: replay alla velocità massima, pausa a fine 2020, controllo ispettore; resto della procedura (grafico, ledger, controlli, fine replay)
Observed: barra 1044/2517, 13 nov 2020, stato W, Posizione "Aperta", posizione aperta 9,894.43 €, liquidità 2.00 €, totale 9,896.42 €; resto "andato bene" (Owner)
Result: VERIFIED
Notes: due osservazioni di presentazione, preesistenti al ciclo, sotto.
```

### Observations (preesistenti, non introdotte da questo ciclo)
- **O1 — Arrotondamento del portafoglio:** liquidità e posizione sono arrotondate al centesimo separatamente dal totale; 2.00 + 9,894.43 ≠ 9,896.42 (valori reali 1.9963 + 9,894.426 = 9,896.4223). Succede in 540 barre su 2,517. Dati del motore corretti.
- **O2 — Decimali dei volumi IIR:** `formatVolume` usa `Intl.NumberFormat('it-IT')` con il massimo di default di 3 decimali, quindi le medie filtrate del volume mostrano ",291". Solo formato.

### Claims not verified
| Claim | Reason not verified | Future verification plan |
|-------|---------------------|--------------------------|
| Browser diversi da Chromium | Suite solo Chromium | Invariato dal ciclo 001 |

### Overall verdict
**Solution is:** verified.
**Recommended action:** accept; O1 e O2 in un ciclo successivo.

## Step 10 — Librarian

**[LIBRARIAN]:**
- **NRC:** NRC-A04 aggiunto (Art. 25: difetto osservato dall'Arbiter su evidenza di test, ora coperto da unit + e2e). NRC-H01 VERIFIED il 29/09/2026 (ciclo 002).
- **Knowledge:** `memory/knowledge/consilium-holding-semantics.md` aggiornato: la UI usa `frame.positionOpen` dal ciclo 002.
- **Documentazione:** `docs/operations/development.md` descrive la verifica e2e sull'etichetta.
- **Nessun nuovo errore di processo.** Lezione di test: un e2e che confronta un'etichetta con un flag dello stesso motore non può trovarne i difetti; la verità deve venire da una fonte indipendente (ledger).

**Stato:** Step 10 completato.

## Step 11 — Evolution Master

**[EVOLUTION_MASTER]:**

**Cycle quality score:** 5/5 — sequenza test-before-fix rispettata con rosso osservato in unit ed e2e, verità del test indipendente dal codice in esame, motore protetto dal golden, validazione umana eseguita per il module trigger; le nuove osservazioni sono state tracciate invece di allargare lo scope dopo la validazione.

**Process observations:** la sessione umana ha trovato due difetti di formato non coperti da alcun test: i test e2e verificano il formato di ogni valore ma non la coerenza tra valori mostrati (liquidità + posizione = totale). Proposta: per i pannelli con totali, un'asserzione e2e sulla coerenza aritmetica di ciò che è visualizzato.

**Stato:** Step 11 completato.

## Step 12 — Arbiter

**[ARBITER]:**

**Decision:** ACCEPTED

### Acceptance criteria review
| Criterion | Status | Notes |
|-----------|--------|-------|
| C1 del ciclo 001: "Posizione" riflette le posizioni del broker | Met | `frame.positionOpen`; NRC-A04 PASS, rosso prima del fix; Owner ha verificato nella UI. |
| Nessuna regressione | Met | NRC-A01..A03 PASS, golden invariato, NRC-H01 VERIFIED. |

### Evidence assessment
**Confidence in solution:** High.
**Evidence quality:** test riproduttivi rosso → verde, confronto golden, sessione umana.

### Rationale
La condizione C1 è risolta con evidenza automatica e umana, senza toccare il motore. O1 e O2 sono difetti di presentazione preesistenti, non introdotti né peggiorati da questo ciclo, e non sono criteri di questo ciclo: vanno trattati in un ciclo dedicato, non come condizioni.

### Follow-up
- Ciclo successivo proposto: O1 (coerenza arrotondata liquidità + posizione = totale) e O2 (volumi IIR senza decimali), con asserzione e2e sulla coerenza aritmetica.
- **Decisione Owner (2026-09-29):** O1 e O2 accettati come limiti noti di presentazione; non verranno corretti. Nessun ciclo successivo.

---
*Cycle 002 closed by ARBITER — 2026-09-29; decision ACCEPTED.*
