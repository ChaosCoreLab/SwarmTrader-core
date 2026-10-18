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

## Step 5 — CRITIC: Analyze Weaknesses

**Agent:** claude-sonnet-5-5 (subagent)
**Letti:** Step 1–4 di questo file; `software-house-ai/agents/03-critic.md` e `protocols/operational-cycle.md` (Step 5); `src/engine/genome.js`, `src/engine/strategy.js`, `src/engine/fsmStrategy.js`, `src/vendor/consilium/algorithm.js` (righe 28–61, 340–384; letto solo per verificare le formule), `docs/architecture/simulator-overview.md` (Strategy contract), `memory/knowledge/consilium-trader-order-timing.md`, il rapporto Consilium `archive/reports/2026-09-12_train-test-holdout-experiments.md`, `src/data/eni-ohlcv.json` (solo conteggio delle barre). Fonti: i PDF di F1, F6, F7, F9 sono stati scaricati e letti come testo (`pdftotext`); F5 e F8 sono pagine web lette con WebFetch; F11 con una ricerca web.
**Assunzioni**
- «Gravità» secondo `agents/03-critic.md`: *Critica* = fallimento nell'uso normale senza mitigazione; *Alta* = rischio rilevante con mitigazione che costa lavoro. **Nessun rilievo è Critico:** ognuno ha una mitigazione.
- Il ciclo non ha UI; lo Step 6 è omesso per track, quindi i rischi di sfruttamento da parte della selezione ricadono qui (e nella scheda di ciascuna forma, come previsto dallo Step 3).
- Le critiche sulle forme (N1–N6) riguardano la rassegna, non la loro bontà come strategie di trading.

### Fatti verificati sul codice che le critiche usano

- **F-code-1.** Il filtro IIR del codice è `ema = ema * (1 - c) + x * c` (`src/vendor/consilium/algorithm.js`, righe 369–372), con `c` = coefficiente del genoma in (0,1) (`genome.js`, `createConsiliumGenome`: «greater than 0 and less than 1»). Quindi **`c` pesa l'osservazione nuova, non il passato**. Con i valori del genoma fisso (`FIXED_GENOME`): `iir_price_2 = 0.990` (il filtro segue quasi il prezzo, memoria di circa una barra), `iir_price_1 = 0.731`, `iir_volume_2 = 0.396`, `iir_volume_1 = 0.118` (costante di tempo di circa 1/c ≈ 8 barre). Lo stato iniziale dei filtri è il primo valore (`init`, righe 345–348), non zero.
- **F-code-2.** I margini non sono relativi al prezzo: `marginAbs = ema * marginPercent` (righe 381–384), cioè proporzionali al filtro; `genome.js` divide i percentuali per 100 (`toFraction`). Una delle due soglie sul prezzo del genoma fisso è negativa (`margin_percent_2 = -1.10`).
- **F-code-3.** Contratto: `labels` è una lista non vuota di stringhe (`assertStrategy`, `strategy.js` righe 17–19); `decide()` ammette `buy|sell|hold` (`ACTIONS`); l'ordine per barra è indicatori → `trader.update` → decisione (`StrategyIndividual.feed`); `describe()` deve restituire `{ label, indicators }` con numeri finiti (documentato in `simulator-overview.md`, validato da `FitnessValidator`). Non esiste un'«etichetta continua»: ogni forma con uscita continua deve discretizzare.
- **F-code-4.** L'istantanea ENI ha **2517 barre giornaliere** su un solo titolo (2016-09-29 → 2026-09-28; `src/data/eni-ohlcv.json`). I parametri e il rischio di sovradattamento di ogni forma vanno letti su questa scala (vedi F9 in verifica fonti).
- **F-code-5.** Il rapporto Consilium indica come causa comune *non legata alla forma* i parametri di rischio degenerati (`stop_loss_percent` 15–45% quasi mai raggiunto, `take_profit_percent` 3–6% quasi sempre raggiunto) e la fitness CAGR grezza. Questi parametri sono del `Trader` e restano uguali per qualsiasi forma (`StrategyIndividual` riceve `buyPercent`, `stopLossPercent`, `takeProfitPercent`).

### Critica dell'Approccio A — Per forma, schema uniforme, con griglia (Step 3, raccomandato)

| # | Rilievo | Gravità | Mitigazione |
|---|---|---|---|
| A1 | **Volume del documento (AC-06).** Con le forme che lo Step 4 porta come schede (FSM, lineare, GP, rule list, MLP, NEAT, fuzzy, N1, N2/minima: nove) × (definizione + formula + sette dimensioni + sotto-tabella del contratto da circa nove righe + rischi + fonti) si superano 140 voci, ciascuna con fonte o «ipotesi». Lo Step 3 lo segnala ma non fissa un limite; per un lettore non finanziario è il rischio principale di non essere letto. | Alta | Limite fisso per scheda (es. definizione 5 righe, una riga per dimensione, mezza pagina in tutto); la sotto-tabella del contratto diventa **una sola tabella forme × membri del contratto** invece di nove tabelle uguali; formule solo dove servono a distinguere la forma; glossario in coda. Il Builder misura il risultato (numero di righe/parole) e lo riporta. |
| A2 | **Scala ordinale soggettiva (già segnalata).** Aggiungo che «giudizio ordinale + fonte o ipotesi» è incoerente: nessuna fonte sostiene «medio» per l'interpretabilità; il giudizio è sempre dell'autore, quindi quasi ogni cella sarebbe `[ipotesi]`, e AC-04 diventerebbe formale. | Alta | Prima di compilare, definire per ciascuna dimensione una **grandezza osservabile** con soglie: espressività = classe di funzioni rappresentabili (affine / a tratti / universale); spazio di ricerca = numero tipico di parametri e loro tipo (continui, discreti, struttura variabile), con l'ordine di grandezza dichiarato come esempio; costo di valutazione = operazioni per barra in ordine di grandezza; interpretabilità = «si legge senza calcolo / con un calcolo / solo simulando»; crossover = «operatore naturale / richiede riparazione / non sensato». Dichiarare che la sintesi ordinale è un giudizio dell'autore, e che i fatti sono nelle grandezze. |
| A3 | **AC-04 non coperto per le forme obbligatorie.** Lo Step 4 non porta *nessuna* fonte per: punteggio lineare, rule list, MLP, fuzzy; per il GP c'è solo F10 (non letta), per il trading solo F8 (una pagina di appunti, non l'articolo). Nessuna fonte sul fuzzy o sulle reti nel trading. Le cinque schede richieste da AC-01 oggi poggerebbero su «ipotesi». | Alta | Lo Step 7 raccoglie *prima di scrivere* almeno una fonte di riferimento per ciascuna delle cinque forme (un testo di riferimento per fuzzy, per MLP, per liste di decisione/regole, per il punteggio lineare/regressione; per il trading, rassegne con revisione), e registra per ciascuna «letta / solo scheda / non letta». Dove non si trova, la voce resta `[ipotesi]` e la sintesi la elenca tra «ciò che non si è potuto accertare» (AC-05). Non si riempiono i vuoti con fonti ricordate a memoria. |
| A4 | **«Schema comune» con ottava voce non prevista da AC-02 («rischi di sfruttamento»).** È utile (lo Step 6 è omesso) ma non ha una checklist: rischia di diventare testo libero diseguale. Inoltre i rischi principali osservati in Consilium (F-code-5) non dipendono dalla forma: se la scheda li attribuisce alla forma, il confronto è falsato. | Media | Checklist fissa di tre voci per scheda: *anticipazione dei dati* (la forma può usare dati oltre la barra corrente? di norma no, per l'ordine di `feed`), *soluzioni degeneri* (es. soglie che non scattano mai), *sfruttamento della fitness*. In apertura del documento una frase: i parametri di rischio del `Trader` e la fitness (R5) sono comuni a tutte le forme e **non vengono decisi dalla scelta della forma**. |
| A5 | **La «scheda del contratto» è di carta e la tabella ha solo tre esiti** (diretto / con adattamento / non soddisfatto). `labels` fissa e `describe()` finito sono sempre «con adattamento» per le forme continue: la colonna non discrimina. | Media | Distinguere nell'esito **che cosa si perde** (informazione persa dalla discretizzazione, costo di esporre i numeri) e rimandare a E2 con una frase, senza dare un giudizio; dichiarare che il contratto è provato con una sola strategia di test (confidence Medium nella decisione `2026-10-11-strategy-contract`). |
| A6 | **La riga FSM descrive i margini come «percentuali»** (Step 3, componente 3); nel codice sono frazioni *del filtro* (F-code-2), e un coefficiente IIR è peso del nuovo dato (F-code-1). Una riga di riferimento sbagliata falsa tutto il confronto. | Media | Riscrivere la riga FSM dal codice (righe citate in F-code-1/2), con una frase sulla costante di tempo; citare i file e le righe. |
| A7 | **Il lettore non finanziario** vede «buy&hold», «stop loss», «CAGR» ecc. già nella riga FSM, prima del glossario. Rischio di AC-06 (simboli e termini alla prima comparsa). | Bassa | Spiegazione in una riga alla prima occorrenza, glossario in coda con rimando; verificato dal Builder con una rilettura mirata ai termini finanziari. |

### Critica dell'Approccio B — Per capacità richiesta

| # | Rilievo | Gravità | Mitigazione |
|---|---|---|---|
| B1 | Lo Step 3 dice che «B si ottiene gratis» come lettura della griglia. È vero solo se le celle della colonna «origine della memoria» (e delle altre) hanno un **vocabolario controllato**; con testo libero il confronto per criterio non si fa a colpo d'occhio. | Media | Vocabolario chiuso per la colonna memoria: *nei filtri a monte (forma feedforward)* / *nello stato discreto del genoma* / *stato continuo ricorrente nella forma* / *ritardi in ingresso*; lo stesso per le altre colonne (vedi A2). |
| B2 | B resta scartato correttamente (frammenta fonti e schede, AC-01/AC-04). | Bassa | Nessuna: scarto confermato. |

### Critica dell'Approccio C — Per catena codifica → decisione → valutazione

| # | Rilievo | Gravità | Mitigazione |
|---|---|---|---|
| C1 | Lo scarto è giusto (invade R3, R4, R5, R6). Residuo: lo Step 3 chiede comunque «una frase su cosa va codificato (genotipo di massima)» per ciascuna forma, già un passo dentro R3. | Bassa | Tenere la frase a una riga, nello schema dei campi, senza operatori; per N3, N4 e N5 il rimando a R3 si limita a nominare il meccanismo. |

### Critica dell'Alternativa 1 — Imbuto (Step 4)

| # | Rilievo | Gravità | Mitigazione |
|---|---|---|---|
| 1a | **Il cancello a sì/no ha un solo criterio che discrimina davvero.** `labels` finita, numeri finiti in `describe()` e `serialize()` JSON sono sempre ottenibili con un adattamento (lo ammette lo Step 3: etichette da fasce dell'output). L'unico criterio eliminatorio reale sarebbe «memoria da indicatori e non da stato codificato nel genoma», che è esattamente quello ambiguo (1c e 1d). | Alta | Non usare il cancello come eliminazione: usarlo come **colonna «vincoli duri»** nella griglia (diretto / con adattamento / non soddisfatto) e lasciare l'eliminazione alla sintesi, motivata e visibile a Luca. |
| 1b | **Conflitto con AC-01/AC-02.** Una scheda breve di tre righe per le forme escluse non ha le sette dimensioni; AC-01 chiede «una scheda» per ciascuna delle cinque forme previste. Lo Step 4 lo dichiara ma non propone chi decide. | Alta | Le cinque forme di AC-01 e N1 hanno sempre la scheda piena, in formato compatto; la scheda breve (tre righe) vale solo per le forme *facoltative* dello Step 4 (N3–N6). Se si vuole una scheda breve anche per le obbligatorie, serve una modifica esplicita di AC-01 da parte del Product Owner prima dello Step 7, non una deviazione silenziosa. |
| 1c | **Il cancello è incoerente con la tabella «quali forme portare».** Con «memoria non da stato discreto nel genoma» l'HMM (N1, scheda piena, e il suo K regimi con matrice di transizione) sarebbe escluso; il reservoir e NEAT con connessioni ricorrenti (vedi 1d) pure. Lo Step 4 invece porta N1. Sono due proposte dello stesso step che non si possono applicare insieme. | Alta | Decidere con Luca la lettura del requisito (domanda Q1 nella raccomandazione); fino ad allora il cancello non elimina. |
| 1d | **Il requisito di memoria è applicato in modo non uniforme.** Lo Step 4 lo usa contro i registri del GP e il reservoir, ma non contro NEAT: F1 dichiara che «la memoria si rappresenta facilmente con connessioni ricorrenti» e NEAT evolve la topologia, ricorrenze incluse (letto nel PDF di F1). Neppure il fuzzy con retroazione o l'HMM sono trattati con lo stesso metro. | Alta | Per ogni forma, una riga fissa «ammette stato ricorrente nel genoma? sì/no/opzionale» (vocabolario di B1). Per le reti: MLP e NEAT *senza ricorrenze* sono le varianti coerenti col requisito (scelta di progetto, da dichiarare come tale, ipotesi); le varianti ricorrenti si registrano come tali, senza scartarle in anticipo. |
| 1e | Il vantaggio dichiarato (accorciare il documento) è reale ma vale poco rispetto al costo in AC-01. | Bassa | Si ottiene lo stesso con il formato compatto di A1. |

### Critica dell'Alternativa 2 — Banco di filtri più lettura

| # | Rilievo | Gravità | Mitigazione |
|---|---|---|---|
| 2a | **Formula con i ruoli invertiti rispetto al codice.** Lo Step 4 scrive `y[t] = a·y[t-1] + (1-a)·x[t]` con «a in (0,1)» = coefficiente del genoma. Nel codice è `ema = ema·(1−c) + x·c` (F-code-1): `c` pesa il **nuovo** dato. Con `c = 0.99` (`iir_price_2`) il filtro quasi non ha memoria; con la formula dello Step 4 sarebbe quasi tutto memoria. Un lettore che applica la formula ai coefficienti del genoma capisce l'opposto. È anche la formula che il documento userebbe per «da dove viene la memoria». | Alta | Scrivere `y[t] = y[t-1] + c·(x[t] − y[t-1])`, con `c` peso dell'osservazione nuova e costante di tempo circa 1/c barre, citando `src/vendor/consilium/algorithm.js` (righe 369–372) e `genome.js`; aggiungere un piccolo calcolo di esempio dichiarato come tale (AC-04) con i quattro coefficienti reali. |
| 2b | **«Ogni indicatore a finestra è un filtro lineare» è falso in generale** (lo Step 4 lo segnala come ipotesi ma lo usa come premessa). Medie semplici ed esponenziali, differenze tra medie sono lineari; massimo/minimo su N barre (canale di Donchian), oscillatore stocastico, RSI (rapporto tra medie di guadagni e perdite), intervallo medio vero (ATR) non lo sono. F8 stessa usa massimi e minimi (verificato sulla pagina). | Alta | Riformulare la cornice senza la parola «lineare»: «la memoria è una funzione *causale* della storia — di una finestra finita o ricorsiva — e il numero di barre o la costante di tempo ne dice la durata»; i filtri lineari sono il caso esemplare (e il solo caso dei quattro IIR del genoma). Dire che l'elenco degli indicatori è di R2. |
| 2c | **«La memoria sta tutta nel banco» è falsa per N1 e N2** (HMM e Kalman hanno una ricorsione propria, con le proprie matrici `T`, `Q`, `R`) e per NEAT ricorrente. Le «letture alimentate dallo stesso banco» sono vere solo per le forme feedforward. | Alta | Usare la cornice come *classificazione*: memoria «a monte» (feedforward) vs memoria «nel lettore» (HMM, Kalman, reti ricorrenti). È la colonna «origine della memoria» di B1. |
| 2d | **Sovraffermazione sull'attribuzione:** «la differenza tra forme diventa attribuibile alla sola lettura». Anche a memoria uguale, forme diverse hanno genotipi di dimensione diversa, quindi capacità di sovradattamento diversa, e la fitness e i parametri del `Trader` restano non separati (F-code-5). Separare forma e fitness richiede un esperimento (Alt. 3), non una cornice. | Media | Presentarla come «cornice di confronto», non come isolamento; togliere l'affermazione sulla attribuibilità o affiancarla a «non separa la forma dalla fitness». |
| 2e | **Perimetro R2.** Lo Step 4 la segnala; la critica aggiunge che il rischio concreto è nel testo: ogni volta che si dice «un filtro di prezzo e uno di volume» si sta già scegliendo l'ingresso. | Media | Gli ingressi si nominano solo come «esempio dal genoma attuale» (quattro IIR su prezzo e volume), dichiarando che R2 li sceglie. |
| 2f | Kalman 1960 è usato come fonte di «stato e filtraggio ricorsivo»: sostenuto (vedi verifica fonti). Ma F7 non parla di livellamento esponenziale né di prezzi. | Bassa | Citare F7 solo per lo stato ricorsivo lineare e rimandare il resto a un testo sui modelli strutturali di serie temporali da individuare. |

### Critica dell'Alternativa 3 — Esperimento nullo prima della rassegna

| # | Rilievo | Gravità | Mitigazione |
|---|---|---|---|
| 3a | **Fuori perimetro.** Richiede codice (forme, generatore di serie, GA) e calcoli su dati: lo Step 1 (Scope — OUT) e AC-09 lo escludono. Non può essere eseguita né preparata in questo ciclo. | Alta | Non adottarla. Registrarla nel documento come «domanda per un ciclo futuro» (tre righe) e nel file del ciclo come proposta al Coordinator; nessun codice, nessun calcolo. |
| 3b | **Difetti di metodo se fosse fatta.** Rimescolare i rendimenti elimina autocorrelazione e raggruppamento della volatilità, che alcune forme sfruttano legittimamente; volume e prezzo vanno rimescolati *insieme*; il risultato dipende dalla fitness scelta (R5) e dal budget, quindi misura «forma+fitness», non la forma. Non c'è fonte per il metodo (Step 4: `[ipotesi]`). | Media | Se un ciclo futuro la adotta, deve definire prima più serie nulle (rimescolamento a blocchi, passeggiata aleatoria) e riportare l'esito come relativo alla fitness usata. Nessuna mitigazione migliore esiste in questo ciclo. |
| 3c | **Rischio di condizionare la sintesi:** scrivere che i candidati «restano non confermati fino a un esperimento nullo» è corretto ma, ripetuto per ogni forma, svuota la rassegna. | Bassa | Una sola frase, nella sezione «ciò che non si è potuto accertare». |

### Critica dell'Alternativa 4 — Forma minima e buy&hold come righe di controllo

| # | Rilievo | Gravità | Mitigazione |
|---|---|---|---|
| 4a | **Buy&hold non ha genoma:** nella griglia le sette dimensioni (spazio di ricerca, crossover, ecc.) non hanno senso; una riga con celle «non applicabile» e una vicina all'FSM con numeri induce a confrontare *rendimenti*, che AC-04 vieta senza fonte. | Media | Buy&hold come nota di testo, citando il rapporto Consilium come risultato di quello studio, con le sue condizioni (un titolo, una finestra, la fitness CAGR); nessuna riga nella griglia. |
| 4b | **Sovrapposizione di tre voci:** punteggio lineare, forma minima (1 filtro + 1 soglia) e Kalman (N2) sono lo stesso tipo di forma a diversi livelli di ricchezza; lo Step 4 stesso scrive che la minima è «già in parte» il lineare. | Media | Una sola scheda «punteggio lineare di indicatori con soglie» con tre istanze dichiarate (minima, con filtro di Kalman, generale) e una riga di griglia per la minima, che serve da metro. Riduce il volume (A1). |
| 4c | **Uso scorretto di F8:** lo Step 4 la presenta come «forme molto semplici»; la pagina di F8 descrive la ricerca con un algoritmo genetico tra *combinazioni logiche* di regole semplici su medie mobili e massimi/minimi, quindi non una forma minima. F8 è invece il precedente di *GP/regole combinate* nel trading, ed è la sola fonte sul trading che lo Step 4 ha. | Media | Spostare F8 dalla scheda della forma minima alla scheda GP/rule list; descrivere il suo esito come risultato di quello studio (vedi verifica F8). |

### Critica delle nuove forme N1–N6 e della tabella «quali forme portare»

| # | Rilievo | Gravità | Mitigazione |
|---|---|---|---|
| N1a | **HMM: contraddizione con il requisito dell'operatore.** Lo Step 4 la nota («nella lettera, meno nello spirito») ma poi dà per vera la «memoria da indicatori qualificati». Nell'HMM la memoria è la credenza `b[t]` aggiornata dalla **matrice di transizione `T`** tra K regimi discreti; gli indicatori entrano solo nella verosimiglianza dell'osservazione. È una macchina a stati probabilistica con la stessa struttura (K stati, transizioni, mappa stato→azione). Sostenere che la memoria «nasce dagli indicatori» è improprio. | Alta | Presentare l'HMM come *forma di confine* nella sintesi, con le due letture del requisito scritte accanto (domanda Q1 a Luca) e la dichiarazione che in tal caso le colonne «memoria» e «interpretabilità» valgono per K stati nascosti, non per zero stati. Non sostenere che rispetti il requisito. |
| N1b | **Rischio di anticipazione nella stima:** il filtraggio in avanti è causale, ma l'algoritmo di stima (Baum-Welch, EM; presente in F6) e la decodifica di Viterbi usano l'intera sequenza. Se il GA valuta una forma con parametri stimati sull'intera serie, c'è look-ahead. Lo Step 4 propone «EM per i parametri, GA per la mappa»: la parte EM va tenuta in-sample. | Alta | Nella scheda: i parametri si stimano solo su dati che precedono la valutazione (a cura di R6), o si evolvono con il GA (nessuna stima globale). Il documento non discende nel protocollo: lo rimanda a R6. |
| N1c | **Formula con simboli in conflitto con F6:** `b[t]` per la credenza e `O` per la verosimiglianza; in Rabiner `b_j(O_t)` è la probabilità di emissione e la credenza è `α` normalizzata (vedi verifica F6). Un lettore che apre F6 trova simboli diversi. Notazione di partenza ok per un'idea, non per «formula riportata dalla fonte». | Media | Usare i simboli di Rabiner (`α_t(j)`, `a_ij`, `b_j(O_t)`) oppure dichiarare esplicitamente la corrispondenza; normalizzare con il fattore di scala di F6; citare il paragrafo (induzione e «scaling»). |
| N1d | **Problema delle convenzioni concorrenti nel crossover:** permutare i regimi dà lo stesso modello con genotipo diverso; il crossover tra due HMM equivalenti è distruttivo. È lo stesso problema che F1 descrive per le reti (lì «competing conventions», verificato). Lo Step 4 dice «crossover per blocchi di regime o per media pesata» senza accennarlo. | Media | Nella dimensione crossover dell'HMM e delle reti scrivere che l'operatore ingenuo è sensibile alla permutazione e rimandare a R3; per l'HMM, ordinare i regimi per un criterio (es. media) è un'ipotesi da marcare. |
| N1e | **Dimensione dei campioni:** con 2517 barre (F-code-4) e K regimi × medie/varianze × `T` il numero di parametri è modesto, ma i regimi sono non osservati: non c'è verità con cui giudicarli. L'uso dell'HMM nei mercati è `[ipotesi, fonte da verificare]` e F6 non parla di finanza (verifica fonti). | Media | Una fonte sul tema (rassegne con revisione) prima di dare la scheda per piena; se non si trova, la forma entra come scheda piena ma con «applicazione al trading: nessuna fonte» nelle cose non accertate. |
| N2a | **Kalman livello+pendenza: la fonte F7 non copre né il modello né la convergenza a un filtro esponenziale.** Se la convergenza ha luogo con livello e pendenza, il filtro stazionario è di tipo α–β (livellamento esponenziale doppio), non un semplice esponenziale: lo Step 4 dice «di tipo esponenziale», impreciso. | Media | Citare F7 solo per il filtraggio ricorsivo e cercare un testo per il modello strutturale e per il guadagno stazionario (o ometterlo); scrivere «α–β / livellamento esponenziale doppio» solo con fonte. |
| N2b | **Ipotesi gaussiana e rendimenti a code pesanti:** il filtro è ottimo con rumori gaussiani; le serie giornaliere hanno code pesanti (nota di metodo, senza fonte in questo step). | Bassa | Limite dichiarato nella scheda come ipotesi, senza cifre. |
| N3a | **CGP si evolve di norma per sola mutazione (Step 4, da verificare):** per l'AC-02 «adattamento a crossover e mutazione» e per l'epica «algoritmo genetico» va detto chiaramente. Le fonti F2/F3 non sono state lette. | Media | Scrivere «tipicamente per sola mutazione `[da verificare in F3]`»; se non verificabile, ipotesi; nessun uso del CGP come candidato senza questa precisazione. |
| N3b | Il GP «feedforward con memoria a monte» è un vincolo di progetto, non una proprietà della forma; presentato come proprietà, falsa il confronto con le reti ricorrenti (1d). | Media | Descrivere il vincolo come scelta di progetto («variante coerente con il requisito»). |
| N4a | GE come «meccanismo di codifica»: giusto. Rischio: «la stessa macchina può produrre un FSM» ricrea quello che si vuole evitare. | Bassa | Dire che la grammatica decide le forme raggiungibili, e che il requisito si rispetta escludendole dalla grammatica; rimando a R3. |
| N5a | **«La variante Pittsburgh coincide con una rule list» è troppo forte:** una rule list è ordinata (si applica la prima che scatta); un insieme di regole Pittsburgh ha di norma risoluzione dei conflitti e lunghezza variabile. F11 non è stata letta (non verificabile). | Media | Scrivere «simile, non identica» e `[ipotesi, fonte da verificare]`, o leggere F11 prima dello Step 7. |
| N6a | **Attribuzione errata di F5:** lo Step 4 scrive «Gruppo MINDS (Fraunhofer IAIS)»; la pagina è ospitata su `ai.rug.nl` (gruppo MINDS), l'ente Fraunhofer non risulta dalla pagina; il «raggio spettrale» non vi compare. | Bassa | Citare «gruppo MINDS, pagina `ai.rug.nl/minds/esnresearch`»; per «raggio spettrale» cercare il testo primario (non lo cito per non inventare). |
| N6b | Il reservoir è scartato come scheda, ma lo Step 4 giustifica con «centinaia di numeri» e «interpretabilità molto bassa» senza fonte; sono giudizi plausibili. | Bassa | Marcarli come ipotesi. |
| T1 | **Conteggio e coerenza della tabella:** AC-01 chiede cinque forme più una dallo Step 4; la tabella porta N1 piena, N2 breve, N3 e N5 come note nelle schede, N4 e N6 come note in «famiglie». Con FSM sono 9 schede con la «forma minima»: pesante (A1). Inoltre MLP e NEAT sono due schede o una (AC-01 «rete neurale piccola (MLP e NEAT)»)? | Alta | Una scheda per rete con MLP e NEAT come due varianti (due sottoparagrafi, una tabella), e fusione lineare + minima + Kalman (4b): FSM, lineare, GP, rule list, reti, fuzzy, HMM = **sette schede**, più le note. Il Product Owner conferma che «una scheda» per «MLP e NEAT» è una. |
| T2 | **La tabella non decide su Alt. 2 e Alt. 4**, che lo Step 4 dice adottabili con A. Lo Step 7 non ha istruzioni. | Media | Decisione nella raccomandazione qui sotto. |

### Casi limite, incoerenze e debito di conoscenza

1. **AC-01 contro imbuto.** Vedi 1b: serve decisione del Product Owner o formato compatto.
2. **AC-04 contro fonti secondarie e non lette.** Tra le fonti dello Step 4, F2, F3, F4, F10, F11, F12 non risultano lette (il Coordinator le ha marcate «solo scheda bibliografica» o «non verificate»); F8 è una pagina di appunti di un corso, non l'articolo. Il documento deve riportare per ogni fonte lo stato (letta / solo scheda / non letta). **Debito di conoscenza:** F3 è marcata «passaggio da verificare», F10 «capitolo non localizzato», F12 (CART) è pertinente a *alberi addestrati con algoritmo greedy*, non a «foreste» come scritto nello Step 4 (le foreste sono un lavoro successivo di un altro articolo): correggere la frase. *Mitigazione:* elenco delle fonti con stato in coda al documento.
3. **Contratto contro forme continue.** `labels` fissa e `describe()` finito (F-code-3) obbligano la discretizzazione; il «replay» perde l'informazione dell'uscita continua. *Mitigazione:* ogni scheda dice quali fasce e dichiara «richiesta di estensione del contratto» da E2 (già prevista dallo Step 3); la frase è unica, non per forma.
4. **Tensione requisito/forme.** Vedi N1a, 1d. Il documento non può dire che HMM, NEAT ricorrente, GP con registri e reservoir rispettano o violano il requisito: lo dichiara per variante e lo lascia a Luca.
5. **Rischio «rassegna che promette redditività».** Le fonti sul trading (F8; rapporto Consilium) riportano esiti *negativi o sotto buy&hold*; il rischio è opposto a quello temuto in parte (nessun incentivo a promettere), ma resta quello di presentare le conclusioni di Consilium come generali. Il rapporto riguarda un titolo, finestre di training da 2 a 5 anni, la fitness CAGR; **le conclusioni di Consilium non si trasferiscono alle forme alternative** (la fitness non è stata cambiata). *Mitigazione:* citarle come «risultato di Consilium con le sue condizioni», una volta; nessuna cifra se non dal rapporto, riportata con titolo e contesto; nessuna frase del tipo «la forma X batterebbe il buy&hold». Il Builder cerca nel testo finito i verbi «guadagnare, battere, rendere» e li controlla.
6. **Dipendenza da R2.** Lo Step 3 vieta di rimettere in discussione l'elenco degli indicatori; il testo non può né evitarlo (ogni forma ha ingressi) né sceglierlo. *Mitigazione:* un'unica definizione di «ingressi di esempio» (i quattro IIR attuali più, come esempio nominato, una media e una differenza) e la frase che R2 li sostituisce.
7. **Scala e confronto con l'FSM.** La riga FSM va compilata con lo stesso vocabolario (A2, B1) e con i fatti corretti di F-code-1/2. *Nota di fatto:* nel genoma fisso il secondo filtro del prezzo ha `c = 0.99`, quindi quasi non ha memoria; la memoria del genoma attuale sta soprattutto nello stato (nove stati) e nel filtro volume lento. Il documento può dirlo (con le righe del codice): giustifica il requisito dell'operatore.
8. **Consistenza di `hold`.** Il contratto ha `hold` esplicito; l'FSM lo ha implicito (uno stato senza azione). Una forma a punteggio (lineare, fuzzy, MLP) produce tre fasce: il significato di `hold` è «non cambiare posizione» (Trader). *Mitigazione:* frase unica nella scheda del contratto.
9. **Anticipazione dei dati.** Ordine per barra: indicatori → `trader.update` (esegue l'ordine impostato la barra prima, all'apertura) → decisione per la barra successiva (F-code-3 e `consilium-trader-order-timing`). Una forma che usa `high`/`low` della barra corrente decide *dopo* la barra: nessun look-ahead; i look-ahead nascono solo dalla stima dei parametri (N1b) e dalla fitness. *Mitigazione:* una frase unica nel metodo.
10. **Campione piccolo.** 2517 barre su un titolo (F-code-4): forme con molti parametri (MLP, fuzzy, GP, HMM con K alto) rischiano il sovradattamento; F9 indica che l'hold-out non basta quando si prova più di una configurazione (verificato). *Mitigazione:* colonna «numero di parametri di esempio» per forma; nessuna conclusione sul sovradattamento senza fonte; rimando a R5/R6.
11. **AC-08 e AC-09.** Il menu (`_data/docs.yml`) non è un file di stato condiviso: lo Step 3 lo lascia allo Step 12 insieme a `docs/MAP.md`, ma AC-08 chiede che «compaia nel menu». Se il menu si modifica solo allo Step 12 e il documento esiste da Step 7, il commit intermedio ha un documento non raggiungibile dal sito. *Mitigazione:* il Builder aggiunge la voce in `_data/docs.yml` nello Step 7 (non è un file di stato condiviso né di `src/`), lasciando a Step 12 solo `docs/MAP.md`; lo conferma il Coordinator. Le formule senza costrutti Liquid vanno controllate con una ricerca delle doppie graffe e di `{%` prima della consegna; la build di Pages resta `PENDING_HUMAN`.
12. **Ciclo parallelo.** Nessuna interferenza con 007 e 009 per il solo documento; la condizione sui file di stato resta com'è.

### Verifica a campione delle fonti

Esito: **6 fonti controllate sul testo o sulla pagina (F1, F5, F6, F7, F8, F9)**; di quelle 4 hanno la tesi principale sostenuta senza riserve (F1, F5 per la definizione, F6, F9), 1 è sostenuta con riserve (F8), 1 parzialmente (F7); **6 fonti non verificabili da me** (F2, F3, F4, F10, F12 non letta; F11 solo esistenza). Cinque affermazioni specifiche degli Step 3–4 **non sono sostenute** dalla fonte indicata (elencate sotto).

| Fonte | Affermazione attribuita | Esito | Cosa correggere |
|---|---|---|---|
| **F6** Rabiner 1989 (PDF letto) | Formula di filtraggio `b[t] = normalizza(O(x[t]) · (Tᵀ · b[t−1]))` | **Sostenuta nella sostanza.** Il testo dà la variabile in avanti `α_t(j)`: inizializzazione `α_1(i) = π_i b_i(O_1)`, induzione `α_{t+1}(j) = [Σ_i α_t(i) a_ij] b_j(O_{t+1})`, e una sezione «Scaling» che normalizza ogni `α_t` per la somma su tutti gli stati. Non usa il termine «credenza». | Usare i simboli di Rabiner o la corrispondenza dichiarata; citare induzione e scaling; la «trascrizione semplificata da ricontrollare» dello Step 4 si può dare per ricontrollata. |
| F6 | L'algoritmo EM per stimare i parametri è «descritto in F6» | **Sostenuta:** il testo descrive la rivalutazione dei parametri con la procedura di Baum-Welch (iterativa). | Nessuna. Notare che usa tutta la sequenza (N1b). |
| F6 | Uso dell'HMM nei mercati finanziari | **Non sostenuta da F6:** il testo è sul riconoscimento del parlato; una ricerca per «financ», «stock», «market» non dà riscontri pertinenti. Lo Step 4 la marca già `[ipotesi]`. | Cercare una fonte sul trading o lasciare «nessuna fonte». |
| **F7** Kalman 1960 (PDF letto) | «Stato e filtraggio ricorsivo» | **Sostenuta:** il testo tratta stima ricorsiva a tempo discreto (filtri a memoria crescente e infinita, equazione alle differenze per la covarianza dell'errore). | Nessuna. |
| F7 | Equivalenza con il livellamento esponenziale e modello livello+pendenza | **Non sostenuta da F7:** nessun riscontro per «exponential», «smoothing» (solo in senso Wiener, nelle citazioni), «slope», prezzi o finanza; «steady state» appare per processi stazionari, non per un guadagno costante. Lo Step 4 la marca `[ipotesi]`. | Cercare un testo sui modelli strutturali di serie temporali / filtro α–β; nel frattempo scriverla come ipotesi. |
| **F8** Allen–Karjalainen (pagina di appunti, non l'articolo) | Dopo i costi di transazione le regole non danno un rendimento in eccesso fuori campione rispetto al buy&hold | **Sostenuta dalla pagina** (che riporta che non è possibile guadagnare dopo i costi con regole tecniche; nessuna cifra qui) — ma la pagina è un riassunto di corso: AC-04 vuole la fonte primaria. | Citare l'articolo come fonte; segnalare «letto solo il riassunto»; dati bibliografici (rivista, volume, anno) non verificati da me. |
| F8 | Regole basate su medie mobili e massimi/minimi; «forme molto semplici come famiglia di partenza» (Alt. 4) | **Sostenuta in parte:** la pagina conferma l'uso di medie mobili e massimi/minimi (quindi non lineari, conferma 2b), ma descrive *combinazioni logiche* trovate dall'algoritmo genetico, non una forma minima. | Correggere la frase di Alt. 4 e collocare F8 nella scheda GP/rule list (4c). |
| **F9** Bailey et al. (PDF letto) | I test su dati tenuti fuori sono inaffidabili quando si seleziona tra molte configurazioni | **Sostenuta dal testo**, sezione di confronto: l'hold-out non tiene conto del numero di prove tentate, ha alta varianza (cita Van Belle e Kerr), è inadeguato per campioni piccoli; «finché si prova più di una configurazione l'overfitting è sempre presente». Lo Step 4 aveva solo il riassunto di una ricerca web: ora è letta. | Dire «secondo Bailey et al.»; il PDF letto è la versione di novembre 2014: la rivista e l'anno indicati («J. Computational Finance, 2015») non sono confermati dal PDF, verificarli o citare come working paper. Non trarre che i risultati di holdout di Consilium siano invalidi: la fonte dice che da soli non bastano. |
| **F1** NEAT (PDF letto) | NEAT fa evolvere topologia e pesi, con marcatori storici e speciazione; riferimento per le reti | **Sostenuta** (titolo, tre idee: topologie diverse, speciazione, crescita incrementale; «historical markings»; problema delle convenzioni concorrenti). Il testo dichiara anche che la memoria si rappresenta con connessioni ricorrenti. | Aggiungere nella scheda NEAT: ricorrenze ammesse (1d); la sezione sulle convenzioni concorrenti è la fonte per N1d (per le reti). |
| **F5** MINDS | Rete ricorrente casuale e fissa + lettura lineare addestrata | **Sostenuta** per la definizione; **non sostenuti**: l'ente «Fraunhofer IAIS» (la pagina è su `ai.rug.nl`) e il «raggio spettrale» (non compare). | Correggere l'attribuzione; fonte primaria per l'iperparametro. |
| F11 | Urbanowicz–Moore 2009, Michigan vs Pittsburgh | **Non verificabile:** una ricerca web ha confermato l'esistenza dell'articolo (titolo e rivista) tramite una pagina di aggregazione; autori e contenuto non letti. | Marcare «non letta»; se si cita la distinzione Michigan/Pittsburgh, una fonte letta. |
| F2, F3, F4, F10, F12 | Varie (CGP, GE, GP lineare, CART) | **Non verificabili:** non lette in questo step (solo schede bibliografiche). F12 è CART (alberi), non «foreste». | Leggere prima di citare per un'affermazione specifica; correggere «foreste costruite con CART». |

### Classifica degli approcci per rischio (dal più alto al più basso)

1. **Alternativa 3 (esperimento nullo)** — fuori perimetro (codice e calcoli su dati) e di metodo discutibile; non realizzabile in questo ciclo.
2. **Alternativa 2 (banco di filtri) *come scritta*** — formula inversa rispetto al codice, premessa «lineare» falsa, forte rischio di toccare R2; recuperabile come cornice corretta.
3. **Alternativa 1 (imbuto) come eliminazione** — contraddice AC-01 e la presenza di N1 nella tabella; recuperabile come ordine e come colonna.
4. **Approccio A *come raccomandato*** — è la base giusta ma ha tre rischi alti (volume, scala, fonti mancanti).
5. **Alternativa 4 (righe di controllo)** — rischi medi di sovrapposizione e di confronto di rendimenti; a basso costo.
6. **Approccio B** — rischio basso; si ottiene dalla griglia con vocabolario controllato.
7. **Approccio C** — rischio basso solo perché già scartato.

Per le **forme** (non approcci), dal più alto al più basso: N1 HMM (requisito e look-ahead nella stima), NEAT ricorrente / reservoir (requisito di memoria), N5 LCS (identificazione con rule list, fonte non letta), N3 CGP (fonte non letta), N2 Kalman (fonte non copre), N4 GE, forma minima.

### Verdetto

**Approcci inaccettabili:**
- **Alternativa 3 in questo ciclo:** richiede codice e calcoli su dati, esclusi da Step 1 e AC-09. Accettabile solo come domanda per un ciclo futuro.
- **Alternativa 2 con la formula e la premessa «ogni indicatore a finestra è un filtro lineare» come scritte:** la formula è contraddetta dal codice (F-code-1) e la premessa è falsa per RSI, massimi/minimi, stocastico. Accettabile con le correzioni 2a–2c.
- **Alternativa 1 come eliminazione tramite cancello a sì/no:** incompatibile con AC-01 e con la presenza di N1; accettabile come ordine di lettura e come colonna della griglia.
- **Approccio C:** già scartato dallo Step 3, la critica conferma.

**Accettabili con mitigazioni:** Approccio A (A1–A6), B come lettura della griglia (B1), Alternativa 4 (4a–4c), le forme della tabella con le correzioni N1a–N6b e T1/T2.

### Raccomandazione operativa per lo Step 7 (BUILDER)

**Struttura finale del documento**, `docs/architecture/genome-forms-review.md` (italiano; intestazione come gli altri documenti, vedi `simulator-overview.md`), in questo ordine:

1. **Premessa e metodo** (breve): cosa si confronta (forme, non rendimenti), fonti ammesse, stato di ogni fonte (letta / solo scheda / non letta), notazione. **Tenere** dallo Step 3 (componenti 1–2).
2. **La cornice «memoria e lettura»** *(Alt. 2 corretta, come classificazione):* formula dei filtri IIR scritta come nel codice (`y[t] = y[t−1] + c·(x[t] − y[t−1])`, `c` peso del nuovo dato) con il piccolo esempio dichiarato; «memoria a monte» vs «memoria nel lettore». **Cambiare:** togliere «lineare» e l'attribuzione.
3. **Riga di riferimento FSM** dal codice (F-code-1/2), con la nota sul filtro `c = 0.99`. **Cambiare** rispetto allo Step 3 (A6).
4. **Cinque-sette schede** con lo stesso schema compatto (definizione, formula, sette dimensioni con grandezze osservabili, rischi con la checklist, fonti con stato): FSM (riferimento), punteggio lineare (istanze: minima, Kalman, generale), alberi/GP (con CGP e F8), rule list (con LCS Pittsburgh «simile»), reti (MLP e NEAT, ricorrenza dichiarata), fuzzy, HMM (forma di confine). **Cambiare:** da nove a sette schede; MLP e NEAT in una sola (T1, da confermare dal Product Owner).
5. **Tabella unica del contratto** (forme × membri) con «cosa si perde» (A5) e frase unica su `hold` e `labels`. **Cambiare:** una tabella, non una per scheda.
6. **Griglia di confronto** con vocabolario controllato (A2, B1), colonne «vincoli duri» (da Alt. 1) e «origine della memoria» in evidenza, **senza** riga buy&hold e **senza** punteggio totale. **Tenere** la regola «nessun punteggio».
7. **Famiglie** (reti; programmi; meccanismo di codifica GE con rimando a R3). **Tenere**.
8. **Sintesi per Luca**: 1–2 candidati con motivazione e condizioni di scarto; **ciò che non si è potuto accertare** (fonti non lette, applicazione al trading senza fonte, esperimento nullo come ciclo futuro: Alt. 3 in tre righe); domande a Luca; spazio per la scelta (registrata nel file del ciclo, AC-07). **Aggiungere** la frase su parametri di rischio e fitness comuni a tutte le forme (A4).
9. **Riferimenti** con stato e **glossario** (termini di finanza alla prima occorrenza, A7).

**Da rimandare a un ciclo futuro:** esperimento nullo (Alt. 3); scelta di indicatori, codifica, equazioni, fitness e protocollo (R2–R6); riga buy&hold nella griglia; letture primarie delle fonti non lette se non entrano nei tempi (marcate come tali).
**Aggiungere prima di scrivere:** fonti per le cinque forme obbligatorie (A3); lettura di F11/F3 per le affermazioni su LCS e CGP o marcatura; conferma del Product Owner su AC-01 (una scheda per MLP+NEAT; scheda compatta).
**Menu e MAP:** voce in `_data/docs.yml` allo Step 7; `docs/MAP.md` e gli altri file di stato restano per lo Step 12 (11).
**Domande da porre a Luca nel documento**
- **Q1.** Il requisito «non una macchina a stati, memoria da indicatori qualificati» esclude gli stati *nascosti* (HMM) e le reti ricorrenti, o solo la macchina a nove stati con transizioni codificate? Cambia quali forme restano candidate.
- **Q2.** NEAT e GP: si ammettono varianti con stato ricorrente/registri, o solo varianti feedforward con memoria a monte? (scelta di progetto)
- **Q3.** Quanto pesa l'interpretabilità rispetto all'espressività nella scelta del candidato (la rassegna non assegna pesi)?
- **Q4.** Si vuole che E2 parta da una forma semplice (minima/lineare) come base prudente e una ricca come secondo candidato, o da due forme dello stesso livello?
- **Q5.** Un ciclo futuro con esperimento nullo (Alt. 3) è desiderato, e a valle di quale ciclo?

### Controllo UX standing
Il ciclo non ha UI né input (AC-09): **Q3** («stato incoerente da valori in campi collegati») e **Q5** («un input sbagliato produce un output silenziosamente sbagliato») non sono applicabili perché non c'è campo, controllo o passo di flusso; gli Step 2 e 3 hanno riportato correttamente il blocco come non applicabile (nessun rilievo di processo).

### Nota di diversità cognitiva
Rispetto agli Step 3 e 4 questo step aggiunge informazione non presente prima: (a) la verifica sul codice che la formula IIR di Alt. 2 ha i ruoli di `c` invertiti e che nel genoma fisso un filtro del prezzo ha `c = 0.99` (quasi nessuna memoria), con conseguenze sulla cornice e sulla riga FSM; (b) la lettura dei testi di F1, F6, F7, F9 (e delle pagine F5, F8) con quattro affermazioni sostenute, cinque non sostenute e le correzioni; (c) la contraddizione interna tra il cancello di Alt. 1 e la presenza di N1, e il metro non uniforme sul requisito di memoria (NEAT ricorrente non segnalato); (d) la mancanza di fonti per quattro delle cinque forme obbligatorie (AC-04) e la proposta di fondere lineare/minima/Kalman, riducendo da nove a sette schede; (e) il numero di barre dell'istantanea (2517) come vincolo sulle forme a molti parametri. Non riformula quindi gli Step precedenti: li corregge sui fatti e propone modifiche concrete alla struttura.

**Confidence:** Medium — le correzioni su codice e fonti sono verificate sul testo (F-code-1, F1, F6, F7, F9), ma sei fonti non sono state lette, le critiche sulle forme (N2a, N5a) poggiano in parte su conoscenza generale non confermata da fonti lette qui e la scala e il volume dipendono da scelte del Builder.

**Prossimo step:** Step 7 — BUILDER (Step 6 omesso per track).

### Risposte dell'operatore alle domande del Critic (2026-10-11)
1. Il requisito «non una macchina a stati» **non è stringente**: sono ammesse come forme da valutare l'HMM (stati nascosti) e le reti con connessioni ricorrenti. Il documento le tratta come candidate normali, segnalando la loro vicinanza a una macchina a stati dove c'è.
2. Ricorrenze e registri in NEAT e GP: **in attesa di risposta** (l'operatore ha chiesto chiarimenti).

## Step 7 — BUILDER: Produce a Solution

**Agent:** claude-sonnet-5-5 (subagent)
**Confidence:** Medium — il documento è completo rispetto alla struttura dello Step 5 e i fatti sul codice e sulle fonti principali sono controllati sul testo; la confidenza non sale perché (a) 8 delle 20 fonti numerate sono state viste solo come scheda o abstract, (b) i livelli della griglia sono giudizi dell'autore (dichiarati tali), (c) l'adeguatezza al contratto è sulla carta fino a E2, (d) la build di Pages non è stata provata.
**Assunzioni**
- «Builder» in un ciclo di ricerca = chi scrive il documento sulla base di Step 1–5 (Step 6 omesso per track).
- Il Product Owner ha confermato AC-01: una scheda per «MLP e NEAT»; punteggio lineare, forma minima e osservatore di Kalman in una scheda con sottosezioni; HMM con scheda piena. Le schede sono sette: FSM (riferimento) più sei alternative (lineare, alberi/GP, rule list, reti, fuzzy, HMM).
- Risposte dell'operatore già date (Q1: requisito non stringente; HMM e reti ricorrenti ammessi) e Q2 ancora aperta: per NEAT e GP le due varianti sono descritte, non scelte.
- L'esperimento nullo (Alt. 3) non entra nel ciclo: tre righe in «ciò che non si è potuto accertare» e domanda 5.

### Questioni non risolte (dichiarate prima del resto)
- **Q2 (ricorrenze e registri in NEAT e GP) aperta:** il documento mostra le due varianti con pro e contro e la riga per entrambe nella griglia; la scelta è di Luca.
- **Fonti:** 20 fonti numerate; testo letto per 12, solo scheda o abstract per 8 (6 è solo un riassunto di corso, non l'articolo di Allen e Karjalainen). Nessuna fonte letta per il punteggio lineare (descrizione marcata `[ipotesi, fonte da verificare]`), per i sistemi fuzzy a regole (solo Zadeh, scheda, e un lavoro di conferenza), per l'uso di HMM/Kalman/reti ricorrenti con un GA nel trading, per l'equivalenza Kalman stazionario-livellamento esponenziale doppio. LCS (Urbanowicz e Moore) e CART restano non verificate e non sono usate come prova.
- **Volume (A1):** 485 righe, circa 10300 parole contro il limite «mezza pagina per scheda» dello Step 5: ridotto con una sola tabella del contratto, una griglia e il glossario, ma non portato a un formato breve. Rischio per AC-06 dichiarato; il lettore può fermarsi ai capitoli 7 e 9.
- **Build di Pages non provata** (Jekyll non è installato): PENDING_HUMAN dopo il merge. Le tabelle larghe (8 colonne nella griglia) non sono state viste su schermo stretto.
- **`docs/MAP.md` e gli altri file di stato** non toccati: restano allo Step 12.
- **Rilievo del Builder, non del Critic:** `assertStrategy` non richiede `crossover` né `mutate`, ma il GA di Consilium li chiama (`src/vendor/consilium/ga.js` righe 116-125, 345-351; `individual.js` 191 e 350): lo scrivo nel capitolo 6 come materia di R3 ed E2.
- **Nota sulle fonti interne:** il rapporto di Consilium riguarda titoli e panieri quotati diversi da ENI (per esempio PST.MTA e partizioni da 14-19 titoli), fitness CAGR, finestre da 2 a 5 anni; il documento lo dice e non riporta cifre.

### Prodotto
- `docs/architecture/genome-forms-review.md` (nuovo, italiano): 11 capitoli come da «Struttura finale» dello Step 5: metodo e fonti; cornice memoria/lettura (formula IIR come nel codice, esempio numerico con i quattro coefficienti reali, classi «a monte» e «nel lettore»); riga di riferimento FSM dal codice; scala a tre livelli per dimensione definita **prima** delle schede; sei schede alternative con le sette dimensioni, rischi a tre voci, genotipo di massima e fonti con stato; tabella unica del contratto con «cosa si perde» e frasi uniche su `hold`, `labels`, `crossover`/`mutate` e forme con stato; griglia (12 righe, senza punteggio totale, con colonne «contratto» e «memoria; ricorrenza», senza riga buy&hold); famiglie; sintesi per Luca con 2 candidati, forme di confine e di riserva, condizioni di scarto, ciò che non si è accertato, domande 2-5; riferimenti con stato; glossario.
- **Candidati portati:** A = punteggio lineare con soglie (la forma minima come metro); B = alberi di espressioni/GP, variante «solo indicatori». Riserva: rule list. Forma di confine, non candidata: HMM. Motivati solo sulle dimensioni, mai sul rendimento. La scelta resta di Luca.
- `_data/docs.yml`: una voce `genome-forms-review` sotto `architecture` (caso limite 11).

### Risposte ai rilievi del Critic (Step 5)

| Rilievo | Risoluzione |
|---|---|
| **A1** Volume del documento (Alta) | **Mitigato, non risolto del tutto.** Una sola tabella del contratto; formule solo dove servono; glossario in coda; misura riportata (485 righe, 10326 parole al momento del conteggio). Non ho raggiunto «mezza pagina per scheda»: le tabelle delle sette dimensioni con fonte pesano; dichiarato sopra. |
| **A2** Scala ordinale soggettiva (Alta) | **Risolto.** Capitolo 4: per ciascuna dimensione una grandezza osservabile con soglie e livelli con nome (affine / a tratti / universale; piccolo / medio / grande; diretta / con calcolo / solo simulando; decine / centinaia / migliaia; naturale / con accorgimenti / solo mutazione; diretto / con adattamento / non soddisfatto; classi di memoria). Dichiarato che l'assegnazione è un giudizio dell'autore e che i fatti sono nelle grandezze. Nessun punteggio totale. |
| **A3** AC-04 non coperto per le forme obbligatorie (Alta) | **Mitigato.** Fonti raccolte prima di scrivere: GP (Poli e altri, letto), rule list (Rivest 1987, letto), MLP (Hornik e altri 1989, abstract letto), fuzzy (Zadeh, scheda; Raimondi e altri 2007, letto in parte), HMM (Rabiner, letto; Hamilton, Ang e Timmermann, Gupta e altri), Kalman (letto), trading (rassegna Hu e altri 2015, abstract; F8 solo riassunto). Per il punteggio lineare nessuna fonte letta: marcato `[ipotesi, fonte da verificare]` e listato in «ciò che non si è accertato». Nessun riferimento ricordato a memoria. |
| **A4** Ottava voce «rischi» e attribuzione alla forma (Media) | **Risolto.** Checklist fissa a tre voci (anticipazione, soluzioni degeneri, sfruttamento della fitness); capitolo 1: parametri di rischio e fitness comuni a tutte le forme e non decisi dalla forma. |
| **A5** Scheda del contratto con tre esiti non discriminanti (Media) | **Risolto.** Colonna «cosa si perde» e frase unica sull'etichetta contro il numero (il punteggio si espone comunque in `describe()`); dichiarato che il contratto è provato con una sola strategia (confidence Medium) e che l'adeguatezza è sulla carta fino a E2. |
| **A6** Riga FSM con margini «percentuali» (Media) | **Risolto.** Riga riscritta dal codice: margine proporzionale al filtro (`algorithm.js` 381), valori divisi per 100 (`genome.js` `toFraction`), coefficiente IIR = peso del dato nuovo, un margine negativo, solo SW con azione nel genoma fisso, 36 transizioni e 135 id (conteggio eseguito). |
| **A7** Termini finanziari prima del glossario (Bassa) | **Risolto.** Spiegati alla prima occorrenza nel capitolo 1 (stop loss, take profit, buy&hold, OHLCV, indicatori tecnici, backtest, overfitting, look-ahead bias, CAGR) e raccolti nel glossario (rimosso il termine «drawdown» perché il testo non lo usa). |
| **B1** Vocabolario controllato per la memoria (Media) | **Risolto.** Vocabolario chiuso nel capitolo 4 (a monte / ritardi in ingresso / stato discreto / stato continuo nel lettore) più «ricorrenza interna: sì/no/opzionale» in ogni scheda e riga di griglia. |
| **B2** Scarto di B confermato (Bassa) | Nessuna azione: B non è usato come struttura; si legge dalla griglia. |
| **C1** Genotipo di massima nella scheda (Bassa) | **Risolto.** Una riga per scheda («Genotipo di massima»), senza operatori; GE rimandata a R3 in una frase. |
| **1a** Il cancello non discrimina (Alta) | **Risolto.** Nessuna eliminazione; colonna «contratto (vincoli duri)» e memoria nella griglia; eliminazione solo nella sintesi, motivata. |
| **1b** Conflitto con AC-01/AC-02 (Alta) | **Risolto.** Tutte le forme obbligatorie e l'HMM hanno scheda piena in formato compatto; nessuna scheda breve da tre righe. |
| **1c** Incoerenza cancello/N1 (Alta) | **Risolto** con la risposta di Luca a Q1: HMM trattato come forma normale, dichiarata di confine, con avviso di vicinanza all'FSM. |
| **1d** Requisito di memoria non uniforme (Alta) | **Risolto.** Ogni scheda e ogni riga di griglia dichiarano «ricorrenza interna»; per NEAT, MLP, GP, Kalman le due varianti sono trattate con lo stesso metro; non sono scartate in anticipo; Q2 resta a Luca. |
| **1e** Vantaggio dell'imbuto (Bassa) | Recepito: ordine di lettura via capitolo 7 e 9; nessuna azione ulteriore. |
| **2a** Formula IIR con ruoli invertiti (Alta) | **Risolto.** `y[t] = y[t-1] + c*(x[t] - y[t-1])` e la forma del codice `ema = ema*(1-c) + x*c`, con `c` peso del dato nuovo, costante di tempo circa 1/c, righe 369-372 e `genome.js`; esempio numerico dichiarato come tale con i quattro coefficienti reali (calcolato con uno script di una riga). |
| **2b** «Ogni indicatore è lineare» falso (Alta) | **Risolto.** Capitolo 2.2: memoria = funzione causale della storia; lineari solo medie e differenze; non lineari massimi/minimi, stocastico, RSI, ATR; l'elenco è di R2. |
| **2c** «La memoria sta tutta nel banco» falsa per HMM, Kalman, NEAT (Alta) | **Risolto.** Cornice usata come classificazione «a monte» / «nel lettore». |
| **2d** Sovraffermazione sull'attribuzione (Media) | **Risolto.** Detto che la cornice non isola l'effetto della forma e non separa forma e fitness. |
| **2e** Perimetro R2 (Media) | **Risolto.** Gli ingressi sono «di esempio» (n = 6: prezzo, volume, quattro IIR); R2 li sostituisce (capitolo 1). |
| **2f** Kalman 1960 usato oltre la fonte (Bassa) | **Risolto.** [3] citato solo per la stima ricorsiva; esplicito che non tratta livellamento esponenziale né prezzi. |
| **3a** Alt. 3 fuori perimetro (Alta) | **Risolto.** Non adottata; tre righe in 9.4 e domanda 5; nessun codice. |
| **3b** Difetti di metodo dell'esperimento nullo (Media) | **Mitigato.** In 9.4: l'esito dipenderebbe dalla fitness e misurerebbe forma e fitness insieme; i dettagli (blocchi, volume e prezzo insieme) restano a un ciclo futuro, non scritti per non progettare l'esperimento. |
| **3c** Rischio di svuotare la rassegna (Bassa) | **Risolto.** Una sola frase in 9.4. |
| **4a** Buy&hold nella griglia (Media) | **Risolto.** Nessuna riga; buy&hold spiegato in testo e il rapporto Consilium citato con le sue condizioni e senza cifre. |
| **4b** Sovrapposizione lineare/minima/Kalman (Media) | **Risolto.** Una sola scheda 5.1 con tre istanze; una riga di griglia per la minima come metro. |
| **4c** Uso scorretto di F8 (Media) | **Risolto.** F8 spostata nella scheda GP; descritta come ricerca con GA di combinazioni logiche di regole su medie mobili e massimi/minimi; solo riassunto, dichiarato. |
| **N1a** HMM e requisito dell'operatore (Alta) | **Risolto.** Paragrafo «Vicinanza alla macchina a stati» in 5.6; colonne memoria e interpretabilità valgono per K stati nascosti; non si sostiene che rispetti o violi il requisito (Q1 già risposta). |
| **N1b** Anticipazione nella stima (Alta) | **Risolto.** In 5.6 due strade esposte (GA senza stima globale; stima solo su dati precedenti, a cura di R6), senza scegliere; Baum-Welch e Viterbi usano l'intera sequenza [2]. |
| **N1c** Simboli in conflitto con Rabiner (Media) | **Risolto.** Simboli di Rabiner (`alfa_t(j)`, `a_ij`, `b_j(O_t)`, `pi_i`) con induzione e scaling; nessuna notazione alternativa. |
| **N1d** Convenzioni concorrenti nel crossover (Media) | **Risolto.** Menzione in dimensione crossover di MLP, NEAT e HMM, con fonte [1] e l'ordinamento dei regimi marcato `[ipotesi]`. |
| **N1e** Campione e applicazione al trading (Media) | **Mitigato.** Fonti [12], [13], [14] trovate (non per HMM+GA nel trading); «applicazione non accertata» in 5.6 e 9.4; conteggio parametri riportato (circa 44 per K=3, n=6). |
| **N2a** Kalman: fonte e filtro alfa-beta (Media) | **Risolto.** Convergenza e «alfa-beta» scritte come `[ipotesi, fonte da verificare]`; [15] citata per livellamento esponenziale e modelli di stato, precisando che non presenta l'equivalenza. |
| **N2b** Ipotesi gaussiana (Bassa) | **Risolto.** Una frase come ipotesi nei rischi di 5.1. |
| **N3a** CGP per sola mutazione (Media) | **Risolto con verifica.** Letto nel Field Guide, capitolo 7.2.3: tradizionalmente la mutazione è l'operatore principale (e un crossover è stato proposto più tardi) [5]. |
| **N3b** «Solo indicatori» presentato come proprietà (Media) | **Risolto.** Scritto come scelta di progetto, non proprietà della forma (5.2). |
| **N4a** GE ricrea un FSM (Bassa) | **Risolto.** Capitolo 8: la grammatica decide le forme raggiungibili; rimando a R3. |
| **N5a** Pittsburgh ≠ rule list (Media) | **Risolto.** «Simile, non identica», `[ipotesi, fonte da verificare]`; F11 non letta (403 e verifica anti-robot). |
| **N6a** Attribuzione errata di F5 (Bassa) | **Risolto.** «Gruppo MINDS, pagina `ai.rug.nl/minds/esnresearch`»; nessun Fraunhofer; nessun raggio spettrale. |
| **N6b** Giudizi sul reservoir senza fonte (Bassa) | **Risolto.** Marcati `[ipotesi]`. |
| **T1** Conteggio schede (Alta) | **Risolto.** Sette schede (FSM più sei) con MLP e NEAT in una; PO ha confermato. |
| **T2** Decisione su Alt. 2 e Alt. 4 (Media) | **Risolto.** Alt. 2 adottata come classificazione (cap. 2); Alt. 4 come forma minima nella scheda 5.1, senza riga buy&hold. |
| Casi limite 1-12 | 1 (imbuto/AC-01): risolto come 1b. 2 (fonti non lette): stato per ogni fonte nel capitolo 10; «foreste» corretto in CART (esclusa come ipotesi, fuori dall'epica). 3 (contratto/forme continue): frase unica in capitolo 6. 4 (tensione requisito/forme): per variante, lasciato a Luca. 5 (promesse di redditività): nessuna cifra; i risultati esterni sono attribuiti a «quello studio» con le sue condizioni; verificati con ricerca di `guadagn|batter|rend` (nessun uso promissorio). 6 (R2): ingressi di esempio. 7 (scala e FSM): stesso vocabolario e fatti corretti. 8 (`hold`): frase unica. 9 (anticipazione): frase unica nel capitolo 1. 10 (campione piccolo): 2517 barre citate; nessuna conclusione sul sovradattamento senza [4]. 11 (AC-08/09): voce di menu aggiunta; `docs/MAP.md` rimane allo Step 12. 12 (ciclo parallelo): nessuna interferenza. |
| Verifica a campione delle fonti (F1, F5-F9, F11, F12, F2-F4, F10) | Correzioni applicate: F9 senza rivista/anno (versione di novembre 2014, working paper); F8 solo riassunto, articolo non letto; F5 come pagina di gruppo; F11 non verificata; F12 non usata; F10 ora localizzata (sezioni 7.1, 7.2.3, 11.3 lette). |
| Domande per Luca | Q1 non riproposta (già risposta); Q2 aperta; Q3, Q4, Q5 rinumerate 3, 4, 5. |

### Self-Test Log (obbligatorio)

```
Self-Test Log:
  Component: docs/architecture/genome-forms-review.md (controllo Liquid)
  Test method: grep -nE '\{\{|\{%' docs/architecture/genome-forms-review.md
  Actual output: nessuna riga, exit code 1
  Expected output: nessuna occorrenza
  Result: PASS
  Notes: i blocchi di codice usano solo graffe singole ({ label, indicators }). Letto il pattern jekyll-stakeholder-docs: nessun uso di Liquid nel corpo.

Self-Test Log:
  Component: intestazione e link (docs/architecture/genome-forms-review.md, _data/docs.yml)
  Test method: head del file confrontato con docs/architecture/simulator-overview.md; ls dei bersagli dei link relativi; yaml.safe_load di _data/docs.yml
  Actual output: front matter title/layout: doc/last_verified come gli altri (senza mermaid); riga "last_verified: 2026-10-11" nel corpo; link ../simulator-overview/ e ../simulator-overview/#strategy-contract verso docs/architecture/simulator-overview.md (esiste); YAML valido, ids: simulator-overview, use-case-eni-replay, genome-forms-review; tabelle Markdown con numero di colonne coerente (script Python: 0 tabelle incoerenti)
  Expected output: intestazione identica per forma, link a file esistenti
  Result: PASS
  Notes: il titolo del layout non mostra il menu; la resa nel sito non è verificata (vedi SKIPPED).

Self-Test Log:
  Component: URL citati
  Test method: curl -sL (User-Agent browser) su ciascuno dei 19 URL del documento
  Actual output: 200 per 18 URL; https://mathnet.ru/eng/fssc12 ha dato 503 e poi 200, 503, 200 (intermittente)
  Expected output: tutti raggiungibili
  Result: PASS (con nota)
  Notes: la pagina dell'editore ScienceDirect (Hu e altri) ha dato 403 (per questo si cita la scheda PolyU); Wiley/Hindawi (LCS) 403 e PMC con verifica anti-robot: LCS non usata come prova. Un URL fuori dal documento (eprints.ucm.es, fuzzy trading) non raggiungibile: non citato.

Self-Test Log:
  Component: struttura e lunghezza del documento
  Test method: wc -l -w; script Python che conta le righe delle sette dimensioni nelle tabelle di ogni scheda
  Actual output: 485 righe, 10326 parole; FSM, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6: 7/7 dimensioni presenti in ciascuna
  Expected output: sette dimensioni in ogni scheda; lunghezza misurata
  Result: PASS (presenza); lunghezza oltre l'obiettivo dello Step 5 (rilievo A1 dichiarato)
  Notes: ricerca di termini promissori: solo usi non promissori.

Self-Test Log:
  Component: nessun cambiamento ai test e al modello ArchiMate
  Test method: npm test; npm run archimate:check
  Actual output: "# tests 28 / # pass 28 / # fail 0"; "archimate: modello "eni-replay" valido (32 elementi, 51 relazioni); file generati aggiornati."
  Expected output: verdi
  Result: PASS
  Notes: il ciclo non tocca src/, tests/, scripts/, archimate/.

Self-Test Log:
  Component: file toccati
  Test method: git status --short; git diff --stat
  Actual output: " M _data/docs.yml" (3 inserzioni), "?? docs/architecture/genome-forms-review.md", " M software-house-ai" (modifica del puntatore già presente prima dello Step 7, non mia), più questo file del ciclo
  Expected output: solo i tre file consentiti
  Result: PASS
  Notes: nessun comando git di scrittura eseguito.

Self-Test: SKIPPED (build Jekyll del sito)
Reason: Jekyll, Ruby e Bundler non sono installati in questa macchina (which jekyll bundle ruby: nessun risultato), quindi la pagina non può essere costruita né aperta nel browser.
Risk: errori di Liquid o di Markdown che solo la build rivela; rendimento di tabelle larghe su schermo stretto; menu e breadcrumb della pagina.
Mitigation: controllo statico di Liquid (PASS sopra); build di Pages e osservazione della pagina allo Step 9 (SCIENTIST), PENDING_HUMAN dopo il merge su main, come negli altri cicli.
```

**Prossimo step:** Step 8 — OPTIMIZER (da svolgere in una nuova sessione; qui non eseguito).

## Step 8 — OPTIMIZER: Improve the Solution

**Agent:** claude-sonnet-5-5 (subagent)
**Confidence:** Medium — fatti, fonti, candidati e giudizi sulle forme sono invariati rispetto allo Step 7 e i controlli meccanici sono verdi; resta Medium perché l'obiettivo di lunghezza indicato dal Coordinator (5.500-6.500 parole) **non è stato raggiunto** (vedi sotto), la build di Pages non è provata e i livelli della griglia restano giudizi dell'autore.
**Assunzioni**
- Il documento dello Step 7 è la base; copia di sicurezza fuori dal repository: `scratchpad/genome-forms-review.builder.md` (485 righe, 10326 parole) e `docs.yml.bak`.
- «Parole» = `wc -w` sul file intero (comprende i `|` delle tabelle, che gonfiano il conteggio di circa 500); le parole senza i separatori di tabella sono circa 7.600.
- Nessun fatto, fonte (salvo i due rimossi sotto) né conclusione è stato cambiato; non è stata decisa la domanda 2.

### Ridondanze e complessità individuate

| Elemento | Problema | Azione |
|---|---|---|
| Ordine dei capitoli | La sintesi per la decisione (candidati, scarto, non accertato, domande) era al capitolo 9, dopo ~8.000 parole di schede | **Spostata in apertura** (capitolo 1); le schede restano il dettaglio. Rinumerati i rimandi |
| Intestazione | Indice di 11 voci e frase di processo sul Critic nel capitolo della scala | Indice **rimosso**; riferimenti al Critic e ai passaggi del ciclo tolti; aggiunta una riga «Come leggerlo» |
| Capitolo «Metodo» | Elenco delle sette dimensioni ripetuto (già nel capitolo della scala), paragrafi di stato delle fonti (già nel capitolo Riferimenti), frasi su livello matematico duplicate | Accorciato (circa -30%); sparita la lista delle dimensioni e la descrizione dello stato fonti |
| Schede (sezione 6) | Righe «Contratto» che ripetevano `labels`/`describe()`/`serialize()` già nella tabella unica del capitolo 7; righe «Fonti.» a fine scheda che duplicavano le citazioni nelle tabelle; righe «Origine della memoria» duplicate nelle tabelle delle varianti e nelle schede; «Fatto» prolissi | Righe «Contratto» ridotte a `labels` più rimando; righe «Fonti.» **rimosse**; riga ridondante nelle tabelle delle varianti di GP e reti accorciata; celle «Fatto» e paragrafi «Rischi» abbreviati; «Genotipo di massima» riportato in coda ai rischi |
| Sintesi (ex capitolo 9) | Motivazioni dei candidati duplicate dalle schede (punti ripetuti 4 volte: spazio piccolo, leggibile, naturale, contratto) | Riassunte in 3-4 punti per candidato; le forme di riserva in una riga ciascuna |
| Griglia | Tre «letture» in tre elenchi puntati | Unite in un paragrafo; la tabella (12 righe) è invariata |
| Famiglie e forme escluse | Frasi che ripetevano le schede (conteggi dei pesi, descrizione di NEAT) | Accorciate |
| Riferimenti | Note di lettura dettagliate, DOI, «Verificato il 2026-10-11» su ogni voce, paragrafo di conteggio lungo | Data di verifica dichiarata **una volta** in testa (tutte le voci, stesso giorno), note brevi con lo stato letto/scheda per voce; conteggio ridotto a una riga |
| Fonti [16] e [17] (CGP, solo schede bibliografiche) | Nessuna affermazione in più rispetto a [5] (Field Guide, letto: sezioni 7.1 e 7.2.3) | **Rimosse**; riferimenti rinumerati: GE 18→16, reservoir 19→17, Consilium 20→18. 18 fonti totali (12 lette, 6 solo scheda) |
| Glossario | Voci non usate o duplicate: ATR, RSI, Hold-out, Volume, «Look-ahead» come rinvio, «Crossover» (già definito nella voce GA) | Rimosse; ATR e RSI tolti anche dal testo (resta l'esempio massimo/minimo su N barre come indicatore non lineare) |
| Titolo | In inglese («Genome Forms Review») | **«Rassegna delle forme di genoma»** nell'intestazione e nella voce di `_data/docs.yml` (`id` e `path` invariati) |

### Errori corretti
- **Tabella dell'esempio IIR:** `volume 1` dopo 2 barre era 102,22; il valore con `c = 0.11764…` è **102,21** (ricalcolato con `110 - 10*(1-c)^k` sui quattro coefficienti di `FIXED_GENOME`). Colonna «dopo 3» eliminata.
- **Rimandi ambigui:** «capitolo 7.1 / 7.2.3 / 11.3» nelle schede indicavano le sezioni del Field Guide [5] ma si leggevano come capitoli del documento: ora «sez. 7.1 di [5]» e simili.
- **Formula IIR:** controllata nuovamente sul codice (`algorithm.js` righe 369-372: `ema = ema * (1 - c) + x * c`); invariata. Verificati anche i conteggi dell'FSM (36 transizioni, 135 identificatori) con uno script su `FIXED_GENOME`.

### Cosa è stato tenuto deliberatamente, nonostante il costo
- **Sette dimensioni in ogni scheda** (FSM compreso) con livello e fonte o `[ipotesi]`, anche dove la cella è ripetitiva: è AC-02 e permette ad AC-04 di verificarsi riga per riga.
- **Le due varianti «solo indicatori»/«con memoria interna»** per GP e per MLP/NEAT con pro, contro e riga di griglia ciascuna (domanda 2 aperta).
- **Scala definita prima delle schede**, griglia a 12 righe con colonna dei vincoli duri, senza punteggio totale e senza riga buy&hold.
- **Tabella unica del contratto** con «cosa si perde» e le frasi uniche su `hold`, `labels`, `crossover`/`mutate`, forme con stato; la frase sul contratto provato con una sola strategia.
- **Esempio numerico dell'IIR** (4 righe): è il solo punto in cui il lettore vede che `c` è il peso del dato nuovo e che `prezzo 2` ha quasi nessuna memoria; è dichiarato come calcolo di esempio.
- **Candidati A e B con condizioni di scarto**, forme di confine e di riserva, ciò che non si è potuto accertare (compreso l'esperimento di controllo, domanda 5) e le domande 2-5.
- **Le note `[ipotesi]` e `[ipotesi, fonte da verificare]`**, le attribuzioni «risultato di quello studio» (F8/[6], [7], [14]) e l'assenza di cifre di rendimento; i termini di finanza spiegati alla prima occorrenza (stop loss, take profit, buy&hold, OHLCV, CAGR, backtest, look-ahead, overfitting) più il glossario.
- **Riferimenti con stato letto/scheda** e le due fonti non verificate (LCS, CART), indispensabili per AC-04 e AC-05.

### Misure (prima → dopo)
| | Prima (Step 7) | Dopo (Step 8) |
|---|---|---|
| Righe | 485 | 410 |
| Parole (`wc -w`) | 10326 | 8110 (-21,5%) |
| Fonti numerate | 20 | 18 |

**L'obiettivo di 5.500-6.500 parole non è raggiunto.** La parte che non si può accorciare senza toccare un criterio pesa da sola circa 4.500 parole: sette schede × sette dimensioni con fonte (AC-02, AC-04), scala (circa 400), tabella del contratto e frasi uniche (circa 450), griglia (circa 480), 18 riferimenti con stato (circa 700), glossario. Il lettore che deve solo decidere ha ora il capitolo 1 (circa 1.000 parole) e la griglia (capitolo 8) all'inizio; per scendere sotto 6.500 servirebbe togliere righe di dimensioni dalle schede, cosa che il contratto di AC-02 non consente, o una modifica esplicita di AC-02/AC-06 da parte del Product Owner (non proposta qui).

### Verifica (eseguita davvero)

```
(a) wc -w -l: prima 485 righe / 10326 parole; dopo 410 righe / 8110 parole
(b) grep -nE '\{\{|\{%' docs/architecture/genome-forms-review.md -> nessuna riga, exit 1: PASS
(c) script Python sulle tabelle: FSM (cap. 4), 6.1, 6.2, 6.3, 6.4, 6.5, 6.6 -> 7/7 dimensioni in ciascuna; 0 tabelle con numero di colonne incoerente: PASS
(d) script Python sui rimandi [n]: definiti 1-18, citati nel testo 1-18, nessun orfano, nessuna fonte non citata (la voce 18 non ha URL: Consilium, percorso nel repository, verificata a mano alla riga 390): PASS
(e) link interni: ../simulator-overview/ e ../simulator-overview/#strategy-contract -> docs/architecture/simulator-overview.md esiste e ha "## Strategy contract" (riga 29): PASS. Rimandi «capitolo N» ricontrollati a mano sulla nuova numerazione (1-11): PASS
(f) front matter (title in italiano, layout: doc, last_verified) come simulator-overview; _data/docs.yml caricato con PyYAML (yaml.safe_load): valido, voce genome-forms-review con id e path invariati e titolo «Rassegna delle forme di genoma». Ruby non installato; nessun parser YAML in node_modules: usato Python: PASS
(g) npm test -> # tests 28 / # pass 28 / # fail 0; npm run archimate:check -> modello "eni-replay" valido (32 elementi, 51 relazioni): PASS
```

Non eseguito: build Jekyll (non installato; resta PENDING_HUMAN dopo il merge). Ricerca dei termini promissori (`guadagn|batter|rendimento`): solo usi non promissori (definizioni di CAGR e take profit, «rendimento atteso» negato, risultato di [6] riportato come esito di quello studio).

### Copertura degli AC dopo lo Step 8

| AC | Esito | Nota |
|---|---|---|
| AC-01 Copertura | Soddisfatto | Cinque forme previste (MLP e NEAT in una scheda) più HMM; Kalman e minima nella scheda lineare |
| AC-02 Sette dimensioni | Soddisfatto | Script (c): 7/7 in FSM e nelle sei schede |
| AC-03 Riga FSM | Soddisfatto | Scheda cap. 4 e prima riga della griglia |
| AC-04 Tracciabilità | Soddisfatto con riserva | Resta la riserva dello Step 7: forme poggiate su `[ipotesi]` (punteggio lineare, fuzzy), 6 fonti su 18 solo scheda; nessuna cifra di rendimento |
| AC-05 Esito | Soddisfatto | Candidati A e B con scarto, forme di confine/riserva, non accertato, domande 2-5 |
| AC-06 Leggibilità | Soddisfatto con riserva | Sintesi in apertura e -21,5% di parole, ma 8.110 parole restano sopra l'obiettivo; tabelle larghe (griglia a 8 colonne) non viste su schermo stretto |
| AC-07 Scelta di Luca | Non applicabile a questo step | Da registrare in `## Human Verification` |
| AC-08 Pubblicazione | Soddisfatto con riserva | Intestazione e menu in regola, nessun Liquid; build di Pages PENDING_HUMAN |
| AC-09 Nessuna modifica | Soddisfatto | Toccati solo il documento, il titolo in `_data/docs.yml` e questo file; `src/`, `tests/`, `scripts/`, `archimate/**`, stato condiviso intatti (`software-house-ai` già modificato prima del ciclo) |

### Rischi residui
- Lunghezza ancora sopra l'obiettivo (AC-06): per Luca bastano i capitoli 1 e 8; chi vuole ridurre ancora deve accettare di perdere celle di dimensione o aprire una modifica di AC-02.
- La rinumerazione dei capitoli e dei riferimenti [16]-[18] è stata verificata con script, ma i rimandi testuali «capitolo N» solo a mano.
- Le fonti con ruolo di prova restano [5], [1], [2], [3], [4], [8], [9]; le altre sono schede o abstract.
- Il documento non è stato aperto nel sito: tabelle, blocchi di codice e `last_verified` ripetuto nel corpo (come negli altri documenti) vanno visti allo Step 9.

**Prossimo step:** Step 9 — SCIENTIST

### Decisione dell'operatore sulla lunghezza (2026-10-11)
Luca **accetta la lunghezza del documento oltre il criterio** (circa 8.100 parole contro le 5.500–6.500 indicate). AC-06 resta soddisfatto con la riserva registrata allo Step 8, ora **accettata**: il documento si legge dal capitolo 1 (sintesi) e dalla griglia (capitolo 8); il resto è consultazione. Nessuna modifica di AC-02.

## Step 9 — SCIENTIST: Verify

**Agent:** claude-sonnet-5-5 (subagent)
**Esito in apertura: nessun difetto Critico o Alto.** Trovati 2 difetti Medi (contratto incompleto nella tabella del capitolo 7; tabelle che sforano a 390 px) e 6 Bassi, tutti correggibili senza toccare le conclusioni. Fonti, numeri e citazioni di codice reggono.
**Confidence:** Medium — alta su fonti, numeri e coerenza con il codice (riscontri diretti sul testo e con script); media sul rendering, perché è approssimato (Jekyll non installato) e sulla build di Pages, che non è raggiungibile (PENDING_HUMAN). I livelli della griglia sono giudizi dell'autore e non sono verificabili.
**Assunzioni**
- Il documento verificato è quello dello Step 8 (410 righe, 8110 parole, 18 riferimenti), già con la lunghezza accettata da Luca.
- «Testo letto» = scaricato con `curl` e convertito con `pdftotext`/HTML in testo, poi cercate le espressioni chiave; non ho riletto per intero ogni PDF.
- Non ho modificato nulla tranne questa sezione; file temporanei in `scratchpad/` (script `nums.mjs`, `ac.py`, `shot.mjs`, estratti dei PDF).

### 1. Fonti

**HTTP (17 URL del documento).** 16 risposte 200 al primo tentativo. `https://otexts.com/fpp3/exponential-smoothing.html` ([15]) ha dato **403** in 3 tentativi con User-Agent Chrome, ma 200 con User-Agent `curl` e Firefox (filtro anti-robot, non assenza della pagina). Il documento dice che «gli URL hanno risposto con codice 200 salvo dove indicato» e non indica questo caso (difetto D8, Basso). `mathnet.ru` ([10]) ha risposto 200 stavolta (il Builder aveva visto 503 intermittenti, già dichiarato).

**Controllo di contenuto: 18 riferimenti su 18** (12 sul testo integrale scaricato, 6 su abstract/scheda come dichiara il documento). Esito: 16 sostenute, 2 sostenute con riserva ([6], [7] per una sola frase), 0 non sostenute, nessun «testo letto» dichiarato falsamente.

| Affermazione nel documento | Fonte | Esito | Correzione |
|---|---|---|---|
| NEAT: topologia e pesi, marcatori storici, speciazione, crescita incrementale; memoria con connessioni ricorrenti; «competing conventions» | [1] PDF (Evol. Comp. 10(2), 99-127) | **Sostenuta** (abstract: tre idee; riga 47 del testo: «memory is easily represented through recurrent connections»; sez. 2.2 competing conventions) | nessuna |
| HMM: variabile in avanti, induzione, scaling per la somma sugli stati; Baum-Welch e Viterbi | [2] Rabiner (PDF; Proc. IEEE 77(2), 1989) | **Sostenuta** (eq. 20, 92a-92b; Baum-Welch e Viterbi nel testo); il testo non parla di finanza, come il documento dice | nessuna |
| Kalman per la stima ricorsiva; non tratta livellamento esponenziale né prezzi | [3] PDF | **Sostenuta**: nessun riscontro per «exponential», «slope», prezzi; «smoothing» solo in senso Wiener | nessuna |
| L'hold-out non basta quando si prova più di una configurazione; versione di novembre 2014, rivista non confermata | [4] PDF | **Sostenuta** (sezione «Comparisons to other approaches»: hold-out inadeguato per campioni piccoli, alta varianza, «overfitting is always present» provando più configurazioni; data 27 nov 2014) | nessuna |
| GP: albero, GP lineare con registri (sez. 7.1), CGP per sola mutazione (7.2.3), bloat (11.3) | [5] Field Guide PDF | **Sostenuta**: 7.2.3 dice «traditionally Cartesian GP has always used mutation as its main search operation» e che un crossover è stato proposto di recente | nessuna |
| GA su combinazioni logiche di regole con medie mobili e massimi/minimi; dopo i costi non si guadagna | [6] pagina di corso | **Sostenuta con riserva**: la pagina riporta «Not possible to make money after transaction costs»; «rendimento in eccesso rispetto al riferimento» è una lettura (la fitness della pagina è l'eccesso sul buy&hold, ma la conclusione è formulata come «make money»). Autori, rivista, volume e anno sono sulla pagina | D5 |
| Rassegna con forte concentrazione di studi su GA e GP | [7] scheda PolyU (Appl. Soft Comput. 36, 534-551, 23 ago 2015) | **Sostenuta** (abstract: «significant bias toward ... GA ... and GP»). **Non sostenuto**: che GP sia «la forma con più precedenti» (1.2), perché l'abstract accorpa GA e GP | D4 |
| Decision list: prima regola vera, l'ultima è sempre vera | [8] Rivest PDF | **Sostenuta** («least index such that f_j(x)=1 ... the last function is always true») | nessuna |
| MLP con almeno uno strato nascosto è approssimatore universale | [9] Hornik PDF | **Sostenuta** (abstract) | nessuna |
| Insiemi sfumati: grado di appartenenza tra 0 e 1 | [10] mathnet | **Sostenuta** (abstract). La pagina è una ristampa 2015 (Fuzzy Systems and Soft Computing) dell'articolo del 1965; la citazione originale è sulla pagina | nessuna |
| Sistema fuzzy per azioni ottimizzato con GA, lavoro di conferenza su un caso | [11] Raimondi e altri (ICEIS 2007, pp. 322-329) | **Sostenuta** (abstract e intestazione del PDF) | nessuna |
| Hamilton: cambio di regime con processo di Markov a stati discreti | [12] | **Sostenuta** (abstract: «discrete-state Markov process») | nessuna |
| Regimi nei mercati finanziari | [13] NBER w17182 (giugno 2011); [14] Gupta e altri (DSFE 5(4), 466-501) | **Sostenute** ([13] abstract «Regime switching models... financial markets»; [14] PDF su HMM e trading) | nessuna |
| Holt (metodo lineare) e livellamento esponenziale; non presenta l'equivalenza con Kalman | [15] FPP3 cap. 8 | **Sostenuta** (indice: Holt's linear trend method, ETS(A,A,N)); nessun riscontro sull'equivalenza, come il documento dice | nessuna |
| GE: stringa di interi tradotta da grammatica; Springer 2018, pp. 1-21 | [16] gpbib | **Sostenuta** (record BibTeX: Springer 2018, pages 1--21); è la sola scheda, come dichiarato | nessuna |
| Reservoir: rete ricorrente casuale e fissa, lettura lineare addestrata | [17] MINDS | **Sostenuta** (testo della pagina). Nota: la pagina cita «Fraunhofer IAIS» (brevetti); il documento non lo usa, quindi nessun errore | nessuna |
| Rapporto Consilium: parametri di rischio degenerati e CAGR grezzo come causa ricorrente; titoli e panieri diversi da ENI; finestre da 2 a 5 anni | [18] `consilium/archive/reports/2026-09-12_train-test-holdout-experiments.md` | **Sostenuta** (riga 267: stop loss 15-45%, take profit 3-6%; tabella iniziale: finestre 2y-3m, 3y-1y, 5y-1y; PST.MTA e partizioni da 14-19 titoli). «Letto per intero»: non verificabile da me, ho letto le parti citate | nessuna |
| Non numerate: LCS (Urbanowicz-Moore) e CART (Breiman) | — | **Non verificabili** (non lette), correttamente marcate `[ipotesi, fonte da verificare]` e non usate come prova | nessuna |

Nessun riferimento inventato: ogni voce esiste e coincide con titolo/autori/anno/pagine dove ho potuto confrontare (esclusi [4], dichiarato incerto dal documento, e [18], file locale).

### 2. Formule e numeri (script `nums.mjs`, eseguito su `FIXED_GENOME`)

| Valore del documento | Ricalcolo | Esito |
|---|---|---|
| Tabella IIR (prezzo 2/1, volume 2/1; dopo 1, 2, 8 barre; 1/c) | 109,90/110,00/110,00; 107,31/109,27/110,00; 103,96/106,35/109,82; 101,18/102,21/106,33; 1/c = 1,0/1,4/2,5/8,5 | **coincide** in tutte le 12 celle |
| Formula `ema = ema*(1-c) + x*c` equivalente a `y = y + c*(x-y)`; `c` peso del dato nuovo | `algorithm.js` righe 369-372 | **coincide** |
| 9 stati, 36 transizioni, 135 identificatori, solo SW con azione `buy`, 4 transizioni per stato | conteggio sul genoma fisso | **coincide** |
| 11 numeri continui del genoma | 4 IIR + buy + 4 margini + stop + take | **coincide** |
| 2517 barre, 2016-09-29 → 2026-09-28 | `src/data/eni-ohlcv.json` | **coincide** |
| Lineare 9; MLP 43; fuzzy 54; HMM 44 (36+6+2) | ricalcolati | **coincide** |
| Costi per barra (decine/centinaia) | stima a mano | coerenti, rimangono `[ipotesi]` |
| Valori della fitness/rendimenti | assenti | nessuna cifra di rendimento nel documento |

Confidenza: alta. Le formule di Rabiner (induzione e scaling) e di Kalman citate nel testo coincidono con le equazioni dei PDF; il documento non riporta formule del filtro di Kalman, solo la descrizione.

### 3. Coerenza con il codice

Controllate tutte le citazioni file/riga: `algorithm.js` 20-61, 135-193, 342-358, 365-384, 399-403; `genome.js` 4, 13-17, 32, 78-88, 92-102 (e `toFraction`); `stockStream.js` 32-34 (media OHLC: ok); `individual.js` 191 (`mutate`) e 350-380 (`crossover`); `ga.js` 116-125 e 345-351 (chiamano `crossover`/`mutate`); `strategy.js` 4-5, 12-33, 35-87 (ordine `feed`, `hold` non chiama `buy()`/`sell()`); `simulator-overview.md` ha `## Strategy contract`; la decisione `2026-10-11-strategy-contract.md` ha confidenza Medium; il link `../simulator-overview/#strategy-contract` è valido. **Tutte esistono e dicono ciò che il documento afferma**, con questa eccezione:

- **D1 (Media) — «Membri richiesti» del capitolo 7 (riga 319).** `assertStrategy` richiede anche `trader` (oggetto con `getTotalValue`) e non controlla `decide()`: questo è un hook di `StrategyIndividual`, non un requisito di `assertStrategy`. Il documento elenca `decide()` tra i membri richiesti e omette `trader`. Rilevante perché E2 deriva i test da questa tabella. Correzione: scrivere due gruppi (richiesti da `assertStrategy`: `kind`, `labels`, `trader`, `init`, `feed`, `reset`, `getCAGR`, `getPerformanceSummary`, `describe`, `serialize`; richiesto da `StrategyIndividual`: `decide` e i tre hook degli indicatori). Il resto della tabella (labels, describe, serialize) è corretto.

### 4. Criteri di accettazione

| AC | Esito | Prova |
|---|---|---|
| AC-01 Copertura | **Soddisfatto** | Schede 6.1-6.6 più FSM (cap. 4): lineare (con minima e Kalman), GP, rule list, MLP+NEAT (una scheda, conferma del PO riportata allo Step 7), fuzzy, HMM |
| AC-02 Sette dimensioni | **Soddisfatto** | `ac.py`: 7/7 in FSM, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6; nessuna cella senza fonte o marcatura |
| AC-03 Riga FSM | **Soddisfatto** | Cap. 4 e prima riga della griglia; fatti ricontrollati sul codice |
| AC-04 Tracciabilità | **Soddisfatto con riserva** | 45 marcature `[ipotesi...]`; campione di 22 affermazioni (sopra nelle tabelle 1-3 e: IIR, 36/135, 11 numeri, 2517 barre, CGP, bloat, ricorrenze NEAT, competing conventions, scaling, Baum-Welch, hold-out, MLP, decision list, Hamilton, [7], [6], [14], [15], [17], [18], [3]): 19 sostenute, 3 con riserva (D4, D5, D6). Giudizi senza marcatura: D7. Nessuna cifra di rendimento. 6 fonti su 18 solo abstract/scheda (dichiarato) |
| AC-05 Esito | **Soddisfatto** | Candidati A e B con condizioni di scarto, forme di confine e di riserva, ciò che non si è accertato, domande 2-5; la scelta non è anticipata |
| AC-06 Leggibilità | **Soddisfatto con riserva** (lunghezza accettata da Luca) | Italiano, simboli definiti alla prima comparsa (verificati `n`, `c`, `x[t]`, `s[t]`, `K`, `alfa`, `a_ij`; manca solo `m1`, `m2` nel blocco della rule list). Script del glossario (15 termini): spiegati alla prima occorrenza nel testo OK per backtest, buy&hold, CAGR, OHLCV, stop loss, take profit, overfitting, indicatore; **non spiegati alla prima occorrenza (solo glossario)**: «algoritmo genetico» (riga 15), «fitness» (37), «genoma» (7), «media mobile» (21, solo esempio); spiegati più avanti: look-ahead (43 → 76), IIR (78 → 88), barra (25 → 76). Termini fuori glossario: «posizione lunga» (171), «costi di transazione» (189). Vedi D3 |
| AC-07 Scelta di Luca | **Non applicabile a questo step** | Nessun blocco `## Human Verification` ancora nel file; il ciclo resta DEFERRED fino alla scelta |
| AC-08 Pubblicazione | **Soddisfatto con riserva** | Intestazione come `simulator-overview.md` (tranne `mermaid`, non richiesto), voce in `_data/docs.yml` (YAML valido, `path` coerente con `permalink: pretty`), nessun `{{` né `{%` (grep exit 1), 0 tabelle con colonne incoerenti, 13 tabelle. Riserve: rendering a 390 px (D2) e build di Pages PENDING_HUMAN |
| AC-09 Nessuna modifica | **Soddisfatto** | `git diff --name-only ed16af8~1 HEAD`: `.swhouse/cycles/current-010.md`, `_data/docs.yml`, `docs/architecture/genome-forms-review.md`; `software-house-ai` modificato prima del ciclo (non toccato) |

**Promesse di redditività:** ricerca di `%`, «rendiment», «profitt», «guadagn», «batt», «redditiv»: solo le definizioni (CAGR, take profit), la negazione in apertura (riga 15: «non è una promessa di redditività») e l'attribuzione a «quello studio» ([6]). Nessuna percentuale di rendimento, nessuna frase del tipo «la forma X batterebbe il buy&hold».

### 5. Rendering — **approssimazione, non il rendering reale di Jekyll**

Metodo: Markdown → HTML con il modulo Python `markdown` (estensioni `tables`, `fenced_code`), inserito in una struttura `doc-shell`/`doc-content` come in `_layouts/doc.html` con `assets/css/style.css` del sito; Chromium via Playwright del repository a 1280 e 390 px. Differenze possibili da kramdown/GitHub Pages: attributi di intestazione, trattamento di `[n]` e dei caratteri speciali; la struttura delle tabelle è la stessa.

- **Console:** nessun errore né avviso a 1280 e a 390 px.
- **1280 px:** `scrollWidth` 1280 = larghezza finestra; colonna di contenuto 828 px; nessuna tabella sfora; la griglia a 8 colonne (cap. 8) è leggibile, righe da 2-4 righe di testo. Vedo il titolo duplicato (intestazione del layout e `# Rassegna...` nel corpo) e la riga di testo `last_verified: 2026-10-11`: stesso schema degli altri documenti, non un difetto nuovo. Menu laterale con la voce evidenziata.
- **390 px:** **`scrollWidth` 856 contro 390: la pagina scorre in orizzontale.** 11 tabelle su 13 sforano (larghezze 412-836 px); la griglia a 8 colonne misura 836 px e le tabelle delle schede (4 colonne) 430-620 px; 5 blocchi di codice scorrono dentro il proprio riquadro (`pre` ha `overflow-x: auto`: corretto). Il testo corrente si legge bene (contenuto largo 350 px). Il sito non ha un contenitore scorrevole per le tabelle (`table { width:100% }` senza wrapper).
- **D2 (Media):** per il lettore da telefono la griglia e le schede sono scomode. Correzione proposta (da fare fuori dal documento, scelta del coordinatore): regola CSS in `assets/css/style.css`, ad esempio `.doc-content table { display: block; overflow-x: auto; }`, oppure accettare il comportamento perché il documento è pensato per lo schermo largo (Luca e Simone); in ogni caso va detto all'Owner nella verifica di Pages. Nota: `assets/css/style.css` non è un modulo NRC (l'NRC elenca `src/style.css`).

Screenshot: `scratchpad/shot-1280-top.png`, `shot-390-top.png`, `shot-1280-grid.png`, `shot-390-grid.png`, `shot-{1280,390}-full.png`.

### 6. Non regressione (NRC)

File modificati dal ciclo 010 (commit `ed16af8` … `855934e`): `.swhouse/cycles/current-010.md`, `_data/docs.yml`, `docs/architecture/genome-forms-review.md`. **Nessuno appartiene a un modulo dell'elenco NRC** (`src/engine/*`, `src/vendor/consilium/*`, `src/main.js`, `src/style.css`, `index.html`, `src/data/eni-ohlcv.json`, `archimate/**`, `scripts/gen-archimate.mjs`, `docs/architecture/use-case-*.md`, `_includes/use-cases/*`). **NRC Type-A: non applicabile** (nessun modulo toccato). Verifica comunque eseguita: `npm test` → 28 test, 28 passati, 0 falliti; `npm run archimate:check` → «modello "eni-replay" valido (32 elementi, 51 relazioni); file generati aggiornati». H-item (NRC-H01, H02): non attivati (nessuna UI né modello toccati).

### 7. Target di deployment (validation matrix `last_updated: 2026-10-03`)

```
Target: github-pages
Reachable by automation: NO (la build parte dal merge su main; non raggiungibile in questa sessione, il ramo è epic-genoma-non-fsm)
Verification method: workflow .github/workflows/pages.yml (build app, SVG, Jekyll, deploy) e controllo dell'Owner sulla pagina pubblicata
Status: PENDING_HUMAN
```

Comandi dopo il merge su `main` (esecutore: Owner U422756 o chi merge):
1. `gh run list --workflow pages.yml --branch main --limit 1` → esito atteso `completed success` per il commit di merge.
2. `curl -s -o /dev/null -w '%{http_code}\n' https://chaoscorelab.github.io/SwarmTrader-core/docs/architecture/genome-forms-review/` → `200`.
3. `curl -s https://chaoscorelab.github.io/SwarmTrader-core/docs/architecture/genome-forms-review/ | grep -c -E '\{\{|\{%'` → `0` (nessun Liquid grezzo) e `| grep -c 'Rassegna delle forme di genoma'` → almeno 2.
4. `curl -s https://chaoscorelab.github.io/SwarmTrader-core/docs/architecture/simulator-overview/ | grep -c 'genome-forms-review'` → almeno 1 (voce di menu).
5. Visivo: aprire la pagina a 1280 px (tabelle leggibili, griglia a 8 colonne senza sovrapposizioni) e a 390 px (aspettarsi lo scorrimento orizzontale descritto in D2 se non corretto); registrare l'esito in `## Human Verification`.
Gli altri target (`local-static-ui`, `simulation-engine`, `data-snapshot`) non sono toccati dal ciclo: nessuna voce VERIFIED, `SKIPPED_JUSTIFIED` (nessun deploy né modifica di questi componenti). Nessuna validazione locale è stata presentata come VERIFIED del target github-pages. Il ciclo resta provvisorio finché la voce è PENDING_HUMAN (Articolo 16).

### Difetti trovati

| # | Gravità | Posizione | Difetto | Correzione proposta |
|---|---|---|---|---|
| D1 | Media | Cap. 7, riga 319 («Membri richiesti») | Manca `trader` (con `getTotalValue`) tra i requisiti di `assertStrategy`; `decide()` è presentato come richiesto da `assertStrategy` ma è hook di `StrategyIndividual` | Due gruppi di membri, come nella sezione «Strategy contract» di `simulator-overview.md` |
| D2 | Media | Intero documento (13 tabelle, soprattutto cap. 8) | A 390 px la pagina scorre in orizzontale (`scrollWidth` 856); 11 tabelle sforano, la griglia 836 px (rendering approssimato) | Wrapper scorrevole per le tabelle in `assets/css/style.css`, oppure accettare e dichiararlo; confermare allo Step Pages |
| D3 | Bassa | Righe 7, 15, 21, 25, 37, 43, 61, 78, 171, 189 | AC-06: «algoritmo genetico», «fitness», «genoma», «crossover», «feedforward», «bloat», «R5/R6» usati prima di una spiegazione nel testo (solo glossario o più avanti); «look-ahead» (43→76), «IIR» (78→88), «barra» (25→76); «posizione lunga» e «costi di transazione» non spiegati né nel glossario; `m1`, `m2` non definiti (riga 221) | Una riga di spiegazione alla prima occorrenza o rimando «(glossario)»; aggiungere due voci al glossario; definire `m1`, `m2` |
| D4 | Bassa | Riga 33 (1.2) | «forma con più precedenti ... [6], [7]»: [7] accorpa GA e GP, [6] è un riassunto | Riformulare («tra le forme con precedenti, insieme a GA») o `[ipotesi]` |
| D5 | Bassa | Riga 189 (6.2) | «non hanno dato rendimento in eccesso rispetto al riferimento di mercato»: il riassunto [6] dice «not possible to make money after transaction costs» | Riportare la formulazione della pagina o citare l'articolo originale |
| D6 | Bassa | Riga 185 (6.1) | «pochi parametri limitano la capacità di adattarsi al rumore ma non la eliminano [4]»: [4] sostiene solo la seconda metà | Marcare la prima metà `[ipotesi]` |
| D7 | Bassa | Righe 34, 43, 46 | Giudizi senza `[ipotesi]` («interpretabilità ... più di una rete», «unica con etichette finite per costruzione», «nessun vantaggio visibile rispetto a B») | Aggiungere `[ipotesi]` |
| D8 | Bassa | Cap. 10, riga 371 | «URL 200 salvo dove indicato»: [15] ha dato 403 con User-Agent Chrome (200 con curl/Firefox) | Aggiungere la nota a [15] |

### Ipotesi non verificate
- La build reale di Jekyll/kramdown (resa di tabelle, titolo e menu): approssimata soltanto.
- Applicazione al trading di HMM, Kalman, reti ricorrenti e reservoir con un GA (il documento stesso dice che non c'è fonte letta); equivalenza Kalman a guadagno costante e livellamento esponenziale doppio; LCS e CART.
- I testi integrali di [6], [7], [10], [12], [13], [16] (solo abstract/scheda); [8], [9], [11], [14] letti solo in parte.
- Tutti i livelli della griglia e i conteggi di costo per barra: giudizi dell'autore, non verificabili con fonti.
- Il contenuto di [18] «letto per intero» e la citazione di [4] sulla rivista.
- L'adeguatezza al contratto resta sulla carta fino a E2.

### Verdetto
**Solution is:** partially verified (fonti, numeri e codice verificati; rendering approssimato; Pages PENDING_HUMAN).
**Recommended action:** proceed with conditions — correzioni del Builder per D1 (e a scelta D3-D8); decisione del coordinatore su D2; verifica di Pages dopo il merge (Arbiter: DEFERRED finché la voce è PENDING_HUMAN e manca la scelta di Luca, AC-07).

**Prossimo step:** correzioni del Builder se servono, poi Step 10 — LIBRARIAN

### Correzioni dopo lo Step 9 (coordinatore, 2026-10-11)

Nessun difetto Critico o Alto. Corretti nel documento tutti gli otto difetti dello Scientist; il documento passa da 8.110 a **8.426 parole** (le parole chiave in apertura e quattro voci di glossario).

| Difetto | Correzione |
|---|---|
| D1 (Media) | Capitolo 7: due gruppi di membri, quelli richiesti da `assertStrategy` (con `trader`) e quelli aggiunti da `StrategyIndividual` (`initIndicators`, `updateIndicators`, `resetIndicators`, `decide`) |
| D2 (Media) | Blocco `<style>` locale alla pagina: tabelle con scorrimento orizzontale e `overflow-wrap` per URL e testo lunghi. Nessuna modifica a `assets/css/style.css`, che la pagina del ciclo 007 (NRC-H02) condivide |
| D3 | Paragrafo «Parole chiave» in apertura; `m1` e `m2` definiti; glossario con Bloat, Costi di transazione, Feedforward, Posizione lunga |
| D4, D5 | Riformulate secondo ciò che le fonti [6] e [7] sostengono |
| D6, D7 | Aggiunto `[ipotesi]` ai giudizi senza fonte |
| D8 | Nota su [15]: 403 con User-Agent di browser, 200 con `curl` |

**Verifica dopo le correzioni** (rendering approssimato Markdown → HTML con il CSS del sito, Chromium): a 390 px lo scorrimento della pagina è sparito (`scrollWidth` 390 contro 747 prima; 11 tabelle su 13 scorrono al loro interno), a 1280 px nessuno scorrimento, nessun errore in console. Lo scorrimento a 747 px era dovuto anche agli URL lunghi nei riferimenti, non solo alle tabelle. `npm test` 28/28, `archimate:check` valido, nessuna occorrenza Liquid.
**Rischio residuo:** il blocco `<style>` in Markdown (kramdown) e il rendering reale vanno visti sul sito dopo il merge su `main` (PENDING_HUMAN, voce `github-pages` dello Step 9). Se Jekyll rimuovesse lo stile, il documento resta leggibile a schermo largo.

## Step 10 — LIBRARIAN: Update Memory

**Agent:** claude-sonnet-5-5 (subagent)

**Stato del ciclo:** la scelta della forma è di Luca e **non è fatta**; nessuna voce di memoria la registra. I candidati A e B sono proposte del documento. Il ciclo resta DEFERRED fino alla scelta (AC-07) e alla verifica di Pages.

### Voci aggiunte (7)

| Voce | Tipo | Perché ha valore durevole |
|---|---|---|
| `knowledge/consilium-iir-filter-orientation.md` | knowledge | Il coefficiente `c` pesa il dato nuovo (`ema = ema*(1-c) + x*c`), con i quattro valori del genoma fisso e le costanti di tempo; margini proporzionali al filtro. Serve a R2, R3 e a chi legge il genoma; evita di ripetere l'inversione dello Step 4 |
| `knowledge/genome-forms-state-memory.md` | knowledge | Da dove viene la memoria in ogni forma («a monte» / «nel lettore»), l'HMM come macchina a stati probabilistica e il rischio di anticipazione nella stima, le varianti «solo indicatori» / «con memoria interna» con la **domanda 2 ancora aperta**, le convenzioni concorrenti nel crossover, `labels` continue. Rimanda al documento per i dettagli; dichiara che la scelta non è fatta |
| `errors/2026-10-11-iir-formula-inverted-coefficient.md` | errors | La formula con il ruolo di `c` invertito (Step 4, scoperta dal Critic leggendo il codice) più il difetto D1 dello Step 9 (elenco dei membri del contratto non coerente con `assertStrategy`): stessa lezione, verificare sul codice prima di usare una formula o un elenco come cornice. Voce ricostruita dal file di ciclo |
| `patterns/independent-verification-chain-research.md` | patterns | Catena Explorer → Critic (fonti sul testo e formule sul codice) → Builder (fonti prima di scrivere, stato letta/scheda) → Scientist (riverifica) → coordinatore (correzioni e controlli ripetuti), con ciò che ogni livello ha intercettato nel ciclo 010. Riutilizzabile da R2–R6 |
| `patterns/approximate-jekyll-render-without-ruby.md` | patterns | Ricetta del rendering approssimato (Markdown → HTML con Python, CSS del sito, Chromium via Playwright a 1280 e 390 px, misura di `scrollWidth`) e i suoi limiti (non è kramdown; Liquid non elaborato). Gli script erano nello scratchpad e non sono nel repository |
| `decisions/2026-10-11-research-document-conventions.md` | decisions | Convenzioni dei documenti di ricerca: italiano, matematica intermedia, termini di finanza alla prima occorrenza con glossario, sintesi in apertura, nessuna promessa di redditività, fonte o `[ipotesi]` per ogni affermazione, lunghezza oltre il criterio accettata da Luca, scelta lasciata all'operatore. Confidence Medium: distingue ciò che l'operatore ha detto esplicitamente da ciò che viene dai criteri del ciclo |
| `decisions/2026-10-11-non-fsm-requirement-reading.md` | decisions | Risposta dell'operatore alla domanda 1: il requisito «non una macchina a stati» non è stringente; HMM e reti ricorrenti ammessi come forme da valutare. La domanda 2 è dichiarata ancora aperta. Non registra la scelta della forma |

### Voci aggiornate (3)

- `decisions/2026-10-11-parallel-cycle-exception.md`: sezione «Extension (cycle 010)» (terzo ciclo aperto, `current-010.md`, stesse condizioni sullo Step 12 e sui file di stato, il 009 si chiude prima del 010, il 010 tocca `docs/`, `_data/docs.yml` e `.swhouse/`); le sessioni sul branch leggono `current-009.md` e `current-010.md`. Aggiunto `updated:`.
- `decisions/2026-10-11-strategy-contract.md`: due punti nelle conseguenze: `assertStrategy` non richiede `crossover` e `mutate` ma il GA di Consilium li chiama (`ga.js` 116-125, 345-351), da trattare in R3 ed E2; l'adeguatezza del contratto è stata riesaminata sulla carta per sei forme (le uscite continue richiedono `labels` derivate; solo l'HMM ha etichette naturali). Confidence invariata (Medium). Aggiunto `updated:`.
- `patterns/jekyll-stakeholder-docs.md`: sezione «Wide tables and long URLs» con lo stile locale alla pagina (tabelle con scorrimento interno, `overflow-wrap`), il motivo per cui non si tocca `assets/css/style.css` (condiviso con la pagina del ciclo 007, NRC-H02 pendente), il rischio non verificato su kramdown, e il promemoria del controllo Liquid. Aggiunto `updated:`.

### Collegamenti
Ciclo 010 ↔ ciclo 009 (contratto di strategia: `strategy-contract`, `consilium-trader-order-timing`), epica #4 (nelle voci `non-fsm-requirement-reading`, `research-document-conventions`), ciclo 007 (condizione sul CSS condiviso e sull'eccezione al ciclo singolo). Le nuove voci si richiamano con `[[nome]]`: `consilium-iir-filter-orientation` ↔ `genome-forms-state-memory` ↔ `iir-formula-inverted-coefficient` ↔ `independent-verification-chain-research` ↔ `research-document-conventions`; `approximate-jekyll-render-without-ruby` ↔ `jekyll-stakeholder-docs`.

### Voci scartate (e perché)
- **Voce a sé sul fatto che il GA chiama `crossover`/`mutate`:** già nel capitolo 7 del documento e ora nelle conseguenze di `strategy-contract`, dove E2 la cerca; una voce `knowledge` separata sarebbe un duplicato.
- **Voce sulla scelta dei candidati A/B, sulla forma minima o sul confronto tra forme:** è il contenuto del documento di ricerca e non è deciso; copiarlo violerebbe il vincolo di non duplicare e di non presentare come deciso ciò che è proposto.
- **Errori sulle fonti non sostenute (Fraunhofer, F5, F6, F7, F8) come voci separate:** sono l'esito della catena di verifica, già in `independent-verification-chain-research`; ogni correzione sta nel file di ciclo (Step 5 e 7).
- **Errori minori** (cifra 102,22 → 102,21 nell'esempio IIR, rimandi «capitolo 7.1» ambigui, scorrimento a 390 px): corretti nel ciclo, coperti dal pattern di rendering e dal pattern della catena; non servono come voci distinte.
- **Decisione sull'accettazione della lunghezza come voce propria:** accorpata in `research-document-conventions`.
- **Voce sull'esperimento di controllo su serie nulle (Alt. 3):** è una domanda aperta (domanda 5) e nessun ciclo l'ha adottata; resta nel documento (1.4) e nelle domande a Luca.

### Cosa è ora riutilizzabile
Per R2–R6 ed E2: l'orientamento di `c` e i valori reali; la tabella delle classi di memoria e le questioni aperte (domanda 2); il contratto con `crossover`/`mutate`; le convenzioni dei documenti di ricerca; la catena di verifica; la ricetta del rendering approssimato e lo stile locale per tabelle larghe.

### Controllo di decadimento della validation matrix
`validation_matrix.md`: `last_updated: 2026-10-03` (chiusura del ciclo 008, commit `45b241d`). Cicli aperti da allora: 007 (aperto su `main`), 009 e questo 010 → **3 cicli**, entro il limite di 10. Nessun controllo di correttezza dei target oltre il normale; i target sono invariati e lo Step 9 ha riletto la voce `github-pages`.

### Esito dell'aggiornamento della validation matrix
**Nessuna modifica necessaria:** il ciclo non aggiunge, rimuove né modifica target di deploy, credenziali o procedure di verifica. La voce `github-pages` resta «first deploy PENDING_HUMAN»; i cinque comandi di verifica della pagina `genome-forms-review` (Step 9, sezione 7) sono nel file di ciclo e non entrano nella matrice, perché non sono una procedura nuova del target.

### NRC H-item
- **H-item eseguiti in questo ciclo:** nessuno (nessun modulo NRC toccato, controllo dello Step 9 sezione 6; NRC-H01 e NRC-H02 non attivati; nessuna sessione di validazione). Nessuno stato da aggiornare.
- **Bug segnalati da un umano e corretti in questo ciclo:** nessuno (ricerca senza codice; i difetti D1–D8 li ha trovati lo Scientist, non una persona). L'articolo 25 non richiede quindi nuove voci.
- **Proposta facoltativa per lo Step 12** (decisione del coordinatore, non obbligatoria): una voce H per la pagina del documento, dato che il rendering reale non è stato visto:
  `| NRC-H03 | H | `docs/architecture/genome-forms-review.md` (stile locale alla pagina) | Dopo il merge su `main` aprire la pagina pubblicata a 1280 e a 390 px: le tabelle scorrono dentro il proprio riquadro, la pagina non scorre in orizzontale, il blocco di stile non compare come testo, voce di menu presente | L'esecutore conferma ogni punto; esito nel file di ciclo | cycle 010 |`
  Se il coordinatore preferisce registrare la verifica solo come `## Human Verification` del ciclo, non serve alcuna voce.

### Da applicare allo Step 12 (dopo il 009 e la chiusura del 007)
1. `.swhouse/metrics/summary.yaml`:
   - `last_updated` alla data dello Step 12; `total_cycles` e `cycles_by_status` secondo l'esito dell'Arbiter (stato atteso del 010: deferred);
   - `memory_entries` **dopo il 009 e il 010 insieme**: `decisions: 7`, `patterns: 6`, `errors: 5`, `knowledge: 4`. Il file oggi dice 3/4/3/1 e non include le voci del 009 (2 decisioni, 1 errore, 1 conoscenza, già nelle cartelle): per il solo 010 le aggiunte sono +2 decisioni, +2 patterns, +1 errore, +2 knowledge; le cartelle contano oggi 5/4/4/2 prima delle mie voci;
   - riga di commento: `# Cycle 010: Track M, research R1 genome forms review (issue #5), DEFERRED <data>: PENDING_HUMAN = choice of the form by Luca (AC-07) and Pages build after merge to main.`
2. `.swhouse/reputation/scores.yaml`: aggiungere, dopo lo Step 11, `- cycle: "010"` con `score` assegnato dall'Evolution Master e `source: cycles/archive/cycle-010.md#step-11--evolution-master`; `last_updated` alla data dello Step 12.
3. `.swhouse/memory/validation/non_regression_checklist.md`: nessuna modifica obbligatoria; facoltativa la riga NRC-H03 sopra (insieme al NRC-A06 proposto dal 009); aggiornare `last_updated` solo se si aggiunge una riga.
4. `docs/MAP.md`: nella tabella principale aggiungere, dopo `architecture/simulator-overview.md`, la riga
   `| architecture/genome-forms-review.md | architecture | Italian research review of alternative genome forms (linear score, GP, rule list, MLP/NEAT, fuzzy, HMM) against the strategy contract; candidates and open questions for Luca (cycle 010, issue #5) | 2026-10-11 |`
   e impostare `last_verified` (intestazione e riga `last_verified:` nel corpo) alla data di applicazione. La riga `simulator-overview.md` va aggiornata dal 009 (data e contratto di strategia). La riga della checklist per `_data/docs.yml` non serve (non è un documento).
5. `.swhouse/memory/validation/validation_matrix.md`: nessuna modifica; `last_updated` può restare 2026-10-03.
6. Dopo il merge su `main`: eseguire i cinque comandi dello Step 9 (sezione 7) e registrare l'esito nel blocco `## Human Verification` insieme alla scelta di Luca; verificare in particolare che il blocco `<style>` locale non sia stato rimosso da kramdown.

**File toccati dal Librarian:** 7 nuovi file in `.swhouse/memory/{decisions,patterns,errors,knowledge}/`, 3 voci aggiornate (`parallel-cycle-exception`, `strategy-contract`, `jekyll-stakeholder-docs`) e questo file. Nessun file condiviso, `src/`, `docs/`, `_data/` modificato. Nota: l'incarico citava un controllo a campione del coordinatore tra i livelli della catena; nel file di ciclo è registrata la sola applicazione delle correzioni con controlli ripetuti, e il pattern descrive questo.

**Prossimo step:** Step 11 — EVOLUTION MASTER

## Revisione richiesta dall'operatore (2026-10-14)

**Feedback di Luca:** ha letto il documento e ne ha capito «poco o niente»: non riesce a scegliere su quella base. **Rimuove il vincolo di dimensione** (la riserva su AC-06 viene chiusa in questo senso) e chiede di **estendere il documento** per renderlo più esaustivo e comprensibile anche a chi non ha competenze finanziarie: spiegazioni approfondite con esempi concreti e, **per ogni approccio, un esempio di applicazione al nostro problema**, semplice e con semplificazioni dichiarate, che mostri come l'approccio sarebbe applicato e come funzionerebbe. **Deve nascere un elaborato nuovo**, senza eliminare quello attuale, così da poter consultare entrambi.

**Stato del ciclo:** Steps 1–10 completi sul documento attuale; Step 11 e 12 **sospesi** finché Luca non rilegge l'elaborato nuovo. Il ciclo 007 è nel frattempo chiuso e unito, quindi lo Step 12 non dipende più da Simone, ma solo dalla scelta di Luca (AC-07) e dalla verifica di Pages.

**Nuovi criteri di accettazione (si aggiungono a quelli dello Step 2; AC-06 è sostituito da AC-10)**
- AC-10 **Comprensibilità da zero.** Il lettore è uno sviluppatore senza competenze finanziarie né di apprendimento automatico: ogni termine è spiegato nel capitolo in cui compare, con un esempio; nessun vincolo di lunghezza.
- AC-11 **Un esempio applicato per approccio.** Per ciascuna forma (macchina a stati attuale, punteggio lineare, alberi/GP, lista di regole, reti MLP/NEAT, fuzzy, HMM) un esempio semplice sul nostro problema (decidere buy/sell/hold ogni giorno), con tabella giorno per giorno, esito e commento, e un esempio di mutazione e crossover.
- AC-12 **Stesso banco di prova.** Tutti gli esempi usano lo stesso dataset inventato di 20 giorni e lo stesso valutatore, così sono confrontabili; i numeri sono generati da script, le semplificazioni dichiarate, e il testo dice che i valori sono inventati e non provano nulla sulla qualità degli approcci.
- AC-13 **Elaborato nuovo, il vecchio intatto.** `docs/architecture/genome-forms-review.md` non si modifica; il nuovo documento è un file a parte con voce di menu propria.
- AC-14 **Prova di lettura.** Un lettore simulato senza competenze finanziarie legge il documento e segnala ciò che non si capisce; le segnalazioni si correggono prima di riconsegnarlo a Luca.

**Piano di coordinamento** (sub-agent, il coordinatore integra): (1) banco di prova comune e guida di stile; (2) nove capitoli in parallelo: introduzione e indicatori, algoritmo genetico e valutazione, FSM attuale, punteggio lineare, alberi/GP, lista di regole, reti, fuzzy, HMM; (3) un integratore compone il documento, aggiunge la guida alla scelta, il glossario esteso e i riferimenti; (4) due revisori indipendenti, uno di numeri e fonti, uno di leggibilità (lettore senza competenze); (5) correzioni, pubblicazione come nuovo artefatto, riconsegna a Luca.

### Integrazione della guida (sub-agent, 2026-10-14)

**File prodotto:** `docs/architecture/genome-forms-guide.md` (nuovo; 3688 righe, circa 63150 parole; titolo «Guida alle forme di genoma», voce propria in `_data/docs.yml`, `id: genome-forms-guide`). Il documento `docs/architecture/genome-forms-review.md` non è stato toccato (AC-13).

**Struttura finale e parole.** Premessa (circa 570 parole, con avvertenza sui numeri inventati e percorso rapido); «In breve» (circa 850); 1. Il problema e gli strumenti di base (6100); 2. L'algoritmo genetico e la valutazione (5800); 3. La macchina a stati attuale (6100); 4. Il punteggio lineare (6600); 5. Alberi e programmazione genetica (6000); 6. La lista di regole (4500); 7. Le reti neurali (8000); 8. La logica fuzzy (5700); 9. Il modello a stati nascosti (5400); 10. Confronto e guida alla scelta (4300); Glossario (2350, 115 voci); Riferimenti (820). Sezioni numerate `N.k` e sottosezioni `N.k.j`; titoli paralleli nei capitoli 3-9 (In una frase e un'analogia; Come funziona; Esempio applicato al dataset giocattolo; Come evolve; Cosa ricorda del passato; Punti di forza e debolezze; Come si integra nel nostro motore; Cosa dice la letteratura; In breve), con le sezioni specifiche di ciascuna forma in più (per esempio forma minima e osservatore di Kalman nel capitolo 4, NEAT nel capitolo 7). Metodo: i capitoli sono stati assemblati con script (`work/integrazione/chapters.py` e `assemble.py`, nello scratchpad), poi corretti con sostituzioni mirate; nessun capitolo è stato riscritto a mano.

**Scritto di nuovo.**
- Premessa (rapporto con la rassegna, avvertenza in evidenza, convenzioni, percorso rapido) e sezione «In breve».
- Capitolo 10: (10.1) tabella di confronto delle sette forme in parole; (10.2) che cosa usa ciascun esempio; (10.3) griglia giorno per giorno con le decisioni dei sette esempi sui 20 giorni, tabella delle operazioni e dei valori finali, avvertenza «non è una classifica» e letture solo descrittive; (10.4) le domande 1-5 in linguaggio semplice, ciascuna con che cosa cambia scegliendo l'una o l'altra risposta e, per le domande 2-5, una opzione prudente di default dichiarata suggerimento e non decisione; (10.5) candidati A e B con condizioni di scarto e tabella delle conseguenze per R2-R6 ed E2 (scegliere A, B o entrambi; ragionamento dell'autore, marcato `[ipotesi]`); (10.6) che cosa non si è potuto accertare.
- Glossario esteso (da tutte le note degli autori e dal glossario della rassegna); Riferimenti [1]-[18] con la stessa numerazione e lo stesso stato di verifica della rassegna.
- Sezioni brevi nei capitoli: 1.3.6 (tabella dei nomi degli ingressi `x1`, `x2`, `x3`, `D`, `R`, `P`, `F`, `S`, ...); nel capitolo 5 una voce sull'evoluzione grammaticale [16]; nel capitolo 6 le sezioni «Come si integra nel nostro motore» e «Cosa dice la letteratura» (ricavate da paragrafi esistenti); nei capitoli 5 e 7 alcune sezioni promosse a titolo di sezione per rendere parallela la struttura.

**Correzioni e incoerenze risolte.**
1. Rimandi interni: tutta la numerazione è stata rimappata (sezioni e sottosezioni) con uno script; rimandi per numero a capitoli del documento vecchio sostituiti da nomi di sezione, con il documento vecchio linkato una volta nella premessa (`../genome-forms-review/`); tutte le locuzioni «documento esistente / di revisione / di rassegna» sono diventate «la rassegna».
2. Capitolo 1: il rapporto del volume era calcolato con una media semplice a 5 giorni (giorno 12: 1,38) mentre i capitoli 4-9 usano una EMA con c = 0,2 (giorno 12: 1,36). Allineato alla EMA e rigenerata la tabella; aggiunta la tabella dei nomi degli ingressi.
3. Capitolo 3: il testo dava i valori del filtro (109,84 e 107,38) «dopo 7 giorni»; ricalcolati, sono i valori dopo 6 giorni. Corretta la dicitura, i numeri sono invariati.
4. Capitolo 7: rimando sbagliato alla sezione 3.4 invece della 3.5 (la parte sul perché una rete fa ciò che un punteggio lineare non fa). Corretto.
5. LCS (capitolo 6): la forza appresa è tipica di Michigan, non di Pittsburgh. Verificato che nessun altro capitolo la attribuisca a Pittsburgh; tolto dal paragrafo su Pittsburgh un «confronto di forza» che poteva riproporre l'errore; titolo della sezione riformulato.
6. RSI, stocastico, ATR e massimi/minimi (capitolo 1): marcati `[ipotesi, fonte da verificare]`; tolte le soglie 30/70 dell'RSI.
7. Stime di costo: «circa 25 operazioni al giorno» (HMM), «qualche decina di operazioni» (macchina a stati) e i conteggi della rete marcati come conteggi a mano non misurati, `[ipotesi]`; stima del fuzzy ugualmente marcata.
8. Tono: eliminata la frase «una forma più ricca deve giustificare perché fa meglio» (capitolo 4) in favore di «ciò che aggiunge»; riscritta una lettura della griglia che affermava «ogni mutazione cambia decisioni» (alcune sono neutre); nessuna cifra di rendimento reale presente.
9. Stile e forma: tolte le prime persone singolari (ho, mio, non so), i percorsi locali (`/home/luca/...`, `work/.../calc.py`, `toy.py`), i riferimenti alle «Note per l'integratore» e al «brief»; decimali con la virgola nelle tabelle dei capitoli 6 e 8 (erano con il punto), «si» accentato nelle tabelle; `buy&hold;` riformulato per non creare un'entità HTML. Nessun HTML tranne il blocco di stile, nessun `{{` o `{%`.

**Discrepanze rimaste (dichiarate nel testo).**
- Gli esempi usano notazioni diverse per gli stessi ingressi (`x1`, `D`, `P` e `S`, `prezzo` e `media_lenta`): non unificate, ma spiegate nella sezione 1.3.6.
- Il capitolo 3 usa solo le due EMA del prezzo e il capitolo 9 solo la variazione giornaliera del prezzo (il volume non entra); dichiarato anche nella sezione 10.2.
- Conteggi dei parametri diversi per la stessa forma: fuzzy 15 numeri e 5 scelte (esempio) contro 42-54 (6 ingressi); HMM 14 (3 simboli) contro circa 44 (rassegna, osservazioni continue); sono dichiarati e spiegati nei capitoli.
- Alcune coppie di esempi producono le stesse operazioni (macchina a stati e lista di regole; rete e fuzzy) con decisioni diverse in alcuni giorni: segnalato nelle letture del capitolo 10.
- Dettagli del genoma attuale non chiariti (cablaggio dello stato SW, raggiungibilità dei coefficienti IIR 0,73 e 0,99 con la sola mutazione, chiavi della mutazione «raw», comportamento del `Trader` con `buy` a posizione già aperta, significato di `success_rate`): elencati in 10.6.

**Verifica a campione dei numeri.** 76 controlli ricalcolati in modo indipendente dagli script dei capitoli (con `toy.py` e, per i conteggi del genoma attuale, con Node su `FIXED_GENOME`): 40 in `work/integrazione/grid.py` (valore finale di ogni esempio e delle sue mutazioni e dei suoi crossover, un valore intermedio per forma, credenza HMM, uscite fuzzy, `y` della rete) e 36 in `work/integrazione/verify2.py` (regola «che bara», EMA del giorno 20, massimo calo, CAGR annualizzato, medie delle popolazioni, conteggi 9/36/135/7/2, normalizzazione, figli e mutazioni degli alberi, liste e HMM Viterbi, conteggi di pesi e parametri). Esito: tutti coincidenti con il testo, tranne il caso del punto 3 sopra (dicitura «7 giorni» errata). In più: le decisioni giorno per giorno delle sette tabelle dei capitoli (140 celle) coincidono con la griglia del capitolo 10, e i nove script dei capitoli sono stati rieseguiti (tutti terminano senza errori). Non sono stati ricalcolati in modo indipendente gli esperimenti con seme casuale del capitolo 2 (convergenza, overfitting): per questi si è rieseguito lo script del capitolo e confrontato il suo output con il testo (tabella di convergenza e valori dell'esperimento 1-12 / 13-20 coincidono).

**Fonti nuove.** Nessuna: nessun autore ne ha indicate; non esistono voci da [19] in poi. LCS (Urbanowicz e Moore) e CART restano non verificate; il lavoro di Fogel citato nel capitolo 3 come `[ipotesi]` non è stato cercato né letto. Tutte e 18 le fonti della rassegna sono citate nel testo.

**Che cosa resta aperto.**
- AC-14: la prova di lettura (lettore simulato senza competenze finanziarie) e il controllo indipendente di numeri e fonti non sono ancora stati eseguiti; le segnalazioni vanno corrette prima della consegna a Luca.
- Pubblicazione come nuovo artefatto e verifica del rendering su Pages (la guida non è stata costruita con Jekyll in locale in questa fase).
- Le domande 2-5 restano a Luca (la 2 è ancora aperta); le opzioni di default del capitolo 10 sono suggerimenti.
- `docs/MAP.md` non è stato modificato (vincolo del compito): quando il ciclo si chiude va aggiunta la riga della guida, come già previsto per la rassegna.
- Gli script di lavoro restano nello scratchpad e non sono nel repository; il testo lo dichiara nella premessa.

## Esito della revisione richiesta dall'operatore (2026-10-15)

- Guida estesa `docs/architecture/genome-forms-guide.md` (~75.000 parole) completata: due giri di lettori simulati e verificatori indipendenti (ricalcolo numerico ~1250 valori, 0 differenze sostanziali), poi un ultimo giro di correzioni mirate (Q1/Q2 chiarite, condizioni 12/13 misurate su dati ENI reali, rinomine, percorsi ch.10 bilanciati, terza via con nome unico).
- Controlli: nessun Liquid, 96 recinti pari, `npm test` verde, `archimate:check` valido; modificata solo la guida. La rassegna compatta resta invariata.
- Residui cosmetici: collisione etichette R, doppio senso di "azione" nel cap. 3, nomi P1/P2 nel cap. 6; fonti web e rendering Jekyll non verificati.
- Steps 11 e 12 restano sospesi in attesa di revisione e risposte di Luca (Q2–Q5, scelta candidati).

## Risposta dell'operatore alla Q2 (2026-10-18, commento sull'artefatto)

- Q2 (dove sta la memoria dentro la forma scelta): **solo negli indicatori**. Esclusi: variabili aggiuntive portate dal genoma e stato del portafoglio fornito dal motore (coerente col commento del 2026-10-15: il genoma non porta informazioni «ambientali»).
- Conseguenza: la «terza via» (cap. 5.5.3-bis) e le reti ricorrenti con stato libero non sono ammesse; restano valide le forme con memoria negli indicatori (EMA e simili). Da riportare nel blocco Human Verification (AC-07) con Q3–Q5 ancora aperte.

## Risposta dell'operatore alla Q3 (2026-10-18, commento sull'artefatto)

- Q3 (interpretabilità vs espressività): chi decide deve poter **intuire** le decisioni del genoma, anche senza calcolarle banalmente. Lo sforzo dedicato all'interpretabilità in R4 va tenuto **bilanciato**: è solo uno degli elementi della ricerca, non un vincolo dominante. Quindi niente esclusione di forme per scarsa leggibilità, purché la decisione sia spiegabile a grandi linee.
- Aperte: Q4, Q5, scelta candidati.

## Risposta dell'operatore alla Q4 (2026-10-18, commento sull'artefatto)

- Q4 (una forma o due): **si parte con una sola forma** (Percorso 1). Quale forma resta da scegliere tra i candidati; Q5 (esperimento nullo) ancora aperta.

## Risposta dell'operatore alla Q5 (2026-10-18, commento sull'artefatto)

- Q5 (esperimento nullo, quanto ogni forma si adatta al rumore): sì, va tenuto in considerazione, con riferimento a quanto documentato in 2.6.5 (tre insiemi di dati separati: addestramento, validazione, prova). Il disegno dettagliato dell'esperimento nullo è lasciato a R6.
- Restano da decidere: quale forma (con memoria solo negli indicatori, Q2; decisioni intuibili ma effort bilanciato, Q3; una sola forma, Q4). Poi Steps 11–12.
