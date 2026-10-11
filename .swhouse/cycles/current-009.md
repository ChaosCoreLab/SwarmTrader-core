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

**Conferma dell'eccezione:** Simone (Owner del ciclo 007) è stato avvisato dall'operatore Luca dell'approccio (2026-10-11).
**Esecuzione:** su richiesta dell'operatore gli Step 2–11 girano nella stessa sessione (deroga a «uno step per sessione»). Lo Step 12 resta sospeso (vedi decisione sull'eccezione).
**Issue:** il track, gli step omessi e lo stato sono riportati anche a commento di #11.

## Step 2 — PRODUCT OWNER: Define the Value

**Agent:** claude-opus-5-5

**Chi ha il problema:** il team (Luca, Simone) che deve sperimentare un secondo tipo di genoma (epica #4); oggi ogni tentativo obbligherebbe a modificare insieme controller, validatore e UI.
**Valore misurabile:** il genoma FSM resta identico (golden e NRC invariati) e un secondo tipo di strategia gira nello stesso motore senza toccare controller e validatore, dimostrato da un test.
**Costo del non farlo:** E2–E6 mescolerebbero refactor e funzionalità nuova nello stesso ciclo; una regressione sul golden non sarebbe attribuibile.

**Criteri di accettazione**
- AC-01: il replay FSM è invariato: golden test eseguito (non saltato) e uguale fotogramma per fotogramma; NRC-A01…A04 passano.
- AC-02: una strategia di un secondo tipo, definita solo nei test, completa il replay ENI di 2.517 barre attraverso `SimulationController` e `FitnessValidator` senza modificare né l'uno né l'altro per quella strategia, con traccia valida e deterministica.
- AC-03: `src/vendor/consilium/*` non cambia (`git diff` vuoto).
- AC-04: il contratto è documentato in `docs/architecture/simulator-overview.md` e un controllo di conformità rifiuta le strategie incomplete nominando ogni membro mancante.
- AC-05: ogni fotogramma porta `strategy { kind, label, indicators }`; per l'FSM restano i campi piatti `iirPrice1…`, quindi `src/main.js`, `index.html` e `style.css` non cambiano.
- AC-06: nessuna modifica a `archimate/**` e agli altri file esclusi dallo scope.

**UX Coherence Check:** non applicabile. Il ciclo non introduce campi, controlli né passi di flusso per l'utente; la UI non viene modificata (AC-05). Prova: `git diff` su `src/main.js`, `index.html`, `src/style.css` vuoto (Step 9).

## Step 3 — ARCHITECT: Propose Structure

**Agent:** claude-opus-5-5

**Evidenze dal codice.** `Life` chiede al `GeneticAlgorithm` un figlio (`createNewChild()`) e poi chiama su di esso solo `init`, `feed`, `getCAGR` e `getPerformanceSummary`. Il punto di innesto naturale è quindi il figlio, che `FixedGenomeGA` già fornisce. `Individual` costruisce invece `Algorithm` dal genoma FSM e `Algorithm` legge `genoma.states`: un genoma di altro tipo non può passare da lì. `Trader.buy()` e `sell()` impostano soltanto l'intenzione; l'ordine si esegue alla barra successiva, all'apertura, dentro `Trader.update()`. `Algorithm.codifyGenoma()` legge campi (`genoma.NW`) che il genoma adattato non ha, quindi non è utilizzabile per la serializzazione.

**Componenti**
1. Contratto di strategia (`strategy.js`): metadati (`kind`, `labels`), membri che `Life` chiama, `describe()` e `serialize()`; `assertStrategy` ne verifica la conformità.
2. Classe base `StrategyIndividual`: possiede il `Trader` e riproduce l'ordine per barra di `Algorithm.feed` (aggiorna indicatori, `trader.update`, decide, imposta l'intenzione). Le sottoclassi implementano indicatori, `decide`, `describe`, `serialize`. È l'«adattatore verso Trader/Broker» richiesto da #11.
3. Adattatore FSM (`fsmStrategy.js`): sottoclasse di `Individual` che aggiunge `kind`, `labels`, `describe`, `serialize`; il comportamento di trading è quello del vendor.
4. `FixedGenomeGA` accetta una factory; `SimulationController` accetta `{ createIndividual }`, verifica il contratto dopo la nascita e compone il fotogramma da `describe()`.
5. `FitnessValidator` riceve le etichette dalla strategia e controlla indicatori finiti in modo generico.

**Approcci a confronto**
- **A (raccomandato) — contratto a livello di figlio, vendor intatto.** Pro: nessuna modifica al vendor, quindi il golden resta una prova valida; nuovo codice solo in `src/engine`. Contro: un nuovo tipo deve fornire tutto ciò che `Life` si aspetta (lo copre la classe base).
- **B — contratto a livello di `Algorithm` (sostituire `individual.algo`).** Richiede di modificare `Individual` o di costruire un `Algorithm` fittizio con un genoma FSM, che per un altro tipo di genoma non esiste. Non accettabile senza toccare il vendor.
- **C — strategia che restituisce solo la decisione e un esecutore comune.** È il contratto più pulito per l'evoluzione, ma l'FSM non si scompone senza modificare `Algorithm.feed`. La classe base di A offre già la stessa comodità ai nuovi tipi.

**Raccomandazione:** A, con la classe base di C come aiuto per i nuovi tipi.
**Compatibilità del fotogramma:** `strategy { kind, label, indicators }` si aggiunge; `state` resta (= etichetta); i campi `iirPrice1…` restano solo per `fsm`. La UI e il golden non cambiano.
**Track M, Step 4 e 6 omessi:** lo spazio di soluzione è stretto vincolato dal fatto che il vendor deve restare identico all'upstream; non c'è input esterno né superficie d'attacco nuova (nessun dato utente, nessuna rete).

## Step 5 — CRITIC: Analyze Weaknesses

**Agent:** claude-opus-5-5

| # | Rilievo | Rischio | Mitigazione |
|---|---|---|---|
| C1 | Campi piatti `iirPrice1…` e blocco `strategy` duplicano gli stessi valori: possono divergere | Medio | Un solo punto li compone (`captureFrame`) da `describe()`; un test confronta i due su tutte le 2.517 barre |
| C2 | La classe base replica l'ordine di `Algorithm.feed`: un errore cambierebbe il momento di esecuzione degli ordini per i nuovi tipi | Alto | L'ordine è documentato; un test fa girare una strategia di prova su ENI e il validatore verifica che gli acquisti avvengano all'apertura |
| C3 | Il validatore controlla gli indicatori solo come «finiti»; una strategia può dichiarare etichette qualsiasi | Basso | `labels` è obbligatorio e il validatore rifiuta etichette fuori elenco |
| C4 | Un costruttore che accetta sia un genoma grezzo sia una factory è ambiguo | Medio | La factory è un'opzione nominata (`{ createIndividual }`); il genoma grezzo resta il secondo argomento e viene ignorato se la factory è presente |
| C5 | `serialize()` dell'FSM non può usare `codifyGenoma()` (campi inesistenti) | Medio | Serializza una copia del genoma grezzo ricevuto; un test verifica uguaglianza e indipendenza della copia |
| C6 | Il golden confronta campi scelti del fotogramma, non il fotogramma intero: aggiungere `strategy` non lo rompe, ma lo rende cieco a errori nel nuovo blocco | Basso | Il test C1 copre il blocco |
| C7 | Una strategia di prova che apre e chiude una posizione nella stessa barra potrebbe violare gli invarianti del validatore | Da verificare | Verifica in esecuzione al Builder |
| C8 | La classe base duplica le formule di `getPerformanceSummary` di `Individual` | Basso | Accettato: stessa forma; coperto da test |

**Classifica per rischio:** B (richiede il vendor, inaccettabile) > C > A.
**Inaccettabile:** B. **Nota di diversità cognitiva:** il Critic ha aggiunto C5 e C7, non presenti nello Step 3.

## Step 7 — BUILDER: Produce a Solution

**Agent:** claude-opus-5-5

**Implementato:** `src/engine/strategy.js` (contratto, `assertStrategy`, `StrategyIndividual`), `src/engine/fsmStrategy.js` (`FsmIndividual`, `createFsmFactory`), modifiche a `fixedGenomeGA.js`, `simulationController.js`, `fitnessValidator.js`; `tests/strategy.test.js` (8 test); sezione «Strategy contract» in `docs/architecture/simulator-overview.md`.

**Risposta ai rilievi**
- C1: un solo punto compone il fotogramma; test su 2.517 barre.
- C2: ordine per barra documentato; test su ENI con strategia di prova (`TrendStub`).
- C3: validatore con `labels` e controllo di indicatori finiti e non vuoti.
- C4: opzione nominata `{ createIndividual }`.
- C5: `serialize()` copia il genoma grezzo; test di uguaglianza e indipendenza.
- C6: coperto da C1.
- **C7 si è verificato.** La strategia di prova ha aperto e chiuso una posizione con take profit nella stessa barra: il fotogramma elenca prima la chiusura e poi l'acquisto, e il validatore ha rifiutato la traccia («Sell quantity exceeds open quantity»). Nell'FSM ci sono 4 barre con acquisto e chiusura insieme, ma la chiusura riguarda posizioni precedenti, quindi non erano toccate. Correzione: il validatore applica gli acquisti prima delle chiusure della stessa barra (gli acquisti si eseguono all'apertura, i take profit e gli stop dopo). Così i fotogrammi FSM non cambiano.
- C8: accettato.

**Non risolto, rimandato:** il registro eventi della UI mostra, per una barra con apertura e chiusura insieme, la chiusura prima dell'acquisto. Per l'FSM non capita su una stessa posizione; riguarda E4 (generalizzazione della UI).

**Self-Test Log**
```
Self-Test Log:
  Component: strategy.js (assertStrategy, StrategyIndividual)
  Test method: npm test (tests/strategy.test.js: conformità, azione non valida, hook non implementati)
  Actual output: 28 test, 28 pass, 0 fail
  Expected output: tutti pass
  Result: PASS
  Notes: messaggio di errore elenca tutti i membri mancanti, verificato con regex
```
```
Self-Test Log:
  Component: fsmStrategy.js + FixedGenomeGA + SimulationController (percorso FSM)
  Test method: npm test (golden eseguito, non saltato) e test «FSM frames expose the strategy block…» su 2.517 barre
  Actual output: golden uguale fotogramma per fotogramma; blocco strategy uguale ai campi piatti su ogni barra; 28/28
  Expected output: invariato rispetto alla linea di base (20/20 prima della modifica)
  Result: PASS
  Notes: nessuna differenza di traccia FSM
```
```
Self-Test Log:
  Component: SimulationController + FitnessValidator con una strategia non-FSM
  Test method: npm test, test «a non-FSM strategy replays the ENI snapshot…» (due esecuzioni, confronto)
  Actual output: prima esecuzione FAIL («Sell quantity exceeds open quantity at 2020-11-09»), dopo la correzione del validatore PASS; traccia deterministica, ≥1 acquisto e ≥1 vendita
  Expected output: traccia valida e identica tra esecuzioni
  Result: PASS (dopo correzione)
  Notes: il fallimento iniziale ha rivelato C7
```
```
Self-Test Log:
  Component: build e UI (nessun sorgente UI modificato)
  Test method: npm run build; npm run test:e2e
  Actual output: build ok; e2e 10/10 solo con porta alternativa (vedi Step 9: la porta 5173 è occupata da un'altra app)
  Expected output: 10/10
  Result: PASS
  Notes: sulla porta 5173 i 10 test falliscono anche sul codice non modificato
```
**Confidence:** High sulla parte FSM; Medium sul contratto, provato con una sola strategia di prova.

## Step 8 — OPTIMIZER: Improve the Solution

**Agent:** claude-opus-5-5

- Rimosso il controllo `Non-finite IIR value` specifico dell'FSM nel validatore: ridondante, perché per l'FSM gli indicatori generici sono proprio i quattro IIR. Il controllo generico li copre; 28/28 dopo la rimozione.
- Mantenuti: la classe base e la factory (richieste da #11 e riusate da E2), `serialize()` (serve a E3 per esportare il genoma).
- Non aggiunto: registro dei tipi di strategia, né validazione dello schema degli indicatori; prematuri prima di E2.

## Step 9 — SCIENTIST: Verify

**Agent:** claude-opus-5-5

**Metodo:** esecuzione dei test, della build e degli e2e sul codice modificato; confronto con la linea di base; `git diff` sulle aree escluse.

**Risultati**
- Linea di base prima delle modifiche: 20/20 test.
- Dopo: **28/28** (20 esistenti + 8 nuovi), golden eseguito.
- `npm run build`: riuscito.
- e2e: **10/10** con una configurazione temporanea su porta 5199. Sulla porta predefinita 5173 rispondeva un'altra applicazione («Tabellone Pallavolo Live»): Playwright riusa il server esistente e tutti i test falliscono con elemento non trovato. L'ho verificato anche sul branch senza le mie modifiche (10 falliti), quindi non dipende da questo ciclo. Non ho toccato il processo sulla 5173.
- `git diff` su `src/vendor`, `src/main.js`, `index.html`, `src/style.css`, `archimate`, `scripts`, `_includes`: **0 file** (AC-03, AC-05, AC-06).
- `npm run archimate:check`: valido, file aggiornati.

**NRC Type-A: 5/5 passati** (A01, A02, A03, A04 con la porta alternativa per A03, A05). **NRC-H01 non attivato:** nessun file di UI è cambiato (diff vuoto). NRC-H02 non toccato.
**Frontend:** nessun sorgente frontend modificato; la build e gli e2e confermano l'assenza di errori in console (test «no console errors»).

**Target di deployment**
```
Target: github-pages
Reachable by automation: NO (il deploy parte dal merge su main)
Verification method: dopo il merge su main, il workflow "Deploy GitHub Pages" è verde e l'app si carica su /app/
Status: PENDING_HUMAN
```
(Build locale riuscita.)

**Ipotesi non verificate:** il contratto è provato con una sola strategia di prova; la sua adeguatezza per i genomi veri (E2) si vedrà allora. La generalizzazione della UI e l'ordine nel registro eventi sono fuori scope (E4).
**Confidence:** High per AC-01…AC-06; l'esito complessivo resta provvisorio per il target Pages.

## Step 10 — LIBRARIAN: Update Memory

**Agent:** claude-opus-5-5

- Nuova decisione: `memory/decisions/2026-10-11-strategy-contract.md` (contratto a livello di figlio, vendor intatto, campi piatti per l'FSM).
- Nuova conoscenza: `memory/knowledge/consilium-trader-order-timing.md` (`buy()`/`sell()` impostano l'intenzione, esecuzione all'apertura della barra successiva, acquisti prima delle chiusure intraday, `codifyGenoma()` non utilizzabile).
- Nuovo errore: `memory/errors/2026-10-11-e2e-port-5173-reused.md` (e2e su porta occupata).
- Collegamenti: ciclo 001 (golden e vendor), ciclo 002 (`positionOpen`), ciclo 007 (NRC-H02 pendente), epica #4.
- Riutilizzabile: la classe `StrategyIndividual` e il test con strategia di prova sono il modello per E2.
- Validation matrix: nessun target aggiunto o rimosso; `last_updated` 2026-10-11 non modificato qui (file condiviso: Step 12).
- NRC: proposta di una nuova voce **NRC-A06** (`npm test`, `tests/strategy.test.js`: contratto e strategia non-FSM su ENI) — **da inserire allo Step 12**, nel file condiviso.

**Da applicare allo Step 12, dopo l'assorbimento del 007:** `metrics/summary.yaml`, `reputation/scores.yaml`, `non_regression_checklist.md` (NRC-A06), `docs/MAP.md` (riga di `simulator-overview.md` e data), `validation_matrix.md` se serve.

## Step 11 — EVOLUTION MASTER: Evaluate the Process

**Agent:** claude-opus-5-5

**Cycle quality score: 4.** Lo Step 5 ha prodotto due rilievi decisivi (C5, C7) e C7 si è poi verificato nel codice; il test con una strategia di prova ha dato valore reale. Non 5 perché Explorer e Destroyer sono omessi e tutti i ruoli girano nello stesso modello e sessione.

**Osservazioni**
- Una strategia di prova in un test è il modo più economico per validare un contratto: ha trovato un difetto che il golden non poteva vedere.
- La configurazione Playwright è fissata sulla porta 5173 e riusa un server esistente: un'altra app sulla stessa porta produce falsi fallimenti.

**Proposte (Article 11, non adottate):** (1) rendere configurabile la porta degli e2e, o non riusare il server esistente; (2) ordinare nella UI le operazioni di una stessa barra in ordine di esecuzione (E4).

**Step 12 — sospeso** per l'eccezione concordata: parte dopo che il ciclo 007 è chiuso o DEFERRED su `main` e il branch lo ha assorbito.
