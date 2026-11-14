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

Questo documento fa parte di **SwarmTrader**, il programma che rigioca giorno per giorno una strategia di compravendita sui prezzi storici di ENI. La strategia nuova, in progettazione, calcola ogni sera un **punteggio**, cioè una somma pesata di 7 **ingressi** (numeri calcolati dai prezzi e dai volumi passati), e lo confronta con due **soglie** per decidere `buy` (compra), `hold` (resta com'è) o `sell` (vendi). Il [catalogo degli indicatori](../genome-indicators-catalog/) ha scelto i 7 ingressi (ricerca R2); questo documento è la ricerca **R3**: dice quali numeri della strategia sono **geni** (i numeri che l'algoritmo genetico fa evolvere), entro quali limiti, come si mescolano e si cambiano senza produrre strategie non valide, e come si riconoscono due strategie che decidono sempre allo stesso modo. Le scelte sono di Luca: il documento le prepara, con una proposta dell'autore.

> **Avvertenza.** Gli esempi usano il dataset di 20 giorni **inventato** del catalogo e geni scelti a mano. Nessun numero dice che una codifica o un operatore «funziona meglio»: i confronti riguardano validità, scala e leggibilità, non i risultati dell'evoluzione.

**Percorso di lettura.** «In breve» (circa 15 minuti) basta per capire che cosa si sceglie; le domande Q1-Q11 sono elencate con le opzioni nel [capitolo 11](#domande-per-luca). I capitoli 2-7 spiegano le opzioni e sono consultazione; il capitolo 9 contiene gli esempi completi, che servono anche come casi di prova per chi scriverà il codice (E2) e l'evoluzione (E3). Il documento intero richiede circa un'ora e mezza.

**Segni usati.** `[ipotesi]` marca un giudizio dell'autore o un fatto senza una fonte letta; i numeri tra parentesi quadre, per esempio [3], rimandano ai [Riferimenti](#riferimenti), ognuno con il suo stato (letto, solo abstract, non letto). Decimali con la virgola nel testo, con il punto nel codice. Tutti i numeri vengono da script conservati in `/home/luca/Workspace/swarmtrader-r3-work/` (fuori dal repository; `ref/` gli script, `out/` le uscite). I termini nuovi sono nel [Glossario](#glossario).

## In breve

### Il problema

Il genoma a punteggio lineare ha tre tipi di numeri: un **peso** per ogni ingresso, le **soglie**, e il **coefficiente `c`** di ogni ingresso (il peso del dato nuovo nella sua media esponenziale: `c` grande vuol dire memoria corta). Per l'algoritmo genetico non basta elencarli: bisogna dire in quale forma scriverli, perché la forma decide tre cose.

1. **Che cosa può andare storto.** Alcuni numeri hanno vincoli: `c` tra 0 e 1, la media «veloce» più veloce di quella «lenta», la soglia alta sopra la bassa. Un incrocio o una mutazione può violarli.
2. **Quanto pesa un passo di mutazione.** Spostare `c` di 0,05 cambia poco una memoria lunga e moltissimo una corta.
3. **Quando due genomi sono «lo stesso».** Moltiplicare pesi e soglie per 2 non cambia nessuna decisione: due genomi diversi nei numeri, uguali nel comportamento. Luca ha chiesto di riconoscerli (con un **hash**, un'impronta di 64 caratteri calcolata dai numeri) e di segnalarli, non di eliminarli.

Sono già decisi (risposte di Luca del 2026-11-14): i 7 ingressi sono **sempre tutti presenti** (lunghezza fissa, nessun gene che accende o spegne un ingresso; un ingresso inutile si riconosce da un peso piccolo) e i duplicati si riconoscono per **uguaglianza di comportamento**; se e come toglierli dalla popolazione lo deciderà E3.

### La proposta in una tabella

La proposta dell'autore ha **15 geni**, tutti numeri reali, in quest'ordine fisso. Gli intervalli sono `[ipotesi]` (capitolo 3).

| Geni | Che cosa sono | Intervallo proposto | Perché questa forma |
|---|---|---|---|
| `w1 … w7` | pesi dei 7 ingressi | da -W_i a +W_i, con W_i tra 22 e 260 | si leggono come «quanto sposta il punteggio questo ingresso» |
| `b` | centro della zona di attesa: soglia alta `b + 1`, soglia bassa `b - 1` | da -5 a 5 (Q1) | la distanza tra le soglie è fissata a 2: toglie la scala comune e il vincolo «alta sopra bassa» |
| `τ1 … τ7` | logaritmo dell'età media della memoria di ogni ingresso: `τ = ln((1 - c)/c)` | da ln 0,5 a ln 100 (età media da mezza barra a 100 barre) | un passo di mutazione cambia la memoria della stessa proporzione, corta o lunga che sia |

Vincolo in più: la memoria lenta è almeno il **doppio** della veloce (`τ2 - τ1 ≥ ln 2`). Il catalogo stimava 16 numeri: sono 16 se le soglie restano due, 15 con la forma proposta, perché un grado di libertà non cambiava nessuna decisione. Se R4 (le equazioni di decisione) farà evolvere anche quota investita, stop loss e take profit (la parte del capitale usata per comprare e le perdite e i guadagni percentuali a cui il motore vende da solo), i geni diventano 18 (capitolo 2).

**Operatori proposti.** L'**incrocio** (il figlio prende parti dei due genitori) passa **blocchi interi**: ogni peso con la sua memoria, le due distanze dalle medie insieme, `b` da solo; così nessun figlio viola un vincolo. La **mutazione** (piccolo cambiamento casuale) aggiunge a un gene un passo gaussiano largo il 5 % del suo intervallo e, se esce, lo **riflette** dentro; se la veloce supera la lenta scambia le due distanze (il comportamento non cambia), se manca il margine ritenta. In 100000 prove per operatore nessun figlio è risultato invalido (capitolo 5).

**Hash.** Si calcola su una **forma canonica**: il genoma scritto in modo che genomi equivalenti per una simmetria dimostrata diventino identici (peso nullo: il suo `τ` non conta; tutti i pesi nulli: conta solo se la decisione costante è `buy`, `hold` o `sell`; le due distanze in ordine). Ogni numero si scrive come le 16 cifre esadecimali della sua rappresentazione binaria, così Node e Python producono lo stesso testo; poi SHA-256, una funzione di hash standard. Due genomi con lo stesso hash decidono sempre allo stesso modo; il contrario non è garantito (capitolo 7).

### Le scelte per Luca

Undici domande, ciascuna con opzioni di una frase nel [capitolo 11](#domande-per-luca). La tabella dice dove nascono e che cosa cambiano.

| # | Domanda | Proposta dell'autore | Che cosa cambia scegliendo diversamente |
|---|---|---|---|
| Q5 | soglie come centro con distanza fissa, o due soglie libere | centro `b`, 15 geni | 16 geni; la scala comune resta e va gestita (cap. 4) |
| Q6 | memoria come `τ` (logaritmo dell'età media) o come `c` | `τ` | passo lineare in `c`, che pesa in modo diverso le memorie corte e lunghe |
| Q1 | punteggio zero sempre `hold`, o no | `b` tra -5 e 5 (no) | `b` tra -1 e 1 |
| Q7 | margine tra le due velocità | lenta almeno 2 volte la veloce | margine nullo o diverso |
| Q8 | intervalli dei geni | età media 0,5-100 barre; W_i dalla scala degli ingressi | altri limiti, per esempio dall'avvio massimo che R6 fisserà |
| Q9 | incrocio | per blocchi | uniforme gene per gene (come Consilium) o media dei genitori |
| Q10 | mutazione | gaussiana con riflessione | uniforme con saturazione al bordo (come Consilium) o polinomiale |
| Q2 | quota, stop loss, take profit | contati a parte, 0 o 3 geni secondo R4 | decisi ora |
| Q3 | genomi quasi uguali | solo hash esatto | in più una chiave «quasi uguale», o numeri su una griglia |
| Q4 | impronta delle decisioni | no | sì, con una simulazione in più per genoma |
| Q11 | scrittura dei numeri nell'hash | esadecimale | decimale, più leggibile, con una funzione da scrivere in Python |

**Che cosa non decide R3.** Le equazioni di decisione, l'isteresi, stop loss e take profit (R4), la fitness (R5), i dati di valutazione (R6). Dove la codifica dipende da R4 lo dice (capitolo 8); il rischio principale è che R4 aggiunga alla regola un termine che rompe la scala comune: allora la soglia larga 2 non basta più e servono 16 geni.

## 1. Che cosa c'è già e notazione

Il catalogo spiega che cosa sono ingresso, parametro e gene ([«Ingresso, parametro, gene»](../genome-indicators-catalog/#ingresso-parametro-gene)), il punteggio con soglie ([«Il punteggio lineare con soglie»](../genome-indicators-catalog/#il-punteggio-lineare-con-soglie)), la media esponenziale e la sua età media (sezione 2.2), la regola per cui un ingresso con denominatore nullo salta l'aggiornamento (sezione 3.3) e le formule dei 7 ingressi (schede N1, RSI, N9 con la variante N10, N14, N16, N17). La [guida alle forme di genoma](../genome-forms-guide/) spiega incrocio e mutazione con i numeri (sezioni 2.4.3 e 2.4.4). Qui non si ripetono.

**Notazione.** Gli ingressi, nell'ordine fisso della codifica:

| # | Ingresso | Formula (catalogo) |
|---|---|---|
| 1 | distanza dalla EMA veloce | `x1 = ln(C / EMA(C; c1))` |
| 2 | distanza dalla EMA lenta | `x2 = ln(C / EMA(C; c2))` |
| 3 | RSI centrato | `x3 = EMA0(dC; c3) / EMA0(abs(dC); c3)` |
| 4 | distanza dal massimo che dimentica | `x4 = C / m - 1`, `m = max(H, m * (1 - c4) + C * c4)` |
| 5 | posizione della chiusura nella giornata, in EMA | `x5 = EMA(clv; c5)` |
| 6 | logaritmo del volume relativo | `x6 = ln(V / EMA(V; c6))` |
| 7 | OBV normalizzato | `x7 = EMA0(sgn(dC) * V) / EMA0(V; c7)` |

`C`, `H`, `V` sono chiusura, massimo e volume del giorno; `EMA0` è una media avviata da zero. Il massimo che dimentica (N10) non era nel codice di R2: è implementato in `ref/indicators.mjs`, controllato contro una formula diretta (scarto relativo massimo 1,5e-13) e riproduce la tabella D4 del catalogo su tutti i 13 giorni.

**Età media.** Una EMA con coefficiente `c` contiene dati vecchi in media `(1 - c)/c` barre (catalogo, sezione 2.2). Il gene proposto è il suo logaritmo:

```
tau = ln((1 - c) / c)          eta' media = e^tau barre
c   = 1 / (1 + e^tau)          (forma stabile per tau >= 0:
                                c = e^-tau / (1 + e^-tau))
```

Esempio: `c` = 0,2 ha età media 4 barre e `τ` = ln 4 = 1,3863; `c` = 0,5 ha età media 1 e `τ` = 0.

## 2. I geni

### 2.1 La tabella dei geni

Una riga per gene, nell'ordine in cui si scrivono. «E1» è il genoma d'esempio del capitolo 9. Tutti i geni sono continui (numeri reali); nessuno è intero.

| # | Gene | Significato | Intervallo proposto | Origine dell'intervallo | E1 | Vincoli |
|---|---|---|---|---|---|---|
| 1 | `w1` | peso della distanza veloce | [-250, 250] | W = 5 / scala tipica, `[ipotesi]` (3.2) | 25 | V4 |
| 2 | `w2` | peso della distanza lenta | [-250, 250] | come sopra | 10 | V4 |
| 3 | `w3` | peso dell'RSI centrato | [-22, 22] | come sopra | 0,5 | V4 |
| 4 | `w4` | peso della distanza dal massimo | [-260, 260] | come sopra | 5 | V4 |
| 5 | `w5` | peso della chiusura nella giornata | [-42, 42] | come sopra | 1 | V4 |
| 6 | `w6` | peso del volume relativo | [-23, 23] | come sopra | 1 | V4 |
| 7 | `w7` | peso dell'OBV normalizzato | [-25, 25] | come sopra | 0,5 | V4 |
| 8 | `b` | centro delle soglie (alta `b + 1`, bassa `b - 1`) | [-5, 5], oppure [-1, 1] con Q1 (b) | `[ipotesi]` | 0 | V4 |
| 9 | `τ1` | memoria della EMA veloce | [ln 0,5; ln 100] | `[ipotesi]` (3.2) | 0 | V1, V2 |
| 10 | `τ2` | memoria della EMA lenta | [ln 0,5; ln 100] | come sopra | 1,3863 | V1, V2 |
| 11 | `τ3` | memoria dell'RSI | [ln 0,5; ln 100] | come sopra | 1,3863 | V1 |
| 12 | `τ4` | memoria del massimo che dimentica | [ln 0,5; ln 100] | come sopra | 2,1972 | V1 |
| 13 | `τ5` | memoria della chiusura nella giornata | [ln 0,5; ln 100] | come sopra | 1,3863 | V1 |
| 14 | `τ6` | memoria del volume medio | [ln 0,5; ln 100] | come sopra | 1,3863 | V1 |
| 15 | `τ7` | memoria dell'OBV normalizzato | [ln 0,5; ln 100] | come sopra | 1,3863 | V1 |

**Unità.** I pesi sono in «semi-ampiezze per unità di ingresso»: un contributo `w_i * x_i` = 1 sposta il punteggio di metà della zona di attesa. `b` è nella stessa unità. I `τ` sono adimensionali; `e^τ` è in barre (giorni di borsa). In termini di `c`, ln 0,5 corrisponde a `c` = 0,6667 e ln 100 a `c` = 0,0099.

### 2.2 Il conteggio

- **Catalogo: 16 numeri** (7 pesi, 2 soglie, 7 `c`; capitolo 6 del catalogo con D3 b e D4 b). Il riconteggio conferma 16 nella forma con due soglie: il massimo che dimentica ha un solo `c` continuo e nessun ingresso ha un secondo parametro.
- **Forma proposta: 15.** Pesi e soglie moltiplicati per la stessa costante positiva danno le stesse decisioni (simmetria S1, capitolo 6), quindi uno dei 16 numeri non cambia il comportamento: fissare la distanza tra le soglie lo toglie. I gradi di libertà del comportamento sono **al più** 15: sono esattamente 15 solo se i 7 ingressi non hanno combinazioni lineari esatte tra loro e le soglie cadono dove il punteggio arriva, cose non dimostrate `[ipotesi]`.
- **Numeri del `Trader`.** Il motore costruisce il `Trader` con quota investita (`buyPercent`), stop loss e take profit (`src/engine/strategy.js`, righe 36-37). Non sono nei 16 del catalogo: se R4 li fa evolvere i geni sono **18**, se li fissa restano costanti fuori dal genoma (domanda Q2).
- **Altre scelte di R4** (capitolo 8: isteresi, agitazione, avvio) possono aggiungere da 0 a circa 5 geni oltre ai 3 del `Trader`: totale tra 15 e circa 24 con le due soglie libere `[ipotesi]`.
- **Genoma attuale (macchina a stati).** `FIXED_GENOME` in `src/engine/genome.js` (righe 13-35) ha 11 numeri reali (4 coefficienti dei filtri, 4 margini, quota investita, stop loss, take profit) più una struttura discreta: 9 stati, 36 transizioni, 135 identificativi di condizione e 1 azione (contati da `ref/facts.mjs`). Le liste di condizioni cambiano lunghezza con la mutazione. Il confronto onesto è quindi «15 numeri reali a lunghezza fissa» contro «11 numeri reali più circa 170 valori discreti a lunghezza variabile».

### 2.3 Un ingresso con peso nullo

Non c'è un gene che spegne un ingresso (risposta di Luca). Se un peso vale esattamente 0, il suo ingresso non conta e il suo `τ` è **irrilevante**: due genomi che differiscono solo in quel `τ` decidono uguale (simmetria S4), e la forma canonica sostituisce quel `τ` con `null`. Un peso piccolo ma non nullo **non** rende il `τ` irrilevante: in un giorno con l'ingresso grande può ancora spostare una decisione, e la forma canonica non lo tratta come nullo. Con la mutazione proposta un peso esattamente nullo nasce solo per costruzione (un genoma iniziale scritto a mano), non per caso.

## 3. I vincoli di validità

### 3.1 Elenco e strategie

Un **vincolo di validità** è una condizione senza la quale il genoma non si può valutare, o è ambiguo. Un vincolo si può far rispettare in tre modi: **riparazione** (si corregge il figlio), **rifiuto** (si scarta e si ritenta con nuove estrazioni casuali), **riparametrizzazione** (si scrive il gene in una forma che non può violarlo).

| Vincolo | Che cosa dice | Perché | Strategia proposta | Alternativa |
|---|---|---|---|---|
| V1 | ogni `τ_i` nel suo intervallo | `c` = 1 annulla le due distanze e il volume relativo (ingresso sempre 0) e `genome.js` rifiuta `c` ≥ 1 (riga 86); `c` molto piccolo allunga l'avvio | riflessione al bordo | saturazione al bordo (clamp), rifiuto |
| V2 | `τ2 - τ1 ≥ δ`, con δ = ln 2 (Q7) | distingue la veloce dalla lenta (simmetria S2) e tiene lontane velocità quasi uguali (S3) | scambio delle due distanze se `τ1 > τ2`; rifiuto se manca il margine | riparametrizzare `τ2 = τ1 + e^η` (scartata, 4.3) |
| V3 | soglia bassa sotto la alta | altrimenti le zone di `buy` e `sell` si sovrappongono | impossibile da violare: le soglie sono `b ± 1` | con due soglie libere: scambio delle soglie (cambia il comportamento) o rifiuto |
| V4 | ogni gene è un numero finito | un `NaN` rende ogni confronto falso, quindi sempre `hold` (catalogo 3.3) | controllo prima della valutazione e dell'hash, come `assertFinite` in `genome.js` (righe 40-42) | nessuna |
| Vw, Vb | pesi e `b` nei loro intervalli | tengono i passi di mutazione proporzionati | riflessione | saturazione |
| V5 | numeri che R4 aggiungerà (ad es. stop loss positivo) | dipendono da R4 | da fissare in R4 | - |

La riflessione rimette dentro di tanto quanto il gene è uscito: con intervallo [0; 10] il valore 10,3 diventa 9,7. Si applica **solo** ai valori fuori dall'intervallo: applicata a un valore interno, la formula può cambiarne l'ultima cifra binaria (lo script l'ha mostrato durante la scrittura).

**Domanda Q7 — margine tra le due velocità.** (a) δ = ln 2: la memoria lenta è almeno il doppio della veloce (proposta). (b) δ = 0: basta che la lenta sia più lenta, anche di pochissimo. (c) Un altro rapporto minimo, per esempio 1,25 o 4. *Criterio:* con un margine piccolo le due distanze possono diventare quasi lo stesso ingresso e i loro due pesi si compensano (alzarne uno e abbassare l'altro dà quasi lo stesso punteggio); con un margine grande si vietano coppie di velocità vicine. *Effetto:* nessun gene in più; cambia solo il controllo di V2; con (b) servono comunque il rifiuto per l'uguaglianza esatta e un ordine deterministico nella forma canonica.

### 3.2 Gli intervalli e da dove vengono

**Memoria.** L'età media va da 0,5 a 100 barre `[ipotesi]`. Il limite basso tiene `c` lontano da 1, dove le due distanze e il volume relativo valgono sempre 0; il limite alto viene dall'**avvio**, il numero di barre prima che il valore iniziale della media pesi meno del 5 %: 3 barre a età media 0,5, 29 a età media 9, **302** a età media 100. Due genomi con memorie diverse hanno avvii diversi, e R6 dovrà fissare un avvio comune escluso dalla valutazione (catalogo, capitolo 6): il limite alto di `τ` dipende da quel numero. Gli intervalli di Consilium non sono una fonte: il genoma fisso di SwarmTrader ne è fuori (per esempio `iir_price_2` = 0,99 contro un massimo di 0,5 in `individual.js`, righe 195-237).

**Pesi.** W_i = 5 / q_i, dove q_i è il valore assoluto mediano dell'ingresso sulla serie sintetica di R2 (passeggiata aleatoria, seme 20261018, 3000 barre), a età media 7,07, arrotondato a due cifre `[ipotesi]`: con W_i un ingresso «tipico» sposta il punteggio fino a 5 semi-ampiezze. Nessun dato ENI entra in questa scelta.

| # | Ingresso | q a eta' media 0,5 | q a eta' media 7,07 | q a eta' media 100 | W = 5/q (2 cifre) |
|---|---|---|---|---|---|
| 1 | distanza EMA veloce | 0,0040 | 0,0200 | 0,1046 | 250 |
| 2 | distanza EMA lenta | 0,0040 | 0,0200 | 0,1046 | 250 |
| 3 | RSI centrato | 0,7538 | 0,2254 | 0,0788 | 22 |
| 4 | distanza dal massimo che dimentica | 0,0090 | 0,0192 | 0,0680 | 260 |
| 5 | chiusura nella giornata (EMA) | 0,3986 | 0,1179 | 0,0359 | 42 |
| 6 | log volume relativo | 0,0755 | 0,2193 | 0,2743 | 23 |
| 7 | OBV normalizzato | 0,6871 | 0,2004 | 0,0757 | 25 |

**Un limite che resta.** La scala delle distanze cambia di circa 26 volte tra le due estremità di `τ` (0,0040 contro 0,1046): lo stesso passo su `w1` sposta poco il punteggio con memoria corta e molto con memoria lunga (catalogo, sezione 5.3). La codifica non lo corregge; i rimedi (dividere l'ingresso per l'agitazione, o legare il passo del peso al `τ`) cambiano un ingresso o legano due geni, e sono scelte di R2 o R4 `[ipotesi]`.

**Domanda Q8 — intervalli dei geni.** (a) Età media tra 0,5 e 100 barre per tutti e 7 gli ingressi, W_i della tabella, `b` secondo Q1 (proposta). (b) Limiti diversi per ingresso, o il limite alto di `τ` fissato dall'avvio massimo di R6. *Criterio:* (a) se basta un intervallo largo e uguale per tutti, da rivedere quando R6 fisserà l'avvio; (b) se vuoi già ora memorie diverse per ingressi diversi (per esempio il volume più corto). *Effetto:* stessi geni; cambiano solo le costanti dello schema (e la sua versione). Le due distanze devono avere **lo stesso** intervallo di `τ`, altrimenti lo scambio di V2 può portare un gene fuori dal suo.

**Domanda Q1 — segno delle soglie.** (a) `b` tra -5 e 5: con ingressi tutti neutri (punteggio 0) la strategia può comprare (se `b` < -1) o vendere (se `b` > 1) (proposta). (b) `b` tra -1 e 1: punteggio 0 dà sempre `hold`. *Criterio:* (a) se vuoi permettere strategie che comprano o vendono «per default» quando gli ingressi non dicono nulla; (b) se preferisci che senza segnali non si faccia nulla. *Effetto:* stesso numero di geni; con (b) i genomi con tutti i pesi nulli sono una sola classe (sempre `hold`) invece di tre.

## 4. Tre modi di scrivere soglie e memoria

### 4.1 Le opzioni

| Opzione | Geni | Vincoli da gestire | Forma canonica | Hash |
|---|---|---|---|---|
| **C con centro `b`** (proposta: Q5 a, Q6 a) | 15 | V1 e V2 sui `τ`; V3 impossibile | quasi il genoma stesso (restano S2, S4, S5) | sui geni |
| C con due soglie libere, senza rinormalizzare (Q5 b) | 16 | V1, V2, V3 | divisione per la semi-ampiezza `h`, poi come sopra | stesso testo canonico della proposta |
| C con due soglie, rinormalizzate prima dell'incrocio (Q5 c) | 16 in memoria, 15 utili | V1, V2, V3 | come Q5 b | come Q5 b |
| A: geni come si leggono, `c` invece di `τ` (Q6 b) | 15 o 16 | V1 su `c`, V2, V3 | come sopra, con `c` | testo diverso (schema diverso) |
| B: pesi e soglie come direzione di lunghezza 1 | 16 in memoria, 15 utili | proiezione dopo ogni operatore | quasi il genoma | sui geni |

**B è scartata** come codifica: dopo ogni operatore il vettore dei pesi va riportato a lunghezza 1, e la proiezione cambia tutti i pesi quando ne cambia uno; i numeri non si leggono più come pesi; il vantaggio (togliere la scala comune) lo dà già il centro `b` con una sola divisione. La variante di B con soglia alta fissata a 1 e bassa negativa descrive gli stessi comportamenti della proposta con Q1 (b), in un'altra scala.

### 4.2 Perché la scala comune non è innocua

Con due soglie libere (Q5 b) moltiplicare tutto per `k` > 0 non cambia le decisioni, ma cambia **l'effetto degli operatori**: un passo di mutazione fisso su un peso è un cambiamento relativo piccolo su un genoma «grande» e grande su uno «piccolo», e un incrocio tra due genitori equivalenti a scale diverse mescola numeri incoerenti. La scala diventa un passo di mutazione nascosto. Rinormalizzare ogni genitore prima dell'incrocio (Q5 c) non è neutro: ogni genitore è diviso per il proprio fattore, e gli incroci usuali dipendono dalla scala di ciascun genitore. In prova (`ref/check-ops.mjs`, fattori potenze di 2 per evitare arrotondamenti) scalare entrambi i genitori per lo stesso fattore non cambia mai la forma canonica del figlio, scalare solo il secondo la cambia in 16247 casi su 16326 con l'incrocio uniforme, in 20000 su 20000 con quello intermedio e in 14607 su 14607 con BLX-0,5. Con il centro `b` e semi-ampiezza fissata a 1 il problema non esiste: tutti i genomi sono alla stessa scala.

Il passaggio da due soglie alla forma proposta è `h = (θ_alta - θ_bassa)/2`, `b = ((θ_alta + θ_bassa)/2)/h`, `w_i = w_i / h`. Vale solo se R4 lascia la regola **omogenea** in pesi e soglie (capitolo 8).

**Domanda Q5 — soglie e scala comune.** (a) Centro `b` con le soglie a `b ± 1`: 15 geni, V3 per costruzione, nessuna scala da gestire (proposta). (b) Due soglie libere, nessuna rinormalizzazione: 16 geni, la scala resta un passo di mutazione implicito, voluto. (c) Due soglie libere, ogni genitore rinormalizzato a `h` = 1 prima dell'incrocio: 16 geni in memoria, 15 utili. *Criterio:* (a) se R4 resterà una regola omogenea; (b) o (c) se vuoi leggere le soglie direttamente come numeri del catalogo o se R4 introdurrà un termine non omogeneo (per esempio un'isteresi in unità fisse). *Effetto:* con (b) e (c) servono V3 (rifiuto se le soglie coincidono) e la divisione per `h` nella forma canonica; l'hash è lo stesso testo della proposta.

### 4.3 Il gene della memoria: `τ` o `c`

Con `c` come gene e un passo fisso (Consilium: ±0,05 e saturazione in [0,01; 1], `individual_v2.js`, righe 203-214), lo stesso passo vale cose diverse: da `c` = 0,99 a 0,94 l'età media passa da 0,0101 a 0,0638 barre, da 0,10 a 0,05 passa da 9 a 19. Con `τ` un passo moltiplica o divide l'età media sempre per lo stesso fattore: con il passo proposto un passo di ampiezza σ la moltiplica per 1,303. È la mutazione log-normale delle strategie evolutive, applicata all'età media [2]. Inoltre la saturazione di Consilium ammette `c` = 1 (0,99 + 0,04 diventa 1), che `genome.js` rifiuta.

`τ` «per costruzione» non basta: in virgola mobile `1/(1 + e^τ)` vale esattamente 1 già da `τ` = -36,7369 e `e^τ` va in overflow sopra 709,7827 (in Python solleva un errore invece di dare 0). Servono quindi i limiti di V1, ben dentro questi valori, e la forma stabile della formula. La variante `τ2 = τ1 + e^η` (lenta legata alla veloce) è **scartata**: con i limiti di V1 il vincolo torna accoppiato, e un incrocio che cambia `τ1` sposterebbe anche la lenta.

**Domanda Q6 — gene della memoria.** (a) `τ` = logaritmo dell'età media, con riflessione nei limiti (proposta). (b) `c` direttamente, con riflessione in [c_min, c_max] e passo lineare. *Criterio:* (a) se vuoi che un passo di mutazione cambi la memoria della stessa proporzione a ogni scala; (b) se preferisci leggere nel genoma gli stessi `c` del catalogo e di Consilium. *Effetto:* stessi geni e stessi vincoli; il testo canonico contiene `τ` in (a) e `c` in (b), quindi i due schemi hanno hash diversi per lo stesso comportamento e non vanno mescolati.

## 5. Gli operatori

### 5.1 Pseudocodice

Il genoma è un vettore di 15 numeri `g[1..15]` = `w1..w7, b, τ1..τ7`; `lo[j]`, `hi[j]` sono i limiti del gene `j`. `u()` è un numero casuale uniforme in [0, 1), `N()` una gaussiana standard. Il generatore degli script è mulberry32 con seme dichiarato (lo stesso di R2); gli esempi del capitolo 9 scrivono le estrazioni, quindi non dipendono dal generatore.

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

Il passo è σ = 0,05 × ampiezza dell'intervallo `[ipotesi]`, come l'ampiezza del passo di `individual.js` di Consilium (±5 %, righe 271-275), ma gaussiano invece che uniforme. Per `τ` vale 0,2649. La probabilità `pm`, la dimensione della popolazione e la selezione sono parametri di E3.

### 5.2 Perché producono solo genomi validi

- **Inizializzazione:** ogni gene nasce nel suo intervallo; lo scambio tiene i `τ` nell'intervallo comune; il rifiuto garantisce il margine.
- **Incrocio per blocchi:** tutti i vincoli stanno dentro un blocco (V2 lega solo `τ1` e `τ2`, che viaggiano insieme), e ogni blocco è copiato bit per bit da un genitore valido. Il figlio è valido senza riparazioni.
- **Mutazione:** la riflessione tiene ogni gene nel suo intervallo (il `min`/`max` finale corregge solo un eventuale arrotondamento); lo scambio non esce dall'intervallo perché le due distanze hanno lo stesso; il margine si controlla alla fine; dopo 20 tentativi falliti resta il genitore, che è valido.

Prova su molte estrazioni (`ref/check-ops.mjs`, seme 4711; genitori metà casuali e metà sui bordi, con le due velocità esattamente al margine):

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

**Saturazione contro riflessione.** In una passeggiata senza selezione (10000 geni, 2000 generazioni, probabilità di mutazione 0,1; `ref/check-ops.mjs`), la saturazione di `individual_v2.js` lascia il 3,92 % dei `c` esattamente su un bordo, l'1,85 % esattamente a `c` = 1; la riflessione su `τ` lo 0,00 %. È un fatto sugli operatori senza selezione, non una previsione sull'evoluzione; una distorsione della ricerca dovuta alla gestione dei bordi è descritta in letteratura per un altro algoritmo [6, solo abstract].

**Consilium non riconosce i duplicati:** `ga_v2.js` salva ogni figlio con `Genoma.create` (righe 330-336). `db/orm.js` gestisce un errore di unicità sul testo del genoma (`SaveGenoma`, righe 454-504), ma nelle basi dati lette dalla revisione il vincolo `UNIQUE` c'è solo in un file vecchio (`db/database.sqlite`), e `SaveGenoma` è usata solo da script manuali.

**Domanda Q9 — incrocio.** (a) Per blocchi, con le due distanze nello stesso blocco (proposta). (b) Uniforme gene per gene, come Consilium, seguito da scambio e rifiuto. (c) Intermedio con un solo α, seguito da riporto nell'intervallo e rifiuto. *Criterio:* (a) se vuoi che ogni peso resti con la sua memoria (la scala di una distanza dipende dal suo `τ`, catalogo 5.3) e nessun figlio vada riparato; (b) se vuoi restare vicino al codice di Consilium; (c) se vuoi figli «a metà strada» tra i genitori, sapendo che una media restringe la popolazione verso il centro. *Effetto:* stessi geni e stessa forma canonica; cambiano solo i figli prodotti e la quota di rifiuti.

**Domanda Q10 — mutazione.** (a) Gaussiana con passo pari al 5 % dell'intervallo e riflessione (proposta). (b) Uniforme ±5 % con saturazione al bordo, come `individual.js`. (c) Polinomiale limitata. *Criterio:* (a) se vuoi passi per lo più piccoli con qualche passo grande e nessun accumulo sui bordi; (b) se vuoi la stessa regola di Consilium, accettando l'accumulo; (c) se vuoi una distribuzione che resta nei limiti senza riflessione. *Effetto:* stessi geni; nessun effetto sull'hash.

## 6. Le simmetrie

Una **simmetria** è una trasformazione dei geni che lascia uguali **tutte** le decisioni su **ogni** serie di barre ammessa dal validatore (`low > 0`, volume ≥ 0; `src/engine/dataTrainer.js`, riga 34). Con la regola di salto del catalogo e `low > 0` i 7 ingressi sono sempre finiti: è la condizione che S4 e S5 richiedono (controllato su 200 genomi casuali su tutte le barre delle tre serie: 0 valori non finiti).

**S1 — scala comune** (solo con due soglie libere, Q5 b e c). Moltiplicare pesi e soglie per `k` > 0 non cambia nessuna decisione, perché `s > θ` equivale a `k s > k θ`; vale anche nei pareggi (`s = θ` resta pareggio). Con `k` < 0 non è una simmetria: le disuguaglianze si invertono e `buy` e `sell` si scambiano. In virgola mobile S1 è **esatta** se `k` è una potenza di 2 e nessun prodotto, somma o soglia scalata va in overflow o nella zona dei numeri subnormali; con `k` = 2^-1000 un esempio costruito passa da `buy` a `hold`. Per gli altri `k` i numeri `k * w` sono arrotondati e la forma canonica di `k g` in genere differisce da quella di `g`:

| k | barre confrontate | decisioni diverse tra r e k r | decisioni diverse tra r e la sua forma A1 | hash diversi su 200 genomi |
|---|---|---|---|---|
| 2 | 1107400 | 0 | 0 | 0 |
| 3 | 1107400 | 0 | 0 | 194 |
| 8 | 1107400 | 0 | 0 | 0 |
| 0,5 | 1107400 | 0 | 0 | 0 |
| 2^-20 | 1107400 | 0 | 0 | 0 |
| 0,7 | 1107400 | 0 | 0 | 196 |
| casuale | 1107400 | 0 | 0 | da 197 a 199 |

La tabella somma il dataset inventato, la serie sintetica (3000 barre) ed ENI (sola lettura), per 200 genomi casuali `r` a 16 numeri (`ref/check-symmetry.mjs`, seme 31337); «forma A1» è il genoma diviso per `h`, cioè la proposta. Sulle serie reali nessuna decisione cambia, ma un caso costruito con la soglia messa esattamente sul punteggio cambia decisione 44132 volte su 200000 con `k` = 3 e 0 volte con `k` = 8. Gli equivalenti con `k` qualsiasi non nascono comunque durante l'evoluzione: nessun operatore proposto moltiplica un genoma per una costante (la sola eccezione è la rinormalizzazione di Q5 c).

**S2 — scambio veloce-lenta.** Scambiare `(w1, τ1)` con `(w2, τ2)` dà lo stesso punteggio, perché `x1` e `x2` sono la stessa formula con lo stesso avvio. È il caso più piccolo del problema delle «convenzioni in competizione» noto nella neuroevoluzione: la stessa soluzione scritta in due ordini diversi, che l'incrocio mescola male [5]. È esatta nei bit **solo se le due distanze sono i primi due addendi** della somma, `s = ((0 + w1 x1) + w2 x2) + …`: su ENI 0 punteggi diversi su 503400, mentre scambiare il secondo e il settimo addendo cambia l'ultima cifra in 279871 casi. Il decodificatore fissa quindi l'ordine della somma. V2 sceglie il rappresentante (veloce per prima).

**S3 — velocità uguali.** Con `τ1 = τ2` contano solo `w1 + w2`: una retta di genomi equivalenti. Il margine di V2 la esclude; velocità vicine danno genomi **quasi** equivalenti, che la forma canonica non riconosce.

**S4 — peso nullo.** Con `w_i = 0` il `τ_i` non conta: `0 * x = ±0` e `s + (±0) = s` esattamente, se `x_i` è finito (`0 * NaN = NaN`) ed è usato solo nella somma. Su ENI, 50 genomi × 7 ingressi con `τ_i` cambiato: 0 punteggi diversi su 880950. Con S2 insieme: se una sola delle due distanze ha peso non nullo, è indifferente in quale posizione stia (0 punteggi diversi su 125850).

**S5 — tutti i pesi nulli.** Il punteggio è sempre 0 e la decisione è costante: `buy` se `b` < -1, `sell` se `b` > 1, `hold` se -1 ≤ `b` ≤ 1, confini compresi (controllato con `b` = ±1 e con i numeri immediatamente oltre). Il segno di `b + 1` e `b - 1` è esatto in virgola mobile, quindi le tre classi sono esatte.

**S6 — numeri del `Trader` inutili** (solo se R4 li fa evolvere): un genoma che non compra mai ha quota, stop loss e take profit irrilevanti.

**Non riconosciute** (genomi che decidono uguale senza che la forma canonica lo sappia): soglie fuori dal campo che il punteggio raggiunge (alcuni ingressi sono limitati, per esempio l'RSI centrato tra -1 e 1, la distanza dal massimo ≤ 0); genomi che decidono uguale solo sui dati osservati; differenze che contano solo durante l'avvio; ingressi quasi uguali (velocità vicine); combinazioni lineari esatte tra i 7 ingressi, che la regola C2 del catalogo esclude per le identità note ma che non sono escluse in generale `[ipotesi]`.

## 7. Forma canonica, testo canonico e hash

### 7.1 La regola

La forma canonica serve **solo all'hash**: non cambia il genoma che evolve (lo scambio S2 nel genoma è già fatto dagli operatori).

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

Con le due soglie libere (Q5 b, c) si divide prima per `h` (4.2): la forma canonica è la stessa della proposta, e due genomi a 16 numeri che differiscono per un fattore potenza di 2 hanno lo stesso hash. La divisione arrotonda: se il punteggio cade entro l'arrotondamento da una soglia, il genoma a 16 numeri e la sua forma divisa possono decidere diversamente (sulle tre serie del capitolo 6 non è mai successo). Non c'è **quantizzazione** (arrotondamento dei numeri a una precisione fissa): l'hash riconosce solo le equivalenze dimostrate (domanda Q3).

### 7.2 Il testo canonico

Ogni numero si scrive come **16 cifre esadecimali minuscole** della sua rappresentazione binary64 (IEEE 754, i 64 bit del numero in virgola mobile) in ordine big-endian, dopo aver trasformato -0 in 0. Il testo è un oggetto JSON con le chiavi in quest'ordine e nessuno spazio:

```
{"b":"<b>","decoder":"lin7-dec-v1","schema":"lin7-a1-v1",
"tau":[<7 voci: "<tau_i>" oppure null>],"w":["<w_1>",...,"<w_7>"]}
```

`schema` dice che cosa sono i geni (15 geni, `τ` = logaritmo dell'età media, soglie `b ± 1`); `decoder` dice come i geni diventano decisioni (formule degli ingressi, regola di salto, ordine della somma, forma dei confronti `s > b + 1` e `s < b - 1`, costanti del `Trader` fuori dal genoma). Se cambia una delle due cose, cambia la versione, e genomi uguali con decodificatori diversi non risultano duplicati. L'hash è **SHA-256** [12] dei byte ASCII del testo, in esadecimale minuscolo. In Node: `DataView.setFloat64` e `node:crypto`; in Python: `struct.pack('>d', x).hex()` e `hashlib.sha256`. Si consiglia di conservare il testo canonico accanto all'hash, per poter controllare un'eventuale collisione `[ipotesi]`.

Il testo contiene solo stringhe, `null` e chiavi ASCII ordinate, quindi coincide con la forma canonica JSON di RFC 8785 [9] dello stesso oggetto. **Perché non i numeri decimali:** RFC 8785 scrive i numeri con l'algoritmo di ECMAScript [13, letto solo l'indice], e Python non li scrive allo stesso modo:

| numero | Node `JSON.stringify` | Python `json.dumps` |
|---|---|---|
| 1e-7 | 1e-7 | 1e-07 |
| 0.000001 | 0.000001 | 1e-06 |
| -0.0 | 0 | -0.0 |
| 9007199254740992 | 9007199254740992 | 9007199254740992.0 |
| 1.2345678901234568e20 | 123456789012345680000 | 1.2345678901234568e+20 |
| 0.1 | 0.1 | 0.1 |
| 2.5 | 2.5 | 2.5 |

Le cifre sono le stesse (entrambi scelgono la stringa più corta che ridà il numero [10]), la forma no. Anche gli arrotondamenti differiscono, un `NaN` passa senza errore (Node lo scrive `null`, Python `NaN`) e un overflow dà 0 in Node e un errore in Python:

| operazione | Node | Python |
|---|---|---|
| 1,25 a 2 cifre | 1.3 | 1.2e+00 |
| 2,5 a 1 cifra | 3 | 2e+00 |
| arrotondamento di 2,5 all'intero | 3 | 2 |
| NaN in JSON | null | NaN |
| 1/(1+e^710) | 0 | OverflowError |

**Domanda Q11 — scrittura dei numeri.** (a) Esadecimale binary64 (proposta). (b) Decimale secondo RFC 8785, con una funzione Python scritta apposta (esistono implementazioni di JCS in più linguaggi [11], non provate qui) e vettori di prova. *Criterio:* (a) se il testo canonico serve alle macchine; (b) se vuoi poterlo leggere a occhio. *Effetto:* hash diversi tra le due scelte per lo stesso genoma; con (b) un errore nella funzione Python dà hash diversi tra linguaggi senza alcun messaggio.

### 7.3 Vettori di prova

Ogni vettore dà i geni (come letterali decimali che Node e Python leggono nello stesso numero binario), il testo canonico (qui spezzato dopo una virgola per l'impaginazione: il testo vero è una riga sola) e l'hash. V3 contiene i casi delicati: un peso -0, un numero subnormale (5e-324), 1e-7, pareggi decimali (1,25 e 2,5), `τ` sui due bordi e le due velocità esattamente al margine.

**V1** = genoma E1 (capitolo 9).

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

**V2** = tutti i pesi nulli, `b` = 0,3, `τ` di E1 (classe `hold`).

```
{"b":"0000000000000000","decoder":"lin7-dec-v1",
"schema":"lin7-a1-v1","tau":[null,null,null,null,null,null,null],
"w":["0000000000000000","0000000000000000","0000000000000000",
"0000000000000000","0000000000000000","0000000000000000",
"0000000000000000"]}
```

SHA-256: `dce8550be5440a988891282a954bbdd489cea70d91feed5506bc68e67d1b33e8`

**V3** = `w` = [1.25, -0, 2.5, 1e-7, 5e-324, -22, 0.1], `b` = 2.5, `τ` = [-0.6931471805599453, 0, 4.605170185988092, 1.25, 2.5, 1e-7, 0.1].

```
{"b":"4004000000000000","decoder":"lin7-dec-v1",
"schema":"lin7-a1-v1","tau":["bfe62e42fefa39ef",null,
"40126bb1bbb55516","3ff4000000000000","4004000000000000",
"3e7ad7f29abcaf48","3fb999999999999a"],"w":["3ff4000000000000",
"0000000000000000","4004000000000000","3e7ad7f29abcaf48",
"0000000000000001","c036000000000000","3fb999999999999a"]}
```

SHA-256: `32e58bc1ca99c93042f0d886551a8508aac2bddbf1ee377e8b7945cbb97e860f`

La tabella dà la scrittura esadecimale dei numeri usati; i due limiti di `τ` sono scritti come letterali decimali, non ricalcolati con `ln`, perché la funzione logaritmo può differire nell'ultima cifra tra linguaggi.

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
- **Non unisce genomi quasi uguali:** due genomi che differiscono nell'ultima cifra binaria di un peso hanno hash diversi anche se decidono uguale su tutti i dati provati (esempio E5).
- **Segnala, non elimina:** due genomi con lo stesso hash sono duplicati per comportamento; se tenerli, eliminarli o ridurne la pressione nella selezione è una scelta di E3 (#13).
- Le collisioni di SHA-256 non sono un rischio pratico; lo diventano se l'hash si accorcia per la visualizzazione (con 8 cifre esadecimali, cioè 32 bit, la probabilità di almeno una collisione arriva al 50 % con circa 77163 genomi, per il «paradosso del compleanno»).

**Domanda Q3 — genomi quasi uguali.** (a) Solo hash esatto: sono duplicati soltanto genomi che decidono sempre allo stesso modo per una simmetria dimostrata (proposta). (b) Hash esatto più una **chiave di quasi-duplicato**: lo stesso testo con ogni numero arrotondato a 24 bit di mantissa (circa 7 cifre decimali), segnalata a parte. (c) Precisione nel genoma: ogni gene su una griglia di valori interi, con hash esatto ma un passo minimo per ogni gene. *Criterio:* (a) se ti basta sapere quali genomi sono certamente uguali; (b) se vuoi anche contare i genomi «praticamente» uguali, sapendo che la chiave unisce genomi che possono decidere diversamente e separa sempre qualche coppia a cavallo di un arrotondamento (esempio E5); (c) se preferisci un genoma a passi discreti. *Effetto:* (a) nessun numero in più; (b) una seconda impronta per genoma, con regola di arrotondamento al pari sui bit (uguale in ogni linguaggio); (c) cambiano tutti gli operatori (passi interi) e la conversione numero-griglia va specificata (in Node `Math.round(2.5)` = 3, in Python `round(2.5)` = 2).

**Domanda Q4 — impronta delle decisioni.** Un'**impronta di comportamento** è l'hash della sequenza di decisioni del genoma su un insieme di prova fisso e versionato, che non sono dati di valutazione (per esempio il dataset inventato seguito dalla serie sintetica di R2). (a) No (proposta). (b) Sì, accanto all'hash. *Criterio:* (b) se vuoi segnalare anche genomi che si comportano allo stesso modo senza una simmetria dimostrata, e avere un controllo automatico (stesso hash deve dare stessa impronta); (a) se una simulazione in più per genoma non vale questa informazione. *Effetto:* con (b) l'impronta dipende dall'insieme di prova e dal decodificatore (va versionata); in prova (`ref/fingerprint.mjs`) 600 coppie equivalenti hanno dato 0 incoerenze, 300 coppie di genomi casuali indipendenti 0 impronte uguali, ed E1 ed E5 hanno hash diversi ma la stessa impronta.

## 8. Dipendenze da R4

R4 (#8) sceglierà le equazioni di decisione. La tabella dice, per ogni sua scelta, che cosa cambia nella codifica; nessuna riga decide per R4. La regola generale: **ogni simmetria usata dalla forma canonica vale solo se R4 la conserva**, e R4 deve dire quali di S1-S6 sopravvivono. Se R4 rompe una simmetria e la forma canonica continua a usarla, l'hash unisce genomi **non** equivalenti, senza alcun errore.

| Scelta di R4 | Opzioni | Effetto sulla codifica |
|---|---|---|
| R4-1 quota investita, stop loss, take profit | costanti; geni | +0 o +3 geni; con geni servono intervalli (V5), passi propri e la simmetria S6; con costanti entrano nella versione del decodificatore |
| R4-2 omogeneità della regola | regola come oggi; isteresi o soglie in più proporzionali alla zona di attesa; termini fissi (isteresi in unità assolute, saturazione del punteggio, soglie costanti) | i primi due conservano S1 e la proposta a 15 geni; i termini fissi rompono S1: la semi-ampiezza torna gene (16) e la forma canonica non divide più |
| R4-3 agitazione (ATR normalizzato) | assente; divisore di un ingresso; fattore del punteggio | non rompe S1; +1 gene per il suo `τ` (più uno per un esponente); un divisore applicato a una sola delle due distanze rompe S2; con peso nullo dell'ingresso diviso anche il `τ` dell'ATR diventa irrilevante (S4 esteso) |
| R4-4 decisioni durante l'avvio | come oggi; regola fissa; gene | 0 o 1 gene (intero o costante); la regola entra nel decodificatore |
| R4-5 ingressi riusati fuori dalla somma (prodotti, «cancelli» di R7) | assenti; presenti | per quell'ingresso S4 non vale più; nuovi geni come righe della tabella |

**Domanda Q2 — numeri del `Trader`.** (a) Contarli a parte: la codifica ha 15 geni e R4 dirà se diventano 18 (proposta). (b) Deciderlo ora: sono geni, con intervalli da fissare. (c) Deciderlo ora: sono costanti. *Criterio:* (a) se vuoi lasciare la scelta a chi scrive le equazioni di decisione; (b) o (c) se hai già un'idea e preferisci che R4 parta da quella. *Effetto:* (b) +3 geni, V5, S6; (c) le costanti entrano nella versione del decodificatore.

## 9. Esempi lavorati

Tutti sul dataset inventato di 20 giorni (catalogo, sezione 1.5); numeri da `ref/examples.mjs`. I geni sono scritti con tutte le cifre, nel formato del codice.

### E1 — un genoma completo

Pesi e soglie del catalogo (sezione 7.5) divisi per `h` = 2 (soglie ±2 → `b` = 0), senza l'ATR (D3 b) e con il massimo che dimentica al posto della finestra di 10 giorni (D4 b); memorie dei «parametri dell'esempio» del catalogo.

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
E1.w   = [25, 10, 0.5, 5, 1, 1, 0.5]
E1.b   = 0
E1.tau = [0, 1.3862943611198906, 1.3862943611198906,
          2.1972245773362196, 1.3862943611198906,
          1.3862943611198906, 1.3862943611198906]
```

I `c` ricavati sono 0,5, 0,2 e, per il massimo che dimentica, 0,09999999999999998 (non esattamente 0,1, perché `τ` è scritto con 17 cifre). Giorno 12: ingressi -0,0228; -0,0287; -0,3804; -0,0662; -0,1736; 0,3104; -0,3533; contributi -0,57; -0,29; -0,19; -0,33; -0,17; 0,31; -0,18; punteggio -1,42, sotto la soglia bassa -1: `sell`.

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

11 `buy`, 5 `hold`, 4 `sell`: le decisioni coincidono giorno per giorno con quelle del catalogo (sezione 7.5), anche se due ingressi sono cambiati. Testo canonico e hash: vettore V1 (7.3).

### E2 — un incrocio

Secondo genitore P2 (valido):

```
P2.w   = [10, 30, 1, -5, 2, -1, 1]
P2.b   = 0.5
P2.tau = [1.2, 2.5, 1, 3, 2, 1.5, 2]
```

Estrazioni dei 7 blocchi (vero = da E1): distanze vero, RSI falso, massimo vero, chiusura falso, volume vero, OBV falso, `b` falso. Figlio F:

```
F.w   = [25, 10, 1, 5, 2, 1, 1]
F.b   = 0.5
F.tau = [0, 1.3862943611198906, 1, 2.1972245773362196, 2,
         1.3862943611198906, 2]
```

F è valido; decide 11 `buy`, 4 `hold`, 5 `sell`, diverso da E1 solo il giorno 11. Hash `2db4bfecf8a97d55030507c233762d31c3b0983a0b792369edb561fd56f1c113`. Con l'incrocio uniforme gene per gene, prendere solo `τ1` da P2 dà `τ1` = 1,2 e `τ2` = 1,3863: distanza 0,1863, sotto ln 2, quindi V2 violato e il figlio va rifiutato.

### E3 — una mutazione con vincoli violati

Genitore G3 (valido):

```
G3.w   = [40, -20, 3, 10, 5, -2, 4]
G3.b   = -0.5
G3.tau = [1, 1.8, 2, 2.5, -0.5, 1, 2]
```

Passi σ: 25 per `w1` e `w2`, 0,2649 per ogni `τ`. Estrazioni gaussiane scelte a mano per mostrare i casi (i geni non nominati non mutano):

- **Tentativo 1:** z(`τ1`) = 2,0; z(`τ2`) = -1,5. Risulta `τ1` = 1,5298 e `τ2` = 1,4026: la veloce supera la lenta, quindi si scambiano le due distanze; dopo lo scambio la distanza tra le velocità è 0,1272, sotto ln 2: **tentativo rifiutato**.
- **Tentativo 2:** z(`w1`) = 0,4; z(`τ1`) = 3,0; z(`τ2`) = -3,0; z(`τ5`) = -2,0. `w1` = 40 + 25 × 0,4 = 50; `τ1` = 1,7947 e `τ2` = 1,0053 si scambiano (con i loro pesi); `τ5` = -1,0298 è sotto ln 0,5 e la riflessione lo porta a -0,3565. Il margine c'è: **accettato**.

```
M.w   = [-20, 50, 3, 10, 5, -2, 4]
M.b   = -0.5
M.tau = [1.0052523950177945, 1.7947476049822058, 2, 2.5,
         -0.35646262446508625, 1, 2]
```

Hash `4b8221f02faf7638be415aa9e4f20bd5f606aef3f3097515221a384c183bbc28`.

### E4 — genomi equivalenti con lo stesso hash

- **S1 con due soglie libere.** R1 = pesi del catalogo [50, 20, 1, 10, 2, 2, 1], soglie 2 e -2, `τ` di E1. Diviso per `h` = 2 dà esattamente E1: stesso hash. Moltiplicato per 2 o per 3, stesso hash: qui anche `k` = 3 è esatto, perché i numeri sono interi piccoli (gli esempi scritti a mano sono più «facili» dei genomi veri).
- **S1 con numeri non tondi.** Genoma Q a 16 numeri (dall'inizializzazione con seme 12, pesi e soglie moltiplicati per 0,7):

```
Q.w   = [-74.14718025829643, -148.51637189276516,
         2.468960847984999, 160.6552002830431,
         -20.417030546441673, -15.659252580255268,
         6.860132756410167]
Q.ta  = 1.680912196682766
Q.tb  = 0.28091219668276607
Q.tau = [2.246408197415068, 3.208899713582597,
         -0.5318671493286484, 4.224070267863481,
         1.036440393469206, 2.0369846456317124,
         3.2791114713288794]
```

  Q ha hash `ace0e266343fc73dc81f1ffdbe083013522fe6e1fa64eaafeb5c3272241d3973`; 2Q ha lo stesso hash; 3Q no, perché 6 degli 8 numeri della forma divisa per `h` differiscono nell'ultima cifra binaria. Q e 3Q decidono uguale su tutti i 20 giorni (1 `buy`, 19 `sell`).
- **S2.** E1 con le coppie veloce-lenta scambiate viola V2 ma ha lo stesso hash di E1 e punteggi uguali nei bit.
- **S4.** E1 con `w7` = 0 e `τ7` = ln 4, e con `w7` = -0 e `τ7` = 3: stesso hash (`d5844680cedf1c2293e3627e76df64351bf247edd77bded965564a7ae67f8f36`) e punteggi uguali nei bit; decidono 10 `buy`, 7 `hold`, 3 `sell`.

### E5 — genomi diversi con hash diversi

E5 è E1 con `w1` = 25.000000000000004, il numero binary64 successivo a 25: hash `2379bea21c8aafdc206f82b78b330a0a947d3fade1cf257ba13d8a4f7750816d`, diverso da E1, anche se le decisioni sui 20 giorni sono le stesse. La chiave di quasi-duplicato a 24 bit (Q3 b) di E5 è uguale a quella di E1; ma due genomi con `w1` = 25.00000143051147 e 25.000001430511475, due numeri binari consecutivi, hanno chiavi **diverse**, perché cadono ai due lati di un arrotondamento. P2 (E2) ha hash `a33e6a16796a148134d62457c5dfdfe3919b19f43a760ee3b40f2aab4b050c7d`.

### E6 — pesi tutti nulli

Con tutti i pesi nulli e i `τ` di E1: `b` = 0,3, `b` = -0,7 e `b` = 1 danno sempre `hold` e lo stesso hash (vettore V2); `b` = -1,5 dà sempre `buy` e un hash diverso, `cc933c9cf3782f53a88aed8f599d84f7ac0e68f57fea50162d5264b79a490bba`.

## 10. Che cosa non si è potuto accertare

- Gli intervalli dei geni (età media 0,5-100, W_i, `b` tra -5 e 5), il passo del 5 % e il margine ln 2 sono scelte dell'autore, senza fonte; il limite alto di `τ` aspetta l'avvio massimo di R6.
- Che i 7 ingressi non abbiano combinazioni lineari esatte tra loro (quindi che i gradi di libertà siano proprio 15): non dimostrato.
- Quante decisioni cambierebbe S1 con fattori non potenze di 2 su dati lunghi diversi da quelli provati: sulle tre serie nessuna, ma il caso costruito mostra che è possibile.
- La variante limitata di SBX (sezione 6 di [1]) e l'originale di BLX-α non sono stati letti; dell'effetto della gestione dei bordi [6], dei vincoli [7] e della neutralità [8] sono letti solo gli abstract.
- L'algoritmo di ECMAScript per scrivere i numeri non è stato letto [13]; il comportamento è osservato solo su Node 20.20.2 e Python 3.12.3.
- La scala delle distanze dipende da `τ` (3.2): il limite resta.
- Se l'hash esatto, la chiave di quasi-duplicato o l'impronta servano davvero a E3 si vedrà solo con l'evoluzione.

## 11. Domande per Luca

Le stesse undici domande dei capitoli dove nascono, con le opzioni in una frase. La scelta si registra nel file del ciclo, nel blocco `## Human Verification`.

- **Q5 — Soglie e scala comune** (4.2).
  - (a) Centro `b` con le soglie a `b ± 1`: 15 geni (proposta).
  - (b) Due soglie libere senza rinormalizzare: 16 geni, la scala resta un passo implicito.
  - (c) Due soglie libere rinormalizzate prima dell'incrocio: 16 geni in memoria, 15 utili.
- **Q6 — Gene della memoria** (4.3).
  - (a) `τ` = logaritmo dell'età media (proposta).
  - (b) `c` direttamente, con passo lineare.
- **Q1 — Segno delle soglie** (3.2).
  - (a) `b` tra -5 e 5: con ingressi neutri si può comprare o vendere (proposta).
  - (b) `b` tra -1 e 1: con ingressi neutri sempre `hold`.
- **Q7 — Margine tra le due velocità** (3.1).
  - (a) La lenta almeno il doppio della veloce (proposta).
  - (b) Nessun margine, basta l'ordine.
  - (c) Un altro rapporto minimo.
- **Q8 — Intervalli** (3.2).
  - (a) Età media 0,5-100 barre per tutti, W_i della tabella (proposta).
  - (b) Limiti per ingresso, o limite alto dall'avvio di R6.
- **Q9 — Incrocio** (5.3).
  - (a) Per blocchi, distanze insieme (proposta).
  - (b) Uniforme gene per gene, come Consilium, con scambio e rifiuto.
  - (c) Intermedio con un solo α, con riporto e rifiuto.
- **Q10 — Mutazione** (5.3).
  - (a) Gaussiana al 5 % dell'intervallo con riflessione (proposta).
  - (b) Uniforme ±5 % con saturazione, come Consilium.
  - (c) Polinomiale limitata.
- **Q2 — Numeri del `Trader`** (capitolo 8).
  - (a) Contati a parte, 0 o 3 geni secondo R4 (proposta).
  - (b) Geni già ora.
  - (c) Costanti già ora.
- **Q3 — Genomi quasi uguali** (7.4).
  - (a) Solo hash esatto (proposta).
  - (b) Hash esatto più chiave di quasi-duplicato a 24 bit.
  - (c) Geni su una griglia di interi.
- **Q4 — Impronta delle decisioni** (7.4).
  - (a) No (proposta).
  - (b) Sì, su un insieme di prova fisso e versionato.
- **Q11 — Scrittura dei numeri nell'hash** (7.2).
  - (a) Esadecimale binary64 (proposta).
  - (b) Decimale RFC 8785 con funzione Python dedicata.

## Glossario

| Termine | Significato |
|---|---|
| algoritmo genetico | procedura che prova molte varianti di genoma, tiene le migliori, le mescola e le cambia un poco |
| barra | i cinque numeri di un giorno di borsa: apertura, massimo, minimo, chiusura, volume |
| Consilium | il simulatore da cui viene il genoma attuale e il codice dell'algoritmo genetico |
| EMA | media mobile esponenziale: `e = e * (1 - c) + x * c` |
| avvio | barre iniziali in cui una media dipende ancora molto dal primo valore |
| binary64 | il formato dei numeri in virgola mobile a 64 bit (IEEE 754), usato da JavaScript e Python |
| blocco | gruppo di geni che l'incrocio passa intero da un genitore |
| clamp (saturazione) | riportare sul bordo un valore uscito dall'intervallo |
| decodificatore | la regola che trasforma i geni in decisioni (formule, ordine della somma, confronti) |
| duplicato | genoma con lo stesso hash di un altro: decide sempre allo stesso modo |
| età media | età media dei dati in una EMA, `(1 - c)/c` barre |
| forma canonica | il genoma riscritto in modo che genomi equivalenti diventino identici |
| gene | numero del genoma che l'algoritmo genetico fa evolvere |
| hash | impronta di lunghezza fissa calcolata da un testo; testi diversi danno impronte diverse salvo collisioni rarissime |
| impronta di comportamento | hash delle decisioni su un insieme di prova fisso |
| incrocio | operazione che costruisce un figlio con parti di due genitori |
| incrocio intermedio | figlio = media pesata dei genitori, con lo stesso peso α per tutti i geni |
| margine | distanza minima richiesta tra le memorie delle due distanze |
| mutazione | piccolo cambiamento casuale di alcuni geni |
| quantizzazione | arrotondamento dei numeri a una precisione fissa |
| riflessione | riportare dentro un valore uscito, di tanto quanto è uscito |
| R2-R7, E2, E3 | le ricerche e le implementazioni dell'epica: R2 indicatori, R3 codifica, R4 equazioni di decisione, R5 fitness, R6 protocollo di valutazione, R7 caso di studio Koncorde, E2 codice del genoma, E3 evoluzione in Consilium |
| rifiuto | scartare un figlio non valido e ritentare con nuove estrazioni |
| riparametrizzazione | scrivere un gene in una forma che rende impossibile violare un vincolo |
| semi-ampiezza | metà della distanza tra soglia alta e bassa; nella proposta vale 1 |
| serie sintetica | serie di prezzi casuale con seme dichiarato, costruita in R2 per le prove |
| SHA-256 | funzione di hash standard a 256 bit |
| simmetria | trasformazione dei geni che non cambia nessuna decisione |
| stop loss, take profit | vendita automatica quando la perdita o il guadagno superano una percentuale |
| subnormale | numero in virgola mobile così piccolo da perdere cifre significative |
| `τ` (tau) | logaritmo dell'età media di una media: `ln((1 - c)/c)` |
| testo canonico | la forma canonica scritta come testo JSON, da cui si calcola l'hash |

## Riferimenti al codice

| File (righe) | Che cosa contiene |
|---|---|
| `src/engine/genome.js` (13-35, 40-42, 86) | genoma fisso FSM; controllo dei numeri finiti; rifiuto di `c` ≥ 1 |
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
6. S. Helwig, J. Branke, S. Mostaghim, *Experimental Analysis of Bound Handling Techniques in Particle Swarm Optimization*, IEEE Trans. Evolutionary Computation 17(2), 259-271, 2013, DOI 10.1109/TEVC.2012.2189404. Solo abstract, da estratti di ricerca `[fonte da verificare]`.
7. C. A. Coello Coello, *Theoretical and numerical constraint-handling techniques used with evolutionary algorithms: a survey of the state of the art*, Computer Methods in Applied Mechanics and Engineering 191(11-12), 1245-1287, 2002, DOI 10.1016/S0045-7825(01)00323-1. Solo abstract.
8. E. Galván-López, R. Poli, A. Kattan, M. O'Neill, A. Brabazon, *Neutrality in evolutionary algorithms... What do we know?*, Evolving Systems 2(3), 145-163, 2011, DOI 10.1007/s12530-011-9030-5. Solo abstract: https://gpbib.cs.ucl.ac.uk/gp-html/GalvanLopezPKOB_2011_ESNeEAWDWK.html
9. A. Rundgren, B. Jordan, S. Erdtman, RFC 8785, *JSON Canonicalization Scheme (JCS)*, 2020. Letto (sezioni 3.1-3.2.4, appendice B): https://www.rfc-editor.org/rfc/rfc8785
10. *What's New In Python 3.1* (scrittura dei float con la stringa più corta). Letta la parte: https://docs.python.org/3/whatsnew/3.1.html
11. Repository `cyberphone/json-canonicalization` (implementazioni di JCS). Letta la pagina principale, codice non provato: https://github.com/cyberphone/json-canonicalization
12. NIST, FIPS 180-4, *Secure Hash Standard*, 2015, DOI 10.6028/NIST.FIPS.180-4. Letta la pagina di presentazione, non il testo: https://csrc.nist.gov/pubs/fips/180-4/upd1/final
13. ECMA-262, *ECMAScript Language Specification*, `Number::toString`. Letto solo l'indice: https://tc39.es/ecma262/#sec-numeric-types-number-tostring
