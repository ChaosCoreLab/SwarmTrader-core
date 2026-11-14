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

## Step 4 — EXPLORER: Generate Alternatives

**Agent:** claude-opus-5-5 (subagent)
**Confidence:** N/A (fase divergente: la fattibilità non si valuta qui)
**Assunzioni:** come nel ciclo 011, la Parte 1 contiene *approcci* alla codifica e al documento, la Parte 2 *operatori, gestione dei vincoli e tecniche di forma canonica* candidati a una sezione del documento. Letti oggi: Step 1–3 di questo file (comprese le risposte di Luca e il «Passaggio allo Step 4», punti 1-7, tutti coperti sotto); `software-house-ai/agents/02-explorer.md`; Step 4 del ciclo 011 (`archive/cycle-011.md`, righe 295-604) come modello; `/home/luca/Workspace/swarmtrader-r3-work/notes/step3-architect.md`. Non ho riletto il codice di Consilium né `src/`: uso i fatti verificati dall'Architect allo Step 3, citati con le sue righe. Tecniche usate: Challenge, Provocation, Analogies (cristallografia, chimica, grafica 3D, collaudo del software), Biomimicry (omologia nella ricombinazione, sinonimia del codice genetico), Lateral Thinking. Confini rispettati: niente equazioni di R4 (le varianti della regola compaiono solo come dipendenze), niente fitness (R5), niente protocollo dei dati (R6) né dati di R7.

**Calcolo esplorativo dichiarato.** Quattro piccoli script Node nella cartella persistente, `/home/luca/Workspace/swarmtrader-r3-work/notes/` (`step4-numfmt.mjs`, `step4-explore.mjs`, `step4-s1k.mjs`, `step4-tau-edges.mjs`; appunti in `step4-explorer.md`), con generatore dichiarato (mulberry32, semi 12345 e 777). Nessun dato di mercato: solo genomi casuali e numeri di prova. I numeri marcati `[esplorativo]` **non sono citabili nel documento**: servono al Critic e vanno rifatti in `ref/` allo Step 7 se il Builder li usa.

### Parte 1 — Approcci alternativi alla codifica e al documento

#### Alternativa 1 — Soglie come centro e semi-ampiezza, con la semi-ampiezza fissata a 1 (sfida la premessa «due soglie sono due geni»)
**Tecnica:** Challenge («perché le soglie devono essere geni?») e Lateral Thinking.
**Idea:** si riscrivono le due soglie come centro `b = (θ_alta + θ_bassa) / 2` e semi-ampiezza `h = (θ_alta - θ_bassa) / 2`. Con V3 (`θ_bassa < θ_alta`) vale `h > 0`, quindi S1 con `k = 1/h` porta **ogni** genoma valido a `h = 1` senza cambiare alcuna decisione (enunciato da verificare dal Critic: `s > b + h` equivale a `s/h > b/h + 1` per `h > 0`). Il genoma diventa `w_1 … w_7`, `b`, `c_1 … c_7`: **15 geni**, regola «`buy` se `s - b > 1`, `sell` se `s - b < -1`». V3 è soddisfatto per costruzione e S1 sparisce dal genoma, **senza** richiedere V3 forte (`θ_bassa < 0 < θ_alta`), che invece serve all'opzione dell'Approccio B con `θ_alta = 1`. V3 forte, se Luca lo vuole, diventa un intervallo su un solo gene: `-1 < b < 1`. Le soglie originali si leggono come `θ_alta = b + 1`, `θ_bassa = b - 1`, nella scala in cui la «zona di attesa» è larga 2.
**Perché vale:** toglie il grado di libertà in più di S1 (16 numeri, 15 gradi di libertà, discrepanza 2 dello Step 3) con una sola divisione, senza normalizzare pesi in modo opaco; i pesi restano leggibili come «quante semi-ampiezze sposta l'ingresso».
**Attenzione:** il gene `b` vale solo per la regola a due soglie senza bias del catalogo; con isteresi o soglie in più (R4-2) la semi-ampiezza può non essere l'unità naturale `[ipotesi]`. Il genoma «grezzo» dell'Approccio A non si scrive più.
**Per Q1:** con questa codifica V3 debole è già garantito, quindi Q1 resta solo una scelta di espressività (intervallo di `b`), non di gestione dei vincoli. **Per Q2:** il conteggio base diventa 15 (+0 o +3 dal blocco del `Trader`).

#### Alternativa 2 — Impronta di comportamento su un insieme di prova fisso, accanto all'hash strutturale
**Tecnica:** Analogies (collaudo differenziale del software: due programmi si confrontano sugli stessi ingressi; ricerca di novità, dove molti genotipi «collassano» sullo stesso comportamento [F15]) e Provocation («e se l'hash lo calcolassero le decisioni, non i numeri?»).
**Idea:** due identificatori per genoma. (a) **Hash strutturale**: quello dello Step 3 (forma canonica che toglie S1-S5, poi JSON canonico e SHA-256): riconosce le equivalenze *dimostrate*. (b) **Impronta di comportamento**: SHA-256 della sequenza di decisioni (`buy`/`hold`/`sell`, un carattere per barra) su un **insieme di prova fisso e versionato** che non sono dati di valutazione: il dataset inventato di 20 giorni del catalogo e una o più serie sintetiche con seme dichiarato. Due genomi con la stessa impronta sono «indistinguibili sull'insieme di prova», non equivalenti; due genomi con hash strutturale uguale hanno sempre la stessa impronta (controllo automatico di coerenza: se no, la forma canonica ha un errore).
**Perché vale:** copre proprio ciò che lo Step 3 dichiara non riconosciuto (soglie fuori dal campo raggiunto dal punteggio, ingressi quasi identici, equivalenze solo nell'avvio) e dà a E3 una misura di diversità «di comportamento» che non dipende dalla quantizzazione. Il controllo di coerenza tra (a) e (b) è anche un test gratuito per E2.
**Attenzione:** l'impronta dipende dall'insieme di prova (va versionato come lo schema); usare lo snapshot ENI lo farebbe dipendere dai dati di valutazione, che sono di R6, ed è escluso qui. La risposta 2 di Luca chiede la forma canonica, non un'impronta: va presentata come **complemento facoltativo**, non come sostituto (domanda Q4 sotto). Costo: una simulazione per genoma, che E3 fa comunque per la fitness `[ipotesi]`.
**Per Q3:** l'impronta non ha il problema «a cavallo di un arrotondamento» nei geni, ma ne ha uno analogo nelle decisioni (un punteggio a ridosso di una soglia cambia decisione per un arrotondamento); non elimina Q3, la sposta.

#### Alternativa 3 — Genoma su griglia di interi, forma canonica esatta per massimo comune divisore (indici di Miller)
**Tecnica:** Provocation («un genoma senza numeri in virgola mobile») e Analogies (cristallografia).
**Idea:** in cristallografia un piano si indica con tre interi `(h k l)` e i multipli descrivono la stessa famiglia di piani; la convenzione li riduce dividendo per il loro massimo comune divisore [F16]: è esattamente S1 su un vettore di interi. Tradotto: pesi e soglie (o i pesi e `b` dell'Alternativa 1) sono **interi** su una griglia dichiarata (ad es. passo 10⁻⁴ nell'unità della tabella), i `τ_i` interi su una griglia logaritmica (ad es. passo 0,01 in `ln` dell'età media). La forma canonica per S1 è «dividi per il MCD dei valori assoluti»: **esatta**, senza arrotondamenti, senza norma da scegliere (rischio 3 dello Step 3). La serializzazione contiene solo interi entro ±2⁵³, scritti uguali da ogni linguaggio (raccomandazione di RFC 8785, Appendice B [F11]): il problema Node/Python (rischio 9) sparisce.
**Perché vale:** sposta la quantizzazione **dalla forma canonica al genoma**: due genomi equivalenti per un `k` razionale che porta la griglia sulla griglia hanno lo stesso hash esatto; non esiste più «a cavallo di un arrotondamento» nell'hash (esiste nella mutazione, che è ciò che decide la griglia).
**Attenzione:** S1 con `k` irrazionale o non compatibile con la griglia non è più una simmetria *dentro* lo spazio dei genomi, quindi non va riconosciuta; la mutazione diventa un passo intero (±1 o gaussiano arrotondato); la granularità è una scelta nuova (che sostituisce quella di Q3). La codifica **binaria o Gray** (punto 7 del passaggio) è la versione «a bit» di questa idea: Deb e Agrawal descrivono i «salti di Hamming» della codifica binaria, dove un passo piccolo nei numeri richiede di cambiare molti bit [F1]; la codifica Gray li elimina per passi di una unità `[ipotesi, fonte da verificare]`. Con mutazione per passi interi e non per inversione di bit, binaria e Gray non servono: **scartate con questo motivo**.
**Per Q3:** è un'alternativa a Q3 così come è formulata (la precisione diventa del genoma, non dell'hash).

#### Alternativa 4 — Allineare i genitori prima dell'incrocio invece di imporre V2 nel genoma (omologia)
**Tecnica:** Biomimicry e Analogies (neuroevoluzione; quaternioni nella grafica 3D).
**Idea:** nella ricombinazione naturale una proteina (RecA in *E. coli*) **allinea i geni omologhi** prima dello scambio; Stanley e Miikkulainen usano l'immagine per il «problema delle convenzioni in competizione» (o «delle permutazioni»): quando la stessa soluzione ha codifiche diverse, l'incrocio produce figli danneggiati, ad es. `[A, B, C]` con `[C, B, A]` dà `[C, B, C]` [F7]. S2 è un caso minimo dello stesso problema (due convenzioni: veloce in posizione 1 o in posizione 2). Proposta: V2 **non** è un vincolo di validità del genoma (un genoma con `c_1 < c_2` decide in modo legittimo), ma una **convenzione di allineamento** applicata in due punti soli: prima dell'incrocio (si ordinano le coppie `(w, c)` di ciascun genitore) e nella forma canonica. Lo stesso per S1: prima di un incrocio aritmetico o SBX si portano i genitori alla stessa scala, come si fa con i quaternioni `q` e `-q` (stessa rotazione), che si allineano prima di interpolare `[ipotesi, fonte da verificare]`.
**Perché vale:** separa due cose che lo Step 3 tratta insieme, **validità** (V1, V3, V4: un genoma che le viola non si può valutare o è ambiguo) e **convenzione** (V2, S1: il genoma è valido, ma due convenzioni diverse rovinano l'incrocio). Una riparazione per scambio delle coppie (Approcci A e C) è già forma canonica applicata al genoma che evolve.
**Attenzione:** con `c_1 = c_2` l'ordinamento non è definito (S3): serve una regola di parità (ad es. per peso). Il nome «veloce/lenta» nella tabella dei geni perde senso se il genoma non lo garantisce: il documento lo mostrerebbe solo nella forma canonica.

#### Alternativa 5 — Lasciare libera la scala S1: è un passo di mutazione implicito (sinonimia e auto-adattamento)
**Tecnica:** Biomimicry (codoni sinonimi: genotipi diversi, stessa proteina; reti neutrali) e Analogies (strategie evolutive con passo auto-adattivo).
**Idea:** la scala comune di pesi e soglie non cambia le decisioni, ma **cambia l'effetto relativo di una mutazione additiva**: con passo assoluto `δ` su un peso, un genoma con pesi dieci volte più grandi subisce un cambiamento relativo dieci volte più piccolo (algebra: `(w + δ)/w`). La scala è quindi un **passo relativo di mutazione codificato nel genoma**, come i parametri di strategia `σ` delle strategie evolutive, che si mutano in modo log-normale e non toccano il fenotipo [F3]. La letteratura chiama *neutrali* le mutazioni che non cambiano il fenotipo [F13]; i risultati sull'effetto della neutralità sulla ricerca sono descritti come contraddittori `[fonte da verificare: frase attribuita a Poli e Galván-López, 2011, vista solo in un estratto di ricerca]`. Proposta: invece di renormalizzare (opzione dell'Approccio C), dichiarare la scala come **neutrale per le decisioni e non neutrale per gli operatori**, e scegliere esplicitamente: (i) operatori che non ne dipendono (vedi «equivarianza per S1», Parte 2, gruppo A-B), oppure (ii) operatori che la usano come passo relativo, dichiarato.
**Perché vale:** trasforma un «contro» dello Step 3 (la deriva lungo S1, Approccio A) in una proprietà da nominare e decidere. Nessuna affermazione che una delle due scelte «evolve meglio» (AC-11): la differenza è di comportamento degli operatori, verificabile a parole e con script.

### Sfida alla raccomandazione dell'Architect (Approccio C)

1. **Assunzione: «la deriva lungo S1 è un difetto, la renormalizzazione è facoltativa».** Con mutazione additiva assoluta sui pesi, la scala è un passo relativo implicito (Alternativa 5): renormalizzare o no **cambia la distribuzione dei figli**, quindi non è una scelta neutra lasciabile a E3. Emerge un criterio più preciso: un operatore `O` è **equivariante per S1** se, con le stesse estrazioni casuali, `O(k·g) = k·O(g)` per ogni `k > 0`. Se incrocio e mutazione sono equivarianti e i genitori sono alla stessa scala, la renormalizzazione non cambia il comportamento dei figli (enunciato da verificare dal Critic); se non lo sono, va decisa ora.
2. **Assunzione: «la riparametrizzazione in `τ` toglie il problema del clamp».** Lo toglie solo per l'intervallo aperto (0, 1). Lo Step 3 prevede in pratica un intervallo `[c_min, c_max]` (V1); in `τ` diventa `[τ_min, τ_max]` e il problema clamp/riflessione **ritorna**, sul nuovo gene. Senza limiti la passeggiata in `τ` diffonde: in una prova senza selezione `[esplorativo]` (passo ±0,25 su `τ`, 2000 generazioni) l'11,96 % dei `c` finisce entro 0,01 da 0 o da 1, contro il 5,08 % del clamp lineare di Consilium (che ne mette il 3,71 % *esattamente* sui bordi, l'1,84 % a `c = 1`, valore che `genome.js` rifiuta) e il 2,08 % della riflessione. Inoltre in virgola mobile `c = 1/(1 + e^τ)` vale **esattamente 1** già da `τ ≈ -36,74` e **esattamente 0** da `τ = 710` `[esplorativo, step4-tau-edges.mjs]`: V1 «per costruzione» vale solo con limiti su `τ`. Emerge: «`τ` con riflessione dentro `[τ_min, τ_max]`» come opzione da confrontare, non «`τ` senza vincoli».
3. **Assunzione: «V2 si ripara per scambio delle coppie».** È una convenzione, non un vincolo di validità (Alternativa 4): lo scambio è forma canonica applicata al genoma che evolve, il che contraddice in parte la regola di C «forma canonica solo per l'hash». Emerge: allineamento prima dell'incrocio e nella forma canonica, nessuna riparazione dopo la mutazione.
4. **Assunzione: «pesi e soglie grezzi».** Le soglie possono smettere di essere due geni (Alternativa 1): 15 geni, V3 e S1 per costruzione, senza V3 forte, con pesi ancora leggibili.
5. **Assunzione: «la quantizzazione è un'opzione da chiedere a Luca» (Q3).** Se S1 deve valere per ogni `k > 0` e non solo per potenze di 2, senza quantizzazione l'hash non riconosce quasi mai gli equivalenti: con la norma del massimo la forma canonica di `g` e di `k·g` differisce nei bit nel 95-96 % dei genomi casuali per `k` = 0,1, 1,7, 7,3 o casuale, e nel 72-98 % con la norma euclidea; per `k = 8` nello 0 %; dopo quantizzazione a 15, 12, 9 cifre significative resta diversa nel 21 %, 0,028 %, 0 % dei casi `[esplorativo, 10⁵ genomi di 9 numeri, step4-s1k.mjs]`. Curiosità da **non** generalizzare: con norma del massimo e `k = 3` 0 % su 10⁵. Emerge: la quantizzazione (o l'Alternativa 3) è **necessaria** perché S1 valga nell'hash; la domanda a Luca è *quale* precisione, non *se*.

**Che cosa emerge togliendo le cinque assunzioni** (variante «C′», materiale per il Critic, non una proposta): `τ` con riflessione in un intervallo; soglie come centro con semi-ampiezza 1 (15 geni); operatori scelti tra quelli equivarianti per S1; V2 e S1 come convenzioni di allineamento prima dell'incrocio e nella forma canonica; forma canonica solo per l'hash, con quantizzazione dichiarata; impronta di comportamento facoltativa.

### Parte 2 — Operatori, gestione dei vincoli e tecniche di forma canonica non elencati allo Step 3

Convenzioni: «gene per gene» = estrazioni indipendenti per ciascun gene; `p1`, `p2` genitori, `u` uniforme in [0, 1]. Le proprietà «conserva V…» ed «equivariante per S1» sono **algebra mia sugli enunciati delle fonti** e vanno ricontrollate (Critic, Scientist). Nessuna affermazione di efficacia.

#### Gruppo A — Incrocio
- **A1. Uniforme gene per gene** (Consilium, Step 3; DEAP `cxUniform(ind1, ind2, indpb)` [F4]). Equivariante per S1; conserva ogni vincolo di intervallo su un gene; **non** conserva V2 né V3 (prende `τ_1` da un genitore e `τ_2` dall'altro).
- **A2. Per blocchi (per ingresso).** La coppia `(w_i, c_i)` passa intera; caso particolare di incrocio uniforme sui blocchi. Conserva il legame peso-memoria; non conserva V2 (i due blocchi veloce e lento vengono da genitori diversi) salvo allineamento (Alternativa 4). Variante: blocchi per gruppo di ingressi (tendenza; barra; volume) `[ipotesi, nessuna fonte]`.
- **A3. Intermedio (aritmetico) con un solo coefficiente.** Figlio `α·p1 + (1 - α)·p2` con lo **stesso** `α ∈ [0, 1]` per tutti i geni; nelle strategie evolutive è la «ricombinazione intermedia», media dei genitori, distinta da quella «dominante» (discreta, gene per gene) [F3, sezione sulla ricombinazione]. Proprietà esatta (algebra): l'insieme dei genomi con `τ_1 < τ_2`, `θ_bassa < θ_alta` e geni in intervalli è **convesso**, quindi un figlio intermedio di due genitori validi è valido **senza riparazione**; equivariante per S1 se i genitori sono alla stessa scala. Con `α` estratto gene per gene la convessità non basta più (V2 e V3 possono cadere).
- **A4. BLX-α** (Eshelman e Schaffer, 1993 [F2], descritto da Deb e Agrawal: il figlio è estratto uniformemente in `[p_min - α·d, p_max + α·d]`, `d = |p2 - p1|`; gli autori originali riportano BLX-0,5 come migliore nei loro test [F1, sez. 2]; DEAP `cxBlend(ind1, ind2, alpha)` [F4]). Equivariante per S1 per `k > 0` (con le stesse `u`); con `α > 0` esce dall'intervallo dei genitori, quindi serve gestione dei vincoli.
- **A5. SBX** (Deb e Agrawal [F1]): per ogni gene un fattore di diffusione `β` con densità `0,5·(n+1)·β^n` per `β ≤ 1` e `0,5·(n+1)/β^(n+2)` per `β > 1` (eq. 19-20); `n` grande tiene i figli vicini ai genitori, `n` da 2 a 5 imita l'incrocio a un punto binario (sez. 3). I figli sono simmetrici rispetto alla media dei genitori, quindi equivarianti per S1 con le stesse estrazioni; senza limiti possono cadere ovunque (gli autori lo dicono e rimandano a una variante limitata, sez. 6, non letta). Implementazioni: DEAP `cxSimulatedBinary(ind1, ind2, eta)` e `cxSimulatedBinaryBounded(..., eta, low, up)` [F4]; pymoo `SBX` con `eta`, `prob` e probabilità per variabile predefinita 0,5, riferimento Deb, Sindhya e Okabe 2007 [F5]. Il valore predefinito di `eta` non è scritto nelle pagine lette.

#### Gruppo B — Mutazione
- **B1. Uniforme assoluta con clamp** (Consilium, Step 3). Non equivariante per S1 (Alternativa 5).
- **B2. Gaussiana additiva** (DEAP `mutGaussian(individual, mu, sigma, indpb)` [F4]). Equivariante per S1 **solo** se `σ` è proporzionale alla scala del genoma (ad es. `σ_i = σ_rel · max_j |w_j|`, o 1 nell'Alternativa 1, dove la scala è fissata) `[algebra mia]`.
- **B3. Polinomiale limitata** (Deb; DEAP `mutPolynomialBounded(individual, eta, low, up, indpb)` [F4]; pymoo `PM`, che segue la stessa distribuzione dell'SBX secondo la pagina [F6]). Resta dentro `[low, up]` per costruzione: candidato naturale per `τ` in un intervallo; non equivariante per S1 sui pesi se i limiti sono fissi.
- **B4. Log-normale con passo auto-adattivo** (Beyer e Schwefel [F3], eq. 22-24: `σ' = σ·exp(τ_lr·N(0,1))`, con `τ_lr ∝ 1/√N` e, come prima scelta, `1/√N`; variante con un fattore comune e uno per coordinata, eq. 26; DEAP `mutESLogNormal(individual, c, indpb)` [F4]). Per noi: `τ_lr` qui è il «parametro di apprendimento», da non confondere con i `τ_i` dei geni. Aggiunge un `σ` per gene o uno comune al genoma (+1 o +16 numeri, **non** geni di decisione: vanno esclusi dalla forma canonica e dall'hash `[ipotesi]`).
- **B5. Regola di 1/5** (Rechenberg, in [F3], sez. 4.1): si aumenta il passo se più di un quinto delle mutazioni migliora, lo si riduce altrimenti. Agisce sulla popolazione, non sul genoma: è di E3, citata solo per completezza.
- **B6. Mutazione moltiplicativa sui pesi** (`w' = w·exp(σ·N)`), naturale per equivarianza: **la scarto** per un motivo algebrico, conserva il segno e lascia `w = 0` per sempre (zero assorbente), quindi un ingresso non può cambiare verso né uscire da S4. Su `c` e sulle età medie è invece esattamente la mutazione additiva in `τ` dello Step 3.
- **B7. Passo in scala di memoria per `c`:** la mutazione additiva su `τ = ln((1 - c)/c)` è la log-normale sull'età media. Conferma del calcolo dello Step 3 `[esplorativo]`: un passo di -0,05 porta l'età media da 0,0101 a 0,0638 barre con `c = 0,99` e da 9 a 19 barre con `c = 0,10`. Esempi pubblicati di algoritmi genetici che evolvono costanti di tempo in scala logaritmica: **non trovati** in questo step (punto 3 del passaggio, aperto).

#### Gruppo C — Gestione dei vincoli
- **C1. Clamp (saturazione al bordo).** Il clamp sposta i fuori-intervallo esattamente sul bordo; Helwig, Branke e Mostaghim mostrano su paesaggi piatti che molte tecniche di gestione dei limiti introducono una distorsione della ricerca [F8, solo l'estratto]. Il nostro dato `[esplorativo]` (Sfida, punto 2) va nella stessa direzione, senza selezione.
- **C2. Riflessione** al bordo (il valore oltre il limite rientra di quanto è uscito): nessun valore esattamente sul bordo nella prova `[esplorativo]`; equivale a una passeggiata con barriere riflettenti `[ipotesi sull'equivalenza]`.
- **C3. Avvolgimento (toroidale):** chi esce da `c_max` rientra da `c_min`. **Scarto:** collega la memoria più lunga alla più corta, un salto di comportamento enorme.
- **C4. Rifiuto e nuova estrazione:** semplice e senza distorsione verso i bordi, ma il numero di tentativi dipende dall'operatore; con SBX o BLX senza limiti può essere alto vicino ai bordi `[ipotesi]`.
- **C5. Reinizializzazione casuale** del solo gene fuori intervallo: valida, ma perde l'informazione del genitore su quel gene.
- **C6. Penalità nella fitness** (la famiglia più diffusa nella rassegna di Coello Coello [F9, solo l'estratto]): **scarto** per R3: un genoma che viola V1 o V4 non si può simulare, e la fitness è di R5.
- **C7. Decodificatori e riparametrizzazione** (B e C dello Step 3): esiste in letteratura una «mappa omomorfa» tra un ipercubo e la regione ammissibile (Koziel e Michalewicz, 1999) `[fonte da verificare, vista solo citata in una scheda di ricerca]`; per noi bastano mappe elementari (logistica per `c`, ordinamento per V2, centro e semi-ampiezza per V3).
- **C8. Proprietà degli operatori al posto della riparazione:** A3 (intermedio con un solo coefficiente) e B3 (polinomiale limitata) conservano da soli i vincoli di intervallo e di ordine; abbinati, non servono riparazioni `[algebra mia, da verificare]`.
- Rassegne citate come contesto: Michalewicz e Schoenauer 1996 [F10, solo la scheda]; LEAP distingue limiti «morbidi» (solo all'inizializzazione) e «duri» `[vista solo in estratto di ricerca, non citabile]`.

#### Gruppo D — Simmetrie e invarianze
- **D1. Convenzioni in competizione / permutazioni** (Montana e Davis 1989, Schaffer et al. 1992, Radcliffe 1993, citati in [F7], sez. 2.2, **letta**; i tre originali non letti). [F7] cita anche una «codifica non ridondante» per reti a topologia fissa (Thierens 1996, non letto): è l'equivalente di V2 nel nostro caso.
- **D2. Scala positiva nelle unità lineari a soglia:** `w·x > θ` equivale a `k·w·x > k·θ` per `k > 0` (algebra); con `k < 0` la disuguaglianza si inverte e **scambia** `buy` e `sell` (`(-w, -θ_bassa, -θ_alta)` dà la strategia speculare), quindi **non** è una simmetria: va scritto nel documento perché è una tentazione naturale. La «normalizzazione dei pesi» delle reti neurali separa direzione e lunghezza di un vettore di pesi [F12, solo l'estratto]: è l'analogo della direzione di norma 1 dell'Approccio B, con lo scopo dichiarato di migliorare il condizionamento della discesa del gradiente, non della ricerca evolutiva.
- **D3. Neutralità** (definizione in [F13], abstract): S1, S4, S5 sono mutazioni neutrali nel senso di quella definizione; Alternativa 5.

#### Gruppo E — Serializzazione canonica e hash
- **E1. RFC 8785 (JCS)** [F11, letta: sez. 3.1, 3.2.1-3.2.4, Appendice B]: numeri scritti con l'algoritmo di ECMA-262 per la conversione del Number in stringa (la RFC lo indica come sez. 7.1.12.1 della sua edizione; nell'edizione corrente è `Number::toString`, 6.1.6.1.20 [F14, letto solo l'indice]); nessuno spazio tra i simboli; chiavi ordinate per unità UTF-16, ricorsivamente, array nell'ordine dato; UTF-8; `NaN` e `Infinity` **errore**; `-0` serializzato come `0` (Appendice B); numeri entro ±(2⁵³ - 1) consigliati per la massima compatibilità; la RFC presenta l'uscita come forma adatta a hash e firme.
- **E2. Python non scrive i numeri come ECMAScript.** Python ≥ 3.1 sceglie anche lui la stringa più corta che riproduce il valore [F17, letta], quindi le **cifre** coincidono, ma la **forma** no. Prova locale `[esplorativo, Node v20.20.2 e Python 3.12.3, step4-numfmt.mjs]`: `1e-7` (Node) contro `1e-07` (Python); `0.000001` contro `1e-06`; `-0` → `0` contro `-0.0`; `2⁵³` → `9007199254740992` contro `9007199254740992.0`; `1.2345678901234568e20` in forma piana in Node e con esponente in Python; `0.1`, `1/3`, `5e-324`, `1e+21`, `1.5e+300` uguali. Serve quindi una funzione esplicita in Python (esistono implementazioni di JCS in più linguaggi, Python compreso, nel repository dell'autore della RFC [F18, pagina letta, codice e vettori di prova non letti]).
- **E3. Alternative alla scrittura dei numeri in virgola mobile:** (a) solo interi (Alternativa 3); (b) numeri quantizzati scritti come **interi scalati** (`mantissa` intera ed esponente dichiarato) invece che come decimali; (c) hash sui **byte binary64** big-endian dei geni in ordine fisso: esatto e indipendente dal linguaggio, ma illeggibile e sensibile a `-0` contro `0` (da normalizzare prima) `[ipotesi]`.
- **E4. SHA-256** (FIPS 180-4, *Secure Hash Standard*, agosto 2015, DOI 10.6028/NIST.FIPS.180-4 [F19, letta la pagina di presentazione, non il PDF]; la pagina segnala che NIST ha deciso di rivederlo, nota del 2023). In Node `node:crypto`, in Python `hashlib`.
- **E5. Analogia: l'InChIKey della chimica** è una forma corta, ottenuta con SHA-256, dell'identificatore canonico di una molecola, pensata per la ricerca in rete; non è unica (collisioni possibili ma attese rare) `[vista solo in estratti di ricerca; la pagina PMC non si è aperta]`. Stesso schema dello Step 3 (forma canonica → testo → hash); suggerisce di conservare **anche il testo canonico**, non solo l'hash, per risolvere un'eventuale collisione `[ipotesi]`.

#### Gruppo F — Duplicati e diversità (solo contesto per E3)
- Condivisione della fitness (Goldberg e Richardson 1987, atti della 2ª ICGA, pp. 41-49 `[non letto, scheda da ricerca]`) e affollamento (De Jong 1975 `[non letto]`; affollamento deterministico, tesi di Mahfoud 1995 `[non letta, repository non accessibile]`): riducono la pressione sulle copie invece di eliminarle; servono una distanza o un'identità tra genomi, che l'hash strutturale e l'impronta (Alternativa 2) forniscono. Ricerca di novità (Lehman e Stanley [F15], abstract): la diversità si misura sul comportamento. **Nessuna scelta qui**: l'eliminazione o la riduzione della pressione è di E3 (risposta 2).
- Consilium non riconosce i duplicati (Step 3, `ga_v2.js`); unica traccia, l'uguaglianza esatta del testo JSON in `db/orm.js`.

#### Gruppo G — Codifiche valutate e scartate
- **Binaria o Gray:** scartata (Alternativa 3, motivo: salti di Hamming [F1], 16 geni continui, mutazione per passi).
- **Soglie per ranghi o quantili** (soglia = quantile del punteggio su una serie): rende le soglie invarianti per S1 per costruzione, ma dipende da quale serie, quindi tocca R6 (dati) e cambia la regola (R4): **fuori perimetro**, solo nominata.
- **Geni di presenza / lunghezza variabile:** esclusi dalla risposta 1.

#### Tabella «che cosa portare nel documento»

| Proposta | Esito suggerito | Motivo in una riga |
|---|---|---|
| Alt. 1 centro e semi-ampiezza | **valutare** (opzione di codifica delle soglie) | 15 geni, V3 e S1 per costruzione senza V3 forte |
| Alt. 2 impronta di comportamento | **valutare** come complemento facoltativo (Q4) | copre le equivalenze non riconosciute; controllo di coerenza |
| Alt. 3 griglia di interi e MCD | **valutare** come alternativa a Q3 | hash esatto, nessun problema di formato dei numeri |
| Alt. 4 allineamento prima dell'incrocio | **portare** come distinzione validità/convenzione | evita figli danneggiati senza vincolo V2 nel genoma |
| Alt. 5 scala S1 come passo implicito | **portare** nella sezione operatori | rende esplicita una scelta che C lascia a E3 |
| A3 intermedio con un coefficiente | **portare** (candidato) | conserva V1-V3 per convessità |
| A4 BLX-α, A5 SBX | **portare** come opzioni confrontate | equivarianti per S1, ma serve gestione dei limiti |
| B2 gaussiana con `σ` relativo, B3 polinomiale limitata | **portare** | equivarianza; resta nei limiti |
| B4 log-normale auto-adattiva, B5 1/5 | nominare | aggiungono parametri di strategia o sono di E3 |
| B6 moltiplicativa sui pesi | scartare (riga «perché no») | zero assorbente, segno fisso |
| C1-C5 | **portare** il confronto | clamp distorce, riflessione no `[esplorativo]` |
| C3 toroidale, C6 penalità | scartare | salto di comportamento; fitness di R5 |
| E1-E4 | **portare** | regola di serializzazione indipendente dal linguaggio |
| Binaria/Gray, ranghi | scartare | motivi sopra |

### Parte 3 — Fonti

**Lette il 2026-11-14** (pagina aperta o testo estratto dal PDF):
- [F1] K. Deb, R. B. Agrawal, *Simulated Binary Crossover for Continuous Search Space*, Complex Systems 9(2), 115-148, 1995. Scheda: https://www.complex-systems.com/abstracts/v09_i02_a02/ (non aperta); PDF letto: https://www.cse.unr.edu/~sushil/class/gas/papers/SimulatedBinaryCrossover.pdf — abstract, sez. 1-3 (eq. 19-20), descrizione di BLX-α e riferimenti; sez. 6 (variante limitata) **non letta**.
- [F3] H.-G. Beyer, H.-P. Schwefel, *Evolution strategies – A comprehensive introduction*, Natural Computing 1, 3-52, 2002, DOI 10.1023/A:1015059928466. Copia letta: https://gwern.net/doc/reinforcement-learning/model-free/2002-beyer.pdf — sez. 4.1 (regola di 1/5), 4.2.2 (regola log-normale, eq. 22-26), parte sulla ricombinazione intermedia e dominante.
- [F4] DEAP, documentazione degli operatori: https://deap.readthedocs.io/en/master/api/tools.html — firme e parametri di `cxUniform`, `cxBlend`, `cxSimulatedBinary(Bounded)`, `mutGaussian`, `mutPolynomialBounded`, `mutESLogNormal` (letta la pagina fino al carattere 100000 di 102377).
- [F5] pymoo, *Crossover*: https://pymoo.org/operators/crossover.html — SBX (letta).
- [F6] pymoo, *Mutation*: https://pymoo.org/operators/mutation.html — PM (letta; non definisce `eta` né `prob`). pymoo, *Repair*: https://pymoo.org/operators/repair.html (letta: esempio dello zaino).
- [F7] K. O. Stanley, R. Miikkulainen, *Evolving Neural Networks through Augmenting Topologies*, Evolutionary Computation 10(2), 99-127, 2002. PDF: https://www.cse.unr.edu/~sushil/class/gas/papers/NEAT.pdf — sez. 2.2 «Competing Conventions» e figura 1 (letta).
- [F11] A. Rundgren, B. Jordan, S. Erdtman, RFC 8785, *JSON Canonicalization Scheme (JCS)*, 2020: https://www.rfc-editor.org/rfc/rfc8785 — sez. 3.1-3.2.4, Appendice B (letta).
- [F17] *What's New In Python 3.1*: https://docs.python.org/3/whatsnew/3.1.html — `repr` dei float con la stringa più corta (letta la parte).
- [F18] Repository `cyberphone/json-canonicalization`: https://github.com/cyberphone/json-canonicalization — elenco delle implementazioni (letta la pagina principale).
- [F19] NIST, FIPS 180-4: https://csrc.nist.gov/pubs/fips/180-4/upd1/final — pagina di presentazione (letta; PDF non aperto).
- [F16] Wikipedia, *Miller index*: https://en.wikipedia.org/wiki/Miller_index — interi ridotti a MCD 1 (letta; fonte enciclopedica, solo per l'analogia).

**Solo abstract o scheda** (contenuti attribuiti limitati all'abstract):
- [F8] S. Helwig, J. Branke, S. Mostaghim, *Experimental Analysis of Bound Handling Techniques in Particle Swarm Optimization*, IEEE Trans. Evolutionary Computation 17(2), 259-271, 2013, DOI 10.1109/TEVC.2012.2189404 (il DOI risolve su IEEE Xplore, pagina vuota per lo strumento; contenuto da estratti di ricerca: `[fonte da verificare]`).
- [F9] C. A. Coello Coello, *Theoretical and numerical constraint-handling techniques used with evolutionary algorithms: a survey of the state of the art*, Computer Methods in Applied Mechanics and Engineering 191(11-12), 1245-1287, 2002, DOI 10.1016/S0045-7825(01)00323-1 (DOI verificato; abstract da estratto di ricerca).
- [F10] Z. Michalewicz, M. Schoenauer, *Evolutionary Algorithms for Constrained Parameter Optimization Problems*, Evolutionary Computation 4(1), 1-32, 1996, DOI 10.1162/evco.1996.4.1.1 (scheda da ricerca; non aperto).
- [F12] T. Salimans, D. P. Kingma, *Weight Normalization: A Simple Reparameterization to Accelerate Training of Deep Neural Networks*, 2016: https://arxiv.org/abs/1602.07868 (abstract letto).
- [F13] E. Galván-López, R. Poli, A. Kattan, M. O'Neill, A. Brabazon, *Neutrality in evolutionary algorithms... What do we know?*, Evolving Systems 2(3), 145-163, 2011, DOI 10.1007/s12530-011-9030-5: https://gpbib.cs.ucl.ac.uk/gp-html/GalvanLopezPKOB_2011_ESNeEAWDWK.html (abstract letto).
- [F14] ECMA-262, *ECMAScript Language Specification*, edizione corrente: https://tc39.es/ecma262/#sec-numeric-types-number-tostring (letto solo l'indice: sezione 6.1.6.1.20; l'algoritmo **non** è stato letto, il comportamento è verificato solo su Node in E2).
- [F15] J. Lehman, K. O. Stanley, *Abandoning Objectives: Evolution through the Search for Novelty Alone*, Evolutionary Computation 19(2), 189-223, 2011, DOI 10.1162/EVCO_a_00025: https://gpbib.cs.ucl.ac.uk/gp-html/Lehman_2011_EC.html (abstract letto).

**Non letti** (citati da altre fonti; `[fonte da verificare]` per ogni contenuto):
- [F2] L. J. Eshelman, J. D. Schaffer, *Real-coded Genetic Algorithms and Interval-Schemata*, in *Foundations of Genetic Algorithms 2*, Morgan Kaufmann, 1993 (riferimento [8] di [F1]).
- Montana e Davis 1989, Schaffer et al. 1992, Radcliffe 1993, Thierens 1996 (riferimenti di [F7]); Deb, Sindhya, Okabe, GECCO 2007 (riferimento di [F5]); Koziel e Michalewicz 1999; Goldberg e Richardson 1987; De Jong 1975; Mahfoud 1995 (repository dell'Università dell'Illinois: risposta 403); Padhye, Deb, Mittal 2013; Poli e Galván-López 2011; A. E. Eiben, J. E. Smith, *Introduction to Evolutionary Computing* (nominato dallo Step 2, non cercato in questo step); InChI e InChIKey (pagina PMC bloccata da una verifica anti-robot, non aggirata).

Nessuna affermazione che un operatore «evolve meglio» è riportata come fatto: i confronti di efficacia delle fonti (BLX-0,5 nei test di Eshelman e Schaffer; SBX «come o meglio» della codifica binaria nei test di [F1]) sono **loro esperimenti** su funzioni di prova, non prove per il nostro genoma.

### Parte 4 — Le domande aperte dell'Architect: che cosa cambia (senza rispondere per Luca)

- **Q1 (segno delle soglie).** Con l'Alternativa 1, V3 debole è garantito dalla codifica; V3 forte diventa `-1 < b < 1`. La scelta resta di espressività, non di meccanismo.
- **Q2 (16 geni più il blocco di 0 o 3).** L'Alternativa 1 porta la base a 15; i parametri di strategia di B4, se adottati, sono numeri del genoma ma **non** geni di decisione: il conteggio va scritto con questa distinzione.
- **Q3 (precisione dichiarata).** `[esplorativo]` senza quantizzazione l'hash non riconosce gli equivalenti per S1 con `k` generico (Sfida, punto 5): la domanda diventa «quale precisione», oppure «precisione nel genoma» (Alternativa 3).
- **Q4 (nuova).** Oltre all'hash della forma canonica, va calcolata un'impronta delle decisioni su un insieme di prova fisso e senza dati di valutazione, per segnalare anche i genomi che si comportano allo stesso modo senza una simmetria dimostrata?

### Diversità cognitiva
Lo Step 3 ragiona per **vincoli da far rispettare** (riparare, rifiutare, riparametrizzare). Questo step ha cambiato domanda: (a) quali vincoli sono di validità e quali sono **convenzioni** che contano solo per l'incrocio (Alternativa 4, dalla biologia della ricombinazione e da NEAT); (b) che cosa fa un grado di libertà neutrale agli **operatori**, non alle decisioni (Alternativa 5, dalle strategie evolutive); (c) se la forma canonica possa essere esatta cambiando l'insieme dei numeri (Alternativa 3, dagli indici di Miller); (d) se l'identità si possa misurare sul comportamento (Alternativa 2); (e) se le soglie debbano essere geni (Alternativa 1). Ha sostituito «evolve meglio» con due proprietà verificabili per ogni operatore: **conserva i vincoli** (per convessità o per intervallo) ed **è equivariante per S1**. Rischi dichiarati: le proprietà algebriche sono mie e non verificate; i numeri `[esplorativo]` vengono da prove senza selezione e su genomi casuali, non dicono nulla su un'evoluzione vera; tre fonti chiave (Helwig, Coello Coello, Eshelman e Schaffer) sono note solo per abstract o citazione.

### Domande per Luca (da questo step)
- **Q4** (nuova): oltre all'hash della forma canonica, va calcolata un'impronta delle decisioni su un insieme di prova fisso (dataset inventato e serie sintetiche, senza dati di valutazione), per segnalare anche i genomi che si comportano allo stesso modo senza una simmetria dimostrata?
- Note su Q1, Q2, Q3 nella Parte 4 (nessuna risposta data per Luca).

**Prossimo step:** Step 5 — CRITIC

## Step 5 — CRITIC: Analyze Weaknesses

**Agent:** claude-opus-5-5 (subagent)
**Letti:** Step 1–4 di questo file (risposte di Luca, AC-01…AC-16, approcci A/B/C, Alternative 1-5, Sfida a C, Parte 2, Q1-Q4); `software-house-ai/agents/03-critic.md`; Step 5 del ciclo 011 (`archive/cycle-011.md`, righe 606-808) come modello; `/home/luca/Workspace/swarmtrader-r3-work/notes/` (`step3-architect.md`, `step4-explorer.md`, i quattro `step4-*.mjs`, rieseguiti); memory `errors/2026-10-18-identity-claims-imprecise`, `knowledge/consilium-iir-filter-orientation`, `knowledge/eni-flat-bar-and-non-finite-indicators`, `decisions/2026-10-18-indicator-catalog-constraints`, `decisions/2026-10-11-strategy-contract`; catalogo, sezione «Il punteggio lineare con soglie» (righe 133-145).
**Codice riletto oggi (2026-11-14):** `src/engine/genome.js` (righe 13-100), `src/engine/strategy.js` (righe 25-70), `src/vendor/consilium/algorithm.js` (righe 340-400), `src/vendor/consilium/ga.js` (righe 110-128, 340-353), `src/engine/dataTrainer.js` (riga 34); Consilium `experiment/lb77` a `2ec7237`, sola lettura: `public/src/individual_v2.js` (righe 1-5, 155-285), `public/src/individual.js` (righe 185-280, 345-400), `ga/ga_v2.js` (righe 10-20, 78-232, 325-340), `db/orm.js` (righe 1-80, 450-600); schema delle tabelle `Genomas` letto in sola lettura (modulo `sqlite3` di Python, `mode=ro`) in `db/database.sqlite`, nei sette file di `db/backups/` e in `/var/lib/consilium/database.sqlite`; `ref/indicators.mjs` di R2 (sola lettura).
**Script del Critic:** nella cartella persistente `/home/luca/Workspace/swarmtrader-r3-work/notes/`: `step5-checks.mjs` (Node v20, mulberry32 seme 2026), `step5-checks.py` (`python3 -I`), `step5-rank.mjs` (mulberry32 seme 4242, importa in sola lettura gli indicatori di R2). Sono **controlli, non cifre citabili**: il Builder li rifà in `ref/`, lo Scientist in `verify/`.
**Assunzioni**
- Gravità secondo `agents/03-critic.md`. **Nessun rilievo è Critico**: ognuno ha una mitigazione praticabile in questo ciclo. Tre rilievi sono Alti (O1, H1, Q3a).
- Regola di decisione del catalogo: `s = w1*x1 + … + w7*x7` sommata da sinistra a destra, `buy` se `s > θ_alta`, `sell` se `s < θ_bassa`, `hold` altrimenti. Dove una conclusione dipende dall'ordine della somma o dalla forma del confronto, lo dico.
- «Equivalenti» = stesse decisioni su **ogni** serie ammessa dal validatore (`low > 0`, `volume ≥ 0`: `dataTrainer.js`, riga 34), con gli indicatori del catalogo e la regola di salto dei denominatori nulli. È il senso della risposta 2 di Luca.
- Il Destroyer è omesso per track (Step 1): i casi limite della codifica sono qui, nella sezione «Casi limite».

### Fatti verificati sul codice che le critiche usano

- **F-code-1. Citazioni dello Step 3 su SwarmTrader: tutte corrette.** `FIXED_GENOME` righe 13-35; ricontati con `node`: 36 transizioni, 135 ID di condizione (da 10 a 19 per stato), 1 azione. `TRANSITION_KEYS` riga 38, `assertFinite` 40-42, `toFraction` 44-47, ID 0-13 righe 66-67, coefficienti finiti e `0 < c < 1` righe 85-88 (il rifiuto di `c = 1` è alla riga 86). `StrategyIndividual` riga 35, `Trader` costruito con i tre numeri alle righe 36-37, ordine `updateIndicators` → `trader.update` → `decide()` righe 46-55. Filtri `ema = ema * (1 - c) + x * c` in `algorithm.js` righe 369-372 (`c` pesa il dato nuovo). `ga.js`: le chiamate sono alle righe 118-125 e 345-351, dentro gli intervalli citati (116-125, 344-351).
- **F-code-2. Consilium `individual_v2.js` e `ga_v2.js`: citazioni corrette.** `individual_v2.js` per la matrice 7×7 (righe 1-3); `crossover` 161-193 uniforme per gene con probabilità 0,5 e stati copiati interi (con una copia superficiale `{ ... }`, righe 184-188); `mutate` 199-279 con passo `(rand - 0,5) * 0,1` = ±0,05 e clamp [0,01; 1,0] (203-214), margini ±0,01 senza clamp (217-228), `buy_percent`, stop loss e take profit come scritto (231-239). Non citato dallo Step 3 ma irrilevante qui: la mutazione tocca anche `max_position_days` (264-267). `ga_v2.js`: torneo di 3 (80-91), crossover 93-126, mutazione 128-193 con ±0,125 e clamp [0,01; 1,0], `MUTATION_PROBABILITY = 0,1` (riga 17), figli casuali con probabilità 0,334 (riga 217: incrocio se `Math.random() < 0,666`), `Genoma.create` alle righe 330-336 **senza `await`** dentro un `try` (un rifiuto della promessa non arriva al `catch`).
- **F-code-3. Consilium `individual.js`: citazione corretta ma incompleta.** Intervalli interni (righe 195-237) e `mutateFloat` (271-275, passo ±5 % dell'intervallo, clamp) come scritto. Il genoma fisso è fuori dagli intervalli **anche** per lo stop loss (50 % → 0,5 > 0,2, riga 232) e per `margin_percent_2` (-1,10 % → -0,011 < 0,001, riga 220), oltre a `iir_price_1`, `iir_price_2` e `buy_percent` già nominati. La conclusione dello Step 3 (gli intervalli di Consilium non sono una fonte) si rafforza.
- **F-code-4. Il vincolo `unique` (domanda aperta dello Step 3): risolta.** Il modello Sequelize non dichiara `unique` (`db/orm.js`, righe 49-80) e la tabella si crea da quel modello con `sequelize.sync({ force: false })` (riga 591; la versione alle righe 578-588 è commentata), che non aggiunge vincoli a una tabella esistente. Negli schemi reali: **nessun `UNIQUE`** sulla colonna `genoma` in `/var/lib/consilium/database.sqlite` (percorso predefinito, riga 20) né nei sette file di `db/backups/`; **solo** `db/database.sqlite` (16 KB, schema più vecchio, senza le colonne `version` e `partition`) ha `genoma VARCHAR(255) NOT NULL UNIQUE`. `SaveGenoma` è usata solo da due script in `tests/manual/`. Quindi nelle corse attuali Consilium **salva anche le copie esatte** e il ramo `SequelizeUniqueConstraintError` (righe 474-499) non scatta. Per E3 `[ipotesi, non verificato]`: con `DATABASE_URL` (PostgreSQL) `DataTypes.STRING` è `VARCHAR(255)` e un genoma JSON più lungo verrebbe rifiutato; SQLite non applica la lunghezza.
- **F-code-5. Gli ingressi sono finiti per costruzione.** Il validatore richiede `low > 0` (`dataTrainer.js`, riga 34), quindi `C > 0` e `H > 0`; con la regola di salto del catalogo (barre `H = L` e `V = 0` saltate; `ref/indicators.mjs` di R2, `clvema` righe 452-470, `lvol` 472-494, `rsi` e `obvn` con guardia `B > 0`) i 7 ingressi sono sempre finiti. È la condizione che S4 e S5 richiedono.

### Ricalcolo delle affermazioni matematiche degli Step 3–4

| # | Affermazione | Calcolo o algebra del Critic | Esito |
|---|---|---|---|
| M1 | **S1** (Step 3): `k > 0` su pesi e soglie lascia invariate le decisioni; in virgola mobile esatta per `k = 2^m` | Algebra: `s > θ ⇔ k·s > k·θ` per `k > 0`; vale anche con `≥`, con forme miste (`>` per `buy`, `≥` per `sell`) e nei pareggi (`s = θ` resta pareggio); pesi nulli inclusi; con `k < 0` scambia `buy` e `sell` (D2, corretto). Virgola mobile: con `k = 8` e soglia messa **esattamente** sul punteggio o a 1 ulp, 0 decisioni diverse su 2·10⁵; con `k = 3`, 44.090 su 2·10⁵ (caso peggiore costruito, non frequenza su dati). Controesempio alla potenza di 2: con `k = 2^-1000` i prodotti diventano subnormali e una decisione passa da `buy` a `hold`. | **Corretta**, con la condizione da scrivere per intero: `k = 2^m` esatta **se nessun prodotto, somma o soglia scalata va in overflow o nella zona subnormale**; per gli altri `k`, `fl(k·g)` non è nemmeno esattamente il genoma `k·g` (vedi M7). |
| M2 | **S2**: scambiare `(w1, c1)` con `(w2, c2)` dà lo stesso punteggio | Algebra: `x1` e `x2` sono la stessa formula con lo stesso avvio (`dlog`, R2). Virgola mobile: scambio delle posizioni 1-2, **0** punteggi diversi nei bit su 2·10⁵, perché `(0 + a) + b = b + a` esattamente; scambio di due posizioni non iniziali (2-7), 114.671 su 2·10⁵ diversi nei bit. | **Corretta e bit-esatta solo se i due ingressi di distanza sono i primi due addendi** (o se la somma è indipendente dall'ordine). Condizione nuova da scrivere nel contratto di E2: ordine della somma fisso, con N1 veloce e lento in testa. |
| M3 | **S3**: con `c1 = c2` conta solo `w1 + w2` | Algebra corretta; in virgola mobile `w1·x + w2·x ≠ (w1 + w2)·x` in generale. Indizio sulla quasi-identità: autovalore minimo della matrice di correlazione dei 7 ingressi su una passeggiata aleatoria di 3000 barre 1,6·10⁻² con `c` distinti, 2,1·10⁻⁴ con `c1 = 0,1` e `c2 = 0,095` (`step5-rank.mjs`). | **Corretta in aritmetica esatta.** Con velocità vicine la direzione `(w1, -w2)` è quasi neutra: motivo per un margine minimo su V2 (C-2). |
| M4 | **S4**: `w_i = 0` rende `c_i` irrilevante, se `x_i` è finito | `0·x = ±0` e `s + (±0) = s` esattamente: bit-esatta. Finitezza garantita da F-code-5. `0·NaN` e `0·Infinity` danno `NaN` (verificato). | **Corretta**, con le condizioni dello Step 3. |
| M5 | **S5**: tutti i pesi nulli → decisione costante; «con `θ_bassa < 0 < θ_alta` sempre `hold`» | Con V3, tre classi: sempre `buy` se `θ_alta < 0`, sempre `sell` se `θ_bassa > 0`, sempre `hold` altrimenti (**anche** con `θ_alta = 0` o `θ_bassa = 0`). Con un ingresso `NaN` la stessa classe «sempre `buy`» dà `hold` (verificato). | **Corretta**, da completare: tre classi, confini inclusi, condizione di finitezza. |
| M6 | **«16 numeri, 15 gradi di libertà»** | S1 è l'unica simmetria **continua** nota (S2 è discreta, S3-S5 hanno misura nulla); il quoziente ha dimensione 15. Che 15 sia anche il numero di gradi di libertà «di comportamento» richiede che i 7 ingressi siano funzioni linearmente indipendenti (indizio in M3, non prova) e che gli iperpiani delle soglie cadano nel campo raggiunto dagli ingressi. | **Corretta come limite superiore** («al più 15»); va scritta così, con le due condizioni. |
| M7 | **Sfida 5**: senza quantizzazione l'hash non riconosce `g` e `k·g` (95-96 % per `k` generico); quindi la quantizzazione è **necessaria** | Numeri rifatti con `step4-s1k.mjs`: coincidono (k = 3 con norma del massimo 0 %; k generico 95-96 %; 15/12/9 cifre: 21 %, 0,028 %, 0 su 10⁵). Ma `fl(k·g)` con `k` non potenza di 2 **non è** `k·g`: ogni componente è arrotondata, e le decisioni possono differire (M1: 22 % nei pareggi costruiti). Tra genomi in virgola mobile, l'equivalenza S1 *esatta* si ha in pratica solo per fattori potenza di 2, che la norma del massimo riconosce già senza quantizzare (`k = 8`: 0 %). Inoltre nessun operatore del GA moltiplica un genoma per una costante: gli equivalenti S1 con `k` generico non nascono durante l'evoluzione salvo renormalizzazioni volute. | **Conclusione da correggere.** La quantizzazione non serve a riconoscere equivalenti esatti: serve a **unire genomi quasi uguali**, che è un'altra relazione (vedi Q3a). Lo «0 %» a 9 e 7 cifre è 0 su 10⁵, non 0: il passaggio a cavallo di un arrotondamento resta possibile per ogni precisione. |
| M8 | **τ** (Step 3: `τ = ln((1 - c)/c)`, `c = 1/(1 + e^τ)`; Step 4: `c` = 1 esatto da `τ ≈ -36,74`, 0 esatto da `τ = 710`) | Dalla formula scritta: `c === 1` per `τ ≤ ln 2⁻⁵³ = -36,7368`; `e^τ` va in overflow per `τ > ln(MAX_VALUE) = 709,7827`, quindi `c === 0` **da 709,78** (710 è il primo intero); `c` è subnormale già da circa 708,4. In Python `1/(1 + math.exp(710))` **solleva `OverflowError`** invece di dare 0. Andata e ritorno `c → τ → c` su [0,001; 0,99]: errore relativo ≤ 6,4·10⁻¹⁶. Forma stabile (per `τ ≥ 0`, `e^-τ/(1 + e^-τ)`): nessun overflow. `e^τ` è l'età media `(1 - c)/c`: la mutazione additiva su `τ` è log-normale sull'età media (B7, corretto). | **Corretta nella sostanza**, da precisare (709,78; comportamento diverso in Python). V1 «per costruzione» vale solo con limiti su `τ`, come dice la Sfida 2. |
| M9 | **B: `τ2 = τ1 + e^η`** garantisce V2 | Con `τ1 = 2`, `τ1 + e^η === τ1` per `η ≲ -36,05`; e anche con `τ` diversi i `c` possono coincidere (a `τ = -4,6`, `c(τ) === c(τ + d)` per `d ≈ 3,6·10⁻¹⁵`). Con un limite superiore `τ2 ≤ τ_max` il vincolo diventa `τ1 + e^η ≤ τ_max`, che non è un intervallo su un gene. | **Vale solo in aritmetica esatta e senza limiti.** Con i limiti che lo Step 4 dimostra necessari, la riparametrizzazione non elimina la riparazione. |
| M10 | **Convessità (A3)**: l'insieme con `τ1 < τ2`, `θ_bassa < θ_alta` e intervalli è convesso; il figlio intermedio con un solo `α` è valido senza riparazione | Algebra: intersezione di semispazi aperti e di scatole, quindi convessa: corretto. Virgola mobile: 0 figli fuori da `[lo, hi]` su 10⁶ con genitori sul bordo; ma con genitori i cui `τ` distano 1-2 ulp, V2 stretto è violato (uguaglianza) in 30.580 casi su 10⁶. | **Corretta in aritmetica esatta**; con V2 stretto serve un margine (C-2) o un controllo finale. |
| M11 | **C8**: A3 e B3 «conservano da soli i vincoli di intervallo e di ordine; abbinati, non servono riparazioni» | B3 (polinomiale limitata) muta **gene per gene**: resta nei limiti, ma mutare solo `τ1` può portarlo sopra `τ2`, e mutare solo `θ_bassa` sopra `θ_alta`. Lo stesso vale per B1, B2, B4. | **Errata.** Solo A3 conserva l'ordine; ogni mutazione gene per gene richiede ancora la gestione di V2 e V3 (o una codifica che li renda impossibili: Alt. 1 per V3). |
| M12 | **Equivarianza** (Sfida 1): se incrocio e mutazione sono equivarianti e i genitori sono alla stessa scala, la renormalizzazione non cambia il comportamento dei figli | Mutazione: con `σ` relativo (B2) `canon(O(k·g)) = canon(O(g))` salvo 0,035 % di arrotondamenti a 12 cifre; con passo assoluto (B1) diverso nel 100 %: corretto. Incrocio: l'equivarianza **congiunta** (entrambi i genitori per lo stesso `k`) vale per A1, A3, BLX (diversi solo per arrotondamento: 0,015 %, 0,1 %, 0,24 %), ma la renormalizzazione scala **ciascun genitore per il proprio** fattore: con il solo secondo genitore scalato, la forma canonica del figlio cambia nel 99,5 % (A1) e nel 100 % (A3, BLX). Due genomi diversi non hanno «la stessa scala» se non si fissa una norma. | **Vera solo per la mutazione.** Per l'incrocio nessun operatore standard è invariante per scale indipendenti dei genitori: renormalizzare o no **cambia sempre** la distribuzione dei figli (rilievo O1). |
| M13 | **Alt. 1**: `s > b + h ⇔ s/h > b/h + 1` per `h > 0`; 15 geni, V3 per costruzione | Algebra corretta (S1 con `k = 1/h`). In virgola mobile la conversione da `(θ_alta, θ_bassa)` a `(w/h, b/h)` non è bit-esatta, e «`s > b + 1`» e «`s - b > 1`» arrotondano in modo diverso. | **Corretta**, a due condizioni: il decodificatore fissa **una** forma del confronto; la regola di R4 resta omogenea in pesi e soglie (D-R4-1). |
| M14 | **Swap-repair** delle coppie per V2: è una forma canonica applicata al genoma che evolve (Sfida 3, Alt. 4) | Sì: sceglie il rappresentante di S2 e non cambia alcuna decisione (M2). Con mutazione simmetrica tra le posizioni 1 e 2 (stessi passi e stessi limiti per `c1` e `c2`), il processo «riparare dopo ogni operatore» e il processo «allineare prima dell'incrocio» (Alt. 4) generano popolazioni con la stessa distribuzione di comportamenti; differiscono solo nel genoma memorizzato. Se i limiti di `c1` e `c2` sono diversi, le due varianti differiscono. | **Corretta.** Alt. 4 e lo scambio sono la stessa cosa per il GA; la scelta è di presentazione (rilievo 4a). Lo scambio delle **soglie** per V3, invece, **cambia** il comportamento: è una riparazione vera, non una simmetria. |
| M15 | **Sfida 2** (`[esplorativo]`): 11,96 % dei `c` «entro 0,01 da 0 o da 1» con il passo su `τ`, contro 5,08 % del clamp e 2,08 % della riflessione | Lo script conta `c < 0,02` oppure `c > 0,99`, non «entro 0,01 da 0 o da 1»; i passi (±0,05 in `c`, ±0,25 in `τ`) non sono commensurabili. Il fatto qualitativo (senza limiti `τ` diffonde verso gli estremi) è corretto. | **Etichetta da correggere**; i tre numeri non confrontano tre metodi. |
| M16 | Step 3 / Step 4 B7: passo di -0,05 su `c` porta l'età media da 0,0101 a 0,0638 barre (`c` = 0,99) e da 9 a 19 (`c` = 0,10) | `(1 - 0,94)/0,94 = 0,0638`; `(1 - 0,05)/0,05 = 19`. | **Corretta.** |

### Errori trovati negli Step 3–4

1. **Step 3, componente 8, R4-3:** «un divisore di un solo ingresso [ATR] non conserva S1» è **sbagliato**. S1 si rompe solo con termini non omogenei in pesi e soglie (una costante fissa sommata o confrontata, una funzione non lineare del punteggio come una saturazione, un'isteresi costante non scalata, prodotti tra pesi); dividere un ingresso per l'ATR cambia l'ingresso, non l'omogeneità. Ciò che un divisore applicato a **uno solo** dei due ingressi di distanza rompe è **S2** (i due ingressi non sono più la stessa formula), e il `c` dell'ATR diventa irrilevante quando il peso di quell'ingresso è nullo (nuovo caso di S4).
2. **Step 3, componente 4, V1:** la ragione «`c` = 1 annulla la memoria e la distanza N1» vale per N1 e per il volume relativo N16 (ingresso identicamente 0, quindi peso irrilevante: un caso di S4 «rovesciato»), **non** per RSI centrato, massimo che dimentica, CLV smussata e OBV normalizzato, dove `c` = 1 è un ingresso definito senza smussamento. `0 < c < 1` viene dal validatore FSM (`genome.js`, riga 86), non dalle formule: l'intervallo va dato **per ingresso**.
3. **Step 3, S5:** classi incomplete (M5).
4. **Step 3, F-code-3:** fuori intervallo anche stop loss e `margin_percent_2` (Low).
5. **Step 4, C8:** errata (M11). **Step 4, Sfida 1:** vera solo per la mutazione (M12). **Step 4, Sfida 5:** conclusione «quantizzazione necessaria» da correggere (M7). **Step 4, Sfida 2:** etichetta (M15). **Step 4, Alt. 2:** «una simulazione per genoma, che E3 fa comunque per la fitness» è falso: la fitness gira sui dati di valutazione, l'impronta su un insieme di prova separato, quindi è una simulazione **in più** (piccola).
6. Nessuna citazione di file o riga sbagliata negli Step 3–4 (F-code-1/2/3); nessun errore di orientamento di `c`.

### Critica dell'Approccio A — Geni grezzi, riparazione dopo gli operatori

| # | Rilievo | Gravità | Mitigazione |
|---|---|---|---|
| A-1 | Il clamp su `c` in scala lineare ripete il difetto di Consilium (accumulo sui bordi, `c` = 1 ammesso da `individual_v2.js` e `ga_v2.js` e rifiutato da `genome.js`); il passo lineare non rispetta l'età media (M16). Già nei «contro» dello Step 3: lo confermo. | Media | Se A resta un'opzione: riflessione invece del clamp, intervallo per ingresso (errore 2), passo relativo all'età media; a quel punto A coincide con C per i `c`. |
| A-2 | La deriva lungo S1 non è solo «direzione libera»: con passo assoluto sui pesi la scala del genoma è un passo di mutazione nascosto (Alt. 5, verificato M12: B1 non equivariante nel 100 %). | Media | Passo relativo (B2) o scala fissata nel genoma (Alt. 1). |
| A-3 | Lo scambio delle soglie per V3 **cambia** il comportamento (M14) e non ripara `θ_bassa = θ_alta`. | Bassa | Scrivere che è una riparazione vera; uguaglianza → rifiuto e nuova estrazione. |

### Critica dell'Approccio B — Geni riparametrizzati

| # | Rilievo | Gravità | Mitigazione |
|---|---|---|---|
| B-1 | **V1 e V2 «per costruzione» non valgono in virgola mobile** né con i limiti necessari (M8, M9): `c` = 1 esatto sotto -36,74, `τ2 = τ1` per `η ≲ -36`, vincolo accoppiato `τ1 + e^η ≤ τ_max`. | Media | Limiti su ogni `τ` e su `η`; a quel punto la riparazione ritorna e il vantaggio di B sui `c` si riduce a quello di C. |
| B-2 | **Direzione di norma 1** dopo ogni operatore: la proiezione cambia la distribuzione dei figli (M12, incrocio non invariante per scale indipendenti) e la norma euclidea introduce arrotondamenti (rischio 3 dello Step 3). Il genoma non si legge come «pesi» (contro dichiarato). | Alta | Non adottare la sfera; se si vuole togliere S1 dal genoma, l'Alt. 1 lo fa con una divisione e senza perdere la lettura dei pesi. |
| B-3 | `θ_alta = 1` richiede V3 forte (Q1) e una regola di R4 omogenea (D-R4-1). | Media | Condizionarla esplicitamente a Q1 e a R4; l'Alt. 1 non richiede V3 forte. |

### Critica dell'Approccio C — Ibrido (raccomandato dallo Step 3)

| # | Rilievo | Gravità | Mitigazione |
|---|---|---|---|
| C-1 | La **renormalizzazione «facoltativa»** non è neutra per l'incrocio, qualunque operatore si scelga (M12): lasciarla a E3 vuol dire lasciare a E3 una scelta che cambia l'evoluzione. È il rilievo O1 sotto. | Alta | Decidere nel documento: o la scala è fissata nel genoma (Alt. 1, quindi niente renormalizzazione), o si dichiara che i genitori **non** si renormalizzano e la scala resta un passo implicito (Alt. 5, ii). |
| C-2 | **V2 stretto senza margine** è fragile: uguaglianze per arrotondamento (M10), `c` uguali con `τ` diversi (M9), quasi-identità S3 non riconosciuta (M3). Lo scambio non ripara l'uguaglianza. | Media | V2 con margine minimo `τ2 - τ1 ≥ δ` (in età media logaritmica, ad es. un rapporto minimo tra le età medie `[ipotesi sul valore, da fissare allo Step 7]`), controllato su `τ`; scambio se `τ1 > τ2`, rifiuto e nuova estrazione se il margine manca. |
| C-3 | Opzione `τ2 = τ1 + e^η` (lasciata al Critic dallo Step 3): lega la lenta alla veloce, l'incrocio gene per gene produce una lenta che non è di nessun genitore, e con `τ_max` torna un vincolo accoppiato (M9). | Media | **Scartarla** a favore di `τ1`, `τ2` indipendenti con margine e scambio (C-2). |
| C-3b | Forma della logistica: `1/(1 + e^τ)` va in overflow e in Python solleva un'eccezione (M8). | Bassa | Limiti su `τ` ben dentro ±30 e, nel documento, la forma stabile. |
| C-4 | «Forma canonica solo per l'hash» contraddetta dallo scambio di V2 (Sfida 3). | Bassa | Riformulare: «nel genoma si applica solo la forma canonica di S2, che non cambia le decisioni; il resto solo per l'hash». |
| C-5 | Intervalli dei pesi «larghi» senza fonte e senza scala: con `c` evolvibile la scala di N1 cambia di due ordini di grandezza (ciclo 011, rilievo N1a). | Media | Intervallo dei pesi come `[ipotesi]` dichiarata; nell'Alt. 1 in «semi-ampiezze per unità di ingresso». |

### Critica delle Alternative dello Step 4

| # | Rilievo | Gravità | Mitigazione |
|---|---|---|---|
| 1a | **Alt. 1 (centro e semi-ampiezza, 15 geni).** Algebra corretta (M13). Toglie S1 dal genoma: con tutti i genomi alla stessa scala, passo assoluto sui pesi e incrocio non hanno più il problema di O1, e l'hash non deve riconoscere S1. È il rimedio più economico a C-1. | Bassa | Adottarla come opzione preferita delle soglie, **condizionata** a D-R4-1; S5 diventa tre classi di `b` (`b < -1`, `b > 1`, `-1 ≤ b ≤ 1`). |
| 1b | Se R4 introduce un termine non omogeneo (saturazione del punteggio, isteresi costante, soglie fisse), fissare `h = 1` **toglie un grado di libertà vero**: la codifica cambia numero di geni. | Media | Scrivere la condizione nel documento e nella tabella R4; con S1 rotta `h` torna gene (16). |
| 2a | **Alt. 2 (impronta di comportamento).** Utile come controllo di coerenza, ma: il dataset di 20 giorni, dopo l'avvio, distingue poco (molti genomi fanno solo `hold`); con forma canonica quantizzata il controllo «stesso hash ⇒ stessa impronta» dà falsi allarmi; costo di una simulazione in più (errore 5). | Media | Se Luca la vuole (Q4): serie sintetica lunga con seme dichiarato, versionata; controllo di coerenza solo con hash esatto. |
| 3a | **Alt. 3 (griglia di interi e MCD).** Hash esatto, ma: la conversione da numero a griglia non è uguale tra linguaggi (`Math.round(2,5) = 3`, Python `round(2,5) = 2`; `0,0003/1e-4 = 2,9999999999999996`); pareggi `c1 = c2` e `θ_bassa = θ_alta` diventano frequenti; pesi sotto il passo diventano 0 e attivano S4 nel genoma; la granularità è una scelta nuova. | Media | Nominarla e scartarla per R3, salvo che Luca preferisca la precisione nel genoma (Q3a, opzione c). |
| 4a | **Alt. 4 (allineamento).** Per il GA equivale allo scambio (M14); aggiunge la regola di parità per `c1 = c2`, che con il margine di C-2 sparisce. | Bassa | Portare la distinzione validità/convenzione come spiegazione; implementazione = scambio. |
| 5a | **Alt. 5 (scala come passo implicito).** Corretta (M12); con l'Alt. 1 diventa senza oggetto. | Bassa | Una riga «perché la scala è fissata». |
| P2 | **Parte 2.** A1-A5 equivarianti per scala congiunta (verificato A1, A3, BLX; SBX lineare in `β`, per algebra), non per scale indipendenti (M12); SBX e BLX con limiti non sono equivarianti; C8 errata (M11); B6 scartata a ragione (zero assorbente, verificato per algebra); D2 corretto. | Media | Correggere C8 e Sfida 1 prima che entrino nel documento. |

### Rilievi trasversali (Alti)

- **O1 — Operatori e scala comune (Alta).** Qualunque incrocio standard dipende dalla scala di ciascun genitore (M12), quindi con pesi e soglie grezzi l'esito dell'evoluzione dipende da come la popolazione è distribuita lungo S1. Lo Step 3 lo lascia a E3, lo Step 4 lo riduce a un criterio di equivarianza che vale solo per la mutazione. Mitigazione: **Alt. 1** (scala fissata, nessuna scelta per E3), oppure, se Luca tiene le soglie grezze, dichiarare «nessuna renormalizzazione, passo assoluto» come scelta voluta con la sua conseguenza. Costo: riscrivere la sezione operatori attorno alla scelta.
- **H1 — Hash riproducibile tra linguaggi (Alta, AC-09).** Verificato oggi: `(1,25).toPrecision(2) = "1.3"` e `(2,5).toPrecision(1) = "3"` in Node, `"1.2e+00"` e `"2e+00"` in Python (arrotondamento al pari sul valore binario); `Math.round(2,5) = 3` contro `round(2,5) = 2`; `json.dumps` scrive `-0.0`, `1e-07`, `9007199254740992.0` e **accetta `NaN`** senza errore (RFC 8785 lo vieta). I pareggi decimali sono rari su numeri casuali ma frequenti negli **esempi scritti a mano** (pesi come 2,5 o rapporti come 129/256 dopo la normalizzazione). Mitigazione: la specifica non usa funzioni di stampa di un linguaggio: (a) **senza quantizzazione decimale** (possibile con l'Alt. 1 o con la sola norma del massimo, M7), i numeri si serializzano come **byte binary64 in esadecimale** o come mantissa intera ed esponente in base 2 (Parte 2, E3 b-c), con `-0 → 0` prima; (b) se Luca vuole la quantizzazione, la regola di arrotondamento è scritta (ad es. al pari sul valore binario esatto) con **vettori di prova** che includano pareggi, e Python usa `allow_nan=False`. Costo: specifica e vettori di prova, che lo Scientist usa allo Step 9.
- **Q3a — La quantizzazione cambia il significato di «duplicato» (Alta).** La risposta 2 di Luca chiede l'uguaglianza **di comportamento**. Quantizzare unisce genomi che **non** decidono sempre allo stesso modo (differiscono oltre la precisione) e lascia comunque separati equivalenti a cavallo di un arrotondamento (M7). Presentarla come «il modo di riconoscere S1» (Sfida 5) porterebbe Luca a scegliere una precisione credendo di scegliere un'implementazione. Mitigazione: hash **esatto** sulla forma canonica senza quantizzazione (riconosce S2, S4, S5, e S1 per fattori potenza di 2; con l'Alt. 1 S1 non esiste più nel genoma), e un'eventuale **chiave di quasi-duplicato** a precisione dichiarata, separata e nominata come tale (Q3 riformulata sotto).

### Casi limite della codifica (al posto del Destroyer)

1. **Vincoli violati dopo incrocio e mutazione.** A1 e A2 violano V2 e V3 (gene per gene o blocco per blocco); ogni mutazione gene per gene li viola (M11); A3 li conserva salvo uguaglianza per arrotondamento (M10); BLX e SBX escono dagli intervalli. Uguaglianze (`τ1 = τ2`, `θ_bassa = θ_alta`) non sono riparate dallo scambio: serve il rifiuto (C-2, A-3). Un controllo finale V1-V4 su ogni figlio resta, come guardia che non dovrebbe mai scattare, e la prova di proprietà (`ref/check-ops.mjs`) conta quante volte scatta.
2. **Genomi equivalenti con numeri diversi.** Riconosciuti per costruzione: S2 (scambio), S4 (segnaposto `null`, non un `c` valido), S5 (tre classi, o tre intervalli di `b` con l'Alt. 1), S1 esatta. **Nuova, dipendente da R4-1:** se `buy_percent`, stop loss e take profit sono geni, un genoma che non compra mai (classi S5 «sempre `hold`» e «sempre `sell`») ha questi tre geni irrilevanti: S6, da aggiungere alla lista. **Nuova, dipendente dagli intervalli:** con `c` = 1 ammesso per N1 o N16, `x_i ≡ 0` e `w_i` irrilevante (errore 2). Non riconosciuti: come lo Step 3, più la quasi-identità di M3.
3. **Valori non finiti.** V4 prima della forma canonica; RFC 8785 rifiuta `NaN` e `Infinity`, Python no (H1); un `NaN` negli ingressi cambia la classe di S5 (M5) ma F-code-5 lo esclude con la regola di salto; `τ` fuori da ±709,78 dà `c` = 0 o un'eccezione in Python (M8).
4. **`-0`.** Pesi `-0` danno punteggio `+0` (verificato) e decisioni uguali; nella serializzazione `-0 → 0` (RFC 8785, Appendice B); nell'hash su byte binary64 va normalizzato prima, altrimenti `0` e `-0` hanno hash diversi pur essendo lo stesso genoma.
5. **Quantizzazione ai confini.** Irriducibile: per ogni precisione esistono equivalenti con hash diverso, con probabilità che scende con le cifre ma non è 0 (M7); unioni di genomi diversi sotto la precisione (Q3a).
6. **Hash.** Le collisioni di SHA-256 non sono un rischio pratico; lo sono un **hash troncato** per la visualizzazione (con 32 bit il paradosso del compleanno dà collisioni attese dopo decine di migliaia di genomi `[algebra]`) e i **falsi «diversi»**: stessi geni con un decodificatore diverso (formule degli ingressi, regola di salto, forma del confronto, ordine della somma, costanti del `Trader` fuori dal genoma). Mitigazione: nel testo canonico, versione dello schema **e** versione del decodificatore; conservare il testo canonico accanto all'hash (Parte 2, E5).
7. **Pareggi esatti nella decisione.** `s = θ` dà `hold` con `>`/`<`; la forma del confronto fa parte del decodificatore (M1, M13).

### Copertura degli AC e dipendenze da R4

- **Raggiungibili con C e le mitigazioni:** AC-01 (totale 16, o 15 con l'Alt. 1, sempre con il blocco 0/+3 di R4-1), AC-02, AC-03 (V2 con margine e rifiuto per le uguaglianze), AC-05 (condizioni di M1-M6 scritte per intero), AC-06, AC-07, AC-10-AC-16.
- **AC-04 a rischio** se il documento riprende C8: «ogni operatore, seguito dalla strategia di AC-03, produce solo genomi validi» va dimostrato per ogni coppia operatore-strategia, comprese le uguaglianze in virgola mobile.
- **AC-08 a rischio** su E4 con `k` = 3: la forma canonica di `fl(3·g)` può differire da quella di `g` e le decisioni sui 20 giorni possono, in teoria, differire (M1, M7). Mitigazione: E4 con `k` = 2 (esatto) e un esempio con `k` = 3 mostrato onestamente (stesse decisioni sui 20 giorni se lo script lo misura, forma canonica uguale o no secondo la regola scelta).
- **AC-09 a rischio** senza H1.
- **Dipendenze da R4 che possono invalidare la codifica:**
  - **D-R4-1 (omogeneità).** Alt. 1, `θ_alta = 1` di B e la normalizzazione S1 della forma canonica valgono solo se la regola di R4 resta omogenea in pesi e soglie. Il pericolo è nella direzione opposta: se R4 rompe S1 e la forma canonica continua a normalizzare, l'hash **unisce genomi non equivalenti**. Mitigazione: ogni simmetria della forma canonica porta la sua condizione su R4; la forma canonica ha una versione; R4 dichiara quali di S1-S6 sopravvivono.
  - **D-R4-2 (ingressi usati fuori dalla somma).** Un ingresso riusato come divisore, cancello (R7, #23) o condizione rompe S4 per quell'ingresso; un divisore su un solo ingresso di distanza rompe S2 (errore 1).
  - **D-R4-3 (`Trader`).** Con i tre numeri come geni: S6 e intervalli V5; come costanti: nella versione del decodificatore.

### Domande aperte: conseguenze delle opzioni (senza rispondere per Luca)

- **Q1 (segno delle soglie).** Il catalogo non ha bias: con V3 debole le soglie dello stesso segno sono l'**unico** modo di avere una strategia che compra (o vende) con ingressi neutri; V3 forte lo vieta. V3 forte riduce S5 a una classe (`hold`) e permette `θ_alta = 1` di B; con l'Alt. 1 diventa solo l'intervallo `-1 < b < 1`.
- **Q2 (16 più il blocco di 0 o 3).** Con i tre numeri come geni compare S6 e servono V5 e passi di mutazione propri; come costanti, entrano nella versione del decodificatore dell'hash. Con l'Alt. 1 la base è 15.
- **Q3 (precisione).** Va riformulata (Q3a): la quantizzazione non è necessaria per riconoscere gli equivalenti esatti e introduce una relazione «quasi uguale» che va oltre la risposta 2. Proposta di formulazione, una frase per scelta (AC-16):
  - **Q3 — Duplicati quasi uguali.** (a) Solo hash esatto: segnala come duplicati soltanto genomi che decidono sempre allo stesso modo per una simmetria dimostrata. (b) Hash esatto più una chiave di quasi-duplicato a una precisione dichiarata, segnalata a parte. (c) Precisione nel genoma (griglia di interi, Alt. 3): hash esatto, ma ogni gene ha un passo minimo.
- **Q4 (impronta).** (sì) Serve una serie sintetica versionata e abbastanza lunga, e una simulazione in più per genoma; il controllo di coerenza funziona solo con l'hash esatto (2a). (no) Le equivalenze non dimostrate restano invisibili, come lo Step 3 dichiara.
- Nessuna domanda nuova: il margine di V2 (C-2) e la scelta tra Alt. 1 e soglie grezze rientrano nella scelta della codifica (AC-13) e vanno presentate come opzioni del documento.

### Classifica degli approcci per rischio (dal più alto al più basso)

1. **B con direzione di norma 1** — proiezione dopo ogni operatore, lettura persa, «per costruzione» falso in virgola mobile e con i limiti (B-1, B-2).
2. **Alt. 3 (griglia di interi)** — sposta i problemi di arrotondamento nella conversione e nei pareggi, aggiunge una granularità da scegliere (3a).
3. **A (grezzo con clamp)** — ripete i difetti di Consilium (A-1) e lascia S1 come passo nascosto (A-2).
4. **C come scritto allo Step 3** — buono sui `c`, ma lascia a E3 la renormalizzazione (C-1, O1), V2 senza margine (C-2) e l'opzione `e^η` (C-3).
5. **B con `θ_alta = 1`** — vicina all'Alt. 1 ma condizionata a V3 forte (B-3).
6. **Alt. 2 come complemento** — innocua se facoltativa e su serie sintetica (2a).
7. **Alt. 4 e Alt. 5** — corrette, si riducono a spiegazioni (4a, 5a).
8. **C con l'Alt. 1 e le mitigazioni** (sotto) — il rischio residuo è D-R4-1, dichiarabile.

### Verdetto

**Inaccettabili:**
- **B con direzione di norma 1** come codifica del genoma: costo di lettura e di operatori senza un vantaggio che l'Alt. 1 non dia.
- **Le affermazioni C8, Sfida 1 (come criterio per l'incrocio) e Sfida 5 («quantizzazione necessaria»)**, e la frase di R4-3 dello Step 3: non sostenute dal calcolo o dall'algebra (M7, M11, M12, errore 1). Accettabili corrette come sopra.
- **Una serializzazione che dipenda da `toPrecision`, `Math.round`, `JSON.stringify` o `json.dumps`** senza regola scritta e vettori di prova (H1).
- **L'opzione `τ2 = τ1 + e^η`** (C-3).

**Accettabili con mitigazioni:** **C**, con: `τ_i` indipendenti, limitati **per ingresso** e riflessi ai bordi, forma stabile della logistica (M8, errore 2); V2 con margine, scambio delle coppie e rifiuto (C-2); soglie con l'**Alt. 1** se R4 resta omogenea, altrimenti grezze con la norma del massimo nella forma canonica e la scelta su O1 scritta; mutazione gene per gene seguita dalla gestione di V2-V3 (M11); hash esatto, versione di schema e decodificatore, testo canonico conservato (H1, casi limite 6); quantizzazione solo come chiave separata se Luca la sceglie (Q3a). **A** resta accettabile come termine di confronto con Consilium, non come proposta. Alt. 2 facoltativa, Alt. 3 nominata e scartata salvo Q3 (c).

### Raccomandazione operativa per lo Step 7 (BUILDER)

- **Prima di scrivere:** rifare in `ref/` (non copiare da qui) i controlli M1, M2, M8-M12 e il caso di pareggio di H1; in `ref/check-ops.mjs` contare anche le uguaglianze, non solo le violazioni; in `ref/check-symmetry.mjs` aggiungere S6 e il controllo dell'ordine della somma (M2).
- **Nel documento:** S1-S5 con le condizioni di M1-M6 (ordine della somma fisso, nessun overflow o subnormale per la potenza di 2, tre classi di S5, «al più 15»); S6 come dipendenza da R4-1; la tabella R4 corretta su R4-3 (errore 1) e con D-R4-1 in testa; la sezione operatori costruita attorno a O1; la sezione hash con la regola di H1 e vettori di prova che includano pareggi decimali, `-0`, valori al bordo di `τ`; Q3 nella forma riformulata.
- **Fuori dal documento, nel ciclo (Step 10):** il fatto F-code-4 sul vincolo `unique` (schemi letti) può entrare in una nota `knowledge/` su Consilium.

### Controllo UX standing

Il ciclo produce un documento, senza campi, controlli né passi di flusso (Step 2 e Step 3): Q3 («stato incoerente») e Q5 («input sbagliato, output silenziosamente sbagliato») non si applicano all'interfaccia. Lo **spirito di Q5** ricompare nell'hash: una forma canonica che normalizza S1 dopo che R4 l'ha rotta segnala come duplicati genomi diversi senza alcun errore (D-R4-1). Lo porto come requisito di versione della forma canonica, non come rilievo UX.

### Nota di diversità cognitiva

Gli Step 3 e 4 hanno ragionato su simmetrie in aritmetica esatta e su operatori descritti dalle fonti. Questo step ha cambiato **oggetto**: ha guardato i numeri in virgola mobile (dove S1 con `k` generico non esiste esattamente, S2 dipende dall'ordine della somma e V2 stretto cade per uguaglianza), e ha controllato le proprietà degli operatori **sugli enunciati dell'Explorer**, trovando che l'equivarianza non basta per l'incrocio e che C8 non regge. Ha chiuso una domanda aperta leggendo gli schemi reali del database invece del modello (`unique` presente solo in un file vecchio). Limite: stesso modello degli step precedenti; l'indipendenza è di compito e di strumento, non di mente (`patterns/independent-verification-chain-research`).

**Confidence:** Medium-High — citazioni del codice, schemi del database e affermazioni matematiche ricontrollate su file, algebra e script; restano non verificati: la frequenza reale dei cambi di decisione di S1 con `k` generico su dati (Step 9), l'indipendenza lineare dei 7 ingressi in generale (solo un indizio su una serie sintetica), il comportamento di PostgreSQL sulla lunghezza del genoma, e il valore del margine di V2.

**Step 6 (DESTROYER) omesso per track** (Step 1): i casi limite della codifica sono nella sezione «Casi limite» qui sopra.

**Prossimo step:** Step 7 — BUILDER

## Step 7 — BUILDER: Produce a Solution

**Agent:** claude-opus-5-5 (subagent)
**Confidence:** Medium — schema, operatori, forma canonica e hash sono specificati in pseudocodice e riprodotti da script (0 figli invalidi su 100000 per operatore; simmetrie controllate nei bit su dataset inventato, serie sintetica ed ENI; vettori V1-V3 ricalcolati anche con un breve script Python di autocontrollo dalla regola scritta); tutti i numeri del documento sono in `out/` (`check-doc.mjs` 11/11). La confidenza non sale perché (a) intervalli dei geni, passo del 5 %, margine ln 2 e W_i sono scelte dell'autore `[ipotesi]`, con il limite alto di `τ` che aspetta l'avvio massimo di R6; (b) l'indipendenza lineare dei 7 ingressi (quindi «15 gradi di libertà» come valore esatto) non è dimostrata; (c) la verifica indipendente (AC-09) e le letture simulate (AC-10) non sono ancora fatte; (d) la build di Pages non è provata.
**Assunzioni**
- Vincoli di Luca applicati: 7 ingressi sempre attivi, lunghezza fissa, nessun gene di presenza; duplicati riconosciuti per comportamento, solo segnalati, eliminazione a E3. Luca sceglie tutto alla fine: il documento presenta 11 domande (Q1-Q11) con la proposta dell'autore marcata come tale e non decide per lui.
- Proposta (verdetto dello Step 5): approccio C con l'Alt. 1 (centro `b`, semi-ampiezza fissata a 1), `τ` = ln(età media) indipendenti, limitati e riflessi, V2 con margine δ = ln 2, scambio e rifiuto, incrocio per blocchi (le due distanze in un blocco), mutazione gaussiana con riflessione, hash esatto su forma canonica senza quantizzazione, numeri in esadecimale binary64.
- Regola di decisione del catalogo, sommata da sinistra a destra con le due distanze per prime; confronti `s > b + 1` e `s < b - 1`.
- `docs/MAP.md` non si tocca (Step 12, come da istruzione dell'operatore; lo Step 3 lo proponeva allo Step 7). Unico tocco a un documento esistente: un collegamento nel capitolo 6 del catalogo, proposto dallo Step 3.

### Questioni non risolte (dichiarate prima del resto)
- **AC-09 verifica indipendente:** non fatta (Step 9). `verify/` contiene solo `README.txt`; lo Scientist ricalcola in Python dal documento senza leggere `ref/` né `out/`. Lo script `notes/step7-selftest-hash.py` è un autocontrollo dell'autore sugli hash, non la verifica.
- **AC-10 letture simulate:** non fatte (Step 8-9); `reviews/` vuota. Sezioni da far leggere: «In breve», 2.1, 5.1-5.2, 7.1-7.4, capitolo 11.
- **Lunghezza:** 710 righe; 7108 parole di testo, 3140 nelle tabelle, 501 nel codice (10777 in tutto, conteggio `check-doc.mjs`). Il testo è sotto l'obiettivo di 8000; il totale lo supera per le tabelle di consultazione (geni, scale, vettori di prova, tabella esadecimale, glossario) e i blocchi di geni e testi canonici, necessari perché la verifica in Python riproduca gli hash (H1). Riduzione da valutare allo Step 8.
- **Intervalli `[ipotesi]`:** età media 0,5-100 barre, W_i = 5/q_i dalla serie sintetica, `b` in [-5, 5], σ = 5 % dell'intervallo, δ = ln 2: portati a Luca come Q1, Q7, Q8.
- **Scala delle distanze dipendente da `τ`** (C-5): circa 26 volte tra i bordi di `τ`; la codifica non la corregge, dichiarato in 3.2.
- **Build Jekyll** non provata: PENDING_HUMAN dopo il merge (NRC-H03 estesa al nuovo documento); il documento usa lo stesso blocco `<style>` del catalogo.
- **Anteprima ArchiMate prima della PR** (regola di progetto): non fatta qui; nessun cambiamento architetturale, motivazione «nessun impatto» da scrivere alla PR.
- **Memoria:** il fatto F-code-4 (vincolo `unique` solo nello schema vecchio di Consilium) resta allo Step 10, come raccomandato dal Critic.

### Prodotto
- `docs/architecture/genome-encoding.md` (nuovo, 710 righe, 17 tabelle): front matter come il catalogo (`title`, `layout: doc`, `last_verified: 2026-11-14`), stesso `<style>` locale, nessun costrutto Liquid. Struttura: avvertenza, percorso di lettura, segni; **In breve** (problema, decisioni già prese, proposta a 15 geni in una tabella, operatori e hash in un paragrafo ciascuno, tabella delle 11 domande con proposta ed effetto); 1 notazione e rimandi (catalogo «Ingresso, parametro, gene», «Il punteggio lineare con soglie», 2.2, 3.3, 5.3; guida 2.4.3-2.4.4); 2 geni (tabella di 15 righe, conteggio 16/15/18/FSM, peso nullo); 3 vincoli V1-V5 con strategie e alternative, intervalli con origine (Q7, Q8, Q1); 4 opzioni di codifica con geni, vincoli, forma canonica e hash per ciascuna, scala comune e O1, `τ` contro `c` (Q5, Q6); 5 operatori in pseudocodice, prova di validità, confronto con Consilium e alternative (Q9, Q10); 6 simmetrie S1-S6 con condizioni esatte e controlli, non riconosciute; 7 forma canonica, testo canonico esadecimale, vettori di prova V1-V3, limiti dell'hash (Q11, Q3, Q4); 8 dipendenze da R4 con D-R4-1 in testa (Q2); 9 esempi E1-E6; 10 non accertato; 11 elenco finale delle domande; glossario; riferimenti al codice; 13 riferimenti con stato.
- Script in `/home/luca/Workspace/swarmtrader-r3-work/`: `dataset/copy-toy20.mjs` (copia del dataset di R2, si ferma se lo SHA-256 differisce) → `dataset/toy20-ohlcv.json`; `ref/data.mjs` (dataset, serie sintetica e ENI di R2 in sola lettura), `ref/indicators.mjs` (i 7 ingressi; importa R2 in sola lettura e **implementa N10**, incrementale e diretto), `ref/check-n10.mjs`, `ref/scales.mjs`, `ref/genome.mjs` (schema, vincoli, decodificatore, forma canonica, testo esadecimale, SHA-256, chiave a 24 bit), `ref/operators.mjs` (inizializzazione, incrocio per blocchi e alternative, mutazione con riflessione, scambio, rifiuto), `ref/examples-genomes.mjs`, `ref/examples.mjs`, `ref/check-symmetry.mjs`, `ref/check-ops.mjs`, `ref/numfmt.mjs` (chiama `python3 -I`), `ref/fingerprint.mjs` (Q4), `ref/facts.mjs`, `ref/wrap.mjs`, `ref/check-doc.mjs`; uscite in `out/` (`check-n10.md`, `scales.md`, `facts.md`, `examples.md`, `check-symmetry.md`, `check-ops.md`, `numfmt.md`, `fingerprint.md`, `check-doc.md`); `verify/README.txt`. Sonde dello Step 7 non citate in `notes/step7-*`.
- `_data/docs.yml`: voce `genome-encoding` sotto `architecture`, dopo il catalogo.
- `docs/architecture/genome-indicators-catalog.md`: un collegamento nel capitolo 6 («Il conteggio è da passare a R3 …»), nessun'altra modifica.
- **Fatti nuovi trovati scrivendo gli script:** (1) la riflessione, applicata anche a valori interni, ne cambia l'ultima cifra binaria (1,5298317366548038 → …035): la regola la applica solo fuori dall'intervallo. (2) La forma canonica deve ordinare le due distanze trattando un peso nullo come `τ` infinito, altrimenti due genomi con una sola distanza attiva in posizione 1 o 2 (equivalenti nei bit, 0 punteggi diversi su 125850) avrebbero hash diversi. (3) L'incrocio intermedio esce dagli intervalli e dal margine per arrotondamento in 3543 figli su 100000 da genitori ai bordi: serve il riporto finale (dopo, 0 invalidi). (4) Le decisioni di E1 coincidono giorno per giorno con quelle del catalogo 7.5 nonostante ATR tolto e N10 al posto di N9.

### Risposte ai rilievi del Critic (Step 5)

| Rilievo | Risoluzione |
|---|---|
| M1 S1 in virgola mobile | **Risolto.** Cap. 6: esatta per `k` potenza di 2 senza overflow né subnormali; controesempio `k` = 2^-1000 rifatto (`buy` → `hold`); caso costruito 44132/200000 con `k` = 3, 0 con `k` = 8; tabella su 1107400 barre per `k`. |
| M2 S2 e ordine della somma | **Risolto.** Distanze come primi due addendi nel decodificatore; 0/503400 diversi nei bit, controllo 2-7: 279871/503400. |
| M3 S3 | **Risolto.** Esclusa dal margine δ; quasi-identità dichiarata non riconosciuta. Autovalori non riportati (nessun numero citato). |
| M4 S4 | **Risolto.** Condizioni (finito, solo nella somma) e controllo 0/880950. |
| M5 S5 tre classi | **Risolto.** Tre classi su `b` con confini inclusi, segno di `b ± 1` esatto; controllo con ±1 e numeri adiacenti. |
| M6 «16 numeri, 15 gradi» | **Risolto.** «Al più 15», con le due condizioni (2.2). |
| M7 quantizzazione «necessaria» | **Risolto.** Nessuna quantizzazione nell'hash; S1 con `k` generico dichiarata non riconosciuta (194-199 hash diversi su 200); chiave di quasi-duplicato separata (Q3 b) con l'esempio a cavallo. |
| M8 bordi di `τ` | **Risolto.** -36,7369 e 709,7827 rifatti in `check-ops.mjs`; Python `OverflowError` in `numfmt.mjs`; forma stabile nel documento; limiti [ln 0,5; ln 100]. |
| M9 `τ2 = τ1 + e^η` | **Risolto.** Scartata (4.3). |
| M10 convessità in virgola mobile | **Risolto.** Misurato: 3543/100000 fuori per arrotondamento; riporto e rifiuto, poi 0 (5.3). |
| M11 C8 errata | **Risolto.** Non ripresa: ogni mutazione gene per gene è seguita da scambio e rifiuto (pseudocodice 5.1); la tabella 5.3 dice «V2 no» per gaussiana e polinomiale. |
| M12 equivarianza solo per la mutazione | **Risolto.** O1 rifatto in `check-ops.mjs` con fattori potenze di 2: 0 differenze con entrambi i genitori scalati, 16247/16326, 20000/20000, 14607/14607 con il solo secondo (4.2). |
| M13 Alt. 1 | **Risolto.** Una sola forma del confronto nel decodificatore (`s > b + 1`, `s < b - 1`); condizione di omogeneità in 4.2 e cap. 8. |
| M14 scambio = forma canonica di S2 | **Risolto.** Lo scambio nel genoma è dichiarato non cambiare le decisioni; stesso intervallo di `τ` per le due distanze richiesto (Q8); scambio delle soglie dichiarato riparazione vera (3.1, V3 alternativa). |
| M15 etichetta Sfida 2 | **Risolto.** Passeggiata rifatta con etichette esatte: clamp 3,92 % sul bordo (1,85 % a `c` = 1), riflessione 0,00 %; dichiarata «senza selezione». |
| M16 età media | **Risolto.** Rifatto in `facts.mjs` (0,0101 → 0,0638; 9 → 19). |
| Errore 1 (R4-3 e S1) | **Risolto.** Tabella cap. 8: l'ATR non rompe S1; un divisore su una sola distanza rompe S2; S4 esteso al `τ` dell'ATR. |
| Errore 2 (ragione di V1) | **Risolto.** V1 motivato per le due distanze e il volume relativo (ingresso sempre 0) e per `genome.js` riga 86; per gli altri ingressi il motivo è l'avvio. Intervallo uguale per tutti proposto, per ingresso come opzione Q8 (b). |
| Errore 3 (S5 incompleta) | **Risolto** (M5). |
| Errore 4 (F-code-3) | **Risolto** in forma ridotta: «il genoma fisso è fuori dagli intervalli di Consilium» con un esempio (3.2); dettaglio nel ciclo. |
| Errore 5 (C8, Sfida 1, Sfida 5, Sfida 2, costo Alt. 2) | **Risolto.** M11, M12, M7, M15; Q4 dice «una simulazione in più per genoma». |
| Errore 6 (nessuna citazione sbagliata) | Preso atto; citazioni ricontrollate (Self-Test). |
| A-1 clamp lineare su `c` | **Risolto.** A resta solo come confronto (Q6 b con riflessione, Q10 b); dati della passeggiata in 5.3. |
| A-2 scala come passo nascosto | **Risolto.** 4.2 e Q5. |
| A-3 scambio delle soglie | **Risolto.** Detto «cambia il comportamento» (3.1); con la proposta V3 è impossibile da violare; con Q5 b/c rifiuto se coincidono. |
| B-1 «per costruzione» falso | **Risolto.** 4.3 (limiti necessari, valori dei bordi). |
| B-2 sfera di norma 1 (Alta) | **Risolto.** Scartata con motivo (4.1). |
| B-3 `θ_alta = 1` | **Risolto.** Detto equivalente alla proposta con Q1 (b) (4.1). |
| C-1 rinormalizzazione facoltativa (Alta, O1) | **Risolto.** Non lasciata a E3: con la proposta non serve; con soglie grezze è un'opzione esplicita di Q5 (b, c) con la sua conseguenza misurata. |
| C-2 V2 senza margine | **Risolto.** δ = ln 2 (Q7), scambio se `τ1 > τ2`, rifiuto se manca il margine, ricaduta sul genitore dopo 20 tentativi (156/100000 con `pm` = 1). |
| C-3 opzione `e^η` | **Risolto.** Scartata. |
| C-3b overflow della logistica | **Risolto.** Forma stabile e limiti ben dentro ±36. |
| C-4 «solo per l'hash» contraddetto | **Risolto.** 7.1: «la forma canonica serve solo all'hash; lo scambio S2 nel genoma è già fatto dagli operatori». |
| C-5 intervalli dei pesi senza scala | **Mitigato.** W_i = 5/q_i dalla serie sintetica, `[ipotesi]`, in semi-ampiezze; dipendenza da `τ` dichiarata come limite (3.2). |
| 1a Alt. 1 | **Risolto.** Proposta (Q5 a), condizionata all'omogeneità di R4. |
| 1b Alt. 1 con S1 rotta | **Risolto.** Cap. 8, R4-2: la semi-ampiezza torna gene (16). |
| 2a impronta | **Risolto.** Q4 facoltativa, insieme di prova dataset inventato + serie sintetica versionato; controllo di coerenza solo con hash esatto (0 incoerenze su 600 coppie). |
| 3a griglia di interi | **Risolto.** Opzione Q3 (c) con il problema `Math.round`/`round` scritto. |
| 4a allineamento | **Risolto.** Implementato come scambio; il caso del pareggio sparisce con il margine; ordine deterministico nella forma canonica. |
| 5a scala come passo | **Risolto.** 4.2. |
| P2 Parte 2 | **Risolto.** Tabella 5.3 corretta (C8 non ripresa, BLX/SBX con gestione dei limiti, moltiplicativa scartata con motivo, auto-adattivo con l'esclusione dall'hash). |
| O1 (Alta) | **Risolto.** Operatori costruiti attorno alla scala fissata (Alt. 1); alternativa con soglie grezze esplicita in Q5 con i numeri di M12. |
| H1 (Alta) | **Risolto.** Testo canonico senza numeri decimali (esadecimale binary64, -0 → 0), coincidente con JCS per l'oggetto; vettori V1-V3 con -0, subnormale, 1e-7, pareggi 1,25 e 2,5, `τ` ai bordi; limiti di `τ` come letterali; tabelle Node/Python in 7.2; opzione decimale come Q11 (b). Autocontrollo Python: 4 hash uguali. |
| Q3a (Alta) | **Risolto.** Hash esatto; quantizzazione solo come chiave separata e nominata (Q3 b, 24 bit con arrotondamento al pari sui bit), con l'esempio della coppia a cavallo; Q3 nella forma riformulata (a)/(b)/(c). |
| Casi limite 1 | **Risolto.** Uguaglianze gestite con il rifiuto; controllo finale contato (0 invalidi). |
| Casi limite 2 | **Risolto.** S2, S4 (con S2 insieme), S5, S1 per potenze di 2; S6 come dipendenza R4-1. |
| Casi limite 3 | **Risolto.** V4 prima della forma canonica; `NaN` → `null` in Node e `NaN` in Python mostrati; 0 valori non finiti negli ingressi. |
| Casi limite 4 (-0) | **Risolto.** -0 → 0 nella forma canonica; nei vettori. |
| Casi limite 5 (quantizzazione ai confini) | **Risolto.** Esempio E5 e Q3 (b). |
| Casi limite 6 (hash troncato, decodificatore) | **Risolto.** Versioni `schema` e `decoder`; testo canonico da conservare; 32 bit: 50 % con circa 77163 genomi. |
| Casi limite 7 (pareggi nella decisione) | **Risolto.** Forma dei confronti nel decodificatore. |
| D-R4-1 omogeneità | **Risolto.** In testa al cap. 8, con la regola «R4 dichiara quali di S1-S6 sopravvivono». |
| D-R4-2 ingressi fuori dalla somma | **Risolto.** R4-3 e R4-5. |
| D-R4-3 `Trader` | **Risolto.** R4-1 e Q2. |
| AC-04 a rischio | **Risolto.** Prova per ogni coppia operatore-strategia, comprese le uguaglianze in virgola mobile (5.2-5.3). |
| AC-08 a rischio (E4 con `k` = 3) | **Risolto.** E4 con `k` = 2 esatto, `k` = 3 esatto solo sui numeri interi dell'esempio (detto), e un genoma a numeri non tondi dove 3Q ha hash diverso ma stesse decisioni. |
| AC-09 a rischio (H1) | **Mitigato**; la verifica è dello Step 9. |
| F-code-4 in memoria | **Rinviato** allo Step 10. |

### Self-Test Log (obbligatorio)

| Componente | Metodo (comando, da `/home/luca/Workspace/swarmtrader-r3-work/`) | Uscita osservata | Esito |
|---|---|---|---|
| dataset | `node dataset/copy-toy20.mjs` | «toy20-ohlcv.json: copia identica, sha256 ab9cbc74…9f61» | PASS |
| N10 | `node ref/check-n10.mjs` | «D4 del catalogo (13 giorni, c = 0,1): PASS»; incrementale = diretto, scarto massimo 8.2e-15 (giocattolo), 1.5e-13 (sintetica), 4.8e-14 (ENI 1700-1800) | PASS |
| esempi E1-E6, vettori | `node ref/examples.mjs` | E1 11 buy, 5 hold, 4 sell, 0 giorni diversi dal catalogo 7.5; F, M validi; R1, 2R1, 3R1 hash di E1; 3Q hash diverso, decisioni uguali; V1 `29ae884b…0a0d`, V2 `dce8550b…33e8`, V3 `32e58bc1…860f` | PASS |
| simmetrie | `node ref/check-symmetry.mjs` | S1: 0 decisioni diverse su 1107400 barre per ogni `k`, hash diversi 0 per potenze di 2 e 194-199/200 altrimenti; caso costruito 0 (k = 8) e 44132/200000 (k = 3); S2 0/503400; S4 0/880950; S2+S4 0/125850; S5 classi corrette ai confini; 0 non finiti | PASS |
| operatori | `node ref/check-ops.mjs` | inizializzazione, incrocio per blocchi, mutazione (pm 1/15 e 1): 0 invalidi su 100000; uniforme 17658 → 0, intermedio 3543 → 0 dopo la gestione; O1 0 con scala congiunta, 16247/16326, 20000/20000, 14607/14607 con scala indipendente | PASS |
| formati numerici | `node ref/numfmt.mjs` | `1e-7` contro `1e-07`, `-0.0`, `9007199254740992.0`, `1.3` contro `1.2e+00`, `Math.round(2.5)` 3 contro 2, NaN `null` contro `NaN`, `1/(1+e^710)` 0 contro `OverflowError` | PASS |
| impronta (Q4) | `node ref/fingerprint.mjs` | 600 coppie equivalenti: 0 incoerenze; 0/300 impronte uguali tra casuali; E1/E5 hash diversi, impronta uguale | PASS |
| fatti | `node ref/facts.mjs` | FSM 11 scalari, 9 stati, 36 transizioni, 135 ID, 1 azione; avvio 3/5/14/29/302 barre; σ_τ ×1,303; 77163 genomi per 32 bit | PASS |
| hash in un altro linguaggio (autocontrollo) | `python3 -I notes/step7-selftest-hash.py` | V1, V2, V3, E5 identici agli hash di `out/examples.md` | PASS |
| documento | `node ref/check-doc.mjs` | 11 PASS (Liquid, codice ≤ 80 colonne, 17 tabelle coerenti, 7 tabelle di dati = `out/`, 10 hash, 3 testi canonici, 6 blocchi di geni, 547 numeri rintracciati, 13 riferimenti, 4 ancore, Q1-Q11 in sezione e in elenco); righe 710, parole del testo 7108, tabelle 3140, codice 501 | PASS |
| Liquid | `grep -nE '\{\{\|\{%' docs/architecture/genome-encoding.md docs/architecture/genome-indicators-catalog.md` (nel repository) | nessuna riga, exit 1 | PASS |
| voce di menu | `python3 -c "import yaml…"` su `_data/docs.yml` | architecture = …, genome-indicators-catalog, genome-encoding | PASS |
| URL | `curl -s -L -A 'Mozilla/5.0' -w '%{http_code}'` sui 12 URL del documento | 200 per tutti | PASS |
| citazioni del codice | `sed`/`git show 2ec7237:…` su `genome.js` 13-47, 84-89; `strategy.js` 30-56; `dataTrainer.js` 34; `individual_v2.js` 1-4, 161-193, 199-240, 277-280; `individual.js` 193-238, 268-276, 348-383; `ga_v2.js` 15-18, 80-131, 190-194, 215-218, 328-337; `orm.js` 454-505 | contenuti come citati; HEAD di Consilium `2ec7237` su `experiment/lb77` | PASS |
| nessun effetto su codice e modello | `npm test`; `npm run archimate:check` | «# tests 40 / # pass 40 / # fail 0»; «modello "eni-replay" valido (33 elementi, 55 relazioni)» | PASS |
| file toccati | `git status --short`; `git diff --stat` | ` M _data/docs.yml` (3 inserzioni), ` M docs/architecture/genome-indicators-catalog.md` (1 riga), `?? docs/architecture/genome-encoding.md`, più questo file | PASS |
| build Jekyll e resa a 390 px | — | SKIPPED: Ruby/Jekyll non installati; rischio: kramdown e il blocco `<style>`, tabelle larghe; mitigazione: stesso stile del catalogo già pubblicato, PENDING_HUMAN dopo il merge (NRC-H03) | SKIPPED |
| verifica indipendente, letture simulate | — | SKIPPED: compiti degli Step 8-9 (AC-09, AC-10); `verify/README.txt` predisposto | SKIPPED |

### Domande aperte per Luca (dal documento, capitolo 11)
- **Q5** soglie e scala comune: centro `b` con semi-ampiezza 1 (15 geni, proposta), due soglie senza rinormalizzare, o rinormalizzate prima dell'incrocio (16).
- **Q6** gene della memoria: `τ` = ln(età media) (proposta) o `c` con passo lineare.
- **Q1** segno delle soglie: `b` in [-5, 5] (proposta) o in [-1, 1] (punteggio zero sempre `hold`).
- **Q7** margine tra le velocità: ln 2 (proposta), nessuno, o altro rapporto.
- **Q8** intervalli: età media 0,5-100 e W_i della tabella (proposta), o per ingresso / dall'avvio di R6.
- **Q9** incrocio: per blocchi (proposta), uniforme per gene, intermedio.
- **Q10** mutazione: gaussiana con riflessione (proposta), uniforme con saturazione, polinomiale.
- **Q2** numeri del `Trader`: contati a parte secondo R4 (proposta), geni ora, costanti ora.
- **Q3** quasi duplicati: solo hash esatto (proposta), più chiave a 24 bit, griglia di interi.
- **Q4** impronta delle decisioni: no (proposta) o sì.
- **Q11** numeri nell'hash: esadecimale (proposta) o decimale RFC 8785.

**Prossimo step:** Step 8 — OPTIMIZER
