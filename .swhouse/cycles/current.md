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

## Step 3 — ARCHITECT: Propose Structure

**Agent:** claude-opus-5-5 (subagent)

**Input Surface Audit:** non applicabile; il ciclo produce un documento, senza UI né input (Step 2, UX Coherence Check e AC-15).

**Assunzioni**
- Il prodotto è **un solo documento** in `docs/architecture/`; le fonti si raccolgono agli Step 4–8, non qui. «Gene» = ogni numero del genoma che l'algoritmo genetico cambia (definizione del catalogo, sezione «Ingresso, parametro, gene», che il documento richiama senza ripeterla, AC-12).
- I 7 ingressi sono quelli scelti da Luca il 2026-11-09 (D1 a, D2 a, D3 b, D4 b; `memory/decisions/2026-10-18-indicator-catalog-constraints.md`), sempre attivi (risposta 1 dello Step 1). La regola di decisione di partenza è quella del catalogo: `s = somma(w_i * x_i)`, `buy` se `s > θ_alta`, `sell` se `s < θ_bassa`, `hold` altrimenti, senza bias (catalogo, «Il punteggio lineare con soglie» e cap. 6). Ogni variante della regola è di R4 e qui compare solo come dipendenza (AC-07).
- Fatti verificati sul codice in questo step (letti oggi, 2026-11-14, non a memoria):
  - **Genoma FSM.** `FIXED_GENOME` (`src/engine/genome.js`, righe 13-35): 11 scalari (4 coefficienti IIR, `buy_percent`, 4 margini, stop loss, take profit) e 9 stati. Contati con `node` sull'oggetto: **36 transizioni** (4 per ciascuno dei 9 stati, su 9 chiavi ammesse, riga 38), **135 ID di condizione** (interi 0-13, righe 66-67; da 10 a 19 per stato) e **1 azione** (`SW: buy`, riga 32). La lunghezza è variabile: le liste di condizioni cambiano lunghezza con la mutazione. Coefficienti: finiti e `0 < c < 1` (righe 85-88); le percentuali divise per 100 (`toFraction`, righe 44-47). L'assunzione dello Step 2 (11 scalari più la tabella) è confermata.
  - **Contratto.** `StrategyIndividual` costruisce il `Trader` con `buyPercent`, `stopLossPercent`, `takeProfitPercent` (`src/engine/strategy.js`, righe 36-37): il genoma nuovo deve fornire questi tre numeri, come costanti o come geni. Ordine per barra `updateIndicators` → `trader.update` → `decide()` (righe 46-55). Il GA vendorizzato chiama `parent1.crossover(parent2)`, `parent1.clone()` e `child.mutate(rate)` (`src/vendor/consilium/ga.js`, righe 116-125 e 344-351).
  - **Filtri.** `ema = ema * (1 - c) + x * c` (`src/vendor/consilium/algorithm.js`, righe 369-372): `c` pesa il dato nuovo (`knowledge/consilium-iir-filter-orientation`).
  - **Consilium `experiment/lb77`** (commit `2ec7237`, sola lettura):
    - `public/src/individual_v2.js` è per la **matrice 7×7** di Consilium 2.0 (righe 1-3), non per il genoma a 9 stati vendorizzato. `crossover` (righe 161-193): uniforme **per gene** con probabilità 0,5, stati copiati interi. `mutate` (righe 199-279): per ogni gene con probabilità `mutationRate` un passo **uniforme assoluto**; coefficienti IIR ±0,05 con clamp a [0,01; 1,0] (righe 203-214), margini ±0,01 senza clamp (217-228), `buy_percent` ±5 in [1; 100], stop loss ±2,5 in [0,1; 90], take profit ±2,5 in [0,1; 50] (231-239). **Il clamp ammette `c = 1,0`, che `genome.js` rifiuta (riga 86).**
    - `public/src/individual.js` (genoma a 9 stati): `crossover` uniforme per gene, stati copiati interi (righe 350-382); `mutate` (191-262) con `mutateFloat` (271-275) = passo uniforme di ±5 % dell'intervallo e clamp; intervalli interni in frazioni: IIR [0,001; 0,5], `buyPercent` [0,01; 0,5], stop loss [0,01; 0,2], take profit [0,01; 0,5] (righe 195-237; `toJSON` moltiplica per 100, righe 387-398). **Il genoma fisso di SwarmTrader è fuori da questi intervalli** (`iir_price_1` 0,73 e `iir_price_2` 0,99 > 0,5; `buy_percent` 0,996 > 0,5): gli intervalli di Consilium non sono una fonte per i nostri.
    - `ga/ga_v2.js`: selezione a torneo di 3 (righe 80-91), il secondo genitore scelto con un'altra fitness (righe 224-226); `crossover` uniforme per gene e per lista di condizioni (93-126); `mutation` (128-193) con passo uniforme `(rand - 0,5) / 4` = ±0,125 sui coefficienti, clamp [0,01; 1,0], probabilità 0,1 per gene (costante a riga 17); figli casuali con probabilità 1/3 o a popolazione sotto 50 (riga 217). **Nessun riconoscimento dei duplicati** in `ga_v2.js`: `SaveIndividual` salva con `Genoma.create` (righe 330-336). `db/orm.js` gestisce un `SequelizeUniqueConstraintError` sulla stringa JSON del genoma (`SaveGenoma`, righe 454-504), cioè uguaglianza **esatta del testo**; la definizione del modello letta (righe 49-52) non dichiara `unique` e `ga_v2.js` non chiama `SaveGenoma`: se il vincolo esista nello schema del database è `[fonte da verificare]`.
  - **Cartella di R2.** `/home/luca/Workspace/swarmtrader-r2-work/`: `dataset/make-toy-ohlcv.mjs` e `toy20-ohlcv.json` (20 giorni inventati, regola OHLC dichiarata in testa allo script), `ref/indicators.mjs` con N1 `dlog`, RSI centrato `rsi`, N14 `clvema`, N16 `lvol`, N17 `obvn`; il **massimo che dimentica (N10) non è in `indicators.mjs`**: esiste solo in linea in `ref/examples.mjs`, righe 123-128 (con `c` = 0,1).
- Non verificato: se lo schema SQL di Consilium abbia il vincolo `unique` (sopra); l'uso effettivo dei due file `individual*.js` nelle corse di E3; le convenzioni numeriche di RFC 8785 e FIPS 180-4 (da leggere allo Step 4).

### Riconteggio dei geni e confronto con la stima di 16

Base (regola del catalogo, nessuna scelta di R4): **7 pesi + 2 soglie + 7 parametri `c` = 16 geni**, tutti continui. Il riconteggio **conferma 16** con la scelta D4 b: il massimo che dimentica `m[t] = max(H[t], m[t-1] * (1 - c) + C[t] * c)` (catalogo, scheda N9, «Proposta») ha un solo `c` continuo al posto della finestra intera N, quindi il conto del catalogo «7 `c` continui e 1 N intero» per 8 ingressi diventa, con D3 b e D4 b, 7 `c` continui; nessun ingresso ha un secondo parametro (N1, RSI centrato, N14, N16, N17 hanno ciascuno un `c`: schede del catalogo e `ref/indicators.mjs`).

**Discrepanze trovate (da scrivere nel documento):**
1. **I 16 non contano i tre numeri che il `Trader` richiede** (`buy_percent`, stop loss, take profit; `strategy.js`, righe 36-37). Il genoma FSM li ha come geni. Se R4 li fa evolvere, il genoma è di **19**; se li fissa, restano costanti fuori dal genoma. È la dipendenza R4-1 sotto, non un errore del catalogo, ma il «16» va scritto con questa condizione.
2. **16 numeri, 15 gradi di libertà di comportamento:** moltiplicare pesi e soglie per la stessa costante positiva non cambia le decisioni (simmetria S1). Il catalogo lo dice al cap. 6 («almeno un grado di libertà ... non cambia le decisioni»); il documento lo enuncia con le condizioni esatte.
3. **Confronto con l'FSM:** 11 scalari contro 16, ma l'FSM ha anche una struttura discreta di lunghezza variabile (nel genoma fisso 36 transizioni e 135 ID di condizione). Il confronto onesto è «16 continui a lunghezza fissa» contro «11 continui più circa 170 valori discreti a lunghezza variabile», non 16 contro 11.

Geni possibili dalle scelte di R4 (non contati nei 16): `buy_percent`, stop loss, take profit (0 o 3); isteresi (0, 1 o 2); ATR normalizzato come divisore o fattore (0, 1 o 2: il suo `c` ed eventualmente un esponente o un peso); regola sull'avvio (0 o 1). Intervallo totale: da 16 a circa 24 `[conteggio dell'autore, dipende da R4]`.

### Scomposizione in componenti

Undici componenti; le dipendenze vanno dall'alto in basso. 1, 2 e 11 sono il percorso di lettura di Luca; 3–8 il corpo che E2 ed E3 consultano.

1. **In breve (riassunto per la decisione)** (AC-01, AC-12, AC-13). Che cosa si sceglie (l'approccio di codifica, la strategia dei vincoli, gli operatori, la forma canonica), la tabella corta dei geni con il totale (16, con le condizioni del riconteggio), le opzioni con un criterio per scegliere e la proposta dell'autore, le domande per Luca. Si scrive per ultimo e si prova da solo con il lettore simulato (`patterns/two-round-independent-simulated-reading`).
2. **Che cosa c'è già e che cosa aggiunge R3** (AC-12). Due paragrafi con collegamenti: genoma, gene, incrocio e mutazione (guida 1.5 e 2.4.3-2.4.4, catalogo «Ingresso, parametro, gene»), punteggio e soglie (catalogo «Il punteggio lineare con soglie»), memoria e scala di `c` (catalogo 2.2, 5.3). Notazione unica del documento: `x_1 … x_7` gli ingressi nell'ordine fisso della tabella, `w_i`, `c_i`, `θ_alta`, `θ_bassa`; regola del tempo richiamata, non rispiegata.
3. **Tabella dei geni** (AC-01, AC-02). Una riga per gene, in ordine fisso: indice, nome nel codice, significato in una frase, tipo (tutti continui), intervallo, unità (adimensionale per pesi e soglie; `c` adimensionale con la sua età media `(1 - c) / c` in barre, `knowledge/ema-period-conversions`), valore di esempio, origine dell'intervallo (codice, fonte o `[ipotesi]`), vincoli in cui entra. Righe nell'ordine: `w_1 … w_7`, `θ_alta`, `θ_bassa`, `c_1 … c_7`. Totale 16 e i tre confronti del riconteggio (catalogo, FSM, R4). Sotto la tabella: **ingresso con peso nullo** (AC-02): il suo `c` non conta più, ed entra nella forma canonica (S4); un peso piccolo ma non nullo **non** rende il `c` irrilevante, e la forma canonica non lo tratta come nullo.
4. **Vincoli di validità** (AC-03). Elenco chiuso, ciascuno con la ragione e almeno due strategie (riparazione, rifiuto e nuovo tentativo, riparametrizzazione):
   - V1 `0 < c_i < 1` per ogni `i` (`genome.js`, righe 85-88; `c` = 1 annulla la memoria e la distanza N1, catalogo 5.3); in pratica un intervallo più stretto `[c_min, c_max]` `[ipotesi, da fissare allo Step 7 con l'avvio massimo di R6]`.
   - V2 `c_1 > c_2` (veloce sopra lenta): toglie la simmetria di scambio S2, non solo un ordine di nomi.
   - V3 `θ_bassa < θ_alta`: con `θ_bassa ≥ θ_alta` le zone di `buy` e `sell` si sovrappongono e la decisione dipende dall'ordine dei controlli in `decide()`. Variante più forte (guida 4.6.1): `θ_bassa < 0 < θ_alta`; è una scelta di espressività (vieta strategie che comprano con punteggio neutro), quindi **domanda Q1**.
   - V4 tutti i geni finiti (come `assertFinite`, `genome.js` 40-42).
   - V5 dipendenti da R4 (ad es. stop loss e take profit positivi, isteresi non negativa): elencati, non fissati.
5. **Operatori** (AC-04). Pseudocodice non ambiguo di inizializzazione, incrocio e mutazione; scala del passo **per gene** con il motivo (per `c` in età media logaritmica, perché un passo di -0,05 sposta l'età media di `c` = 0,99 da 0,01 a 0,06 barre e quella di `c` = 0,10 da 9 a 19 barre `[calcolo dell'autore, da rifare in ref/]`; per i pesi relativo alla scala dell'ingresso, perché la scala di N1 dipende da `c`, catalogo 5.3). Confronto riga per riga con Consilium (fatti sopra): incrocio uniforme per gene, passo uniforme assoluto, clamp che ammette `c` = 1. Opzioni di incrocio da valutare con l'Explorer: uniforme per gene; **per ingresso** (la coppia `(w_i, c_i)` passa intera da un genitore, perché un peso ha senso solo con il suo `c`); aritmetico o SBX. Per ogni operatore la **prova di validità**: «operatore seguito dalla strategia del componente 4 → genoma che soddisfa V1-V4», mostrata a parole e controllata da script su molte estrazioni.
6. **Simmetrie** (AC-05). Ciascuna con l'enunciato esatto, la prova in due righe e la verifica numerica:
   - **S1 scala comune.** `(w, θ_alta, θ_bassa) → k * (w, θ_alta, θ_bassa)` con `k > 0` lascia invariate tutte le decisioni su ogni serie, perché `s > θ` equivale a `k s > k θ`. Condizioni: regola senza bias né altri termini non omogenei; aritmetica esatta. In virgola mobile è esatta per `k = 2^m` (moltiplicare per una potenza di 2 non arrotonda, salvo overflow o underflow, e la somma scalata arrotonda nello stesso modo); per gli altri `k` le decisioni possono differire solo quando `s` dista da una soglia meno dell'errore di arrotondamento `[ipotesi, da misurare allo Step 9]`. Dipende da R4: un'isteresi in unità assolute o una funzione non lineare del punteggio (ad es. una saturazione) la rompono o la cambiano.
   - **S2 scambio veloce-lenta.** Scambiare `(w_1, c_1)` con `(w_2, c_2)` dà lo stesso punteggio, perché `x_1` e `x_2` sono la stessa formula con un `c` diverso e lo stesso avvio. Tolta da V2.
   - **S3 velocità coincidenti.** Con `c_1 = c_2` gli ingressi 1 e 2 sono uguali e conta solo `w_1 + w_2` (una retta di genomi equivalenti). V2 stretto la esclude; velocità quasi uguali danno genomi quasi equivalenti, non riconosciuti.
   - **S4 peso nullo.** `w_i = 0` rende `c_i` irrilevante. Condizione: `x_i` sempre finito, perché `0 * NaN = NaN` (regola di salto del catalogo 3.3, `knowledge/eni-flat-bar-and-non-finite-indicators`), e `x_i` usato solo dentro la somma (falso se R4 lo riusa, ad es. come divisore).
   - **S5 tutti i pesi nulli.** `s = 0` sempre: la decisione dipende solo dai segni delle soglie (con `θ_bassa < 0 < θ_alta` sempre `hold`); tutti questi genomi sono equivalenti qualunque siano i `c`.
   - **Non riconosciute** (da dichiarare, AC-06): soglie fuori dal campo che il punteggio raggiunge sui dati (alcuni ingressi sono limitati, ad es. RSI centrato in [-1, 1], distanza dal massimo ≤ 0, ma N1 e N16 no); genomi che decidono uguale solo su ENI; equivalenze solo durante l'avvio; quasi-identità tra ingressi molto correlati. Da verificare dal Critic: che tra i 7 ingressi con `c` distinti non esista una combinazione lineare esatta (la regola C2 del catalogo lo esclude per le identità note I1-I5, `knowledge/indicator-algebraic-identities`) `[ipotesi]`.
7. **Forma canonica, serializzazione e hash** (AC-06). Passi in ordine fisso: validazione (V1-V4); S2 (già garantita da V2); S5 (classe speciale con forma propria); S4 (`c_i` sostituito da un segnaposto dichiarato quando `w_i = 0`); S1 (divisione di pesi e soglie per una norma: massimo dei valori assoluti o norma euclidea, da confrontare allo Step 4-5); **quantizzazione** a un numero dichiarato di cifre significative (con il suo prezzo: unisce genomi diversi sotto quella precisione e può separare due genomi a cavallo di un arrotondamento; domanda Q3); `-0` → `0`; serializzazione JSON canonica (RFC 8785) con campo di versione dello schema e chiavi fissate; hash SHA-256 (FIPS 180-4) in esadecimale. Dichiarazioni obbligatorie: che cosa non riconosce (componente 6), che i duplicati sono **segnalati e non eliminati** (risposta 2), che eliminarli è di E3 (#13), e che la forma canonica serve all'hash e non cambia il genoma che evolve (salvo l'approccio B, sotto).
8. **Dipendenze da R4** (AC-07). Tabella: scelta di R4 → opzioni → effetto su geni, vincoli, simmetrie e forma canonica. Righe: R4-1 `buy_percent`, stop loss, take profit (costanti, evoluti, assenti dove il `Trader` lo permette: +0 o +3 geni, V5, nessun effetto su S1 perché non toccano il punteggio); R4-2 numero di soglie e isteresi (isteresi relativa alla scala delle soglie conserva S1, assoluta la rompe); R4-3 ATR normalizzato come divisore di un ingresso o fattore del punteggio (un divisore positivo comune conserva S1, un divisore di un solo ingresso no; +1 o +2 geni); R4-4 decisione durante l'avvio (eventuale gene intero o costante); R4-5 eventuali ingressi prodotto. Nessuna riga decide per R4.
9. **Esempi lavorati** (AC-08). Cinque esempi richiesti dall'AC più uno: E1 genoma completo; E2 incrocio di due genitori con le estrazioni casuali scritte; E3 mutazione con un vincolo violato e trattato (V2, e V1 nell'approccio A); E4 due genomi equivalenti per S1 (con `k = 2` e con `k = 3`) e uno per S2, stessa forma canonica e stesso hash, e le stesse decisioni sui 20 giorni; E5 due genomi diversi con hash diversi; E6 un peso nullo (S4). Numeri generati da script (piano sotto), con l'avvertenza «valori inventati».
10. **Glossario e riferimenti** (AC-11, AC-12). Termini di algoritmi genetici (gene, genotipo e fenotipo se servono, incrocio uniforme, aritmetico, SBX, mutazione gaussiana, passo, riparazione, rifiuto, riparametrizzazione, duplicato, hash, serializzazione canonica) e i pochi di finanza che ricompaiono (stop loss, take profit, quota investita); riferimenti numerati con stato letta / solo scheda / non letta.
11. **Che cosa non si è potuto accertare e domande per Luca** (AC-11, AC-16). Ogni domanda in una frase per scelta, ripetuta nella sezione dove nasce.

**Posizione nel sito.** File proposto: `docs/architecture/genome-encoding.md`, titolo «Codifica del genoma a punteggio lineare» (il prefisso `genome-` lo avvicina a rassegna, guida e catalogo). Intestazione come il catalogo (`title`, `layout: doc`, `last_verified`), blocco `<style>` locale per le tabelle larghe (`patterns/jekyll-stakeholder-docs`; la tabella dei geni ha circa 9 colonne), niente `mermaid: true`, pseudocodice in blocchi di codice con graffe singole e ricerca degli aperturi Liquid prima della consegna. Voce in `_data/docs.yml` sotto `architecture` dopo `genome-indicators-catalog` e riga in `docs/MAP.md` allo Step 7 (nessun ciclo in parallelo). **Unico tocco proposto a un documento esistente** (permesso da AC-15 se proposto qui): un collegamento al nuovo documento nel capitolo 6 del catalogo, dove dice che il conteggio «è da passare a R3». Nient'altro nel catalogo, nella guida e nella rassegna.

### Approccio A — Geni grezzi, riparazione dopo gli operatori

Il genoma è la lista dei 16 numeri come si leggono: `w_i`, `θ_alta`, `θ_bassa`, `c_i`. Gli operatori lavorano su questi numeri; dopo ogni operatore una riparazione rimette il figlio nei vincoli: V1 per riflessione o clamp in `[c_min, c_max]`, V2 **scambiando le coppie** `(w_1, c_1)` e `(w_2, c_2)` (riparazione che per S2 non cambia il comportamento), V3 scambiando le soglie. La forma canonica (componente 7) si calcola solo per l'hash.

**Pro:** il genoma è leggibile così com'è e confrontabile numero per numero con Consilium e con la guida 4.6.1; incrocio e mutazione sono quelli di Consilium con pochi cambi, quindi E3 riusa la struttura del codice esistente; la riparazione è semplice da scrivere e da verificare.
**Contro:** la riparazione per clamp accumula genomi sui bordi degli intervalli `[ipotesi, fonte da verificare allo Step 4]`; il passo su `c` in scala lineare non rispetta la memoria (componente 5); S1 lascia una direzione libera lungo cui i pesi possono derivare per mutazione senza che la fitness se ne accorga `[ipotesi]`, e due genitori equivalenti ma con scale diverse danno figli che mescolano scale incoerenti; un genoma grezzo e la sua forma canonica sono due oggetti diversi da tenere allineati.

### Approccio B — Geni riparametrizzati, vincoli impossibili da violare

Il genoma contiene numeri senza vincoli da cui si **ricavano** i parametri: per ogni `c`, il logaritmo dell'età media `τ_i = ln((1 - c_i) / c_i)` su tutta la retta reale, con `c_i = 1 / (1 + e^τ_i)` sempre in (0, 1) (V1 per costruzione, a meno dell'arrotondamento agli estremi); la velocità lenta come `τ_2 = τ_1 + e^η` (V2 per costruzione, `η` libero, spaziatura minima nulla ma mai negativa); pesi e soglie come **direzione** di norma 1 nel vettore `(w_1 … w_7, θ_alta, θ_bassa)`, riportata a norma 1 dopo ogni operatore (S1 sparisce per costruzione), oppure con `θ_alta` fissata a 1 e `θ_bassa = -e^ρ` se Luca sceglie V3 forte (15 geni, S1 e V3 per costruzione). La forma canonica coincide quasi con il genoma (restano S4, S5 e la quantizzazione).

**Pro:** nessuna riparazione: ogni operatore dà un genoma valido; la mutazione additiva su `τ` è naturalmente in scala di memoria; l'hash è quasi diretto; con `θ_alta = 1` il genoma ha esattamente un numero per grado di libertà.
**Contro:** i geni non si leggono più come «pesi» e «coefficienti»: servono tabelle di conversione e Luca legge numeri diversi da quelli del catalogo; il confronto con Consilium diventa indiretto; la normalizzazione dopo ogni operatore cambia la geometria dell'incrocio e della mutazione (un passo su un peso modifica tutti gli altri dopo la proiezione) `[ipotesi sull'effetto, da cercare in letteratura allo Step 4]`; `τ_2 = τ_1 + e^η` lega la velocità lenta alla veloce, quindi un incrocio che cambia solo `τ_1` sposta anche la lenta; `θ_alta = 1` vale solo se V3 forte è accettato.

### Approccio C — Ibrido: `c` riparametrizzati, pesi e soglie grezzi con forma canonica solo per l'hash

`c` come in B (`τ_i` in età media logaritmica; per la coppia veloce-lenta, `τ_1` e `τ_2` indipendenti con V2 riparato per scambio delle coppie come in A, oppure `τ_2 = τ_1 + e^η` come in B: opzione per il Critic); pesi e soglie grezzi come in A, con V3 riparato per scambio e un intervallo largo sui pesi; la scala comune S1 si toglie **solo** nella forma canonica per l'hash, con un'opzione dichiarata di renormalizzare anche nel genoma prima dell'incrocio (operazione che non cambia il comportamento, per S1). Il documento mostra sempre accanto a ogni `τ_i` il `c_i` e l'età media corrispondenti.

**Pro:** prende da B la parte che costa poco e serve molto (V1 senza clamp, passo su `c` in scala di memoria) e da A la parte che serve alla lettura (pesi e soglie leggibili e confrontabili con la guida e con il catalogo); l'hash non dipende da come il genoma evolve; la differenza da Consilium si riduce a due cose nominabili (la scala di `c` e la gestione di S1).
**Contro:** due meccanismi diversi da spiegare (riparametrizzazione per `c`, riparazione per V2-V3); la deriva lungo S1 resta se non si renormalizza; la renormalizzazione «facoltativa» è una scelta in più per E3.

### Raccomandazione

**Approccio C**, con la scelta tra `τ_2` indipendente e `τ_2 = τ_1 + e^η` e tra renormalizzazione sì o no lasciate al confronto dello Step 4-5. Motivo: il documento deve servire a Luca per scegliere e a E3 per scrivere gli operatori senza nuove scelte; C rende impossibile la violazione più facile da sbagliare (`c` fuori da (0, 1), proprio il difetto del clamp di Consilium che ammette 1,0) senza togliere a pesi e soglie la loro lettura diretta, e tiene la forma canonica come funzione separata, che è quanto chiede la risposta 2 (riconoscere, non eliminare). **A** resta l'alternativa se la leggibilità dei `c` grezzi conta più del passo in scala di memoria; **B** se Luca accetta V3 forte e preferisce un genoma senza gradi di libertà inutili. La scelta è di Luca (AC-13); il documento presenta i tre con un criterio per scegliere.

### Tracciabilità verso gli AC

| AC | Dove si soddisfa |
|---|---|
| AC-01 | componente 3 (tabella e totale), sezione del riconteggio (catalogo 16, FSM, R4) |
| AC-02 | componente 3 (nessun gene di presenza; peso nullo), componente 6 (S4), componente 7 |
| AC-03 | componente 4 (V1-V5, due strategie ciascuno), approcci A/B/C |
| AC-04 | componente 5; confronto con `individual_v2.js`, `individual.js`, `ga_v2.js`; `ref/check-ops.mjs` |
| AC-05 | componente 6 (S1-S5 con condizioni, non riconosciute); `ref/check-symmetry.mjs` |
| AC-06 | componente 7; `ref/genome.mjs` |
| AC-07 | componente 8 (R4-1 … R4-5) |
| AC-08 | componente 9; piano script |
| AC-09 | `verify/` in Python, senza leggere `ref/` e `out/` |
| AC-10 | componenti 1, 3, 5, 7 per il lettore simulato; `reviews/` |
| AC-11 | stato delle fonti in ogni sezione, componenti 10 e 11 |
| AC-12 | componente 2 (rimandi invece di ripetizioni), glossario |
| AC-13 | fuori dal documento, nel file del ciclo |
| AC-14 | Posizione nel sito |
| AC-15 | un solo collegamento nel catalogo, più `_data/docs.yml` e `docs/MAP.md` |
| AC-16 | componente 11 e domande ripetute nella sezione d'origine |

### Piano per script e dataset di esempio (AC-08, AC-09)

- **Cartella persistente:** `/home/luca/Workspace/swarmtrader-r3-work/`, creata in questo step con `dataset/`, `ref/`, `out/`, `verify/`, `reviews/` (`patterns/persistent-research-work-folder`) e `notes/step3-architect.md` (appunti di questo step: conteggi e fatti del codice). Script dell'autore in Node `.mjs`, come in R2 e come il codice di E2.
- **Dataset:** riuso del dataset inventato di 20 giorni del catalogo, **senza rigenerarlo**: `dataset/toy20-ohlcv.json` copiato da `/home/luca/Workspace/swarmtrader-r2-work/dataset/` con un controllo SHA-256 contro l'originale (lo script si ferma se differiscono); lo snapshot ENI letto in sola lettura per S4 (barra `2023-08-15`) e per il controllo di S1 su una serie lunga. Per le prove degli operatori serve solo il genoma, non i dati.
- **Script:**
  - `ref/genome.mjs`: schema dei 16 geni, conversioni `τ ↔ c ↔ età media`, validazione V1-V4, forma canonica, serializzazione RFC 8785, SHA-256 (con `node:crypto`).
  - `ref/indicators.mjs`: i 7 ingressi. Riusa N1, RSI centrato, N14, N16, N17 importando da `swarmtrader-r2-work/ref/indicators.mjs` in sola lettura, e **aggiunge N10** (oggi solo in linea in `examples.mjs`, righe 123-128), con un controllo che riproduca la tabella D4 del catalogo.
  - `ref/operators.mjs`: inizializzazione, incrocio, mutazione, riparazione, con un generatore pseudocasuale **dichiarato** (algoritmo e seme scritti nel documento; lezione D1 del ciclo 011).
  - `ref/examples.mjs` → `out/examples.md`: E1 (genoma con i `c` dei «parametri dell'esempio» del catalogo e N10 con `c` = 0,1; pesi a mano presi dalla sezione 7.5 del catalogo senza l'ATR; decisioni sui 20 giorni, che **differiscono** da quelle del catalogo perché cambiano due ingressi: da dichiarare), E2 incrocio con la maschera scritta, E3 mutazione con violazione di V2 (e di V1 per l'approccio A), E4 equivalenti per S1 (`k` = 2 e 3) e S2, E5 diversi, E6 peso nullo; per ciascuno forma canonica, testo serializzato e hash.
  - `ref/check-ops.mjs`: prova di proprietà, molte estrazioni (ad es. 10⁵) di incrocio e mutazione da genitori validi e ai bordi → 0 figli invalidi.
  - `ref/check-symmetry.mjs`: S1-S5 sulle decisioni, sul dataset di 20 giorni, sulla serie sintetica di R2 e su ENI; per S1 con `k` non potenza di 2 conta i giorni con decisione diversa (atteso 0 o pochissimi, da misurare, non da promettere).
  - `ref/check-doc.mjs`: aperturi Liquid, tabelle del documento uguali a `out/`, conteggio dei geni coerente in ogni punto, riferimenti definiti e citati.
- **Verifica allo Step 9 in un altro linguaggio** (`patterns/clean-room-recomputation-other-language`): lo Scientist scrive in `verify/` in Python (`python3 -I`) **dalle formule e dallo pseudocodice del documento**, senza leggere `ref/` né `out/`; ricalcola E1-E6 (gli esempi usano estrazioni scritte nel documento, quindi coincidono anche con un generatore diverso), le decisioni sui 20 giorni, la forma canonica e l'hash. Il punto più delicato è la **serializzazione dei numeri**: Python (`repr`, `json.dumps`) e JavaScript non scrivono i numeri allo stesso modo (ad es. esponenti come `1e-07` contro `1e-7`) `[ipotesi, da verificare allo Step 4 su RFC 8785]`; hash uguali nei due linguaggi sono la prova che la specifica di serializzazione è completa. Le prove di proprietà si ripetono con il generatore di Python, come controllo statistico, non estrazione per estrazione.

### Interfacce e dipendenze

- **Catalogo (`docs/architecture/genome-indicators-catalog.md`)**: R3 lo consuma (ingressi, formule, `c` di esempio, regola di salto 3.3); le formule di N10 e degli altri ingressi sono le stesse, con gli stessi simboli.
- **Contratto (`src/engine/strategy.js`, `decisions/2026-10-11-strategy-contract`)**: R3 dice che cosa `serialize()` dovrebbe restituire (il genoma, e la sua forma canonica con l'hash come dato derivato) e che `crossover`, `clone` e `mutate` sono richiesti dal GA vendorizzato; non cambia il contratto.
- **R4 (#8)**: riceve la tabella delle dipendenze (componente 8) e la regola «un termine che rompe S1 cambia la forma canonica».
- **E2 (#12)**: riceve schema, validazione, conversioni, forma canonica e hash con esempi che diventano casi di prova `[ipotesi]`. **E3 (#13)**: operatori, riparazioni, hash per segnalare i duplicati, la decisione di eliminarli. **R7 (#23)**: un eventuale ingresso binario o «cancello» si aggiunge come riga della tabella dei geni e come dipendenza; R3 non lo progetta.

### Passaggio allo Step 4 (EXPLORER): che cosa cercare

1. **Operatori a codifica reale** con fonte letta: incrocio uniforme, aritmetico (blend, BLX-α), SBX (Deb e Agrawal); mutazione gaussiana, polinomiale, con passo adattivo (regola di 1/5, auto-adattamento di Beyer e Schwefel); come le librerie note (DEAP, pymoo) li implementano e con quali parametri predefiniti (URL verificati). Incrocio per blocchi (per ingresso) e il problema del legame tra geni.
2. **Gestione dei vincoli:** riparazione (clamp, riflessione, scambio), rifiuto e nuovo tentativo, penalità, riparametrizzazione; effetti noti del clamp (accumulo sui bordi) con fonte.
3. **Scala dei parametri `c`:** mutazione in scala logaritmica o su una trasformazione logit, ed esempi di algoritmi genetici che evolvono costanti di tempo.
4. **Simmetria di scala** nei classificatori lineari a soglia e nei percettroni: invarianza per scala positiva di pesi e soglia, normalizzazione dei pesi, effetti sulla ricerca evolutiva; simmetrie di permutazione nelle reti (il «problema delle permutazioni» nella neuroevoluzione) come analogo di S2.
5. **JSON canonico e hash:** RFC 8785 (JCS) e la serializzazione dei numeri secondo ECMAScript; come scriverla in Python; FIPS 180-4 per SHA-256; alternative (hash su binario a lunghezza fissa, quantizzazione).
6. **Duplicati e diversità** nelle popolazioni: misure di diversità genotipica e di comportamento, uso di hash per i duplicati, senza decidere l'eliminazione (E3).
7. Alternative che l'issue non elenca (codifica binaria o Gray, rappresentazione per ranghi delle soglie), da valutare o scartare con motivo.

### Rischi che segnalo al Critic (Step 5)

1. **Enunciati delle simmetrie** (`errors/2026-10-18-identity-claims-imprecise`): S1 in virgola mobile, S4 con valori non finiti, S2 con avvii diversi; controllare che ogni condizione sia scritta e verificata da script e con due righe di algebra.
2. **Quantizzazione nella forma canonica:** genomi diversi sotto la precisione scelta diventano «duplicati»; genomi equivalenti a cavallo di un arrotondamento hanno hash diversi. Il documento deve dirlo con un esempio.
3. **Scelta della norma per S1** (massimo o euclidea): la radice della norma euclidea introduce arrotondamenti; il massimo dipende da quale componente vince e può cambiare con una piccola mutazione.
4. **Riparazione per scambio delle coppie veloce-lenta:** corretta per S2 solo se scambia anche i pesi; verificare che nessuna variante scambi i soli `c`.
5. **Riparametrizzazione `τ_2 = τ_1 + e^η`:** lega la velocità lenta alla veloce e cambia il significato dell'incrocio; verificare che E3 non lo scopra solo durante l'evoluzione.
6. **Intervalli dei geni senza fonte:** gli intervalli di Consilium non contengono il genoma fisso (fatti sopra); quelli della guida 4.6.1 sono un esempio. Ogni intervallo del documento deve dire da dove viene o essere `[ipotesi]`.
7. **Dipendenza da R4 sottovalutata:** il «16» senza le tre costanti del `Trader` e senza isteresi può essere letto come definitivo; il conteggio va scritto sempre con le sue condizioni.
8. **Promesse implicite:** «il passo in scala di memoria evolve meglio» senza fonte né esperimento è vietato (AC-11); i motivi degli operatori sono di validità, scala e leggibilità, non di efficacia.
9. **Serializzazione tra linguaggi:** hash diversi tra Node e Python per la scrittura dei numeri; serve una regola che non dipenda dalle funzioni di stampa di un linguaggio.
10. **Lunghezza e leggibilità:** pseudocodice e forma canonica sono la parte più tecnica; il lettore simulato deve poter capire che cosa si sceglie dal riassunto e dalla tabella dei geni.

### Domande per Luca (da questo step)

- **Q1.** Le soglie devono avere segno fisso (soglia alta positiva e bassa negativa, quindi punteggio zero = `hold`) o basta che la bassa stia sotto l'alta?
- **Q2.** Va bene che il documento conti 16 geni e tratti `buy_percent`, stop loss e take profit come un blocco di 0 o 3 geni che dipende da R4?
- **Q3.** Va bene che due genomi che differiscono solo oltre una precisione dichiarata (ad es. alla settima cifra significativa) siano segnalati come duplicati?

**Confidence:** Medium — il conteggio dei geni, gli operatori di Consilium e i fatti del contratto sono verificati sul codice; restano da verificare le fonti su operatori, vincoli e JSON canonico (Step 4), l'esistenza del vincolo `unique` nello schema di Consilium, l'effetto della virgola mobile su S1 (Step 9) e le scelte di R4 che possono aggiungere geni o rompere S1.

**Prossimo step:** Step 4 — EXPLORER
