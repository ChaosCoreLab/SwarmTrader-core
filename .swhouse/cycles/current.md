---
cycle: 011
status: open
opened: 2026-10-18
problem: "Non è noto quali indicatori finanziari, calcolabili in streaming da prezzi e volumi giornalieri, il genoma a punteggio lineare può usare come ingressi e come unica fonte di memoria del passato: serve un catalogo ragionato di ammessi ed esclusi (issue #6, epica #4)"
track: M
---

## Step 1 — COORDINATOR: Open the Problem

**Agent:** claude-opus-5-5
**Instance:** ubuntu-workstation (operator: Luca)
**Issue:** [#6 R2](https://github.com/ChaosCoreLab/SwarmTrader-core/issues/6), epica [#4](https://github.com/ChaosCoreLab/SwarmTrader-core/issues/4). Repository di lavoro: SwarmTrader-core, branch `epic-genoma-non-fsm` (riallineata a `main` dopo il merge della PR #18).
**Track:** M — ricerca con una decisione da prendere (quali indicatori ammettere) e nessun codice di prodotto. **Step 4 (Explorer) incluso:** il catalogo minimo dell'issue è un punto di partenza; l'Explorer cerca indicatori e trasformazioni che l'elenco non prevede (volatilità, rapporti normalizzati, velocità diverse di EMA, indicatori di volume). **Step 6 (Destroyer) omesso:** nessun input esterno né superficie d'attacco; anticipazione dei dati (look-ahead) e instabilità numerica le esamina il Critic allo Step 5 per ogni indicatore.
**Cicli in parallelo:** nessuno. I cicli 007, 008, 009 e 010 sono chiusi e uniti in `main` (PR #18, approvata da Simone); l'eccezione sul ciclo parallelo non serve più e il ciclo vive in `current.md`. Numerazione: l'ultimo ciclo in `main` è il 010, quindi il prossimo è l'011.
**Stato precedente:** il ciclo 009 e il ciclo 010 restano DEFERRED fino alla verifica di Pages (NRC-H03); il workflow di deploy sul merge è verde, ma la verifica visiva è umana.

**Problem statement**
Il ciclo 010 ha fissato la forma del nuovo genoma: **punteggio lineare di indicatori con soglie**, con la memoria del passato **solo negli indicatori** (nessuna variabile portata dal genoma, nessuno stato del portafoglio fornito dal motore), e una sola forma per cominciare (`memory/decisions/2026-10-18-genome-form-linear-score.md`). In una forma lineare l'espressività sta tutta nella scelta degli ingressi: due ingressi che non esistono non possono essere combinati. Il genoma attuale usa solo quattro filtri IIR (medie esponenziali su prezzo e volume) e confronti con margini (`src/vendor/consilium/algorithm.js`). Non è noto quali altri indicatori siano calcolabili in modo incrementale, con stato limitato e senza anticipare il futuro, quali siano adatti a un punteggio lineare (scala, normalizzazione) e quali siano ridondanti con le medie esponenziali già presenti.

**Why now**
È il prossimo passo della catena: R3 (codifica genetica), R4 (equazioni di decisione) ed E2 (implementazione) dipendono dall'elenco degli ingressi. La scelta di Luca sulla memoria solo negli indicatori rende questo elenco la parte che decide quanto il genoma «ricorda».

**Scope — IN**
- Catalogo con almeno EMA/SMA, MACD, RSI, Bande di Bollinger, ATR, ROC, stocastico, OBV, CMF; più gli indicatori emersi dallo Step 4.
- Per ciascuno: formula, aggiornamento incrementale in tempo costante, stato da conservare, periodo di warm-up, campi OHLCV usati.
- Relazione con i quattro filtri IIR presenti (equivalenza con medie esponenziali, costanti di tempo).
- Adeguatezza di ciascun indicatore a un punteggio lineare: scala, normalizzazione, dimensionalità, correlazione con gli altri.
- Esito: elenco ragionato degli indicatori ammessi al genoma e di quelli esclusi, con motivazione, da portare a Luca.

**Scope — OUT**
- La codifica genetica (R3), le equazioni di decisione (R4), la fitness (R5), il protocollo di valutazione (R6): R2 ne usa solo ciò che serve a giudicare gli indicatori.
- Qualsiasi codice in `src/`, `tests/`, `scripts/`; prove su dati salvo piccoli calcoli di esempio dichiarati come tali.
- La scelta finale dell'elenco: è di Luca (criterio di accettazione dell'issue).

**Estimated complexity:** Medium (conoscenza ampia da sintetizzare e tracciare; formule da verificare sul codice e su un dataset di esempio).

**Lezioni da applicare (ciclo 010)**
- Il lettore è Luca, senza competenze finanziarie: lo Step 2 dichiara il profilo del lettore e include come criterio di accettazione una **lettura simulata** prima della consegna (proposta dell'Evolution Master del ciclo 010).
- Italiano, matematica intermedia, termini di finanza spiegati alla prima occorrenza, esempio numerico per indicatore, fonte o `[ipotesi]` per ogni affermazione (`decisions/2026-10-11-research-document-conventions`).
- Orientamento dei coefficienti IIR verificato sul codice, non sul ricordo (`errors/2026-10-11-iir-formula-inverted-coefficient`, `knowledge/consilium-iir-filter-orientation`).
- Catena di verifica indipendente (`patterns/independent-verification-chain-research`); script di lavoro in cartella persistente fuori da `/tmp`.
- Il documento può essere commentato da Luca e Simone sull'artefatto: le risposte si registrano nel file del ciclo.

**Context check**
- Memory lookup: `decisions/2026-10-18-genome-form-linear-score`, `decisions/2026-10-11-strategy-contract` (indicatori: `initIndicators`, `updateIndicators`, `resetIndicators`), `knowledge/consilium-iir-filter-orientation`, `knowledge/genome-forms-state-memory`, `decisions/2026-10-11-research-document-conventions`, `patterns/jekyll-stakeholder-docs`, `patterns/independent-verification-chain-research`. La guida `docs/architecture/genome-forms-guide.md` (ch. 1 e 4) spiega già EMA, rapporti di volume e punteggio lineare: R2 la estende, non la ripete.
- Validation matrix: nessun deploy nuovo; il documento va pubblicato su Pages (verifica umana dopo il merge, come NRC-H03).
- NRC H-item check: nessun H-item attivato dal contenuto; il nuovo documento in `docs/` si aggiunge alla verifica di NRC-H03 se lo stile locale alla pagina è lo stesso. Nessun modulo NRC (`src/engine/*`, `src/vendor/consilium/*`, `src/main.js`, `src/style.css`, `index.html`, `archimate/**`) è toccato.
- Domande aperte per Luca (da porre allo Step 2): (1) l'elenco finale è un insieme di ingressi o anche famiglie parametrizzate (ad es. EMA a velocità evolvibile)? (2) quanti ingressi al massimo, per tenere il punteggio leggibile (Q3 del ciclo 010: decisioni intuibili)?
- Fonti: Step 2 stabilisce quelle ammesse (letteratura, documentazione di librerie, codice di Consilium); ogni affermazione riporta la sua fonte.

**Esecuzione:** gli Step 2–11 sono assegnati a sub-agent quando l'operatore lo chiede; lo Step 12 aspetta la scelta di Luca (AC dell'issue). Il track, gli step omessi e lo stato si riportano a commento di #6.

**Prossimo step:** Step 2 — PRODUCT OWNER

### Risposte dell'operatore alle domande dello Step 1 (2026-10-18)

1. **Famiglie con parametri evolvibili: ammesse.** L'elenco può contenere indicatori con parametri (ad es. la velocità di una EMA) che il genoma porta come geni e l'algoritmo genetico fa evolvere, oltre agli ingressi fissi.
2. **Limite di ingressi: 10**, superabile fino a **12 se strategico** (con motivazione esplicita nel documento). Per «ingressi» si intendono i termini della somma pesata del punteggio lineare.
Da portare allo Step 2 come vincoli del criterio di accettazione; il catalogo può restare più ampio dell'elenco ammesso.

## Step 2 — PRODUCT OWNER: Define the Value

**Agent:** claude-opus-5-5
**Confidence:** Medium-High (problema e vincoli chiari dallo Step 1 e dalle risposte di Luca; il valore dipende da quanto R3, R4 ed E2 useranno davvero l'elenco senza riaprirlo).

**Chi ha il problema:** Luca (e Simone come revisore della PR), che deve scegliere gli ingressi del punteggio lineare prima di R3 (codifica), R4 (equazioni) ed E2 (implementazione); in seconda battuta chi scriverà E2, che implementa gli indicatori ammessi attraverso il contratto di strategia (`initIndicators`, `updateIndicators`, `resetIndicators`; `memory/decisions/2026-10-11-strategy-contract`).

**Profilo del lettore (lezione del ciclo 010, Step 11, proposta 1).** Il lettore che decide è Luca: sviluppatore con formazione tecnico-scientifica, **senza competenze finanziarie**. Il documento deve permettergli di scegliere leggendo il riassunto iniziale e la tabella degli ammessi/esclusi; le schede sono consultazione.

**Valore misurabile**
- Dopo il ciclo esiste un **elenco ammessi/esclusi** con motivazione per ogni voce, dentro il limite di 10 ingressi (12 se motivato), invece di un insieme di ingressi scelto per abitudine.
- Ogni indicatore del catalogo è descritto con le **stesse voci** (AC-02), così ammissione ed esclusione si discutono su evidenze confrontabili.
- Il legame con i quattro filtri IIR attuali è esplicito: si sa quali indicatori proposti sono già «coperti» da una EMA e quali portano informazione nuova (volatilità, escursione nel giorno, volume con segno).
- R3 sa quali parametri diventano geni (famiglie parametrizzate ammesse) e quanti termini ha la somma; E2 sa che cosa implementare e con quale stato.

**Costo del non farlo:** in una forma lineare l'espressività sta tutta negli ingressi (`decisions/2026-10-18-genome-form-linear-score`). Scegliere ingressi ridondanti (più medie che dicono la stessa cosa), su scale non confrontabili (prezzi in euro accanto a volumi in milioni) o che anticipano il futuro produrrebbe un genoma che evolve male o che sembra funzionare per un errore di calcolo; lo si scoprirebbe solo dopo E2, con il codice scritto. Inoltre, poiché la memoria sta **solo negli indicatori**, un catalogo povero significa un genoma che ricorda poco.

**Requisiti dell'operatore da onorare (Step 1, risposte del 2026-10-18; ciclo 010, Q2)**
- La memoria del passato sta **solo negli indicatori**: nessuna variabile portata dal genoma, nessuno stato del portafoglio fornito dal motore.
- **Famiglie con parametri evolvibili ammesse** (ad es. il coefficiente di una EMA come gene), oltre agli ingressi fissi.
- **Al massimo 10 ingressi** nel punteggio (termini della somma pesata); fino a **12** solo se strategico, con motivazione scritta nel documento.
- Il **catalogo può essere più ampio** dell'elenco ammesso.

**Criteri di accettazione**

| ID | Criterio | Priorità |
|----|----------|----------|
| AC-01 | **Copertura.** Il catalogo ha una scheda per ciascuno di: EMA, SMA, MACD, RSI, Bande di Bollinger, ATR, ROC, oscillatore stocastico, OBV, CMF; più ogni indicatore o trasformazione proposto dall'Explorer allo Step 4 (almeno uno fuori dall'elenco minimo), oppure una riga che dice perché quella proposta non ha una scheda. | Must-have |
| AC-02 | **Voci di ogni scheda:** (a) formula, con simboli definiti; (b) aggiornamento incrementale, dichiarando se è a tempo costante per barra e, se non lo è (ad es. massimo e minimo su N barre, deviazione standard su finestra), quale costo e quale struttura servono; (c) stato da conservare tra una barra e l'altra, con la sua dimensione; (d) periodo di warm-up (barre prima che il valore sia definito o affidabile) e valore di avvio; (e) campi OHLCV usati; (f) parametri e se sono candidati a gene evolvibile; (g) esempio numerico semplice. | Must-have |
| AC-03 | **Relazione con i quattro filtri IIR di Consilium**, verificata sul codice e citata con file e righe: forma `ema = ema * (1 - c) + x * c` (`src/vendor/consilium/algorithm.js`, righe 369-372), **`c` pesa il dato nuovo**, avvio al primo valore (righe 345-348), ingresso di prezzo uguale alla media di apertura, massimo, minimo e chiusura (`getActualValue`, `src/vendor/consilium/stockStream.js`, righe 32-33), coefficienti del genoma fisso da `src/engine/genome.js`. Per ogni indicatore del catalogo che contiene una media esponenziale o una SMA, il documento dice se e come si esprime con uno di quei filtri e qual è la sua costante di tempo (circa `1/c` barre), con la conversione tra «periodo N» della letteratura e `c` dichiarata con la sua fonte. | Must-have |
| AC-04 | **Adeguatezza al punteggio lineare**, per ogni indicatore: scala e unità del valore grezzo; normalizzazione proposta (ad es. rapporto, differenza relativa, valore limitato in un intervallo) perché i pesi siano confrontabili tra titoli e periodi; segno e lettura di un peso positivo; ridondanza o correlazione attesa con gli altri indicatori del catalogo e con i filtri IIR. Ogni affermazione di correlazione è o calcolata su dati dichiarati (snapshot ENI o dataset di esempio, con script) o marcata `[ipotesi]`. | Must-have |
| AC-05 | **Assenza di anticipazione dei dati (look-ahead).** Per ogni indicatore il documento dichiara quali dati della barra `t` usa e mostra che il valore è noto alla chiusura della barra `t`, prima dell'esecuzione all'apertura della barra `t+1` (`memory/knowledge/consilium-trader-order-timing`); gli indicatori che richiedono dati futuri o una stima sull'intera serie (ad es. normalizzazione con media e deviazione standard calcolate su tutto il dataset) sono esclusi o riformulati in forma causale. | Must-have |
| AC-06 | **Esito: elenco ragionato.** Una tabella degli **ammessi** (al massimo 10 ingressi, o fino a 12 con motivazione strategica scritta accanto) e degli **esclusi**, con una motivazione per ogni voce; per le famiglie ammesse, quali parametri sono geni e in quale intervallo `[ipotesi]` se non fondato; l'elenco rispetta «memoria solo negli indicatori» (nessun ingresso che dipende dallo stato del portafoglio o da variabili del genoma). Più un elenco di ciò che non si è potuto accertare. È una proposta: la scelta è di Luca. | Must-have |
| AC-07 | **Tracciabilità e nessuna promessa.** Ogni affermazione non banale ha una fonte (riferimento bibliografico, URL verificato, documentazione di libreria o `percorso/del/codice` con righe), con l'indicazione se la fonte è stata letta o solo la sua scheda; ciò che non ha fonte è marcato `[ipotesi]` o `[ipotesi, fonte da verificare]`. Nessuna cifra di rendimento senza fonte, nessuna affermazione che un indicatore «funziona» o rende (`decisions/2026-10-11-research-document-conventions`). | Must-have |
| AC-08 | **Leggibilità per il lettore dichiarato.** Italiano; matematica di livello intermedio; simboli definiti alla prima comparsa; ogni termine di finanza (ad es. barra, volatilità, ipercomprato, accumulo e distribuzione) spiegato alla prima occorrenza e raccolto in un glossario; riassunto iniziale per la decisione. Non ripete i capitoli 1 e 4 di `docs/architecture/genome-forms-guide.md` (SMA, EMA, rapporti di volume, punteggio lineare): li richiama con un collegamento. | Must-have |
| AC-09 | **Esempi su dati dichiarati.** Gli esempi numerici usano un unico dataset di esempio inventato, dichiarato come tale (estensione del dataset di 20 giorni della guida con apertura, massimo e minimo, perché ATR, stocastico e CMF li richiedono), generato e ricalcolato da script conservati in una cartella persistente fuori da `/tmp` (lezione del ciclo 010); il testo dice che i valori non provano nulla sulla qualità degli indicatori. | Must-have |
| AC-10 | **Verifica indipendente di formule e numeri** (`patterns/independent-verification-chain-research`): un verificatore diverso dall'autore ricalcola gli esempi, controlla le formule contro le fonti e l'orientamento di `c` contro il codice; le differenze sono corrette o elencate prima della consegna. | Must-have |
| AC-11 | **Lettura simulata** (proposta 1 dell'Evolution Master del ciclo 010): prima della consegna a Luca un lettore simulato senza competenze finanziarie legge il riassunto, la tabella dell'esito e almeno tre schede, e segnala ciò che non capisce; le segnalazioni sono corrette o motivate nel file del ciclo. | Must-have |
| AC-12 | **Scelta di Luca registrata** nel file del ciclo in un blocco `## Human Verification — [data]` (esecutore, oggetto, esito, note) con l'elenco degli ingressi scelti; senza, il ciclo resta DEFERRED. | Must-have |
| AC-13 | **Pubblicazione.** Il documento sta in `docs/` con l'intestazione usata dagli altri documenti, ha una voce propria in `_data/docs.yml` e la prosa e le formule evitano costrutti che Jekyll interpreta come Liquid (`patterns/jekyll-stakeholder-docs`). La build di Pages si verifica dopo il merge su `main` (PENDING_HUMAN, NRC-H03); Jekyll non è disponibile in locale. | Must-have |
| AC-14 | **Nessuna modifica** a `src/`, `tests/`, `scripts/`, `archimate/**`, né ai documenti esistenti della guida e della rassegna (salvo, se l'Architect lo propone, un collegamento al nuovo documento), né ai file di stato condivisi prima dello Step 12. | Must-have |
| AC-15 | **Domande aperte vicino all'argomento:** ogni domanda per Luca è scritta con una frase sola per scelta e compare sia nella sezione dove nasce sia in un elenco finale (lezione del ciclo 010). | Should-have |

**Fonti ammesse:** testi di riferimento sugli indicatori tecnici con la definizione originale dell'autore dove reperibile (ad es. Wilder per RSI e ATR, Appel per MACD, Bollinger, Lane, Granville, Chaikin) `[ipotesi, fonte da verificare]` sulla reperibilità di ciascuno; documentazione di librerie note di analisi tecnica (ad es. TA-Lib, pandas-ta) per formule e convenzioni di avvio, citata con URL verificato; letteratura scientifica su indicatori come ingressi di strategie evolute; il codice di Consilium in `src/vendor/consilium/` e di SwarmTrader; lo snapshot `src/data/eni-ohlcv.json` per piccoli calcoli dichiarati. **Non ammesse come prova:** materiale commerciale o promozionale, siti di «segnali», backtest non riproducibili usati per sostenere la redditività o l'efficacia di un indicatore. Dove le fonti divergono su una convenzione (ad es. media di Wilder contro EMA standard nell'RSI, deviazione standard di popolazione o campionaria nelle Bande di Bollinger), il documento le riporta entrambe e dice quale propone.

**Out of scope**
- Codifica genetica (R3), equazioni di decisione (R4), funzione di fitness (R5), protocollo di valutazione e controllo dell'overfitting (R6): il documento non giudica gli indicatori per rendimento né per rischio di sovradattamento, e non propone pesi o soglie.
- Codice in `src/`, `tests/`, `scripts/`; esperimenti su dati oltre ai piccoli calcoli di esempio e di correlazione dichiarati (AC-04, AC-09).
- La scelta finale dell'elenco (AC-12).

**Assunzioni**
- Le barre sono giornaliere e lo snapshot contiene apertura, massimo, minimo, chiusura e volume (`src/data/eni-ohlcv.json`, campi letti da `src/vendor/consilium/stockStream.js`, righe 70-73) `[verificato sui nomi dei campi, non sul contenuto di ogni barra]`.
- Il contratto di strategia consente indicatori con stato proprio aggiornato a ogni barra; l'adeguatezza a indicatori con finestre (code di N valori) si verifica in E2.
- Fatto rilevato in questo step e da portare allo Step 3: il «prezzo» che entra nei filtri IIR di Consilium non è la chiusura ma `(apertura + massimo + minimo + chiusura) / 4` (`stockStream.js`, righe 32-33), mentre la guida del ciclo 010 usa la chiusura nel dataset giocattolo. Il documento deve dichiarare quale prezzo usa ciascun indicatore.

**UX Coherence Check:** non applicabile. Il ciclo produce un documento; non introduce campi, controlli né passi di flusso (AC-14).

**Domande aperte per Luca:** nessuna nuova a questo step; le risposte del 2026-10-18 coprono i vincoli. Eventuali domande su convenzioni (ad es. quale prezzo usare come ingresso standard) nascono allo Step 3–5 e vanno poste secondo AC-15.

**Prossimo step:** Step 3 — ARCHITECT

## Step 3 — ARCHITECT: Propose Structure

**Agent:** claude-opus-5-5 (subagent)

**Input Surface Audit:** non applicabile; il ciclo produce un documento, senza UI né input (Step 2, UX Coherence Check e AC-14).

**Assunzioni**
- Il prodotto è **un solo documento** in `docs/architecture/`; nessuna guida estesa separata, salvo richiesta di Luca. Le fonti si raccolgono agli Step 4–8, non qui.
- «Ingressi» = termini della somma pesata del punteggio (risposta 2 di Luca, Step 1). I **parametri evolvibili** di una famiglia (ad es. `c` di una EMA) sono geni ma **non** contano nel limite di 10/12; contano nella dimensione del genoma, che è materia di R3.
- Fatti verificati sul codice in questo step (letti oggi, non a memoria):
  - Filtri: `ema = ema * (1 - c) + x * c` in `src/vendor/consilium/algorithm.js`, righe 369-372; **`c` pesa il dato nuovo**. Avvio al primo valore, righe 343-348 (`init`): `ema = ema2 = getActualValue()`, `emaV = emaV2 = volume`.
  - Confronti: le 14 condizioni (`ConditionFunctions`, righe 20-62) confrontano **valore con valore** (prezzo del giorno o filtro contro filtro più margine, volume contro filtro del volume più margine); il margine è proporzionale al filtro (`marginAbs = ema * marginPercent`, righe 381-384). Nessuna condizione usa massimo, minimo o apertura separatamente.
  - Prezzo che entra nei filtri: `getActualValue()` = `(close + max + min + open) / 4` (`src/vendor/consilium/stockStream.js`, righe 32-34), non la chiusura. Lo usa anche il `Trader` (`src/vendor/consilium/trader.js`, righe 153 e 423; il loro ruolo nel calcolo del valore non è esaminato qui).
  - Mappatura dei campi: lo snapshot (`src/data/eni-ohlcv.json`, campi `time, open, high, low, close, volume`, 2517 barre) entra nel motore da `src/engine/dataTrainer.js`, righe 65-72 (`new StockData(t, open, low, high, close, volume)`), non da `StockData.fromJSON` (righe 67-76 di `stockStream.js`; lo Step 2 cita le righe 70-73, dentro lo stesso metodo). Il risultato sui nomi dei campi è lo stesso; la correzione riguarda solo il percorso.
  - Ordine per barra: `Life` consuma la **prima barra con `init`** e le successive con `feed` (`src/vendor/consilium/life.js`, righe 622-623 e 646-650); `StrategyIndividual` chiama `initIndicators(stockData)` in `init`, poi in `feed` `updateIndicators` → `trader.update` (ordine della barra precedente eseguito all'apertura) → `decide()` (`src/engine/strategy.js`, righe 40-55); `resetIndicators()` in `reset` (righe 57-60). Quindi ogni indicatore riceve la barra 1 in `initIndicators` e da lì in poi una barra per volta, e il valore usato da `decide()` alla barra `t` contiene i dati di `t`, eseguiti all'apertura di `t+1`.
  - Coefficienti del genoma fisso (`src/engine/genome.js`, righe 14-17) e la regola `0 < c < 1` (righe 86-87). Calcolo eseguito: `1/c` = 1,37 (`iir_price_1`), 1,01 (`iir_price_2`), 8,50 (`iir_volume_1`), 2,52 (`iir_volume_2`); con la convenzione `c = 2/(N+1)` [fonte da verificare allo Step 4], `N = 2/c - 1` = 1,74, 1,02, 16,00, 4,05.
  - Caso limite nello snapshot: una sola barra con massimo = minimo e una sola con volume 0, la stessa: indice 1738, `2023-08-15`, `open = high = low = close = 14.014`, `volume = 0`; la barra precedente è `2023-08-11` (chiusura 14.048). Che sia un giorno festivo riempito dalla fonte è `[ipotesi]`.
- Non verificato: le convenzioni delle librerie (TA-Lib, pandas-ta) e dei testi originali; se il controller o il frame richiedano che `describe()` esponga solo numeri finiti (la regola è nella scheda del contratto del ciclo 010, non riletta qui nel codice del controller).

### Scomposizione in componenti

Undici componenti; le dipendenze vanno dall'alto in basso. I componenti 4–6 sono il corpo di consultazione; 1, 9 e 10 sono il percorso di lettura di Luca.

1. **In breve (riassunto per la decisione)** (AC-06, AC-08). Una pagina: perché gli ingressi decidono tutto in una forma lineare (rimando alla guida, cap. 4), la **tabella corta degli ammessi** proposti con una riga di motivazione ciascuno, il conteggio rispetto al limite 10/12, le domande per Luca. Si scrive per ultimo.
2. **Come leggere il catalogo: metodo, notazione, tempo** (AC-05, AC-07, AC-08). Fonti ammesse e formato di citazione (letta / solo scheda / non letta; `[ipotesi]`); notazione unica `O[t], H[t], L[t], C[t], V[t]` e `p[t]` = prezzo di ingresso scelto (vedi componente 3); **regola del tempo**: barra 1 in `initIndicators`, poi una barra per volta, valore noto a fine barra `t`, ordine eseguito all'apertura di `t+1` (`knowledge/consilium-trader-order-timing`, `strategy.js` righe 40-55); richiami con collegamento a guida 1.3.1–1.3.4 (SMA, EMA, distanza, rapporto di volume, momentum) e 4.2, 4.8.3 (punteggio, scala), **senza ripeterli**; il **dataset esteso** (sezione «Piano per script e dataset di esempio») con l'avvertenza «inventato, non prova nulla».
3. **Il prezzo di ingresso e i quattro filtri IIR** (AC-03). Forma esatta del filtro con file e righe, orientamento di `c`, avvio al primo valore, `getActualValue = (O+H+L+C)/4`; tabella dei quattro coefficienti con `1/c` e `N` equivalente; le due convenzioni di conversione «periodo N» ↔ `c` della letteratura (`c = 2/(N+1)` per l'EMA standard, `c = 1/N` per la media di Wilder) con fonte; l'avvio diverso nelle librerie (ad es. EMA avviata con la SMA dei primi N valori) `[fonte da verificare]`; elenco degli indicatori del catalogo che contengono una EMA o una SMA e con quale filtro si esprimono. Qui si pone la **decisione aperta sul prezzo di ingresso** (sotto, sezione dedicata).
4. **Mattoni di stato** (AC-02 b, c; ponte verso E2). Breve capitolo che descrive una volta sola i cinque tipi di stato da cui sono fatti tutti gli indicatori, con costo per barra e dimensione: (a) **EMA** (1 numero, tempo costante); (b) **finestra di N valori** in una coda circolare con somma corrente (SMA, ROC: N numeri, tempo costante, ma attenzione all'accumulo di errori di arrotondamento sulla somma corrente `[ipotesi]`); (c) **massimo/minimo su N barre** (coda monotona: fino a N valori, tempo costante ammortizzato, non per barra) `[fonte da verificare]`; (d) **varianza** su finestra (somme di x e x², instabile numericamente) o in forma esponenziale (2 numeri, tempo costante) `[fonte da verificare]`; (e) **accumulatore cumulativo** (OBV, linea di accumulo/distribuzione: 1 numero, ma **non limitato**: cresce con la storia e dipende dal punto di partenza). Ogni scheda poi dice «stato = mattone (a)+(c)…» invece di rispiegarlo. Serve anche a E2: è la mappa di che cosa vive in `initIndicators`/`updateIndicators`/`resetIndicators`.
5. **Schema uniforme della scheda** (AC-02, AC-04, AC-05, AC-07). Voci fisse, nello stesso ordine, una o due righe ciascuna:
   1. *In una frase* — che cosa dice al lettore non finanziario (con i termini spiegati alla prima occorrenza).
   2. *Formula* — simboli definiti; convenzioni divergenti tra fonti riportate entrambe, con quella proposta (AC-02 a; Step 2, «Fonti ammesse»).
   3. *Aggiornamento incrementale* — formula per barra; tempo costante sì/no; se no, costo e struttura (rimando al mattone) (b).
   4. *Stato* — che cosa si conserva e quanti numeri (c).
   5. *Avvio e warm-up* — valore in `initIndicators` alla barra 1, barre prima che il valore sia definito o affidabile, che cosa espone l'indicatore nel frattempo (d).
   6. *Campi usati* — quali tra O, H, L, C, V e se usa `p[t]` (e).
   7. *Parametri e geni* — parametri, se candidati a gene, tipo (continuo / intero), intervallo `[ipotesi]` se non fondato (f).
   8. *Relazione con i filtri IIR* — se contiene una EMA/SMA, con quale `c` e costante di tempo (AC-03).
   9. *Scala e ingresso nel punteggio* — unità del valore grezzo; normalizzazione proposta (dal menu del componente 7); intervallo atteso; lettura di un peso positivo (AC-04).
   10. *Ridondanza attesa* — con quali altri indicatori e filtri, con il valore di correlazione calcolato o `[ipotesi]` (AC-04).
   11. *Anticipazione dei dati* — dati della barra `t` usati, noto a fine `t`: sì/no; eventuale riformulazione causale (AC-05).
   12. *Casi limite* — divisioni per zero (massimo = minimo, volume 0, finestra piatta), valori non finiti, e come si trattano (vedi la barra ENI `2023-08-15`).
   13. *Esempio numerico* — sul dataset esteso, poche righe di tabella, valori prodotti dallo script (g).
   14. *Fonti* — con stato letta / solo scheda.
   15. *Proposta* — ammesso / ammesso come variante / escluso, con una riga di motivo (rimanda al componente 9).
   Lunghezza: una scheda sta in una schermata e mezza circa; i dettagli algebrici vanno in un'appendice.
6. **Schede, raggruppate per ruolo informativo** (AC-01). Cinque famiglie, ciascuna aperta da un paragrafo «che cosa porta di nuovo rispetto ai filtri IIR attuali»:
   - **Livello e tendenza:** EMA, SMA, MACD (con linea di segnale e istogramma come varianti, non come ingressi separati d'ufficio).
   - **Slancio (momentum):** ROC.
   - **Oscillatori limitati:** RSI, oscillatore stocastico.
   - **Volatilità ed escursione:** ATR, Bande di Bollinger (con %B e larghezza come forme d'ingresso possibili).
   - **Volume con segno e flusso:** OBV, CMF.
   Le proposte dell'Explorer (Step 4) entrano nella famiglia a cui appartengono, marcate «proposta dello Step 4»; quelle senza scheda hanno una riga «perché no» (AC-01). EMA, SMA, distanza e rapporto di volume hanno una scheda breve che rimanda alla guida per la spiegazione e aggiunge solo le voci mancanti (stato, warm-up, scala, ridondanza).
7. **Scala, normalizzazione e ridondanza per il punteggio lineare** (AC-04, AC-05). (a) Perché la scala conta, con rimando a guida 4.8.3 (con peso 1 il volume era ignorato). (b) **Menu di normalizzazioni causali**, ciascuna con stato e warm-up: rapporto o distanza relativa da una media (`x/m - 1`), divisione per la volatilità recente (per l'ATR o per una deviazione standard esponenziale), oscillatore limitato riportato a un intervallo centrato (ad es. `(RSI - 50) / 50`), punteggio standardizzato **scorrevole** con media e varianza esponenziali; esclusa la standardizzazione con media e deviazione calcolate su tutta la serie (anticipazione, guida 4.8.3). (c) Unità: ogni ingresso entra **adimensionale** (niente euro né numero di azioni), così i pesi si confrontano tra titoli e periodi. (d) **Ridondanza**: matrice di correlazione tra gli ingressi normalizzati calcolata da script, con parametri dichiarati, sul dataset esteso e sullo snapshot ENI (vedi Piano script); la soglia oltre cui due ingressi si dicono ridondanti è una scelta dichiarata `[ipotesi]`, e le correlazioni valgono solo per i parametri usati (con parametri evolvibili cambiano). (e) **Confine con R4**: ingressi prodotto (ad es. «rottura × volume», guida, appendice) sono trasformazioni possibili e il documento li nomina, ma la scelta di combinare ingressi è delle equazioni di decisione (R4); al più si propone come domanda.
8. **Famiglie con parametri evolvibili** (AC-06; risposta 1 di Luca). Per ogni famiglia ammessa: quali parametri diventano geni, tipo, intervallo `[ipotesi]` se non fondato, vincoli (ad es. `c_veloce > c_lenta` nel MACD e nell'incrocio di medie). Distinzione esplicita: **parametro continuo** (`c` di una EMA: si muta e si mescola come gli attuali coefficienti) contro **parametro intero di finestra** (N di SMA, ROC, stocastico, max/min: cambia la dimensione dello stato e il warm-up, quindi interagisce con `resetIndicators` e con crossover/mutazione, materia di R3). Dove esiste una variante a EMA di un indicatore a finestra (ad es. RSI con media di Wilder, che è un'EMA con `c = 1/N` `[fonte da verificare]`), il documento lo dice perché rende il parametro continuo. Conteggio: geni aggiunti per ogni ammissione, riportato accanto al conteggio degli ingressi, senza decidere per R3.
9. **Esito: ammessi ed esclusi** (AC-06). Tabella degli ammessi (al massimo 10; 11–12 solo con la motivazione strategica scritta nella riga), ciascuno con forma d'ingresso normalizzata, geni, famiglia; tabella degli esclusi con motivo (non causale, stato non limitato, ridondante con X, scala non normalizzabile in modo causale, dipende dallo stato del portafoglio, ecc.). Verifica esplicita della regola «memoria solo negli indicatori»: nessun ingresso che dipende dal prezzo di acquisto, dalla posizione aperta o da variabili del genoma (esclusi d'ufficio, ad es., stop mobili e distanza dal prezzo di carico). Poi l'elenco **«Che cosa non si è potuto accertare»**. È una proposta; la scelta è di Luca (AC-12).
10. **Domande per Luca** (AC-15). Ogni domanda in una frase per scelta, ripetuta nella sezione dove nasce e in questo elenco finale.
11. **Glossario e riferimenti** (AC-07, AC-08). Glossario dei termini di finanza (barra, OHLCV, apertura/massimo/minimo/chiusura, volatilità, escursione vera, ipercomprato/ipervenduto, accumulo e distribuzione, divergenza, warm-up, anticipazione dei dati); riferimenti numerati con stato di lettura.

**Tabella trasversale di confronto** (dentro il componente 9, prima dell'esito, come la griglia del ciclo 010). Righe: tutti gli indicatori con scheda. Colonne fisse: famiglia; campi O/H/L/C/V; mattone di stato e dimensione; tempo costante sì/no; warm-up in barre (con i parametri di esempio); forma d'ingresso normalizzata e intervallo; filtro IIR equivalente (`c`, costante di tempo) o «nessuno»; geni; ridondante con (e correlazione); casi limite; proposta. Valori **dichiarativi** (sì/no, numeri, nomi), niente punteggio sintetico né pesi: sarebbero una scelta di valore e una precisione apparente (come nel ciclo 010). Ogni cella rimanda alla scheda e quindi alla fonte.

**Posizione nel sito.** File proposto: `docs/architecture/genome-indicators-catalog.md`, titolo «Catalogo degli indicatori del genoma» (il prefisso `genome-` lo avvicina a `genome-forms-review` e `genome-forms-guide`). Intestazione come la guida (`title`, `layout: doc`, `last_verified`), blocco `<style>` locale per tabelle larghe e URL lunghi (`patterns/jekyll-stakeholder-docs`; la tabella trasversale avrà circa 11 colonne), niente `mermaid: true`. Voce in `_data/docs.yml` sotto `architecture` e riga in `docs/MAP.md`: con nessun ciclo in parallelo non c'è il vincolo del ciclo 010 e si possono scrivere allo Step 7. Prosa e formule senza i costrutti che Liquid interpreta: formule in blocchi di codice con graffe singole, ricerca degli aperturi Liquid prima della consegna. **Unico tocco a un documento esistente** (permesso da AC-14 se proposto qui): un collegamento al catalogo in guida 1.3.5 e nell'appendice «Dal capitolo 1: Altri indicatori», che oggi dicono «compito di R2»; nient'altro nella guida e nella rassegna.

### Decisione aperta: il prezzo di ingresso (chiusura o media OHLC/4)

Il problema: la letteratura definisce quasi tutti gli indicatori sul **prezzo di chiusura** `[ipotesi, fonte da verificare allo Step 4 su TA-Lib e testi originali]`, mentre i filtri di Consilium ricevono `(O+H+L+C)/4` (`stockStream.js`, righe 32-34) e la guida del ciclo 010 usa la chiusura nel dataset giocattolo (guida 1.2). Entrambe le scelte sono **causali**: tutti e quattro i campi della barra `t` sono noti alla sua chiusura, prima dell'esecuzione all'apertura di `t+1`. Le alternative e le conseguenze:

| Scelta | Conseguenze a favore | Conseguenze contro |
|---|---|---|
| **P1. Chiusura** per tutti gli indicatori «di prezzo» | formule e valori confrontabili con le fonti e con le librerie, quindi verificabili dallo Scientist (AC-10); coerente con il dataset della guida, i cui numeri restano validi | il nuovo genoma vede un prezzo diverso da quello del genoma FSM: il confronto nel PoC tra le due forme mescola l'effetto della forma con quello del prezzo; un'EMA del catalogo non coincide più con un filtro IIR di Consilium con lo stesso `c` |
| **P2. Media OHLC/4** per tutti gli indicatori «di prezzo» | stessa grandezza dei filtri di Consilium e del `Trader`: ogni EMA del catalogo **è** un filtro IIR, e il confronto con l'FSM isola la forma; la media di quattro prezzi è più liscia della chiusura `[ipotesi]` | i valori non coincidono con quelli delle fonti e delle librerie, quindi la verifica diventa «formula della fonte applicata a un ingresso diverso», più debole; parte dell'informazione del giorno (massimo e minimo) entra già nel prezzo, e può rendere ridondanti ATR o escursione `[ipotesi]`; il dataset della guida va ricalcolato per gli esempi |
| **P3. Per indicatore, dichiarato**: OHLC/4 nella famiglia delle medie (per l'equivalenza con i filtri), chiusura dove la definizione originale la usa in modo essenziale (RSI, stocastico, MACD) | ogni indicatore resta fedele alla propria fonte e le medie restano filtri IIR | due prezzi diversi nello stesso genoma: più difficile da spiegare a Luca e da verificare; rischio di errori di implementazione in E2 |
| **P4. Prezzo di ingresso come gene** (scelta discreta evolvibile) | nessuna scelta a mano | gene discreto in più (R3), spazio di ricerca più grande, interpretazione più difficile; sconsigliato `[ipotesi]`, si cita per completezza |

Indipendentemente dalla scelta, gli indicatori che usano per definizione **i campi separati** (escursione vera e ATR: H, L e chiusura precedente; stocastico: H, L, C; CMF: H, L, C, V; OBV: confronto tra chiusure) li leggono dalla barra, non dalla media. **Non decido al posto di Luca.** La proposta per gli esempi del documento (non per il genoma) è di calcolare le schede con la scelta che Luca indica e, se la risposta non arriva prima dello Step 7, di usare P1 per gli esempi e dichiarare in ogni scheda come cambierebbe con P2; il Critic valuti se P3 merita di restare tra le opzioni.

**Domanda per Luca (Q1):** gli indicatori di prezzo del nuovo genoma usano la chiusura (come la letteratura) o la media di apertura, massimo, minimo e chiusura (come i filtri di Consilium)?

### Interfacce e dipendenze

- **Guida, capitoli 1 e 4 (`docs/architecture/genome-forms-guide.md`)**: R2 la *consuma* e la estende; richiama 1.3.1–1.3.4 (SMA, EMA, distanza, rapporto di volume, momentum), 1.4 (memoria a monte), 4.2 (formula del punteggio), 4.6 (geni dell'esempio: `c_lento`, `c_veloce`, `c_vol`), 4.8.3 (scala), 4.8.5 (ingressi prodotto). Le formule di EMA e SMA del catalogo devono essere **le stesse** della guida (stessi simboli e stesso orientamento di `c`), altrimenti il lettore trova due versioni.
- **Contratto di strategia (`src/engine/strategy.js`, `decisions/2026-10-11-strategy-contract`)**: il catalogo *non* lo modifica. Ogni scheda descrive lo stato in modo che E2 sappia che cosa crea `initIndicators(stockData)` (barra 1), che cosa aggiorna `updateIndicators(stockData)` e che cosa azzera `resetIndicators()`. Se un indicatore richiede qualcosa che il contratto non dà (ad es. più barre in `initIndicators`), lo si segnala come richiesta per E2, non lo si risolve.
- **R3 (codifica genetica)**: riceve l'elenco degli ingressi ammessi, i geni di ogni famiglia con tipo e intervallo `[ipotesi]`, il conteggio dei geni aggiunti. Non riceve operatori di crossover né di mutazione.
- **R4 (equazioni di decisione)**: riceve ingressi già normalizzati e la lettura del segno di un peso; la scelta di combinare ingressi (prodotti, soglie su un singolo ingresso) e la politica di decisione durante il warm-up restano a R4.
- **R5/R6**: il catalogo non giudica gli indicatori per rendimento né per sovradattamento; dichiara solo i fatti che R6 deve sapere (warm-up da escludere dalla valutazione, dati usati per le correlazioni).
- **E2**: parte dalla tabella degli ammessi, dal capitolo dei mattoni di stato e dagli esempi numerici, che con il dataset dichiarato possono diventare casi di prova `[ipotesi]`.
- **Che cosa R2 deve consegnare perché non si riapra**: (a) l'elenco degli ingressi ammessi con la loro forma normalizzata; (b) il prezzo di ingresso (Q1); (c) i geni per famiglia; (d) gli esclusi con motivo; (e) ciò che non si è potuto accertare.

### Approccio A — Per indicatore, schema uniforme, tabella trasversale

Una scheda per indicatore, in ordine fisso (prima le medie, poi l'elenco dell'issue), con lo schema del componente 5; poi tabella trasversale, capitolo su scala e ridondanza, famiglie con geni, esito.

**Pro:** corrisponde una a una ad AC-01 e AC-02 (si verifica a vista che ogni indicatore abbia tutte le voci); fonte accanto all'affermazione (AC-07); una proposta dello Step 4 si aggiunge senza toccare le altre schede; chi cerca «l'RSI» lo trova. È la struttura che il ciclo 010 ha portato a termine.
**Contro:** l'informazione che serve per scegliere sotto il limite di 10, cioè **che cosa è ridondante con che cosa**, resta sparsa nelle schede e si ricompone solo nella tabella; l'ordine «per elenco dell'issue» mette vicini indicatori che dicono cose diverse e lontani quelli simili (ROC e MACD, ad es.); le parti comuni (stato a finestra, normalizzazione) si ripetono in ogni scheda.

### Approccio B — Per famiglia, cioè per ruolo informativo

Capitoli per famiglia (livello e tendenza, slancio, oscillatori limitati, volatilità ed escursione, volume con segno); in ogni capitolo un'introduzione «che cosa porta rispetto ai filtri IIR» e le schede degli indicatori della famiglia con lo schema uniforme; la ridondanza si discute **dentro la famiglia**, poi la tabella trasversale e l'esito.

**Pro:** rende visibile la domanda che il limite di 10 pone davvero («di quale tipo di informazione ho bisogno, e quale indicatore la porta meglio»); Luca legge un'idea per capitolo invece di dieci indicatori scollegati; la ridondanza attesa (ad es. ROC, MACD e distanza dalla media come misure di tendenza) si vede nella struttura; la scelta finale può ragionare «uno o due per famiglia» `[ipotesi sulla regola, da non imporre]`.
**Contro:** le famiglie sono una classificazione dell'autore, non un fatto: alcuni indicatori stanno in due famiglie (le Bande di Bollinger misurano livello e volatilità; RSI e ROC sono entrambi slancio) e la scelta del capitolo va motivata, con rimandi incrociati; l'attribuzione di famiglia può orientare l'esito più dei dati `[rischio per il Critic]`.

### Approccio C — Per catena dato → stato → indicatore → ingresso del punteggio

Quattro parti che seguono il percorso del dato: (1) i campi grezzi e il prezzo di ingresso; (2) i mattoni di stato (EMA, finestra, max/min, varianza, accumulatore); (3) gli indicatori come composizione di mattoni; (4) le trasformazioni in ingressi normalizzati e la selezione.

**Pro:** è la vista dell'implementatore (E2) e quella che rende ovvia la relazione con i filtri IIR: molti indicatori sono «una EMA di qualcosa», e la ridondanza strutturale emerge da sola; separa nettamente ciò che è indicatore da ciò che è normalizzazione.
**Contro:** spezza ogni indicatore in tre o quattro parti, quindi AC-01/AC-02 non si verificano a vista e la fonte di un indicatore si frammenta (lo stesso difetto dell'Approccio B del ciclo 010); per Luca, senza basi finanziarie, l'indicatore come «idea» (che cosa dice dell'andamento) si perde dietro la meccanica; somiglia a un documento di progetto di E2 più che a una ricerca che deve portare a una scelta.

### Raccomandazione

**Approccio B nell'impianto, con le schede uniformi di A e il capitolo dei mattoni preso da C.** In concreto: le schede restano una per indicatore con lo schema fisso del componente 5 (così AC-01 e AC-02 si verificano scheda per scheda, come in A), ma sono **raggruppate per famiglia** con un'introduzione di famiglia che dice che cosa porta di nuovo rispetto ai filtri IIR (B); prima delle schede c'è il capitolo breve dei mattoni di stato (C, componente 4), che evita di ripetere in ogni scheda lo stato a finestra e la normalizzazione e dà a E2 la mappa degli hook. La tabella trasversale ricompone la vista per indicatore (A) e la colonna «ridondante con» quella per famiglia; **C nella sua forma completa si scarta** perché frammenta le schede. Motivo della scelta: il prodotto deve aiutare Luca a scegliere **sotto un limite** di 10 ingressi, e la domanda utile per un limite è «quale informazione», che è la famiglia; lo schema uniforme protegge la verificabilità. Contro dichiarato: le famiglie sono un giudizio dell'autore; per contenerlo ogni introduzione di famiglia dice il criterio di appartenenza e ogni indicatore di confine ha un rimando dall'altra famiglia. Nessun grafico né Mermaid: tabelle testuali e piccoli grafici in testo come nella guida, un solo file.

### Piano per script e dataset di esempio (AC-04, AC-09, AC-10)

- **Cartella persistente:** `/home/luca/Workspace/swarmtrader-r2-work/` (fuori da `/tmp` e fuori dal repository, come `/home/luca/Workspace/swarmtrader-guide-work/` del ciclo 010, dove sta `guide/toy/toy.py`). Sottocartelle proposte: `dataset/`, `ref/` (implementazioni dell'autore), `verify/` (script dello Scientist, scritti senza leggere `ref/`), `out/` (tabelle prodotte). Script in JavaScript (Node, `.mjs`), come `nums.mjs` del ciclo 010 e come il codice che E2 scriverà `[preferenza, non vincolo]`.
- **Dataset esteso inventato** (`dataset/make-toy-ohlcv.mjs` → `dataset/toy20-ohlcv.json`): **chiusura e volume identici** ai 20 giorni della guida 1.2 (lo script li legge dalla tabella della guida e fallisce se non coincidono), più apertura, massimo e minimo generati da una **regola dichiarata e deterministica** scritta nel documento (ad es. apertura vicina alla chiusura del giorno prima con un piccolo scarto, massimo e minimo come estremi di apertura e chiusura più un'escursione fissa per giorno); controlli: `L ≤ min(O, C)`, `H ≥ max(O, C)`, nessun valore negativo. Così i numeri della guida restano validi e ATR, stocastico e CMF hanno i campi che richiedono. Il documento ripete l'avvertenza: valori inventati, mostrano il meccanismo, non dicono nulla sulla qualità degli indicatori. Il caso limite «massimo = minimo, volume 0» si mostra a parte con la barra ENI `2023-08-15`, non alterando il dataset.
- **Implementazioni di riferimento** (`ref/indicators.mjs`): per ogni indicatore due versioni, **incrementale** (una barra per volta, con `init/update/reset` come gli hook del contratto) e **diretta** (calcolo sulla finestra intera); uno script (`ref/check-incremental.mjs`) verifica che coincidano barra per barra sul dataset e sullo snapshot. È la prova di AC-02 b/c, non solo la sua descrizione.
- **Esempi** (`ref/examples.mjs` → `out/*.md`): le tabelle delle schede generate, non copiate a mano.
- **Correlazioni** (`ref/eni-corr.mjs`): legge `src/data/eni-ohlcv.json` in sola lettura, calcola gli ingressi normalizzati con parametri di esempio dichiarati, esclude il warm-up, scrive la matrice e il periodo usato. Sul dataset di 20 giorni le correlazioni non sono informative (troppo pochi giorni) e si riportano solo come esempio di calcolo `[ipotesi da confermare con lo Scientist]`.
- **Controlli del documento** (`ref/check-doc.mjs`): ricerca degli aperturi Liquid, presenza delle 15 voci in ogni scheda, conteggio ammessi ≤ 10 (o ≤ 12 con motivazione), numeri del documento uguali a quelli di `out/`.
- **Librerie esterne** (TA-Lib, pandas-ta) per il confronto dei valori: solo se già disponibili o installabili da fonte ufficiale con il consenso dell'operatore; **non verificato** che lo siano. Senza, il confronto si fa sulle formule documentate.

### Tracciabilità verso gli AC

| AC | Dove si soddisfa |
|---|---|
| AC-01 | componente 6 (schede per famiglia, righe «perché no» per le proposte dello Step 4 senza scheda) |
| AC-02 | componente 5 voci 2–7 e 13; prova incrementale = diretta in `ref/check-incremental.mjs` |
| AC-03 | componente 3; voce 8 di ogni scheda; colonna «filtro IIR equivalente» della tabella trasversale |
| AC-04 | componente 7; voci 9–10; `ref/eni-corr.mjs` |
| AC-05 | componente 2 (regola del tempo); voce 11; componente 7 (b) |
| AC-06 | componenti 8 e 9 |
| AC-07 | componente 2 (metodo), voce 14, componente 11; elenco di lavoro «affermazione → fonte → stato» tenuto agli Step 4–8 |
| AC-08 | componenti 1, 2 e 11; voce 1 di ogni scheda; rimandi alla guida invece di ripetizioni |
| AC-09 | Piano script, dataset esteso |
| AC-10 | `verify/` separata da `ref/`; lo Scientist ricalcola senza leggere le implementazioni dell'autore |
| AC-11 | si esegue allo Step 7–8 su componenti 1, 9 e almeno tre schede (proposta: una per famiglia diversa, tra cui una con H/L, ad es. ATR o stocastico) |
| AC-12 | fuori dal documento, nel file del ciclo |
| AC-13 | Posizione nel sito |
| AC-14 | un solo tocco previsto fuori dal nuovo file: due collegamenti nella guida, più `_data/docs.yml` e `docs/MAP.md` |
| AC-15 | componente 10 e domande ripetute nella sezione d'origine |

### Leggibilità per Luca e nessuna promessa di redditività

- **Leggibilità:** percorso di lettura dichiarato in apertura (In breve → tabella trasversale → esito; le schede sono consultazione); ogni scheda comincia con «In una frase» senza formule; termini di finanza spiegati alla prima occorrenza nella scheda dove compaiono e raccolti nel glossario; le parole che suonano come giudizi di mercato («ipercomprato», «accumulo», «segnale») sono spiegate come **descrizioni di un calcolo**, non come previsioni; matematica intermedia (somme, rapporti, ricorsioni di primo ordine), niente dimostrazioni.
- **Nessuna promessa:** il documento dichiara in apertura che confronta gli indicatori per **calcolabilità, stato, causalità, scala e ridondanza**, non per rendimento; nessuna cifra di rendimento senza fonte, e un risultato esterno si cita come risultato di quello studio, con le sue condizioni (`decisions/2026-10-11-research-document-conventions`); le letture convenzionali («RSI sopra 70 = ipercomprato») si riportano come convenzioni dell'autore dell'indicatore, non come regole che funzionano; il motivo di un'ammissione non è mai «è usato da molti» né «rende».

### Rischi che segnalo al Critic (Step 5)

1. **Prezzo di ingresso (Q1).** Se Luca non risponde prima dello Step 7, gli esempi rischiano di essere ricalcolati; verificare che ogni scheda dica quale prezzo usa e come cambierebbe con l'altra scelta. Controllare anche che la tabella P1–P4 non faccia passare P2 come «più liscio» senza fonte.
2. **Look-ahead nascosto.** Normalizzazioni con statistiche sull'intera serie (guida 4.8.3), avvio con la SMA dei primi N valori «tutti in una volta», correlazioni calcolate sull'intero snapshot usate per **scegliere** gli ingressi: quest'ultima non è anticipazione dentro il genoma, ma è una scelta fatta guardando gli stessi dati su cui R6 valuterà, quindi una possibile distorsione di selezione `[ipotesi]`. Il Critic valuti se limitare le correlazioni a un tratto iniziale dichiarato dello snapshot o dichiarare il limite e passarlo a R6.
3. **Orientamento di `c` e conversioni N ↔ `c`.** Errore già fatto una volta (`errors/2026-10-11-iir-formula-inverted-coefficient`); in più, la conversione `2/(N+1)` contro `1/N` (Wilder) produce due EMA diverse con lo stesso «periodo» e va attribuita alla fonte giusta. Lo stesso per le convenzioni di avvio delle librerie.
4. **Tempo costante dichiarato male.** Massimo e minimo su finestra e deviazione standard su finestra non sono a tempo costante per barra in senso stretto (ammortizzato, o con somme correnti numericamente fragili); OBV e accumulo/distribuzione hanno stato limitato ma **valore non limitato** e dipendente dal punto di partenza, quindi non sono ingressi adatti senza una trasformazione (differenza o rapporto su una media) `[ipotesi]`.
5. **Casi limite reali.** La barra ENI `2023-08-15` (O = H = L = C, volume 0) rende zero il denominatore della posizione nel giorno usata dal CMF e annulla il rapporto di volume; qualsiasi logaritmo del volume diventa non finito. Ogni scheda deve dire come lo tratta, e se `describe()` deve esporre solo numeri finiti (da verificare sul controller, non riletto qui).
6. **Famiglie come giudizio dell'autore** (contro della raccomandazione): verificare che l'attribuzione di famiglia non predetermini l'esito, e che gli indicatori di confine (Bollinger, RSI, MACD) abbiano i rimandi.
7. **Conteggio degli ingressi.** MACD (linea, segnale, istogramma), Bollinger (banda alta, bassa, %B, larghezza) e stocastico (%K, %D) possono contare come uno o più termini: la regola di conteggio va scritta prima dell'esito, altrimenti il limite di 10 si aggira. Allo stesso modo, i geni aggiunti dalle famiglie non contano nel limite ma gonfiano il genoma (R3).
8. **Ridondanza strutturale con i filtri IIR esistenti.** MACD è una differenza di due EMA, cioè quasi la «distanza veloce-lenta» della guida (`x2`); ROC su N giorni e distanza dalla media misurano cose vicine: il rischio è ammettere tre nomi per la stessa informazione. Le correlazioni dipendono dai parametri: con parametri evolvibili due ingressi distinti possono diventare uguali (ad es. due EMA con `c` che convergono).
9. **Confine con R4.** Ingressi prodotto, soglie convenzionali (70/30 dell'RSI) e la decisione durante il warm-up sono equazioni di decisione: il catalogo deve nominarli senza fissarli.
10. **Fonti originali poco reperibili** (Wilder 1978, Appel, Lane, Granville, Chaikin) `[ipotesi sulla reperibilità]`: il rischio è citare da seconda mano come se fosse letta; lo stato «letta / solo scheda» deve restare onesto, come nel ciclo 010.
11. **Lunghezza.** Dieci schede da quindici voci più le proposte dello Step 4 superano facilmente la guida in densità; il percorso di lettura (In breve, tabella, esito) e il limite di una schermata e mezza per scheda vanno controllati con la lettura simulata (AC-11).

### Domande per Luca (da questo step)

- **Q1.** Gli indicatori di prezzo del nuovo genoma usano la chiusura (come la letteratura) o la media di apertura, massimo, minimo e chiusura (come i filtri di Consilium)?
- **Q2.** Un indicatore con più uscite (ad es. MACD con linea e segnale, o lo stocastico con %K e %D) conta come un ingresso per ogni uscita usata nella somma? *(proposta: sì, ogni termine della somma conta uno, coerente con la risposta 2 dello Step 1; la domanda resta perché decide il limite)*
- **Q3.** Va bene che le correlazioni tra indicatori, usate per giudicare la ridondanza, siano calcolate sullo snapshot ENI che servirà anche alla valutazione dei genomi, dichiarando il limite? *(da porre dopo il parere del Critic, rischio 2)*

**Confidence:** Medium — la struttura è semplice e i fatti su filtri, prezzo di ingresso, ordine della barra e caso limite sono verificati sul codice e sullo snapshot; restano non verificate le convenzioni delle fonti (conversione N ↔ `c`, avvio delle EMA nelle librerie), la regola di finitezza di `describe()` nel controller e la scelta di Luca sul prezzo di ingresso, che può cambiare gli esempi.

**Prossimo step:** Step 4 — EXPLORER
