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

## Step 4 — EXPLORER: Generate Alternatives

**Agent:** claude-sonnet-5-5 (subagent)
**Confidence:** N/A (fase divergente: la fattibilità non si valuta qui)
**Assunzioni:** il caso «ricerca» si legge così: gli *approcci* sono modi di condurre la rassegna o di impostare il problema della forma; le *forme* sono i candidati da schedare. Letti: Step 1–3 di questo file; `src/engine/strategy.js` (`assertStrategy`, `StrategyIndividual`: `labels` lista non vuota di stringhe, `decide()` in `buy|sell|hold`, ordine per barra indicatori → `trader.update` → decisione); `src/engine/fsmStrategy.js` (`describe()` espone i quattro IIR, `serialize()` restituisce il genoma JSON); `src/engine/genome.js` (`GENOME_STATES` a 9 etichette, coefficienti IIR in (0,1)); `docs/architecture/simulator-overview.md#strategy-contract`; `memory/knowledge/consilium-trader-order-timing.md`; l'Esperimento 1 del rapporto Consilium `archive/reports/2026-09-12_train-test-holdout-experiments.md` (lettura parziale: gli altri tre esperimenti non sono stati riletti in questo step). Tecniche usate: Challenge, Provocation, Analogies (teoria dei filtri e del controllo), Lateral Thinking.

### Parte 1 — Approcci alternativi alla rassegna

#### Alternativa 1 — Imbuto: prima i vincoli duri, poi il confronto (sfida l'Architect)
**Tecnica:** Challenge («perché tutte le forme devono avere la stessa scheda lunga?»).
**Idea:** l'Architect propone sette dimensioni uniformi per ogni forma, senza punteggio totale. Questa alternativa cambia l'*ordine*: (1) una porta d'ingresso a sì/no con i soli vincoli *duri* del contratto e dell'operatore, verificabili sulla carta: `labels` finita e non vuota, ogni indicatore esposto come numero finito (`describe()`), `serialize()` in JSON semplice, decisione discreta eseguibile all'apertura della barra successiva, **memoria di stato derivata da indicatori e non da uno stato discreto codificato nel genoma** (`src/engine/strategy.js`, requisito dell'operatore nello Step 2); (2) schede lunghe, con le sette dimensioni, solo per le forme che passano la porta o che passano «con adattamento»; (3) per le altre, una scheda breve di tre righe con il motivo dell'esclusione e la fonte. Le condizioni di scarto dei candidati diventano così la parte iniziale del documento e non un'appendice.
**Cosa cambierebbe rispetto allo Step 3:** la scheda del contratto (componente 5) si sposta *prima* della griglia e diventa un criterio eliminatorio, non una riga descrittiva; il documento si accorcia (rischio di lunghezza segnalato dall'Architect, AC-06) e il lettore non finanziario non deve leggere sette dimensioni per una forma che il contratto comunque esclude.
**Perché potrebbe essere migliore:** concentra la fatica di fonti e di spiegazione sulle 3–4 forme che hanno una possibilità, e rende esplicita la scelta di valore (cosa è eliminatorio) invece di lasciarla nascosta nella scala ordinale, di cui l'Architect stesso segnala la soggettività.
**Attenzione:** AC-01 chiede «una scheda» per ciascuna forma; la scheda breve va dichiarata come tale (da concordare con il Product Owner). [ipotesi di metodo, nessuna fonte]

#### Alternativa 2 — Memoria prima, lettura poi: il genoma come banco di filtri più una lettura (primo principio diverso)
**Tecnica:** Analogies (teoria dei filtri e del controllo) e Lateral Thinking.
**Idea:** si parte da un fatto del codice, non da una forma. I quattro indicatori del genoma attuale sono filtri ricorsivi del primo ordine: la memoria del passato è `y[t] = a·y[t-1] + (1-a)·x[t]` con `a` in (0,1) (`src/engine/genome.js`: coefficienti IIR «maggiori di 0 e minori di 1»; `FsmIndividual.describe()`: `iirPrice1`, `iirPrice2`, `iirVolume1`, `iirVolume2`). Ogni indicatore tecnico a finestra (media mobile, esponenziale, differenza tra medie, variazione su N barre) è un filtro lineare di serie temporale: una combinazione di ritardi dell'ingresso e dell'uscita. Quindi **la memoria di stato richiesta dall'operatore sta tutta nel banco di filtri, e una forma di genoma è solo la «lettura» che da un vettore di valori dei filtri produce `buy`, `sell` o `hold`**. Il problema si scompone in un prodotto: memoria (quali filtri, con quali coefficienti) × lettura (soglia su un punteggio, albero, lista di regole, rete piccola, logica fuzzy). La rassegna confronta allora le *letture*, tutte alimentate dallo stesso banco, e tratta l'FSM come la lettura «con stato interno proprio» che si vuole evitare.
**Perché vale:** separa due fonti di debolezza che il rapporto Consilium non separa (forma vs fitness): se la memoria è la stessa, la differenza tra forme diventa attribuibile alla sola lettura. Dà a R2 (indicatori) e R3 (codifica) un'interfaccia pulita: il genotipo è «coefficienti dei filtri + parametri della lettura». Il linguaggio degli stati nel senso del controllo (Kalman 1960) è quello di un tecnico-scientifico, quindi aiuta AC-06.
**Limite di perimetro:** tocca R2 (gli indicatori) che lo Step 3 vieta di rimettere in discussione: va usata solo come *cornice di confronto* («dove entrerebbero i filtri»), senza scegliere o qualificare indicatori. Da segnalare allo Step 5.
**Fonti:** forma ricorsiva e vincolo (0,1): `src/engine/genome.js`; stato e filtraggio ricorsivo: Kalman 1960 [F7]; l'affermazione che *ogni* indicatore a finestra sia un filtro lineare è una conseguenza elementare per le medie e le differenze, non per indicatori non lineari (per esempio quelli basati su massimi e minimi, usati in Allen e Karjalainen [F8]): [ipotesi, da precisare con un testo di riferimento sugli indicatori, che R2 deve fornire].

#### Alternativa 3 — Prima un piccolo esperimento nullo, poi la rassegna (esce dal perimetro dello Step 1)
**Tecnica:** Provocation («e se la rassegna di letteratura non servisse a decidere?») e Challenge.
**Idea:** il rapporto di Consilium (Esperimento 1) mostra che le dieci strategie migliori in addestramento hanno tutte un rendimento negativo nel periodo tenuto fuori, ma non dice quanto di ciò sia dovuto alla forma e quanto alla fitness. Un esperimento di controllo lo separerebbe: far evolvere ciascuna forma candidata, con *lo stesso* budget e la *stessa* fitness, su serie senza struttura predicibile (per esempio rendimenti dei dati ENI rimescolati, o una passeggiata aleatoria sintetica) e misurare lo scarto addestramento/holdout. Una forma che «trova» un vantaggio dove non ce n'è ha una grande capacità di sovradattare; una che non lo trova, no. L'esito è una misura *per forma* dell'attitudine a sfruttare il rumore, che la letteratura da sola non fornisce.
**Fonti per la motivazione:** il problema, cioè che i test su dati tenuti fuori sono inaffidabili quando si seleziona tra molte configurazioni, è trattato in Bailey et al. [F9]; il comportamento osservato in Consilium in `archive/reports/2026-09-12_train-test-holdout-experiments.md` (Esperimento 1); i test su serie rimescolate o sintetiche come tecnica di controllo: [ipotesi, fonte da verificare].
**ESCE DAL PERIMETRO DELLO STEP 1:** richiede codice (almeno le forme, un generatore di serie nulle, un GA) e calcoli su dati; lo Step 1 esclude «qualsiasi codice in `src/`, `tests/`, `scripts/`» e «prove numeriche su dati salvo piccoli calcoli di esempio». Non è un'alternativa a questo ciclo: è un'alternativa a *R1 come ciclo di sola ricerca*. Si segnala al Coordinator come possibile ciclo successivo (a valle della scelta dei candidati, con E2 o con R6 protocollo di valutazione) e come informazione utile al Critic: le forme che la rassegna promuove restano non confermate fino a un esperimento di questo tipo.

#### Alternativa 4 — Forma minima e buy&hold come righe di controllo nella griglia
**Tecnica:** Provocation («il genoma più semplice possibile: un filtro, una soglia»).
**Idea:** aggiungere alla griglia due righe che non sono candidati ma metri: (a) buy&hold, già usato come riferimento da Consilium; (b) una «forma minima» con un solo filtro e una sola soglia (due numeri nel genoma, per esempio posizione lunga quando il prezzo supera il suo filtro per un margine). Ogni forma ricca deve giustificare perché l'espressività in più non è solo capacità di sovradattare; se una forma ricca non ha motivo di superare la minima sulle sette dimensioni, la minima è il candidato prudente.
**Perché vale:** disciplina contro la tentazione di preferire la forma più espressiva, un rischio che il rapporto Consilium rende concreto (le strategie evolute non battono il buy&hold e non si trasferiscono tra panieri). Allen e Karjalainen [F8] usano regole basate su medie mobili e massimi/minimi, cioè forme molto semplici, come famiglia di partenza; la riga minima è coerente con quel precedente, senza riportarne i risultati numerici.
**Limite:** non è un'alternativa alla rassegna, la integra a costo quasi nullo; la forma minima è già in parte il «punteggio lineare con soglie» dello Step 1 con due parametri.

**Riassunto del rapporto con l'Architect:** l'Alternativa 1 lo sfida (ordine e peso della scheda), la 2 cambia il punto di partenza (la memoria come filtro, non la forma), la 3 cambia il metodo (esperimento invece di lettura) e va fuori perimetro, la 4 è un'aggiunta. La 2 e la 4 si possono adottare *insieme* all'Approccio A dell'Architect; la 1 lo sostituisce in parte; la 3 non è adottabile in questo ciclo.

### Parte 2 — Nuove forme di genoma (oltre alle cinque previste)

Le cinque previste: punteggio lineare con soglie, alberi/GP, rule list, MLP/NEAT, fuzzy. Ogni «giudizio di pertinenza» riguarda solo il contratto (`src/engine/strategy.js`) e il requisito dell'operatore; non è una valutazione critica.

#### N1 — Filtro di regime nascosto (modello a stati nascosti, HMM) con lettura evolvibile
**Cos'è:** un modello in cui il mercato è in uno di K regimi non osservati (per esempio «salita», «laterale», «discesa»); a ogni barra si aggiorna una *distribuzione di credenza* sui regimi, `b[t] = normalizza( O(x[t]) · (T^T · b[t-1]) )`, dove `x[t]` è il vettore di indicatori della barra, `T` la matrice di transizione tra regimi e `O` la verosimiglianza dell'osservazione in ciascun regime. Questo è l'algoritmo di filtraggio in avanti descritto da Rabiner 1989 [F6].
**Memoria di stato da indicatori:** la memoria è il vettore `b[t]`, ricorsivo come un filtro, alimentato da indicatori già qualificati. Non è codificata come stato discreto nel genoma: il genoma contiene i parametri (medie e varianze per regime, `T`) e una mappa regime → `buy|sell|hold`.
**Come evolverebbe:** mutazione gaussiana dei parametri continui, con vincoli (righe di `T` che sommano a 1); crossover per blocchi di regime o per media pesata; alternativa nota: stimare i parametri con l'algoritmo EM (descritto in [F6]) e usare il GA solo sulla mappa regime → azione e su K [ipotesi sull'uso nel GA, nessuna fonte]. L'uso dell'HMM nei mercati finanziari: [ipotesi, fonte da verificare].
**Pertinenza al contratto:** `labels` = i K regimi (lista finita, naturale); `describe()` = la credenza `b[t]` come numeri finiti; `serialize()` = parametri in JSON; la decisione discreta si ottiene dal regime più probabile o da una soglia sulla credenza. **Nota per Luca:** un HMM con K regimi e una mappa regime → azione assomiglia strutturalmente a una macchina a stati (con stati *morbidi* e transizioni calcolate da indicatori); la richiesta dell'operatore («non una macchina a stati») si rispetta nella lettera, meno nello spirito: la valutazione è sua.
**Da portare nella rassegna:** **sì**, come scheda piena: è l'unica forma qui che dà `labels` finite per costruzione ed è la più vicina al problema che l'FSM attuale tenta di risolvere.

#### N2 — Osservatore di stato lineare (filtro di Kalman, livello e pendenza) con lettura a soglia
**Cos'è:** un modello in cui il prezzo (o il suo logaritmo) è la somma di un livello e di una pendenza non osservati più rumore; il filtro di Kalman [F7] stima ricorsivamente i due e la loro incertezza. La decisione si legge dalla pendenza stimata (e dal suo rapporto con l'incertezza).
**Memoria di stato da indicatori:** il vettore di stato stimato (livello, pendenza), aggiornato a ogni barra; con rumori costanti, il guadagno del filtro converge a un valore fisso e l'aggiornamento diventa un filtro ricorsivo di tipo esponenziale, quindi parente stretto degli IIR dell'FSM attuale: *è un'osservazione nota nella letteratura sul livellamento esponenziale, da citare con un testo di riferimento* [ipotesi, fonte da verificare]. Il banco di filtri dell'Alternativa 2 ne è la generalizzazione.
**Come evolverebbe:** il genotipo ha pochissimi numeri (rapporto tra varianza del processo e del rumore per livello e pendenza, soglia di lettura, eventuale filtro anche sul volume); mutazione gaussiana sul logaritmo dei parametri; crossover aritmetico. Spazio di ricerca minuscolo.
**Pertinenza al contratto:** `labels` non nascono da sole: vanno derivate da fasce della pendenza (per esempio «in salita / piatto / in discesa»), con la perdita di informazione che l'Architect segnala per le forme continue; `describe()`: livello, pendenza, guadagno, tutti numeri finiti; `serialize()` semplice.
**Da portare nella rassegna:** **sì, ma come scheda breve o fusa con la «forma minima»** dell'Alternativa 4: più che una forma ricca è la versione con basi teoriche del punteggio lineare con filtri, e serve da metro.

#### N3 — Programmazione genetica cartesiana o lineare, con registri (variante della scheda GP)
**Cos'è:** il programma è un grafo orientato su una griglia di nodi con genoma di interi a lunghezza fissa (Cartesian GP) [F2][F3], o una sequenza di istruzioni su registri (GP lineare, trattato tra le rappresentazioni in [F10], capitolo da indicare). Nodi = operazioni su indicatori (`+`, `×`, confronto, `if`); l'uscita è un valore da cui si ricava `buy|sell|hold`.
**Memoria di stato:** attenzione al requisito dell'operatore. Se i registri sono riscritti a ogni barra, la memoria nasce *dal programma* (non da indicatori qualificati) e questo ricrea, in forma implicita, uno stato non qualificato; la variante accettabile ha *solo* nodi feedforward sugli indicatori, con la memoria nei filtri a monte (coerente con l'Alternativa 2).
**Come evolverebbe:** il CGP si evolve tipicamente per sola mutazione (strategia evolutiva con un genitore e pochi figli) e ha ridondanza neutra nel genotipo [F3, passaggio da verificare]; il GP lineare ammette crossover tra segmenti. [F2][F3]
**Pertinenza al contratto:** `labels` da fasce dell'uscita; `describe()` obbligherebbe a esporre i valori intermedi o solo l'uscita; `serialize()` del genoma intero: semplice. **Da portare:** come **variante** nella scheda «alberi / GP» (con il vincolo sulla memoria), non come scheda a sé.

#### N4 — Evoluzione grammaticale (grammatical evolution)
**Cos'è:** il genoma è una stringa di interi; una grammatica (BNF) la traduce in un programma o in una regola [F4]. Cambiare la grammatica cambia la *famiglia* di forme raggiungibili senza cambiare l'algoritmo di ricerca: la stessa macchina può produrre una rule list, un'espressione, una soglia su punteggio, o perfino un FSM.
**Memoria di stato:** quella dei terminali della grammatica; se i terminali sono indicatori a finestra qualificati (R2), la memoria nasce lì.
**Come evolverebbe:** mutazione e crossover su stringa di interi (operatori ordinari, con mappatura genotipo-fenotipo molti-a-uno) [F4].
**Pertinenza al contratto:** dipende dalla grammatica; `labels` e `serialize()` seguono la forma prodotta.
**Da portare:** **come meccanismo di codifica**, quindi materia di R3, non come forma: segnalare nel documento che esiste e rimandare. Interessante come ponte tra rule list, GP e punteggio lineare nella sezione «famiglie».

#### N5 — Learning classifier system (LCS)
**Cos'è:** una popolazione di regole «se condizione sugli indicatori allora azione», ciascuna con una forza appresa; un GA fa evolvere le regole e un meccanismo di apprendimento attribuisce il merito alle regole che agiscono. L'introduzione di riferimento è Urbanowicz e Moore 2009 [F11]; si distingue lo stile «Michigan» (un individuo = una regola) da quello «Pittsburgh» (un individuo = un insieme di regole).
**Memoria di stato:** dagli indicatori in ingresso; alcune varianti hanno memoria interna (messaggi), che sconsiglierei per il requisito.
**Come evolverebbe:** GA su regole (crossover e mutazione su condizioni e azioni) [F11].
**Pertinenza al contratto:** nella versione Pittsburgh l'individuo è una rule list con `serialize()` immediato; nella Michigan l'individuo del GA del progetto sarebbe l'intera popolazione di regole, in tensione con l'ipotesi del contratto «un genoma = una strategia». **Da portare:** **no come scheda a sé**; da citare nella scheda «rule list» come variante (Pittsburgh), con il rimando [F11].

#### N6 — Reservoir computing / echo state network
**Cos'è:** una rete ricorrente casuale e *fissa* riceve gli indicatori; la sua risposta interna, ricca e con memoria dell'ingresso, viene letta da una combinazione lineare addestrata [F5].
**Memoria di stato:** lo stato ricorrente della rete (centinaia di numeri), non indicatori qualificati: potrebbe contrastare con il requisito dell'operatore.
**Come evolverebbe:** evolvere solo i pesi di lettura e pochi iperparametri (raggio spettrale, scala dell'ingresso), con il «seme» del generatore casuale nel genoma per rendere il riservoir riproducibile (`serialize()`) [ipotesi, nessuna fonte].
**Pertinenza al contratto:** `describe()` dovrebbe esporre molti numeri; `labels` da fasce dell'uscita; interpretabilità molto bassa. **Da portare:** **no come scheda**, solo come nota di contrasto nella famiglia «reti» accanto a MLP e NEAT (che condividono la rete; NEAT è descritto in Stanley e Miikkulainen 2002 [F1]).

**Escluse a priori, con motivo:** foreste di decisione costruite con CART (Breiman et al. 1984 [F12]) o con simili, perché si addestrano con un algoritmo greedy e non con un GA; la regressione simbolica è una istanza del GP (stessa scheda); i metodi di apprendimento per rinforzo profondo escono dal contratto (un genoma serializzabile con forma fissa) e dall'epica (GA).

### Parte 3 — Quali forme portare nella rassegna

| Forma | Nel documento | Motivo in una riga |
|---|---|---|
| N1 HMM / filtro di regime | scheda piena | `labels` finite per costruzione; memoria da indicatori; ma vicinanza all'FSM da far valutare a Luca |
| N2 Osservatore di Kalman | scheda breve, fusa con la forma minima | metro teorico, pochi parametri; parente degli IIR attuali |
| N3 CGP / GP lineare | variante nella scheda GP | solo con vincolo sulla memoria (niente registri riscritti) |
| N4 Evoluzione grammaticale | nota in «famiglie», rimando a R3 | è un meccanismo di codifica, non una forma |
| N5 LCS | nota nella scheda rule list | la variante Pittsburgh coincide con una rule list |
| N6 Reservoir | nota nella famiglia «reti» | memoria non da indicatori qualificati, interpretabilità bassa |

AC-01 è soddisfatto da N1 (e N2) come «forma emersa dallo Step 4».

### Fonti

Verificate raggiungibili e coerenti con titolo, autori e anno, **il 2026-10-11**:
- [F1] K. O. Stanley, R. Miikkulainen, *Evolving Neural Networks through Augmenting Topologies*, Evolutionary Computation, 2002. https://www.cse.unr.edu/~sushil/class/gas/papers/NEAT.pdf (verificato il 2026-10-11, titolo e autori letti nel PDF).
- [F2] J. F. Miller, *Cartesian Genetic Programming*, capitolo in J. F. Miller (a cura di), *Cartesian Genetic Programming*, Springer, 2011. https://gpbib.cs.ucl.ac.uk/gp-html/Miller_2011_CGP_ch2.html (verificato il 2026-10-11, solo titolo/autore/anno).
- [F3] J. F. Miller, *Cartesian Genetic Programming: its status and future*, Genetic Programming and Evolvable Machines, vol. 21, 2020. https://gpbib.pmacs.upenn.edu/gp-html/Miller_GPEM20.html (verificato il 2026-10-11, solo scheda bibliografica; le affermazioni su mutazione e neutralità non sono state lette nel testo).
- [F4] C. Ryan, M. O'Neill, J. J. Collins, *Introduction to 20 Years of Grammatical Evolution*, in *Handbook of Grammatical Evolution*, Springer, 2018. https://gpbib.pmacs.upenn.edu/gp-html/Ryan_2018_hbge_intro.html (verificato il 2026-10-11, scheda bibliografica).
- [F5] Gruppo MINDS (Fraunhofer IAIS), *Echo State Networks and Reservoir Computing*, pagina di riferimento. https://www.ai.rug.nl/minds/esnresearch/ (verificato il 2026-10-11; è una pagina di gruppo di ricerca, non una rassegna con revisione).
- [F6] L. R. Rabiner, *A Tutorial on Hidden Markov Models and Selected Applications in Speech Recognition*, Proceedings of the IEEE, vol. 77, 1989. https://people.engr.tamu.edu/rgutier/web_courses/cpsc689_s07/rabiner1989tutorialHMM.pdf (verificato il 2026-10-11, titolo e autore letti nel PDF; la formula di filtraggio riportata sopra è una trascrizione semplificata da ricontrollare nel testo).
- [F7] R. E. Kalman, *A New Approach to Linear Filtering and Prediction Problems*, Journal of Basic Engineering (Trans. ASME), vol. 82, 1960. https://www.cs.yale.edu/homes/yry/readings/general/Kalman1960.pdf (verificato il 2026-10-11, titolo e autore letti nel PDF).
- [F8] F. Allen, R. Karjalainen, *Using Genetic Algorithms to Find Technical Trading Rules*, Journal of Financial Economics, vol. 51, 1999. https://www.cs.montana.edu/courses/spring2007/536/materials/Lopez/GAsInFinance.html (verificato il 2026-10-11; l'esito riportato dalla pagina è che dopo i costi di transazione le regole non danno un rendimento in eccesso costante rispetto al buy&hold fuori campione; nessuna cifra riportata qui).
- [F9] D. H. Bailey, J. M. Borwein, M. López de Prado, Q. J. Zhu, *The Probability of Backtest Overfitting*, Journal of Computational Finance, 2015. https://carmamaths.org/jon/backtest2.pdf (verificato il 2026-10-11, titolo e autori letti nel PDF; la tesi sull'inaffidabilità dell'hold-out proviene dal riassunto in una ricerca web, non dalla lettura del testo).
- [F10] R. Poli, W. B. Langdon, N. F. McPhee, *A Field Guide to Genetic Programming*, 2008. https://faculty.washington.edu/seattle/GA-2008/FieldGuideGP.pdf (verificato il 2026-10-11, titolo e autori letti nel PDF; il capitolo sul GP lineare non è stato localizzato).

Identificate ma **non verificate** (marcate `[ipotesi, fonte da verificare]`):
- [F11] R. J. Urbanowicz, J. H. Moore, *Learning Classifier Systems: A Complete Introduction, Review, and Roadmap*, Journal of Artificial Evolution and Applications, 2009 (DOI 10.1155/2009/736398). La pagina dell'editore ha risposto 403; autori, titolo e anno risultano dalla ricerca web.
- [F12] L. Breiman, J. H. Friedman, R. A. Olshen, C. J. Stone, *Classification and Regression Trees*, 1984. Titolo e autori risultano dalla ricerca web; nessuna pagina letta.

Conteggio: 10 fonti verificate (accessibilità e dati bibliografici; per 3 di esse solo la scheda bibliografica), 2 identificate non verificate, e le affermazioni con marcatura `[ipotesi]` nel testo (applicazioni al trading di HMM, Kalman e reservoir; equivalenza Kalman-livellamento esponenziale; test su serie nulle; ogni indicatore a finestra come filtro). Nessuna cifra di rendimento riportata. Fonti commerciali non usate. Le affermazioni sul codice rimandano ai file indicati in apertura.

### Diversità cognitiva
Rispetto allo Step 3, che discute *come impaginare* la rassegna per forma, questo step aggiunge: (a) una *cornice* di confronto diversa, memoria = banco di filtri e forma = lettura (Alt. 2), con un legame esplicito al codice (`genome.js`) e a Kalman 1960; (b) un metodo diverso, l'esperimento nullo per misurare la capacità di sovradattare *per forma* (Alt. 3, fuori perimetro); (c) un criterio eliminatorio al posto della sola scala ordinale (Alt. 1); (d) sei forme non presenti nello Step 3, con due candidate a diventare schede; (e) la tensione, non rilevata prima, tra il requisito «non una macchina a stati» e un HMM, e tra «memoria da indicatori qualificati» e i registri del GP o il reservoir.

**Prossimo step:** Step 5 — CRITIC
