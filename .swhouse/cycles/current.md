---
cycle: 001
status: open
opened: 2026-09-28
reopened: 2026-09-29
reopened_from: archive/cycle-001.md (DEFERRED)
resume_step: 9
problem: "Valutare la completezza, fattibilita e verificabilita dei requisiti del primo PoC SwarmTrader"
---

**Track:** F — valutazione architetturale con dipendenze trasversali tra algoritmo, acquisizione dati, simulazione e interfaccia utente.

## Step 1 — Coordinator

**[COORDINATOR]:**

### Problema
Valutare se `human-interaction/01-first-poc.md` definisce requisiti sufficienti, fattibili e verificabili per avviare il PoC del trader virtuale e la relativa documentazione dell'ecosistema.

### Perche ora
La valutazione e richiesta prima di procedere con il primo PoC. Il documento coinvolge algoritmo di trading, dati storici esterni, classi riusate da Consilium, validazione delle operazioni e visualizzazioni interattive.

### Perimetro
- In scope: requisiti PO, fattibilita, architettura e implementazione del PoC, subordinata alla conferma dei criteri e alla disponibilita dei dati.
- Out of scope: trading reale, distribuzione in produzione e affermazioni di redditivita non dimostrate.

### Evidenze iniziali
- L'operatore ha fissato il cutoff dei dati al 28/09/2026 incluso; non sono ammessi record successivi.
- Il primo tentativo sulla pagina e sull'API GitLab aveva restituito HTTP 404. Il retry ha verificato l'accesso via Git (`HEAD 30ae93fca6a9a2eab59123a87f0ffdfbe993db45`) e via API usando il project ID `60593376`; la API basata sul namespace continua a restituire 404.
- `logic/scraper.js` usa `https://charts.borsaitaliana.it/charts/services/ChartWService.asmx/GetPricesWithVolume` con POST, `RequestedDataSetType: "ohlc"` e mappa le risposte in timestamp, open, high, low, close e volume. `FromDate` e `ToDate` sono null nel codice Consilium; il periodo e passato come `TimeFrame`.
- `public/src/stockStream.js` carica i dati tramite `/simulation/data/:ticker/:period/csv` dal server Consilium. La modalita browser senza backend non puo riusare invariata tale sorgente HTTP; l'astrazione `StockStream` puo invece ricevere dati gia disponibili localmente.
- `public/src/dataSource.js` usa fetch verso l'host configurato. Non e stata verificata la disponibilita CORS dell'endpoint Borsa Italiana in un browser.
- Il `README.md` remoto e ancora boilerplate del template Express, quindi non e una fonte affidabile per il comportamento effettivo di Consilium.

**Complessita stimata:** High.

### Context check
- **Memoria:** nessuna decisione o pattern preesistente nel dominio; consultate le directory `memory/decisions/` e `memory/patterns/`, entrambe senza contenuti oltre `.gitkeep`.
- **Validation matrix:** inizialmente senza target; `VALIDATOR` non è configurato in `instance.yaml`. Il fallback `SCIENTIST` ha definito target locale UI e snapshot, ma la matrice è stata completata dopo lo Step 7 e resta provvisoria: il gate pre-Builder è stato mancato.
- **NRC H-items:** nessun item H registrato; la checklist e vuota. Nessun modulo risulta associato a item NRC.
- **Diversita cognitiva:** deployment a modello singolo (`copilot`); dopo gli Step 3–6 verificare che Explorer e Destroyer aggiungano prospettive non ridondanti prima dello Step 7.

## Step 2 — Product Owner

**[PRODUCT_OWNER] (proposta da confermare e pubblicare nel backlog):**

### Utente e valore
Utente: operatore o sviluppatore che deve ispezionare in modo riproducibile il comportamento di un singolo trader virtuale sul titolo ENI. Il valore e poter associare ogni ordine al dato OHLCV, ai valori IIR e allo stato dell'algoritmo che lo ha prodotto, senza confondere un errore di visualizzazione con un errore di trading.

### Valore misurabile
Con lo stesso genoma e lo stesso snapshot OHLCV, simulazioni ripetute devono produrre la stessa sequenza ordinata di stati e operazioni. L'interfaccia deve consentire di verificare ogni operazione rispetto alla barra e allo stato corrispondenti.

### Costo del mancato risultato
Senza traccia deterministica e validazione osservabile non e possibile verificare il porting di Consilium, individuare operazioni errate o usare il PoC come base documentale affidabile.

### Criteri di accettazione proposti
1. Il PoC e fruibile come applicazione statica HTML/JavaScript nel browser; non richiede un backend applicativo durante la simulazione.
2. L'applicazione usa lo snapshot ENI con date inclusive 29/09/2016–28/09/2026, con OHLCV valido e ordinato. Ogni record contiene data, open, high, low, close e volume; dati mancanti, duplicati o malformati impediscono la simulazione con errore visibile. Lo snapshot, la provenienza e la data di acquisizione sono identificati per rendere ripetibile il run.
3. Il genoma fornito e caricato senza mutazioni; l'esecuzione non evolve una popolazione GA. Le stesse barre e lo stesso genoma producono la stessa sequenza di stati, ordini e motivazioni di uscita.
4. La semantica di transizione, prezzi di esecuzione, stop-loss, take-profit, capitale e costi e identica a quella della versione Consilium fissata come riferimento; le divergenze sono coperte da test e documentate.
5. Il grafico OHLCV mostra ogni buy e sell sul timestamp e prezzo registrati dal Trader; la sovrapposizione dei due IIR riflette i valori emessi dall'algoritmo, non una ricostruzione visiva indipendente.
6. Un controllo interattivo abilita/disabilita la sovrapposizione degli stati; i segmenti mostrati corrispondono allo stato attivo per ciascuna barra. L'utente puo avanzare la simulazione e resettarla senza cambiare genoma o dati.
7. FitnessValidator distingue almeno operazioni coerenti/incoerenti con lo stato del Trader e indica per ogni errore la regola violata. Non dichiara una strategia profittevole in assenza di una soglia di rendimento concordata.
8. La documentazione del PoC descrive setup, componenti riusati, flusso dati, regole della simulazione, test, limiti e provenienza dello snapshot.
9. La documentazione del progetto vive inizialmente in `SwarmTrader-core` ed e fruibile ai livelli funzionale, tecnico e di dettaglio. Ogni caso d'uso usa gli elementi ArchiMate minimi e viene collocato nella matrice `Service Layer` (business, application, technology, physical) × `Aspect` (motivation, active structure, behaviour, passive structure).
10. I documenti che giustificano un componente linkano l'implementazione puntuale e il codice rimanda alla documentazione pertinente; il Librarian mantiene i documenti a ogni ciclo di implementazione e qualifica.

### UX Coherence Check
**Applies:** Yes.
**Trigger:** Q1, Q3 e Q5: controlli di avanzamento/reset e overlay; dati/genoma errati potrebbero produrre grafici convincenti ma falsi.
**Findings:** La data range e il genoma sono fissi nel PoC; introdurre input indipendenti per modificarli aumenterebbe inconsistenze. Dati OHLCV invalidi o mapping OHLC errato possono produrre segnali silenziosamente falsi.
**Resolution:** Mantenere range e genoma come un'unica configurazione versionata; validare e mostrare range, numero barre e schema prima del run; bloccare con errore esplicito i dati non validi. I controlli di replay e overlay non modificano gli input della simulazione.

### Decisioni ancora richieste al Product Owner
- **Confermato dall'operatore:** usare dati fino al 28/09/2026 incluso; FitnessValidator verifica invarianti e coerenza, senza soglia ROI; mantenere semantica, capitale e costi della versione Consilium.
- La issue GitHub #1 e stata letta nel browser autenticato; il commento PO e la rettifica del cutoff sono pubblicati e verificati: https://github.com/ChaosCoreLab/SwarmTrader-core/issues/1

**Stato:** criteri PO approvati e aggiornati al cutoff 28/09/2026; Step 2 completato.

## Step 3 — Architect

**[ARCHITECT]:**

### UX Coherence Check
**Applies:** Yes.
**Trigger:** Q1 (replay, reset e overlay aggiungono controlli), Q3/Q5 (mapping o dati errati potrebbero mostrare segnali plausibili ma falsi).
**Findings:** Genoma e intervallo sono fissi e non devono diventare campi indipendenti. Lo snapshot e le barre devono essere visibili e validati prima del run; un endpoint remoto non disponibile non deve degradare silenziosamente il grafico.
**Resolution:** Nessun editor di genoma o range nel PoC. Validare schema, ordinamento, duplicati e copertura temporale prima di creare il Trader; mostrare sorgente, cutoff, prima/ultima barra e conteggio. Bloccare con errore esplicito dataset assente o non valido.

### Decomposizione e contratti
1. **Acquisizione snapshot:** script Node di aggiornamento, non server applicativo, invia POST all'endpoint Borsa Italiana gia usato da `logic/scraper.js`. Normalizza le tuple OHLC, filtra ENI per date di mercato inclusive 29/09/2016–28/09/2026 e produce un asset versionato con metadati di fonte, data e copertura effettiva.
2. **DataTrainer:** valida il dataset, applica il sottoinsieme temporale e costruisce `StockData`/`StockStream` tramite un provider in-memory compatibile con `IStockStreamProvider.read(symbol, period)`. Non esegue richieste HTTP durante la simulazione.
3. **GenomeAdapter e FixedGenomeGA:** trasforma le chiavi snake_case del JSON nel modello camelCase usato da `Genoma`/`Algorithm`; converte in frazioni i campi percentuali (`buy`, margini, stop-loss e take-profit) secondo i sample del riferimento, lasciando invariati i quattro coefficienti IIR. Un test golden deve fissare questa conversione. Il GA adapter restituisce sempre un solo `Individual` dal genoma immutabile e non invoca crossover o mutazione; non usare `LocalGA`, che genera e muta individui casuali.
4. **SimulationController:** coordina `Life`, il fixed GA e il provider. `Life.cycle()` consuma tutto lo stream nello stato FEEDING_DATA; per replay barra-per-barra il controller usa `Life.birth()`, `Life.grows()` e una chiamata a `Life.feed()` per avanzamento, acquisendo dopo ogni feed stato, IIR e operazioni del Trader.
5. **FitnessValidator:** riceve barre, stato dell'Individual/Trader e log Broker; restituisce esito e violazioni con timestamp/operazione. Controlla invarianti di posizione e coerenza temporale, non la redditivita.
6. **UI statica:** HTML/ES modules; Vite solo per sviluppo e bundle statico. Lightweight Charts rende candele OHLC, volume, IIR e marker buy/sell; controlli step, reset e visibilita stati leggono la stessa traccia prodotta dal motore.
7. **Documentazione:** `docs/` ospita i livelli funzionale, tecnico e di dettaglio, organizzati con indice Service Layer × Aspect; ogni use case ha gli elementi ArchiMate minimi, link al codice e link inverso dal componente.

### Approcci considerati
- **A — Snapshot statico + moduli browser Consilium fissati:** acquisizione dati offline, sito statico senza backend runtime, provider in-memory, fixed GA e controller incrementale. Deterministico e coerente con il PoC; richiede aggiornare lo snapshot solo quando cambia la finestra dati.
- **B — Fetch diretto dal browser verso Borsa Italiana:** evita di versionare dati, ma dipende da CORS, rete e comportamento esterno; il repository Consilium usa Axios lato server, quindi CORS browser non e dimostrato e la ripetibilita dei run si perde.
- **C — Riutilizzare `/simulation/data/:ticker/:period/csv` di Consilium:** riusa il flusso HTTP esistente, ma richiede il server Express e viola il vincolo browser-only senza backend.

### Raccomandazione
Adottare A. Fissare il riferimento Consilium al commit `30ae93fca6a9a2eab59123a87f0ffdfbe993db45`; importare solo i moduli browser necessari come dipendenza versionata e bundle-izzarli, senza esporre il backend. Aggiungere un adapter limitato per genoma fisso e replay, con i delta documentati e testati. Usare Node solo per acquisire/aggiornare lo snapshot, mai per servire l'app.

### Rischi e verifiche prima del Builder
- Il payload Consilium chiede `TimeFrame` con `FromDate`/`ToDate` null: verificare che l'endpoint restituisca la copertura storica richiesta e filtrare localmente fino al cutoff 28/09/2026; se il dato del 28 non e ancora pubblicato, dichiarare l'effettiva ultima barra senza sintetizzarla.
- La conversione percentuale snake_case → frazione e un punto di compatibilita ad alto impatto; confrontare operazioni e IIR con una traccia golden eseguita dal riferimento.
- Verificare la licenza MIT e conservare l'avviso di copyright nella dipendenza riusata.
- La matrice di validazione non ha target: il VALIDATOR deve definire test browser/static build e acquisizione snapshot prima dello Step 7.

**Confidenza:** Medium; le interfacce sono verificate nel codice, ma mancano ancora un run golden completo e un controllo di copertura del payload Borsa.

**Stato:** Step 3 completato; prossimo Step 4 — EXPLORER. Cutoff 28/09/2026 aggiornato e pubblicato nella issue #1.

## Step 4 — Explorer

**Confidence:** N/A (fase divergente).
**Assumptions:** nessuna aggiunta; le proposte non sono filtrate per fattibilita.

### Alternative 1 — Browser diretto alla sorgente
**Technique:** Challenge + first-principles inversion.
**Idea:** Rimuovere l'assunzione che lo snapshot sia necessario: il browser interroga direttamente Borsa Italiana a ogni avvio e crea la traccia nella sessione.
**Why it is worth considering:** I dati sarebbero sempre aggiornati e si eliminerebbe il processo di refresh dello snapshot.

### Alternative 2 — Pacchetto di replay verificabile
**Technique:** Analogia con campione scientifico archiviato.
**Idea:** Ogni run e un reperto autosufficiente: snapshot immutabile, genoma, commit motore, checksum, traccia e manifest; il browser riproduce il reperto senza accesso alla rete.
**Why it is worth considering:** Un revisore puo verificare anni dopo lo stesso risultato senza dipendere da endpoint o versioni mutate.

### Alternative 3 — Event ledger prima del chart
**Technique:** Random entry (event sourcing) + inversione del flusso.
**Idea:** Eseguire prima il motore completo, registrare eventi OHLCV/IIR/stato/ordini per barra e fare replay della traccia come sorgente UI, invece di pilotare il motore con ogni click.
**Why it is worth considering:** Separa calcolo e visualizzazione e permette seek, confronto e audit della timeline anche se il motore non e interattivo.

### Challenge to Architect's recommendation
L'approccio A assume che un asset scaricato e versionato sia il confine giusto. L'approccio 2 sposta il confine dal singolo CSV al run completo verificabile; se dati e motore non sono identificati con hash e versione, lo snapshot da solo non garantisce riproducibilita. L'approccio 1 sfida invece la scelta di snapshot e rende la rete una dipendenza esplicita del prodotto.

## Step 5 — Critic

**Confidence:** High.
**Assumptions:** il servizio Borsa restituisce array giornalieri; il browser resta privo di backend runtime; il genoma fornito e l'unico input.

### Approach A — Snapshot statico + moduli browser
| Finding | Severity | Mitigation |
|---------|----------|-----------|
| Endpoint `10y` restituisce ora 2,517 righe e si ferma al 25/09/2026, mentre il cutoff e 28/09. | High | Registrare copertura effettiva, filtrare UTC inclusive e non simulare dati successivi; aggiornare il reperto quando la fonte rende disponibile il 28. |
| Il genoma snake_case usa percentuali (es. buy 99.617, stop 50) mentre `Algorithm`/`Trader` usano nomi camelCase e frazioni. | Critical | Adapter esplicito e test golden per tutti i campi; nessuna divisione implicita nella UI. |
| `Life.feed()` converte eccezioni in `false`, indistinguibile dalla fine stream. | High | Rilevare l'avanzamento indice stream: `false` prima della fine e errore visibile; non dichiarare completato un replay troncato. |
| Una fixture reale inserita nel repo potrebbe violare condizioni d'uso/licenza dati non verificate. | High | Verificare i termini di riuso prima di distribuire lo snapshot; separare script di acquisizione dal dataset e mantenere fonte e timestamp. |
| Timestamp epoch e date di mercato possono differire di un giorno se convertiti nel fuso locale. | High | Interpretare e serializzare le date usando UTC, testare esplicitamente i limiti inclusivi e mostrare la copertura reale. |

### Approach B — Fetch diretto browser
| Finding | Severity | Mitigation |
|---------|----------|-----------|
| CORS o risposta del servizio puo bloccare il browser e rendere il run dipendente dalla rete. | High | Usare soltanto dopo test CORS browser e mantenere errore/fallback esplicito; non usarlo come unico percorso riproducibile. |
| Il contenuto puo cambiare tra run senza che l'utente lo rilevi. | High | Mostrare timestamp e hash dati; memorizzare snapshot immutabile per ogni run. |

### Approach C — API server Consilium
| Finding | Severity | Mitigation |
|---------|----------|-----------|
| Richiede Express e contraddice il requisito browser-only senza backend. | Critical | Rifiutato per questo PoC; tenere come strumento di acquisizione offline, non runtime. |

### Alternative Explorer
| Finding | Severity | Mitigation |
|---------|----------|-----------|
| Il browser diretto assume CORS non verificato. | High | Probe in browser prima di considerarlo supportato; rimane un fallback sperimentale. |
| Il replay di eventi puo divergere dal motore se registra stato/operazioni dopo un errore swallowed da Life. | High | Creare eventi solo dopo feed confermato; rifiutare tracce incomplete e testare cardinalita una barra per evento. |
| Un manifest piu snapshot piu trace puo diventare duplicazione di dati e versioni. | Medium | Manifest con hash riferiti agli asset canonici; generare trace, non mantenerla manualmente. |

### UX Coherence standing check
**Q3:** Sì. Un timestamp mappato nel giorno errato o una barra scartata puo disallineare trade e grafico. Mitigazione: test dei limiti UTC, controllo che ogni trade punti a una barra esistente e dettaglio timestamp/prezzo accessibile.
**Q5:** Sì. CORS, JSON malformato o replay interrotto potrebbero sembrare un run valido. Mitigazione: stati UI distinti loading/ready/running/complete/error, conteggio barre elaborate e mai mostrare complete su un errore.

### Ranking (least to most acceptable)
1. **C — API server Consilium:** non accettabile, viola l'assenza di backend runtime.
2. **B / Explorer Alternative 1 — Fetch diretto:** non affidabile senza CORS e snapshot, rete e contenuti non deterministici.
3. **Explorer Alternative 3 — Event ledger:** utile come forma di output e seek, ma necessita dello snapshot e della verifica di completezza.
4. **A + Explorer Alternative 2 — Pacchetto statico verificabile:** piu accettabile se hash, mapper golden, copertura e condizioni d'uso sono risolti.

### Verdict
**Unacceptable:** C come runtime; B come unica sorgente. **Acceptable with mitigations:** snapshot statico, manifest e trace generata, subordinati a test del mapper, rilevazione feed troncato, timezone e revisione termini dati.

## Step 6 — Destroyer

**Confidence:** High.
**Assumptions:** pagina statica senza dati sensibili; dipendenze npm fissate dal lockfile; i dati arrivano da un endpoint esterno durante l'acquisizione, non nel browser.

### Attack surface analysis
#### Snapshot statico + replay
| Vector | Severity | Exploitability | Hardening path |
|--------|----------|----------------|----------------|
| Risposta Borsa malformata, enorme o con numeri non finiti avvelena la traccia e consuma memoria. | High | Medium | Timeout, limite body/numero barre, schema numerico, bounds OHLCV, deduplica e rifiuto atomico prima di scrivere il file. |
| JSON del genoma alterato contiene chiavi o stati inattesi e produce transizioni non previste. | Medium | Low | Genoma bundled e validato contro allowlist stati/direzioni/condition id; niente import arbitrario nell'interfaccia. |
| Dipendenza chart o lockfile compromessi eseguono codice nel browser. | High | Low | Dipendenze minime e versionate, lockfile, nessun CDN runtime, audit dipendenze. |
| Un asset vecchio viene sostituito con uno nuovo senza aggiornare manifest, ma la UI continua a presentare la traccia come riferimento. | High | Medium | SHA-256 e manifest con intervallo, numero record, ultima data e commit; fallire se l'hash non combacia. |

### Fault tolerance e abuso
- Endpoint non raggiungibile: l'app continua con l'ultimo snapshot validato e ne mostra la copertura; se manca, blocca l'avvio.
- Risposta incompleta/duplicata: rifiuto del nuovo snapshot senza sovrascrivere quello valido.
- Serie manipolata: la FitnessValidator rileva invarianti e mismatch; non garantisce autenticita della fonte senza hash attendibile esterno.
- Un utente puo interpretare marker e risultato come consiglio finanziario: etichetta visibile "simulazione storica, non trading reale" e nessuna metrica chiamata "fitness profitto".
- Ripetuti click/play possono accumulare timer: un solo timer cancellabile, controller idempotente e reset che ricrea una sola Life.

### Verdict
**SURVIVES adversarial review:** conditionally. La superficie runtime locale e contenuta, ma l'integrita della sorgente dipende dal manifest e l'uso dei dati dipende da termini da verificare. Condizioni: validazione atomica, hash, errori visibili, lockfile e nota non-finanziaria; il rischio residuo e la veridicita del dato pubblicato dalla fonte.

**Stato:** Step 6 completato; Step 7 — BUILDER autorizzato a procedere con le mitigazioni elencate.

## Step 7 — Builder

**Confidence:** Medium.
**Assumptions:** Node.js 20+ per build/acquisizione; nessun backend runtime; il riferimento motore e il commit Consilium riportato allo Step 3.

### Unresolved issues
- Termini/licenza di redistribuzione del dataset Borsa non verificati; lo snapshot acquisito localmente non implica autorizzazione a pubblicarlo. Verificare condizioni del provider prima di distribuire o committare dati.
- Al 28/09/2026 22:48 CEST, l'endpoint restituisce dati solo fino al 25/09/2026. L'app mostra cutoff 28/09 e ultima barra effettiva 25/09, senza inventare barre.
- Nessuna traccia di riferimento indipendente per il genoma specifico; il confronto golden va acquisito eseguendo il riferimento Consilium sullo stesso snapshot.

### Responses to Critic findings (Step 5)
| Finding | Resolution |
|---------|------------|
| Mappatura snake_case e unità percentuali ad alto impatto | Adapter dedicato e test golden di ogni campo prima della costruzione del Genoma. |
| Life.feed assorbe eccezioni come fine stream | Il controller controlla indice e lunghezza del provider; un feed fallito prima di EOF porta a stato error, mai complete. |
| Timestamp, duplicati e copertura possono essere errati | Il downloader normalizza in UTC, filtra cutoff inclusivo, rifiuta duplicati/non finiti e verifica date prima di sostituire lo snapshot. |
| CORS e backend incompatibili | Il browser carica solo il file locale statico; endpoint e Node restano strumenti di acquisizione offline. |
| Condizioni d'uso della fonte non note | Provenienza annotata, nessun claim di redistribuzione; in attesa di verifica termini. |

### Responses to Destroyer findings (Step 6)
| Finding | Resolution |
|---------|------------|
| Payload esterno malformato o eccessivo | Timeout, limite byte, schema e range OHLCV; scrittura atomica solo dopo validazione completa. |
| Genoma/oggetti arbitrari | Genoma bundled immutabile, schema allowlisted; nessun editor/import utente. |
| Snapshot cambiato senza rilevazione | Manifest con hash SHA-256, numero barre e prima/ultima data controllati all'avvio. |
| CDN/supply chain | Dipendenza chart pinning via lockfile e bundle locale; nessun CDN runtime. |
| Replay erroneamente dichiarato completo o interpretato come consiglio | Stati espliciti e indicatore "simulazione storica, non trading reale"; nessun ROI target. |

### Implementation plan
1. Vendorizzare il sottoinsieme browser Consilium al commit fissato, conservando licenza e riferimenti.
2. Implementare downloader Borsa e snapshot schema-versioned (cutoff 28/09/2026), con validazione e hash.
3. Implementare mapper del genoma fisso e `FixedGenomeGA`; provare parametri percentuali e stati.
4. Implementare `DataTrainer`, controller incrementale basato su `Life`/`Individual`/`Trader` e `FitnessValidator`.
5. Realizzare interfaccia statica con grafico OHLCV/IIR, operazioni, stato per barra, step/reset/overlay e failure states.
6. Aggiungere test unitari, fixture breve deterministica e browser smoke test; creare docs ArchiMate, ADR e procedura operativa indicizzate in `docs/MAP.md`.

### Builder Self-Test Log
| Component | Test method | Actual output | Result |
|-----------|-------------|---------------|--------|
| Borsa endpoint | POST reale e `npm.cmd run data:update` | 2,517 barre, 29/09/2016–28/09/2026, hash registrato | PASS |
| Mapper, DataTrainer, controller, validator | `npm.cmd test` tramite task VS Code | 9 test pass, 0 fail; due replay completi producono trace deep-equal | PASS |
| UI/build/docs | Build Vite + Playwright desktop/mobile | 2,517/2,517, 74 eventi; step/reset/overlay; 0 console errors nel smoke | PASS |

### Open questions for Owner
- Nessuna domanda necessaria per il comportamento del PoC. La distribuzione del dataset resta subordinata a verifica dei termini Borsa Italiana.

**Stato:** Step 7 completato; proposta ottimizzata da Step 8 e verificata da Step 9.

## Step 8 — Optimizer

**Confidence:** High.
**Assumptions:** mantenere tutti i criteri Must-have PO; endpoint Borsa usato solo da refresh esplicito.

### Optimization findings
| Element | Issue | Action |
|---------|-------|--------|
| Traccia IIR e marker | Ricreare tutte le serie e i marker a ogni barra sarebbe quadratico | Aggiornare IIR per singola barra; ricalcolare marker storici solo quando cambia la modalità overlay; appendere marker solo per eventi/transizioni nuovi |
| Server/HTTP runtime | Consilium API Express non serve al caso d'uso statico | Rimossa dal runtime; mantenere solo provider memory-backed |
| Traccia JSON duplicata | Copiare ogni frame in un secondo asset aumenterebbe storage e fonti di verità | Rimosso; la trace resta in memoria e broker operations derivano dagli oggetti chiusi Consilium |
| Import Node/CSV non usati nel browser | Causavano dipendenze/warning Vite inutili | Rimossi dal vendor fork, delta descritta nel README vendor |
| Fonte font remota | Dipendenza runtime di rete non necessaria | Sostituita con font npm bundled |

### Revised proposal
Mantenere i moduli engine e il controller già implementati; il renderer aggiorna IIR incrementalmente e modifica i marker solo quando servono. Refresh dati, replay statico, hash e validazione restano invariati.

### What was preserved and why
`DataTrainer`, `FixedGenomeGA` e `FitnessValidator` restano separati perché hanno contratti e test distinti. `Lightweight Charts` è mantenuto per rendering finanziario con attribuzione TradingView. Il manifest resta dentro lo snapshot per rilevare alterazioni.

**Stato:** Step 8 completato; Step 9 — SCIENTIST.

## Step 9 — Scientist

**Confidence:** High per correttezza del replay sui dati disponibili; Low per diritto di redistribuzione dello snapshot.
**Assumptions:** il payload pubblico Borsa rappresenta la fonte richiesta; il browser verifica l'hash locale.

### Claims verified
| Claim | Method | Result | Confidence |
|-------|--------|--------|-----------|
| Copertura e schema snapshot | POST reale Borsa + script update | 2,517 righe OHLCV valide, nessun duplicato, prima 29/09/2016, ultima/cutoff 28/09/2026 | High |
| Replay deterministico e feed completo | Test automatico d'integrazione su snapshot reale, eseguito due volte | 2,517 frame, due trace deep-equal, nessun feed troncato, FitnessValidator valido; buy e sell/close presenti | High |
| Interfaccia e controlli | Browser localhost con Playwright; step/reset, overlay, grafico, ledger e viewport <=480 px | 7 canvas chart; nessun overflow orizzontale; 0 console errors durante smoke test | High |
| Replay completo visibile | Browser replay accelerato | Stato Completato a 2,517/2,517, ultima barra 28 set 2026, 74 eventi; 828 azioni aperte riportate come status, non liquidate artificialmente | High |
| Build statico | `npm.cmd run build` | Vite 7.3.6, asset in `dist/`, build riuscita | High |
| Vendorizzazione Consilium | Confronto SHA-256 upstream prima del fork mirato | Moduli e licenza copiati byte-identici; fork rimuove solo dead paths browser-inutili | High |

### Verification details
Il test di copertura Borsa ha inizialmente sbagliato la forma delle righe e il parser PowerShell; il mapping corretto usa array posizionali 0 e 2–6, è registrato nei failure log, e il test live ha validato date, bounds e duplicati. Il test browser completo ha raggiunto EOF e mostrato il warning di posizione residua; la presentazione è stata corretta a status informativo. I task Node continuano a stampare un errore del debugger VS Code (`NODE_OPTIONS` globale) ma i processi build/test terminano con esito positivo. La matrice è stata compilata via fallback SCIENTIST perché il ruolo VALIDATOR non è disponibile.

### Claims not verified
| Claim | Reason not verified | Future verification plan |
|-------|---------------------|--------------------------|
| Permesso di redistribuire dati Borsa nel repository o in artefatti pubblici | Pagine ufficiali cercate hanno restituito 404; nessun parere/contratto di licensing disponibile | Owner verifica termini/licenza Borsa; poi autorizza snapshot versionato o mantiene fetch locale |
| Identità bit-a-bit con una traccia storica di riferimento indipendente per questo genoma | Nessun golden output del sistema originale era stato fornito | Eseguire il riferimento Consilium al commit fissato sullo stesso snapshot e confrontare trace IIR/stato/operazioni |
| CORS diretto verso Borsa | Non necessario per architettura scelta e non verificato | Non fare fetch Borsa dal browser; il provider in-memory è il solo percorso runtime |

### Overall verdict
**Solution is:** partially verified.
**Recommended action:** proceed with conditions. PoC browser e replay sono verificati; non distribuire lo snapshot reale finché la licenza non è confermata. Il risultato golden indipendente resta da produrre.

**Stato:** Step 9 completato; prossimo Step 10 — LIBRARIAN.

## Step 10 — Librarian

**[LIBRARIAN]:**

- **Decisioni aggiunte:** `memory/decisions/2026-09-28-static-snapshot-poc.md` registra architettura offline e stato dei diritti dati.
- **Pattern aggiunto:** `memory/patterns/static-historical-replay.md` descrive acquisizione atomica/hash + provider browser in-memory.
- **Failure log:** `memory/errors/2026-09-28-terminal-control-character.md` contiene errori di toolchain/probe e il parse failure HMR; non ci sono failure applicativi rimasti senza log. Le sonde del terminale restano lessons ambientali con workaround documentato.
- **Documentazione:** `docs/MAP.md` elenca overview, use case, ADR e runbook; i diagrammi sono Mermaid; `last_verified` impostato al 28/09/2026; codice e documenti hanno link reciproci.
- **Matrice VALIDATOR:** aggiornata con target local-static-ui e data-snapshot; `provisional: true` perché il ruolo VALIDATOR manca e la matrice è stata completata dopo il gate Step 7.
- **NRC:** nessun bug di prodotto segnalato o corretto; nessun nuovo item NRC necessario. Checklist senza item H pending.

### Close checklist
- [x] `metrics/summary.yaml`: total_cycles 1, deferred 1, memory counts aggiornati, last_updated 2026-09-28.
- [x] Almeno una decisione e un pattern registrati e collegabili al ciclo.
- [x] Failure di processo/strumentazione registrati in `memory/errors/`.
- [x] Matrice di validazione aggiornata; nessun deployment di produzione aggiunto.
- [x] `docs/MAP.md` aggiornato e include i nuovi documenti.
- [x] Overview e use case architetturali verificati; ADR scritto per la decisione di snapshot.
- [x] Procedura update/build/test/run in `docs/operations/development.md`.

**Reusable summary:** per un replay browser deterministico, isolare l'acquisizione esplicita dal runtime, versionare/hashare il payload quando i diritti lo consentono, riusare il provider in-memory del motore e testare doppio replay, EOF, limiti UTC e operazioni.

**Stato:** Step 10 completato.

## Step 11 — Evolution Master

**[EVOLUTION_MASTER]:**

**Cycle quality score:** 3/5 — la struttura ha cambiato la soluzione iniziale dopo l'ispezione reale dell'endpoint e ha scoperto l'incompatibilità del provider Express con il vincolo browser-only; Explorer/Critic/Destroyer hanno prodotto rischi concreti poi mitigati. Il gate VALIDATOR non disponibile non è stato sostituito prima dello Step 7, e i limiti intermittenti dei terminali/task hanno aggiunto attrito; entrambi sono documentati e la matrice è ora provvisoria ma utile.

**Process observations:** il controllo di versione del framework non prevede l'assenza di VALIDATOR in anticipo; aggiungere un preflight automatico dei ruoli e dei task disponibili ridurrebbe il rischio di saltare il gate.

**Stato:** Step 11 completato.

## Step 12 — Arbiter

**[ARBITER]:**

**Decision:** DEFERRED

### Acceptance criteria review
| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-01 | Met | UI statica browser; nessun server applicativo durante replay. |
| AC-02 | Partial | OHLCV reale, date/cutoff/hash validati; snapshot locale ignorato da Git per licensing non confermato, quindi non ancora riproducibile da clone pulito. |
| AC-03 | Met | FixedGenomeGA, genoma profondamente immutabile; doppio replay completo deep-equal. |
| AC-04 | Partial | Classi browser e semantica riusate al commit fissato; manca confronto golden indipendente delle operazioni/IIR col run originale. |
| AC-05 | Met | Candlestick/volume/IIR e marker derivano dal frame/Broker; replay completo espone 74 eventi. |
| AC-06 | Met | Step, reset, play/pause e overlay IIR/stati verificati nel browser. |
| AC-07 | Met | FitnessValidator verifica invarianti e reporta warning open-position senza score ROI. |
| AC-08 | Met | Setup, flusso, test, limiti e provenance documentati e indicizzati. |
| AC-09 | Met | Use case ArchiMate mappato a tutti i 16 Service Layer × Aspect. |
| AC-10 | Met | Link dai documenti ai file e reverse link `@see` dal codice. |

### Evidence assessment
**Confidence in solution:** Medium.
**Evidence quality:** alta per endpoint, parsing, build, replay completo, determinismo e UI locale; insufficiente per licenza/redistribuzione e confronto golden indipendente.

### Rationale
Gli Step 7–9 hanno prodotto un PoC statico che costruisce, esegue tutti i 2,517 frame, genera 74 operazioni e mantiene determinismo tra due run identici. AC-02 resta parziale perché il dataset reale non può essere versionato o distribuito finché l'Owner non conferma i termini Borsa Italiana; AC-04 resta parziale in assenza di una traccia indipendente del riferimento. Per questi due punti non è giustificato dichiarare la consegna completa né accettare il rischio al posto dell'Owner.

### Re-evaluation condition
L'Owner verifica i termini di riuso Borsa e sceglie se autorizzare il versionamento dello snapshot o mantenere il workflow solo locale; inoltre approva/acquisisce un golden output del riferimento Consilium sul medesimo snapshot. Dopo queste decisioni, riaprire il ciclo copiando l'archivio Cycle 001 in `cycles/current.md`, mantenere `cycle: 001`, impostare `status: open` e riprendere dallo Step 9 con il confronto golden e l'aggiornamento AC-02/AC-04. Se i diritti non permettono il riuso, il Product Owner deve cambiare l'AC-02 prima di un nuovo arbitrato.

---
*Cycle 001 closed by ARBITER — 2026-09-28; decision DEFERRED.*
---

## Reopen — 2026-09-29

**[COORDINATOR]:** Ciclo 001 riaperto secondo la re-evaluation condition dello Step 12; l'archivio DEFERRED è conservato in `cycles/archive/cycle-001.md`. Si riprende dallo Step 9.

### Decisioni dell'Owner
- **AC-02 / D1:** l'Owner conferma che i termini di Borsa Italiana consentono il riuso: lo snapshot `public/data/eni-ohlcv.json` viene versionato nel repository. AC-02 resta invariato.
- **Golden AC-04:** approvato il confronto con il riferimento Consilium `30ae93f` sullo stesso snapshot.
- **Smoke browser:** approvato Playwright come devDependency per rendere ripetibile la verifica UI (`npm run test:e2e`).

### Evidenze nuove dalla revisione dello stato
- Test `npm test` 9/9 PASS e `npm run build` OK rieseguiti il 29/09/2026; snapshot locale 2,517 barre 2016-09-29 → 2026-09-28, `dataSha256 9468…4506`.
- Upstream contiene due motori: `algorithm_v2.js` usa i margini senza divisione per 100, `algorithm.js` (v1) usa frazioni. Il GA che produce genomi snake_case (`public/browser-worker.worker.js`) importa il motore v1 e costruisce l'individuo con `Individual.fromJSON(genoma, 10000)`, che divide per 100 tutti i campi percentuali. L'adapter `src/engine/genome.js` è coerente con questo percorso; va fissato da test di equivalenza e documentato in ADR.
- Gap di processo: il ciclo non era stato archiviato (corretto ora), il lavoro non era committato, lo smoke Playwright non era persistito.

### Piano di ripresa
1. Versionare snapshot e codice su branch `poc/cycle-001`.
2. Golden: test di equivalenza adapter ↔ `Individual.fromJSON` upstream; script di replay con moduli upstream non modificati (`Life.cycle()`) e confronto frame-per-frame con il controller incrementale.
3. ADR-001 addendum: scelta motore v1 vs v2.
4. Playwright e2e desktop/mobile; matrice validazione non più provvisoria; item H nella NRC per la validazione umana della UI.
5. Step 9 → validazione umana → Step 10–12.
