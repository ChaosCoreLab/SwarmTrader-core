---
title: "Catalogo degli indicatori del genoma"
layout: doc
last_verified: 2026-10-19
---

# Catalogo degli indicatori del genoma

<style>
.doc-content table { display: block; max-width: 100%; overflow-x: auto; }
.doc-content li, .doc-content p { overflow-wrap: anywhere; }
</style>

Questo catalogo dice quali **indicatori** (numeri calcolati dai prezzi e dai volumi passati) possono diventare gli **ingressi** del nuovo genoma a punteggio lineare con soglie, e quali no. Nel genoma scelto dal ciclo 010 la memoria del passato sta **solo negli indicatori**: il genoma somma gli ingressi con dei pesi e confronta la somma con due soglie, senza altre variabili. Quindi l'elenco degli ingressi decide tutto ciò che il genoma può «ricordare». Il catalogo è la ricerca **R2** dell'epica; la scelta finale dell'elenco spetta a Luca.

È scritto in italiano per chi sa programmare ma non ha competenze di finanza. Ogni termine è spiegato la prima volta che compare, con un esempio numerico, e raccolto nel [Glossario](#glossario). Le idee di base (punteggio, media esponenziale, correlazione) sono riassunte in [Prima di cominciare](#prima-di-cominciare-sei-idee-usate-ovunque); la spiegazione lunga, con altri esempi, è nella [Guida alle forme di genoma](../genome-forms-guide/) (sezioni 1.3.1-1.3.4 e capitolo 4), che però non serve per leggere questo documento.

> **Avvertenza: i valori degli esempi sono inventati e non provano nulla sulla qualità degli indicatori.** Gli esempi usano il dataset di 20 giorni della guida, esteso con apertura, massimo e minimo secondo una regola scritta (sezione 1.5). Pesi e soglie dell'esempio di punteggio (sezione 7.5) sono scelti a mano per mostrare il meccanismo, non ottimizzati. Le correlazioni sono calcolate su una serie casuale costruita apposta e, solo come controllo, sui dati di ENI. Nessun numero di questo documento dice che un indicatore «funziona», cioè che porti a guadagnare, e nessun esempio è una promessa di guadagno.

**Che cosa confronta.** Gli indicatori sono confrontati per cinque proprietà: si possono **calcolare** una barra alla volta con poco lavoro; quanto **stato** (numeri da ricordare tra un giorno e l'altro) richiedono; sono **causali**, cioè usano solo il passato; hanno una **scala** adatta a una somma pesata; quanto sono **ridondanti** con gli altri. Non sono confrontati per rendimento.

**Che cosa significa `[ipotesi]`.** Marca un'affermazione che è un giudizio dell'autore, o conoscenza generale senza una fonte letta per questo catalogo. `[ipotesi, fonte da verificare]` dice che una fonte dovrebbe esistere ma non è stata aperta. I numeri tra parentesi quadre, per esempio [2], rimandano ai [Riferimenti](#riferimenti), dove ogni fonte ha il suo stato: letta, solo scheda, non verificata.

**Convenzioni.** Decimali con la virgola nel testo e nelle tabelle, con il punto nei blocchi di codice. Le percentuali degli esempi sono arrotondate a due decimali. «Indice» di una barra dello snapshot ENI significa posizione contando da 0. Le decisioni del genoma si scrivono come nel codice: `buy` (compra), `hold` (resta come sei), `sell` (vendi).

## Come leggere questo documento

| Se hai | Leggi | Che cosa ottieni |
|---|---|---|
| 10 minuti | «In breve» | la proposta, le quattro domande D1-D4 con le opzioni, e che cosa succede scegliendo l'una o l'altra |
| 30 minuti | «In breve», «Prima di cominciare», sezione 7.5 (esempio completo), capitolo 9 | come gli otto ingressi proposti diventano una decisione `buy`, `hold` o `sell` su un dataset di prova |
| un'ora o più | anche le schede del capitolo 4 delle voci che ti interessano | formula, stato, avvio, casi limite, fonti di ogni indicatore |

La tabella si legge per riga: scegli il tempo che hai e leggi le parti indicate. Le schede del capitolo 4 sono consultazione: ognuna si apre con una frase senza formule e si chiude con un riquadro «Per la decisione».

### Sigle usate

Il documento usa alcune sigle per non ripetere nomi lunghi. La tabella dice che cosa indicano; dove possibile il testo scrive anche il nome per esteso.

| Sigla | Che cosa indica | Dove si spiega |
|---|---|---|
| R2, R3, R4, R5, R6 | le ricerche dell'epica sul nuovo genoma: R2 è questo catalogo; R3 la codifica genetica (come i numeri del genoma sono scritti e fatti evolvere); R4 le equazioni di decisione (come il punteggio diventa `buy`, `hold` o `sell`, e se gli ingressi si combinano tra loro); R5 la fitness (il voto che premia un genoma); R6 il protocollo di valutazione (su quali dati e con quali regole si giudica un genoma) | issue dell'epica |
| E2 | l'implementazione nel codice del nuovo genoma | issue dell'epica |
| D1-D4 | le quattro domande a Luca di questo documento | «In breve» e capitolo 9 |
| Q1-Q4 | domande poste a Luca durante il ciclo e già decise il 2026-10-18 | «In breve» |
| N1-N20 | numeri delle proposte nate durante la ricerca, fuori dall'elenco minimo (vedi tabella sotto) | capitolo 4 |
| A, L1-L4 | i gruppi delle schede: A = ciò che i filtri attuali vedono già; L1-L4 = **lacune**, cioè tipi di informazione che i filtri attuali non vedono | sezione 4.0 |
| I1-I5 | **identità**: uguaglianze esatte tra indicatori, dimostrate con l'algebra e controllate con lo script | sezione 5.5 |
| (a)-(e) | i cinque **mattoni di stato** con cui sono costruiti gli indicatori | sezione 3.1 |
| O, H, L, C, V | apertura, massimo, minimo, chiusura, volume di un giorno (OHLCV) | sezione 1.1 |

Le proposte numerate, con il nome che il documento usa per esteso:

| Sigla | Nome | Sigla | Nome |
|---|---|---|---|
| N1 | distanza logaritmica da una EMA | N11 | efficienza di Kaufman |
| N2 | z-score: distanza divisa per la volatilità | N12 | KAMA, media adattiva di Kaufman |
| N3 | pendenza della EMA | N13 | ADX, indice direzionale medio |
| N4 | pendenza di una retta di regressione | N14 | posizione della chiusura nella giornata, in media |
| N5 | livello e pendenza alfa-beta | N15 | gap di apertura e corpo della barra, in media |
| N6 | volatilità EWMA dei rendimenti | N16 | logaritmo del volume relativo |
| N7 | ATR normalizzato (NATR) | N17 | OBV normalizzato |
| N8 | volatilità di Parkinson | N18 | CMF esponenziale |
| N9 | distanza dal massimo di N giorni | N19 | distanza dal prezzo medio pesato con il volume |
| N10 | massimo che dimentica | N20 | force index e MFI |

Questa tabella si legge come un dizionario a due colonne: a sinistra la sigla, a destra il nome.

## In breve

**Il problema.** Il genoma attuale vede il passato solo attraverso quattro **medie esponenziali** (EMA: medie dei giorni passati in cui ogni giorno pesa un po' meno di quello che lo segue), due del prezzo e due del volume. Una somma pesata di medie del prezzo resta una media del prezzo: non sa quanto il mercato è agitato, dove chiude una giornata, se il volume accompagna i rialzi o i ribassi. Il nuovo genoma calcola ogni giorno un **punteggio**, cioè una somma di ingressi moltiplicati per dei pesi, e lo confronta con due soglie: sopra la soglia alta `buy`, sotto la soglia bassa `sell`, in mezzo `hold`. Servono ingressi che portino le informazioni mancanti, ciascuno ridotto a un numero senza unità di misura e calcolabile giorno per giorno senza guardare il futuro.

**La proposta: 8 ingressi** (sotto il limite di 10; nessun motivo trovato per arrivare a 12). Ogni riga è un termine della somma. La colonna «Gene» dice quale parametro dell'ingresso l'algoritmo genetico farebbe evolvere: `c` è il **peso del dato nuovo** in una media esponenziale (tra 0 e 1: grande = memoria corta), `N` un numero intero di giorni. L'ultima colonna è il valore dell'ingresso il giorno 12 del dataset inventato, un giorno di discesa dopo un picco: quasi tutti gli ingressi sono negativi, solo il volume è sopra il solito.

| # | Ingresso proposto | Che cosa porta | Gene | Giorno 12 |
|---|---|---|---|---|
| 1 | distanza dalla EMA veloce (N1) | dove sta il prezzo rispetto alla storia breve | `c` continuo | -0,023 |
| 2 | distanza dalla EMA lenta (N1) | dove sta il prezzo rispetto alla storia lunga | `c` continuo | -0,029 |
| 3 | RSI centrato | rialzi contro ribassi recenti: la distanza dalla media misurata in «giornate tipiche» | `c` continuo | -0,380 |
| 4 | distanza dal massimo di N giorni (N9) | memoria del punto più alto, che una media perde | `N` intero | -0,081 |
| 5 | ATR normalizzato (NATR) | quanto si muove il prezzo in un giorno, senza direzione | `c` continuo | 0,026 |
| 6 | posizione della chiusura nella giornata, in media (N14) | se le giornate chiudono vicino al massimo o al minimo | `c` continuo | -0,174 |
| 7 | logaritmo del volume relativo (N16) | se oggi si scambia più o meno del solito | `c` continuo | 0,310 |
| 8 | OBV normalizzato (N17) | quanta parte del volume recente è andata in giorni di rialzo | `c` continuo | -0,353 |

**Un esempio in una frase** (sezione 7.5). Con pesi scelti a mano il punteggio del giorno 12 vale -3,50, sotto la soglia bassa: la decisione è `sell`, eseguita all'apertura del giorno dopo. Nei 20 giorni inventati le decisioni sono 11 `buy`, 5 `hold` e 4 `sell`; i numeri mostrano il meccanismo, non un risultato.

**Riserve** (da usare al posto di una voce o come nona): il gap di apertura in media (N15), il CMF (flusso di denaro di Chaikin) al posto della voce 6. **Esclusi** con motivo (capitolo 7): MACD (si ottiene esattamente dalle voci 1 e 2), SMA, Bande di Bollinger, ROC, stocastico, volatilità EWMA come ingresso diretto, OBV grezzo e altri.

### Che cosa si chiede a Luca

Quattro domande. Ognuna si può rispondere con questa sezione; il capitolo 9 le ripete con i rimandi.

**D1 — Elenco finale.** Quali ingressi entrano nel genoma? La proposta sono gli 8 della tabella. Rispondere «sì» approva l'elenco; altrimenti basta dire quali togliere e quali riserve aggiungere (gap di apertura, CMF). Conseguenza: R3 (codifica), R4 (decisione) ed E2 (codice) partono da questo elenco. La scelta si registra nel blocco `## Human Verification` del file del ciclo.

**D2 — Quattro ingressi che si somigliano.** Gli ingressi 1-4 (due distanze dalla media, RSI centrato, distanza dal massimo) descrivono tutti «dove sta il prezzo rispetto al suo passato recente», e si muovono molto insieme: su una serie casuale di prova la distanza lenta si ricostruisce al 95 % dagli altri ingressi e l'RSI al 97 %.

- (a) **Tenerli tutti e quattro** (proposta). Ognuno porta un dettaglio che gli altri non hanno per costruzione: una seconda velocità di memoria (e con due velocità anche la MACD è già rappresentata), la divisione per l'agitazione recente, la memoria del picco. Costo: pesi che si compensano tra loro, quindi meno facili da interpretare. Nell'esempio, togliere la distanza lenta cambia la decisione in 3 giorni su 20.
- (b) **Ridurli a tre togliendo la distanza lenta.** Due numeri in meno nel genoma (un peso e un `c`) e pesi più leggibili; la differenza tra media veloce e media lenta non è più rappresentabile.

**D3 — Un ingresso senza direzione.** L'ATR normalizzato (voce 5) dice quanto il prezzo si muove in un giorno, non se sale o scende: è sempre positivo. In una somma pesata sposta il punteggio sempre dallo stesso lato, come se spostasse le soglie: con un peso negativo rende più difficile comprare quando il mercato è agitato, con uno positivo più facile.

- (a) **Tenerlo come ingresso** (proposta). È l'unica misura di agitazione proposta e l'unica che vede i salti tra la chiusura di ieri e l'apertura di oggi.
- (b) **Toglierlo dalla somma** e lasciare a R4 la scelta di usarlo per dividere o moltiplicare un altro ingresso. Si libera un posto, ma l'informazione entra solo se R4 la usa. Nell'esempio toglierlo non cambia nessuna decisione.

**D4 — Distanza dal massimo: finestra fissa o memoria che sfuma.**

- (a) **Massimo degli ultimi N giorni** (proposta). Calcolo con una fonte; il gene è un intero N, che cambia quanti valori conservare e quanto dura l'avvio; il picco si dimentica di colpo dopo N giorni.
- (b) **«Massimo che dimentica»**: un solo numero che segue il massimo e poi scende piano verso il prezzo. Il gene è un `c` continuo come gli altri e il picco sfuma gradualmente; nessuna fonte né libreria lo calcola, quindi il comportamento va verificato.

### Le decisioni già prese (2026-10-18)

Luca ha già risposto a quattro domande del ciclo (Q1-Q4), e il catalogo le applica:

- **Q1:** il prezzo degli indicatori è la **chiusura** del giorno, non la media di apertura, massimo, minimo e chiusura che usa il codice attuale (motivo in sezione 2.4).
- **Q2:** ogni termine della somma conta uno nel limite di 10, e **non si ammette** un termine che si ottiene esattamente come somma pesata di altri ingressi già presenti (si dice **combinazione lineare esatta**): non aggiungerebbe nessuna decisione nuova.
- **Q3:** la somiglianza tra indicatori si prova con **identità algebriche** (uguaglianze esatte) e con una **serie sintetica** (prezzi casuali generati apposta), non con i dati di ENI, che servono solo come controllo: così la scelta non guarda i dati su cui i genomi saranno valutati.
- **Q4:** il prezzo a cui il simulatore vende è un **rischio da segnalare** a R6 ed E2, senza toccare il codice (sezione 2.5).

In più, dal ciclo precedente: famiglie con **parametri evolvibili** ammesse; al massimo **10 ingressi**, 12 solo se motivato.

### Tre fatti che valgono per qualunque scelta

1. Un solo valore non definito (per esempio 0/0) in una media esponenziale la rende non definita **per sempre**: sullo snapshot ENI la barra «piatta» del 2023-08-15 (apertura, massimo, minimo e chiusura uguali, volume zero) produrrebbe 779 barre non definite. Il catalogo fissa una regola unica: in quel caso la barra si salta (sezione 3.3).
2. Il motore chiede un valore finito già alla prima barra (sezione 1.3): ogni indicatore dichiara che cosa espone prima di avere abbastanza storia.
3. La media di apertura, massimo, minimo e chiusura che Consilium usa come prezzo crea da sola una somiglianza tra il rendimento di oggi e quello di ieri, anche quando i prezzi non ne hanno: su una serie casuale senza memoria la correlazione tra un giorno e il precedente vale 0,242 con la media e 0,009 con la chiusura (sezione 2.4). È uno dei motivi per usare la chiusura.

## Prima di cominciare: sei idee usate ovunque

Questa sezione riassume la guida (sezioni 1.3 e 4.2) quanto basta per leggere il resto senza aprirla.

### Il punteggio lineare con soglie

Ogni giorno il genoma moltiplica ogni ingresso per il suo **peso**, somma i prodotti e confronta la somma, il **punteggio**, con due **soglie**. Un peso positivo spinge verso l'acquisto quando l'ingresso è alto, uno negativo verso la vendita, uno vicino a zero rende l'ingresso quasi ininfluente. In formula, con ingressi `x1, ..., xn` e pesi `w1, ..., wn`:

```
s = w1*x1 + w2*x2 + ... + wn*xn

buy   se  s > soglia_alta
sell  se  s < soglia_bassa
hold  altrimenti
```

La guida aggiunge alla somma una costante `b`, il **bias**; con due soglie è superflua, perché spostare il bias equivale a spostare le soglie (capitolo 6), e il catalogo la omette. Esempio con il giorno 12 della sezione 7.5: la distanza dalla EMA veloce vale -0,0228 e ha peso 50, quindi contribuisce -1,14; sommando gli otto contributi il punteggio è -3,50; con soglie +2 e -2 la decisione è `sell`. La decisione presa la sera del giorno `t` si esegue il giorno `t+1` (sezione 1.3).

### La media esponenziale (EMA) e il suo coefficiente `c`

Una EMA è una media dei valori passati che si aggiorna ogni giorno spostandosi di una frazione `c` verso il valore di oggi: la nuova media è la vecchia moltiplicata per `1 - c`, più il valore di oggi moltiplicato per `c`.

```
e[t] = e[t-1] * (1 - c) + x[t] * c
```

Esempio con `c` = 0,2: ieri la media era 10,00, oggi il prezzo è 10,10, la nuova media è 10,00 × 0,8 + 10,10 × 0,2 = 10,02. Con `c` vicino a 1 la media segue il prezzo e ricorda poco; con `c` piccolo si muove lentamente e ricorda a lungo (sezione 2.2 per la misura esatta). Il codice di Consilium chiama queste medie **filtri IIR**.

### Ingresso, parametro, gene

Un **ingresso** è un termine della somma del punteggio. Un indicatore può avere **parametri** (per esempio il `c` della sua media): se l'algoritmo genetico li fa evolvere si chiamano **geni**. I geni non contano nel limite di 10 ingressi, ma fanno crescere il genoma (capitolo 6). L'**algoritmo genetico** cerca buoni pesi, soglie e geni imitando l'evoluzione: tiene i genomi con il voto migliore, li mescola (**incrocio**) e li cambia a caso di poco (**mutazione**) (guida, capitolo 2).

### Senza unità di misura

Un ingresso entra nella somma **senza unità di misura** (si dice **adimensionale**): un rapporto, il logaritmo di un rapporto, o un valore tra -1 e 1. Un prezzo in euro non va bene: lo stesso peso varrebbe dieci volte di più su un titolo da 100 euro che su uno da 10 (sezione 5.1).

### Correlazione e R²

Due misure dicono quanto due indicatori si somigliano. La **correlazione** ρ, tra -1 e 1, dice quanto due serie si muovono insieme: 1 = salgono e scendono sempre insieme in proporzione, 0 = nessun legame lineare, -1 = sempre in verso opposto. Il **coefficiente R²**, tra 0 e 1, dice quale quota delle variazioni di un ingresso si ottiene con la migliore somma pesata degli altri ingressi: è la misura giusta per un punteggio, perché un ingresso con R² vicino a 1 non aggiunge quasi nulla che i pesi degli altri non sappiano già fare. Esempio: R² = 0,95 per la distanza dalla EMA lenta significa che il 95 % delle sue variazioni si ricostruisce dagli altri sette ingressi.

### Identità e combinazione lineare esatta

Un'**identità** è un'uguaglianza che vale sempre, per costruzione delle formule, non per i dati. Esempio: la MACD in forma logaritmica è esattamente la distanza lenta meno la distanza veloce; nella scheda MACD, il giorno 5, entrambe valgono 2,73 %. Un ingresso che è una **combinazione lineare esatta** di altri (una loro somma pesata) non serve: basta cambiare i pesi degli altri per ottenere lo stesso punteggio. Per questo la regola Q2 lo esclude.

## 1. Metodo, notazione e regola del tempo

### 1.1 La barra e i suoi cinque numeri

Una **barra** è il riassunto di un giorno di borsa in cinque numeri, detti **OHLCV**: **apertura** O (il primo prezzo scambiato), **massimo** H e **minimo** L (il prezzo più alto e più basso della giornata), **chiusura** C (l'ultimo prezzo) e **volume** V (il numero di azioni scambiate). Per esempio il giorno 12 del dataset di esempio ha O = 10,71, H = 10,75, L = 10,46, C = 10,50, V = 2200: si è aperto vicino a 10,7, si è chiuso quasi sul minimo, con un volume alto.

Notazione: `O[t], H[t], L[t], C[t], V[t]` sono i valori della barra `t`; `C[t-1]` è la chiusura del giorno prima; `dC[t] = C[t] - C[t-1]` è la **variazione** del giorno. Il **rendimento logaritmico** è `r[t] = ln(C[t] / C[t-1])`, dove `ln` è il logaritmo naturale. Per variazioni piccole vale quasi come la variazione percentuale: un rialzo da 10,00 a 10,10 è +1 % e `ln(1,01)` = 0,00995, cioè 0,995 %. Il logaritmo ha una proprietà utile: un rialzo del 10 % e il ribasso che riporta al prezzo di partenza hanno lo stesso valore con il segno cambiato, e le variazioni di più giorni si sommano.

### 1.2 Il prezzo degli indicatori: la chiusura

Per decisione di Luca (Q1, 2026-10-18), tutti gli indicatori «di prezzo» del catalogo usano la **chiusura** `C[t]`. Gli indicatori che per definizione leggono i campi separati (massimo, minimo, apertura, volume) li leggono dalla barra. Il motivo e le conseguenze sono nella sezione 2.4; ogni scheda dice in una riga come cambierebbe con la media `(O + H + L + C) / 4`.

### 1.3 La regola del tempo

Il motore simula una strategia giorno per giorno sui dati storici (un **replay**). Ogni strategia ha tre funzioni per i propri indicatori: `initIndicators` (li prepara con il primo giorno), `updateIndicators` (li aggiorna con ogni giorno nuovo) e `resetIndicators` (li azzera), più `decide()`, che sceglie `buy`, `hold` o `sell`. Il catalogo usa i fatti del codice seguenti (verificati il 2026-10-18; righe rilette il 2026-10-19).

- **Ordine dentro un giorno.** Il motore passa la prima barra a `initIndicators` e ogni barra successiva a `updateIndicators`; poi il `Trader` esegue l'ordine deciso il giorno prima; poi `decide()` sceglie l'ordine per il giorno dopo (`src/engine/strategy.js`, righe 40-55; `src/vendor/consilium/life.js`, righe 622-623 e 646-650). Quindi **un indicatore della barra `t` contiene i dati di `t`, e la decisione che lo usa si esegue alla barra `t+1`**. Esempio: la sera del giorno 12 gli indicatori contengono la chiusura 10,50 del giorno 12; se `decide()` sceglie `sell`, la vendita avviene il giorno 13.
- **Acquisto** all'apertura della barra di esecuzione: `const stockPrice = stockData.open` (`src/vendor/consilium/trader.js`, riga 97).
- **Vendita su segnale** alla media `(O + H + L + C) / 4` della barra di esecuzione: `getActualValue()` (`trader.js`, riga 153; `src/vendor/consilium/portfolio.js`, riga 215; la media è definita in `src/vendor/consilium/stockStream.js`, righe 32-34). È un rischio dichiarato per R6 ed E2 (sezione 2.5).
- **Stop loss e take profit** (chiusure automatiche quando il prezzo scende sotto o sale sopra una soglia fissata all'acquisto) scattano sul minimo o sul massimo della barra (`portfolio.js`, righe 63 e 71) e si chiudono al prezzo di soglia (righe 291 e 298).
- **Valore finito dalla prima barra.** Il controller registra il primo fotogramma subito dopo `init` (`src/engine/simulationController.js`, riga 43) e il validatore segna errore se un indicatore esposto da `describe()` non è un numero finito (`src/engine/fitnessValidator.js`, riga 29); a fine replay l'errore ferma il replay (`simulationController.js`, righe 90-94).

**Conseguenza per tutto il catalogo.** Ogni indicatore della scheda usa solo la barra `t` e le precedenti, quindi è noto alla chiusura di `t`, prima dell'esecuzione all'apertura di `t+1`. Nessuna scheda ha **anticipazione dei dati** (l'errore di usare un dato non ancora disponibile il giorno della decisione), e le schede non lo ripetono. Sono escluse le normalizzazioni che usano statistiche dell'intera serie, per esempio dividere per la deviazione standard calcolata su tutti i dieci anni (guida, sezione 4.8.3): userebbero il futuro.

### 1.4 Le fonti

Fonti ammesse: documentazione di librerie di analisi tecnica (soprattutto TA-Lib, una libreria diffusa che documenta formule e convenzioni di avvio), testi originali degli autori quando reperibili, materiale universitario, il codice di Consilium e di SwarmTrader. I testi originali (Wilder, Appel, Lane, Granville, Chaikin) **non sono stati letti**: le formule vengono dalle pagine di TA-Lib, che li citano. Non è usato come prova materiale commerciale o di «segnali».

### 1.5 Il dataset di esempio

Chiusura e volume sono **identici** ai 20 giorni della guida (sezione 1.2); lo script si ferma se non coincidono. Apertura, massimo e minimo sono **inventati** con una regola semplice: si apre un po' oltre la chiusura di ieri, nella direzione del giorno (tre decimi della variazione), e la giornata si allarga di pochi centesimi (4, 6 o 8, a turno) oltre apertura e chiusura. Così il minimo non supera mai apertura e chiusura, `L ≤ min(O, C)`, e il massimo non è mai sotto, `H ≥ max(O, C)`. In formula (`arrotonda` = al centesimo):

```
O[1] = C[1]
O[t] = arrotonda( C[t-1] + 0.3 * (C[t] - C[t-1]) )        per t >= 2
e[t] = 0.04 + 0.02 * (t mod 3)                (0.04, 0.06 o 0.08)
H[t] = arrotonda( max(O[t], C[t]) + e[t] )
L[t] = arrotonda( min(O[t], C[t]) - e[t] )
```

Esempio, giorno 2: la chiusura passa da 10,00 a 10,10, quindi l'apertura è 10,00 + 0,3 × 0,10 = 10,03; con `e` = 0,08 il massimo è 10,10 + 0,08 = 10,18 e il minimo 10,03 - 0,08 = 9,95.

La tabella ha una riga per giorno; le colonne sono i cinque numeri della barra (sezione 1.1).

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

Tutti i numeri del catalogo sono prodotti da script conservati in `/home/luca/Workspace/swarmtrader-r2-work/` (fuori dal repository): `dataset/` (dataset di esempio), `ref/` (implementazioni dell'autore), `out/` (tabelle prodotte), `verify/` (riservata al verificatore indipendente). Ogni indicatore ha una versione **incrementale** (una barra per volta, come gli hook del contratto di strategia) e una **diretta** (ricalcolo dalla storia intera); le due coincidono su tutte le barre controllate, con scarto relativo massimo 4,8e-12 (Bande di Bollinger, per le somme correnti, sezione 3.1) e sotto 1e-13 per tutti gli altri. Uno scarto di quest'ordine è dovuto solo agli arrotondamenti del calcolo in virgola mobile.

## 2. Il prezzo di ingresso e i quattro filtri IIR

### 2.1 La forma esatta del filtro

I quattro indicatori del genoma attuale sono medie mobili esponenziali (EMA), che il codice chiama **filtri IIR** (dall'inglese «infinite impulse response»: ogni dato passato conserva un peso, sempre più piccolo). In parole: ogni giorno la media si sposta dalla posizione di ieri verso il dato di oggi `x[t]` di una frazione `c` della distanza. La forma è quella della guida, sezione 1.3.2:

```
e[t] = e[t-1] * (1 - c) + x[t] * c
```

`c` è il **peso del dato nuovo** (`src/vendor/consilium/algorithm.js`, righe 369-372), non del passato: con `c` vicino a 1 il filtro segue il dato e ricorda poco. Il filtro parte dal primo valore: `this.ema = actualValue` e `this.emaV2 = stockData.volume` in `init` (righe 345-348). Il genoma fisso usa i coefficienti di `src/engine/genome.js` (righe 14-17), e `genome.js` impone `0 < c < 1` (riga 86).

### 2.2 Una sola definizione di costante di tempo

Il catalogo usa **una** misura della memoria di una EMA: l'**età media** dei dati che contiene, `(1 - c) / c` barre. È la media di «quanti giorni fa», pesata con i pesi che la EMA dà a ciascun giorno. Per esempio con `c` = 0,2 il dato di oggi (età 0) pesa 0,2, quello di ieri (età 1) 0,16, quello di due giorni fa 0,128, e così via: l'età media è 4 barre. Per `c` piccolo vale quasi come `1/c`, la «regola pratica» della guida (sezione 1.3.2): con `c` = 2/21 sono 9,50 contro 10,50. Per `c` grande le due misure divergono e conta l'età media: con `iir_price_2` (`c` = 0,990) l'età media è 0,01 barre, cioè il filtro è quasi il prezzo del giorno.

Il **periodo di avvio** (warm-up) è un'altra cosa: quante barre servono perché il valore di partenza pesi meno del 5 %, cioè il primo `t` con `(1 - c)^t < 0,05`. Finché l'avvio non è finito, l'indicatore dipende ancora troppo dal primo giorno.

La tabella ha una riga per media: i quattro filtri del genoma attuale e, per confronto, due medie della letteratura. Si legge così: con `iir_volume_1` la media contiene dati vecchi in media 7,50 giorni e servono 24 giorni perché il primo giorno conti meno del 5 %. La colonna «N» traduce `c` nel «periodo» usato dalla letteratura (sezione 2.3).

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
- **Media di Wilder:** `c = 1 / N`, dal nome di J. W. Wilder, autore di RSI e ATR, che la usa in entrambi: per esempio `ATR = (ATR_prec * (N - 1) + TR) / N`, dove TR è l'escursione del giorno (scheda ATR) [1][17]. È ancora una EMA: `(N - 1)/N = 1 - c` e `1/N = c`. Wilder a 14 giorni: `c` = 1/14 = 0,071.
- **Equivalenza:** una media di Wilder a N giorni è una EMA standard a `2N - 1` giorni (da `2/(N'+1) = 1/N`; per N = 14: 1/14 - 2/28 = 0). L'RSI a 14 giorni contiene quindi una «EMA a 27».

**Avvio.** TA-Lib avvia l'EMA con la media semplice dei primi N valori e non dà valori prima [2]; Consilium e questo catalogo avviano al primo valore. La differenza si esaurisce con il periodo di avvio: per la EMA a 20 sulla serie sintetica lo scarto relativo è 0,373 % alla barra 20, 0,133 % alla 30, 0,0069 % alla 60.

### 2.4 Perché la chiusura e non la media di quattro prezzi

Consilium fa entrare nei filtri `(O + H + L + C) / 4` (`stockStream.js`, righe 32-34). La media di quattro prezzi della stessa giornata ha un effetto collaterale: i suoi rendimenti da un giorno all'altro risultano **correlati** anche quando i prezzi non lo sono. L'**autocorrelazione di primo ordine** misura quanto il rendimento di oggi somiglia a quello di ieri (0 = per niente, 1 = uguale). Sulla serie sintetica, che è una **passeggiata casuale** (ogni giorno il prezzo sale o scende di una quantità estratta a caso, indipendente dai giorni prima; sezione 5.5), vale **0,009** sui rendimenti della chiusura e **0,242** su quelli della media OHLC/4. Sullo snapshot ENI, come controllo, 0,031 e 0,232. L'effetto è descritto per le medie di una serie casuale da Working e Cowles nel 1960 [18] (letto l'abstract di Cowles; che la media dei quattro prezzi di una barra ricada nello stesso caso è sostenuto dalla simulazione, non dal testo).

Con la chiusura: valori confrontabili con TA-Lib, che definisce EMA, RSI, ATR, OBV e stocastico sulla chiusura [1][2][7][10][17], e nessuna persistenza costruita. Il costo: una EMA del catalogo non coincide più con un filtro di Consilium con lo stesso `c`, e il confronto nel PoC tra genoma lineare e macchina a stati mescola l'effetto della forma con quello del prezzo.

### 2.5 Il rischio del prezzo di vendita (per R6 ed E2)

Nel simulatore l'acquisto avviene all'apertura del giorno dopo la decisione, ma la vendita su segnale alla media `(O + H + L + C) / 4` di quel giorno (sezione 1.3). Quel prezzo contiene massimo, minimo e chiusura di una giornata che, all'apertura, non è ancora avvenuta: equivale a vendere «alla media della giornata». Non è anticipazione dentro gli indicatori, perché la decisione è presa la sera prima con i soli dati noti; è un'ipotesi di esecuzione che nessun ordine reale dato all'apertura può garantire. Il validatore la accetta perché controlla solo che il prezzo stia tra minimo e massimo (`fitnessValidator.js`, righe 57-58). Per decisione di Luca (Q4) il codice di Consilium **non si tocca** e non si apre una issue a parte: il fatto è passato a **R6** (protocollo di valutazione) ed **E2** (implementazione) come rischio dichiarato. Per il catalogo non cambia nulla: nessun indicatore usa il prezzo di vendita.

### 2.6 Quali indicatori del catalogo contengono una EMA

La tabella dice, per ogni indicatore, se dentro c'è una media esponenziale: se sì, E2 può riusare lo stesso tipo di calcolo dei filtri attuali. Le sigle sono nella tabella delle sigle in apertura.

| Indicatore | Media contenuta | Si scrive con un filtro della forma di Consilium? |
|---|---|---|
| EMA, N1 | EMA del prezzo | sì, `c` qualunque |
| MACD | due EMA del prezzo e una EMA della loro distanza | sì, tre filtri in cascata |
| RSI | due medie di Wilder di `dC` e `abs(dC)` | sì, `c = 1/N`, avvio da zero |
| ATR | media di Wilder dell'escursione vera | sì, `c = 1/N` |
| volatilità EWMA (N6) | EMA del quadrato del rendimento `r^2` | sì |
| chiusura nella giornata (N14), volume relativo (N16), OBV normalizzato (N17), CMF esponenziale | EMA della posizione della chiusura, del volume, del volume con segno | sì |
| SMA, Bollinger, ROC, stocastico, distanza dal massimo (N9), CMF, OBV | nessuna (finestre di N giorni o somma cumulata) | no |

## 3. Mattoni di stato

Ogni indicatore è costruito con pochi tipi di **stato**, cioè i numeri che l'indicatore conserva da un giorno all'altro. Per un programmatore sono come i tipi di dato di una libreria: pochi, riusati da tutti gli indicatori. Questo capitolo li descrive una volta; le schede dicono solo quali usano. È anche la mappa per E2 di che cosa vive in `initIndicators`, `updateIndicators` e `resetIndicators`.

### 3.1 I cinque mattoni

La tabella ha una riga per mattone: quanti numeri conserva, quanto lavoro costa ogni giorno nuovo, quali indicatori lo usano. «Costante» vuol dire che il lavoro non cresce con la lunghezza della storia né della finestra.

| Mattone | Stato | Lavoro per barra | Esempi |
|---|---|---|---|
| (a) EMA | 1 numero | costante | EMA, RSI, ATR, distanza da una EMA (N1), volatilità EWMA (N6), chiusura nella giornata (N14), volume relativo (N16), OBV normalizzato (N17) |
| (b) finestra di N valori con somma corrente | N valori + 1 somma | costante | SMA, ROC, CMF |
| (c) massimo o minimo su N barre | fino a N valori (coda monotona) | costante in media, non a ogni barra | stocastico, distanza dal massimo (N9) |
| (d) varianza su finestra | N valori + 2 somme | costante, ma sensibile agli arrotondamenti | Bande di Bollinger |
| (e) accumulatore | 1 numero, che cresce senza limite | costante | OBV grezzo, linea di accumulo e distribuzione |

- **(b) Somma corrente.** Si tiene la somma degli ultimi N valori: ogni giorno si aggiunge il valore nuovo e si toglie quello che esce dalla finestra, invece di risommare tutto. Esempio: SMA di 5 giorni al giorno 6 = (somma dei giorni 1-5 + chiusura del giorno 6 - chiusura del giorno 1) / 5.
- **(c) Coda monotona.** Si tengono solo i valori che possono ancora diventare il massimo; ogni valore entra ed esce una volta, con al più tre confronti per elemento nel caso peggiore [13] (letto l'abstract). In una singola barra si possono scartare molti elementi, quindi il lavoro è costante solo in media [ipotesi, lettura dell'abstract].
- **(d) Arrotondamenti.** La varianza con le somme di `x` e `x^2` perde cifre quando la media è grande rispetto alla dispersione. Lo script sottrae il primo valore prima di sommare; lo scarto rimasto contro il calcolo diretto è 4,8e-12 sulla serie sintetica, contro meno di 1e-13 degli altri mattoni.
- **(e) Accumulatore.** Il valore dipende da quando si è cominciato a contare e non ha un intervallo: non è adatto come ingresso diretto (scheda OBV).

### 3.2 Politica di avvio: un valore finito dalla barra 1

Il motore chiede un numero finito già alla prima barra (sezione 1.3). Il catalogo usa tre regole.

1. **Le EMA partono dal primo valore**, come in Consilium. Quando un indicatore è il **rapporto di due EMA con lo stesso `c`** (RSI, OBV normalizzato N17, CMF esponenziale), entrambe partono **da zero**, e si scrive `EMA0`. Nei primi giorni una EMA partita da zero è troppo piccola, ma lo è dello stesso fattore sopra e sotto la linea di frazione, quindi nel rapporto l'errore si cancella. Esempio (RSI, giorno 2 del dataset): numeratore 0,020 e denominatore 0,020, rapporto 1,00, lo stesso che si avrebbe con medie «già avviate» [ipotesi verificata numericamente: l'RSI dopo 200 barre coincide con l'avvio di TA-Lib entro 1,7e-7].
2. **Le finestre crescono**: con meno di N barre si usano quelle disponibili. TA-Lib invece non dà valori finché la finestra non è piena; le due scelte coincidono dopo N barre.
3. **Prima che esista un valore sensato si espone il valore neutro**: 0 per le forme centrate, cioè quelle il cui valore va da -1 a +1 o è una distanza (RSI centrato, OBV normalizzato, stocastico centrato 0 corrisponde a %K = 0,5).

Il periodo di avvio resta un fatto che R6 deve sapere: nelle prime barre l'indicatore è un valore di comodo. R4 decide che cosa fa il genoma nel frattempo. L'esempio della sezione 7.5 lo mostra: il giorno 2, dopo un solo rialzo, RSI e OBV normalizzato valgono già 1 e il punteggio supera la soglia di acquisto.

### 3.3 Regola unica per i denominatori nulli: saltare l'aggiornamento

**Il caso reale.** Nello snapshot ENI la barra di indice 1738 (2023-08-15) ha O = H = L = C = 14,014 e V = 0; la barra prima è del 2023-08-11 (chiusura 14,048), quindi manca il 14 agosto. È l'unica barra con H = L e l'unica con V = 0 su 2517. Che sia un giorno riempito dalla fonte dei dati è [ipotesi].

**Che cosa succede senza una regola.** La posizione della chiusura nella giornata `((C - L) - (H - C)) / (H - L)` vale 0/0, che in JavaScript è `NaN` («not a number»); il logaritmo del volume vale meno infinito. Una EMA che riceve `NaN` resta `NaN` per sempre: dopo cinque valori normali vale ancora `NaN`. Sullo snapshot la media della posizione di chiusura diventerebbe `NaN` per **779 barre**, dall'indice 1738 all'ultimo. Due esiti possibili, entrambi gravi: se il valore è esposto in `describe()`, il replay fallisce alla fine (sezione 1.3); se non è esposto, il punteggio diventa `NaN`, ogni confronto con le soglie è falso e il genoma **smette di comprare e vendere senza segnalarlo** [ipotesi sulla forma di `decide()` di E2].

**La regola.** Quando un aggiornamento renderebbe nullo un denominatore o chiederebbe il logaritmo di zero, **quel mattone salta la barra**: il suo stato e il valore esposto restano quelli del giorno prima. È la scelta di TA-Lib per l'oscillatore di Chaikin, che aggiorna «only when high>low» [9]. Un'alternativa sarebbe porre il valore a 0, ma in una EMA non è la stessa cosa: 0 tira la media verso zero di una frazione `c`, il salto la lascia invariata.

Valori sullo snapshot con la regola (indici 1737, 1738, 1739; medie con `c` = 2/21, cioè «20 giorni», finestre di 20 o 14 giorni come nella sezione 5.5). La tabella ha una riga per indicatore e tre colonne di valori: il giorno prima, la barra piatta, il giorno dopo. Quando il valore della barra piatta è uguale a quello del giorno prima, la barra è stata saltata.

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

**Voci di ogni scheda.**

- *In una frase*: che cosa dice l'indicatore, senza formule.
- *Formula*, *Calcolo* (mattone, stato, lavoro per barra), *Avvio e casi limite*, *Campi e parametri* (con i geni candidati).
- *Ingresso nel punteggio*: scala, forma proposta, che cosa fa un peso positivo.
- *Ridondanza*: quanto l'indicatore si ricostruisce dagli otto ingressi proposti (R², vedi «Prima di cominciare»), sulla serie sintetica salvo dove è scritto ENI.
- *Esempio*: tabella sul dataset inventato, con la frase che dice come leggerla e un calcolo a mano.
- *Applicazione al nostro problema* (solo per gli ingressi proposti): il giorno 12 passo per passo, dai cinque numeri della barra all'ingresso, al contributo nel punteggio d'esempio (sezione 7.5), alla decisione.
- *Con OHLC/4*: come cambierebbe con la media dei quattro prezzi; *Fonti*; *Proposta*.
- Riquadro *Per la decisione*: che cosa significa la scheda per la scelta di Luca.

Le voci senza nulla di specifico rimandano ai capitoli 2 e 3.

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

> **Per la decisione.** La EMA non entra da sola nel punteggio, perché è in euro; entra la distanza del prezzo dalla EMA (ingressi 1 e 2, scheda N1). Nulla da decidere qui.

#### Scheda: SMA (media mobile semplice)

- **In una frase.** La media semplice degli ultimi N prezzi; guida, sezione 1.3.1.
- **Formula.** `SMA[t] = (C[t] + ... + C[t-N+1]) / N`; ingresso possibile `ln(C[t] / SMA[t])`.
- **Calcolo.** Mattone (b): N valori e una somma, lavoro costante.
- **Avvio e casi limite.** Finestra crescente (sezione 3.2); finita dalla barra 1; avvio di N barre.
- **Campi e parametri.** C. N intero (cambia la dimensione dello stato).
- **Ingresso nel punteggio.** Distanza logaritmica, adimensionale; peso positivo = più il prezzo sta sopra la media, più il punteggio sale.
- **Ridondanza.** La distanza da SMA 20 è spiegata al 95 % dagli ingressi proposti (R² 0,95) e correla 0,95 con l'RSI centrato: è un'altra media del prezzo.
- **Esempio** (SMA 5). Una riga per giorno: la chiusura, la media degli ultimi 5 giorni (o di quelli che esistono) e la distanza logaritmica della chiusura dalla media, in percento; positiva = prezzo sopra la media.

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

> **Per la decisione.** Esclusa: dice quasi la stessa cosa della distanza dalla EMA (si ricostruisce al 95 % dagli ingressi proposti), con un parametro intero invece che continuo. Nulla da decidere.

#### Scheda N1: distanza logaritmica da una EMA, a più velocità (proposta nuova, fuori dall'elenco minimo)

- **In una frase.** Di quanto il prezzo di oggi sta sopra (positivo) o sotto (negativo) la propria media, in scala logaritmica.
- **Formula.** `d[t] = ln(C[t] / e[t])`, con `e` la EMA della chiusura con coefficiente `c`. Per scarti piccoli è quasi la distanza `x1` della guida divisa per 100.
- **Calcolo.** Mattone (a): 1 numero per velocità.
- **Avvio e casi limite.** `d[1] = 0`. Nessun denominatore nullo (i prezzi sono positivi).
- **Campi e parametri.** C. `c` continuo, gene; due velocità con il vincolo `c_veloce > c_lenta`.
- **Ingresso nel punteggio.** Adimensionale. Peso positivo su `d_veloce`: il punteggio sale quando il prezzo corre sopra la media recente. La scala dipende molto da `c` (sezione 5.3).
- **Ridondanza.** Con velocità fisse una terza velocità aggiunge poco: `d` a `c` = 2/21 è spiegata al 98 % da quelle a 2/11 e 2/51 (R² 0,980). La MACD logaritmica è una **combinazione esatta** di due distanze (sezione 5.5, identità I1).
- **Esempio** (`c` = 0,2). Una riga per giorno: la chiusura, la sua EMA, la distanza logaritmica in percento (l'ingresso) e, per confronto, la distanza percentuale semplice `x1` della guida.

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
- **Applicazione al nostro problema (giorno 12).** La chiusura del giorno 12 è 10,50, dopo 10,80 il giorno 11. *Velocità veloce* (`c` = 0,5): la EMA passa da 10,9841 a 10,9841 × 0,5 + 10,50 × 0,5 = 10,7420, e l'ingresso è ln(10,50 / 10,7420) = -0,0228, cioè il prezzo sta poco più del 2 % sotto la media breve. *Velocità lenta* (`c` = 0,2): la EMA passa da 10,8822 a 10,8058 e l'ingresso è -0,0287. Nel punteggio d'esempio (sezione 7.5) i pesi sono 50 e 20, quindi i contributi sono -1,14 e -0,57: entrambi spingono verso `sell`. Il punteggio del giorno vale -3,50 (`sell`); senza la distanza veloce sarebbe -2,36, ancora `sell`. Sui 20 giorni, togliere la distanza veloce cambia la decisione nei giorni 18, 19 e 20 (`buy` diventa `hold`); togliere la lenta nei giorni 9, 18 e 20.
- **Con OHLC/4.** Coinciderebbe con un filtro di Consilium letto come rapporto.
- **Fonti.** [2]; identità della sezione 5.5.
- **Proposta.** **Ammessa a due velocità** (ingressi 1 e 2).

> **Per la decisione.** Ammessa a due velocità (ingressi 1 e 2). Con peso positivo si compra quando il prezzo sta sopra la propria media e si vende quando sta sotto. Con le due velocità insieme la MACD è già rappresentata. Domanda collegata: D2 (tenere o togliere la distanza lenta).

#### Scheda: MACD (convergenza e divergenza di medie mobili)

- **In una frase.** La differenza tra una EMA veloce e una lenta («linea»), più una media di quella differenza («segnale»); dice se la media veloce si sta allontanando da quella lenta.
- **Formula.** Linea in euro `EMA_veloce - EMA_lenta`; segnale = EMA della linea; istogramma = linea meno segnale. Forma adimensionale proposta: `m[t] = ln(EMA_veloce[t] / EMA_lenta[t])`. Valori predefiniti 12, 26 e 9 giorni [19]; la struttura linea, segnale, istogramma è conoscenza generale [ipotesi, fonte da verificare: la pagina [19] dà i tre periodi; il libro di Appel non è stato letto].
- **Calcolo.** Tre mattoni (a) in cascata: 3 numeri.
- **Avvio e casi limite.** Linea 0 alla barra 1; avvio della EMA lenta (39 barre per 26 giorni) più quello del segnale.
- **Campi e parametri.** C. Tre `c` continui, con `c_veloce > c_lenta`.
- **Ingresso nel punteggio.** La linea in euro no (scala del prezzo). In forma logaritmica: se le velocità coincidono con quelle di N1, `m = d_lenta - d_veloce` esattamente (scarto 3,1e-16): **combinazione lineare esatta**, esclusa dalla regola di conteggio. Con velocità diverse (12/26 contro 10, 20, 50) resta spiegata al 99,68 % (R² 0,9968). Il **segnale** è un filtro nuovo (una media della distanza), ma è spiegato al 97 % dagli ingressi proposti; l'**istogramma** è linea meno segnale, quindi combinazione esatta delle altre due.
- **Esempio** (veloce `c` = 0,5, lenta `c` = 0,2, segnale `c` = 0,5). Una riga per giorno: la MACD in euro, la stessa in forma logaritmica, la differenza tra le due distanze della scheda N1, il segnale e l'istogramma, tutti in percento salvo la prima colonna. La seconda e la terza colonna sono uguali: è l'identità.

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

> **Per la decisione.** Esclusa: con le due distanze già ammesse la MACD si ottiene cambiando i loro pesi (regola Q2), e il segnale si ricostruisce al 97 %. Nulla da decidere.

#### Scheda: ROC (tasso di variazione)

- **In una frase.** Di quanto è cambiato il prezzo in N giorni; è il «momentum» della guida, sezione 1.3.4.
- **Formula.** Forma logaritmica `ln(C[t] / C[t-N])`; la guida usa `(C[t] / C[t-N] - 1) * 100` [ipotesi, fonte da verificare: la pagina ROC di TA-Lib non è stata aperta].
- **Calcolo.** Mattone (b): N + 1 chiusure; lavoro costante.
- **Avvio e casi limite.** Finestra crescente: alla barra 1 vale 0; avvio N barre.
- **Campi e parametri.** C. N intero.
- **Ingresso nel punteggio.** Adimensionale; peso positivo = più il prezzo è salito in N giorni, più il punteggio sale.
- **Ridondanza.** È un filtro lineare del prezzo a finestra, come le distanze: R² 0,79 (ROC 10) e 0,83 (ROC 20) sugli ingressi proposti. Sotto la soglia di ridondanza, ma non colma nessuna lacuna.
- **Esempio** (N = 5). Una riga per giorno: la chiusura, la variazione logaritmica rispetto a 5 giorni prima in percento, e la variazione percentuale della guida (trattino dove la guida non ha 5 giorni di storia).

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

> **Per la decisione.** Esclusa: come le distanze, dice dove sta il prezzo rispetto al passato recente, senza portare un tipo di informazione nuovo. Nulla da decidere.

#### Scheda N16: logaritmo del volume relativo (proposta nuova, fuori dall'elenco minimo)

- **In una frase.** Se oggi si è scambiato più (positivo) o meno (negativo) del solito.
- **Formula.** `lv[t] = ln(V[t] / ev[t])`, con `ev` la EMA del volume (compreso oggi). Il logaritmo rende simmetrici «doppio del solito» (+0,69) e «metà» (-0,69). Variante della guida: `vr - 1 = V/ev - 1`.
- **Calcolo.** Mattone (a): 1 numero.
- **Avvio e casi limite.** `lv[1] = 0`. V = 0: la barra si salta (sezione 3.3); con `max(V, 1)`, una correzione possibile, il valore sarebbe circa -16, enorme rispetto alla dispersione abituale.
- **Campi e parametri.** V. `c` continuo, gene.
- **Ingresso nel punteggio.** Adimensionale. Peso positivo = si compra di più nei giorni di volume alto, **qualunque sia la direzione**: il volume da solo non ha segno. Il suo uso naturale è combinarlo con la direzione, che è R4 (guida, sezione 4.8.2); il segno lo porta N17.
- **Ridondanza.** Sulla serie sintetica il volume è costruito indipendente dal prezzo, quindi R² 0,00 è per costruzione e non prova nulla; sullo snapshot ENI, come controllo, R² 0,03.
- **Esempio** (`c` = 0,2). Una riga per giorno: il volume, il rapporto con la sua media come nella guida (`vr`, 1 = volume normale) e il logaritmo del rapporto, che è l'ingresso proposto (positivo = volume sopra il solito).

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
- **Applicazione al nostro problema (giorno 12).** Il volume del giorno 12 è 2200. La EMA del volume (`c` = 0,2, comprende il giorno stesso) passa da 1466,2 a 1466,2 × 0,8 + 2200 × 0,2 = 1612,9; l'ingresso è ln(2200 / 1612,9) = 0,3104: volume circa un terzo sopra il solito. Con peso d'esempio 2 il contributo è +0,62, l'unico positivo del giorno: frena la vendita senza impedirla (senza di esso il punteggio sarebbe -4,12). Il giorno 11 invece il volume decide: con il volume il punteggio è -1,78 (`hold`), senza scenderebbe sotto -2 (`sell`). È lo stesso effetto della guida (sezione 4.3.5): con peso positivo, il volume alto dei giorni di svolta ritarda l'uscita.
- **Con OHLC/4.** Nessun cambiamento: usa solo il volume.
- **Fonti.** Guida, sezione 1.3.4; costruzione proposta in questa ricerca [ipotesi sull'asimmetria della distribuzione dei volumi].
- **Proposta.** **Ammessa** (ingresso 7), al posto di `x3` della guida.

> **Per la decisione.** Ammessa (ingresso 7). Il volume da solo non ha direzione: con peso positivo spinge verso l'acquisto nei giorni di volume alto, sia di rialzo sia di ribasso (come il giorno 12). Combinare il volume con la direzione è compito di R4; la direzione del volume la porta l'OBV normalizzato (ingresso 8).

### 4.2 Lacuna L4 — distanza misurata in «giornate tipiche»

Che cosa porta: la stessa distanza dalla media del gruppo A, ma **divisa per l'agitazione recente**. Un indicatore entra qui se il suo valore è una distanza divisa per una misura di variabilità calcolata solo sul passato.

#### Scheda: RSI (indice di forza relativa), forma centrata

- **In una frase.** Confronta la media dei rialzi recenti con la media dei ribassi recenti. Per convenzione dell'autore, valori alti (sopra 70 su 100) si leggono «ipercomprato», cioè salito molto in fretta, e bassi «ipervenduto»; qui è una **descrizione del calcolo**, non una regola che funzioni.
- **Formula.** In parole: si tengono due medie esponenziali, una delle variazioni giornaliere con il loro segno (`A`) e una delle stesse variazioni senza segno (`B`); il loro rapporto va da -1 (solo ribassi) a +1 (solo rialzi). La definizione classica, con `U` e `D` le medie di Wilder dei rialzi e dei ribassi, è `RSI = 100 * U / (U + D)`, tra 0 e 100 [17]. Forma proposta, centrata in [-1, 1]:

  ```
  A[t] = A[t-1] * (1 - c) + dC[t] * c          A[1] = 0
  B[t] = B[t-1] * (1 - c) + abs(dC[t]) * c     B[1] = 0
  rsi_c[t] = A[t] / B[t]       ( = 2 * RSI / 100 - 1 )
  ```

  L'uguaglianza con l'RSI di TA-Lib vale con lo stesso avvio (scarto 8,9e-16; identità I3): `U - D` è la media delle variazioni con segno, `U + D` quella dei loro valori assoluti.
- **Perché sta in L4 (identità I5).** La media delle variazioni `A[t]` è esattamente `c / (1 - c)` volte la distanza **in euro** tra la chiusura e la sua EMA con lo stesso `c`, avviata al primo valore: `A[t] = c / (1 - c) * (C[t] - e[t])` (scarto relativo 8,4e-17 sulla serie sintetica). Esempio con `c` = 0,2, dove `c / (1 - c)` = 0,25: il giorno 2 `A` = 0,0200 e 0,25 × (10,10 - 10,02) = 0,0200; il giorno 12 `A` = -0,0764 e 0,25 × (10,50 - 10,8058) = -0,0764. Quindi `rsi_c = c / (1 - c) * (C - e) / B`: l'RSI centrato è **la distanza dalla media divisa per la variazione assoluta media**, cioè una distanza misurata in «giornate tipiche», a meno della costante `c / (1 - c)`. È limitato tra -1 e 1 qualunque sia `c`, perché una media di valori con segno non supera mai in modulo la media dei loro valori assoluti (`abs(A) ≤ B`).
- **Calcolo.** Due mattoni (a) più la chiusura di ieri: 3 numeri.
- **Avvio e casi limite.** Barra 1: 0. Finché `B = 0` (nessuna variazione) espone 0 o il valore precedente. Con l'avvio da zero lo scarto dall'RSI di TA-Lib a 14 giorni è 0,0061 alla barra 15, 0,0095 alla 30, 0,0066 alla 60, 1,7e-7 alla 200.
- **Campi e parametri.** C. `c = 1/N` continuo, gene. TA-Lib usa N = 14 per default [17]; il libro di Wilder [21] non è stato letto.
- **Ingresso nel punteggio.** Già adimensionale e limitato. Peso positivo = si compra di più quando i rialzi recenti prevalgono. **Saturazione**: in una salita senza ribassi vale 1 e non distingue una salita lenta da una veloce (giorni 2-8 dell'esempio).
- **Ridondanza.** Sulla serie sintetica, che ha agitazione costante, il divisore è quasi costante e l'RSI centrato è spiegato al 96,3 % da due distanze (R² 0,963); sullo snapshot ENI, dove l'agitazione cambia, 0,737. La serie sintetica non può mostrare l'informazione L4, che è nella divisione: l'ammissione si fonda sull'identità I5, non sui dati ENI.
- **Esempio** (`c` = 1/5). Una riga per giorno: la variazione della chiusura, l'RSI centrato (l'ingresso proposto) e l'RSI nella scala classica da 0 a 100, dove 50 è l'equilibrio tra rialzi e ribassi.

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
- **Applicazione al nostro problema (giorno 12).** La variazione del giorno è 10,50 - 10,80 = -0,30. Con `c` = 0,2 la media con segno passa da -0,0206 a -0,0206 × 0,8 + (-0,30) × 0,2 = -0,0764 e la media senza segno da 0,1762 a 0,1762 × 0,8 + 0,30 × 0,2 = 0,2010 (calcoli con tutte le cifre). L'ingresso è -0,0764 / 0,2010 = -0,3804: i ribassi recenti prevalgono. Con peso d'esempio 1 il contributo è -0,38; senza l'RSI il punteggio del giorno 12 sarebbe -3,12, ancora `sell`. Sui 20 giorni toglierlo cambia la decisione nei giorni 2, 9 e 18. Il giorno 2 mostra la saturazione dell'avvio: dopo un solo rialzo vale già 1,00 e contribuisce all'acquisto.
- **Con OHLC/4.** Erediterebbe la persistenza della media.
- **Fonti.** [17]; [6]; [21] solo scheda.
- **Proposta.** **Ammessa** (ingresso 3).

> **Per la decisione.** Ammesso (ingresso 3). Con peso positivo si compra quando i rialzi recenti prevalgono sui ribassi. Porta ciò che le distanze non hanno: la divisione per l'agitazione recente (L4). Da sapere: satura a ±1 in una salita o discesa senza pause e nei primi giorni. Domanda collegata: D2.

#### Scheda: Bande di Bollinger

- **In una frase.** Una media semplice di N giorni con due bande a `k` deviazioni standard sopra e sotto; dicono se il prezzo è lontano dalla media rispetto alla sua dispersione recente.
- **Formula.** Media `m` = SMA di N chiusure, `s` = deviazione standard di popolazione delle stesse (divisore N, come TA-Lib `STDDEV` [11]); bande `m ± k * s`. «Di popolazione» vuol dire che si divide per N e non per N - 1; con N = 20 la differenza è piccola. Valori predefiniti N = 20, k = 2 (regola 9 di [11]). La **deviazione standard** misura quanto i valori si allontanano dalla loro media; la regola 12 di [11] usa la SMA. In parole, le tre forme d'ingresso possibili: `z` dice di quante deviazioni standard la chiusura sta sopra o sotto la media; `pctB` (%B) dice dove sta tra le due bande, 0 sulla banda bassa e 1 sulla banda alta; la larghezza dice quanto sono aperte le bande rispetto alla media. In formula:

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
- **Esempio** (N = 5, k = 2). Una riga per giorno: la chiusura e le tre forme d'ingresso; la larghezza è in percento della media.

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

> **Per la decisione.** Escluse: `z` si ricostruisce al 90 % dagli ingressi proposti e l'RSI porta la stessa idea (distanza divisa per l'agitazione) con un parametro continuo. La larghezza resta un'alternativa all'ATR normalizzato se Luca, in D3, volesse un'altra misura di agitazione.

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
- **Esempio** (`c` = 1/5). Una riga per giorno: massimo, minimo, l'escursione vera TR, la sua media ATR in euro e l'ATR normalizzato NATR in percento della chiusura (l'ingresso proposto).

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
- **Applicazione al nostro problema (giorno 12).** Massimo 10,75, minimo 10,46, chiusura di ieri 10,80. L'escursione vera è il maggiore tra 10,75 - 10,46 = 0,29, la distanza del massimo dalla chiusura di ieri (0,05) e quella del minimo (0,34): vale 0,34, perché la giornata si è svolta tutta sotto la chiusura di ieri. L'ATR passa da 0,2540 a 0,2540 × 0,8 + 0,34 × 0,2 = 0,2712 e l'ingresso è 0,2712 / 10,50 = 0,0258. Nel punteggio d'esempio il peso è -20 («più agitazione, più prudenza»): contributo -0,52. Siccome il NATR è sempre positivo, il contributo è negativo tutti i giorni, tra -0,24 e -0,52: funziona come una soglia di acquisto un po' più alta, che sale quando il mercato si agita. Sui 20 giorni toglierlo non cambia nessuna decisione.
- **Con OHLC/4.** Non cambierebbe: usa i campi separati.
- **Fonti.** [1]; [5]; [21] solo scheda.
- **Proposta.** **Ammessa** come NATR (ingresso 5), con la domanda D3 sul termine senza direzione.

> **Per la decisione.** Ammesso come NATR (ingresso 5), con la domanda D3: è l'unico ingresso proposto sempre positivo, senza direzione. Peso negativo = più prudenza quando il mercato si agita, peso positivo = il contrario. Nell'esempio non sposta nessuna decisione.

#### Scheda N6: volatilità EWMA dei rendimenti (proposta nuova, fuori dall'elenco minimo)

- **In una frase.** Quanto si muove di solito il prezzo da un giorno all'altro, con più peso ai giorni recenti. **Volatilità** è il nome di questa agitazione.
- **Formula.** In parole: una media esponenziale dei quadrati dei rendimenti giornalieri, e poi la radice; un rendimento grande, positivo o negativo, la fa salire. In formula `v[t] = v[t-1] * (1 - c) + r[t]^2 * c`, `s[t] = radice di v[t]`, con `r` il rendimento logaritmico. È la media esponenziale dei quadrati dei rendimenti delle note MIT [12], dove il peso del passato si chiama beta: nella notazione di Consilium `c = 1 - beta` (orientamento controllato). Il valore 0,94 per il peso del passato su dati giornalieri è attribuito a RiskMetrics (un metodo di misura del rischio pubblicato da J.P. Morgan) da fonti secondarie [24].
- **Calcolo.** Mattone (a) più la chiusura di ieri: 2 numeri.
- **Avvio e casi limite.** Barra 1: 0 (non c'è un rendimento); barra 2: il primo `r^2`. Nessun denominatore.
- **Campi e parametri.** C. `c` continuo.
- **Ingresso nel punteggio.** Senza direzione come l'ATR. Uso principale: **divisore** di una distanza (N2).
- **Ridondanza.** Si ricostruisce dagli ingressi proposti con R² 0,64 sulla serie sintetica e 0,94 su ENI (contorno); l'ingresso più vicino è l'ATR normalizzato.
- **Esempio** (`c` = 0,2). Una riga per giorno: il rendimento logaritmico, la volatilità EWMA, la distanza dalla EMA (scheda N1) e il loro rapporto, che è lo z-score N2, tutti in percento salvo l'ultima colonna.

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

> **Per la decisione.** Esclusa come ingresso: dice quasi la stessa cosa dell'ATR normalizzato sui dati ENI e non vede i salti tra un giorno e l'altro. Resta utile come divisore (z-score N2). Nulla da decidere oltre a D3.

#### Scheda N9: distanza dal massimo di N giorni (proposta nuova, fuori dall'elenco minimo)

- **In una frase.** Quanto il prezzo è sotto il punto più alto delle ultime N giornate: 0 significa che oggi siamo sul massimo.
- **Formula.** `dd[t] = C[t] / max(H[t-N+1 .. t]) - 1`, sempre ≤ 0.
- **Calcolo.** Mattone (c): coda monotona di al più N valori; lavoro costante in media.
- **Avvio e casi limite.** Finestra crescente; barra 1: `C/H - 1`. Nessun denominatore nullo (H > 0).
- **Campi e parametri.** H, C. N intero, gene (cambia la dimensione dello stato).
- **Ingresso nel punteggio.** Adimensionale, limitato sopra da 0. Peso positivo = si compra di più vicino al massimo, peso negativo = dopo un calo. Porta la **memoria del picco**, che una media dimentica.
- **Ridondanza.** R² 0,82 sugli altri ingressi proposti; correlazione 0,90 con la distanza lenta.
- **Esempio** (N = 10). Una riga per giorno: la chiusura, il massimo dei massimi degli ultimi 10 giorni e la distanza della chiusura da quel massimo, in percento (0 = siamo sul massimo).

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
- **Applicazione al nostro problema (giorno 12).** Il massimo dei massimi dei giorni 3-12 è 11,43 (giorno 8); l'ingresso è 10,50 / 11,43 - 1 = -0,0814: il prezzo è circa l'8 % sotto il picco recente. Con peso d'esempio 10 il contributo è -0,81. Il valore non supera mai 0, quindi con peso positivo il contributo è zero o negativo: spinge verso la vendita dopo un calo e si annulla vicino al massimo. Sui 20 giorni toglierlo non cambia nessuna decisione: con questi pesi gli altri ingressi bastano già a decidere.
- **Con OHLC/4.** Usa H e C della barra; la scelta del prezzo non cambia il massimo.
- **Fonti.** [13] per la coda.
- **Proposta.** **Ammessa** (ingresso 4). Variante N10 «massimo che dimentica» (`m = max(H, m * (1 - c) + C * c)`: ogni giorno il valore scende un po' verso la chiusura, ma non sotto il massimo del giorno), con `c` continuo: nessuna fonte, domanda D4.

> **Per la decisione.** Ammessa (ingresso 4). Con peso positivo si preferiscono i momenti vicini al massimo recente; con peso negativo si compra dopo un calo. Porta la memoria del picco, che una media perde. Domanda collegata: D4 (finestra fissa o memoria che sfuma).

#### Scheda: oscillatore stocastico

- **In una frase.** Dove si trova la chiusura di oggi nell'intervallo tra il minimo e il massimo degli ultimi N giorni: 0 sul minimo, 1 sul massimo.
- **Formula.** `%K = (C - LL) / (HH - LL)`, con `HH` e `LL` massimo e minimo su N barre; `%D` = media di 3 `%K`. TA-Lib usa per default 5, 3, 3 e liscia `%K` con una media di 3 [7]; qui `%K` è la forma non lisciata. Forma centrata: `2 * %K - 1`.
- **Calcolo.** Due mattoni (c) più una finestra di 3: fino a 2N + 3 numeri.
- **Avvio e casi limite.** Barra 1: la sola barra 1; finestra piatta (`HH = LL`): TA-Lib dà 0 [7], il catalogo tiene il valore precedente (0,5 all'inizio, cioè 0 centrato).
- **Campi e parametri.** H, L, C. N intero.
- **Ingresso nel punteggio.** Adimensionale, limitato. Saturazione come l'RSI.
- **Ridondanza.** R² 0,87 (%K 14 centrato) sugli ingressi proposti; correlazione 0,92 con la distanza veloce.
- **Esempio** (N = 5, %D su 3). Una riga per giorno: la chiusura, il massimo e il minimo degli ultimi 5 giorni, `%K` (posizione della chiusura tra minimo e massimo), la sua forma centrata tra -1 e 1, e `%D`, la media degli ultimi 3 `%K`.

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

> **Per la decisione.** Escluso: si ricostruisce all'87 % dagli ingressi proposti, usa due finestre intere, e la memoria del massimo la porta già la distanza dal massimo. Nulla da decidere.

### 4.4 Lacuna L2 — dentro la giornata

Che cosa porta: dove chiude la giornata rispetto al suo massimo e minimo.

#### Scheda N14: posizione della chiusura nella giornata, in media (proposta nuova, fuori dall'elenco minimo)

- **In una frase.** Se le giornate recenti chiudono vicino al massimo (+1) o vicino al minimo (-1).
- **Formula.** `clv[t] = ((C - L) - (H - C)) / (H - L)` in [-1, 1]: è il moltiplicatore della linea di accumulo e distribuzione di Chaikin [8], senza volume. Ingresso: `EMA(clv; c)`. **Accumulo e distribuzione** sono i nomi convenzionali di periodi in cui le chiusure stanno vicino ai massimi o ai minimi con volume alto: qui è solo il nome del calcolo.
- **Calcolo.** Mattone (a): 1 numero.
- **Avvio e casi limite.** Barra 1: il suo `clv`. H = L: barra saltata (sezione 3.3).
- **Campi e parametri.** H, L, C. `c` continuo, gene.
- **Ingresso nel punteggio.** Adimensionale, limitato. Peso positivo = si compra di più dopo giornate chiuse in alto.
- **Ridondanza.** R² 0,49 sugli altri ingressi proposti: è l'ingresso di prezzo più «nuovo». Il CMF esponenziale (N18) gli è vicino (R² 0,91, correlazione 0,95).
- **Esempio** (`c` = 0,2). Una riga per giorno: massimo, minimo e chiusura, la posizione della chiusura nella giornata (`clv`, da -1 sul minimo a +1 sul massimo) e la sua media, che è l'ingresso proposto. Giorno 2: ((10,10 - 9,95) - (10,18 - 10,10)) / (10,18 - 9,95) = 0,07 / 0,23 = 0,30, chiusura un po' sopra la metà della giornata.

| Giorno | Massimo | Minimo | Chiusura | CLV del giorno | CLV in EMA c=0,2 |
|---|---|---|---|---|---|
| 1 | 10,06 | 9,94 | 10,00 | 0,00 | 0,00 |
| 2 | 10,18 | 9,95 | 10,10 | 0,30 | 0,06 |
| 5 | 10,88 | 10,55 | 10,80 | 0,52 | 0,31 |
| 8 | 11,43 | 11,17 | 11,35 | 0,38 | 0,40 |
| 12 | 10,75 | 10,46 | 10,50 | -0,72 | -0,17 |
| 14 | 10,35 | 10,12 | 10,20 | -0,30 | -0,26 |
| 16 | 10,61 | 10,35 | 10,55 | 0,54 | 0,03 |
| 20 | 11,48 | 11,22 | 11,40 | 0,38 | 0,32 |

- **Applicazione al nostro problema (giorno 12).** Massimo 10,75, minimo 10,46, chiusura 10,50: la chiusura sta 0,04 sopra il minimo e 0,25 sotto il massimo, quindi `clv` = (0,04 - 0,25) / 0,29 = -0,7241, quasi sul minimo. La media (`c` = 0,2) passa da -0,0360 a -0,0360 × 0,8 + (-0,7241) × 0,2 = -0,1736. Con peso d'esempio 2 il contributo è -0,35. Sui 20 giorni toglierlo cambia la decisione nei giorni 9 e 18 (`buy` diventa `hold`).
- **Con OHLC/4.** La media cancellerebbe proprio questa informazione; con la chiusura resta.
- **Fonti.** [8]; costruzione proposta in questa ricerca.
- **Proposta.** **Ammessa** (ingresso 6).

> **Per la decisione.** Ammessa (ingresso 6). Con peso positivo si compra dopo giornate che chiudono vicino al massimo. È l'ingresso di prezzo meno ricostruibile dagli altri (R² 0,49). Alternativa: il CMF, che mette nello stesso numero anche il volume.

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

> **Per la decisione.** Escluso come ingresso: è una somma senza limite che dipende dal giorno in cui si comincia a contare (nell'esempio della scheda N17 passa da 1000 a 11300 e poi a 1200). La sua idea entra come OBV normalizzato (ingresso 8).

#### Scheda N17: OBV normalizzato (proposta nuova, fuori dall'elenco minimo)

- **In una frase.** Fra il volume recente, quanta parte è stata scambiata in giorni di rialzo (+1 = tutta) e quanta in giorni di ribasso (-1 = tutta).
- **Formula.** In parole: una media esponenziale del volume con il segno della variazione del giorno (più nei giorni di rialzo, meno in quelli di ribasso), divisa per la media esponenziale del volume senza segno; il risultato va da -1 a +1. È il rapporto di due EMA con lo stesso `c`, avviate da zero (sezione 3.2):

  ```
  f[t] = EMA0( segno(dC[t]) * V[t] ; c ) / EMA0( V[t] ; c )
  ```

  È l'idea dell'OBV riscritta come rapporto [ipotesi, costruzione proposta in questa ricerca, senza fonte].
- **Calcolo.** Due mattoni (a) più la chiusura di ieri: 3 numeri.
- **Avvio e casi limite.** Barra 1: 0. V = 0: le due medie calano della stessa frazione e il rapporto non cambia (barra piatta ENI, sezione 3.3).
- **Campi e parametri.** C, V. `c` continuo, gene.
- **Ingresso nel punteggio.** In [-1, 1]. Peso positivo = si compra di più quando il volume recente è andato soprattutto nei rialzi.
- **Ridondanza.** R² 0,59 sugli altri ingressi proposti; correlazione 0,76 con l'RSI centrato (entrambi contano i giorni di rialzo).
- **Esempio** (`c` = 0,2). Una riga per giorno: chiusura, volume, l'OBV grezzo (scheda OBV) e l'OBV normalizzato, che è l'ingresso proposto.

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
- **Applicazione al nostro problema (giorno 12).** La chiusura scende da 10,80 a 10,50, quindi il volume del giorno, 2200, entra con il segno meno. Numeratore: da -124,4 a -124,4 × 0,8 + (-2200) × 0,2 = -539,5; denominatore: da 1358,8 a 1358,8 × 0,8 + 2200 × 0,2 = 1527,0; ingresso -539,5 / 1527,0 = -0,3533: il volume recente è andato più nei ribassi che nei rialzi. Con peso d'esempio 1 il contributo è -0,35. Sui 20 giorni toglierlo cambia la decisione nei giorni 2, 9 e 18; il giorno 2, come l'RSI, vale già 1,00 dopo un solo rialzo.
- **Con OHLC/4.** Come l'OBV.
- **Fonti.** [10] per l'idea.
- **Proposta.** **Ammessa** (ingresso 8).

> **Per la decisione.** Ammesso (ingresso 8). Con peso positivo si compra quando il volume recente è andato soprattutto nei giorni di rialzo. È la direzione del volume, che il volume relativo (ingresso 7) non ha. Da sapere: è una costruzione senza fonte, verificata solo dagli script.

#### Scheda: CMF (flusso di denaro di Chaikin)

- **In una frase.** Il **flusso di denaro**, cioè la posizione della chiusura nella giornata pesata con il volume, sommato su N giorni e diviso per il volume totale: unisce L2 e L3.
- **Formula.** `CMF[t] = somma(clv * V) / somma(V)` sulle ultime N barre, con `clv` della scheda N14. Valore abituale N = 20 [ipotesi, fonte da verificare: nessuna fonte primaria trovata per Chaikin; TA-Lib documenta il moltiplicatore [8] e l'oscillatore [9], non il CMF]. Variante esponenziale N18: `EMA0(clv * V; c) / EMA0(V; c)`.
- **Calcolo.** Due mattoni (b): 2N valori e due somme (N18: 2 numeri).
- **Avvio e casi limite.** H = L: barra saltata, non entra nella finestra; somma dei volumi nulla: valore precedente.
- **Campi e parametri.** H, L, C, V. N intero (N18: `c` continuo).
- **Ingresso nel punteggio.** In [-1, 1].
- **Ridondanza.** CMF 20: R² 0,74; N18: R² 0,91 (correlazione 0,95 con N14). Nel punteggio lineare, N14 e N16 separano «dove chiude» da «quanto si scambia» e lasciano a R4 la scelta di combinarli.
- **Esempio** (CMF su 5 giorni; N18 e N14 con `c` = 0,2). Una riga per giorno: la posizione della chiusura nella giornata, il CMF su 5 giorni, la sua variante esponenziale e, per confronto, la sola posizione della chiusura in media (scheda N14).

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

> **Per la decisione.** Riserva della voce 6. Sceglierlo al posto della posizione della chiusura in media vuol dire pesare di più i giorni di volume alto dentro lo stesso ingresso; tenere separati i due (ingressi 6 e 7) lascia a R4 la scelta di combinarli.

### 4.6 Varianti e proposte senza scheda

Proposte che non hanno una scheda propria: varianti di una scheda, o escluse con un motivo breve. La tabella si legge per riga: la proposta, l'esito e il perché; i nomi delle sigle sono nella tabella in apertura.

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
| N20 force index e MFI [16] | esclusi | coperti da RSI e N17 [ipotesi]; documentati anche dalla libreria `ta` [14] |
| Williams %R | esclusa | lo stocastico riscalato [ipotesi, fonte da verificare] |
| rendimento di un giorno `r[t]` | mattone, non ingresso | il dato più rumoroso; entra in N6 e N15 |
| qualunque ingresso legato alla posizione (prezzo di carico, giorni in posizione, stop mobile) | esclusa | viola «memoria solo negli indicatori» |
| giorno della settimana, dati esterni | esclusi | non sono memoria del titolo; fuori perimetro |

## 5. Scala, normalizzazione e ridondanza

### 5.1 Perché la scala conta

In una somma pesata il contributo di un ingresso è peso per valore. Se un ingresso è in euro e un altro in milioni di azioni, i pesi non si confrontano e la mutazione di un peso ha effetti diversissimi (guida, sezione 4.8.3, dove con peso 1 il volume era di fatto ignorato). Per questo **ogni ingresso proposto è adimensionale**: un rapporto, un logaritmo di rapporto o un valore tra -1 e 1.

### 5.2 Le grandezze senza direzione

ATR, volatilità, larghezza delle bande, ADX sono **sempre positivi**: non dicono «su» o «giù». In una somma pesata spostano il punteggio sempre nello stesso verso: con peso positivo «più il mercato è agitato, più si compra», qualunque sia la direzione. È raramente la regola voluta [ipotesi]. Il loro uso naturale è **dividere** un ingresso con direzione (come fa l'RSI, sezione 4.2) o **moltiplicarlo** (ingresso prodotto, guida, sezione 4.8.2), e questa è una scelta delle equazioni di decisione (R4). Il catalogo propone **un solo** ingresso sempre positivo e senza direzione (NATR) e chiede a Luca se tenerlo (D3): tenere l'ATR normalizzato come ingresso diretto, o lasciarlo a R4 come divisore o fattore di un prodotto? Un caso vicino è il volume relativo (N16): ha un segno (più o meno del solito), ma non dice in che direzione va il prezzo; la direzione del volume la porta l'OBV normalizzato (N17).

### 5.3 La scala di N1 dipende dal gene `c`

Sulla serie sintetica la deviazione standard di `ln(C / EMA)` vale 1,7e-4 con `c` = 0,99, 4,8e-3 con 0,73, 3,6e-2 con 2/21, 6,0e-2 con 2/51 (su ENI: 1,7e-4; 4,9e-3; 4,0e-2; 6,2e-2). Con `c` che evolve, lo stesso peso vale cose diverse, e con `c` vicino a 1 l'ingresso sparisce (la media coincide con il prezzo). Due rimedi, da scegliere in R3: (a) usare la forma divisa per la volatilità (N2) o la forma RSI, che resta tra -1 e 1 qualunque sia `c`; (b) limitare `c` lontano da 1.

### 5.4 Normalizzazioni ammesse

Tutte causali e con lo stato dei mattoni: rapporto o distanza logaritmica da una media; divisione per una misura di agitazione recente (ATR, volatilità EWMA, variazione assoluta media); valore limitato riportato a un intervallo centrato (`2 * %K - 1`, RSI centrato); punteggio standardizzato **scorrevole** con media e varianza esponenziali. Esclusa la standardizzazione con media e deviazione dell'intera serie (anticipazione, sezione 1.3).

Un'analogia, solo come tale: i sistemi sensoriali dividono la risposta per l'attività recente del contesto, così il segnale resta leggibile al buio e al sole («normalizzazione divisiva» [15], letto l'abstract). Che l'analogia valga per i mercati è [ipotesi]; il conteggio degli ingressi resta per termini della somma.

### 5.5 Ridondanza: identità, serie sintetica, controllo su ENI

**Due misure.** Correlazione ρ e coefficiente R² sono spiegati in «Prima di cominciare». In breve: ρ dice quanto due serie si muovono insieme, R² quale quota di un ingresso si ricostruisce con una somma pesata degli altri.

**Prima prova: identità algebriche** (verificate numericamente sulla serie sintetica). La tabella ha una riga per identità: l'uguaglianza, lo scarto più grande trovato dallo script (numeri come 3,1e-16 sono arrotondamenti del calcolo, cioè uguaglianza esatta) e che cosa ne segue per il catalogo.

| # | Identità | Scarto massimo | Conseguenza |
|---|---|---|---|
| I1 | `ln(e_veloce / e_lenta) = d_lenta - d_veloce` | 3,1e-16 | MACD logaritmica = combinazione esatta di due N1 |
| I2 | `e[t]/e[t-1] - 1 = c * (C[t]/e[t-1] - 1)` e `d[t] = ln(1+u) - ln(1+c*u)` | 2,7e-16 e 4,1e-16 | la pendenza della EMA è una funzione di `d[t]` |
| I3 | `2 * RSI / 100 - 1 = media(dC) / media(abs(dC))` (Wilder, stesso avvio) | 8,9e-16 | l'RSI centrato è un rapporto di due medie |
| I4 | `pctB = 0.5 + z / (2 * k)` | 2,7e-15 | %B e z di Bollinger sono lo stesso ingresso |
| I5 | `EMA0(dC; c) = c / (1 - c) * (C - EMA(C; c))` | 8,4e-17 (relativo) | l'RSI centrato è una distanza in euro dalla EMA divisa per la variazione assoluta media, a meno della costante `c / (1 - c)` |

I5 è una derivazione dell'autore di questo catalogo, verificata dallo script e rifatta a mano allo Step 8 del ciclo; va ricontrollata dal verificatore indipendente. Dimostrazione in due righe: posto `D[t] = C[t] - e[t]`, dalla ricorsione della EMA (avviata al primo valore, quindi `D[1] = 0`) si ottiene `D[t] = (1 - c) * (D[t-1] + dC[t])`; moltiplicando per `c / (1 - c)` si trova `X[t] = (1 - c) * X[t-1] + c * dC[t]` con `X[1] = 0`, che è la ricorsione di `A = EMA0(dC; c)` con lo stesso inizio. Quindi `X = A` a ogni barra. Sul dataset inventato lo scarto massimo nei 20 giorni è 1,0e-15.

**Seconda prova: serie sintetica.** Una **passeggiata aleatoria** (prezzo che ogni giorno sale o scende di una quantità casuale, senza memoria) costruita con un generatore pseudo-casuale con **seme** dichiarato, cioè il numero che rende la sequenza ripetibile: seme 20261018, 10000 giorni, volatilità giornaliera 0,017, 30 % della varianza durante la notte, 78 passi nella seduta (da cui massimo e minimo), logaritmo del volume con memoria di un giorno 0,6 e dispersione 0,4, volume **indipendente** dal prezzo. Gli ordini di grandezza sono presi dallo snapshot ENI e arrotondati (0,0169; 0,32; 0,62; 0,41). Le prime 100 barre sono escluse. Su una serie senza struttura, una correlazione alta è **di costruzione**: vale per qualunque titolo, perché nasce dalle formule.

**Limite dichiarato della serie sintetica.** Ha agitazione costante e volume scollegato dal prezzo. Non può quindi mostrare l'informazione che sta nel cambiare dell'agitazione (L4, ATR contro N6) né quella che lega volume e prezzo: lì valgono solo le identità.

**Regola di ridondanza** [ipotesi dell'autore, da confermare]: un candidato con R² ≥ 0,90 sugli ingressi proposti (serie sintetica) è **ridondante**; sotto 0,90 non è ridondante, ma entra solo se colma una lacuna che gli altri non colmano.

Correlazioni tra gli ingressi proposti (sopra la diagonale serie sintetica, sotto ENI come controllo). Righe e colonne sono gli otto ingressi, numerati come nella proposta. Esempio di lettura: riga 2, colonna 3 vale 0,95, cioè sulla serie sintetica distanza lenta e RSI si muovono quasi insieme; riga 3, colonna 2 vale 0,83, la stessa coppia sui dati ENI.

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

Quanto ogni ingresso proposto è spiegato dagli altri sette. Una riga per ingresso; le colonne sono la serie sintetica (la prova) e tre controlli sui dati ENI (intero snapshot, primo 40 %, restante 60 %). Vicino a 1 = quasi ricostruibile dagli altri; vicino a 0 = informazione nuova.

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

**Che cosa si legge.** Il blocco livello e tendenza (ingressi 1-4) è fortemente collineare: d lenta e RSI superano 0,90 sulla serie sintetica. Per l'RSI il motivo è noto (I5: sulla serie sintetica il divisore è quasi costante); per d lenta è il prezzo di avere due velocità, e con `c` evolvibili le velocità si spostano. Il blocco è proposto così perché ogni voce porta una cosa che le altre non hanno per costruzione (una seconda velocità, il divisore L4, il massimo); se Luca preferisce un blocco più compatto, lo dice con la domanda D2: tenere i quattro ingressi o ridurli a tre togliendo la distanza lenta? Gli ingressi 5-8 portano informazione in gran parte nuova.

**Controllo di contorno sullo snapshot ENI** (sola lettura, intero snapshot e due tratti: primo 40 % e restante 60 %; non guida la scelta). Le correlazioni cambiano tra i tratti: distanza a `c` = 2/21 e RSI centrato valgono 0,79 nel primo tratto e 0,93 nel secondo, distanza e z di Bollinger 0,66 e 0,87. Scegliere gli ingressi guardando ENI significherebbe sceglierli sugli stessi dati su cui R6 valuterà i genomi; per questo il catalogo usa ENI solo per mostrare dove la serie sintetica non arriva (agitazione variabile: ATR e volatilità EWMA 0,97 su ENI contro 0,63 sulla serie sintetica).

## 6. Famiglie con parametri evolvibili

**Parametro continuo o finestra intera.** Il coefficiente `c` di una EMA è **continuo**: si muta e si mescola come gli attuali coefficienti IIR, nel vincolo `0 < c < 1` di `genome.js`, e non cambia la dimensione dello stato. Una finestra N (SMA, ROC, stocastico, N9) è un **intero**: cambiarla cambia quanti valori si conservano e l'avvio, e incrocio e mutazione devono trattarla a parte (R3). Quasi tutti gli ingressi proposti hanno la forma continua; solo N9 ha una finestra intera (alternativa continua: N10, senza fonte).

**Due costi delle famiglie evolvibili.**

1. **Scala.** La scala dell'ingresso dipende dal gene (sezione 5.3).
2. **Avvio diverso da individuo a individuo.** Con `c` = 2/11 l'avvio dura 15 barre, con 2/51 ne dura 75, con Wilder 14 ne dura 41; una finestra di 50 giorni 50 barre. Due genomi con geni diversi sono quindi valutati su un numero diverso di barre «affidabili». È un fatto per R6, che può fissare un avvio massimo comune escluso dalla valutazione.

**Intervallo di `c`: questione per R3.** Il catalogo non lo fissa. Elementi per la scelta: valori vicini a 1 annullano N1 (sezione 5.3); l'avvio cresce come `ln 0,05 / ln(1 - c)`; le due velocità di N1 devono restare ordinate (`c_veloce > c_lenta`). Un'opzione per R3 è far evolvere la velocità più rapida e il rapporto tra le velocità, invece di due `c` indipendenti: le velocità non possono coincidere per costruzione, ma la spaziatura diventa fissa [ipotesi, nessuna fonte per l'uso in un genoma].

**Dimensione del genoma.** Con gli 8 ingressi proposti: 8 pesi, 2 soglie e 8 parametri degli indicatori (7 `c` continui e 1 N intero) = **18 numeri**, senza bias. Con due soglie il bias è ridondante (spostare bias e soglie della stessa costante non cambia le decisioni), e moltiplicare pesi e soglie per la stessa costante positiva neppure: almeno un grado di libertà dei 18 non cambia le decisioni (verificato con l'algebra durante la ricerca; la guida, sezione 4.2.4, lo mostra con un esempio). Il conteggio è da passare a R3, che decide la codifica.

## 7. Esito: ammessi ed esclusi

### 7.1 La regola di conteggio (decisa da Luca, Q2)

1. **Ogni termine della somma pesata conta uno.** Un indicatore con più uscite (linea e segnale della MACD, %K e %D dello stocastico) conta uno per ogni uscita usata.
2. **Non si ammette un termine che è combinazione lineare esatta di altri ingressi presenti.** Esempi: la MACD logaritmica quando ci sono le due distanze con le stesse velocità (I1); l'istogramma quando ci sono linea e segnale; %B quando c'è z di Bollinger (I4).
3. I **parametri** delle famiglie (i `c`, le finestre) sono geni: non contano nel limite di 10, contano nella dimensione del genoma (capitolo 6).
4. Un indicatore usato **solo come divisore** dentro un altro ingresso (la volatilità dentro N2) non è un termine della somma.

### 7.2 Fatti di calcolo

Parametri d'esempio della sezione 5.5; «avvio» = barre perché il valore di partenza pesi meno del 5 %, o lunghezza della finestra. Questa tabella serve soprattutto a E2: una riga per indicatore, con i campi della barra che usa, lo stato da conservare (mattoni del capitolo 3), il lavoro per ogni giorno, la durata dell'avvio e se dentro c'è una media della stessa forma dei filtri attuali.

| Indicatore | Campi | Mattone e stato | Lavoro per barra | Avvio (barre) | Filtro IIR equivalente |
|---|---|---|---|---|---|
| EMA / distanza da una EMA (N1) | C | (a), 1 numero | costante | 15 (`c` 2/11), 75 (`c` 2/51) | sì, stesso `c` |
| SMA | C | (b), N + 1 | costante | N | no |
| MACD | C | (a) × 3 | costante | almeno 39 (26 giorni) | sì, tre in cascata |
| ROC | C | (b), N + 1 | costante | N | no |
| volume relativo (N16) | V | (a), 1 | costante | 30 (`c` 2/21) | sì, sul volume |
| RSI centrato | C | (a) × 2 + 1 | costante | 41 (Wilder 14) | sì, `c = 1/N` |
| Bollinger | C | (d), N + 2 | costante, sensibile agli arrotondamenti | N | no |
| ATR / NATR | H, L, C | (a) + 1 | costante | 41 (Wilder 14) | sì, `c = 1/N` |
| volatilità EWMA (N6) | C | (a) + 1 | costante | 49 (`c` 0,06) | sì, su `r^2` |
| distanza dal massimo (N9) | H, C | (c), fino a N | costante in media | N | no |
| stocastico | H, L, C | (c) × 2 + (b) | costante in media | N | no |
| chiusura nella giornata (N14) | H, L, C | (a), 1 | costante | 30 (`c` 2/21) | sì, su `clv` |
| OBV | C, V | (e), 1 | costante | nessuno: dipende dall'inizio | no |
| OBV normalizzato (N17) | C, V | (a) × 2 + 1 | costante | 30 (`c` 2/21) | sì, rapporto di due |
| CMF / CMF esponenziale (N18) | H, L, C, V | (b) × 2 / (a) × 2 | costante | N / 30 | N18 sì |

### 7.3 Fatti per il punteggio

Questa è la tabella della scelta. Una riga per indicatore: il **ruolo** (ingresso della somma, mattone usato da altri, variante di un altro, normalizzatore cioè divisore), la **lacuna** che colma (sezione 4.0), la forma con cui entrerebbe nel punteggio, l'intervallo dei suoi valori, quanto si ricostruisce dagli ingressi proposti (R², serie sintetica; per un ingresso proposto, dagli altri sette) e l'esito.

| Indicatore | Ruolo | Lacuna | Forma d'ingresso | Intervallo | R² sugli ingressi proposti | Esito |
|---|---|---|---|---|---|---|
| EMA | mattone | A | attraverso N1 | - | - | mattone |
| distanza da una EMA (N1), veloce e lenta | ingresso | A | `ln(C / EMA)` | circa ±0,1 | 0,84 e 0,95 | **ammessi (1, 2)** |
| SMA | variante | A | `ln(C / SMA)` | circa ±0,1 | 0,95 | escluso: ridondante |
| MACD | variante | A | `ln(EMA_v / EMA_l)` | circa ±0,1 | 0,97 (linea) | escluso: regola 2 e ridondanza |
| ROC | variante | A | `ln(C[t] / C[t-N])` | circa ±0,2 | 0,79-0,83 | escluso: nessuna lacuna |
| volume relativo (N16) | ingresso | A (volume) | `ln(V / EMA V)` | circa ±1 | 0,00 | **ammesso (7)** |
| RSI centrato | ingresso | L4 | `A / B` | [-1, 1] | 0,97 | **ammesso (3)**, per I5 |
| Bollinger | variante | L4 | z | circa ±2 | 0,90 | escluso: ridondante, finestra intera |
| ATR normalizzato (NATR) | ingresso | L1 | NATR | > 0 | 0,35 | **ammesso (5)**, D3 |
| volatilità EWMA (N6) | normalizzatore | L1 | `s` | > 0 | 0,64 | escluso come diretto |
| distanza dal massimo (N9) | ingresso | L1 | `C / max H - 1` | ≤ 0 | 0,82 | **ammesso (4)**, D4 |
| stocastico | variante | L1 | `2 %K - 1` | [-1, 1] | 0,87 | escluso: N9 e N1 lo coprono |
| chiusura nella giornata (N14) | ingresso | L2 | `EMA(clv)` | [-1, 1] | 0,49 | **ammesso (6)** |
| OBV | mattone | L3 | attraverso N17 | non limitato | - | escluso come diretto |
| OBV normalizzato (N17) | ingresso | L3 | rapporto di EMA | [-1, 1] | 0,59 | **ammesso (8)** |
| CMF | variante | L2, L3 | `somma(clv V) / somma V` | [-1, 1] | 0,74 (N18: 0,91) | riserva della voce 6 |

Gli intervalli con «circa» sono ordini di grandezza osservati, non limiti [ipotesi].

### 7.4 L'elenco proposto

**Ammessi: 8 ingressi** (sotto il limite di 10). È la proposta su cui Luca risponde con la domanda D1: approvarla così com'è, o indicare quali voci togliere e quali riserve aggiungere?

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

### 7.5 Esempio: gli otto ingressi al lavoro sul dataset inventato

Questo esempio mostra come gli otto ingressi proposti diventano, giorno per giorno, una decisione `buy`, `hold` o `sell`. **Pesi e soglie sono scelti a mano** perché ogni ingresso, moltiplicato per il suo peso, valga circa tra -1 e +1 nei giorni del dataset: in un genoma vero li cercherebbe l'algoritmo genetico. L'esempio non calcola guadagni e non dice nulla sulla qualità degli ingressi; serve a vedere il meccanismo. I numeri vengono dallo script `ref/decision.mjs`.

**Parametri e pesi.** I parametri sono corti come nelle schede, perché il dataset ha solo 20 giorni. La tabella ha una riga per ingresso: il parametro, il peso e il motivo del segno.

| # | Ingresso | Parametro | Peso | Segno del peso, in parole |
|---|---|---|---|---|
| 1 | distanza dalla EMA veloce | `c` = 0,5 | 50 | prezzo sopra la media breve → verso `buy` |
| 2 | distanza dalla EMA lenta | `c` = 0,2 | 20 | prezzo sopra la media lunga → verso `buy` |
| 3 | RSI centrato | `c` = 1/5 | 1 | rialzi recenti prevalenti → verso `buy` |
| 4 | distanza dal massimo | N = 10 | 10 | lontano dal picco recente → verso `sell` |
| 5 | ATR normalizzato | `c` = 1/5 | -20 | mercato agitato → più prudenza |
| 6 | posizione della chiusura, in media | `c` = 0,2 | 2 | giornate chiuse in alto → verso `buy` |
| 7 | logaritmo del volume relativo | `c` = 0,2 | 2 | volume alto → verso `buy`, qualunque sia la direzione |
| 8 | OBV normalizzato | `c` = 0,2 | 1 | volume nei giorni di rialzo → verso `buy` |

Soglie: `buy` se il punteggio supera +2, `sell` se scende sotto -2, `hold` altrimenti. La decisione presa la sera del giorno `t` si esegue il giorno `t+1` (sezione 1.3).

**Gli ingressi giorno per giorno.** Una riga per giorno, una colonna per ingresso, valori senza unità (le distanze sono frazioni: -0,023 vuol dire poco più del 2 % sotto).

| Giorno | d veloce | d lenta | RSI centrato | dist. dal massimo | NATR | chiusura nella giornata | volume relativo | OBV normalizzato |
|---|---|---|---|---|---|---|---|---|
| 1 | 0,000 | 0,000 | 0,000 | -0,006 | 0,012 | 0,000 | 0,000 | 0,000 |
| 2 | 0,005 | 0,008 | 1,000 | -0,008 | 0,014 | 0,061 | 0,076 | 1,000 |
| 3 | 0,012 | 0,022 | 1,000 | -0,004 | 0,016 | 0,176 | 0,128 | 1,000 |
| 4 | 0,018 | 0,037 | 1,000 | -0,006 | 0,018 | 0,258 | 0,270 | 1,000 |
| 5 | 0,020 | 0,048 | 1,000 | -0,007 | 0,020 | 0,309 | 0,258 | 1,000 |
| 6 | 0,019 | 0,053 | 1,000 | -0,004 | 0,020 | 0,375 | 0,289 | 1,000 |
| 7 | 0,018 | 0,056 | 1,000 | -0,005 | 0,021 | 0,408 | 0,181 | 1,000 |
| 8 | 0,016 | 0,055 | 1,000 | -0,007 | 0,021 | 0,403 | -0,011 | 1,000 |
| 9 | 0,006 | 0,040 | 0,848 | -0,011 | 0,019 | 0,256 | -0,134 | 0,601 |
| 10 | -0,006 | 0,018 | 0,339 | -0,029 | 0,020 | 0,097 | -0,043 | 0,261 |
| 11 | -0,017 | -0,008 | -0,117 | -0,055 | 0,024 | -0,036 | 0,259 | -0,092 |
| 12 | -0,023 | -0,029 | -0,380 | -0,081 | 0,026 | -0,174 | 0,310 | -0,353 |
| 13 | -0,021 | -0,039 | -0,504 | -0,099 | 0,026 | -0,247 | 0,168 | -0,513 |
| 14 | -0,016 | -0,039 | -0,559 | -0,108 | 0,026 | -0,258 | -0,097 | -0,604 |
| 15 | -0,001 | -0,019 | -0,291 | -0,094 | 0,024 | -0,095 | -0,264 | -0,351 |
| 16 | 0,009 | 0,000 | -0,003 | -0,077 | 0,024 | 0,031 | -0,149 | -0,112 |
| 17 | 0,016 | 0,019 | 0,256 | -0,055 | 0,025 | 0,128 | -0,005 | 0,113 |
| 18 | 0,019 | 0,033 | 0,437 | -0,029 | 0,024 | 0,238 | 0,095 | 0,311 |
| 19 | 0,018 | 0,041 | 0,548 | -0,005 | 0,024 | 0,298 | 0,027 | 0,454 |
| 20 | 0,016 | 0,043 | 0,618 | -0,007 | 0,023 | 0,316 | -0,086 | 0,555 |

**Contributi, punteggio e decisione.** Ogni cella dei contributi è peso × valore della tabella sopra; il punteggio è la somma della riga; la decisione viene dal confronto con +2 e -2. Si legge così: il giorno 12 i contributi sono quasi tutti negativi, solo il volume vale +0,62; la somma è -3,50, sotto -2, quindi `sell`.

| Giorno | d veloce | d lenta | RSI centrato | dist. dal massimo | NATR | chiusura nella giornata | volume relativo | OBV normalizzato | punteggio | decisione |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 0,00 | 0,00 | 0,00 | -0,06 | -0,24 | 0,00 | 0,00 | 0,00 | -0,30 | hold |
| 2 | 0,25 | 0,16 | 1,00 | -0,08 | -0,28 | 0,12 | 0,15 | 1,00 | 2,32 | buy |
| 3 | 0,61 | 0,44 | 1,00 | -0,04 | -0,31 | 0,35 | 0,26 | 1,00 | 3,31 | buy |
| 4 | 0,90 | 0,73 | 1,00 | -0,06 | -0,36 | 0,52 | 0,54 | 1,00 | 4,27 | buy |
| 5 | 1,02 | 0,95 | 1,00 | -0,07 | -0,41 | 0,62 | 0,52 | 1,00 | 4,63 | buy |
| 6 | 0,96 | 1,05 | 1,00 | -0,04 | -0,41 | 0,75 | 0,58 | 1,00 | 4,90 | buy |
| 7 | 0,92 | 1,12 | 1,00 | -0,05 | -0,41 | 0,82 | 0,36 | 1,00 | 4,75 | buy |
| 8 | 0,79 | 1,10 | 1,00 | -0,07 | -0,42 | 0,81 | -0,02 | 1,00 | 4,19 | buy |
| 9 | 0,28 | 0,81 | 0,85 | -0,11 | -0,38 | 0,51 | -0,27 | 0,60 | 2,29 | buy |
| 10 | -0,31 | 0,36 | 0,34 | -0,29 | -0,40 | 0,19 | -0,09 | 0,26 | 0,07 | hold |
| 11 | -0,85 | -0,15 | -0,12 | -0,55 | -0,47 | -0,07 | 0,52 | -0,09 | -1,78 | hold |
| 12 | -1,14 | -0,57 | -0,38 | -0,81 | -0,52 | -0,35 | 0,62 | -0,35 | -3,50 | sell |
| 13 | -1,06 | -0,77 | -0,50 | -0,99 | -0,52 | -0,49 | 0,34 | -0,51 | -4,52 | sell |
| 14 | -0,78 | -0,78 | -0,56 | -1,08 | -0,51 | -0,52 | -0,19 | -0,60 | -5,02 | sell |
| 15 | -0,03 | -0,39 | -0,29 | -0,94 | -0,48 | -0,19 | -0,53 | -0,35 | -3,20 | sell |
| 16 | 0,46 | 0,00 | 0,00 | -0,77 | -0,47 | 0,06 | -0,30 | -0,11 | -1,14 | hold |
| 17 | 0,81 | 0,37 | 0,26 | -0,55 | -0,49 | 0,26 | -0,01 | 0,11 | 0,75 | hold |
| 18 | 0,97 | 0,66 | 0,44 | -0,29 | -0,49 | 0,48 | 0,19 | 0,31 | 2,26 | buy |
| 19 | 0,92 | 0,81 | 0,55 | -0,05 | -0,48 | 0,60 | 0,05 | 0,45 | 2,86 | buy |
| 20 | 0,79 | 0,86 | 0,62 | -0,07 | -0,47 | 0,63 | -0,17 | 0,56 | 2,74 | buy |

**Che cosa succede togliendo un ingresso alla volta.** Si ricalcola il punteggio senza quell'ingresso, lasciando invariati gli altri pesi e le soglie, e si contano i giorni in cui la decisione cambia. È un modo semplice di vedere quanto pesa ciascun ingresso in questo esempio, non una misura della sua utilità.

| Ingresso tolto | Giorni in cui la decisione cambia | Che cosa diventa |
|---|---|---|
| d veloce | 18, 19, 20 | g.18: buy → hold; g.19: buy → hold; g.20: buy → hold |
| d lenta | 9, 18, 20 | g.9: buy → hold; g.18: buy → hold; g.20: buy → hold |
| RSI centrato | 2, 9, 18 | g.2: buy → hold; g.9: buy → hold; g.18: buy → hold |
| dist. dal massimo | nessuno | - |
| NATR | nessuno | - |
| chiusura nella giornata | 9, 18 | g.9: buy → hold; g.18: buy → hold |
| volume relativo | 11 | g.11: hold → sell |
| OBV normalizzato | 2, 9, 18 | g.2: buy → hold; g.9: buy → hold; g.18: buy → hold |

**Che cosa si vede.**

- **Salita (giorni 2-9):** quasi tutti i contributi sono positivi e il punteggio supera +2. Il giorno 2 si compra già: dopo un solo rialzo RSI centrato e OBV normalizzato valgono 1,00 (sezione 3.2, avvio); togliendo uno dei due, il giorno 2 diventa `hold`. Che cosa fare durante l'avvio è una scelta di R4.
- **Discesa (giorni 11-15):** le distanze diventano negative, il contributo della distanza dal massimo arriva a -1,08 il giorno 14, e il punteggio va sotto -2 dal giorno 12. Il giorno 11 il volume alto (+0,52) tiene il punteggio a -1,78: senza il volume la vendita arriverebbe un giorno prima (stesso effetto della guida, sezione 4.3.5).
- **Ingressi che non spostano nessuna decisione:** l'ATR normalizzato contribuisce tra -0,24 e -0,52 ogni giorno, sempre negativo, come una soglia d'acquisto un po' più alta (domanda D3); la distanza dal massimo, con questi pesi, agisce negli stessi giorni in cui gli altri ingressi bastano già.
- **Ingressi simili (domanda D2):** le due distanze, l'RSI e l'OBV normalizzato salgono e scendono quasi insieme in questo dataset; togliere uno qualsiasi di loro cambia la decisione in 3 giorni su 20 al massimo.
- **Conteggio:** 11 decisioni `buy`, 5 `hold`, 4 `sell` su 20 giorni.

### 7.6 Che cosa non si è potuto accertare

- I testi originali di Wilder [21], Appel [22], Lane [20], Granville [23] e di Chaikin non sono stati letti: le formule vengono da TA-Lib. Per il CMF non c'è una fonte primaria né una pagina di libreria letta con la formula.
- Il valore 0,94 di RiskMetrics è solo di seconda mano [24]; il testo di Working [18] non è accessibile.
- La durata del «periodo instabile iniziale» di TA-Lib non è documentata nelle pagine lette [1][2].
- N10, N17 e il volume relativo in forma logaritmica sono costruzioni senza fonte; I5 è una derivazione dell'autore.
- La soglia R² ≥ 0,90 è una scelta dell'autore; con altri parametri d'esempio i valori cambiano.
- La serie sintetica non misura la ridondanza che nasce dall'agitazione variabile né dal legame tra volume e prezzo.
- La causa della barra piatta del 2023-08-15 e del giorno mancante (14 agosto 2023).
- L'adeguatezza al contratto di strategia è sulla carta finché E2 non la prova; non è verificato che il controller chieda solo valori finiti per tutti gli indicatori esposti oltre la riga 29 del validatore.

## 8. Rischi da passare alle fasi successive

Che cosa il catalogo lascia alle ricerche e all'implementazione che seguono. Una riga per fase (le sigle sono in apertura): il rischio che il catalogo ha visto e che cosa la fase deve decidere o fare.

| Fase | Rischio | Che cosa serve |
|---|---|---|
| R3 (codifica) | scala dell'ingresso che dipende da `c`; velocità che convergono; finestra intera della distanza dal massimo (N9) | intervallo di `c`, vincolo `c_veloce > c_lenta`, trattamento dell'intero |
| R4 (decisione) | grandezze senza direzione nella somma; interazioni (volume con direzione); che cosa decidere durante l'avvio (nell'esempio della sezione 7.5 l'avvio produce un acquisto già il giorno 2) | forma d'uso dell'ATR normalizzato e del volume relativo (N16); politica di avvio |
| R5 (fitness) | nessuno specifico degli indicatori | - |
| R6 (valutazione) | prezzo di vendita alla media della giornata (sezione 2.5); avvio diverso per genoma; scelte fatte guardando i dati ENI | avvio comune escluso; dichiarazione del limite d'esecuzione; tratti di dati separati |
| E2 (implementazione) | `NaN` silenzioso (sezione 3.3); valore finito alla barra 1; prezzo di vendita | regola del salto in ogni mattone; test sulla barra di indice 1738; casi di prova dagli esempi delle schede e della sezione 7.5 |

## 9. Domande per Luca

Le stesse quattro domande di «In breve», con le opzioni in una frase ciascuna. Le spiegazioni e gli esempi sono in «In breve» (sezione «Che cosa si chiede a Luca»); qui ci sono i rimandi alle sezioni dove ogni domanda nasce.

- **D1 — Elenco finale** (sezione 7.4). Quali ingressi entrano nel genoma? La scelta si registra nel blocco `## Human Verification` del ciclo.
  - (a) Gli 8 ingressi proposti, così come sono.
  - (b) Gli 8 con modifiche: quali togliere e quali riserve aggiungere (gap di apertura N15, CMF).
- **D2 — Blocco livello e tendenza** (sezione 5.5, scheda N1). Tenere quattro ingressi molto simili tra loro o ridurli a tre?
  - (a) Tenere le due distanze, l'RSI centrato e la distanza dal massimo (proposta).
  - (b) Togliere la distanza dalla EMA lenta: due numeri in meno nel genoma, la MACD non è più rappresentabile.
- **D3 — Termine senza direzione** (sezione 5.2, scheda ATR). Tenere l'ATR normalizzato nella somma?
  - (a) Sì, come ingresso diretto, l'unico che misura l'agitazione (proposta).
  - (b) No: lasciarlo a R4 come divisore o fattore di un altro ingresso, liberando un posto.
- **D4 — Distanza dal massimo** (scheda N9). Con quale memoria del picco?
  - (a) Massimo degli ultimi N giorni: con fonte, gene intero, il picco si dimentica di colpo (proposta).
  - (b) «Massimo che dimentica»: gene `c` continuo, il picco sfuma piano, nessuna fonte.

## Glossario

Le voci sono in ordine alfabetico; tra parentesi la sezione dove il termine è spiegato meglio.

- **Accumulatore.** Stato che somma un valore a ogni barra e non torna mai indietro (OBV grezzo; sezione 3.1).
- **Accumulo e distribuzione.** Nomi convenzionali di periodi con chiusure vicino ai massimi (accumulo) o ai minimi (distribuzione) e volume alto; nel catalogo solo nomi di calcoli.
- **Adimensionale.** Senza unità di misura: un rapporto, un logaritmo di rapporto, un valore tra -1 e 1 («Prima di cominciare»).
- **Algoritmo genetico.** Metodo di ricerca che imita l'evoluzione: tiene i genomi con il voto migliore, li incrocia e li muta (guida, capitolo 2).
- **Anticipazione dei dati (look-ahead).** Usare un dato non ancora disponibile il giorno della decisione (sezione 1.3).
- **Apertura, massimo, minimo, chiusura.** Primo prezzo, prezzo più alto, più basso e ultimo della giornata (sezione 1.1).
- **ATR, NATR.** Media dell'escursione vera; NATR è l'ATR diviso per la chiusura (scheda ATR).
- **Autocorrelazione di primo ordine.** Correlazione di una serie con se stessa spostata di un giorno (sezione 2.4).
- **Avvio (warm-up).** Barre iniziali in cui l'indicatore dipende ancora troppo dal valore di partenza (sezione 2.2).
- **Bande di Bollinger.** Media di N giorni con due bande a `k` deviazioni standard; %B e z dicono dove sta il prezzo tra le bande (scheda).
- **Barra.** Un giorno di borsa riassunto in OHLCV.
- **Bias.** Costante aggiunta alla somma pesata; con due soglie è ridondante.
- **Causale.** Che usa solo dati già noti il giorno della decisione.
- **CLV.** Posizione della chiusura nella giornata, da -1 (sul minimo) a +1 (sul massimo) (scheda N14).
- **CMF.** Flusso di denaro di Chaikin: CLV pesato con il volume, su N giorni (scheda).
- **Coda monotona.** Struttura che tiene solo i valori che possono ancora diventare il massimo (o il minimo) di una finestra.
- **Combinazione lineare esatta.** Un ingresso che è esattamente una somma pesata di altri ingressi; non si ammette (regola Q2, sezione 7.1).
- **Consilium.** Il simulatore di trading da cui viene il genoma attuale; il suo codice è in `src/vendor/consilium/`.
- **Correlazione (ρ).** Numero tra -1 e 1 che dice quanto due serie si muovono insieme («Prima di cominciare»).
- **Deviazione standard.** Misura della dispersione dei valori attorno alla loro media.
- **Distanza logaritmica.** `ln(prezzo / media)`: positiva se il prezzo sta sopra la media, negativa se sotto (scheda N1).
- **EMA, EMA0.** Media mobile esponenziale; EMA0 è la stessa media avviata da zero, usata nei rapporti di due medie (sezioni «Prima di cominciare» e 3.2).
- **Escursione vera (TR).** Il maggiore tra massimo meno minimo e le distanze di massimo e minimo dalla chiusura di ieri.
- **Età media.** `(1 - c) / c`: età media dei dati dentro una EMA; la costante di tempo del catalogo (sezione 2.2).
- **Filtro IIR.** Nome che il codice di Consilium dà alle sue EMA.
- **Finestra.** Gli ultimi N giorni su cui si calcola un indicatore (SMA, massimo di N giorni).
- **Flusso di denaro.** Posizione della chiusura nella giornata moltiplicata per il volume (CMF).
- **Gap.** Salto tra la chiusura di ieri e l'apertura di oggi.
- **Gene.** Un numero del genoma che l'algoritmo genetico fa evolvere: un peso, una soglia, un parametro di un indicatore.
- **Genoma.** L'insieme dei numeri che descrivono una strategia: qui pesi, soglie e parametri degli indicatori (capitolo 6).
- **Identità (I1-I5).** Uguaglianza esatta tra due indicatori, che vale per costruzione delle formule (sezione 5.5).
- **Incrocio e mutazione.** Le due operazioni dell'algoritmo genetico: mescolare due genomi, cambiarne a caso qualche numero.
- **Indicatore.** Numero calcolato dai prezzi e dai volumi passati per riassumerne l'andamento.
- **Ingresso.** Termine della somma pesata del punteggio.
- **Ipercomprato, ipervenduto.** Letture convenzionali di un oscillatore molto alto o molto basso; non sono previsioni.
- **Lacuna (L1-L4).** Informazione che i quattro filtri attuali non possono produrre (sezione 4.0).
- **Logaritmo naturale (ln).** Funzione che trasforma rapporti in differenze; `ln(1,01)` = 0,00995.
- **MACD.** Differenza tra una EMA veloce e una lenta, più la sua media («segnale») (scheda).
- **Mattone di stato.** Uno dei cinque tipi di stato con cui sono costruiti gli indicatori (sezione 3.1).
- **Media di Wilder.** EMA con `c = 1/N`.
- **Momentum (slancio).** Variazione del prezzo in N giorni (ROC).
- **Normalizzatore.** Indicatore usato solo per dividere un altro ingresso, non come termine della somma (sezione 7.1).
- **OBV, OBV normalizzato.** Somma del volume con il segno della variazione del giorno; la forma normalizzata è un rapporto tra -1 e 1 (schede OBV e N17).
- **OHLCV.** Apertura, massimo, minimo, chiusura, volume.
- **Oscillatore.** Indicatore con valori in un intervallo fisso (RSI, stocastico).
- **Parametro.** Numero che regola un indicatore (il `c` di una EMA, la finestra N); se evolve è un gene.
- **Passeggiata aleatoria.** Serie in cui ogni passo è casuale e indipendente dai precedenti.
- **Peso.** Il numero che moltiplica un ingresso nel punteggio: dice quanto conta e in che verso.
- **Punteggio.** La somma pesata degli ingressi, confrontata con le soglie («Prima di cominciare»).
- **R².** Quota delle variazioni di un ingresso ricostruibile con una somma pesata di altri («Prima di cominciare»).
- **Rendimento logaritmico.** `ln(C[t] / C[t-1])`.
- **Replay.** La simulazione giorno per giorno di una strategia sui dati storici (sezione 1.3).
- **Ridondante.** Che si ricostruisce quasi del tutto dagli altri ingressi (R² ≥ 0,90 per la regola del catalogo, sezione 5.5).
- **ROC.** Variazione logaritmica del prezzo in N giorni (scheda).
- **RSI, RSI centrato.** Confronto tra le medie dei rialzi e dei ribassi recenti; la forma centrata va da -1 a +1 (scheda).
- **Saturazione.** Quando un indicatore limitato resta fermo al suo estremo (per esempio RSI centrato = 1 in una salita senza pause) e non distingue più casi diversi.
- **Seme.** Numero che rende ripetibile una sequenza pseudo-casuale.
- **Serie sintetica.** Prezzi e volumi generati a caso apposta, senza nessuna struttura (sezione 5.5).
- **SMA.** Media mobile semplice degli ultimi N giorni.
- **Snapshot ENI.** Il file dei dati giornalieri di ENI dal 2016 al 2026 usato dal PoC (`src/data/eni-ohlcv.json`, 2517 barre).
- **Soglia.** Valore con cui si confronta il punteggio: sopra la soglia alta `buy`, sotto la bassa `sell`.
- **Somma corrente.** Somma degli ultimi N valori aggiornata aggiungendo il nuovo e togliendo il vecchio (sezione 3.1).
- **Stocastico.** Posizione della chiusura tra il minimo e il massimo degli ultimi N giorni (scheda).
- **Stop loss, take profit.** Chiusure automatiche di una posizione sotto o sopra una soglia di prezzo.
- **TA-Lib.** Libreria diffusa di analisi tecnica, la cui documentazione è la fonte principale delle formule del catalogo.
- **Valore neutro.** Il valore che un indicatore espone prima di avere abbastanza storia: 0 per le forme centrate (sezione 3.2).
- **Volatilità.** Quanto si muove di solito il prezzo da un giorno all'altro.
- **Volume.** Numero di azioni scambiate in un giorno.
- **z-score.** Distanza divisa per una misura di dispersione: «quante giornate tipiche».

## Riferimenti

Stato: **letta** = pagina aperta e letta per l'affermazione citata (allo Step 4, la fase di esplorazione del ciclo 011, e, dove indicato, ricontrollata allo Step 5, la fase di critica); **scheda** = vista solo la scheda bibliografica o l'abstract; **non verificata** = trovata solo in fonti secondarie. Il 2026-10-18 tutti gli URL sotto hanno risposto con codice 200; il Builder ha riletto le pagine [1], [2], [7], [9], [10], [17] e [19] per i periodi predefiniti e, per [10], la formula.

1. TA-Lib, *ATR — Average True Range*. https://ta-lib.org/functions/atr.html. Letta (Step 4, ricontrollata Step 5): escursione vera, avvio con media dei primi N, ricorsione di Wilder.
2. TA-Lib, *EMA — Exponential Moving Average*. https://ta-lib.org/functions/ema.html. Letta (Step 4 e 5): `k = 2/(period+1)`, avvio con la media dei primi N.
3. TA-Lib, *ADX — Average Directional Movement Index*. https://ta-lib.org/functions/adx.html. Letta (Step 4).
4. TA-Lib, *LINEARREG_SLOPE*. https://ta-lib.org/functions/linearreg_slope.html. Letta (Step 4 e 5).
5. TA-Lib, *NATR — Normalized Average True Range*. https://ta-lib.org/functions/natr.html. Letta (Step 4): `NATR = ATR / Close * 100`.
6. TA-Lib, *ER — Kaufman Efficiency Ratio* e *KAMA*. https://ta-lib.org/functions/er.html e https://ta-lib.org/functions/kama.html. Lette (Step 4); i libri di Kaufman citati dalla pagina non sono stati letti.
7. TA-Lib, *STOCH*. https://ta-lib.org/functions/stoch.html. Letta (Step 4 e 5; riletta il 2026-10-18 per 5, 3, 3 e la lisciatura di %K); la pagina non cita Lane.
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
19. TA-Lib, *MACD*. https://ta-lib.org/functions/macd.html. Letta (Step 4; riletta il 2026-10-18): EMA veloce 12, lenta 26, lisciatura del segnale 9; cita G. Appel, *Stock Market Trading Systems*, Traders Press.
20. G. C. Lane, «Lane's Stochastics», *Technical Analysis of Stocks & Commodities* 2(3), 87-90, 1984. Solo scheda.
21. J. W. Wilder Jr., *New Concepts in Technical Trading Systems*, Trend Research, 1978. Solo scheda.
22. G. Appel, *Technical Analysis: Power Tools for Active Investors*, FT Press, 2005. Solo scheda (TA-Lib cita un altro libro dello stesso autore, [19]).
23. J. E. Granville, *Granville's New Strategy of Daily Stock Market Timing for Maximum Profit*, Simon & Schuster. Solo come riferimento della pagina [10].
24. J.P. Morgan/Reuters, *RiskMetrics — Technical Document*, 4ª ed., 1996. Non verificata (solo fonti secondarie per il valore 0,94).

**Codice citato** (letto il 2026-10-18, righe ricontrollate il 2026-10-19): `src/vendor/consilium/algorithm.js` (righe 20-62, 345-348, 369-384), `stockStream.js` (32-34), `trader.js` (97, 153), `portfolio.js` (63, 71, 215, 291, 298), `life.js` (622-623, 646-650), `src/engine/strategy.js` (40-60), `genome.js` (14-17, 86), `fitnessValidator.js` (29, 57-58), `simulationController.js` (43, 90-94); `src/data/eni-ohlcv.json` in sola lettura.
