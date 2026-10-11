---
title: "Rassegna delle forme di genoma"
layout: doc
last_verified: 2026-10-11
---

# Rassegna delle forme di genoma

last_verified: 2026-10-11

Rassegna di ricerca del ciclo 010 (issue R1, epica "genoma non basato su macchina a stati"). È in italiano, come richiesto dall'operatore; gli altri documenti di questa sezione sono in inglese.

**A chi serve.** A Luca e Simone, che devono scegliere la forma del nuovo genoma prima delle ricerche sugli indicatori (R2), sulla codifica genetica (R3), sulle equazioni di decisione (R4) e prima dell'implementazione (E2). **La scelta è di Luca**: il documento porta 1 o 2 candidati motivati, le condizioni di scarto e ciò che non si è potuto accertare.

**Cosa NON è.** Non è una promessa di redditività né un confronto di rendimenti. Le forme sono confrontate per espressività, ricercabilità (quanto bene un algoritmo genetico le esplora), interpretabilità, costo di valutazione e integrazione con il motore. Il PoC resta uno strumento di ispezione storica (vedi [Simulator overview](../simulator-overview/), sezione "Purpose").

**Come leggerlo.** Per decidere bastano il capitolo 1 e la griglia (capitolo 8); le schede (capitolo 6) contengono i fatti dietro ogni cella.

## 1. Sintesi per la decisione di Luca

I candidati sono presentati **sulle dimensioni** delle schede, mai sul rendimento atteso, e non sono una scelta. Gli **indicatori** sono numeri calcolati dai prezzi e dai volumi passati per riassumerne l'andamento (per esempio una media mobile); li sceglie R2. Il **sovradattamento** (overfitting) è l'adattarsi troppo ai dati di addestramento, rumore compreso, funzionando poi peggio su dati nuovi.

### 1.1 Candidato A: punteggio lineare di indicatori con soglie (base prudente)

- **Spazio di ricerca piccolo** (9 numeri con 6 ingressi di esempio, contro i 43 pesi di una rete di esempio o la struttura variabile di GP e rule list): meno capacità di adattarsi al rumore su 2517 barre e un solo titolo [4], [ipotesi].
- **Interpretabilità diretta**, **crossover e mutazione naturali**, contratto con adattamento minimo (tre fasce del punteggio come etichette) e **memoria a monte**, senza stato da azzerare. L'istanza con osservatore di Kalman aggiunge un piccolo stato continuo.
- La **forma minima** (un filtro e una soglia) serve da metro: una forma più ricca deve giustificare perché l'espressività in più non sia solo capacità di adattarsi al rumore [ipotesi di metodo].

**Condizioni di scarto.** Si passa a B se E2 mostra che le decisioni utili richiedono **congiunzioni** tra indicatori (per esempio "prezzo sopra il filtro **e** volume sopra la media") che una somma pesata con soglia non rappresenta, o se la memoria degli indicatori di R2 non basta e serve uno stato proprio.

### 1.2 Candidato B: alberi di espressioni (GP), variante "solo indicatori"

- **Espressività universale** e **crossover naturale** sui sottoalberi [5]; è la forma con più precedenti nella scoperta evolutiva di regole di trading [6], [7] (il primo letto solo come riassunto).
- **Interpretabilità con calcolo**: un albero piccolo è una formula leggibile, più di una rete.
- Copre ciò che A non rappresenta (congiunzioni, soglie condizionate) e può esprimere come caso particolare una rule list e un punteggio lineare [ipotesi]. Contratto con adattamento (etichette dalle fasce dell'uscita).

**Condizioni di scarto.** Si passa ad A o alla rule list se, in E2, la dimensione degli alberi cresce senza miglioramento (bloat) [5], se gli alberi evoluti non sono più leggibili, o se il divario tra fitness di addestramento e di valutazione cresce con la dimensione dell'albero.

**Memoria (domanda 2).** Per B "solo indicatori" è la base (`reset()` banale, programma puro); "con memoria interna" è nel capitolo 6.2. Non si sceglie: se Luca ammette registri o ricorrenze, B si estende senza cambiare candidato, al costo di interpretabilità e di maggiore vicinanza a una macchina a stati.

### 1.3 Forme di confine e di riserva

- **HMM** (6.6): la più vicina al problema che l'FSM attuale tenta di risolvere e l'unica con etichette finite per costruzione. **Forma di confine**: ha la struttura di una macchina a stati probabilistica. Ammessa dall'operatore, non è portata come candidato perché ha una dimensione in più da risolvere (stima dei parametri senza anticipazione, a cura di R6) e non si è trovata alcuna fonte sul suo uso con un GA nel trading. Ha già una scheda piena se Luca la preferisce.
- **Rule list** (6.3): versione vincolata e più leggibile del GP; riserva se B si rivela troppo libero.
- **MLP e NEAT** (6.4): espressività universale a prezzo di interpretabilità minima; non si trova un criterio per cui serva rispetto ad A e B [ipotesi].
- **Fuzzy** (6.5): molti parametri (54 con 6 ingressi) e accorgimenti nel crossover; nessun vantaggio visibile rispetto a B.

### 1.4 Ciò che non si è potuto accertare

- **Applicazione al trading** di HMM, Kalman, reti ricorrenti e reservoir con un GA: nessuna fonte letta; [12], [13] e [14] trattano regimi in economia e nei mercati.
- **Equivalenza tra filtro di Kalman a guadagno costante e livellamento esponenziale doppio**: [15] presenta i modelli ma non l'equivalenza.
- **Fonti non lette nel testo**: [6] (solo il riassunto di un corso), [7], [10], [12], [13], [16]; LCS (Urbanowicz e Moore, 2009) e CART (Breiman e altri, 1984) non verificati e non usati come prova (capitolo 10).
- **Fuzzy come approssimatore universale** e **uso di reti e fuzzy con un GA nel trading** (oltre a [11]): non verificati.
- **Capacità di adattamento al rumore per forma**: non misurata. La misurerebbe un esperimento di controllo (far evolvere ogni forma con lo stesso budget e la stessa fitness su serie senza struttura prevedibile e misurare il divario tra addestramento e valutazione), che richiede codice e calcoli su dati ed è **fuori dal perimetro di questo ciclo** (domanda 5); misurerebbe inoltre forma e fitness insieme.
- **Tutta l'adeguatezza al contratto** è sulla carta fino a E2; il contratto è provato con una sola strategia di test.

### 1.5 Domande per Luca

La domanda 1 ha già risposta: il requisito "non una macchina a stati" **non è stringente**, HMM e reti ricorrenti sono forme da valutare.

2. **Ricorrenze e registri in NEAT e GP.** Si ammettono varianti con stato ricorrente o registri, o solo varianti feedforward con la memoria negli indicatori a monte? **Ancora aperta.** Le due varianti sono descritte nei capitoli 6.2 e 6.4; è una scelta di progetto, non una proprietà della forma.
3. **Peso di interpretabilità ed espressività.** La rassegna non assegna pesi: quanto pesa l'una rispetto all'altra?
4. **Un candidato o due.** E2 parte da una forma semplice (A, con la minima come metro) e da una ricca come secondo candidato, o da due forme dello stesso livello?
5. **Esperimento di controllo.** Si vuole un ciclo futuro con l'esperimento descritto in 1.4, e a valle di quale ciclo (E2 o il protocollo di valutazione R6)?

La scelta di Luca e la sua data si registrano nel file del ciclo (`.swhouse/cycles/current-010.md`, blocco "Human Verification"), non in questo documento.

## 2. Metodo e fonti

**Cosa si confronta.** Sei forme alternative più il genoma attuale (FSM) come riferimento, con le stesse sette dimensioni del capitolo 5. Il requisito iniziale dell'operatore (memoria da indicatori già qualificati, non da una macchina a stati) è stato poi precisato come **non stringente**: il documento segnala la vicinanza a una macchina a stati dove c'è e non dichiara mai che una forma "rispetta" o "viola" il requisito.

**Cosa non decide la forma.** I parametri di rischio del `Trader` e la fitness (R5) sono **comuni a tutte le forme**. I parametri sono `buyPercent` (quota di capitale investita a ogni acquisto), `stopLossPercent` (soglia di perdita oltre la quale la posizione si chiude da sola: stop loss) e `takeProfitPercent` (soglia di guadagno che la chiude: take profit). La relazione di Consilium sui propri esperimenti [18] attribuisce a parametri di rischio degeneri e alla fitness basata sul rendimento annuo composto (CAGR) una causa ricorrente dei risultati deludenti, senza separare il peso della forma da quello della fitness. Quegli esperimenti confrontano le strategie evolute anche con il buy&hold (comprare all'inizio e tenere fino alla fine) su titoli e panieri diversi da ENI, con finestre di addestramento da 2 a 5 anni e una sola fitness: i loro esiti non si trasferiscono alle forme qui descritte.

**Come si cita.** Ogni affermazione non banale termina con un numero tra parentesi quadre (capitolo 10), con un percorso di codice, oppure con **[ipotesi]**: giudizio dell'autore senza fonte letta (**[ipotesi, fonte da verificare]** se la fonte è nota ma non letta). Non sono ammessi come prova materiale commerciale o promozionale né backtest (prove di una strategia sui dati storici) non riproducibili.

**Dati e anticipazione.** I dati sono l'istantanea giornaliera di ENI in formato OHLCV (per ogni giorno, detto barra: prezzo di apertura, massimo, minimo, chiusura e volume scambiato): 2517 barre dal 2016-09-29 al 2026-09-28 su un solo titolo (`src/data/eni-ohlcv.json`). Per ogni barra l'ordine è: aggiornare gli indicatori, far eseguire al `Trader` l'ordine impostato alla barra precedente (all'apertura), poi decidere l'ordine per la barra successiva (`src/engine/strategy.js`, `feed`; `.swhouse/memory/knowledge/consilium-trader-order-timing.md`). Non c'è quindi anticipazione dei dati (look-ahead bias: la decisione usa informazione non ancora disponibile) per costruzione; può nascere solo dalla **stima dei parametri** su dati futuri (caso HMM) o dalla fitness.

**Ingressi di esempio.** Gli indicatori sono materia di R2, che sostituirà questi: come esempio si usano i sei valori che il genoma attuale ha già, cioè prezzo e volume del giorno e quattro filtri IIR (due sul prezzo, due sul volume) (`src/vendor/consilium/algorithm.js`, righe 365-384). **n = 6** è il numero di ingressi negli esempi.

**Notazione.** Matematica intermedia, senza dimostrazioni; simboli definiti alla prima comparsa, termini di finanza alla prima occorrenza e nel glossario (capitolo 11). Il sito non include MathJax o KaTeX (`_layouts/doc.html`): le formule sono in blocchi di codice, dove `x[t]` è il valore alla barra `t` e `*` il prodotto. I pochi calcoli numerici sono esempi dichiarati come tali.

## 3. Cornice: memoria e lettura

Una strategia decide ogni giorno una tra tre azioni: comprare (`buy`), vendere (`sell`), non fare nulla (`hold`). Per decidere serve **memoria del passato**: un solo prezzo non dice se il titolo sale o scende. La rassegna distingue la **memoria** (da dove la decisione di oggi riceve informazione sulla storia) dalla **lettura** (la regola che da quell'informazione produce l'azione).

### 3.1 Il filtro IIR del genoma attuale

I quattro indicatori dell'FSM attuale sono filtri ricorsivi del primo ordine (IIR: ogni valore dipende da tutti i precedenti attraverso il valore appena calcolato). Il codice è:

```
ema = ema * (1 - c) + x * c            (src/vendor/consilium/algorithm.js, righe 369-372)
```

In forma equivalente, con `y[t]` il valore del filtro alla barra `t`, `x[t]` il dato nuovo (prezzo o volume) e `c` il coefficiente del genoma, 0 < c < 1 (`src/engine/genome.js`, `createConsiliumGenome`, righe 78-88):

```
y[t] = y[t-1] + c * ( x[t] - y[t-1] )
```

**`c` è il peso del dato nuovo, non del passato.** Un `c` vicino a 1 fa seguire il dato da vicino (poca memoria); un `c` vicino a 0 lo rende lento (molta memoria). La durata tipica della memoria è circa 1/c barre. Lo stato iniziale è il primo dato (`algorithm.js`, righe 342-348).

**Esempio numerico (dichiarato come tale).** Il filtro parte da y = 100, il dato passa di colpo a x = 110 e resta lì. Con i coefficienti del genoma fisso (`FIXED_GENOME`, `src/engine/genome.js`, righe 13-17) il valore dopo 1, 2 e 8 barre è:

| Filtro | c | 1/c (barre) | dopo 1 | dopo 2 | dopo 8 |
|---|---|---|---|---|---|
| prezzo 2 | 0,990 | 1,0 | 109,90 | 110,00 | 110,00 |
| prezzo 1 | 0,731 | 1,4 | 107,31 | 109,27 | 110,00 |
| volume 2 | 0,396 | 2,5 | 103,96 | 106,35 | 109,82 |
| volume 1 | 0,118 | 8,5 | 101,18 | 102,21 | 106,33 |

Calcolato con la formula sopra (script di una riga, numeri arrotondati). Nel genoma fisso `prezzo 2` ha praticamente **nessuna memoria**: è una lettura dei numeri del genoma fisso, non una proprietà della forma.

### 3.2 Memoria a monte e memoria nel lettore

La memoria di un indicatore tecnico è una **funzione causale della storia** (usa solo dati fino alla barra corrente); la sua durata è il numero di barre della finestra o la costante di tempo. Medie semplici ed esponenziali e loro differenze sono **filtri lineari**; **non tutti gli indicatori lo sono** (per esempio massimo e minimo su N barre sono non lineari). L'uso di medie mobili e di massimi e minimi nelle regole trovate da un algoritmo genetico è in [6] (solo riassunto). Le forme si dividono in due classi, riprese nella colonna "memoria" della griglia:

- **Memoria a monte (feedforward).** Gli indicatori sono calcolati prima; la forma legge i numeri della sola barra corrente e non ha stato proprio (punteggio lineare, albero, rule list, rete senza ricorrenze).
- **Memoria nel lettore.** La forma ha uno **stato proprio** aggiornato a ogni barra (stato discreto dell'FSM, credenza dell'HMM, filtro di Kalman, nodi ricorrenti, registri di un programma).

La cornice non isola l'effetto della forma: forme diverse hanno genotipi di dimensione diversa, quindi diversa capacità di adattarsi al rumore, e fitness e parametri del `Trader` restano comuni e non separati (capitolo 1.4).

## 4. Riferimento: il genoma FSM attuale

Il genoma attuale è una macchina a stati (FSM, finite state machine): nove stati su una griglia 3x3 (`GENOME_STATES`: NW, N, NE, W, C, E, SW, S, SE; `src/engine/genome.js`, riga 4). Ogni stato ha fino a quattro transizioni uscenti, ciascuna una lista di identificatori di condizione da 0 a 13; scatta la prima, in ordine fisso, le cui condizioni sono **tutte** vere (`algorithm.js`, righe 135-193). Le condizioni sono confronti tra il prezzo del giorno (media di apertura, massimo, minimo e chiusura: `src/vendor/consilium/stockStream.js`, righe 32-34) e i filtri di prezzo spostati di un margine, tra i due filtri, e lo stesso per il volume; la 0 e la 1 sono "sempre falsa" e "sempre vera" (`algorithm.js`, righe 20-61). Nel genoma fisso solo lo stato SW ha un'azione, `buy` (`genome.js`, riga 32); le uscite avvengono per stop loss o take profit del `Trader` (`.swhouse/memory/knowledge/consilium-trader-order-timing.md`).

**Margini.** Il margine è proporzionale al filtro, non al prezzo: `marginAbs = ema * marginPercent` (`algorithm.js`, riga 381), con i valori percentuali del genoma divisi per 100 (`genome.js`, `toFraction`). Uno dei due margini sul prezzo del genoma fisso è negativo (-1,10 per cento).

| Dimensione | Fatto (grandezza osservabile) | Livello | Fonte |
|---|---|---|---|
| Espressività | AND di confronti tra ingressi e filtri; l'azione dipende anche dallo stato | a tratti | `algorithm.js` 135-193 |
| Spazio di ricerca | 11 numeri continui (4 coefficienti IIR, `buyPercent`, 2 margini prezzo, 2 margini volume, stop loss, take profit) più struttura discreta variabile: nel genoma fisso 36 transizioni con 135 identificatori (conteggio eseguito su `FIXED_GENOME` il 2026-10-11) | grande | `genome.js` 13-39, 92-102 |
| Interpretabilità | Il grafo si legge, ma lo stato alla barra `t` richiede di seguire la storia delle transizioni | con calcolo | [ipotesi] |
| Costo di valutazione | 4 filtri (circa 12 operazioni) più al massimo 4 transizioni con 3-4 condizioni in media | decine | `algorithm.js` 365-384, [ipotesi] sul conteggio |
| Crossover e mutazione | Crossover uniforme per parametro e scambio di stati interi; mutazione di parametri e stati | naturale | `src/vendor/consilium/individual.js` 191, 350-380 |
| Contratto | Soddisfatto (è il riferimento): `labels` = 9 stati, `describe()` espone i 4 filtri, `serialize()` il genoma JSON | diretto | `src/engine/fsmStrategy.js` |
| Memoria | Stato discreto nel genoma, più i filtri IIR; ricorrenza interna: sì | stato discreto | `algorithm.js` 342-358, 399-403 |

**Rischi.** Anticipazione: no per costruzione (capitolo 2). Soluzioni degeneri: transizioni irraggiungibili o stati senza uscita; le condizioni 0 e 1 rendono una transizione sempre o mai attiva (`algorithm.js` 20-25). Sfruttamento della fitness: comune a tutte le forme (capitolo 2).

## 5. Scala di confronto, definita prima di compilare

Per ciascuna dimensione si fissa **prima** una grandezza osservabile con soglie, e la griglia riporta il livello con il nome definito qui. I fatti stanno nelle grandezze; **l'assegnazione del livello è un giudizio dell'autore**. Non c'è punteggio totale né peso: i pesi sarebbero una scelta di valore, che spetta a Luca (domanda 3).

| Dimensione | Grandezza osservabile | Livelli (nome: significato) |
|---|---|---|
| 1. Espressività | Classe delle decisioni rappresentabili dagli ingressi della barra (e dallo stato, se c'è) | **affine**: soglia su una combinazione lineare degli ingressi. **a tratti**: regioni delimitate da soglie, con decisione semplice in ciascuna. **universale**: approssima funzioni continue qualsiasi, con dimensione sufficiente |
| 2. Spazio di ricerca | Numero e tipo dei parametri, con n = 6 | **piccolo**: al più 10 numeri continui, dimensione fissa. **medio**: da 11 a circa 100 numeri, dimensione fissa, o struttura discreta limitata. **grande**: struttura variabile o più di circa 100 numeri |
| 3. Interpretabilità | Che cosa serve per capire una decisione dal genoma | **diretta**: ogni elemento ha un significato locale (somma, prima regola che scatta). **con calcolo**: serve valutare una composizione (albero, regole aggregate, ricorsione di uno stato). **solo simulando**: significato distribuito (pesi di rete, stato vettoriale) |
| 4. Costo di valutazione | Operazioni aritmetiche per barra, con i parametri di esempio | **decine** (meno di 100). **centinaia** (100-1000). **migliaia o più** (oltre 1000) |
| 5. Crossover e mutazione | Esistenza di un operatore che scambia parti con significato | **naturale**: lo scambio produce figli sensati. **con accorgimenti**: serve riparazione, normalizzazione o ordinamento. **solo mutazione**: il crossover è problematico |
| 6. Contratto | Membri richiesti da `assertStrategy` e `StrategyIndividual` (capitolo 7) | **diretto**: tutti senza trasformazioni. **con adattamento**: almeno un membro richiede una trasformazione descritta. **non soddisfatto**: un membro non è ottenibile |
| 7. Origine della memoria | Dove vive l'informazione sul passato (capitolo 3.2), più la ricorrenza interna | **a monte** (feedforward; vi rientrano i ritardi in ingresso, cioè valori passati degli indicatori dati come ingressi). **stato discreto** nel genoma. **stato continuo nel lettore**. Ricorrenza interna: sì, no, opzionale |

La griglia ha una colonna in più, **vincoli duri**, con l'esito sintetico del contratto (capitolo 7). Non elimina nessuna forma: l'eliminazione, se c'è, è nella sintesi, motivata e visibile a Luca.

## 6. Le schede

Ogni scheda ha lo stesso ordine: definizione con formula, sette dimensioni (fatto, livello, fonte), rischi con tre voci fisse (anticipazione dei dati, soluzioni degeneri, sfruttamento della fitness) e genotipo di massima (senza operatori né equazioni: sono di R3 e R4). Per GP e reti le **due varianti** "solo indicatori" e "con memoria interna" sono descritte senza scegliere (domanda 2). Le righe "Contratto" sono dettagliate nel capitolo 7.

### 6.1 Punteggio lineare di indicatori con soglie (istanze: minima, osservatore di Kalman, generale)

**Definizione.** Un punteggio `s[t]` è una somma pesata degli ingressi alla barra `t`, e due soglie lo traducono in azione.

```
s[t] = w1*x1[t] + w2*x2[t] + ... + wn*xn[t] + b
buy  se s[t] > soglia_alta;  sell se s[t] < soglia_bassa;  altrimenti hold
```

`x1...xn` sono gli n ingressi, `w1...wn` i pesi, `b` una costante. È la forma di un classificatore lineare; nessun testo di riferimento sul tema è stato letto, quindi la descrizione è [ipotesi, fonte da verificare]. Tre istanze:

- **Minima** (metro, non candidato): un filtro e una soglia, due numeri nel genoma; per esempio posizione lunga quando il prezzo supera il suo filtro di un margine [ipotesi di metodo].
- **Con osservatore di Kalman.** Il prezzo (o il suo logaritmo) è la somma di un livello e di una pendenza non osservati più rumore; il filtro di Kalman li stima ricorsivamente [3] e la decisione si legge dalla pendenza stimata, con soglia. [3] **non** tratta né il livellamento esponenziale né i prezzi, che sono in [15] ("metodo lineare di Holt"); che con rumori costanti il filtro diventi un livellamento esponenziale doppio (tipo alfa-beta) è **[ipotesi, fonte da verificare]**.
- **Generale**: n ingressi, pesi liberi, due soglie.

| Dimensione | Fatto | Livello | Fonte |
|---|---|---|---|
| Espressività | Una soglia su un iperpiano; nessun AND tra indicatori | affine | [ipotesi] |
| Spazio di ricerca | 9 numeri con n = 6 (pesi, `b`, 2 soglie); minima: 2; Kalman: pochi | piccolo | [ipotesi] |
| Interpretabilità | Segno e peso dicono il contributo; la somma si calcola a mano | diretta | [ipotesi] |
| Costo di valutazione | 6 prodotti, 6 somme, 2 confronti | decine | [ipotesi] |
| Crossover e mutazione | Mutazione gaussiana e crossover aritmetico standard; ingressi da normalizzare | naturale | [ipotesi] |
| Contratto | `labels`: tre fasce del punteggio | con adattamento | `src/engine/strategy.js` 12-33; capitolo 7 |
| Memoria | A monte; ricorrenza: no. Kalman: stato continuo (livello, pendenza); ricorrenza: sì | a monte; Kalman: stato continuo | [3] per Kalman; [ipotesi] |

**Rischi.** Anticipazione: no; per Kalman nessuna stima globale se i rumori sono parametri del genoma. Soluzioni degeneri: soglie che non scattano mai, ingressi di scala grande che prevalgono. Sfruttamento della fitness: pochi parametri limitano la capacità di adattarsi al rumore ma non la eliminano [4]. Kalman è ottimo con rumori gaussiani; le serie giornaliere hanno code pesanti [ipotesi]. **Genotipo:** vettore di numeri reali (pesi, soglie, eventuali parametri di Kalman).

### 6.2 Alberi di espressioni e programmazione genetica (GP)

**Definizione.** Un programma è un albero: i nodi interni sono operazioni (`+`, `-`, `*`, divisione protetta, confronti, `if`), le foglie sono ingressi o costanti; valutato sugli ingressi dà un numero, da cui si ricavano le tre azioni con soglie [5]. Un precedente classico per il trading cerca con un algoritmo genetico **combinazioni logiche di regole semplici** su medie mobili e su massimi e minimi di prezzi passati [6]; il riassunto letto riporta che, nelle condizioni di quello studio, dopo i costi di transazione le regole trovate non hanno dato rendimento in eccesso rispetto al riferimento di mercato (nessuna cifra qui). Una rassegna sistematica [7] osserva una forte concentrazione di studi su GA e GP per le regole di trading azionario (letto l'abstract).

**Varianti di rappresentazione** [5]: albero (default); **GP lineare**, sequenza di istruzioni che leggono e scrivono registri (sez. 7.1 di [5]); **GP cartesiano (CGP)**, genoma di interi a lunghezza fissa che codifica un grafo, tradizionalmente evoluto per sola mutazione (sez. 7.2.3 di [5]).

**Due varianti per la memoria (Luca non ha ancora deciso).**

| | "Solo indicatori" | "Con memoria interna" |
|---|---|---|
| Che cos'è | Le foglie sono solo indicatori calcolati a monte; nessun registro persistente | Registri che mantengono il valore alla barra successiva (GP lineare [5], o albero con foglie che leggono l'uscita precedente) |
| Pro | Programma puro (stesso input, stesso output); `reset()` banale; più facile da leggere e testare | Può costruire una memoria non prevista dagli indicatori (contatori, flag "già in posizione") |
| Contro | La memoria è limitata a quella degli indicatori di R2 | `reset()` deve azzerare i registri; interpretabilità più bassa (si avvicina a una macchina a stati); una mutazione si propaga nel tempo |
| Memoria | A monte; ricorrenza: no | Stato continuo nel lettore (registri); ricorrenza: sì |

"Solo indicatori" è una **scelta di progetto**, non una proprietà della forma: GP e CGP ammettono entrambe le varianti [5]. La griglia ha una riga per ciascuna.

| Dimensione | Fatto | Livello | Fonte |
|---|---|---|---|
| Espressività | Con aritmetica e `if`, qualsiasi funzione degli ingressi, dimensione permettendo | universale | [5], [ipotesi] |
| Spazio di ricerca | Struttura e dimensione variabili; cresce senza limiti se non controllata (bloat) | grande | [5] sez. 11.3 |
| Interpretabilità | Un albero piccolo si legge come una formula; uno grande no | con calcolo | [ipotesi] |
| Costo di valutazione | Proporzionale ai nodi: con 10-100 nodi, decine o centinaia di operazioni | decine o centinaia | [ipotesi] |
| Crossover e mutazione | Albero: crossover di sottoalberi standard; GP lineare: tra segmenti; CGP: di norma solo mutazione | naturale (albero), solo mutazione (CGP) | [5] |
| Contratto | `labels` da fasce dell'uscita | con adattamento | capitolo 7 |
| Memoria | Vedi le due varianti | a monte / stato continuo | [5] |

**Rischi.** Anticipazione: no. Soluzioni degeneri: programmi che non leggono nessun ingresso, divisioni per zero, bloat [5]. Sfruttamento della fitness: struttura variabile significa capacità di adattamento più alta delle forme a pochi parametri [ipotesi]; con 2517 barre su un titolo il rischio è rilevante, e Bailey e coautori sostengono che la validazione su dati tenuti fuori da sola non basta quando si prova più di una configurazione [4]; come limitarlo spetta a R5 e R6. **Genotipo:** albero (o sequenza, o vettore di interi) con insiemi di funzioni e terminali fissati.

### 6.3 Rule list (lista di regole)

**Definizione.** Una lista ordinata di coppie condizione-azione: per ogni barra si applica l'azione della **prima** regola la cui condizione è vera; l'ultima è sempre vera (default). In letteratura è una "decision list" [8].

```
se  (close_filter_1 > close_filter_2 + m1)  e  (volume > volume_filter_1)  allora buy
altrimenti se  (close_filter_1 < close_filter_2 - m2)                      allora sell
altrimenti                                                                   hold
```

Esempio di forma, non di regola proposta. I **learning classifier system** (LCS) evolvono una popolazione di regole; lo stile "Michigan" (un individuo è una regola) si distingue da quello "Pittsburgh" (un individuo è un insieme di regole) [ipotesi, fonte da verificare: Urbanowicz e Moore, 2009, non letta]. Una rule list è **simile, non identica** a un insieme Pittsburgh (ha un ordine e un default) [ipotesi, fonte da verificare]. Gli LCS non sono portati a scheda: nello stile Michigan l'individuo del GA sarebbe l'intera popolazione di regole, in tensione con l'ipotesi "un genoma = una strategia" del contratto.

| Dimensione | Fatto | Livello | Fonte |
|---|---|---|---|
| Espressività | Regioni a tratti delimitate da confronti; ogni regola è una congiunzione | a tratti | [8] |
| Spazio di ricerca | Lunghezza della lista e struttura di ogni regola variabili; margini continui | grande | [ipotesi] |
| Interpretabilità | Si legge dall'alto in basso senza calcolo, finché la lista è corta | diretta | [8], [ipotesi] sulla lunghezza |
| Costo di valutazione | Una condizione per regola per barra: decine di confronti | decine | [ipotesi] |
| Crossover e mutazione | Scambiare regole cambia la precedenza (l'ordine conta); mutare i margini è semplice | con accorgimenti | [ipotesi] |
| Contratto | `labels`: l'azione o l'indice della regola scattata | con adattamento (diretto se l'etichetta è l'azione) | capitolo 7 |
| Memoria | A monte; ricorrenza: no (regole che leggono un'uscita precedente sono fuori da [8]) | a monte | [8] |

**Rischi.** Anticipazione: no. Soluzioni degeneri: regole irraggiungibili perché oscurate da una precedente (ombreggiamento); default dominante. Sfruttamento della fitness: lista lunga significa alta capacità di adattamento [ipotesi]; R5 e R6 decidono come limitarla. **Genotipo:** lista di regole, ciascuna con condizioni (indicatore, operatore, margine) e un'azione.

### 6.4 Rete neurale piccola: MLP e NEAT (una scheda, due sottoparagrafi)

**Definizione.** Una rete calcola l'uscita come composizione di somme pesate e funzioni di attivazione (funzioni non lineari come la tangente iperbolica).

```
h = tanh( W1 * x + b1 )         (strato nascosto: vettore h)
y = W2 * h + b2                 (uscita: un punteggio, oppure tre punteggi)
```

`x` è il vettore degli n ingressi, `W1` e `W2` matrici di pesi, `b1` e `b2` vettori di costanti. Con n = 6, 4 neuroni nascosti e 3 uscite i pesi sono 6*4 + 4 + 4*3 + 3 = 43. Un perceptron multistrato (MLP) con almeno uno strato nascosto e attivazione a "schiacciamento" è un approssimatore universale di funzioni, dimensione dello strato permettendo [9]. **NEAT** (NeuroEvolution of Augmenting Topologies) evolve insieme topologia e pesi con tre idee: marcatori storici per allineare reti diverse nel crossover, speciazione per proteggere le novità, crescita incrementale da reti minime [1]. NEAT consente connessioni ricorrenti e [1] dichiara che con esse la memoria è facilmente rappresentata.

**Due varianti (Luca non ha ancora deciso).**

| | "Solo indicatori" (feedforward) | "Con memoria interna" (ricorrente) |
|---|---|---|
| MLP | Rete senza connessioni all'indietro | Rete di Elman o simile, con uno strato che rilegge la propria uscita: scelta di progetto aggiuntiva [ipotesi] |
| NEAT | Solo topologia feedforward (si vieta la ricorrenza) | Ricorrenza permessa, come nel metodo originale [1] |
| Pro | Stesso input stesso output, `reset()` banale | Memoria propria: può rappresentare dipendenze che gli indicatori non catturano [1] |
| Contro | La memoria è limitata a quella degli indicatori | Interpretabilità molto bassa; stato da azzerare in `reset()`; dinamiche instabili possibili [ipotesi]; vicinanza a una macchina a stati con stati continui |
| Memoria | A monte; ricorrenza: no | Stato continuo nel lettore; ricorrenza: sì |

| Dimensione | Fatto | Livello | Fonte |
|---|---|---|---|
| Espressività | Approssimatore universale (MLP con almeno uno strato nascosto) | universale | [9] |
| Spazio di ricerca | MLP di esempio: 43 pesi, dimensione fissa. NEAT: topologia e pesi, dimensione variabile | MLP medio; NEAT grande | [1] per NEAT; conteggio dell'autore per MLP |
| Interpretabilità | Il significato dei pesi è distribuito: si capisce simulando, non leggendo | solo simulando | [ipotesi] |
| Costo di valutazione | MLP di esempio: circa 43 prodotti-somme più 7 attivazioni | decine | calcolo dell'autore (esempio) |
| Crossover e mutazione | Il crossover ingenuo è sensibile alla permutazione dei neuroni ("competing conventions": due reti equivalenti con neuroni in ordine diverso danno figli peggiori); NEAT la gestisce con i marcatori storici | MLP con accorgimenti; NEAT con accorgimenti previsti | [1] |
| Contratto | `labels`: tre fasce dell'uscita | con adattamento | capitolo 7 |
| Memoria | Vedi la tabella delle varianti | a monte / stato continuo | [1] |

**Rischi.** Anticipazione: no. Soluzioni degeneri: reti che saturano o con uscita costante. Sfruttamento della fitness: 43 pesi su 2517 barre e un titolo sono tanti rispetto ai 9 numeri della forma lineare [ipotesi]; vale [4]. In NEAT la crescita della topologia è controllata dal metodo [1]. **Genotipo:** pesi (MLP) o geni di nodo e di connessione con marcatore storico (NEAT).

### 6.5 Fuzzy (logica sfumata)

**Definizione.** Un insieme sfumato assegna a ogni oggetto un **grado di appartenenza** tra 0 e 1 (funzione di appartenenza), invece di un sì/no [10]. Un sistema a regole sfumate traduce gli ingressi in gradi ("prezzo alto", "volume basso"), applica regole come "se prezzo alto e volume basso allora vendi", aggrega i risultati e ne ricava un valore ("defuzzificazione") [ipotesi, fonte da verificare: [10] fonda gli insiemi, non i sistemi a regole]. Un sistema fuzzy per il trading di azioni, con funzioni di appartenenza e regole ottimizzate da un algoritmo genetico, è in [11] (lavoro di conferenza su un caso; non ne riportiamo i risultati).

| Dimensione | Fatto | Livello | Fonte |
|---|---|---|---|
| Espressività | Regole sovrapposte su regioni sfumate: decisione a tratti, continua. Che siano approssimatori universali è [ipotesi, fonte da verificare] | a tratti | [10], [ipotesi] |
| Spazio di ricerca | Per ogni ingresso, 3 funzioni triangolari da 3 numeri = 9, quindi 54 con n = 6, più la base di regole | medio o grande | conteggio dell'autore; [11] |
| Interpretabilità | Ogni regola si legge come una frase; l'uscita richiede di aggregare più regole | con calcolo | [11], [ipotesi] |
| Costo di valutazione | Tutte le funzioni di appartenenza e tutte le regole: decine fino a centinaia di operazioni | decine o centinaia | [ipotesi] |
| Crossover e mutazione | Le funzioni di appartenenza vanno tenute ordinate e nel dominio; le regole come in una rule list | con accorgimenti | [11], [ipotesi] |
| Contratto | `labels`: fasce dell'uscita | con adattamento | capitolo 7 |
| Memoria | A monte; ricorrenza: no (una retroazione dell'uscita è possibile, non standard) | a monte | [11] |

**Rischi.** Anticipazione: no. Soluzioni degeneri: funzioni di appartenenza che non coprono mai l'intervallo reale degli ingressi (regole mai attive); uscita sempre nella fascia `hold`. Sfruttamento della fitness: tanti parametri e un titolo [4], [ipotesi]. **Genotipo:** parametri delle funzioni di appartenenza più base di regole.

### 6.6 Filtro di regime con modello a stati nascosti (HMM), forma di confine

**Definizione.** Un modello a stati nascosti (HMM, hidden Markov model) suppone che il mercato sia, a ogni barra, in uno di K regimi non osservati (per esempio "salita", "laterale", "discesa") che si succedono secondo probabilità di transizione; a ogni barra si aggiorna la probabilità di trovarsi in ciascun regime, dato ciò che si è osservato. L'algoritmo "in avanti" di Rabiner [2] usa questi simboli: `a_ij` probabilità di passare dal regime `i` al `j`; `b_j(O_t)` probabilità di osservare `O_t` (qui gli indicatori della barra `t`) nel regime `j`; `alfa_t(j)` probabilità congiunta di aver visto le osservazioni fino a `t` e di essere nel regime `j`; `pi_i` probabilità iniziale del regime `i`.

```
inizializzazione:  alfa_1(i)     = pi_i * b_i(O_1)
induzione:         alfa_{t+1}(j) = [ somma su i di alfa_t(i) * a_ij ] * b_j(O_{t+1})
scaling:           si divide ogni alfa_t per la somma su tutti i regimi
```

Dopo la normalizzazione, `alfa_t` è la **distribuzione di credenza** sui regimi: K numeri che sostituiscono lo stato discreto di una macchina a stati ([2], induzione e "scaling"). Il regime più probabile (o una soglia sulla credenza) e una mappa regime-azione producono `buy`, `sell` o `hold`. Hamilton introduce in economia un modello di cambio di regime con stati discreti di Markov [12]; sui regimi nei mercati finanziari vedi [13] e [14] (non ne riportiamo i risultati).

**Vicinanza alla macchina a stati.** L'HMM ha K stati nascosti, una matrice di transizione `a_ij` e una mappa stato-azione: **ha la stessa struttura di una macchina a stati, in versione probabilistica**. Cambia che le transizioni sono calcolate dagli indicatori attraverso le probabilità `b_j`, non scelte da liste di condizioni nel genoma. Poiché il requisito non è stringente è trattato come forma normale; memoria e interpretabilità valgono però per K stati nascosti, non per zero stati.

| Dimensione | Fatto | Livello | Fonte |
|---|---|---|---|
| Espressività | Con emissioni gaussiane, decisione a tratti nello spazio degli ingressi (una regione per regime) con dinamica nel tempo | a tratti | [2], [ipotesi] sulla qualifica |
| Spazio di ricerca | K = 3, n = 6, covarianza diagonale: medie e varianze 3*6*2 = 36, transizione 3*2 = 6 (le righe sommano a 1), probabilità iniziali 2: circa 44 numeri più la mappa regime-azione | medio | conteggio dell'autore su [2] |
| Interpretabilità | I regimi hanno media e varianza leggibili; la credenza alla barra `t` richiede di eseguire la ricorsione | con calcolo | [ipotesi] |
| Costo di valutazione | K*K prodotti più K densità su n ingressi: con K = 3, n = 6, circa 70-100 operazioni | decine o centinaia | conteggio dell'autore su [2] |
| Crossover e mutazione | Permutare i regimi dà lo stesso modello con genotipo diverso: il crossover ingenuo tra HMM equivalenti è distruttivo (come le "competing conventions" [1]); le righe di `a_ij` vanno rinormalizzate; ordinare i regimi è un accorgimento [ipotesi] | con accorgimenti | [1] per l'analogia; [ipotesi] |
| Contratto | `labels` = i K regimi (la scelta più naturale tra le forme) | diretto | capitolo 7 |
| Memoria | Stato continuo nel lettore: la credenza, aggiornata a ogni barra; ricorrenza: sì | stato continuo | [2] |

**Rischi. Anticipazione nella stima dei parametri.** Il filtraggio in avanti è causale, ma l'algoritmo di Baum-Welch (stima iterativa dei parametri) e la decodifica globale (Viterbi) usano l'**intera** sequenza [2]: se i parametri sono stimati sull'intera serie e valutati sulla stessa, c'è anticipazione. Due strade, senza sceglierne una: (a) i parametri si evolvono con il GA, senza stima globale; (b) si stimano solo su dati che **precedono** la valutazione, a cura di R6. Soluzioni degeneri: regimi che collassano su uno solo o senza osservazioni. Sfruttamento della fitness: i regimi non sono osservati, quindi l'unico giudice è la fitness [ipotesi]. Che l'HMM con un GA funzioni nel trading **non è stato accertato** ([12], [13], [14] trattano regimi, non strategie evolute). **Genotipo:** parametri di emissione per regime, matrice di transizione, mappa regime-azione, eventualmente K.

## 7. Il contratto di strategia, forma per forma

Il contratto è quello di `assertStrategy` e `StrategyIndividual` (`src/engine/strategy.js`) e della sezione "Strategy contract" di [Simulator overview](../simulator-overview/#strategy-contract). La decisione di riferimento è `.swhouse/memory/decisions/2026-10-11-strategy-contract.md`, con confidenza **Medium**: provata con una sola strategia di test. **L'adeguatezza dichiarata qui è fatta sulla carta fino a E2.**

**Membri richiesti.** `kind` (stringa non vuota); `labels` (lista finita e non vuota di stringhe); `init()`, `reset()`, `feed()`, `getCAGR()`, `getPerformanceSummary()`; `describe()` che restituisce `{ label, indicators }` con numeri finiti; `serialize()` che restituisce il genoma come JSON; `decide()` che restituisce `buy`, `sell` o `hold` (`strategy.js`, righe 4-5, 12-33, 35-87). I parametri di rischio del `Trader` restano evolvibili o fissi, **comuni a ogni forma**.

**Frasi uniche per tutte le forme.**

- **`hold`** significa "non cambiare posizione": `feed` non chiama né `buy()` né `sell()` (`strategy.js`, righe 46-55). L'FSM ha `hold` implicito (uno stato senza azione); per le forme a punteggio è la fascia tra le due soglie.
- **`labels`** è una lista fissa: le forme con uscita continua (punteggio, rete, fuzzy, albero) devono derivarla, come le tre azioni o come fasce dell'uscita. La perdita è nell'etichetta, non nel numero: l'uscita continua si espone comunque in `describe().indicators`. **Richiesta di estensione del contratto** da trattare in E2: a parte l'HMM (i regimi), nessuna forma continua ha etichette "naturali".
- **`crossover` e `mutate`.** `assertStrategy` non li richiede, ma il GA di Consilium chiama `parent1.crossover(parent2)` e `child.mutate(rate)` (`src/vendor/consilium/ga.js`, righe 116-125, 345-351): per ogni forma che evolve vanno implementati (R3 ed E2).
- **Forme con stato** (HMM, NEAT ricorrente, GP con registri, Kalman): `resetIndicators()` deve riportare lo stato iniziale, come per i filtri IIR (`algorithm.js`, righe 342-358).

| Forma | `labels` | `describe()` e `serialize()` | Cosa si perde | Esito |
|---|---|---|---|---|
| FSM (riferimento) | 9 stati | 4 filtri; genoma JSON | nulla (è il riferimento) | diretto |
| Lineare | 3 fasce di `s[t]` | `s[t]`; pesi JSON | la distanza dalla soglia, se non esposta | con adattamento |
| Albero / GP | 3 fasce dell'uscita | uscita e nodi scelti; albero JSON | i valori intermedi, se non esposti | con adattamento |
| Rule list | l'azione, o l'indice della regola | condizioni valutate; lista JSON | il grado con cui una regola scatta | con adattamento (diretto con etichetta = azione) |
| MLP / NEAT | 3 fasce dell'uscita | uscite e attivazioni; pesi e topologia JSON | il significato interno degli strati | con adattamento |
| Fuzzy | 3 fasce dell'uscita | gradi di appartenenza; parametri JSON | la composizione delle regole attive | con adattamento |
| HMM | K regimi | credenza (K numeri); parametri JSON | niente di rilevante nel replay | diretto |

## 8. Griglia di confronto

Livelli assegnati nelle schede, con i nomi del capitolo 5. **Nessun punteggio totale**; l'assegnazione è un giudizio dell'autore. Dove la decisione di Luca è aperta (domanda 2) ci sono righe per entrambe le varianti di memoria. **Non c'è la riga buy&hold**: non ha un genoma, le dimensioni non hanno senso.

| Forma | Espressività | Spazio di ricerca | Interpretabilità | Costo per barra | Crossover e mutazione | Contratto (vincoli duri) | Memoria (classe; ricorrenza) |
|---|---|---|---|---|---|---|---|
| FSM (riferimento) | a tratti | grande | con calcolo | decine | naturale | diretto | stato discreto; sì |
| Lineare, minima (metro) | affine | piccolo | diretta | decine | naturale | con adattamento | a monte; no |
| Lineare, generale | affine | piccolo | diretta | decine | naturale | con adattamento | a monte; no |
| Lineare con Kalman | affine | piccolo | diretta | decine | naturale | con adattamento | stato continuo; sì |
| GP, solo indicatori | universale | grande | con calcolo | decine o centinaia | naturale (albero) | con adattamento | a monte; no |
| GP, con registri | universale | grande | con calcolo | decine o centinaia | naturale (lineare), solo mutazione (CGP) | con adattamento | stato continuo; sì |
| Rule list | a tratti | grande | diretta | decine | con accorgimenti | con adattamento | a monte; no |
| MLP, feedforward | universale | medio | solo simulando | decine | con accorgimenti | con adattamento | a monte; no |
| NEAT, feedforward | universale | grande | solo simulando | decine | con accorgimenti (previsti) | con adattamento | a monte; no |
| NEAT, ricorrente | universale | grande | solo simulando | decine | con accorgimenti (previsti) | con adattamento | stato continuo; sì |
| Fuzzy | a tratti | medio o grande | con calcolo | decine o centinaia | con accorgimenti | con adattamento | a monte; no |
| HMM | a tratti | medio | con calcolo | decine o centinaia | con accorgimenti | diretto | stato continuo; sì |

**Letture della griglia, senza pesi.** Le forme "a monte" dipendono dagli indicatori di R2 per la memoria; le altre la costruiscono nel lettore, come l'FSM attuale. Con i parametri di esempio **tutte le forme stanno tra decine e centinaia di operazioni per barra**: il costo per barra non discrimina; ciò che discrimina (dimensione massima dei programmi, stima dei parametri dell'HMM, dimensione della popolazione) è materia di R5 e R6 e non è stato misurato. Le forme con spazio piccolo e interpretabilità diretta hanno espressività minore; le universali sono "con calcolo" o "solo simulando" [ipotesi].

## 9. Famiglie e forme non portate a scheda

**Famiglia "reti".** MLP e NEAT condividono la rete; NEAT aggiunge l'evoluzione della topologia [1]. Il reservoir computing (echo state network) tiene fissa una rete ricorrente casuale e addestra solo la lettura lineare [17]: forma di contrasto, non scheda, con stato di centinaia di numeri e interpretabilità molto bassa [ipotesi]. [17] è una pagina di un gruppo di ricerca, non una rassegna con revisione.

**Famiglia "programmi".** Punteggio lineare, alberi/GP e rule list condividono i predicati (confronti tra ingressi e margini); la rule list è un albero degenere in lista ordinata [ipotesi].

**Evoluzione grammaticale (GE).** Il genoma è una stringa di interi che una grammatica traduce in un programma o in una regola [16]; cambiare la grammatica cambia la **famiglia** di forme raggiungibili senza cambiare l'algoritmo di ricerca. È un **meccanismo di codifica**, non una forma: compete a R3. Una grammatica che riproducesse un FSM ricreerebbe la forma che si vuole lasciare.

**Escluse in anticipo.** Gli alberi di decisione addestrati con algoritmo greedy (CART e simili) non usano un GA: fuori dall'epica [ipotesi]. La regressione simbolica è un'istanza del GP. L'apprendimento per rinforzo profondo esce dal contratto (genoma serializzabile a forma fissa) e dall'epica [ipotesi].

## 10. Riferimenti

Stato: **letto** = testo integrale scaricato e letto per le parti citate; **scheda** = vista solo la scheda bibliografica o l'abstract. Tutte le voci sono state verificate il **2026-10-11**; gli URL hanno risposto con codice 200 salvo dove indicato.

1. K. O. Stanley, R. Miikkulainen, *Evolving Neural Networks through Augmenting Topologies*, Evolutionary Computation 10(2), 99-127, 2002. https://www.cse.unr.edu/~sushil/class/gas/papers/NEAT.pdf. Letto per le parti citate.
2. L. R. Rabiner, *A Tutorial on Hidden Markov Models and Selected Applications in Speech Recognition*, Proceedings of the IEEE 77(2), 257-286, 1989. https://people.engr.tamu.edu/rgutier/web_courses/cpsc689_s07/rabiner1989tutorialHMM.pdf. Letto per le parti citate. Riguarda il riconoscimento del parlato, non la finanza.
3. R. E. Kalman, *A New Approach to Linear Filtering and Prediction Problems*, Journal of Basic Engineering (Trans. ASME) 82, 1960. https://www.cs.yale.edu/homes/yry/readings/general/Kalman1960.pdf. Letto per le parti citate. Non tratta livellamento esponenziale né prezzi.
4. D. H. Bailey, J. M. Borwein, M. López de Prado, Q. J. Zhu, *The Probability of Backtest Overfitting*, versione di novembre 2014 (working paper). https://carmamaths.org/jon/backtest2.pdf. Letto per la parte sul metodo "hold-out" (parte dei dati tenuta fuori dall'addestramento). Rivista e anno di pubblicazione **non confermati** dal PDF.
5. R. Poli, W. B. Langdon, N. F. McPhee, *A Field Guide to Genetic Programming*, 2008. https://faculty.washington.edu/seattle/GA-2008/FieldGuideGP.pdf. Letto per le sezioni citate.
6. F. Allen, R. Karjalainen, *Using Genetic Algorithms to Find Technical Trading Rules*, Journal of Financial Economics 51, 1999. Letto solo un **riassunto di corso**: https://www.cs.montana.edu/courses/spring2007/536/materials/Lopez/GAsInFinance.html; l'articolo non è stato letto e i dati bibliografici sono quelli del riassunto. Scheda.
7. Y. Hu, K. Liu, X. Zhang, L. Su, E. W. T. Ngai, M. Liu, *Application of evolutionary computation for rule discovery in stock algorithmic trading: A literature review*, Applied Soft Computing 36, 534-551, 2015. https://research.polyu.edu.hk/en/publications/application-of-evolutionary-computation-for-rule-discovery-in-sto. Scheda e abstract; la pagina dell'editore ha risposto 403.
8. R. L. Rivest, *Learning Decision Lists*, Machine Learning 2(3), 229-246, 1987. https://people.csail.mit.edu/rivest/pubs/Riv87b.pdf. Letto in parte (abstract e definizione).
9. K. Hornik, M. Stinchcombe, H. White, *Multilayer feedforward networks are universal approximators*, Neural Networks 2(5), 359-366, 1989. https://cognitivemedium.com/magic_paper/assets/Hornik.pdf. Letto in parte (abstract e teoremi).
10. L. A. Zadeh, *Fuzzy Sets*, Information and Control 8(3), 338-353, 1965. https://mathnet.ru/eng/fssc12. Scheda e abstract; testo integrale non raggiunto. L'URL risponde in modo intermittente (200 o 503).
11. F. M. Raimondi, S. Pennacchio, P. Via, M. Mulè, *A New Fuzzy Logic Controller for Trading on the Stock Market*, ICEIS 2007, 322-329. https://www.scitepress.org/Papers/2007/23458/23458.pdf. Letto in parte (abstract, regole, funzioni di appartenenza). Lavoro di conferenza su un caso.
12. J. D. Hamilton, *A New Approach to the Economic Analysis of Nonstationary Time Series and the Business Cycle*, Econometrica 57(2), 357-384, 1989. https://www.econometricsociety.org/publications/econometrica/1989/03/01/new-approach-economic-analysis-nonstationary-time-series-and. Scheda con abstract.
13. A. Ang, A. Timmermann, *Regime Changes and Financial Markets*, NBER Working Paper 17182, 2011. https://www.nber.org/papers/w17182. Scheda con abstract; la versione pubblicata (2012) non è stata verificata.
14. R. Gupta, S. Kapoor, H. Gupta, S. Natesan, *A forest of opinions: A multi-model ensemble-HMM voting framework for market regime shift detection and trading*, Data Science in Finance and Economics 5(4), 466-501, 2025. https://www.aimspress.com/aimspress-data/dsfe/2025/4/PDF/DSFE-05-04-019.pdf. Letto in parte.
15. R. J. Hyndman, G. Athanasopoulos, *Forecasting: Principles and Practice*, 3a edizione online, OTexts, capitolo 8. https://otexts.com/fpp3/exponential-smoothing.html. Letto in parte. Anno di edizione non confermato.
16. C. Ryan, M. O'Neill, J. J. Collins, *Introduction to 20 Years of Grammatical Evolution*, in *Handbook of Grammatical Evolution*, Springer, 2018, 1-21. https://gpbib.pmacs.upenn.edu/gp-html/Ryan_2018_hbge_intro.html. Scheda con abstract.
17. Gruppo MINDS, *Echo State Networks and Reservoir Computing*, pagina ospitata su `ai.rug.nl`. https://www.ai.rug.nl/minds/esnresearch/. Pagina letta; è di un gruppo di ricerca, non una rassegna con revisione.
18. Consilium, *Train/Holdout Experiments, Generalizzazione della popolazione GA*, 2026-09-12 (rapporto interno): `archive/reports/2026-09-12_train-test-holdout-experiments.md` nel repository Consilium. Letto per intero. Riguarda titoli e panieri con fitness basata sul CAGR, non la serie ENI di questo PoC.

**Conteggio.** 18 fonti: testo letto per 12 (1, 2, 3, 4, 5, 8, 9, 11, 14, 15, 17, 18), solo scheda o abstract per 6 (6, 7, 10, 12, 13, 16). **Identificate e non verificate, non usate come prova** (non numerate): R. J. Urbanowicz, J. H. Moore, *Learning Classifier Systems: A Complete Introduction, Review, and Roadmap*, 2009 (pagina dell'editore 403, copia su PubMed Central con verifica anti-robot); L. Breiman, J. H. Friedman, R. A. Olshen, C. J. Stone, *Classification and Regression Trees*, 1984 (nessuna pagina letta).

## 11. Glossario

- **Algoritmo genetico (GA).** Metodo di ricerca che fa evolvere una popolazione di candidati con selezione, crossover (scambio di parti tra due genitori) e mutazione (piccole modifiche casuali).
- **Anticipazione dei dati (look-ahead bias).** Errore per cui una decisione usa informazioni non ancora disponibili alla barra corrente, e il risultato appare migliore di quello ottenibile davvero.
- **Backtest.** Prova di una strategia sui dati storici, come se fosse stata applicata allora.
- **Barra.** Un periodo di negoziazione (qui un giorno) riassunto nei suoi valori OHLCV.
- **Buy&hold.** Strategia di riferimento: comprare all'inizio e tenere fino alla fine, senza altre operazioni.
- **CAGR (compound annual growth rate).** Tasso di crescita annuo composto: il rendimento annuo costante che porterebbe dal capitale iniziale a quello finale.
- **Fitness.** Numero che dice quanto un candidato è "buono" per l'algoritmo genetico; qui oggi è basato sul CAGR.
- **Genoma.** L'insieme dei parametri che definiscono una strategia, ciò che l'algoritmo genetico fa evolvere.
- **IIR (infinite impulse response).** Filtro ricorsivo: ogni valore dipende dal valore precedente dell'uscita oltre che dal dato nuovo.
- **Indicatore tecnico.** Numero calcolato dai prezzi e dai volumi passati (una media mobile, un oscillatore) per riassumerne l'andamento.
- **Media mobile.** Media dei prezzi delle ultime N barre.
- **OHLCV.** Open, high, low, close, volume: prezzo di apertura, massimo, minimo, chiusura e volume scambiato in una barra.
- **Overfitting (sovradattamento).** Adattarsi troppo ai dati di addestramento, compreso il rumore, e funzionare peggio su dati nuovi.
- **Stop loss.** Soglia di perdita oltre la quale una posizione viene chiusa automaticamente.
- **Take profit.** Soglia di guadagno oltre la quale una posizione viene chiusa automaticamente.
