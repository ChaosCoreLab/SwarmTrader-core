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

## Step 3 — ARCHITECT: Propose Structure

**Agent:** claude-sonnet-5-5 (subagent)

**Input Surface Audit:** non applicabile; il ciclo produce un documento, senza UI né input (Step 2, AC-09).

**Assunzioni**
- La rassegna è un documento unico in `docs/`; le fonti si raccolgono negli Step 4–8, non qui.
- Il contratto di strategia è quello letto in `src/engine/strategy.js` (`assertStrategy`, `StrategyIndividual`), in `src/engine/fsmStrategy.js` e in `docs/architecture/simulator-overview.md#strategy-contract`, con la decisione `memory/decisions/2026-10-11-strategy-contract.md` (confidence Medium: provato solo con una seconda strategia di test).
- «Struttura» = struttura della rassegna e del documento; nessun codice.

### Scomposizione in componenti

Sette componenti, ciascuno con una sola responsabilità; le dipendenze vanno dall'alto in basso.

1. **Metodo e fonti** (sezione breve in apertura). Fonti ammesse e non ammesse (Step 2), formato di citazione, regola «affermazione senza fonte = ipotesi, marcata come tale». Non dipende da nulla; tutti gli altri lo usano.
2. **Glossario e notazione.** Simboli definiti alla prima comparsa nel testo; termini di finanza (OHLCV, buy&hold, stop loss, take profit, drawdown, CAGR, look-ahead bias, overfitting, ecc.) spiegati alla prima occorrenza e raccolti in un breve glossario in coda. Responsabilità di AC-06.
3. **Riga di riferimento FSM.** Descrive il genoma attuale con le stesse sette dimensioni, ricavando i fatti dal codice: 9 stati (`GENOME_STATES`), transizioni come liste di id di condizione 0–13 in `genome.js`, 4 coefficienti IIR in (0,1), margini percentuali, `stop_loss_percent` e `take_profit_percent`; memoria = lo stato corrente più i filtri IIR (`FsmIndividual.describe()` espone i quattro IIR). È la prima scheda, così il lettore ha il metro prima delle alternative (AC-03).
4. **Schema comune delle schede** (AC-02). Intestazione fissa per ogni forma: *definizione in 3–5 righe con la formula* → *le sette dimensioni* (espressività, spazio di ricerca, interpretabilità, costo di valutazione, adattamento a crossover e mutazione, adeguatezza al contratto, origine della memoria di stato) → *rischi di sfruttamento da parte della selezione* (anticipazione dei dati, soluzioni degeneri; da qui il Critic parte, lo Step 6 è omesso) → *fonti*. Ogni dimensione è una voce di una riga + giudizio ordinale + fonte o «ipotesi».
5. **Scheda del contratto** (verificabilità dell'AC-02/adeguatezza). Sotto-tabella fissa, identica per ogni forma, con una riga per ogni membro che `assertStrategy` e `StrategyIndividual` richiedono: `kind`; `labels` (lista finita e non vuota di stringhe: come una forma continua o ad albero produce etichette?); `init/reset` (stato ricorrente azzerabile); `updateIndicators` (solo dati fino alla barra corrente); `decide()` → `buy|sell|hold`, valutata a fine barra con esecuzione all'apertura della barra successiva (`knowledge/consilium-trader-order-timing`); `describe()` (numeri finiti: ogni indicatore deve essere esposto come numero); `serialize()` (JSON semplice); parametri di `Trader` (`buyPercent`, `stopLossPercent`, `takeProfitPercent`) che restano parametri evolvibili o fissi. Esito per riga: *diretto / con adattamento (descritto) / non soddisfatto*. È una verifica sulla carta, non codice: la prova reale è E2.
6. **Griglia di confronto e scala.** Una tabella forme × sette dimensioni, FSM come prima riga, con scala ordinale a tre livelli (es. alto/medio/basso) definita dimensione per dimensione prima di compilare, in modo che «alto» non cambi significato da una riga all'altra. **Nessun punteggio numerico totale né pesi**: i pesi sarebbero una scelta di valore, che è di Luca, e darebbero una precisione apparente. Ogni cella rimanda alla scheda e quindi alla fonte.
7. **Sintesi per la decisione di Luca** (AC-05). 1–2 candidati con motivazione, condizioni di scarto («se E2 mostra che…, si passa a…»), elenco di ciò che non si è potuto accertare, e le domande aperte lasciate a R3/R4/R5/R6. Chiude con lo spazio per la scelta di Luca (AC-07 la registra nel file del ciclo, non nel documento).

**Posizione nel sito.** File: `docs/architecture/genome-forms-review.md`, intestazione come gli altri documenti (`title`, `layout: doc`, `last_verified`, prima riga `last_verified:` nel corpo; niente `mermaid: true` se non serve). Menu: una voce in `_data/docs.yml` sotto `architecture`. Motivo: `_includes/use-case-nav.html` itera solo `site.data.docs.architecture`, `decisions` e `operations`; un gruppo `research` richiederebbe di modificare l'include e rischiare la build di Pages senza poterla provare in locale (Jekyll non è disponibile). Riga in `docs/MAP.md` e menu si aggiornano allo Step 12 per la condizione sui file di stato (il 007 è aperto). Prosa: nessuna doppia graffa né `{%`; le formule in testo semplice o in blocchi di codice, mai nella notazione che Liquid interpreta (`patterns/jekyll-stakeholder-docs`).

### Interfacce e dipendenze

- **Ciclo 009 (contratto di strategia):** R1 *consuma* il contratto e non lo modifica. Se la scheda del contratto trova un requisito che il contratto non copre (per esempio `labels` fisse per una forma con output continuo, o indicatori non finiti), lo segnala come «richiesta di estensione al contratto» da trattare in E2, non lo risolve.
- **R2 (indicatori):** R1 usa gli indicatori solo come esempio di ingresso e dice per ogni forma *dove* entrerebbero (tipo e numero di ingressi); non li qualifica. **Cosa R1 non deve rimettere in discussione:** l'elenco degli indicatori.
- **R3 (codifica genetica) e R4 (equazioni di decisione):** R1 consegna la forma e per ciascuna una frase su cosa va codificato (genotipo di massima) e su che tipo di decisione produce. Non fissa operatori né equazioni.
- **R5 (fitness) e R6 (protocollo di valutazione):** R1 dichiara solo la sensibilità della forma (rischio di overfitting, costo di valutazione per candidato); non propone fitness.
- **E2:** parte dai 1–2 candidati, dalla scheda del contratto e dalle condizioni di scarto. Per non farlo ripartire da zero, la scheda del contratto va redatta in modo che E2 possa derivarne i test.
- **Cosa R1 deve consegnare perché non si rimetta in discussione:** (a) quale forma si usa; (b) da dove viene la memoria di stato (requisito dell'operatore); (c) i vincoli che il contratto impone; (d) le condizioni di scarto del candidato.

### Approccio A — Per forma, schema uniforme, con griglia trasversale

Una scheda per forma (FSM di riferimento, punteggio lineare, alberi/GP, rule list, MLP, NEAT, fuzzy, più le forme dallo Step 4), ciascuna con lo schema dei componenti 4 e 5; poi la griglia (6) e la sintesi (7).

**Pro:** corrisponde direttamente ad AC-01 (una scheda per forma) e AC-02; la fonte sta accanto all'affermazione, quindi AC-04 si verifica scheda per scheda; chi cerca una forma la trova; una forma nuova dallo Step 4 si aggiunge senza toccare le altre; il confronto per dimensione è comunque disponibile nella griglia, senza ripetere il testo.
**Contro:** le somiglianze tra forme (es. MLP e NEAT condividono la rete; GP e rule list condividono i predicati) non emergono dalla struttura: vanno esplicitate con rimandi o in una breve sezione di famiglie; il rischio di schede di lunghezza diseguale, controllato dal limite di righe per dimensione.

### Approccio B — Per capacità richiesta

Sezioni per domanda: «come si ottiene memoria dal passato», «come si interpreta», «come evolve», «quanto costa», «come si integra»; in ogni sezione si confrontano tutte le forme.

**Pro:** mette in primo piano il requisito centrale (memoria da indicatori) e agevola il confronto diretto per criterio.
**Contro:** la fonte e la descrizione di una forma si frammentano in cinque sezioni, quindi AC-01 (una scheda per forma) non si verifica a vista e AC-04 richiede di ricomporre; ogni forma nuova tocca tutte le sezioni; il lettore non finanziario incontra i concetti di una forma (es. fuzzy) sparsi e ripetuti. Il confronto per criterio che B offre è già la griglia di A.

### Approccio C — Per catena codifica → decisione → valutazione

Struttura in tre parti che seguono il ciclo evolutivo: come il genoma è codificato (genotipo), come produce la decisione (fenotipo), come lo si valuta (fitness e protocollo); le forme compaiono in ciascuna parte.

**Pro:** riflette il modo in cui un algoritmo genetico lavora; collega il documento a R3, R4, R5.
**Contro:** sovrappone R1 a R3 (codifica), R4 (equazioni) e R5/R6 (valutazione), che il perimetro esclude; spinge R1 a decisioni che spettano alle ricerche successive; frammenta le forme come B. **Scartato:** aggiunge complessità e invade il perimetro senza vantaggio sulla scelta della forma.

### Raccomandazione

**Approccio A**, con tre elementi trasversali già nei componenti: la scheda del contratto (5), la colonna «origine della memoria» ripresa in evidenza nella griglia (6) per onorare il requisito dell'operatore, e una breve sezione di famiglie (reti: MLP/NEAT; programmi: GP/rule list/lineare) che compensa il difetto di A senza cambiare struttura. **B si ottiene gratis** come lettura della griglia; **C si scarta**. Si aggiunge una sola cosa al minimo (la scheda del contratto) perché risponde direttamente all'unico criterio verificabile (AC-02, adeguatezza). Non si propongono grafici, Mermaid né pagine multiple: un file, tabelle testuali, come i documenti esistenti.

### Tracciabilità (AC-04), leggibilità (AC-06), nessuna promessa di redditività

- **Tracciabilità:** ogni voce delle sette dimensioni termina con `[fonte]` (riferimento bibliografico con anno, URL verificato con data di accesso, oppure `percorso/del/file.js` per il codice) oppure con `[ipotesi]`. Una sezione finale «Riferimenti» elenca le fonti numerate; durante la raccolta (Step 4–8) si tiene un elenco di lavoro «affermazione → fonte → verificata sì/no» che il Critic può controllare a campione. Fonti non ammesse (commerciali, backtest non riproducibili) non entrano come prova.
- **Leggibilità:** ordine fisso per scheda (definizione → formula → sette dimensioni), simboli definiti alla prima comparsa in ogni scheda dove compaiono, lunghezza limitata per voce, glossario in coda con rimando dalla prima occorrenza. Matematica a livello intermedio: formule semplici (somme pesate, soglie, funzioni di attivazione), niente dimostrazioni.
- **Nessuna promessa di redditività:** nessuna cifra di rendimento senza fonte, e quando una fonte ne riporta una è citata come risultato di quello studio, con le sue condizioni; il documento dichiara in apertura che confronta *forme* per espressività, ricercabilità e integrazione, non rendimenti; i candidati si motivano con quelle dimensioni, mai con «guadagnerebbe di più». Come per il PoC, resta uno strumento di ispezione storica (`docs/architecture/simulator-overview.md`, «Purpose»).

### Rischi che segnalo al Critic (Step 5)
- La scala ordinale resta soggettiva se le soglie non si definiscono prima di compilare la griglia.
- `labels` è una lista fissa: forme con output continuo (MLP, fuzzy, punteggio lineare) devono derivare etichette (es. fasce dell'output), con possibile perdita di informazione nel replay.
- Il contratto è provato con una sola strategia di test (confidence Medium): l'adeguatezza dichiarata qui è di carta fino a E2.
- Lunghezza del documento rispetto a AC-06.

**Confidence:** Medium — la struttura è semplice e coerente con gli AC, ma la qualità della rassegna dipenderà dalle fonti trovate negli Step successivi e dalla definizione della scala, non ancora verificabili; l'adeguatezza al contratto si conferma solo con E2.

**Prossimo step:** Step 4 — EXPLORER
