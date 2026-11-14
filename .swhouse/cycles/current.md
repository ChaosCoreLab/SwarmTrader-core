---
cycle: 012
status: open
opened: 2026-11-14
problem: "Non è definito che cosa sia un gene nel genoma a punteggio lineare con i 7 ingressi scelti in R2, come si incrociano e mutano i genomi rispettando i vincoli di validità, né come riconoscere due genomi uguali: serve una specifica della codifica con esempi (issue #7, epica #4)"
track: M
---

## Step 1 — COORDINATOR: Open the Problem

**Agent:** claude-opus-5-5
**Instance:** ubuntu-workstation (operator: Luca)
**Issue:** [#7 R3](https://github.com/ChaosCoreLab/SwarmTrader-core/issues/7), epica [#4](https://github.com/ChaosCoreLab/SwarmTrader-core/issues/4). Repository di lavoro: SwarmTrader-core, branch `epic-genoma-non-fsm` (riallineato a `main` con fast-forward a `c778d2e` dopo il merge della PR #22).
**Track:** M — ricerca con una decisione da prendere (la codifica del genoma) e nessun codice di prodotto. **Step 4 (Explorer) incluso:** oltre all'incrocio uniforme per parametro e alla mutazione additiva con clamp usati da Consilium (`public/src/individual_v2.js`, `crossover`, `mutate`), l'Explorer cerca codifiche e operatori che l'issue non elenca (codifica reale contro binaria, incrocio aritmetico o SBX, mutazione gaussiana con passo adattivo, riparazione contro rifiuto dei figli non validi, simmetrie del punteggio che rendono uguali genomi diversi). **Step 6 (Destroyer) omesso:** nessun input esterno né superficie d'attacco; i casi limite della codifica (vincoli violati, genomi equivalenti con numeri diversi, valori non finiti) li esamina il Critic allo Step 5.
**Cicli in parallelo:** nessuno. L'ultimo ciclo in `main` è il 011 (ACCEPTED il 2026-11-14), quindi il prossimo è il 012; il ciclo vive in `current.md`.
**Stato precedente:** ciclo 011 ACCEPTED dopo la verifica di Pages (NRC-H03, registrata da Simone in `c778d2e`); issue #6 Done e chiusa.

**Problem statement**
Il ciclo 010 ha scelto la forma del genoma (punteggio lineare di indicatori con soglie, memoria solo negli indicatori; `memory/decisions/2026-10-18-genome-form-linear-score.md`) e il ciclo 011 i suoi 7 ingressi: distanza dalla EMA veloce e dalla EMA lenta, RSI centrato, distanza dal massimo che dimentica, posizione della chiusura nel giorno (smussata), logaritmo del volume relativo, OBV normalizzato (`memory/decisions/2026-10-18-indicator-catalog-constraints.md`). Non è ancora stabilito quali numeri del genoma sono geni (pesi, soglie, parametri `c` degli indicatori, eventuali scale), con quali intervalli e vincoli (ad esempio `c_veloce > c_lenta`, soglia di acquisto sopra quella di vendita), quanti sono (il catalogo stima 16, da ricontare con il `c` continuo del massimo che dimentica), come l'algoritmo genetico li incrocia e li muta senza produrre genomi non validi, e come si scrive un genoma in forma canonica per calcolarne un hash e riconoscere i duplicati, compresi genomi con numeri diversi che decidono sempre allo stesso modo (ad esempio pesi e soglie moltiplicati per la stessa costante positiva).

**Why now**
È il passo successivo della catena dopo R2: R4 (equazioni di decisione) usa i geni definiti qui, E2 (implementazione) e E3 (evoluzione in Consilium) dipendono dalla codifica, e la nuova R7 (#23, caso di studio Koncorde) ne dipende per la scelta tra ingressi binari e «cancello». I 7 ingressi sono scelti: la codifica si può fissare su un elenco concreto.

**Scope — IN**
- Che cosa è gene: indicatori attivi (presenza o assenza di un ingresso, se ammessa), parametri `c`, pesi, soglie, regola di combinazione; intervalli e vincoli di validità di ciascuno.
- Conteggio dei geni per i 7 ingressi scelti e confronto con il genoma FSM attuale.
- Operatori di incrocio e mutazione adatti al punteggio lineare; gestione dei vincoli (riparazione, rifiuto, parametrizzazione che li rende impossibili da violare); confronto con gli operatori di Consilium.
- Simmetrie e invarianze: quando due genomi diversi danno le stesse decisioni (scala comune di pesi e soglie, pesi nulli con parametri irrilevanti) e come la forma canonica le elimina.
- Serializzazione canonica (ordine dei campi, precisione numerica, formato) e hash del genoma per riconoscere i duplicati.
- Esito: specifica della codifica con esempi numerici, da portare a Luca.

**Scope — OUT**
- Le equazioni di decisione buy/stay/sell, isteresi, stop loss e take profit (R4, #8): R3 ne fissa solo la rappresentazione nel genoma, lasciando a R4 la loro forma; dove la codifica dipende da una scelta di R4, la dichiara come dipendenza aperta.
- La fitness (R5, #9) e il protocollo train/validation/test (R6, #10); la parte sui dati e sul DPI di R7 (#23).
- Qualsiasi codice in `src/`, `tests/`, `scripts/`, o in Consilium; prove su dati salvo piccoli calcoli di esempio dichiarati come tali.
- Modifiche a `archimate/**` (nessun elemento implementato cambia).
- La scelta finale della codifica: è di Luca (criterio di accettazione dell'issue).

**Estimated complexity:** Medium (spazio di scelte ampio ma ben delimitato dai 7 ingressi; servono esempi numerici verificati e un confronto puntuale con il codice di Consilium).

**Lezioni da applicare (cicli 010 e 011)**
- Lettore: Luca, formazione tecnico-scientifica, senza competenze finanziarie; italiano, matematica intermedia, termini spiegati alla prima occorrenza, fonte o `[ipotesi]` per ogni affermazione (`decisions/2026-10-11-research-document-conventions`).
- Due letture simulate indipendenti prima della consegna (`patterns/two-round-independent-simulated-reading`; `errors/2026-10-19-document-unreadable-first-independent-reading`).
- Affermazioni di identità o equivalenza formulate in modo preciso e verificate (`errors/2026-10-18-identity-claims-imprecise`): vale in particolare per le simmetrie del punteggio.
- Verifica indipendente in un altro linguaggio degli esempi numerici (`patterns/independent-verification-chain-research`, `patterns/clean-room-recomputation-other-language`); file di lavoro in una cartella persistente fuori da `/tmp` (`patterns/persistent-research-work-folder`).
- Orientamento dei coefficienti `c` verificato sul codice (`knowledge/consilium-iir-filter-orientation`, `knowledge/ema-period-conversions`).

**Context check**
- Memory lookup: `decisions/2026-10-18-genome-form-linear-score`, `decisions/2026-10-18-indicator-catalog-constraints` (7 ingressi, `c` continuo preferito alle finestre intere, 16 numeri stimati), `decisions/2026-10-11-strategy-contract`, `knowledge/indicator-algebraic-identities`, `knowledge/genome-forms-state-memory`, `knowledge/eni-flat-bar-and-non-finite-indicators`, `patterns/jekyll-stakeholder-docs`. Il catalogo `docs/architecture/genome-indicators-catalog.md` (sezione «Ingresso, parametro, gene» e capitolo 6) e la guida `docs/architecture/genome-forms-guide.md` spiegano già geni, incrocio e mutazione a livello introduttivo: R3 li specifica, non li ripete.
- Codice di riferimento: Consilium `experiment/lb77`, `public/src/individual_v2.js` (`crossover` uniforme per parametro, `mutate` additiva con clamp) e `ga/ga_v2.js`; genoma FSM vendorizzato in `src/vendor/consilium/`.
- Validation matrix: nessun deploy nuovo; il documento va pubblicato su Pages (verifica umana dopo il merge, NRC-H03 da estendere al nuovo documento se usa lo stesso stile locale).
- NRC H-item check: nessun modulo NRC (`src/engine/*`, `src/vendor/consilium/*`, `src/main.js`, `src/style.css`, `index.html`, `archimate/**`) è toccato; NRC-H03 si applica al nuovo documento dopo il merge.
- Domande aperte per Luca (da porre allo Step 2): (1) un ingresso può essere spento dall'evoluzione (gene di presenza) o i 7 ingressi sono sempre tutti attivi e un peso vicino a zero basta? (2) i duplicati vanno solo riconosciuti (hash) o anche eliminati dalla popolazione, e in quel caso conta l'uguaglianza esatta o quella «di comportamento» (stesse decisioni)?
- Fonti: lo Step 2 stabilisce quelle ammesse (letteratura sugli algoritmi genetici a codifica reale, codice di Consilium, documenti di R1 e R2).

**Esecuzione:** gli Step 2–11 sono assegnati a sub-agent quando l'operatore lo chiede; lo Step 12 aspetta la scelta di Luca (AC dell'issue). Il track, gli step omessi e lo stato si riportano a commento di #7.

**Prossimo step:** Step 2 — PRODUCT OWNER

### Risposte dell'operatore alle domande dello Step 1 (2026-11-14)

1. **Ingressi sempre attivi.** I 7 ingressi restano tutti presenti in ogni genoma; nessun gene di presenza. Un ingresso inutile si riconosce da un peso piccolo. Il genoma ha lunghezza fissa.
2. **Duplicati: uguaglianza di comportamento, solo riconosciuti.** La forma canonica toglie le simmetrie che lasciano invariate le decisioni (ad es. scala comune di pesi e soglie) e l'hash si calcola su quella; i duplicati sono segnalati, non eliminati. Se e come eliminarli dalla popolazione resta una scelta di E3 (#13).

Da portare allo Step 2 come vincoli del criterio di accettazione.

## Step 2 — PRODUCT OWNER: Define the Value

**Agent:** claude-opus-5-5
**Confidence:** Medium-High (problema delimitato dai 7 ingressi di R2 e dalle due risposte di Luca; il valore dipende da quanto R4, E2 ed E3 useranno la codifica senza riaprirla, e alcune scelte dipendono da R4, non ancora svolta).

**Chi ha il problema:** Luca (e Simone come revisore della PR), che deve fissare la codifica prima di R4 (equazioni), E2 (implementazione) ed E3 (evoluzione in Consilium); in seconda battuta chi scriverà E2 ed E3, che implementano geni, operatori e hash, e chi lavora a R7 (#23), dove la scelta tra ingressi binari e «cancello» tocca la codifica.

**Profilo del lettore** (come nei cicli 010 e 011): Luca, sviluppatore con formazione tecnico-scientifica, **senza competenze finanziarie** e senza esperienza specifica di algoritmi genetici oltre a quanto spiegato nella guida e nel catalogo. Deve poter scegliere leggendo il riassunto iniziale e la tabella dei geni; il resto è consultazione.

**Valore misurabile**
- Dopo il ciclo esiste una **tabella dei geni** completa e contata: ogni numero del genoma ha significato, intervallo, vincoli e origine, invece di una stima («16 numeri») fatta nel catalogo.
- Gli **operatori** di incrocio e mutazione sono specificati in modo che E3 li possa scrivere senza nuove scelte, e producono solo genomi validi.
- Due genomi che decidono sempre allo stesso modo hanno **lo stesso hash**: la popolazione di E3 può misurare quanta diversità reale contiene e i risultati si possono confrontare tra corse.
- Le scelte che dipendono da R4 sono **elencate come dipendenze aperte**, così R4 parte sapendo che cosa la codifica si aspetta.

**Costo del non farlo:** senza una codifica fissata, E2 ed E3 la inventerebbero nel codice. Il rischio concreto è ripetere i limiti degli operatori di Consilium (`public/src/individual_v2.js`, `crossover` uniforme per parametro e `mutate` additiva con clamp, scritti per il genoma FSM) su un genoma diverso: passi di mutazione che non rispettano la scala dei geni, figli che violano vincoli come `c_veloce > c_lenta`, e popolazioni piene di copie equivalenti (stesse decisioni, numeri diversi) che sembrano diverse. Lo si scoprirebbe solo durante l'evoluzione, con il costo di rifare corse lunghe.

**Vincoli dall'operatore**
- **7 ingressi sempre attivi**, genoma a lunghezza fissa, nessun gene di presenza (risposta 1).
- **Duplicati riconosciuti per comportamento, non eliminati** (risposta 2); l'eliminazione è di E3.
- Dal ciclo 011: ingressi sul prezzo di chiusura, `c` continuo preferito alle finestre intere, ATR normalizzato fuori dalla somma ma disponibile a R4 (`decisions/2026-10-18-indicator-catalog-constraints`).

**Criteri di accettazione**

| ID | Criterio | Priorità |
|----|----------|----------|
| AC-01 | **Tabella dei geni.** Una riga per ogni numero del genoma (pesi dei 7 ingressi, parametri `c` di ciascun indicatore, soglie, eventuali altri numeri proposti): significato, tipo (continuo o intero), intervallo ammesso, unità, valore di esempio, origine dell'intervallo (fonte, codice o `[ipotesi]`). La tabella ha un totale; il totale è confrontato con la stima di 16 numeri del catalogo (differenza spiegata) e con il numero di geni del genoma FSM attuale contato su `src/engine/genome.js`. | Must-have |
| AC-02 | **Lunghezza fissa e ingressi sempre attivi** (risposta 1): la codifica non contiene geni di presenza; il documento dice come si comporta un ingresso con peso nullo o quasi nullo (ad es. se il suo `c` diventa irrilevante) e come questo entra nella forma canonica (AC-06). | Must-have |
| AC-03 | **Vincoli di validità.** Elenco di tutti i vincoli tra geni (ad es. `0 < c ≤ 1`, `c_veloce > c_lenta`, ordine delle soglie se R4 lo richiede, pesi finiti), ciascuno con la sua ragione. Per ciascuno, la strategia proposta tra almeno due (riparazione, rifiuto e nuovo tentativo, riparametrizzazione che rende il vincolo impossibile da violare), con il motivo della scelta. | Must-have |
| AC-04 | **Operatori di incrocio e mutazione** specificati in pseudocodice non ambiguo, con la scala del passo di mutazione dichiarata **per gene** (ad es. scala logaritmica o in costante di tempo per `c`, relativa per i pesi) e motivata. Gli operatori di Consilium (`public/src/individual_v2.js`, `crossover` e `mutate`, e `ga/ga_v2.js`, citati con file e righe sul branch `experiment/lb77`) sono descritti e confrontati con la proposta. Almeno un'alternativa trovata dall'Explorer allo Step 4 è valutata (adottata o scartata con motivo). Il documento mostra che ogni operatore, seguito dalla strategia di AC-03, produce solo genomi validi. | Must-have |
| AC-05 | **Simmetrie del punteggio.** Elenco delle trasformazioni dei geni che lasciano invariate tutte le decisioni (ad es. moltiplicazione di pesi e soglie per la stessa costante positiva), ciascuna enunciata con le **condizioni esatte** in cui vale e dimostrata o verificata su esempi (lezione `errors/2026-10-18-identity-claims-imprecise`). Le simmetrie che dipendono dalle equazioni di R4 (ad es. isteresi, soglie relative) sono marcate come tali. | Must-have |
| AC-06 | **Forma canonica e hash** (risposta 2): regola che porta ogni genoma alla sua forma canonica togliendo le simmetrie di AC-05; serializzazione canonica (ordine dei campi, formato, precisione e arrotondamento dei numeri, trattamento di zero e valori limite); algoritmo di hash nominato. Il documento dichiara che cosa la forma canonica **non** riconosce (ad es. genomi diversi che decidono uguale solo sui dati osservati) e che i duplicati sono segnalati, non eliminati, lasciando la scelta a E3. | Must-have |
| AC-07 | **Dipendenze da R4 dichiarate.** Dove la codifica dipende da una scelta di R4 (numero e ordine delle soglie, isteresi, stop loss e take profit fissi, evoluti o assenti, uso dell'ATR normalizzato come divisore o fattore), il documento elenca le opzioni e il loro effetto su geni, vincoli e forma canonica, senza decidere per R4. | Must-have |
| AC-08 | **Esempi su dati dichiarati.** Un genoma completo di esempio; un incrocio tra due genitori; una mutazione con almeno un caso di vincolo violato e trattato; due genomi equivalenti per una simmetria con la stessa forma canonica e lo stesso hash; due genomi diversi con hash diversi. Gli esempi che calcolano decisioni usano il dataset inventato del catalogo, dichiarato come tale; script conservati in una cartella persistente fuori da `/tmp` (`/home/luca/Workspace/swarmtrader-r3-work/`). | Must-have |
| AC-09 | **Verifica indipendente** (`patterns/independent-verification-chain-research`, `patterns/clean-room-recomputation-other-language`): un verificatore diverso dall'autore ricalcola gli esempi di AC-08 in un altro linguaggio, controlla le simmetrie di AC-05 e la validità degli operatori di AC-04, e confronta le citazioni del codice di Consilium con i file; le differenze sono corrette o elencate prima della consegna. | Must-have |
| AC-10 | **Due letture simulate indipendenti** (`patterns/two-round-independent-simulated-reading`): un lettore simulato con il profilo dichiarato legge riassunto, tabella dei geni e almeno la sezione sugli operatori e quella sulla forma canonica; segnalazioni corrette o motivate nel file del ciclo, poi una seconda lettura da un lettore nuovo. | Must-have |
| AC-11 | **Tracciabilità e nessuna promessa.** Ogni affermazione non banale ha una fonte (riferimento bibliografico, URL verificato, `percorso/del/codice` con righe), con l'indicazione se la fonte è stata letta; il resto è `[ipotesi]`. Nessuna affermazione che un operatore o una codifica «evolve meglio» senza fonte o prova dichiarata (`decisions/2026-10-11-research-document-conventions`). | Must-have |
| AC-12 | **Leggibilità.** Italiano; matematica di livello intermedio; simboli definiti alla prima comparsa; termini di algoritmi genetici e di finanza spiegati alla prima occorrenza e raccolti in un glossario; riassunto iniziale per la decisione. Non ripete la sezione «Ingresso, parametro, gene» del catalogo né i capitoli introduttivi della guida: li richiama con un collegamento. | Must-have |
| AC-13 | **Scelta di Luca registrata** nel file del ciclo in un blocco `## Human Verification — [data]` (esecutore, oggetto, esito, note) con la codifica scelta (tabella dei geni, strategia dei vincoli, operatori, forma canonica); senza, il ciclo resta DEFERRED. | Must-have |
| AC-14 | **Pubblicazione.** Il documento sta in `docs/architecture/` con l'intestazione usata dagli altri documenti, ha una voce in `_data/docs.yml` e evita costrutti che Jekyll interpreta come Liquid (`patterns/jekyll-stakeholder-docs`). La build di Pages si verifica dopo il merge su `main` (PENDING_HUMAN, NRC-H03 estesa al nuovo documento). | Must-have |
| AC-15 | **Nessuna modifica** a `src/`, `tests/`, `scripts/`, `archimate/**`, al codice di Consilium, né ai documenti esistenti di guida, rassegna e catalogo (salvo un collegamento al nuovo documento, se l'Architect lo propone), né ai file di stato condivisi prima dello Step 12. | Must-have |
| AC-16 | **Domande aperte vicino all'argomento:** ogni domanda per Luca è scritta con una frase sola per scelta e compare sia nella sezione dove nasce sia in un elenco finale. | Should-have |

**Fonti ammesse:** letteratura sugli algoritmi genetici e sulle strategie evolutive a codifica reale (ad es. Eiben e Smith, *Introduction to Evolutionary Computing*; Deb e Agrawal per l'incrocio SBX; Beyer e Schwefel per la mutazione gaussiana con passo adattivo) `[ipotesi, fonte da verificare]` sulla reperibilità di ciascuna; documentazione di librerie note (ad es. DEAP, pymoo) per operatori e convenzioni, citata con URL verificato; il codice di Consilium (`experiment/lb77`) e di SwarmTrader; i documenti di R1 e R2. Per la serializzazione e l'hash: specifiche pubbliche (ad es. RFC 8785 per JSON canonico, FIPS 180-4 per SHA-256). **Non ammesse come prova:** affermazioni di efficacia di un operatore senza esperimento riproducibile citato.

**Out of scope**
- Equazioni di decisione, isteresi, stop loss e take profit (R4), fitness (R5), protocollo di valutazione (R6), dati e DPI di R7: R3 li tocca solo come dipendenze dichiarate (AC-07).
- Eliminazione dei duplicati dalla popolazione, dimensione della popolazione, tassi di incrocio e mutazione, selezione ed elitismo: sono parametri dell'evoluzione (E3), salvo dove servono a mostrare la validità degli operatori.
- Codice in `src/`, `tests/`, `scripts/` o in Consilium; esperimenti di evoluzione.
- La scelta finale della codifica (AC-13).

**Assunzioni**
- Il genoma FSM attuale ha 11 numeri scalari (4 coefficienti IIR, 4 margini, `buy_percent`, stop loss, take profit) più la tabella di transizione degli stati (`src/engine/genome.js`, righe 13-35) `[verificato sui campi; il conteggio dei geni della tabella si fa allo Step 3]`.
- Gli operatori di Consilium citati sono quelli del branch `experiment/lb77`, su cui E3 lavorerà `[verificato sul nome del branch, non sull'uso effettivo di ciascun file nelle corse]`.
- Le soglie del punteggio sono almeno due (acquisto e vendita) come nel catalogo; il loro numero definitivo e l'eventuale isteresi sono di R4.

**UX Coherence Check:** non applicabile. Il ciclo produce un documento; non introduce campi, controlli né passi di flusso (AC-15).

**Domande aperte per Luca:** nessuna nuova a questo step; le risposte del 2026-11-14 coprono i vincoli. Le domande sulle strategie dei vincoli e sugli operatori nascono agli Step 3–5 e vanno poste secondo AC-16.

**Prossimo step:** Step 3 — ARCHITECT
