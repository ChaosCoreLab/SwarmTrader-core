---
cycle: 010
status: open
opened: 2026-10-11
problem: "Non è noto quali forme di genoma, oltre alla macchina a stati, siano adatte a decidere buy/stay/sell da prezzi e volumi giornalieri e a evolvere con un algoritmo genetico: la scelta della forma blocca E2 e le ricerche R3 e R4 (issue #5, epica #4)"
track: M
parallel_with: "007 (aperto su main) e 009 (aperto, Step 12 sospeso); eccezione in memory/decisions/2026-10-11-parallel-cycle-exception.md"
---

## Step 1 — COORDINATOR: Open the Problem

**Agent:** claude-opus-5-5
**Instance:** ubuntu-workstation (operator: Luca)
**Issue:** [#5 R1](https://github.com/ChaosCoreLab/SwarmTrader-core/issues/5), epica [#4](https://github.com/ChaosCoreLab/SwarmTrader-core/issues/4). Repository di lavoro: SwarmTrader-core, branch `epic-genoma-non-fsm`.
**Track:** M — ricerca con una decisione da prendere (quali forme portare avanti) e nessun codice di prodotto. **Step 4 (Explorer) incluso:** lo spazio delle forme è ampio e va esplorato in modo divergente, con almeno un approccio da un principio diverso. **Step 6 (Destroyer) omesso:** nessun input esterno né superficie d'attacco; i modi in cui una forma può essere sfruttata dalla selezione (anticipazione dei dati, soluzioni degeneri) li esamina il Critic allo Step 5 per ciascuna forma.
**Cicli in parallelo:** il 007 (Simone) è aperto su `main`; il 009 (E1) è aperto con lo Step 12 sospeso; questo ciclo è il terzo aperto. È coperto da «cicli successivi dell'epica» nella decisione sull'eccezione. Condizione operativa: lo Step 12 di 009 e di 010 e ogni aggiornamento dei file di stato (metriche, punteggi, checklist NRC, `docs/MAP.md`) aspettano la chiusura del 007 e il suo assorbimento; il 009 si chiude prima del 010.

**Problem statement**
Il genoma attuale è una macchina a nove stati: ogni stato ha transizioni condizionate da confronti tra quattro filtri IIR (due sul prezzo, due sul volume) e margini, e due stati attivano buy o sell; stop loss e take profit sono parametri (`src/engine/genome.js`, vendor Consilium). Gli esperimenti di Consilium (rapporto `archive/reports/2026-09-12_train-test-holdout-experiments.md`) mostrano che le strategie evolute con questa forma non battono il buy&hold e si specializzano su un paniere, ma non separano la parte dovuta alla forma da quella dovuta alla funzione di fitness. Non esiste una rassegna delle forme alternative né un criterio per sceglierne una: senza, E2 (implementazione) e le ricerche R3 (codifica genetica) e R4 (equazioni di decisione) non hanno un oggetto su cui lavorare.

**Why now**
È la prima delle cinque domande dell'epica e sblocca R3, R4 ed E2. Il contratto di strategia del ciclo 009 ne fissa già i vincoli di integrazione, quindi la rassegna può misurare ogni forma su requisiti concreti.

**Scope — IN**
- Rassegna di almeno: punteggio lineare di indicatori con soglie, alberi di espressioni / programmazione genetica, rule list, piccola rete neurale (MLP, NEAT), fuzzy; più le forme che emergono dallo Step 4.
- Per ogni forma: espressività, spazio di ricerca, interpretabilità, costo di valutazione, adattamento a crossover e mutazione, adeguatezza al contratto di strategia del ciclo 009 (`kind`, `labels`, indicatori, decisione `buy`/`sell`/`hold`, esecuzione all'apertura della barra successiva, `serialize`).
- Confronto con il genoma FSM attuale.
- Esito: 1–2 candidati motivati, con le evidenze presentate a Luca; documento in `docs/` ed eventuale decisione in `memory/decisions/`.

**Scope — OUT**
- Gli indicatori in sé (R2), la codifica genetica (R3), le equazioni di decisione (R4), la fitness (R5), il protocollo di valutazione (R6): R1 ne usa solo ciò che serve a confrontare le forme.
- Qualsiasi codice in `src/`, `tests/`, `scripts/`; prove numeriche su dati salvo piccoli calcoli di esempio dichiarati come tali.
- `archimate/**` e gli altri file esclusi dall'eccezione sul ciclo 007.
- La scelta finale della forma: è di Luca (criterio di accettazione).

**Estimated complexity:** Medium (conoscenza ampia da sintetizzare e tracciare; nessuna implementazione).

**Context check**
- Memory lookup: `decisions/2026-10-11-strategy-contract` (vincoli di integrazione), `knowledge/consilium-trader-order-timing` (intenzione, esecuzione all'apertura successiva), `knowledge/consilium-holding-semantics`, `decisions/2026-09-29-consilium-v1-golden-reference`, `patterns/jekyll-stakeholder-docs` (escape di Liquid nei documenti), `decisions/2026-10-11-parallel-cycle-exception`. Nessuna entry precedente sulle forme alternative di genoma.
- Validation matrix: nessun deploy; il documento va pubblicato su Pages (build Jekyll da verificare allo Step 9).
- NRC H-item check: nessun H-item attivato. File previsti: nuovo documento in `docs/` e file in `.swhouse/`; nessun modulo dell'elenco NRC (`src/engine/*`, `src/vendor/consilium/*`, `src/main.js`, `src/style.css`, `index.html`, `archimate/**`) è toccato.
- Domande aperte per Luca: (1) lingua del documento (i documenti esistenti sono in inglese, cicli e issue in italiano); (2) livello di dettaglio matematico atteso.
- Fonti: Step 2 stabilisce quali fonti sono ammesse (letteratura, documentazione di librerie, codice di Consilium); ogni affermazione nel documento riporta la sua fonte.

**Prossimo step:** Step 2 — PRODUCT OWNER, in una nuova sessione.
