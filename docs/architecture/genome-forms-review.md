---
title: "Genome Forms Review"
layout: doc
last_verified: 2026-10-11
---

# Rassegna delle forme di genoma

last_verified: 2026-10-11

Rassegna di ricerca del ciclo 010 (issue R1, epica "genoma non basato su macchina a stati"). Il documento è in italiano, come richiesto dall'operatore; gli altri documenti di questa sezione sono in inglese.

**A chi serve.** A Luca e Simone, che devono scegliere la forma del nuovo genoma prima di investire nelle ricerche sugli indicatori (R2), sulla codifica genetica (R3), sulle equazioni di decisione (R4) e nell'implementazione (E2). **La scelta è di Luca**: questo documento porta 1 o 2 candidati motivati, le condizioni in cui verrebbero scartati e ciò che non si è potuto accertare. Non sceglie al posto suo.

**Cosa NON è.** Non è una promessa di redditività né un confronto di rendimenti. Le forme sono confrontate per espressività, ricercabilità (quanto bene un algoritmo genetico le esplora), interpretabilità, costo di valutazione e integrazione con il motore. Il PoC resta uno strumento di ispezione storica (vedi [Simulator overview](../simulator-overview/), sezione "Purpose").

## Indice

1. Metodo e fonti
2. Cornice: memoria e lettura
3. Riferimento: il genoma FSM attuale
4. Scala di confronto, definita prima di compilare
5. Le schede (punteggio lineare, alberi e GP, rule list, reti, fuzzy, HMM)
6. Il contratto di strategia, forma per forma
7. Griglia di confronto
8. Famiglie e forme non portate a scheda
9. Sintesi per la decisione di Luca
10. Riferimenti
11. Glossario

## 1. Metodo e fonti

**Cosa si confronta.** Sei forme alternative più il genoma attuale (FSM) come riferimento, ciascuna con le stesse sette dimensioni: espressività, spazio di ricerca, interpretabilità, costo di valutazione, adattamento a crossover e mutazione, adeguatezza al contratto di strategia, origine della memoria di stato. Il requisito iniziale dell'operatore era che la memoria nascesse da indicatori finanziari già qualificati (indicatori tecnici: numeri calcolati dai prezzi e dai volumi passati per riassumerne l'andamento) e non da una macchina a stati; l'operatore ha poi precisato che **non è stringente**: HMM e reti con connessioni ricorrenti sono ammessi come forme da valutare. Il documento segnala la vicinanza a una macchina a stati dove c'è e non dichiara mai che una forma "rispetta" o "viola" il requisito.

**Cosa non decide la forma.** I parametri di rischio del `Trader` (`buyPercent`, la quota di capitale investita a ogni acquisto; `stopLossPercent`, la soglia di perdita oltre la quale la posizione si chiude da sola, detta stop loss; `takeProfitPercent`, la soglia di guadagno che la chiude, detta take profit) e la funzione di fitness (R5) sono **comuni a tutte le forme** e non dipendono dalla scelta qui. La relazione di Consilium sui propri esperimenti [20] attribuisce proprio a parametri di rischio degeneri e alla fitness basata sul rendimento annuo composto (CAGR) una causa ricorrente dei risultati deludenti; non separa però il peso della forma da quello della fitness. Quegli esperimenti confrontano le strategie evolute anche con il buy&hold (comprare all'inizio e tenere fino alla fine, senza altre operazioni) e riguardano titoli e panieri quotati diversi da ENI, finestre di addestramento da 2 a 5 anni e una sola fitness: i loro esiti non si trasferiscono alle forme alternative qui descritte.

**Come si cita.** Ogni affermazione non banale termina con un numero tra parentesi quadre, che rimanda al capitolo 10, con un percorso di codice (per esempio `src/engine/genome.js`), oppure con **[ipotesi]**: giudizio dell'autore senza fonte letta. Dove la fonte è nota ma non è stata letta nel testo, la marcatura è **[ipotesi, fonte da verificare]**. Il capitolo 10 dice per ogni fonte se il testo è stato letto, se è stata vista solo la scheda bibliografica o l'abstract, e la data di verifica (2026-10-11). Non sono ammessi come prova materiale commerciale o promozionale né backtest (prove di una strategia sui dati storici) non riproducibili.

**Dati e anticipazione.** I dati sono l'istantanea giornaliera di ENI in formato OHLCV (per ogni giorno, detto barra: prezzo di apertura, massimo, minimo, chiusura e volume scambiato): 2517 barre dal 2016-09-29 al 2026-09-28 su un solo titolo (`src/data/eni-ohlcv.json`). Per ogni barra l'ordine è: aggiornare gli indicatori, far eseguire al `Trader` l'ordine impostato alla barra precedente (all'apertura), poi decidere l'ordine per la barra successiva (`src/engine/strategy.js`, `feed`; `.swhouse/memory/knowledge/consilium-trader-order-timing.md`). Una forma che usa massimi e minimi della barra corrente decide quindi dopo la barra: non c'è anticipazione per costruzione (anticipazione dei dati, in inglese look-ahead bias: la decisione usa informazione non ancora disponibile alla barra corrente). L'anticipazione può nascere solo dalla **stima dei parametri** su dati futuri (caso HMM) o dalla fitness.

**Ingressi di esempio.** Ogni forma ha ingressi. Questo documento non sceglie gli indicatori, che sono materia di R2. Come esempio si usano i sei valori che il genoma attuale ha già: il prezzo del giorno, il volume del giorno e i quattro filtri IIR (due sul prezzo, due sul volume) (`src/vendor/consilium/algorithm.js`, righe 365–384). Sei ingressi, **n = 6**, sono il numero usato negli esempi di dimensione. R2 li sostituirà.

**Piccoli calcoli.** I pochi calcoli numerici sono esempi dichiarati come tali, non prove né risultati su dati.

**Notazione.** I simboli sono definiti alla prima comparsa. Il sito non è configurato per formule matematiche (`_layouts/doc.html` non include MathJax o KaTeX): le formule sono in testo semplice o in blocchi di codice. Nei blocchi, `x[t]` è il valore alla barra `t`, `*` il prodotto, `^` la potenza.

**Livello matematico.** Intermedio: somme pesate, soglie, funzioni di attivazione, ricorsioni del primo ordine. Niente dimostrazioni. I termini di finanza sono spiegati alla prima occorrenza e raccolti nel glossario (capitolo 11).

## 2. Cornice: memoria e lettura

Una strategia di trading decide ogni giorno una tra tre azioni: comprare (`buy`), vendere (`sell`), non fare nulla (`hold`). Per decidere bene serve **memoria del passato**: un solo prezzo non dice se il titolo sale o scende. La rassegna distingue due parti.

- **Memoria**: da dove la decisione di oggi riceve informazione sulla storia.
- **Lettura**: la regola che da quell'informazione produce `buy`, `sell` o `hold`.

### 2.1 Il filtro IIR del genoma attuale

I quattro indicatori dell'FSM attuale sono filtri ricorsivi del primo ordine (IIR, "a risposta impulsiva infinita": ogni valore dipende da tutti i precedenti attraverso il valore appena calcolato). Il codice è:

```
ema = ema * (1 - c) + x * c            (src/vendor/consilium/algorithm.js, righe 369-372)
```

In forma equivalente, con `y[t]` il valore del filtro alla barra `t`, `x[t]` il dato nuovo (prezzo o volume) e `c` il coefficiente del genoma, con 0 < c < 1 (`src/engine/genome.js`, `createConsiliumGenome`, righe 78-88):

```
y[t] = y[t-1] + c * ( x[t] - y[t-1] )
```

**`c` è il peso del dato nuovo, non del passato.** Un `c` vicino a 1 fa seguire il dato da vicino (poca memoria); un `c` vicino a 0 lo rende lento (molta memoria). La durata tipica della memoria è circa 1/c barre. Lo stato iniziale del filtro è il primo dato (`algorithm.js`, righe 342-348).

**Esempio numerico (dichiarato come tale, non è un risultato su dati).** Il filtro parte da y = 100 e il dato passa di colpo a x = 110 e resta lì. Con i quattro coefficienti del genoma fisso (`FIXED_GENOME`, `src/engine/genome.js`, righe 13-17), il valore del filtro dopo 1, 2, 3 e 8 barre è:

| Filtro | c | 1/c (barre) | dopo 1 | dopo 2 | dopo 3 | dopo 8 |
|---|---|---|---|---|---|---|
| prezzo 2 | 0,990 | 1,0 | 109,90 | 110,00 | 110,00 | 110,00 |
| prezzo 1 | 0,731 | 1,4 | 107,31 | 109,27 | 109,80 | 110,00 |
| volume 2 | 0,396 | 2,5 | 103,96 | 106,35 | 107,80 | 109,82 |
| volume 1 | 0,118 | 8,5 | 101,18 | 102,22 | 103,13 | 106,33 |

Calcolato con la formula sopra (script di una riga eseguito il 2026-10-11, numeri arrotondati). Lettura: nel genoma fisso il filtro `prezzo 2` ha praticamente **nessuna memoria** (segue il prezzo in una barra); la memoria dei prezzi sta soprattutto in `prezzo 1` (circa 1,4 barre) e, per i volumi, in `volume 1` e `volume 2`. Questa è una lettura dei numeri del genoma fisso, non una proprietà della forma.

### 2.2 Memoria a monte e memoria nel lettore

Un indicatore tecnico (medie mobili, differenze tra medie, variazioni su N barre, massimi e minimi su N barre, oscillatori, intervalli medi) calcola da una finestra di storia, finita o ricorsiva, un numero. In generale la memoria di un indicatore è una **funzione causale della storia** (usa solo dati fino alla barra corrente), e la sua durata è il numero di barre della finestra o la costante di tempo. Le medie semplici ed esponenziali e le loro differenze sono **filtri lineari** (combinazioni lineari dei dati passati); **non tutti gli indicatori lo sono**: massimo e minimo su N barre (canale di Donchian), oscillatore stocastico, indice di forza relativa (RSI, rapporto tra medie dei guadagni e delle perdite) e intervallo medio vero (ATR) sono non lineari. L'elenco degli indicatori e le loro definizioni spettano a R2; qui conta solo dove la memoria vive. L'uso di medie mobili e di massimi e minimi nelle regole tecniche trovate da un algoritmo genetico è documentato in [6] (solo riassunto di corso).

Le forme si dividono quindi in due classi, che la griglia del capitolo 7 riprende nella colonna "origine della memoria".

- **Memoria a monte (forma feedforward).** Gli indicatori sono calcolati prima; la forma legge un vettore di numeri della sola barra corrente e non ha stato proprio. Esempi: punteggio lineare, albero di espressioni, rule list, rete senza ricorrenze.
- **Memoria nel lettore.** La forma ha uno **stato proprio** aggiornato a ogni barra: stato discreto della macchina a stati (FSM), credenza sui regimi dell'HMM, stato del filtro di Kalman, nodi ricorrenti di una rete, registri di un programma.

La cornice non isola l'effetto della forma: forme diverse hanno genotipi di dimensione diversa, quindi diversa capacità di adattarsi al rumore dei dati (sovradattamento, in inglese overfitting), e la fitness e i parametri del `Trader` restano comuni e non separati. Separare forma e fitness richiede un esperimento, non una cornice (vedi capitolo 9, "Ciò che non si è potuto accertare").

## 3. Riferimento: il genoma FSM attuale

Il genoma attuale è una macchina a stati (FSM, finite state machine).

**Definizione.** Nove stati disposti su una griglia 3x3 (`GENOME_STATES`: NW, N, NE, W, C, E, SW, S, SE; `src/engine/genome.js`, riga 4). Ogni stato ha fino a quattro transizioni uscenti. Ogni transizione è una lista di identificatori di condizione, da 0 a 13; scatta la prima transizione, in un ordine fisso, le cui condizioni sono **tutte** vere (AND) (`algorithm.js`, righe 135-193). Le 14 condizioni sono confronti: il prezzo del giorno contro i due filtri di prezzo spostati di un margine, un filtro di prezzo contro l'altro, il volume contro i due filtri di volume spostati di un margine, un filtro di volume contro l'altro; le condizioni 0 e 1 sono "sempre falsa" e "sempre vera" (`algorithm.js`, righe 20-61). Il prezzo del giorno è la media di apertura, massimo, minimo e chiusura (`src/vendor/consilium/stockStream.js`, righe 32-34). Alcuni stati hanno l'azione `buy` o `sell`; nel genoma fisso solo SW ha un'azione, `buy` (`genome.js`, riga 32), e le uscite avvengono per stop loss o take profit (vedi glossario) del `Trader` (`.swhouse/memory/knowledge/consilium-trader-order-timing.md`).

**Margini.** Il margine è proporzionale al filtro, non al prezzo: `marginAbs = ema * marginPercent` (`algorithm.js`, riga 381), con i valori percentuali del genoma divisi per 100 (`genome.js`, funzione `toFraction`). Uno dei due margini sul prezzo del genoma fisso è negativo (-1,10 per cento).

| Dimensione | Fatto (grandezza osservabile) | Livello | Fonte |
|---|---|---|---|
| Espressività | Decisione a tratti: AND di confronti tra ingressi e filtri; l'azione dipende anche dallo stato corrente | a tratti | `algorithm.js` 135-193 |
| Spazio di ricerca | 11 numeri continui (4 coefficienti IIR, `buyPercent`, 2 margini prezzo, 2 margini volume, stop loss, take profit) più struttura discreta a lunghezza variabile: nel genoma fisso 36 transizioni con 135 identificatori di condizione in totale (conteggio eseguito su `FIXED_GENOME` il 2026-10-11) | grande | `genome.js` 13-39, 92-102 |
| Interpretabilità | Il grafo si legge; per sapere in quale stato si è alla barra `t` bisogna seguire la storia delle transizioni | con calcolo | [ipotesi] |
| Costo di valutazione | 4 filtri (circa 12 operazioni) più al massimo 4 transizioni con in media 3-4 condizioni ciascuna | decine per barra | `algorithm.js` 365-384, [ipotesi] sul conteggio |
| Crossover e mutazione | Esistono: crossover uniforme parametro per parametro e scambio di stati interi; mutazione di parametri e stati | naturale | `src/vendor/consilium/individual.js` 191, 350-380 |
| Contratto | Soddisfatto (è il riferimento): `labels` = 9 stati, `describe()` espone i 4 filtri, `serialize()` il genoma JSON | diretto | `src/engine/fsmStrategy.js` |
| Memoria | Stato discreto nel genoma, più i filtri IIR; ricorrenza interna: sì | stato discreto | `algorithm.js` 342-358, 399-403 |

**Rischi (checklist).** Anticipazione dei dati: no per costruzione (capitolo 1). Soluzioni degeneri: transizioni mai raggiungibili o stati senza uscita; condizioni 0 e 1 che rendono una transizione sempre o mai attiva (`algorithm.js` 20-25). Sfruttamento della fitness: comune a tutte le forme (capitolo 1).

**Fonti.** Solo codice del repository.

## 4. Scala di confronto, definita prima di compilare

Il Critic ha rilevato che una scala ordinale senza definizione è soggettiva e che nessuna fonte sostiene "medio" per l'interpretabilità. Per questo, **per ciascuna dimensione si fissa prima una grandezza osservabile con soglie**; le celle della griglia riportano il livello con il nome definito qui, non un generico "alto" o "basso". I fatti stanno nelle grandezze; **l'assegnazione del livello è un giudizio dell'autore** (esplicito nelle schede quando non c'è fonte). Non c'è punteggio totale né peso: i pesi sarebbero una scelta di valore, che spetta a Luca (domanda 3, capitolo 9).

| Dimensione | Grandezza osservabile | Livelli (nome: significato) |
|---|---|---|
| 1. Espressività | Classe delle decisioni rappresentabili a partire dagli ingressi della barra (e dallo stato, se c'è), a parità di ingressi | **affine**: soglia su una combinazione lineare degli ingressi. **a tratti**: regioni dello spazio degli ingressi delimitate da soglie, con decisione costante o semplice in ciascuna. **universale**: può approssimare funzioni continue qualsiasi, con dimensione sufficiente |
| 2. Spazio di ricerca | Numero e tipo dei parametri, con n = 6 ingressi di esempio | **piccolo**: al più 10 numeri continui, dimensione fissa. **medio**: da 11 a circa 100 numeri, dimensione fissa, o struttura discreta limitata. **grande**: struttura variabile (cambia la forma o il numero di elementi) o più di circa 100 numeri |
| 3. Interpretabilità | Che cosa serve per capire una decisione guardando il genoma | **diretta**: ogni elemento del genoma ha un significato locale e la decisione è una somma o la prima regola che scatta. **con calcolo**: bisogna valutare una composizione (albero, aggregazione di regole, ricorsione di uno stato). **solo simulando**: il significato è distribuito (pesi di rete, stato interno vettoriale) |
| 4. Costo di valutazione | Operazioni aritmetiche per barra, con i parametri di esempio | **decine** (meno di 100). **centinaia** (100-1000). **migliaia o più** (oltre 1000) |
| 5. Crossover e mutazione | Esistenza di un operatore che scambia parti con significato | **naturale**: lo scambio di parti produce figli sensati. **con accorgimenti**: serve riparazione, normalizzazione o ordinamento per evitare figli privi di senso. **solo mutazione**: il crossover è problematico o sconsigliato |
| 6. Contratto | Membri richiesti da `assertStrategy` e `StrategyIndividual` (capitolo 6) | **diretto**: tutti senza trasformazioni. **con adattamento**: almeno un membro richiede una trasformazione descritta. **non soddisfatto**: un membro non è ottenibile |
| 7. Origine della memoria | Dove vive l'informazione sul passato (capitolo 2.2), più la ricorrenza interna | **a monte** (forma feedforward). **ritardi in ingresso** (valori passati degli indicatori forniti come ingressi, a monte). **stato discreto** nel genoma. **stato continuo nel lettore**. Per ogni forma: ricorrenza interna ammessa sì, no, opzionale |

Una dimensione in più, non prevista dai sette criteri ma richiesta dal Critic: **vincoli duri**, colonna della griglia con l'esito sintetico del contratto (capitolo 6) e della memoria. Non elimina nessuna forma: l'eliminazione, se c'è, è in sintesi, motivata e visibile a Luca.

## 5. Le schede

Ogni scheda ha lo stesso ordine: definizione in poche righe con la formula, sette dimensioni (fatto, livello, fonte), rischi con tre voci fisse (anticipazione dei dati; soluzioni degeneri; sfruttamento della fitness), una riga sul genotipo di massima (senza operatori né equazioni: sono materia di R3 e R4), fonti con stato. Le **due varianti** per le forme con stato interno possibile ("solo indicatori" e "con memoria interna") sono descritte entrambe, con pro e contro, **senza scegliere**: la decisione è di Luca (domanda 2, capitolo 9).

### 5.1 Punteggio lineare di indicatori con soglie (istanze: minima, osservatore di Kalman, generale)

**Definizione.** Un punteggio `s[t]` è una somma pesata degli ingressi alla barra `t`, e due soglie lo traducono in azione.

```
s[t] = w1*x1[t] + w2*x2[t] + ... + wn*xn[t] + b
buy  se s[t] > soglia_alta;  sell se s[t] < soglia_bassa;  altrimenti hold
```

Qui `x1...xn` sono gli n ingressi (indicatori), `w1...wn` i pesi, `b` un termine costante. Una soglia su una combinazione lineare è la forma di un classificatore lineare; nessun testo di riferimento sul tema è stato letto, quindi la descrizione è [ipotesi, fonte da verificare]. Tre istanze, dichiarate come tali:

- **Minima** (metro, non candidato): un filtro e una soglia, due numeri nel genoma. Per esempio posizione lunga quando il prezzo supera il suo filtro di un margine. [ipotesi di metodo]
- **Con osservatore di Kalman.** Il prezzo (o il suo logaritmo) è modellato come somma di un livello e di una pendenza non osservati più rumore; il filtro di Kalman stima ricorsivamente livello e pendenza [3]. La decisione si legge dalla pendenza stimata, con soglia. Il filtro di Kalman è uno stimatore ricorsivo per modelli lineari con rumore [3] (letto: abstract e introduzione). La fonte [3] **non** tratta né il livellamento esponenziale né i prezzi. Il legame con il livellamento esponenziale (media pesata con pesi che decadono esponenzialmente, anche con livello e pendenza, "metodo lineare di Holt") è descritto in [15]; l'affermazione che, con rumori costanti, il guadagno di Kalman converge a un valore fisso e il filtro si riduce a un livellamento esponenziale doppio (tipo alfa-beta) è **[ipotesi, fonte da verificare]**: [15] presenta i modelli di stato del livellamento esponenziale ma non l'equivalenza.
- **Generale**: n ingressi, pesi liberi, due soglie.

| Dimensione | Fatto | Livello | Fonte |
|---|---|---|---|
| Espressività | Una soglia su un iperpiano degli ingressi; nessuna interazione tra indicatori (un AND tra due indicatori non è rappresentabile con una sola soglia) | affine | [ipotesi] |
| Spazio di ricerca | n pesi, `b` e 2 soglie: con n = 6, 9 numeri continui; minima: 2; Kalman: pochi numeri (rapporti tra varianze del processo e del rumore, soglia) | piccolo | [ipotesi] |
| Interpretabilità | Il segno e la grandezza di ogni peso dicono il contributo; la somma si calcola a mano | diretta | [ipotesi] |
| Costo di valutazione | 6 prodotti e 6 somme, 2 confronti; Kalman: poche decine di operazioni per barra | decine | [ipotesi] |
| Crossover e mutazione | Pesi continui: mutazione gaussiana e crossover aritmetico o uniforme sono operatori standard; scale diverse degli ingressi richiedono normalizzarli | naturale | [ipotesi] |
| Contratto | `labels`: tre fasce del punteggio; `describe()`: espone `s[t]` e, per Kalman, livello, pendenza e guadagno come numeri finiti; `serialize()`: pesi e soglie | con adattamento | `src/engine/strategy.js` 12-33; capitolo 6 |
| Memoria | A monte (gli indicatori); ritardi in ingresso se si aggiungono ingressi ritardati; ricorrenza interna: no. Kalman: stato continuo nel lettore (livello e pendenza), ricorrenza interna: sì | a monte; Kalman: stato continuo | [3] per Kalman; [ipotesi] |

**Rischi.** Anticipazione: no per costruzione; per Kalman nessuna stima globale se i rumori sono parametri del genoma. Soluzioni degeneri: soglie che non scattano mai (`soglia_alta` oltre l'intervallo di `s`), pesi che fanno prevalere un ingresso di scala grande; mitigazione in R3 (normalizzare gli ingressi). Sfruttamento della fitness: pochi parametri limitano la capacità di adattarsi al rumore, ma non la eliminano [4]. Il filtro di Kalman è ottimo con rumori gaussiani; le serie giornaliere di prezzi tendono ad avere code pesanti [ipotesi].

**Genotipo di massima.** Un vettore di numeri reali (pesi, soglie, eventuali parametri di Kalman).

**Fonti.** [3] (letto in parte), [15] (letto in parte); per il classificatore lineare nessuna fonte letta.

### 5.2 Alberi di espressioni e programmazione genetica (GP)

**Definizione.** Un programma è un albero: i nodi interni sono operazioni (`+`, `-`, `*`, divisione protetta, confronti, `if`), le foglie sono ingressi o costanti; l'albero valutato su un vettore di ingressi dà un numero, da cui si ricavano le tre azioni con soglie. Le soluzioni sono composizioni gerarchiche di funzioni [5]. Per il trading, un precedente classico cerca con un algoritmo genetico **combinazioni logiche di regole semplici** su medie mobili e su massimi e minimi di prezzi passati, con crossover tra alberi [6]: la fonte letta è solo un riassunto di corso, non l'articolo, e riporta che, nelle condizioni di quello studio, dopo i costi di transazione le regole trovate non hanno dato rendimento in eccesso rispetto al riferimento di mercato (nessuna cifra riportata qui). Una rassegna sistematica sulle tecniche evolutive per la scoperta di regole di trading azionario osserva una forte concentrazione di studi su algoritmi genetici e GP per le regole tecniche [7] (letto l'abstract: la maggior parte delle tecniche, in quella rassegna, risulta efficace nei ribassi e debole nei rialzi; è un esito di quella rassegna e delle sue condizioni).

**Varianti di rappresentazione** (tutte in [5]): albero (default); **GP lineare**, una sequenza di istruzioni che leggono e scrivono registri (capitolo 7.1); **GP cartesiano (CGP)**, un genoma di interi a lunghezza fissa che codifica un grafo, evoluto tipicamente per sola mutazione (capitolo 7.2.3; [5]); [16] e [17] sono le fonti dirette del CGP (vista solo la scheda bibliografica). L'evoluzione grammaticale (GE) è un meccanismo di codifica più che una forma (capitolo 8).

**Due varianti per la memoria (Luca non ha ancora deciso).**

| | "Solo indicatori" | "Con memoria interna" |
|---|---|---|
| Che cos'è | L'albero (o il programma) ha come foglie solo indicatori calcolati a monte; nessun registro persistente tra una barra e l'altra | Il programma ha registri che mantengono il valore alla barra successiva (GP lineare con registri riscritti a ogni barra [5], oppure un albero con foglie che leggono l'uscita precedente) |
| Pro | Programma puro: stesso input, stesso output; `reset()` banale; la memoria è negli indicatori già qualificati; più facile da leggere e da testare | Può costruire una memoria non prevista dagli indicatori (contatori, flag di "già in posizione"), con esiti non prevedibili dal solo programma |
| Contro | La memoria è limitata a quella degli indicatori scelti da R2 | L'uscita dipende dalla storia dei registri: `reset()` deve azzerarli, l'interpretabilità scende (si avvicina a una macchina a stati senza averne l'esplicita struttura), l'effetto di una mutazione si propaga nel tempo |
| Origine della memoria | A monte | Stato continuo nel lettore (registri); ricorrenza interna: sì |

Il vincolo "solo indicatori" è una **scelta di progetto**, non una proprietà della forma: GP e CGP ammettono entrambe le varianti [5]. Nella griglia entrambe le varianti hanno una riga.

| Dimensione | Fatto | Livello | Fonte |
|---|---|---|---|
| Espressività | Con aritmetica e `if` nel set di funzioni, qualsiasi funzione calcolabile dagli ingressi, dimensione permettendo | universale | [5] (classe di programmi), [ipotesi] sulla qualifica |
| Spazio di ricerca | Struttura e dimensione variabili (la forma stessa evolve); i parametri sono le costanti nelle foglie. Cresce senza controllo se non limitata (bloat, vedi sotto) | grande | [5] capitolo 11.3 |
| Interpretabilità | Un albero piccolo si legge come una formula; uno grande no | con calcolo | [ipotesi] |
| Costo di valutazione | Proporzionale al numero di nodi: con 10-100 nodi, decine fino a centinaia di operazioni per barra; va limitato con una dimensione massima | decine o centinaia | [ipotesi] |
| Crossover e mutazione | Albero: crossover di sottoalberi e vari tipi di mutazione sono operatori standard [5]. GP lineare: crossover tra segmenti. CGP: tradizionalmente la mutazione è l'operatore principale [5] (capitolo 7.2.3) | naturale (albero), solo mutazione (CGP) | [5] |
| Contratto | `labels` da fasce dell'uscita; `describe()`: uscita (e, a scelta, valori intermedi); `serialize()`: albero in JSON | con adattamento | capitolo 6 |
| Memoria | Vedi le due varianti | a monte / stato continuo | [5] |

**Rischi.** Anticipazione: no per costruzione. Soluzioni degeneri: programmi che non leggono nessun ingresso (decisione costante), divisioni per zero, crescita della dimensione senza miglioramento della fitness (bloat) [5]. Sfruttamento della fitness: struttura variabile significa capacità di adattamento variabile: più alta di forme a pochi parametri [ipotesi]; con 2517 barre su un titolo il rischio è rilevante, e Bailey e coautori sostengono che la validazione su dati tenuti fuori da sola non basta quando si prova più di una configurazione [4]; la decisione su come limitarlo spetta a R5 e R6.

**Genotipo di massima.** Un albero (o una sequenza, o un vettore di interi) con insiemi di funzioni e terminali fissati.

**Fonti.** [5] (testo letto per i capitoli 2, 7.1, 7.2.3, 11.3), [6] (solo riassunto), [7] (abstract), [16], [17] (schede), [4].

### 5.3 Rule list (lista di regole)

**Definizione.** Una lista ordinata di coppie condizione-azione; per ogni barra si applica l'azione della **prima** regola la cui condizione è vera; l'ultima condizione è sempre vera (azione di default). In letteratura è una "decision list" [8]: una lista di coppie (condizione, valore) in cui il valore applicato è quello della prima condizione verificata, vista come un "se... altrimenti se... altrimenti" esteso [8].

```
se  (close_filter_1 > close_filter_2 + m1)  e  (volume > volume_filter_1)  allora buy
altrimenti se  (close_filter_1 < close_filter_2 - m2)                      allora sell
altrimenti                                                                   hold
```

Esempio di forma, non di regola proposta. Una variante, i **learning classifier system** (LCS), evolve una popolazione di regole con un meccanismo di attribuzione del merito. L'esistenza e la distinzione tra stile "Michigan" (un individuo è una regola) e "Pittsburgh" (un individuo è un insieme di regole) sono [ipotesi, fonte da verificare: Urbanowicz e Moore, 2009, non letta, il sito dell'editore ha risposto con errore 403]. Una rule list è **simile, non identica** a un insieme di regole Pittsburgh: la prima è ordinata e ha un default; il secondo ha di norma una risoluzione dei conflitti e una lunghezza variabile [ipotesi, fonte da verificare]. Gli LCS non sono portati a scheda: nella versione Michigan l'individuo del GA sarebbe l'intera popolazione di regole, in tensione con l'ipotesi "un genoma = una strategia" del contratto.

| Dimensione | Fatto | Livello | Fonte |
|---|---|---|---|
| Espressività | Regioni a tratti delimitate da confronti; ogni regola è una congiunzione | a tratti | [8] |
| Spazio di ricerca | Lunghezza della lista e struttura di ciascuna regola variabili; i margini sono continui | grande | [ipotesi] |
| Interpretabilità | Si legge dall'alto verso il basso senza calcolo, finché la lista è corta | diretta | [8], [ipotesi] sulla soglia di lunghezza |
| Costo di valutazione | Al massimo una condizione per regola per barra: decine di confronti | decine | [ipotesi] |
| Crossover e mutazione | Scambiare regole tra liste cambia la precedenza (l'ordine conta); mutazione di margini, operatori e posizione è semplice | con accorgimenti | [ipotesi] |
| Contratto | `labels`: l'azione (o l'indice della regola scattata, una lista finita); `describe()`: valori delle condizioni valutate; `serialize()`: lista in JSON | con adattamento (diretto se l'etichetta è l'azione) | capitolo 6 |
| Memoria | A monte; ricorrenza interna: no (variante base). Una variante con regole che leggono un'uscita precedente è possibile ma è fuori dalla definizione di [8] | a monte | [8] |

**Rischi.** Anticipazione: no. Soluzioni degeneri: regole mai raggiungibili perché oscurate da una regola precedente (ombreggiamento); default dominante. Sfruttamento della fitness: lista lunga significa alta capacità di adattamento [ipotesi]; R5 e R6 decidono come limitarla.

**Genotipo di massima.** Una lista di regole, ciascuna con condizioni (indicatore, operatore, margine) e un'azione.

**Fonti.** [8] (letto: abstract e definizione), [6] e [7] per il contesto del trading.

### 5.4 Rete neurale piccola: MLP e NEAT (una scheda, due sottoparagrafi)

**Definizione.** Una rete calcola l'uscita come composizione di somme pesate e funzioni di attivazione (funzioni non lineari come la tangente iperbolica).

```
h = tanh( W1 * x + b1 )         (strato nascosto: vettore h)
y = W2 * h + b2                 (uscita: un punteggio, oppure tre punteggi)
```

`x` è il vettore degli n ingressi, `W1` e `W2` sono matrici di pesi, `b1` e `b2` vettori di costanti. Con n = 6, 4 neuroni nascosti e 3 uscite i pesi sono 6*4 + 4 + 4*3 + 3 = 43. Un perceptron multistrato (MLP) con almeno uno strato nascosto e funzioni di attivazione a "schiacciamento" è un approssimatore universale di funzioni, dimensione dello strato permettendo [9] (letto: abstract e definizioni). **NEAT** (NeuroEvolution of Augmenting Topologies) evolve insieme topologia e pesi: tre idee, ossia marcatori storici per allineare le reti diverse nel crossover, speciazione per proteggere le novità, crescita incrementale da reti minime [1] (letto per le parti citate). NEAT consente connessioni ricorrenti, e [1] dichiara che con esse la memoria è facilmente rappresentata nelle reti [1].

**Due varianti (Luca non ha ancora deciso).**

| | "Solo indicatori" (feedforward) | "Con memoria interna" (ricorrente) |
|---|---|---|
| MLP | Rete senza connessioni all'indietro; la memoria è negli indicatori a monte | Rete di Elman o simile, con uno strato che rilegge la propria uscita: richiede una scelta di progetto aggiuntiva [ipotesi] |
| NEAT | NEAT con la sola topologia feedforward (si vieta la ricorrenza nell'evoluzione) | NEAT con la ricorrenza permessa, come nel metodo originale [1] |
| Pro | Programma puro, stesso input stesso output, `reset()` banale | Memoria propria: può rappresentare dipendenze che gli indicatori non catturano [1] |
| Contro | La memoria è limitata a quella degli indicatori | Interpretabilità molto bassa; stato da azzerare in `reset()`; dinamiche instabili possibili [ipotesi]; vicinanza a una macchina a stati con stati continui |
| Origine della memoria | a monte | stato continuo nel lettore; ricorrenza: sì |

| Dimensione | Fatto | Livello | Fonte |
|---|---|---|---|
| Espressività | Approssimatore universale (MLP con almeno uno strato nascosto) | universale | [9] |
| Spazio di ricerca | MLP di esempio: 43 pesi, dimensione fissa. NEAT: topologia e pesi, dimensione variabile (parte da reti minime e cresce) | MLP medio; NEAT grande | [1] per NEAT; conteggio dell'autore per MLP |
| Interpretabilità | Il significato dei pesi è distribuito: si capisce simulando, non leggendo | solo simulando | [ipotesi] |
| Costo di valutazione | MLP di esempio: circa 43 prodotti-somme più 7 attivazioni per barra | decine | calcolo dell'autore (esempio) |
| Crossover e mutazione | Il crossover ingenuo è sensibile alla permutazione dei neuroni: due reti equivalenti con neuroni in ordine diverso danno figli peggiori ("competing conventions") [1]. NEAT lo gestisce con i marcatori storici [1] | MLP con accorgimenti; NEAT con accorgimenti previsti dal metodo | [1] |
| Contratto | `labels`: tre fasce dell'uscita (o la sua azione); `describe()`: uscite e, a scelta, attivazioni nascoste; `serialize()`: pesi e topologia in JSON | con adattamento | capitolo 6 |
| Memoria | Vedi la tabella delle varianti | a monte / stato continuo | [1] |

**Rischi.** Anticipazione: no. Soluzioni degeneri: reti che saturano (uscita sempre alle estremità), uscita costante. Sfruttamento della fitness: 43 pesi su 2517 barre e un titolo sono tanti rispetto alla forma lineare con 9 numeri [ipotesi]; vale il rimando a [4]. NEAT: la crescita della topologia è controllata dal metodo (parte da reti minime) [1].

**Genotipo di massima.** Pesi (MLP) o geni di nodo e di connessione con marcatore storico (NEAT).

**Nota di contrasto (reservoir computing).** Una rete ricorrente casuale e **fissa** riceve gli ingressi; solo una lettura lineare è addestrata [19]. È parente delle reti ricorrenti, ma lo stato ha centinaia di numeri e l'interpretabilità è molto bassa [ipotesi]; non è portata a scheda (capitolo 8).

**Fonti.** [1] (testo letto per le parti citate), [9] (abstract), [19] (pagina di gruppo di ricerca).

### 5.5 Fuzzy (logica sfumata)

**Definizione.** Un insieme sfumato (fuzzy) assegna a ogni oggetto un **grado di appartenenza** tra 0 e 1 (una "funzione di appartenenza"), invece di un sì/no [10] (letto: scheda e abstract; il testo integrale non è raggiungibile). Un sistema a regole sfumate traduce gli ingressi in gradi di appartenenza ("prezzo alto", "volume basso"), applica regole del tipo "se prezzo alto e volume basso allora vendi", aggrega i risultati e ne ricava un valore con una "defuzzificazione" [ipotesi, fonte da verificare: il testo [10] fonda gli insiemi, non descrive i sistemi a regole]. Un sistema fuzzy per il trading di azioni con funzioni di appartenenza e regole ottimizzate da un algoritmo genetico è descritto in [11] (letto: abstract e parti su regole e funzioni di appartenenza; è un lavoro di conferenza su un caso, e non ne riportiamo i risultati).

| Dimensione | Fatto | Livello | Fonte |
|---|---|---|---|
| Espressività | Regole sovrapposte su regioni sfumate: decisione a tratti, continua. Che i sistemi fuzzy siano approssimatori universali è [ipotesi, fonte da verificare] | a tratti | [10], [ipotesi] |
| Spazio di ricerca | Per ogni ingresso, le funzioni di appartenenza hanno parametri (per esempio 3 funzioni triangolari da 3 numeri = 9 per ingresso, 54 con n = 6) più la base di regole | medio o grande | conteggio dell'autore; [11] |
| Interpretabilità | Ogni regola si legge come frase; l'uscita finale richiede aggregare più regole | con calcolo | [11], [ipotesi] |
| Costo di valutazione | Valutare tutte le funzioni di appartenenza e tutte le regole: con 54 parametri e qualche decina di regole, decine fino a centinaia di operazioni | decine o centinaia | [ipotesi] |
| Crossover e mutazione | Le funzioni di appartenenza vanno tenute ordinate e nel dominio (accorgimenti); le regole si scambiano come in una rule list | con accorgimenti | [11], [ipotesi] |
| Contratto | `labels`: fasce dell'uscita; `describe()`: gradi di appartenenza e uscita (numeri finiti in [0,1]); `serialize()`: parametri in JSON | con adattamento | capitolo 6 |
| Memoria | A monte; ricorrenza interna: no (variante base). Una retroazione dell'uscita sui gradi è possibile, non standard | a monte | [11] |

**Rischi.** Anticipazione: no. Soluzioni degeneri: funzioni di appartenenza che non coprono mai l'intervallo reale degli ingressi (regole mai attive); un'uscita che sta sempre nella fascia di `hold`. Sfruttamento della fitness: tanti parametri e un titolo [4], [ipotesi].

**Genotipo di massima.** Parametri delle funzioni di appartenenza più base di regole (che cosa combinare con che cosa).

**Fonti.** [10] (scheda), [11] (letto in parte).

### 5.6 Filtro di regime con modello a stati nascosti (HMM), forma di confine

**Definizione.** Un modello a stati nascosti (HMM, hidden Markov model) suppone che il mercato sia, a ogni barra, in uno di K regimi non osservati (per esempio "salita", "laterale", "discesa") e che i regimi si succedano secondo probabilità di transizione. A ogni barra si aggiorna la probabilità di trovarsi in ciascun regime, dato ciò che si è osservato fino a quella barra. L'algoritmo "in avanti" è descritto da Rabiner con i simboli seguenti [2]: `a_ij` probabilità di passare dal regime `i` al regime `j`; `b_j(O_t)` probabilità di osservare `O_t` (qui il vettore di indicatori della barra `t`) nel regime `j`; `alfa_t(j)` la probabilità congiunta di aver visto le osservazioni fino a `t` e di essere nel regime `j`.

```
inizializzazione:  alfa_1(i)     = pi_i * b_i(O_1)
induzione:         alfa_{t+1}(j) = [ somma su i di alfa_t(i) * a_ij ] * b_j(O_{t+1})
scaling:           si divide ogni alfa_t per la somma su tutti i regimi
```

dove `pi_i` è la probabilità iniziale del regime `i`. Dopo la normalizzazione, `alfa_t` è la **distribuzione di credenza** sui regimi: un vettore di K numeri che sostituisce lo stato discreto di una macchina a stati ([2], formule di induzione e sezione "scaling"). La corrispondenza con le formule di Rabiner è esplicita: non si usa una notazione alternativa. Il regime più probabile (o una soglia sulla credenza) e una mappa regime-azione producono `buy`, `sell` o `hold`. In economia il lavoro di Hamilton introduce un modello di cambio di regime con stati discreti di Markov per serie temporali [12] (letta la scheda dell'editore con abstract). Rassegne e lavori sull'identificazione di regimi nei mercati finanziari con HMM sono in [13] (working paper, abstract letto) e [14] (articolo del 2025, abstract e introduzione letti; propone un voto d'insieme tra HMM e altri modelli, e non ne riportiamo i risultati).

**Vicinanza alla macchina a stati.** L'HMM ha K stati nascosti, una matrice di transizione `a_ij` e una mappa stato-azione: **ha la stessa struttura di una macchina a stati, in versione probabilistica**. La differenza è che le transizioni sono calcolate da indicatori attraverso le probabilità di osservazione `b_j`, non scelte da liste di condizioni codificate nel genoma. Dato che l'operatore ha dichiarato che il requisito non è stringente, l'HMM è trattato come candidato normale; le colonne memoria e interpretabilità valgono però per K stati nascosti, non per zero stati.

| Dimensione | Fatto | Livello | Fonte |
|---|---|---|---|
| Espressività | Con emissioni gaussiane, la decisione è a tratti nello spazio degli ingressi (una regione per regime) con una dinamica nel tempo | a tratti | [2], [ipotesi] sulla qualifica |
| Spazio di ricerca | K = 3, n = 6, emissioni gaussiane a covarianza diagonale: medie e varianze 3*6*2 = 36, matrice di transizione 3*2 = 6 numeri liberi (le righe sommano a 1), probabilità iniziali 2, mappa regime-azione discreta: circa 44 numeri più la mappa | medio | conteggio dell'autore su [2] |
| Interpretabilità | I regimi hanno media e varianza leggibili; la credenza alla barra `t` richiede di eseguire la ricorsione | con calcolo | [ipotesi] |
| Costo di valutazione | K*K prodotti per la transizione più K densità su n ingressi: con K = 3 e n = 6, circa 70-100 operazioni | decine o centinaia | conteggio dell'autore su [2] |
| Crossover e mutazione | Permutare i regimi dà lo stesso modello con genotipo diverso, quindi il crossover ingenuo tra due HMM equivalenti è distruttivo (stesso problema delle "competing conventions" delle reti [1]); le righe di `a_ij` vanno rinormalizzate. Ordinare i regimi per un criterio (per esempio per media) è un accorgimento [ipotesi] | con accorgimenti | [1] per l'analogia; [ipotesi] |
| Contratto | `labels` = i K regimi (lista finita, la più naturale tra le forme); `describe()` = la credenza come K numeri finiti; `serialize()` = parametri in JSON | diretto | capitolo 6 |
| Memoria | Stato continuo nel lettore: la credenza, aggiornata a ogni barra; ricorrenza interna: sì | stato continuo | [2] |

**Rischi. Anticipazione nella stima dei parametri.** Il filtraggio in avanti è causale (usa dati fino a `t`), ma l'algoritmo di Baum-Welch (stima iterativa dei parametri) e la decodifica globale (Viterbi) usano l'**intera** sequenza [2]. Se i parametri sono stimati sull'intera serie e poi valutati sulla stessa, c'è anticipazione. Nel documento si lasciano due strade, senza sceglierne una: (a) i parametri si evolvono con il GA, nessuna stima globale; (b) i parametri si stimano solo su dati che **precedono** la valutazione, a cura di R6. Soluzioni degeneri: regimi che collassano su uno solo, regimi senza osservazioni. Sfruttamento della fitness: dato che i regimi sono non osservati, non c'è una "verità" con cui giudicarli: l'unico giudice è la fitness [ipotesi]. Applicazione al trading: [12], [13] e [14] trattano regimi in economia e nei mercati, non strategie evolute con un GA; che questa combinazione funzioni **non è stato accertato**.

**Genotipo di massima.** Parametri di emissione per regime, matrice di transizione, mappa regime-azione, eventualmente K.

**Fonti.** [2] (testo letto per le formule citate), [12], [13], [14] (schede o abstract).

## 6. Il contratto di strategia, forma per forma

Il contratto è quello di `assertStrategy` e `StrategyIndividual` (`src/engine/strategy.js`) e della sezione "Strategy contract" di [Simulator overview](../simulator-overview/#strategy-contract). La decisione di riferimento è `.swhouse/memory/decisions/2026-10-11-strategy-contract.md`, che ha confidenza **Medium**: è provata con una sola strategia di test. **L'adeguatezza dichiarata qui è fatta sulla carta fino a E2.**

**Membri richiesti.** `kind` (stringa non vuota); `labels` (lista finita e non vuota di stringhe); `init()`, `reset()`, `feed()`, `getCAGR()`, `getPerformanceSummary()`; `describe()` che restituisce `{ label, indicators }` con numeri finiti; `serialize()` che restituisce il genoma come JSON; `decide()` che restituisce `buy`, `sell` o `hold` (`src/engine/strategy.js`, righe 4-5, 12-33, 35-87). Le sottoclassi di `StrategyIndividual` implementano `initIndicators`, `updateIndicators`, `resetIndicators`, `decide`, `describe`, `serialize`. I parametri di rischio del `Trader` restano parametri evolvibili o fissi, **comuni a ogni forma**.

**Frasi uniche per tutte le forme.**

- **`hold`** significa "non cambiare posizione": `feed` non chiama né `buy()` né `sell()` (`strategy.js`, righe 46-55). L'FSM ha `hold` implicito (uno stato senza azione). Per le forme a punteggio, `hold` è la fascia tra le due soglie.
- **`labels`** è una lista fissa. Le forme con uscita continua (punteggio, rete, fuzzy, albero) devono derivarla: le tre azioni, oppure fasce dell'uscita. La perdita è nell'etichetta, non nel numero: l'uscita continua si può comunque esporre in `describe().indicators`, perché richiede solo numeri finiti. **Richiesta di estensione del contratto** da trattare in E2: nessuna forma continua ha etichette "naturali" a parte l'HMM (i regimi).
- **`crossover` e `mutate`.** `assertStrategy` non li richiede, ma il GA di Consilium chiama `parent1.crossover(parent2)` e `child.mutate(rate)` (`src/vendor/consilium/ga.js`, righe 116-125, 345-351). Per ogni forma che evolve serve implementarli: è materia di R3 e di E2, non un requisito di replay.
- **Forme con stato** (HMM, NEAT ricorrente, GP con registri, Kalman): `resetIndicators()` deve riportare lo stato iniziale; l'ordine per barra e la sua reinizializzazione sono come per i filtri IIR (`algorithm.js`, righe 342-358).

| Forma | `labels` | `describe()` e `serialize()` | Cosa si perde | Esito |
|---|---|---|---|---|
| FSM (riferimento) | 9 stati | 4 filtri; genoma JSON | nulla (è il riferimento) | diretto |
| Lineare | 3 fasce di `s[t]` | `s[t]` come numero; pesi JSON | la distanza dalla soglia, se non esposta | con adattamento |
| Albero / GP | 3 fasce dell'uscita | uscita e nodi scelti; albero JSON | i valori intermedi, se non esposti | con adattamento |
| Rule list | l'azione, o l'indice della regola | condizioni valutate; lista JSON | il grado con cui una regola scatta | con adattamento (diretto con etichetta = azione) |
| MLP / NEAT | 3 fasce dell'uscita | uscite e attivazioni; pesi e topologia JSON | il significato interno degli strati | con adattamento |
| Fuzzy | 3 fasce dell'uscita | gradi di appartenenza; parametri JSON | la composizione delle regole attive | con adattamento |
| HMM | K regimi | credenza (K numeri); parametri JSON | niente rilevante nel replay | diretto |

L'adeguatezza di tutte le forme è provata solo sulla carta: la prova reale è E2.

## 7. Griglia di confronto

Riepilogo delle dimensioni del capitolo 4, con il nome del livello definito lì. **Nessun punteggio totale.** Le celle riportano il livello assegnato nelle schede; l'assegnazione è un giudizio dell'autore, i fatti sono nelle schede. Righe aggiuntive per le due varianti di memoria dove la decisione di Luca è aperta; **non c'è la riga buy&hold** (non ha un genoma: le dimensioni non hanno senso).

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

**Letture della griglia, senza pesi.**

- **Memoria.** Le forme feedforward ("a monte") dipendono dagli indicatori di R2 per la memoria; le forme con stato proprio la costruiscono nel lettore. L'FSM attuale appartiene alla seconda classe.
- **Costo.** A parità di parametri di esempio, **tutte le forme sono nell'ordine delle decine o centinaia di operazioni per barra**: il costo per barra non discrimina. Il costo che discrimina è altrove (dimensione massima dei programmi, stima dei parametri dell'HMM, dimensione della popolazione) ed è materia di R5 e R6; qui non si dà una stima in secondi perché non è stata misurata.
- **Compromesso evidente.** Interpretabilità e ricercabilità vanno in direzione opposta all'espressività: le forme con spazio piccolo e interpretabilità diretta sono quelle con espressività minore (affine, a tratti); le universali sono sempre "con calcolo" o "solo simulando" [ipotesi].

## 8. Famiglie e forme non portate a scheda

**Famiglia "reti".** MLP e NEAT condividono la rete (stessa funzione di attivazione, stesso conteggio dei pesi); NEAT aggiunge l'evoluzione della topologia [1]. La rete ricorrente a riserva (reservoir computing, echo state network) tiene fissa una rete ricorrente casuale e addestra solo la lettura [19]: forma di contrasto, non scheda. [19] è una pagina di un gruppo di ricerca (gruppo MINDS, pagina `ai.rug.nl/minds/esnresearch`), non una rassegna con revisione.

**Famiglia "programmi".** Punteggio lineare, alberi/GP e rule list condividono i predicati (confronti tra ingressi e margini); la rule list è un albero degenere in lista ordinata [ipotesi]. Il GP lineare e il CGP differiscono dall'albero per rappresentazione e operatori [5].

**Evoluzione grammaticale (GE).** Il genoma è una stringa di interi che una grammatica traduce in un programma o in una regola [18] (vista la scheda bibliografica). Cambiare la grammatica cambia la **famiglia** di forme raggiungibili senza cambiare l'algoritmo di ricerca: stesso motore, forme diverse. È un **meccanismo di codifica**, non una forma, quindi di competenza di R3, a cui si rimanda. Una grammatica che permettesse di riprodurre un FSM ricreerebbe la forma che si vuole lasciare: la grammatica decide le forme raggiungibili, e restringerla è un modo di escluderne alcune.

**Escluse in anticipo.** Gli alberi di decisione addestrati con algoritmo greedy (CART e simili) si addestrano senza algoritmo genetico: fuori dall'epica [ipotesi]. La regressione simbolica è un'istanza del GP (stessa scheda). L'apprendimento per rinforzo profondo esce dal contratto (un genoma serializzabile a forma fissa) e dall'epica (GA) [ipotesi].

## 9. Sintesi per la decisione di Luca

**Premessa.** I due candidati sotto sono presentati **sulle dimensioni** delle schede, mai sul rendimento atteso. Non sono una scelta: sono ciò che il confronto dà quando si guardano insieme ricercabilità, interpretabilità, rischio di adattarsi al rumore e integrazione con il motore. La scelta è di Luca.

### 9.1 Candidato A: punteggio lineare di indicatori con soglie (base prudente)

**Motivazione.**
- **Spazio di ricerca piccolo** (9 numeri con n = 6) rispetto a 43 pesi (MLP di esempio) o alla struttura variabile di GP e rule list: meno capacità di adattarsi al rumore su 2517 barre e un solo titolo [4], [ipotesi].
- **Interpretabilità diretta**: il segno e il peso di ogni indicatore si leggono; è la forma più facile da portare a Luca, a Simone e a chi implementa E2.
- **Crossover e mutazione naturali** su un vettore di numeri.
- **Contratto con adattamento minimo**: tre fasce dell'uscita come `labels`; `describe()` espone il punteggio.
- **Memoria a monte**: nessuno stato da gestire in `reset()`. L'istanza con Kalman aggiunge uno stato continuo piccolo (livello e pendenza), come variante.
- La **forma minima** (un filtro e una soglia) serve da metro: una forma più ricca deve giustificare perché l'espressività in più non è solo capacità di adattarsi al rumore [ipotesi di metodo].

**Condizioni di scarto.** Si passa al candidato B se E2 mostra che le decisioni utili richiedono **congiunzioni** tra indicatori (per esempio "prezzo sopra il filtro **e** volume sopra la media") che una somma pesata con una soglia non rappresenta, o se la sola memoria degli indicatori di R2 non basta e serve uno stato proprio.

### 9.2 Candidato B: alberi di espressioni (GP), variante "solo indicatori"

**Motivazione.**
- **Espressività universale** con **crossover naturale** sui sottoalberi [5]; è la forma con più precedenti nella scoperta evolutiva di regole di trading [6], [7] (il primo letto solo come riassunto).
- **Interpretabilità con calcolo**: un albero piccolo è una formula leggibile; è più leggibile di una rete.
- Copre il caso che A non rappresenta (congiunzioni, soglie condizionate); un albero può esprimere come caso particolare una rule list e un punteggio lineare [ipotesi].
- **Contratto con adattamento**: etichette dalle fasce dell'uscita; `describe()` espone l'uscita.

**Condizioni di scarto.** Si passa ad A o alla rule list se, in E2, la dimensione degli alberi cresce senza miglioramento (bloat) [5], se la leggibilità degli alberi evoluti non regge (alberi grandi e non interpretabili), o se il divario tra fitness di addestramento e di valutazione cresce con la dimensione dell'albero.

**Le due varianti di memoria** (domanda 2): per B, "solo indicatori" è descritto come la base perché mantiene `reset()` banale e il programma puro; "con memoria interna" è descritta nel capitolo 5.2 con pro e contro. **Non si sceglie**: se Luca ammette registri o ricorrenze, B si estende senza cambiare candidato; il costo è nell'interpretabilità e nella maggiore vicinanza a una macchina a stati.

### 9.3 Forme di confine e di riserva

- **HMM** (5.6): forma più vicina al problema che l'FSM tenta di risolvere (regimi con transizioni) e l'unica con etichette finite per costruzione. È **forma di confine**: ha la struttura di una macchina a stati probabilistica. Ammessa dall'operatore, **non** portata come candidato perché ha una dimensione in più da risolvere (la stima dei parametri senza anticipazione, a cura di R6) e nessuna fonte sull'uso con un GA nel trading è stata trovata. Se Luca la preferisce, resta una scheda piena.
- **Rule list** (5.3): versione vincolata e più leggibile del GP. Candidata di riserva se B si rivela troppo libero.
- **NEAT e MLP** (5.4): espressività universale a prezzo di interpretabilità minima. Non portate: la rassegna non trova un criterio per cui l'espressività in più serva rispetto ad A e B [ipotesi].
- **Fuzzy** (5.5): interpretabilità buona sulle singole regole ma molti parametri (54 per n = 6) e accorgimenti nel crossover; nessun vantaggio visibile nelle dimensioni rispetto a B.

### 9.4 Ciò che non si è potuto accertare

- **Applicazione al trading** di HMM, Kalman, reti ricorrenti e reservoir: nessuna fonte letta che le valuti con un GA. [12], [13] e [14] trattano regimi in economia e nei mercati.
- **Equivalenza tra filtro di Kalman a guadagno costante e livellamento esponenziale doppio**: non letta in una fonte; [15] presenta i modelli ma non l'equivalenza.
- **Fonti non lette nel testo**: [6] (solo il riassunto di un corso; l'articolo di Allen e Karjalainen non è stato letto), [7], [10], [12], [13], [16], [17], [18] (schede o abstract). Learning classifier system (Urbanowicz e Moore, 2009) e CART (Breiman e altri, 1984): identificate, **non verificate**, non usate come prova.
- **Fuzzy come approssimatore universale** e **uso di reti e fuzzy con un GA nel trading** (oltre a [11]): non verificati.
- **Capacità di adattamento al rumore per forma** non misurata. Un esperimento di controllo (far evolvere ciascuna forma con lo stesso budget e la stessa fitness su serie senza struttura prevedibile e misurare il divario tra addestramento e valutazione) la misurerebbe, ma richiede codice e calcoli su dati: **è fuori dal perimetro di questo ciclo** e resta una domanda per un ciclo futuro (domanda 5). Il suo esito dipenderebbe dalla fitness scelta (R5), quindi misurerebbe forma e fitness insieme.
- **Tutta l'adeguatezza al contratto** è sulla carta fino a E2; il contratto è provato con una sola strategia di test.

### 9.5 Domande per Luca

La domanda 1 sul requisito di memoria ha già risposta: il requisito "non una macchina a stati" **non è stringente**, HMM e reti ricorrenti sono forme da valutare.

2. **Ricorrenze e registri in NEAT e GP.** Si ammettono varianti con stato ricorrente o registri, o solo varianti feedforward con la memoria negli indicatori a monte? **Ancora aperta.** Entrambe le varianti sono descritte con pro e contro nei capitoli 5.2 e 5.4; è una scelta di progetto, non una proprietà della forma.
3. **Peso di interpretabilità ed espressività.** Quanto pesa l'interpretabilità rispetto all'espressività nella scelta del candidato? La rassegna non assegna pesi.
4. **Un candidato o due.** E2 parte da una forma semplice (A, con la minima come metro) e da una ricca come secondo candidato, o da due forme dello stesso livello?
5. **Esperimento di controllo.** Si vuole un ciclo futuro con l'esperimento descritto in 9.4, e a valle di quale ciclo (E2 o il protocollo di valutazione R6)?

### 9.6 Scelta di Luca

La scelta e la sua data si registrano nel file del ciclo (`.swhouse/cycles/current-010.md`, blocco "Human Verification"), non in questo documento. Questo documento resta una rassegna.

## 10. Riferimenti

Stato: **letto** = testo integrale scaricato e letto per le parti citate; **scheda** = vista solo la scheda bibliografica o l'abstract; **non verificata** = identificata ma non raggiunta. Tutte le verifiche: 2026-10-11 (verificato il 2026-10-11). L'URL ha risposto con codice 200 salvo dove indicato.

1. K. O. Stanley, R. Miikkulainen, *Evolving Neural Networks through Augmenting Topologies*, Evolutionary Computation 10(2), 99-127, 2002. https://www.cse.unr.edu/~sushil/class/gas/papers/NEAT.pdf. Letto (abstract, introduzione, memoria e connessioni ricorrenti, competing conventions). Verificato il 2026-10-11.
2. L. R. Rabiner, *A Tutorial on Hidden Markov Models and Selected Applications in Speech Recognition*, Proceedings of the IEEE 77(2), 257-286, 1989. https://people.engr.tamu.edu/rgutier/web_courses/cpsc689_s07/rabiner1989tutorialHMM.pdf. Letto per variabile in avanti, induzione, scaling e Baum-Welch. Verificato il 2026-10-11. Il testo è sul riconoscimento del parlato, non sulla finanza.
3. R. E. Kalman, *A New Approach to Linear Filtering and Prediction Problems*, Journal of Basic Engineering (Trans. ASME) 82, 1960. https://www.cs.yale.edu/homes/yry/readings/general/Kalman1960.pdf. Letto (abstract e introduzione: stima ricorsiva a tempo discreto). Verificato il 2026-10-11. Non tratta livellamento esponenziale né prezzi.
4. D. H. Bailey, J. M. Borwein, M. López de Prado, Q. J. Zhu, *The Probability of Backtest Overfitting*, versione di novembre 2014 (working paper). https://carmamaths.org/jon/backtest2.pdf. Letto per la parte sul metodo "hold-out". Verificato il 2026-10-11. Rivista e anno di pubblicazione **non confermati** dal PDF letto.
5. R. Poli, W. B. Langdon, N. F. McPhee, *A Field Guide to Genetic Programming*, 2008. https://faculty.washington.edu/seattle/GA-2008/FieldGuideGP.pdf. Letto per i capitoli 7.1 (GP lineare), 7.2.3 (CGP) e 11.3 (bloat); il resto consultato per l'indice. Verificato il 2026-10-11.
6. F. Allen, R. Karjalainen, *Using Genetic Algorithms to Find Technical Trading Rules*, Journal of Financial Economics 51, 1999. Letto solo un **riassunto di corso**: https://www.cs.montana.edu/courses/spring2007/536/materials/Lopez/GAsInFinance.html. L'articolo non è stato letto; rivista, volume e anno sono quelli indicati dalla pagina del riassunto. Verificato il 2026-10-11 (scheda).
7. Y. Hu, K. Liu, X. Zhang, L. Su, E. W. T. Ngai, M. Liu, *Application of evolutionary computation for rule discovery in stock algorithmic trading: A literature review*, Applied Soft Computing 36, 534-551, 2015. https://research.polyu.edu.hk/en/publications/application-of-evolutionary-computation-for-rule-discovery-in-sto (DOI 10.1016/j.asoc.2015.07.008). Scheda e abstract letti; la pagina dell'editore ha risposto 403. Verificato il 2026-10-11 (scheda).
8. R. L. Rivest, *Learning Decision Lists*, Machine Learning 2(3), 229-246, 1987. https://people.csail.mit.edu/rivest/pubs/Riv87b.pdf. Letto (abstract e definizione di decision list). Verificato il 2026-10-11.
9. K. Hornik, M. Stinchcombe, H. White, *Multilayer feedforward networks are universal approximators*, Neural Networks 2(5), 359-366, 1989. https://cognitivemedium.com/magic_paper/assets/Hornik.pdf. Letto (abstract e teoremi). Verificato il 2026-10-11.
10. L. A. Zadeh, *Fuzzy Sets*, Information and Control 8(3), 338-353, 1965. https://mathnet.ru/eng/fssc12 (DOI 10.1016/S0019-9958(65)90241-X). Scheda e abstract; il testo integrale non è stato raggiunto. L'URL risponde in modo intermittente (200 in tre prove su sei, 503 nelle altre). Verificato il 2026-10-11 (scheda).
11. F. M. Raimondi, S. Pennacchio, P. Via, M. Mulè, *A New Fuzzy Logic Controller for Trading on the Stock Market*, ICEIS 2007 (Ninth International Conference on Enterprise Information Systems), 322-329. https://www.scitepress.org/Papers/2007/23458/23458.pdf. Letto (abstract e parti su regole e funzioni di appartenenza). Verificato il 2026-10-11. Lavoro di conferenza su un caso; nessun risultato riportato qui.
12. J. D. Hamilton, *A New Approach to the Economic Analysis of Nonstationary Time Series and the Business Cycle*, Econometrica 57(2), 357-384, 1989. https://www.econometricsociety.org/publications/econometrica/1989/03/01/new-approach-economic-analysis-nonstationary-time-series-and. Scheda dell'editore con abstract. Verificato il 2026-10-11 (scheda).
13. A. Ang, A. Timmermann, *Regime Changes and Financial Markets*, NBER Working Paper 17182, 2011. https://www.nber.org/papers/w17182. Scheda con abstract. Verificato il 2026-10-11 (scheda). La versione pubblicata (Annual Review of Financial Economics, 2012) non è stata verificata.
14. R. Gupta, S. Kapoor, H. Gupta, S. Natesan, *A forest of opinions: A multi-model ensemble-HMM voting framework for market regime shift detection and trading*, Data Science in Finance and Economics 5(4), 466-501, 2025. https://www.aimspress.com/aimspress-data/dsfe/2025/4/PDF/DSFE-05-04-019.pdf. Letti abstract e introduzione. Verificato il 2026-10-11.
15. R. J. Hyndman, G. Athanasopoulos, *Forecasting: Principles and Practice*, 3a edizione online, OTexts, capitolo 8 "Exponential smoothing". https://otexts.com/fpp3/exponential-smoothing.html. Letto in parte (livellamento esponenziale semplice, metodo lineare di Holt, modelli di stato). Verificato il 2026-10-11. Anno di edizione non confermato dalla pagina letta.
16. J. F. Miller, *Cartesian Genetic Programming*, capitolo 2 in J. F. Miller (a cura di), *Cartesian Genetic Programming*, Springer, 2011, 17-34. https://gpbib.cs.ucl.ac.uk/gp-html/Miller_2011_CGP_ch2.html. Scheda bibliografica con abstract. Verificato il 2026-10-11 (scheda).
17. J. F. Miller, *Cartesian Genetic Programming: its status and future*, Genetic Programming and Evolvable Machines 21(1-2), 129-168, 2020. https://gpbib.pmacs.upenn.edu/gp-html/Miller_GPEM20.html. Scheda bibliografica con abstract. Verificato il 2026-10-11 (scheda).
18. C. Ryan, M. O'Neill, J. J. Collins, *Introduction to 20 Years of Grammatical Evolution*, in *Handbook of Grammatical Evolution*, Springer, 2018, 1-21. https://gpbib.pmacs.upenn.edu/gp-html/Ryan_2018_hbge_intro.html. Scheda bibliografica con abstract. Verificato il 2026-10-11 (scheda).
19. Gruppo MINDS, *Echo State Networks and Reservoir Computing*, pagina di riferimento ospitata su `ai.rug.nl`. https://www.ai.rug.nl/minds/esnresearch/. Pagina letta: è una pagina di gruppo di ricerca, non una rassegna con revisione. Verificato il 2026-10-11.
20. Consilium, *Train/Holdout Experiments, Generalizzazione della popolazione GA*, 2026-09-12 (rapporto interno, sola lettura): `archive/reports/2026-09-12_train-test-holdout-experiments.md` nel repository Consilium. Letto per intero. Riguarda titoli e panieri di titoli quotati con una fitness basata sul CAGR; non è la serie ENI di questo PoC.

**Non verificate, non usate come prova.** R. J. Urbanowicz, J. H. Moore, *Learning Classifier Systems: A Complete Introduction, Review, and Roadmap*, Journal of Artificial Evolution and Applications, 2009 (DOI 10.1155/2009/736398): la pagina dell'editore risponde con errore 403 e la copia su PubMed Central con una verifica anti-robot. L. Breiman, J. H. Friedman, R. A. Olshen, C. J. Stone, *Classification and Regression Trees*, 1984: nessuna pagina letta.

**Conteggio.** 20 fonti numerate. **Letto il testo** (almeno per le parti citate): 1, 2, 3, 4, 5, 8, 9, 11, 14, 15, 19, 20 (12). **Solo scheda bibliografica o abstract**: 6 (riassunto di corso), 7, 10, 12, 13, 16, 17, 18 (8). **Identificate e non verificate**: 2 (LCS, CART), non numerate e non usate come prova.

## 11. Glossario

- **Algoritmo genetico (GA).** Metodo di ricerca che fa evolvere una popolazione di candidati con selezione, crossover (scambio di parti tra due genitori) e mutazione (piccole modifiche casuali).
- **Anticipazione dei dati (look-ahead bias).** Errore per cui una decisione usa informazioni che alla barra corrente non erano ancora disponibili, e quindi il risultato è migliore di quello ottenibile davvero.
- **ATR (average true range, intervallo medio vero).** Indicatore tecnico di volatilità: media dell'ampiezza giornaliera dell'intervallo tra massimo e minimo, corretta per i salti tra un giorno e l'altro.
- **Backtest.** Prova di una strategia sui dati storici, come se fosse stata applicata allora.
- **Barra.** Un periodo di negoziazione (qui un giorno) riassunto nei suoi valori OHLCV.
- **Buy&hold.** Strategia di riferimento: comprare all'inizio e tenere fino alla fine, senza altre operazioni.
- **CAGR (compound annual growth rate).** Tasso di crescita annuo composto: il rendimento annuo costante che porterebbe dal capitale iniziale a quello finale nel periodo.
- **Crossover.** Operatore dell'algoritmo genetico che combina parti di due genitori per produrre un figlio.
- **Fitness.** Numero che dice quanto un candidato è "buono" per l'algoritmo genetico; qui oggi è basato sul CAGR.
- **Genoma.** L'insieme dei parametri che definiscono una strategia, ciò che l'algoritmo genetico fa evolvere.
- **Hold-out.** Parte dei dati tenuta fuori dall'addestramento e usata solo per valutare.
- **IIR (infinite impulse response).** Filtro ricorsivo: ogni valore dipende dal valore precedente dell'uscita oltre che dal dato nuovo.
- **Indicatore tecnico.** Numero calcolato dai prezzi e dai volumi passati (una media mobile, un oscillatore) per riassumerne l'andamento.
- **Look-ahead bias.** Vedi anticipazione dei dati.
- **Media mobile.** Media dei prezzi delle ultime N barre.
- **OHLCV.** Open, high, low, close, volume: prezzo di apertura, massimo, minimo, chiusura e volume scambiato in una barra.
- **Overfitting (sovradattamento).** Adattarsi troppo ai dati di addestramento, compreso il rumore, e funzionare peggio su dati nuovi.
- **RSI (relative strength index).** Indicatore tecnico che confronta l'entità media dei rialzi con quella dei ribassi recenti.
- **Stop loss.** Soglia di perdita oltre la quale una posizione viene chiusa automaticamente.
- **Take profit.** Soglia di guadagno oltre la quale una posizione viene chiusa automaticamente.
- **Volume.** Numero di titoli scambiati nella barra.
