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

## Step 4 — EXPLORER: Generate Alternatives

**Agent:** claude-opus-5-5 (subagent)
**Confidence:** N/A (fase divergente: la fattibilità non si valuta qui)
**Assunzioni:** il caso «ricerca» si legge come nel ciclo 010: gli *approcci* (Parte 1) sono modi di organizzare o produrre il catalogo; gli *indicatori e trasformazioni* (Parte 2) sono candidati a una scheda. Letti oggi: Step 1–3 di questo file; `software-house-ai/agents/02-explorer.md`; Step 4 del ciclo 010 (`archive/cycle-010.md`, righe 160-277); `memory/decisions/2026-10-18-genome-form-linear-score`, `decisions/2026-10-11-research-document-conventions`, `knowledge/consilium-iir-filter-orientation`, `knowledge/consilium-trader-order-timing`, `patterns/independent-verification-chain-research`; guida, sezioni 1.3–1.4 e capitolo 4. Codice riletto: `src/vendor/consilium/algorithm.js` (righe 20-62, 242-251, 343-348, 366-384), `stockStream.js` (righe 32-34), `trader.js` (righe 97, 153), `portfolio.js` (righe 207-221), `src/engine/genome.js` (righe 14-17, 80-87). Tecniche usate: Challenge, Provocation, Analogies (elaborazione dei segnali, elettronica, neuroscienze), Biomimicry, Lateral Thinking.

**Calcolo esplorativo dichiarato.** Per orientare le idee ho eseguito un piccolo calcolo sullo snapshot ENI (`src/data/eni-ohlcv.json`, letto in sola lettura; 2517 barre dal 2016-09-29 al 2026-09-28) con uno script nella cartella temporanea di sessione (`scratchpad/explore.mjs`), **non** nella cartella persistente prevista dall'Architect. Parametri di esempio scelti da me, calcolati sulla chiusura, intero snapshot dopo le prime 60 barre. I numeri sotto marcati `[esplorativo]` **non sono citabili nel documento**: servono a dare al Critic qualcosa da contestare e vanno rifatti con `ref/eni-corr.mjs` allo Step 7, con le scelte di Q3. Non dicono nulla sulla qualità degli indicatori.

### Parte 1 — Approcci alternativi per organizzare o produrre il catalogo

#### Alternativa 1 — Catalogo per «lacune»: che cosa non può esprimere un punteggio sui soli quattro filtri IIR (primo principio diverso; sfida l'Architect)
**Tecnica:** Challenge («perché partire dagli indicatori e non da ciò che manca?») e Lateral Thinking.
**Idea:** invece di raggruppare per ruolo informativo (Approccio B), si parte da un fatto del codice: oggi tutto ciò che il genoma vede del passato sono **quattro filtri lineari** di due sole serie, il prezzo medio `(O+H+L+C)/4` e il volume (`algorithm.js` righe 369-372; `stockStream.js` righe 32-34), e le 14 condizioni confrontano solo valori con valori (righe 20-62). Da qui si elencano le **lacune** in modo deduttivo, e ogni lacuna diventa un capitolo; un indicatore entra nel catalogo per la lacuna che colma, ed esce se non ne colma nessuna:
- **L1. Nessuna funzione non lineare del percorso del prezzo.** Una combinazione lineare di EMA di `p` è ancora un filtro lineare di `p`. Mancano tutte le grandezze che richiedono valore assoluto, quadrato, massimo o minimo: volatilità, escursione, distanza da un massimo, «efficienza» del movimento.
- **L2. Nessuna informazione dentro la barra.** La media OHLC/4 mescola apertura, massimo, minimo e chiusura in un numero: non distingue una giornata chiusa sul massimo da una chiusa sul minimo con la stessa media, né un salto all'apertura (gap) da un movimento durante la seduta.
- **L3. Nessun volume con segno.** I due filtri del volume dicono «quanto si scambia», mai «in quale direzione si muoveva il prezzo mentre si scambiava».
- **L4. Nessuna normalizzazione per il regime.** I margini sono proporzionali al filtro (`marginAbs = ema * marginPercent`, righe 381-384): una distanza del 2 % pesa uguale in un anno calmo e in uno agitato.
- **L5. Nessuna grandezza senza direzione** (quanto è forte una tendenza, quanto è agitato il mercato), e il punteggio lineare ha un problema specifico con esse (vedi «Sfida all'Architect», punto 3).
Il limite di 10 ingressi si **alloca per lacune** (ad es. 3 posti al livello e tendenza, 2 a L1, 1 a L2, 2 a L3/volume, 1 a L4 come trasformazione), e la tabella dell'esito ha una colonna «lacuna colmata».
**Perché vale:** rende verificabile il criterio di appartenenza che l'Architect stesso segnala come giudizio dell'autore (rischio 6): una lacuna si dimostra sul codice, una famiglia no. Per Luca, la domanda «che cosa il genoma oggi non può vedere?» è più concreta di «quale tipo di indicatore».
**Attenzione:** le lacune sono dedotte dalla forma attuale (FSM con filtri), non dalla letteratura `[ipotesi di metodo]`; il nuovo genoma potrebbe avere lacune diverse (ad es. le interazioni, che sono di R4).

#### Alternativa 2 — Prima il banco di prova, poi le famiglie: raggruppare per correlazione misurata (data-first)
**Tecnica:** Provocation («e se le famiglie le decidessero i dati?») e Analogies (riduzione di dimensionalità per selezione di rappresentanti).
**Idea:** si invertono gli Step: prima lo script calcola **tutti** i candidati (elenco minimo più Parte 2) con parametri di esempio, sulla stessa serie; poi si raggruppano per somiglianza (ad es. raggruppamento gerarchico sulla distanza `1 - |correlazione|`), e ogni gruppo diventa una «famiglia empirica»; per ciascun gruppo si sceglie un **rappresentante** (il più semplice, quello con stato minore, quello con fonte primaria). Le schede si scrivono in quell'ordine. Il banco si esegue su **tre** serie: lo snapshot ENI (con la regola di Q3), il dataset giocattolo e una **passeggiata aleatoria sintetica** con la stessa volatilità di ENI: una correlazione che compare anche sulla serie senza struttura è **meccanica** (dovuta alla costruzione degli indicatori), non una proprietà del mercato.
**Indizio dal calcolo esplorativo** `[esplorativo]`: la distanza dalla EMA a 20 barre e la MACD normalizzata (EMA a 5 su EMA a 20) hanno correlazione 0,94; distanza a 20 e RSI a 14 0,88; volatilità EWMA e ATR normalizzato 0,96; il logaritmo del volume relativo ha correlazione tra -0,08 e -0,01 con tutti gli indicatori di prezzo provati. Spezzando lo snapshot in due metà, le coppie provate cambiano poco (ad es. distanza-MACD 0,94 e 0,93; distanza-RSI 0,84 e 0,93). Se lo stesso schema comparisse sulla passeggiata aleatoria, sarebbe una ridondanza di costruzione `[ipotesi da verificare con lo script]`.
**Perché vale:** neutralizza il rischio 6 dell'Architect (famiglie che predeterminano l'esito) e il rischio 8 (tre nomi per la stessa informazione), e dà a E2 un banco di prova che servirà comunque (incrementale = diretto, Piano script).
**Attenzione:** è il punto in cui il catalogo «guarda» i dati di valutazione (Q3); la serie sintetica attenua il problema ma non lo elimina. Le correlazioni dipendono dai parametri, e con parametri evolvibili si spostano.

#### Alternativa 3 — Catalogo per modi di fallire (dai fallimenti noti degli indicatori)
**Tecnica:** Provocation («scegliamo gli indicatori per come sbagliano, non per che cosa misurano») e Analogies (analisi dei modi di guasto, FMEA, dell'ingegneria dell'affidabilità).
**Idea:** ogni indicatore ha pochi modi di fallire, e sono sempre gli stessi: **(F1) ritardo** (la media segue il prezzo), **(F2) saturazione** (RSI e stocastico bloccati vicino agli estremi durante una tendenza lunga), **(F3) scala che dipende dal prezzo o dal regime** (MACD in euro, ATR in euro), **(F4) divisione per zero o valore non finito** (massimo = minimo, volume 0: la barra ENI `2023-08-15`), **(F5) dipendenza dal punto di partenza** (OBV e linea di accumulo/distribuzione), **(F6) avvio diverso tra librerie** (EMA avviata con la SMA o con il primo valore), **(F7) artefatti di costruzione** (vedi la media OHLC/4 in Parte 4, Q1). La scheda si apre con la riga dei fallimenti e la proposta di ammissione dice **quali fallimenti il punteggio lineare tollera** (F1 sì, è il prezzo della memoria; F3 no, va trasformato; F5 no, va riformulato) e quale trasformazione li neutralizza.
**Perché vale:** sposta l'attenzione dalle letture convenzionali («ipercomprato») a fatti verificabili sul calcolo, coerenti con il divieto di promesse; la colonna «casi limite» della tabella trasversale diventa la colonna principale. Si combina bene con A o B: è un ordine interno della scheda, non un'impaginazione.

#### Alternativa 4 — Il catalogo come retina: pochi tipi di recettore, normalizzazione divisiva (biomimetica)
**Tecnica:** Biomimicry e Analogies (neuroscienze sensoriali).
**Idea:** un sistema sensoriale non misura il mondo con cento sensori diversi: usa **pochi tipi di recettore** con costanti di tempo diverse, risponde alle **variazioni relative** più che ai livelli, separa canali «on» e «off» e **divide la risposta per l'attività recente** del contesto, così il segnale resta leggibile al buio e al sole. La normalizzazione divisiva è descritta come computazione canonica del sistema nervoso in Carandini e Heeger [S16]. Tradotto per il catalogo: (a) un solo tipo di «recettore di livello», la distanza logaritmica del prezzo da una EMA, ripetuto a 2-3 velocità evolvibili (il «banco» della guida 1.3.3); (b) un «recettore di contrasto», la volatilità recente, usato soprattutto per **dividere** gli altri ingressi (lacuna L4) e non come ingresso in sé; (c) canali con segno per il volume (on = volume nei giorni di rialzo, off = nei giorni di ribasso); (d) adattamento: ogni ingresso è riferito alla propria media recente. Il catalogo si presenta come «quali recettori, e come si normalizzano», e la proposta d'esito diventa piccola per costruzione.
**Perché vale:** dà a Luca una sola idea per tutto il documento, spiega perché i rapporti e i logaritmi sono la scala giusta per un punteggio lineare, e suggerisce che il numero di ingressi conti per **tipi di recettore × velocità**, non per nomi di indicatori. Che l'analogia regga per i mercati è `[ipotesi]`: la fonte tratta solo il sistema nervoso.

#### Alternativa 5 — Banco di filtri a ottave: le velocità come una scala musicale (fuori dall'impaginazione, verso R3)
**Tecnica:** Analogies (equalizzatore audio a bande d'ottava, banco di filtri).
**Idea:** se le EMA sono il «recettore di livello», invece di far evolvere `k` coefficienti indipendenti (rischio che due convergano e diventino lo stesso ingresso, rischio 8 dell'Architect), il genoma evolve **due** numeri: la costante di tempo più breve `T0` e il rapporto `q > 1` tra costanti successive; le velocità sono `T0, q·T0, q²·T0, …`. Nessuna coppia può coincidere, il vincolo «veloce > lenta» del MACD è soddisfatto per costruzione, e il numero di geni non cresce con il numero di velocità.
**Perché vale:** risolve per costruzione un problema che altrimenti R3 dovrebbe riparare con vincoli. **Esce in parte dal perimetro:** la parametrizzazione dei geni è di R3; qui si propone solo di nominarla nel capitolo «Famiglie con parametri evolvibili» `[ipotesi, nessuna fonte per l'uso in un genoma]`.

#### Sfida alla raccomandazione dell'Architect
1. **Che cosa conta come ingresso.** L'Architect conta i termini della somma (risposta 2 di Luca). Ma se gli ingressi sono distanze logaritmiche dalle EMA, `d_k = ln(p / e_k)`, allora la MACD normalizzata in forma logaritmica **è una combinazione lineare** di due distanze: `ln(e_veloce / e_lenta) = d_lenta - d_veloce` (identità algebrica). Nel punteggio lineare non aggiunge nulla: i pesi di `d_lenta` e `d_veloce` la rappresentano già. Con la forma «rapporto meno 1» della guida (`x2`) l'identità vale solo in prima approssimazione (`ln(1+u) ≈ u` per `u` piccolo). Conseguenza: l'espressività del gruppo «livello e tendenza» dipende dal **numero di filtri distinti**, non dal numero di indicatori con nomi diversi; la MACD come linea entra solo se gli altri ingressi non la generano già. La linea di segnale (EMA della MACD), invece, è un filtro nuovo (una cascata), e l'istogramma (MACD meno segnale) torna a essere ridondante se ci sono le altre due.
2. **La pendenza di una EMA è la distanza dalla EMA di ieri.** Da `e[t] = e[t-1] + c·(x[t] - e[t-1])` segue `e[t]/e[t-1] - 1 = c·(x[t]/e[t-1] - 1)`: la «pendenza della EMA» proposta nell'elenco del compito è esattamente la distanza del prezzo dalla EMA del giorno prima, moltiplicata per `c` (identità algebrica sulla formula di `algorithm.js`, righe 369-372). Un ingresso quasi duplicato, con nome diverso.
3. **Le grandezze senza direzione nel punteggio lineare.** Volatilità, ATR, ADX, larghezza delle Bande, efficienza di Kaufman sono **sempre positive** e non dicono «su» o «giù». In una somma pesata un ingresso così sposta il punteggio sempre nello stesso verso: con peso positivo «più il mercato è agitato, più si compra», qualunque sia la direzione. È raramente la regola voluta `[ipotesi]`; il loro uso naturale è **dividere** un ingresso con direzione (z-score, lacuna L4) o **moltiplicarlo** (ingresso prodotto, guida 4.8.2), che è materia di R4. Proposta: nel catalogo queste grandezze hanno due forme d'ingresso, «diretta» (sconsigliata, spiegata) e «come normalizzatore»; la tabella dell'esito le conta come ingressi solo nella forma diretta.
4. **Le famiglie si possono sostituire con lacune o con gruppi misurati** (Alternative 1 e 2), così l'attribuzione non è un giudizio dell'autore. L'Approccio B resta compatibile: cambia solo il criterio con cui si formano i capitoli.
5. **L'RSI è già un rapporto di due EMA.** Con la media di Wilder (vedi Parte 3) `RSI = 100·U/(U+D)`, con `U` e `D` medie dei rialzi e dei ribassi; quindi `2·RSI/100 - 1 = (U - D)/(U + D) = media(ΔC) / media(|ΔC|)`, perché `U - D` è la media delle variazioni con segno e `U + D` quella dei loro valori assoluti (stessa media, stesso avvio). L'RSI centrato è dunque un **rapporto di efficienza esponenziale con segno**: la versione a filtri dell'efficienza di Kaufman [S6]. Una sola scheda può coprirli entrambi; il parametro diventa continuo (`c = 1/N`), come già previsto dall'Architect al componente 8.

### Parte 2 — Indicatori e trasformazioni fuori dall'elenco minimo

Convenzioni: `p[t]` = prezzo di ingresso scelto (Q1); `C, O, H, L, V` = campi della barra; `r[t] = ln(C[t]/C[t-1])` rendimento logaritmico; «EMA(x; c)» = filtro nella forma di Consilium, `c` peso del dato nuovo. «Stato» = numeri da conservare tra una barra e la successiva. «Costo» = operazioni per barra. Tutti usano solo dati della barra `t` e precedenti, quindi sono noti a fine `t`; dove serve, lo segnalo. Le valutazioni «aggiunge / ridonda» sono **ipotesi** salvo il calcolo esplorativo indicato.

#### Gruppo A — Livello e tendenza (forme normalizzate di ciò che c'è già)

**N1. Distanza logaritmica da una EMA, a più velocità** — *famiglia, `c` evolvibile*
- *In parole:* di quanto il prezzo sta sopra o sotto la propria media, in scala logaritmica.
- *Formula:* `d[t] = ln(p[t] / e[t])`, `e = EMA(p; c)`. Per scarti piccoli coincide con `x1` della guida divisa per 100.
- *Stato e costo:* 1 numero per velocità; tempo costante.
- *Rispetto ai filtri IIR:* è il filtro IIR stesso, letto come rapporto; con P2 (prezzo OHLC/4) coincide con un filtro di Consilium.
- *Perché aggiunge:* la forma logaritmica è simmetrica (+10 % e -10 % in log hanno lo stesso modulo) e rende esatte le identità della Sfida, punto 1: con `k` velocità, MACD e «distanza tra medie» sono già nello spazio dei pesi.
- *Rischio:* due velocità evolvibili che convergono producono due ingressi uguali (rimedio: Alternativa 5 o vincolo di R3).

**N2. Z-score della distanza: distanza divisa per la volatilità recente** — *trasformazione*
- *In parole:* la distanza dalla media misurata in «giornate tipiche» invece che in percento: un 2 % in un periodo calmo conta più di un 2 % in un periodo agitato.
- *Formula:* `z[t] = d[t] / s[t]`, con `s` dalla N6 (volatilità EWMA) o dalla N7 (ATR normalizzato).
- *Stato e costo:* quello di N1 più N6; tempo costante.
- *Perché aggiunge:* colma la lacuna L4; è la normalizzazione causale proposta dall'Architect al componente 7 (b), qui come ingresso. Le Bande di Bollinger in forma %B sono la stessa idea con SMA e deviazione standard su finestra: `%B = 0,5 + (C - SMA)/(2·k·σ)` è una funzione affine dello z-score (algebra sulla definizione di %B come posizione nelle bande [S11], regola 15), quindi nel punteggio lineare %B e z-score con SMA sono lo stesso ingresso (la costante finisce nel bias).
- *Rischio:* volatilità vicina a zero (periodo piatto, avvio): serve un minimo per il denominatore; nelle prime barre `s` è mal stimata.

**N3. Pendenza della EMA** — *escludere, con scheda breve*
- *Formula:* `e[t]/e[t-1] - 1 = c·(p[t]/e[t-1] - 1)` (Sfida, punto 2).
- *Motivo:* duplicato algebrico di N1 con un giorno di ritardo; lo si scrive nel documento perché è una proposta naturale che il lettore si aspetta.

**N4. Pendenza di una retta di regressione su N barre** — *forse*
- *In parole:* la pendenza della retta che meglio approssima gli ultimi N prezzi (in log): quanto sale al giorno, in media, nella finestra.
- *Formula:* quella di TA-Lib `LINEARREG_SLOPE` [S4]: `m = (n·SumXY - SumX·SumY) / (SumX² - n·SumXSqr)`, con `SumX`, `SumXSqr` costanti in `n`. Normalizzata: applicata a `ln p`.
- *Stato e costo:* coda di N valori; aggiornamento a tempo costante con `SumY ← SumY + y_nuovo - y_uscente` e `SumXY ← SumXY + SumY_vecchio - n·y_uscente` (derivazione mia, da ricontrollare dallo Scientist; la pagina di TA-Lib non tratta l'aggiornamento incrementale).
- *Perché potrebbe aggiungere:* è un filtro lineare a finestra con risposta diversa dalla EMA (pesi lineari invece che esponenziali); ma resta un filtro lineare del prezzo, quindi ridondanza attesa alta con N1 `[ipotesi]`.
- *Rischio:* parametro intero (finestra); somme correnti soggette ad accumulo di errori su 2517 barre `[ipotesi]`.

**N5. Livello e pendenza alfa-beta (Holt)** — *forse, già nella guida*
- È la variante della guida 4.5 (`alfa`, `beta` evolvibili, stato 2 numeri, tempo costante; ingresso `v/l`). Rispetto a N1 la pendenza stimata ha una dinamica del secondo ordine (risponde all'accelerazione). Scheda breve con rimando alla guida 4.5; il collegamento con Kalman [S15] resta quello già dichiarato nella guida (formula letta, uso sui prezzi `[ipotesi]`).

#### Gruppo B — Volatilità ed escursione (lacuna L1)

**N6. Volatilità EWMA dei rendimenti logaritmici** — *portare (soprattutto come normalizzatore)*
- *In parole:* quanto si muove di solito il prezzo da un giorno all'altro, con più peso ai giorni recenti.
- *Formula:* `v[t] = v[t-1]·(1 - c) + r[t]²·c`, `s[t] = √v[t]`. È la media esponenziale dei quadrati dei rendimenti presentata nelle note MIT [S12] (forma `σ̃²[t+1] = (1-β)·σ̂²[t] + β·σ̃²[t]`, con `β` peso del passato: nella notazione di Consilium `c = 1 - β`). Il valore `β = 0,94` per dati giornalieri è attribuito a RiskMetrics (J.P. Morgan, 1996) da fonti secondarie `[ipotesi, fonte da verificare sul documento tecnico RiskMetrics]`.
- *Stato e costo:* 2 numeri (`v` e la chiusura di ieri); tempo costante. Avvio: `v` = primo `r²`, oppure un valore fisso; warm-up dell'ordine di qualche `1/c` barre.
- *Rispetto ai filtri IIR:* è un filtro IIR della stessa forma, ma applicato a `r²`, una grandezza che i filtri attuali non vedono (lacuna L1).
- *Perché aggiunge:* misura l'agitazione usando solo la chiusura; non richiede massimo e minimo. Media dei quadrati senza sottrarre la media dei rendimenti: per rendimenti giornalieri la media è piccola rispetto alla deviazione `[ipotesi]`.
- *Rischio:* grandezza senza direzione (Sfida, punto 3); i gap lunghi (festività) entrano come un solo rendimento grande.

**N7. ATR normalizzato (NATR)** — *portare o in alternativa a N6, non entrambi*
- *Formula:* `NATR = ATR / C · 100` [S5]; ATR con media di Wilder `ATR[t] = (ATR[t-1]·(n-1) + TR[t]) / n` e avvio con la media dei primi `n` TR [S1].
- *Stato e costo:* ATR e chiusura di ieri (2 numeri dopo l'avvio; `n` valori durante l'avvio con SMA, oppure avvio al primo TR nella forma di Consilium); tempo costante.
- *Perché è una scelta e non un'aggiunta:* `[esplorativo]` correlazione 0,96 con N6 sullo snapshot ENI. La differenza concettuale: l'ATR usa massimo, minimo e gap (escursione vera), N6 solo le chiusure. Scegliere una delle due; l'altra resta in catalogo come variante.
- *Rischio:* scala in euro se non normalizzata (è il caso dell'ATR dell'elenco minimo: la scheda ATR deve proporre la forma NATR o ATR/EMA).

**N8. Volatilità da massimo e minimo (Parkinson) e da OHLC (Garman-Klass), in forma esponenziale** — *forse*
- *In parole:* stimare l'agitazione dall'escursione del giorno invece che dalle variazioni tra chiusure.
- *Formula:* Parkinson per una barra `σ²_P = (ln H - ln L)² / (4·ln 2)`; Garman-Klass «migliore stimatore analitico invariante di scala» `σ² = 0,511·(u - d)² - 0,019·(c·(u + d) - 2·u·d) - 0,383·c²`, con `u = ln H - ln O`, `d = ln L - ln O`, `c = ln C - ln O` [S12]; poi una EMA del valore per barra.
- *Stato e costo:* 1 numero (l'EMA); tempo costante; nessuna dipendenza dalla barra precedente (Parkinson).
- *Perché potrebbe aggiungere:* le note MIT riportano efficienze statistiche di circa 5,2 (Parkinson) e 7,4 (Garman-Klass) rispetto al quadrato del rendimento tra chiusure, **sotto l'ipotesi di moto browniano senza deriva** [S12]; nel catalogo vale come «stima più stabile con poche barre», non come vantaggio per le decisioni. Gestisce `H = L` senza divisioni (valore 0).
- *Rischio:* ignora il gap tra la chiusura di ieri e l'apertura di oggi (Parkinson e GK misurano solo la seduta) `[ipotesi, da verificare sul testo]`; ridondanza attesa alta con N6/N7.

**N9. Distanza dal massimo su N barre (e posizione nel canale massimo-minimo)** — *portare*
- *In parole:* quanto il prezzo è sotto il punto più alto delle ultime N giornate (0 = siamo sul massimo).
- *Formula:* `dd[t] = C[t] / max(H[t-N+1..t]) - 1` (≤ 0). La posizione nel canale `(C - LL)/(HH - LL)` è lo stocastico %K di Lane con finestra lunga (formula di TA-Lib `STOCH` [S7]).
- *Stato e costo:* coda monotona di al più N valori; massimo e minimo su finestra scorrevole con al più tre confronti per elemento nel caso peggiore (Lemire [S13]); tempo costante ammortizzato, non per barra.
- *Perché aggiunge:* è una funzione non lineare del percorso (lacuna L1) e porta l'informazione «memoria del punto più alto», che una EMA non conserva. `[esplorativo]`: con N = 50, correlazione 0,84 con la distanza dalla EMA a 50 e -0,77 con NATR: parzialmente nuova.
- *Rischio:* parametro intero (cambia lo stato); `H = L` nell'intera finestra impossibile in pratica ma da gestire; la variante «canale» divide per `HH - LL`.

**N10. Massimo che dimentica (rivelatore di picco con decadimento)** — *forse, proposta di trasformazione senza fonte*
- *Tecnica:* Analogies (elettronica: il rivelatore di picco con condensatore che si scarica).
- *Formula:* `m[t] = max(H[t], m[t-1]·(1 - c) + C[t]·c)`; ingresso `C[t]/m[t] - 1`.
- *Stato e costo:* 1 numero, tempo costante, `c` **continuo** evolvibile.
- *Perché potrebbe aggiungere:* la stessa informazione di N9 senza coda e con un parametro continuo, come richiede il componente 8 dell'Architect («il parametro continuo si muta come gli attuali coefficienti»).
- *Rischio:* nessuna fonte, nessuna libreria lo calcola: `[ipotesi, nessuna fonte]`; il comportamento va mostrato sul dataset.

**N11. Efficienza di Kaufman (efficiency ratio), con segno** — *assorbire nella scheda RSI*
- *Formula:* `ER = |C[t] - C[t-n]| / Σ |C[k] - C[k-1]|` sulle stesse `n` barre [S6]; senza valore assoluto al numeratore si ottiene la versione con segno in [-1, 1]. Kaufman la usa dentro la media adattiva KAMA [S6].
- *Perché assorbire:* la versione esponenziale con segno coincide con l'RSI centrato (Sfida, punto 5). La versione a finestra resta come variante nella scheda RSI.
- *Rischio:* TA-Lib riporta 1,0 per la finestra piatta (0/0) [S6]: convenzione da dichiarare.

**N12. KAMA (media mobile adattiva di Kaufman)** — *escludere*
- *Formula (TA-Lib):* `SC = (ER·(2/3 - 2/31) + 2/31)²`, `KAMA[t] = KAMA[t-1] + SC·(p[t] - KAMA[t-1])` [S6].
- *Motivo:* è una EMA con `c` variabile guidato da ER; nel punteggio lineare la sua informazione è approssimativamente «distanza da EMA» più «ER», entrambe già presenti `[ipotesi]`; tre parametri, uno intero, e la saturazione di `c` tra 2/31 e 2/3.

**N13. ADX (indice direzionale medio di Wilder)** — *escludere come ingresso diretto, nominare come normalizzatore o prodotto*
- *Formula (TA-Lib):* `+DI = 100·(+DM_p / TR_p)`, `-DI = 100·(-DM_p / TR_p)`, `DX = 100·|(-DI) - (+DI)| / ((-DI) + (+DI))`; `+DM`, `-DM`, `TR` lisciati con la media di Wilder; primo ADX = media dei primi `n` DX, poi `ADX = (ADX_prec·(n-1) + DX)/n` [S3].
- *Stato e costo:* circa 6-7 numeri (H, L, C di ieri, tre medie, ADX); tempo costante; avvio di circa `2·n` barre (deduzione mia dall'avvio a cascata descritto in [S3]).
- *Perché escludere:* senza direzione (Sfida, punto 3); la differenza `(+DI - -DI)/(+DI + -DI)`, che ha direzione, è invece un candidato da confrontare con N1 e RSI `[ipotesi]`.

#### Gruppo C — Dentro la barra (lacuna L2)

**N14. Posizione della chiusura nell'escursione del giorno (CLV), in media esponenziale** — *portare*
- *In parole:* se la giornata chiude vicino al massimo (+1) o vicino al minimo (-1). Lane basava lo stocastico sull'osservazione che nelle salite le chiusure tendono a stare vicino ai massimi [S17, solo descrizione secondaria].
- *Formula:* `clv[t] = ((C - L) - (H - C)) / (H - L)` ∈ [-1, 1], cioè il moltiplicatore del flusso di denaro di Chaikin (TA-Lib `AD` [S8]) **senza volume**; ingresso `EMA(clv; c)`.
- *Stato e costo:* 1 numero; tempo costante.
- *Perché aggiunge:* è l'informazione che la media OHLC/4 cancella; limitato per costruzione, adimensionale. Separa «quanto» (CMF, con volume) da «dove chiude» (questo).
- *Caso limite:* `H = L` (barra ENI `2023-08-15`): la versione `ADOSC` di TA-Lib aggiorna solo «quando high > low» [S9]; proposta analoga: `clv = 0` o barra saltata, da dichiarare.

**N15. Gap di apertura e corpo della barra** — *forse (uno dei due)*
- *Formula:* `gap[t] = ln(O[t] / C[t-1])`; `corpo[t] = ln(C[t] / O[t])`; ingresso: EMA di ciascuno.
- *Stato e costo:* 1-2 numeri; tempo costante.
- *Perché potrebbe aggiungere:* `r[t] = gap[t] + corpo[t]` (identità): separa il movimento avvenuto a mercato chiuso da quello in seduta. `[esplorativo]`: deviazione standard 0,0094 per il gap e 0,0136 per il corpo sullo snapshot ENI: il gap non è trascurabile.
- *Rischio:* l'esecuzione degli acquisti avviene all'**apertura** di `t+1` (`trader.js` riga 97): il gap di `t+1` è esattamente ciò che la strategia non può vedere, quindi qui si usa solo il gap di `t` e precedenti (causale). Ridondanza con CLV `[ipotesi]`.

#### Gruppo D — Volume con segno e flusso (lacuna L3)

**N16. Logaritmo del volume relativo** — *portare (sostituisce `x3` della guida)*
- *Formula:* `lv[t] = ln(V[t] / EMA(V; c)[t])`; variante della guida `V/EMA - 1`.
- *Stato e costo:* 1 numero; tempo costante.
- *Perché aggiunge:* il volume ha una distribuzione molto asimmetrica (giorni con volume molte volte la media) `[ipotesi]`; il logaritmo rende simmetrici «doppio» e «metà». `[esplorativo]`: correlazione tra -0,08 e -0,01 con tutti gli indicatori di prezzo provati: è l'ingresso più «ortogonale» del banco.
- *Caso limite:* `V = 0` (barra ENI `2023-08-15`) → logaritmo non finito: serve un minimo (ad es. `max(V, 1)`, come nel calcolo esplorativo) o la barra saltata.

**N17. OBV normalizzato: volume con segno su volume totale, in media esponenziale** — *portare (sostituisce OBV grezzo)*
- *In parole:* tra il volume recente, quanta parte è stata scambiata in giorni di rialzo e quanta in giorni di ribasso.
- *Formula:* `f[t] = EMA(sgn(C[t] - C[t-1])·V[t]; c) / EMA(V[t]; c)` ∈ [-1, 1]. È l'idea dell'OBV di Granville (somma cumulata del volume con il segno della variazione, TA-Lib `OBV` [S10]) riscritta come rapporto di due filtri.
- *Stato e costo:* 3 numeri (due EMA e la chiusura di ieri); tempo costante.
- *Perché aggiunge:* risolve i difetti dell'OBV che l'Architect segnala (rischio 4: valore non limitato e dipendente dal punto di partenza); adimensionale; con `c` evolvibile. Costruzione mia `[ipotesi, nessuna fonte]`.
- *Rischio:* ridondanza con CMF in forma esponenziale (che usa CLV invece del segno) `[ipotesi]`.

**N18. CMF in forma esponenziale** — *variante della scheda CMF*
- *Formula:* `EMA(clv·V; c) / EMA(V; c)` invece della somma su 20 barre. Tempo costante, `c` continuo; stesso caso limite di N14.

**N19. Distanza dal prezzo medio ponderato per il volume (VWAP scorrevole o EMA ponderata)** — *forse*
- *In parole:* a che prezzo, in media, si è scambiato di più di recente, e dove sta oggi il prezzo rispetto a quel livello.
- *Formula:* `vw[t] = EMA(p·V; c) / EMA(V; c)`; ingresso `ln(p[t] / vw[t])`.
- *Stato e costo:* 2 numeri; tempo costante.
- *Perché potrebbe aggiungere:* la differenza tra `vw` e la EMA semplice con lo stesso `c` dice se il volume si è concentrato ai prezzi alti o bassi. La libreria `ta` documenta un VWAP con finestra (14 barre) ma lo descrive come grandezza «per la giornata corrente» [S14]: su barre giornaliere la definizione originale (intragiornaliera) non si applica, quindi questa è una **riformulazione** `[ipotesi]`.
- *Rischio:* ridondanza alta con N1 quando il volume è stabile `[ipotesi]`.

**N20. Force index normalizzato (Elder) e MFI** — *escludere*
- *Motivo:* il force index (variazione × volume) normalizzato si riduce a N17 pesato per l'ampiezza della variazione `[ipotesi]`; l'MFI è un «RSI ponderato per il volume» (definizione di Quong e Soudack citata da TA-Lib `MFI` [S18]), quindi RSI + N17 ne coprono l'informazione `[ipotesi]`. La libreria `ta` documenta entrambi [S14].

#### Gruppo E — Altre proposte, escluse a priori
- **Rendimento logaritmico di un giorno `r[t]`** come ingresso: è N1 con `c` vicino a 1 (con `c → 1` la EMA è il prezzo di ieri) `[ipotesi sull'approssimazione]`, ed è il dato più rumoroso; resta come mattone (N6, N15), non come ingresso.
- **Williams %R:** è lo stocastico %K riscalato (`%R = %K - 100` nella convenzione più comune) `[ipotesi, fonte da verificare]`: duplicato.
- **Asimmetria della volatilità** (`EMA(min(r, 0)²) / EMA(r²)`, quota di varianza dovuta ai ribassi): interessante e a tempo costante, ma senza fonte né uso noto in questo contesto `[ipotesi, nessuna fonte]`; da citare in «che cosa non si è accertato».
- **Correlazione esponenziale tra rendimenti e variazioni del volume:** quattro filtri per un numero molto rumoroso `[ipotesi]`.
- **Indice di ulcera, Aroon (età del massimo):** stato a finestra con più livelli; informazione vicina a N9 `[ipotesi]`.
- **Giorno della settimana, calendario, dati esterni (indici, cambio):** non sono memoria del titolo; l'ultimo esce dal perimetro (un solo titolo, nessuna fonte esterna nello snapshot).
- **Kalman completo con guadagno adattivo:** la guida usa già la versione alfa-beta (N5); il filtro completo aggiunge la stima delle varianze, cioè parametri e stato senza un ingresso nuovo.
- **Qualsiasi ingresso legato alla posizione** (prezzo di carico, stop mobile, giorni in posizione): escluso dalla regola «memoria solo negli indicatori» (Step 2).

#### Tabella «quali portare nel catalogo»

| Proposta | Esito | Motivo in una riga |
|---|---|---|
| N1 distanza log da EMA, più velocità | **portare** (famiglia) | forma esatta per le identità della Sfida; `c` evolvibile; con P2 coincide con i filtri IIR |
| N2 z-score (distanza / volatilità) | **portare** come trasformazione | colma L4; assorbe %B di Bollinger |
| N3 pendenza della EMA | escludere (riga «perché no») | duplicato algebrico di N1 |
| N4 pendenza di regressione | forse (variante) | filtro lineare a finestra, ridondanza attesa alta |
| N5 alfa-beta / Holt | forse (scheda breve, rimando a guida 4.5) | già nella guida; dinamica del secondo ordine |
| N6 volatilità EWMA | **portare** (soprattutto normalizzatore) | colma L1 con la sola chiusura; tempo costante |
| N7 NATR | **portare in alternativa a N6** | correlazione 0,96 `[esplorativo]`; forma normalizzata dell'ATR dell'elenco |
| N8 Parkinson / Garman-Klass | forse (variante di N6) | stima dalla sola seduta; gestisce H = L |
| N9 distanza dal massimo su N | **portare** | non lineare, memoria del picco; coda di Lemire |
| N10 massimo che dimentica | forse | come N9 con `c` continuo; nessuna fonte |
| N11 efficienza di Kaufman | assorbire nella scheda RSI | RSI centrato = efficienza esponenziale con segno |
| N12 KAMA | escludere | combinazione di N1 ed ER, tre parametri |
| N13 ADX | escludere come diretto | senza direzione; la variante con segno è un forse |
| N14 CLV in EMA | **portare** | colma L2; limitato; separa «dove chiude» dal volume |
| N15 gap / corpo | forse (uno solo) | separa notte e seduta; ridondanza con CLV da misurare |
| N16 log volume relativo | **portare** (sostituisce `x3`) | il più ortogonale del banco `[esplorativo]` |
| N17 OBV normalizzato | **portare** (sostituisce OBV grezzo) | volume con segno, limitato, senza punto di partenza |
| N18 CMF esponenziale | variante della scheda CMF | `c` continuo, tempo costante |
| N19 distanza da VWAP/EMA ponderata | forse | riformulazione su barre giornaliere |
| N20 force index, MFI | escludere | coperti da RSI + N17 |
| Gruppo E | escludere | motivi nella lista sopra |

AC-01 è soddisfatto da almeno N6, N9, N14, N16, N17 (fuori dall'elenco minimo).

#### Quanti ingressi sembrano sostenibili e quali famiglie

Una ripartizione che resta **sotto 10** e copre tutte le lacune (proposta da discutere, non un esito):

| Posto | Ingresso | Lacuna | Geni (non contano nel limite) |
|---|---|---|---|
| 1-3 | N1 a tre velocità (veloce, media, lenta), eventualmente divise per N6 (N2) | livello, tendenza, L4 | 3 `c` (o 2 con l'Alternativa 5) |
| 4 | RSI centrato `2·RSI/100 - 1` (= efficienza con segno) | L1 con direzione | 1 `c` (Wilder, continuo) |
| 5 | N9 distanza dal massimo (o N10) | L1 | 1 intero N (o 1 `c`) |
| 6 | N14 CLV in EMA | L2 | 1 `c` |
| 7 | N16 log volume relativo | volume | 1 `c` |
| 8 | N17 OBV normalizzato (o CMF esponenziale) | L3 | 1 `c` |
| (9) | N6 o N7 volatilità come ingresso diretto, solo se Luca vuole un termine «agitazione» | L1 senza direzione | 1 `c` |
| (10) | stocastico %K o N15 gap, se la ridondanza misurata con CLV è bassa | L2 | 1 intero o 1 `c` |

**8 ingressi** coprono le lacune; 9-10 se i posti tra parentesi superano la misura di ridondanza. **Non vedo un motivo strategico per arrivare a 12** con le informazioni di oggi: i posti 11-12 andrebbero a indicatori che il calcolo esplorativo suggerisce ridondanti (MACD, ROC, Bollinger %B sono già nello spazio di N1 + N2) `[ipotesi]`. Le **famiglie con parametro continuo** (`c` di una EMA) hanno più senso di quelle a finestra intera: si mutano e si incrociano come i coefficienti attuali (`genome.js` richiede `0 < c < 1`, righe 86-87) e non cambiano la dimensione dello stato. Quasi tutti i candidati portati ammettono una versione a filtri (RSI con Wilder, CMF e OBV esponenziali, N10 al posto di N9); restano a finestra intera solo N9 e lo stocastico. Con 8 ingressi a filtri i geni aggiunti sono circa 8 coefficienti, per un genoma di circa 8 pesi + bias + 2 soglie + 8 coefficienti = 19 numeri (conteggio mio, da passare a R3).

### Parte 3 — Fonti

**Convenzioni di conversione tra periodo N e coefficiente `c`** (tutte con `c` = peso del dato nuovo, come in `algorithm.js` righe 369-372):
- **EMA standard:** `c = 2/(N + 1)`. Verificato su TA-Lib `EMA` [S2]: «k = 2 / (period + 1); EMA_t = (price_t - EMA_{t-1}) * k + EMA_{t-1}», che è la forma di Consilium con `k = c`. TA-Lib avvia l'EMA con la SMA dei primi N valori [S2]; Consilium al primo valore (`algorithm.js` righe 345-348).
- **Media di Wilder:** `c = 1/N`. Verificato su TA-Lib `ATR` [S1] (`ATR_t = (ATR_{t-1}·(period-1) + TR_t) / period`, «Wilder-smoothed», riferimento al libro di Wilder), `RSI` [S19] (stessa ricorsione per le medie dei rialzi e dei ribassi, avvio con la media semplice dei primi N) e `ADX` [S3] («X = X - X/period + today's one-bar value», per somme; per l'ADX stesso la forma con `(period-1)/period`). Il testo di Wilder [S20] non è stato letto: l'attribuzione è quella di TA-Lib.
- **Equivalenza tra le due:** una media di Wilder a N barre è una EMA standard a `2N - 1` barre (da `2/(N'+1) = 1/N`; algebra mia). Esempio: RSI a 14 di Wilder = EMA con `c = 1/14 ≈ 0,071`, che con la convenzione standard si chiamerebbe «EMA a 27».
- **Costante di tempo:** l'Architect usa `1/c`; per una EMA il centro di massa dei pesi (età media del dato) è `(1 - c)/c` barre, e il peso residuo del valore di avvio dopo `t` barre è `(1 - c)^t` (algebra mia, da verificare dallo Scientist). Conseguenza pratica per il warm-up: per portare il peso dell'avvio sotto il 5 % servono `t ≥ ln 0,05 / ln(1 - c)` barre, cioè circa 24 con `c = 0,118` (`iir_volume_1`) e circa 30 con `c = 2/21` (EMA a 20). Le diverse convenzioni di avvio (SMA o primo valore) contano solo in quella finestra. TA-Lib segnala un «periodo instabile iniziale» per EMA, RSI, ATR, ADX [S1][S2][S3] ma le pagine lette non ne danno la durata.

**Verificate il 2026-10-18** (pagina aperta; per i libri solo scheda bibliografica):
- [S1] TA-Lib, *ATR — Average True Range*. https://ta-lib.org/functions/atr.html — formula dell'escursione vera, avvio con SMA, ricorsione di Wilder, riferimento a Wilder (letta).
- [S2] TA-Lib, *EMA — Exponential Moving Average*. https://ta-lib.org/functions/ema.html — `k = 2/(period+1)`, avvio con SMA (letta).
- [S3] TA-Lib, *ADX — Average Directional Movement Index*. https://ta-lib.org/functions/adx.html — formule di DI, DX, ADX, lisciatura di Wilder, avvio (letta).
- [S4] TA-Lib, *LINEARREG_SLOPE*. https://ta-lib.org/functions/linearreg_slope.html — formula con somme (letta; nessun riferimento bibliografico).
- [S5] TA-Lib, *NATR — Normalized Average True Range*. https://ta-lib.org/functions/natr.html — `NATR = ATR/Close·100` (letta; riferimento a John Forman, non verificato).
- [S6] TA-Lib, *ER — Kaufman Efficiency Ratio* e *KAMA*. https://ta-lib.org/functions/er.html , https://ta-lib.org/functions/kama.html — formule, convenzione 0/0 = 1,0; riferimenti: P. J. Kaufman, *Smarter Trading*, McGraw-Hill, 1995, e *Trading Systems and Methods*, 6ª ed., Wiley, 2019 (pagine lette; **libri non letti**).
- [S7] TA-Lib, *STOCH*. https://ta-lib.org/functions/stoch.html — %K, %D, valori predefiniti (5, 3, 3), finestra piatta → 0 (letta; la pagina **non** cita Lane).
- [S8] TA-Lib, *AD — Chaikin A/D Line*. https://ta-lib.org/functions/ad.html — moltiplicatore `((C-L)-(H-C))/(H-L)`, somma cumulata da 0 (letta; la pagina non tratta `H = L` né cita una pubblicazione).
- [S9] TA-Lib, *ADOSC — Chaikin A/D Oscillator*. https://ta-lib.org/functions/adosc.html — EMA 3 e 10 della linea A/D con `k = 2/(N+1)`, aggiornamento «only when high>low»; riferimento: Marc Chaikin (letta).
- [S10] TA-Lib, *OBV*. https://ta-lib.org/functions/obv.html — ricorsione, avvio al primo volume; riferimento: J. E. Granville, *Granville's New Strategy of Daily Stock Market Timing for Maximum Profit*, Simon & Schuster (pagina letta; libro non letto).
- [S11] J. Bollinger, *Bollinger Band Rules*. https://www.bollingerbands.com/bollinger-band-rules — regole 9 (20 periodi e 2 deviazioni come valori predefiniti), 11, 12 (SMA), 14, 15-17 (%B), 18 (BandWidth = quattro volte il coefficiente di variazione con i valori predefiniti) (letta). La pagina **non** dice se la deviazione standard è di popolazione o campionaria; TA-Lib `STDDEV` usa quella di popolazione, con divisore N (https://ta-lib.org/functions/stddev.html, letta).
- [S12] P. Kempthorne, *Volatility Modeling*, MIT 18.S096, lezione 9, autunno 2013. https://ocw.mit.edu/courses/18-s096-topics-in-mathematics-with-applications-in-finance-fall-2013/32f868169964ba3cf5015de880cf2172_MIT18_S096F13_lecnote9.pdf — media esponenziale delle varianze, stimatori di Parkinson e Garman-Klass con efficienze (testo estratto dal PDF e letto nelle pagine 6-13). È materiale didattico, non la fonte originale; gli articoli di Parkinson (*Journal of Business* 53(1), 1980) e di Garman e Klass (*Journal of Business* 53(1), 1980, pp. 67-78) **non sono stati letti** (JSTOR). Nota: le slide datano Parkinson «1976», le schede bibliografiche 1980.
- [S13] D. Lemire, *Streaming Maximum-Minimum Filter Using No More than Three Comparisons per Element*, Nordic Journal of Computing 13(4), 2006. https://arxiv.org/abs/cs/0610046 (letto l'abstract).
- [S14] Libreria Python `ta`, documentazione. https://technical-analysis-library-in-python.readthedocs.io/en/latest/ta.html — elenco di RSI, ATR, ADX, CMF, KAMA, Donchian, Force Index, VWAP, Ulcer con finestre predefinite (letta la prima parte della pagina; **non dà formule**, rimanda a pagine di terzi, in parte commerciali: non utilizzabile come fonte di formule).
- [S15] R. E. Kalman, 1960 — verificata nel ciclo 010 (`archive/cycle-010.md`, [F7]), non riaperta oggi.
- [S16] M. Carandini, D. J. Heeger, *Normalization as a canonical neural computation*, Nature Reviews Neuroscience 13(1), 51-62, 2012 (online 2011). https://pmc.ncbi.nlm.nih.gov/articles/PMC3273486 (letto l'abstract).
- [S18] TA-Lib, *MFI*. https://ta-lib.org/functions/mfi.html — prezzo tipico `(H+L+C)/3`, riferimento: G. Quong, A. Soudack, «Volume-Weighted RSI: Money Flow», *Technical Analysis of Stocks & Commodities* 7:3, 1989 (pagina letta; articolo non letto).
- [S19] TA-Lib, *RSI*. https://ta-lib.org/functions/rsi.html — rialzi e ribassi, avvio con media semplice, ricorsione `((n-1)·Ū_{t-1} + U_t)/n` (letta; la pagina cita il libro di Wilder ma non usa le parole «Wilder smoothing»).
- [S21] H. Working, *Note on the Correlation of First Differences of Averages in a Random Chain*, Econometrica 28(4), 916-918, 1960, e A. Cowles, *A Revision of Previous Conclusions Regarding Stock Price Behavior*, stesso numero, 909-915. https://www.econometricsociety.org/publications/econometrica/1960/10/01/note-correlation-first-differences-averages-random-chain e .../revision-previous-conclusions-regarding-stock-price-behavior — letta la scheda di Working (senza abstract) e l'abstract di Cowles, che riporta che fare la media all'interno di ogni unità di una serie casuale introduce una correlazione seriale positiva di primo ordine nelle differenze prime, e che fu Working a segnalarlo.

**Identificate, solo scheda bibliografica da ricerca web, non aperte** (`[ipotesi, fonte da verificare]` per ogni contenuto attribuito):
- [S17] G. C. Lane, «Lane's Stochastics», *Technical Analysis of Stocks & Commodities* 2(3), 87-90, 1984 (schede da traders.com ed eSignal; articolo a pagamento, non letto).
- [S20] J. W. Wilder Jr., *New Concepts in Technical Trading Systems*, Trend Research, Greensboro (N.C.), 1978, ISBN 0-89459-027-8 (scheda di catalogo universitario e librerie).
- [S22] G. Appel, *Technical Analysis: Power Tools for Active Investors*, FT Press, 2005 (schede WorldCat e InformIT); TA-Lib `MACD` (https://ta-lib.org/functions/macd.html, letta: MACD 12/26/9) cita invece G. Appel, *Stock Market Trading Systems*, Traders Press — due libri diversi, nessuno letto.
- [S23] J. J. Murphy, *Technical Analysis of the Financial Markets*, New York Institute of Finance, 1999, ISBN 0-7352-0066-1 (schede di catalogo).
- [S24] RiskMetrics — Technical Document, J.P. Morgan/Reuters, 4ª ed., 1996, per `λ = 0,94` giornaliero: trovate solo fonti secondarie.
- [S25] T. Finch, *Incremental calculation of weighted mean and variance*, Università di Cambridge, 2009 (aggiornamento numericamente stabile di media e varianza esponenziali, citato dalla documentazione di TensorFlow): il server non ha risposto. Da cercare anche B. P. Welford, 1962, per la varianza incrementale su finestra o cumulata.
- Chaikin (CMF), Granville (OBV): nessuna fonte primaria trovata; solo i riferimenti riportati da TA-Lib [S9][S10].
- pandas-ta: il sito `pandas-ta.dev` non risolveva (DNS) il 2026-10-18; non verificata.

Nessuna fonte commerciale usata come prova (pagine di piattaforme di trading e blog trovate nelle ricerche sono state scartate); nessuna cifra di rendimento riportata.

### Parte 4 — Le tre domande aperte dell'Architect: opzioni e conseguenze

**Q1 — Prezzo di ingresso: chiusura o media OHLC/4.** Alle opzioni P1-P4 dello Step 3 aggiungo due fatti e un'opzione.
- *Fatto 1 (codice).* Nel simulatore gli **acquisti** si eseguono all'apertura della barra successiva (`trader.js` riga 97, `stockData.open`), ma le **vendite** al prezzo `getActualValue()` della barra di esecuzione, cioè `(O+H+L+C)/4` (`portfolio.js` righe 215-219, `trader.js` riga 153). Il prezzo di vendita contiene quindi massimo, minimo e chiusura di una giornata che, all'apertura, non è ancora avvenuta. Non è anticipazione dentro gli indicatori, ma è un'ipotesi favorevole o sfavorevole di esecuzione che `knowledge/consilium-trader-order-timing` non registra (dice «at that bar's open» per l'esecuzione, verificato solo per l'acquisto). **Da far verificare al Critic** sul percorso completo `Trader.update` → `sellOperation` → `Broker.sell` → `Portfolio.remove`, che qui ho letto solo nei punti citati.
- *Fatto 2 (calcolo esplorativo e letteratura).* `[esplorativo]` sullo snapshot ENI l'autocorrelazione di primo ordine dei rendimenti giornalieri è 0,03 sulla chiusura e **0,23 sulla media OHLC/4**; la correlazione tra le due serie di rendimenti è 0,83. È coerente con l'effetto descritto da Working e Cowles nel 1960 [S21]: la media all'interno di ogni unità di una serie casuale introduce una correlazione seriale positiva nelle differenze. Che la media di quattro prezzi della barra ricada nello stesso caso del testo (che tratta medie di una catena casuale) è `[ipotesi, da verificare sul testo di Working]`. Conseguenza possibile: con P2 gli indicatori «di tendenza» sulla media OHLC/4 mostrano una persistenza in parte **costruita dalla media**, e se anche il prezzo di vendita è la media OHLC/4 (fatto 1), un genoma può trovare un vantaggio che esiste solo nel simulatore `[ipotesi]`.
- *Opzione P5 (nuova).* Chiusura per gli indicatori (P1), e la questione del prezzo di vendita del simulatore portata a R6 ed E2 come rischio dichiarato, senza toccare il codice in questo ciclo.
- *Conseguenze per la scelta:* P1 e P5 tengono i valori confrontabili con TA-Lib (che definisce sulla chiusura EMA, RSI, ATR, OBV, STOCH [S1][S2][S7][S10][S19]); P2 conserva l'equivalenza con i filtri di Consilium, ma eredita l'autocorrelazione della media; P3 e P4 come nello Step 3. **La scelta resta di Luca.**
- **Domanda per Luca (Q1, riformulata con il fatto nuovo):** gli indicatori di prezzo del nuovo genoma usano la chiusura o la media OHLC/4, sapendo che la media OHLC/4 rende i rendimenti più persistenti di quelli sulla chiusura (0,23 contro 0,03 sullo snapshot, dato esplorativo)?
- **Domanda nuova per Luca (Q4):** il prezzo di vendita del simulatore (media OHLC/4 della barra di esecuzione, mentre l'acquisto è all'apertura) va segnalato come rischio a R6 ed E2 o va aperta una issue a parte?

**Q2 — Come si contano gli ingressi per gli indicatori a più uscite.**
- *Opzione C1 (Architect):* ogni termine della somma conta uno. Semplice, verificabile a vista; ma non impedisce di spendere posti su combinazioni lineari di altri ingressi (MACD log con due distanze, istogramma con MACD e segnale, %B con lo z-score): posti sprecati, non un aggiramento del limite.
- *Opzione C2:* ogni termine conta uno, **più una regola di ammissione**: un'uscita che è combinazione lineare (o affine) di ingressi già presenti non si ammette (Sfida, punto 1; N2; N3). Conseguenza: il limite misura davvero l'informazione; serve dimostrare l'identità nella scheda (facile per MACD, %B, istogramma, pendenza EMA).
- *Opzione C3:* si contano i **filtri distinti** (stati indipendenti), non i termini. Conseguenza: più vicino all'espressività reale; ma si allontana dalla risposta 2 di Luca («termini della somma pesata») e richiede di spiegare il concetto di filtro.
- *Conseguenza comune:* le grandezze senza direzione usate solo come normalizzatore (N2 con N6) non sono un termine della somma; se Luca accetta questa lettura, il loro costo è un gene, non un posto.
- **Domanda per Luca (Q2, precisata):** un'uscita che è una combinazione di ingressi già presenti (ad es. la MACD quando ci sono già le due distanze dalle medie) va esclusa, oltre a contare uno se ammessa?

**Q3 — Correlazioni sullo snapshot ENI.**
- *Opzione R1:* intero snapshot, limite dichiarato. Massima stabilità delle stime; ma le scelte del catalogo guardano gli stessi dati della valutazione, una distorsione di selezione che R6 deve sapere (rischio 2 dell'Architect).
- *Opzione R2:* solo un tratto iniziale dichiarato (ad es. il primo 40 %), che R6 si impegna a usare solo per l'addestramento. Conseguenza: R6 eredita un vincolo sulla divisione dei dati; meno dati, stime più instabili (le coppie provate cambiano poco tra le due metà `[esplorativo]`, ma non è detto per tutte).
- *Opzione R3:* serie sintetica (passeggiata aleatoria con la volatilità di ENI) per le correlazioni «di costruzione», più R1 o R2 per quelle «di mercato» (Alternativa 2). Conseguenza: separa la ridondanza meccanica (che vale per qualunque titolo) da quella dei dati ENI; costo: un generatore nello script, con seme dichiarato.
- *Opzione R4:* nessuna correlazione su dati veri, solo identità algebriche e serie sintetica. Conseguenza: nessuna distorsione di selezione, ma nessuna evidenza su volume e barra (che non si generano bene in modo sintetico `[ipotesi]`).
- **Domanda per Luca (Q3, precisata):** le correlazioni si calcolano sull'intero snapshot ENI dichiarando il limite, solo su un tratto iniziale riservato all'addestramento, o anche su una serie sintetica per separare le ridondanze di costruzione?

### Diversità cognitiva
Per non ripetere i frame dell'Architect (impaginazione per indicatore, per famiglia, per catena del dato), questo step ha cambiato **oggetto** della domanda: non «come presentare gli indicatori» ma (a) che cosa il genoma attuale non può vedere (lacune dedotte dal codice, Alt. 1), (b) che cosa dicono i dati sulla somiglianza, con una serie senza struttura come controllo (Alt. 2), (c) come falliscono (Alt. 3), (d) come un sistema sensoriale risolve lo stesso problema con pochi recettori normalizzati (Alt. 4), (e) come parametrizzare le velocità senza collisioni (Alt. 5). Ha cercato **identità algebriche** invece di correlazioni attese (MACD log come differenza di distanze, pendenza EMA come distanza di ieri, RSI centrato come efficienza esponenziale con segno, %B come z-score affine), che riducono il catalogo senza dati. Ha riletto il codice del simulatore oltre i filtri e ha trovato un fatto non registrato in memoria (vendita alla media OHLC/4) e un possibile artefatto della media (Working 1960), entrambi da verificare dal Critic. Rischio dichiarato: tutte le identità sono mie e vanno ricontrollate (AC-10); i numeri `[esplorativo]` vengono da uno script non persistente.

### Domande per Luca (da questo step)
- **Q1** (riformulata): chiusura o media OHLC/4 per gli indicatori di prezzo, sapendo che la media rende i rendimenti più persistenti (0,23 contro 0,03, dato esplorativo)?
- **Q2** (precisata): un'uscita che è combinazione di ingressi già presenti va esclusa, oltre a contare uno se ammessa?
- **Q3** (precisata): correlazioni sull'intero snapshot dichiarando il limite, su un tratto iniziale riservato all'addestramento, o anche su una serie sintetica?
- **Q4** (nuova): il prezzo di vendita del simulatore alla media OHLC/4 della barra di esecuzione va segnalato come rischio a R6 ed E2 o aperto come issue a parte?

**Prossimo step:** Step 5 — CRITIC

## Step 5 — CRITIC: Analyze Weaknesses

**Agent:** claude-opus-5-5 (subagent)
**Letti:** Step 1–4 di questo file; `software-house-ai/agents/03-critic.md`; Step 5 del ciclo 010 (`archive/cycle-010.md`, righe 279-466); memory `decisions/2026-10-18-genome-form-linear-score`, `decisions/2026-10-11-research-document-conventions`, `decisions/2026-10-11-strategy-contract`, `knowledge/consilium-iir-filter-orientation`, `knowledge/consilium-trader-order-timing`, `knowledge/consilium-holding-semantics`, `errors/2026-10-11-iir-formula-inverted-coefficient`, `patterns/independent-verification-chain-research`. Codice riletto oggi: `src/vendor/consilium/algorithm.js` (righe 20-62, 236-260, 340-400), `stockStream.js` (righe 18-34), `trader.js` (righe 88-195, 372-448), `portfolio.js` (righe 12-72, 195-242, 261-380), `life.js` (righe 617-650), `src/engine/strategy.js` (tutto), `dataTrainer.js` (righe 46-76), `fitnessValidator.js` (tutto), `simulationController.js` (righe 28-150), `genome.js` (righe 13-17, 80-87); `src/data/eni-ohlcv.json` (barre 1735-1740 e conteggi).
**Script del Critic:** `critic.mjs` e `critic2.mjs` nella cartella temporanea di sessione (scratchpad), **non** nella cartella persistente: sono controlli, non numeri citabili. Il Builder li rifà in `ref/` o lo Scientist in `verify/` (Piano script dello Step 3).
**Assunzioni**
- Gravità secondo `agents/03-critic.md`. **Nessun rilievo è Critico**: ognuno ha una mitigazione.
- Le critiche riguardano il catalogo (calcolabilità, stato, causalità, scala, ridondanza), non la bontà degli indicatori per fare trading.
- Il Destroyer è omesso per track: anticipazione dei dati e instabilità numerica sono trattate qui (Step 1).

### Fatti verificati sul codice che le critiche usano

- **F-code-1. Filtri IIR e avvio.** `ema = ema * (1 - c) + x * c` (`algorithm.js`, righe 369-372): **`c` pesa il dato nuovo**, come in `knowledge/consilium-iir-filter-orientation`. `init` (righe 343-348) pone `ema = ema2 = getActualValue()` e `emaV = emaV2 = volume` della prima barra, **senza** chiamare `trader.update`; le 14 condizioni (righe 20-62) confrontano valori con valori, con margini proporzionali al filtro (righe 381-384). Coefficienti del genoma fisso: `genome.js` righe 14-17; vincolo `0 < c < 1` alle righe 86-87.
- **F-code-2. Prezzo di ingresso.** `getActualValue()` = `(close + max + min + open) / 4` (`stockStream.js`, righe 32-34). Il costruttore è `StockData(t, open, min, max, close, volume)` (riga 19) e `dataTrainer.js` (righe 65-72) passa `bar.open, bar.low, bar.high, bar.close, bar.volume` nell'ordine giusto: `min = low`, `max = high`. Confermato.
- **F-code-3. Ordine per barra e hook.** `Life.grows` consuma la prima barra con `child.init` (`life.js`, righe 622-623) e le successive con `child.feed` (righe 646-650). `StrategyIndividual.init` chiama `initIndicators` e `trader.init` (`strategy.js`, righe 40-44); `feed` chiama `updateIndicators` → `trader.update` → `decide()` → `trader.buy()`/`sell()` (righe 46-55); `reset` chiama `resetIndicators` (righe 57-60). Quindi l'ordine deciso alla barra `t` con i dati di `t` si esegue nel `trader.update` della barra `t+1`. **Fatto in più:** il controller cattura il primo fotogramma subito dopo `init` (`simulationController.js`, riga 43, `captureFrame(stream[0])` → `describe()`, riga 100): **`describe()` deve dare numeri finiti già alla barra 1**, cioè prima di qualunque warm-up.
- **F-code-4. Prezzo di acquisto e di vendita: percorso completo.**
  - *Acquisto:* `Trader.update` (riga 430) → stato `BUYING` → `buyOperation` (riga 372) → `Broker.buy` (riga 96), `stockPrice = stockData.open` (riga 97); la posizione registra la barra di esecuzione (`Portfolio.add`, riga 195; `Position`, righe 13-19). Prezzo = **apertura** della barra `t+1`.
  - *Vendita su segnale:* `Trader.update` → stato `SELLING` (righe 439-441) → `sellOperation` (riga 411) → `Broker.sell` (riga 143), `currPrice = stockData.getActualValue()` (riga 153) per il guadagno lordo → `Portfolio.remove` (riga 207), `currPrice = stockData.getActualValue()` (riga 215), `grossProceeds = Σ quantità × currPrice` (righe 218-221), posizione chiusa a `currPrice` (riga 231). Prezzo = **`(O+H+L+C)/4` della barra `t+1`**, la stessa barra in cui l'ordine si esegue. **Sì, il prezzo di vendita contiene massimo, minimo e chiusura di `t+1`, che all'apertura di `t+1` non sono noti.** Non è anticipazione nella *decisione* (presa a fine `t`), ma è un prezzo di esecuzione che un ordine dato all'apertura non può ottenere: equivale a vendere «alla media della giornata». Il validatore lo accetta perché controlla solo che stia in `[low, high]` (`fitnessValidator.js`, righe 57-58).
  - *Chiusure automatiche:* `Broker.update` → `Portfolio.update` (riga 261): stop e take profit scattano su `min ≤ stopLossPrice` e `max ≥ takeProfitPrice` della barra (righe 62-72) e si chiudono **al prezzo di soglia** (righe 291, 298, 306, 318), anche quando l'apertura è già oltre la soglia (stop ottimista sui salti in apertura, take profit pessimista); se scattano entrambi vince lo stop (righe 280-283).
  - *Valore del portafoglio:* `getCurrentValue` e `getCurrentGain` usano `getActualValue()` della barra corrente (righe 359-382).
  - **Confronto con la memoria:** `knowledge/consilium-trader-order-timing` dice «the order executes … at that bar's open»: vero per l'acquisto, **incompleto per la vendita** (media OHLC/4) e per le chiusure automatiche (prezzo di soglia). Il fatto 1 dell'Explorer (Parte 4) è corretto; la nota di memoria va corretta allo Step 10.
- **F-code-5. Barra piatta ENI.** Indice 1738, `2023-08-15`: `open = high = low = close = 14.014`, `volume = 0`. È l'**unica** barra con `H = L` e l'unica con `V = 0` (conteggio sullo snapshot); il volume minimo non nullo è 4.029.990. La barra precedente è `2023-08-11` (chiusura 14,048): **manca il 2023-08-14**, quindi la barra piatta segue un salto di calendario `[ipotesi sulla causa: giorno riempito dalla fonte]`. Nessuna finestra di 5 barre ha `HH = LL`.
- **F-code-6. Valori non finiti.** `FitnessValidator.validate` segna errore se un valore di `frame.strategy.indicators` non è finito o se l'oggetto è vuoto (`fitnessValidator.js`, righe 26-31); `simulationController.validateTrace` **lancia un'eccezione** a fine replay se la validazione fallisce (righe 90-94, chiamata alle righe 45, 69, 80). Calcolato: sulla barra 1738 `CLV = 0/0 = NaN` e `ln V = -Infinity`; un `NaN` entrato in una EMA **resta `NaN` per sempre** (prova: dopo 5 ingressi finiti è ancora `NaN`), cioè per le 778 barre successive. In JavaScript `NaN > x` e `NaN < x` sono entrambi falsi: un punteggio `NaN` che non finisce in `describe()` produce **silenziosamente** «nessun acquisto, nessuna vendita» per il resto del replay; se finisce in `describe()`, l'intero replay fallisce alla fine. Su questa barra restano finiti l'escursione vera (`TR = 0,034`, grazie alla chiusura precedente), il termine di Parkinson (0) e i rapporti di volume `V/EMA(V) = 0`.

### Ricalcolo delle identità e delle conversioni («Sfida all'Architect» e Parte 3)

Calcolato sulla chiusura dello snapshot ENI, warm-up di 60 barre escluso dove si misura una correlazione.

| # | Affermazione dello Step 4 | Calcolo del Critic | Esito |
|---|---|---|---|
| I1 | MACD log `ln(e_v/e_l) = d_l − d_v` | scarto massimo 3·10⁻¹⁶; la forma «rapporto meno 1» differisce dal log al più di 0,0157 (correlazione 0,9993) | **Esatta.** Precisazione: è esatta solo se le due EMA della MACD **sono** due delle velocità di N1. Con velocità diverse (MACD 12/26 contro distanze a 10, 20, 50) la MACD è spiegata al 99,6 % (R² 0,996) da una combinazione delle distanze: approssimazione, non identità. Con `c` evolvibili le velocità coincidono solo per costruzione (Alt. 5) o per vincolo. |
| I2 | pendenza EMA `e[t]/e[t−1] − 1 = c·(p[t]/e[t−1] − 1)` | scarto 3·10⁻¹⁶ | **Esatta.** **Correzione a N3:** non è «N1 con un giorno di ritardo». Posto `u = p[t]/e[t−1] − 1`, vale `d[t] = ln(1+u) − ln(1+c·u)` (scarto 4·10⁻¹⁶): la pendenza è una funzione monotona di `d[t]` **della stessa barra**; correlazione 0,995 con `d[t]` e solo 0,916 con `d[t−1]`. L'esclusione resta giusta, il motivo va scritto così. |
| I3 | RSI centrato = media di Wilder di ΔC / media di Wilder di \|ΔC\| | scarto 6·10⁻¹⁶ con l'avvio TA-Lib | **Esatta** (le medie sono lineari con lo stesso avvio). Il legame con l'efficienza di Kaufman con segno a finestra è di **famiglia**, non un'identità: correlazione 0,89 tra le due a 14 barre. |
| I4 | %B = 0,5 + (C − SMA)/(2kσ), quindi «%B e z-score con SMA sono lo stesso ingresso» | scarto 3·10⁻¹⁵ con σ di popolazione sui prezzi della finestra | **Esatta per lo z-score con SMA e deviazione standard dei prezzi della finestra.** **Correzione a N2:** lo z-score N2 è `ln(C/EMA)/s` con `s` volatilità dei **rendimenti** (N6): correlazione con %B 0,92, non un'identità. «N2 assorbe %B» va riscritto: %B è affine al *proprio* z-score; con N2 è solo vicino. |
| C1 | Wilder N ≡ EMA standard 2N − 1 | `1/14 − 2/28 = 0` | Esatta (algebra). RSI 14 di Wilder = `c = 0,0714` = «EMA a 27». |
| C2 | centro di massa `(1−c)/c` | somma numerica con `c = 0,118`: scarto 4·10⁻¹⁵ | Esatta per storia infinita. **Incoerenza da risolvere:** lo Step 3 e AC-03 usano «costante di tempo circa `1/c`». Per `c` piccolo i numeri sono vicini (EMA 20: `1/c` = 10,5, centro di massa 9,5, `−1/ln(1−c)` = 9,99), per `c` grande no (`iir_price_2`: 1,01 contro 0,01 contro 0,22). Il documento sceglie **una** definizione e la scrive. |
| C3 | barre per portare il peso del primo valore sotto il 5 %: `ln 0,05 / ln(1−c)` | `c = 0,11765` → 24 (peso 4,96 %; con 23 è 5,6 %); EMA 20 → 30; Wilder 14 → 41 | Esatti. Con `c` dei filtri di prezzo del genoma fisso servono 1-3 barre. Seme «primo valore» contro «SMA dei primi 20» sulla EMA 20: scarto relativo 0,17 % alla barra 30. |
| C4 | `N = 2/c − 1` e `1/c` dello Step 3 | 1,737 / 1,020 / 16,00 / 4,049; 1,369 / 1,010 / 8,50 / 2,525 | Esatti. |
| C5 | aggiornamento a tempo costante di `LINEARREG_SLOPE` (N4) | incrementale contro diretto, finestra 20 su `ln C`: scarto 9·10⁻¹⁴; segno controllato su una retta crescente (+0,01) | **Corretto** con l'indicizzazione di TA-Lib (`i` = barre fa). |

Numeri esplorativi dello Step 4 ricalcolati: autocorrelazione di primo ordine dei rendimenti 0,031 (chiusura) e 0,232 (media OHLC/4), correlazione tra le due serie 0,831: **coincidono**. Distanza a 20 contro MACD 5/20: 0,938 (Step 4: 0,94). Distanza a 20 contro RSI 14: 0,853 nel mio calcolo contro 0,88 dello Step 4 (avvii diversi; la differenza dice quanto queste cifre dipendono da scelte minori).

### Critica dell'Approccio A — Per indicatore, schema uniforme, tabella trasversale

| # | Rilievo | Gravità | Mitigazione |
|---|---|---|---|
| A1 | **Volume.** Quindici voci × (dieci schede obbligatorie + almeno cinque dello Step 4, più le «forse») superano 230 celle, ciascuna con fonte o `[ipotesi]`. Il ciclo 010 ha chiuso a circa 8.400 parole con meno voci; la lezione A1 del ciclo 010 vale qui di più. | Alta | Voci 3-4 (aggiornamento e stato) e 11-12 (anticipazione e casi limite) fuse in una riga ciascuna; per gli indicatori tutti causali la voce 11 diventa una riga unica nel metodo («tutti usano solo barre ≤ t», F-code-3) e la scheda dice solo le eccezioni; le «forse» e le escluse (N3, N4, N5, N8, N10, N12, N13, N15, N19, N20, gruppo E) sono **righe** «variante / perché no», non schede. Il Builder conta parole e celle e le riporta. |
| A2 | **Tabella trasversale di 11 colonne:** nel ciclo 010 lo straripamento della tabella larga si è visto solo allo Step 9. | Media | Due tabelle (fatti di calcolo: campi, stato, warm-up, filtro IIR; fatti per il punteggio: forma normalizzata, intervallo, ridondanza, proposta) e il blocco `<style>` locale già previsto. |
| A3 | L'ordine «per elenco dell'issue» è superato dalla raccomandazione (B nell'impianto). | Bassa | Nessuna. |

### Critica dell'Approccio B — Per famiglia (raccomandato nell'impianto)

| # | Rilievo | Gravità | Mitigazione |
|---|---|---|---|
| B1 | **Il criterio di famiglia è un giudizio** (lo Step 3 lo dichiara). Aggiungo che l'impianto proposto può predeterminare l'esito per un'altra via: «uno o due per famiglia» trasforma cinque famiglie in cinque-dieci posti prima di qualunque misura. | Media | Criterio di appartenenza dimostrabile: **la lacuna che l'indicatore colma** rispetto ai quattro filtri IIR (Alt. 1, L1-L4, dedotte dal codice, F-code-1/2); la famiglia resta come titolo del capitolo, la colonna «lacuna» nella tabella. Nessuna quota per famiglia. |
| B2 | Le famiglie dello Step 3 mettono ROC in «slancio» da solo, mentre ROC, MACD e distanza sono la stessa informazione lineare (I1; ROC a N barre è un filtro lineare del prezzo `[ipotesi sull'entità della correlazione, da misurare]`). | Bassa | Capitolo «livello e tendenza» che include ROC con rimando; «slancio» non è un capitolo autonomo. |

### Critica dell'Approccio C — Per catena dato → stato → indicatore → ingresso

| # | Rilievo | Gravità | Mitigazione |
|---|---|---|---|
| C1 | Lo scarto della forma completa è giusto. Il capitolo dei mattoni preso da C è utile per E2 ma deve contenere i due fatti nuovi del contratto: **valore finito dalla barra 1** (F-code-3) e **un `NaN` avvelena l'EMA per sempre** (F-code-6). Senza, il mattone «EMA» è descritto in modo incompleto. | Media | Due righe nel capitolo dei mattoni: politica di avvio (ciò che `describe()` espone prima del warm-up) e politica dei denominatori nulli (vedi «Casi limite»). |

### Critica delle Alternative dello Step 4

| # | Rilievo | Gravità | Mitigazione |
|---|---|---|---|
| 1a | **Alt. 1 (lacune).** Il criterio è verificabile sul codice: è il miglior rimedio a B1. Ma (i) L5 «grandezze senza direzione» non è una lacuna, è una proprietà di alcuni candidati: va spostata nel capitolo «Scala»; (ii) l'allocazione «3/2/1/2/1 posti per lacuna» è una scelta di valore, non un fatto. | Media | Adottare L1-L4 come criterio di appartenenza e colonna; togliere le quote; L5 nel capitolo scala (Sfida 3). |
| 1b | Le lacune sono dedotte dall'FSM; il nuovo genoma, senza stati, ha una lacuna in più che l'Alt. 1 non nomina: **l'interazione tra ingressi** (R4). | Bassa | Una frase: «le interazioni non si colmano con un ingresso; sono di R4». |
| 2a | **Alt. 2 (raggruppamento per correlazione) come struttura del documento:** è il punto in cui il catalogo sceglie guardando i dati di valutazione (Q3); aggiunge scelte di metodo non fondate (distanza `1 − |ρ|`, soglia di taglio, metodo di aggregazione) e famiglie che cambiano con i parametri. | Alta | **Non** come struttura. Tenere solo il **controllo con serie sintetica**, che il mio calcolo conferma utile: distanza 20 – MACD 5/20 = 0,938 su ENI e 0,937 su una passeggiata aleatoria (seme 7): ridondanza **di costruzione**, non del mercato. Distanza – RSI: 0,85 su ENI, 0,975 sulla passeggiata. Va nel capitolo ridondanza, con seme dichiarato. |
| 3a | **Alt. 3 (modi di fallire):** basso rischio, utile. Si sovrappone alla voce 12 «casi limite». | Bassa | Fondere: la voce 12 diventa «modi di fallire F1-F7» con una riga; F4 e F5 sono le righe obbligatorie. |
| 4a | **Alt. 4 (retina).** La fonte [S16] è stata aperta: l'abstract sostiene «normalizzazione come computazione canonica» e il corpo tratta la retina e l'adattamento alla luce (verificato). L'uso per i mercati resta `[ipotesi]`. Il rischio è per Luca: una metafora seducente può far sembrare fondato ciò che è una scelta. Inoltre «contare per tipi × velocità» contraddice la definizione di Luca (termini della somma). | Media | Al più un paragrafo nel capitolo «Scala e normalizzazione», marcato come analogia; il conteggio resta per termini. |
| 5a | **Alt. 5 (velocità a ottave).** Risolve la collisione delle velocità ma impone una spaziatura geometrica che esclude due velocità vicine; è parametrizzazione dei geni (R3). | Bassa | Una riga nel capitolo «Famiglie con parametri evolvibili», come opzione per R3. |

### Critica della «Sfida all'Architect» e dei candidati N1–N20

| # | Rilievo | Gravità | Mitigazione |
|---|---|---|---|
| S1 | Sfida 1-2-5 e N2-%B: identità ricalcolate (tabella sopra). Due formulazioni da correggere: N3 «con un giorno di ritardo» (I2) e «N2 assorbe %B» (I4). | Media | Riscrivere come in I2 e I4. |
| S2 | **Sfida 3 (grandezze senza direzione):** argomento corretto per una somma pesata con soglie fisse. Ma la proposta «forma diretta sconsigliata / forma come normalizzatore» sposta una decisione di R4 (dividere un ingresso per un altro è una trasformazione dell'ingresso, ma anche una scelta d'interazione). | Bassa | Nel catalogo: le due forme descritte; l'uso come normalizzatore proposto per N2 (che è un ingresso a sé); il resto rimandato a R4. |
| N1a | **La scala di N1 dipende dal gene `c` di due ordini di grandezza:** deviazione standard di `ln(C/EMA)` su ENI = 1,7·10⁻⁴ con `c = 0,99`, 4,9·10⁻³ con 0,73, 3,9·10⁻² con 2/21, 6,2·10⁻² con 2/51. Se `c` evolve, lo stesso peso vale cose diverse e la mutazione dei pesi ha effetti diversi: la normalizzazione di AC-04 non è fissata da una formula sola. Con `c → 1` l'ingresso tende a zero (EMA = prezzo). | Alta | Due mitigazioni da scrivere nel capitolo famiglie: (a) usare N2 (divisione per la volatilità) quando `c` evolve, oppure (b) intervallo dichiarato per `c` che escluda i valori vicini a 1 `[ipotesi sul limite, da fissare in R3]`. Il catalogo dice il fatto e le opzioni; R3 sceglie. |
| N6a | Formula EWMA verificata su [S12] con il ruolo dei pesi: `σ̃²(t+1) = (1−β)·σ̂²(t) + β·σ̃²(t)`, β peso del passato, quindi `c = 1 − β`: **orientamento corretto** (errore del ciclo 010 evitato). `λ = 0,94` resta `[fonte da verificare]` (S24). | Bassa | Nessuna oltre allo stato «secondaria» per 0,94. |
| N8a | [S12] conferma Parkinson (con `f = 0`, nessun intervallo a mercato chiuso), efficienza ≈ 5,2; Garman-Klass «best analytic scale-invariant» con 0,511 / 0,019 / 0,383 su `u, d, c` normalizzati all'apertura, efficienza ≈ 7,4; ipotesi `µ = 0`. L'`[ipotesi]` «ignorano il gap» è **in parte sostenuta**: le slide definiscono Parkinson con `f = 0` e normalizzano GK all'apertura, mentre lo stimatore combinato di GK (efficienza 6,2) include il termine chiusura-apertura. | Bassa | Scrivere così, con le tre efficienze attribuite alle slide. |
| N9a | Lemire [S13]: l'abstract dice «no more than 3 comparisons per element, in the worst case» (verificato). È un limite **per elemento**: in una singola barra si possono scartare molti elementi, quindi il costo per barra è costante solo in media (ammortizzato) `[mia lettura, articolo non letto]`. Lo Step 3 e N9 lo dicono già; va mantenuto senza scrivere «tre confronti per barra». | Bassa | Nessuna oltre alla formulazione. |
| N14a | CLV e N18 su barra piatta: `0/0` (F-code-5/6). Le due convenzioni in fonte: TA-Lib ADOSC salta la barra («only when high>low», verificato), TA-Lib STOCH pone 0 per finestra piatta (verificato). Valore `clv = 0` e «barra saltata» **non sono equivalenti** in una EMA: saltare lascia la media invariata, 0 la tira verso zero di `c`. | Media | Proposta: saltare l'aggiornamento (come ADOSC) per CLV/CMF; dichiarato nella scheda con il calcolo sulla barra 1738. |
| N16a | `ln V` su `V = 0` è `−∞` (F-code-6); la proposta `max(V, 1)` produce `ln(1/EMA(V)) ≈ −16`, un valore enorme rispetto alla dispersione abituale, che entra nella somma e nella EMA del volume. | Media | Saltare l'aggiornamento su `V = 0` anche per il volume relativo (o porre `lv = 0`), dichiarato; non usare `max(V, 1)` senza mostrarne l'effetto. |
| N17a | N17: rapporto di due EMA con lo stesso `c`, ∈ [−1, 1] corretto. Avvio: alla barra 1 il segno non esiste (nessuna chiusura precedente). | Bassa | Avvio `EMA(sgn·V) = 0`, `EMA(V) = V₁` (o salto della barra 1), dichiarato. |
| RSIa | **RSI con avvio «al primo valore» alla Consilium:** alla barra 1 non c'è ΔC, quindi `U = D = 0` e `RSI = 0/0` fino alla prima variazione non nulla; con l'avvio TA-Lib il valore non esiste prima di N barre. Entrambi i casi violano F-code-3 (finito dalla barra 1) se esposti così. | Media | La scheda dice che cosa espone l'RSI prima dell'avvio (ad es. 0 nella forma centrata) e lo marca come convenzione. Vale per ATR (TR della barra 1 = H − L, senza chiusura precedente) e per ogni indicatore a finestra. |
| T1 | **Tabella «portare/forse/escludere».** Esiti coerenti con le identità, salvo le due correzioni (N3, N2/%B). Tre «portare» (N6, N7 «in alternativa», N2) sono trasformazioni o normalizzatori, non ingressi: la tabella mescola i due ruoli. | Media | Due colonne: «ruolo» (ingresso / normalizzatore / variante) ed «esito». |
| T2 | **Conteggio del genoma** «8 pesi + bias + 2 soglie + 8 coefficienti = 19»: con due soglie il bias è ridondante (spostare tutte e tre della stessa costante non cambia le decisioni) e moltiplicare pesi e soglie per la stessa costante positiva neppure. | Bassa | Riportarlo a R3 come «19 numeri, almeno 2 gradi di libertà ridondanti» `[algebra del Critic]`. |

### Conteggio degli ingressi e famiglie evolvibili

- **Conteggio (10, fino a 12).** La proposta di 8 ingressi dell'Explorer rispetta il limite. Il rischio non è aggirarlo ma **spenderlo male**: senza la regola C2 (Q2) MACD, istogramma, %B e pendenza EMA possono occupare posti pur essendo combinazioni esatte o quasi esatte di altri (I1, I2, I4). Gravità **Media**; mitigazione: regola C2 scritta prima dell'esito, con l'identità nella scheda. Non vedo motivi per 11-12 sui fatti di oggi (concordo con lo Step 4); se il Builder li usa, la motivazione «strategica» deve essere un'informazione non coperta (una lacuna), non un nome in più.
- **`c` continuo contro finestra intera.** Concordo con la preferenza per `c` continuo; aggiungo due costi che lo Step 4 non nomina. (a) Scala (N1a). (b) Con una **finestra intera evolvibile** il warm-up cambia da individuo a individuo, quindi due genomi vengono valutati su un numero diverso di barre «affidabili»: è un fatto che R6 deve sapere (gravità **Media**, mitigazione: warm-up massimo dichiarato e comune, materia di R6). Con `c` continuo lo stesso accade in misura minore (C3: 24 barre con `c = 0,118`, 41 con Wilder 14).

### Rischio di selezione: correlazioni sull'intero snapshot (Q3, R6)

Il problema dello Step 3 (rischio 2) è reale ma di entità limitata, e i dati lo mostrano in due modi. (a) Buona parte della ridondanza è **di costruzione**: le stesse coppie hanno correlazioni simili o più alte su una passeggiata aleatoria (2a). (b) Le correlazioni **non sono stabili** tra tratti dello snapshot: distanza 20 – RSI centrato 0,77 sul primo 40 % e 0,92 sul restante 60 % (lo Step 4 riportava «cambiano poco» tra due metà con altre coppie). Scegliere gli ingressi guardando tutto lo snapshot è quindi una scelta fatta sugli stessi dati che R6 userà, e i numeri cambiano con il tratto. Gravità **Media**. Mitigazione che propongo (da porre a Luca, Q3): **identità algebriche + serie sintetica** come prova principale della ridondanza (nessun dato di valutazione); correlazioni su ENI **solo sul primo 40 %**, dichiarato, con l'impegno passato a R6 di considerarlo tratto di addestramento; l'intero snapshot solo se Luca preferisce la semplicità, con il limite scritto.

### Q1 e Q4: prezzo d'ingresso e prezzo di vendita

- **Il meccanismo di Working e Cowles è confermato da una simulazione** (non dal testo di Working, che non è accessibile: vedi fonti): passeggiata aleatoria pura con 390 passi per seduta e un passo notturno (seme 12345, 20.000 giorni), media OHLC/4 per giorno → autocorrelazione di primo ordine delle differenze **0,31**; sulle chiusure della stessa serie 0,001. Su ENI 0,23. La persistenza dei rendimenti della media OHLC/4 è quindi **in gran parte costruita dalla media**. L'`[ipotesi]` dell'Explorer sull'applicabilità alla media di quattro prezzi della barra è sostenuta dal calcolo.
- **Vantaggio «che esiste solo nel simulatore»: ridimensionato.** L'autocorrelazione della media non è sfruttabile di per sé con gli ordini attuali, perché acquisto (apertura di `t+1`) e vendita (media di `t+1`) avvengono entrambi dopo la decisione: in una passeggiata simmetrica senza deriva `E[(O+H+L+C)/4 − O] = 0` `[algebra]`. Ciò che resta è il **prezzo di vendita alla media della barra**: su ENI la media è in media −0,005 % sotto l'apertura (deviazione 0,70 %), ma condizionata a informazioni di `t` la differenza cambia segno: +0,028 % se a fine `t` la media OHLC/4 sta sopra il filtro `iir_price_1`, −0,046 % se sta sotto `[esplorativo; ≈ 2-3 errori standard]`. Ordine di grandezza: centesimi di punto per operazione, contro costi di almeno 0,29 % più la commissione minima (`trader.js`, righe 21-22 e 88-93). Quindi un rischio di **distorsione dell'esecuzione** da dichiarare, non un'anticipazione nascosta negli indicatori. Gravità **Media** per R6/E2, **Bassa** per R2.
- **Opinione del Critic su Q1 (non decide):** P1/P5 (chiusura per gli indicatori, prezzo di vendita segnalato) è la scelta più verificabile (fonti TA-Lib sulla chiusura) e non eredita la persistenza costruita della media; il costo è perdere l'identità «EMA del catalogo = filtro di Consilium», che serve solo al confronto con l'FSM e non alla scelta degli ingressi. P3 (due prezzi) è da sconsigliare per il rischio di errore in E2; P4 da escludere (gene discreto senza beneficio dimostrato).
- **Q4:** il simulatore è codice del fornitore, non modificabile senza perdere il confronto con il golden (`decisions/2026-10-11-strategy-contract`); quindi la via naturale è **rischio dichiarato a R6/E2** più la correzione della nota di memoria; un'issue a parte ha senso solo se Luca vuole un'esecuzione alternativa nel motore (non nel fornitore).

### Verifica a campione delle fonti

Esito: **12 fonti aperte**, di cui 11 leggibili; **10 sostengono l'affermazione** attribuita, **1 con riserva** (S11 per la formula di %B), **1 non leggibile** (Working). Nessuna affermazione contraddetta dalla fonte.

| Fonte | Affermazione dello Step 4 | Esito |
|---|---|---|
| [S1] TA-Lib ATR | TR, avvio con media dei primi `period` TR, ricorsione `(ATR·(period−1) + TR)/period`, Wilder, «Initial Unstable Period» | **Sostenuta** (citazioni sulla pagina). |
| [S2] TA-Lib EMA | `k = 2/(period+1)`, `EMA_t = (price_t − EMA_{t−1})·k + EMA_{t−1}`, avvio con SMA dei primi `period` valori; periodo instabile senza durata | **Sostenuta**; orientamento di `k` = `c` di Consilium confermato. |
| [S19] TA-Lib RSI | rialzi/ribassi, avvio con SMA a `t = n`, ricorsione `((n−1)·Ū + U)/n`, cita il libro di Wilder senza «Wilder smoothing» | **Sostenuta** in tutti i punti, compresa la nota sull'assenza dell'espressione. |
| [S7] TA-Lib STOCH | %K, %D, valori predefiniti 5/3/3, finestra piatta → 0, Lane non citato | **Sostenuta.** |
| [S9] TA-Lib ADOSC | EMA 3 e 10 con `k = 2/(N+1)`, aggiornamento «only when high>low», Chaikin | **Sostenuta.** |
| [S4] TA-Lib LINEARREG_SLOPE | formula con `SumX`, `SumXSqr`, `Divisor = SumX² − n·SumXSqr`; pagina senza aggiornamento incrementale | **Sostenuta**; indicizzazione `y[today−i]` (barre fa), da cui il segno del divisore; aggiornamento incrementale verificato dal Critic (C5). |
| [S11] bollingerbands.com | regola 9 (20 periodi, «two standard deviations»), 11 (2,1 a 50 periodi), 12 (SMA), 15-17 (%b), 18 (BandWidth = 4 × coefficiente di variazione), nessuna indicazione popolazione/campione | **Sostenuta**, con **riserva:** la regola 15 descrive %b come «adaptation of the formula for Stochastics» ma **non dà la formula**; `%B = (C − banda bassa)/(banda alta − banda bassa)` va scritta come derivazione, non come citazione. |
| [S12] MIT 18.S096, lez. 9 (PDF estratto e letto) | EWMA con β peso del passato; Parkinson 1976, efficienza ≈ 5,2; GK 1980 con 0,511/0,019/0,383, ≈ 7,4; `µ = 0` | **Sostenuta** (vedi N6a, N8a). |
| [S13] Lemire 2006 (abstract) | ≤ 3 confronti per elemento nel caso peggiore; Nordic Journal of Computing 13(4), 328-339 | **Sostenuta** (abstract); pagine dell'articolo da aggiungere al riferimento. |
| [S16] Carandini e Heeger | normalizzazione come computazione canonica, divisione per l'attività di un insieme di neuroni | **Sostenuta** (abstract; il corpo tratta anche retina e adattamento alla luce). Data: Nat. Rev. Neurosci. 13(1), 51-62, online il 23-11-2011 (la pagina PMC indica 2011): citare «2012 (online 2011)» è accettabile se si scrive così. |
| [S21] Cowles 1960 (abstract) | la media dentro ogni unità di una serie casuale introduce correlazione seriale positiva di primo ordine nelle differenze; Working lo segnalò | **Sostenuta** (abstract letto; nessun valore numerico). |
| [S21] Working 1960 | scheda: Econometrica 28(4), 916-918 | **Non leggibile:** la pagina non ha abstract e il testo richiede accesso (JSTOR 1907574). Ogni valore attribuito a Working (ad es. un limite numerico) resta `[fonte da verificare]`; il meccanismo è sostenuto da Cowles e dalla simulazione del Critic. |

Non riaperte da me: S3, S5, S6, S8, S10, S14, S18 (TA-Lib e `ta`), S15 (verificata nel ciclo 010), le schede S17, S20, S22-S25. Non raggiungibili nello Step 4 e non ritentate: pandas-ta (DNS) e Finch 2009.

### Casi limite, incoerenze e debito di conoscenza

1. **Valori non finiti (F-code-6).** Il rischio principale del catalogo per E2: un solo `0/0` alla barra 1738 rende `NaN` ogni EMA che lo riceve per 778 barre; la conseguenza è o il fallimento dell'intero replay a fine corsa, o un genoma che smette di operare senza segnalarlo. Gravità **Alta** (mitigazione semplice ma da applicare in ogni scheda). Mitigazione: una **politica unica** nel capitolo dei mattoni: denominatore nullo → l'aggiornamento della barra si salta (TA-Lib ADOSC); logaritmo di zero → idem; ogni scheda riporta il proprio valore sulla barra 1738, calcolato dallo script.
2. **Finito dalla barra 1 (F-code-3).** Gli avvii «SMA dei primi N» di TA-Lib non danno un valore prima di N barre: la scheda dice che cosa si espone nel frattempo. Gravità **Media**.
3. **Incoerenza «costante di tempo»** (C2): `1/c` (Step 3, AC-03), centro di massa `(1−c)/c` (Step 4), barre per il 5 % (Step 4). Gravità **Media** (il lettore trova tre numeri per la stessa cosa). Mitigazione: «età media dei dati `(1−c)/c`» come definizione, «circa `1/c` per `c` piccolo» come regola pratica, «barre per scendere sotto il 5 %» come warm-up; la tabella dei quattro coefficienti mostra tutte e tre le colonne.
4. **Correzioni puntuali agli Step precedenti:** N3 (I2), N2/%B (I4), formula di %B non presente in S11, «MACD nello spazio dei pesi» solo con velocità coincidenti (I1), conteggio del genoma con gradi di libertà ridondanti (T2). Nessun errore di orientamento di `c` negli Step 2-4: tutte le formule rilette usano `c` come peso del dato nuovo (F-code-1, S2, S12).
5. **Memoria inesatta:** `knowledge/consilium-trader-order-timing` (F-code-4). Da correggere allo Step 10; il catalogo cita il codice, non la nota.
6. **Debito di conoscenza:** testi originali non letti (Wilder, Appel, Lane, Granville, Chaikin, Kaufman, Parkinson, Garman-Klass, Working); `λ = 0,94` solo secondario; la durata del «periodo instabile» di TA-Lib non è documentata sulle pagine; l'entità della ridondanza ROC-distanza non misurata; la causa della barra piatta e del giorno mancante (14-08-2023) non nota. Vanno in «Che cosa non si è potuto accertare».
7. **Script del Critic non persistenti:** i numeri di questo step sono di controllo; il Builder li rigenera in `ref/` e lo Scientist in `verify/`, senza copiarli da qui.

### Classifica degli approcci per rischio (dal più alto al più basso)

1. **Alternativa 2 come struttura del documento** — sceglie guardando i dati di valutazione e introduce scelte di metodo non fondate; recuperabile solo come controllo con serie sintetica.
2. **Approccio A da solo** — volume (A1) e tabella larga (A2); è la base delle schede, non dell'impianto.
3. **Approccio B con famiglie come giudizio e quote per famiglia** — può predeterminare l'esito (B1).
4. **Alternativa 4** — metafora che rischia di sembrare una prova e contraddice il conteggio di Luca.
5. **Alternativa 1** — criterio verificabile; rischio solo nelle quote e in L5.
6. **Alternativa 5** — fuori perimetro ma innocua come nota per R3.
7. **Alternativa 3** — basso rischio, fondibile nella voce 12.
8. **Approccio C** — basso rischio perché già scartato nella forma completa.

### Verdetto

**Inaccettabili:**
- **Alternativa 2 come impaginazione per gruppi di correlazione:** distorsione di selezione e metodo arbitrario. Accettabile come controllo (serie sintetica, seme dichiarato).
- **Le formulazioni «N2 assorbe %B» e «N3 = N1 con un giorno di ritardo»:** non sostenute dal calcolo (I2, I4). Accettabili corrette.
- **Qualunque scheda che non dichiari il comportamento sulla barra 1738 e alla barra 1:** con il validatore attuale porta a un replay fallito o a un genoma silenziosamente fermo (F-code-3, F-code-6).

**Accettabili con mitigazioni:** la raccomandazione dello Step 3 (B nell'impianto, schede di A, mattoni di C) con il criterio delle lacune dell'Alt. 1 (B1, 1a), il formato compatto (A1, A2) e i due fatti del contratto nei mattoni (C1); Alt. 3 fusa nella voce 12; Alt. 4 e Alt. 5 come paragrafi; la tabella dei candidati con le correzioni S1, N1a, N14a, N16a, RSIa, T1, T2.

### Raccomandazione operativa per lo Step 7 (BUILDER)

**Prima di scrivere**
- Creare la cartella persistente dello Step 3 (`/home/luca/Workspace/swarmtrader-r2-work/`) e rigenerare lì, in `ref/`, i calcoli di questo step (identità I1-I4, conversioni C1-C5, barra 1738, serie sintetica con seme), oltre al dataset esteso.
- Raccogliere le fonti con lo stato letta / solo scheda / non letta; per S11 scrivere la formula di %B come derivazione; Working come «non letto, testo non accessibile».

**Struttura del documento** `docs/architecture/genome-indicators-catalog.md`, in questo ordine:
1. **In breve** (per ultimo): tabella corta degli ammessi, conteggio rispetto a 10/12, domande per Luca. **Tenere.**
2. **Metodo, notazione, tempo:** regola del tempo con **le tre righe nuove** — acquisto all'apertura di `t+1`, vendita alla media OHLC/4 di `t+1`, stop e take profit al prezzo di soglia (F-code-4); `describe()` finito dalla barra 1 (F-code-3). **Aggiungere.**
3. **Prezzo di ingresso e quattro filtri IIR:** tabella dei coefficienti con `1/c`, centro di massa, `−1/ln(1−c)`, barre per il 5 % (C2-C4); decisione aperta Q1 con P1-P5 e il fatto della simulazione (0,31 su passeggiata aleatoria). **Cambiare:** definizione unica di costante di tempo.
4. **Mattoni di stato:** i cinque dello Step 3 più **politica di avvio** e **politica dei denominatori nulli** (salto della barra), con il calcolo sulla barra 1738. **Aggiungere.**
5. **Schede per lacuna/famiglia** (titolo di famiglia, criterio = lacuna L1-L4 colmata): schede piene per le dieci obbligatorie e per N1, N6, N9, N14, N16, N17 (N7 e N18 come varianti delle schede ATR e CMF; N2 come trasformazione nel capitolo scala; RSI con l'identità I3 e l'efficienza di Kaufman come variante); righe «variante / perché no» per N3 (motivo I2), N4, N5, N8, N10, N12, N13, N15, N19, N20 e gruppo E. Schema a voci fuse (A1); voce 12 = modi di fallire (Alt. 3). **Cambiare.**
6. **Scala, normalizzazione e ridondanza:** grandezze senza direzione (Sfida 3, ex L5); dipendenza della scala da `c` (N1a); identità I1-I4 come prima prova di ridondanza; serie sintetica come seconda; correlazioni ENI secondo la risposta a Q3. Alt. 4 al più in un paragrafo marcato come analogia. **Cambiare.**
7. **Famiglie con parametri evolvibili:** `c` continuo contro finestra intera, con i due costi (scala, warm-up variabile per R6); Alt. 5 come opzione per R3. **Aggiungere** i due costi.
8. **Esito:** regola di conteggio (proposta C2) scritta prima della tabella; colonne «ruolo» ed «esito» (T1); colonna «lacuna»; conteggio dei geni con la nota sui gradi di libertà ridondanti (T2); «Che cosa non si è potuto accertare» (debito, punto 6).
9. **Domande per Luca, glossario, riferimenti.**

**Da rimandare:** scelta del limite di `c` (R3); politica di decisione durante il warm-up e ingressi prodotto (R4); warm-up comune e divisione dei dati (R6); qualunque modifica al prezzo di esecuzione (issue a parte, se Luca la vuole).
**Fuori dal documento, nel ciclo:** correzione di `knowledge/consilium-trader-order-timing` allo Step 10.

### Domande da porre a Luca nel documento (una frase per scelta, nella sezione d'origine e nell'elenco finale)

- **Q1 — Prezzo degli indicatori.** (a) Chiusura: valori confrontabili con le librerie e nessuna persistenza costruita dalla media. (b) Media OHLC/4: ogni EMA del catalogo coincide con un filtro di Consilium, ma i rendimenti ereditano una persistenza artificiale (0,31 su una serie casuale simulata, 0,23 su ENI). (c) Per indicatore: ognuno fedele alla propria fonte, ma due prezzi nello stesso genoma.
- **Q2 — Conteggio delle uscite.** (a) Ogni termine della somma conta uno e basta. (b) Ogni termine conta uno e non si ammette un termine che è combinazione esatta di altri già presenti (proposta del Critic). (c) Si contano i filtri distinti invece dei termini.
- **Q3 — Dati per le correlazioni.** (a) Intero snapshot ENI, con il limite scritto e passato a R6. (b) Solo il primo 40 % dello snapshot, che R6 tratterà come tratto di addestramento. (c) Identità e serie sintetica come prova principale, più (a) o (b) per le sole coppie che lo richiedono (proposta del Critic).
- **Q4 — Prezzo di vendita del simulatore** (media OHLC/4 della barra di esecuzione; stop e take profit al prezzo di soglia). (a) Rischio dichiarato a R6 ed E2, simulatore invariato. (b) Issue a parte per un'esecuzione alternativa nel motore, lasciando invariato il codice del fornitore.

### Controllo UX standing

Il ciclo produce un documento, senza campi, controlli né passi di flusso (Step 2 e Step 3 lo dichiarano): **Q3** («stato incoerente») e **Q5** («input sbagliato, output silenziosamente sbagliato») non si applicano all'interfaccia; nessun rilievo di processo. Segnalo però che lo **spirito di Q5** ricompare nel motore per E2: un indicatore `NaN` non esposto in `describe()` produce un genoma che smette di operare senza errore (F-code-6). Lo porto come requisito per le schede e per E2, non come rilievo UX.

### Nota di diversità cognitiva

Rispetto agli Step 3 e 4 questo step ha cambiato **strumento**: invece di argomentare le identità le ha ricalcolate (quattro esatte, due formulazioni da correggere), e invece di ipotizzare l'effetto della media OHLC/4 lo ha misurato su una serie senza struttura (0,31: l'effetto è di costruzione). Ha seguito **tutto** il percorso della vendita nel codice (fino a `Portfolio.remove`) e quello dei valori non finiti fino al controller, trovando due fatti che nessuno step aveva: `describe()` deve essere finito dalla barra 1, e un solo `NaN` alla barra 1738 rende inutilizzabile il replay o ferma il genoma senza errore. Ha aperto dodici fonti, una non leggibile. Ha anche ridimensionato un rischio dello Step 4 (il vantaggio «solo nel simulatore» è di centesimi di punto, non un'anticipazione) invece di amplificarlo. Limite: stesso modello degli step precedenti; l'indipendenza è di compito e di oggetto, non di mente (`patterns/independent-verification-chain-research`).

**Confidence:** Medium-High — fatti sul codice, identità, conversioni e fonti sono verificati su codice, calcolo e testo; restano non verificati i testi originali, il valore 0,94, la causa della barra piatta, e le cifre `[esplorativo]` sul prezzo di vendita dipendono da una regola di condizionamento scelta da me.

**Prossimo step:** Step 7 — BUILDER (Step 6 Destroyer omesso per track).

### Risposte dell'operatore alle domande dello Step 5 (2026-10-18)

- **Q1 prezzo degli indicatori:** **prezzo di chiusura**. Il documento dichiara il rischio del prezzo di vendita del simulatore.
- **Q2 conteggio degli ingressi:** accettata la proposta del Critic (C2): ogni termine della somma conta uno, e sono escluse le combinazioni lineari esatte di altri ingressi.
- **Q3 dati per le correlazioni:** accettata la proposta del Critic: identità algebriche e serie sintetica come prova principale; lo snapshot ENI solo come controllo di contorno dichiarato, senza guidare la scelta degli ingressi.
- **Q4 prezzo di vendita del simulatore:** segnalato come rischio a R6 ed E2, **senza toccare il codice di Consilium** e senza aprire una issue a parte.
