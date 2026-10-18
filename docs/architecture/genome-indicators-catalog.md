---
title: "Catalogo degli indicatori del genoma"
layout: doc
last_verified: 2026-10-18
---

# Catalogo degli indicatori del genoma

<style>
.doc-content table { display: block; max-width: 100%; overflow-x: auto; }
.doc-content li, .doc-content p { overflow-wrap: anywhere; }
</style>

Questo catalogo dice quali **indicatori** (numeri calcolati dai prezzi e dai volumi passati) possono diventare gli **ingressi** del nuovo genoma a punteggio lineare con soglie, e quali no. Nel genoma scelto dal ciclo 010 la memoria del passato sta **solo negli indicatori**: il genoma somma gli ingressi con dei pesi e confronta la somma con due soglie, senza altre variabili. Quindi l'elenco degli ingressi decide tutto ciò che il genoma può «ricordare». Il catalogo è la ricerca **R2** dell'epica; la scelta finale dell'elenco spetta a Luca.

È scritto in italiano per chi sa programmare ma non ha competenze di finanza. Ogni termine è spiegato la prima volta che compare, con un esempio numerico, e raccolto nel [Glossario](#glossario). Il catalogo non ripete la [Guida alle forme di genoma](../genome-forms-guide/): SMA, EMA, distanza dalla media, rapporto del volume e punteggio lineare sono spiegati lì (sezioni 1.3.1-1.3.4 e capitolo 4) e qui sono solo richiamati.

> **Avvertenza: i valori degli esempi sono inventati e non provano nulla sulla qualità degli indicatori.** Gli esempi usano il dataset di 20 giorni della guida, esteso con apertura, massimo e minimo secondo una regola scritta (sezione 1.5). Le correlazioni sono calcolate su una serie casuale costruita apposta e, solo come controllo, sui dati di ENI. Nessun numero di questo documento dice che un indicatore «funziona», cioè che porti a guadagnare, e nessun esempio è una promessa di guadagno.

**Che cosa confronta.** Gli indicatori sono confrontati per cinque proprietà: si possono **calcolare** una barra alla volta con poco lavoro; quanto **stato** (numeri da ricordare tra un giorno e l'altro) richiedono; sono **causali**, cioè usano solo il passato; hanno una **scala** adatta a una somma pesata; quanto sono **ridondanti** con gli altri. Non sono confrontati per rendimento.

**Che cosa significa `[ipotesi]`.** Marca un'affermazione che è un giudizio dell'autore, o conoscenza generale senza una fonte letta per questo catalogo. `[ipotesi, fonte da verificare]` dice che una fonte dovrebbe esistere ma non è stata aperta. I numeri tra parentesi quadre, per esempio [2], rimandano ai [Riferimenti](#riferimenti), dove ogni fonte ha il suo stato: letta, solo scheda, non verificata.

**Convenzioni.** Decimali con la virgola nel testo e nelle tabelle, con il punto nei blocchi di codice. Le percentuali degli esempi sono arrotondate a due decimali. «Indice» di una barra dello snapshot ENI significa posizione contando da 0.

**Percorso di lettura.** Chi deve decidere legge «In breve», poi il capitolo 7 (regola di conteggio, due tabelle, elenco proposto) e il capitolo 9 (domande). Le schede del capitolo 4 sono consultazione.

## In breve

**Il problema.** Il genoma attuale vede il passato solo attraverso quattro medie esponenziali (due del prezzo, due del volume). Una somma pesata di medie esponenziali del prezzo resta una media del prezzo: non sa quanto il mercato è agitato, dove chiude una giornata, se il volume accompagna i rialzi o i ribassi. Servono ingressi che portino queste informazioni, ciascuno ridotto a un numero senza unità di misura e calcolabile giorno per giorno senza guardare il futuro.

**Le decisioni di Luca già prese (2026-10-18)** e usate qui: prezzo degli indicatori = **chiusura**; ogni termine della somma conta uno e **non si ammette** un termine che è combinazione lineare esatta di altri; la ridondanza si prova con **identità algebriche e una serie sintetica**, mentre lo snapshot ENI è solo un controllo che non guida la scelta; il prezzo di vendita del simulatore è un **rischio da segnalare** a R6 ed E2; famiglie con **parametri evolvibili** ammesse; al massimo **10 ingressi**, 12 solo se motivato.

**Proposta: 8 ingressi** (sotto il limite di 10; nessun motivo trovato per arrivare a 12).

| # | Ingresso proposto | Che cosa porta | Gene |
|---|---|---|---|
| 1 | distanza logaritmica dalla EMA veloce (N1) | dove sta il prezzo rispetto alla storia breve | `c` continuo |
| 2 | distanza logaritmica dalla EMA lenta (N1) | dove sta il prezzo rispetto alla storia lunga | `c` continuo |
| 3 | RSI centrato, media di Wilder | distanza dalla media divisa per l'agitazione recente | `c` continuo |
| 4 | distanza dal massimo di N giorni (N9) | memoria del punto più alto, che una media perde | `N` intero |
| 5 | ATR normalizzato (NATR) | quanto si muove il prezzo in un giorno, senza direzione | `c` continuo |
| 6 | posizione della chiusura nella giornata, in media (N14) | se le giornate chiudono vicino al massimo o al minimo | `c` continuo |
| 7 | logaritmo del volume relativo (N16) | se oggi si scambia più o meno del solito | `c` continuo |
| 8 | OBV normalizzato (N17) | quanta parte del volume recente è andata in giorni di rialzo | `c` continuo |

**Riserve** (da usare al posto di una voce o come nona): il gap di apertura in media (N15), il CMF al posto della voce 6. **Esclusi** con motivo: MACD (combinazione esatta delle voci 1 e 2 quando le velocità coincidono), SMA, Bollinger, ROC, stocastico, volatilità EWMA come ingresso diretto, OBV grezzo e altri (capitolo 7).

**Tre fatti che il catalogo ha verificato e che valgono per qualunque scelta.**

1. Un solo valore non definito (per esempio 0/0) in una media esponenziale la rende non definita **per sempre**: sullo snapshot ENI la barra piatta del 2023-08-15 produrrebbe 779 barre non definite. Il catalogo fissa una regola unica: la barra si salta (sezione 3.3).
2. Il motore chiede un valore finito già alla prima barra (sezione 1.3): ogni indicatore dichiara che cosa espone prima di avere abbastanza storia.
3. La media di apertura, massimo, minimo e chiusura che Consilium usa come prezzo crea da sola una persistenza dei rendimenti: autocorrelazione 0,242 su una serie casuale senza memoria, contro 0,009 sulla chiusura (sezione 2.4). È uno dei motivi per usare la chiusura.

**Che cosa resta a Luca:** la scelta finale dell'elenco (blocco `## Human Verification` del ciclo) e quattro domande del capitolo 9, una frase ciascuna.

## 1. Metodo, notazione e regola del tempo

### 1.1 La barra e i suoi cinque numeri

Una **barra** è il riassunto di un giorno di borsa in cinque numeri, detti **OHLCV**: **apertura** O (il primo prezzo scambiato), **massimo** H e **minimo** L (il prezzo più alto e più basso della giornata), **chiusura** C (l'ultimo prezzo) e **volume** V (il numero di azioni scambiate). Per esempio il giorno 12 del dataset di esempio ha O = 10,71, H = 10,75, L = 10,46, C = 10,50, V = 2200: si è aperto vicino a 10,7, si è chiuso quasi sul minimo, con un volume alto.

Notazione: `O[t], H[t], L[t], C[t], V[t]` sono i valori della barra `t`; `C[t-1]` è la chiusura del giorno prima; `dC[t] = C[t] - C[t-1]` è la **variazione** del giorno. Il **rendimento logaritmico** è `r[t] = ln(C[t] / C[t-1])`, dove `ln` è il logaritmo naturale. Per variazioni piccole vale quasi come la variazione percentuale: un rialzo da 10,00 a 10,10 è +1 % e `ln(1,01)` = 0,00995, cioè 0,995 %. Il logaritmo ha una proprietà utile: un rialzo del 10 % e il ribasso che riporta al prezzo di partenza hanno lo stesso valore con il segno cambiato, e le variazioni di più giorni si sommano.

### 1.2 Il prezzo degli indicatori: la chiusura

Per decisione di Luca (Q1, 2026-10-18), tutti gli indicatori «di prezzo» del catalogo usano la **chiusura** `C[t]`. Gli indicatori che per definizione leggono i campi separati (massimo, minimo, apertura, volume) li leggono dalla barra. Il motivo e le conseguenze sono nella sezione 2.4; ogni scheda dice in una riga come cambierebbe con la media `(O + H + L + C) / 4`.

### 1.3 La regola del tempo

Il catalogo usa i fatti del codice seguenti (verificati il 2026-10-18).

- **Ordine dentro un giorno.** Il motore passa la prima barra a `initIndicators` e ogni barra successiva a `updateIndicators`; poi il `Trader` esegue l'ordine deciso il giorno prima; poi `decide()` sceglie l'ordine per il giorno dopo (`src/engine/strategy.js`, righe 40-55; `src/vendor/consilium/life.js`, righe 622-623 e 646-650). Quindi **un indicatore della barra `t` contiene i dati di `t`, e la decisione che lo usa si esegue alla barra `t+1`**.
- **Acquisto** all'apertura della barra di esecuzione: `const stockPrice = stockData.open` (`src/vendor/consilium/trader.js`, riga 97).
- **Vendita su segnale** alla media `(O + H + L + C) / 4` della barra di esecuzione: `getActualValue()` (`trader.js`, riga 153; `src/vendor/consilium/portfolio.js`, riga 215; la media è definita in `src/vendor/consilium/stockStream.js`, righe 32-34). È un rischio dichiarato per R6 ed E2 (sezione 2.5).
- **Stop loss e take profit** (chiusure automatiche quando il prezzo scende sotto o sale sopra una soglia fissata all'acquisto) scattano sul minimo o sul massimo della barra e si chiudono al prezzo di soglia (rilievo F-code-4 del ciclo 011, Step 5; non riletto in questo step).
- **Valore finito dalla prima barra.** Il controller registra il primo fotogramma subito dopo `init` (`src/engine/simulationController.js`, riga 43) e il validatore segna errore se un indicatore esposto da `describe()` non è un numero finito (`src/engine/fitnessValidator.js`, riga 29); a fine replay l'errore ferma il replay (`simulationController.js`, righe 90-94).

**Conseguenza per tutto il catalogo.** Ogni indicatore della scheda usa solo la barra `t` e le precedenti, quindi è noto alla chiusura di `t`, prima dell'esecuzione all'apertura di `t+1`. Nessuna scheda ha **anticipazione dei dati** (l'errore di usare un dato non ancora disponibile il giorno della decisione), e le schede non lo ripetono. Sono escluse le normalizzazioni che usano statistiche dell'intera serie, per esempio dividere per la deviazione standard calcolata su tutti i dieci anni (guida, sezione 4.8.3): userebbero il futuro.

### 1.4 Le fonti

Fonti ammesse: documentazione di librerie di analisi tecnica (soprattutto TA-Lib, una libreria diffusa che documenta formule e convenzioni di avvio), testi originali degli autori quando reperibili, materiale universitario, il codice di Consilium e di SwarmTrader. I testi originali (Wilder, Appel, Lane, Granville, Chaikin) **non sono stati letti**: le formule vengono dalle pagine di TA-Lib, che li citano. Non è usato come prova materiale commerciale o di «segnali».

### 1.5 Il dataset di esempio

Chiusura e volume sono **identici** ai 20 giorni della guida (sezione 1.2); lo script si ferma se non coincidono. Apertura, massimo e minimo sono **inventati** con questa regola, scelta perché sia semplice e rispetti `L ≤ min(O, C)` e `H ≥ max(O, C)`:

```
O[1] = C[1]
O[t] = arrotonda( C[t-1] + 0.3 * (C[t] - C[t-1]) )        per t >= 2
e[t] = 0.04 + 0.02 * (t mod 3)                (0.04, 0.06 o 0.08)
H[t] = arrotonda( max(O[t], C[t]) + e[t] )
L[t] = arrotonda( min(O[t], C[t]) - e[t] )
```

In parole: si apre un po' oltre la chiusura di ieri, nella direzione del giorno, e la giornata si allarga di pochi centesimi oltre apertura e chiusura.

| Giorno | Apertura | Massimo | Minimo | Chiusura | Volume |
|---|---|---|---|---|---|
| 1 | 10,00 | 10,06 | 9,94 | 10,00 | 1000 |
| 2 | 10,03 | 10,18 | 9,95 | 10,10 | 1100 |
| 3 | 10,16 | 10,34 | 10,12 | 10,30 | 1200 |
| 4 | 10,38 | 10,61 | 10,32 | 10,55 | 1500 |
| 5 | 10,63 | 10,88 | 10,55 | 10,80 | 1600 |
| 6 | 10,86 | 11,04 | 10,82 | 11,00 | 1800 |
| 7 | 11,06 | 11,26 | 11,00 | 11,20 | 1700 |
| 8 | 11,25 | 11,43 | 11,17 | 11,35 | 1400 |
| 9 | 11,34 | 11,38 | 11,26 | 11,30 | 1200 |
| 10 | 11,24 | 11,30 | 11,04 | 11,10 | 1300 |
| 11 | 11,01 | 11,09 | 10,72 | 10,80 | 1900 |
| 12 | 10,71 | 10,75 | 10,46 | 10,50 | 2200 |
| 13 | 10,44 | 10,50 | 10,24 | 10,30 | 2000 |
| 14 | 10,27 | 10,35 | 10,12 | 10,20 | 1500 |
| 15 | 10,25 | 10,39 | 10,21 | 10,35 | 1200 |
| 16 | 10,41 | 10,61 | 10,35 | 10,55 | 1300 |
| 17 | 10,63 | 10,88 | 10,55 | 10,80 | 1500 |
| 18 | 10,88 | 11,09 | 10,84 | 11,05 | 1700 |
| 19 | 11,11 | 11,31 | 11,05 | 11,25 | 1600 |
| 20 | 11,30 | 11,48 | 11,22 | 11,40 | 1400 |

Le schede mostrano otto giorni (1, 2, 5, 8, 12, 14, 16, 20): l'inizio, la salita, il picco, la discesa, il fondo, la risalita, la fine. I parametri degli esempi sono corti (finestre di 5 o 10 giorni, `c` = 0,2 come la EMA lenta della guida) perché 20 giorni non bastano per i valori abituali.

### 1.6 Gli script

Tutti i numeri del catalogo sono prodotti da script conservati in `/home/luca/Workspace/swarmtrader-r2-work/` (fuori dal repository): `dataset/` (dataset di esempio), `ref/` (implementazioni dell'autore), `out/` (tabelle prodotte), `verify/` (riservata al verificatore indipendente). Ogni indicatore ha una versione **incrementale** (una barra per volta, come gli hook del contratto di strategia) e una **diretta** (ricalcolo dalla storia intera); le due coincidono su tutte le barre controllate, con scarto relativo massimo 4,8e-12 (Bande di Bollinger, per le somme correnti) e sotto 1e-13 per tutti gli altri.

## 2. Il prezzo di ingresso e i quattro filtri IIR

### 2.1 La forma esatta del filtro

I quattro indicatori del genoma attuale sono medie mobili esponenziali (EMA), che il codice chiama **filtri IIR** (dall'inglese «infinite impulse response»: ogni dato passato conserva un peso, sempre più piccolo). La forma è quella della guida, sezione 1.3.2:

```
e[t] = e[t-1] * (1 - c) + x[t] * c
```

`c` è il **peso del dato nuovo** (`src/vendor/consilium/algorithm.js`, righe 369-372), non del passato: con `c` vicino a 1 il filtro segue il dato e ricorda poco. Il filtro parte dal primo valore: `this.ema = actualValue` e `this.emaV2 = stockData.volume` in `init` (righe 345-348). Il genoma fisso usa i coefficienti di `src/engine/genome.js` (righe 14-17), e `genome.js` impone `0 < c < 1` (riga 86).

### 2.2 Una sola definizione di costante di tempo

Il catalogo usa **una** misura della memoria di una EMA: l'**età media** dei dati che contiene, `(1 - c) / c` barre. Per esempio con `c` = 0,2 i pesi dei giorni passati sono 0,2, 0,16, 0,128, … e l'età media è 4 barre. Per `c` piccolo vale quasi come `1/c`, la «regola pratica» della guida (sezione 1.3.2): con `c` = 2/21 sono 9,50 contro 10,50. Per `c` grande le due misure divergono e conta l'età media: con `iir_price_2` (`c` = 0,990) l'età media è 0,01 barre, cioè il filtro è quasi il prezzo del giorno.

Il **periodo di avvio** (warm-up) è un'altra cosa: quante barre servono perché il valore di partenza pesi meno del 5 %, cioè il primo `t` con `(1 - c)^t < 0,05`.

| Coefficiente | `c` | età media `(1-c)/c` | regola pratica `1/c` | N = 2/c - 1 (EMA standard) | barre di avvio (peso iniziale < 5 %) |
|---|---|---|---|---|---|
| `iir_price_1` | 0,731 | 0,37 | 1,37 | 1,74 | 3 |
| `iir_price_2` | 0,990 | 0,01 | 1,01 | 1,02 | 1 |
| `iir_volume_1` | 0,118 | 7,50 | 8,50 | 16,00 | 24 |
| `iir_volume_2` | 0,396 | 1,52 | 2,52 | 4,05 | 6 |
| EMA standard N = 20 | 0,095 | 9,50 | 10,50 | 20,00 | 30 |
| Wilder N = 14 | 0,071 | 13,00 | 14,00 | 27,00 | 41 |

L'età media è controllata con una somma numerica dei pesi (7,500051 per `iir_volume_1`, uguale alla formula). Esempio di avvio: con `c` = 2/21, dopo 29 barre il valore iniziale pesa ancora il 5,49 %, dopo 30 il 4,97 %.

### 2.3 Da «periodo N» a `c`: due convenzioni

La letteratura indica le medie con un «periodo» N in giorni. Le convenzioni sono due, e danno medie diverse con lo stesso N.

- **EMA standard:** `c = 2 / (N + 1)`. TA-Lib la scrive `k = 2 / (period + 1)` con `EMA = (prezzo - EMA_prec) * k + EMA_prec`, che è la forma di Consilium con `k = c` [2]. EMA a 20 giorni: `c` = 2/21 = 0,095.
- **Media di Wilder:** `c = 1 / N`, usata da RSI e ATR (`ATR = (ATR_prec * (N - 1) + TR) / N`) [1][17]. Wilder a 14 giorni: `c` = 1/14 = 0,071.
- **Equivalenza:** una media di Wilder a N giorni è una EMA standard a `2N - 1` giorni (da `2/(N'+1) = 1/N`; per N = 14: 1/14 - 2/28 = 0). L'RSI a 14 giorni contiene quindi una «EMA a 27».

**Avvio.** TA-Lib avvia l'EMA con la media semplice dei primi N valori e non dà valori prima [2]; Consilium e questo catalogo avviano al primo valore. La differenza si esaurisce con il periodo di avvio: per la EMA a 20 sulla serie sintetica lo scarto relativo è 0,373 % alla barra 20, 0,133 % alla 30, 0,0069 % alla 60.

### 2.4 Perché la chiusura e non la media di quattro prezzi

Consilium fa entrare nei filtri `(O + H + L + C) / 4` (`stockStream.js`, righe 32-34). La media di quattro prezzi della stessa giornata ha un effetto collaterale: i suoi rendimenti da un giorno all'altro risultano **correlati** anche quando i prezzi non lo sono. L'**autocorrelazione di primo ordine** misura quanto il rendimento di oggi somiglia a quello di ieri (0 = per niente, 1 = uguale). Sulla serie sintetica, che è una passeggiata casuale senza memoria (sezione 5.5), vale **0,009** sui rendimenti della chiusura e **0,242** su quelli della media OHLC/4. Sullo snapshot ENI, come controllo, 0,031 e 0,232. L'effetto è descritto per le medie di una serie casuale da Working e Cowles nel 1960 [18] (letto l'abstract di Cowles; che la media dei quattro prezzi di una barra ricada nello stesso caso è sostenuto dalla simulazione, non dal testo).

Con la chiusura: valori confrontabili con TA-Lib, che definisce EMA, RSI, ATR, OBV e stocastico sulla chiusura [1][2][7][10][17], e nessuna persistenza costruita. Il costo: una EMA del catalogo non coincide più con un filtro di Consilium con lo stesso `c`, e il confronto nel PoC tra genoma lineare e macchina a stati mescola l'effetto della forma con quello del prezzo.

### 2.5 Il rischio del prezzo di vendita (per R6 ed E2)

Nel simulatore l'acquisto avviene all'apertura del giorno dopo la decisione, ma la vendita su segnale alla media `(O + H + L + C) / 4` di quel giorno (sezione 1.3). Quel prezzo contiene massimo, minimo e chiusura di una giornata che, all'apertura, non è ancora avvenuta: equivale a vendere «alla media della giornata». Non è anticipazione dentro gli indicatori, perché la decisione è presa la sera prima con i soli dati noti; è un'ipotesi di esecuzione che nessun ordine reale dato all'apertura può garantire. Il validatore la accetta perché controlla solo che il prezzo stia tra minimo e massimo (`fitnessValidator.js`, righe 57-58). Per decisione di Luca (Q4) il codice di Consilium **non si tocca** e non si apre una issue a parte: il fatto è passato a **R6** (protocollo di valutazione) ed **E2** (implementazione) come rischio dichiarato.

### 2.6 Quali indicatori del catalogo contengono una EMA

| Indicatore | Media contenuta | Si scrive con un filtro della forma di Consilium? |
|---|---|---|
| EMA, N1 | EMA del prezzo | sì, `c` qualunque |
| MACD | due EMA del prezzo e una EMA della loro distanza | sì, tre filtri in cascata |
| RSI | due medie di Wilder di `dC` e `abs(dC)` | sì, `c = 1/N`, avvio da zero |
| ATR | media di Wilder dell'escursione vera | sì, `c = 1/N` |
| N6 | EMA di `r^2` | sì |
| N14, N16, N17, CMF esponenziale | EMA di CLV, del volume, del volume con segno | sì |
| SMA, Bollinger, ROC, stocastico, N9, CMF, OBV | nessuna (finestre o somma cumulata) | no |

## 3. Mattoni di stato

Ogni indicatore è costruito con pochi tipi di **stato**, cioè i numeri che l'indicatore conserva da un giorno all'altro. Questo capitolo li descrive una volta; le schede dicono solo quali usano. È anche la mappa per E2 di che cosa vive in `initIndicators`, `updateIndicators` e `resetIndicators`.

### 3.1 I cinque mattoni

| Mattone | Stato | Lavoro per barra | Esempi |
|---|---|---|---|
| (a) EMA | 1 numero | costante | EMA, RSI, ATR, N1, N6, N14, N16, N17 |
| (b) finestra di N valori con somma corrente | N valori + 1 somma | costante | SMA, ROC, CMF |
| (c) massimo o minimo su N barre | fino a N valori (coda monotona) | costante in media, non a ogni barra | stocastico, N9 |
| (d) varianza su finestra | N valori + 2 somme | costante, ma sensibile agli arrotondamenti | Bande di Bollinger |
| (e) accumulatore | 1 numero, che cresce senza limite | costante | OBV grezzo, linea di accumulo e distribuzione |

- **(c) Coda monotona.** Si tengono solo i valori che possono ancora diventare il massimo; ogni valore entra ed esce una volta, con al più tre confronti per elemento nel caso peggiore [13] (letto l'abstract). In una singola barra si possono scartare molti elementi, quindi il lavoro è costante solo in media [ipotesi, lettura dell'abstract].
- **(d) Arrotondamenti.** La varianza con le somme di `x` e `x^2` perde cifre quando la media è grande rispetto alla dispersione. Lo script sottrae il primo valore prima di sommare; lo scarto rimasto contro il calcolo diretto è 4,8e-12 sulla serie sintetica, contro meno di 1e-13 degli altri mattoni.
- **(e) Accumulatore.** Il valore dipende da quando si è cominciato a contare e non ha un intervallo: non è adatto come ingresso diretto (scheda OBV).

### 3.2 Politica di avvio: un valore finito dalla barra 1

Il motore chiede un numero finito già alla prima barra (sezione 1.3). Il catalogo usa tre regole.

1. **Le EMA partono dal primo valore**, come in Consilium. Quando un indicatore è il **rapporto di due EMA con lo stesso `c`** (RSI, N17, CMF esponenziale), entrambe partono **da zero**: il fattore dovuto all'avvio è lo stesso sopra e sotto e si semplifica [ipotesi verificata numericamente: RSI dopo 200 barre coincide con l'avvio di TA-Lib entro 1,7e-7].
2. **Le finestre crescono**: con meno di N barre si usano quelle disponibili. TA-Lib invece non dà valori finché la finestra non è piena; le due scelte coincidono dopo N barre.
3. **Prima che esista un valore sensato si espone il valore neutro**: 0 per le forme centrate, cioè quelle il cui valore va da -1 a +1 o è una distanza (RSI centrato, OBV normalizzato, stocastico centrato 0 corrisponde a %K = 0,5).

Il periodo di avvio resta un fatto che R6 deve sapere: nelle prime barre l'indicatore è un valore di comodo. R4 decide che cosa fa il genoma nel frattempo.

### 3.3 Regola unica per i denominatori nulli: saltare l'aggiornamento

**Il caso reale.** Nello snapshot ENI la barra di indice 1738 (2023-08-15) ha O = H = L = C = 14,014 e V = 0; la barra prima è del 2023-08-11 (chiusura 14,048), quindi manca il 14 agosto. È l'unica barra con H = L e l'unica con V = 0 su 2517. Che sia un giorno riempito dalla fonte dei dati è [ipotesi].

**Che cosa succede senza una regola.** La posizione della chiusura nella giornata `((C - L) - (H - C)) / (H - L)` vale 0/0, che in JavaScript è `NaN` («not a number»); il logaritmo del volume vale meno infinito. Una EMA che riceve `NaN` resta `NaN` per sempre: dopo cinque valori normali vale ancora `NaN`. Sullo snapshot la media della posizione di chiusura diventerebbe `NaN` per **779 barre**, dall'indice 1738 all'ultimo. Due esiti possibili, entrambi gravi: se il valore è esposto in `describe()`, il replay fallisce alla fine (sezione 1.3); se non è esposto, il punteggio diventa `NaN`, ogni confronto con le soglie è falso e il genoma **smette di comprare e vendere senza segnalarlo** [ipotesi sulla forma di `decide()` di E2].

**La regola.** Quando un aggiornamento renderebbe nullo un denominatore o chiederebbe il logaritmo di zero, **quel mattone salta la barra**: il suo stato e il valore esposto restano quelli del giorno prima. È la scelta di TA-Lib per l'oscillatore di Chaikin, che aggiorna «only when high>low» [9]. Un'alternativa sarebbe porre il valore a 0, ma in una EMA non è la stessa cosa: 0 tira la media verso zero di una frazione `c`, il salto la lascia invariata.

Valori sullo snapshot con la regola (indici 1737, 1738, 1739; parametri della sezione 5.5):

| Indicatore | 1737 | 1738 (barra piatta) | 1739 | Che cosa succede |
|---|---|---|---|---|
| posizione di chiusura in EMA (N14) | 0,09892 | 0,09892 | 0,05028 | saltata (H = L) |
| log volume relativo (N16) | -0,29038 | -0,29038 | -0,25744 | saltata (V = 0) |
| OBV normalizzato (N17) | 0,16285 | 0,16285 | 0,06896 | aggiornata: con V = 0 le due EMA calano insieme e il rapporto non cambia |
| CMF 20 | 0,08509 | 0,08509 | 0,10573 | saltata (H = L) |
| CMF esponenziale (N18) | 0,12488 | 0,12488 | 0,08537 | saltata; senza la regola `NaN * 0` darebbe comunque `NaN` |
| rapporto di volume della guida `V/EMA(V)` | 0,74798 | 0,00000 | 0,84783 | finito ma estremo; la EMA del volume è tirata in basso |
| ATR di Wilder 14 | 0,25649 | 0,24060 | 0,23556 | finito: l'escursione vera usa la chiusura di ieri (0,034) |
| stocastico %K 14 | 0,77752 | 0,73770 | 0,63934 | finito: la finestra di 14 giorni non è piatta |
| RSI centrato 14 | 0,23509 | 0,21205 | 0,15473 | finito: la variazione è -0,034 |

## 4. Le schede

### 4.0 Come sono fatte e come sono raggruppate

**Raggruppamento per lacuna.** Le schede sono raggruppate secondo la **lacuna** che colmano rispetto ai quattro filtri attuali. Le lacune si deducono dal codice (`algorithm.js`, righe 20-62 e 369-384): i filtri sono medie lineari di due sole serie, il prezzo medio del giorno e il volume, e le condizioni confrontano valori con valori.

- **Gruppo A — ciò che i filtri vedono già, in forma normalizzata:** livello e tendenza del prezzo, livello del volume.
- **L1 — funzioni non lineari del percorso del prezzo:** agitazione, escursione, distanza da un massimo. Una somma di medie del prezzo non può produrle.
- **L2 — informazione dentro la barra:** dove chiude la giornata rispetto al suo massimo e minimo; la media di quattro prezzi la cancella.
- **L3 — volume con segno:** il volume dice quanto si scambia, non in quale direzione andava il prezzo.
- **L4 — normalizzazione per il regime:** una distanza del 2 % pesa uguale in un periodo calmo e in uno agitato; per misurarla «in giornate tipiche» va divisa per l'agitazione recente.

Le **interazioni** tra ingressi («se X e insieme Y») non sono una lacuna che un ingresso possa colmare: sono materia delle equazioni di decisione (R4; guida, sezione 4.8.2).

**Voci di ogni scheda.** In una frase; Formula; Calcolo (mattone, stato, lavoro per barra); Avvio e casi limite; Campi e parametri (con i geni candidati); Ingresso nel punteggio (scala, forma proposta, lettura di un peso positivo); Ridondanza; Esempio; Con OHLC/4; Fonti; Proposta. Le voci senza nulla di specifico rimandano ai capitoli 2 e 3. I numeri di ridondanza vengono dalla sezione 5.5 (serie sintetica; R² = quota spiegata dagli altri ingressi, sezione 5.5).

### 4.1 Gruppo A — livello e tendenza, livello del volume

Che cosa porta di nuovo rispetto ai filtri: **niente di nuovo come informazione**, ma una forma senza unità di misura e con la chiusura al posto della media del giorno. Il rischio di questo gruppo è ammettere più nomi per la stessa informazione.

#### Scheda: EMA (media mobile esponenziale)

- **In una frase.** La media dei prezzi passati con pesi che calano nel tempo; spiegata nella guida, sezione 1.3.2.
- **Formula.** `e[t] = e[t-1] * (1 - c) + C[t] * c`, `e[1] = C[1]`.
- **Calcolo.** Mattone (a): 1 numero, lavoro costante.
- **Avvio e casi limite.** Finita dalla barra 1; avvio sezione 2.2. Nessun denominatore.
- **Campi e parametri.** C. `c` continuo, candidato gene.
- **Ingresso nel punteggio.** Il valore è in euro: **non** entra così (un peso varrebbe cose diverse con un titolo a 10 o a 100 euro; guida, sezione 4.8.3). Entra come distanza N1.
- **Esempio.** Vedi la scheda N1.
- **Con OHLC/4.** Coinciderebbe con un filtro di Consilium a parità di `c`.
- **Fonti.** [2]; codice (sezione 2.1).
- **Proposta.** Mattone, non ingresso: entra attraverso N1.

#### Scheda: SMA (media mobile semplice)

- **In una frase.** La media semplice degli ultimi N prezzi; guida, sezione 1.3.1.
- **Formula.** `SMA[t] = (C[t] + ... + C[t-N+1]) / N`; ingresso possibile `ln(C[t] / SMA[t])`.
- **Calcolo.** Mattone (b): N valori e una somma, lavoro costante.
- **Avvio e casi limite.** Finestra crescente (sezione 3.2); finita dalla barra 1; avvio di N barre.
- **Campi e parametri.** C. N intero (cambia la dimensione dello stato).
- **Ingresso nel punteggio.** Distanza logaritmica, adimensionale; peso positivo = più il prezzo sta sopra la media, più il punteggio sale.
- **Ridondanza.** La distanza da SMA 20 è spiegata al 95 % dagli ingressi proposti (R² 0,95) e correla 0,95 con l'RSI centrato: è un'altra media del prezzo.
- **Esempio** (SMA 5):

| Giorno | Chiusura | SMA 5 (finestra crescente) | ln(C/SMA) % |
|---|---|---|---|
| 1 | 10,00 | 10,00 | 0,00 |
| 2 | 10,10 | 10,05 | 0,50 |
| 5 | 10,80 | 10,35 | 4,26 |
| 8 | 11,35 | 10,98 | 3,31 |
| 12 | 10,50 | 11,01 | -4,74 |
| 14 | 10,20 | 10,58 | -3,66 |
| 16 | 10,55 | 10,38 | 1,62 |
| 20 | 11,40 | 11,01 | 3,48 |

  Giorno 2: (10,00 + 10,10) / 2 = 10,05 (finestra di due giorni, perché ne esistono solo due).
- **Con OHLC/4.** Stessa forma su un altro prezzo.
- **Fonti.** Guida, sezione 1.3.1.
- **Proposta.** Esclusa (variante di N1): stessa informazione, finestra intera invece di `c` continuo.

#### Scheda N1: distanza logaritmica da una EMA, a più velocità (proposta dello Step 4)

- **In una frase.** Di quanto il prezzo di oggi sta sopra (positivo) o sotto (negativo) la propria media, in scala logaritmica.
- **Formula.** `d[t] = ln(C[t] / e[t])`, con `e` la EMA della chiusura con coefficiente `c`. Per scarti piccoli è quasi la distanza `x1` della guida divisa per 100.
- **Calcolo.** Mattone (a): 1 numero per velocità.
- **Avvio e casi limite.** `d[1] = 0`. Nessun denominatore nullo (i prezzi sono positivi).
- **Campi e parametri.** C. `c` continuo, gene; due velocità con il vincolo `c_veloce > c_lenta`.
- **Ingresso nel punteggio.** Adimensionale. Peso positivo su `d_veloce`: il punteggio sale quando il prezzo corre sopra la media recente. La scala dipende molto da `c` (sezione 5.3).
- **Ridondanza.** Con velocità fisse una terza velocità aggiunge poco: `d` a `c` = 2/21 è spiegata al 98 % da quelle a 2/11 e 2/51 (R² 0,980). La MACD logaritmica è una **combinazione esatta** di due distanze (sezione 5.5, identità I1).
- **Esempio** (`c` = 0,2):

| Giorno | Chiusura | EMA c=0,2 | d = ln(C/EMA) % | guida x1 % |
|---|---|---|---|---|
| 1 | 10,00 | 10,00 | 0,00 | 0,00 |
| 2 | 10,10 | 10,02 | 0,80 | 0,80 |
| 5 | 10,80 | 10,30 | 4,77 | 4,89 |
| 8 | 11,35 | 10,74 | 5,51 | 5,66 |
| 12 | 10,50 | 10,81 | -2,87 | -2,83 |
| 14 | 10,20 | 10,60 | -3,88 | -3,81 |
| 16 | 10,55 | 10,55 | -0,02 | -0,02 |
| 20 | 11,40 | 10,92 | 4,28 | 4,37 |

  Giorno 2: `e` = 10,00 × 0,8 + 10,10 × 0,2 = 10,02; `d` = ln(10,10 / 10,02) = 0,80 %. La colonna `x1` è quella della guida (sezione 1.3.4): le due forme differiscono di poco finché lo scarto è piccolo.
- **Con OHLC/4.** Coinciderebbe con un filtro di Consilium letto come rapporto.
- **Fonti.** [2]; identità della sezione 5.5.
- **Proposta.** **Ammessa a due velocità** (ingressi 1 e 2).

#### Scheda: MACD (convergenza e divergenza di medie mobili)

- **In una frase.** La differenza tra una EMA veloce e una lenta («linea»), più una media di quella differenza («segnale»); dice se la media veloce si sta allontanando da quella lenta.
- **Formula.** Linea in euro `EMA_veloce - EMA_lenta`; segnale = EMA della linea; istogramma = linea meno segnale. Forma adimensionale proposta: `m[t] = ln(EMA_veloce[t] / EMA_lenta[t])`. Valori predefiniti 12, 26 e 9 giorni [19]; la struttura linea, segnale, istogramma è conoscenza generale [ipotesi, fonte da verificare: la pagina [19] dà i tre periodi; il libro di Appel non è stato letto].
- **Calcolo.** Tre mattoni (a) in cascata: 3 numeri.
- **Avvio e casi limite.** Linea 0 alla barra 1; avvio della EMA lenta (39 barre per 26 giorni) più quello del segnale.
- **Campi e parametri.** C. Tre `c` continui, con `c_veloce > c_lenta`.
- **Ingresso nel punteggio.** La linea in euro no (scala del prezzo). In forma logaritmica: se le velocità coincidono con quelle di N1, `m = d_lenta - d_veloce` esattamente (scarto 3,1e-16): **combinazione lineare esatta**, esclusa dalla regola di conteggio. Con velocità diverse (12/26 contro 10, 20, 50) resta spiegata al 99,68 % (R² 0,9968). Il **segnale** è un filtro nuovo (una media della distanza), ma è spiegato al 97 % dagli ingressi proposti; l'**istogramma** è linea meno segnale, quindi combinazione esatta delle altre due.
- **Esempio** (veloce `c` = 0,5, lenta `c` = 0,2, segnale `c` = 0,5):

| Giorno | MACD in euro | MACD log % | d lenta - d veloce % | segnale % | istogramma % |
|---|---|---|---|---|---|
| 1 | 0,000 | 0,00 | 0,00 | 0,00 | 0,00 |
| 2 | 0,030 | 0,30 | 0,30 | 0,15 | 0,15 |
| 5 | 0,285 | 2,73 | 2,73 | 1,97 | 0,76 |
| 8 | 0,431 | 3,93 | 3,93 | 3,57 | 0,36 |
| 12 | -0,064 | -0,59 | -0,59 | 0,68 | -1,27 |
| 14 | -0,243 | -2,32 | -2,32 | -1,42 | -0,90 |
| 16 | -0,100 | -0,95 | -0,95 | -1,30 | 0,35 |
| 20 | 0,299 | 2,70 | 2,70 | 2,01 | 0,70 |

  Le colonne «MACD log» e «d lenta - d veloce» sono uguali giorno per giorno: è l'identità. La forma «rapporto meno 1» della guida (`x2`) differisce dalla forma logaritmica di al più 0,0111 sulla serie sintetica.
- **Con OHLC/4.** Stessa identità su un altro prezzo.
- **Fonti.** [19]; [22] solo scheda.
- **Proposta.** Esclusa: linea e istogramma per la regola di conteggio, segnale per ridondanza.

#### Scheda: ROC (tasso di variazione)

- **In una frase.** Di quanto è cambiato il prezzo in N giorni; è il «momentum» della guida, sezione 1.3.4.
- **Formula.** Forma logaritmica `ln(C[t] / C[t-N])`; la guida usa `(C[t] / C[t-N] - 1) * 100` [ipotesi, fonte da verificare: la pagina ROC di TA-Lib non è stata aperta].
- **Calcolo.** Mattone (b): N + 1 chiusure; lavoro costante.
- **Avvio e casi limite.** Finestra crescente: alla barra 1 vale 0; avvio N barre.
- **Campi e parametri.** C. N intero.
- **Ingresso nel punteggio.** Adimensionale; peso positivo = più il prezzo è salito in N giorni, più il punteggio sale.
- **Ridondanza.** È un filtro lineare del prezzo a finestra, come le distanze: R² 0,79 (ROC 10) e 0,83 (ROC 20) sugli ingressi proposti. Sotto la soglia di ridondanza, ma non colma nessuna lacuna.
- **Esempio** (N = 5):

| Giorno | Chiusura | ROC 5 log % | guida mom_5 % |
|---|---|---|---|
| 1 | 10,00 | 0,00 | - |
| 2 | 10,10 | 1,00 | - |
| 5 | 10,80 | 7,70 | - |
| 8 | 11,35 | 9,71 | 10,19 |
| 12 | 10,50 | -6,45 | -6,25 |
| 14 | 10,20 | -10,24 | -9,73 |
| 16 | 10,55 | -2,34 | -2,31 |
| 20 | 11,40 | 9,66 | 10,14 |

  Nei giorni 2-5 la finestra crescente confronta con il giorno 1; la guida lascia il trattino.
- **Con OHLC/4.** Erediterebbe la persistenza costruita della media (sezione 2.4).
- **Fonti.** Guida, sezione 1.3.4.
- **Proposta.** Esclusa (variante del gruppo A): nessuna lacuna e parametro intero.

#### Scheda N16: logaritmo del volume relativo (proposta dello Step 4)

- **In una frase.** Se oggi si è scambiato più (positivo) o meno (negativo) del solito.
- **Formula.** `lv[t] = ln(V[t] / ev[t])`, con `ev` la EMA del volume (compreso oggi). Il logaritmo rende simmetrici «doppio del solito» (+0,69) e «metà» (-0,69). Variante della guida: `vr - 1 = V/ev - 1`.
- **Calcolo.** Mattone (a): 1 numero.
- **Avvio e casi limite.** `lv[1] = 0`. V = 0: la barra si salta (sezione 3.3); con `max(V, 1)`, una correzione possibile, il valore sarebbe circa -16, enorme rispetto alla dispersione abituale.
- **Campi e parametri.** V. `c` continuo, gene.
- **Ingresso nel punteggio.** Adimensionale. Peso positivo = si compra di più nei giorni di volume alto, **qualunque sia la direzione**: il volume da solo non ha segno. Il suo uso naturale è combinarlo con la direzione, che è R4 (guida, sezione 4.8.2); il segno lo porta N17.
- **Ridondanza.** Sulla serie sintetica il volume è costruito indipendente dal prezzo, quindi R² 0,00 è per costruzione e non prova nulla; sullo snapshot ENI, come controllo, R² 0,03.
- **Esempio** (`c` = 0,2):

| Giorno | Volume | guida vr | ln(V/EMA V) c=0,2 |
|---|---|---|---|
| 1 | 1000 | 1,00 | 0,00 |
| 2 | 1100 | 1,08 | 0,08 |
| 5 | 1600 | 1,29 | 0,26 |
| 8 | 1400 | 0,99 | -0,01 |
| 12 | 2200 | 1,36 | 0,31 |
| 14 | 1500 | 0,91 | -0,10 |
| 16 | 1300 | 0,86 | -0,15 |
| 20 | 1400 | 0,92 | -0,09 |

  Giorno 12: ln(1,36) = 0,31.
- **Con OHLC/4.** Nessun cambiamento: usa solo il volume.
- **Fonti.** Guida, sezione 1.3.4; costruzione dello Step 4 [ipotesi sull'asimmetria della distribuzione dei volumi].
- **Proposta.** **Ammessa** (ingresso 7), al posto di `x3` della guida.

### 4.2 Lacuna L4 — distanza misurata in «giornate tipiche»

Che cosa porta: la stessa distanza dalla media del gruppo A, ma **divisa per l'agitazione recente**. Un indicatore entra qui se il suo valore è una distanza divisa per una misura di variabilità calcolata solo sul passato.

#### Scheda: RSI (indice di forza relativa), forma centrata

- **In una frase.** Confronta la media dei rialzi recenti con la media dei ribassi recenti. Per convenzione dell'autore, valori alti (sopra 70 su 100) si leggono «ipercomprato», cioè salito molto in fretta, e bassi «ipervenduto»; qui è una **descrizione del calcolo**, non una regola che funzioni.
- **Formula.** Con `U` e `D` le medie di Wilder dei rialzi e dei ribassi, `RSI = 100 * U / (U + D)` [17]. Forma proposta, centrata in [-1, 1]:

  ```
  A[t] = A[t-1] * (1 - c) + dC[t] * c          A[1] = 0
  B[t] = B[t-1] * (1 - c) + abs(dC[t]) * c     B[1] = 0
  rsi_c[t] = A[t] / B[t]       ( = 2 * RSI / 100 - 1 )
  ```

  L'uguaglianza con l'RSI di TA-Lib vale con lo stesso avvio (scarto 8,9e-16; identità I3): `U - D` è la media delle variazioni con segno, `U + D` quella dei loro valori assoluti.
- **Perché sta in L4 (identità I5).** La media delle variazioni `A[t]` è esattamente `c / (1 - c) * (C[t] - e[t])`, dove `e` è la EMA della chiusura con lo stesso `c` (scarto relativo 8,4e-17). Quindi l'RSI centrato è **la distanza dalla media divisa per la variazione assoluta media**: una distanza misurata in giornate tipiche, limitata tra -1 e 1 qualunque sia `c`.
- **Calcolo.** Due mattoni (a) più la chiusura di ieri: 3 numeri.
- **Avvio e casi limite.** Barra 1: 0. Finché `B = 0` (nessuna variazione) espone 0 o il valore precedente. Con l'avvio da zero lo scarto dall'RSI di TA-Lib a 14 giorni è 0,0061 alla barra 15, 0,0095 alla 30, 0,0066 alla 60, 1,7e-7 alla 200.
- **Campi e parametri.** C. `c = 1/N` continuo, gene. TA-Lib usa N = 14 per default [17]; il libro di Wilder [21] non è stato letto.
- **Ingresso nel punteggio.** Già adimensionale e limitato. Peso positivo = si compra di più quando i rialzi recenti prevalgono. **Saturazione**: in una salita senza ribassi vale 1 e non distingue una salita lenta da una veloce (giorni 2-8 dell'esempio).
- **Ridondanza.** Sulla serie sintetica, che ha agitazione costante, il divisore è quasi costante e l'RSI centrato è spiegato al 96,3 % da due distanze (R² 0,963); sullo snapshot ENI, dove l'agitazione cambia, 0,737. La serie sintetica non può mostrare l'informazione L4, che è nella divisione: l'ammissione si fonda sull'identità I5, non sui dati ENI.
- **Esempio** (`c` = 1/5):

| Giorno | Variazione dC | RSI centrato | RSI classico 0-100 |
|---|---|---|---|
| 1 | - | 0,00 | 50,0 |
| 2 | 0,10 | 1,00 | 100,0 |
| 5 | 0,25 | 1,00 | 100,0 |
| 8 | 0,15 | 1,00 | 100,0 |
| 12 | -0,30 | -0,38 | 31,0 |
| 14 | -0,10 | -0,56 | 22,1 |
| 16 | 0,20 | 0,00 | 49,8 |
| 20 | 0,15 | 0,62 | 80,9 |

  Giorno 2: `A` = 0,10 × 0,2 = 0,020, `B` = 0,020, rapporto 1,00. Giorno 3: `A` = 0,020 × 0,8 + 0,20 × 0,2 = 0,056, `B` = 0,056: ancora 1,00, perché nei giorni 1-8 non c'è nessun ribasso.
- **Variante: efficienza di Kaufman con segno.** `(C[t] - C[t-N]) / somma di abs(dC)` sulle stesse N barre [6]: la versione a finestra della stessa idea, correlazione 0,888 con l'RSI centrato a 14. Convenzione diversa per la finestra piatta: TA-Lib dà 1,0 [6], il catalogo il valore precedente.
- **Con OHLC/4.** Erediterebbe la persistenza della media.
- **Fonti.** [17]; [6]; [21] solo scheda.
- **Proposta.** **Ammessa** (ingresso 3).

#### Scheda: Bande di Bollinger

- **In una frase.** Una media semplice di N giorni con due bande a `k` deviazioni standard sopra e sotto; dicono se il prezzo è lontano dalla media rispetto alla sua dispersione recente.
- **Formula.** Media `m` = SMA di N chiusure, `s` = deviazione standard di popolazione delle stesse (divisore N, come TA-Lib `STDDEV` [11]); bande `m ± k * s`. Valori predefiniti N = 20, k = 2 (regola 9 di [11]). La **deviazione standard** misura quanto i valori si allontanano dalla loro media; la regola 12 di [11] usa la SMA. Forme d'ingresso:

  ```
  z[t]    = (C[t] - m[t]) / s[t]
  pctB[t] = (C[t] - banda_bassa) / (banda_alta - banda_bassa)
          = 0.5 + z[t] / (2 * k)
  larghezza[t] = (banda_alta - banda_bassa) / m[t] = 2 * k * s[t] / m[t]
  ```

  La formula di %B è una **derivazione** dalla descrizione di [11] (regole 15-17), che non la scrive; l'uguaglianza `pctB = 0,5 + z/(2k)` è verificata con scarto 2,7e-15 (identità I4). La larghezza con k = 2 è quattro volte il coefficiente di variazione (regola 18 di [11]).
- **Calcolo.** Mattone (d): N valori e due somme.
- **Avvio e casi limite.** Barra 1: `s` = 0, si espone z = 0. Finestra piatta (`s` = 0): si tiene il valore precedente.
- **Campi e parametri.** C. N intero, k continuo (ma k non cambia z).
- **Ingresso nel punteggio.** z o %B: **lo stesso ingresso** (la costante 0,5 finisce nelle soglie). Peso positivo su z = si compra di più quando il prezzo sta in alto nelle bande. La larghezza è senza direzione (sezione 5.2).
- **Ridondanza.** z con SMA 20 è spiegato al 90 % dagli ingressi proposti (R² 0,90); correla 0,931 con lo z-score N2. La larghezza è un'altra misura di agitazione: R² 0,26 sulla serie sintetica, 0,63 su ENI.
- **Esempio** (N = 5, k = 2):

| Giorno | Chiusura | z | %B | larghezza % |
|---|---|---|---|---|
| 1 | 10,00 | 0,00 | 0,50 | 0,00 |
| 2 | 10,10 | 1,00 | 0,75 | 1,99 |
| 5 | 10,80 | 1,53 | 0,88 | 11,33 |
| 8 | 11,35 | 1,30 | 0,83 | 10,34 |
| 12 | 10,50 | -1,59 | 0,10 | 11,63 |
| 14 | 10,20 | -1,15 | 0,21 | 12,52 |
| 16 | 10,55 | 1,32 | 0,83 | 4,96 |
| 20 | 11,40 | 1,28 | 0,82 | 11,10 |

  Giorno 2: media 10,05, deviazione 0,05, z = (10,10 - 10,05) / 0,05 = 1,00, %B = 0,5 + 1/4 = 0,75.
- **Con OHLC/4.** Stessa forma su un altro prezzo.
- **Fonti.** [11].
- **Proposta.** Esclusa: z al limite della ridondanza e con finestra intera, mentre l'RSI porta la stessa idea con `c` continuo; larghezza come riserva della voce 5 (ATR).

**Variante senza scheda, N2 (z-score esponenziale).** `d / s` con `d` da N1 e `s` da N6. È la normalizzazione causale più diretta; sulla serie sintetica è spiegata al 100 % dagli ingressi proposti (R² 1,00) e anche su ENI (0,99). Resta come **forma alternativa** di N1, non come ingresso in più (sezione 5.3).

### 4.3 Lacuna L1 — agitazione, escursione, distanza dal massimo

Che cosa porta: grandezze che richiedono valore assoluto, quadrato, massimo o minimo, che nessuna somma di medie del prezzo produce.

#### Scheda: ATR (escursione vera media) e NATR

- **In una frase.** Quanto si muove il prezzo in un giorno, contando anche il salto tra la chiusura di ieri e l'apertura di oggi; dice quanto è «nervoso» il titolo, non in che direzione va.
- **Formula.** L'**escursione vera** è `TR[t] = max(H - L, abs(H - C[t-1]), abs(L - C[t-1]))`; ATR = media di Wilder di TR, `ATR = (ATR_prec * (N - 1) + TR) / N`, cioè `c = 1/N` [1]. Forma proposta senza unità: `NATR = ATR / C` (TA-Lib la moltiplica per 100 [5]).
- **Calcolo.** Mattone (a) più la chiusura di ieri: 2 numeri.
- **Avvio e casi limite.** Barra 1: TR = H - L (non c'è una chiusura di ieri); TA-Lib avvia con la media dei primi N TR [1]. Barra piatta ENI: TR = 0,034, finito.
- **Campi e parametri.** H, L, C. `c = 1/N` continuo, gene.
- **Ingresso nel punteggio.** Adimensionale, sempre positivo, **senza direzione**: con peso positivo il punteggio sale quando il mercato è agitato, sia che salga sia che scenda (sezione 5.2).
- **Ridondanza.** R² 0,35 sugli altri ingressi proposti (serie sintetica). Con la volatilità EWMA (N6) correla solo 0,63 sulla serie sintetica, che ha agitazione costante, ma 0,97 su ENI: la loro somiglianza dipende da come cambia l'agitazione nei dati reali, e la serie sintetica non la può misurare.
- **Esempio** (`c` = 1/5):

| Giorno | Massimo | Minimo | TR | ATR c=1/5 | NATR % |
|---|---|---|---|---|---|
| 1 | 10,06 | 9,94 | 0,12 | 0,120 | 1,20 |
| 2 | 10,18 | 9,95 | 0,23 | 0,142 | 1,41 |
| 5 | 10,88 | 10,55 | 0,33 | 0,219 | 2,03 |
| 8 | 11,43 | 11,17 | 0,26 | 0,236 | 2,08 |
| 12 | 10,75 | 10,46 | 0,34 | 0,271 | 2,58 |
| 14 | 10,35 | 10,12 | 0,23 | 0,261 | 2,56 |
| 16 | 10,61 | 10,35 | 0,26 | 0,250 | 2,37 |
| 20 | 11,48 | 11,22 | 0,26 | 0,267 | 2,34 |

  Giorno 2: TR = max(10,18 - 9,95; 10,18 - 10,00; 10,00 - 9,95) = 0,23; ATR = 0,120 × 0,8 + 0,23 × 0,2 = 0,142.
- **Con OHLC/4.** Non cambierebbe: usa i campi separati.
- **Fonti.** [1]; [5]; [21] solo scheda.
- **Proposta.** **Ammessa** come NATR (ingresso 5), con la domanda D3 sul termine senza direzione.

#### Scheda N6: volatilità EWMA dei rendimenti (proposta dello Step 4)

- **In una frase.** Quanto si muove di solito il prezzo da un giorno all'altro, con più peso ai giorni recenti. **Volatilità** è il nome di questa agitazione.
- **Formula.** `v[t] = v[t-1] * (1 - c) + r[t]^2 * c`, `s[t] = radice di v[t]`, con `r` il rendimento logaritmico. È la media esponenziale dei quadrati dei rendimenti delle note MIT [12], dove il peso del passato si chiama beta: nella notazione di Consilium `c = 1 - beta` (orientamento controllato). Il valore 0,94 per il peso del passato su dati giornalieri è attribuito a RiskMetrics da fonti secondarie [24].
- **Calcolo.** Mattone (a) più la chiusura di ieri: 2 numeri.
- **Avvio e casi limite.** Barra 1: 0 (non c'è un rendimento); barra 2: il primo `r^2`. Nessun denominatore.
- **Campi e parametri.** C. `c` continuo.
- **Ingresso nel punteggio.** Senza direzione come l'ATR. Uso principale: **divisore** di una distanza (N2).
- **Ridondanza.** Con l'ATR normalizzato R² 0,64 sulla serie sintetica, 0,94 su ENI (contorno).
- **Esempio** (`c` = 0,2):

| Giorno | Rendimento log % | volatilità EWMA c=0,2 % | d c=0,2 % | z = d / volatilità |
|---|---|---|---|---|
| 1 | - | 0,00 | 0,00 | 0,00 |
| 2 | 1,00 | 1,00 | 0,80 | 0,80 |
| 5 | 2,34 | 1,74 | 4,77 | 2,75 |
| 8 | 1,33 | 1,69 | 5,51 | 3,26 |
| 12 | -2,82 | 2,09 | -2,87 | -1,37 |
| 14 | -0,98 | 1,89 | -3,88 | -2,05 |
| 16 | 1,91 | 1,84 | -0,02 | -0,01 |
| 20 | 1,32 | 1,86 | 4,28 | 2,29 |

  L'ultima colonna è N2: il giorno 8 il prezzo sta 3,26 «giornate tipiche» sopra la media.
- **Con OHLC/4.** Erediterebbe la persistenza della media.
- **Fonti.** [12]; [24] non verificata.
- **Proposta.** Esclusa come ingresso diretto (alternativa all'ATR, che usa anche massimo, minimo e salti); conservata come divisore di N2.

#### Scheda N9: distanza dal massimo di N giorni (proposta dello Step 4)

- **In una frase.** Quanto il prezzo è sotto il punto più alto delle ultime N giornate: 0 significa che oggi siamo sul massimo.
- **Formula.** `dd[t] = C[t] / max(H[t-N+1 .. t]) - 1`, sempre ≤ 0.
- **Calcolo.** Mattone (c): coda monotona di al più N valori; lavoro costante in media.
- **Avvio e casi limite.** Finestra crescente; barra 1: `C/H - 1`. Nessun denominatore nullo (H > 0).
- **Campi e parametri.** H, C. N intero, gene (cambia la dimensione dello stato).
- **Ingresso nel punteggio.** Adimensionale, limitato sopra da 0. Peso positivo = si compra di più vicino al massimo, peso negativo = dopo un calo. Porta la **memoria del picco**, che una media dimentica.
- **Ridondanza.** R² 0,82 sugli altri ingressi proposti; correlazione 0,90 con la distanza lenta.
- **Esempio** (N = 10):

| Giorno | Chiusura | Massimo 10 | distanza dal massimo % |
|---|---|---|---|
| 1 | 10,00 | 10,06 | -0,60 |
| 2 | 10,10 | 10,18 | -0,79 |
| 5 | 10,80 | 10,88 | -0,74 |
| 8 | 11,35 | 11,43 | -0,70 |
| 12 | 10,50 | 11,43 | -8,14 |
| 14 | 10,20 | 11,43 | -10,76 |
| 16 | 10,55 | 11,43 | -7,70 |
| 20 | 11,40 | 11,48 | -0,70 |

  Dal giorno 8 al 16 il massimo resta 11,43 (giorno 8): l'indicatore «ricorda» il picco per 10 giorni, poi lo dimentica di colpo.
- **Con OHLC/4.** Usa H e C della barra; la scelta del prezzo non cambia il massimo.
- **Fonti.** [13] per la coda.
- **Proposta.** **Ammessa** (ingresso 4). Variante N10 «massimo che dimentica» (`m = max(H, m * (1 - c) + C * c)`), con `c` continuo: nessuna fonte, domanda D4.

#### Scheda: oscillatore stocastico

- **In una frase.** Dove si trova la chiusura di oggi nell'intervallo tra il minimo e il massimo degli ultimi N giorni: 0 sul minimo, 1 sul massimo.
- **Formula.** `%K = (C - LL) / (HH - LL)`, con `HH` e `LL` massimo e minimo su N barre; `%D` = media di 3 `%K`. TA-Lib usa per default 5, 3, 3 e liscia `%K` con una media di 3 [7]; qui `%K` è la forma non lisciata. Forma centrata: `2 * %K - 1`.
- **Calcolo.** Due mattoni (c) più una finestra di 3: fino a 2N + 3 numeri.
- **Avvio e casi limite.** Barra 1: la sola barra 1; finestra piatta (`HH = LL`): TA-Lib dà 0 [7], il catalogo tiene il valore precedente (0,5 all'inizio, cioè 0 centrato).
- **Campi e parametri.** H, L, C. N intero.
- **Ingresso nel punteggio.** Adimensionale, limitato. Saturazione come l'RSI.
- **Ridondanza.** R² 0,87 (%K 14 centrato) sugli ingressi proposti; correlazione 0,92 con la distanza veloce.
- **Esempio** (N = 5, %D su 3):

| Giorno | Chiusura | Massimo 5 | Minimo 5 | %K | %K centrato | %D 3 |
|---|---|---|---|---|---|---|
| 1 | 10,00 | 10,06 | 9,94 | 0,50 | 0,00 | 0,50 |
| 2 | 10,10 | 10,18 | 9,94 | 0,67 | 0,33 | 0,58 |
| 5 | 10,80 | 10,88 | 9,94 | 0,91 | 0,83 | 0,91 |
| 8 | 11,35 | 11,43 | 10,32 | 0,93 | 0,86 | 0,95 |
| 12 | 10,50 | 11,43 | 10,46 | 0,04 | -0,92 | 0,20 |
| 14 | 10,20 | 11,30 | 10,12 | 0,07 | -0,86 | 0,05 |
| 16 | 10,55 | 10,75 | 10,12 | 0,68 | 0,37 | 0,33 |
| 20 | 11,40 | 11,48 | 10,35 | 0,93 | 0,86 | 0,94 |

  Giorno 12: (10,50 - 10,46) / (11,43 - 10,46) = 0,04: chiusura quasi sul minimo dei cinque giorni.
- **Con OHLC/4.** Usa i campi separati.
- **Fonti.** [7]; [20] solo scheda.
- **Proposta.** Esclusa: vicino alla ridondanza con N1 e con due finestre intere; la memoria del picco la porta N9.

### 4.4 Lacuna L2 — dentro la giornata

Che cosa porta: dove chiude la giornata rispetto al suo massimo e minimo.

#### Scheda N14: posizione della chiusura nella giornata, in media (proposta dello Step 4)

- **In una frase.** Se le giornate recenti chiudono vicino al massimo (+1) o vicino al minimo (-1).
- **Formula.** `clv[t] = ((C - L) - (H - C)) / (H - L)` in [-1, 1]: è il moltiplicatore della linea di accumulo e distribuzione di Chaikin [8], senza volume. Ingresso: `EMA(clv; c)`. **Accumulo e distribuzione** sono i nomi convenzionali di periodi in cui le chiusure stanno vicino ai massimi o ai minimi con volume alto: qui è solo il nome del calcolo.
- **Calcolo.** Mattone (a): 1 numero.
- **Avvio e casi limite.** Barra 1: il suo `clv`. H = L: barra saltata (sezione 3.3).
- **Campi e parametri.** H, L, C. `c` continuo, gene.
- **Ingresso nel punteggio.** Adimensionale, limitato. Peso positivo = si compra di più dopo giornate chiuse in alto.
- **Ridondanza.** R² 0,49 sugli altri ingressi proposti: è l'ingresso di prezzo più «nuovo». Il CMF esponenziale (N18) gli è vicino (R² 0,91, correlazione 0,95).
- **Esempio:** colonna «CLV in EMA» della scheda CMF.
- **Con OHLC/4.** La media cancellerebbe proprio questa informazione; con la chiusura resta.
- **Fonti.** [8]; costruzione dello Step 4.
- **Proposta.** **Ammessa** (ingresso 6).

### 4.5 Lacuna L3 — volume con segno

Che cosa porta: in quale direzione andava il prezzo mentre si scambiava.

#### Scheda: OBV (volume in equilibrio)

- **In una frase.** Una somma che aggiunge il volume nei giorni di rialzo e lo toglie nei giorni di ribasso.
- **Formula.** `OBV[t] = OBV[t-1] + segno(C[t] - C[t-1]) * V[t]`, con avvio al primo volume [10].
- **Calcolo.** Mattone (e): 1 numero, **non limitato**.
- **Avvio e casi limite.** Il valore dipende dal giorno in cui si comincia a contare. V = 0: nessun cambiamento.
- **Campi e parametri.** C, V. Nessun parametro.
- **Ingresso nel punteggio.** Non adatto: è in numero di azioni, cresce con la storia, e lo stesso valore significa cose diverse in anni diversi. Entra attraverso N17.
- **Ridondanza.** R² 0,02 sugli ingressi proposti (sintetica): non è ridondante, ma solo perché è un'altra scala.
- **Esempio:** scheda N17.
- **Con OHLC/4.** Il segno della variazione cambierebbe nei giorni di variazione piccola.
- **Fonti.** [10]; [23] solo scheda.
- **Proposta.** Esclusa come ingresso diretto; sostituita da N17.

#### Scheda N17: OBV normalizzato (proposta dello Step 4)

- **In una frase.** Fra il volume recente, quanta parte è stata scambiata in giorni di rialzo (+1 = tutta) e quanta in giorni di ribasso (-1 = tutta).
- **Formula.** Rapporto di due EMA con lo stesso `c`, avviate da zero (sezione 3.2):

  ```
  f[t] = EMA0( segno(dC[t]) * V[t] ; c ) / EMA0( V[t] ; c )
  ```

  È l'idea dell'OBV riscritta come rapporto [ipotesi, costruzione dello Step 4 senza fonte].
- **Calcolo.** Due mattoni (a) più la chiusura di ieri: 3 numeri.
- **Avvio e casi limite.** Barra 1: 0. V = 0: le due medie calano della stessa frazione e il rapporto non cambia (barra piatta ENI, sezione 3.3).
- **Campi e parametri.** C, V. `c` continuo, gene.
- **Ingresso nel punteggio.** In [-1, 1]. Peso positivo = si compra di più quando il volume recente è andato soprattutto nei rialzi.
- **Ridondanza.** R² 0,59 sugli altri ingressi proposti; correlazione 0,76 con l'RSI centrato (entrambi contano i giorni di rialzo).
- **Esempio** (`c` = 0,2):

| Giorno | Chiusura | Volume | OBV | OBV normalizzato c=0,2 |
|---|---|---|---|---|
| 1 | 10,00 | 1000 | 1000 | 0,00 |
| 2 | 10,10 | 1100 | 2100 | 1,00 |
| 5 | 10,80 | 1600 | 6400 | 1,00 |
| 8 | 11,35 | 1400 | 11300 | 1,00 |
| 12 | 10,50 | 2200 | 4700 | -0,35 |
| 14 | 10,20 | 1500 | 1200 | -0,60 |
| 16 | 10,55 | 1300 | 3700 | -0,11 |
| 20 | 11,40 | 1400 | 9900 | 0,56 |

  L'OBV grezzo dipende da dove si comincia; quello normalizzato no. Giorni 2-8: tutti rialzi, quindi 1,00.
- **Con OHLC/4.** Come l'OBV.
- **Fonti.** [10] per l'idea.
- **Proposta.** **Ammessa** (ingresso 8).

#### Scheda: CMF (flusso di denaro di Chaikin)

- **In una frase.** Il **flusso di denaro**, cioè la posizione della chiusura nella giornata pesata con il volume, sommato su N giorni e diviso per il volume totale: unisce L2 e L3.
- **Formula.** `CMF[t] = somma(clv * V) / somma(V)` sulle ultime N barre, con `clv` della scheda N14. Valore abituale N = 20 [ipotesi, fonte da verificare: nessuna fonte primaria trovata per Chaikin; TA-Lib documenta il moltiplicatore [8] e l'oscillatore [9], non il CMF]. Variante esponenziale N18: `EMA0(clv * V; c) / EMA0(V; c)`.
- **Calcolo.** Due mattoni (b): 2N valori e due somme (N18: 2 numeri).
- **Avvio e casi limite.** H = L: barra saltata, non entra nella finestra; somma dei volumi nulla: valore precedente.
- **Campi e parametri.** H, L, C, V. N intero (N18: `c` continuo).
- **Ingresso nel punteggio.** In [-1, 1].
- **Ridondanza.** CMF 20: R² 0,74; N18: R² 0,91 (correlazione 0,95 con N14). Nel punteggio lineare, N14 e N16 separano «dove chiude» da «quanto si scambia» e lasciano a R4 la scelta di combinarli.
- **Esempio** (CMF su 5 giorni; N18 e N14 con `c` = 0,2):

| Giorno | CLV del giorno | CMF 5 | CMF esponenziale c=0,2 | CLV in EMA c=0,2 |
|---|---|---|---|---|
| 1 | 0,00 | 0,00 | 0,00 | 0,00 |
| 2 | 0,30 | 0,16 | 0,18 | 0,06 |
| 5 | 0,52 | 0,44 | 0,48 | 0,31 |
| 8 | 0,38 | 0,54 | 0,50 | 0,40 |
| 12 | -0,72 | -0,40 | -0,24 | -0,17 |
| 14 | -0,30 | -0,55 | -0,31 | -0,26 |
| 16 | 0,54 | -0,21 | -0,05 | 0,03 |
| 20 | 0,38 | 0,54 | 0,29 | 0,32 |

  Giorno 2: ((10,10 - 9,95) - (10,18 - 10,10)) / (10,18 - 9,95) = 0,07 / 0,23 = 0,30. Giorno 1: la chiusura sta esattamente a metà della giornata, `clv` = 0.
- **Con OHLC/4.** Usa i campi separati.
- **Fonti.** [8]; [9].
- **Proposta.** Riserva della voce 6 (al posto di N14, se Luca preferisce il volume dentro lo stesso ingresso).

### 4.6 Varianti e proposte senza scheda

| Proposta | Esito | Perché |
|---|---|---|
| N2 z-score `d / s` | forma alternativa di N1 | R² 1,00 sugli ingressi proposti; utile se la scala di N1 crea problemi (sezione 5.3) |
| N3 pendenza della EMA | esclusa | `e[t]/e[t-1] - 1 = c * (C[t]/e[t-1] - 1)` (scarto 2,7e-16): funzione crescente di `d[t]` della **stessa** barra, correlazione 0,9995 con `d[t]` e 0,904 con `d[t-1]` |
| N4 pendenza di una retta di regressione su N barre [4] | esclusa | filtro lineare del prezzo a finestra; nessuna lacuna [ipotesi sull'entità della ridondanza, non misurata qui] |
| N5 livello e pendenza alfa-beta (guida, sezione 4.5) | esclusa per ora | stessa informazione del gruppo A con una dinamica del secondo ordine; due parametri |
| N7 NATR | nella scheda ATR | ammessa |
| N8 volatilità di Parkinson in EMA [12] | variante dell'ATR | correlazione 0,98 con l'ATR su ENI (contorno); misura solo la seduta, non i salti tra un giorno e l'altro |
| N10 massimo che dimentica | variante di N9 | `c` continuo, ma nessuna fonte (domanda D4) |
| N11 efficienza di Kaufman | variante dell'RSI | correlazione 0,888 con l'RSI centrato |
| N12 KAMA (media adattiva di Kaufman) [6] | esclusa | una EMA con `c` guidato dall'efficienza: tre parametri per informazione già presente [ipotesi] |
| N13 ADX (indice direzionale medio) [3] | esclusa come ingresso diretto | senza direzione; avvio di circa 2N barre [ipotesi dalla descrizione di [3]] |
| N15 gap di apertura in EMA, `EMA(ln(O[t]/C[t-1]))` | riserva | R² 0,55 sugli ingressi proposti: informazione nuova (movimento a mercato chiuso); si usa solo il gap di `t` e precedenti, perché quello di `t+1` è proprio ciò che la strategia non può vedere |
| N15 corpo della barra in EMA, `EMA(ln(C[t]/O[t]))` | esclusa | R² 0,80; vicino a N14 |
| N18 CMF esponenziale | variante del CMF | R² 0,91 |
| N19 distanza dal prezzo medio pesato con il volume | esclusa per ora | riformulazione su barre giornaliere senza fonte [ipotesi] |
| N20 force index e MFI [16] | esclusi | coperti da RSI e N17 [ipotesi] |
| Williams %R | esclusa | lo stocastico riscalato [ipotesi, fonte da verificare] |
| rendimento di un giorno `r[t]` | mattone, non ingresso | il dato più rumoroso; entra in N6 e N15 |
| qualunque ingresso legato alla posizione (prezzo di carico, giorni in posizione, stop mobile) | esclusa | viola «memoria solo negli indicatori» |
| giorno della settimana, dati esterni | esclusi | non sono memoria del titolo; fuori perimetro |

## 5. Scala, normalizzazione e ridondanza

### 5.1 Perché la scala conta

In una somma pesata il contributo di un ingresso è peso per valore. Se un ingresso è in euro e un altro in milioni di azioni, i pesi non si confrontano e la mutazione di un peso ha effetti diversissimi (guida, sezione 4.8.3, dove con peso 1 il volume era di fatto ignorato). Per questo **ogni ingresso proposto è adimensionale**: un rapporto, un logaritmo di rapporto o un valore tra -1 e 1.

### 5.2 Le grandezze senza direzione

ATR, volatilità, larghezza delle bande, ADX sono **sempre positivi**: non dicono «su» o «giù». In una somma pesata spostano il punteggio sempre nello stesso verso: con peso positivo «più il mercato è agitato, più si compra», qualunque sia la direzione. È raramente la regola voluta [ipotesi]. Il loro uso naturale è **dividere** un ingresso con direzione (come fa l'RSI, sezione 4.2) o **moltiplicarlo** (ingresso prodotto, guida, sezione 4.8.2), e questa è una scelta delle equazioni di decisione (R4). Il catalogo propone **un solo** ingresso senza direzione (NATR) e chiede a Luca se tenerlo (D3).

### 5.3 La scala di N1 dipende dal gene `c`

Sulla serie sintetica la deviazione standard di `ln(C / EMA)` vale 1,7e-4 con `c` = 0,99, 4,8e-3 con 0,73, 3,6e-2 con 2/21, 6,0e-2 con 2/51 (su ENI: 1,7e-4; 4,9e-3; 4,0e-2; 6,2e-2). Con `c` che evolve, lo stesso peso vale cose diverse, e con `c` vicino a 1 l'ingresso sparisce (la media coincide con il prezzo). Due rimedi, da scegliere in R3: (a) usare la forma divisa per la volatilità (N2) o la forma RSI, che resta tra -1 e 1 qualunque sia `c`; (b) limitare `c` lontano da 1.

### 5.4 Normalizzazioni ammesse

Tutte causali e con lo stato dei mattoni: rapporto o distanza logaritmica da una media; divisione per una misura di agitazione recente (ATR, volatilità EWMA, variazione assoluta media); valore limitato riportato a un intervallo centrato (`2 * %K - 1`, RSI centrato); punteggio standardizzato **scorrevole** con media e varianza esponenziali. Esclusa la standardizzazione con media e deviazione dell'intera serie (anticipazione, sezione 1.3).

Un'analogia, solo come tale: i sistemi sensoriali dividono la risposta per l'attività recente del contesto, così il segnale resta leggibile al buio e al sole («normalizzazione divisiva» [15], letto l'abstract). Che l'analogia valga per i mercati è [ipotesi]; il conteggio degli ingressi resta per termini della somma.

### 5.5 Ridondanza: identità, serie sintetica, controllo su ENI

**Due misure.** La **correlazione** ρ, tra -1 e 1, dice quanto due serie si muovono insieme (1 = una è funzione crescente lineare dell'altra). Il **coefficiente R²**, tra 0 e 1, dice quale quota delle variazioni di un ingresso si ottiene con la migliore somma pesata degli altri: è la misura giusta per una somma pesata, perché un ingresso con R² vicino a 1 non aggiunge quasi nulla che i pesi degli altri non sappiano già fare. Esempio: R² = 0,98 significa che il 98 % delle variazioni è già ricostruibile.

**Prima prova: identità algebriche** (verificate numericamente sulla serie sintetica):

| # | Identità | Scarto massimo | Conseguenza |
|---|---|---|---|
| I1 | `ln(e_veloce / e_lenta) = d_lenta - d_veloce` | 3,1e-16 | MACD logaritmica = combinazione esatta di due N1 |
| I2 | `e[t]/e[t-1] - 1 = c * (C[t]/e[t-1] - 1)` e `d[t] = ln(1+u) - ln(1+c*u)` | 2,7e-16 e 4,1e-16 | la pendenza della EMA è una funzione di `d[t]` |
| I3 | `2 * RSI / 100 - 1 = media(dC) / media(abs(dC))` (Wilder, stesso avvio) | 8,9e-16 | l'RSI centrato è un rapporto di due medie |
| I4 | `pctB = 0.5 + z / (2 * k)` | 2,7e-15 | %B e z di Bollinger sono lo stesso ingresso |
| I5 | `EMA0(dC; c) = c / (1 - c) * (C - EMA(C; c))` | 8,4e-17 (relativo) | l'RSI centrato è una distanza divisa per la variazione assoluta media |

I5 è una derivazione dell'autore di questo catalogo (si dimostra sostituendo la ricorsione della EMA), verificata dallo script; va ricontrollata dal verificatore indipendente.

**Seconda prova: serie sintetica.** Una **passeggiata aleatoria** (prezzo che ogni giorno sale o scende di una quantità casuale, senza memoria) costruita con un generatore pseudo-casuale con **seme** dichiarato, cioè il numero che rende la sequenza ripetibile: seme 20261018, 10000 giorni, volatilità giornaliera 0,017, 30 % della varianza durante la notte, 78 passi nella seduta (da cui massimo e minimo), logaritmo del volume con memoria di un giorno 0,6 e dispersione 0,4, volume **indipendente** dal prezzo. Gli ordini di grandezza sono presi dallo snapshot ENI e arrotondati (0,0169; 0,32; 0,62; 0,41). Le prime 100 barre sono escluse. Su una serie senza struttura, una correlazione alta è **di costruzione**: vale per qualunque titolo, perché nasce dalle formule.

**Limite dichiarato della serie sintetica.** Ha agitazione costante e volume scollegato dal prezzo. Non può quindi mostrare l'informazione che sta nel cambiare dell'agitazione (L4, ATR contro N6) né quella che lega volume e prezzo: lì valgono solo le identità.

**Regola di ridondanza** [ipotesi dell'autore, da confermare]: un candidato con R² ≥ 0,90 sugli ingressi proposti (serie sintetica) è **ridondante**; sotto 0,90 non è ridondante, ma entra solo se colma una lacuna che gli altri non colmano.

Correlazioni tra gli ingressi proposti (sopra la diagonale serie sintetica, sotto ENI come controllo):

| | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| 1. d veloce (N1, c=2/11) | 1 | 0,75 | 0,87 | 0,64 | -0,51 | 0,65 | 0,02 | 0,71 |
| 2. d lenta (N1, c=2/51) | 0,75 | 1 | 0,95 | 0,90 | -0,53 | 0,63 | 0,01 | 0,69 |
| 3. RSI centrato 14 | 0,77 | 0,83 | 1 | 0,85 | -0,56 | 0,68 | 0,02 | 0,76 |
| 4. distanza dal massimo 50 (N9) | 0,54 | 0,86 | 0,66 | 1 | -0,54 | 0,57 | 0,01 | 0,63 |
| 5. ATR normalizzato 14 (N7) | -0,26 | -0,49 | -0,27 | -0,77 | 1 | -0,39 | -0,02 | -0,43 |
| 6. CLV in EMA (N14) | 0,56 | 0,65 | 0,73 | 0,48 | -0,11 | 1 | 0,02 | 0,59 |
| 7. log volume relativo (N16) | -0,13 | -0,07 | -0,06 | 0,00 | -0,03 | -0,05 | 1 | 0,01 |
| 8. OBV normalizzato (N17) | 0,67 | 0,68 | 0,87 | 0,54 | -0,20 | 0,62 | -0,05 | 1 |

Quanto ogni ingresso proposto è spiegato dagli altri sette:

| Ingresso | R² sintetica | R² ENI | R² ENI primo 40 % | R² ENI resto 60 % |
|---|---|---|---|---|
| d veloce (N1, c=2/11) | 0,84 | 0,68 | 0,72 | 0,72 |
| d lenta (N1, c=2/51) | 0,95 | 0,89 | 0,92 | 0,88 |
| RSI centrato 14 | 0,97 | 0,89 | 0,90 | 0,92 |
| distanza dal massimo 50 (N9) | 0,82 | 0,90 | 0,94 | 0,83 |
| ATR normalizzato 14 (N7) | 0,35 | 0,73 | 0,85 | 0,57 |
| CLV in EMA (N14) | 0,49 | 0,56 | 0,65 | 0,48 |
| log volume relativo (N16) | 0,00 | 0,03 | 0,07 | 0,02 |
| OBV normalizzato (N17) | 0,59 | 0,77 | 0,78 | 0,77 |

**Che cosa si legge.** Il blocco livello e tendenza (ingressi 1-4) è fortemente collineare: d lenta e RSI superano 0,90 sulla serie sintetica. Per l'RSI il motivo è noto (I5: sulla serie sintetica il divisore è quasi costante); per d lenta è il prezzo di avere due velocità, e con `c` evolvibili le velocità si spostano. Il blocco è proposto così perché ogni voce porta una cosa che le altre non hanno per costruzione (una seconda velocità, il divisore L4, il massimo); se Luca preferisce un blocco più compatto, la domanda D2 lo chiede. Gli ingressi 5-8 portano informazione in gran parte nuova.

**Controllo di contorno sullo snapshot ENI** (sola lettura, intero snapshot e due tratti: primo 40 % e restante 60 %; non guida la scelta). Le correlazioni cambiano tra i tratti: distanza a `c` = 2/21 e RSI centrato valgono 0,79 nel primo tratto e 0,93 nel secondo, distanza e z di Bollinger 0,66 e 0,87. Scegliere gli ingressi guardando ENI significherebbe sceglierli sugli stessi dati su cui R6 valuterà i genomi; per questo il catalogo usa ENI solo per mostrare dove la serie sintetica non arriva (agitazione variabile: ATR e volatilità EWMA 0,97 su ENI contro 0,63 sulla serie sintetica).

## 6. Famiglie con parametri evolvibili

**Parametro continuo o finestra intera.** Il coefficiente `c` di una EMA è **continuo**: si muta e si mescola come gli attuali coefficienti IIR, nel vincolo `0 < c < 1` di `genome.js`, e non cambia la dimensione dello stato. Una finestra N (SMA, ROC, stocastico, N9) è un **intero**: cambiarla cambia quanti valori si conservano e l'avvio, e incrocio e mutazione devono trattarla a parte (R3). Quasi tutti gli ingressi proposti hanno la forma continua; solo N9 ha una finestra intera (alternativa continua: N10, senza fonte).

**Due costi delle famiglie evolvibili.**

1. **Scala.** La scala dell'ingresso dipende dal gene (sezione 5.3).
2. **Avvio diverso da individuo a individuo.** Con `c` = 2/11 l'avvio dura 15 barre, con 2/51 ne dura 75, con Wilder 14 ne dura 41; una finestra di 50 giorni 50 barre. Due genomi con geni diversi sono quindi valutati su un numero diverso di barre «affidabili». È un fatto per R6, che può fissare un avvio massimo comune escluso dalla valutazione.

**Intervallo di `c`: questione per R3.** Il catalogo non lo fissa. Elementi per la scelta: valori vicini a 1 annullano N1 (sezione 5.3); l'avvio cresce come `ln 0,05 / ln(1 - c)`; le due velocità di N1 devono restare ordinate (`c_veloce > c_lenta`). Un'opzione per R3 è far evolvere la velocità più rapida e il rapporto tra le velocità, invece di due `c` indipendenti: le velocità non possono coincidere per costruzione, ma la spaziatura diventa fissa [ipotesi, nessuna fonte per l'uso in un genoma].

**Dimensione del genoma.** Con gli 8 ingressi proposti: 8 pesi, 2 soglie e 8 parametri degli indicatori (7 `c` continui e 1 N intero) = **18 numeri**, senza bias. Con due soglie il bias è ridondante (spostare bias e soglie della stessa costante non cambia le decisioni), e moltiplicare pesi e soglie per la stessa costante positiva neppure: almeno un grado di libertà dei 18 non cambia le decisioni (algebra del ciclo 011, Step 5). Il conteggio è da passare a R3, che decide la codifica.

## 7. Esito: ammessi ed esclusi

### 7.1 La regola di conteggio (decisa da Luca, Q2)

1. **Ogni termine della somma pesata conta uno.** Un indicatore con più uscite (linea e segnale della MACD, %K e %D dello stocastico) conta uno per ogni uscita usata.
2. **Non si ammette un termine che è combinazione lineare esatta di altri ingressi presenti.** Esempi: la MACD logaritmica quando ci sono le due distanze con le stesse velocità (I1); l'istogramma quando ci sono linea e segnale; %B quando c'è z di Bollinger (I4).
3. I **parametri** delle famiglie (i `c`, le finestre) sono geni: non contano nel limite di 10, contano nella dimensione del genoma (capitolo 6).
4. Un indicatore usato **solo come divisore** dentro un altro ingresso (la volatilità dentro N2) non è un termine della somma.

### 7.2 Fatti di calcolo

Parametri d'esempio della sezione 5.5; «avvio» = barre perché il valore di partenza pesi meno del 5 %, o lunghezza della finestra.

| Indicatore | Campi | Mattone e stato | Lavoro per barra | Avvio (barre) | Filtro IIR equivalente |
|---|---|---|---|---|---|
| EMA / N1 | C | (a), 1 numero | costante | 15 (`c` 2/11), 75 (`c` 2/51) | sì, stesso `c` |
| SMA | C | (b), N + 1 | costante | N | no |
| MACD | C | (a) × 3 | costante | almeno 39 (26 giorni) | sì, tre in cascata |
| ROC | C | (b), N + 1 | costante | N | no |
| N16 | V | (a), 1 | costante | 30 (`c` 2/21) | sì, sul volume |
| RSI centrato | C | (a) × 2 + 1 | costante | 41 (Wilder 14) | sì, `c = 1/N` |
| Bollinger | C | (d), N + 2 | costante, sensibile agli arrotondamenti | N | no |
| ATR / NATR | H, L, C | (a) + 1 | costante | 41 (Wilder 14) | sì, `c = 1/N` |
| N6 | C | (a) + 1 | costante | 49 (`c` 0,06) | sì, su `r^2` |
| N9 | H, C | (c), fino a N | costante in media | N | no |
| stocastico | H, L, C | (c) × 2 + (b) | costante in media | N | no |
| N14 | H, L, C | (a), 1 | costante | 30 (`c` 2/21) | sì, su `clv` |
| OBV | C, V | (e), 1 | costante | nessuno: dipende dall'inizio | no |
| N17 | C, V | (a) × 2 + 1 | costante | 30 (`c` 2/21) | sì, rapporto di due |
| CMF / N18 | H, L, C, V | (b) × 2 / (a) × 2 | costante | N / 30 | N18 sì |

### 7.3 Fatti per il punteggio

| Indicatore | Ruolo | Lacuna | Forma d'ingresso | Intervallo | R² sugli ingressi proposti | Esito |
|---|---|---|---|---|---|---|
| EMA | mattone | A | attraverso N1 | - | - | mattone |
| N1 veloce, lenta | ingresso | A | `ln(C / EMA)` | circa ±0,1 | 0,84 e 0,95 | **ammessi (1, 2)** |
| SMA | variante | A | `ln(C / SMA)` | circa ±0,1 | 0,95 | escluso: ridondante |
| MACD | variante | A | `ln(EMA_v / EMA_l)` | circa ±0,1 | 0,97 (linea) | escluso: regola 2 e ridondanza |
| ROC | variante | A | `ln(C[t] / C[t-N])` | circa ±0,2 | 0,79-0,83 | escluso: nessuna lacuna |
| N16 | ingresso | A (volume) | `ln(V / EMA V)` | circa ±1 | 0,00 | **ammesso (7)** |
| RSI | ingresso | L4 | `A / B` | [-1, 1] | 0,97 | **ammesso (3)**, per I5 |
| Bollinger | variante | L4 | z | circa ±2 | 0,90 | escluso: ridondante, finestra intera |
| ATR | ingresso | L1 | NATR | > 0 | 0,35 | **ammesso (5)**, D3 |
| N6 | normalizzatore | L1 | `s` | > 0 | 0,64 | escluso come diretto |
| N9 | ingresso | L1 | `C / max H - 1` | ≤ 0 | 0,82 | **ammesso (4)**, D4 |
| stocastico | variante | L1 | `2 %K - 1` | [-1, 1] | 0,87 | escluso: N9 e N1 lo coprono |
| N14 | ingresso | L2 | `EMA(clv)` | [-1, 1] | 0,49 | **ammesso (6)** |
| OBV | mattone | L3 | attraverso N17 | non limitato | - | escluso come diretto |
| N17 | ingresso | L3 | rapporto di EMA | [-1, 1] | 0,59 | **ammesso (8)** |
| CMF | variante | L2, L3 | `somma(clv V) / somma V` | [-1, 1] | 0,74 (N18: 0,91) | riserva della voce 6 |

Gli intervalli con «circa» sono ordini di grandezza osservati, non limiti [ipotesi].

### 7.4 L'elenco proposto

**Ammessi: 8 ingressi** (sotto il limite di 10).

1. **d veloce** (N1): distanza dalla EMA veloce; gene `c`. Motivo: livello rispetto alla storia breve; base del gruppo A.
2. **d lenta** (N1): distanza dalla EMA lenta; gene `c` con `c < c_veloce`. Motivo: seconda velocità; con le due distanze la MACD è già nello spazio dei pesi (I1).
3. **RSI centrato**: gene `c = 1/N`. Motivo: è la distanza misurata in giornate tipiche (I5), limitata qualunque sia `c` (L4).
4. **Distanza dal massimo** (N9): gene N. Motivo: memoria del picco, non lineare (L1).
5. **NATR**: gene `c`. Motivo: l'unica misura di agitazione e l'unica che vede i salti tra un giorno e l'altro (L1); senza direzione (D3).
6. **Posizione della chiusura in media** (N14): gene `c`. Motivo: informazione dentro la barra (L2), la più nuova tra quelle di prezzo (R² 0,49).
7. **Log volume relativo** (N16): gene `c`. Motivo: livello del volume senza unità.
8. **OBV normalizzato** (N17): gene `c`. Motivo: volume con segno (L3), limitato e senza dipendenza dall'inizio.

**Perché non 10 o 12.** I candidati rimasti sono ridondanti (SMA, MACD, Bollinger, N18), non colmano una lacuna (ROC, stocastico) o hanno un problema di scala (OBV). L'unico con informazione nuova è il gap N15 (R² 0,55): è la **riserva** per un nono posto, se Luca la vuole. Un motivo strategico per 11-12 dovrebbe essere una lacuna non coperta, e oggi non se ne vede.

**Memoria solo negli indicatori: verificata.** Nessun ingresso dipende dal prezzo di acquisto, dalla posizione aperta o da variabili del genoma; ognuno è funzione dei soli OHLCV fino alla barra `t` e dei propri parametri.

### 7.5 Che cosa non si è potuto accertare

- I testi originali di Wilder [21], Appel [22], Lane [20], Granville [23] e di Chaikin non sono stati letti: le formule vengono da TA-Lib. Per il CMF non c'è una fonte primaria né una pagina di libreria letta con la formula.
- Il valore 0,94 di RiskMetrics è solo di seconda mano [24]; il testo di Working [18] non è accessibile.
- La durata del «periodo instabile iniziale» di TA-Lib non è documentata nelle pagine lette [1][2].
- N10, N17 e il volume relativo in forma logaritmica sono costruzioni senza fonte; I5 è una derivazione dell'autore.
- La soglia R² ≥ 0,90 è una scelta dell'autore; con altri parametri d'esempio i valori cambiano.
- La serie sintetica non misura la ridondanza che nasce dall'agitazione variabile né dal legame tra volume e prezzo.
- La causa della barra piatta del 2023-08-15 e del giorno mancante (14 agosto 2023).
- L'adeguatezza al contratto di strategia è sulla carta finché E2 non la prova; non è verificato che il controller chieda solo valori finiti per tutti gli indicatori esposti oltre la riga 29 del validatore.

## 8. Rischi da passare alle fasi successive

| Fase | Rischio | Che cosa serve |
|---|---|---|
| R3 (codifica) | scala dell'ingresso che dipende da `c`; velocità che convergono; finestra intera di N9 | intervallo di `c`, vincolo `c_veloce > c_lenta`, trattamento dell'intero |
| R4 (decisione) | grandezze senza direzione nella somma; interazioni (volume con direzione); che cosa decidere durante l'avvio | forma d'uso di NATR e N16; politica di avvio |
| R5 (fitness) | nessuno specifico degli indicatori | - |
| R6 (valutazione) | prezzo di vendita alla media della giornata (sezione 2.5); avvio diverso per genoma; scelte fatte guardando i dati ENI | avvio comune escluso; dichiarazione del limite d'esecuzione; tratti di dati separati |
| E2 (implementazione) | `NaN` silenzioso (sezione 3.3); valore finito alla barra 1; prezzo di vendita | regola del salto in ogni mattone; test sulla barra di indice 1738; casi di prova dagli esempi |

## 9. Domande per Luca

- **D1 — Elenco finale.** Quali ingressi entrano nel genoma (proposta: gli 8 della sezione 7.4)? La scelta si registra nel blocco `## Human Verification` del ciclo.
- **D2 — Blocco livello e tendenza.** Tenere quattro ingressi (due distanze, RSI, distanza dal massimo), che sulla serie sintetica sono molto correlati, o ridurli a tre togliendo una distanza?
- **D3 — Termine senza direzione.** Tenere l'ATR normalizzato come ingresso diretto, o lasciarlo a R4 come divisore o fattore di un prodotto?
- **D4 — Distanza dal massimo.** Finestra intera N (con fonte per il calcolo) o «massimo che dimentica» con `c` continuo (senza fonte)?

## Glossario

- **Accumulatore.** Stato che somma un valore a ogni barra e non torna mai indietro (OBV grezzo).
- **Accumulo e distribuzione.** Nomi convenzionali di periodi con chiusure vicino ai massimi (accumulo) o ai minimi (distribuzione) e volume alto; nel catalogo solo nomi di calcoli.
- **Anticipazione dei dati (look-ahead).** Usare un dato non ancora disponibile il giorno della decisione.
- **Apertura, massimo, minimo, chiusura.** Primo prezzo, prezzo più alto, più basso e ultimo della giornata.
- **Autocorrelazione di primo ordine.** Correlazione di una serie con se stessa spostata di un giorno.
- **Avvio (warm-up).** Barre iniziali in cui l'indicatore dipende ancora troppo dal valore di partenza.
- **Barra.** Un giorno di borsa riassunto in OHLCV.
- **Bias.** Costante aggiunta alla somma pesata; con due soglie è ridondante.
- **Coda monotona.** Struttura che tiene solo i valori che possono ancora diventare il massimo (o il minimo) di una finestra.
- **Correlazione (ρ).** Numero tra -1 e 1 che dice quanto due serie si muovono insieme.
- **Deviazione standard.** Misura della dispersione dei valori attorno alla loro media.
- **Escursione vera (TR).** Il maggiore tra massimo meno minimo e le distanze di massimo e minimo dalla chiusura di ieri.
- **Età media.** `(1 - c) / c`: età media dei dati dentro una EMA; la costante di tempo del catalogo.
- **Filtro IIR.** Nome che il codice di Consilium dà alle sue EMA.
- **Flusso di denaro.** Posizione della chiusura nella giornata moltiplicata per il volume (CMF).
- **Gap.** Salto tra la chiusura di ieri e l'apertura di oggi.
- **Ingresso.** Termine della somma pesata del punteggio.
- **Ipercomprato, ipervenduto.** Letture convenzionali di un oscillatore molto alto o molto basso; non sono previsioni.
- **Lacuna (L1-L4).** Informazione che i quattro filtri attuali non possono produrre.
- **Logaritmo naturale (ln).** Funzione che trasforma rapporti in differenze; `ln(1,01)` = 0,00995.
- **Media di Wilder.** EMA con `c = 1/N`.
- **Momentum (slancio).** Variazione del prezzo in N giorni (ROC).
- **OHLCV.** Apertura, massimo, minimo, chiusura, volume.
- **Oscillatore.** Indicatore con valori in un intervallo fisso (RSI, stocastico).
- **Passeggiata aleatoria.** Serie in cui ogni passo è casuale e indipendente dai precedenti.
- **R².** Quota delle variazioni di un ingresso ricostruibile con una somma pesata di altri.
- **Rendimento logaritmico.** `ln(C[t] / C[t-1])`.
- **Seme.** Numero che rende ripetibile una sequenza pseudo-casuale.
- **Stop loss, take profit.** Chiusure automatiche di una posizione sotto o sopra una soglia di prezzo.
- **Volatilità.** Quanto si muove di solito il prezzo da un giorno all'altro.
- **Volume.** Numero di azioni scambiate in un giorno.
- **z-score.** Distanza divisa per una misura di dispersione: «quante giornate tipiche».

## Riferimenti

Stato: **letta** = pagina aperta e letta per l'affermazione citata (dall'Explorer allo Step 4 e, dove indicato, ricontrollata dal Critic allo Step 5 del ciclo 011); **scheda** = vista solo la scheda bibliografica o l'abstract; **non verificata** = trovata solo in fonti secondarie. Il 2026-10-18 tutti gli URL sotto hanno risposto con codice 200; il Builder ha riletto le pagine [1], [2], [7], [9], [10], [17] e [19] per i periodi predefiniti e, per [10], la formula.

1. TA-Lib, *ATR — Average True Range*. https://ta-lib.org/functions/atr.html. Letta (Step 4, ricontrollata Step 5): escursione vera, avvio con media dei primi N, ricorsione di Wilder.
2. TA-Lib, *EMA — Exponential Moving Average*. https://ta-lib.org/functions/ema.html. Letta (Step 4 e 5): `k = 2/(period+1)`, avvio con la media dei primi N.
3. TA-Lib, *ADX — Average Directional Movement Index*. https://ta-lib.org/functions/adx.html. Letta (Step 4).
4. TA-Lib, *LINEARREG_SLOPE*. https://ta-lib.org/functions/linearreg_slope.html. Letta (Step 4 e 5).
5. TA-Lib, *NATR — Normalized Average True Range*. https://ta-lib.org/functions/natr.html. Letta (Step 4): `NATR = ATR / Close * 100`.
6. TA-Lib, *ER — Kaufman Efficiency Ratio* e *KAMA*. https://ta-lib.org/functions/er.html e https://ta-lib.org/functions/kama.html. Lette (Step 4); i libri di Kaufman citati dalla pagina non sono stati letti.
7. TA-Lib, *STOCH*. https://ta-lib.org/functions/stoch.html. Letta (Step 4 e 5; riletta oggi per 5, 3, 3 e la lisciatura di %K); la pagina non cita Lane.
8. TA-Lib, *AD — Chaikin A/D Line*. https://ta-lib.org/functions/ad.html. Letta (Step 4): moltiplicatore `((C-L)-(H-C))/(H-L)`.
9. TA-Lib, *ADOSC — Chaikin A/D Oscillator*. https://ta-lib.org/functions/adosc.html. Letta (Step 4 e 5): aggiornamento «only when high>low».
10. TA-Lib, *OBV*. https://ta-lib.org/functions/obv.html. Letta (Step 4).
11. J. Bollinger, *Bollinger Band Rules*. https://www.bollingerbands.com/bollinger-band-rules. Letta (Step 4 e 5): regole 9, 12, 15-17, 18; non dà la formula di %B né dice se la deviazione standard è di popolazione. TA-Lib *STDDEV*, https://ta-lib.org/functions/stddev.html, letta: divisore N.
12. P. Kempthorne, *Volatility Modeling*, MIT 18.S096, lezione 9, 2013. https://ocw.mit.edu/courses/18-s096-topics-in-mathematics-with-applications-in-finance-fall-2013/32f868169964ba3cf5015de880cf2172_MIT18_S096F13_lecnote9.pdf. Letta (pagine 6-13, Step 4 e 5). Materiale didattico; gli articoli di Parkinson e di Garman e Klass non sono stati letti.
13. D. Lemire, *Streaming Maximum-Minimum Filter Using No More than Three Comparisons per Element*, Nordic Journal of Computing 13(4), 2006. https://arxiv.org/abs/cs/0610046. Scheda (abstract).
14. Libreria Python `ta`, documentazione. https://technical-analysis-library-in-python.readthedocs.io/en/latest/ta.html. Letta in parte (Step 4); non dà formule: non usata come fonte di formule.
15. M. Carandini, D. J. Heeger, *Normalization as a canonical neural computation*, Nature Reviews Neuroscience 13(1), 51-62, 2012 (online 2011). https://pmc.ncbi.nlm.nih.gov/articles/PMC3273486. Scheda (abstract).
16. TA-Lib, *MFI*. https://ta-lib.org/functions/mfi.html. Letta (Step 4); l'articolo di Quong e Soudack non è stato letto.
17. TA-Lib, *RSI*. https://ta-lib.org/functions/rsi.html. Letta (Step 4 e 5): rialzi e ribassi, avvio con media semplice, ricorsione `((n-1) * U_prec + U) / n`.
18. A. Cowles, *A Revision of Previous Conclusions Regarding Stock Price Behavior*, Econometrica 28(4), 909-915, 1960, https://www.econometricsociety.org/publications/econometrica/1960/10/01/revision-previous-conclusions-regarding-stock-price-behavior (scheda con abstract), e H. Working, *Note on the Correlation of First Differences of Averages in a Random Chain*, stesso numero, 916-918, https://www.econometricsociety.org/publications/econometrica/1960/10/01/note-correlation-first-differences-averages-random-chain (solo scheda; testo non accessibile).
19. TA-Lib, *MACD*. https://ta-lib.org/functions/macd.html. Letta (Step 4; riletta oggi): EMA veloce 12, lenta 26, lisciatura del segnale 9; cita G. Appel, *Stock Market Trading Systems*, Traders Press.
20. G. C. Lane, «Lane's Stochastics», *Technical Analysis of Stocks & Commodities* 2(3), 87-90, 1984. Solo scheda.
21. J. W. Wilder Jr., *New Concepts in Technical Trading Systems*, Trend Research, 1978. Solo scheda.
22. G. Appel, *Technical Analysis: Power Tools for Active Investors*, FT Press, 2005. Solo scheda (TA-Lib cita un altro libro dello stesso autore, [19]).
23. J. E. Granville, *Granville's New Strategy of Daily Stock Market Timing for Maximum Profit*, Simon & Schuster. Solo come riferimento della pagina [10].
24. J.P. Morgan/Reuters, *RiskMetrics — Technical Document*, 4ª ed., 1996. Non verificata (solo fonti secondarie per il valore 0,94).

**Codice citato** (letto il 2026-10-18): `src/vendor/consilium/algorithm.js` (righe 20-62, 345-348, 369-384), `stockStream.js` (32-34), `trader.js` (97, 153), `portfolio.js` (215), `life.js` (622-623, 646-650), `src/engine/strategy.js` (40-60), `genome.js` (14-17, 86), `fitnessValidator.js` (29, 57-58), `simulationController.js` (43, 90-94); `src/data/eni-ohlcv.json` in sola lettura.
