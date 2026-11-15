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

> **Avvertenza.** Gli esempi usano il dataset di 20 giorni **inventato** del catalogo, due piccoli dataset **inventati** apposta (capitolo 12) e geni scelti a mano. Nessun numero dice che una codifica o un operatore «funziona meglio»: i confronti riguardano validità, scala e leggibilità, non i risultati dell'evoluzione.

**Percorso di lettura.** «In breve» (circa 30 minuti di lettura attenta) basta per capire che cosa si sceglie e per rispondere alle undici domande Q1-Q11 con un motivo: contiene la proposta, un esempio completo dai geni all'hash e, per ogni domanda, il problema, le opzioni con il loro effetto, la proposta e un criterio. Il [capitolo 11](#11-domande-per-luca) ha per ogni domanda una tabella degli effetti di ogni opzione. I capitoli 1-8 spiegano le opzioni e danno le prove: sono consultazione, e dove nasce una domanda rimandano a «In breve» e al capitolo 11 invece di ripeterla. Il capitolo 9 contiene gli esempi completi, che servono anche come casi di prova per chi scriverà il codice (E2) e l'evoluzione (E3). Il [capitolo 12](#12-esempi-per-le-scelte) mostra ogni scelta su dati inventati piccoli, un esempio per domanda (Q2 esclusa, 12.10) con tutte le opzioni sugli stessi numeri (circa 25 minuti); ogni domanda di «In breve» rimanda al suo. Il documento intero richiede circa tre ore.

**Segni usati.** `[ipotesi]` marca un giudizio dell'autore o un fatto senza una fonte letta; i numeri tra parentesi quadre, per esempio [3], rimandano ai [Riferimenti](#riferimenti), ognuno con il suo stato (letto, solo abstract, non letto). Decimali con la virgola nel testo, con il punto nel codice. Tutti i numeri vengono da script conservati in `/home/luca/Workspace/swarmtrader-r3-work/` (fuori dal repository; `ref/` gli script, `out/` le uscite). Simboli e sigle sono raccolti nel capitolo 1 ([Sigle](#15-sigle)), i termini nuovi nel [Glossario](#glossario).

## In breve

### Il problema

Ogni sera i 7 ingressi `x1 … x7`, moltiplicati ciascuno per il suo **peso** `w1 … w7`, si sommano nel punteggio `s = w1·x1 + … + w7·x7`. Se `s` è strettamente sopra la **soglia alta** si compra, se è strettamente sotto la **soglia bassa** si vende, altrimenti si resta (con `s` uguale a una soglia si resta); tra le soglie c'è la **zona di attesa**, e metà della sua larghezza è la **semi-ampiezza**. Ogni ingresso contiene una **media esponenziale** (EMA), che ogni giorno si sposta verso il dato nuovo di una frazione `c` tra 0 e 1: il dato di `k` **barre** prima (giorni di borsa) pesa `c(1 - c)^k`, e la media di `k` con questi pesi, l'**età** media, è `(1 - c)/c` barre (4 con `c` = 0,2). I primi due ingressi sono la distanza del prezzo da una media, con una memoria **veloce** e una **lenta**; gli altri cinque (RSI centrato, distanza dal massimo che dimentica, chiusura nella giornata, volume relativo, **OBV normalizzato**) sono descritti in 1.3. Sei ingressi su sette valgono 0 quando non dicono nulla; la distanza dal massimo vale 0 sul massimo ed è negativa sotto.

Il genoma ha quindi 7 pesi, le soglie e 7 coefficienti `c`; la forma in cui si scrivono decide tre cose:

1. **Che cosa può andare storto:** `c` tra 0 e 1, la veloce più veloce della lenta, la soglia alta sopra la bassa; un **incrocio** (il figlio prende parti dei due genitori) o una **mutazione** (piccolo cambiamento casuale) può violarlo.
2. **Quanto pesa un passo di mutazione:** lo stesso passo su `c` cambia l'età media di fattori molto diversi secondo la memoria: poco una corta, moltissimo una lunga.
3. **Quando due genomi sono «lo stesso»:** pesi e soglie per 2 danno le stesse decisioni; Luca ha chiesto di riconoscere questi genomi con un **hash** (un'impronta di 64 caratteri calcolata dai numeri) e di segnalarli, non eliminarli.

**Già deciso** (risposte di Luca del 2026-11-14): i 7 ingressi sono **sempre tutti presenti** e i duplicati si riconoscono per **uguaglianza di comportamento**; se toglierli lo deciderà E3.

### La proposta in una tabella

La proposta ha **15 geni** reali in ordine fisso; una riga per gruppo di geni, con l'intervallo (scelto dall'autore, `[ipotesi]`, capitolo 3) e il motivo della forma.

| Geni | Che cosa sono | Intervallo proposto | Perché questa forma |
|---|---|---|---|
| `w1 … w7` | pesi dei 7 ingressi | da -W_i a +W_i, con W_i tra 22 e 260 secondo la grandezza tipica dell'ingresso (3.2) | «quanto sposta il punteggio questo ingresso» |
| `b` | centro della zona di attesa: soglie `b + 1` e `b - 1` | da -5 a 5 (Q1) | zona larga 2: sparisce la «scala comune», che non cambiava le decisioni; alta sempre sopra bassa |
| `τ1 … τ7` | memoria di ogni ingresso: `τ = ln((1 - c)/c)`, logaritmo dell'età media | da ln 0,5 a ln 100 (età media da 0,5 a 100 barre) | un passo moltiplica l'età media per lo stesso fattore, corta o lunga che sia |

Vincolo in più: la lenta ha almeno il **doppio** dell'età media della veloce (`τ2 - τ1 ≥ ln 2`). Con due soglie libere i geni sarebbero 16; se R4 (la ricerca sulle equazioni di decisione) farà evolvere i tre numeri di Q2, 18 (capitolo 2).

### Un esempio dall'inizio alla fine

Il genoma G1 (capitolo 9, Esempio 1) ha pesi 25, 10, 0,5, 5, 1, 1, 0,5, centro `b` = 0 (soglie +1 e -1) e memorie `τ` = 0 per la distanza veloce (età media 1 barra), 2,1972 per il massimo che dimentica (età media 9) e 1,3863 per gli altri cinque (età media 4).

1. **Dai geni agli ingressi.** Con queste memorie, il giorno 12 del dataset inventato i 7 ingressi valgono -0,0228; -0,0287; -0,3804; -0,0662; -0,1736; 0,3104; -0,3533.
2. **Dagli ingressi al punteggio.** Ogni contributo è peso per ingresso, per esempio 25 × (-0,0228) = -0,57; i sette contributi sono -0,57; -0,29; -0,19; -0,33; -0,17; 0,31; -0,18 e la somma è `s` = -1,42.
3. **Dal punteggio alla decisione.** -1,42 è sotto la soglia bassa `b - 1` = -1: `sell`. Sui 20 giorni G1 decide 11 `buy`, 5 `hold`, 4 `sell`.
4. **Dal genoma all'hash.** La forma canonica di G1 è G1 stesso; ogni numero si scrive con 16 cifre esadecimali e il testo dà l'hash SHA-256 `29ae884bca99df08a94d0a4b018d12f1577f65415d169ef216c4404c63440a0d`.
5. **Stesso comportamento, stesso hash, e il contrario.** G4 (G1 con soglie ±2 e pesi doppi) diviso per la semi-ampiezza 2 torna G1: stesso hash. G5 (G1 con il peso 25 cambiato nell'ultima cifra binaria) decide uguale sui 20 giorni ma ha un altro hash: l'hash riconosce solo le equivalenze dimostrate.

### L'hash

**Come si calcola.** Si calcola su una **forma canonica**, il genoma riscritto in modo che genomi equivalenti per una simmetria dimostrata diventino identici (per esempio il `τ` di un peso nullo non conta); ogni numero si scrive con le 16 cifre esadecimali dei suoi 64 bit (Q11), poi SHA-256.

**Che cosa garantisce.** Con la proposta, stesso hash vuol dire stesse decisioni su ogni serie, se le calcola lo stesso programma (quello di riferimento sarà E2, il codice del genoma). Due eccezioni, rare:

- **programmi diversi:** Node e Python calcolano a volte `c` con l'ultima cifra diversa, e possono decidere diversamente se il punteggio cade a una o due ultime cifre da una soglia; nelle prove non è mai successo (1.4);
- **due soglie libere (Q5 b, c):** la forma canonica divide per la semi-ampiezza arrotondando, e se il punteggio cade entro quell'arrotondamento da una soglia due genomi con lo stesso hash possono decidere diversamente (7.1).

Il contrario non vale: hash diversi possono decidere uguale (G1 e G5).

### Le undici scelte per Luca

Q5 e Q6 cambiano la forma dei geni e vanno prima; Q1, Q7 e Q8 dipendono dalla forma scelta. Il capitolo 11 dà gli effetti in tabella; il capitolo 12 mostra ogni opzione su numeri piccoli inventati.

**Q5 — Soglie: centro fisso o due soglie libere?** *Problema:* pesi e soglie moltiplicati per lo stesso numero positivo danno le stesse decisioni, ma un passo fisso pesa poco su un genoma «grande» e molto su uno «piccolo». (a) **Proposta:** centro `b`, soglie `b ± 1`: 15 geni, nessuna scala. (b) Due soglie libere: 16 geni, vincolo «alta sopra bassa», la scala resta un passo di mutazione nascosto. (c) Due soglie libere, genitori riportati a semi-ampiezza 1 prima dell'incrocio: 16 numeri, una scala sola. Con (b) e (c) stesso hash dà stesse decisioni quasi sempre. *Per scegliere:* (a) se R4 resterà «omogenea» (nessun termine fisso che non si moltiplica con pesi e soglie); (b) per leggere le soglie come nel catalogo, o se R4 aggiungerà un termine fisso (per esempio un'isteresi in unità assolute); (c) per soglie libere a scala comune. *Esempio:* [12.3](#123-q5-soglie-e-scala-comune).

**Q6 — La memoria: `τ` o `c`?** *Problema:* con `c` come gene lo stesso passo cambia l'età media di fattori molto diversi secondo la memoria: poco una corta, moltissimo una lunga. Con un passo del 5 % dell'intervallo di `c` (0,0328) l'età media 1 diventa 0,88 o 1,14 barre, la 9 diventa 6,53 o 13,9, la 49 scende a 17,9 (l'altro passo esce dall'intervallo). (a) **Proposta:** `τ`: un passo moltiplica l'età media sempre per lo stesso fattore (1,303). (b) `c`, con passo lineare come Consilium (il simulatore da cui viene il codice dell'algoritmo genetico); bordi come scelto in Q10. Stessi geni; hash diversi per lo stesso comportamento. *Per scegliere:* (a) per passi proporzionati a ogni memoria; (b) per leggere gli stessi `c` del catalogo e di Consilium. *Esempio:* [12.4](#124-q6-passo-sulla-memoria).

**Q1 — Senza segnali si può comprare o vendere?** *Problema:* con tutti gli ingressi a 0 il punteggio è 0; la strategia deve restare ferma? (a) **Proposta:** `b` tra -5 e 5: con `b` < -1 compra, con `b` > 1 vende; 5 è il fattore dei limiti dei pesi, cioè quanto un ingresso tipico al limite del suo peso sposta il punteggio `[ipotesi]`. (b) `b` tra -1 e 1: punteggio 0 dà sempre `hold`. Stessi geni. *Per scegliere:* (a) per permettere acquisti o vendite «per default»; (b) se senza segnali non si fa nulla. Con due soglie libere diventa: alta positiva e bassa negativa, o no. *Esempio:* [12.5](#125-q1-decisioni-senza-segnali).

**Q7 — Quanto devono differire le due memorie?** *Problema:* con memorie vicine le due distanze diventano quasi lo stesso ingresso e i loro pesi si compensano. (a) **Proposta:** lenta almeno il doppio della veloce. (b) Nessun margine. (c) Un altro rapporto, per esempio 1,25 o 4. Nessun gene in più. Sulla **serie sintetica** (prezzi casuali del catalogo, senza dati ENI) la correlazione tra le due distanze (1 = identiche) è da 0,99 a 1,00 con rapporto 1,25, da 0,95 a 0,97 con 2, da 0,82 a 0,87 con 4 (3.1); nessuna fonte dice quanta sia troppa, quindi il 2 resta `[ipotesi]`. *Per scegliere:* rapporto grande per due ingressi davvero diversi; piccolo o nullo per non vietare velocità vicine. *Esempio:* [12.6](#126-q7-due-memorie-vicine).

**Q8 — Entro quali limiti?** *Problema:* gli intervalli sono scelti dall'autore senza fonte. (a) **Proposta:** età media da 0,5 a 100 barre per tutti; pesi entro ±W_i, con W_i = 5 diviso il valore tipico dell'ingresso sulla serie sintetica `[ipotesi]`; `b` secondo Q1. (b) Limiti per ingresso. (c) Limite alto della memoria dall'avvio che sceglierà R6 (il protocollo di valutazione). L'**avvio** è il numero di barre iniziali in cui una media dipende dal primo valore per più del 5 % `[ipotesi]` (302 con età media 100); R6 deciderà quante escluderne. Cambiano costanti e versione dello schema, quindi l'hash. *Per scegliere:* (a) se basta un intervallo largo, da rivedere con R6; (b) per memorie diverse già ora, per esempio il volume più corto; (c) per legare il limite alto all'avvio di R6. *Esempio:* [12.7](#127-q8-limite-alto-della-memoria).

**Q9 — Come si incrociano due genitori?** *Problema:* la grandezza tipica di un ingresso dipende dalla sua memoria (per le distanze varia di circa 26 volte tra memoria corta e lunga, 3.2), quindi un peso va bene solo con la sua memoria. (a) **Proposta:** per blocchi interi (ogni peso con la sua memoria, le due distanze insieme, `b` da solo): nessun figlio da correggere. (b) Gene per gene, come Consilium: 17658 figli su 100000 violano il margine tra le memorie, da correggere o rifiutare. (c) Incrocio intermedio: figlio = media pesata dei genitori, con lo stesso peso α per tutti i geni; 3543 figli su 100000 escono di un'ultima cifra, da riportare dentro. I due conteggi vengono da una prova con metà dei genitori esattamente sul margine o sui bordi (5.2). Nessun effetto sull'hash. *Per scegliere:* (a) per tenere ogni peso con la sua memoria; (b) per restare come Consilium; (c) per figli intermedi, sapendo che la media restringe la popolazione verso il centro. *Esempio:* [12.8](#128-q9-figli-di-un-incrocio).

**Q10 — Come si muta un gene?** *Problema:* forma del passo e trattamento dei bordi. (a) **Proposta:** passo gaussiano largo il 5 % dell'intervallo; un gene uscito si **riflette** dentro di tanto quanto è uscito (in [0; 10], 10,3 diventa 9,7), quindi nessun valore resta fermo sul bordo; se la veloce supera la lenta si scambiano le due distanze, se manca il margine si ritenta. (b) Passo uniforme con saturazione (il valore uscito si ferma sul bordo), come Consilium: senza selezione il 3,92 % dei `c` finisce esattamente su un bordo. (c) Mutazione polinomiale limitata: il passo si accorcia avvicinandosi al bordo, così il valore non esce mai (forma letta nel codice di DEAP, 12.9; non provata come operatore del genoma, 5.3). Nessun effetto sull'hash. *Per scegliere:* (a) contro gli accumuli sui bordi; (b) per la regola di Consilium; (c) per una legge che resta nei limiti senza riflessione. *Esempio:* [12.9](#129-q10-una-mutazione-vicino-al-bordo).

**Q2 — Quota investita, stop loss e take profit sono geni?** *Problema:* il motore vuole tre numeri oltre al punteggio (la parte del capitale usata per comprare, la perdita e il guadagno percentuali a cui vende da solo). (a) **Proposta:** contarli a parte: 15 geni ora, forse 18 dopo R4. (b) Geni già ora. (c) Costanti già ora, scritte nella versione del decodificatore e quindi nell'hash. *Per scegliere:* (a) per lasciare la scelta a chi scrive le equazioni di decisione; (b) o (c) se hai già un'idea. *Esempio:* nessuno, perché dipende da R4 ([12.10](#1210-q2-nessun-esempio)).

**Q3 — Che cosa fare dei genomi quasi uguali?** *Problema:* genomi che differiscono nell'ultima cifra di un peso hanno hash diversi anche se decidono uguale (G1 e G5). (a) **Proposta:** solo hash esatto. (b) In più una chiave di quasi-duplicato: lo stesso testo con i numeri arrotondati a circa 7,5 cifre decimali significative (24 bit di frazione della mantissa, 7.4) `[ipotesi]`; unisce anche genomi che possono decidere diversamente e separa sempre qualche coppia vicinissima. (c) Geni su una griglia di interi: hash esatto, ma operatori a passi. *Per scegliere:* (a) se basta sapere quali genomi sono certamente uguali; (b) per contare anche quelli «praticamente» uguali; (c) per un genoma a passi discreti. *Esempio:* [12.11](#1211-q3-due-genomi-quasi-uguali).

**Q4 — Serve anche un'impronta delle decisioni?** *Problema:* genomi che decidono uguale senza una simmetria dimostrata (per esempio con soglie mai raggiunte) hanno hash diversi. (a) **Proposta:** no. (b) Sì: l'hash delle decisioni su un insieme di prova fisso, fuori dai dati di valutazione (dataset inventato più serie sintetica, 3020 barre). Costa una simulazione in più per genoma: se R6 valuterà sullo snapshot ENI (la copia fissa dei 2517 giorni di prezzi ENI usata dal programma), il tempo per genoma circa raddoppia `[ipotesi: dipende dai dati di R6]`. E3 potrebbe trattare le impronte uguali come duplicati, per esempio riducendone la pressione di selezione (quanto spesso un genoma è scelto come genitore). *Per scegliere:* (b) per segnalare anche i genomi uguali «in pratica»; (a) se la simulazione in più non vale. *Esempio:* [12.12](#1212-q4-genomi-che-non-decidono-mai).

**Q11 — Come scrivere i numeri nel testo dell'hash?** *Problema:* il genoma girerà in Node, ma le verifiche indipendenti delle ricerche ricalcolano gli hash in Python, che scrive i decimali in modo diverso (`1e-7` contro `1e-07`). (a) **Proposta:** esadecimale, le 16 cifre dei 64 bit di ogni numero, uguali ovunque. (b) Decimale secondo RFC 8785, leggibile, con una funzione Python scritta apposta; un suo errore darebbe hash diversi senza alcun messaggio. *Per scegliere:* (a) se il testo serve alle macchine; (b) per leggerlo a occhio. *Esempio:* [12.13](#1213-q11-lo-stesso-genoma-in-node-e-in-python).

**Che cosa non decide R3.** Equazioni di decisione, isteresi, stop loss e take profit (R4), fitness (R5), dati di valutazione (R6). Il rischio principale: un termine di R4 che rompe la scala comune riporta a 16 geni (capitolo 8).

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

`C`, `H`, `L`, `V` sono chiusura, massimo, minimo e volume del giorno; `dC` è la variazione della chiusura rispetto al giorno prima; `clv` è la posizione della chiusura tra minimo e massimo del giorno, da -1 a +1; `sgn` è il segno (+1, 0 o -1); `EMA0` è una media avviata da zero (nel rapporto di due `EMA0` con lo stesso `c` l'errore dei primi giorni si cancella; catalogo, sezione 3.2). RSI (*Relative Strength Index*, indice di forza relativa) e OBV (*On-Balance Volume*) sono gli indicatori classici di cui gli ingressi 3 e 7 sono una forma centrata tra -1 e +1; ATR (*Average True Range*, escursione vera media) è la misura dell'agitazione che la risposta D3 b ha tolto dalla somma. Il massimo che dimentica (N10) non era nel codice di R2: è implementato in `ref/indicators.mjs`, riproduce la tabella D4 del catalogo su tutti i 13 giorni ed è controllato contro una formula diretta (scarto relativo massimo 1,5e-13).

*Per chi verifica:* la formula diretta è `m[t]` = massimo, su `j` ≤ `t`, di `(1-c)^(t-j) H[j] + Σ_{k=j+1..t} c (1-c)^(t-k) C[k]`.

### 1.4 Età media e `τ`

Una EMA con coefficiente `c` contiene dati vecchi in media `(1 - c)/c` barre (catalogo, sezione 2.2). Il gene proposto è il suo logaritmo; la formula inversa ridà `c`:

```
tau = ln((1 - c) / c)          eta' media = e^tau barre
c   = 1 / (1 + e^tau)          (in aritmetica esatta)
```

Esempio: `c` = 0,2 ha età media 4 barre e `τ` = ln 4 = 1,3863; `c` = 0,5 ha età media 1 e `τ` = 0. Come le due medie inseguono un salto del prezzo, giorno per giorno: [12.2](#122-come-una-ema-insegue-un-salto).

**Il calcolo esatto di `c` nel decodificatore.** In virgola mobile due scritture uguali in aritmetica esatta non danno gli stessi bit: in Node `e^-τ/(1 + e^-τ)` e `1/(1 + e^τ)` differiscono nell'ultima cifra binaria nel 39,4 % dei `τ` dell'intervallo. Il decodificatore `lin7-dec-v1` fissa quindi questa forma, con le operazioni in quest'ordine (come `cOfTau` in `ref/indicators.mjs`):

```
se tau >= 0:  e = exp(-tau);  c = e / (1 + e)
altrimenti:   c = 1 / (1 + exp(tau))
```

**Limite: `exp` non dà gli stessi bit in Node e in Python.** Misure di `ref/check-corrections.mjs`, che chiama Python:

- **Che cosa differisce.** Su 200000 `τ` uniformi nell'intervallo proposto (da ln 0,5 a ln 100), `exp(-|τ|)` calcolato con `Math.exp` di Node e con `math.exp` di Python differisce nell'ultima cifra binaria nel 10,1 % dei casi, e `c` calcolato con la forma sopra nel 7,6 %, al più di 2 ultime cifre. Lo stesso può valere per `ln`, usato da tre ingressi, non misurato `[ipotesi]`.
- **Come si è misurato l'effetto.** 200 genomi casuali, ciascuno valutato una volta con i `c` di Node e una con i `c` di Python su tutte le barre di tre serie: il dataset inventato (20 barre), la serie sintetica (3000) e lo snapshot ENI (2517), cioè 5537 barre; 200 genomi × 5537 barre fanno 1107400 valutazioni (un genoma su una barra). Le stesse tre serie servono alle prove del capitolo 6.
- **Che cosa non cambia.** L'hash, perché si calcola sui `τ` e non sui `c`.
- **Che cosa può cambiare.** I punteggi differiscono nell'ultima cifra nel 18,0 % delle valutazioni. Nessuna decisione e nessuna impronta di Q4 risulta diversa, ma una decisione può cambiare in un giorno in cui il punteggio cade a una o due ultime cifre da una soglia.
- **Che cosa fare.** «Punteggi uguali nei bit» vale dentro uno stesso programma; il programma di riferimento è quello di E2, in Node. Specificare un `exp` proprio, fatto solo di somme e prodotti (che Node e Python arrotondano allo stesso modo), toglierebbe il limite ed è una possibilità per E2 `[ipotesi]`.

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
| Z1-Z12 | i genomi degli esempi su dati inventati | capitolo 12 |
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
| V3 | soglia bassa sotto la alta | altrimenti le zone di `buy` e `sell` si sovrappongono | impossibile da violare: le soglie sono `b ± 1` | con due soglie libere: soglie invertite scambiate (cambia il comportamento) o rifiutate; soglie uguali rifiutate (semi-ampiezza nulla) |
| V4 | ogni gene è un numero finito | un `NaN` rende ogni confronto falso, quindi sempre `hold` (catalogo 3.3) | controllo prima della valutazione e dell'hash, come `assertFinite` in `genome.js` (righe 40-42) | nessuna |
| Vw, Vb | pesi e `b` nei loro intervalli | tengono i passi di mutazione proporzionati | riflessione | saturazione |
| V5 | numeri che R4 aggiungerà (ad es. stop loss positivo) | dipendono da R4 | da fissare in R4 | - |

La riflessione rimette dentro di tanto quanto il gene è uscito: con intervallo [0; 10] il valore 10,3 diventa 9,7. Si applica **solo** ai valori fuori dall'intervallo: applicata a un valore interno, la formula può cambiarne l'ultima cifra binaria: con l'intervallo di `τ`, 1,5298317366548038 diventerebbe 1,5298317366548035 (`ref/check-corrections.mjs`).

**Domanda Q7 — margine tra le due velocità.** Opzioni, proposta e criterio sono in [«In breve»](#in-breve), gli effetti di ogni opzione nel [capitolo 11](#11-domande-per-luca). Le opzioni in simboli: (a) δ = ln 2 (proposta), (b) δ = 0, (c) un altro δ = ln r per un rapporto minimo r. Il dato in più è quanto si somigliano le due distanze: la tabella ha una riga per età media della distanza veloce e una colonna per rapporto tra l'età media della lenta e quella della veloce; ogni cella è la correlazione tra `x1` e `x2` sulla serie sintetica (3000 barre, prime 300 escluse come avvio; `ref/check-q7.mjs`).

| eta' media veloce | rapporto 1,25 | rapporto 2 | rapporto 4 |
|---|---|---|---|
| 1 | 1,00 | 0,97 | 0,87 |
| 4 | 1,00 | 0,95 | 0,82 |
| 25 | 0,99 | 0,95 | 0,82 |

Con rapporto 1,25 le due distanze sono quasi lo stesso ingresso a ogni memoria; con 2 restano molto simili; con 4 si separano di più. Nessuna fonte letta dice quale correlazione renda due ingressi «troppo simili»: il rapporto 2 resta `[ipotesi]`.

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

**Domanda Q8 — intervalli dei geni.** Opzioni, proposta e criterio sono in [«In breve»](#in-breve), gli effetti di ogni opzione nel [capitolo 11](#11-domande-per-luca). In più: anche con limiti diversi per ingresso, le due distanze devono avere **lo stesso** intervallo di `τ`, altrimenti lo scambio di V2 può portare un gene fuori dal suo.

**Domanda Q1 — segno delle soglie.** Opzioni, proposta e criterio sono in [«In breve»](#in-breve), gli effetti di ogni opzione nel [capitolo 11](#11-domande-per-luca). Il limite 5 di `b` è lo stesso fattore 5 dei W_i `[ipotesi]`: un ingresso tipico al limite del suo peso sposta il punteggio di 5 semi-ampiezze, quanto il centro più lontano.

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

Con due soglie libere (Q5 b) moltiplicare tutto per `k` > 0 non cambia le decisioni, ma cambia **l'effetto degli operatori**: un passo di mutazione fisso su un peso è un cambiamento relativo piccolo su un genoma «grande» e grande su uno «piccolo», e un incrocio tra due genitori equivalenti a scale diverse mescola numeri incoerenti. La scala diventa un passo di mutazione nascosto. Rinormalizzare ogni genitore prima dell'incrocio (Q5 c) non è neutro: ogni genitore è diviso per il proprio fattore, e gli incroci usuali dipendono dalla scala di ciascun genitore. Il risultato della prova: se i due genitori sono alla stessa scala il figlio non cambia, se sono a scale diverse cambia quasi sempre. In numeri, scalare entrambi i genitori per lo stesso fattore non cambia mai la forma canonica del figlio; scalare solo il secondo la cambia in 16247 casi su 16326 con l'incrocio uniforme, in 20000 su 20000 con quello intermedio e in 14607 su 14607 con BLX-0,5 (i tre incroci sono descritti in 5.3). Il metodo (`ref/check-ops.mjs`): 20000 coppie di genitori a 16 numeri, ciascuno dall'inizializzazione con pesi e soglie moltiplicati per `e^U`, `U` uniforme in [-3; 3]; fattore `k = 2^m`, `m` intero tra -4 e 4 diverso da 0, potenza di 2 per evitare arrotondamenti. Con il centro `b` e semi-ampiezza fissata a 1 il problema non esiste: tutti i genomi sono alla stessa scala.

Il passaggio da due soglie alla forma proposta è `h = (θ_alta - θ_bassa)/2`, `b = ((θ_alta + θ_bassa)/2)/h` e ogni peso diviso per `h`. Vale solo se R4 lascia la regola **omogenea** in pesi e soglie, cioè senza termini fissi che non si moltiplicano insieme a loro (capitolo 8).

**Domanda Q5 — soglie e scala comune.** Opzioni, proposta e criterio sono in [«In breve»](#in-breve), gli effetti di ogni opzione nel [capitolo 11](#11-domande-per-luca). In più: con regola omogenea la forma canonica di (b) e (c) divide per `h` e dà lo stesso testo della proposta (stesso hash, stesse decisioni quasi sempre, non sempre: 7.1); con un termine non omogeneo non divide più (capitolo 8). Se si sceglie (a) e R4 aggiunge poi un termine fisso, i genomi a 15 geni passano a 16 senza perdita (soglie `b + 1` e `b - 1`, stessi pesi, stessi confronti) con un nuovo schema, quindi con hash nuovi, perché la versione dello schema entra nel testo dell'hash.

### 4.3 Il gene della memoria: `τ` o `c`

Con `c` come gene e un passo fisso (Consilium: ±0,05 e saturazione in [0,01; 1], `individual_v2.js`, righe 203-214), lo stesso passo vale cose diverse: da `c` = 0,99 a 0,94 l'età media passa da 0,0101 a 0,0638 barre, da 0,10 a 0,05 passa da 9 a 19. Con `τ` un passo moltiplica o divide l'età media sempre per lo stesso fattore: con il passo proposto un passo di ampiezza σ la moltiplica per 1,303. È la mutazione log-normale delle strategie evolutive (una famiglia di algoritmi evolutivi su numeri reali), applicata all'età media: «log-normale» vuol dire che il passo è gaussiano sul logaritmo [2]. Il primo caso è fuori dall'intervallo di V1 (`c` da 0,0099 a 0,6667, 2.1): dentro, con un passo del 5 % dell'intervallo, il fattore cambia ancora con la memoria, ma è piccolo sulle memorie corte e grande sulle lunghe (età media 1 → 0,88 o 1,14; 49 → 17,9; 12.4). Inoltre la saturazione di Consilium ammette `c` = 1 (0,99 + 0,04 diventa 1), che `genome.js` rifiuta.

`τ` «per costruzione» non basta: in virgola mobile `1/(1 + e^τ)` vale esattamente 1 già da `τ` = -36,7369 e `e^τ` va in overflow sopra 709,7827 (in Python solleva un errore invece di dare 0). Servono quindi i limiti di V1, ben dentro questi valori, e la forma stabile della formula. La variante `τ2 = τ1 + e^η` (lenta legata alla veloce) è **scartata**: con i limiti di V1 il vincolo torna accoppiato, e un incrocio che cambia `τ1` sposterebbe anche la lenta.

**Domanda Q6 — gene della memoria.** Opzioni, proposta e criterio sono in [«In breve»](#in-breve), gli effetti di ogni opzione nel [capitolo 11](#11-domande-per-luca). In più, sull'opzione (b): `c` starebbe nell'intervallo che corrisponde a V1, da 0,0099 a 0,6667 (2.1), con passo lineare; il trattamento dei bordi non è parte di Q6 ma di Q10, quindi con la mutazione proposta (Q10 a) un `c` uscito si riflette dentro e con la regola di Consilium (Q10 b) si satura sul bordo. Le prove di questo documento non implementano la variante (b): l'unica misura su `c` è la passeggiata con la saturazione di Consilium (5.3). I due schemi hanno hash diversi per lo stesso comportamento e non vanno mescolati.

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

La tabella ha una riga per operatore: dove si trova (in Consilium o in letteratura), se da solo rispetta i vincoli e che cosa serve dopo per avere solo figli validi. DEAP e pymoo sono due librerie Python di algoritmi evolutivi. BLX-α estrae ogni gene del figlio in un intervallo un po' più largo di quello tra i due genitori; SBX («incrocio binario simulato») lo estrae vicino ai genitori con una legge che imita l'incrocio dei bit; la mutazione polinomiale limitata estrae il passo da una legge polinomiale scalata sulla distanza dal bordo, che resta nei limiti da sola (descritta sotto, nella Domanda Q10). Il **riporto nell'intervallo** porta sul bordo un valore uscito di un'ultima cifra. Le prove dei due incroci alternativi usano gli stessi genitori di 5.2 (metà dall'inizializzazione, metà sui bordi), 100000 figli per incrocio.

| Operatore | Dove | Conserva i vincoli? | Che cosa serve dopo |
|---|---|---|---|
| incrocio per blocchi (proposta) | questo documento | sì, tutti | nulla |
| incrocio uniforme gene per gene | Consilium: `individual_v2.js` 161-193, `individual.js` 350-382, `ga_v2.js` 93-126; DEAP `cxUniform` [3] | no: in prova 17658 figli su 100000 violano V2 | scambio e rifiuto: 7953 rifiutati, poi 0 invalidi |
| incrocio intermedio, lo stesso peso α per tutti i geni | ricombinazione intermedia delle strategie evolutive [2] | sì in aritmetica esatta (l'insieme valido è convesso), no in virgola mobile: 3543 su 100000 escono di un'ultima cifra | riporto nell'intervallo e rifiuto: 2805 rifiutati, poi 0 invalidi |
| BLX-α, SBX | Deb e Agrawal [1]; DEAP [3], pymoo [4] | no: i figli escono dall'intervallo dei genitori | riflessione o versioni limitate |
| mutazione gaussiana con riflessione (proposta) | DEAP `mutGaussian` [3] per il passo | intervalli sì; V2 no | scambio e rifiuto (già nel pseudocodice) |
| mutazione uniforme con saturazione al bordo | Consilium: `individual_v2.js` 199-279 (±0,05 sui `c`, clamp [0,01; 1]), `ga_v2.js` 128-193 (±0,125) | intervalli sì, ma ammette `c` = 1 | - |
| mutazione polinomiale limitata | Deb; DEAP `mutPolynomialBounded` [3], pymoo [4] | intervalli sì per costruzione; V2 no | scambio e rifiuto |
| mutazione moltiplicativa sui pesi | - | scartata: un peso non cambia mai segno e uno zero resta zero per sempre | - |
| passo auto-adattivo (un σ nel genoma) | Beyer e Schwefel [2] | non tocca i vincoli | aggiunge numeri che non sono geni di decisione e vanno esclusi dall'hash |

**Saturazione contro riflessione.** In una passeggiata senza selezione (10000 geni con partenza uniforme, `c` in [0,01; 1] e `τ` nel suo intervallo; 2000 generazioni, probabilità di mutazione 0,1; `ref/check-ops.mjs`), la saturazione di `individual_v2.js` lascia il 3,92 % dei `c` esattamente su un bordo, l'1,85 % esattamente a `c` = 1; la riflessione su `τ` lo 0,00 %. È un fatto sugli operatori senza selezione, non una previsione sull'evoluzione; una distorsione della ricerca dovuta alla gestione dei bordi è descritta in letteratura per un altro algoritmo [6, solo abstract].

**Consilium non riconosce i duplicati:** `ga_v2.js` salva ogni figlio con `Genoma.create` (righe 330-336). `db/orm.js` gestisce un errore di unicità sul testo del genoma (`SaveGenoma`, righe 454-504), ma nelle basi dati lette in sola lettura durante questa ricerca il vincolo `UNIQUE` c'è solo in un file vecchio (`db/database.sqlite`), e `SaveGenoma` è usata solo da script manuali.

**Domanda Q9 — incrocio.** Opzioni, proposta e criterio sono in [«In breve»](#in-breve), gli effetti di ogni opzione nel [capitolo 11](#11-domande-per-luca). Le prove delle tre opzioni sono nella tabella sopra e in 5.2: (b) è seguito da scambio e rifiuto, (c) da riporto nell'intervallo e rifiuto. Il motivo della proposta, cioè che la grandezza tipica di una distanza dipende dal suo `τ`, è in 3.2 («Un limite che resta») e nel catalogo, sezione 5.3.

**Domanda Q10 — mutazione.** Opzioni, proposta e criterio sono in [«In breve»](#in-breve), gli effetti di ogni opzione nel [capitolo 11](#11-domande-per-luca). In più: la regola di Consilium (b) è ±5 % dell'intervallo di ogni parametro in `individual.js` e ±0,05 fissi sui `c` in `individual_v2.js` (circa il 5 % dell'intervallo [0,01; 1]), cioè la stessa regola su intervalli diversi; il 3,92 % di `c` sul bordo viene dalla mutazione di `individual_v2.js` (sopra, «Saturazione contro riflessione»). La mutazione polinomiale limitata (c) estrae il passo da una legge polinomiale scalata sulla distanza del gene da ciascun bordo: il passo verso un bordo non può superare quella distanza e si accorcia avvicinandosi al bordo, così il valore non esce mai, e vicino a un bordo i passi verso l'esterno sono più piccoli di quelli verso l'interno. Stato della fonte: le pagine di DEAP (`mutPolynomialBounded`) [3] e di pymoo [4], lette, danno la firma dell'operatore e dicono che resta nei limiti; la forma del passo è stata poi letta nel codice di DEAP (`deap/tools/mutation.py`, ramo `master`; 12.9) e conferma la descrizione: il passo verso un bordo non supera la distanza dal bordo; l'operatore non è stato provato qui come operatore del genoma (con le prove di 5.2).

## 6. Le simmetrie

Una **simmetria** è una trasformazione dei geni che lascia uguali **tutte** le decisioni su **ogni** serie di barre ammessa dal validatore (`low > 0`, volume ≥ 0; `src/engine/dataTrainer.js`, riga 34). Con la regola di salto del catalogo (un ingresso con denominatore nullo non si aggiorna e tiene il valore precedente, 1.1) e `low > 0` i 7 ingressi sono sempre finiti: è la condizione che S4 e S5 richiedono (controllato su 200 genomi casuali su tutte le barre delle tre serie descritte sotto, in S1: 0 valori non finiti).

**S1 — scala comune** (solo con due soglie libere, Q5 b e c). Moltiplicare pesi e soglie per `k` > 0 non cambia nessuna decisione, perché `s > θ` equivale a `k s > k θ`; vale anche nei pareggi (`s = θ` resta pareggio). Con `k` < 0 non è una simmetria: le disuguaglianze si invertono e `buy` e `sell` si scambiano. In virgola mobile S1 è **esatta** se `k` è una potenza di 2 e nessun prodotto, somma o soglia scalata va in overflow o nella zona dei numeri subnormali; con `k` = 2^-1000 un esempio costruito passa da `buy` a `hold`. Per gli altri `k` i numeri `k * w` sono arrotondati e la forma canonica di `k g` in genere differisce da quella di `g`.

La tabella confronta 200 genomi casuali `r` a 16 numeri (due soglie libere: genomi dall'inizializzazione con pesi e soglie moltiplicati per `e^U`, `U` uniforme in [-3; 3]; `ref/check-symmetry.mjs`, seme 31337) con le loro copie `k r`, su tutte le barre di tre serie: il dataset inventato (20 barre), la serie sintetica (3000) e lo snapshot ENI (2517, in sola lettura), 5537 barre. Ogni genoma su ogni barra è una valutazione: 200 genomi × 5537 barre = 1107400 valutazioni per fattore. Una riga per fattore `k`; le colonne contano le valutazioni, le decisioni diverse tra `r` e `k r`, quelle tra `r` e la sua forma proposta (divisa per `h`), e su quanti dei 200 genomi l'hash di `k r` differisce da quello di `r`. Nella riga «casuale» ogni genoma ha il suo `k = e^U`, `U` uniforme in [-3; 3]. Da leggere così: con `k` potenza di 2 tutto resta uguale; con `k` non potenza di 2 (3, 0,7, casuale) le decisioni non cambiano ma l'hash sì (ultima colonna), perché i numeri `k * w` sono arrotondati.

| k | valutazioni (genoma × barra) | decisioni diverse tra r e k r | decisioni diverse tra r e la sua forma proposta | hash diversi su 200 genomi |
|---|---|---|---|---|
| 2 | 1107400 | 0 | 0 | 0 |
| 3 | 1107400 | 0 | 0 | 194 |
| 8 | 1107400 | 0 | 0 | 0 |
| 0,5 | 1107400 | 0 | 0 | 0 |
| 2^-20 | 1107400 | 0 | 0 | 0 |
| 0,7 | 1107400 | 0 | 0 | 196 |
| casuale | 1107400 | 0 | 0 | da 197 a 199 |

Con `k` non potenza di 2 una decisione può cambiare solo quando il punteggio cade a ridosso di una soglia: sulle serie provate non succede mai, ma succede in un caso costruito apposta mettendo la soglia sul punteggio. Il caso: 7 pesi uniformi in [-2; 2], 7 ingressi uniformi in [-0,1; 0,1], la soglia alta uguale al punteggio oppure (metà dei casi) appena sopra, di circa un'ultima cifra; la decisione cambia 44132 volte su 200000 con `k` = 3 e 0 volte con `k` = 8. Gli equivalenti con `k` qualsiasi non nascono comunque durante l'evoluzione: nessun operatore proposto moltiplica un genoma per una costante (la sola eccezione è la rinormalizzazione di Q5 c).

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

Le cifre sono le stesse, la forma no: Python sceglie la stringa più corta che ridà il numero [10], Node segue l'algoritmo di ECMAScript [13, non letto], e qui le cifre coincidono solo sugli esempi della tabella. Anche gli arrotondamenti differiscono, un `NaN` passa senza errore (Node lo scrive `null`, Python `NaN`) e un overflow dà 0 in Node e un errore in Python; la seconda tabella ha una riga per operazione, con le funzioni usate (prima quella di Node, poi quella di Python):

| operazione | Node | Python |
|---|---|---|
| 1,25 a 2 cifre (Node `toPrecision(2)`; Python `format(x, ".1e")`) | 1.3 | 1.2e+00 |
| 2,5 a 1 cifra (`toPrecision(1)`; `format(x, ".0e")`) | 3 | 2e+00 |
| arrotondamento di 2,5 all'intero (`Math.round`; `round`) | 3 | 2 |
| NaN in JSON (`JSON.stringify`; `json.dumps`) | null | NaN |
| 1/(1+e^710) (`Math.exp`; `math.exp`) | 0 | OverflowError |

**Domanda Q11 — scrittura dei numeri.** Opzioni, proposta e criterio sono in [«In breve»](#in-breve), gli effetti di ogni opzione nel [capitolo 11](#11-domande-per-luca). In più, per (b): la funzione Python andrebbe provata su vettori di prova; esistono implementazioni di JCS, lo schema di RFC 8785, in più linguaggi [11], non provate qui.

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

**Domanda Q3 — genomi quasi uguali.** Opzioni, proposta e criterio sono in [«In breve»](#in-breve), gli effetti di ogni opzione nel [capitolo 11](#11-domande-per-luca). Come si calcolerebbe la **chiave di quasi-duplicato** dell'opzione (b): lo stesso testo canonico, con lo schema `lin7-a1-v1-near24`, e con ogni numero arrotondato a 24 bit di frazione, cioè 24 cifre binarie dopo il bit implicito della mantissa (25 cifre binarie significative, circa 7,5 cifre decimali; precisione scelta dall'autore, `[ipotesi]`); la chiave si segnala a parte. L'operazione è intera sui 64 bit del numero, come `roundBits` in `ref/genome.mjs`: si tolgono gli ultimi 28 dei 52 bit di frazione arrotondando al pari (un riporto che passa nell'esponente è corretto; -0 e 0 restano 0); un numero subnormale si arrotonda sullo stesso campo, quindi a un multiplo di 2^-1046 (5e-324 diventa 0). La stessa operazione scritta in Python dà gli stessi bit di Node su 20022 valori, compresi quelli dell'Esempio 5 e del vettore T3 (`ref/check-corrections.mjs`). I 24 bit di frazione non vanno confusi con la precisione di un `float32`, che ha 23 bit di frazione: con 23 bit la coppia di numeri vicini a 25 dell'Esempio 5 avrebbe la stessa chiave. Con l'opzione (c) la conversione numero-griglia va specificata, perché i linguaggi arrotondano diversamente i pareggi (in Node `Math.round(2.5)` = 3, in Python `round(2.5)` = 2).

**Domanda Q4 — impronta delle decisioni.** Opzioni, proposta e criterio sono in [«In breve»](#in-breve), gli effetti di ogni opzione nel [capitolo 11](#11-domande-per-luca). Un'**impronta di comportamento** è l'hash della sequenza di decisioni del genoma su un insieme di prova fisso e versionato, che non sono dati di valutazione (per esempio il dataset inventato seguito da 3000 barre della serie sintetica di R2: 3020 barre, contro le 2517 dello snapshot ENI; il costo è una simulazione in più per genoma su quelle barre). Fuori dai dati di valutazione perché l'impronta resti la stessa quando R6 sceglie o cambia quei dati `[ipotesi]`; versionata vuol dire che il nome dell'insieme di prova e la versione del decodificatore entrano nel testo dell'impronta; va calcolata sempre dallo stesso programma (E2, in Node), perché i punteggi sono uguali nei bit solo dentro uno stesso programma (1.4). Che cosa ne farebbe E3: un controllo automatico (stesso hash deve dare stessa impronta) e, per esempio, trattare i genomi con la stessa impronta come i duplicati di hash, segnalandoli o riducendone la pressione di selezione `[ipotesi]`. In prova (`ref/fingerprint.mjs`) 600 coppie equivalenti hanno dato 0 incoerenze, 300 coppie di genomi casuali indipendenti 0 impronte uguali, e G1 e G5 hanno hash diversi ma la stessa impronta.

## 8. Dipendenze da R4

R4 (#8) sceglierà le equazioni di decisione. La tabella dice, per ogni sua scelta, che cosa cambia nella codifica; nessuna riga decide per R4. La regola generale: **ogni simmetria usata dalla forma canonica vale solo se R4 la conserva**, e R4 deve dire quali di S1-S6 sopravvivono. Se R4 rompe una simmetria e la forma canonica continua a usarla, l'hash unisce genomi **non** equivalenti, senza alcun errore. Tre termini da sapere: l'**isteresi** usa soglie diverse per entrare e per uscire da una posizione, così la decisione non oscilla da un giorno all'altro; una **saturazione del punteggio** è una funzione che lo limita (per esempio a ±1); un **cancello** (caso di studio R7) è un ingresso che accende o spegne gli altri.

| Scelta di R4 | Opzioni | Effetto sulla codifica |
|---|---|---|
| R4-1 quota investita, stop loss, take profit | costanti; geni | +0 o +3 geni; con geni servono intervalli (V5), passi propri e la simmetria S6; con costanti entrano nella versione del decodificatore |
| R4-2 omogeneità della regola | regola come oggi; isteresi o soglie in più proporzionali alla zona di attesa; termini fissi (isteresi in unità assolute, saturazione del punteggio, soglie costanti) | i primi due conservano S1 e la proposta a 15 geni; i termini fissi rompono S1: la semi-ampiezza torna gene (16) e la forma canonica non divide più |
| R4-3 agitazione (ATR normalizzato) | assente; divisore di un ingresso; fattore del punteggio | non rompe S1; +1 gene per il suo `τ` (più uno per un esponente); un divisore applicato a una sola delle due distanze rompe S2; con peso nullo dell'ingresso diviso anche il `τ` dell'ATR diventa irrilevante (S4 esteso) |
| R4-4 decisioni durante l'avvio | come oggi; regola fissa; gene | 0 o 1 gene (intero o costante); la regola entra nel decodificatore |
| R4-5 ingressi riusati fuori dalla somma (prodotti, «cancelli» di R7) | assenti; presenti | per quell'ingresso S4 non vale più; nuovi geni come righe della tabella |

**Domanda Q2 — numeri del `Trader`.** Opzioni, proposta e criterio sono in [«In breve»](#in-breve), gli effetti di ogni opzione nel [capitolo 11](#11-domande-per-luca); la riga R4-1 della tabella sopra dice che cosa cambia nella codifica in ciascun caso.

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

Le undici domande di «In breve», nello stesso ordine (prima Q5 e Q6, che cambiano la forma dei geni). Per ognuna: il problema in una frase, poi una tabella con una riga per opzione; le colonne dicono quanti geni ha il genoma, che cosa cambia nei vincoli e negli operatori, che cosa cambia nella forma canonica e nell'hash, e quando scegliere l'opzione. «Stessi» vuol dire come nella proposta (15 geni).

**Q5 — Soglie e scala comune** (4.2; esempio in [12.3](#123-q5-soglie-e-scala-comune)). Moltiplicare pesi e soglie per lo stesso numero positivo non cambia le decisioni ma cambia l'effetto degli operatori; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) centro `b`, soglie `b ± 1` (proposta) | 15 | V3 impossibile da violare; nessuna scala da gestire | nessuna divisione; stesso hash, stesse decisioni (stesso programma) | R4 resta omogenea (se poi aggiunge un termine fisso: 16 geni, nuovo schema, hash nuovi) |
| (b) due soglie libere, mai rinormalizzate | 16 | V3: soglie invertite scambiate o rifiutate, soglie uguali rifiutate; la scala è un passo di mutazione nascosto | divisione per `h`, poi lo stesso testo di (a); stesso hash, stesse decisioni quasi sempre (non quando il punteggio cade entro un arrotondamento da una soglia, 7.1); senza divisione se R4 aggiunge termini fissi | vuoi le soglie come numeri del catalogo, o R4 aggiungerà termini fissi |
| (c) due soglie libere, rinormalizzate prima dell'incrocio | 16 salvati; semi-ampiezza riportata a 1 prima di ogni incrocio | come (b), più la rinormalizzazione, che cambia i figli prodotti | come (b) | vuoi soglie libere ma genitori alla stessa scala (solo con regola omogenea) |

**Q6 — Gene della memoria** (4.3; esempio in [12.4](#124-q6-passo-sulla-memoria)). Lo stesso passo su `c` cambia l'età media di fattori molto diversi secondo la memoria, poco una corta e moltissimo una lunga; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) `τ` = ln(età media) (proposta) | stessi | V1 con riflessione in [ln 0,5; ln 100]; un passo moltiplica l'età media per lo stesso fattore | testo con i `τ` | vuoi passi proporzionati a ogni memoria |
| (b) `c` direttamente | stessi | V1 su `c` in [0,0099; 0,6667]; passo lineare; bordi con la regola di Q10 (riflessione con Q10 a, saturazione con Q10 b) | testo con i `c`: altro schema, hash diversi da (a) per lo stesso comportamento | vuoi leggere i `c` del catalogo e di Consilium |

**Q1 — Segno delle soglie** (3.2; esempio in [12.5](#125-q1-decisioni-senza-segnali)). Decide se con tutti gli ingressi a 0 la strategia può comprare o vendere; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) `b` tra -5 e 5 (proposta) | stessi | intervallo di `b` | tre classi per i genomi a pesi nulli (`buy`, `hold`, `sell`) | permetti acquisti o vendite «per default» |
| (b) `b` tra -1 e 1 | stessi | intervallo di `b` | una sola classe (`hold`) | senza segnali non si deve fare nulla |

**Q7 — Margine tra le due velocità** (3.1; esempio in [12.6](#126-q7-due-memorie-vicine)). Con memorie vicine le due distanze diventano quasi lo stesso ingresso; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) lenta almeno il doppio della veloce, δ = ln 2 (proposta) | stessi | V2 con scambio e rifiuto | nessun effetto | vuoi due velocità davvero diverse |
| (b) nessun margine, δ = 0 | stessi | basta `τ1 < τ2`; l'uguaglianza esatta si rifiuta | conta l'ordine deterministico del passo 5 (7.1) | non vuoi vietare velocità vicine |
| (c) un altro rapporto minimo | stessi | V2 con un altro δ | nessun effetto | hai un rapporto in mente, per esempio 1,25 o 4 |

**Q8 — Intervalli** (3.2; esempio in [12.7](#127-q8-limite-alto-della-memoria)). Gli intervalli sono scelte dell'autore senza fonte; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) età media 0,5-100 per tutti, W_i della tabella 3.2 (proposta) | stessi | stessi limiti per le 7 memorie | costanti e versione dello schema | basta un intervallo largo, da rivedere con R6 |
| (b) limiti per ingresso | stessi | limiti diversi; le due distanze sempre con lo stesso | altre costanti, altra versione dello schema | vuoi già ora memorie diverse per ingressi diversi |
| (c) limite alto della memoria dall'avvio di R6 | stessi | limite alto di `τ` uguale per tutti, dall'avvio (12.7) | altre costanti, altra versione dello schema | vuoi legare il limite alto all'avvio di R6 |

**Q9 — Incrocio** (5.3; esempio in [12.8](#128-q9-figli-di-un-incrocio)). Decide se peso e memoria restano insieme e se il figlio va corretto; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) per blocchi, distanze insieme (proposta) | stessi | nessuna correzione: 0 figli invalidi su 100000 | nessun effetto | vuoi tenere ogni peso con la sua memoria |
| (b) uniforme gene per gene, come Consilium | stessi | 17658 figli su 100000 violano V2: scambio e rifiuto | nessun effetto | vuoi restare vicino al codice di Consilium |
| (c) intermedio, stesso peso α per tutti i geni | stessi | 3543 su 100000 escono per arrotondamento: riporto e rifiuto | nessun effetto | vuoi figli a metà strada, sapendo che la media restringe la popolazione |

**Q10 — Mutazione** (5.3; esempio in [12.9](#129-q10-una-mutazione-vicino-al-bordo)). Decide la forma del passo e il trattamento dei bordi; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) gaussiana al 5 % dell'intervallo, con riflessione (proposta) | stessi | intervalli per riflessione; V2 con scambio e rifiuto | nessun effetto | non vuoi accumuli sui bordi |
| (b) uniforme ±5 % con saturazione, come Consilium | stessi | intervalli per saturazione (valori fermi sul bordo); V2 con scambio e rifiuto | nessun effetto | vuoi la stessa regola di Consilium |
| (c) polinomiale limitata | stessi | intervalli per costruzione (il passo si accorcia vicino al bordo); V2 con scambio e rifiuto | nessun effetto | vuoi una legge del passo che resta nei limiti senza riflessione |

**Q2 — Numeri del `Trader`** (capitolo 8; perché non c'è un esempio: [12.10](#1210-q2-nessun-esempio)). Quota investita, stop loss e take profit possono essere geni o costanti; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) contati a parte, 0 o 3 geni secondo R4 (proposta) | 15 ora, 15 o 18 dopo R4 | V5 da R4 | da R4 | lasci la scelta a chi scrive le equazioni |
| (b) geni già ora | 18 | V5 (intervalli), passi propri | simmetria S6 in più | hai già deciso che evolvono |
| (c) costanti già ora | 15 | nessuno | le costanti entrano nella versione del decodificatore | hai già deciso che sono fisse |

**Q3 — Genomi quasi uguali** (7.4; esempio in [12.11](#1211-q3-due-genomi-quasi-uguali)). L'hash riconosce solo equivalenze dimostrate; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) solo hash esatto (proposta) | stessi | nessuno | un hash | ti basta sapere quali genomi sono certamente uguali |
| (b) hash esatto più chiave di quasi-duplicato a 24 bit di frazione | stessi | nessuno | una seconda chiave, arrotondata al pari sui bit (7.4); unisce genomi che possono decidere diversamente e separa coppie a cavallo di un arrotondamento | vuoi contare anche i genomi praticamente uguali |
| (c) geni su una griglia di interi | stessi, a passi | operatori a passi interi; conversione numero-griglia da specificare | hash esatto senza decimali | preferisci un genoma a passi discreti |

**Q4 — Impronta delle decisioni** (7.4; esempio in [12.12](#1212-q4-genomi-che-non-decidono-mai)). Segnalerebbe genomi che decidono uguale senza una simmetria dimostrata; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) no (proposta) | stessi | nessuno | solo l'hash | una simulazione in più per genoma non vale l'informazione |
| (b) sì, su un insieme di prova fisso e versionato | stessi | una simulazione in più per genoma su 3020 barre, sempre con lo stesso programma | impronta accanto all'hash; controllo «stesso hash, stessa impronta» | vuoi segnalare anche i genomi uguali in pratica |

**Q11 — Scrittura dei numeri nell'hash** (7.2; esempio in [12.13](#1213-q11-lo-stesso-genoma-in-node-e-in-python)). Node e Python scrivono i decimali in modo diverso; una riga per opzione:

| Opzione | Geni | Vincoli e operatori | Forma canonica e hash | Scegli se |
|---|---|---|---|---|
| (a) esadecimale binary64 (proposta) | stessi | nessuno | testo uguale in Node (dove gira il genoma) e Python (dove si verifica) per costruzione | il testo serve solo alle macchine |
| (b) decimale RFC 8785 con funzione Python dedicata | stessi | nessuno | funzione da scrivere e provare con vettori di prova; hash diversi da (a) | vuoi leggere il testo a occhio |

## 12. Esempi per le scelte

Questo capitolo mostra su numeri piccoli che cosa vedrebbe Luca con ciascuna opzione delle domande, nell'ordine di «In breve» e del capitolo 11. I dati sono **inventati** apposta (12.1): non sono prezzi ENI né il dataset di 20 giorni del catalogo. Ogni esempio mette tutte le opzioni di una domanda sugli stessi dati e dice soltanto che cosa cambia; non dice quale opzione sia migliore, e la proposta resta quella di «In breve». I genomi Z1-Z12 sono scelti a mano e i loro nomi servono solo a ritrovarli. Tutti i numeri vengono da `ref/examples-fictitious.mjs` (uscita `out/examples-fictitious.md`) e sono ricontrollati sul testo da `ref/check-examples-fictitious.mjs`.

### 12.1 I due dataset inventati

**Gradino** (10 barre di prezzo): la chiusura vale 10 per tre giorni e 11 dal giorno 4 in poi; apertura uguale alla chiusura del giorno prima ma non fuori da massimo e minimo (il giorno 4 apre in rialzo a 10,9), massimo e minimo a 0,1 dalla chiusura, volume costante. È costruito per vedere come una media esponenziale insegue un salto (12.2) e quanto si somigliano due memorie vicine (12.6). La tabella ha una riga per giorno, con i cinque numeri della barra.

| giorno | apertura | massimo | minimo | chiusura | volume |
|---|---|---|---|---|---|
| 1 | 10,0 | 10,1 | 9,9 | 10,0 | 1000 |
| 2 | 10,0 | 10,1 | 9,9 | 10,0 | 1000 |
| 3 | 10,0 | 10,1 | 9,9 | 10,0 | 1000 |
| 4 | 10,9 | 11,1 | 10,9 | 11,0 | 1000 |
| 5 | 11,0 | 11,1 | 10,9 | 11,0 | 1000 |
| 6 | 11,0 | 11,1 | 10,9 | 11,0 | 1000 |
| 7 | 11,0 | 11,1 | 10,9 | 11,0 | 1000 |
| 8 | 11,0 | 11,1 | 10,9 | 11,0 | 1000 |
| 9 | 11,0 | 11,1 | 10,9 | 11,0 | 1000 |
| 10 | 11,0 | 11,1 | 10,9 | 11,0 | 1000 |

**Ingressi pronti** (10 giorni): i 7 ingressi `x1 … x7` sono già dati, scelti a mano e non calcolati da prezzi, con grandezze simili a quelle tipiche di 3.2; nei giorni 4 e 5 valgono tutti 0, e il giorno 9 `x1` vale 0,03125 (cioè 2^-5, un numero esatto in binario). Serve a Q5, Q1 e Q3, dove conta il punteggio e non il modo in cui gli ingressi nascono. La tabella ha una riga per giorno e una colonna per ingresso.

| giorno | x1 | x2 | x3 | x4 | x5 | x6 | x7 |
|---|---|---|---|---|---|---|---|
| 1 | 0,010 | 0,020 | 0,400 | -0,010 | 0,300 | 0,100 | 0,300 |
| 2 | 0,030 | 0,040 | 0,600 | 0,000 | 0,500 | 0,200 | 0,500 |
| 3 | 0,005 | 0,015 | 0,200 | -0,020 | 0,100 | -0,100 | 0,100 |
| 4 | 0,000 | 0,000 | 0,000 | 0,000 | 0,000 | 0,000 | 0,000 |
| 5 | 0,000 | 0,000 | 0,000 | 0,000 | 0,000 | 0,000 | 0,000 |
| 6 | -0,010 | -0,005 | -0,300 | -0,030 | -0,200 | 0,050 | -0,200 |
| 7 | -0,030 | -0,020 | -0,600 | -0,050 | -0,400 | 0,200 | -0,500 |
| 8 | -0,015 | -0,025 | -0,200 | -0,060 | 0,100 | -0,100 | -0,300 |
| 9 | 0,03125 | 0,010 | 0,100 | -0,040 | 0,200 | 0,000 | 0,100 |
| 10 | 0,020 | 0,030 | 0,500 | -0,010 | 0,400 | 0,300 | 0,400 |

### 12.2 Come una EMA insegue un salto

Sul gradino il prezzo passa da 10 a 11 il giorno 4. Con età media 1 (`c` = 0,5) la EMA copre ogni giorno metà della distanza che le resta (10,5; 10,75; 10,875 …); con età media 4 (`c` = 0,2) ne copre un quinto (10,2; 10,36; 10,488 …). Perché «età media»: con `c` = 0,5 i dati di 0, 1, 2 e 3 barre prima pesano 0,5; 0,25; 0,125; 0,0625, e la media delle età con questi pesi, continuando la serie all'infinito, è 1 barra; con `c` = 0,2 pesano 0,2; 0,16; 0,128; 0,1024, e la media, allo stesso modo, è 4 barre. L'ingresso `x1 = ln(C/EMA)` il giorno 4 vale 0,0465 con età 1 e 0,0755 con età 4; il giorno 10 vale 0,0007 e 0,0192: la memoria corta ha quasi «dimenticato» il salto, la lunga no. La tabella ha una riga per giorno: la chiusura, le due EMA e i due valori dell'ingresso.

| giorno | chiusura | EMA con eta' media 1 | EMA con eta' media 4 | x con eta' media 1 | x con eta' media 4 |
|---|---|---|---|---|---|
| 1 | 10 | 10,0000 | 10,0000 | 0,0000 | 0,0000 |
| 2 | 10 | 10,0000 | 10,0000 | 0,0000 | 0,0000 |
| 3 | 10 | 10,0000 | 10,0000 | 0,0000 | 0,0000 |
| 4 | 11 | 10,5000 | 10,2000 | 0,0465 | 0,0755 |
| 5 | 11 | 10,7500 | 10,3600 | 0,0230 | 0,0599 |
| 6 | 11 | 10,8750 | 10,4880 | 0,0114 | 0,0477 |
| 7 | 11 | 10,9375 | 10,5904 | 0,0057 | 0,0379 |
| 8 | 11 | 10,9688 | 10,6723 | 0,0028 | 0,0302 |
| 9 | 11 | 10,9844 | 10,7379 | 0,0014 | 0,0241 |
| 10 | 11 | 10,9922 | 10,7903 | 0,0007 | 0,0192 |

### 12.3 Q5 soglie e scala comune

Due genomi a 16 numeri che decidono sempre uguale, sugli ingressi pronti: Z1 (pesi 20, 10, 1, 10, 1, 1, 1; soglie 1 e -1; `τ` di G1) e Z2 = 8 × Z1 (pesi 160, 80, 8, 80, 8, 8, 8; soglie 8 e -8).

- **(a)** Z1 e Z2 sono lo stesso genoma: centro `b` = 0 e i pesi di Z1 (Z2 diviso per `h` = 8 dà Z1 nei bit, con lo stesso hash). Un incrocio tra i due dà ancora Z1.
- **(b)** Restano due genomi diversi. Un figlio che prende i pesi da uno e le soglie dall'altro (succede con ogni incrocio che passa le soglie separate dai pesi) decide in modo diverso dai genitori: in 6 giorni su 10 con i pesi di Z1 e le soglie di Z2 (sempre `hold`), in 2 con l'inverso.
- **(c)** Prima dell'incrocio Z2 è riportato a semi-ampiezza 1 e diventa Z1: il figlio è Z1, come con (a). La differenza da (a) è altrove: si salvano 16 numeri, tra un incrocio e l'altro la mutazione sposta di nuovo la scala, e vale solo con regola omogenea.

Lo stesso vale per la mutazione finché un genoma resta alla sua scala (con (b) sempre, con (c) fino al suo incrocio successivo): un passo di +25 su `w1` alza il punteggio del giorno 2 (`x1` = 0,03) di 0,75, cioè di 0,75 semi-ampiezze in Z1 e di 0,0938 in Z2; Z1 cambia decisione in 1 giorno, il 9 (punteggio da 0,72 a 1,51: da `hold` a `buy`), Z2 in 0. La tabella ha una riga per giorno: i punteggi dei genitori, la loro decisione comune e quella dei due figli misti possibili con (b).

| giorno | punteggio di Z1 | punteggio di Z2 | Z1 e Z2 | figlio pesi Z1, soglie Z2 | figlio pesi Z2, soglie Z1 |
|---|---|---|---|---|---|
| 1 | 1,40 | 11,20 | buy | hold | buy |
| 2 | 2,80 | 22,40 | buy | hold | buy |
| 3 | 0,35 | 2,80 | hold | hold | buy |
| 4 | 0,00 | 0,00 | hold | hold | hold |
| 5 | 0,00 | 0,00 | hold | hold | hold |
| 6 | -1,20 | -9,60 | sell | hold | sell |
| 7 | -2,60 | -20,80 | sell | hold | sell |
| 8 | -1,65 | -13,20 | sell | hold | sell |
| 9 | 0,72 | 5,80 | hold | hold | buy |
| 10 | 2,20 | 17,60 | buy | hold | buy |

### 12.4 Q6 passo sulla memoria

Tre memorie di partenza (età media 1, 9 e 49 barre) e un passo lungo il 5 % dell'intervallo del gene, in su e in giù: 0,2649 su `τ`, 0,0328 su `c` (intervallo di `c` con Q8 a, da 0,0099 a 0,6667). È la σ con Q10 a e il passo massimo con Q10 b.

- **(a) `τ`:** ogni passo moltiplica o divide l'età media per 1,303, a qualunque memoria.
- **(b) `c`:** lo stesso passo cambia l'età media di fattori diversi secondo la memoria: poco la corta (da 1 a 0,88 o 1,14 barre), di più quella di 9 barre (a 6,53 o 13,9) e molto la lunga (da 49 a 17,9 barre). Da 49 il passo in giù porta `c` a -0,0128, fuori dall'intervallo, e il risultato dipende da Q10: 29,6 barre con la riflessione (Q10 a), 100 con la saturazione (Q10 b).

Il caso di 4.3, da `c` = 0,99 (età media 0,01) con il passo di Consilium, è fuori dall'intervallo di V1: lì il passo cambia di più la memoria cortissima. La tabella ha una riga per memoria di partenza (con il suo `c`) e una colonna per passo; ogni cella è l'età media dopo il passo, in barre (aumentare `c` accorcia la memoria, diminuirlo la allunga).

| eta' media di partenza (c) | tau + passo | tau - passo | c + passo | c - passo, con Q10 a | c - passo, con Q10 b |
|---|---|---|---|---|---|
| 1 (0,50) | 1,30 | 0,77 | 0,88 | 1,14 | 1,14 |
| 9 (0,10) | 11,7 | 6,91 | 6,53 | 13,9 | 13,9 |
| 49 (0,02) | 63,9 | 37,6 | 17,9 | 29,6 | 100,0 |

### 12.5 Q1 decisioni senza segnali

Il genoma Z1 nella forma proposta (pesi 20, 10, 1, 10, 1, 1, 1) con quattro centri `b`, sugli ingressi pronti; nei giorni 4 e 5 il punteggio è 0 perché tutti gli ingressi valgono 0.

- **(a) `b` da -5 a 5:** tutte e quattro le colonne sono genomi ammessi. Con `b` = -1,5 si compra anche nei giorni 4 e 5 (7 `buy`, 2 `hold`, 1 `sell`); con `b` = 1,5 si vende (1 `buy`, 3 `hold`, 6 `sell`).
- **(b) `b` da -1 a 1:** le colonne -1,5 e 1,5 non sono genomi ammessi; nei giorni 4 e 5 ogni genoma ammesso resta in `hold`.

Con entrambe restano ammessi `b` = -1 (5 `buy`, 4 `hold`, 1 `sell`) e `b` = 0 (3 `buy`, 4 `hold`, 3 `sell`). La tabella ha una riga per giorno: il punteggio e la decisione con ciascun `b`.

| giorno | punteggio | b = -1,5 | b = -1 | b = 0 | b = 1,5 |
|---|---|---|---|---|---|
| 1 | 1,40 | buy | buy | buy | hold |
| 2 | 2,80 | buy | buy | buy | buy |
| 3 | 0,35 | buy | buy | hold | sell |
| 4 | 0,00 | buy | hold | hold | sell |
| 5 | 0,00 | buy | hold | hold | sell |
| 6 | -1,20 | hold | hold | sell | sell |
| 7 | -2,60 | sell | sell | sell | sell |
| 8 | -1,65 | hold | hold | sell | sell |
| 9 | 0,72 | buy | buy | hold | hold |
| 10 | 2,20 | buy | buy | buy | hold |

### 12.6 Q7 due memorie vicine

Sul gradino, la distanza veloce `x1` con età media 1 e la lenta `x2` con età media 1,25, 2 o 4 (rapporto 1,25, 2 o 4; `τ2 - τ1` = 0,2231, 0,6931, 1,3863). Con rapporto 1,25 le due colonne quasi coincidono; con 4 la lenta resta lontana dal prezzo più a lungo. Il genoma Z3 (`w1` = 40, `w2` = -40, gli altri pesi 0, `b` = 0) guarda solo la loro differenza: il suo punteggio arriva al più a -0,22 con rapporto 1,25, a -0,73 con 2 e a -1,48 con 4 (giorno 5), quindi vende in 0, 0 e 5 giorni su 10. Con i pesi al limite di 3.2 (`w1` = 250, `w2` = -250) il punteggio arriva a -1,37 anche con rapporto 1,25 e vende in 3 giorni: pesi grandi compensano memorie vicine, come dice il problema di Q7.

- **(a) rapporto almeno 2:** ammessi i rapporti 2 e 4; con la veloce a età 1 è vietata ogni lenta sotto età 2, come quella della colonna 1,25.
- **(b) nessun margine:** ammessi tutti e tre.
- **(c) un altro rapporto:** con 1,25 ammessi tutti e tre, con 4 solo 4.

La tabella ha una riga per giorno e una colonna per memoria; ogni cella è il valore dell'ingresso.

| giorno | x1, eta' media 1 | x2, eta' media 1,25 | x2, eta' media 2 | x2, eta' media 4 |
|---|---|---|---|---|
| 1 | 0,0000 | 0,0000 | 0,0000 | 0,0000 |
| 2 | 0,0000 | 0,0000 | 0,0000 | 0,0000 |
| 3 | 0,0000 | 0,0000 | 0,0000 | 0,0000 |
| 4 | 0,0465 | 0,0518 | 0,0625 | 0,0755 |
| 5 | 0,0230 | 0,0285 | 0,0412 | 0,0599 |
| 6 | 0,0114 | 0,0157 | 0,0273 | 0,0477 |
| 7 | 0,0057 | 0,0087 | 0,0181 | 0,0379 |
| 8 | 0,0028 | 0,0048 | 0,0120 | 0,0302 |
| 9 | 0,0014 | 0,0027 | 0,0080 | 0,0241 |
| 10 | 0,0007 | 0,0015 | 0,0053 | 0,0192 |

### 12.7 Q8 limite alto della memoria

Quale età media massima ammette ciascuna opzione, secondo l'avvio che sceglierà R6.

- **(a) età media da 0,5 a 100 per tutti:** il limite alto resta 100 barre qualunque avvio R6 scelga; un genoma con età 100 ha un avvio di 302 barre. Con un avvio di 60, un genoma con età oltre 19,5 sarebbe valutato mentre la sua media dipende ancora dal primo valore per più del 5 %.
- **(b) limiti per ingresso:** non ha un dato da mostrare qui: dipende da quali memorie si vogliono per quali ingressi.
- **(c) limite alto dall'avvio di R6:** il limite è l'età media più lunga il cui valore iniziale pesa meno del 5 % (soglia dell'autore, `[ipotesi]`, 3.2) alla fine di quell'avvio: 19,5 barre con un avvio di 60, circa 100 con 302.

La tabella ha una riga per avvio: il `c` minimo, l'età media massima e il `τ` massimo che ne seguono.

| avvio scelto da R6 (barre) | c minimo | eta' media massima | tau massimo |
|---|---|---|---|
| 30 | 0,0950 | 9,5 | 2,2537 |
| 60 | 0,0487 | 19,5 | 2,9721 |
| 120 | 0,0247 | 39,6 | 3,6778 |
| 302 | 0,0099 | 100,3 | 4,6083 |

### 12.8 Q9 figli di un incrocio

Due genitori validi: Z4 con memorie delle due distanze di età 1 e 8 (`w1` = 100, `w2` = 20) e Z5 con età 6 e 30 (`w1` = 30, `w2` = 60); gli altri geni non contano qui.

- **(a) per blocchi:** il figlio prende entrambe le memorie (e i loro pesi) da un genitore: rapporto 8 o 5, sempre valido. I figli hanno solo le due coppie di memorie dei genitori, nessuna combinazione nuova delle due memorie.
- **(b) gene per gene:** delle quattro combinazioni di `τ1` e `τ2` una viola V2 con Q7 a (con Q7 b nessuna): `τ1` da Z5 e `τ2` da Z4 danno età 6 e 8, rapporto 1,33 (`τ2 - τ1` = 0,2877, sotto ln 2 = 0,6931), da rifiutare (lo scambio non serve: la veloce è già prima). Lo stesso figlio porta il peso `w1` = 100 di Z4, che stava con una memoria di 1 barra, insieme alla memoria di 6 barre di Z5. Le altre due combinazioni hanno le memorie delle due righe di (a).
- **(c) intermedio:** con α = 0,5 ogni gene è la media dei genitori: età 2,45 e 15,49 (la media dei `τ` dà la media geometrica delle età, √(1·6) e √(8·30)), rapporto 6,32, valido con Q7 a; i pesi diventano `w1` = 65 e `w2` = 40. Ogni gene del figlio sta tra quelli dei genitori: ripetuta, la media restringe la popolazione verso il centro.

La tabella ha una riga per figlio possibile: le due età medie, il loro rapporto e se rispetta il margine.

| figlio | eta' media veloce | eta' media lenta | rapporto | rispetta V2 con Q7 a (rapporto almeno 2) |
|---|---|---|---|---|
| (a) blocco delle distanze da Z4 | 1,00 | 8,00 | 8,00 | sì |
| (a) blocco delle distanze da Z5 | 6,00 | 30,00 | 5,00 | sì |
| (b) τ1 da Z4, τ2 da Z5 | 1,00 | 30,00 | 30,00 | sì |
| (b) τ1 da Z5, τ2 da Z4 | 6,00 | 8,00 | 1,33 | no |
| (c) intermedio, α = 0,5 | 2,45 | 15,49 | 6,32 | sì |

### 12.9 Q10 una mutazione vicino al bordo

Con Q6 a e Q8 a, un `τ` vicino al bordo alto: 4,5 (età media 90), con il bordo a ln 100 = 4,6052; passo 0,2649; 100000 mutazioni per opzione (seme 1215).

- **(a) gaussiana con riflessione:** il 34,73 % dei passi esce ed è riflesso dentro; nessun valore resta sul bordo e il 2,80 % finisce a meno di 0,01 da esso. Un passo con `z` = 1,5 arriva a 4,8974 e torna a 4,3130.
- **(b) uniforme con saturazione:** il 30,03 % dei passi esce e si ferma esattamente sul bordo. Un passo con `u` = 0,9 vale (2u - 1) × 0,2649 = +0,2119, arriva a 4,7119 e si ferma a 4,6052. La regola di Consilium satura `c`; qui la stessa regola è applicata a `τ`.
- **(c) polinomiale limitata:** nessun passo esce; il 3,91 % finisce a meno di 0,01 dal bordo. Con l'estrazione 0,9 il passo va verso il bordo alto e non può superare la distanza dal bordo (0,1052): il valore va a 4,5805. La formula è quella di `mutPolynomialBounded`, non ripetuta qui.

Per (c) l'esempio usa la formula del codice di DEAP (`mutPolynomialBounded` [3], letto per questo esempio) con l'indice di distribuzione `η_m` = 20 `[ipotesi]` (diverso dall'η di `τ2 = τ1 + e^η`); è un calcolo illustrativo, non una prova degli operatori come quelle di 5.2. Lo spostamento medio dipende dalla legge del passo (e da η), quindi non confronta le opzioni a parità di passo. La tabella ha una riga per opzione; le colonne contano i passi usciti, i valori finiti esattamente sul bordo e quelli vicini, e danno lo spostamento medio.

| opzione | passi usciti dall'intervallo | valori finiti esattamente su ln 100 | spostamento medio | valori a meno di 0,01 da ln 100 |
|---|---|---|---|---|
| (a) gaussiana con riflessione | 34,73 % | 0,00 % | 0,1531 | 2,80 % |
| (b) uniforme con saturazione | 30,03 % | 30,03 % | 0,1086 | 31,92 % |
| (c) polinomiale limitata | 0,00 % | 0,00 % | 0,1451 | 3,91 % |

### 12.10 Q2 nessun esempio

Le tre opzioni di Q2 cambiano solo se quota investita, stop loss e take profit sono numeri del genoma o costanti; il loro effetto sulle decisioni dipende dalle equazioni di R4, che gli script di questo documento non modellano. Un esempio dovrebbe inventare una regola di R4, quindi non c'è; il conteggio dei geni per ogni opzione è nella tabella di Q2 del capitolo 11.

### 12.11 Q3 due genomi quasi uguali

Sugli ingressi pronti, Z6 ha `w1` = 32 e gli altri pesi 0 (`b` = 0, `τ` di G1); Z7 è uguale con `w1` = 32.0000004 e Z12 con `w1` = 31.999999999999996, il numero binary64 prima di 32. Il giorno 9 (`x1` = 0,03125) il punteggio di Z6 è esattamente 1, uguale alla soglia alta: `hold`; quello di Z7 è 1.0000000125: `buy`; quello di Z12 è 0.9999999999999999: `hold`. Negli altri 9 giorni decidono tutti e tre uguale. Z7 è costruito mettendo il punteggio di Z6 esattamente sulla soglia: è il caso in cui una differenza minima cambia una decisione (anche il numero binary64 dopo 32 la cambia). Z12 è il caso opposto: decide come Z6 in tutti i 10 giorni.

- **(a) solo hash esatto:** Z6, Z7 e Z12 hanno tre hash diversi e nulla li collega: restano separati Z6 e Z7, che decidono diversamente il giorno 9, e anche Z6 e Z12, che decidono uguale ogni giorno.
- **(b) chiave a 24 bit:** il `w1` di Z7 e quello di Z12 arrotondati a 24 bit di frazione sono 32, quindi le tre chiavi sono uguali e i tre genomi sono segnalati come quasi-duplicati: Z12 con Z6, che decidono uguale, e anche Z7, che decide diversamente il giorno 9. Il caso opposto, due numeri vicinissimi con chiavi diverse, è nell'Esempio 5.
- **(c) griglia:** con una griglia di passo 2^-10 sui pesi (passo scelto per l'esempio, `[ipotesi]`) né Z7 né Z12 esistono (Z12 sulla griglia è Z6); i valori vicini sono 32 (Z6) e 32.0009765625 (Z8), che il giorno 9 dà 1.000030517578125 e `buy`; Z6 e Z8 hanno hash esatti diversi, e non restano quasi-duplicati da cercare.

La tabella ha una riga per genoma: `w1`, punteggio e decisione del giorno 9, l'inizio dell'hash e della chiave a 24 bit. Gli hash sono quelli dello schema attuale: con la griglia (c) testo canonico e schema sarebbero diversi.

| | w1 | giorno 9: punteggio | giorno 9: decisione | hash (prime 8 cifre) | chiave a 24 bit (prime 8 cifre) |
|---|---|---|---|---|---|
| Z6 | 32 | 1 | hold | c832e10c | d8e70ca5 |
| Z7 | 32.0000004 | 1.0000000125 | buy | 3df6fe2d | d8e70ca5 |
| Z12 | 31.999999999999996 | 0.9999999999999999 | hold | bc2bf9cb | d8e70ca5 |
| Z8 | 32.0009765625 | 1.000030517578125 | buy | df21c34e | 83534552 |

### 12.12 Q4 genomi che non decidono mai

Z9 ha solo il peso dell'RSI centrato, `w3` = 0,5, con `b` = 0; Z10 ha `w3` = 0,9, `b` = 0,05 e un'altra memoria dell'RSI. Poiché l'RSI centrato sta tra -1 e 1, il punteggio di Z9 non supera 0,5 contro la soglia 1, quello di Z10 resta tra -0,9 e 0,9 contro 1,05 e -0,95: entrambi restano in `hold` su ogni serie, ma per una ragione (soglie mai raggiunte) che la forma canonica non riconosce (capitolo 6).

- **(a) nessuna impronta:** Z9 e Z10 hanno hash diversi e nulla li collega.
- **(b) impronta:** sull'insieme di prova di 3020 barre (dataset di 20 giorni più serie sintetica) Z9 e Z10 hanno la stessa impronta e sono segnalati; costa una simulazione in più per genoma. Z11 (`w3` = 1,5) compra e vende e ha un'impronta diversa.

L'impronta è calcolata da `ref/fingerprint.mjs`, il cui testo non è specificato in questo documento, e i conteggi di Z11 sono propri di questa serie sintetica (generatore mulberry32): prefissi e conteggi non si rifanno quindi dal solo documento.

La tabella ha una riga per genoma: i geni che cambiano, l'inizio di hash e impronta e le decisioni sulle 3020 barre.

| genoma | w3 | b | eta' media dell'RSI | hash (prime 8 cifre) | impronta (prime 8 cifre) | decisioni sulle 3020 barre |
|---|---|---|---|---|---|---|
| Z9 | 0,5 | 0,00 | 4 | 43e38ecc | 508b06c9 | 0 buy, 3020 hold, 0 sell |
| Z10 | 0,9 | 0,05 | 9 | 585d9386 | 508b06c9 | 0 buy, 3020 hold, 0 sell |
| Z11 | 1,5 | 0,00 | 4 | 573cd0b6 | fd9cf7d5 | 160 buy, 2751 hold, 109 sell |

### 12.13 Q11 lo stesso genoma in Node e in Python

G1 con `w7` = 1e-7, scritto per l'hash in Node (dove girerà il genoma) e in Python (dove si verifica).

- **(a) esadecimale:** `w7` diventa `3e7ad7f29abcaf48` in entrambi i linguaggi e l'hash è lo stesso: `ee3f420e9e4dfac8d756d2d363faa633cc94d29760dc3d6752d15962bfcfbbc6`.
- **(b) decimale:** il testo si legge a occhio, ma i pesi diventano `[25,10,0.5,5,1,1,1e-7]` con `JSON.stringify` di Node e `[25.0,10.0,0.5,5.0,1.0,1.0,1e-07]` con `json.dumps` di Python, e gli hash differiscono (`edc7c80e9ebb5564896a2136f4fb62809ba912b2f770301849e12e15ace1fe76` contro `43e81014548fce794257849f92693cc243b426d46db75f14901460fca3409be9`). Qui Python usa `json.dumps`, non la funzione dedicata che (b) prevede: scritta bene, quella scriverebbe come Node e darebbe il primo dei due hash; il rischio di (b) è un suo errore, che darebbe hash diversi senza messaggio, come qui.

Il testo decimale dell'esempio è lo stesso oggetto del testo canonico con i numeri al posto delle stringhe esadecimali, costruito solo per l'esempio `[ipotesi]`.

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
| mutazione polinomiale limitata | mutazione il cui passo si accorcia avvicinandosi al bordo, così il valore non esce mai dai limiti (5.3, Domanda Q10) |
| neuroevoluzione | evoluzione di reti neurali con algoritmi evolutivi |
| OBV | *On-Balance Volume*: volume sommato con il segno della variazione del giorno; l'ingresso 7 ne è la forma normalizzata, tra -1 e +1 |
| peso | numero che moltiplica un ingresso nel punteggio |
| pressione di selezione | quanto spesso un genoma è scelto come genitore rispetto agli altri (E3) |
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
| snapshot ENI | la copia fissa dei 2517 giorni di prezzi ENI usata dal programma |
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
3. DEAP, documentazione degli operatori. Letta: https://deap.readthedocs.io/en/master/api/tools.html. Codice di `mutPolynomialBounded` letto (`deap/tools/mutation.py`, ramo `master`, per 12.9): https://github.com/DEAP/deap/blob/master/deap/tools/mutation.py
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
