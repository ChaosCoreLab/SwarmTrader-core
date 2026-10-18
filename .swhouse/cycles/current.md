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
