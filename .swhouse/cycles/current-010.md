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

**Risposte dell'operatore (2026-10-11):**
1. Lingua del documento di ricerca: **italiano**.
2. Dettaglio matematico: **intermedio**, leggibile da persone con formazione tecnico-scientifica ma non necessariamente finanziaria; ogni termine di finanza va spiegato alla prima occorrenza.

**Prossimo step:** Step 2 — PRODUCT OWNER, in una nuova sessione.

## Step 2 — PRODUCT OWNER: Define the Value

**Agent:** claude-opus-5-5

**Chi ha il problema:** Luca e Simone, che devono scegliere la forma del nuovo genoma prima di investire in R3, R4 ed E2; in seconda battuta chi implementerà E2, che parte dalla forma scelta.

**Valore misurabile**
- Dopo il ciclo restano **1–2 candidati** con motivazione e con le condizioni in cui verrebbero scartati, invece di una scelta implicita.
- Ogni forma è confrontata con le stesse sette dimensioni (AC-02) e con l'FSM attuale, così la scelta si può discutere su evidenze e non su preferenze.
- R3, R4 ed E2 possono partire senza rimettere in discussione la forma.

**Costo del non farlo:** si sceglie la forma per abitudine o per la prima che si prova; se non regge (non evolve bene, non si interpreta, non produce memoria di stato), lo si scopre dopo E2, con il codice già scritto. Resterebbe anche indistinto quanto della debolezza osservata in Consilium dipenda dalla forma e quanto dalla fitness (R5).

**Requisito dell'operatore da onorare:** la memoria di stato deve nascere da indicatori finanziari già qualificati, non da una macchina a stati. Per ogni forma la rassegna dice quindi **da dove viene la memoria del passato** (indicatori su finestre, stato interno ricorrente, ritardi in ingresso).

**Criteri di accettazione**
- AC-01 **Copertura.** Una scheda per ciascuna di: punteggio lineare di indicatori con soglie, alberi di espressioni / programmazione genetica, rule list, rete neurale piccola (MLP e NEAT), fuzzy; più almeno una forma emersa dallo Step 4.
- AC-02 **Sette dimensioni per scheda:** espressività, spazio di ricerca, interpretabilità, costo di valutazione, adattamento a crossover e mutazione, adeguatezza al contratto di strategia del ciclo 009, origine della memoria di stato.
- AC-03 **Confronto con l'FSM attuale** nella stessa griglia, come riga di riferimento.
- AC-04 **Tracciabilità.** Ogni affermazione non banale riporta la fonte (riferimento bibliografico, URL verificato o percorso nel codice); ciò che non ha fonte è marcato come ipotesi. Nessuna cifra di rendimento senza fonte, e nessuna promessa di redditività (coerente con il principio del PoC).
- AC-05 **Esito.** 1–2 candidati con motivazione, condizioni di scarto ed elenco di ciò che non si è potuto accertare, da portare a Luca.
- AC-06 **Leggibilità.** Italiano; matematica di livello intermedio per lettori tecnico-scientifici non finanziari; simboli definiti alla prima comparsa; termini di finanza spiegati alla prima occorrenza, con un breve glossario.
- AC-07 **Scelta di Luca registrata** nel file del ciclo (blocco `## Human Verification — [data]` con esecutore, oggetto, esito, note); senza, il ciclo resta DEFERRED.
- AC-08 **Pubblicazione.** Il documento sta in `docs/` con l'intestazione usata dagli altri documenti, compare nel menu del sito, e la prosa evita costrutti che Jekyll interpreta come Liquid. La build di Pages si verifica dopo il merge su `main` (PENDING_HUMAN, come negli altri cicli); Jekyll non è disponibile in locale.
- AC-09 **Nessuna modifica** a `src/`, `tests/`, `scripts/`, `archimate/**` né ai file di stato condivisi prima dello Step 12.

**Fonti ammesse:** letteratura scientifica e rassegne sull'uso di algoritmi genetici, programmazione genetica, reti neuroevolutive e logica fuzzy nel trading; testi di riferimento sugli indicatori tecnici; documentazione di librerie note; il codice e il rapporto sugli esperimenti di Consilium. **Non ammesse come prova:** materiale commerciale o promozionale e risultati di backtest non riproducibili usati per sostenere la redditività.

**UX Coherence Check:** non applicabile. Il ciclo produce un documento; non introduce campi, controlli né passi di flusso (AC-09).

**Prossimo step:** Step 3 — ARCHITECT.
