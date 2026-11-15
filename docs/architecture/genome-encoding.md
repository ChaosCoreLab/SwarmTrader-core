---
title: "Codifica del genoma a punteggio lineare"
layout: doc
last_verified: 2026-11-14
---

# Codifica del genoma a punteggio lineare

<style>
.doc-content table { display: block; max-width: 100%; overflow-x: auto; }
.doc-content li, .doc-content p { overflow-wrap: anywhere; }
</style>

Questo documento fa parte di **SwarmTrader**, il programma che rigioca giorno per giorno una strategia di compravendita sui prezzi storici di ENI. La strategia nuova, in progettazione, calcola ogni sera un **punteggio**, cioè una somma pesata di 7 **ingressi** (numeri calcolati dai prezzi e dai volumi passati), e lo confronta con due **soglie** per decidere `buy` (compra), `hold` (resta com'è) o `sell` (vendi). I numeri della strategia non si scelgono a mano: li cerca un **algoritmo genetico**, una procedura che prova molte strategie, tiene le migliori, le mescola e le cambia un poco, generazione dopo generazione. Il [catalogo degli indicatori](../genome-indicators-catalog/) ha scelto i 7 ingressi (ricerca R2); questo documento è la ricerca **R3**: dice quali numeri della strategia sono **geni** (i numeri che l'algoritmo genetico fa evolvere), entro quali limiti, come si mescolano e si cambiano senza produrre strategie non valide, e come si riconoscono due strategie che decidono sempre allo stesso modo. Le scelte sono di Luca: il documento le prepara, con una proposta dell'autore.

> **Avvertenza.** Gli esempi usano il dataset di 20 giorni **inventato** del catalogo e geni scelti a mano. Nessun numero dice che una codifica o un operatore «funziona meglio»: i confronti riguardano validità, scala e leggibilità, non i risultati dell'evoluzione.

**Percorso di lettura.** «In breve» (circa 40 minuti di lettura attenta) basta per capire che cosa si sceglie e per rispondere alle undici domande Q1-Q11 con un motivo: contiene la proposta, un esempio completo dai geni all'hash e, per ogni domanda, il problema, le opzioni, la proposta e un criterio. Il [capitolo 11](#domande-per-luca) ripete le domande con una tabella degli effetti di ogni opzione. I capitoli 1-8 spiegano le opzioni e sono consultazione; il capitolo 9 contiene gli esempi completi, che servono anche come casi di prova per chi scriverà il codice (E2) e l'evoluzione (E3). Il documento intero richiede poco più di due ore.

**Segni usati.** `[ipotesi]` marca un giudizio dell'autore o un fatto senza una fonte letta; i numeri tra parentesi quadre, per esempio [3], rimandano ai [Riferimenti](#riferimenti), ognuno con il suo stato (letto, solo abstract, non letto). Decimali con la virgola nel testo, con il punto nel codice. Tutti i numeri vengono da script conservati in `/home/luca/Workspace/swarmtrader-r3-work/` (fuori dal repository; `ref/` gli script, `out/` le uscite). Simboli e sigle sono raccolti nel capitolo 1 ([Sigle](#sigle)), i termini nuovi nel [Glossario](#glossario).

## In breve

### Il problema

La regola di decisione è quella del catalogo. Ogni sera si calcolano i 7 ingressi `x1 … x7`, si moltiplica ciascuno per il suo **peso** `w1 … w7` e si sommano: il punteggio è `s = w1·x1 + w2·x2 + … + w7·x7`. Se `s` è strettamente sopra la **soglia alta** si compra, se è strettamente sotto la **soglia bassa** si vende, altrimenti si resta (con `s` uguale a una soglia si resta); l'intervallo tra le due soglie è la **zona di attesa** e metà della sua larghezza è la **semi-ampiezza**. Ogni ingresso contiene una **media esponenziale** (EMA): ogni giorno la media si sposta verso il dato nuovo di una frazione `c`, compresa tra 0 e 1. Un `c` grande dà una memoria corta: i dati dentro la media hanno in media un'**età** di `(1 - c)/c` **barre** (una barra è un giorno di borsa), per esempio 4 barre con `c` = 0,2. I primi due ingressi sono la stessa formula, la distanza del prezzo da una media, con due memorie: una **veloce** e una **lenta**. Gli altri cinque sono: l'**RSI centrato** (RSI, *Relative Strength Index*, indice di forza relativa: vicino a +1 se negli ultimi giorni hanno prevalso i rialzi, a -1 se i ribassi); la distanza dal **massimo che dimentica** (un massimo recente dei prezzi che ogni giorno scende verso la chiusura di una frazione `c`, finché un nuovo massimo lo rialza); la posizione della chiusura tra minimo e massimo del giorno, in media; il volume rispetto alla sua media; l'**OBV normalizzato** (OBV, *On-Balance Volume*: la parte del volume recente scambiata nei giorni di rialzo meno quella dei giorni di ribasso, tra -1 e +1). Sei ingressi su sette valgono 0 quando non dicono nulla (prezzo sulla media, rialzi e ribassi in equilibrio, chiusura a metà giornata, volume nella media); la distanza dal massimo vale 0 quando la chiusura è sul massimo ed è negativa sotto (formule in 1.3).

Il genoma ha quindi tre tipi di numeri: 7 pesi, le soglie e i 7 coefficienti `c`. Per l'algoritmo genetico non basta elencarli: bisogna dire in quale forma scriverli, perché la forma decide tre cose.

1. **Che cosa può andare storto.** Alcuni numeri hanno vincoli: `c` tra 0 e 1, la media veloce più veloce di quella lenta, la soglia alta sopra la bassa. Un **incrocio** (il figlio prende parti dei due genitori) o una **mutazione** (piccolo cambiamento casuale) può violarli.
2. **Quanto pesa un passo di mutazione.** Spostare `c` di 0,05 cambia poco una memoria lunga e moltissimo una corta.
3. **Quando due genomi sono «lo stesso».** Moltiplicare pesi e soglie per 2 non cambia nessuna decisione (se `s` supera la soglia, anche `2s` supera il doppio della soglia): due genomi diversi nei numeri, uguali nel comportamento. Luca ha chiesto di riconoscerli con un **hash** (un'impronta di 64 caratteri calcolata dai numeri; testi diversi danno impronte diverse) e di segnalarli, non di eliminarli.

**Già deciso** (risposte di Luca del 2026-11-14): i 7 ingressi sono **sempre tutti presenti** (lunghezza fissa, nessun gene che accende o spegne un ingresso; un ingresso inutile si riconosce da un peso piccolo) e i duplicati si riconoscono per **uguaglianza di comportamento**; se e come toglierli dalla popolazione lo deciderà E3.

### La proposta in una tabella

La proposta dell'autore ha **15 geni**, tutti numeri reali, in quest'ordine fisso. La tabella ha una riga per gruppo di geni: che cosa sono, l'intervallo in cui possono stare (scelto dall'autore, `[ipotesi]`, capitolo 3) e perché sono scritti così.

| Geni | Che cosa sono | Intervallo proposto | Perché questa forma |
|---|---|---|---|
| `w1 … w7` | pesi dei 7 ingressi | da -W_i a +W_i; il limite W_i (tra 22 e 260) dipende da quanto è grande di solito l'ingresso (3.2) | si leggono come «quanto sposta il punteggio questo ingresso» |
| `b` | centro della zona di attesa: soglia alta `b + 1`, soglia bassa `b - 1` | da -5 a 5 (Q1) | la larghezza della zona è fissata a 2: sparisce il numero «scala comune», che non cambiava le decisioni, e la soglia alta è sempre sopra la bassa |
| `τ1 … τ7` | memoria di ogni ingresso, scritta come logaritmo dell'età media: `τ = ln((1 - c)/c)` | da ln 0,5 a ln 100 (età media da mezza barra a 100 barre) | un passo di mutazione moltiplica l'età media per lo stesso fattore, corta o lunga che sia |

Vincolo in più: la memoria lenta è almeno il **doppio** della veloce (`τ2 - τ1 ≥ ln 2`). Il catalogo contava 18 numeri per i suoi 8 ingressi; con le risposte di Luca D3 b e D4 b (l'agitazione esce dalla somma, il massimo di 10 giorni diventa il massimo che dimentica) restano 7 ingressi e 16 numeri se le soglie restano due, 15 con la forma proposta, perché un grado di libertà non cambiava nessuna decisione. Se R4 (le equazioni di decisione) farà evolvere anche quota investita, stop loss e take profit (la parte del capitale usata per comprare e le perdite e i guadagni percentuali a cui il motore vende da solo), i geni diventano 18 (capitolo 2).

### Un esempio dall'inizio alla fine

Il genoma G1 (capitolo 9, Esempio 1) ha pesi 25, 10, 0,5, 5, 1, 1, 0,5, centro `b` = 0 (soglie +1 e -1) e memorie `τ` = 0 per la distanza veloce (`c` = 0,5, età media 1 barra), 2,1972 per il massimo che dimentica (`c` = 0,1, età media 9) e 1,3863 per gli altri cinque (`c` = 0,2, età media 4).

1. **Dai geni agli ingressi.** Con questi `c`, il giorno 12 del dataset inventato i 7 ingressi valgono -0,0228; -0,0287; -0,3804; -0,0662; -0,1736; 0,3104; -0,3533.
2. **Dagli ingressi al punteggio.** Ogni contributo è peso per ingresso, per esempio 25 × (-0,0228) = -0,57; i sette contributi sono -0,57; -0,29; -0,19; -0,33; -0,17; 0,31; -0,18 e la somma è `s` = -1,42.
3. **Dal punteggio alla decisione.** -1,42 è sotto la soglia bassa `b - 1` = -1: `sell`. Sui 20 giorni G1 decide 11 `buy`, 5 `hold`, 4 `sell`.
4. **Dal genoma all'hash.** La forma canonica di G1 è G1 stesso (nessun peso nullo, distanze già in ordine); ogni numero si scrive con 16 cifre esadecimali e il testo dà l'hash SHA-256 `29ae884bca99df08a94d0a4b018d12f1577f65415d169ef216c4404c63440a0d`.
5. **Stesso comportamento, stesso hash; numeri appena diversi, hash diverso.** G4 è lo stesso genoma scritto con due soglie libere, +2 e -2, e tutti i pesi doppi: dividendo per la semi-ampiezza 2 torna G1 e l'hash è lo stesso. G5 è G1 con il peso 25 cambiato nell'ultima cifra binaria: decide uguale su tutti i 20 giorni ma ha un hash diverso, perché l'hash riconosce solo le equivalenze dimostrate.

### Operatori e hash

**Operatori proposti.** L'incrocio passa **blocchi interi**: ogni peso con la sua memoria, le due distanze (pesi e memorie) insieme, `b` da solo; così nessun figlio viola un vincolo. La mutazione aggiunge a un gene un passo gaussiano largo il 5 % del suo intervallo e, se il gene esce, lo **riflette** dentro di tanto quanto è uscito (con intervallo da 0 a 10, il valore 10,3 diventa 9,7). Se la memoria veloce supera la lenta scambia le due distanze con i loro pesi: il punteggio non cambia, perché le due distanze sono la stessa formula; se manca il margine ritenta. In 100000 prove per operatore nessun figlio è risultato invalido (capitolo 5).

**Hash.** Si calcola su una **forma canonica**: il genoma riscritto in modo che genomi equivalenti per una simmetria dimostrata diventino identici (con un peso nullo il suo `τ` non conta; con tutti i pesi nulli conta solo se la decisione costante è `buy`, `hold` o `sell`; le due distanze vanno in ordine). Ogni numero si scrive come le 16 cifre esadecimali della sua rappresentazione binaria, così Node e Python producono lo stesso testo; poi SHA-256, una funzione di hash standard. Con la proposta (Q5 a) due genomi con lo stesso hash decidono sempre allo stesso modo, se li valuta lo stesso programma: un decodificatore in Python e uno in Node calcolano `c` con un'ultima cifra diversa e possono decidere diversamente quando il punteggio cade a una o due ultime cifre da una soglia (mai sulle 1107400 barre provate; 1.4). Con le due soglie libere (Q5 b, c) la forma canonica divide per la semi-ampiezza arrotondando, e due genomi con lo stesso hash decidono allo stesso modo quasi sempre, non sempre (esempio costruito in 7.1). Il contrario non è garantito: genomi con hash diversi possono decidere uguale (capitolo 7).

### Le undici scelte per Luca

I numeri delle domande vengono dall'ordine in cui sono nate durante la ricerca; qui sono nell'ordine in cui conviene rispondere. Q5 e Q6 cambiano la forma dei geni, quindi vanno prima: Q1, Q7 e Q8 si leggono nella forma scelta; le altre sono indipendenti. Per ognuna: il problema, le opzioni con il loro effetto, la proposta dell'autore e un criterio. Il capitolo 11 ripete le domande con una tabella degli effetti; la scelta è di Luca.

**Q5 — Soglie: centro fisso o due soglie libere?** *Problema:* moltiplicare pesi e soglie per lo stesso numero positivo non cambia nessuna decisione, ma cambia l'effetto degli operatori (un passo fisso pesa poco su un genoma «grande» e molto su uno «piccolo»). (a) **Proposta:** centro `b` con le soglie a `b ± 1`: 15 geni, la soglia alta è sempre sopra la bassa, nessuna scala da gestire. (b) Due soglie libere, mai rinormalizzate: 16 geni; serve il vincolo «alta sopra bassa» e la scala resta un passo di mutazione nascosto. (c) Due soglie libere, con ogni genitore riportato a semi-ampiezza 1 prima dell'incrocio: 16 numeri salvati, ma i figli nascono sempre da genitori alla stessa scala. Con (b) e (c) la forma canonica divide per la semi-ampiezza e poi dà lo stesso testo di (a); la divisione arrotonda, quindi lo stesso hash dà le stesse decisioni quasi sempre, non sempre (7.1). Se si sceglie (a) e poi R4 aggiunge un termine fisso, si passa a 16 geni con un nuovo schema: i genomi a 15 geni si convertono senza perdita (soglie `b + 1` e `b - 1`, stessi pesi, stessi confronti), ma i loro hash cambiano, perché la versione dello schema entra nel testo dell'hash. *Per scegliere:* (a) se R4 manterrà la regola «omogenea» (nessun termine fisso che non si moltiplica insieme a pesi e soglie); (b) se vuoi leggere le soglie come numeri del catalogo o se R4 aggiungerà un termine fisso, per esempio un'isteresi in unità assolute (allora la forma canonica non divide più); (c) se vuoi le soglie libere ma una scala comune a tutti i genitori, solo con regola omogenea.

**Q6 — La memoria: `τ` o `c`?** *Problema:* con `c` come gene lo stesso passo cambia moltissimo una memoria corta e poco una lunga: da `c` = 0,99 a 0,94 l'età media passa da 0,01 a 0,06 barre, da `c` = 0,10 a 0,05 passa da 9 a 19. (a) **Proposta:** `τ` = logaritmo dell'età media: un passo moltiplica l'età media sempre per lo stesso fattore. (b) `c` direttamente, con passo lineare come Consilium. Stessi geni e stessi vincoli; i due schemi danno hash diversi per lo stesso comportamento e non vanno mescolati. *Per scegliere:* (a) se vuoi passi proporzionati a ogni memoria; (b) se preferisci leggere nel genoma gli stessi `c` del catalogo e di Consilium.

**Q1 — Senza segnali si può comprare o vendere?** *Problema:* gli ingressi valgono 0 quando non dicono nulla (sopra, «Il problema»), e con tutti gli ingressi a 0 il punteggio è 0; la strategia deve per forza restare ferma? (a) **Proposta:** `b` tra -5 e 5: sì, con `b` < -1 compra e con `b` > 1 vende. Il limite 5 è lo stesso fattore dei limiti dei pesi (Q8) `[ipotesi]`: un ingresso tipico al limite del suo peso sposta il punteggio di 5 semi-ampiezze, quanto il centro più lontano. (b) `b` tra -1 e 1: punteggio 0 dà sempre `hold`. Stessi geni; cambia l'intervallo di `b` e, nella forma canonica, i genomi con tutti i pesi nulli sono una classe sola invece di tre. *Per scegliere:* (a) se vuoi permettere strategie che comprano o vendono «per default» quando gli ingressi non dicono nulla; (b) se senza segnali non si deve fare nulla. Con le due soglie libere di Q5 (b, c) la stessa domanda diventa: soglia alta positiva e bassa negativa, o no.

**Q7 — Quanto devono differire le due memorie?** *Problema:* le due distanze sono la stessa formula; con memorie vicine diventano quasi lo stesso ingresso e i due pesi si compensano (alzarne uno e abbassare l'altro dà quasi lo stesso punteggio). (a) **Proposta:** la memoria lenta almeno il doppio della veloce (il rapporto 2 è una scelta dell'autore, senza fonte, `[ipotesi]`). (b) Nessun margine: basta che la lenta sia più lenta (l'uguaglianza esatta resta vietata). (c) Un altro rapporto minimo, per esempio 1,25 o 4. Nessun gene in più; cambia solo il controllo del vincolo dopo incrocio e mutazione. *Per scegliere:* un margine grande se vuoi due ingressi davvero diversi; piccolo o nullo se non vuoi vietare coppie di velocità vicine.

**Q8 — Entro quali limiti?** *Problema:* ogni gene ha un intervallo, oggi scelto dall'autore senza fonte. (a) **Proposta:** età media tra 0,5 e 100 barre per tutti e 7 gli ingressi; pesi entro ±W_i, dove W_i vale 5 diviso il valore tipico dell'ingresso (il suo valore assoluto mediano) sulla **serie sintetica**, una serie di prezzi casuale con seme dichiarato costruita nel catalogo, senza dati ENI (3.2); il 5 vuol dire che un ingresso tipico al limite del suo peso sposta il punteggio di 5 semi-ampiezze, ben oltre una soglia `[ipotesi]`; `b` secondo Q1. (b) Limiti diversi per ingresso, oppure il limite alto della memoria fissato dall'avvio che R6 sceglierà. L'**avvio** è il numero di barre iniziali in cui una media dipende ancora dal suo primo valore (per più del 5 %, `[ipotesi]`): 302 barre con età media 100; R6, la ricerca sul protocollo di valutazione, deciderà quante barre iniziali escludere dalla valutazione, e il limite alto della memoria dipende da quel numero. Stessi geni; cambiano le costanti dello schema e la sua versione, che entra nel testo dell'hash. Le due distanze devono avere lo stesso intervallo di memoria. *Per scegliere:* (a) se basta un intervallo largo e uguale per tutti, da rivedere quando R6 fisserà l'avvio; (b) se vuoi già ora memorie diverse per ingressi diversi, per esempio il volume più corto.

**Q9 — Come si incrociano due genitori?** *Problema:* il figlio prende i geni dai genitori; il modo decide se peso e memoria restano insieme e se il figlio va corretto. (a) **Proposta:** per blocchi (ogni peso con la sua memoria, le due distanze insieme): nessun figlio da correggere. (b) Gene per gene, come Consilium: in prova 17658 figli su 100000 violano il margine tra le memorie e vanno corretti o rifiutati. (c) Media pesata dei genitori con un solo coefficiente: figli a metà strada; per arrotondamento 3543 su 100000 escono di un'ultima cifra e vanno riportati dentro. Stessi geni e stessa forma canonica; cambiano solo i figli prodotti. *Per scegliere:* (a) se vuoi tenere ogni peso con la sua memoria (la scala di una distanza dipende dalla sua memoria); (b) se vuoi restare vicino al codice di Consilium; (c) se vuoi figli intermedi, sapendo che una media restringe la popolazione verso il centro.

**Q10 — Come si muta un gene?** *Problema:* forma del passo e trattamento dei bordi. (a) **Proposta:** passo gaussiano largo il 5 % dell'intervallo, con riflessione al bordo: passi per lo più piccoli, qualcuno grande, nessun valore che si ferma sul bordo. (b) Passo uniforme con saturazione (il valore uscito si ferma sul bordo), come Consilium: ±5 % dell'intervallo in `individual.js`, ±0,05 fissi sui `c` in `individual_v2.js` (circa il 5 % dell'intervallo [0,01; 1]): la stessa regola su intervalli diversi; in una prova senza selezione con la mutazione di `individual_v2.js` il 3,92 % dei `c` è finito esattamente su un bordo. (c) Mutazione polinomiale limitata, una legge del passo che resta nei limiti da sola. Stessi geni, nessun effetto sull'hash. *Per scegliere:* (a) se non vuoi accumuli sui bordi; (b) se vuoi la stessa regola di Consilium; (c) se vuoi una legge che non esce mai dai limiti, senza riflessione.

**Q2 — Quota investita, stop loss e take profit sono geni?** *Problema:* il motore vuole tre numeri oltre al punteggio, e se evolvono lo decide R4. (a) **Proposta:** contarli a parte: 15 geni ora, R4 dirà se diventano 18. (b) Deciderlo ora: sono geni (+3, con intervalli da fissare e una simmetria in più: in un genoma che non compra mai sono irrilevanti). (c) Deciderlo ora: sono costanti, scritte nella versione del decodificatore e quindi nell'hash. *Per scegliere:* (a) se vuoi lasciare la scelta a chi scrive le equazioni di decisione; (b) o (c) se hai già un'idea e preferisci che R4 parta da quella.

**Q3 — Che cosa fare dei genomi quasi uguali?** *Problema:* l'hash riconosce solo equivalenze dimostrate; due genomi che differiscono nell'ultima cifra di un peso hanno hash diversi anche se decidono uguale (G1 e G5). (a) **Proposta:** solo hash esatto. (b) In più una chiave di quasi-duplicato: lo stesso testo con i numeri arrotondati a 24 cifre binarie dopo la virgola (25 cifre binarie significative, circa 7,5 cifre decimali; precisione scelta dall'autore, `[ipotesi]`), segnalata a parte; unisce anche genomi che possono decidere diversamente e separa sempre qualche coppia che cade ai due lati di un arrotondamento. (c) Geni su una griglia di valori interi: hash esatto, ma ogni gene ha un passo minimo e tutti gli operatori cambiano. *Per scegliere:* (a) se ti basta sapere quali genomi sono certamente uguali; (b) se vuoi contare anche quelli «praticamente» uguali; (c) se preferisci un genoma a passi discreti.

**Q4 — Serve anche un'impronta delle decisioni?** *Problema:* alcuni genomi decidono uguale senza una simmetria dimostrata, per esempio con soglie che il punteggio non raggiunge mai. (a) **Proposta:** no. (b) Sì: accanto all'hash, l'hash della sequenza di decisioni su un insieme di prova fisso: il dataset inventato seguito da 3000 barre della serie sintetica, 3020 barre in tutto. Costa una simulazione in più per genoma su quelle barre: lo snapshot ENI ha 2517 barre, quindi se R6 valuterà su ENI il tempo di simulazione per genoma circa raddoppia `[ipotesi: dipende dai dati di R6]`. L'insieme di prova non usa i dati di valutazione, perché l'impronta resti la stessa quando R6 sceglie o cambia quei dati `[ipotesi]`; il suo nome e la versione del decodificatore entrano nell'impronta come lo schema entra nell'hash («va versionata»), e va calcolata sempre dallo stesso programma (E2, in Node; 1.4). Dà un controllo automatico (stesso hash deve dare stessa impronta). G1 e G5 hanno hash diversi e impronta uguale. *Per scegliere:* (b) se vuoi segnalare anche i genomi uguali «in pratica»; (a) se una simulazione in più per genoma non vale questa informazione.

**Q11 — Come scrivere i numeri nel testo dell'hash?** *Problema:* il genoma sarà scritto in JavaScript e girerà in Node (E2 in SwarmTrader, E3 in Consilium), ma le verifiche indipendenti delle ricerche del progetto ricalcolano numeri e hash in Python, e lo potranno fare script di analisi `[ipotesi]`: l'hash deve riuscire uguale nei due linguaggi. Node e Python scrivono i numeri decimali in modo diverso (`1e-7` contro `1e-07`), e un testo diverso dà un hash diverso. (a) **Proposta:** esadecimale, le 16 cifre dei 64 bit di ogni numero, uguali in ogni linguaggio. (b) Decimale secondo lo standard RFC 8785, leggibile, con una funzione Python scritta apposta e provata su vettori di prova; un errore in quella funzione darebbe hash diversi tra linguaggi senza alcun messaggio. Le due scelte danno hash diversi per lo stesso genoma. *Per scegliere:* (a) se il testo serve solo alle macchine; (b) se vuoi poterlo leggere a occhio.

**Che cosa non decide R3.** Le equazioni di decisione, l'isteresi, stop loss e take profit (R4), la fitness (R5), i dati di valutazione (R6). Dove la codifica dipende da R4 lo dice (capitolo 8); il rischio principale è che R4 aggiunga alla regola un termine che rompe la scala comune: allora la zona di attesa larga 2 non basta più e servono 16 geni.

## 1. Che cosa c'è già, simboli e sigle

### 1.1 Rimandi

Il catalogo spiega che cosa sono ingresso, parametro e gene ([«Ingresso, parametro, gene»](../genome-indicators-catalog/#ingresso-parametro-gene)), il punteggio con soglie ([«Il punteggio lineare con soglie»](../genome-indicators-catalog/#il-punteggio-lineare-con-soglie)), la media esponenziale e la sua età media (sezione 2.2), la regola per cui un ingresso con denominatore nullo salta l'aggiornamento (sezione 3.3) e le formule dei 7 ingressi (schede N1, RSI, N9 con la variante N10, N14, N16, N17). La [guida alle forme di genoma](../genome-forms-guide/) spiega incrocio e mutazione con i numeri (sezioni 2.4.3 e 2.4.4). Qui non si ripetono.

### 1.2 Simboli

Una riga per simbolo, con il suo significato; tutti compaiono anche nel testo alla prima occorrenza.

| Simbolo | Significato |
|---|---|
| `x_i` (i da 1 a 7) | valore dell'ingresso i in un giorno |
| `w_i` | peso dell'ingresso i |
| `s` | punteggio, `w1 x1 + … + w7 x7`, sommato in quest'ordine |
| `θ_alta`, `θ_bassa` | soglia alta e soglia bassa, quando sono due geni liberi (Q5 b, c) |
| `h` | semi-ampiezza: metà della distanza tra le soglie, `(θ_alta - θ_bassa)/2` |
| `b` | centro delle soglie misurato in semi-ampiezze; nella proposta le soglie sono `b + 1` e `b - 1` |
| `c_i` | coefficiente della media esponenziale dell'ingresso i |
| `τ_i` | logaritmo dell'età media, `ln((1 - c_i)/c_i)` |
| `δ` | margine minimo tra le memorie, `τ2 - τ1 ≥ δ` (proposta ln 2) |
| `W_i` | limite del peso: `w_i` sta tra `-W_i` e `W_i` |
| `σ` | larghezza del passo di mutazione di un gene |
| `k` | fattore positivo per cui si moltiplicano pesi e soglie (simmetria S1) |
| `lo[j]`, `hi[j]` | limite basso e alto del gene j |

### 1.3 Gli ingressi

Gli ingressi, nell'ordine fisso della codifica; una riga per ingresso, con la formula del catalogo.

| # | Ingresso | Formula (catalogo) |
|---|---|---|
| 1 | distanza dalla EMA veloce | `x1 = ln(C / EMA(C; c1))` |
| 2 | distanza dalla EMA lenta | `x2 = ln(C / EMA(C; c2))` |
| 3 | RSI centrato | `x3 = EMA0(dC; c3) / EMA0(abs(dC); c3)` |
| 4 | distanza dal massimo che dimentica | `x4 = C / m - 1`, `m = max(H, m * (1 - c4) + C * c4)` |
| 5 | posizione della chiusura nella giornata, in EMA | `x5 = EMA(clv; c5)` |
| 6 | logaritmo del volume relativo | `x6 = ln(V / EMA(V; c6))` |
| 7 | OBV normalizzato | `x7 = EMA0(sgn(dC) * V; c7) / EMA0(V; c7)` |

`C`, `H`, `L`, `V` sono chiusura, massimo, minimo e volume del giorno; `dC` è la variazione della chiusura rispetto al giorno prima; `clv` è la posizione della chiusura tra minimo e massimo del giorno, da -1 a +1; `sgn` è il segno (+1, 0 o -1); `EMA0` è una media avviata da zero (nel rapporto di due `EMA0` con lo stesso `c` l'errore dei primi giorni si cancella; catalogo, sezione 3.2). RSI (*Relative Strength Index*, indice di forza relativa) e OBV (*On-Balance Volume*) sono gli indicatori classici di cui gli ingressi 3 e 7 sono una forma centrata tra -1 e +1; ATR (*Average True Range*, escursione vera media) è la misura dell'agitazione che la risposta D3 b ha tolto dalla somma. Il massimo che dimentica (N10) non era nel codice di R2: è implementato in `ref/indicators.mjs`, controllato contro la formula diretta `m[t]` = massimo, su `j` ≤ `t`, di `(1-c)^(t-j) H[j] + Σ_{k=j+1..t} c (1-c)^(t-k) C[k]` (scarto relativo massimo 1,5e-13) e riproduce la tabella D4 del catalogo su tutti i 13 giorni.

### 1.4 Età media e `τ`

Una EMA con coefficiente `c` contiene dati vecchi in media `(1 - c)/c` barre (catalogo, sezione 2.2). Il gene proposto è il suo logaritmo; la formula inversa ridà `c`:

```
tau = ln((1 - c) / c)          eta' media = e^tau barre
c   = 1 / (1 + e^tau)          (in aritmetica esatta)
```

Esempio: `c` = 0,2 ha età media 4 barre e `τ` = ln 4 = 1,3863; `c` = 0,5 ha età media 1 e `τ` = 0.

**Il calcolo esatto di `c` nel decodificatore.** In virgola mobile due scritture uguali in aritmetica esatta non danno gli stessi bit: in Node `e^-τ/(1 + e^-τ)` e `1/(1 + e^τ)` differiscono nell'ultima cifra binaria nel 39,4 % dei `τ` dell'intervallo. Il decodificatore `lin7-dec-v1` fissa quindi questa forma, con le operazioni in quest'ordine (come `cOfTau` in `ref/indicators.mjs`):

```
se tau >= 0:  e = exp(-tau);  c = e / (1 + e)
altrimenti:   c = 1 / (1 + exp(tau))
```

**Limite: `exp` non dà gli stessi bit in Node e in Python.** Su 200000 `τ` uniformi nell'intervallo proposto (da ln 0,5 a ln 100), `exp(-|τ|)` calcolato con `Math.exp` di Node e con `math.exp` di Python differisce nell'ultima cifra binaria nel 10,1 % dei casi, e `c` calcolato con la forma sopra nel 7,6 %, al più di 2 ultime cifre (`ref/check-corrections.mjs`, che chiama Python; lo stesso può valere per `ln`, usato da tre ingressi, non misurato `[ipotesi]`). Conseguenze, misurate con i soli `c` di Python su 200 genomi casuali e sulle tre serie del capitolo 6 (1107400 barre): l'hash non cambia, perché si calcola sui `τ` e non sui `c`; i punteggi differiscono nell'ultima cifra nel 18,0 % delle barre; nessuna decisione e nessuna impronta di Q4 risulta diversa, ma una decisione può cambiare in un giorno in cui il punteggio cade a una o due ultime cifre da una soglia. Quindi «punteggi uguali nei bit» vale dentro uno stesso programma; il programma di riferimento è quello di E2, in Node. Specificare un `exp` proprio, fatto solo di somme e prodotti (che Node e Python arrotondano allo stesso modo), toglierebbe il limite ed è una possibilità per E2 `[ipotesi]`.

### 1.5 Sigle

Una riga per famiglia di sigle: che cosa indica e dove è spiegata.

| Sigla | Che cosa indica | Dove |
|---|---|---|
| R2-R7 | le ricerche dell'epica: R2 indicatori (il catalogo), R3 questa codifica, R4 equazioni di decisione, R5 fitness, R6 protocollo di valutazione, R7 caso di studio Koncorde | glossario |
| E2, E3 | le implementazioni: E2 codice del genoma (issue #12), E3 evoluzione in Consilium (issue #13) | glossario |
| Q1-Q11 | le domande a Luca | «In breve», capitolo 11 |
| V1-V5, Vw, Vb | i vincoli di validità | 3.1 |
| S1-S6 | le simmetrie del punteggio | capitolo 6 |
| R4-1 … R4-5 | le scelte di R4 che toccano la codifica | capitolo 8 |
| A, B, C | i tre approcci di partenza alla codifica | 4.1 |
| G1, P2, F, G3, M, G4, H4, G5, K | i genomi degli esempi | capitolo 9 |
| T1-T3 | i vettori di prova dell'hash | 7.3 |
| D3 b, D4 b | due risposte di Luca al catalogo: l'agitazione (ATR normalizzato) esce dalla somma; la distanza dal massimo usa il massimo che dimentica | 1.3, capitolo 9 |
| N1, N9, N10, N14, N16, N17 | codici delle schede del catalogo per gli ingressi 1-2, 4, 5, 6, 7 | 1.1 |

## 2. I geni

### 2.1 La tabella dei geni

Una riga per gene, nell'ordine in cui si scrivono; tutti i geni sono continui (numeri reali), nessuno è intero. La colonna «G1» dà il valore nel genoma d'esempio del capitolo 9; la colonna «Vincoli» dice in quali vincoli del capitolo 3 entra il gene (Vw e Vb sono gli intervalli di pesi e `b`, V1 l'intervallo della memoria, V2 il margine tra le due memorie); V4, «numero finito», vale per tutti.

| # | Gene | Significato | Intervallo proposto | Origine dell'intervallo | G1 | Vincoli |
|---|---|---|---|---|---|---|
| 1 | `w1` | peso della distanza veloce | [-250, 250] | W = 5 / scala tipica, `[ipotesi]` (3.2) | 25 | Vw |
| 2 | `w2` | peso della distanza lenta | [-250, 250] | come sopra | 10 | Vw |
| 3 | `w3` | peso dell'RSI centrato | [-22, 22] | come sopra | 0,5 | Vw |
| 4 | `w4` | peso della distanza dal massimo | [-260, 260] | come sopra | 5 | Vw |
| 5 | `w5` | peso della chiusura nella giornata | [-42, 42] | come sopra | 1 | Vw |
| 6 | `w6` | peso del volume relativo | [-23, 23] | come sopra | 1 | Vw |
| 7 | `w7` | peso dell'OBV normalizzato | [-25, 25] | come sopra | 0,5 | Vw |
| 8 | `b` | centro delle soglie (alta `b + 1`, bassa `b - 1`) | [-5, 5], oppure [-1, 1] con Q1 (b) | `[ipotesi]` | 0 | Vb |
| 9 | `τ1` | memoria della EMA veloce | [ln 0,5; ln 100] | `[ipotesi]` (3.2) | 0 | V1, V2 |
| 10 | `τ2` | memoria della EMA lenta | [ln 0,5; ln 100] | come sopra | 1,3863 | V1, V2 |
| 11 | `τ3` | memoria dell'RSI | [ln 0,5; ln 100] | come sopra | 1,3863 | V1 |
| 12 | `τ4` | memoria del massimo che dimentica | [ln 0,5; ln 100] | come sopra | 2,1972 | V1 |
| 13 | `τ5` | memoria della chiusura nella giornata | [ln 0,5; ln 100] | come sopra | 1,3863 | V1 |
| 14 | `τ6` | memoria del volume medio | [ln 0,5; ln 100] | come sopra | 1,3863 | V1 |
| 15 | `τ7` | memoria dell'OBV normalizzato | [ln 0,5; ln 100] | come sopra | 1,3863 | V1 |

**Unità.** I pesi sono in «semi-ampiezze per unità di ingresso»: un contributo `w_i * x_i` = 1 sposta il punteggio di metà della zona di attesa. `b` è nella stessa unità. I `τ` sono adimensionali; `e^τ` è in barre (giorni di borsa). In termini di `c`, ln 0,5 corrisponde a `c` = 0,6667 e ln 100 a `c` = 0,0099.

### 2.2 Il conteggio

- **Catalogo: 18 numeri, poi 16.** Il capitolo 6 del catalogo conta 18 numeri per i suoi 8 ingressi (8 pesi, 2 soglie, 7 `c` e la finestra intera N del massimo di 10 giorni). Con le risposte D3 b (l'ATR normalizzato esce dalla somma: -1 peso, -1 `c`) e D4 b (il massimo che dimentica al posto del massimo su N giorni: un `c` invece di N) restano **16** numeri: 7 pesi, 2 soglie, 7 `c`. Il riconteggio lo conferma: il massimo che dimentica ha un solo `c` continuo e nessun ingresso ha un secondo parametro.
- **Forma proposta: 15.** Pesi e soglie moltiplicati per la stessa costante positiva danno le stesse decisioni (simmetria S1, capitolo 6), quindi uno dei 16 numeri non cambia il comportamento: fissare la distanza tra le soglie lo toglie. I gradi di libertà del comportamento sono **al più** 15: sono esattamente 15 solo se i 7 ingressi non hanno combinazioni lineari esatte tra loro e le soglie cadono dove il punteggio arriva, cose non dimostrate `[ipotesi]`.
- **Numeri del `Trader`.** Il motore costruisce il `Trader` (il componente che esegue gli ordini) con quota investita (`buyPercent`), stop loss e take profit (`src/engine/strategy.js`, righe 36-37). Non sono nei 16 del catalogo: se R4 li fa evolvere i geni sono **18**, se li fissa restano costanti fuori dal genoma (domanda Q2).
- **Altre scelte di R4** (capitolo 8: isteresi, agitazione, avvio) possono aggiungere da 0 a circa 5 geni oltre ai 3 del `Trader`: in tutto da 15 (forma proposta, nessuna aggiunta) a circa 23 con la forma proposta e a circa 24 con le due soglie libere `[ipotesi]`.
- **Genoma attuale (macchina a stati).** `FIXED_GENOME` in `src/engine/genome.js` (righe 13-36) ha 11 numeri reali (4 coefficienti dei filtri, 4 margini, quota investita, stop loss, take profit) più una struttura discreta: 9 stati, 36 transizioni, 135 identificativi di condizione e 1 azione (contati da `ref/facts.mjs`). Le liste di condizioni cambiano lunghezza con la mutazione. Il confronto onesto è quindi «15 numeri reali a lunghezza fissa» contro «11 numeri reali più circa 170 valori discreti a lunghezza variabile».

### 2.3 Un ingresso con peso nullo

Non c'è un gene che spegne un ingresso (risposta di Luca). Se un peso vale esattamente 0, il suo ingresso non conta e il suo `τ` è **irrilevante**: due genomi che differiscono solo in quel `τ` decidono uguale (simmetria S4), e la forma canonica sostituisce quel `τ` con `null`. Un peso piccolo ma non nullo **non** rende il `τ` irrilevante: in un giorno con l'ingresso grande può ancora spostare una decisione, e la forma canonica non lo tratta come nullo. Con la mutazione proposta un peso esattamente nullo nasce solo per costruzione (un genoma iniziale scritto a mano), non per caso.

## 3. I vincoli di validità

### 3.1 Elenco e strategie

Un **vincolo di validità** è una condizione senza la quale il genoma non si può valutare, o è ambiguo. Un vincolo si può far rispettare in tre modi: **riparazione** (si corregge il figlio), **rifiuto** (si scarta e si ritenta con nuove estrazioni casuali), **riparametrizzazione** (si scrive il gene in una forma che non può violarlo). La tabella ha una riga per vincolo: che cosa dice, perché serve, come lo fa rispettare la proposta e quale alternativa c'era.

| Vincolo | Che cosa dice | Perché | Strategia proposta | Alternativa |
|---|---|---|---|---|
| V1 | ogni `τ_i` nel suo intervallo | `c` = 1 annulla le due distanze e il volume relativo (ingresso sempre 0) e `genome.js` rifiuta `c` ≥ 1 (riga 86); `c` molto piccolo allunga l'avvio | riflessione al bordo | saturazione al bordo (clamp), rifiuto |
| V2 | `τ2 - τ1 ≥ δ`, con δ = ln 2 (Q7) | distingue la veloce dalla lenta (simmetria S2) e tiene lontane velocità quasi uguali (S3) | scambio delle due distanze se `τ1 > τ2`; rifiuto se manca il margine | riparametrizzare `τ2 = τ1 + e^η` (scartata, 4.3) |
| V3 | soglia bassa sotto la alta | altrimenti le zone di `buy` e `sell` si sovrappongono | impossibile da violare: le soglie sono `b ± 1` | con due soglie libere: scambio delle soglie (cambia il comportamento) o rifiuto |
| V4 | ogni gene è un numero finito | un `NaN` rende ogni confronto falso, quindi sempre `hold` (catalogo 3.3) | controllo prima della valutazione e dell'hash, come `assertFinite` in `genome.js` (righe 40-42) | nessuna |
| Vw, Vb | pesi e `b` nei loro intervalli | tengono i passi di mutazione proporzionati | riflessione | saturazione |
| V5 | numeri che R4 aggiungerà (ad es. stop loss positivo) | dipendono da R4 | da fissare in R4 | - |

La riflessione rimette dentro di tanto quanto il gene è uscito: con intervallo [0; 10] il valore 10,3 diventa 9,7. Si applica **solo** ai valori fuori dall'intervallo: applicata a un valore interno, la formula può cambiarne l'ultima cifra binaria: con l'intervallo di `τ`, 1,5298317366548038 diventerebbe 1,5298317366548035 (`ref/check-corrections.mjs`).

**Domanda Q7 — margine tra le due velocità.** (a) δ = ln 2: la memoria lenta è almeno il doppio della veloce (proposta). (b) δ = 0: basta che la lenta sia più lenta, anche di pochissimo. (c) Un altro rapporto minimo, per esempio 1,25 o 4. *Criterio:* con un margine piccolo le due distanze possono diventare quasi lo stesso ingresso e i loro due pesi si compensano (alzarne uno e abbassare l'altro dà quasi lo stesso punteggio); con un margine grande si vietano coppie di velocità vicine. *Effetti delle opzioni:* capitolo 11.

### 3.2 Gli intervalli e da dove vengono

**Memoria.** L'età media va da 0,5 a 100 barre `[ipotesi]`. Il limite basso tiene `c` lontano da 1, dove le due distanze e il volume relativo valgono sempre 0; il limite alto viene dall'**avvio**, il numero di barre prima che il valore iniziale della media pesi meno del 5 % (soglia scelta dall'autore, `[ipotesi]`): 3 barre a età media 0,5, 29 a età media 9, **302** a età media 100. Due genomi con memorie diverse hanno avvii diversi, e R6 dovrà fissare un avvio comune escluso dalla valutazione (catalogo, capitolo 6): il limite alto di `τ` dipende da quel numero. Gli intervalli di Consilium non sono una fonte: il genoma fisso di SwarmTrader ne è fuori (per esempio `iir_price_2` = 0,99 contro un massimo di 0,5 in `individual.js`, righe 195-237).

**Pesi.** W_i = 5 / q_i, dove q_i è il valore assoluto mediano dell'ingresso sulla serie sintetica di R2 (le prime 3000 barre della passeggiata aleatoria di 10000 giorni del catalogo, sezione 5.5, seme 20261018; le prime 300 escluse come avvio), a età media 7,07 (√50, il centro in scala logaritmica dell'intervallo da 0,5 a 100), arrotondato a due cifre `[ipotesi]`: con W_i un ingresso «tipico» sposta il punteggio fino a 5 semi-ampiezze (fattore 5 scelto dall'autore). Nessun dato ENI entra in questa scelta. La tabella ha una riga per ingresso; le tre colonne q danno il valore tipico dell'ingresso con tre memorie diverse, l'ultima il limite del peso che ne deriva.

| # | Ingresso | q a eta' media 0,5 | q a eta' media 7,07 | q a eta' media 100 | W = 5/q (2 cifre) |
|---|---|---|---|---|---|
| 1 | distanza EMA veloce | 0,0040 | 0,0200 | 0,1046 | 250 |
| 2 | distanza EMA lenta | 0,0040 | 0,0200 | 0,1046 | 250 |
| 3 | RSI centrato | 0,7538 | 0,2254 | 0,0788 | 22 |
| 4 | distanza dal massimo che dimentica | 0,0090 | 0,0192 | 0,0680 | 260 |
| 5 | chiusura nella giornata (EMA) | 0,3986 | 0,1179 | 0,0359 | 42 |
| 6 | log volume relativo | 0,0755 | 0,2193 | 0,2743 | 23 |
| 7 | OBV normalizzato | 0,6871 | 0,2004 | 0,0757 | 25 |

I W_i vengono da una sola serie e vanno letti come «circa»: con 8 semi della stessa serie (stessi parametri, mulberry32, semi da 20261018, quello della tabella, a 20261025) W1 e W2 vanno da 222 a 265, W4 da 217 a 260, W7 da 25 a 29, W3, W5 e W6 di ±2 al più (`ref/check-corrections.mjs`). La proposta resta la tabella `[ipotesi]`: un limite più largo o più stretto di un decimo non cambia la logica della codifica, solo le costanti dello schema.

**Un limite che resta.** La scala delle distanze cambia di circa 26 volte tra le due estremità di `τ` (0,0040 contro 0,1046): lo stesso passo su `w1` sposta poco il punteggio con memoria corta e molto con memoria lunga (catalogo, sezione 5.3). La codifica non lo corregge; i rimedi (dividere l'ingresso per l'agitazione, o legare il passo del peso al `τ`) cambiano un ingresso o legano due geni, e sono scelte di R2 o R4 `[ipotesi]`.

**Domanda Q8 — intervalli dei geni.** (a) Età media tra 0,5 e 100 barre per tutti e 7 gli ingressi, W_i della tabella, `b` secondo Q1 (proposta). (b) Limiti diversi per ingresso, o il limite alto di `τ` fissato dall'avvio massimo di R6. *Criterio:* (a) se basta un intervallo largo e uguale per tutti, da rivedere quando R6 fisserà l'avvio; (b) se vuoi già ora memorie diverse per ingressi diversi (per esempio il volume più corto). *Effetto:* stessi geni; cambiano solo le costanti dello schema (e la sua versione). Le due distanze devono avere **lo stesso** intervallo di `τ`, altrimenti lo scambio di V2 può portare un gene fuori dal suo.

**Domanda Q1 — segno delle soglie.** (a) `b` tra -5 e 5, con 5 uguale al fattore dei W_i `[ipotesi]`: con ingressi tutti neutri (punteggio 0; sei ingressi su sette valgono 0 quando non dicono nulla, «In breve») la strategia può comprare (se `b` < -1) o vendere (se `b` > 1) (proposta). (b) `b` tra -1 e 1: punteggio 0 dà sempre `hold`. *Criterio:* (a) se vuoi permettere strategie che comprano o vendono «per default» quando gli ingressi non dicono nulla; (b) se preferisci che senza segnali non si faccia nulla. *Effetti delle opzioni:* capitolo 11.

## 4. Tre modi di scrivere soglie e memoria

### 4.1 Le opzioni

La ricerca è partita da tre approcci. **A** scrive i geni come si leggono (i `c` e due soglie) e ripara i figli dopo gli operatori. **B** riscrive i numeri in una forma che rende i vincoli impossibili da violare. **C** è un ibrido: la memoria come `τ` (da B), pesi leggibili (da A). La proposta è C con il centro `b`. **Rinormalizzare** vuol dire dividere pesi e soglie per la semi-ampiezza `h`, così che torni 1: con la regola del catalogo non cambia le decisioni (simmetria S1, capitolo 6). La tabella ha una riga per opzione; le colonne dicono quanti geni ha il genoma, quali vincoli vanno gestiti, che cosa fa la forma canonica e su che cosa si calcola l'hash.

| Opzione | Geni | Vincoli da gestire | Forma canonica | Hash |
|---|---|---|---|---|
| **C con centro `b`** (proposta: Q5 a, Q6 a) | 15 | V1 e V2 sui `τ`; V3 impossibile | quasi il genoma stesso (restano S2, S4, S5) | sui geni |
| C con due soglie libere, senza rinormalizzare (Q5 b) | 16 | V1, V2, V3 | divisione per la semi-ampiezza `h`, poi come sopra | stesso testo canonico della proposta |
| C con due soglie, rinormalizzate prima dell'incrocio (Q5 c) | 16 salvati; semi-ampiezza riportata a 1 prima di ogni incrocio | V1, V2, V3 | come Q5 b | come Q5 b |
| A: geni come si leggono, `c` invece di `τ` (Q6 b) | 15 con centro `b`, 16 con due soglie | V1 su `c`, V2, V3 | come la riga della proposta o di Q5 b, con `c` al posto di `τ` | testo diverso (schema diverso) |
| B: pesi e soglie come direzione di lunghezza 1 | 16 salvati, legati dalla lunghezza 1 (15 liberi) | proiezione dopo ogni operatore | quasi il genoma | sui geni |

**B è scartata** come codifica: dopo ogni operatore il vettore dei pesi e delle soglie va riportato a lunghezza 1 (si **proietta**), e la proiezione cambia tutti i pesi quando ne cambia uno; i numeri non si leggono più come pesi; il vantaggio (togliere la scala comune) lo dà già il centro `b` con una sola divisione. La variante di B con soglia alta fissata a 1 e bassa negativa descrive gli stessi comportamenti della proposta con Q1 (b), in un'altra scala.

### 4.2 Perché la scala comune non è innocua

Con due soglie libere (Q5 b) moltiplicare tutto per `k` > 0 non cambia le decisioni, ma cambia **l'effetto degli operatori**: un passo di mutazione fisso su un peso è un cambiamento relativo piccolo su un genoma «grande» e grande su uno «piccolo», e un incrocio tra due genitori equivalenti a scale diverse mescola numeri incoerenti. La scala diventa un passo di mutazione nascosto. Rinormalizzare ogni genitore prima dell'incrocio (Q5 c) non è neutro: ogni genitore è diviso per il proprio fattore, e gli incroci usuali dipendono dalla scala di ciascun genitore. In prova (`ref/check-ops.mjs`: 20000 coppie di genitori a 16 numeri, ciascuno dall'inizializzazione con pesi e soglie moltiplicati per `e^U`, `U` uniforme in [-3; 3]; fattore `k = 2^m`, `m` intero tra -4 e 4 diverso da 0, potenza di 2 per evitare arrotondamenti) scalare entrambi i genitori per lo stesso fattore non cambia mai la forma canonica del figlio; scalare solo il secondo la cambia in 16247 casi su 16326 con l'incrocio uniforme, in 20000 su 20000 con quello intermedio e in 14607 su 14607 con BLX-0,5 (tre incroci descritti in 5.3). Con il centro `b` e semi-ampiezza fissata a 1 il problema non esiste: tutti i genomi sono alla stessa scala.

Il passaggio da due soglie alla forma proposta è `h = (θ_alta - θ_bassa)/2`, `b = ((θ_alta + θ_bassa)/2)/h` e ogni peso diviso per `h`. Vale solo se R4 lascia la regola **omogenea** in pesi e soglie, cioè senza termini fissi che non si moltiplicano insieme a loro (capitolo 8).

**Domanda Q5 — soglie e scala comune.** (a) Centro `b` con le soglie a `b ± 1`: 15 geni, V3 per costruzione, nessuna scala da gestire (proposta). (b) Due soglie libere, nessuna rinormalizzazione: 16 geni, la scala resta un passo di mutazione nascosto. (c) Due soglie libere, ogni genitore rinormalizzato a `h` = 1 prima dell'incrocio: 16 numeri salvati, ma i figli nascono sempre da genitori alla stessa scala. *Criterio:* (a) se R4 resterà una regola omogenea; (b) se vuoi leggere le soglie direttamente come numeri del catalogo o se R4 introdurrà un termine non omogeneo (per esempio un'isteresi in unità fisse); (c) se vuoi le soglie libere ma tutti i genitori alla stessa scala, possibile solo con regola omogenea. *Effetti delle opzioni:* capitolo 11; con regola omogenea la forma canonica di (b) e (c) divide per `h` e dà lo stesso testo della proposta (stesso hash, stesse decisioni quasi sempre, non sempre: 7.1), con un termine non omogeneo non divide più (capitolo 8). Se si sceglie (a) e R4 aggiunge poi un termine fisso, i genomi a 15 geni passano a 16 senza perdita (soglie `b ± 1`) con un nuovo schema, quindi con hash nuovi.

### 4.3 Il gene della memoria: `τ` o `c`

Con `c` come gene e un passo fisso (Consilium: ±0,05 e saturazione in [0,01; 1], `individual_v2.js`, righe 203-214), lo stesso passo vale cose diverse: da `c` = 0,99 a 0,94 l'età media passa da 0,0101 a 0,0638 barre, da 0,10 a 0,05 passa da 9 a 19. Con `τ` un passo moltiplica o divide l'età media sempre per lo stesso fattore: con il passo proposto un passo di ampiezza σ la moltiplica per 1,303. È la mutazione log-normale delle strategie evolutive (una famiglia di algoritmi evolutivi su numeri reali), applicata all'età media: «log-normale» vuol dire che il passo è gaussiano sul logaritmo [2]. Inoltre la saturazione di Consilium ammette `c` = 1 (0,99 + 0,04 diventa 1), che `genome.js` rifiuta.

`τ` «per costruzione» non basta: in virgola mobile `1/(1 + e^τ)` vale esattamente 1 già da `τ` = -36,7369 e `e^τ` va in overflow sopra 709,7827 (in Python solleva un errore invece di dare 0). Servono quindi i limiti di V1, ben dentro questi valori, e la forma stabile della formula. La variante `τ2 = τ1 + e^η` (lenta legata alla veloce) è **scartata**: con i limiti di V1 il vincolo torna accoppiato, e un incrocio che cambia `τ1` sposterebbe anche la lenta.

**Domanda Q6 — gene della memoria.** (a) `τ` = logaritmo dell'età media, con riflessione nei limiti (proposta). (b) `c` direttamente, con riflessione in [c_min, c_max] e passo lineare. *Criterio:* (a) se vuoi che un passo di mutazione cambi la memoria della stessa proporzione a ogni scala; (b) se preferisci leggere nel genoma gli stessi `c` del catalogo e di Consilium. *Effetti delle opzioni:* capitolo 11; i due schemi hanno hash diversi per lo stesso comportamento e non vanno mescolati.

## 5. Gli operatori

### 5.1 Pseudocodice

Il genoma è un vettore di 15 numeri `g[1..15]` = `w1..w7, b, τ1..τ7`; `lo[j]`, `hi[j]` sono i limiti del gene `j`. `u()` è un numero casuale uniforme in [0, 1), `N()` una gaussiana standard. Il generatore degli script è mulberry32 (un generatore di numeri pseudocasuali semplice e riproducibile) con seme dichiarato, lo stesso di R2; gli esempi del capitolo 9 scrivono le estrazioni, quindi non dipendono dal generatore.

In parole: la **riflessione** rimette dentro un valore uscito dall'intervallo (3.1); lo **scambio** mette per prima la distanza con la memoria più corta, insieme al suo peso; l'**inizializzazione** estrae ogni gene a caso nel suo intervallo e ritenta finché c'è il margine; l'**incrocio** lancia una moneta per ciascuno dei 7 blocchi e copia il blocco dal genitore estratto; la **mutazione** cambia ogni gene con probabilità `pm` aggiungendo un passo gaussiano, poi scambia e controlla il margine, e dopo 20 tentativi falliti restituisce il genitore (numero di tentativi scelto dall'autore, `[ipotesi]`).

```
riflessione(v, lo, hi):
  se lo <= v <= hi: restituisci v
  L = hi - lo
  y = (v - lo) - 2L * floor((v - lo) / 2L)
  se y > L: y = 2L - y
  restituisci min(hi, max(lo, lo + y))

scambio(g):                       # simmetria S2, non cambia le decisioni
  se tau1 > tau2: scambia (w1, tau1) con (w2, tau2)

inizializzazione():
  ripeti:
    per ogni gene j: g[j] = lo[j] + (hi[j] - lo[j]) * u()
    scambio(g)
    se tau2 - tau1 >= delta: restituisci g

incrocio(p1, p2):                 # un figlio
  blocchi = {w1,w2,tau1,tau2}, {w3,tau3}, {w4,tau4}, {w5,tau5},
            {w6,tau6}, {w7,tau7}, {b}
  per ogni blocco: se u() < 0.5 copialo da p1, altrimenti da p2

mutazione(g, pm):                 # pm = probabilita' per gene (di E3)
  ripeti al piu' 20 volte:
    h = copia(g)
    per j = 1..15, in quest'ordine:
      se u() < pm:
        h[j] = riflessione(h[j] + 0.05 * (hi[j] - lo[j]) * N(),
                           lo[j], hi[j])
    scambio(h)
    se tau2 - tau1 >= delta: restituisci h
  restituisci copia(g)
```

Il passo è σ = 0,05 × ampiezza dell'intervallo `[ipotesi]`, come l'ampiezza del passo di `individual.js` di Consilium (±5 % dell'intervallo, righe 271-275; `individual_v2.js` usa la stessa regola con ±0,05 fissi sui `c`, righe 203-214), ma gaussiano invece che uniforme. Per `τ` vale 0,2649. Il limite di 20 tentativi e la ricaduta sulla copia del genitore sono scelte dell'autore `[ipotesi]`: con `pm` = 1 decidono 156 mutazioni su 100000 (5.2). La probabilità `pm`, il numero di tentativi, la dimensione della popolazione e la selezione sono parametri di E3.

### 5.2 Perché producono solo genomi validi

- **Inizializzazione:** ogni gene nasce nel suo intervallo; lo scambio tiene i `τ` nell'intervallo comune; il rifiuto garantisce il margine.
- **Incrocio per blocchi:** tutti i vincoli stanno dentro un blocco (V2 lega solo `τ1` e `τ2`, che viaggiano insieme), e ogni blocco è copiato bit per bit da un genitore valido. Il figlio è valido senza riparazioni.
- **Mutazione:** la riflessione tiene ogni gene nel suo intervallo (il `min`/`max` finale corregge solo un eventuale arrotondamento); lo scambio non esce dall'intervallo perché le due distanze hanno lo stesso; il margine si controlla alla fine; dopo 20 tentativi falliti resta il genitore, che è valido.

Prova su molte estrazioni (`ref/check-ops.mjs`, seme 4711). Ogni genitore è, con probabilità 1/2, un genoma dall'inizializzazione oppure un genitore «sui bordi»: ogni gene su uno dei due estremi del suo intervallo, scelto a caso, e la coppia `τ1`, `τ2` esattamente al margine, attaccata al bordo basso (`τ1` = ln 0,5) o al bordo alto (`τ2` = ln 100). Una riga per operatore:

```
inizializzazione: figli invalidi 0 su 100000
incrocio per blocchi: figli invalidi 0 su 100000
mutazione pm = 1/15: figli invalidi 0 su 100000; scambi 46;
  tentativi rifiutati 5697; ricadute sulla copia del genitore 0
mutazione pm = 1: figli invalidi 0 su 100000; scambi 12474;
  tentativi rifiutati 153699; ricadute sulla copia del genitore 156
```

I rifiuti sono frequenti perché metà dei genitori ha le velocità esattamente al margine, dove ogni passo che le avvicina viola V2; con `pm` = 1 (tutti i geni mutati a ogni tentativo) 156 mutazioni su 100000 ricadono sul genitore.

### 5.3 Le alternative e Consilium

La tabella ha una riga per operatore: dove si trova (in Consilium o in letteratura), se da solo rispetta i vincoli e che cosa serve dopo per avere solo figli validi. DEAP e pymoo sono due librerie Python di algoritmi evolutivi. BLX-α estrae ogni gene del figlio in un intervallo un po' più largo di quello tra i due genitori; SBX («incrocio binario simulato») lo estrae vicino ai genitori con una legge che imita l'incrocio dei bit; la mutazione polinomiale limitata estrae il passo con una legge che resta nei limiti da sola. Il **riporto nell'intervallo** porta sul bordo un valore uscito di un'ultima cifra. Le prove dei due incroci alternativi usano gli stessi genitori di 5.2 (metà dall'inizializzazione, metà sui bordi), 100000 figli per incrocio.

| Operatore | Dove | Conserva i vincoli? | Che cosa serve dopo |
|---|---|---|---|
| incrocio per blocchi (proposta) | questo documento | sì, tutti | nulla |
| incrocio uniforme gene per gene | Consilium: `individual_v2.js` 161-193, `individual.js` 350-382, `ga_v2.js` 93-126; DEAP `cxUniform` [3] | no: in prova 17658 figli su 100000 violano V2 | scambio e rifiuto: 7953 rifiutati, poi 0 invalidi |
| incrocio intermedio, un solo coefficiente α per tutti i geni | ricombinazione intermedia delle strategie evolutive [2] | sì in aritmetica esatta (l'insieme valido è convesso), no in virgola mobile: 3543 su 100000 escono di un'ultima cifra | riporto nell'intervallo e rifiuto: 2805 rifiutati, poi 0 invalidi |
| BLX-α, SBX | Deb e Agrawal [1]; DEAP [3], pymoo [4] | no: i figli escono dall'intervallo dei genitori | riflessione o versioni limitate |
| mutazione gaussiana con riflessione (proposta) | DEAP `mutGaussian` [3] per il passo | intervalli sì; V2 no | scambio e rifiuto (già nel pseudocodice) |
| mutazione uniforme con saturazione al bordo | Consilium: `individual_v2.js` 199-279 (±0,05 sui `c`, clamp [0,01; 1]), `ga_v2.js` 128-193 (±0,125) | intervalli sì, ma ammette `c` = 1 | - |
| mutazione polinomiale limitata | Deb; DEAP `mutPolynomialBounded` [3], pymoo [4] | intervalli sì per costruzione; V2 no | scambio e rifiuto |
| mutazione moltiplicativa sui pesi | - | scartata: un peso non cambia mai segno e uno zero resta zero per sempre | - |
| passo auto-adattivo (un σ nel genoma) | Beyer e Schwefel [2] | non tocca i vincoli | aggiunge numeri che non sono geni di decisione e vanno esclusi dall'hash |

**Saturazione contro riflessione.** In una passeggiata senza selezione (10000 geni con partenza uniforme, `c` in [0,01; 1] e `τ` nel suo intervallo; 2000 generazioni, probabilità di mutazione 0,1; `ref/check-ops.mjs`), la saturazione di `individual_v2.js` lascia il 3,92 % dei `c` esattamente su un bordo, l'1,85 % esattamente a `c` = 1; la riflessione su `τ` lo 0,00 %. È un fatto sugli operatori senza selezione, non una previsione sull'evoluzione; una distorsione della ricerca dovuta alla gestione dei bordi è descritta in letteratura per un altro algoritmo [6, solo abstract].

**Consilium non riconosce i duplicati:** `ga_v2.js` salva ogni figlio con `Genoma.create` (righe 330-336). `db/orm.js` gestisce un errore di unicità sul testo del genoma (`SaveGenoma`, righe 454-504), ma nelle basi dati lette in sola lettura durante questa ricerca il vincolo `UNIQUE` c'è solo in un file vecchio (`db/database.sqlite`), e `SaveGenoma` è usata solo da script manuali.

**Domanda Q9 — incrocio.** (a) Per blocchi, con le due distanze nello stesso blocco (proposta). (b) Uniforme gene per gene, come Consilium, seguito da scambio e rifiuto. (c) Intermedio con un solo α, seguito da riporto nell'intervallo e rifiuto. *Criterio:* (a) se vuoi che ogni peso resti con la sua memoria (la scala di una distanza dipende dal suo `τ`, catalogo 5.3) e nessun figlio vada riparato; (b) se vuoi restare vicino al codice di Consilium; (c) se vuoi figli «a metà strada» tra i genitori, sapendo che una media restringe la popolazione verso il centro. *Effetti delle opzioni:* capitolo 11.

**Domanda Q10 — mutazione.** (a) Gaussiana con passo pari al 5 % dell'intervallo e riflessione (proposta). (b) Uniforme ±5 % con saturazione al bordo, come Consilium (`individual.js` sull'intervallo di ogni parametro, `individual_v2.js` con ±0,05 sui `c`). (c) Polinomiale limitata. *Criterio:* (a) se vuoi passi per lo più piccoli con qualche passo grande e nessun accumulo sui bordi; (b) se vuoi la stessa regola di Consilium, accettando l'accumulo; (c) se vuoi una distribuzione che resta nei limiti senza riflessione. *Effetti delle opzioni:* capitolo 11.

## 6. Le simmetrie

Una **simmetria** è una trasformazione dei geni che lascia uguali **tutte** le decisioni su **ogni** serie di barre ammessa dal validatore (`low > 0`, volume ≥ 0; `src/engine/dataTrainer.js`, riga 34). Con la regola di salto del catalogo (un ingresso con denominatore nullo non si aggiorna e tiene il valore precedente, 1.1) e `low > 0` i 7 ingressi sono sempre finiti: è la condizione che S4 e S5 richiedono (controllato su 200 genomi casuali su tutte le barre delle tre serie: 0 valori non finiti).

**S1 — scala comune** (solo con due soglie libere, Q5 b e c). Moltiplicare pesi e soglie per `k` > 0 non cambia nessuna decisione, perché `s > θ` equivale a `k s > k θ`; vale anche nei pareggi (`s = θ` resta pareggio). Con `k` < 0 non è una simmetria: le disuguaglianze si invertono e `buy` e `sell` si scambiano. In virgola mobile S1 è **esatta** se `k` è una potenza di 2 e nessun prodotto, somma o soglia scalata va in overflow o nella zona dei numeri subnormali; con `k` = 2^-1000 un esempio costruito passa da `buy` a `hold`. Per gli altri `k` i numeri `k * w` sono arrotondati e la forma canonica di `k g` in genere differisce da quella di `g`.

La tabella confronta 200 genomi casuali `r` a 16 numeri (due soglie libere: genomi dall'inizializzazione con pesi e soglie moltiplicati per `e^U`, `U` uniforme in [-3; 3]; `ref/check-symmetry.mjs`, seme 31337) con le loro copie `k r`, su tutte le barre del dataset inventato, della serie sintetica (3000 barre) e di ENI (sola lettura), sommate. Una riga per fattore `k`; le colonne contano le decisioni diverse tra `r` e `k r`, quelle tra `r` e la sua forma proposta (divisa per `h`), e su quanti dei 200 genomi l'hash di `k r` differisce da quello di `r`. Nella riga «casuale» ogni genoma ha il suo `k = e^U`, `U` uniforme in [-3; 3]. Da leggere così: con `k` potenza di 2 tutto resta uguale; con `k` non potenza di 2 (3, 0,7, casuale) le decisioni non cambiano ma l'hash sì (ultima colonna), perché i numeri `k * w` sono arrotondati.

| k | barre confrontate | decisioni diverse tra r e k r | decisioni diverse tra r e la sua forma proposta | hash diversi su 200 genomi |
|---|---|---|---|---|
| 2 | 1107400 | 0 | 0 | 0 |
| 3 | 1107400 | 0 | 0 | 194 |
| 8 | 1107400 | 0 | 0 | 0 |
| 0,5 | 1107400 | 0 | 0 | 0 |
| 2^-20 | 1107400 | 0 | 0 | 0 |
| 0,7 | 1107400 | 0 | 0 | 196 |
| casuale | 1107400 | 0 | 0 | da 197 a 199 |

Sulle serie provate nessuna decisione cambia, ma un caso costruito cambia decisione 44132 volte su 200000 con `k` = 3 e 0 volte con `k` = 8: 7 pesi uniformi in [-2; 2], 7 ingressi uniformi in [-0,1; 0,1], la soglia alta uguale al punteggio oppure (metà dei casi) appena sopra, di circa un'ultima cifra. Gli equivalenti con `k` qualsiasi non nascono comunque durante l'evoluzione: nessun operatore proposto moltiplica un genoma per una costante (la sola eccezione è la rinormalizzazione di Q5 c).

**S2 — scambio veloce-lenta.** Scambiare `(w1, τ1)` con `(w2, τ2)` dà lo stesso punteggio, perché `x1` e `x2` sono la stessa formula con lo stesso avvio. È il caso più piccolo del problema delle «convenzioni in competizione» noto nella neuroevoluzione (l'evoluzione di reti neurali): la stessa soluzione scritta in due ordini diversi, che l'incrocio mescola male [5]. È esatta nei bit **solo se le due distanze sono i primi due addendi** della somma, `s = ((0 + w1 x1) + w2 x2) + …`: su ENI 0 punteggi diversi su 503400, mentre scambiare il secondo e il settimo addendo cambia l'ultima cifra in 279871 casi. Il decodificatore fissa quindi l'ordine della somma. V2 sceglie il rappresentante (veloce per prima).

**S3 — velocità uguali.** Con `τ1 = τ2` contano solo `w1 + w2`: una retta di genomi equivalenti. Il margine di V2 la esclude; velocità vicine danno genomi **quasi** equivalenti, che la forma canonica non riconosce.

**S4 — peso nullo.** Con `w_i = 0` il `τ_i` non conta: `0 * x = ±0` e `s + (±0) = s` esattamente, se `x_i` è finito (`0 * NaN = NaN`) ed è usato solo nella somma. Su ENI, 50 genomi × 7 ingressi con `τ_i` cambiato: 0 punteggi diversi su 880950. Con S2 insieme: se una sola delle due distanze ha peso non nullo, è indifferente in quale posizione stia (0 punteggi diversi su 125850).

**S5 — tutti i pesi nulli.** Il punteggio è sempre 0 e la decisione è costante: `buy` se `b` < -1, `sell` se `b` > 1, `hold` se -1 ≤ `b` ≤ 1, confini compresi (controllato con `b` = ±1 e con i numeri immediatamente oltre). Il segno di `b + 1` e `b - 1` è esatto in virgola mobile, quindi le tre classi sono esatte.

**S6 — numeri del `Trader` inutili** (solo se R4 li fa evolvere): un genoma che non compra mai ha quota, stop loss e take profit irrilevanti.

**Non riconosciute** (genomi che decidono uguale senza che la forma canonica lo sappia): soglie fuori dal campo che il punteggio raggiunge (alcuni ingressi sono limitati, per esempio l'RSI centrato tra -1 e 1, la distanza dal massimo ≤ 0); genomi che decidono uguale solo sui dati osservati; differenze che contano solo durante l'avvio; ingressi quasi uguali (velocità vicine); combinazioni lineari esatte tra i 7 ingressi, che la regola di conteggio del catalogo (sezione 7.1, punto 2: nessun ingresso che sia esattamente una somma pesata di altri) esclude per le identità note ma che non sono escluse in generale `[ipotesi]`.

## 7. Forma canonica, testo canonico e hash

### 7.1 La regola

La forma canonica serve **solo all'hash**: non cambia il genoma che evolve (lo scambio S2 nel genoma è già fatto dagli operatori). In parole, nell'ordine: un genoma con un numero non finito non ha hash; un peso -0 diventa 0; se tutti i pesi sono nulli resta solo la classe della decisione costante, scritta come `b` = -2 (sempre `buy`), 2 (sempre `sell`) o 0 (sempre `hold`), senza nessun `τ`; il `τ` di un peso nullo diventa `null`; le due distanze si mettono in ordine di memoria, con un peso nullo che conta come memoria infinita, così una distanza spenta va sempre in seconda posizione (altrimenti due genomi uguali nei bit con l'unica distanza attiva in posizione 1 o 2 avrebbero hash diversi); a pari chiave va per primo il peso minore (serve quando le due memorie sono uguali, caso che V2 esclude nei genomi validi ma che la forma canonica deve trattare, o quando i due pesi delle distanze sono entrambi nulli); infine `b` = -0 diventa 0.

```
forma_canonica(g):
  1. se un gene non e' finito: errore (nessun hash)
  2. ogni peso -0 diventa 0
  3. se tutti i pesi sono 0 (S5):
       b = -2 se b < -1;  b = 2 se b > 1;  altrimenti b = 0
       tutti i tau = null;  fine
  4. per ogni i con w_i = 0: tau_i = null                     (S4)
  5. distanze (S2): chiave_i = infinito se w_i = 0, altrimenti tau_i;
     se chiave_1 > chiave_2, oppure chiavi uguali e w1 > w2:
       scambia (w1, tau1) con (w2, tau2)
  6. se b e' -0 diventa 0
```

**Esempio passo per passo** (genoma K, capitolo 9, Esempio 4). K è G1 con le due distanze scambiate (pesi 10 e 25, `τ` 1,3863 e 0) e con `w7` = -0 e `τ7` = 3. Passo 2: `w7` diventa 0. Passo 4: `τ7` diventa `null`. Passo 5: la chiave della prima distanza (1,3863) supera quella della seconda (0), quindi le coppie si scambiano e tornano pesi 25 e 10 con `τ` 0 e 1,3863. Il risultato è la forma canonica di G1 con `w7` = 0, con lo stesso hash `d5844680cedf1c2293e3627e76df64351bf247edd77bded965564a7ae67f8f36`; i punteggi dei due genomi sono uguali nei bit.

Con le due soglie libere (Q5 b, c) e regola omogenea si divide prima per `h` (4.2): la forma canonica è la stessa della proposta, e due genomi a 16 numeri che differiscono per un fattore potenza di 2 hanno lo stesso hash. La divisione arrotonda: se il punteggio cade entro l'arrotondamento da una soglia, il genoma a 16 numeri e la sua forma divisa possono decidere diversamente, pur avendo lo stesso hash. Esempio (`ref/check-corrections.mjs`): il genoma A a 16 numeri con i `τ` di G1, pesi `[15.059158984660659, 5.182963606355583, 0.3576984041714715, 4.466249214301612, 1.1598329551603848, 1.350931155513518, 0.3947127508281677]` e soglie `-0.8451122981711758` (alta, uguale al suo punteggio del giorno 12 del dataset inventato) e `-1.9815337736027159` decide `hold` quel giorno; il genoma B, la sua forma divisa scritta con soglie `b + 1` e `b - 1`, ha lo stesso hash e decide `buy`, perché il suo punteggio supera la sua soglia alta di due ultime cifre binarie; negli altri 19 giorni i due genomi decidono uguale (ricalcolato anche in Python). Con la soglia messa esattamente sul punteggio succede in 25103 dei 73043 genomi così costruiti che hanno lo stesso hash della loro forma divisa; sulle tre serie del capitolo 6, con genomi casuali, non è mai successo.

**Che cosa garantisce lo stesso hash.** Con la proposta (Q5 a) due genomi con lo stesso hash hanno gli stessi numeri a meno di -0, dei `τ` dei pesi nulli e dello scambio delle due distanze; per S2, S4 e S5 decidono allo stesso modo su ogni serie, con punteggi uguali nei bit, se li valuta lo stesso programma (1.4). Con Q5 b o c la garanzia vale nei giorni in cui il punteggio non cade entro un arrotondamento da una soglia. Non c'è **quantizzazione** (arrotondamento dei numeri a una precisione fissa): l'hash riconosce solo le equivalenze dimostrate (domanda Q3).

### 7.2 Il testo canonico

Ogni numero si scrive come **16 cifre esadecimali minuscole** della sua rappresentazione binary64 (IEEE 754, i 64 bit del numero in virgola mobile) dal byte più significativo al meno significativo (ordine big-endian), dopo aver trasformato -0 in 0. Il testo è un oggetto JSON con le chiavi in quest'ordine e nessuno spazio:

```
{"b":"<b>","decoder":"lin7-dec-v1","schema":"lin7-a1-v1",
"tau":[<7 voci: "<tau_i>" oppure null>],"w":["<w_1>",...,"<w_7>"]}
```

`schema` dice che cosa sono i geni (15 geni, `τ` = logaritmo dell'età media, soglie `b ± 1`); `decoder` dice come i geni diventano decisioni (formule degli ingressi, calcolo di `c` da `τ` nella forma di 1.4, regola di salto, ordine della somma, forma dei confronti `s > b + 1` e `s < b - 1`, costanti del `Trader` fuori dal genoma). Se cambia una delle due cose, cambia la versione, e genomi uguali con decodificatori diversi non risultano duplicati. L'hash è **SHA-256** [12] dei byte ASCII del testo, in esadecimale minuscolo. In Node: `DataView.setFloat64` e `node:crypto`; in Python: `struct.pack('>d', x).hex()` e `hashlib.sha256`. Servono entrambi perché il genoma girerà in Node (E2, E3), mentre le verifiche indipendenti delle ricerche ricalcolano numeri e hash in Python: gli hash di questo documento sono stati ricalcolati così, 10 su 10 uguali. Si consiglia di conservare il testo canonico accanto all'hash, per poter controllare un'eventuale collisione `[ipotesi]`.

Il testo contiene solo stringhe, `null` e chiavi ASCII ordinate, quindi coincide con la forma canonica JSON di RFC 8785 [9] dello stesso oggetto. **Perché non i numeri decimali:** RFC 8785 scrive i numeri con l'algoritmo di ECMAScript [13, letto solo l'indice], e Python non li scrive allo stesso modo. La prima tabella ha una riga per numero, con la scrittura di Node e quella di Python:

| numero | Node `JSON.stringify` | Python `json.dumps` |
|---|---|---|
| 1e-7 | 1e-7 | 1e-07 |
| 0.000001 | 0.000001 | 1e-06 |
| -0.0 | 0 | -0.0 |
| 9007199254740992 | 9007199254740992 | 9007199254740992.0 |
| 1.2345678901234568e20 | 123456789012345680000 | 1.2345678901234568e+20 |
| 0.1 | 0.1 | 0.1 |
| 2.5 | 2.5 | 2.5 |

Le cifre sono le stesse, la forma no: Python sceglie la stringa più corta che ridà il numero [10], Node segue l'algoritmo di ECMAScript [13, non letto], e qui le cifre coincidono solo sugli esempi della tabella. Anche gli arrotondamenti differiscono, un `NaN` passa senza errore (Node lo scrive `null`, Python `NaN`) e un overflow dà 0 in Node e un errore in Python; la seconda tabella ha una riga per operazione:

| operazione | Node | Python |
|---|---|---|
| 1,25 a 2 cifre | 1.3 | 1.2e+00 |
| 2,5 a 1 cifra | 3 | 2e+00 |
| arrotondamento di 2,5 all'intero | 3 | 2 |
| NaN in JSON | null | NaN |
| 1/(1+e^710) | 0 | OverflowError |

**Domanda Q11 — scrittura dei numeri.** (a) Esadecimale binary64 (proposta). (b) Decimale secondo RFC 8785, con una funzione Python scritta apposta (esistono implementazioni di JCS, lo schema di RFC 8785, in più linguaggi [11], non provate qui) e vettori di prova. *Criterio:* (a) se il testo canonico serve alle macchine; (b) se vuoi poterlo leggere a occhio. *Effetto:* hash diversi tra le due scelte per lo stesso genoma; con (b) un errore nella funzione Python dà hash diversi tra linguaggi senza alcun messaggio.

### 7.3 Vettori di prova

Un **vettore di prova** è un genoma con il suo testo canonico e il suo hash, scritto qui perché chi implementa in un altro linguaggio possa controllare di ottenere gli stessi caratteri. Ogni vettore dà i geni (come letterali decimali che Node e Python leggono nello stesso numero binario), il testo canonico (qui spezzato dopo una virgola per l'impaginazione: il testo vero è una riga sola) e l'hash. T3 contiene i casi delicati: un peso -0, un numero subnormale (5e-324), 1e-7, pareggi decimali (1,25 e 2,5), `τ` sui due bordi e le due velocità esattamente al margine.

**T1** = genoma G1 (capitolo 9).

```
{"b":"0000000000000000","decoder":"lin7-dec-v1",
"schema":"lin7-a1-v1","tau":["0000000000000000",
"3ff62e42fefa39ef","3ff62e42fefa39ef","400193ea7aad030b",
"3ff62e42fefa39ef","3ff62e42fefa39ef","3ff62e42fefa39ef"],
"w":["4039000000000000","4024000000000000","3fe0000000000000",
"4014000000000000","3ff0000000000000","3ff0000000000000",
"3fe0000000000000"]}
```

SHA-256: `29ae884bca99df08a94d0a4b018d12f1577f65415d169ef216c4404c63440a0d`

**T2** = tutti i pesi nulli, `b` = 0,3, `τ` di G1 (classe `hold`).

```
{"b":"0000000000000000","decoder":"lin7-dec-v1",
"schema":"lin7-a1-v1","tau":[null,null,null,null,null,null,null],
"w":["0000000000000000","0000000000000000","0000000000000000",
"0000000000000000","0000000000000000","0000000000000000",
"0000000000000000"]}
```

SHA-256: `dce8550be5440a988891282a954bbdd489cea70d91feed5506bc68e67d1b33e8`

**T3** = `w` = [1.25, -0, 2.5, 1e-7, 5e-324, -22, 0.1], `b` = 2.5, `τ` = [-0.6931471805599453, 0, 4.605170185988092, 1.25, 2.5, 1e-7, 0.1].

```
{"b":"4004000000000000","decoder":"lin7-dec-v1",
"schema":"lin7-a1-v1","tau":["bfe62e42fefa39ef",null,
"40126bb1bbb55516","3ff4000000000000","4004000000000000",
"3e7ad7f29abcaf48","3fb999999999999a"],"w":["3ff4000000000000",
"0000000000000000","4004000000000000","3e7ad7f29abcaf48",
"0000000000000001","c036000000000000","3fb999999999999a"]}
```

SHA-256: `32e58bc1ca99c93042f0d886551a8508aac2bddbf1ee377e8b7945cbb97e860f`

La tabella dà, una riga per numero, la scrittura esadecimale dei numeri usati; i due limiti di `τ` sono scritti come letterali decimali, non ricalcolati con `ln`, perché la funzione logaritmo può differire nell'ultima cifra tra linguaggi.

| numero | binary64 big-endian |
|---|---|
| 1 | 3ff0000000000000 |
| 0 | 0000000000000000 |
| -0 | 0000000000000000 |
| 0.1 | 3fb999999999999a |
| 1.25 | 3ff4000000000000 |
| 2.5 | 4004000000000000 |
| 1e-7 | 3e7ad7f29abcaf48 |
| 5e-324 | 0000000000000001 |
| -22 | c036000000000000 |
| -0.6931471805599453 | bfe62e42fefa39ef |
| 4.605170185988092 | 40126bb1bbb55516 |
| 1.3862943611198906 | 3ff62e42fefa39ef |

### 7.4 Che cosa l'hash non fa

- **Non riconosce** le equivalenze del capitolo 6 marcate «non riconosciute», né S1 con fattori che non siano potenze di 2.
- **Non unisce genomi quasi uguali:** due genomi che differiscono nell'ultima cifra binaria di un peso hanno hash diversi anche se decidono uguale su tutti i dati provati (Esempio 5).
- **Segnala, non elimina:** due genomi con lo stesso hash sono duplicati per comportamento (con la proposta sempre, valutati dallo stesso programma; con le due soglie libere quasi sempre, 7.1); se tenerli, eliminarli o ridurne la pressione nella selezione è una scelta di E3 (#13).
- Le collisioni di SHA-256 non sono un rischio pratico; lo diventano se l'hash si accorcia per la visualizzazione (con 8 cifre esadecimali, cioè 32 bit, la probabilità di almeno una collisione arriva al 50 % con 77164 genomi, per il «paradosso del compleanno»).

**Domanda Q3 — genomi quasi uguali.** (a) Solo hash esatto: sono duplicati soltanto genomi che decidono sempre allo stesso modo per una simmetria dimostrata (proposta). (b) Hash esatto più una **chiave di quasi-duplicato**: lo stesso testo con ogni numero arrotondato a 24 bit di frazione, cioè 24 cifre binarie dopo il bit implicito (25 cifre binarie significative, circa 7,5 cifre decimali; precisione scelta dall'autore, `[ipotesi]`), con lo schema `lin7-a1-v1-near24` nel testo, segnalata a parte. L'operazione è intera sui 64 bit del numero, come `roundBits` in `ref/genome.mjs`: si tolgono gli ultimi 28 dei 52 bit di frazione arrotondando al pari (un riporto che passa nell'esponente è corretto; -0 e 0 restano 0); un numero subnormale si arrotonda sullo stesso campo, quindi a un multiplo di 2^-1046 (5e-324 diventa 0). La stessa operazione scritta in Python dà gli stessi bit di Node su 20022 valori, compresi quelli dell'Esempio 5 e del vettore T3 (`ref/check-corrections.mjs`). Con 24 cifre binarie significative (23 di frazione, come un `float32`) l'Esempio 5 darebbe un risultato diverso. (c) Precisione nel genoma: ogni gene su una griglia di valori interi, con hash esatto ma un passo minimo per ogni gene. *Criterio:* (a) se ti basta sapere quali genomi sono certamente uguali; (b) se vuoi anche contare i genomi «praticamente» uguali, sapendo che la chiave unisce genomi che possono decidere diversamente e separa sempre qualche coppia a cavallo di un arrotondamento (Esempio 5); (c) se preferisci un genoma a passi discreti. *Effetto:* (a) nessun numero in più; (b) una seconda impronta per genoma, con regola di arrotondamento al pari sui bit (uguale in ogni linguaggio); (c) cambiano tutti gli operatori (passi interi) e la conversione numero-griglia va specificata (in Node `Math.round(2.5)` = 3, in Python `round(2.5)` = 2).

**Domanda Q4 — impronta delle decisioni.** Un'**impronta di comportamento** è l'hash della sequenza di decisioni del genoma su un insieme di prova fisso e versionato, che non sono dati di valutazione (per esempio il dataset inventato seguito da 3000 barre della serie sintetica di R2: 3020 barre, contro le 2517 dello snapshot ENI; il costo è una simulazione in più per genoma su quelle barre). Fuori dai dati di valutazione perché l'impronta resti la stessa quando R6 sceglie o cambia quei dati `[ipotesi]`; versionata vuol dire che il nome dell'insieme di prova e la versione del decodificatore entrano nel testo dell'impronta; va calcolata sempre dallo stesso programma, perché i punteggi sono uguali nei bit solo dentro uno stesso programma (1.4). (a) No (proposta). (b) Sì, accanto all'hash. *Criterio:* (b) se vuoi segnalare anche genomi che si comportano allo stesso modo senza una simmetria dimostrata, e avere un controllo automatico (stesso hash deve dare stessa impronta); (a) se una simulazione in più per genoma non vale questa informazione. *Effetto:* con (b) l'impronta dipende dall'insieme di prova e dal decodificatore (va versionata); in prova (`ref/fingerprint.mjs`) 600 coppie equivalenti hanno dato 0 incoerenze, 300 coppie di genomi casuali indipendenti 0 impronte uguali, e G1 e G5 hanno hash diversi ma la stessa impronta.

## 8. Dipendenze da R4

R4 (#8) sceglierà le equazioni di decisione. La tabella dice, per ogni sua scelta, che cosa cambia nella codifica; nessuna riga decide per R4. La regola generale: **ogni simmetria usata dalla forma canonica vale solo se R4 la conserva**, e R4 deve dire quali di S1-S6 sopravvivono. Se R4 rompe una simmetria e la forma canonica continua a usarla, l'hash unisce genomi **non** equivalenti, senza alcun errore. Tre termini da sapere: l'**isteresi** usa soglie diverse per entrare e per uscire da una posizione, così la decisione non oscilla da un giorno all'altro; una **saturazione del punteggio** è una funzione che lo limita (per esempio a ±1); un **cancello** (caso di studio R7) è un ingresso che accende o spegne gli altri.

| Scelta di R4 | Opzioni | Effetto sulla codifica |
|---|---|---|
| R4-1 quota investita, stop loss, take profit | costanti; geni | +0 o +3 geni; con geni servono intervalli (V5), passi propri e la simmetria S6; con costanti entrano nella versione del decodificatore |
| R4-2 omogeneità della regola | regola come oggi; isteresi o soglie in più proporzionali alla zona di attesa; termini fissi (isteresi in unità assolute, saturazione del punteggio, soglie costanti) | i primi due conservano S1 e la proposta a 15 geni; i termini fissi rompono S1: la semi-ampiezza torna gene (16) e la forma canonica non divide più |
| R4-3 agitazione (ATR normalizzato) | assente; divisore di un ingresso; fattore del punteggio | non rompe S1; +1 gene per il suo `τ` (più uno per un esponente); un divisore applicato a una sola delle due distanze rompe S2; con peso nullo dell'ingresso diviso anche il `τ` dell'ATR diventa irrilevante (S4 esteso) |
| R4-4 decisioni durante l'avvio | come oggi; regola fissa; gene | 0 o 1 gene (intero o costante); la regola entra nel decodificatore |
| R4-5 ingressi riusati fuori dalla somma (prodotti, «cancelli» di R7) | assenti; presenti | per quell'ingresso S4 non vale più; nuovi geni come righe della tabella |

**Domanda Q2 — numeri del `Trader`.** (a) Contarli a parte: la codifica ha 15 geni e R4 dirà se diventano 18 (proposta). (b) Deciderlo ora: sono geni, con intervalli da fissare. (c) Deciderlo ora: sono costanti. *Criterio:* (a) se vuoi lasciare la scelta a chi scrive le equazioni di decisione; (b) o (c) se hai già un'idea e preferisci che R4 parta da quella. *Effetti delle opzioni:* capitolo 11.

## 9. Esempi lavorati

Tutti sul dataset inventato di 20 giorni (catalogo, sezione 1.5); numeri da `ref/examples.mjs`. I geni sono scritti con tutte le cifre, nel formato del codice: punto decimale, `w` i pesi, `b` il centro, `tau` le memorie; nella forma a due soglie `ta` e `tb` sono la soglia alta e la bassa. I nomi dei genomi (G1, P2, F, G3, M, G4, H4, G5, K) servono solo a ritrovarli nel testo e negli script.

### Esempio 1 — un genoma completo (G1)

Pesi e soglie del catalogo (sezione 7.5) divisi per `h` = 2 (soglie ±2 → `b` = 0), senza l'ATR normalizzato (che Luca ha tolto dalla somma, risposta D3 b) e con il massimo che dimentica al posto del massimo di 10 giorni (risposta D4 b); memorie dei «parametri dell'esempio» del catalogo. Una riga per ingresso: il peso, la memoria come `τ`, e il `c` e l'età media che ne derivano.

| # | Ingresso | peso w | tau | c = 1/(1+e^tau) | eta' media e^tau (barre) |
|---|---|---|---|---|---|
| 1 | distanza EMA veloce | 25,0 | 0,0000 | 0,5000 | 1,00 |
| 2 | distanza EMA lenta | 10,0 | 1,3863 | 0,2000 | 4,00 |
| 3 | RSI centrato | 0,5 | 1,3863 | 0,2000 | 4,00 |
| 4 | distanza dal massimo che dimentica | 5,0 | 2,1972 | 0,1000 | 9,00 |
| 5 | chiusura nella giornata | 1,0 | 1,3863 | 0,2000 | 4,00 |
| 6 | log volume relativo | 1,0 | 1,3863 | 0,2000 | 4,00 |
| 7 | OBV normalizzato | 0,5 | 1,3863 | 0,2000 | 4,00 |

```
G1.w   = [25, 10, 0.5, 5, 1, 1, 0.5]
G1.b   = 0
G1.tau = [0, 1.3862943611198906, 1.3862943611198906,
          2.1972245773362196, 1.3862943611198906,
          1.3862943611198906, 1.3862943611198906]
```

I `c` ricavati sono 0,5, 0,2 e, per il massimo che dimentica, 0,09999999999999998 (non esattamente 0,1, perché `τ` è scritto con 17 cifre). Giorno 12: ingressi -0,0228; -0,0287; -0,3804; -0,0662; -0,1736; 0,3104; -0,3533; contributi (peso per ingresso) -0,57; -0,29; -0,19; -0,33; -0,17; 0,31; -0,18; punteggio -1,42, sotto la soglia bassa -1: `sell`. La tabella ha una riga per giorno, con il punteggio e la decisione.

| Giorno | punteggio s | decisione |
|---|---|---|
| 1 | -0,03 | hold |
| 2 | 1,30 | buy |
| 3 | 1,81 | buy |
| 4 | 2,31 | buy |
| 5 | 2,52 | buy |
| 6 | 2,65 | buy |
| 7 | 2,58 | buy |
| 8 | 2,30 | buy |
| 9 | 1,34 | buy |
| 10 | 0,25 | hold |
| 11 | -0,61 | hold |
| 12 | -1,42 | sell |
| 13 | -1,88 | sell |
| 14 | -2,10 | sell |
| 15 | -1,18 | sell |
| 16 | -0,12 | hold |
| 17 | 0,84 | hold |
| 18 | 1,50 | buy |
| 19 | 1,67 | buy |
| 20 | 1,60 | buy |

11 `buy`, 5 `hold`, 4 `sell`: le decisioni coincidono giorno per giorno con quelle del catalogo (sezione 7.5), anche se due ingressi sono cambiati. Testo canonico e hash: vettore T1 (7.3).

### Esempio 2 — un incrocio

Secondo genitore P2 (valido):

```
P2.w   = [10, 30, 1, -5, 2, -1, 1]
P2.b   = 0.5
P2.tau = [1.2, 2.5, 1, 3, 2, 1.5, 2]
```

Estrazioni dei 7 blocchi (vero = da G1): distanze vero, RSI falso, massimo vero, chiusura falso, volume vero, OBV falso, `b` falso. Figlio F:

```
F.w   = [25, 10, 1, 5, 2, 1, 1]
F.b   = 0.5
F.tau = [0, 1.3862943611198906, 1, 2.1972245773362196, 2,
         1.3862943611198906, 2]
```

F è valido; decide 11 `buy`, 4 `hold`, 5 `sell`, diverso da G1 solo il giorno 11. Hash `2db4bfecf8a97d55030507c233762d31c3b0983a0b792369edb561fd56f1c113`. Con l'incrocio uniforme gene per gene, prendere solo `τ1` da P2 dà `τ1` = 1,2 e `τ2` = 1,3863: distanza 0,1863, sotto ln 2, quindi V2 violato e il figlio va rifiutato.

### Esempio 3 — una mutazione con vincoli violati

Genitore G3 (valido):

```
G3.w   = [40, -20, 3, 10, 5, -2, 4]
G3.b   = -0.5
G3.tau = [1, 1.8, 2, 2.5, -0.5, 1, 2]
```

Passi σ: 25 per `w1` e `w2`, 0,2649 per ogni `τ`. Le estrazioni gaussiane `z` (i valori di `N()` nel pseudocodice) sono scelte a mano per mostrare i casi; il nuovo valore è gene + σ × `z`, e i geni non nominati non mutano:

- **Tentativo 1:** z(`τ1`) = 2,0; z(`τ2`) = -1,5. Risulta `τ1` = 1,5298 e `τ2` = 1,4026: la veloce supera la lenta, quindi si scambiano le due distanze; dopo lo scambio la distanza tra le velocità è 0,1272, sotto ln 2: **tentativo rifiutato**.
- **Tentativo 2:** z(`w1`) = 0,4; z(`τ1`) = 3,0; z(`τ2`) = -3,0; z(`τ5`) = -2,0. `w1` = 40 + 25 × 0,4 = 50; `τ1` = 1,7947 e `τ2` = 1,0053 si scambiano (con i loro pesi); `τ5` = -1,0298 è sotto ln 0,5 e la riflessione lo porta a -0,3565. Il margine c'è: **accettato**.

```
M.w   = [-20, 50, 3, 10, 5, -2, 4]
M.b   = -0.5
M.tau = [1.0052523950177945, 1.7947476049822058, 2, 2.5,
         -0.35646262446508625, 1, 2]
```

Hash `4b8221f02faf7638be415aa9e4f20bd5f606aef3f3097515221a384c183bbc28`.

### Esempio 4 — genomi equivalenti con lo stesso hash

- **S1 con due soglie libere.** G4 = pesi del catalogo [50, 20, 1, 10, 2, 2, 1], soglie 2 e -2, `τ` di G1. Diviso per `h` = 2 dà esattamente G1: stesso hash. Moltiplicato per 2 o per 3, stesso hash: qui anche `k` = 3 è esatto, perché i numeri sono interi piccoli (gli esempi scritti a mano sono più «facili» dei genomi veri).
- **S1 con numeri non tondi.** Genoma H4 a 16 numeri (dall'inizializzazione con seme 12, pesi e soglie moltiplicati per 0,7):

```
H4.w   = [-74.14718025829643, -148.51637189276516,
          2.468960847984999, 160.6552002830431,
          -20.417030546441673, -15.659252580255268,
          6.860132756410167]
H4.ta  = 1.680912196682766
H4.tb  = 0.28091219668276607
H4.tau = [2.246408197415068, 3.208899713582597,
          -0.5318671493286484, 4.224070267863481,
          1.036440393469206, 2.0369846456317124,
          3.2791114713288794]
```

  H4 ha hash `ace0e266343fc73dc81f1ffdbe083013522fe6e1fa64eaafeb5c3272241d3973`; 2 × H4 ha lo stesso hash; 3 × H4 no, perché 6 degli 8 numeri della forma divisa per `h` differiscono nell'ultima cifra binaria. H4 e 3 × H4 decidono uguale su tutti i 20 giorni (1 `buy`, 19 `sell`).
- **S2.** G1 con le coppie veloce-lenta scambiate viola V2 ma ha lo stesso hash di G1 e punteggi uguali nei bit.
- **S4.** G1 con `w7` = 0 e `τ7` = ln 4, e con `w7` = -0 e `τ7` = 3: stesso hash (`d5844680cedf1c2293e3627e76df64351bf247edd77bded965564a7ae67f8f36`) e punteggi uguali nei bit; decidono 10 `buy`, 7 `hold`, 3 `sell`.
- **Forma canonica passo per passo** (7.1). Genoma K = G1 con le due distanze scambiate e `w7` = -0, `τ7` = 3:

```
K.w   = [10, 25, 0.5, 5, 1, 1, -0]
K.b   = 0
K.tau = [1.3862943611198906, 0, 1.3862943611198906,
         2.1972245773362196, 1.3862943611198906,
         1.3862943611198906, 3]
```

  K viola V2 (la veloce è in seconda posizione), ma la forma canonica lo riporta a G1 con `w7` = 0 e `τ7` = `null`: stesso hash dell'esempio S4 e punteggi uguali nei bit.

### Esempio 5 — genomi diversi con hash diversi

G5 è G1 con `w1` = 25.000000000000004, il numero binary64 successivo a 25: hash `2379bea21c8aafdc206f82b78b330a0a947d3fade1cf257ba13d8a4f7750816d`, diverso da G1, anche se le decisioni sui 20 giorni sono le stesse. La chiave di quasi-duplicato a 24 bit (Q3 b) di G5 è uguale a quella di G1; ma due genomi con `w1` = 25.00000143051147 e 25.000001430511475, due numeri binari consecutivi, hanno chiavi **diverse**, perché cadono ai due lati di un arrotondamento: con 24 bit di frazione i numeri vicini a 25 si arrotondano a multipli di 2^-20, e 25.000001430511475 è esattamente il punto di mezzo `25 + 1,5 · 2^-20`, che al pari va su 25.000001907348633 (`25 + 2^-19`), mentre il numero prima va su 25.000000953674316 (`25 + 2^-20`). P2 (Esempio 2) ha hash `a33e6a16796a148134d62457c5dfdfe3919b19f43a760ee3b40f2aab4b050c7d`.

### Esempio 6 — pesi tutti nulli

Con tutti i pesi nulli e i `τ` di G1: `b` = 0,3, `b` = -0,7 e `b` = 1 danno sempre `hold` e lo stesso hash (vettore T2); `b` = -1,5 dà sempre `buy` e un hash diverso, `cc933c9cf3782f53a88aed8f599d84f7ac0e68f57fea50162d5264b79a490bba`.

## 10. Che cosa non si è potuto accertare

- Gli intervalli dei geni (età media 0,5-100, W_i con il fattore 5, `b` tra -5 e 5), il passo del 5 % e il margine ln 2 sono scelte dell'autore, senza fonte; il limite alto di `τ` aspetta l'avvio massimo di R6. I W_i vengono da una sola serie: con altri semi variano fino a circa il 17 % (3.2).
- Sono scelte dell'autore anche: il limite di 20 tentativi della mutazione con la ricaduta sul genitore (5.1), la soglia del 5 % che definisce l'avvio (3.2) e la precisione di 24 bit della chiave di quasi-duplicato (Q3 b).
- `exp` (e forse `ln`, non misurato) non dà gli stessi bit in Node e in Python (1.4): l'hash non ne dipende, ma punteggi, decisioni vicine a una soglia e impronte sono garantiti uguali solo dentro uno stesso programma.
- Che i 7 ingressi non abbiano combinazioni lineari esatte tra loro (quindi che i gradi di libertà siano proprio 15): non dimostrato.
- Quante decisioni cambierebbe S1 con fattori non potenze di 2 su dati lunghi diversi da quelli provati: sulle tre serie nessuna, ma il caso costruito mostra che è possibile.
- La variante limitata di SBX (sezione 6 di [1]) e l'originale di BLX-α non sono stati letti; dell'effetto della gestione dei bordi [6], dei vincoli [7] e della neutralità (mutazioni che non cambiano il comportamento) [8] sono letti solo gli abstract.
- L'algoritmo di ECMAScript per scrivere i numeri non è stato letto [13]; il comportamento è osservato solo su Node 20.20.2 e Python 3.12.3.
- La scala delle distanze dipende da `τ` (3.2): il limite resta.
- Se l'hash esatto, la chiave di quasi-duplicato o l'impronta servano davvero a E3 si vedrà solo con l'evoluzione.

## 11. Domande per Luca

Le stesse undici domande di «In breve», nello stesso ordine (prima Q5 e Q6, che cambiano la forma dei geni). Per ognuna: il problema in una frase, poi una tabella con una riga per opzione; le colonne dicono quanti geni ha il genoma, che cosa cambia nei vincoli e negli operatori, che cosa cambia nella forma canonica e nell'hash, e quando scegliere l'opzione. «Stessi» vuol dire come nella proposta (15 geni). La scelta si registra nel registro di lavoro di questa ricerca (il file del ciclo, nel blocco `## Human Verification`).

**Q5 — Soglie e scala comune** (4.2). Moltiplicare pesi e soglie per lo stesso numero positivo non cambia le decisioni ma cambia l'effetto degli operatori; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) centro `b`, soglie `b ± 1` (proposta) | 15 | V3 impossibile da violare; nessuna scala da gestire | nessuna divisione; stesso hash, stesse decisioni (stesso programma) | R4 resta omogenea (se poi aggiunge un termine fisso: 16 geni, nuovo schema, hash nuovi) |
| (b) due soglie libere, mai rinormalizzate | 16 | V3 con rifiuto se le soglie coincidono; la scala è un passo di mutazione nascosto | divisione per `h`, poi lo stesso testo di (a); stesso hash, stesse decisioni quasi sempre (non quando il punteggio cade entro un arrotondamento da una soglia, 7.1); senza divisione se R4 aggiunge termini fissi | vuoi le soglie come numeri del catalogo, o R4 aggiungerà termini fissi |
| (c) due soglie libere, rinormalizzate prima dell'incrocio | 16 salvati; semi-ampiezza riportata a 1 prima di ogni incrocio | come (b), più la rinormalizzazione, che cambia i figli prodotti | come (b) | vuoi soglie libere ma genitori alla stessa scala (solo con regola omogenea) |

**Q6 — Gene della memoria** (4.3). Lo stesso passo su `c` cambia moltissimo una memoria corta e poco una lunga; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) `τ` = ln(età media) (proposta) | stessi | V1 con riflessione in [ln 0,5; ln 100]; un passo moltiplica l'età media per lo stesso fattore | testo con i `τ` | vuoi passi proporzionati a ogni memoria |
| (b) `c` direttamente | stessi | V1 con riflessione in [c_min, c_max]; passo lineare | testo con i `c`: altro schema, hash diversi da (a) per lo stesso comportamento | vuoi leggere i `c` del catalogo e di Consilium |

**Q1 — Segno delle soglie** (3.2). Decide se con tutti gli ingressi a 0 la strategia può comprare o vendere; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) `b` tra -5 e 5 (proposta) | stessi | intervallo di `b` | tre classi per i genomi a pesi nulli (`buy`, `hold`, `sell`) | permetti acquisti o vendite «per default» |
| (b) `b` tra -1 e 1 | stessi | intervallo di `b` | una sola classe (`hold`) | senza segnali non si deve fare nulla |

**Q7 — Margine tra le due velocità** (3.1). Con memorie vicine le due distanze diventano quasi lo stesso ingresso; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) lenta almeno il doppio della veloce, δ = ln 2 (proposta) | stessi | V2 con scambio e rifiuto | nessun effetto | vuoi due velocità davvero diverse |
| (b) nessun margine, δ = 0 | stessi | basta `τ1 < τ2`; l'uguaglianza esatta si rifiuta | conta l'ordine deterministico del passo 5 (7.1) | non vuoi vietare velocità vicine |
| (c) un altro rapporto minimo | stessi | V2 con un altro δ | nessun effetto | hai un rapporto in mente, per esempio 1,25 o 4 |

**Q8 — Intervalli** (3.2). Gli intervalli sono scelte dell'autore senza fonte; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) età media 0,5-100 per tutti, W_i della tabella 3.2 (proposta) | stessi | stessi limiti per le 7 memorie | costanti e versione dello schema | basta un intervallo largo, da rivedere con R6 |
| (b) limiti per ingresso, o limite alto dall'avvio di R6 | stessi | limiti diversi; le due distanze sempre con lo stesso | altre costanti, altra versione dello schema | vuoi già ora memorie diverse per ingressi diversi |

**Q9 — Incrocio** (5.3). Decide se peso e memoria restano insieme e se il figlio va corretto; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) per blocchi, distanze insieme (proposta) | stessi | nessuna correzione: 0 figli invalidi su 100000 | nessun effetto | vuoi tenere ogni peso con la sua memoria |
| (b) uniforme gene per gene, come Consilium | stessi | 17658 figli su 100000 violano V2: scambio e rifiuto | nessun effetto | vuoi restare vicino al codice di Consilium |
| (c) intermedio con un solo α | stessi | 3543 su 100000 escono per arrotondamento: riporto e rifiuto | nessun effetto | vuoi figli a metà strada, sapendo che la media restringe la popolazione |

**Q10 — Mutazione** (5.3). Decide la forma del passo e il trattamento dei bordi; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) gaussiana al 5 % dell'intervallo, con riflessione (proposta) | stessi | intervalli per riflessione; V2 con scambio e rifiuto | nessun effetto | non vuoi accumuli sui bordi |
| (b) uniforme ±5 % con saturazione, come Consilium | stessi | intervalli per saturazione (valori fermi sul bordo); V2 con scambio e rifiuto | nessun effetto | vuoi la stessa regola di Consilium |
| (c) polinomiale limitata | stessi | intervalli per costruzione; V2 con scambio e rifiuto | nessun effetto | vuoi una legge del passo che resta nei limiti senza riflessione |

**Q2 — Numeri del `Trader`** (capitolo 8). Quota investita, stop loss e take profit possono essere geni o costanti; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) contati a parte, 0 o 3 geni secondo R4 (proposta) | 15 ora, 15 o 18 dopo R4 | V5 da R4 | da R4 | lasci la scelta a chi scrive le equazioni |
| (b) geni già ora | 18 | V5 (intervalli), passi propri | simmetria S6 in più | hai già deciso che evolvono |
| (c) costanti già ora | 15 | nessuno | le costanti entrano nella versione del decodificatore | hai già deciso che sono fisse |

**Q3 — Genomi quasi uguali** (7.4). L'hash riconosce solo equivalenze dimostrate; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) solo hash esatto (proposta) | stessi | nessuno | un hash | ti basta sapere quali genomi sono certamente uguali |
| (b) hash esatto più chiave di quasi-duplicato a 24 bit di frazione | stessi | nessuno | una seconda chiave, arrotondata al pari sui bit (7.4); unisce genomi che possono decidere diversamente e separa coppie a cavallo di un arrotondamento | vuoi contare anche i genomi praticamente uguali |
| (c) geni su una griglia di interi | stessi, a passi | operatori a passi interi; conversione numero-griglia da specificare | hash esatto senza decimali | preferisci un genoma a passi discreti |

**Q4 — Impronta delle decisioni** (7.4). Segnalerebbe genomi che decidono uguale senza una simmetria dimostrata; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) no (proposta) | stessi | nessuno | solo l'hash | una simulazione in più per genoma non vale l'informazione |
| (b) sì, su un insieme di prova fisso e versionato | stessi | una simulazione in più per genoma su 3020 barre, sempre con lo stesso programma | impronta accanto all'hash; controllo «stesso hash, stessa impronta» | vuoi segnalare anche i genomi uguali in pratica |

**Q11 — Scrittura dei numeri nell'hash** (7.2). Node e Python scrivono i decimali in modo diverso; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) esadecimale binary64 (proposta) | stessi | nessuno | testo uguale in Node (dove gira il genoma) e Python (dove si verifica) per costruzione | il testo serve solo alle macchine |
| (b) decimale RFC 8785 con funzione Python dedicata | stessi | nessuno | funzione da scrivere e provare con vettori di prova; hash diversi da (a) | vuoi leggere il testo a occhio |

## Glossario

Una riga per termine, con il significato usato in questo documento.

| Termine | Significato |
|---|---|
| agitazione | quanto il prezzo oscilla in un giorno; nel catalogo l'ATR normalizzato, tolto dalla somma e lasciato a R4 |
| algoritmo genetico | procedura che prova molte varianti di genoma, tiene le migliori, le mescola e le cambia un poco |
| approcci A, B, C | i tre modi di partenza di scrivere i geni: grezzi con riparazione, riparametrizzati, ibrido (4.1) |
| ATR | *Average True Range*, escursione vera media: misura dell'agitazione del prezzo; normalizzata, era un ingresso del catalogo, tolto dalla somma (D3 b) |
| avvio | barre iniziali in cui una media dipende ancora molto dal primo valore |
| barra | i cinque numeri di un giorno di borsa: apertura, massimo, minimo, chiusura, volume |
| big-endian | ordine dei byte di un numero dal più significativo al meno significativo |
| binary64 | il formato dei numeri in virgola mobile a 64 bit (IEEE 754), usato da JavaScript e Python |
| BLX-α, SBX | due incroci per numeri reali che estraggono il figlio vicino ai genitori o un po' oltre (5.3) |
| blocco | gruppo di geni che l'incrocio passa intero da un genitore |
| cancello | ingresso che accende o spegne altri ingressi (caso di studio R7) |
| chiave di quasi-duplicato | hash del testo canonico con i numeri arrotondati a 24 bit di frazione, al pari, sui 64 bit del numero (opzione Q3 b, 7.4) |
| clamp (saturazione) | riportare sul bordo un valore uscito dall'intervallo |
| Consilium | il simulatore da cui viene il genoma attuale e il codice dell'algoritmo genetico |
| DEAP, pymoo | due librerie Python di algoritmi evolutivi, citate per gli operatori |
| decodificatore | la regola che trasforma i geni in decisioni (formule, ordine della somma, confronti) |
| duplicato | genoma con lo stesso hash di un altro: con la proposta decide sempre allo stesso modo (valutato dallo stesso programma); con le due soglie libere quasi sempre (7.1) |
| EMA | media mobile esponenziale: `e = e * (1 - c) + x * c` |
| `EMA0` | EMA avviata da zero invece che dal primo valore; usata in coppia, nel rapporto di due `EMA0` con lo stesso `c` (1.3) |
| epica | il gruppo di ricerche (R2-R7) e implementazioni (E2, E3) per un genoma che non sia una macchina a stati (issue #4) |
| età media | età media dei dati in una EMA, `(1 - c)/c` barre |
| fitness | il numero che misura quanto è buona una strategia (ricerca R5) |
| forma canonica | il genoma riscritto in modo che genomi equivalenti diventino identici |
| gaussiana | distribuzione «a campana»; `N()` ne estrae un valore con media 0 e larghezza 1 |
| gene | numero del genoma che l'algoritmo genetico fa evolvere |
| genoma | l'insieme dei numeri che descrive una strategia |
| hash | impronta di lunghezza fissa calcolata da un testo; testi diversi danno impronte diverse salvo collisioni rarissime |
| impronta di comportamento | hash delle decisioni su un insieme di prova fisso |
| incrocio | operazione che costruisce un figlio con parti di due genitori |
| incrocio intermedio | figlio = media pesata dei genitori, con lo stesso peso α per tutti i geni |
| ingresso | numero calcolato ogni giorno dai prezzi e dai volumi passati, che entra nel punteggio |
| isteresi | soglie diverse per entrare e per uscire, perché la decisione non oscilli da un giorno all'altro (R4) |
| Koncorde | indicatore pubblicato da un autore indipendente (joapen, 2021) che la ricerca R7 (issue #23) proverà a riprodurre con il punteggio lineare |
| log-normale | passo di mutazione gaussiano sul logaritmo di un numero, quindi moltiplicativo sul numero |
| mantissa | le cifre binarie significative di un numero in virgola mobile; in binary64 un bit implicito più 52 bit di **frazione** |
| massimo che dimentica | un massimo recente dei prezzi che ogni giorno scende verso la chiusura di una frazione `c`, finché un nuovo massimo lo rialza (ingresso 4, 1.3) |
| margine | distanza minima richiesta tra le memorie delle due distanze |
| mulberry32 | generatore di numeri pseudocasuali usato dagli script, riproducibile dato il seme |
| mutazione | piccolo cambiamento casuale di alcuni geni |
| mutazione polinomiale limitata | mutazione con una legge del passo che resta nei limiti da sola (5.3) |
| neuroevoluzione | evoluzione di reti neurali con algoritmi evolutivi |
| OBV | *On-Balance Volume*: volume sommato con il segno della variazione del giorno; l'ingresso 7 ne è la forma normalizzata, tra -1 e +1 |
| peso | numero che moltiplica un ingresso nel punteggio |
| punteggio | somma pesata degli ingressi, confrontata con le soglie |
| quantizzazione | arrotondamento dei numeri a una precisione fissa |
| quota investita | parte del capitale usata per un acquisto (`buyPercent`) |
| R2-R7, E2, E3 | le ricerche e le implementazioni dell'epica: R2 indicatori, R3 codifica, R4 equazioni di decisione, R5 fitness, R6 protocollo di valutazione, R7 caso di studio Koncorde, E2 codice del genoma, E3 evoluzione in Consilium |
| riflessione | riportare dentro un valore uscito, di tanto quanto è uscito |
| rifiuto | scartare un figlio non valido e ritentare con nuove estrazioni |
| rinormalizzare | dividere pesi e soglie per la semi-ampiezza, così che torni 1 |
| riparametrizzazione | scrivere un gene in una forma che rende impossibile violare un vincolo |
| riporto nell'intervallo | portare sul bordo un valore uscito di un'ultima cifra per arrotondamento |
| RSI | *Relative Strength Index*, indice di forza relativa: confronta rialzi e ribassi recenti; l'ingresso 3 ne è la forma centrata, tra -1 e +1 |
| saturazione del punteggio | funzione che limita il punteggio, per esempio a ±1 (R4) |
| schema | la descrizione di che cosa sono i geni, con la sua versione, scritta nel testo canonico |
| seme | numero di partenza di un generatore pseudocasuale: stesso seme, stesse estrazioni |
| semi-ampiezza | metà della distanza tra soglia alta e bassa; nella proposta vale 1 |
| serie sintetica | serie di prezzi casuale con seme dichiarato, costruita in R2 per le prove |
| SHA-256 | funzione di hash standard a 256 bit |
| simmetria | trasformazione dei geni che non cambia nessuna decisione |
| soglia | valore del punteggio sopra cui si compra (alta) o sotto cui si vende (bassa) |
| stop loss, take profit | vendita automatica quando la perdita o il guadagno superano una percentuale |
| strategie evolutive | famiglia di algoritmi evolutivi su numeri reali, da cui vengono la mutazione log-normale e l'incrocio intermedio |
| subnormale | numero in virgola mobile così piccolo da perdere cifre significative |
| `τ` (tau) | logaritmo dell'età media di una media: `ln((1 - c)/c)` |
| testo canonico | la forma canonica scritta come testo JSON, da cui si calcola l'hash |
| `Trader` | il componente del motore che esegue gli ordini con quota investita, stop loss e take profit |
| vettore di prova | genoma con il suo testo canonico e il suo hash, per controllare un'implementazione |
| vincolo di validità | condizione senza la quale un genoma non si può valutare o è ambiguo |
| zona di attesa | intervallo del punteggio tra soglia bassa e soglia alta, in cui la decisione è `hold` |

## Riferimenti al codice

Una riga per file, con le righe citate e che cosa contengono.

| File (righe) | Che cosa contiene |
|---|---|
| `src/engine/genome.js` (13-36, 40-42, 86) | genoma fisso FSM; controllo dei numeri finiti; rifiuto di `c` ≥ 1 |
| `src/engine/strategy.js` (36-37) | il `Trader` richiede quota, stop loss e take profit |
| `src/engine/dataTrainer.js` (34) | barre ammesse: `low > 0`, volume ≥ 0 |
| Consilium `public/src/individual_v2.js` (161-193, 199-279) | incrocio uniforme per gene; mutazione uniforme con saturazione |
| Consilium `public/src/individual.js` (195-237, 271-275, 350-382) | intervalli; passo ±5 % con saturazione; incrocio |
| Consilium `ga/ga_v2.js` (17, 93-126, 128-193, 330-336) | probabilità di mutazione 0,1; incrocio; mutazione ±0,125; salvataggio senza controllo dei duplicati |
| Consilium `db/orm.js` (454-504) | gestione di un errore di unicità sul testo del genoma |

Consilium è letto sul branch `experiment/lb77`, commit `2ec7237`.

## Riferimenti

1. K. Deb, R. B. Agrawal, *Simulated Binary Crossover for Continuous Search Space*, Complex Systems 9(2), 115-148, 1995. Letto (sezioni 1-3): https://www.cse.unr.edu/~sushil/class/gas/papers/SimulatedBinaryCrossover.pdf
2. H.-G. Beyer, H.-P. Schwefel, *Evolution strategies – A comprehensive introduction*, Natural Computing 1, 3-52, 2002, DOI 10.1023/A:1015059928466. Letto (sezioni 4.1, 4.2.2 e ricombinazione): https://gwern.net/doc/reinforcement-learning/model-free/2002-beyer.pdf
3. DEAP, documentazione degli operatori. Letta: https://deap.readthedocs.io/en/master/api/tools.html
4. pymoo, *Crossover* e *Mutation*. Lette: https://pymoo.org/operators/crossover.html, https://pymoo.org/operators/mutation.html
5. K. O. Stanley, R. Miikkulainen, *Evolving Neural Networks through Augmenting Topologies*, Evolutionary Computation 10(2), 99-127, 2002 (convenzioni in competizione, analogo di S2). Letto (sezione 2.2): https://www.cse.unr.edu/~sushil/class/gas/papers/NEAT.pdf
6. S. Helwig, J. Branke, S. Mostaghim, *Experimental Analysis of Bound Handling Techniques in Particle Swarm Optimization*, IEEE Trans. Evolutionary Computation 17(2), 259-271, 2013, DOI 10.1109/TEVC.2012.2189404. Solo abstract, letto nel repository WRAP dell'Università di Warwick; dati bibliografici confermati da Crossref: https://doi.org/10.1109/TEVC.2012.2189404
7. C. A. Coello Coello, *Theoretical and numerical constraint-handling techniques used with evolutionary algorithms: a survey of the state of the art*, Computer Methods in Applied Mechanics and Engineering 191(11-12), 1245-1287, 2002, DOI 10.1016/S0045-7825(01)00323-1. Solo abstract.
8. E. Galván-López, R. Poli, A. Kattan, M. O'Neill, A. Brabazon, *Neutrality in evolutionary algorithms... What do we know?*, Evolving Systems 2(3), 145-163, 2011, DOI 10.1007/s12530-011-9030-5. Solo abstract: https://gpbib.cs.ucl.ac.uk/gp-html/GalvanLopezPKOB_2011_ESNeEAWDWK.html
9. A. Rundgren, B. Jordan, S. Erdtman, RFC 8785, *JSON Canonicalization Scheme (JCS)*, 2020. Letto (sezioni 3.1-3.2.4, appendice B): https://www.rfc-editor.org/rfc/rfc8785
10. *What's New In Python 3.1* (scrittura dei float con la stringa più corta). Letta la parte: https://docs.python.org/3/whatsnew/3.1.html
11. Repository `cyberphone/json-canonicalization` (implementazioni di JCS). Letta la pagina principale, codice non provato: https://github.com/cyberphone/json-canonicalization
12. NIST, FIPS 180-4, *Secure Hash Standard*, 2015, DOI 10.6028/NIST.FIPS.180-4. Letta la pagina di presentazione, non il testo: https://csrc.nist.gov/pubs/fips/180-4/upd1/final
13. ECMA-262, *ECMAScript Language Specification*, `Number::toString`. Letto solo l'indice: https://tc39.es/ecma262/#sec-numeric-types-number-tostring
