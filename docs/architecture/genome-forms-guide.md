---
title: "Guida alle forme di genoma"
layout: doc
last_verified: 2026-10-14
---

# Guida alle forme di genoma

<style>
.doc-content table { display: block; max-width: 100%; overflow-x: auto; }
.doc-content li, .doc-content p { overflow-wrap: anywhere; }
</style>

Questa guida spiega, con parole semplici e con esempi numerici, quali forme potrebbe avere il genoma del nuovo motore di SwarmTrader-core, in alternativa alla macchina a stati ereditata da Consilium. Serve a Luca per scegliere. È scritta per chi sa programmare ma non ha competenze di finanza né conosce algoritmi genetici, reti neurali, modelli a stati nascosti, logica fuzzy o programmazione genetica: ogni termine è spiegato da zero nel capitolo in cui compare, anche se è già comparso prima.

**Rapporto con la rassegna.** La guida tratta lo stesso argomento della [Rassegna delle forme di genoma](../genome-forms-review/), in versione più estesa e con un esempio numerico per ogni forma. Fatti, fonti e candidati sono quelli della rassegna, che resta come riferimento compatto (griglia dei livelli, tabella del contratto di strategia, sintesi per la decisione). Nella guida la rassegna è citata per nome di sezione, mai per numero di capitolo. Il contratto di strategia del motore è descritto anche in [Simulator overview](../simulator-overview/#strategy-contract).

> **Avvertenza: tutti i numeri degli esempi sono inventati.** Gli esempi usano un dataset di 20 giorni di prezzi e volumi scritto a mano (capitolo 1), non dati di ENI né di nessun mercato. I risultati mostrano come funziona il meccanismo di ogni forma. Non dicono nulla sulla qualità delle forme, né su come si comporterebbero sul mercato reale, e nessun esempio è una promessa di guadagno. Se in un esempio una forma ottiene più o meno del buy&hold (comprare il primo giorno e tenere), non ne segue niente.

**Come è fatta.** Il capitolo 1 spiega il problema e gli strumenti di base (prezzi, indicatori, memoria, genoma). Il capitolo 2 spiega l'algoritmo genetico e come si valuta un genoma. I capitoli da 3 a 9 descrivono una forma ciascuno: la macchina a stati attuale, il punteggio lineare, gli alberi di espressioni, la lista di regole, le reti neurali, la logica fuzzy, il modello a stati nascosti. Il capitolo 10 le confronta, mostra le decisioni di tutti gli esempi giorno per giorno e raccoglie le domande per Luca. Seguono il glossario e i riferimenti.

**Convenzioni.** I decimali usano la virgola nel testo e nelle tabelle, il punto nei blocchi di codice. I numeri tra parentesi quadre, per esempio [4], rimandano ai Riferimenti (stessa numerazione della rassegna). **[ipotesi]** segna un giudizio dell'autore senza una fonte letta. Le formule e i disegni sono in blocchi di codice. I numeri degli esempi sono stati calcolati con script di lavoro scritti durante la stesura; gli script non fanno parte del repository.

**Percorso rapido, per chi ha fretta.**

1. Leggere la sezione «In breve» qui sotto (una pagina).
2. Nel capitolo 1 leggere le sezioni 1.1.5 e 1.1.6 (che cosa decide un genoma e che cos'è l'anticipazione dei dati), 1.3.2 (la media mobile esponenziale) e 1.4 (due posti dove può stare la memoria).
3. Di ogni capitolo da 3 a 9 leggere «In una frase e un'analogia» e «In breve».
4. Passare al capitolo 10: tabella di confronto, griglia giorno per giorno, domande per Luca.
5. Quando compare un termine sconosciuto, cercarlo nel glossario.

Chi ha tempo legga i capitoli nell'ordine, a partire dalla macchina a stati attuale (capitolo 3): serve a capire che cosa si lascia e che cosa si cerca.

## In breve

Questa sezione riassume la guida in una pagina, senza gergo. Non sostituisce i capitoli, ma permette di capire che cosa si decide e quali sono le opzioni.

### Che cosa si decide

Ogni giorno di borsa, alla chiusura, una strategia di trading deve scegliere una di tre mosse: comprare (`buy`), vendere (`sell`) o aspettare (`hold`). Un **genoma** è l'insieme di numeri e di scelte che definisce come la strategia decide. Un **algoritmo genetico** prova molti genomi sui dati storici, tiene i migliori e ne produce di nuovi mescolando (crossover) e modificando a caso (mutazione) i loro numeri, un po' come un orticoltore che sceglie e incrocia le piante migliori.

Oggi il genoma ha la forma di una **macchina a stati**: nove «situazioni» collegate da regole che confrontano medie di prezzi e di volumi. Il progetto vuole capire quali altre forme di genoma esistano, soprattutto forme in cui il ricordo del passato venga da **indicatori noti** (medie mobili e simili) e non da una macchina a stati. **Luca deve decidere da quale forma partire** per il nuovo genoma. La guida descrive le opzioni e non sceglie.

### Le sette forme, in una riga ciascuna

- **Macchina a stati attuale** (capitolo 3). Nove stati e regole di passaggio tra uno e l'altro. Ricorda grazie allo stato in cui si trova. È già integrata nel motore; la memoria deve essere scoperta dall'evoluzione e un nome di stato non dice che cosa ricordi.
- **Punteggio lineare** (capitolo 4). Ogni indicatore ha un peso, si somma tutto e due soglie decidono: sopra si compra, sotto si vende. Ha pochi numeri e si legge subito. Non sa dire «se A e B insieme», a meno che qualcuno prepari un indicatore apposta.
- **Alberi di espressioni, programmazione genetica** (capitolo 5). Il genoma è una formula scritta ad albero, e l'evoluzione ne cambia la forma. Sa esprimere quasi qualsiasi regola, ma gli alberi tendono a crescere senza migliorare e i grandi non si leggono.
- **Lista di regole** (capitolo 6). Un elenco ordinato di «se condizione allora azione»: vince la prima regola vera. Si legge come un regolamento. Mescolare due liste può dare figli senza senso, e non sa parlare di tempo trascorso.
- **Reti neurali** (capitolo 7). Piccoli calcoli collegati, con molti pesi. Sono molto espressive e poco leggibili. NEAT fa evolvere anche la struttura della rete.
- **Logica fuzzy** (capitolo 8). Regole in forma di frase che lavorano con gradi tra 0 e 1 invece di sì e no, così la decisione cambia senza salti. Ha molti parametri e richiede cure nel crossover.
- **Modello a stati nascosti, HMM** (capitolo 9). Tiene una probabilità per ciascun «regime» di mercato (salita, laterale, calo) e la aggiorna ogni giorno. È di fatto una macchina a stati probabilistica, quindi è la forma più vicina a quella che si vuole lasciare.

### Che cosa propone la rassegna

La rassegna porta a Luca due candidati, presentati sulle caratteristiche delle forme e mai sul rendimento atteso.

- **Candidato A, punteggio lineare con soglie.** È la base prudente: pochi numeri, lettura diretta, crossover e mutazione semplici. La sua **forma minima** (un indicatore e una soglia) fa da metro: una forma più ricca deve giustificare perché ciò che aggiunge non sia solo capacità di adattarsi al rumore dei dati. Si passa a B se la prova in E2 mostra che servono regole del tipo «A e B insieme» o che gli indicatori da soli non danno memoria sufficiente.
- **Candidato B, alberi di espressioni nella variante «solo indicatori».** Copre ciò che A non sa fare e ha un crossover naturale. Si passa ad A o alla lista di regole se, in E2, gli alberi crescono senza migliorare, se non si leggono più o se il divario tra risultati su dati di addestramento e su dati nuovi cresce con la dimensione.

Le altre forme restano come riserva o come forme di confine (l'HMM per la vicinanza alla macchina a stati). Le condizioni di scarto complete e le conseguenze per le altre ricerche sono nel capitolo 10.

### Che cosa serve da Luca

La domanda 1 ha già risposta: il requisito «non una macchina a stati» **non è stringente**, quindi HMM e reti ricorrenti sono ammessi. Restano quattro domande, spiegate con esempi nel capitolo 10.

- **Domanda 2.** Si ammettono registri e ricorrenze, cioè una memoria propria del genoma oltre a quella degli indicatori? Ancora aperta.
- **Domanda 3.** Quanto pesa la leggibilità rispetto all'espressività?
- **Domanda 4.** Si parte da una forma sola, semplice, o da due, una semplice e una ricca?
- **Domanda 5.** Si vuole un esperimento di controllo su dati senza struttura prevedibile, per misurare la capacità di ogni forma di adattarsi al rumore? E dopo quale ciclo?

### Una cosa da ricordare

I numeri degli esempi sono inventati e non formano una classifica. Dalla guida si capisce come funziona ciascuna forma, che cosa ricorda, quanto costa in numeri da evolvere e che cosa la rende comoda o scomoda. Non si ricava quale forma «guadagni di più», perché questa guida non lo ha misurato.

## 1. Il problema e gli strumenti di base

Questo capitolo non descrive una forma di genoma. Spiega il problema che il progetto affronta e gli strumenti di base che gli altri capitoli danno per noti: che cosa decide una strategia ogni giorno, che cos'è un indicatore, che cosa vuol dire «memoria», che cos'è un genoma, come una forma di genoma si collega al nostro motore. Non servono competenze di finanza. Ogni termine è spiegato alla prima occorrenza, con un esempio.

Tutti i numeri della guida sono **inventati**. Servono a mostrare i meccanismi, non dicono nulla sulla qualità degli approcci né sul mercato reale. Lo ripetiamo più volte perché è facile dimenticarlo guardando una tabella.

### 1.1 Che cosa facciamo, in parole povere

#### 1.1.1 Azione, prezzo, volume

Un'**azione** è una piccola quota di proprietà di un'azienda. Se un'azienda è quotata in borsa, le sue azioni si comprano e si vendono ogni giorno lavorativo. Il progetto usa le azioni di una sola azienda, ENI, perciò si parla di «un titolo».

Per ogni giorno di borsa ci interessano due numeri.

- Il **prezzo**: quanto costa una azione in quel momento, in euro. Durante il giorno cambia di continuo.
- Il **volume**: quante azioni sono state scambiate in totale in quel giorno. Un volume alto significa che molte persone hanno comprato e venduto; un volume basso, che c'è stata poca attività.

#### 1.1.2 La barra giornaliera e i valori OHLCV

Il prezzo cambia durante la giornata, quindi un solo numero non basta a descriverla. Per ogni giorno si registrano cinque valori, detti **OHLCV** dalle iniziali inglesi.

| Sigla | Nome | Significato |
|---|---|---|
| O | open, apertura | prezzo della prima operazione della giornata |
| H | high, massimo | prezzo più alto raggiunto nella giornata |
| L | low, minimo | prezzo più basso raggiunto nella giornata |
| C | close, chiusura | prezzo dell'ultima operazione della giornata |
| V | volume | numero di azioni scambiate nella giornata |

Questo insieme di cinque valori è una **barra** (in inglese, bar o candle). Una barra riassume un giorno, come una riga di un log riassume una giornata di lavoro. I dati del progetto sono 2517 barre giornaliere di ENI, dal 2016-09-29 al 2026-09-28 (`src/data/eni-ohlcv.json`).

Esempio con numeri inventati: un giorno il titolo apre a 10,00 euro, sale fino a 10,40, scende fino a 9,90 e chiude a 10,30, con 1000 azioni scambiate. La barra è O = 10,00, H = 10,40, L = 9,90, C = 10,30, V = 1000.

#### 1.1.3 Comprare, vendere, aspettare

Una strategia di trading ha tre mosse.

- **Comprare** (`buy`): si spende denaro e si ottengono azioni.
- **Vendere** (`sell`): si cedono le azioni e si ottiene denaro.
- **Aspettare** (`hold`, in italiano «tenere»): non si fa nulla e la situazione resta quella di prima.

Da qui due termini che ricorrono sempre.

- **Posizione aperta**: si possiedono azioni. Si dice anche «essere in posizione» o «avere una posizione lunga». Se si ha solo denaro, non c'è posizione aperta.
- **Capitale**: il denaro di cui si dispone all'inizio, qui 1000 euro.

Chi compra spera che il prezzo salga, per rivendere a un prezzo più alto. Esempio: con 1000 euro si comprano 100 azioni a 10 euro. Se il prezzo sale a 11, le azioni valgono 1100 euro. Il guadagno è 100 euro.

Il **rendimento** è il guadagno espresso in percentuale del capitale iniziale: (valore finale diviso valore iniziale) meno 1, per 100. Nell'esempio, 1100 / 1000 = 1,10, quindi +10 per cento. Con un valore finale di 950 euro il rendimento sarebbe -5 per cento: una perdita.

Il **valore totale** in un dato giorno è denaro più azioni per prezzo di quel giorno. È il numero che il simulatore ricalcola per vedere come va una strategia.

#### 1.1.4 La strategia di riferimento: compra e tieni (buy&hold)

La strategia più semplice che esista è comprare il primo giorno e non toccare più nulla fino alla fine. Si chiama **buy&hold** (in italiano «compra e tieni»). Non richiede nessuna decisione, quindi è il metro di confronto: una strategia più complicata si giustifica solo se fa qualcosa che questa non fa. Sarebbe un cattivo segno complicarsi la vita per ottenere meno di chi non ha fatto niente.

Un'avvertenza: nel mondo reale nessuna strategia batte il buy&hold in modo garantito, e ottenere di più su dati storici non prova che accada anche in futuro. Questa guida non fa nessuna promessa del genere (è un tema ripreso nel capitolo 2).

#### 1.1.5 Che cosa decide un genoma ogni giorno

Un **genoma** è l'insieme dei numeri e delle scelte che definiscono una strategia. Il nome viene dagli algoritmi genetici (sezione 1.5): sono i «geni» che l'evoluzione artificiale modifica. Per ora basta sapere che, dato un genoma, la strategia è completamente determinata.

Ogni giorno, alla chiusura, la strategia riceve i dati disponibili (le barre di oggi e dei giorni passati) e decide una sola cosa:

```
buy   oppure   sell   oppure   hold
```

Poi c'è la regola di esecuzione: **si decide alla chiusura del giorno t, si esegue all'apertura del giorno t+1**. Esempio: lunedì sera il genoma guarda i dati e dice `buy`. L'ordine viene eseguito martedì mattina, al prezzo di apertura di martedì, non al prezzo di chiusura di lunedì. Nel codice del progetto, a ogni barra l'ordine è: si aggiornano gli indicatori con la barra nuova, si esegue l'ordine deciso alla barra precedente, poi si decide l'ordine per la barra successiva (`src/engine/strategy.js`, `StrategyIndividual`).

#### 1.1.6 Perché non si può usare il futuro: l'anticipazione dei dati (look-ahead)

Il motivo della regola «decido oggi, eseguo domani» è evitare un errore grave e subdolo, chiamato **anticipazione dei dati** (in inglese **look-ahead bias**): usare, per decidere un giorno, informazioni che quel giorno non erano ancora disponibili.

Esempio concreto, sul dataset giocattolo della sezione 1.2. Se lunedì sera la regola potesse guardare il prezzo di martedì, basterebbe questa: «se domani il prezzo sale, compra; altrimenti vendi». Sembra una regola come un'altra, ma nessuno può applicarla davvero, perché il prezzo di domani non si conosce. Sul dataset giocattolo questa regola, che «bara», ottiene +23,23 per cento, contro il +12,87 per cento del buy&hold (valori calcolati con uno script di lavoro). Il risultato è alto perché la regola conosce la risposta prima di scegliere, non perché sia una buona regola.

Il pericolo è che l'anticipazione possa entrare senza che nessuno se ne accorga: un indicatore calcolato su una finestra che comprende giorni futuri, una stima di parametri fatta su tutta la serie e poi usata per «decidere» sul passato. Il risultato sembra ottimo e non vale nulla. Per questo ogni capitolo della guida segnala dove l'anticipazione potrebbe nascere. Nel nostro motore non nasce dall'ordine delle operazioni, che la esclude per costruzione; può nascere dalla stima dei parametri o dalla fitness (misura di qualità, sezione 1.5).

### 1.2 Il dataset giocattolo

Tutta la guida usa gli stessi **20 giorni** inventati. Ogni capitolo li usa nei propri esempi, così i numeri sono confrontabili.

**Avvertenza.** I numeri sono **inventati**. Il prezzo sale, scende, risale in un disegno semplice, scelto perché mostri bene i meccanismi. Non sono dati di ENI né di nessun mercato reale, non dicono nulla su come un approccio si comporterebbe davvero e non dicono quale forma di genoma sia migliore. Se in un esempio una forma ottiene più o meno del buy&hold, non ne segue niente.

Nel dataset c'è un solo prezzo al giorno (la chiusura) e il volume. Il prezzo del giorno t+1 fa le veci del prezzo di apertura quando si esegue un ordine: è una semplificazione, perché nei dati veri apertura e chiusura sono prezzi diversi.

| Giorno | Prezzo | Volume |
|---|---|---|
| 1 | 10,00 | 1000 |
| 2 | 10,10 | 1100 |
| 3 | 10,30 | 1200 |
| 4 | 10,55 | 1500 |
| 5 | 10,80 | 1600 |
| 6 | 11,00 | 1800 |
| 7 | 11,20 | 1700 |
| 8 | 11,35 | 1400 |
| 9 | 11,30 | 1200 |
| 10 | 11,10 | 1300 |
| 11 | 10,80 | 1900 |
| 12 | 10,50 | 2200 |
| 13 | 10,30 | 2000 |
| 14 | 10,20 | 1500 |
| 15 | 10,35 | 1200 |
| 16 | 10,55 | 1300 |
| 17 | 10,80 | 1500 |
| 18 | 11,05 | 1700 |
| 19 | 11,25 | 1600 |
| 20 | 11,40 | 1400 |

Il prezzo sale nei giorni 1-8, scende nei giorni 9-14, risale nei giorni 15-20. Il volume è più alto nei giorni in cui il prezzo cambia direzione. Il grafico in testo mostra il prezzo (arrotondato al decimo più vicino; l'asse orizzontale è il giorno):

```
11.40 |                                                          *
11.30 |                      *  *
11.20 |                   *
11.10 |                            *                       *
11.00 |                *
10.90 |
10.80 |             *                 *                 *
10.70 |
10.60 |          *                                   *
10.50 |                                  *
10.40 |
10.30 |       *                             *     *
10.20 |                                        *
10.10 |    *
10.00 | *
      +------------------------------------------------------------
       1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20
```

#### 1.2.1 Il valutatore e le sue regole semplificate

Per misurare una strategia il simulatore riceve una decisione per giorno (`buy`, `sell` o `hold`) e calcola le operazioni e il valore finale. Le regole sono volutamente semplici, e **ogni capitolo le richiama in una scheda «Semplificazioni di questo esempio»**.

- La decisione presa alla chiusura del giorno t è eseguita al prezzo del giorno t+1.
- `buy` a mercato fermo (senza posizione) compra con **tutto** il denaro; `sell` con una posizione aperta vende **tutto**. Un `buy` con la posizione già aperta, o un `sell` senza posizione, non fa nulla.
- Si possono comprare frazioni di azione.
- Nessun costo di transazione (commissioni e scarti di prezzo che nella realtà si pagano a ogni operazione), nessuno stop loss (chiusura automatica della posizione in perdita oltre una soglia), nessun take profit (chiusura automatica oltre un guadagno prefissato).
- La decisione dell'ultimo giorno è ignorata, perché non c'è un giorno dopo.
- Il valore finale è denaro più azioni per il prezzo dell'ultimo giorno. Il capitale iniziale è 1000.

Valori nelle tabelle arrotondati a due decimali; i calcoli interni usano la precisione piena.

#### 1.2.2 Il risultato del buy&hold

Con queste regole, il buy&hold decide `buy` il giorno 1 e `hold` per il resto. L'acquisto è eseguito il giorno 2, al prezzo 10,10: 1000 / 10,10 = 99,0099 azioni. Alla fine il valore è 99,0099 x 11,40 = **1128,71**, cioè **+12,87 per cento**. Il rendimento non è +14 per cento (11,40 diviso 10,00), perché l'acquisto avviene il giorno 2 e non il giorno 1: la regola «si esegue il giorno dopo» pesa già nel riferimento.

### 1.3 Che cos'è un indicatore e perché serve alla memoria

Un genoma che ogni giorno vedesse **solo i numeri di oggi** non saprebbe nulla del passato. Il prezzo 10,80 il giorno 5 e il prezzo 10,80 il giorno 11 sono lo stesso numero, ma nel primo caso il prezzo sale da giorni e nel secondo scende. Da un numero solo non si capisce da dove si arriva. Per decidere in modo sensato serve una **memoria del passato**.

Un **indicatore** (o indicatore tecnico) è un numero calcolato dai prezzi e dai volumi passati, che ne riassume l'andamento. Il genoma riceve ogni giorno gli indicatori già calcolati e decide leggendoli. Gli indicatori sono il modo più comune di dare memoria a una strategia, ed è quello che interessa al progetto (sezione 1.4).

#### 1.3.1 Media mobile semplice (SMA)

La **media mobile semplice** (SMA, simple moving average) su N giorni è la media dei prezzi degli ultimi N giorni, incluso oggi.

```
SMA_N[t] = ( x[t] + x[t-1] + ... + x[t-N+1] ) / N
```

Qui `x[t]` è il valore (il prezzo, o il volume) del giorno `t` e N è la lunghezza della finestra. In parole: si prende una finestra degli ultimi N giorni e se ne fa la media; il giorno dopo la finestra scorre di un giorno, da cui «mobile». Esempio con N = 3 sul giorno 3: (10,00 + 10,10 + 10,30) / 3 = 10,13. Il giorno 4: (10,10 + 10,30 + 10,55) / 3 = 10,32.

Una media è più liscia del prezzo: le oscillazioni di un giorno si compensano. Il costo è il **ritardo**: la media segue il prezzo con qualche giorno di ritardo. Nei primi N-1 giorni non è definita (non c'è abbastanza storia).

#### 1.3.2 Media mobile esponenziale (EMA)

La **media mobile esponenziale** (EMA, exponential moving average) dà più peso ai dati recenti, senza una finestra fissa. È il tipo di media usato dal motore di Consilium (nel codice è chiamata filtro IIR, «a risposta impulsiva infinita»: ogni valore dipende da tutti i precedenti attraverso il valore appena calcolato).

```
e[t] = e[t-1] * (1 - c) + x[t] * c
```

Simboli: `x[t]` è il dato del giorno `t`; `e[t]` è il valore della media al giorno `t`; `e[t-1]` quello del giorno prima; `c` è un numero tra 0 e 1, il **coefficiente**. Il primo valore, `e[1]`, è il primo dato.

In parole: la nuova media è un miscuglio della vecchia media e del dato nuovo. **`c` è il peso del dato nuovo**: una frazione `c` viene dal dato di oggi, il resto `(1 - c)` dalla media di ieri. Non va letto al contrario.

Che cosa significa `c`, con tre valori. Si prenda una media ferma a 100 e un dato che passa di colpo a 110 e vi resta. Valori dopo 1, 2 e 3 giorni:

| c | dopo 1 giorno | dopo 2 giorni | dopo 3 giorni | lettura |
|---|---|---|---|---|
| 0,9 | 109,00 | 109,90 | 109,99 | quasi subito al nuovo valore: poca memoria |
| 0,5 | 105,00 | 107,50 | 108,75 | a metà strada ogni giorno: memoria media |
| 0,1 | 101,00 | 101,90 | 102,71 | si muove lentamente: molta memoria |

Con `c` vicino a 1 la media coincide quasi con il dato di oggi e quindi ricorda poco del passato; con `c` vicino a 0 il dato nuovo pesa poco e la media si sposta lentamente, ricordando a lungo. Come regola grossolana, la «durata della memoria» è circa 1/c giorni: 1/0,5 = 2 giorni, 1/0,2 = 5 giorni.

Il vantaggio dell'EMA sulla SMA è pratico: per aggiornarla servono solo il valore di ieri e il dato di oggi, non gli ultimi N dati.

#### 1.3.3 Le due EMA e la tabella a 20 giorni

La tabella mostra il prezzo, la SMA a 3 giorni e le EMA con `c` = 0,5 (veloce) e `c` = 0,2 (lenta). Valori arrotondati a due decimali.

| Giorno | Prezzo | SMA 3 | EMA c=0,5 | EMA c=0,2 |
|---|---|---|---|---|
| 1 | 10,00 | - | 10,00 | 10,00 |
| 2 | 10,10 | - | 10,05 | 10,02 |
| 3 | 10,30 | 10,13 | 10,18 | 10,08 |
| 4 | 10,55 | 10,32 | 10,36 | 10,17 |
| 5 | 10,80 | 10,55 | 10,58 | 10,30 |
| 6 | 11,00 | 10,78 | 10,79 | 10,44 |
| 7 | 11,20 | 11,00 | 11,00 | 10,59 |
| 8 | 11,35 | 11,18 | 11,17 | 10,74 |
| 9 | 11,30 | 11,28 | 11,24 | 10,85 |
| 10 | 11,10 | 11,25 | 11,17 | 10,90 |
| 11 | 10,80 | 11,07 | 10,98 | 10,88 |
| 12 | 10,50 | 10,80 | 10,74 | 10,81 |
| 13 | 10,30 | 10,53 | 10,52 | 10,70 |
| 14 | 10,20 | 10,33 | 10,36 | 10,60 |
| 15 | 10,35 | 10,28 | 10,36 | 10,55 |
| 16 | 10,55 | 10,37 | 10,45 | 10,55 |
| 17 | 10,80 | 10,57 | 10,63 | 10,60 |
| 18 | 11,05 | 10,80 | 10,84 | 10,69 |
| 19 | 11,25 | 11,03 | 11,04 | 10,80 |
| 20 | 11,40 | 11,23 | 11,22 | 10,92 |

Un esempio di calcolo a mano: giorno 2, `c` = 0,5: 10,00 x 0,5 + 10,10 x 0,5 = 10,05. Giorno 3: 10,05 x 0,5 + 10,30 x 0,5 = 10,175, che in tabella appare 10,18.

**Che cosa si legge.**

- La media **veloce** (`c` = 0,5) segue il prezzo da vicino: il giorno 8 è 11,17, vicina al prezzo 11,35. La media **lenta** (`c` = 0,2) ritarda molto: lo stesso giorno è 10,74.
- Quando il prezzo comincia a scendere (giorno 9), la veloce gira prima della lenta. Il giorno 11 il prezzo (10,80) è sotto la veloce (10,98) e sotto la lenta (10,88) di poco: il confronto del prezzo con una media dice se, rispetto alla storia recente, siamo «sopra» o «sotto».
- Il giorno 12 il prezzo è sotto entrambe le medie; la veloce (10,74) è sotto la lenta (10,81): le due medie si sono incrociate. Un **incrocio** tra medie, una veloce e una lenta, è un segnale classico: indica che l'andamento recente è cambiato rispetto a quello di fondo.
- La SMA a 3 giorni e la EMA con `c` = 0,5 sono simili (la durata della memoria è circa la stessa); differiscono nel modo in cui «dimenticano» i dati vecchi: la SMA li butta via di colpo, l'EMA li pesa sempre meno.

Un genoma che legge insieme prezzo, EMA veloce ed EMA lenta ha quindi una forma di memoria di tre orizzonti diversi: oggi, circa 2 giorni, circa 5 giorni.

#### 1.3.4 Altri indicatori usati nel resto della guida

Gli indicatori seguenti derivano dalle medie. Gli esempi usano la EMA lenta (`c` = 0,2) per il prezzo e, per il volume, una EMA con `c` = 0,2, come negli altri capitoli. I valori sono nella tabella dopo le descrizioni.

**Distanza del prezzo dalla media (in percentuale).**

```
dist[t] = ( x[t] / m[t] - 1 ) * 100
```

`x[t]` è il prezzo, `m[t]` la media scelta (qui la EMA con `c` = 0,2). In parole: di quanti punti percentuali il prezzo sta sopra (positivo) o sotto (negativo) la propria media. Giorno 8: 11,35 / 10,74 = 1,0568, quindi +5,66. È un modo di dire «il prezzo ha corso troppo davanti alla media» oppure «è rimasto indietro», con un numero senza unità di misura, confrontabile tra titoli di prezzo diverso.

**Rapporto del volume con la sua media.**

```
vr[t] = v[t] / mv[t]
```

`v[t]` è il volume del giorno e `mv[t]` la sua EMA (qui con `c` = 0,2, calcolata come quella del prezzo, a partire dal primo volume). In parole: un valore sopra 1 dice che oggi si è scambiato più del solito; sotto 1, meno del solito. Giorno 12: il volume è 2200, la EMA del volume è 1612,93 e il rapporto è 1,36: giornata molto attiva, e infatti il prezzo sta scendendo con decisione. Un movimento con molto volume è considerato più significativo di uno con poco volume.

**Variazione su N giorni (momentum).**

```
mom_N[t] = ( x[t] / x[t-N] - 1 ) * 100
```

`x[t-N]` è il prezzo di N giorni fa. In parole: di quanto è cambiato il prezzo in N giorni, in percentuale. Qui N = 5. Giorno 6: 11,00 / 10,00 = 1,10, quindi +10,00. Se è positivo il prezzo è salito nell'ultima settimana di borsa, se è negativo è sceso.

| Giorno | Distanza da EMA c=0,2 (%) | Volume su EMA c=0,2 | Variazione su 5 giorni (%) |
|---|---|---|---|
| 1 | 0,00 | 1,00 | - |
| 2 | 0,80 | 1,08 | - |
| 3 | 2,22 | 1,14 | - |
| 4 | 3,73 | 1,31 | - |
| 5 | 4,89 | 1,29 | - |
| 6 | 5,39 | 1,33 | 10,00 |
| 7 | 5,76 | 1,20 | 10,89 |
| 8 | 5,66 | 0,99 | 10,19 |
| 9 | 4,11 | 0,87 | 7,11 |
| 10 | 1,81 | 0,96 | 2,78 |
| 11 | -0,76 | 1,30 | -1,82 |
| 12 | -2,83 | 1,36 | -6,25 |
| 13 | -3,78 | 1,18 | -9,25 |
| 14 | -3,81 | 0,91 | -9,73 |
| 15 | -1,92 | 0,77 | -6,76 |
| 16 | -0,02 | 0,86 | -2,31 |
| 17 | 1,87 | 0,99 | 2,86 |
| 18 | 3,35 | 1,10 | 7,28 |
| 19 | 4,14 | 1,03 | 10,29 |
| 20 | 4,37 | 0,92 | 10,14 |

Si legge: la distanza dalla media è positiva nei giorni di salita e negativa nel calo dei giorni 11-15; il volume passa da sopra la media (giorni 11-13, quando il prezzo scende) a sotto (giorni 14-16); il momentum e la distanza dalla media diventano negativi lo stesso giorno (il giorno 11), ma il momentum scende più in fretta e tocca il suo minimo (-9,73) il giorno 14, quando la distanza dalla media è a -3,81.

Per i primi giorni la variazione su 5 giorni non è definita (trattino): servono 5 giorni di storia. È un dettaglio pratico di ogni indicatore con finestra, detto «periodo di avvio».

#### 1.3.5 Indicatori che non sono una semplice media

Non tutti gli indicatori si ottengono con una media. Quattro esempi, senza calcolo, che compaiono nei capitoli successivi o nella letteratura. Le descrizioni di questa sezione sono conoscenza generale senza una fonte letta per questa guida: **[ipotesi, fonte da verificare]**.

- **RSI** (relative strength index, indice di forza relativa): confronta la grandezza media dei rialzi con quella dei ribassi recenti e la trasforma in un numero tra 0 e 100. I valori alti si leggono come «ipercomprato» (il titolo è salito molto in fretta), quelli bassi come «ipervenduto»; le soglie con cui si distinguono non sono fissate qui. Contiene un rapporto, quindi non è una combinazione lineare dei prezzi passati.
- **Massimi e minimi su N giorni**: il prezzo più alto e più basso degli ultimi N giorni. Servono per regole del tipo «compra se il prezzo supera il massimo degli ultimi 20 giorni» (si parla di «rottura»). Sono non lineari: il massimo non è una somma.
- **Stocastico**: dice dove si trova il prezzo di oggi dentro l'intervallo tra il minimo e il massimo degli ultimi N giorni, da 0 (sul minimo) a 100 (sul massimo).
- **ATR** (average true range, escursione media vera): misura quanto il prezzo si muove in un giorno, includendo i salti tra la chiusura di ieri e l'apertura di oggi. Dice quanto è «nervoso» il titolo, non in che direzione va.

Nel progetto è un compito di ricerca a parte (R2) scegliere quali indicatori usare. In questa guida servono per capire gli esempi.

#### 1.3.6 Gli ingressi usati negli esempi dei capitoli

I capitoli sulle forme usano gli stessi tre numeri, con nomi diversi a seconda di come si scrive la forma. Le medie sono sempre EMA: lenta con `c` = 0,2, veloce con `c` = 0,5, e una EMA del volume con `c` = 0,2.

| Nome nei capitoli 4 e 7 | Nome nel capitolo 8 | Nome nei capitoli 5 e 6 | Definizione |
|---|---|---|---|
| `x1` | `D` | `P`, `S` (albero); `prezzo`, `media_lenta` (lista) | distanza percentuale del prezzo dalla EMA lenta: `(prezzo / EMA lenta - 1) * 100` |
| `x2` | non usato | `F` (albero); `media_veloce` (lista) | distanza percentuale della EMA veloce da quella lenta: `(EMA veloce / EMA lenta - 1) * 100` |
| `x3` | `R` meno 1 | `V` e `VA` (albero); `volume` e `media_volume` (lista) | scarto del volume dalla sua EMA: `volume / EMA del volume - 1`; `R` è il rapporto `volume / EMA del volume` |

Nel capitolo 6 (lista di regole) e nel capitolo 5 (alberi) i confronti usano direttamente i valori, per esempio `prezzo > media_lenta` invece della distanza percentuale; il significato è lo stesso. Il capitolo 9 (modello a stati nascosti) usa solo la variazione giornaliera del prezzo, e il capitolo 3 (macchina a stati ridotta) solo le due EMA del prezzo.

### 1.4 Due posti dove può stare la memoria

Ogni forma di genoma deve ricordare il passato in qualche modo, e ci sono due posti dove la memoria può stare.

**Memoria a monte (negli indicatori).** Gli indicatori sono calcolati **prima** e consegnati al genoma già pronti: la EMA, la distanza dalla media, il rapporto del volume. Il genoma legge i numeri di oggi e basta. Non ha nessuna memoria sua: se gli si ridanno gli stessi numeri, risponde sempre allo stesso modo. Per un programmatore: è una **funzione pura**, stesso input stesso output; la storia l'ha digerita qualcun altro e gli arriva sotto forma di input.

**Memoria dentro il genoma (stato interno).** Il genoma ha una variabile che si porta dietro da un giorno al successivo e che aggiorna: lo stato in cui si trova una macchina a stati, l'uscita di ieri che una rete neurale ricorrente rilegge, i registri di un programma. Per un programmatore: è un **oggetto con campi**, e il risultato di oggi dipende anche dai campi, che sono cambiati ieri.

Un'analogia con l'auto. Il tachimetro dice la velocità di adesso e nient'altro: non sa niente di come sei arrivato fin lì. Il contachilometri tiene il conto di tutto il percorso fatto. La memoria a monte è un cruscotto con tanti strumenti già pronti (il tachimetro, la media dell'ultima ora, il consumo medio), tutti calcolati da qualcun altro e letti dal guidatore. La memoria interna è un guidatore che tiene un taccuino e annota di sua iniziativa quello che gli pare importante.

| | Memoria a monte | Memoria nel genoma |
|---|---|---|
| Dove sta | negli indicatori, calcolati prima | in uno stato che il genoma aggiorna |
| Chi decide che cosa ricordare | chi sceglie gli indicatori (noi) | l'evoluzione, insieme al resto del genoma |
| Il genoma da solo | una funzione dei numeri di oggi | dipende anche da ciò che ha fatto ieri |
| Va azzerato a ogni nuova simulazione | no, lo fanno gli indicatori | sì, il genoma ha stato da riportare all'inizio |
| Si legge perché ha deciso così | più facile: i numeri letti sono lì | più difficile: bisogna ripercorrere la storia |

**Perché è importante per il progetto.** L'obiettivo dell'epica è una memoria che nasca da **indicatori noti** (medie mobili e simili), e non da una macchina a stati. Il motivo: gli indicatori hanno un significato che chiunque può leggere (la EMA è la EMA), e il genoma si limita a combinarli. In una macchina a stati la memoria è nascosta nella struttura evoluta, ed è difficile dire che cosa ricordi davvero. La rassegna precisa che il requisito non è stringente: sono ammesse anche forme con stato interno, e la scelta tra le due classi di memoria spetta a Luca. Alcune forme hanno entrambe le varianti (per esempio gli alberi con o senza registri, le reti con o senza ricorrenze).

**Il fatto sul genoma attuale.** Il genoma fisso di Consilium ha quattro indicatori di tipo EMA, due sul prezzo e due sul volume, aggiornati con la formula della sezione 1.3.2 (`src/vendor/consilium/algorithm.js`, righe 369-372):

```
this.ema = this.ema * (1 - this.IIR_COEFF) + actualValue * this.IIR_COEFF;
```

Nel genoma fisso il secondo filtro del prezzo, `iir_price_2`, ha c = 0,99 (`src/engine/genome.js`, riga 15). Vista la tabella dei tre valori di `c` sopra, con 0,99 il filtro coincide quasi con il prezzo di oggi: **quasi nessuna memoria**. Il filtro `iir_price_1` ha c = 0,73 (memoria di circa 1,4 giorni), `iir_volume_2` ha 0,40 e `iir_volume_1` 0,12 (circa 8,5 giorni). La memoria che conta nel genoma attuale sta quindi soprattutto nello stato della macchina a stati: è la scheda «FSM» della rassegna, ed è il tema del capitolo 3 di questa guida.

Un'avvertenza di lettura: che `iir_price_2` abbia poca memoria è un fatto di questi numeri del genoma fisso, non una proprietà delle macchine a stati.

### 1.5 Che cos'è un genoma e che cos'è un algoritmo genetico

Un **genoma** è una descrizione completa di una strategia, fatta di numeri e scelte che si possono modificare. Un **algoritmo genetico** (GA) è un metodo per cercare buoni genomi, che imita l'evoluzione. Il capitolo 2 lo spiega nel dettaglio. Qui ne diamo un esempio minimo, per capire il linguaggio degli altri capitoli.

**Una strategia minima.** Si usano due numeri.

- `c`: il coefficiente della EMA del prezzo (sezione 1.3.2).
- `m`: un margine in percentuale.

La regola è: se il prezzo di oggi è sopra la EMA di un margine `m`, decido `buy`, altrimenti decido `sell`. In formula, `buy` se `x[t] > e[t] * (1 + m/100)`. Il genoma è la coppia `(c, m)`.

Questo è un genoma di due numeri, ma si capisce già il principio: cambiando i numeri cambiano le decisioni, quindi i risultati. Sul dataset giocattolo, con il valutatore della sezione 1.2:

| Genoma (c, m) | Operazioni (giorno, tipo, prezzo) | Valore finale | Rendimento |
|---|---|---|---|
| A = (0,2; 0) | 3 buy 10,30; 12 sell 10,50; 18 buy 11,05 | 1051,71 | +5,17% |
| B = (0,5; 1,0) | 4 buy 10,55; 10 sell 11,10; 18 buy 11,05 | 1085,46 | +8,55% |

**Valutare** un genoma vuol dire farlo girare sui dati storici e misurare un numero che dice se è «buono». Questo numero si chiama **fitness** (in inglese «idoneità»). Nel progetto è basato sul rendimento annuo composto (CAGR: il rendimento annuo costante che porterebbe dal capitale iniziale a quello finale). Qui, per semplicità, usiamo il rendimento sul dataset giocattolo.

Il GA procede così.

1. Parte da una **popolazione** di genomi, creati a caso (per esempio 50 coppie `(c, m)` diverse).
2. Valuta ognuno e tiene i migliori (**selezione**).
3. Produce nuovi genomi mescolando i genitori. Il **crossover** prende due genomi e ne combina le parti. Esempio: A = (0,2; 0) e B = (0,5; 1,0): il figlio prende `c` da A e `m` da B, ottenendo (0,2; 1,0). Sul dataset il figlio dà 1026,78 (+2,68 per cento): ha unito un pezzo di A e uno di B e ha ottenuto un genoma diverso da entrambi.
4. Applica la **mutazione**, una piccola modifica casuale. Esempio: A con `c` che passa da 0,2 a 0,3, quindi (0,3; 0). Sul dataset dà 1076,05 (+7,61 per cento): con la EMA più veloce il prezzo risulta sopra la media un giorno prima, e il secondo acquisto avviene il giorno 17 al prezzo 10,80 anziché il giorno 18 a 11,05.
5. Ripete per molte **generazioni**, sostituendo i peggiori con i figli dei migliori.

Questo esempio non dice niente sulla bontà di una forma, e non è nemmeno l'esito di una vera evoluzione: serve a far capire che i «geni» sono i numeri che l'algoritmo può cambiare e che anche una piccola modifica sposta le decisioni. Un'ultima osservazione, utile da tenere a mente: il risultato dipende dal dataset. Con questi 20 giorni inventati, per esempio, la regola con `c` = 0,99 (poca memoria) ottiene +16,45 per cento e quella con `c` = 0,1 ottiene +5,56 per cento; non c'è nessuna conclusione da trarne sul valore della memoria in generale, solo il fatto che un cambio di `c` cambia il risultato, e che un algoritmo genetico che cercasse sui soli 20 giorni sceglierebbe quello che va meglio **su quei 20 giorni**. Adattarsi troppo ai dati di addestramento, rumore compreso, si chiama **sovradattamento** (overfitting) ed è un rischio costante.

### 1.6 Come una forma di genoma si inserisce nel nostro motore

Il **motore** è la parte del progetto che fa girare una strategia sulle barre storiche e mostra il risultato nel browser. Una **forma di genoma** è un modo di rappresentare la strategia (macchina a stati, punteggio lineare, albero, rete, e così via). Per funzionare nel motore la forma deve rispettare un accordo, il **contratto di strategia** (`src/engine/strategy.js`; sezione «Strategy contract» di `docs/architecture/simulator-overview.md`). In parole semplici:

- **Ogni giorno** il motore consegna alla forma i dati (la barra di oggi), la forma aggiorna i propri indicatori ed eventuale stato, e **restituisce una decisione: `buy`, `sell` o `hold`**.
- Il **motore esegue** l'ordine all'apertura del giorno dopo, con il suo `Trader` (l'oggetto che tiene capitale, posizione e parametri di rischio come stop loss e take profit). La forma non esegue ordini: decide soltanto.
- La forma deve dichiarare una **etichetta di stato**: una parola breve tra un elenco finito e fisso (`labels`), che il motore mostra a schermo per dire «in che situazione si trova la strategia oggi». Una macchina a stati ha i nomi dei suoi nove stati; per una forma con uscita continua (un punteggio, una rete) l'etichetta si deve derivare, per esempio con tre fasce dell'uscita.
- La forma deve poter **esporre dei numeri da mostrare** (`describe()`), per esempio gli indicatori letti o il punteggio del giorno, perché chi guarda il grafico possa capire che cosa ha visto la strategia.
- La forma deve poter essere **salvata come dati** (`serialize()`, un oggetto JSON) e **ricostruita**: un genoma deve potersi scrivere in un file e rileggere.
- Deve poter essere **riportata allo stato iniziale** (`reset()`) per rilanciare la simulazione dall'inizio; per le forme con stato interno questo vuol dire azzerare lo stato.
- Se la forma deve evolvere deve anche saper fare **crossover** e **mutazione** (il GA li richiama).

La tabella completa del contratto, forma per forma, con i punti in cui una forma si adatta bene o male, è nella sezione «Il contratto di strategia, forma per forma» della rassegna, che resta come riferimento. Ogni capitolo di questa guida ha una sezione «Come si integra nel nostro motore» che dice, per quella forma, dove il contratto è rispettato direttamente e dove serve un adattamento. L'adeguatezza al contratto è oggi verificata soltanto con una strategia di test, quindi per le altre forme è una valutazione sulla carta fino all'implementazione.

### 1.7 Come leggere questa guida

#### 1.7.1 La mappa dei capitoli

| Capitolo | Contenuto | A che cosa serve |
|---|---|---|
| 1. Il problema e gli strumenti di base (questo) | titolo, barre, buy&hold, indicatori, memoria, contratto | il lessico di tutta la guida |
| 2. L'algoritmo genetico e la valutazione | come evolve una popolazione di genomi e come si misura un genoma | capire che cosa significa «una forma si mescola e si muta bene» e perché i risultati su pochi dati ingannano |
| 3. La macchina a stati attuale | il genoma di Consilium, nove stati | il punto di partenza e il riferimento |
| 4. Il punteggio lineare | somma pesata di indicatori con soglie | la forma più semplice |
| 5. Alberi e programmazione genetica | formule ad albero evolute | espressività alta, forma variabile |
| 6. La lista di regole | regole se-allora in ordine | forma leggibile, intermedia |
| 7. Le reti neurali | piccole reti, con o senza ricorrenze | espressività alta, poco leggibile |
| 8. La logica fuzzy | regole con gradi di verità tra 0 e 1 | regole «sfumate» |
| 9. Il modello a stati nascosti | regimi di mercato non osservati | forma di confine, vicina alla macchina a stati |
| 10. Confronto e guida alla scelta | confronto tra le forme sulle stesse domande, griglia giorno per giorno, domande per Luca | aiutare Luca a decidere |
| Glossario e Riferimenti | termini e fonti | consultazione |

Ogni capitolo sulle forme (dal 3 al 9) ha, con qualche variante, la stessa struttura: una frase e un'analogia; come funziona; un esempio sul dataset giocattolo con tabella giorno per giorno; come evolve (crossover e mutazione con numeri); che cosa ricorda del passato; punti di forza e debolezze; come si integra nel motore; che cosa dice la letteratura; un riepilogo «In breve». Il percorso di lettura rapido è nella premessa della guida.

**Una regola di lettura valida per tutta la guida.** Ogni esempio è calcolato su 20 giorni inventati. Un risultato migliore o peggiore del buy&hold in un esempio non dice nulla sulla forma. Quello che conta in un esempio è il meccanismo: come i dati diventano una decisione, che cosa ricorda la forma, che cosa cambia quando l'evoluzione modifica i numeri.

## 2. L'algoritmo genetico e la valutazione dei genomi

Questo capitolo spiega il meccanismo che hanno in comune tutte le forme di genoma descritte nei capitoli successivi: come una popolazione di strategie di trading evolve, e come si decide quale strategia è migliore di un'altra. Le forme di genoma cambiano ciò che si evolve. Il meccanismo che le fa evolvere resta lo stesso, ed è meglio capirlo una volta sola, con numeri, prima di confrontare le forme.

Tutti i numeri sono **inventati**: vengono dal dataset giocattolo di 20 giorni comune a tutta la guida e servono a mostrare il meccanismo. Non dicono nulla su come funzionerebbe un approccio sui mercati veri, e nessun risultato di questo capitolo va letto come una promessa di guadagno. Tutti i valori sono stati calcolati con uno script di lavoro e sono arrotondati a due decimali.

### 2.1 Il dataset e il valutatore giocattolo, in breve

Il dataset è una serie inventata di 20 giorni di borsa con il prezzo di chiusura di un titolo. Il prezzo sale dal giorno 1 al giorno 8 (da 10,00 a 11,35), scende dal giorno 9 al giorno 14 (fino a 10,20) e risale dal giorno 15 al giorno 20 (fino a 11,40). Un **genoma** è l'insieme dei numeri che definiscono una strategia. Ogni giorno, alla chiusura, la strategia decide una tra tre azioni: comprare (`buy`), vendere (`sell`) o aspettare (`hold`).

Il valutatore `simulate(signals)` prende le 20 decisioni e le esegue su un capitale di 1000.

**Semplificazioni di questo esempio** (valgono per tutto il capitolo):

- La decisione presa alla chiusura del giorno t viene eseguita al prezzo del giorno t+1.
- Un acquisto usa tutto il denaro; una vendita vende tutto. Le azioni possono essere frazionarie.
- Non ci sono costi di transazione, né stop loss né take profit (soglie che chiudono la posizione da sole).
- La decisione dell'ultimo giorno viene ignorata, perché non c'è un giorno dopo.
- Il valore finale è il denaro più le azioni valutate al prezzo del giorno 20.

Come riferimento c'è il **buy&hold**: comprare il giorno 1 e tenere fino alla fine. Qui dà 1128,71 (+12,87%). È la strategia più semplice che esista, e nei capitoli seguenti è il metro di confronto minimo.

### 2.2 Il genoma di esempio a due geni

Per tutto il capitolo usiamo un genoma minuscolo, con due numeri, chiamati **geni**.

- Il gene `c` è il coefficiente di una **media mobile esponenziale** (EMA), un numero che riassume i prezzi passati dando più peso ai recenti. Sta tra 0 e 1. Si calcola così, come nel codice di Consilium (`src/vendor/consilium/algorithm.js`, righe 369-372):

```
e[t] = e[t-1] * (1 - c) + PRICE[t] * c         con e[1] = PRICE[1]
```

In parole: la media di oggi è la media di ieri, spostata verso il prezzo di oggi. Il coefficiente `c` pesa il dato nuovo. Con `c` vicino a 1 la media segue il prezzo da vicino e ricorda poco il passato. Con `c` vicino a 0 si muove lentamente e ricorda molto. Esempio: con `c` = 0,60, se ieri la media era 10,00 e oggi il prezzo è 10,50, la media di oggi è 10,00 · 0,40 + 10,50 · 0,60 = 10,30.

- Il gene `m` è il **margine**, un numero non negativo. È una fascia di tolleranza attorno alla media, espressa in proporzione: `m` = 0,005 vuol dire 0,5 per cento.

La regola di decisione del genoma `(c, m)` è, ogni giorno t:

```
se  PRICE[t] > e[t] * (1 + m)   allora buy
se  PRICE[t] < e[t] * (1 - m)   allora sell
altrimenti                      hold
```

In parole: se il prezzo è sopra la media di più del margine, il titolo sta salendo e si compra; se è sotto di più del margine, sta scendendo e si vende; se è vicino alla media non si fa nulla. Il margine serve a non reagire alle oscillazioni minime.

Esempio con `c` = 0,60 e `m` = 0,005 (il genoma C della tabella più sotto). La media parte dal prezzo del giorno 1 (10,00), poi vale 10,06 il giorno 2 (10,00 · 0,40 + 10,10 · 0,60) e 10,204 il giorno 3 (10,06 · 0,40 + 10,30 · 0,60). Il giorno 3 il prezzo è 10,30 e la soglia di acquisto è 10,204 · 1,005 = 10,255: poiché 10,30 è più grande, la decisione è `buy` (il giorno 2 il prezzo, 10,10, era sotto la sua soglia di 10,110, quindi `hold`). Il simulatore la esegue il giorno 4 al prezzo di 10,55. Si ritrova nella tabella delle operazioni di C: «buy g4 @10,55».

La valutazione di un genoma è dunque: calcolare la media, produrre le 20 decisioni, chiamare `simulate`. Il risultato (il valore finale) è il suo **voto**.

### 2.3 L'idea

#### 2.3.1 Un'analogia: la selezione di una varietà

Un orticoltore vuole un pomodoro più resistente. Pianta un centinaio di semi diversi, osserva quali piante rendono di più, tiene i semi delle migliori e li incrocia tra loro. Ogni tanto una pianta ha una piccola variazione casuale: a volte peggiora, a volte è migliore e viene tenuta. Dopo qualche stagione le piante assomigliano alle migliori della prima stagione, e alcune sono migliori di tutte. L'orticoltore non ha mai capito «perché» una pianta rende di più: si è limitato a misurare, scegliere e incrociare.

Un algoritmo genetico fa lo stesso con le strategie di trading.

#### 2.3.2 Le parole chiave

| Termine | Che cosa significa qui | Esempio nel nostro caso |
|---|---|---|
| Genoma | L'insieme dei numeri che definiscono una strategia | `(c, m) = (0,60; 0,005)` |
| Gene | Uno dei numeri del genoma | `c`, oppure `m` |
| Popolazione | L'insieme dei genomi presenti in un dato momento | 6 genomi |
| Fitness (il voto) | Il numero che dice quanto un genoma è buono, calcolato valutandolo sui dati | il valore finale di `simulate` |
| Generazione | Un ciclo completo: valutare, scegliere, produrre i nuovi genomi | dalla popolazione 0 alla popolazione 1 |
| Selezione | La scelta dei genomi che fanno da genitori, in base al voto | si tengono i due migliori |
| Crossover | Un nuovo genoma prende i geni da due genitori | `c` dal primo, `m` dal secondo |
| Mutazione | Una piccola variazione casuale di un gene | `c` aumenta di 0,12 |

#### 2.3.3 Il ciclo, in uno schema

```
   popolazione ----> valutazione ----> selezione ----> crossover + mutazione
   (genomi)          (voto a ognuno)   (i migliori)     (nuovi genomi)
       ^                                                      |
       +------------------ nuova generazione -----------------+
```

Il ciclo si ripete finché i voti smettono di migliorare o finché si esaurisce il tempo a disposizione.

### 2.4 Esempio completo di una generazione

#### 2.4.1 La popolazione iniziale

Scegliamo a mano sei genomi con valori diversi di `c` e `m`. In un caso vero sarebbero generati a caso. Il valore finale è quello di `simulate` sui 20 giorni. Le operazioni sono indicate con il giorno di esecuzione e il prezzo.

| Genoma | `c` | `m` | Operazioni | Valore finale | Rendimento |
|---|---|---|---|---|---|
| A | 0,15 | 0,010 | buy g4 @10,55; sell g13 @10,30; buy g18 @11,05 | 1007,23 | +0,72% |
| B | 0,35 | 0,020 | buy g5 @10,80; sell g13 @10,30; buy g19 @11,25 | 966,42 | -3,36% |
| C | 0,60 | 0,005 | buy g4 @10,55; sell g11 @10,80; buy g17 @10,80 | 1080,57 | +8,06% |
| D | 0,80 | 0,030 | nessuna | 1000,00 | 0,00% |
| E | 0,25 | 0,000 | buy g3 @10,30; sell g12 @10,50; buy g17 @10,80 | 1076,05 | +7,61% |
| F | 0,90 | 0,015 | nessuna | 1000,00 | 0,00% |
| buy&hold | | | buy g2 @10,10 | 1128,71 | +12,87% |

Che cosa si vede, a parole. D e F non operano mai: con una media che segue il prezzo da vicino (`c` alto) e un margine abbastanza largo, il prezzo non esce mai dalla fascia, e la decisione è sempre `hold`. Restano a 1000 per costruzione. B perde: ha un margine largo e una media lenta, entra tardi (g5), vende troppo tardi (g13, quasi sul minimo) e ricompra tardi. C ed E sono i migliori: entrano presto, escono dopo il picco e prima del fondo. Nessuno batte il buy&hold, perché in questi dati il prezzo sale più di quanto scenda e ogni uscita costa i giorni di rialzo persi.

I valori finali di una generazione si chiamano **voti** (fitness). La media dei voti della popolazione iniziale è 1021,71 e il migliore è 1080,57 (C).

#### 2.4.2 La selezione

Ordinando per voto: C (1080,57), E (1076,05), A (1007,23), D e F a pari merito (1000,00), B (966,42). Si tengono i due migliori, C ed E, come genitori. Nell'algoritmo di Consilium la scelta è un po' diversa (sezione 2.7), ma il principio è questo: i genomi con un voto più alto hanno più probabilità di avere figli.

Perché ha senso? Perché i genomi migliori contengono, almeno in parte, valori dei geni più adatti ai dati. Combinare i geni di due genomi buoni è una scommessa ragionevole: se `c` = 0,60 funziona bene in C e `m` = 0 funziona bene in E, forse stanno bene anche insieme.

#### 2.4.3 Il crossover, con i numeri

Il crossover prende i geni da due genitori. Ci sono due modi comuni. Il primo, quello **per scelta**, copia ogni gene da uno dei due genitori. Il secondo, quello **aritmetico**, fa la media dei due valori.

Genitori: C = (`c` 0,60; `m` 0,005), E = (`c` 0,25; `m` 0,000).

| Figlio | Come nasce | `c` | `m` |
|---|---|---|---|
| G | `c` da C, `m` da E | 0,60 | 0,000 |
| H | `c` da E, `m` da C | 0,25 | 0,005 |
| I | media dei due genitori | (0,60 + 0,25) / 2 = 0,425 | (0,005 + 0,000) / 2 = 0,0025 |

#### 2.4.4 La mutazione, con un numero dichiarato

La mutazione cambia un gene di una quantità piccola e casuale. Qui la quantità è fissata a mano per poter riprodurre il calcolo: applichiamo al figlio H una variazione di **+0,12 su `c`** e di **+0,003 su `m`**. Il genoma mutato L vale `c` = 0,25 + 0,12 = 0,37 e `m` = 0,005 + 0,003 = 0,008. Dopo una mutazione si controlla che i valori restino ammissibili (`c` tra 0 e 1, `m` non negativo).

Perché serve? Il crossover può solo ricombinare ciò che c'è già nella popolazione: tutti i `c` dei figli stanno tra 0,25 e 0,60. Se il valore migliore di `c` fosse 0,9, senza mutazione la popolazione non ci arriverebbe mai. La mutazione introduce valori nuovi.

#### 2.4.5 La nuova generazione

La nuova popolazione tiene i due genitori (C ed E, senza modifiche: tecnica detta **elitismo**, che evita di perdere i migliori per caso) e aggiunge i quattro nuovi genomi.

| Genoma | `c` | `m` | Operazioni | Valore finale | Rendimento |
|---|---|---|---|---|---|
| C | 0,60 | 0,005 | buy g4 @10,55; sell g11 @10,80; buy g17 @10,80 | 1080,57 | +8,06% |
| E | 0,25 | 0,000 | buy g3 @10,30; sell g12 @10,50; buy g17 @10,80 | 1076,05 | +7,61% |
| G | 0,60 | 0,000 | buy g3 @10,30; sell g11 @10,80; buy g16 @10,55 | 1133,02 | +13,30% |
| H | 0,25 | 0,005 | buy g3 @10,30; sell g12 @10,50; buy g18 @11,05 | 1051,71 | +5,17% |
| I | 0,425 | 0,0025 | buy g3 @10,30; sell g11 @10,80; buy g17 @10,80 | 1106,80 | +10,68% |
| L | 0,37 | 0,008 | buy g4 @10,55; sell g12 @10,50; buy g18 @11,05 | 1026,78 | +2,68% |

Che cosa è successo ai risultati:

- Il voto medio della popolazione è salito da 1021,71 a 1079,15, e il migliore da 1080,57 (C) a 1133,02 (G).
- G è un esempio riuscito di crossover: unisce la media di C, che segue il prezzo abbastanza da vicino, con il margine nullo di E, che fa scattare gli acquisti un giorno prima. Compra al giorno 3 (10,30) invece che al giorno 4 (10,55), e vende al giorno 11. Il suo valore finale supera anche il buy&hold (1128,71), ma questo è un effetto dei prezzi inventati, non una prova di qualità.
- I è un buon figlio ottenuto con la media. H è peggiore di entrambi i genitori su `m`, e L (mutato) è peggiore del suo originale H. **Non tutti i figli sono migliori**: i nuovi genomi sono tentativi, e la selezione della generazione dopo scarta quelli che non funzionano. Si impara solo perché si prova molto.

Le decisioni di ogni genoma, giorno per giorno (B = buy, S = sell, `.` = hold), mostrano come cambiano con i geni:

```
giorno    1         2
          12345678901234567890
C         ..BBBBBB.SSSSS.BBBBB
E         .BBBBBBBBBSSSSSBBBBB
G         .BBBBBBBBSSSSSBBBBBB
H         .BBBBBBBBBSSSSS.BBBB
I         .BBBBBBBBSSSSSSBBBBB
L         ..BBBBBBB.SSSS..BBBB
```

Un `B` ripetuto non compra di nuovo: se la posizione è già aperta, il simulatore lo ignora (stesso discorso per una `S` a posizione chiusa). G e I decidono di vendere il giorno 10, eseguito l'11 dopo il picco del giorno 8, e tornano a comprare con una decisione del giorno 15 (G) o 16 (I), eseguita il giorno dopo, quando il prezzo risale. G rientra a 10,55 e I a 10,80: è la differenza tra i loro voti finali.

### 2.5 Perché una popolazione e non un solo genoma, e che cosa significa «convergere»

Si potrebbe partire da un solo genoma e provare a migliorarlo con piccole modifiche. Il rischio è fermarsi in un punto da cui ogni piccola modifica peggiora, ma che non è il migliore possibile (un **massimo locale**, come la cima di una collina bassa, quando poco più in là c'è un monte più alto). Una popolazione esplora più punti dello spazio dei genomi contemporaneamente. Il crossover mette insieme informazione che sta in individui diversi, e la mutazione, applicata a tanti genomi, tenta direzioni diverse. Con un solo genoma tutto ciò non è possibile.

In termini di programmatore: una popolazione è una ricerca in parallelo con un meccanismo per travasare tra i candidati le parti riuscite.

**Convergere** vuol dire che i genomi della popolazione diventano sempre più simili tra loro e i voti smettono di migliorare. Per vederlo, abbiamo ripetuto il ciclo su una popolazione di 12 genomi iniziali casuali (seme 11, tenendo ogni volta i 2 migliori, scegliendo i genitori tra la metà migliore, crossover per scelta o aritmetico a caso, mutazione con probabilità 0,5, variazione casuale con deviazione standard 0,10 su `c` e 0,004 su `m`), per 10 generazioni sull'intero periodo. L'intervallo dei valori di `c` e `m` è quello della popolazione in quel momento.

| Generazione | Voto migliore | Voto medio | `c` va da | a | `m` va da | a |
|---|---|---|---|---|---|---|
| 0 | 1133,02 | 1021,26 | 0,13 | 0,93 | 0,001 | 0,029 |
| 1 | 1133,02 | 1058,06 | 0,21 | 0,98 | 0,001 | 0,017 |
| 2 | 1133,02 | 1095,02 | 0,31 | 0,67 | 0,001 | 0,007 |
| 3 | 1133,02 | 1110,85 | 0,47 | 0,75 | 0,000 | 0,006 |
| 5 | 1164,50 | 1113,36 | 0,47 | 0,85 | 0,000 | 0,005 |
| 10 | 1164,50 | 1114,72 | 0,63 | 0,85 | 0,000 | 0,007 |

Si osserva questo. Il voto medio sale rapidamente nelle prime generazioni, da 1021 a 1110 in tre generazioni. Gli intervalli di `c` e `m` si restringono: `m` converge verso zero, `c` verso valori attorno a 0,6-0,85. Il voto migliore migliora a scatti (alla generazione 5, per una mutazione fortunata, arriva a 1164,50 con `c` = 0,78 e `m` = 0) e poi resta fermo. Il voto medio non è monotono (alla generazione 10 è più basso che alla 9, 1140,89, perché alcune mutazioni producono figli peggiori): è normale.

La popolazione converge quando è tutta vicino a uno stesso punto. Questo è utile (si è trovato qualcosa di buono) e anche pericoloso: una popolazione che converge troppo presto ha perso la varietà e non esplora più. Per questo contano la dimensione della popolazione e la frequenza della mutazione. Qui il risultato dipende dal seme casuale e dai prezzi inventati: con altri valori di partenza si arriverebbe altrove.

### 2.6 Il problema dell'overfitting (sovradattamento)

#### 2.6.1 Un esempio numerico

Finora abbiamo valutato i genomi sugli stessi 20 giorni su cui contiamo di usarli. Un genoma «bravo» su quei giorni potrebbe esserlo solo perché è stato scelto proprio per quei giorni. Verifichiamo con un esperimento: facciamo evolvere la popolazione usando **solo i giorni 1-12** (seme 1, stesso procedimento della sezione 2.5), poi proviamo il migliore sui **giorni 13-20**, che l'algoritmo non ha mai visto.

Semplificazioni di questa prova. Le decisioni si calcolano con la media mobile partendo dal giorno 1 anche per il tratto 13-20 (un genoma vero conosce il passato). Ogni tratto riparte da un capitale di 1000 senza posizioni aperte, valutato con `simulate(signals[:12], PRICE[:12])` e `simulate(signals[12:], PRICE[12:])`. Il giorno 12 e il giorno 20 non hanno un giorno successivo, quindi la loro decisione è ignorata.

Risultato: dopo 10 generazioni il genoma migliore sui giorni 1-12 ha `c` = 0,8952 e `m` = 0,0001.

| Tratto | Operazioni | Valore finale | Rendimento | Buy&hold sullo stesso tratto |
|---|---|---|---|---|
| Giorni 1-12 (addestramento) | buy g3 @10,30; sell g10 @11,10 | 1077,67 | +7,77% | 1039,60 (+3,96%) |
| Giorni 13-20 (nuovi) | buy g16 @10,55 | 1080,57 | +8,06% | 1117,65 (+11,76%) |

Come si legge. Sui giorni di addestramento il genoma batte nettamente il buy&hold (+7,77% contro +3,96%). Sui giorni nuovi non va male in assoluto (+8,06%), ma ora è **sotto** il buy&hold (+11,76%). Il genoma non è crollato: ciò che è cambiato è il confronto. Su dati già visti sembrava superiore al riferimento, sui dati nuovi no.

Per onestà: questo esempio è mite. Il genoma ha due soli numeri e i dati sono molto regolari, quindi non c'è un vero collasso. Controllando anche gli altri sei genomi della popolazione iniziale della sezione 2.4, l'ordine tra addestramento e prova resta quasi lo stesso (C 1023,70 e 1055,56; E 1019,42 e 1055,56; A 995,26 e 1031,67; B 972,22 e 1013,33; D e F sempre 1000,00). Il fenomeno vero compare quando il genoma ha molta libertà.

#### 2.6.2 Perché si può «imparare a memoria»

Per capire il meccanismo si pensi a un genoma estremo, con un gene per ogni giorno: «giorno 1: compra; giorno 7: vendi; negli altri giorni: aspetta». Sui giorni 1-12 questo calendario compra a 10,10 (g2) e vende a 11,35 (g8), il picco, e ottiene 1123,76 (+12,38%): è il massimo ottenibile su quel tratto, visto che si conosceva già tutto il percorso dei prezzi. Sul giorno 13 e successivi non dice nulla di utile: i geni descrivono quei 12 giorni, non una regola. Un calendario del genere ha ottenuto un voto massimo senza aver capito nulla.

Questo è l'**overfitting**: il genoma si è adattato ai dati su cui è stato scelto, compresi i casi e le irregolarità che non si ripeteranno, e funziona peggio su dati nuovi. Più un genoma ha geni e più è flessibile, più facilmente può imparare a memoria. Un genoma a due numeri come quello di esempio può farlo poco. Un genoma con molte regole, un albero grande o una rete con decine di pesi può farlo molto, e per questo la quantità di geni è uno dei criteri di confronto tra le forme (capitoli successivi).

C'è un secondo meccanismo, meno evidente. Anche con pochi geni, se si provano moltissimi genomi e si tiene il migliore sui dati visti, in parte il vincitore è quello che ha avuto fortuna. Chi prova molte configurazioni sugli stessi dati rischia di trovare, per caso, quella che sembra ottima: si tratta del tema di [4] (il rapporto tra numero di prove e sovradattamento; letto per la parte sul metodo hold-out, cioè tenere fuori una parte dei dati). Questo rende l'evoluzione stessa, che prova migliaia di genomi, una fonte di sovradattamento.

#### 2.6.3 Perché servono tre insiemi di dati separati

La difesa è dividere i dati in tre parti, usate in momenti diversi. L'immagine è quella di uno studente.

| Insieme | Che cosa è | A che cosa serve | Analogia |
|---|---|---|---|
| **Addestramento** (training) | I dati su cui l'algoritmo valuta i genomi e li fa evolvere | Guida la selezione: è il voto che fa evolvere la popolazione | I compiti a casa: si possono rifare mille volte, finché vengono bene |
| **Validazione** (validation) | Dati non usati per evolvere, su cui si confrontano i candidati | Scegliere tra più candidati, fermare l'evoluzione, regolare le impostazioni | La simulazione d'esame: dice come si va su compiti nuovi e permette di correggere lo studio |
| **Prova finale** (test) | Dati tenuti da parte e usati **una volta sola**, alla fine | Una stima onesta di come andrebbe il genoma scelto su dati nuovi | L'esame vero: si fa una volta, e il voto non si può rifare |

Perché non bastano due insiemi? Se si sceglie il genoma in base al voto sui dati di prova, quei dati diventano parte della scelta: ogni volta che li si guarda per decidere, si perde un po' della loro onestà, e come per i compiti a casa a un certo punto si arriva a «conoscerli». La validazione serve a prendere tutte le decisioni (scegliere, fermare, regolare), così la prova finale resta pulita. Per questa ragione i dati di prova non devono essere guardati finché non si è deciso tutto il resto.

Un dettaglio che conta nei dati di borsa: i tre insiemi sono tratti **consecutivi nel tempo**, nell'ordine addestramento, validazione, prova. Mescolare i giorni a caso significherebbe usare il futuro per spiegare il passato, che nell'uso vero non è possibile.

#### 2.6.4 Che cosa mostra il caso reale di Consilium

Il rapporto interno di Consilium sui propri esperimenti (`archive/reports/2026-09-12_train-test-holdout-experiments.md`, nel repository Consilium, riferimento [18]) ha fatto proprio questo: tenere da parte una finestra di dati finale (in inglese holdout, equivalente a una prova finale) e ri-valutare i genomi evoluti su di essa. Quattro esperimenti, in ordine di realismo crescente. Non riportiamo le cifre. Gli esiti qualitativi, con la fonte:

1. **Addestramento corto su un solo titolo: collasso fuori dal campione.** Nel primo esperimento (circa 21 mesi di addestramento, 3 mesi di prova), tutti i 10 genomi migliori hanno avuto un rendimento negativo sui dati nuovi, nonostante un buon voto in addestramento. Il rapporto lo definisce «overfitting severo e sistematico», e nota che il campione di operazioni era molto piccolo (da 1 a 4 per genoma).
2. **Finestra più lunga sullo stesso titolo: il collasso sparisce, ma i genomi evoluti non battono il buy&hold.** Nel secondo esperimento nessun genoma crolla in modo sistematico, ma tutti i 10 restano nettamente sotto il buy&hold dello stesso periodo.
3. **Più titoli insieme: la generalizzazione migliora, ma il buy&hold non viene mai battuto.** Nel terzo esperimento, il divario tra addestramento e prova è il più piccolo, ma né in un anno positivo né in un anno negativo i genomi battono il buy&hold: nell'anno positivo limitano i guadagni, in quello negativo li amplificano.
4. **Le strategie non si trasferiscono tra panieri di titoli.** Nel quarto esperimento i genomi evoluti su un paniere (una «partizione») sono stati provati sugli altri nove: quasi sempre vanno peggio che sul paniere di origine, in particolare su uno che nell'anno di prova era salito molto.

Il rapporto attribuisce una parte dei risultati ai parametri di rischio degenerati (stop loss quasi mai raggiungibile, take profit stretto) e alla fitness basata sul solo CAGR: è il tema della sezione 2.7. Il rapporto stesso avverte che non separa il peso della forma del genoma da quello della fitness. Questo capitolo non ne trae conclusioni sulle forme di genoma.

### 2.7 Che cosa conta davvero: la funzione di fitness

#### 2.7.1 Il voto decide che cosa viene premiato

L'evoluzione non sa che cosa sia una «buona strategia»: sa solo che i genomi con il voto più alto hanno più figli. Perciò il voto, cioè la **funzione di fitness**, decide tutto. Se il voto premia solo il guadagno finale, l'evoluzione produrrà genomi che puntano al guadagno finale, anche se arrivano a ottenerlo con percorsi pericolosi. Se il voto dovesse premiare anche la stabilità, l'evoluzione cercherebbe genomi stabili. Il genoma non cambia: cambia ciò che la selezione considera meglio.

#### 2.7.2 Che cosa premia oggi Consilium

Nel motore genetico di Consilium (`ga/ga.js` nel repository Consilium, branch `experiment/lb77`) ci sono due funzioni di voto:

- `GetAnnualGrowthRate` (riga 85) restituisce il **CAGR** dell'individuo. Il CAGR (compound annual growth rate, tasso di crescita annuo composto) è il rendimento annuo costante che porterebbe dal capitale iniziale al capitale finale. Annualizzando, un rendimento `r` ottenuto in `n` giorni di borsa diventa `(1 + r)^(250/n) - 1`, con circa 250 giorni di borsa all'anno. Esempio con i nostri dati inventati e `n` = 20: +8,06% in 20 giorni equivale a circa +163% in un anno; il buy&hold, +12,87%, a circa +354%. Per questo i valori annualizzati su periodi brevi possono sembrare enormi, e il rapporto di Consilium lo nota per il suo primo esperimento.
- `GetSuccessRatio` (riga 89) restituisce una **proporzione tra operazioni vincenti e perdenti**, ricavata dal campo `success_rate` dell'individuo (scritto come `num:den`; se `den` è zero si usa 0,5 al suo posto). Che `den` conti le operazioni perdenti è [ipotesi]: dal codice si legge solo il rapporto tra i due numeri.

Nella creazione di un nuovo individuo (`CreateIndividual`, righe 224-229) il primo genitore è scelto per CAGR, a meno che la popolazione superi il massimo (`MAX_POPULATION_REQUIRED` = 300), caso in cui si usa la proporzione di operazioni vincenti; il secondo genitore è sempre scelto in base alla proporzione di operazioni vincenti. La scelta è un **torneo**: si pescano 3 individui a caso e vince il migliore (`tournamentSelection`, righe 102-113). Si noti che l'algoritmo di Consilium non lavora a generazioni intere come nell'esempio di questo capitolo: genera un figlio alla volta, e la popolazione cresce. Il principio (selezione, crossover, mutazione) è lo stesso. Il crossover copia ogni parametro a caso da uno dei due genitori, e la mutazione modifica ogni parametro con probabilità 0,0666 (`gaParams.MUTATION_PROBABILITY`, riga 14) con una variazione casuale: sono descritti nel codice alle righe 115-180.

#### 2.7.3 Che cosa non premia

Nessuna delle due funzioni guarda il **rischio**: quanto si scende prima di risalire, o quanto è irregolare il percorso. Un esempio sul dataset giocattolo lo rende concreto.

Per prima cosa, un termine da definire. Il **massimo calo** (in inglese *maximum drawdown*) è la perdita più grande dal punto più alto raggiunto in precedenza. Si calcola così: per ogni giorno si guarda il valore del capitale (denaro più azioni valutate al prezzo di chiusura) e il massimo valore avuto fino ad allora; il calo di quel giorno è il rapporto tra i due, meno 1; il massimo calo è il peggiore tra tutti i giorni. È una misura di quanto «ci si fa male» nel percorso, anche se poi si recupera.

Due genomi diversi della stessa famiglia `(c, m)`: il genoma P con `c` = 0,60 e `m` = 0,005 (è il genoma C della sezione 2.4), e il genoma Q con `c` = 0,05 e `m` = 0,02.

| Genoma | Operazioni | Valore finale | Rendimento | Massimo calo |
|---|---|---|---|---|
| P (0,60; 0,005) | buy g4 @10,55; sell g11 @10,80; buy g17 @10,80 | 1080,57 | +8,06% | -4,85% |
| Q (0,05; 0,02) | buy g4 @10,55 (poi tiene) | 1080,57 | +8,06% | -10,13% |
| buy&hold | buy g2 @10,10 | 1128,71 | +12,87% | -10,13% |

I due genomi finiscono con lo **stesso valore finale**, 1080,57, e per un voto basato sul solo rendimento sono identici. Ma hanno attraversato i 20 giorni in modo diverso.

- P ha comprato il giorno 4 e ha raggiunto 1075,83 il giorno 8 (il picco). Poi ha venduto il giorno 11, quando il capitale era sceso a 1023,70, e ha aspettato fuori dal mercato. Il calo massimo è (1023,70 / 1075,83) - 1 = -4,85%.
- Q ha comprato il giorno 4 e non ha mai venduto. Dal picco di 1075,83 (giorno 8) è sceso fino a 966,82 (giorno 14), sotto il capitale iniziale, e poi è risalito. Il calo massimo è (966,82 / 1075,83) - 1 = -10,13%.

Per un investitore la differenza è grande: Q ha passato tre giorni (dal 12 al 14) sotto il capitale iniziale e al punto più basso aveva perso il 3,3% di quello che aveva messo; P non è mai sceso sotto 1000. Il voto basato sul rendimento non distingue i due. Una funzione che penalizzasse il massimo calo preferirebbe P. Il rapporto di Consilium, tra le possibili direzioni future, elenca «una fitness che penalizzi il drawdown massimo o la volatilità dei rendimenti, non solo il CAGR medio».

Attenzione al contrario: si potrebbe pensare che penalizzare il rischio sia sempre meglio. Ma ogni scelta sposta ciò che l'evoluzione produce: una fitness che penalizza molto il calo premierebbe genomi che non operano mai (come D e F nella sezione 2.4, che non hanno alcun calo), e con il ragionamento di questo capitolo non c'è una scelta «giusta» in assoluto.

#### 2.7.4 La scelta della fitness non è decisa qui

Quale voto usare è oggetto di una ricerca a parte, chiamata **R5** nell'epica del progetto. Questa guida descrive il meccanismo e mostra che la scelta conta: **non decide** quale fitness adottare. Vale per tutte le forme di genoma, ed è una scelta indipendente dalla forma che Luca sceglierà.

### 2.8 Come cambia l'algoritmo genetico secondo la forma del genoma

Il ciclo (valutare, selezionare, incrociare, mutare) è identico per tutte le forme. Cambia che cosa sono i geni e come si fanno crossover e mutazione. Le righe seguenti sono un'anticipazione dei capitoli dedicati, con i fatti della rassegna e i suoi riferimenti.

| Forma | I geni sono... | Crossover | Mutazione |
|---|---|---|---|
| **Lineare** (punteggio con soglie) | un vettore di numeri: un peso per indicatore, una costante, due soglie (9 numeri con 6 ingressi di esempio) | scambio di geni tra genitori, o media aritmetica come il figlio I della sezione 2.4 | piccola variazione casuale di un numero, come la mutazione della sezione 2.4 |
| **Albero di espressioni** (programmazione genetica) | i nodi di un albero di operazioni e indicatori, di forma e dimensione variabili | scambio di sottoalberi tra due genitori [5] | sostituzione di un nodo o di un sottoalbero con uno casuale |
| **Lista di regole** | una lista ordinata di regole «se condizione allora azione» con margini numerici | scambio di regole, con cautela perché l'ordine cambia il significato; i margini si mescolano facilmente | cambio di un margine, di un indicatore, di un'azione; aggiunta o rimozione di una regola |
| **Rete neurale** | i pesi di una rete (43 con la rete di esempio), e per NEAT anche la sua struttura [1] | scambio di pesi, delicato perché due reti equivalenti con neuroni in ordine diverso danno figli scadenti; NEAT usa marcatori storici per allinearle [1] | variazione di un peso; in NEAT aggiunta di un neurone o di una connessione |
| **Fuzzy** (logica sfumata) | i parametri delle funzioni di appartenenza (54 con 6 ingressi di esempio) e la base di regole | scambio di parametri o di regole, mantenendoli ordinati e dentro l'intervallo ammesso | variazione di un parametro o di una regola |
| **Modello a stati nascosti (HMM)** | medie e varianze di ogni regime, matrice di transizione e mappa regime-azione (circa 44 numeri con 3 regimi) | delicato: permutare i regimi dà lo stesso modello con numeri diversi, e le righe della matrice devono sommare a 1 | variazione di un parametro, poi rinormalizzazione delle righe |
| **Macchina a stati attuale** | 11 numeri continui più la struttura (nove stati con liste di condizioni) | per scelta, gene per gene, e scambio di stati interi (`src/vendor/consilium/individual.js`, righe 191 e 350-380) | variazione dei numeri, aggiunta o modifica di condizioni nei singoli stati |

I conteggi di geni sono quelli della rassegna, riferiti ai sei ingressi di esempio. Il giudizio su quanto ciascun crossover sia «sensato» è dell'autore della rassegna ed è in gran parte marcato come ipotesi: è un criterio che i capitoli seguenti riprendono, forma per forma.

### 2.9 Dove stiamo nel progetto

Questo capitolo ha mostrato l'algoritmo genetico su una piccola scala, come si fa per capirlo. Nel progetto le cose stanno così.

- L'**evoluzione avverrà fuori dal browser**, in Node, nel repository Consilium su un branch dedicato. Nell'ordine delle cose, una popolazione grande e molte generazioni sono un lavoro lungo, che il browser non è fatto per svolgere.
- Il **PoC** di SwarmTrader-core (la dimostrazione nel browser) **non evolve nulla**: riproduce, sui dati storici di ENI già incorporati, un genoma già evoluto, e lo mostra giorno per giorno.
- La forma del genoma, che questa guida aiuta a scegliere, determina che cosa il motore di evoluzione deve gestire (i geni, il crossover, la mutazione, come nella sezione 2.8) e che cosa il PoC deve saper riprodurre.

### 2.10 In breve

- Un algoritmo genetico fa evolvere una popolazione di strategie: ogni genoma riceve un voto (la fitness), i migliori fanno da genitori, i figli nascono per crossover e mutazione, e il ciclo si ripete.
- Nell'esempio a due geni (`c`, `m`) sul dataset giocattolo, una generazione ha portato il voto medio da 1021,71 a 1079,15 e il migliore da 1080,57 a 1133,02. Sono numeri inventati: mostrano il meccanismo e non provano nulla sui mercati.
- Si usa una popolazione perché esplora più punti e mette insieme le parti riuscite di individui diversi; la popolazione converge quando i genomi diventano simili e i voti smettono di salire.
- Un genoma può imparare a memoria i dati su cui è scelto (overfitting): per questo servono tre insiemi di dati separati (addestramento, validazione, prova finale). Gli esperimenti di Consilium mostrano, qualitativamente, collasso fuori campione con addestramento corto, genomi che non battono il buy&hold e strategie che non si trasferiscono tra panieri.
- La fitness decide che cosa viene premiato: Consilium usa il CAGR (e per il secondo genitore la proporzione di operazioni vincenti), che non guarda il rischio. Due genomi con lo stesso valore finale (1080,57) hanno massimi cali di -4,85% e -10,13%. La scelta della fitness è la ricerca R5 e non è decisa qui.
- La forma del genoma cambia che cosa sono i geni e come si fanno crossover e mutazione, non il ciclo.

## 3. La macchina a stati attuale

Questo capitolo descrive la forma di genoma che il progetto usa oggi, quella ereditata da Consilium. Serve da metro di confronto per tutte le alternative: per giudicarle bisogna sapere bene com'è fatto il genoma di oggi, che cosa sa fare e dove tiene il ricordo del passato.

### 3.1 In una frase e un'analogia

Il genoma attuale è una macchina a stati: una rete di nove «situazioni» in cui la strategia può trovarsi, collegate da regole che dicono, in base a confronti tra medie di prezzi e di volumi, quando passare da una situazione all'altra; alcune situazioni portano con sé l'ordine di comprare.

L'analogia più semplice è un semaforo. Un semaforo ha tre stati (verde, giallo, rosso) e non decide guardando solo ciò che vede adesso: decide in base allo stato in cui è e al tempo trascorso. Il rosso diventa verde, il verde diventa giallo, il giallo diventa rosso. Per un programmatore è lo stesso schema di un `switch` su una variabile `state` che viene riassegnata a ogni ciclo.

### 3.2 Come funziona: che cos'è una macchina a stati

Una macchina a stati (in inglese finite state machine, FSM) ha quattro ingredienti.

- **Stati.** Un elenco finito di situazioni, delle quali la macchina occupa una sola alla volta. Hanno un nome (nel semaforo: verde, giallo, rosso).
- **Condizioni.** Domande a cui si risponde sì o no guardando i dati nuovi (nel semaforo: «il timer è scaduto?»).
- **Transizioni.** Regole del tipo «se sono nello stato X e la condizione Y è vera, passo allo stato Z».
- **Azioni.** Cose che la macchina fa quando è in un certo stato (nel semaforo: accendere la luce verde).

Un esempio non finanziario: un distributore di bevande con tre stati.

| Stato attuale | Evento (condizione) | Stato successivo | Azione |
|---|---|---|---|
| Attesa | l'utente inserisce una moneta | Credito | mostra il credito |
| Credito | il credito basta per la bevanda scelta | Erogazione | rilascia la bevanda |
| Credito | l'utente preme «annulla» | Attesa | restituisce le monete |
| Erogazione | la bevanda è caduta | Attesa | nessuna |

Lo stesso evento («l'utente preme un pulsante») ha effetti diversi a seconda dello stato: in Attesa non succede nulla, in Credito parte l'erogazione. Lo stato è quindi una **memoria**: ricorda che cosa è successo prima (c'è una moneta dentro) e permette di rispondere in modo diverso allo stesso dato in ingresso. È questa proprietà che interessa a noi.

### 3.3 Come funziona: il genoma reale di Consilium

I numeri di questa sezione sono stati controllati con uno script sul genoma fisso di ENI (`FIXED_GENOME` in `src/engine/genome.js`, righe 13-36).

#### 3.3.1 Che cosa decide ogni giorno

Il genoma non decide in autonomia che cosa fare dei soldi. Ogni giorno la macchina riceve la barra del giorno (apertura, massimo, minimo, chiusura e volume scambiato, cioè il numero di azioni passate di mano), aggiorna i suoi filtri, valuta se cambiare stato e, se lo stato in cui si trova porta un'azione di acquisto, chiede al `Trader` di comprare (`src/vendor/consilium/algorithm.js`, righe 365-417). Il `Trader` esegue l'ordine il giorno dopo, all'apertura, e si occupa anche delle uscite per stop loss e take profit (vedi sotto).

Come «prezzo del giorno» la macchina usa la media di apertura, massimo, minimo e chiusura (`src/vendor/consilium/stockStream.js`, righe 32-34). Il «volume» è il volume del giorno.

#### 3.3.2 I nove stati e la bussola

I nove stati si chiamano come i punti di una bussola e sono disposti su una griglia di tre righe per tre colonne (`GENOME_STATES` in `genome.js`, riga 4; costruzione della griglia in `algorithm.js`, righe 289-303):

```
          colonna 0   colonna 1   colonna 2
riga 0      NW          N           NE
riga 1      W           C           E
riga 2      SW          S           SE
```

La macchina parte dallo stato centrale **C** (`algorithm.js`, righe 270-271 e 358). Da ogni stato si può uscire in quattro direzioni: nord, est, sud, ovest. La direzione porta allo stato confinante sulla griglia. Da C, per esempio, il nord porta a N, l'est a E, il sud a S, l'ovest a W. La griglia è «avvolta»: uscendo dal bordo si rientra dal bordo opposto. Da NW il nord porta a SW (si esce in alto e si rientra in basso) e l'ovest porta a NE (`algorithm.js`, righe 305-335). Il risultato è che ogni stato ha esattamente quattro vicini e il grafo non ha bordi.

Perché questa disposizione? Nel codice non c'è scritto e non risulta un documento che la motivi **[ipotesi]**. Quello che si può osservare è che una griglia con quattro direzioni dà a ogni stato lo stesso numero di uscite, e quindi un formato fisso del genoma: per ogni stato ci sono al più quattro liste di condizioni, nient'altro. Questo semplifica la codifica e lo scambio di stati tra due genitori, perché ogni stato ha la stessa forma. Il codice nasce come traduzione di una versione in C++ (`algorithm.js`, riga 3), quindi la scelta è ereditata.

Il genoma elenca le uscite con una chiave che è il **nome dello stato di arrivo**: la chiave `_SW` dello stato NW è l'uscita che porta a SW. La chiave `_0` indica il centro C. Nel genoma fisso tutti gli stati hanno quattro uscite, in totale 36 transizioni.

Un controllo di coerenza fatto per questo capitolo: in 35 uscite su 36 il nome della chiave coincide con lo stato vicino a cui la griglia porta. L'eccezione è lo stato SW: la lista che ha chiave `_SW` (cioè se stesso) è collegata alla direzione sud, il cui vicino sulla griglia avvolta è NW. Non è chiaro se sia voluto o un residuo della traduzione dal C++: lo si segnala senza trarne conclusioni (vedi «Che cosa non si è potuto accertare» nel capitolo 10).

#### 3.3.3 I quattro filtri

La macchina non guarda direttamente i prezzi passati: ne mantiene quattro riassunti, detti filtri. Ciascuno è una **media mobile esponenziale** (nel codice «IIR»), cioè una media che si aggiorna ogni giorno così:

```
nuova_media = vecchia_media * (1 - c) + dato_di_oggi * c       (algorithm.js, righe 369-372)
```

In parole: la nuova media è un miscuglio tra la media di ieri e il dato di oggi. Il numero `c`, tra 0 e 1, dice quanto pesa il dato nuovo. Esempio: media di ieri 10,00, prezzo di oggi 11,00, c = 0,5: nuova media = 10,00 · 0,5 + 11,00 · 0,5 = 10,50. Con c = 0,2 viene 10,00 · 0,8 + 11,00 · 0,2 = 10,20. Un `c` grande segue il prezzo da vicino; un `c` piccolo rende la media lenta, che dimentica poco e cambia piano. Il primo giorno la media parte dal primo dato.

I quattro filtri del genoma fisso sono:

| Filtro | Segue | Coefficiente c | Durata tipica 1/c (giorni) |
|---|---|---|---|
| `iir_price_1` | il prezzo | 0,731 | 1,4 |
| `iir_price_2` | il prezzo | 0,990 | 1,0 |
| `iir_volume_1` | il volume | 0,118 | 8,5 |
| `iir_volume_2` | il volume | 0,396 | 2,5 |

«Durata tipica» è un modo grossolano per dire quanti giorni di passato pesano in modo apprezzabile (circa 1 diviso c).

#### 3.3.4 I quattro margini

A ciascun filtro è associato un **margine**, un numero percentuale del genoma che sposta la soglia di confronto. Il margine è proporzionale al filtro: `margine_assoluto = filtro * margine_percentuale` (`algorithm.js`, righe 381-384; le percentuali sono divise per 100 in `genome.js`, funzione `toFraction`). Il suo scopo è evitare di reagire a differenze minime, oppure, con un margine negativo, di tollerare un piccolo scarto nella direzione opposta.

Valori del genoma fisso: margine del prezzo 1 = 0,10 per cento; margine del prezzo 2 = −1,10 per cento (negativo); margine del volume 1 = 2,40 per cento; margine del volume 2 = 11,62 per cento.

Un esempio numerico: il filtro del prezzo 1 vale 10,90. Il margine 1 vale 0,10 per cento, cioè 10,90 · 0,001 = 0,0109. La soglia per il confronto è quindi 10,90 + 0,0109 = 10,9109.

#### 3.3.5 Le quattordici condizioni

Una **condizione** è un confronto che dà vero o falso. Ce ne sono quattordici, numerate da 0 a 13 (`ConditionFunctions` in `algorithm.js`, righe 20-62). Le prime due sono banali: la 0 è sempre falsa e la 1 è sempre vera. Le altre dodici sono coppie «maggiore di» / «minore di»:

| N. | Confronto | In parole |
|---|---|---|
| 0 | sempre falso | non scatta mai |
| 1 | sempre vero | scatta sempre |
| 2 | prezzo > filtro prezzo 1 + margine 1 | il prezzo di oggi è sopra il filtro veloce |
| 3 | prezzo < filtro prezzo 1 + margine 1 | il prezzo di oggi è sotto il filtro veloce |
| 4 | prezzo > filtro prezzo 2 + margine 2 | il prezzo di oggi è sopra il secondo filtro |
| 5 | prezzo < filtro prezzo 2 + margine 2 | il prezzo di oggi è sotto il secondo filtro |
| 6 | filtro prezzo 1 > filtro prezzo 2 + margine 2 | il primo filtro sta sopra il secondo |
| 7 | filtro prezzo 1 < filtro prezzo 2 + margine 2 | il primo filtro sta sotto il secondo |
| 8 | volume > filtro volume 1 + margine volume 1 | oggi si scambia più del normale |
| 9 | volume < filtro volume 1 + margine volume 1 | oggi si scambia meno del normale |
| 10 | volume > filtro volume 2 + margine volume 2 | volume sopra il secondo filtro |
| 11 | volume < filtro volume 2 + margine volume 2 | volume sotto il secondo filtro |
| 12 | filtro volume 1 > filtro volume 2 + margine volume 2 | il volume sta crescendo (media lenta sopra media veloce) |
| 13 | filtro volume 1 < filtro volume 2 + margine volume 2 | il volume sta calando |

Dei 14 identificatori, 12 hanno un contenuto di mercato e 2 sono costanti. Le dodici sono sei coppie «maggiore di» e «minore di» sullo stesso confronto (le due coppie non coprono il caso di uguaglianza esatta).

Un esempio concreto con il genoma fisso: prezzo di oggi 11,00, filtro del prezzo 1 a 10,90. La condizione 2 confronta 11,00 con 10,9109: è vera. Un altro: volume di oggi 1500, filtro del volume 1 a 1300, margine volume 1 = 2,40 per cento. La soglia è 1300 + 1300 · 0,0240 = 1331,25; 1500 > 1331,25, quindi la condizione 8 è vera.

Una lettura dei numeri del genoma fisso, calcolata con uno script sui dati ENI (2516 giorni): la condizione 4 risulta **vera tutti i giorni** e la 5 **mai**. La ragione è il filtro `iir_price_2` con c = 0,99, che resta praticamente uguale al prezzo (lo scarto massimo osservato è lo 0,26 per cento), e il margine negativo (−1,10 per cento), che abbassa ulteriormente la soglia. Torno su questo punto nella sezione sulla memoria.

#### 3.3.6 Le transizioni: liste di condizioni

Ogni stato ha fino a quattro **liste di condizioni**, una per direzione. La lista è un elenco di identificatori e la transizione scatta solo se **tutte** le condizioni della lista sono vere (un AND, `evaluateConditions` in `algorithm.js`, righe 135-170). Esempio dal genoma fisso: la lista dello stato NW verso W è `[1]`, cioè «condizione 1», sempre vera. La lista di C verso S è `[0, 1, 1, 8, 0, 10]`: contiene due volte la condizione 0 (sempre falsa), perciò non può mai scattare.

Ogni giorno si controllano le direzioni **nell'ordine nord, est, sud, ovest** e si prende la prima la cui lista è tutta vera; se nessuna lo è, lo stato non cambia (`getNextState`, righe 177-193). Si fa al massimo una transizione al giorno.

Conteggi dal genoma fisso (script di lavoro, che legge il genoma con Node):

| Elemento | Valore |
|---|---|
| Stati | 9 |
| Transizioni (liste di condizioni) | 36, quattro per stato |
| Identificatori di condizione in totale | 135 |
| Lunghezza di una lista | da 1 a 8, media 3,75 |
| Identificatori diversi usati | 13 (da 0 a 12; il 13 non compare) |
| Liste che contengono lo 0 e quindi non scattano mai | 7 |
| Liste fatte solo di 1 e quindi scattano sempre | 2 (NW verso W, C verso N) |
| Numeri continui (4 coefficienti, `buy_percent`, 4 margini, stop loss, take profit) | 11 |

Un esempio di come la macchina cammina: all'inizio è in C. La lista di C verso N è `[1, 1]`, sempre vera. Quindi alla prima barra la macchina passa da C a N, indipendentemente dai dati. Dal giorno dopo guarda le liste di N, e così via. Lo scopo del genoma evoluto è proprio disporre le condizioni in modo che la macchina arrivi in uno stato «di acquisto» quando serve.

#### 3.3.7 Azioni, stop loss, take profit, percentuale investita

Ogni stato può avere un'**azione**, `buy` o `sell` (`genome.js`, righe 58-61). Nel genoma fisso solo lo stato **SW** ha un'azione, `buy`. Ogni giorno in cui la macchina si trova in SW, chiede di comprare; negli altri otto stati non fa nulla (è un «hold» implicito). Non esiste uno stato con `sell`: le vendite avvengono per un'altra via, descritta qui sotto. Che cosa faccia il `Trader` se riceve un `buy` mentre ha già una posizione aperta non è stato verificato.

**Percentuale investita (`buy_percent`).** È la quota del denaro disponibile che un acquisto impiega. Nel genoma fisso è 99,62 per cento: su 1000 euro disponibili si comprano azioni per circa 996,17 euro (parte del denaro può andare in costi o nell'arrotondamento a un numero intero di azioni).

**Stop loss.** È una soglia di perdita: se il prezzo scende sotto un certo livello rispetto al prezzo di acquisto, la posizione si chiude automaticamente per limitare il danno. Il nome viene dall'idea di fermare la perdita. Esempio: compro a 10,00 con stop loss 50 per cento; la posizione si chiude se il prezzo scende a 10,00 · (1 − 0,50) = 5,00. Nel genoma fisso è 50 per cento: una soglia così lontana scatta soltanto in un crollo.

**Take profit.** È la soglia di guadagno: se il prezzo sale oltre un certo livello rispetto all'acquisto, la posizione si chiude per incassare. Esempio: compro a 10,00 con take profit 5,8 per cento; la posizione si chiude se il prezzo sale a 10,00 · 1,058 = 10,58. Nel genoma fisso è 5,8 per cento.

Nel genoma fisso, quindi, la strategia è: gli stati e le condizioni decidono **quando entrare** (stato SW); stop loss e take profit decidono **quando uscire**. Questi tre parametri (percentuale, stop loss, take profit) sono del `Trader`, non della macchina a stati, e valgono per qualsiasi forma di genoma (vedi la sezione «Metodo e fonti» della rassegna).

### 3.4 Esempio applicato al dataset giocattolo

**Versione ridotta, dichiarata come tale.** La macchina reale ha nove stati, quattro filtri, quattordici condizioni e 36 transizioni: non entrerebbe in una tabella giorno per giorno. Per capire il meccanismo si usa una versione ridotta che ne conserva lo spirito: **tre stati**, **due filtri**, **due condizioni** (più una «sempre vera» che serve nella parte sull'evoluzione). I numeri sono inventati e non dicono nulla sul funzionamento della macchina reale.

**Gli ingredienti.**

- Stati: **Fuori** (non ho posizione), **In osservazione** (ieri il filtro veloce ha superato il lento), **Dentro** (ho deciso di tenere o comprare).
- Filtri sul prezzo: veloce con c = 0,5 e lento con c = 0,2.
- Margine: 0.
- Condizioni: **A** = filtro veloce > filtro lento; **B** = filtro veloce < filtro lento; **T** = sempre vera.
- Azioni: Fuori = sell, In osservazione = hold, Dentro = buy.

**Tabella delle transizioni.** Si controllano nell'ordine scritto, la prima vera scatta; se nessuna è vera si resta dove si è.

| Stato attuale | Condizione | Stato successivo |
|---|---|---|
| Fuori | A | In osservazione |
| In osservazione | B | Fuori |
| In osservazione | A | Dentro |
| Dentro | B | Fuori |

Le uscite da In osservazione sono due liste in ordine: prima B, poi A.

**Semplificazioni di questo esempio.** Decisione alla chiusura del giorno t, eseguita al prezzo del giorno t+1; compra con tutto il denaro o vende tutto; azioni frazionarie; nessun costo, nessuno stop loss né take profit; l'ultima decisione è ignorata; capitale 1000. La macchina parte in Fuori (quella reale parte in C). Il prezzo del giorno è quello di chiusura del dataset giocattolo, non la media di quattro valori. Il volume non è usato. Nelle tabelle i numeri sono arrotondati a due decimali.

**Tabella giorno per giorno** (script di lavoro):

| Giorno | Prezzo | Filtro veloce | Filtro lento | Stato prima | Transizione | Stato dopo | Decisione |
|---|---|---|---|---|---|---|---|
| 1 | 10,00 | 10,00 | 10,00 | Fuori | nessuna | Fuori | sell |
| 2 | 10,10 | 10,05 | 10,02 | Fuori | A | In osservazione | hold |
| 3 | 10,30 | 10,18 | 10,08 | In osservazione | A | Dentro | buy |
| 4 | 10,55 | 10,36 | 10,17 | Dentro | nessuna | Dentro | buy |
| 5 | 10,80 | 10,58 | 10,30 | Dentro | nessuna | Dentro | buy |
| 6 | 11,00 | 10,79 | 10,44 | Dentro | nessuna | Dentro | buy |
| 7 | 11,20 | 11,00 | 10,59 | Dentro | nessuna | Dentro | buy |
| 8 | 11,35 | 11,17 | 10,74 | Dentro | nessuna | Dentro | buy |
| 9 | 11,30 | 11,24 | 10,85 | Dentro | nessuna | Dentro | buy |
| 10 | 11,10 | 11,17 | 10,90 | Dentro | nessuna | Dentro | buy |
| 11 | 10,80 | 10,98 | 10,88 | Dentro | nessuna | Dentro | buy |
| 12 | 10,50 | 10,74 | 10,81 | Dentro | B | Fuori | sell |
| 13 | 10,30 | 10,52 | 10,70 | Fuori | nessuna | Fuori | sell |
| 14 | 10,20 | 10,36 | 10,60 | Fuori | nessuna | Fuori | sell |
| 15 | 10,35 | 10,36 | 10,55 | Fuori | nessuna | Fuori | sell |
| 16 | 10,55 | 10,45 | 10,55 | Fuori | nessuna | Fuori | sell |
| 17 | 10,80 | 10,63 | 10,60 | Fuori | A | In osservazione | hold |
| 18 | 11,05 | 10,84 | 10,69 | In osservazione | A | Dentro | buy |
| 19 | 11,25 | 11,04 | 10,80 | Dentro | nessuna | Dentro | buy |
| 20 | 11,40 | 11,22 | 10,92 | Dentro | nessuna | Dentro | buy |

**Che cosa succede, giorno per giorno.** Il giorno 1 le due medie sono uguali al prezzo, nessuna condizione è vera. Il giorno 2 il prezzo sale, il filtro veloce (che reagisce di più) supera il lento: scatta A e la macchina passa da Fuori a In osservazione. Il giorno 3 A è ancora vera e, essendo In osservazione, la macchina passa a Dentro e decide `buy`. Nei giorni 4-11 A resta vera, ma dallo stato Dentro non esiste una transizione che usi A, quindi si resta lì. Il giorno 12 il prezzo è sceso a 10,50 e il filtro veloce (10,74) è sceso sotto il lento (10,81): scatta B e si torna a Fuori, con `sell`. I giorni 13-16 il filtro veloce è sotto il lento: da Fuori non c'è una transizione per B, si resta Fuori. Il giorno 17 il veloce supera di nuovo il lento e il ciclo si ripete.

**Come lo stato ricorda.** Gli stessi dati in ingresso, A vera, producono tre effetti diversi: il giorno 2 portano da Fuori a In osservazione, il giorno 3 da In osservazione a Dentro, il giorno 4 non cambiano nulla. La macchina non conta quante volte A sia stata vera; il suo stato lo ricorda al posto suo. «In osservazione» significa: «ieri ero Fuori e il filtro veloce ha superato quello lento». È una frase sul passato, scritta nel nome dello stato. Dentro significa: «ho già visto due giorni di fila il veloce sopra il lento». Così, usando soltanto confronti che guardano il giorno corrente, la macchina esprime una regola con conferma di due giorni: un'espressione senza stato non la saprebbe scrivere. Su questo dataset il ramo In osservazione verso Fuori non viene mai usato (dopo un A non arriva mai subito un B), ma esiste e si userebbe con un falso segnale.

**Risultato col valutatore.**

| Strategia | Operazioni (giorno, tipo, prezzo) | Valore finale | Rendimento |
|---|---|---|---|
| Macchina ridotta | giorno 4 buy a 10,55; giorno 13 sell a 10,30; giorno 19 buy a 11,25 | 989,32 | −1,07 per cento |
| Buy&hold (comprare il giorno 1 e tenere, riferimento) | giorno 2 buy a 10,10 | 1128,71 | +12,87 per cento |

La macchina ridotta compra con un giorno di ritardo rispetto al segnale (come impone il valutatore), vende in ritardo rispetto al massimo e rientra tardi. Nel dataset giocattolo quindi non batte il buy&hold, e va bene: l'esempio mostra il meccanismo, non un risultato. I numeri non dicono nulla su come funzionerebbe la macchina reale.

### 3.5 Come evolve

#### 3.5.1 I geni

Il genoma di una macchina a stati ha due tipi di «geni».

- **Numeri continui:** i coefficienti dei filtri, i margini e (nella macchina reale) percentuale investita, stop loss, take profit. Nella versione ridotta sono i due coefficienti (0,5 e 0,2) e il margine (0).
- **Struttura discreta:** per ogni stato, le liste di condizioni delle transizioni (nella macchina reale: 36 liste, lunghe fino a 8 identificatori) e le azioni degli stati. Nella versione ridotta è la tabella delle transizioni.

Nel codice reale la mutazione e il crossover sono in `src/vendor/consilium/individual.js` (righe 191-380 circa). La **mutazione** può spostare di poco un numero continuo, oppure, per uno stato scelto, aggiungere, togliere o cambiare un identificatore di condizione in una delle liste, oppure cambiarne l'azione. Il **crossover** prende per ogni numero continuo il valore dell'uno o dell'altro genitore con probabilità metà, e per ogni stato copia l'intera struttura di quello stato dall'uno o dall'altro genitore.

Un dettaglio letto nel codice: quando un coefficiente di filtro viene mutato, il risultato è tenuto tra 0,001 e 0,5 (`individual.js`, righe 197-208 e `mutateFloat`). I valori 0,73 e 0,99 del genoma fisso, quindi, sembrano non raggiungibili con la sola mutazione; verrebbero dalla generazione iniziale o da altro codice (non verificato). Va considerato un dubbio: si veda il capitolo 10.

#### 3.5.2 Esempio di mutazione (versione ridotta)

Tre mutazioni a partire dalla macchina di base, provate col valutatore (script di lavoro):

| Mutazione | Che cosa cambia | Operazioni | Valore finale | Rendimento |
|---|---|---|---|---|
| (base) | c lento 0,2; margine 0 | buy g.4 a 10,55; sell g.13 a 10,30; buy g.19 a 11,25 | 989,32 | −1,07 per cento |
| M1 | coefficiente lento da 0,2 a 0,35 | buy g.4 a 10,55; sell g.12 a 10,50; buy g.19 a 11,25 | 1008,53 | +0,85 per cento |
| M2 | transizione In osservazione verso Dentro: la condizione da A a T (sempre vera) | identiche alla base | 989,32 | −1,07 per cento |
| M3 | margine da 0 a 0,5 per cento | buy g.5 a 10,80; sell g.13 a 10,30; buy g.20 a 11,40 | 953,70 | −4,63 per cento |

Che cosa è successo, uno per uno.

- **M1.** Un filtro lento meno lento segue di più il prezzo, quindi il veloce incrocia sotto il lento un giorno prima (giorno 11 invece del 12) e la vendita arriva a 10,50 invece di 10,30.
- **M2.** Cambia un identificatore, ma sul dataset le decisioni restano le stesse: nei due giorni in cui la macchina è In osservazione, A era comunque vera. È una mutazione **neutra** su questi dati: il genoma è diverso, il comportamento no. Qui la differenza tra le due macchine comparirebbe solo in un giorno in cui né A né B sono vere (uguaglianza esatta dei due filtri), perché B viene controllata per prima. Il caso insegna che molte modifiche della struttura non cambiano nulla, quindi la ricerca si muove anche su zone piane in cui la fitness non varia.
- **M3.** Con un margine positivo il segnale A arriva un giorno dopo (la differenza tra i filtri deve superare lo 0,5 per cento del filtro lento): si entra e si rientra più tardi e il risultato peggiora su questi dati.

#### 3.5.3 Esempio di crossover (versione ridotta)

Due genitori.

- **Genitore 1:** la macchina di base (c veloce 0,5, c lento 0,2, tabella di base): −1,07 per cento.
- **Genitore 2:** c veloce 0,7, c lento 0,3, tabella diversa: Fuori verso Dentro con A direttamente; In osservazione verso Dentro con A; Dentro verso In osservazione con B (cioè non esce mai subito, passa prima da In osservazione, dalla quale con questa tabella non c'è uscita verso Fuori). Sul dataset: compra al giorno 3 a 10,30, non vende mai, finisce a 1106,80, +10,68 per cento.

Un **figlio** tipico per il crossover del codice (numeri continui da un genitore, stati ciascuno da un genitore): i numeri (0,5 e 0,2) dal genitore 1; gli stati Fuori e Dentro dal genitore 2; lo stato In osservazione dal genitore 1. La tabella risultante è:

| Stato attuale | Condizione | Stato successivo |
|---|---|---|
| Fuori | A | Dentro |
| In osservazione | B | Fuori |
| In osservazione | A | Dentro |
| Dentro | B | In osservazione |

Sul dataset: compra al giorno 3 a 10,30, vende al giorno 14 a 10,20 (Dentro scende a In osservazione il giorno 12 con B e va a Fuori il giorno 13 con un'altra B), ricompra al giorno 18 a 11,05; valore finale 1021,66, **+2,17 per cento**. Un secondo figlio possibile, con i numeri (0,7 e 0,3) del genitore 2 e la tabella del genitore 1, dà 1008,53 (+0,85 per cento).

Che cosa mostra. Lo scambio di stati interi produce figli sensati, che funzionano, e con decisioni diverse da entrambi i genitori. Ma il significato di una riga dipende dalle altre: il figlio funziona perché In osservazione e Dentro si richiamano a vicenda; se avesse ereditato una In osservazione che rimanda a uno stato ora diverso, il cammino sarebbe cambiato. Con 9 stati e 36 liste lo stesso fenomeno è più forte. Gli esempi sono quattro tentativi scelti dall'autore per mostrare il meccanismo: non esprimono la probabilità che un figlio sia migliore.

### 3.6 Cosa ricorda del passato

La memoria sta in due punti.

1. **Nei filtri.** Ogni filtro è una media che dipende da tutto il passato attraverso il valore di ieri. Nell'esempio ridotto, i due filtri a ogni giorno «ricordano» i prezzi precedenti con pesi che decrescono: il filtro lento con c = 0,2 ricorda più a lungo del veloce con c = 0,5. Se il prezzo salta di colpo da 100 a 110, dopo 6 giorni il filtro con c = 0,5 vale 109,84; quello con c = 0,2 vale 107,38 (script di lavoro).
2. **Nello stato discreto.** La macchina ricorda in quale stato si trova, che può sintetizzare una storia di giorni («ieri il veloce ha superato il lento», «sono già dentro»). Questo ricordo è **scritto nel genoma**: sono le transizioni che lo costruiscono. Nel genoma reale ci sono nove stati; il numero di combinazioni di storie distinguibili è al più nove.

**Il filtro `iir_price_2` con c = 0,99.** Un coefficiente così vicino a 1 dà un filtro quasi privo di memoria. La formula è `nuova = vecchia · 0,01 + dato · 0,99`: il passato pesa l'uno per cento. Esempio: salto da 100 a 110; il filtro vale 109,90 dopo un giorno e 110,00 dopo due, praticamente subito. Il filtro è quindi quasi uguale al prezzo di oggi. Conseguenze sul genoma fisso, misurate con uno script sui 2516 giorni ENI: la condizione 4 (prezzo > filtro 2 + margine 2) è vera tutti i giorni e la 5 mai, perché il margine è negativo (−1,10 per cento) e il filtro segue il prezzo da vicino (scarto massimo 0,26 per cento). Le due condizioni sono, in pratica, «sempre vera» e «sempre falsa». Sono invece informative la 6 e la 7, che confrontano il filtro veloce (c = 0,73) con il filtro quasi-prezzo, cioè il prezzo smorzato con il prezzo grezzo.

Questa lettura vale per i numeri del genoma fisso, non per la forma: un altro genoma potrebbe avere un c diverso.

**Perché è il limite che Luca vorrebbe superare.** La memoria del genoma attuale ha due difetti da dichiarare con cautela, perché sono considerazioni dell'autore **[ipotesi]**. Primo, la memoria di stato è costruita dall'evoluzione stessa: per avere «ieri il filtro ha incrociato» bisogna che il GA trovi la giusta combinazione di stati e transizioni, mentre con un indicatore finanziario noto (una media, un incrocio di medie) la memoria è già data e non va scoperta. Secondo, lo stato è un'etichetta di nove valori: sapere in che stato si è dice poco su che cosa sia successo prima, e quindi spiegare perché la macchina si trova in C o in SE richiede di ripercorrere la storia delle transizioni.

### 3.7 Che cosa non ha funzionato secondo gli esperimenti di Consilium

Il rapporto interno di Consilium sugli esperimenti di addestramento e verifica fuori campione [18] riporta alcuni risultati qualitativi, riassunti qui senza cifre. Sono esiti dell'**insieme** formato dalla macchina a stati, dalla fitness basata sul rendimento annuo composto (CAGR), dai parametri di rischio e dalla scelta dei dati; il rapporto non separa il peso della sola forma. I dati sono titoli e panieri italiani diversi dalla serie ENI di questo progetto.

- **Addestramento corto su un solo titolo.** I genomi migliori in addestramento hanno reso male sulla finestra tenuta fuori, in modo sistematico: sovradattamento severo (il genoma si è adattato ai dati visti, rumore compreso).
- **Addestramento più lungo.** L'inversione catastrofica sparisce, ma i genomi restano sotto il semplice buy&hold quando il titolo sale con decisione.
- **Più titoli insieme.** La generalizzazione migliora e non ci sono più esiti negativi in un anno favorevole. Ma i genomi non battono il buy&hold né in un anno favorevole né in uno sfavorevole: nel primo uscivano troppo presto, nel secondo perdevano più del titolo tenuto fermo.
- **Trasferimento tra panieri.** I genomi evoluti su un paniere funzionano peggio sugli altri: sono specializzati sul comportamento di quei titoli.
- **Causa comune indicata.** Parametri di rischio degeneri (uno stop loss troppo largo per scattare, un take profit stretto che taglia i guadagni nei trend) e una fitness che non premia la gestione del rischio. Si noti che anche il genoma fisso di questo progetto ha stop loss 50 per cento e take profit 5,8 per cento.

Che cosa **non** si può concludere. Il rapporto non dice che la macchina a stati sia peggiore di un'altra forma, perché non ha confrontato forme. Quei difetti nascono almeno in parte da parametri di rischio e fitness che sono comuni a tutte le forme (sezione «Metodo e fonti» della rassegna); una forma diversa con la stessa fitness e gli stessi parametri potrebbe ripeterli.

### 3.8 Punti di forza e debolezze, in parole semplici

**Quanto sa esprimere?** Ogni transizione è un AND di confronti tra prezzo, filtri e margini, e l'azione dipende dallo stato. Può quindi rappresentare regole con più condizioni insieme («prezzo sopra la media e volume alto») e con una sequenza («prima A, poi B»), cosa che una semplice somma pesata non fa. Non può usare indicatori diversi dai quattro filtri e dai confronti fissi: l'insieme delle condizioni è chiuso a 14. Livello nella scala della rassegna: a tratti.

**Quanto è grande lo spazio di ricerca?** Grande: 11 numeri continui più una struttura discreta (nel genoma fisso 36 liste con 135 identificatori). Una parte consistente dello spazio è sprecata o ridondante: 7 liste su 36 contengono lo 0 e non scattano mai, due sono sempre vere, e molte combinazioni portano a stati mai raggiunti. Un genoma con tanti gradi di libertà ha più facilità ad adattarsi al rumore dei dati di addestramento **[ipotesi]**.

**Si capisce perché decide così?** A metà. Una singola regola si legge («da N a NE se il volume supera il filtro»), ma sapere in quale stato si è alla barra t richiede di ripercorrere tutte le transizioni dall'inizio. I nomi NW, N, NE sono posizioni su una griglia, non significati: nulla nel nome dice che cosa lo stato rappresenti. Nel nostro esempio ridotto abbiamo dato i nomi «Fuori» e «Dentro» per leggibilità; nel genoma reale nessuno ha attribuito un significato agli stati: se ne ha uno, lo ha trovato l'evoluzione e va ricostruito leggendo le transizioni.

**Quanto costa calcolarlo?** Poco: quattro aggiornamenti dei filtri e al più quattro liste di condizioni al giorno, qualche decina di operazioni (`algorithm.js`, righe 365-417) **[ipotesi: conteggio a mano dell'autore, non misurato]**.

**Si mescola e si muta bene?** Sì, per costruzione: lo scambio di stati interi produce figli ben formati e la mutazione tocca numeri o liste. Il rischio è la dipendenza reciproca tra stati (figli sensati sul piano formale ma senza senso sul piano del comportamento) e le mutazioni neutre dell'esempio M2, che allargano la ricerca senza effetto.

**Si adatta al nostro motore?** È già integrata: vedi la sezione seguente.

### 3.9 Come si integra nel nostro motore

Qui la forma è già integrata. La classe `FsmIndividual` (`src/engine/fsmStrategy.js`) avvolge l'individuo di Consilium e rispetta il contratto di strategia del motore: `kind` vale `fsm`; `labels` è l'elenco dei nove stati (il motore mostra in che stato si trova la strategia ogni giorno); `describe()` restituisce lo stato attuale e i quattro filtri (`iirPrice1`, `iirPrice2`, `iirVolume1`, `iirVolume2`); `serialize()` restituisce il genoma come JSON, cioè i numeri e le liste di condizioni, in formato leggibile e salvabile. Il genoma fisso di ENI è costruito una volta (`createFsmFactory`) e il motore ne fa un individuo per ogni replay. Nessuna parte si adatta male: è il riferimento rispetto al quale le altre forme dovranno adattare le proprie etichette e i propri indicatori.

### 3.10 Cosa dice la letteratura

- Le macchine a stati finiti evolute con metodi evolutivi sono un filone antico: il lavoro di riferimento è quello di Fogel e collaboratori sulla programmazione evolutiva (anni Sessanta) **[ipotesi, fonte da verificare, non letta]**.
- Per il trading, l'evoluzione di regole su medie mobili e massimi e minimi è in [6] (letto solo un riassunto: nelle condizioni di quello studio, dopo i costi di transazione non si guadagna con le regole trovate), e una rassegna sistematica dell'uso di calcolo evolutivo per regole di trading azionario è in [7] (letto l'abstract).
- Una macchina a stati ha come cugina probabilistica il modello a stati nascosti, descritto in [2] (vedi il capitolo 9).
- Sul sovradattamento di strategie provate su dati storici, e sul perché la sola verifica fuori campione non basta quando si provano molte configurazioni: [4].
- Sugli esperimenti del progetto Consilium, descritti sopra: [18].

### 3.11 In breve

- Il genoma attuale è una rete di nove stati disposti su una griglia 3x3 avvolta (nomi di bussola); ogni stato ha fino a quattro uscite, ciascuna una lista di condizioni da 0 a 13 che devono essere tutte vere; nel genoma fisso: 36 transizioni e 135 identificatori.
- Le condizioni confrontano il prezzo e il volume del giorno con quattro filtri (medie esponenziali) spostati di quattro margini; stop loss, take profit e percentuale investita sono del Trader.
- Lo stato ricorda: lo stesso dato dà effetti diversi a seconda di dove si è. Ma la memoria va scoperta dall'evoluzione e il nome di uno stato non dice che cosa ricorda.
- Nel genoma fisso il filtro `iir_price_2` con c = 0,99 non ha quasi memoria e fa risultare la condizione 4 sempre vera e la 5 mai.
- Gli esperimenti di Consilium riportano sovradattamento e risultati sotto il buy&hold, che sono esiti di forma, fitness e parametri insieme, non della sola forma.
- Spazio grande, lettura a metà, integrazione già fatta.

## 4. Il punteggio lineare con soglie

Questo capitolo descrive la forma che la rassegna chiama «candidato A». Comprende anche due varianti: la **forma minima** (un solo indicatore e una sola soglia) e l'**osservatore di Kalman** (gli indicatori sono stimati da un piccolo modello). Tutti i numeri degli esempi escono da uno script di lavoro, eseguito sul dataset giocattolo di 20 giorni comune a tutta la guida. **I numeri del dataset sono inventati: mostrano come funziona il meccanismo, non dicono nulla sul comportamento reale di questa forma sui mercati.** Nessun esempio vuole battere il buy&hold (comprare il giorno 1 e tenere: +12,87 per cento sul dataset).

### 4.1 In una frase e un'analogia

Ogni giorno si calcolano alcuni numeri che descrivono l'andamento recente del prezzo e del volume, si fa una somma pesata di quei numeri e si confronta il risultato con due soglie: sopra la soglia alta si compra, sotto la soglia bassa si vende, in mezzo si aspetta.

**Analogia.** È un esame con più prove. Lo studente prende un voto in ciascuna prova (gli ingressi), ogni prova conta più o meno nel voto finale (i pesi), e il voto finale (il punteggio) decide l'esito: sopra 24 si è promossi con lode, sotto 18 si è bocciati, in mezzo si rimanda. Le soglie sono le linee del 24 e del 18. Chi scrive il regolamento decide le soglie e i pesi; nel nostro caso li sceglie l'algoritmo genetico.

Un'altra analogia, da programmatore: è una `if` sola, con una condizione sola, applicata a un numero che è una combinazione lineare delle variabili.

### 4.2 Come funziona

#### 4.2.1 Gli ingredienti

Prima di tutto alcune parole di finanza che servono qui.

- Una **barra** è un giorno di borsa riassunto in pochi numeri. Per ora ci bastano il prezzo di chiusura e il **volume** (il numero di azioni scambiate quel giorno).
- Una **media mobile** è una media dei prezzi recenti. Quella che usa il progetto è la **media mobile esponenziale** (EMA), che dà più peso ai giorni più vicini. In Consilium si calcola così (`src/vendor/consilium/algorithm.js`, righe 369-372):

```
ema[t] = ema[t-1] * (1 - c) + x[t] * c
```

In parole: la nuova media è la vecchia media più una frazione `c` della distanza tra il dato nuovo `x[t]` e la vecchia media. Qui `c` è il peso del **dato nuovo**: con `c` vicino a 1 la media segue il prezzo da vicino, con `c` vicino a 0 si muove piano e ricorda a lungo. Esempio: se la media è 10,00, il prezzo nuovo è 11,00 e `c` = 0,2, la media nuova è 10,00 * 0,8 + 11,00 * 0,2 = 10,20.
- Un **indicatore** è un numero calcolato dai prezzi e dai volumi passati per riassumerne l'andamento. Una media mobile è un indicatore; anche la distanza tra il prezzo e la media lo è. La scelta degli indicatori è materia di un'altra ricerca dell'epica (R2); qui ne usiamo tre come esempio.
- Una **soglia** è un valore di riferimento con cui si confronta un numero.

#### 4.2.2 La formula

Chiamiamo `x1, x2, ..., xn` gli **ingressi** del giorno (gli indicatori), `w1, ..., wn` i **pesi**, `b` il **bias**, `s` il **punteggio**:

```
s = w1*x1 + w2*x2 + ... + wn*xn + b

buy   se  s > soglia_alta
sell  se  s < soglia_bassa
hold  altrimenti
```

In parole: ogni ingresso viene moltiplicato per il suo peso, i prodotti si sommano, si aggiunge una costante, e il risultato si confronta con due soglie. Il **peso** dice quanto conta un ingresso e in che verso: un peso positivo spinge verso l'acquisto quando l'ingresso è alto, un peso negativo spinge verso la vendita, un peso vicino a zero rende l'ingresso quasi ininfluente. Il **bias** `b` sposta tutto il punteggio verso l'alto o verso il basso di una quantità fissa, a prescindere dagli ingressi.

**Numeri.** Con due ingressi `x1 = 2` e `x2 = -1`, pesi `w1 = 1,5` e `w2 = 3`, bias `b = 0,5`: `s = 1,5*2 + 3*(-1) + 0,5 = 0,5`. Con soglie +3 e -3 la decisione è `hold`. Se `x2` valesse -3 invece di -1: `s = 3 - 9 + 0,5 = -5,5`, sotto -3: `sell`.

#### 4.2.3 Che cosa vuol dire «lineare»

La somma pesata è una funzione **lineare** degli ingressi: ogni ingresso entra solo moltiplicato per una costante e poi sommato. Due conseguenze concrete.

1. **Effetto proporzionale e indipendente.** Se `x1` aumenta di 1, il punteggio cambia sempre di `w1`, qualunque siano gli altri ingressi. L'effetto di un ingresso non dipende dal valore degli altri.
2. **Confine retto.** Con due ingressi, i punti in cui il punteggio vale esattamente la soglia formano una retta nel piano `(x1, x2)`: da una parte si compra, dall'altra si aspetta. Con tre ingressi è un piano, con più ingressi un «iperpiano». In pratica significa che la regola è sempre del tipo «un certo mix degli indicatori supera un livello».

Lo spazio delle decisioni possibili è quindi limitato: lo vedremo in dettaglio nella sezione 4.8.

#### 4.2.4 Pesi, soglie e bias hanno ruoli in parte ridondanti

Moltiplicare tutti i pesi, il bias e le due soglie per lo stesso numero positivo non cambia nessuna decisione (verificato con lo script: raddoppiando tutto si ottengono le stesse decisioni). Spostare il bias di una quantità e le due soglie della stessa quantità non cambia nessuna decisione (verificato: bias 1 con soglie 4 e -2 dà le stesse decisioni di bias 0 con soglie 3 e -3). Quindi, di quei numeri, qualcuno è superfluo. La rassegna conta ugualmente `b` per semplicità.

### 4.3 Esempio applicato al dataset giocattolo

#### 4.3.1 Semplificazioni di questo esempio

- Dataset giocattolo di 20 giorni (prezzo e volume inventati). Capitale iniziale 1000.
- Decisione presa alla chiusura del giorno `t`, eseguita al prezzo del giorno `t+1`.
- Acquisto con tutto il denaro, vendita di tutta la posizione; azioni frazionarie; nessun costo di transazione; nessuno stop loss né take profit; la decisione dell'ultimo giorno è ignorata.
- Un `buy` mentre si è già in posizione, o un `sell` senza posizione, non fa nulla.
- Numeri arrotondati a due decimali nelle tabelle (con virgola), calcolati con tutte le cifre.
- Le medie mobili partono dal primo dato (come nel codice di Consilium), quindi il primo giorno tutti gli ingressi valgono 0.

#### 4.3.2 I tre ingressi

| Ingresso | Definizione | In parole |
|---|---|---|
| `x1` | (prezzo / EMA lenta - 1) * 100, con EMA lenta di `c` = 0,2 | di quanti punti percentuali il prezzo sta sopra (positivo) o sotto (negativo) la sua media lenta |
| `x2` | (EMA veloce / EMA lenta - 1) * 100, con EMA veloce di `c` = 0,5 | quanto la media veloce sta sopra la media lenta, in percentuale: indica se il prezzo sta salendo o scendendo |
| `x3` | volume / EMA del volume (`c` = 0,2) - 1 | di quanto il volume del giorno supera (positivo) o è sotto (negativo) il suo livello abituale, in frazione: 0,30 significa 30 per cento sopra |

Esempio di `x1` al giorno 4: il prezzo è 10,55, l'EMA lenta 10,17; `x1 = (10,55 / 10,17 - 1) * 100 = 3,73`. Il prezzo è 3,73 per cento sopra la sua media lenta.

#### 4.3.3 La scelta dei pesi e delle soglie

Dichiarata e semplice, non ottimizzata: **w1 = 1, w2 = 1, w3 = 10, b = 0, soglia alta = +3, soglia bassa = -3.** Il peso 10 sul volume compensa il fatto che `x3` ha valori piccoli (da -0,23 a 0,36), mentre `x1` e `x2` vanno da -3,81 a 5,76 e da -2,29 a 4,01 (sezione 4.8.3 spiega perché).

Il punteggio è quindi `s = x1 + x2 + 10 * x3`.

#### 4.3.4 Tabella giorno per giorno

La colonna «Esempio A» usa i pesi sopra. La colonna «Esempio B» usa gli stessi valori ma con `w3 = 0`: il volume non conta. Le sigle sono `buy`, `sell`, `hold`.

| Giorno | Prezzo | x1 | x2 | x3 | s (A) | Dec. A | s (B) | Dec. B |
|---|---|---|---|---|---|---|---|---|
| 1 | 10,00 | 0,00 | 0,00 | 0,00 | 0,00 | hold | 0,00 | hold |
| 2 | 10,10 | 0,80 | 0,30 | 0,08 | 1,88 | hold | 1,10 | hold |
| 3 | 10,30 | 2,22 | 0,98 | 0,14 | 4,57 | buy | 3,21 | buy |
| 4 | 10,55 | 3,73 | 1,88 | 0,31 | 8,72 | buy | 5,61 | buy |
| 5 | 10,80 | 4,89 | 2,76 | 0,29 | 10,60 | buy | 7,65 | buy |
| 6 | 11,00 | 5,39 | 3,39 | 0,33 | 12,12 | buy | 8,78 | buy |
| 7 | 11,20 | 5,76 | 3,83 | 0,20 | 11,57 | buy | 9,59 | buy |
| 8 | 11,35 | 5,66 | 4,01 | -0,01 | 9,56 | buy | 9,67 | buy |
| 9 | 11,30 | 4,11 | 3,53 | -0,13 | 6,39 | buy | 7,64 | buy |
| 10 | 11,10 | 1,81 | 2,43 | -0,04 | 3,82 | buy | 4,24 | buy |
| 11 | 10,80 | -0,76 | 0,94 | 0,30 | 3,14 | buy | 0,18 | hold |
| 12 | 10,50 | -2,83 | -0,59 | 0,36 | 0,22 | hold | -3,42 | sell |
| 13 | 10,30 | -3,78 | -1,72 | 0,18 | -3,66 | sell | -5,50 | sell |
| 14 | 10,20 | -3,81 | -2,29 | -0,09 | -7,02 | sell | -6,10 | sell |
| 15 | 10,35 | -1,92 | -1,87 | -0,23 | -6,11 | sell | -3,80 | sell |
| 16 | 10,55 | -0,02 | -0,95 | -0,14 | -2,36 | hold | -0,97 | hold |
| 17 | 10,80 | 1,87 | 0,23 | -0,01 | 2,05 | hold | 2,10 | hold |
| 18 | 11,05 | 3,35 | 1,37 | 0,10 | 5,72 | buy | 4,72 | buy |
| 19 | 11,25 | 4,14 | 2,23 | 0,03 | 6,64 | buy | 6,37 | buy |
| 20 | 11,40 | 4,37 | 2,74 | -0,08 | 6,29 | buy | 7,11 | buy |

Come si legge una riga: al giorno 5, `s = 4,89 + 2,76 + 10 * 0,29 = 10,60`; è sopra +3, quindi la decisione è `buy`. Al giorno 12, `s = -2,83 - 0,59 + 10 * 0,36 = 0,22`; è tra -3 e +3, quindi `hold`.

#### 4.3.5 Risultato col valutatore e commento

| Esempio | Operazioni (giorno di esecuzione, prezzo) | Valore finale | Rendimento |
|---|---|---|---|
| A (`w3` = 10) | acquisto g.4 a 10,55; vendita g.14 a 10,20; acquisto g.19 a 11,25 | 979,72 | -2,03 % |
| B (`w3` = 0) | acquisto g.4 a 10,55; vendita g.13 a 10,30; acquisto g.19 a 11,25 | 989,32 | -1,07 % |
| Buy&hold (riferimento) | acquisto g.1 | 1128,71 | +12,87 % |

Che cosa succede, in parole.

- Il prezzo sale dal giorno 2: `x1` e `x2` crescono, il punteggio supera +3 al giorno 3 e si compra (eseguito al giorno 4 a 10,55).
- Dal giorno 9 il prezzo scende. Nell'esempio A, al giorno 11 il prezzo è già sotto la media lenta (`x1` negativo) ma il volume è alto (30 per cento sopra il normale), e con peso 10 questo aggiunge quasi 3 punti: `s = 3,14`, ancora sopra la soglia. Si continua a tenere. Il segnale di vendita arriva al giorno 13, un giorno dopo l'esempio B, che ignora il volume e vende dopo la decisione del giorno 12.
- In questo dataset il volume alto coincide con i giorni di svolta (è così che l'abbiamo inventato), perciò con peso positivo ritarda l'uscita. Che sia un bene o un male dipende dal peso e dalla serie: qui non dimostra nulla.
- Entrambe le versioni perdono contro il buy&hold, perché escono dopo il picco e rientrano più in alto del punto di uscita. Non è un difetto da correggere nell'esempio: il meccanismo è quello.
- Tra A e B le decisioni differiscono in soli due giorni (11 e 12). Un peso diverso cambia il comportamento, ma in modo graduale: i punteggi cambiano di poco e solo i giorni vicini alle soglie cambiano decisione.

### 4.4 La forma minima: un filtro e una soglia

#### 4.4.1 Che cos'è

È il caso più semplice della stessa forma: un solo indicatore (un solo filtro) e una sola soglia. Nel genoma ci sono **due numeri**: il coefficiente `c` del filtro e la soglia `m`. Una scelta ragionevole di esempio è l'indicatore `x1` (distanza percentuale del prezzo dalla propria media) con una soglia simmetrica:

```
s = x1
buy   se  s > +m
sell  se  s < -m
hold  altrimenti
```

In parole: si compra quando il prezzo sta più di `m` per cento sopra la sua media, si vende quando sta più di `m` per cento sotto, altrimenti si aspetta. È un punteggio lineare con un solo peso fisso a 1, `b = 0`, e la soglia bassa uguale all'opposto della soglia alta [ipotesi di metodo, come nella rassegna].

#### 4.4.2 Esempio sul dataset giocattolo

Con `c` = 0,2 e `m` = 2,0 (stesso `x1` della tabella della sezione 4.3.4):

| Giorni | Decisione |
|---|---|
| 1-2 | hold (`x1` = 0,00 e 0,80) |
| 3-9 | buy (`x1` da 2,22 a 5,76 e poi 4,11) |
| 10-11 | hold (`x1` = 1,81 e -0,76) |
| 12-14 | sell (`x1` = -2,83, -3,78, -3,81) |
| 15-17 | hold |
| 18-20 | buy |

Risultato: acquisto g.4 a 10,55; vendita g.13 a 10,30; acquisto g.19 a 11,25; valore finale 989,32; **-1,07 %**. Con `m` = 1,0 (stesso `c`) il risultato è +0,72 % (acquisto g.4, vendita g.13, riacquisto g.18); con `c` = 0,5 e `m` = 2,0 è -6,36 %. Questi tre numeri non classificano le scelte: mostrano che anche due soli parametri cambiano le operazioni.

#### 4.4.3 Perché serve come metro

Una forma più ricca (più ingressi, alberi, reti) ha più parametri e quindi può adattarsi meglio ai dati di addestramento. Una parte di quell'adattamento può essere **rumore**: l'**overfitting** (sovradattamento) è proprio l'adattarsi ai dati su cui si evolve, rumore compreso, con peggioramento sui dati nuovi. Il lavoro di Bailey e coautori [4] sostiene che con molte prove sullo stesso insieme di dati i risultati migliori possono essere dovuti al caso. La forma minima fornisce quindi un termine di paragone: se una forma ricca non fa meglio di questa su dati non usati per l'evoluzione, la complessità in più non ha giustificazione. Questo uso come metro è un'**[ipotesi di metodo]** della rassegna, non un risultato di letteratura.

### 4.5 L'osservatore di Kalman: livello e pendenza

#### 4.5.1 L'idea

Finora gli ingressi sono medie calcolate con formule fisse. In questa variante gli ingressi vengono **stimati da un modello**. Il modello dice che ogni giorno il prezzo è composto da un **livello** (dove si trova il prezzo «vero», senza il disturbo del giorno) e da una **pendenza** (di quanto il livello cresce o cala ogni giorno), più un **rumore** (la parte casuale). Livello e pendenza non si osservano: si **stimano** ogni giorno dal prezzo osservato. Il filtro di Kalman [3] è il metodo classico per stimare, in modo ricorsivo (ogni stima parte dalla precedente e dal dato nuovo), grandezze nascoste di un sistema lineare con rumore. La decisione si legge poi dalla pendenza stimata, con le due soglie.

**Che cosa dice la fonte e che cosa no.** L'articolo di Kalman del 1960 [3] copre il filtraggio ricorsivo lineare in generale. **Non tratta** né il livellamento esponenziale né i prezzi dei titoli. Il modello «livello più pendenza» e l'equivalenza del filtro di Kalman con guadagni costanti con un livellamento esponenziale doppio non sono in [3]: sono **[ipotesi, fonte da verificare]**. Il testo [15] (Hyndman e Athanasopoulos, capitolo 8) presenta il metodo lineare di Holt, che stima livello e pendenza con due costanti di livellamento, ma non l'equivalenza con Kalman.

#### 4.5.2 Il filtro alfa-beta usato nell'esempio

Per l'esempio si usa una versione semplice, con due **guadagni** fissi dichiarati (non calcolati dal filtro di Kalman completo): `alfa` per il livello e `beta` per la pendenza. A ogni giorno, con `l` il livello stimato, `v` la pendenza stimata e `p` il prezzo del giorno:

```
previsto  = l + v                  (dove ci aspettiamo il prezzo oggi)
residuo   = p - previsto           (di quanto ci siamo sbagliati)
l_nuovo   = previsto + alfa * residuo
v_nuovo   = v + beta * residuo
```

In parole: si prevede che il prezzo di oggi sia il livello di ieri più la pendenza di ieri; si guarda di quanto si è sbagliata la previsione; si corregge il livello di una frazione `alfa` dell'errore e la pendenza di una frazione `beta` dell'errore. Se il prezzo sale più del previsto, il residuo è positivo e la pendenza stimata aumenta.

**Collegamento con la media mobile esponenziale.** Se la pendenza fosse sempre zero, la correzione del livello sarebbe `l_nuovo = l + alfa * (p - l)`, cioè proprio la formula della EMA con `c = alfa`. Il filtro alfa-beta aggiunge quindi alla EMA una seconda grandezza, la pendenza, che «anticipa» dove va il livello. La forma con `beta` applicato al residuo è equivalente alla forma di Holt [15] con una costante `beta*` tale che `beta = alfa * beta*`: questa corrispondenza è un controllo algebrico dell'autore, verificato numericamente sul dataset (differenza massima dell'ordine di 1e-15), non una frase della fonte.

**Esempio numerico del giorno 3** (valori dalla tabella sotto): il livello di ieri è 10,05, la pendenza 0,02; previsto = 10,05 + 0,02 = 10,07; il prezzo è 10,30 e il residuo vale 0,23; con `alfa` = 0,5 il livello nuovo è 10,07 + 0,5 * 0,23 = 10,19; con `beta` = 0,2 la pendenza nuova è 0,02 + 0,2 * 0,23 = 0,07 (arrotondata).

La decisione si legge dalla **pendenza in percentuale del livello**, `pend% = v / l * 100`: `buy` se `pend%` > +0,5, `sell` se < -0,5, altrimenti `hold`. Anche qui una scelta dichiarata, non ottimizzata.

#### 4.5.3 Tabella sul dataset giocattolo

Parametri: `alfa` = 0,5, `beta` = 0,2, soglia 0,5 per cento. Stato iniziale: livello = primo prezzo, pendenza = 0.

| Giorno | Prezzo | Previsto | Residuo | Livello | Pendenza | Pend. % | Decisione |
|---|---|---|---|---|---|---|---|
| 1 | 10,00 | 10,00 | 0,00 | 10,00 | 0,00 | 0,00 | hold |
| 2 | 10,10 | 10,00 | 0,10 | 10,05 | 0,02 | 0,20 | hold |
| 3 | 10,30 | 10,07 | 0,23 | 10,19 | 0,07 | 0,65 | buy |
| 4 | 10,55 | 10,25 | 0,30 | 10,40 | 0,13 | 1,21 | buy |
| 5 | 10,80 | 10,53 | 0,27 | 10,66 | 0,18 | 1,69 | buy |
| 6 | 11,00 | 10,84 | 0,16 | 10,92 | 0,21 | 1,94 | buy |
| 7 | 11,20 | 11,13 | 0,07 | 11,17 | 0,23 | 2,02 | buy |
| 8 | 11,35 | 11,39 | -0,04 | 11,37 | 0,22 | 1,91 | buy |
| 9 | 11,30 | 11,59 | -0,29 | 11,44 | 0,16 | 1,39 | buy |
| 10 | 11,10 | 11,60 | -0,50 | 11,35 | 0,06 | 0,52 | buy |
| 11 | 10,80 | 11,41 | -0,61 | 11,11 | -0,06 | -0,57 | sell |
| 12 | 10,50 | 11,04 | -0,54 | 10,77 | -0,17 | -1,59 | sell |
| 13 | 10,30 | 10,60 | -0,30 | 10,45 | -0,23 | -2,22 | sell |
| 14 | 10,20 | 10,22 | -0,02 | 10,21 | -0,24 | -2,30 | sell |
| 15 | 10,35 | 9,97 | 0,38 | 10,16 | -0,16 | -1,57 | sell |
| 16 | 10,55 | 10,00 | 0,55 | 10,28 | -0,05 | -0,49 | hold |
| 17 | 10,80 | 10,23 | 0,57 | 10,51 | 0,06 | 0,61 | buy |
| 18 | 11,05 | 10,58 | 0,47 | 10,81 | 0,16 | 1,47 | buy |
| 19 | 11,25 | 10,97 | 0,28 | 11,11 | 0,21 | 1,93 | buy |
| 20 | 11,40 | 11,33 | 0,07 | 11,36 | 0,23 | 2,02 | buy |

Risultato col valutatore: acquisto g.4 a 10,55; vendita g.12 a 10,50; acquisto g.18 a 11,05; valore finale 1026,78; **+2,68 %** (contro +12,87 % del buy&hold).

Commento. Il prezzo tocca il massimo al giorno 8 e poi scende; la pendenza stimata raggiunge il massimo al giorno 7 (0,23) e cala piano, perché il filtro la corregge solo di una frazione `beta` dell'errore ogni giorno. Al giorno 10 la pendenza vale ancora 0,52 per cento, appena sopra la soglia, e diventa negativa al giorno 11 (-0,57 per cento, vendita). Il filtro non vede il picco prima che accada: lo riconosce con ritardo, come ogni indicatore costruito sul passato. Il risultato positivo di questo esempio dipende dal dataset inventato e dalla scelta di `alfa`, `beta` e soglia: con `beta` = 0,1 (stessa soglia) lo stesso filtro dà -5,56 %. Non dice quale valore sia «giusto»: dice che i due guadagni sono parametri che contano.

**Come entra nel punteggio lineare.** Si può usare la pendenza percentuale come unico ingresso (come sopra) oppure come uno degli ingressi `x1...xn` di un punteggio più ricco, insieme ad altri. In entrambi i casi la forma resta «somma pesata più soglie»; cambia da dove vengono gli ingressi.

#### 4.5.4 Limiti da tenere presenti

- Il filtro di Kalman è ottimale (in un senso preciso) se i rumori sono gaussiani. Le serie giornaliere dei prezzi reali hanno spesso code più pesanti (eventi estremi più frequenti di quanto preveda una gaussiana) [ipotesi]. L'esempio usa guadagni fissi decisi dal genoma e non fa nessuna ipotesi sul rumore.
- Nessuna fonte letta sull'uso del filtro di Kalman con un algoritmo genetico nel trading (rassegna, sezione «Ciò che non si è potuto accertare»).
- Se `alfa` e `beta` sono geni, non c'è stima dei parametri su tutta la serie, quindi nessuna anticipazione dei dati (look-ahead: usare informazione non ancora disponibile).

### 4.6 Come evolve

#### 4.6.1 I geni

L'algoritmo genetico fa evolvere numeri. Nella nostra istanza generale con tre ingressi i geni sono:

| Gene | Che cosa è | Intervallo proposto (esempio) |
|---|---|---|
| `c_lento` | coefficiente della EMA lenta del prezzo | 0,02 a 0,5 |
| `c_veloce` | coefficiente della EMA veloce del prezzo | 0,1 a 0,9 |
| `c_vol` | coefficiente della EMA del volume | 0,02 a 0,5 |
| `w1` | peso della distanza dalla media lenta | -20 a 20 |
| `w2` | peso della differenza veloce-lenta | -20 a 20 |
| `w3` | peso del volume relativo | -20 a 20 |
| `b` | bias | -5 a 5 |
| `soglia_alta` | sopra questo punteggio si compra | 0 a 10 |
| `soglia_bassa` | sotto questo punteggio si vende | -10 a 0 |

Gli intervalli sono una **proposta di esempio**, non un risultato: le scale dipendono dagli ingressi scelti (sezione 4.8.3). Una condizione va sempre rispettata: la soglia bassa deve restare sotto la soglia alta; il modo più semplice è tenere la soglia alta positiva e la bassa negativa come qui, oppure riparare i figli che violano la regola [ipotesi]. Per la variante Kalman i geni sono `alfa` e `beta` (tra 0 e 1, con `beta` di solito più piccolo di `alfa`) e la soglia sulla pendenza.

#### 4.6.2 Quanti numeri ha il genoma

- Istanza dell'esempio: 3 coefficienti di filtro + 3 pesi + `b` + 2 soglie = **9 numeri**.
- Esempio della rassegna: 6 ingressi già calcolati (nessun coefficiente di filtro tra i geni), quindi 6 pesi + `b` + 2 soglie = **9 numeri**. Se anche i 4 coefficienti dei filtri del genoma attuale fossero geni, sarebbero 13.
- Forma minima: **2 numeri** (`c` e `m`).
- Variante Kalman sulla sola pendenza: **3 numeri** (`alfa`, `beta`, soglia).
- Per confronto, la rassegna conta per una rete piccola di esempio 43 pesi, e per l'FSM attuale 11 numeri più una struttura discreta variabile di decine di transizioni.

Come visto nella sezione 4.2.4, qualche numero è ridondante (il bias rispetto alle soglie, la scala complessiva), quindi lo spazio effettivo è un po' più piccolo del conteggio.

**Che cosa significa per la ricerca.** Con una decina di numeri reali lo spazio da esplorare è piccolo: l'algoritmo genetico lo esplora con una popolazione modesta [ipotesi]. Ci sono anche meno gradi di libertà con cui adattarsi al rumore dei dati di addestramento [ipotesi], anche se non vengono eliminati [4]. Il rovescio è la minore espressività (sezione 4.8).

#### 4.6.3 Esempio numerico di mutazione

La **mutazione** modifica a caso uno o più geni di un individuo. Partiamo dall'individuo A dell'esempio (`w1 = 1, w2 = 1, w3 = 10, b = 0, soglie +3 e -3`). **Mutiamo `w1` da 1 a 0,5.**

Effetto sulle decisioni (giorni in cui cambiano):

| Giorno | Punteggio con `w1` = 1 | Decisione | Punteggio con `w1` = 0,5 | Decisione |
|---|---|---|---|---|
| 10 | 3,82 | buy | 2,91 | hold |
| 13 | -3,66 | sell | -1,77 | hold |

Il punteggio al giorno 10 scende di 0,5 * 1,81 = 0,91; al giorno 13 sale di 0,5 * 3,78 = 1,89. Il giorno 14 il punteggio è -5,12 e si vende.

Sequenza delle decisioni (`B` = buy, `S` = sell, `.` = hold, giorni 1-20):

```
A:        ..BBBBBBBBB.SSS..BBB
mutante:  ..BBBBBBB.B..SS..BBB
```

Risultato col valutatore: la vendita si sposta dal giorno 14 al giorno 15 (a 10,35); il valore finale è 994,12, **-0,59 %**, contro -2,03 % di A. Una mutazione di un solo numero ha cambiato due decisioni su venti e una delle operazioni. (Il `B` al giorno 11 del mutante è ininfluente: si è già in posizione. Questo esito non dice che 0,5 sia «meglio» di 1 in generale: succede su questo dataset inventato.)

#### 4.6.4 Esempio numerico di crossover

Il **crossover** produce un figlio mescolando i geni di due genitori. Genitore A come sopra. Genitore B: `w1 = 2, w2 = 0,5, w3 = 5, b = 0`, soglie +4 e -2. Risultato di B da solo: acquisto g.4, vendita g.13, acquisto g.19, valore finale 989,32, **-1,07 %**.

- **Scambio di geni** (crossover uniforme): il figlio prende `w1` e `w3` da A, `w2` e le due soglie da B. Figlio: `w1 = 1, w2 = 0,5, w3 = 10`, soglie +4 e -2.
- **Media dei geni** (crossover aritmetico): il figlio ha ogni numero uguale alla media dei due. Figlio: `w1 = 1,5, w2 = 0,75, w3 = 7,5`, soglie +3,5 e -2,5.

Decisioni giorno per giorno (stessa legenda):

```
A:         ..BBBBBBBBB.SSS..BBB
B:         ..BBBBBBBB.SSSS..BBB
scambio:   ..BBBBBBB...SSS..BBB
media:     ..BBBBBBBB..SSS..BBB
```

Risultato dei due figli: acquisto g.4, vendita g.14, acquisto g.19; valore finale 979,72; **-2,03 %** entrambi, cioè le stesse operazioni di A, anche se le decisioni differiscono in due giorni (le differenze cadono mentre si è già in posizione, e la vendita resta al giorno 13 di decisione). Dettaglio onesto: in questo esempio il crossover non produce comportamenti nuovi. Quanto sia produttivo su serie vere non è accertato.

Il punto da ricordare è che i figli sono **sempre individui validi**: qualunque mescolanza di numeri è un punteggio lineare con soglie. Basta tenere le soglie nell'ordine giusto (con le medie e gli scambi dell'esempio questo accade da solo, perché ogni genitore ha soglia alta positiva e bassa negativa).

### 4.7 Cosa ricorda del passato

**Variante «solo indicatori».** Tutta la memoria sta negli indicatori a monte: le EMA di `x1`, `x2`, `x3` portano con sé la storia dei prezzi e dei volumi. La forma, di per sé, **non ha stato interno**: dati gli stessi tre ingressi, il punteggio è sempre lo stesso, qualunque sia la storia (è una funzione pura). Per questo non c'è nulla da azzerare nella strategia quando si ricomincia da capo, salvo i filtri. Nella tabella della sezione 4.3.4 si vede: al giorno 11 il punteggio dipende solo da `x1`, `x2`, `x3` di quel giorno, non dalle decisioni dei giorni prima. La stessa strategia, quando si è già in posizione, non lo «sa»: spetta al motore ignorare un `buy` ripetuto.

**Variante Kalman.** Livello e pendenza sono **uno stato** che si aggiorna a ogni giorno: ricorrenza interna, sì. La differenza con la macchina a stati del genoma attuale è che questo stato appartiene al **filtro** (un indicatore, un calcolo a monte della decisione), non alla **strategia** (la regola che trasforma numeri in buy, sell, hold). Cambia così il modo di salvarlo e azzerarlo: la strategia resta una funzione pura dei numeri che il filtro le consegna; il filtro ha un suo stato iniziale (livello = primo prezzo, pendenza = 0) da reimpostare con `resetIndicators()`, come già avviene per le EMA. Una EMA ha anch'essa uno stato (l'ultimo valore), e nessuno la considera «memoria nella strategia».

Un'altra conseguenza: lo stato del filtro **non si evolve**, si calcola. L'algoritmo genetico evolve `alfa`, `beta`, soglia, non il livello e la pendenza di oggi.

### 4.8 Punti di forza e debolezze

#### 4.8.1 Che cosa sa esprimere

Poco, e in modo prevedibile: **una soglia su una combinazione lineare degli ingressi**. Va bene per regole del tipo «compra quando il prezzo è sopra la media di abbastanza, e lo è tanto di più quanto più sale il volume». Non va bene per regole che dipendono da **combinazioni** di condizioni (sezione 4.8.2).

#### 4.8.2 Il limite delle interazioni: «se A e B allora...»

Un'**interazione** è un caso in cui l'effetto di un indicatore cambia in base al valore di un altro. Nel punteggio lineare questo non può succedere: ogni peso vale sempre uguale (sezione 4.2.3).

**Caso concreto dal dataset giocattolo.** Vogliamo la regola: «se il volume è alto (`x3` sopra 0,2), il movimento è **confermato**: si compra se il prezzo è sopra la sua media (`x1` positivo), si vende se è sotto. Se il volume è basso, si aspetta qualunque sia `x1`». Quattro giorni del dataset la illustrano:

| Giorno | `x1` | `x3` | Decisione voluta | Perché |
|---|---|---|---|---|
| 5 | 4,89 | 0,29 | buy | volume alto, prezzo sopra la media |
| 12 | -2,83 | 0,36 | sell | volume alto, prezzo sotto la media |
| 20 | 4,37 | -0,08 | hold | volume basso |
| 14 | -3,81 | -0,09 | hold | volume basso |

Un punteggio `s = w1*x1 + w3*x3 + b` con due soglie **non può** dare queste quattro decisioni. Il caso è un «o esclusivo» mascherato: l'effetto del volume dovrebbe cambiare verso a seconda del segno di `x1`. Si vede bene in una versione ridotta, con `x1` uguale a +1 o -1 e `x3` uguale a +1 (alto) o -1 (basso), e le stesse quattro decisioni (alto/+1 compra, alto/-1 vende, basso con ambedue i segni aspetta). Nell'ordine dei giorni 5, 12, 20, 14, i punteggi sono `w1 + w3 + b`, `-w1 + w3 + b`, `w1 - w3 + b`, `-w1 - w3 + b`. Il giorno 5 deve stare sopra il giorno 20, che differisce solo per il volume: serve `w3` positivo. Il giorno 12 deve stare sotto il giorno 14, che differisce solo per il volume: serve `w3` negativo. Le due richieste si contraddicono, qualunque siano le soglie.

Sui quattro giorni veri del dataset i valori non sono perfettamente simmetrici, quindi il ragionamento sopra è un'illustrazione. La verifica è numerica: lo script prova 3600 direzioni possibili del vettore `(w1, w3)` e nessuna produce un punteggio con il giorno 5 sopra gli altri due e il giorno 12 sotto (esiste allora una coppia di soglie solo se questo accade); una ricerca a griglia su 3321 coppie `(w1, w3)` dà lo stesso esito. Il bias `b` non conta perché sposta tutti i punteggi allo stesso modo. (Illustrazione e verifica numerica sono dell'autore, non tratte da una fonte.)

**Come lo risolvono gli alberi.** Un albero di decisione (o di espressioni) può scrivere la regola con un annidamento: `se x3 > 0,2 allora (se x1 > 0 allora buy altrimenti sell) altrimenti hold`. Lo script verifica che questa regola dà esattamente `buy, sell, hold, hold` sui quattro giorni. Questa capacità è la ragione per cui la rassegna indica gli alberi (candidato B) come forma da considerare se l'esperienza mostrasse che servono congiunzioni tra indicatori.

Resta un'osservazione: se tra gli ingressi si aggiunge un indicatore che **è già** un prodotto, per esempio `x1 * x3`, il punteggio lineare riesce a rappresentare quel caso. Sui quattro giorni, `x1 * x3` vale 1,44, -1,03, -0,36 e 0,35; con soglie +0,8 e -0,8 le decisioni sono buy, sell, hold, hold. La limitazione sta quindi nella scelta degli ingressi più che nella forma; il costo è che qualcuno deve pensare a quali prodotti inserire [ipotesi].

#### 4.8.3 Sensibilità alla scala degli ingressi

Ogni ingresso ha una scala diversa: `x1` e `x2` si muovono di qualche punto percentuale, `x3` tra -0,23 e 0,36. Con peso 1 il volume può spostare il punteggio al massimo di 0,36, mentre le soglie sono a ±3. **Esito dello script:** con `w3` = 1 si ottengono esattamente le stesse decisioni di `w3` = 0, cioè il volume è ignorato (tabella B). Per farlo contare serve un peso grande (10, nell'esempio A). Inoltre un genoma con intervalli di peso uguali per tutti favorirebbe gli ingressi di scala grande. Il difetto è dichiarato anche nella rassegna (ingressi di scala grande che prevalgono).

La soluzione si chiama **normalizzazione**: portare gli ingressi sulla stessa scala prima della somma, per esempio dividendo ciascuno per la propria deviazione standard (una misura di quanto il valore varia di solito). Sul dataset le deviazioni standard di `x1`, `x2`, `x3` sono 3,07, 1,93 e 0,17. Con ingressi normalizzati e pesi tutti uguali a 1, con soglie ±1,5, il punteggio del giorno 5 è 4,73 e lo script dà acquisto g.4, vendita g.15, acquisto g.19, **-0,59 %**. Equivale a usare sugli ingressi grezzi i pesi 0,33, 0,52 e 5,76. Due avvertenze.

- Calcolare la deviazione standard su tutti i 20 giorni usa informazione futura (anticipazione dei dati). In un uso reale la scala dovrebbe essere fissata prima o stimata con dati passati [ipotesi sul metodo].
- Con ingressi normalizzati i geni hanno intervalli simili, e quindi la ricerca è meglio condizionata [ipotesi].

#### 4.8.4 Etichette finite e soglie

Il punteggio è un numero **continuo**. Il motore però vuole `labels`, un elenco finito di etichette di stato (`src/engine/strategy.js`, righe 12-33). Le soglie fanno proprio questo lavoro: trasformano il numero in una fascia. **Scelta dichiarata per questo capitolo:** tre etichette, `sopra` (punteggio sopra la soglia alta, decisione `buy`), `neutro` (tra le soglie, `hold`) e `sotto` (sotto la soglia bassa, `sell`). Il valore del punteggio e la distanza dalle soglie si espongono comunque tra gli `indicators` di `describe()`, quindi nel replay non si perde il numero, ma l'etichetta riassume solo tre fasce. È una scelta di presentazione, non del genoma; Luca può preferire più fasce, per esempio cinque, e la differenza resta di interfaccia.

#### 4.8.5 Le altre domande

| Domanda | Risposta in parole semplici |
|---|---|
| Quanto sa esprimere? | Poco: una soglia su una somma pesata. Niente «A e B» tra indicatori, se non si aggiungono ingressi prodotto. |
| Quanto è grande lo spazio di ricerca? | Piccolo: circa 9 numeri con 6 ingressi, 2 con la forma minima, 3 con Kalman sulla sola pendenza. |
| Si capisce perché decide così? | Sì. Ogni giorno si vedono i contributi `w_i * x_i`: nella tabella 3.4 il giorno 11 la decisione `buy` si spiega con 2,96 punti dovuti al volume. Segno e peso dicono il verso dell'effetto. |
| Quanto costa calcolarlo? | Decine di operazioni a barra: 6 prodotti, 6 somme e 2 confronti con 6 ingressi, più i filtri a monte. |
| Si mescola e si muta bene? | Sì. Ogni figlio è valido (sezione 4.6.4). Occorre tenere le soglie in ordine e normalizzare gli ingressi. |
| Si adatta al nostro motore? | Con un piccolo adattamento (sezione 4.9). |

### 4.9 Come si integra nel nostro motore

Il motore chiama la strategia una volta per barra: dà i dati del giorno e riceve `buy`, `sell` o `hold`. Il contratto (`assertStrategy` e la classe base `StrategyIndividual`, `src/engine/strategy.js`, righe 12-87) chiede `kind`, `labels`, `describe()`, `serialize()`, e per le strategie diverse dall'FSM i ganci `initIndicators`, `updateIndicators`, `resetIndicators` e `decide`. Per il punteggio lineare:

- `updateIndicators` aggiorna le EMA e calcola `x1`, `x2`, `x3` (con Kalman: aggiorna livello e pendenza).
- `decide` calcola `s` e lo confronta con le soglie.
- `resetIndicators` riporta le EMA (e il filtro) allo stato iniziale.
- `serialize` restituisce i numeri del genoma come JSON; `describe` espone `s`, gli ingressi e le distanze dalle soglie.
- `labels` sono le tre fasce (sezione 4.8.4).

Due punti da segnalare, come nella rassegna. L'etichetta è una **trasformazione** dell'uscita continua (adeguatezza «con adattamento»). `crossover` e `mutate` non sono richiesti da `assertStrategy` ma il GA li chiama (`src/vendor/consilium/ga.js`, righe 116-125 e 345-351): vanno scritti, e per un vettore di numeri sono semplici (sezioni 4.6.3 e 4.6.4). L'adeguatezza al contratto è, per ora, sulla carta fino all'implementazione.

### 4.10 Cosa dice la letteratura

- La somma pesata con soglia è un **classificatore lineare**. La rassegna non ha letto un testo di riferimento: **[ipotesi, fonte da verificare]**.
- Il filtro di Kalman [3] (letto per le parti citate) copre il filtraggio ricorsivo lineare; non tratta livellamento esponenziale né prezzi. Il metodo lineare di Holt (livello e pendenza) è in [15] (letto in parte); l'equivalenza con Kalman a guadagno costante non è in nessuna fonte letta: **[ipotesi]**.
- L'overfitting nelle strategie provate sui dati storici è discusso in [4] (letto per la parte sul metodo hold-out, cioè dati tenuti fuori dall'addestramento). Bailey e coautori sostengono che la sola validazione su dati tenuti fuori non basta quando si provano molte configurazioni.
- L'uso di algoritmi genetici e programmazione genetica per scoprire regole di trading azionario è ampio [7] (letto l'abstract); un precedente classico con medie mobili è [6] (letto solo il riassunto di un corso). Non riportiamo risultati numerici.
- Nessuna fonte letta tratta l'uso di un punteggio lineare di indicatori evoluto con un GA nel trading, né dell'osservatore di Kalman con un GA nel trading: **non accertato**.

### 4.11 In breve

- Si calcola ogni giorno `s = w1*x1 + ... + wn*xn + b` e si confronta con due soglie: sopra si compra, sotto si vende, in mezzo si aspetta.
- Il genoma è un vettore di circa 9 numeri (pesi, bias, soglie e, volendo, i coefficienti dei filtri): spazio piccolo, mutazione e crossover semplici, figli sempre validi.
- La memoria sta negli indicatori a monte; la strategia non ha stato proprio. Con l'osservatore di Kalman lo stato (livello e pendenza) sta nel filtro.
- È facile da leggere (si vede il contributo di ogni ingresso), ma non esprime «A e B» tra indicatori e richiede ingressi sulla stessa scala.
- La forma minima (2 numeri) è il metro: una forma più ricca deve giustificare ciò che aggiunge.
- Sul dataset giocattolo (numeri inventati) l'esempio A dà -2,03 %, B -1,07 %, il filtro alfa-beta +2,68 % (buy&hold: +12,87 %): mostrano il meccanismo, non l'efficacia.

## 5. Alberi di espressioni e programmazione genetica

Questo capitolo descrive il candidato B della rassegna: la strategia non è una macchina a stati né una somma pesata, ma un piccolo programma, scritto come albero, che l'algoritmo genetico fa evolvere. La tecnica si chiama **programmazione genetica** (in inglese *genetic programming*, GP). Il capitolo spiega come funziona, lo applica a un dataset inventato di 20 giorni, mostra crossover e mutazione con numeri, e descrive le due varianti sulla memoria (la domanda 2, ancora aperta).

Convenzioni: nel testo e nelle tabelle i decimali usano la virgola; nei blocchi di codice e di pseudocodice usano il punto. Le tabelle sono arrotondate a due decimali (i calcoli interni no). **Tutti i numeri sono inventati e non dicono nulla sul funzionamento reale di questo approccio né dei mercati.** Escono da uno script di lavoro eseguito.

### 5.1 In una frase e un'analogia

**In una frase.** Il genoma è una formula, scritta come albero di operazioni, che ogni giorno riceve i numeri del giorno (prezzo, medie, volume) e restituisce la decisione; l'algoritmo genetico fa evolvere la forma della formula e i numeri che contiene.

**Analogia.** Pensa a una cella di un foglio di calcolo con una formula annidata:

```
=SE(E(C2>D2; B2>D2; ...); "compra"; SE(C2<D2; "vendi"; "aspetta"))
```

oppure a una catena di `if` annidati in un linguaggio di programmazione. Un albero di espressioni è il modo in cui il computer tiene in memoria quella formula: ogni funzione è un nodo, i suoi argomenti sono i figli. La differenza rispetto al foglio di calcolo è che qui nessuno scrive la formula: la scrive l'evoluzione, mescolando e modificando pezzi di formule che già funzionano un po'.

**Perché serve capire due parole di finanza.** Il **prezzo di chiusura** è l'ultimo prezzo del giorno. Una **media mobile** riassume i prezzi recenti in un numero solo, che cambia lentamente; ne usiamo una **lenta** (molto liscia, segue il prezzo in ritardo) e una **veloce** (segue il prezzo più da vicino). Si dice spesso che il prezzo è «in tendenza al rialzo» quando sta sopra la media lenta. Il **volume** è il numero di azioni scambiate in un giorno; un volume alto indica molta attività. Queste definizioni sono tutto ciò che serve per leggere gli esempi, che non dicono se una regola sia sensata davvero.

### 5.2 Come funziona

#### 5.2.1 Gli ingredienti

Un albero ha due tipi di nodi.

- **Nodi interni**: operazioni che prendono uno o più figli e producono un valore. Aritmetica (`+`, `-`, `*`, divisione), confronti (`>`, `<`, che producono vero o falso), logica (`and`, `or`) e il nodo `if` con tre figli (condizione, ramo «allora», ramo «altrimenti») [5].
- **Foglie**: i valori da cui si parte. Possono essere **ingressi** (il prezzo del giorno, una media già calcolata, il volume) oppure **costanti** (1,1; 0,97). In un programma che decide direttamente le azioni le foglie possono anche essere le parole `buy`, `sell`, `hold`.

L'insieme dei nodi interni ammessi e delle foglie ammesse è fissato prima della ricerca (in GP si chiamano insieme delle funzioni e insieme dei terminali). L'evoluzione sceglie come combinarli.

#### 5.2.2 Valutazione dall'alto verso il basso

Per valutare un albero si parte dalla radice: ogni nodo chiede il valore ai figli, applica la sua operazione e restituisce il risultato. Il nodo `if` valuta solo il ramo scelto dalla condizione. Il calcolo costa quanto il numero di nodi visitati: un albero di 21 nodi fa al massimo 21 operazioni per giorno.

Esempio minimo: l'albero `(+ P (* 2 S))` con prezzo P = 10 e media S = 4 vale 10 + 2·4 = 18.

#### 5.2.3 Dall'uscita a buy, sell, hold

Ci sono due modi di ottenere una decisione da un albero.

1. **Albero numerico con soglie.** L'albero restituisce un numero `u`. Due soglie fisse (o evolute) lo traducono: `u > soglia alta` significa `buy`, `u < soglia bassa` significa `sell`, in mezzo `hold` [5]. Come il punteggio lineare, ma con un'espressione qualunque al posto della somma pesata.
2. **Albero che decide direttamente.** Le foglie in fondo ai rami sono le azioni stesse, e i confronti e le condizioni logiche scelgono il ramo. È ciò che usa l'esempio di questo capitolo. Si legge come un elenco di regole, ma il motore può combinarle in modi più liberi (una condizione può contenere un `if` che a sua volta contiene confronti con costanti).

#### 5.2.4 Il disegno dell'albero

La regola in italiano:

> se (prezzo > media lenta) e (media veloce > media lenta) e (volume > 1,1 · media del volume) allora **buy**; altrimenti se (prezzo < media lenta) allora **sell**; altrimenti **hold**.

Come albero (chiamiamolo **albero A**; ha 21 nodi):

```
if
├── and
│   ├── and
│   │   ├── >
│   │   │   ├── P            P  = prezzo di chiusura
│   │   │   └── S            S  = media lenta
│   │   └── >
│   │       ├── F            F  = media veloce
│   │       └── S
│   └── >
│       ├── V                V  = volume del giorno
│       └── *
│           ├── 1.1
│           └── VA           VA = media del volume
├── buy
└── if
    ├── <
    │   ├── P
    │   └── S
    ├── sell
    └── hold
```

Nelle pagine seguenti, per brevità, i confronti sono disegnati su una riga (`P > S` al posto dei tre nodi). Quando si contano i nodi, si contano sempre per intero.

### 5.3 Esempio applicato al dataset giocattolo

#### 5.3.1 Semplificazioni di questo esempio

- Dataset: 20 giorni inventati (prezzo e volume, vedi il capitolo 1). Il prezzo parte da 10,00, sale fino a 11,35 al giorno 8, scende fino a 10,20 al giorno 14 e risale a 11,40.
- La decisione è presa alla chiusura del giorno t ed eseguita al prezzo del giorno t+1. Si compra con tutto il denaro, si vende tutto. Azioni frazionarie. Nessun costo, nessuno stop loss, nessun take profit. L'ultima decisione è ignorata. Capitale iniziale 1000. Un `buy` con la posizione già aperta, o un `sell` a posizione chiusa, non fa nulla.
- Media lenta S: media mobile esponenziale con `c = 0,2` (il dato nuovo pesa il 20%, il resto viene dalla media del giorno prima: molta memoria). Media veloce F: `c = 0,5` (il dato nuovo pesa il 50%). Media del volume VA: stessa formula di S con `c = 0,2`, applicata ai volumi. La formula è `e[t] = e[t-1]·(1-c) + x[t]·c`, con `e[1] = x[1]`. In parole: ogni giorno la media si sposta di una frazione `c` verso il dato nuovo. Con `c = 0,2` e S[1] = 10,00, P[2] = 10,10: S[2] = 10,00·0,8 + 10,10·0,2 = 10,02.
- Questi tre indicatori sono **calcolati a monte**: l'albero li trova già pronti.

#### 5.3.2 Tabella giorno per giorno

Le colonne `c1`, `c2`, `c3` sono i tre confronti della condizione di `buy` (1 = vero): `c1` = P > S, `c2` = F > S, `c3` = V > 1,1·VA. Il ramo che scatta è `buy` se valgono tutti e tre; altrimenti `sell` se P < S; altrimenti `hold`.

| Giorno | P | F | S | V | 1,1·VA | c1 | c2 | c3 | Decisione |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 10,00 | 10,00 | 10,00 | 1000 | 1100,00 | 0 | 0 | 0 | hold |
| 2 | 10,10 | 10,05 | 10,02 | 1100 | 1122,00 | 1 | 1 | 0 | hold |
| 3 | 10,30 | 10,18 | 10,08 | 1200 | 1161,60 | 1 | 1 | 1 | buy |
| 4 | 10,55 | 10,36 | 10,17 | 1500 | 1259,28 | 1 | 1 | 1 | buy |
| 5 | 10,80 | 10,58 | 10,30 | 1600 | 1359,42 | 1 | 1 | 1 | buy |
| 6 | 11,00 | 10,79 | 10,44 | 1800 | 1483,54 | 1 | 1 | 1 | buy |
| 7 | 11,20 | 11,00 | 10,59 | 1700 | 1560,83 | 1 | 1 | 1 | buy |
| 8 | 11,35 | 11,17 | 10,74 | 1400 | 1556,67 | 1 | 1 | 0 | hold |
| 9 | 11,30 | 11,24 | 10,85 | 1200 | 1509,33 | 1 | 1 | 0 | hold |
| 10 | 11,10 | 11,17 | 10,90 | 1300 | 1493,47 | 1 | 1 | 0 | hold |
| 11 | 10,80 | 10,98 | 10,88 | 1900 | 1612,77 | 0 | 1 | 1 | sell |
| 12 | 10,50 | 10,74 | 10,81 | 2200 | 1774,22 | 0 | 0 | 1 | sell |
| 13 | 10,30 | 10,52 | 10,70 | 2000 | 1859,37 | 0 | 0 | 1 | sell |
| 14 | 10,20 | 10,36 | 10,60 | 1500 | 1817,50 | 0 | 0 | 0 | sell |
| 15 | 10,35 | 10,36 | 10,55 | 1200 | 1718,00 | 0 | 0 | 0 | sell |
| 16 | 10,55 | 10,45 | 10,55 | 1300 | 1660,40 | 0 | 0 | 0 | sell |
| 17 | 10,80 | 10,63 | 10,60 | 1500 | 1658,32 | 1 | 1 | 0 | hold |
| 18 | 11,05 | 10,84 | 10,69 | 1700 | 1700,66 | 1 | 1 | 0 | hold |
| 19 | 11,25 | 11,04 | 10,80 | 1600 | 1712,52 | 1 | 1 | 0 | hold |
| 20 | 11,40 | 11,22 | 10,92 | 1400 | 1678,02 | 1 | 1 | 0 | hold |

(Al giorno 16 P e S sembrano uguali per l'arrotondamento: S è appena sopra P, quindi `c1` vale 0.)

#### 5.3.3 Che cosa succede

- I giorni 3-7 il prezzo è sopra la media lenta, la media veloce è sopra la lenta e il volume supera la sua media del 10%: tutti e tre i confronti sono veri, scatta il ramo `buy`. Il giorno 2 il prezzo è in salita ma il volume (1100) non supera 1122: il terzo confronto fallisce e l'albero aspetta.
- I giorni 8-10 il prezzo è ancora sopra la media lenta ma il volume è calato: nessuna condizione di acquisto e nemmeno di vendita, `hold`.
- Il giorno 11 il prezzo (10,80) scende sotto la media lenta (10,88): il primo `if` fallisce, il secondo scatta, `sell`.
- I giorni 17-20 il prezzo ha ripreso a salire e sta sopra la media lenta, ma il volume è sotto la soglia: l'albero non rientra.

**Risultato col valutatore.** Il simulatore compra al prezzo del giorno 4 (10,55), perché la prima decisione `buy` è del giorno 3; i `buy` dei giorni 4-7 sono ignorati (la posizione è già aperta). Vende al prezzo del giorno 12 (10,50), perché la prima decisione `sell` è del giorno 11. Valore finale **995,26**, rendimento **-0,47%**. Comprare il giorno 1 e tenere dà 1128,71 (+12,87%). Il confronto non dice che l'albero sia peggiore: l'esempio mostra il meccanismo, e questo albero esce quasi in pari con una regola scelta a mano.

#### 5.3.4 Che cosa sa esprimere l'albero e un punteggio lineare no

Un **punteggio lineare** (il candidato A della rassegna, descritto nel capitolo 4 di questa guida) calcola `s = w1·x + w2·y + ...`, una somma di indicatori moltiplicati per pesi, e decide con soglie. Ogni indicatore spinge sempre nella stessa direzione, indipendentemente dagli altri. Un'**interazione** è una regola in cui l'effetto di un indicatore dipende dal valore di un altro. L'albero la esprime con un nodo `*` o con un `if` annidato; la somma pesata no.

Esempio inventato. Definiamo due numeri relativi:

```
x = (P - S) / S       di quanto il prezzo sta sopra la media lenta (in frazione)
y = (V - VA) / VA     di quanto il volume sta sopra la sua media (in frazione)
```

Regola: `buy` quando `x · y > 0,003`. In parole: compra quando prezzo e volume si scostano dalla loro media **nello stesso verso** e il prodotto è abbastanza grande (prezzo sopra la media con volume sopra, oppure prezzo sotto con volume sotto). Che questa regola abbia un senso finanziario non lo sostengo: serve a mostrare un'interazione. Come albero (13 nodi):

```
>
├── *
│   ├── /
│   │   ├── -
│   │   │   ├── P
│   │   │   └── S
│   │   └── S
│   └── /
│       ├── -
│       │   ├── V
│       │   └── VA
│       └── VA
└── 0.003
```

Quattro giorni, uno per ciascuna combinazione di segni:

| Giorno | x | y | x·y | albero: buy? | Obiettivo |
|---|---|---|---|---|---|
| 4 | 0,0373 | 0,3103 | 0,0116 | sì | buy |
| 9 | 0,0411 | -0,1254 | -0,0052 | no | hold |
| 12 | -0,0283 | 0,3640 | -0,0103 | no | hold |
| 15 | -0,0192 | -0,2317 | 0,0045 | sì | buy |

Un punteggio lineare `w1·x + w2·y > soglia` non può separare questi quattro punti. Nel piano (x, y) le due coppie «buy» (giorni 4 e 15) e «hold» (giorni 9 e 12) sono le due diagonali di un quadrilatero: i segmenti che le uniscono si incrociano (nel punto x = 0,0127, y = 0,0748), e nessuna retta può stare di qua per una diagonale e di là per l'altra. La verifica è anche numerica: cercando, per 3600 direzioni dei pesi e per tutte le soglie utili, il punteggio lineare migliore: sbaglia almeno un giorno su quattro (ne indovina al massimo 3). Sui 20 giorni, rispetto alla stessa regola, il miglior punteggio lineare trovato nella ricerca ne indovina 17 su 20; l'albero, per costruzione, 20.

Nota onesta: se tra gli indicatori a monte ci fosse già il prodotto `x · y`, anche il punteggio lineare lo userebbe. La differenza è che l'albero può **costruirsi da solo** il prodotto (o un rapporto, o un massimo) partendo da ingressi semplici, mentre il lineare ha solo i prodotti che gli sono stati preparati. Questo è ciò che si intende per «espressività universale»: con aritmetica e `if` qualsiasi funzione degli ingressi è raggiungibile, dimensione permettendo [5], [ipotesi].

### 5.4 Come evolve

#### 5.4.1 I geni

Il **genoma** è l'albero stesso. Ciò che l'evoluzione può cambiare:

- la **forma**: quali nodi ci sono e come sono collegati (un `if` in più, un sottoalbero tolto);
- le **operazioni** nei nodi (`>` al posto di `<`, `and` al posto di `or`);
- le **foglie ingresso** (P al posto di F);
- le **costanti** (1,1 diventa 1,3).

A differenza della macchina a stati, che ha un numero fisso di numeri da regolare, qui il numero di geni cambia con la dimensione dell'albero: l'albero A ha 21 nodi e una costante.

#### 5.4.2 Crossover tra sottoalberi

Il **crossover** prende due genitori, sceglie in ciascuno un nodo (un punto di taglio) e scambia i sottoalberi che stanno sotto quei nodi. Ciascun figlio è un genitore con un pezzo preso dall'altro [5].

Genitori. Il primo è l'albero A (21 nodi). Il secondo, **albero B**, ha 15 nodi:

```
Genitore 1 (albero A)                 Genitore 2 (albero B)
if                                    if
├── and                               ├── F > 1.01 * S      <- pezzo Y (5 nodi)
│   ├── and (P > S, F > S)             ├── buy
│   └── V > 1.1 * VA   <- pezzo X     └── if
│       (5 nodi)                           ├── V > 1.5 * VA
├── buy                                    ├── sell
└── if (P < S) sell hold                   └── hold
```

L'albero B in parole: se la media veloce supera di oltre l'1% la lenta, `buy`; altrimenti, se il volume supera di una volta e mezza la sua media, `sell`; altrimenti `hold`.

Si scambiano il pezzo X (il confronto sul volume, nel genitore 1) e il pezzo Y (il confronto tra le medie, nel genitore 2):

- **Figlio 1** = genitore 1 con X sostituito da Y: compra quando P > S, F > S e F > 1,01·S, cioè ha tolto la condizione sul volume e ne ha messa una sulla distanza tra le medie. Vende se P < S. 21 nodi.
- **Figlio 2** = genitore 2 con Y sostituito da X: compra quando V > 1,1·VA; altrimenti vende se V > 1,5·VA; altrimenti `hold`. 15 nodi.

Decisioni giorno per giorno (B = buy, S = sell, un punto = hold; la prima colonna di simboli è il giorno 1):

```
giorno        12345678901234567890
genitore 1    ..BBBBB...SSSSSS....
genitore 2    ...BBBBBBB.......BBB
figlio 1      ...BBBBBBBSSSSSS.BBB
figlio 2      ..BBBBB...BBB.......
```

| Albero | Nodi | Operazioni eseguite | Valore finale | Rendimento |
|---|---|---|---|---|
| Genitore 1 (A) | 21 | compra g. 4, vende g. 12 | 995,26 | -0,47% |
| Genitore 2 (B) | 15 | compra g. 5, tiene | 1055,56 | +5,56% |
| Figlio 1 | 21 | compra g. 5, vende g. 12, ricompra g. 19 | 985,19 | -1,48% |
| Figlio 2 | 15 | compra g. 4, tiene | 1080,57 | +8,06% |

Che cosa si osserva:

- Il figlio 1 si comporta come una via di mezzo: ha l'uscita del genitore 1 (vende quando il prezzo scende sotto la media lenta) e un ingresso più simile al genitore 2.
- Il figlio 2 ha un ramo che **non scatta mai**: `V > 1,5·VA` non è mai vero in questo dataset (il volume massimo, al giorno 12, è 2200 contro una media di circa 1613), quindi il figlio 2 non vende mai e finisce per essere «compra e tieni» dal giorno 4. Un ramo inutile si chiama **codice morto** (in GP si usa il termine *introne*). Il rendimento migliore del figlio 2 è un caso di questo dataset, non un merito della struttura.
- Un figlio non è la media dei genitori: può comportarsi meglio o peggio di entrambi. La selezione tiene i buoni e scarta il resto.

#### 5.4.3 Mutazione

La **mutazione** cambia a caso un pezzo piccolo. Tre esempi sull'albero A (tutti inventati, uno per tipo):

| Mutazione | Cambia | Giorni con decisione diversa da A | Operazioni | Valore finale | Rendimento |
|---|---|---|---|---|---|
| Costante: 1,1 diventa 1,3 | `V > 1,3·VA` | 3, 5, 7 (da buy a hold) | compra g. 5, vende g. 12 | 972,22 | -2,78% |
| Foglia: nel ramo `sell`, P diventa F | `F < S` al posto di `P < S` | 11 (da sell a hold) | compra g. 4, vende g. 13 | 976,30 | -2,37% |
| Sottoalbero: il ramo `hold` finale è sostituito da `if V > 1,5·VA then buy else hold` | 7 nodi in più (28 in tutto) | nessuno | come A | 995,26 | -0,47% |

Nel primo caso alzare la soglia sul volume fa perdere i giorni 3, 5, 7, ma il giorno 4 e il giorno 6 passano comunque: la prima operazione slitta di un giorno. Nel secondo, F al giorno 11 è ancora sopra S (10,98 contro 10,88), quindi la vendita scatta un giorno dopo. Nel terzo la mutazione non cambia nessuna decisione sul dataset: il nuovo sottoalbero scatterebbe solo con un volume sopra 1,5 volte la sua media, che qui non accade mai. È una **mutazione neutra**. Molte mutazioni lo sono, perché la parte che cambiano non è raggiunta o non conta; la selezione le lascia passare e così l'albero cresce (vedi sotto).

#### 5.4.4 La crescita incontrollata (bloat)

Il **bloat** è la crescita della dimensione degli alberi senza miglioramento della fitness [5, sez. 11.3]. Esempio costruito a mano (non osservato in una ricerca): partiamo dall'albero A e aggiungiamo due pezzi che non cambiano il risultato.

- La condizione `P > S` diventa `P > S and (P > S or V < 0)`. Dato che `V < 0` non può mai essere vero, il pezzo vale sempre quanto `P > S`.
- Altri pezzi dello stesso tipo, più le condizioni di vendita arricchite allo stesso modo.

| Albero | Nodi | Decisioni uguali ad A? |
|---|---|---|
| A | 21 | (riferimento) |
| A con un pezzo ridondante | 29 | sì, tutti i 20 giorni |
| A con più pezzi ridondanti | 49 | sì, tutti i 20 giorni |

Un albero di 49 nodi fa le stesse scelte di uno di 21, ma costa più del doppio da calcolare e si legge male. Perché cresce? Il crossover scambia pezzi di dimensione casuale, e un pezzo in più raramente peggiora la fitness (il codice morto non fa danni), quindi tende a sopravvivere. Come difesa la letteratura GP propone di penalizzare la dimensione nella fitness o di fissare un limite di profondità; la sezione di [5] che le tratta non è stata riletta, quindi qui le si presenta come note ma da verificare **[ipotesi]**. La rassegna fissa già una condizione di scarto: se la dimensione degli alberi cresce senza miglioramento di fitness si passa ad altre forme.

### 5.5 Cosa ricorda del passato: le due varianti

#### 5.5.1 Variante «solo indicatori»

L'albero A è già un esempio: legge solo P, F, S, V, VA, cioè numeri riassunti **a monte** (le medie sono calcolate prima, dal motore). L'albero non ha nulla di suo che passi da un giorno al successivo. Dati gli stessi ingressi, dà sempre la stessa risposta. Tutta la memoria del passato sta negli indicatori: se si vuole che il programma «ricordi» qualcosa di diverso (per esempio il massimo raggiunto dal prezzo da un certo giorno), serve un indicatore apposito tra quelli calcolati a monte.

Conseguenze pratiche: `reset()` è banale (non c'è nulla da azzerare oltre agli indicatori), l'albero si può testare con una tabella di ingressi, e lo stesso albero dà lo stesso risultato se lo si valuta due volte.

#### 5.5.2 Variante «con memoria interna»: i registri

Un **registro** è una variabile che il programma può scrivere in un giorno e rileggere il giorno dopo. Come una variabile globale in un programma che viene richiamato una volta al giorno: tra una chiamata e l'altra conserva il valore. All'inizio vale un numero fisso (qui 0). Questa variante è ammessa in modo naturale dalla GP lineare, dove il programma è una sequenza di istruzioni che leggono e scrivono registri (sez. 7.1 di [5]), o in un albero le cui foglie possono leggere un registro o l'uscita del giorno precedente (rassegna, scheda sugli alberi).

**Esempio sul dataset giocattolo.** Un solo registro, `R0`, il massimo del prezzo dopo l'acquisto; vale 0 quando il programma non è in posizione. Il programma ogni giorno:

```
decisione:
  se R0 = 0 (non in posizione):
      se (P > S) e (F > S) e (V > 1.1 * VA): buy        # lo stesso ingresso di A
      altrimenti: hold
  altrimenti (in posizione):
      se P < 0.97 * R0: sell                              # uscita: prezzo sceso del 3%
      altrimenti: hold                                    #   dal massimo raggiunto
aggiornamento di R0 (dopo la decisione):
  se la decisione e' buy e R0 = 0: R0 = P
  altrimenti se R0 > 0:           R0 = max(R0, P)
  se la decisione e' sell:        R0 = 0
```

Come albero `if` ha 28 nodi (nel test «R0 = 0» si usa `R0 < 0,0001`). L'aggiornamento di `R0` è l'unica parte che l'albero A non ha: il programma ha due parti, una che decide e una che scrive il registro. Un'**uscita sul massimo** è una regola classica che nessun indicatore a monte, tra quelli visti, calcola da solo, perché dipende dal giorno in cui il programma ha comprato.

Giorno per giorno (R0 in ingresso è il valore all'inizio del giorno; la condizione di uscita è `P < 0,97·R0`):

| Giorno | P | R0 in ingresso | 0,97·R0 | Decisione | R0 in uscita |
|---|---|---|---|---|---|
| 1 | 10,00 | 0,00 | - | hold | 0,00 |
| 2 | 10,10 | 0,00 | - | hold | 0,00 |
| 3 | 10,30 | 0,00 | - | buy | 10,30 |
| 4 | 10,55 | 10,30 | 9,99 | hold | 10,55 |
| 5 | 10,80 | 10,55 | 10,23 | hold | 10,80 |
| 6 | 11,00 | 10,80 | 10,48 | hold | 11,00 |
| 7 | 11,20 | 11,00 | 10,67 | hold | 11,20 |
| 8 | 11,35 | 11,20 | 10,86 | hold | 11,35 |
| 9 | 11,30 | 11,35 | 11,01 | hold | 11,35 |
| 10 | 11,10 | 11,35 | 11,01 | hold | 11,35 |
| 11 | 10,80 | 11,35 | 11,01 | sell | 0,00 |
| 12-20 | 10,50 ... 11,40 | 0,00 | - | hold | 0,00 |

Il giorno 3 il programma decide `buy` e scrive 10,30 in `R0`. Nei giorni successivi `R0` segue il massimo del prezzo (10,55, 10,80, ..., 11,35). Il giorno 11 il prezzo (10,80) scende sotto 0,97·11,35 = 11,01: scatta `sell` e `R0` torna a 0. Dopo il giorno 11 l'ingresso non scatta più (il volume resta sotto la soglia) e il programma resta fermo.

**Risultato col valutatore:** compra al giorno 4 (10,55), vende al giorno 12 (10,50), valore finale **995,26**, **-0,47%**. È lo stesso risultato dell'albero A per coincidenza: le due regole di uscita (prezzo sotto la media lenta, prezzo sotto il 97% del massimo) scattano lo stesso giorno in questo dataset. Cambiando solo la costante 0,97 le uscite divergono: con 0,99 il `sell` scatta il giorno 10 (si vende al giorno 11 a 10,80: 1023,70, +2,37%); con 0,95 scatta il giorno 12 (si vende al giorno 13 a 10,30: 976,30, -2,37%). Anche qui nessuna di queste cifre dice se una soglia sia migliore in generale.

**Lo stesso ingresso, due risposte.** Il giorno 11 gli indicatori valgono P = 10,80, S = 10,88, F = 10,98, V = 1900. Con `R0 = 0` il programma risponde `hold` (non è in posizione e le condizioni di acquisto non sono tutte vere); con `R0 = 11,35` risponde `sell`. Nella variante con registri la risposta non dipende solo dagli ingressi del giorno: dipende anche da ciò che è successo prima.

#### 5.5.3 Che cosa guadagna e che cosa perde

**Guadagna.** Può costruirsi una memoria su misura, che nessun indicatore a monte offre: un contatore di giorni dall'acquisto, il massimo dal momento dell'acquisto, un'etichetta «già in posizione». Può esprimere regole di uscita dipendenti dalla propria storia.

**Perde.**
- **Si legge meno.** Per capire una decisione non basta guardare gli ingressi del giorno: bisogna sapere dove stanno i registri, e per saperlo bisogna aver simulato i giorni precedenti.
- **Lo spazio di ricerca cresce.** Oltre all'albero decisionale c'è un albero (o una sequenza) per ogni registro da aggiornare, e ogni registro è un gene in più.
- **Una mutazione si propaga nel tempo.** Cambiare la costante 0,97 cambia `R0` per tutti i giorni dopo l'acquisto e quindi tutte le decisioni successive (nell'esempio, spostare 0,97 a 0,99 sposta la vendita di un giorno e ne cambia il prezzo di 30 centesimi).
- **Rischia di diventare una macchina a stati nascosta.** Nell'esempio `R0 = 0` o `R0 > 0` distingue due situazioni (fermo, in posizione) con comportamenti diversi: è una macchina a stati a due stati, con in più un numero (il massimo) che si porta dietro. Un'evoluzione libera dei registri potrebbe ricreare, in forma meno leggibile, ciò che si voleva lasciare.
- Serve azzerare i registri a ogni `reset()`, come per i filtri IIR del motore (rassegna, sezione sul contratto di strategia).

#### 5.5.4 La domanda aperta per Luca

> **Domanda 2.** Si ammettono nel genoma i registri (o altra memoria interna), oppure l'albero legge soltanto indicatori già calcolati?

In termini di cosa cambia:

- **Se non si ammettono:** ogni memoria del passato deve stare nell'elenco di indicatori preparati a monte (la ricerca R2). Il programma è puro, facile da leggere e testare. Se manca un indicatore utile (per esempio il massimo dopo l'acquisto), il programma non può inventarselo.
- **Se si ammettono:** il programma può inventarsi la memoria che gli serve, ma si legge meno, la ricerca è più ampia e il genoma torna ad avere uno stato interno, come la macchina a stati di oggi.

Il capitolo non esprime una preferenza: la decisione è di Luca. Si tratta di una scelta di progetto, non di una proprietà della forma: sia l'albero che la GP cartesiana ammettono entrambe le varianti [5].

#### 5.5.5 Cenno alle varianti di rappresentazione

La rappresentazione ad albero è quella classica. Due varianti [5]:

- **GP lineare.** Il programma è una **sequenza di istruzioni** del tipo `R1 = R1 + P`, `R2 = R1 > S`, eseguite una dopo l'altra; i registri sono la memoria di lavoro. Il crossover scambia segmenti di istruzioni tra genitori. I registri esistono già dentro un singolo giorno; farli durare da un giorno al successivo è la variante «con memoria interna» (sez. 7.1 di [5]).
- **Evoluzione grammaticale (GE).** Il genoma è una stringa di interi che una grammatica traduce in un programma o in una regola [16] (letta la scheda con l'abstract). Cambiando la grammatica cambia la famiglia di forme raggiungibili senza cambiare l'algoritmo di ricerca: è un meccanismo di codifica, che compete a R3, e non una forma. Una grammatica che riproducesse una macchina a stati ricreerebbe la forma che si vuole lasciare.
- **GP cartesiana (CGP).** Il genoma è una lista di interi a lunghezza fissa che descrive un grafo di funzioni (un nodo può servire a più nodi). Tradizionalmente evolve per sola mutazione (sez. 7.2.3 di [5]); non si è letto altro, quindi il dettaglio non è descritto **[ipotesi]**.

### 5.6 Punti di forza e debolezze

#### 5.6.1 Quanto sa esprimere

Molto: con aritmetica e `if`, qualsiasi funzione degli ingressi, dimensione permettendo [5], [ipotesi]. Il caso concreto è l'interazione tra volume e prezzo vista in 5.3.4, che la somma pesata non riesce a esprimere. Il rovescio è che esprimere molto non vuol dire esprimere cose utili: la maggior parte degli alberi possibili è priva di senso.

#### 5.6.2 Quanto è grande lo spazio di ricerca

Grande e a dimensione variabile. L'albero A ha 21 nodi, 5 ingressi possibili per le foglie e una costante; ma l'evoluzione può cambiare anche il numero di nodi. A confronto, il punteggio lineare con 6 ingressi ha una decina di numeri (9 nell'esempio della rassegna) e la macchina a stati di oggi un numero fisso di numeri continui più una struttura discreta (capitolo 3). Uno spazio grande dà più possibilità di trovare regole utili e più possibilità di adattarsi al rumore dei soli 2517 giorni di un titolo: Bailey e coautori sostengono che provare molte configurazioni sugli stessi dati rende poco affidabile una validazione su dati tenuti fuori [4]. Come limitare il rischio spetta a R5 e R6.

#### 5.6.3 Si capisce perché decide così?

Dipende dalla dimensione. L'albero A si legge come una frase: «compra se il prezzo è sopra la media lenta, la veloce sta sopra la lenta e il volume è alto». La tabella della sezione 5.3.2 mostra quale ramo scatta ogni giorno. Un albero di 49 nodi, come quello del bloat, no, anche se fa le stesse scelte. Un albero evoluto lasciato crescere tende a diventare illeggibile [5, ipotesi per l'illeggibilità in pratica]. Con i registri la lettura peggiora (vedi 5.5.3).

#### 5.6.4 Quanto costa calcolarlo

Proporzionale ai nodi: un albero di 10-100 nodi richiede decine o centinaia di operazioni per giorno **[ipotesi]**. Non discrimina tra le forme; ciò che pesa è la dimensione massima ammessa e la dimensione della popolazione, materia di R5 e R6.

#### 5.6.5 Si mescola e si muta bene?

Il crossover tra sottoalberi è il caso «naturale» della GP [5] e funziona sempre sul piano formale (due alberi qualunque danno due alberi). Il problema è la qualità dei figli: come visto in 5.4.2, un figlio può avere rami morti o un comportamento diverso da entrambi i genitori. La mutazione è semplice da programmare; molte mutazioni sono neutre (5.4.3). La GP cartesiana, di norma, usa solo la mutazione.

#### 5.6.6 Che etichette (`labels`) ha

Il contratto della strategia richiede una lista **fissa e finita** di etichette (gli «stati» che il motore mostra). Un albero non ha stati. Due modi di derivarle:

- **Le tre azioni.** L'etichetta di un giorno è `buy`, `sell` o `hold`, cioè la foglia che scatta. Per l'albero A: 3 etichette. È semplice ed è ciò che la rassegna propone per la lista di regole.
- **Fasce dell'uscita**, per gli alberi numerici con soglie: etichetta bassa, media, alta.

Per un albero che decide direttamente, l'etichetta naturale sarebbe **il ramo che scatta** (nella tabella 5.3.2, il ramo `buy`, `sell` o `hold`). Un'etichetta per ogni foglia dell'albero non funzionerebbe come lista fissa, perché ogni albero ha un numero diverso di foglie; per questo si ricade sulle tre azioni. L'uscita numerica o i confronti intermedi si possono comunque esporre tra gli `indicators` del `describe()`. La rassegna segnala come estensione del contratto da trattare in E2 il fatto che nessuna forma continua abbia etichette «naturali».

### 5.7 Come si integra nel nostro motore

Ogni giorno il motore aggiorna gli indicatori, passa i dati all'albero e riceve `buy`, `sell` o `hold`: è lo schema `StrategyIndividual` (ganci `initIndicators`, `updateIndicators`, `resetIndicators`, `decide`; `src/engine/strategy.js`, righe 35-87). Un valutatore ricorsivo di albero è breve (poche decine di righe). L'albero si salva come JSON (liste annidate: nodo e figli). Il motore richiede anche `crossover` e `mutate` (`src/vendor/consilium/ga.js`, righe 116-125 e 345-351, come riportato dalla rassegna): vanno scritti per gli alberi; il crossover tra sottoalberi su una struttura ad albero è una funzione ricorsiva di poche righe. Le parti scomode sono tre: le etichette (5.6.6), il limite di dimensione dell'albero (bloat), e per la variante con registri l'azzeramento dei registri in `resetIndicators()`.

### 5.8 Cosa dice la letteratura

Un precedente classico [6] cerca con un algoritmo genetico combinazioni logiche di regole semplici su medie mobili e su massimi e minimi di prezzi passati. L'articolo non è stato letto: il riassunto letto dice che, nelle condizioni di quello studio, dopo i costi di transazione non è possibile guadagnare con le regole trovate. Una rassegna sistematica [7] osserva una forte concentrazione di studi su algoritmi genetici e GP per le regole di trading azionario (letto solo l'abstract). Nessuna delle due fonti permette di dire quanto bene funzioni la GP sul nostro titolo.

**Riepilogo delle fonti.**

- [5] è il manuale di riferimento (*A Field Guide to Genetic Programming*): alberi, crossover, mutazione, bloat, GP lineare e cartesiana. Letto per le sezioni citate nella rassegna.
- [6] e [7] sono i precedenti nel trading, con la cautela indicata sopra (riassunto di corso e abstract).
- Per la sola GP non ci sono fonti oltre a queste: tutto ciò che nel capitolo non ha numero è dedotto dall'esempio o marcato `[ipotesi]`.

### 5.9 In breve

- Il genoma è un albero di operazioni (confronti, `and`, `if`, aritmetica) che ogni giorno legge indicatori già calcolati e restituisce `buy`, `sell` o `hold`. Un albero piccolo si legge come una regola; uno grande no.
- Esprime interazioni tra indicatori che un punteggio lineare non può esprimere (5.3.4); l'evoluzione agisce su forma e costanti, con crossover tra sottoalberi (5.4.2) e mutazioni di nodi, foglie e costanti (5.4.3).
- I costi sono lo spazio di ricerca ampio, la crescita incontrollata degli alberi (bloat, 5.4.4), i rami morti e le etichette del contratto da derivare (5.6.6).
- Variante «solo indicatori»: la memoria è negli indicatori a monte; programma puro. Variante «con registri»: il programma si costruisce una memoria su misura (5.5.2), ma si legge meno, la ricerca cresce e può ricreare una macchina a stati nascosta.
- La domanda 2 (ammettere o no i registri) resta aperta e decisa da Luca; il capitolo non sceglie.
- Tutti i numeri dell'esempio sono inventati: A dà -0,47% sul giocattolo, il buy&hold +12,87%, senza alcun significato per i mercati.

## 6. La lista di regole

### 6.1 In una frase e un'analogia

Una lista di regole è un elenco ordinato di frasi «se la condizione è vera, allora fai questa azione»: ogni giorno si scorre l'elenco dall'alto e si esegue l'azione della **prima** regola la cui condizione è vera. L'ultima regola vale sempre ed è la scelta di riserva (default).

**Analogie.**

Se hai mai scritto una catena di `if / else if / else`, hai già scritto una lista di regole:

```
if (prezzo sopra la media lenta di almeno l'1% e volume sopra la media) buy
else if (prezzo sotto la media lenta di almeno l'1%)                    sell
else                                                                    hold
```

Funziona come le regole di un firewall o di un filtro antispam della posta: il pacchetto o il messaggio viene confrontato con le regole in ordine, la prima che corrisponde decide, le successive non vengono guardate. In letteratura questa struttura si chiama **lista di decisione** (decision list) ed è stata studiata da Rivest [8].

### 6.2 Come funziona

#### 6.2.1 Gli ingredienti

- **Condizione.** Un confronto tra due numeri, per esempio «il prezzo è maggiore della media lenta». Più confronti si possono unire con «e»: la condizione è vera solo se lo sono tutti.
- **Azione.** Una delle tre decisioni del progetto: `buy` (comprare), `sell` (vendere), `hold` (non fare nulla e mantenere la posizione attuale).
- **Ordine.** Le regole sono numerate. Si valutano nell'ordine, ci si ferma alla prima vera.
- **Regola di default.** L'ultima, senza condizione: scatta se nessuna delle precedenti è scattata. Garantisce che ogni giorno ci sia sempre una decisione.
- **Margine.** Un numero che sposta il confronto: «prezzo sopra la media di almeno 1%» significa `prezzo > media × (1 + 0,01)`. Serve a non reagire a differenze minime. Qui i margini si chiamano `m1` e `m2` e sono numeri del genoma, cioè li sceglie l'algoritmo genetico.

Una **media mobile esponenziale** (EMA, dall'inglese exponential moving average) è un numero che riassume i prezzi passati dando più peso ai più recenti: ogni giorno la nuova media è `media_ieri × (1 − c) + prezzo_oggi × c`. Il parametro `c` è il peso del dato nuovo: con `c` vicino a 1 la media segue il prezzo da vicino (breve memoria), con `c` vicino a 0 è molto liscia (lunga memoria). Nel codice di Consilium è definita così (`src/vendor/consilium/algorithm.js`, righe ~369-372). Per comodità useremo una media **veloce** (`c = 0,5`) e una **lenta** (`c = 0,2`), e una media lenta del volume (`c = 0,2`). Il **volume** è il numero di azioni scambiate in un giorno.

#### 6.2.2 Nessuno stato: ogni giorno si rivaluta tutto

La lista non conserva nulla da un giorno all'altro. Ogni mattina riceve i valori degli indicatori (le medie, il prezzo, il volume), scorre le regole da capo e produce una decisione. Non sa che cosa ha deciso ieri, né se oggi è in posizione.

La **macchina a stati** di Consilium funziona in modo diverso: ha uno stato interno (uno tra nove) e la decisione di oggi dipende da quello in cui si trovava ieri. Se ieri era nello stato 4 e oggi la condizione X è vera, passa allo stato 7. La lista invece, dati gli stessi valori degli indicatori, dà sempre la stessa risposta, qualunque cosa sia successa prima.

#### 6.2.3 Una lista è un albero molto sbilanciato

Un **albero di decisione** è una struttura in cui ogni nodo pone una domanda e, a seconda della risposta, si scende a sinistra o a destra, fino a una foglia che contiene l'azione. La lista di regole è un albero in cui a ogni domanda un ramo termina subito in una foglia e l'altro prosegue con la domanda successiva:

```
        R1: sopra l'1% e volume alto?
              /                \
            si                  no
           buy         R2: sotto l'1%?
                              /      \
                            si        no
                           sell      hold
```

Un albero qualsiasi può avere domande su entrambi i rami e foglie a qualunque profondità. La lista è il caso particolare «a pettine», con una foglia per ogni livello più la foglia finale. Questo la rende più semplice da leggere (basta andare dall'alto in basso) e meno flessibile (non si possono fare domande diverse sui due rami di una stessa domanda).

### 6.3 Esempio applicato al dataset giocattolo

Il dataset è quello comune a tutta la guida: 20 giorni di prezzo e volume inventati, con il prezzo che sale (giorni 1-8), scende (9-14) e risale (15-20). **I numeri sono inventati e non dicono nulla sul funzionamento reale degli approcci.**

#### 6.3.1 Semplificazioni di questo esempio

- La decisione presa alla chiusura del giorno `t` viene eseguita al prezzo del giorno `t+1`; la decisione dell'ultimo giorno è ignorata.
- `buy` compra con tutto il denaro (solo se non si è già in posizione); `sell` vende tutto (solo se si è in posizione). Un `buy` mentre si è già in posizione non fa nulla; così pure un `sell` a mercato fermo. Questo controllo lo fa il valutatore, non la lista.
- Azioni frazionarie, nessun costo di transazione, nessuno stop loss né take profit. Capitale 1000.
- I margini sono **relativi** alla media lenta (il margine di 1% è `media × 0,01`). Nella rassegna sono invece una differenza assoluta tra le due medie: è una scelta di forma, non cambia il meccanismo.
- Valori arrotondati a due decimali nelle tabelle; i confronti usano i valori non arrotondati.

#### 6.3.2 La lista

```
R1  se  prezzo > media_lenta × (1 + m1)  e  volume > media_volume   allora buy
R2  altrimenti se  prezzo < media_lenta × (1 − m2)                  allora sell
D   altrimenti                                                      hold
```

con `m1 = m2 = 0,01` (1%), media lenta del prezzo con `c = 0,2`, media del volume con `c = 0,2`.

In parole: compra quando il prezzo è nettamente sopra la sua tendenza e quel giorno si scambia più del solito; vendi quando il prezzo è nettamente sotto la tendenza; altrimenti aspetta.

#### 6.3.3 Giorno per giorno

La colonna «Distanza %» è `(prezzo / media lenta − 1) × 100`. Le colonne C1 e C2 dicono se la condizione della regola R1 (sopra di almeno 1% e volume sopra la media) o della regola R2 (sotto di almeno 1%) è vera. La regola che scatta è la prima con condizione vera (D = default).

| Giorno | Prezzo | Media lenta | Distanza % | Volume | Media volume | C1 (R1) | C2 (R2) | Regola | Decisione |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 10,00 | 10,00 | +0,00 | 1000 | 1000 | no | no | D | hold |
| 2 | 10,10 | 10,02 | +0,80 | 1100 | 1020 | no | no | D | hold |
| 3 | 10,30 | 10,08 | +2,22 | 1200 | 1056 | sì | no | R1 | buy |
| 4 | 10,55 | 10,17 | +3,73 | 1500 | 1145 | sì | no | R1 | buy |
| 5 | 10,80 | 10,30 | +4,89 | 1600 | 1236 | sì | no | R1 | buy |
| 6 | 11,00 | 10,44 | +5,39 | 1800 | 1349 | sì | no | R1 | buy |
| 7 | 11,20 | 10,59 | +5,76 | 1700 | 1419 | sì | no | R1 | buy |
| 8 | 11,35 | 10,74 | +5,66 | 1400 | 1415 | no | no | D | hold |
| 9 | 11,30 | 10,85 | +4,11 | 1200 | 1372 | no | no | D | hold |
| 10 | 11,10 | 10,90 | +1,81 | 1300 | 1358 | no | no | D | hold |
| 11 | 10,80 | 10,88 | -0,76 | 1900 | 1466 | no | no | D | hold |
| 12 | 10,50 | 10,81 | -2,83 | 2200 | 1613 | no | sì | R2 | sell |
| 13 | 10,30 | 10,70 | -3,78 | 2000 | 1690 | no | sì | R2 | sell |
| 14 | 10,20 | 10,60 | -3,81 | 1500 | 1652 | no | sì | R2 | sell |
| 15 | 10,35 | 10,55 | -1,92 | 1200 | 1562 | no | sì | R2 | sell |
| 16 | 10,55 | 10,55 | -0,02 | 1300 | 1509 | no | no | D | hold |
| 17 | 10,80 | 10,60 | +1,87 | 1500 | 1508 | no | no | D | hold |
| 18 | 11,05 | 10,69 | +3,35 | 1700 | 1546 | sì | no | R1 | buy |
| 19 | 11,25 | 10,80 | +4,14 | 1600 | 1557 | sì | no | R1 | buy |
| 20 | 11,40 | 10,92 | +4,37 | 1400 | 1525 | no | no | D | hold |

Alcune righe da guardare:

- **Giorno 2.** Il prezzo è sopra la media lenta (+0,80%), il volume è sopra la media, ma il margine di 1% non è raggiunto: la condizione di R1 è falsa e scatta il default. Il margine fa il suo lavoro.
- **Giorno 8.** Il prezzo è ben sopra la media (+5,66%) ma il volume (1400) è appena sotto la sua media (1415): R1 è falsa. R2 è falsa. Scatta il default `hold`. Una regola «e» richiede che tutti i confronti siano veri.
- **Giorni 9-11.** Il prezzo scende, ma non è ancora abbastanza sotto la media: nessuna regola scatta e la lista tiene (`hold`).
- **Giorno 15.** Il prezzo ha già ricominciato a salire, ma è ancora a -1,92% dalla media lenta: R2 continua a dire `sell`. La media lenta ha molta memoria e reagisce con ritardo.

#### 6.3.4 Risultato col valutatore

Il valutatore esegue le decisioni (il `buy` del giorno 3 viene eseguito al prezzo del giorno 4, e così via):

| Operazione | Giorno di esecuzione | Prezzo |
|---|---|---|
| buy | 4 | 10,55 |
| sell | 13 | 10,30 |
| buy | 19 | 11,25 |

Valore finale **989,32**, rendimento **-1,07%**. Il riferimento (comprare il giorno 1 e tenere) dà +12,87%. L'esempio non deve battere il riferimento: mostra il meccanismo. Il risultato negativo dipende da come sono scelti i margini e le medie su questi 20 giorni inventati, e non dice nulla su cosa farebbe la stessa forma di lista con altri numeri.

Un aspetto da notare: il `buy` si ripete per cinque giorni (3-7) ma il valutatore compra una volta sola. La lista non sa di essere già in posizione: lo sa il motore.

### 6.4 Che cosa cambia se si scambia l'ordine di due regole

Nella lista dell'esempio le due condizioni (sopra di almeno 1% e sotto di almeno 1%) non possono essere vere nello stesso giorno. Scambiare R1 e R2 non cambia nulla: lo abbiamo verificato, le decisioni sono identiche in tutti i 20 giorni. L'ordine conta solo quando due condizioni possono essere vere insieme.

Costruiamo un secondo esempio in cui capita. Due regole:

```
Rb  se  media_veloce > media_lenta                              allora buy
Rs  se  volume > media_volume  e  prezzo < media_veloce         allora sell
D   altrimenti                                                  hold
```

In parole: Rb dice «compra se la tendenza breve è sopra quella lunga»; Rs dice «vendi se oggi si scambia più del solito e il prezzo è sceso sotto la tendenza breve». Le due liste hanno le **stesse** regole, solo in ordine diverso:

- Lista C1: Rs, Rb, D.
- Lista C2: Rb, Rs, D.

Le decisioni coincidono in tutti i giorni tranne uno. Ecco i giorni 9-14 (media veloce con `c = 0,5`, lenta con `c = 0,2`):

| Giorno | Prezzo | Media veloce | Media lenta | Rb vera? | Rs vera? | C1 (Rs, Rb) | C2 (Rb, Rs) |
|---|---|---|---|---|---|---|---|
| 9 | 11,30 | 11,24 | 10,85 | sì | no | buy | buy |
| 10 | 11,10 | 11,17 | 10,90 | sì | no | buy | buy |
| 11 | 10,80 | 10,98 | 10,88 | sì | sì | **sell** | **buy** |
| 12 | 10,50 | 10,74 | 10,81 | no | sì | sell | sell |
| 13 | 10,30 | 10,52 | 10,70 | no | sì | sell | sell |
| 14 | 10,20 | 10,36 | 10,60 | no | no | hold | hold |

Il giorno 11 la media veloce (10,98) è ancora sopra la lenta (10,88), quindi Rb è vera; ma il volume (1900) è sopra la media (1466) e il prezzo (10,80) è sotto la media veloce, quindi è vera anche Rs. Se Rs viene prima, il giorno 11 è `sell`; se viene prima Rb, è `buy`, e la vendita arriva un giorno dopo.

Col valutatore:

| Lista | Operazioni (giorno, tipo, prezzo) | Valore finale | Rendimento |
|---|---|---|---|
| C1 (Rs, Rb) | 3 buy 10,30; 12 sell 10,50; 18 buy 11,05 | 1051,71 | +5,17% |
| C2 (Rb, Rs) | 3 buy 10,30; 13 sell 10,30; 18 buy 11,05 | 1031,67 | +3,17% |

Un solo giorno di decisione diversa sposta la vendita di un giorno e cambia il risultato di due punti percentuali. Il confronto serve per mostrare che l'**ordine è un gene a tutti gli effetti**; che C1 vada meglio di C2 su questi dati inventati non ha alcun valore generale.

### 6.5 Come evolve

#### 6.5.1 I geni

L'algoritmo genetico può cambiare, in una lista di regole:

- le **soglie e i margini** (`m1`, `m2`: numeri continui);
- per ogni confronto, **quali indicatori** mette a confronto (per esempio «prezzo contro media lenta», «media veloce contro media lenta», «volume contro media volume») e con quale operatore (`>` o `<`);
- l'**azione** di ogni regola (`buy`, `sell`, `hold`);
- l'**ordine** delle regole;
- il **numero di regole** e il numero di condizioni per regola.

L'ultimo punto è una differenza importante rispetto a una forma a numero fisso di parametri: il genoma ha lunghezza variabile.

#### 6.5.2 Mutazione: quattro esempi sulla lista dell'esempio

Si parte dalla lista A (R1, R2, D) con risultato 989,32 (-1,07%). Ogni mutazione modifica una cosa sola.

1. **Cambiare una soglia: `m1` da 1% a 4%.** R1 richiede ora che il prezzo sia sopra la media di almeno il 4%. Cambiano le decisioni dei giorni 3, 4 e 18 (da `buy` a `hold`). Operazioni: buy giorno 6 a 11,00, sell giorno 13 a 10,30, buy giorno 20 a 11,40. Valore finale 936,36 (-6,36%).
2. **Cambiare un'altra soglia: `m2` da 1% a 3%.** R2 richiede di essere sotto la media di almeno il 3%. Cambiano i giorni 12 e 15 (da `sell` a `hold`). Operazioni: buy giorno 4 a 10,55, sell giorno 14 a 10,20, buy giorno 19 a 11,25. Valore finale 979,72 (-2,03%).
3. **Sostituire un indicatore: R2 confronta il prezzo con la media veloce invece che con la lenta** (resta il margine di 1%). Cambia solo il giorno 12 (da `sell` a `hold`: la media veloce, più vicina al prezzo, non è ancora scesa abbastanza). Operazioni: buy giorno 4, sell giorno 14 a 10,20, buy giorno 19. Valore finale 979,72 (-2,03%).
4. **Aggiungere una regola in testa:** Rs («se volume sopra la media e prezzo sotto la media veloce allora sell»). La lista diventa Rs, R1, R2, D. Cambia solo il giorno 11 (da `hold` a `sell`). Operazioni: buy giorno 4 a 10,55, sell giorno 12 a 10,50, buy giorno 19 a 11,25. Valore finale 1008,53 (+0,85%).

Spostare una regola, il quarto tipo di mutazione, dà effetti solo se le regole si sovrappongono (vedi sopra). I risultati, positivi o negativi, dipendono dai 20 giorni inventati e non dicono quale mutazione sia «buona».

#### 6.5.3 Crossover: scambiare un blocco di regole

Il **crossover** prende due genitori e costruisce due figli combinando parti di entrambi. Nelle liste si scambiano blocchi di regole. Prendiamo:

- Genitore P1 = lista A: `[R1 (buy), R2 (sell)]`, risultato 989,32.
- Genitore P2 = lista C1: `[Rs (sell), Rb (buy)]`, risultato 1051,71.

Punto di taglio dopo la prima regola. I figli sono:

- F1 = `[R1 (buy), Rb (buy)]`: ha ereditato la prima regola di P1 e la seconda di P2.
- F2 = `[Rs (sell), R2 (sell)]`: la prima regola di P2 e la seconda di P1.

Che cosa fanno sul dataset:

| Individuo | Regole | Operazioni | Valore finale | Rendimento |
|---|---|---|---|---|
| P1 | R1 buy, R2 sell | buy 4, sell 13, buy 19 | 989,32 | -1,07% |
| P2 | Rs sell, Rb buy | buy 3, sell 12, buy 18 | 1051,71 | +5,17% |
| F1 | R1 buy, Rb buy | buy 3 (poi nessuna vendita) | 1106,80 | +10,68% |
| F2 | Rs sell, R2 sell | nessuna operazione | 1000,00 | 0,00% |

Entrambi i figli sono **degeneri**: F1 ha due regole di acquisto e nessuna di vendita, quindi compra al giorno 3 e tiene fino alla fine; F2 ha due regole di vendita e nessuna di acquisto, quindi non compra mai. Il rendimento alto di F1 non ha nessun valore: dipende dal dataset (il prezzo sale in fondo) e F1 non venderebbe mai in una discesa. Questo mostra il punto debole del crossover per le liste: le regole hanno significato solo in relazione alle altre, e un blocco preso da un genitore può non funzionare in una lista diversa. In pratica un algoritmo di questo tipo dovrebbe prevedere accorgimenti (per esempio scambiare regole in coppie compatibili, o scartare i figli che non hanno almeno una regola di acquisto e una di vendita) [ipotesi]. Vedi anche la sezione sulle debolezze.

### 6.6 Cosa ricorda del passato

La lista **non ha memoria propria**: nel genoma non c'è nessun contatore, nessuna variabile che sopravviva da un giorno all'altro. Tutta la memoria viene dagli **indicatori a monte**, come le medie mobili: la media lenta con `c = 0,2` «ricorda» i prezzi degli ultimi giorni, la media del volume ricorda i volumi passati.

Ne segue che la lista non può esprimere regole che parlano di **tempo trascorso** o di **ciò che ha fatto prima**. Un esempio tipico: «vendi se sono passati tre giorni dall'acquisto». Provalo sul nostro dataset. La lista A compra ogni giorno dal 3 al 7 (le condizioni di R1 sono vere per cinque giorni di fila, con gli stessi valori «si/no»). Una strategia che dovesse vendere tre giorni dopo l'acquisto direbbe `buy` il giorno 3, `hold` i giorni 4 e 5, `sell` il giorno 6. Ma i giorni 3, 4, 5, 6 e 7 per la lista sono indistinguibili: stesse condizioni, stessa regola, stessa risposta. Per distinguerli serve sapere da quanti giorni si è in posizione, e questo è uno stato.

Ecco che cosa fa quella strategia con un contatore sul dataset (stesso criterio di acquisto di R1; dopo l'acquisto conta i giorni e vende al terzo): operazioni buy giorno 4 a 10,55, sell giorno 7 a 11,20, buy giorno 8 a 11,35, sell giorno 11 a 10,80, buy giorno 19 a 11,25; valore finale 1023,64 (+2,36%). Nessuna lista di regole sugli indicatori dell'esempio può riprodurre questo comportamento.

Due strade per ottenerlo: una **macchina a stati**, dove lo stato «in posizione da un giorno», «da due giorni» e così via è esplicito (capitolo 3); oppure un **albero con registri** (variabili che sopravvivono da un giorno all'altro, capitolo 5). Un'altra possibilità è aggiungere agli ingressi un indicatore «giorni dall'ultimo acquisto», ma allora lo stato è tenuto fuori dalla lista e va portato dal motore [ipotesi].

### 6.7 I learning classifier system: stili Michigan e Pittsburgh

I **learning classifier system** (LCS) sono sistemi che fanno evolvere regole del tipo «se condizione allora azione» con metodi genetici. Esistono due famiglie [ipotesi, fonte da verificare: Urbanowicz e Moore, 2009, identificata ma non letta nel testo; non è numerata fra i riferimenti]:

- **Michigan.** Ogni individuo dell'algoritmo genetico è **una regola**; la popolazione intera è la strategia. A ogni regola si associa un valore di forza (o di idoneità), appreso dall'esperienza: le regole che hanno portato buoni risultati vengono rafforzate.
- **Pittsburgh.** Ogni individuo è un **insieme completo di regole**, cioè una strategia intera; l'algoritmo genetico valuta l'insieme e lo fa evolvere come un genoma qualsiasi.

La lista di regole di questo capitolo è più vicina allo stile Pittsburgh, perché un genoma contiene tutto l'insieme di regole ed è valutato per intero [ipotesi, fonte da verificare]. Le differenze: in un LCS Pittsburgh le regole di solito non hanno un ordine e quando più regole scattano si ricorre a un voto tra le regole; nella lista c'è un ordine e vince la prima, e c'è un default [ipotesi, fonte da verificare]. Nello stile Michigan l'individuo del GA sarebbe una singola regola e la strategia sarebbe l'intera popolazione: questo è in tensione con l'ipotesi del contratto del progetto, «un genoma è una strategia». Per questo gli LCS non sono portati a scheda nella rassegna e restano qui una nota.

### 6.8 Punti di forza e debolezze

**Quanto sa esprimere?** Regioni delimitate da confronti: ogni regola è una congiunzione («e») di confronti, e la lista come insieme dà una decisione a tratti (a regioni) dello spazio degli indicatori [8]. Non sa fare somme pesate graduate (vedi tabella) né ragionare sul tempo trascorso.

**Quanto è grande lo spazio di ricerca?** Variabile. Nell'esempio il genoma è piccolo (due margini, tre indicatori scelti, tre azioni e un ordine), ma può crescere aggiungendo regole e condizioni; con 5 regole da 3 condizioni ciascuna sono una quindicina di confronti, ognuno con indicatori, operatore e margine da scegliere [conteggio dell'autore, ipotesi]. Più la lista è lunga, più il genoma può adattarsi al rumore dei dati storici (sovradattamento, cioè funzionare bene sul passato e male sul futuro) [ipotesi]; come limitarlo è tema di altre decisioni del ciclo (R5 e R6).

**Si capisce perché decide così?** Sì, molto: si legge come un regolamento. Per ogni giorno si può dire «ha deciso `sell` perché la regola R2 è scattata e R1 non lo era». Resta vero finché la lista è corta; una lista di cinquanta regole è leggibile solo in teoria [ipotesi]. Un rischio da conoscere è l'**ombreggiamento**: una regola può non scattare mai perché una precedente copre già tutti i suoi casi (nell'esempio, se mettessimo in testa «se prezzo > media allora hold», le altre regole che richiedono il prezzo sopra la media non scatterebbero mai).

**Quanto costa calcolarla?** Poco: una condizione per regola per giorno, in totale poche decine di confronti ogni giorno [ipotesi].

**Si mescola e si muta bene?** La mutazione di una soglia è semplice (si perturba un numero). Il crossover è delicato perché l'ordine conta e le regole prese da genitori diversi possono non funzionare insieme (esempio dei figli F1 e F2 sopra).

**Si adatta al nostro motore?** Quasi direttamente: vedi la sezione «Come si integra nel nostro motore».

#### 6.8.1 Confronto con punteggio lineare e albero

Una tabella semplice di che cosa sa esprimere ciascuna forma. Il **punteggio lineare** calcola una somma pesata degli indicatori (`punteggio = p1 × indicatore1 + p2 × indicatore2 + ...`) e decide in base a due soglie: sopra la soglia alta `buy`, sotto la bassa `sell`, in mezzo `hold`.

| Domanda | Punteggio lineare | Lista di regole | Albero (programmazione genetica) |
|---|---|---|---|
| Combina molti segnali deboli sommandoli? | Sì, è il suo mestiere | No (ogni confronto è vero o falso) | Sì, se ha nodi di somma |
| Esprime «A e B insieme»? | No, una somma pesata non è una congiunzione | Sì, con «e» tra confronti | Sì |
| Esprime «prima controlla A, poi eventualmente B»? | No | Sì, è la sua struttura | Sì, con nodi condizionali |
| Domande diverse sui due rami di una domanda? | No | No, un ramo termina subito | Sì |
| Numero di numeri del genoma | Fisso e piccolo (pesi e soglie) | Variabile | Variabile (anche molto) |
| Si legge il motivo di una decisione? | Sì, guardando i contributi dei pesi | Sì, guardando la regola che scatta | Con un po' di calcolo [ipotesi] |
| Memoria del passato | Solo dagli indicatori | Solo dagli indicatori | Solo dagli indicatori, o con registri |

Le prime righe sono fatti sulla struttura delle forme; le ultime tre riprendono le schede della rassegna (dove la valutazione è a tratti per la lista [8], da `[ipotesi]` per il resto). Non si tratta di una classifica: ogni forma esprime cose che l'altra non esprime.

### 6.9 Come si integra nel nostro motore

La forma si integra quasi direttamente. Il motore chiede a ogni forma le etichette (`labels`), lo stato dichiarato in ogni giorno. Per la lista l'etichetta naturale è **la regola che scatta** (R1, R2 o D) oppure l'azione stessa: dichiara la scelta della forma senza invenzioni. Il contratto chiede anche `describe()` (esporre i numeri, qui i valori delle condizioni), `serialize()` (la lista si salva facilmente come JSON) e, per evolvere, `crossover` e `mutate` (nel GA di Consilium, `src/vendor/consilium/ga.js` righe 116-125 e 345-351, come riportato dalla rassegna). `hold` si traduce nel non chiamare né `buy()` né `sell()` (`strategy.js`, righe 46-55, come nella rassegna). La lista non ha stato da azzerare con `resetIndicators()` oltre agli indicatori.

### 6.10 Cosa dice la letteratura

- La lista come struttura si chiama **lista di decisione** e Rivest [8] ne ha studiato la definizione (letto in parte: abstract e definizione).
- Per l'uso di algoritmi evolutivi nelle regole di trading azionario la letteratura è ampia [7] (letto l'abstract); un precedente classico con combinazioni logiche di regole su medie mobili è [6] (letto solo un riassunto). Di nessuno dei due si riportano risultati numerici.
- I **learning classifier system** (stili Michigan e Pittsburgh, sezione precedente) sono descritti dalla conoscenza generale dell'autore e restano **[ipotesi, fonte da verificare]**: la fonte nota (Urbanowicz e Moore, 2009) non è stata letta nel testo e non è usata come prova.
- Nessuna fonte letta tratta l'uso di una lista di regole evoluta con un GA su un titolo come ENI: **non accertato**.

### 6.11 In breve

- Una lista di regole è un elenco ordinato di «se condizione allora azione»: vince la prima regola vera; l'ultima è un default sempre vero.
- Non ha stato: ogni giorno si rivaluta tutto dagli indicatori. È un albero a pettine, più semplice e meno flessibile.
- Sul dataset giocattolo la lista A dà 989,32 (-1,07%): numeri inventati, solo per mostrare il meccanismo. Scambiare due regole sovrapposte cambia un giorno di decisione e due punti di risultato.
- Evolve su soglie, indicatori, azioni, ordine e numero di regole; il crossover può dare figli degeneri se non si prendono accorgimenti.
- Non può esprimere il tempo trascorso o una sequenza («vendi dopo tre giorni»): serve uno stato (macchina a stati) o registri (alberi).
- Punto forte: leggibilità, etichetta naturale (la regola che scatta). Debolezze: lunghezza variabile e rischio di adattarsi al rumore, crossover delicato.

## 7. Le reti neurali piccole (MLP e NEAT)

### 7.1 In una frase e un'analogia

Una rete neurale è una funzione fatta di tanti piccoli calcoli collegati tra loro: ogni calcolo somma alcuni numeri, ciascuno moltiplicato per un «peso», e ne fa passare il risultato attraverso una funzione che lo schiaccia in un intervallo fisso. I pesi sono i numeri che definiscono la rete, e sono ciò che l'algoritmo genetico fa evolvere.

**Analogia.** Pensa a un foglio di calcolo con più colonne. La prima colonna contiene i dati del giorno (gli ingressi). Ogni cella della seconda colonna è una formula del tipo «0,3 volte la cella A, più 0,3 volte la cella B, più una costante», seguita da una funzione che limita il risultato. La terza colonna combina allo stesso modo le celle della seconda e produce un solo numero. Le costanti dentro le formule sono i pesi. Chi costruisce il foglio può scegliere i pesi a mano, ma qui li sceglie l'evoluzione: i fogli migliori sopravvivono, si mescolano e si modificano a caso.

**Una precisazione.** Di solito le reti neurali si «addestrano» con un metodo chiamato discesa del gradiente, che corregge i pesi un poco alla volta nella direzione che riduce l'errore. Qui non lo usiamo. Il nostro algoritmo genetico non ha bisogno di sapere in che direzione correggere: prova molte reti, tiene quelle con la fitness migliore (il numero che dice quanto una strategia è buona) e ne ricava di nuove. Questo approccio si chiama **neuroevoluzione**.

**Avvertenza sui numeri.** Tutti i prezzi, i volumi e i pesi di questo capitolo sono inventati. Servono a mostrare il meccanismo. Non dicono nulla sul funzionamento reale delle reti sui mercati, e nessun risultato dell'esempio va letto come prova che una forma «guadagna» più di un'altra.

### 7.2 Come funziona

#### 7.2.1 Un neurone

Un neurone (artificiale) riceve alcuni numeri in ingresso e produce un numero in uscita. Procede in tre passi.

1. **Moltiplica** ogni ingresso per il suo peso.
2. **Somma** i prodotti e aggiunge una costante, il **bias** (un peso che non si moltiplica per nessun ingresso).
3. **Applica una funzione di attivazione** al risultato.

```
somma  = w1*x1 + w2*x2 + w3*x3 + b
uscita = tanh(somma)
```

In parole: `x1, x2, x3` sono gli ingressi, `w1, w2, w3` i loro pesi, `b` il bias. `tanh` è la tangente iperbolica, la funzione di attivazione che usiamo in tutto il capitolo.

**Che cosa fa `tanh`.** Prende qualunque numero e lo schiaccia tra -1 e +1. Vicino a zero si comporta quasi come l'identità; lontano da zero si satura, cioè si avvicina a -1 o a +1 senza mai superarli. Con tre valori:

| somma | tanh(somma) | lettura |
|---|---|---|
| -2 | -0,96 | molto negativa: quasi -1 |
| 0,5 | 0,46 | piccola: quasi invariata |
| 3 | 1,00 (0,995) | grande: quasi +1, e con 4 o con 40 il risultato è praticamente lo stesso |

La saturazione è ciò che rende la rete diversa da una semplice somma pesata: dopo un certo punto, aumentare ancora l'ingresso non cambia più l'uscita. È anche la ragione per cui più neuroni collegati in successione possono rappresentare relazioni che una somma pesata sola non rappresenta (sezione 7.3.5).

#### 7.2.2 Un MLP (perceptron multistrato)

Un **MLP** (multilayer perceptron, perceptron multistrato) mette i neuroni in strati. I neuroni dello **strato nascosto** leggono gli ingressi; il neurone (o i neuroni) dello **strato di uscita** legge le uscite dello strato nascosto. «Nascosto» significa solo che questi numeri non sono né dati né decisioni: sono valori intermedi.

```
 ingressi        strato nascosto        uscita

   x1 ---+--------> [ h1 ] ---+
         |   \                \
   x2 ---+----+-----> [ h2 ] --+--> [ y ] --> soglie --> buy/hold/sell
         |   /                /
   x3 ---+--------------------
```

Ogni ingresso è collegato a ogni neurone nascosto (ciascun collegamento ha il suo peso), e ogni neurone nascosto all'uscita.

In formule, con `x` il vettore degli ingressi:

```
h = tanh( W1 * x + b1 )       (strato nascosto)
y = W2 * h + b2               (uscita: un punteggio)
```

In parole: `W1` raccoglie i pesi dagli ingressi ai neuroni nascosti, `b1` i loro bias; `W2` e `b2` fanno lo stesso dal livello nascosto all'uscita. Nell'uscita non applichiamo `tanh`: il punteggio `y` resta una somma pesata dei neuroni nascosti. Con tre ingressi e due neuroni nascosti, per esempio:

```
h1 = tanh( 0,3*x1 + 0,3*x2 + 0*x3 + 0 )
h2 = tanh( 1,0*x1 + 0*x2 + 6*x3 - 5,2 )
y  = 1,5*h1 - 1,0*h2 - 1,0
```

(I numeri sono quelli dell'esempio della sezione 7.3.)

**Dall'uscita alle tre azioni.** La rete produce un numero continuo `y`. Per ottenere `buy`, `sell` o `hold` servono due soglie:

```
buy   se y >  0,5
sell  se y < -0,5
hold  altrimenti
```

In parole: un `y` alto compra, un `y` molto negativo vende, un `y` vicino a zero lascia le cose come stanno. Le soglie sono parte della forma: nell'esempio sono fisse (±0,5); si potrebbero invece evolvere, e allora diventano due numeri in più nel genoma.

Un'alternativa è una rete con **tre uscite**, una per azione, e si sceglie quella più alta. È più comoda da leggere («la rete vuole comprare») ma ha più pesi; non la usiamo nell'esempio.

### 7.3 Esempio applicato al dataset giocattolo

#### 7.3.1 Gli ingressi

Gli ingressi sono tre indicatori calcolati dai prezzi e dai volumi del dataset giocattolo (le definizioni qui sotto sono quelle che usiamo in questo capitolo; per capirle servono le medie mobili esponenziali, spiegate subito dopo).

Una **media mobile esponenziale** (EMA, exponential moving average) è una media che dà più peso ai dati recenti. Si calcola giorno per giorno così:

```
e[t] = e[t-1]*(1 - c) + x[t]*c
```

In parole: `x[t]` è il dato del giorno `t` (il prezzo o il volume), `e[t-1]` è la media del giorno prima, `c` è un numero tra 0 e 1 che pesa il dato NUOVO. Con `c` vicino a 1 la media segue il dato (poca memoria); con `c` vicino a 0 è molto liscia (molta memoria). Esempio: se `e[t-1]` = 10,00, `x[t]` = 10,30 e `c` = 0,2, allora `e[t]` = 10,00*0,8 + 10,30*0,2 = 10,06. Il primo valore della media è il primo dato. Nel progetto questo filtro è quello di `src/vendor/consilium/algorithm.js`, righe 369-372.

Con una media «lenta» (`c` = 0,2) e una «veloce» (`c` = 0,5) sul prezzo, e una media lenta (`c` = 0,2) sul volume, i tre ingressi sono:

- `x1`, **distanza dalla media lenta**: di quanti punti percentuali il prezzo del giorno sta sopra (positivo) o sotto (negativo) la media lenta del prezzo. `x1 = (prezzo - media lenta) / media lenta * 100`.
- `x2`, **differenza tra le medie**: di quanti punti percentuali la media veloce sta sopra o sotto la lenta. `x2 = (media veloce - media lenta) / media lenta * 100`. Positivo vuol dire che il prezzo, di recente, sta salendo.
- `x3`, **scarto del volume**: di quanto il volume del giorno sta sopra (positivo) o sotto (negativo) la media lenta del volume, in frazione. `x3 = volume / media lenta del volume - 1`. Vale 0 in un giorno normale e 0,30 in un giorno con il 30 per cento di scambi in più del solito. Il **volume** è il numero di azioni scambiate nel giorno.

Valori giorno per giorno (arrotondati a due decimali; i calcoli interni usano i numeri non arrotondati):

| Giorno | Prezzo | Volume | x1 (%) | x2 (%) | x3 |
|---|---|---|---|---|---|
| 1 | 10,00 | 1000 | 0,00 | 0,00 | 0,00 |
| 2 | 10,10 | 1100 | 0,80 | 0,30 | 0,08 |
| 3 | 10,30 | 1200 | 2,22 | 0,98 | 0,14 |
| 4 | 10,55 | 1500 | 3,73 | 1,88 | 0,31 |
| 5 | 10,80 | 1600 | 4,89 | 2,76 | 0,29 |
| 6 | 11,00 | 1800 | 5,39 | 3,39 | 0,33 |
| 7 | 11,20 | 1700 | 5,76 | 3,83 | 0,20 |
| 8 | 11,35 | 1400 | 5,66 | 4,01 | -0,01 |
| 9 | 11,30 | 1200 | 4,11 | 3,53 | -0,13 |
| 10 | 11,10 | 1300 | 1,81 | 2,43 | -0,04 |
| 11 | 10,80 | 1900 | -0,76 | 0,94 | 0,30 |
| 12 | 10,50 | 2200 | -2,83 | -0,59 | 0,36 |
| 13 | 10,30 | 2000 | -3,78 | -1,72 | 0,18 |
| 14 | 10,20 | 1500 | -3,81 | -2,29 | -0,09 |
| 15 | 10,35 | 1200 | -1,92 | -1,87 | -0,23 |
| 16 | 10,55 | 1300 | -0,02 | -0,95 | -0,14 |
| 17 | 10,80 | 1500 | 1,87 | 0,23 | -0,01 |
| 18 | 11,05 | 1700 | 3,35 | 1,37 | 0,10 |
| 19 | 11,25 | 1600 | 4,14 | 2,23 | 0,03 |
| 20 | 11,40 | 1400 | 4,37 | 2,74 | -0,08 |

#### 7.3.2 I pesi (tutti)

La rete ha 3 ingressi, 2 neuroni nascosti e 1 uscita: 11 pesi in tutto.

| Parte | Peso su x1 | Peso su x2 | Peso su x3 | Bias |
|---|---|---|---|---|
| Neurone nascosto h1 | 0,3 | 0,3 | 0 | 0 |
| Neurone nascosto h2 | 1,0 | 0 | 6,0 | -5,2 |

| Uscita | Peso su h1 | Peso su h2 | Bias |
|---|---|---|---|
| y | 1,5 | -1,0 | -1,0 |

Soglie: `buy` se `y` > 0,5; `sell` se `y` < -0,5; altrimenti `hold`.

**Che cosa «fanno» i due neuroni, scelti a mano per l'esempio.** `h1` è un rivelatore di tendenza: somma `x1` e `x2` (le due misure del prezzo rispetto alle medie) e vale circa +1 quando il prezzo sale da giorni, circa -1 quando scende. `h2` è un rivelatore di «prezzo alto con molto volume»: diventa positivo solo se `x1` (prezzo sopra la media) e `x3` (volume alto) sono entrambi grandi, per via del bias -5,2: un prezzo alto da solo (`x1` fino a circa 5) o un volume alto da solo (6*`x3` fino a circa 2) non lo supera. L'uscita dice: compra con la tendenza (`h1`), ma togli spinta se `h2` segnala un prezzo alto con volumi elevati. Questa è una lettura **a posteriori** fatta dall'autore per rendere l'esempio comprensibile. Una rete evoluta non ha un significato dichiarato per i suoi neuroni (sezione 7.7.1).

#### 7.3.3 Calcolo dettagliato per tre giorni

**Giorno 3.** Ingressi: `x1` = 2,22, `x2` = 0,98, `x3` = 0,14.

```
somma di h1 = 0,3*2,2231 + 0,3*0,9825 + 0*0,1364 + 0     =  0,9617
h1          = tanh( 0,9617 )                              =  0,7450
somma di h2 = 1,0*2,2231 + 0*0,9825 + 6*0,1364 - 5,2      = -2,1587
h2          = tanh( -2,1587 )                             = -0,9737
y           = 1,5*0,7450 - 1,0*(-0,9737) - 1,0            =  1,0912
```

In parole: la tendenza è positiva (`h1` = 0,75); `h2` è vicino a -1, cioè «nessun prezzo alto con volume alto», e il suo peso negativo trasforma il -0,97 in un +0,97 che si somma. `y` = 1,09 supera 0,5: decisione **buy**.

**Giorno 6.** Ingressi: `x1` = 5,39, `x2` = 3,39, `x3` = 0,33.

```
somma di h1 = 0,3*5,3911 + 0,3*3,3851 + 0*0,3346 + 0      =  2,6329
h1          = tanh( 2,6329 )                              =  0,9897
somma di h2 = 1,0*5,3911 + 0*3,3851 + 6*0,3346 - 5,2      =  2,1990
h2          = tanh( 2,1990 )                              =  0,9757
y           = 1,5*0,9897 - 1,0*0,9757 - 1,0               = -0,4911
```

In parole: la tendenza è fortissima (`h1` = 0,99), ma il prezzo è molto sopra la media lenta e il volume è alto: `h2` scatta (0,98) e sottrae. `y` = -0,49 sta appena sopra -0,5: decisione **hold**. Con un volume normale (`x3` = 0) `y` sarebbe 0,30: sempre `hold`, ma più vicino alla soglia di acquisto (vedi 7.3.5).

**Giorno 12.** Ingressi: `x1` = -2,83, `x2` = -0,59, `x3` = 0,36.

```
somma di h1 = 0,3*(-2,8299) + 0,3*(-0,5900) + 0*0,3640 + 0 = -1,0260
h1          = tanh( -1,0260 )                              = -0,7723
somma di h2 = 1,0*(-2,8299) + 0*(-0,5900) + 6*0,3640 - 5,2 = -5,8460
h2          = tanh( -5,8460 )                              = -1,0000
y           = 1,5*(-0,7723) - 1,0*(-1,0000) - 1,0          = -1,1584
```

In parole: il prezzo scende da giorni, `h1` è negativo; il volume è alto (`x3` = 0,36, quasi come il giorno 6) ma qui `h2` resta a -1 perché il prezzo non è alto. `y` = -1,16 sta sotto -0,5: decisione **sell**.

#### 7.3.4 Tutti i 20 giorni e il risultato col valutatore

Le colonne «somma» sono i valori prima di `tanh`; `h1` e `h2` sono i valori dopo.

| Giorno | x1 | x2 | x3 | somma h1 | h1 | somma h2 | h2 | y | Decisione |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0,00 | 0,00 | 0,00 | 0,00 | 0,00 | -5,20 | -1,00 | -0,00 | hold |
| 2 | 0,80 | 0,30 | 0,08 | 0,33 | 0,32 | -3,93 | -1,00 | 0,48 | hold |
| 3 | 2,22 | 0,98 | 0,14 | 0,96 | 0,75 | -2,16 | -0,97 | 1,09 | buy |
| 4 | 3,73 | 1,88 | 0,31 | 1,68 | 0,93 | 0,39 | 0,37 | 0,03 | hold |
| 5 | 4,89 | 2,76 | 0,29 | 2,30 | 0,98 | 1,46 | 0,90 | -0,43 | hold |
| 6 | 5,39 | 3,39 | 0,33 | 2,63 | 0,99 | 2,20 | 0,98 | -0,49 | hold |
| 7 | 5,76 | 3,83 | 0,20 | 2,88 | 0,99 | 1,75 | 0,94 | -0,45 | hold |
| 8 | 5,66 | 4,01 | -0,01 | 2,90 | 0,99 | 0,40 | 0,38 | 0,11 | hold |
| 9 | 4,11 | 3,53 | -0,13 | 2,29 | 0,98 | -1,84 | -0,95 | 1,42 | buy |
| 10 | 1,81 | 2,43 | -0,04 | 1,27 | 0,85 | -3,65 | -1,00 | 1,28 | buy |
| 11 | -0,76 | 0,94 | 0,30 | 0,05 | 0,05 | -4,18 | -1,00 | 0,08 | hold |
| 12 | -2,83 | -0,59 | 0,36 | -1,03 | -0,77 | -5,85 | -1,00 | -1,16 | sell |
| 13 | -3,78 | -1,72 | 0,18 | -1,65 | -0,93 | -7,88 | -1,00 | -1,39 | sell |
| 14 | -3,81 | -2,29 | -0,09 | -1,83 | -0,95 | -9,56 | -1,00 | -1,42 | sell |
| 15 | -1,92 | -1,87 | -0,23 | -1,14 | -0,81 | -8,51 | -1,00 | -1,22 | sell |
| 16 | -0,02 | -0,95 | -0,14 | -0,29 | -0,28 | -6,06 | -1,00 | -0,42 | hold |
| 17 | 1,87 | 0,23 | -0,01 | 0,63 | 0,56 | -3,36 | -1,00 | 0,83 | buy |
| 18 | 3,35 | 1,37 | 0,10 | 1,42 | 0,89 | -1,25 | -0,85 | 1,18 | buy |
| 19 | 4,14 | 2,23 | 0,03 | 1,91 | 0,96 | -0,90 | -0,72 | 1,15 | buy |
| 20 | 4,37 | 2,74 | -0,08 | 2,13 | 0,97 | -1,32 | -0,87 | 1,33 | buy |

Applicando le decisioni al valutatore comune:

| Operazione | Giorno di esecuzione | Prezzo |
|---|---|---|
| buy | 4 | 10,55 |
| sell | 13 | 10,30 |
| buy | 18 | 11,05 |

Valore finale 1007,23 su 1000 (+0,72 per cento), contro 1128,71 (+12,87 per cento) del buy&hold. La rete non batte il buy&hold, e non deve: l'esempio mostra il meccanismo, non una strategia.

**Semplificazioni di questo esempio.** La decisione alla chiusura del giorno `t` è eseguita al prezzo del giorno `t+1`; si compra con tutto il denaro e si vende tutto; azioni frazionarie; nessun costo di transazione, nessuno stop loss né take profit; la decisione dell'ultimo giorno è ignorata; capitale 1000. I pesi sono scelti a mano e non evoluti; i valori degli indicatori sono calcolati su soli 20 giorni.

**Che cosa si vede nella tabella.** I giorni 9 e 10 danno `buy`, ma la posizione è già aperta dal giorno 4 e la decisione non ha effetto (il valutatore compra solo a mercato fermo). La prima operazione nasce invece dalla decisione del giorno 3. I giorni 4-8 sono `hold` perché `h2` sottrae spinta mentre il prezzo è alto e il volume sostenuto. Dal giorno 12 al 15 `y` è sotto -0,5 e dà `sell`; il valutatore vende il giorno 13 e le decisioni successive di vendita non fanno altro. Il giorno 16 `y` risale sopra -0,5 e il segnale torna `hold`. Dal 17 la rete ricompra.

**Che cosa ricorda questa rete.** Nulla da sola: ogni giorno calcola `y` dai tre numeri del giorno. Tutta la memoria del passato sta nelle medie mobili che producono `x1, x2, x3` (la media lenta ricorda circa 1/0,2 = 5 giorni, la veloce circa 2). Questa è la variante «in avanti» della sezione 7.6.

#### 7.3.5 Perché una rete può fare ciò che un punteggio lineare non fa

Il **punteggio lineare** (un'altra forma della guida, capitolo 4) calcola `s = w1*x1 + w2*x2 + w3*x3 + b` e applica le soglie. In un punteggio lineare **ogni ingresso contribuisce sempre allo stesso modo**: aumentare `x3` di una quantità fissa sposta `s` della stessa quantità, qualunque siano `x1` e `x2`.

Nella nostra rete no. Esempio concreto sul dataset: i giorni 6 e 12 hanno un volume simile (`x3` = 0,33 e 0,36). Si confronti `y` con un volume normale (`x3` = 0) e con il volume reale del giorno:

| Giorno | y con x3 = 0 | y con x3 reale | Effetto del volume alto su y |
|---|---|---|---|
| 6 (prezzo alto, in salita) | 0,30 | -0,49 | -0,79 |
| 12 (prezzo basso, in discesa) | -1,16 | -1,16 | 0,00 |

Nella colonna da guardare c'è lo spostamento di `y`, non la decisione.

Lo stesso volume alto sposta di -0,79 il punteggio quando il prezzo è già molto sopra la media, e di 0,00 quando il prezzo è sotto: il neurone `h2` è un **AND** morbido («prezzo alto **e** volume alto»). Un punteggio lineare con i tre stessi ingressi non può farlo: dovrebbe spostare `s` della stessa quantità nei due giorni.

Un secondo effetto è la **saturazione**. Tra i giorni 6 e 7 la somma di `h1` sale da 2,63 a 2,88 (la tendenza si rafforza), ma `h1` resta 0,99 in entrambi. Un punteggio lineare continuerebbe a crescere; la rete dice «già al massimo». Questa è la differenza di fondo: una combinazione di somme pesate e di schiacciamenti può rappresentare regioni curve e interazioni tra ingressi, mentre un punteggio lineare separa solo con un piano.

Un MLP con almeno uno strato nascosto e un'attivazione di questo tipo può approssimare funzioni continue qualsiasi, purché abbia abbastanza neuroni [9]. È una proprietà teorica dell'espressività: non dice che l'algoritmo genetico trovi i pesi giusti, né quanti neuroni servano.

### 7.4 NEAT: far evolvere anche la struttura

#### 7.4.1 L'idea

In un MLP la struttura (3 ingressi, 2 neuroni nascosti, 1 uscita) è decisa da chi progetta e non cambia: evolvono solo i pesi. Con **NEAT** (NeuroEvolution of Augmenting Topologies, neuroevoluzione di topologie crescenti) evolvono insieme i pesi e la **topologia**, cioè quali neuroni esistono e quali collegamenti li uniscono [1]. Il nome dice che la rete cresce: si parte da una rete minima, senza neuroni nascosti, e le mutazioni possono **aggiungere un collegamento** tra due neuroni o **aggiungere un neurone** spezzando un collegamento esistente [1]. Se la complessità non serve, la selezione la elimina; se serve, la rete la tiene.

Un caso notevole: una rete NEAT senza neuroni nascosti, con i tre ingressi collegati direttamente all'uscita, è esattamente un punteggio lineare. NEAT parte da lì e può crescere verso forme più ricche.

#### 7.4.2 Un esempio disegnato, prima e dopo

Il genoma di una rete NEAT è un elenco di **geni di connessione**: ciascuno dice da quale nodo a quale nodo va il collegamento, con quale peso, se è attivo, e porta un **numero di innovazione** (un'etichetta assegnata la prima volta che quel collegamento compare, che non cambia più). Nei disegni, `i1, i2, i3` sono gli ingressi `x1, x2, x3` e `o` l'uscita lineare.

**Rete 0 (minima).** Tre connessioni, nessun neurone nascosto:

```
      i1 ---(0,20)---+
      i2 ---(0,10)---+--> o        y = 0,20*x1 + 0,10*x2 - 0,30*x3
      i3 --(-0,30)---+
```

| Innovazione | Da | A | Peso | Stato |
|---|---|---|---|---|
| 1 | i1 | o | 0,20 | attivo |
| 2 | i2 | o | 0,10 | attivo |
| 3 | i3 | o | -0,30 | attivo |

**Mutazione 1: aggiunta di un neurone `n` sul collegamento 1.** NEAT disattiva la connessione 1 e ne crea due: una da `i1` a `n` con peso 1,0, una da `n` a `o` con il peso della connessione spezzata (0,20) [1]. Il metodo è pensato per ridurre l'effetto iniziale della mutazione: il neurone nuovo cambia un poco la funzione, ma non la sconvolge [1].

```
      i1 ---(1,00)--> [ n ] ---(0,20)--+
      i2 ---------------(0,10)---------+--> o
      i3 ---------------(-0,30)--------+
      (la connessione 1, i1 --> o, resta nel genoma ma disattivata)
```

| Innovazione | Da | A | Peso | Stato |
|---|---|---|---|---|
| 1 | i1 | o | 0,20 | disattivata |
| 2 | i2 | o | 0,10 | attiva |
| 3 | i3 | o | -0,30 | attiva |
| 4 | i1 | n | 1,00 | attiva |
| 5 | n | o | 0,20 | attiva |

**Mutazione 2: aggiunta di un collegamento da `i3` a `n`** con peso 0,50 (innovazione 6):

```
      i1 ---(1,00)--> [ n ] ---(0,20)--+
                        ^              |
      i3 ------(0,50)---+              |
      i2 ---------------(0,10)---------+--> o
      i3 ---------------(-0,30)--------+
```

Il neurone `n` calcola `tanh(1,00*x1 + 0,50*x3)`. Valori di `y` sul dataset giocattolo, con questi pesi (non evoluti, scelti per mostrare il meccanismo):

| Giorno | Rete 0 | Dopo mutazione 1 | Dopo mutazione 2 |
|---|---|---|---|
| 3 | 0,5020 | 0,2527 | 0,2533 |
| 6 | 1,3163 | 0,4381 | 0,4381 |
| 12 | -0,7342 | -0,3668 | -0,3662 |

Si vede che la mutazione 1 non lascia l'uscita invariata: `tanh` schiaccia `x1` (2,22 diventa 0,98, 5,39 diventa 1,00). L'effetto è piccolo per ingressi vicino a zero e più grande per ingressi grandi. La mutazione 2 aggiunge invece un termine nuovo a `n`. NEAT non garantisce che la rete resti uguale: garantisce solo che la perturbazione non sia distruttiva [1].

#### 7.4.3 Il problema dei «genitori incompatibili»

Il crossover (generare un figlio mescolando due genitori) è facile con i pesi di un MLP di forma fissa: si prendono alcuni pesi da un genitore e altri dall'altro. C'è però un problema noto, chiamato **competing conventions** («convenzioni concorrenti») [1].

Due reti possono calcolare **esattamente la stessa funzione** con i neuroni nascosti scritti in ordine diverso. Nel nostro esempio: la rete A ha `h1` (tendenza) in prima posizione e `h2` (prezzo alto con volume) in seconda. La rete A' è la stessa con le due posizioni scambiate: prima riga di pesi `h2`, seconda `h1`, e i pesi di uscita scambiati di conseguenza (-1,0 e 1,5). Il risultato: A e A' prendono le stesse identiche decisioni sul dataset (+0,72 per cento in entrambe).

Un crossover ingenuo, che prende la prima riga da A e la seconda da A', ottiene due volte lo stesso neurone `h1` e perde `h2`. Con i pesi di uscita di A (1,5 e -1,0) l'uscita diventa `y = 0,5*h1 - 1`, sempre sotto circa -0,5: sul dataset il figlio risponde `sell` tutti i giorni e il valutatore non apre nessuna operazione (1000,00, 0,00 per cento). Due genitori buoni producono un figlio inutile solo perché i loro neuroni sono in ordine diverso. Il problema peggiora se le reti hanno anche topologie diverse.

**Come lo affronta NEAT, in parole semplici.** Ogni connessione porta il suo numero di innovazione, assegnato quando compare per la prima volta e mai cambiato. Se due genitori hanno entrambi la connessione con numero 4, sono la stessa connessione, anche se la rete intorno è diversa. Al crossover, NEAT allinea i geni per numero: i geni presenti in entrambi i genitori («corrispondenti») sono ereditati a caso da uno dei due; i geni presenti in uno solo («disgiunti» se stanno in mezzo, «in eccesso» se stanno alla fine) sono ereditati dal genitore più adatto. Un gene disattivato in uno dei genitori ha una certa probabilità di restare disattivato nel figlio [1]. Questo permette il crossover senza analizzare la struttura delle reti.

NEAT aggiunge anche la **speciazione**: le reti con struttura simile sono raggruppate in specie e competono tra loro, così che una struttura nuova, che all'inizio funziona peggio, abbia il tempo di ottimizzarsi prima di essere eliminata [1].

#### 7.4.4 Esempio di crossover NEAT con i numeri

Due genitori con le connessioni dell'esempio precedente. Il genitore P2 è più adatto di P1 (nel dataset giocattolo P2 dà +0,72 per cento, P1 +0,44 per cento: assunzione per l'esempio).

| Innovazione | P1 | P2 | Figlio | Origine |
|---|---|---|---|---|
| 1 (i1 a o) | 0,20, disattiva | 0,60, disattiva | 0,60, disattiva | corrispondente, da P2; resta disattiva (lo è in entrambi) |
| 2 (i2 a o) | 0,10 | -0,20 | 0,10 | corrispondente, da P1 |
| 3 (i3 a o) | -0,30 | -0,10 | -0,10 | corrispondente, da P2 |
| 4 (i1 a n) | 1,00 | 0,40 | 1,00 | corrispondente, da P1 |
| 5 (n a o) | 0,20 | 0,90 | 0,90 | corrispondente, da P2 |
| 6 (i3 a n) | 0,50 | assente | assente | presente solo in P1, scartato (P2 è più adatto) |
| 7 (i2 a n) | assente | 0,80 | 0,80 | presente solo in P2, ereditato |

Il figlio ha cinque connessioni attive. Sul dataset dà `buy` dal giorno 2 al 10, `hold` il giorno 11, `sell` dal 12 al 16, e `buy` dal 17 in poi: operazioni al prezzo di 10,30 (giorno 3), 10,30 (giorno 13 vendita), 11,05 (giorno 18); valore finale 1031,67 (+3,17 per cento). Il figlio non è migliore perché «mescolare funziona»: è l'esito di questo caso con pesi scelti a mano.

**Mutazione dei pesi con i numeri.** Sulla connessione 4 di P1 il peso passa da 1,00 a 0,60: l'uscita del giorno 3 passa da 0,253 a 0,235, quella del giorno 6 resta 0,438, quella del giorno 12 passa da -0,366 a -0,350. Un cambiamento piccolo del peso dà un cambiamento piccolo dell'uscita; qui nessuna decisione cambia sui 20 giorni. È il comportamento tipico della mutazione gaussiana (una piccola perturbazione casuale) sui pesi.

### 7.5 Come evolve la rete: pesi, mutazione e crossover

Nell'MLP di esempio i geni sono gli 11 pesi (e, se si evolvono, le due soglie); la forma è fissa. In NEAT i geni sono i geni di nodo e di connessione, con numero di innovazione; la forma cambia.

**Mutazione sull'MLP.** Prendiamo il bias di `h2` e portiamolo da -5,2 a -3,2, quindi `h2` scatta più facilmente. Le decisioni cambiano nei giorni 3, 4-7, 9 e 18-20: il giorno 3 passa da `buy` a `hold` (`y` = 0,27), i giorni 4-7 passano a `sell` (non ha effetto, nessuna posizione), i giorni 18-20 passano da `buy` a `hold`. Le operazioni diventano: acquisto a 10,80 (giorno 11), vendita a 10,30 (giorno 13), acquisto a 11,05 (giorno 18): valore finale 983,91 (-1,61 per cento). Una mutazione piccola cambia molte decisioni e cambia l'esito.

**Una mutazione senza effetto sull'esito.** Portando il peso di `x3` in `h2` da 6,0 a 4,0 cambia una sola decisione: il giorno 4 passa da `hold` a `buy` (`y` da 0,03 a 0,63). La posizione è già aperta dal giorno 4, quindi il valutatore la ignora: le operazioni e il risultato (1007,23) restano uguali. Alcune mutazioni cambiano la decisione ma non l'esito: fenomeno normale e utile (si chiama mutazione neutra), ma indica che il numero di decisioni non basta a dire quanto un genoma sia diverso.

**Crossover sull'MLP.** Due genitori: A (la rete della sezione 7.3) e B con pesi diversi.

| Parte | A | B |
|---|---|---|
| h1 (x1, x2, x3, bias) | 0,3; 0,3; 0; 0 | 0,5; 0,1; 0; 0,2 |
| h2 (x1, x2, x3, bias) | 1,0; 0; 6,0; -5,2 | 0,8; 0; 5,0; -4,0 |
| Uscita (h1, h2, bias) | 1,5; -1,0; -1,0 | 1,0; -0,6; -0,4 |

Il figlio prende da A la riga di `h1` e il peso di `h1` in uscita (1,5), da B la riga di `h2`, il peso di `h2` in uscita (-0,6) e il bias di uscita (-0,4). Risultato sul dataset: operazioni a 10,30 (giorno 3), 10,30 (giorno 13), 11,05 (giorno 18), valore finale 1031,67 (+3,17 per cento); A dava 1007,23, B 1031,67. Il figlio ha le stesse operazioni di B, ma decisioni giornaliere diverse (per esempio i giorni 4-8 sono `buy` mentre B dà `hold`); non era prevedibile a priori. Il crossover tra neuroni di posizioni corrispondenti funziona qui perché A e B hanno lo stesso significato per `h1` e `h2` (cioè le stesse «convenzioni»); con A' sarebbe fallito (sezione 7.4.3).

### 7.6 Cosa ricorda del passato: ricorrenze e memoria interna (domanda aperta)

#### 7.6.1 Due varianti

Finora la rete è **in avanti** (feedforward): i dati scorrono dagli ingressi verso l'uscita e l'uscita dipende solo dai valori degli ingressi di quel giorno. La memoria del passato è tutta nelle medie mobili che entrano come `x1, x2, x3`. Se domani il motore desse alla rete gli stessi tre numeri, avrebbe la stessa risposta, qualunque cosa fosse successa prima.

Una **connessione ricorrente** fa tornare il valore di un neurone come ingresso dello stesso neurone (o di un altro) **il giorno dopo**. La rete ha così una memoria **sua**: il suo stato interno (i valori dei neuroni al giorno precedente) è informazione che non passa dagli indicatori. NEAT la ammette di natura: [1] dichiara che con le connessioni ricorrenti la memoria è facilmente rappresentata.

| | Rete in avanti (feedforward) | Rete ricorrente |
|---|---|---|
| Da dove viene la memoria | Solo dagli indicatori calcolati a monte | Dagli indicatori e dallo stato interno della rete |
| Stesso ingresso, stessa uscita? | Sì | No: dipende dai giorni precedenti |
| `reset()` (riporta la strategia al giorno zero) | Non fa nulla sulla rete | Deve azzerare i valori dei neuroni |
| Leggibilità | Bassa, ma la rete è una funzione | Più bassa: occorre seguire i giorni uno dopo l'altro |
| In NEAT | Si vieta la ricorrenza | Si permette, come nel metodo originale [1] |

Nota: «feedforward» e «ricorrente» sono **due scelte di progetto**, non due forme diverse. La stessa rete può essere usata in entrambi i modi.

#### 7.6.2 Un esempio: un neurone che si ricorda dei giorni passati

Prendiamo un neurone `r` che guarda soltanto lo scarto del volume `x3` e ha un collegamento a sé stesso:

```
r[t] = tanh( 5*(x3[t] - 0,15) + w*r[t-1] )
```

In parole: `r[t]` è il valore del neurone al giorno `t`; `5*(x3 - 0,15)` è un ingresso che diventa positivo quando il volume sta più del 15 per cento sopra la media; `w` è il peso del collegamento a sé stesso e `r[t-1]` il valore del giorno prima. Al giorno 1 si parte da `r[0]` = 0 (stato azzerato). Con `w` = 0 il neurone non ricorda nulla: legge solo il volume di oggi.

Calcolo del giorno 5 con `w` = 0,8 (valori non arrotondati dalla tabella): ingresso 5*(0,29 - 0,15), circa 0,72; `r[4]` = 0,34 (colonna `w` = 0,8, giorno 4) quindi `r[5]` = tanh(0,72 + 0,8*0,34) = tanh(0,99) = 0,76.

| Giorno | x3 | Ingresso 5*(x3-0,15) | r con w = 0 (nessuna memoria) | r con w = 0,8 | r con w = 1,6 | r con w = 0,8, partendo da 0,9 |
|---|---|---|---|---|---|---|
| 1 | 0,00 | -0,75 | -0,64 | -0,64 | -0,64 | -0,03 |
| 2 | 0,08 | -0,36 | -0,34 | -0,70 | -0,88 | -0,36 |
| 3 | 0,14 | -0,07 | -0,07 | -0,56 | -0,90 | -0,34 |
| 4 | 0,31 | 0,80 | 0,66 | 0,34 | -0,56 | 0,48 |
| 5 | 0,29 | 0,72 | 0,62 | 0,76 | -0,18 | 0,80 |
| 6 | 0,33 | 0,92 | 0,73 | 0,91 | 0,56 | 0,92 |
| 7 | 0,20 | 0,24 | 0,24 | 0,75 | 0,82 | 0,75 |
| 8 | -0,01 | -0,80 | -0,67 | -0,20 | 0,46 | -0,20 |
| 9 | -0,13 | -1,38 | -0,88 | -0,91 | -0,56 | -0,91 |
| 10 | -0,04 | -0,96 | -0,75 | -0,93 | -0,95 | -0,93 |
| 11 | 0,30 | 0,73 | 0,62 | -0,02 | -0,66 | -0,02 |
| 12 | 0,36 | 1,07 | 0,79 | 0,78 | 0,01 | 0,78 |
| 13 | 0,18 | 0,17 | 0,16 | 0,66 | 0,18 | 0,66 |
| 14 | -0,09 | -1,21 | -0,84 | -0,59 | -0,73 | -0,59 |
| 15 | -0,23 | -1,91 | -0,96 | -0,98 | -1,00 | -0,98 |
| 16 | -0,14 | -1,44 | -0,89 | -0,98 | -1,00 | -0,98 |
| 17 | -0,01 | -0,78 | -0,65 | -0,91 | -0,98 | -0,91 |
| 18 | 0,10 | -0,25 | -0,25 | -0,75 | -0,95 | -0,75 |
| 19 | 0,03 | -0,61 | -0,55 | -0,84 | -0,97 | -0,84 |
| 20 | -0,08 | -1,16 | -0,82 | -0,95 | -0,99 | -0,95 |

**Che cosa si vede.**

- Giorni 4-6, volume alto. Con `w` = 0 il neurone segue il volume del giorno (0,66; 0,62; 0,73). Con `w` = 0,8 parte più piano (0,34) ma poi continua a salire (0,76; 0,91), perché somma l'ingresso nuovo al valore di ieri.
- Giorno 7, volume appena sopra la norma (`x3` = 0,20). Con `w` = 0 il neurone cala a 0,24; con `w` = 0,8 resta a 0,75: «si ricorda» che nei tre giorni precedenti il volume era alto. Al giorno 8, con volume normale (`x3` = -0,01), vale -0,20 con memoria e -0,67 senza.
- Giorni 11-13, un nuovo episodio di volume alto (`x3` = 0,30; 0,36; 0,18). Il giorno 11 il neurone con memoria vale -0,02 (esce da giorni a volume basso) mentre senza memoria vale 0,62; il giorno 13, con volume in calo, vale 0,66 con memoria e 0,16 senza. La memoria **ritarda** la risposta al primo giorno di un episodio e **prolunga** quella dopo la fine.
- Ultima colonna. Se lo stato iniziale non fosse azzerato e partisse da 0,9, per qualche giorno il neurone si comporterebbe in modo diverso (giorno 1: -0,03 contro -0,64), ma dal giorno 7 le due colonne coincidono a due decimali. Con `w` = 0,8 l'errore di partenza si dimentica presto; con memorie più lunghe durerebbe di più [ipotesi]. Per questo `reset()` deve azzerare lo stato.
- Colonna `w` = 1,6. Quando il peso su se stesso è grande, il neurone è guidato più dal proprio passato che dai dati: al giorno 9, con un ingresso -1,38, vale -0,56 (con `w` = 0,8 vale -0,91), perché trascina i valori alti dei giorni precedenti. Pesi ricorrenti grandi rendono la risposta lenta e possono dare dinamiche instabili [ipotesi].

#### 7.6.3 La rete intera con una ricorrenza

Rifacciamo la rete della sezione 7.3 con un solo cambiamento: il neurone `h2` somma anche 0,8 volte il suo valore del giorno prima (stato iniziale 0). Gli altri pesi non cambiano.

| Giorno | somma h2 | h2 | y | Decisione |
|---|---|---|---|---|
| 1 | -5,20 | -1,00 | -0,00 | hold |
| 2 | -4,73 | -1,00 | 0,48 | hold |
| 3 | -2,96 | -0,99 | 1,11 | buy |
| 4 | -0,41 | -0,38 | 0,78 | buy |
| 5 | 1,15 | 0,82 | -0,35 | hold |
| 6 | 2,85 | 0,99 | -0,51 | sell |
| 7 | 2,54 | 0,99 | -0,50 | hold |
| 8 | 1,19 | 0,83 | -0,34 | hold |
| 9 | -1,18 | -0,83 | 1,30 | buy |
| 10 | -4,31 | -1,00 | 1,28 | buy |
| 11 | -4,98 | -1,00 | 0,08 | hold |
| 12 | -6,65 | -1,00 | -1,16 | sell |
| 13 | -8,68 | -1,00 | -1,39 | sell |
| 14 | -10,36 | -1,00 | -1,42 | sell |
| 15 | -9,31 | -1,00 | -1,22 | sell |
| 16 | -6,86 | -1,00 | -0,42 | hold |
| 17 | -4,16 | -1,00 | 0,84 | buy |
| 18 | -2,05 | -0,97 | 1,30 | buy |
| 19 | -1,67 | -0,93 | 1,37 | buy |
| 20 | -2,07 | -0,97 | 1,43 | buy |

Le decisioni cambiano in due giorni rispetto alla rete in avanti: il giorno 4 diventa `buy` (prima `hold`), perché `h2` ricorda i giorni precedenti a volume normale (-0,38 invece di +0,37); il giorno 6 diventa `sell` (prima `hold`) per un soffio: `y` scende da -0,49 a -0,51, appena sotto la soglia. Operazioni: buy a 10,55 (giorno 4), sell a 11,20 (giorno 7), buy a 11,10 (giorno 10), sell a 10,30 (giorno 13), buy a 11,05 (giorno 18). Valore finale 1016,30 (+1,63 per cento) contro 1007,23 (+0,72 per cento) della rete in avanti. Non vuol dire che la memoria «migliori» la strategia: è l'esito di un caso con pesi scelti a mano.

#### 7.6.4 Che cosa si guadagna e che cosa si perde

**Si guadagna** una memoria su misura: la rete può costruire da sola una persistenza che gli indicatori non offrono (per esempio «il volume è stato alto negli ultimi giorni», con la durata decisa da `w`).

**Si perde** in leggibilità e in controllo. Il valore di `r` al giorno `t` dipende da tutti i giorni precedenti, quindi per capire una decisione occorre ripercorrere la sequenza. Il genoma non dice più «per questi tre numeri, questa risposta»: dice «per questi tre numeri e per questo stato interno». Lo **stato nascosto** (valori dei neuroni che il motore non vede) deve essere azzerato a ogni nuovo giorno zero e può amplificare piccole variazioni. Una mutazione di un peso ricorrente cambia il comportamento su tutti i giorni successivi, non solo oggi: per l'algoritmo genetico il paesaggio da esplorare è meno regolare [ipotesi].

#### 7.6.5 La domanda a Luca

La domanda 2 della rassegna, in forma semplice:

> **La rete deve poter avere una memoria sua, oltre a quella delle medie mobili?**
>
> - **No:** la rete legge i soli indicatori del giorno. È più semplice da testare e da azzerare; la memoria dipende dagli indicatori scelti (ricerca R2).
> - **Sì:** la rete può ricordare i giorni passati con i propri neuroni. Ha più possibilità, ma è più difficile da leggere e da far evolvere.

La scelta non è del capitolo: è una scelta di progetto e dipende da quanto peso Luca dà alla leggibilità rispetto alla flessibilità (domanda 3).

#### 7.6.6 Nota di contrasto: reservoir computing

Una famiglia vicina è il **reservoir computing** (echo state network): una rete ricorrente di molti neuroni con pesi **casuali e fissi** (il «serbatoio»), e un solo strato di uscita, lineare, i cui pesi si addestrano [17]. L'idea è evitare di far evolvere o addestrare le ricorrenze, che sono la parte più difficile, tenendo solo la lettura da addestrare. Il costo è uno stato di centinaia di numeri e un'interpretabilità molto bassa [ipotesi]. Non ha una scheda: è citata come forma di contrasto. [17] è una pagina di un gruppo di ricerca, non una rassegna con revisione; nessuna fonte letta tratta l'uso del reservoir con un algoritmo genetico nel trading.

### 7.7 Punti di forza e debolezze

#### 7.7.1 Domande e risposte

**Quanto sa esprimere?** Molto. Un MLP con uno strato nascosto sufficiente approssima funzioni continue qualsiasi [9]. Nel dataset: una congiunzione («prezzo alto e volume alto») e una saturazione, impossibili per un punteggio lineare (sezione 7.3.5). Con 2 neuroni nascosti l'esempio è già diverso.

**Quanto è grande lo spazio di ricerca?** Si contano i pesi: ingressi per neuroni nascosti, più i bias nascosti, più nascosti per uscite, più i bias di uscita.

| Rete | Calcolo | Pesi |
|---|---|---|
| Esempio di questo capitolo (3 ingressi, 2 nascosti, 1 uscita) | 3*2 + 2 + 2*1 + 1 | 11 |
| Rete della rassegna (6 ingressi, 4 nascosti, 3 uscite) | 6*4 + 4 + 4*3 + 3 | 43 |
| 6 ingressi, 8 nascosti, 3 uscite | 6*8 + 8 + 8*3 + 3 | 83 |
| 6 ingressi, 16 nascosti, 3 uscite | 6*16 + 16 + 16*3 + 3 | 163 |
| NEAT di partenza (6 ingressi diretti a 1 uscita) | 6 + 1 | 7, ma poi cresce |

Per confronto, il punteggio lineare con 6 ingressi ha 9 numeri (6 pesi, un bias, 2 soglie). Una rete di 43 pesi, su 2517 giorni di un solo titolo, ha molta libertà di adattarsi anche al rumore (il **sovradattamento**, o overfitting: adattarsi ai dati di addestramento compresi gli accidenti casuali e funzionare peggio su dati nuovi) [ipotesi]. Il confronto con le altre forme e come limitare il rischio sono materia delle ricerche R5 e R6, e la validazione su dati tenuti fuori da sola non basta quando si provano molte configurazioni [4]. In NEAT lo spazio è grande per costruzione (struttura e pesi), anche se la crescita è graduale [1].

**Si capisce perché decide così?** Poco. Nel nostro esempio i due neuroni hanno un nome (tendenza e «prezzo alto con volume»), ma gliel'abbiamo dato **dopo**, guardando i pesi scelti a mano. In una rete evoluta, un neurone nascosto è una miscela di ingressi senza un significato dichiarato, e il significato è distribuito tra molti pesi. Per spiegare una decisione bisogna rifare il calcolo di giorno 3 o 6 come nella sezione 7.3.3, e anche così non si ha una «ragione», solo un calcolo. Con una ricorrenza (sezione 7.6) occorre seguire tutti i giorni precedenti. È la forma meno leggibile tra quelle presentate [ipotesi].

**Quanto costa calcolarla?** Poco. L'esempio ha circa 8 prodotti, 8 somme e 2 `tanh` per giorno; la rete da 43 pesi circa 36 prodotti, 43 somme e 4 attivazioni `tanh` (più 3 uscite lineari): sono conteggi a mano dell'autore, non misure. Su 2517 giorni è trascurabile; il costo vero è il numero di reti da valutare nella popolazione e nelle generazioni **[ipotesi]**.

**Si mescola e si muta bene?** La mutazione sì: perturbare un peso dà un cambiamento piccolo dell'uscita. Il crossover è delicato: il problema delle convenzioni concorrenti rende il crossover ingenuo tra MLP distruttivo (sezione 7.4.3); NEAT lo risolve con i numeri di innovazione, a costo di una macchina più complessa da implementare [1].

**Si adatta al nostro motore?** Con adattamenti, descritti nella sezione 7.8.

#### 7.7.2 Etichette (`labels`)

Il contratto di strategia richiede una lista finita di etichette (gli «stati» da mostrare). La rete produce un numero continuo, non uno stato: bisogna ricavare le etichette dall'uscita. Il modo più semplice sono le **fasce** definite dalle stesse soglie dell'azione, cioè tre etichette: `sell` (`y` < -0,5), `hold` (tra -0,5 e 0,5), `buy` (`y` > 0,5). Nell'esempio, il giorno 6 sta in `hold` (`y` = -0,49), il giorno 12 in `sell` (`y` = -1,16).

Si può fare di più: fasce più fini (per esempio cinque: vendi forte, vendi, aspetta, compra, compra forte) danno più informazione, a costo di soglie in più. In entrambi i casi la perdita è nell'etichetta, non nel numero: il valore continuo `y` si può comunque esporre in `describe().indicators`. Nessuna fascia ha un significato «naturale» come lo ha uno stato di una macchina a stati: è una richiesta di estensione del contratto da trattare in E2 (sezione «Il contratto di strategia, forma per forma» della rassegna).

### 7.8 Come si integra nel nostro motore

In parole semplici: ogni giorno il motore dà alla rete i dati (prezzo, volume e gli indicatori che R2 deciderà), la rete calcola `y`, le soglie lo trasformano in `buy`, `sell` o `hold`, e il motore esegue l'ordine il giorno dopo.

- **Feedforward.** Si implementano `initIndicators()` / `updateIndicators()` (le medie mobili) e `decide()` (rete più soglie) in una classe costruita su `StrategyIndividual` (`src/engine/strategy.js`). `resetIndicators()` azzera solo le medie.
- **Ricorrente.** In più, la classe tiene i valori dei neuroni del giorno prima, e `resetIndicators()` deve riportarli allo stato iniziale, come per i filtri IIR (`src/vendor/consilium/algorithm.js`, righe 342-358).
- **`labels`.** Fasce dell'uscita, come in 7.7.2.
- **`describe()`.** Può esporre `y` e le uscite dei neuroni nascosti (numeri finiti).
- **`serialize()`.** MLP: l'elenco dei pesi e delle soglie, come JSON. NEAT: i geni di nodo e di connessione con i numeri di innovazione. Entrambi sono dati semplici, adatti a essere salvati.
- **`crossover` e `mutate`.** Non richiesti da `assertStrategy`, ma il GA di Consilium li chiama (`src/vendor/consilium/ga.js`, righe 116-125, 345-351): vanno scritti. Per l'MLP sono semplici (con i limiti della sezione 7.4.3); per NEAT sono la parte più lunga da realizzare (numeri di innovazione, speciazione) [1] e non esistono nel codice attuale [ipotesi].
- **Parte che si adatta meno bene.** La mancanza di etichette naturali (7.7.2) e, per NEAT, la struttura del genoma, che non è un vettore di numeri di lunghezza fissa come quello dei genomi attuali.

### 7.9 Cosa dice la letteratura

- **NEAT.** Stanley e Miikkulainen (2002) descrivono NEAT e dichiarano di risolvere con i numeri di innovazione il problema delle convenzioni concorrenti, di proteggere le innovazioni con la speciazione e di far crescere la topologia da reti minime [1]. Il testo è stato letto per le parti citate; gli esperimenti sono su problemi di controllo, non sul trading.
- **Espressività degli MLP.** Hornik, Stinchcombe e White (1989) mostrano che reti in avanti con uno strato nascosto e attivazioni a schiacciamento approssimano funzioni continue qualsiasi, se hanno abbastanza neuroni [9] (letto abstract e teoremi). È un risultato di esistenza, non una promessa di apprendimento.
- **Neuroevoluzione nel trading.** Non risulta una fonte letta sull'uso di NEAT o di reti ricorrenti con un algoritmo genetico per strategie di trading azionario: **non accertato**. La rassegna [7] segnala una forte concentrazione di studi su GA e GP per regole di trading (letto l'abstract), che non riguarda le reti.
- **Sovradattamento.** [4] sostiene che con molti tentativi la sola validazione su dati tenuti fuori non basta; vale per tutte le forme, in particolare per quelle con molti parametri.
- **Reservoir computing.** [17] (pagina di un gruppo di ricerca, non una rassegna con revisione).

### 7.10 In breve

- Una rete è una catena di somme pesate e di schiacciamenti (`tanh`); i pesi sono i geni, e l'evoluzione li cambia senza discesa del gradiente.
- Può esprimere ciò che un punteggio lineare non può (congiunzioni tra indicatori, saturazione): nell'esempio, lo stesso volume alto sposta `y` di -0,79 nel giorno 6 e di 0,00 nel giorno 12.
- Costa il prezzo di molti pesi (11 nell'esempio piccolo, 43 in una rete da 6 ingressi e 4 neuroni nascosti), di una leggibilità minima e di un crossover delicato (convenzioni concorrenti).
- NEAT fa crescere anche la struttura e risolve i genitori incompatibili con i numeri di innovazione, ma è più complesso da realizzare.
- Domanda aperta per Luca: la rete può avere una memoria sua (ricorrenze) oltre a quella degli indicatori? La risposta cambia leggibilità, `reset()` e difficoltà di evoluzione; il capitolo non sceglie.
- I numeri dell'esempio sono inventati e non dicono nulla sul funzionamento reale.

## 8. La logica fuzzy

Questo capitolo spiega una possibile forma per il genoma: un sistema a regole in logica fuzzy (in italiano «logica sfumata»). Non occorre conoscere la logica fuzzy: si parte da zero. I numeri dell'esempio sono inventati (dataset giocattolo di 20 giorni, comune a tutti i capitoli) e servono a mostrare il meccanismo. Non dicono nulla su come questa forma si comporterebbe sui mercati reali, e non c'è nessuna promessa di rendimento.

### 8.1 In una frase e un'analogia

**In una frase.** La logica fuzzy sostituisce il «sì o no» con un «quanto»: invece di dire «il prezzo è alto: sì o no», si dice «il prezzo è alto al 70%», e le regole del tipo «se il prezzo è alto e il volume è basso allora vendi» lavorano con questi gradi.

**Analogia.** Si chiede a una persona «fa caldo?». Una risposta da programmatore sarebbe `temperatura > 25`: a 25,1 gradi la risposta è sì, a 24,9 è no, anche se la differenza è impercettibile. Una persona risponde «un po'» a 22 gradi, «abbastanza» a 25, «molto» a 30. Il **grado di appartenenza** è questo «quanto»: un numero tra 0 (per niente) e 1 (del tutto). Con 24,9 gradi il grado di «fa caldo» è quasi uguale a quello di 25,1, e non c'è nessun salto.

Una scheda di termini che servono subito:

- **Variabile linguistica.** Una grandezza descritta a parole invece che con un numero, per esempio «distanza del prezzo dalla media», con valori come «bassa», «media», «alta».
- **Insieme fuzzy.** Uno di quei valori («alta»), definito da una funzione che a ogni numero associa un grado.
- **Funzione di appartenenza.** La funzione che dà il grado: da un numero (per esempio 2,2%) a un valore tra 0 e 1 (per esempio 0,74).
- **Fuzzificazione.** Il passaggio da un numero ai gradi di appartenenza.
- **Defuzzificazione.** Il passaggio inverso: da più gradi a un solo numero.

### 8.2 Come funziona

Un sistema fuzzy a regole ha cinque passaggi. Si descrivono uno alla volta, con numeri.

#### 8.2.1 Gli ingressi: indicatori già noti

Il sistema non guarda i prezzi grezzi. Riceve **indicatori**, cioè numeri calcolati dai prezzi e dai volumi passati. Nell'esempio sono due.

La **media mobile esponenziale** (EMA) è una media che dà più peso ai dati recenti. Si calcola giorno per giorno come nel codice di Consilium:

```
e[t] = e[t-1] * (1 - c) + x[t] * c
```

In parole: la media di oggi è la media di ieri, corretta di una frazione `c` verso il dato nuovo `x[t]`. Con `c = 0,2` il dato nuovo pesa il 20% e la storia l'80%: la media è lenta, ricorda circa 1/c = 5 giorni. Nel dataset, la media del prezzo il giorno 1 è 10,00 (il primo dato) e il giorno 2 è `10,00 * 0,8 + 10,10 * 0,2 = 10,02`.

Gli ingressi del sistema sono i due numeri del capitolo 1 (`D` è `x1`, `R` è `x3` più 1):

- **D**, la distanza percentuale del prezzo dalla media lenta: `D = (prezzo - EMA del prezzo) / EMA del prezzo * 100`. Il giorno 2: `(10,10 - 10,02) / 10,02 * 100 = 0,80`. Un D positivo vuol dire che il prezzo sta sopra la sua media (il titolo sale rispetto al recente), negativo che sta sotto.
- **R**, il rapporto del volume con la sua media: `R = volume / EMA del volume`, con `c = 0,2` anche per il volume. Un R sopra 1 vuol dire che oggi si è scambiato più del solito. Il giorno 2: volume 1100, media del volume 1020, `R = 1,08`.

Il **volume** è il numero di azioni scambiate in un giorno.

#### 8.2.2 Le funzioni di appartenenza

Per ogni ingresso si definiscono tre insiemi: «bassa», «media», «alta». Ognuno è una funzione a forma di rampa, di triangolo o di trapezio, descritta da pochi numeri. Nell'esempio, per D:

```
bassa:  vale 1 fino a D = -3, scende linearmente fino a 0 in D = 0
media:  triangolo con piede sinistro -3, picco 0 (valore 1), piede destro 3
alta:   vale 0 fino a D = 0, sale linearmente fino a 1 in D = 3, poi resta 1
```

In forma di disegno (b = bassa, m = media, a = alta; ogni lettera segna dove la funzione passa a quel livello):

```
1.00 |      bbbbbbbbbbbbb           m           aaaaaaaaaaaaa
0.67 |                      b   m       m   a
0.33 |                      m   b       a   m
0.00 +------+-----------+-----------+-----------+-----------+-> D (%)
           -6          -3           0           3           6
```

Un valore di D cade quasi sempre in due insiemi contemporaneamente, con due gradi diversi. Esempio con D = 2,22 (il giorno 3):

- alta: `2,22 / 3 = 0,74` (la rampa sale da 0 in D=0 a 1 in D=3);
- media: lato destro del triangolo, `(3 - 2,22) / 3 = 0,26`;
- bassa: 0.

Si legge: «D = 2,22 è alta al 74% e media al 26%». I tre gradi non devono sommare a 1; qui lo fanno per come sono disegnati i triangoli, ma in generale non è richiesto.

Per R si usano tre insiemi con numeri diversi:

```
bassa:  1 fino a R = 0,8, scende a 0 in R = 1,0
media:  triangolo con piede sinistro 0,8, picco 1,0, piede destro 1,2
alta:   0 fino a R = 1,0, sale a 1 in R = 1,2, poi resta 1
```

Le tre forme in codice (chiamate `low`, `tri` e `high` come nello script dell'esempio):

```
low(x, e, z)   = 1 se x <= e;  0 se x >= z;  altrimenti (z - x) / (z - e)
tri(x, a, b, c)= 0 se x <= a o x >= c; (x - a)/(b - a) se x <= b; altrimenti (c - x)/(c - b)
high(x, s, e)  = 0 se x <= s;  1 se x >= e;  altrimenti (x - s) / (e - s)
```

In parole: ognuna è una retta spezzata che parte da 0 o da 1 e arriva a 1 o a 0 in un tratto breve. Quel tratto è la zona «sfumata».

#### 8.2.3 Le regole e la combinazione dei gradi

Una **regola** ha la forma «se condizione allora conclusione». Le condizioni sono frasi sugli ingressi, unite da «e» e da «o». Per ottenere un grado dalla frase si usa:

- **«e»: il minimo** dei gradi. Se «D è alta» vale 0,74 e «R è alta» vale 0,68, «D alta e R alta» vale `min(0,74; 0,68) = 0,68`. Si legge: la frase è vera quanto la sua parte meno vera.
- **«o»: il massimo** dei gradi. «R è media o R è alta», con 0,32 e 0,68, vale `max(0,32; 0,68) = 0,68`.

Sono la scelta più semplice e la più usata; altre combinazioni (prodotto, somma limitata) esistono, ma non sono necessarie a capire il meccanismo [ipotesi, fonte non letta].

Il grado della condizione è il **grado di attivazione** della regola: indica quanto la regola «conta» oggi.

#### 8.2.4 Aggregazione e defuzzificazione

Ogni regola ha una conclusione, che è un insieme fuzzy di uscita. Nell'esempio le uscite sono tre: **Vendi**, **Neutro**, **Compra**, ognuna con un **centro**, cioè un numero che la rappresenta: Vendi = -1, Neutro = 0, Compra = +1.

Due passaggi:

1. **Aggregazione.** Più regole possono avere la stessa conclusione. Per ogni uscita si prende il **massimo** dei gradi di attivazione delle regole che la concludono. Esempio: se due regole concludono «Compra» con 0,3 e 0,6, il grado di «Compra» è 0,6.
2. **Defuzzificazione.** Da questi gradi si ricava un solo numero con la **media pesata dei centri**:

```
uscita = somma( grado_uscita * centro_uscita ) / somma( grado_uscita )
```

In parole: ogni uscita «tira» il risultato verso il proprio centro con la propria forza. Esempio con Compra 0,68, Neutro 0,26, Vendi 0: `(0,68 * 1 + 0,26 * 0 + 0 * (-1)) / (0,68 + 0,26 + 0) = 0,68 / 0,94 = 0,72`. Il risultato sta tra -1 e +1: vicino a +1 vuol dire «compra con convinzione», vicino a 0 «aspetta», vicino a -1 «vendi».

Questa è una versione semplificata (le conclusioni sono numeri, non figure), nota in letteratura con altri nomi e varianti [ipotesi, fonte non letta]. Basta per capire l'idea. Se nessuna regola è attiva, il denominatore vale 0: nell'implementazione si decide che l'uscita sia 0 (aspetta).

#### 8.2.5 Dalle uscite a buy, sell, hold: le soglie

Un numero tra -1 e +1 va tradotto in un'azione. Si usano due soglie:

```
uscita >  0,3  ->  buy
uscita < -0,3  ->  sell
altrimenti     ->  hold
```

La soglia 0,3 è un numero del genoma (come per il punteggio lineare degli altri capitoli). Il passaggio dai gradi alle azioni ha quindi un salto finale, come in ogni sistema che deve decidere; ma la parte che precede è graduale (vedi 8.3.4).

### 8.3 Esempio applicato al dataset giocattolo

#### 8.3.1 L'istanza

Ingressi: D e R come in 8.2.1, con `c = 0,2` per entrambe le medie. Insiemi: quelli di 8.2.2. Regole:

```
Regola 1: se D è alta  e (R è media o R è alta)  allora Compra
Regola 2: se D è alta  e  R è bassa              allora Neutro
Regola 3: se D è media                           allora Neutro
Regola 4: se D è bassa e (R è media o R è alta)  allora Vendi
Regola 5: se D è bassa e  R è bassa              allora Neutro
```

Lettura in italiano: se il prezzo è sopra la media e il volume è normale o alto, il rialzo è sostenuto e conviene comprare; se è sopra la media ma il volume è basso, il movimento è poco convincente e si aspetta; vicino alla media si aspetta; sotto la media con volume normale o alto si vende; sotto la media con poco volume si aspetta. Sono regole scelte per l'esempio, non regole consigliate.

Uscite e centri: Vendi = -1, Neutro = 0, Compra = +1. Soglie: ±0,3.

**Semplificazioni di questo esempio.** Decisione alla chiusura del giorno t, eseguita al prezzo del giorno t+1. Compra con tutto il denaro, vende tutto. Azioni frazionarie. Nessun costo di transazione, nessuno stop loss (soglia di perdita che chiude da sola la posizione) né take profit (soglia di guadagno che la chiude). La decisione dell'ultimo giorno è ignorata. Capitale 1000. Un `buy` con la posizione già aperta e un `sell` a posizione chiusa non fanno nulla. Numeri arrotondati a due decimali nelle tabelle (i calcoli interni no). Dataset e valutatore sono quelli comuni del capitolo 1.

#### 8.3.2 Calcolo dettagliato di tre giorni

Il prezzo e il volume del giorno e le due medie lente (c = 0,2) danno gli ingressi. Si seguono tre giorni scelti perché diversi: il 3 (inizio del rialzo), il 9 (il prezzo ha già girato ma resta sopra la media), il 12 (ribasso con volume alto).

**Giorno 3.** Prezzo 10,30; EMA del prezzo 10,076; `D = (10,30 - 10,076) / 10,076 * 100 = 2,22`. Volume 1200; EMA del volume 1056,0; `R = 1200 / 1056,0 = 1,14`.

- Gradi di D: bassa 0; media `(3 - 2,22)/3 = 0,26`; alta `2,22/3 = 0,74`.
- Gradi di R: bassa 0; media `(1,2 - 1,14)/0,2 = 0,32`; alta `(1,14 - 1,0)/0,2 = 0,68`.
- Regola 1: D alta 0,74 e (R media 0,32 o R alta 0,68). L'«o» dà `max(0,32; 0,68) = 0,68`; l'«e» dà `min(0,74; 0,68) = 0,68`.
- Regola 2: D alta 0,74 e R bassa 0: `min = 0`.
- Regola 3: D media = 0,26.
- Regole 4 e 5: D bassa = 0, quindi 0.
- Aggregazione: Compra = 0,68 (regola 1); Neutro = `max(0; 0,26; 0) = 0,26`; Vendi = 0.
- Defuzzificazione: `(0,68 * 1 + 0,26 * 0) / (0,68 + 0,26) = 0,72`.
- Soglia: 0,72 > 0,3, quindi **buy**.

**Giorno 9.** Prezzo 11,30; EMA del prezzo 10,8535; `D = 4,11`. Volume 1200; EMA del volume 1372,12; `R = 0,87`.

- D: bassa 0; media 0; alta 1 (oltre 3 la rampa è a 1).
- R: bassa `(1,0 - 0,87)/0,2 = 0,63`; media `(0,87 - 0,8)/0,2 = 0,37`; alta 0.
- Regola 1: D alta 1 e (R media 0,37 o R alta 0): `min(1; 0,37) = 0,37`.
- Regola 2: D alta 1 e R bassa 0,63: `0,63`.
- Regole 3, 4, 5: 0.
- Aggregazione: Compra 0,37; Neutro 0,63; Vendi 0.
- Defuzzificazione: `0,37 / (0,37 + 0,63) = 0,37`.
- Soglia: 0,37 > 0,3, quindi **buy**, ma di poco. Il prezzo ha già cominciato a scendere (era 11,35 il giorno 8, 11,30 il 9), e il sistema, che guarda la distanza dalla media lenta, se ne accorge solo in parte: il volume basso (R = 0,87) ha ridotto la spinta da 1 a 0,37.

**Giorno 12.** Prezzo 10,50; EMA del prezzo 10,8058; `D = -2,83`. Volume 2200; EMA del volume 1612,93; `R = 1,36`.

- D: bassa `(0 + 2,83)/3 = 0,94`; media `(-2,83 + 3)/3 = 0,06`; alta 0.
- R: bassa 0; media 0; alta 1.
- Regola 3: 0,06. Regola 4: D bassa 0,94 e (R media 0 o R alta 1): `min(0,94; 1) = 0,94`. Le regole 1, 2 e 5 valgono 0.
- Aggregazione: Vendi 0,94; Neutro 0,06; Compra 0.
- Defuzzificazione: `(0,94 * (-1) + 0,06 * 0) / (0,94 + 0,06) = -0,94`.
- Soglia: -0,94 < -0,3, quindi **sell**.

#### 8.3.3 Tabella dei 20 giorni

Colonne: giorno `g`, prezzo, `D` in percentuale, `R`, i gradi di D e di R (bassa/media/alta), i gradi di attivazione delle regole 1-5, i gradi aggregati delle uscite (Compra/Neutro/Vendi), l'uscita defuzzificata e la decisione. Valori arrotondati a due decimali.

| g | prezzo | D (%) | R | D: bassa/media/alta | R: bassa/media/alta | regole 1-5 | Compra/Neutro/Vendi | uscita | decisione |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 10,00 | 0,00 | 1,00 | 0,00/1,00/0,00 | 0,00/1,00/0,00 | 0,00/0,00/1,00/0,00/0,00 | 0,00/1,00/0,00 | 0,00 | hold |
| 2 | 10,10 | 0,80 | 1,08 | 0,00/0,73/0,27 | 0,00/0,61/0,39 | 0,27/0,00/0,73/0,00/0,00 | 0,27/0,73/0,00 | 0,27 | hold |
| 3 | 10,30 | 2,22 | 1,14 | 0,00/0,26/0,74 | 0,00/0,32/0,68 | 0,68/0,00/0,26/0,00/0,00 | 0,68/0,26/0,00 | 0,72 | buy |
| 4 | 10,55 | 3,73 | 1,31 | 0,00/0,00/1,00 | 0,00/0,00/1,00 | 1,00/0,00/0,00/0,00/0,00 | 1,00/0,00/0,00 | 1,00 | buy |
| 5 | 10,80 | 4,89 | 1,29 | 0,00/0,00/1,00 | 0,00/0,00/1,00 | 1,00/0,00/0,00/0,00/0,00 | 1,00/0,00/0,00 | 1,00 | buy |
| 6 | 11,00 | 5,39 | 1,33 | 0,00/0,00/1,00 | 0,00/0,00/1,00 | 1,00/0,00/0,00/0,00/0,00 | 1,00/0,00/0,00 | 1,00 | buy |
| 7 | 11,20 | 5,76 | 1,20 | 0,00/0,00/1,00 | 0,00/0,01/0,99 | 0,99/0,00/0,00/0,00/0,00 | 0,99/0,00/0,00 | 1,00 | buy |
| 8 | 11,35 | 5,66 | 0,99 | 0,00/0,00/1,00 | 0,05/0,95/0,00 | 0,95/0,05/0,00/0,00/0,00 | 0,95/0,05/0,00 | 0,95 | buy |
| 9 | 11,30 | 4,11 | 0,87 | 0,00/0,00/1,00 | 0,63/0,37/0,00 | 0,37/0,63/0,00/0,00/0,00 | 0,37/0,63/0,00 | 0,37 | buy |
| 10 | 11,10 | 1,81 | 0,96 | 0,00/0,40/0,60 | 0,21/0,79/0,00 | 0,60/0,21/0,40/0,00/0,00 | 0,60/0,40/0,00 | 0,60 | buy |
| 11 | 10,80 | -0,76 | 1,30 | 0,25/0,75/0,00 | 0,00/0,00/1,00 | 0,00/0,00/0,75/0,25/0,00 | 0,00/0,75/0,25 | -0,25 | hold |
| 12 | 10,50 | -2,83 | 1,36 | 0,94/0,06/0,00 | 0,00/0,00/1,00 | 0,00/0,00/0,06/0,94/0,00 | 0,00/0,06/0,94 | -0,94 | sell |
| 13 | 10,30 | -3,78 | 1,18 | 1,00/0,00/0,00 | 0,00/0,08/0,92 | 0,00/0,00/0,00/0,92/0,00 | 0,00/0,00/0,92 | -1,00 | sell |
| 14 | 10,20 | -3,81 | 0,91 | 1,00/0,00/0,00 | 0,46/0,54/0,00 | 0,00/0,00/0,00/0,54/0,46 | 0,00/0,46/0,54 | -0,54 | sell |
| 15 | 10,35 | -1,92 | 0,77 | 0,64/0,36/0,00 | 1,00/0,00/0,00 | 0,00/0,00/0,36/0,00/0,64 | 0,00/0,64/0,00 | 0,00 | hold |
| 16 | 10,55 | -0,02 | 0,86 | 0,01/0,99/0,00 | 0,69/0,31/0,00 | 0,00/0,00/0,99/0,01/0,01 | 0,00/0,99/0,01 | -0,01 | hold |
| 17 | 10,80 | 1,87 | 0,99 | 0,00/0,38/0,62 | 0,03/0,97/0,00 | 0,62/0,03/0,38/0,00/0,00 | 0,62/0,38/0,00 | 0,62 | buy |
| 18 | 11,05 | 3,35 | 1,10 | 0,00/0,00/1,00 | 0,00/0,50/0,50 | 0,50/0,00/0,00/0,00/0,00 | 0,50/0,00/0,00 | 1,00 | buy |
| 19 | 11,25 | 4,14 | 1,03 | 0,00/0,00/1,00 | 0,00/0,86/0,14 | 0,86/0,00/0,00/0,00/0,00 | 0,86/0,00/0,00 | 1,00 | buy |
| 20 | 11,40 | 4,37 | 0,92 | 0,00/0,00/1,00 | 0,41/0,59/0,00 | 0,59/0,41/0,00/0,00/0,00 | 0,59/0,41/0,00 | 0,59 | buy |

Decisioni: hold nei giorni 1-2, buy nel 3-10, hold nell'11, sell nel 12-14, hold nel 15-16, buy nel 17-20.

**Risultato col valutatore.** Il giorno 3 la decisione è buy, eseguita il giorno 4 a 10,55. Il giorno 12 la decisione è sell, eseguita il giorno 13 a 10,30. Il giorno 17 buy, eseguita il giorno 18 a 11,05. Valore finale **1007,23, rendimento +0,72%**. Il riferimento buy&hold (comprare il giorno 1 e tenere) dà +12,87%, 1128,71: l'esempio non lo batte, e non deve. Il sistema entra tardi (giorno 4) perché con D piccolo la spinta ad acquistare resta sotto 0,3 nei primi due giorni, esce nel ribasso e rientra a metà risalita.

Alcune osservazioni sul comportamento:

- **Gradualità.** L'uscita sale da 0,00 (giorno 1) a 0,27 (giorno 2), 0,72 (giorno 3), 1,00 (giorno 4): quattro giorni per passare da «aspetta» a «compra con convinzione», senza salti.
- **Effetto del volume.** Nei giorni 9, 10 e 20 il rialzo sopra la media c'è, ma il volume basso abbassa la spinta (0,37; 0,60; 0,59 invece di 1,00). La decisione resta buy, perché la soglia è 0,3. Il volume è usato come attenuazione del segnale, e qui non cambia nessuna decisione.
- **Ritardo.** Il giorno 9 il prezzo è già in calo da un giorno e la decisione resta buy (la posizione è già aperta, quindi il simulatore non fa nulla). Come ogni sistema basato su medie, reagisce dopo il cambio di direzione e non prima.

#### 8.3.4 Il vantaggio tipico: nessun salto quando un valore passa una soglia

Confronto concreto. Prendiamo una regola «secca»: `D > 1` allora buy, altrimenti hold (soglia 1, con R ignorata). Si fa passare D da 0,99 a 1,01, con R = 1,2 (volume alto):

| D | regola secca | sistema fuzzy (uscita) |
|---|---|---|
| 0,99 | hold (segnale 0) | 0,33 |
| 1,01 | buy (segnale 1) | 0,34 |

Per la regola secca una variazione di 0,02 punti percentuali cambia il segnale da 0 a 1. Nel sistema fuzzy l'uscita passa da 0,33 a 0,34. La tabella seguente mostra l'uscita al variare di D, con R = 1,2 (qui la regola 1 vale `D/3` fino a D = 3, quindi l'uscita è `D/3`):

| D | 0 | 0,5 | 0,9 | 1,0 | 1,5 | 2,0 | 2,5 | 3,0 | 3,5 |
|---|---|---|---|---|---|---|---|---|---|
| uscita | 0,00 | 0,17 | 0,30 | 0,33 | 0,50 | 0,67 | 0,83 | 1,00 | 1,00 |

L'uscita cresce in modo continuo: un valore vicino alla soglia dà una spinta vicina a quella dei valori accanto. Due precisazioni oneste.

- Il salto finale c'è ancora: a D = 0,9 la decisione è hold (0,30 non supera 0,3), a D = 1,0 è buy. Cambia che a sinistra e a destra del salto l'uscita è quasi uguale (0,30 e 0,33), mentre la regola secca passa da 0 a 1. Se in futuro il motore usasse il valore dell'uscita (per esempio per la quota di capitale da investire), la gradualità arriverebbe fino all'ordine. Oggi il motore riceve solo buy, sell o hold, quindi questo vantaggio resta nel calcolo intermedio. [ipotesi sull'utilità della gradualità: nessuna fonte letta]
- Sul dataset giocattolo la regola secca «D > 1 buy, D < -1 sell, altrimenti hold» dà le stesse tre operazioni e lo stesso risultato (+0,72%) del sistema fuzzy. L'esempio non mostra che il fuzzy sia migliore. Mostra che il fuzzy è un'altra maniera, graduale, di scrivere la stessa idea.

### 8.4 Come evolve

#### 8.4.1 I geni e il loro numero

Un **gene** è un numero (o una scelta) che l'algoritmo genetico può cambiare. Nell'esempio:

| Parte del genoma | Numeri | Quanti |
|---|---|---|
| Insiemi di D | bassa: 2 (fine del tratto a 1, punto dove va a 0); media: 3 (due piedi e picco); alta: 2 (inizio salita, punto dove arriva a 1) | 7 |
| Insiemi di R | gli stessi 7 numeri | 7 |
| Conclusioni delle 5 regole | ciascuna una scelta tra Vendi, Neutro, Compra (gene discreto) | 5 |
| Soglia di decisione | un numero (0,3, simmetrica per buy e sell) | 1 |

Totale: **15 numeri reali** (14 + 1) più **5 scelte discrete**. Le condizioni delle regole (quali insiemi di D e di R compongono ogni frase) e i centri delle uscite (-1, 0, 1) sono fissi in questo esempio; potrebbero evolvere anch'essi, a costo di uno spazio di ricerca più grande.

**Con sei ingressi** (i sei dati del genoma attuale: prezzo e volume del giorno e quattro filtri) la rassegna conta 54 numeri: sei ingressi, tre insiemi triangolari per ingresso, tre numeri per triangolo, `6 * 3 * 3 = 54`. Con lo schema di questo esempio (rampe alle estremità, 7 numeri per ingresso) i numeri sarebbero `6 * 7 = 42`. In entrambi i casi bisogna poi aggiungere la **base di regole**. Se ogni regola può usare ogni ingresso con quattro scelte (bassa, media, alta, «non conta»), le frasi possibili per una regola sono `4^6 = 4096`; con 10 regole servono 60 scelte per le condizioni e 10 per le conclusioni, cioè 70 geni discreti. È un esempio dell'autore sul modo di contare, non una dimensione proposta. Il punto è che il fuzzy ha **molti parametri**, e quasi tutti sono sulle funzioni di appartenenza.

#### 8.4.2 Perché crossover e mutazione richiedono accorgimenti

Il **crossover** prende due genitori e fa un figlio con parti dell'uno e dell'altro; la **mutazione** cambia a caso un piccolo numero di geni.

Le funzioni di appartenenza hanno un **ordine interno**: il piede sinistro del triangolo viene prima del picco, che viene prima del piede destro. Un figlio che prende un numero da un genitore e uno dall'altro può rompere l'ordine (un piede a destra del picco). Gli insiemi devono anche **coprire** l'intervallo degli ingressi e sovrapporsi: se tra due insiemi c'è un buco, per alcuni valori nessuna regola è attiva e l'uscita è 0 per mancanza di informazione. Gli accorgimenti tipici, tutti proposti dall'autore e non da una fonte letta [ipotesi]:

- trattare un insieme intero (o tutti gli insiemi di un ingresso) come unità di scambio nel crossover;
- dopo mutazione o crossover, **riordinare** i numeri di ogni funzione (se escono in ordine sbagliato si ordinano);
- limitare ogni numero a un intervallo (il dominio dell'ingresso) e imporre una distanza minima tra due numeri vicini.

#### 8.4.3 Esempi numerici di mutazione

Il genitore A è l'istanza dell'esempio. Per ogni mutazione si rifà il calcolo dei 20 giorni.

**Mutazione 1: sposta un numero (neutra sulle decisioni).** Il secondo numero della funzione «alta» di D passa da 3 a 4,5 (+1,5). La rampa ora sale più lentamente. Il giorno 3 (D = 2,22) il grado di «alta» scende da `2,22/3 = 0,74` a `2,22/4,5 = 0,49` e l'uscita da 0,72 a 0,66; il giorno 2 da 0,27 a 0,19; il giorno 10 da 0,60 a 0,50; il giorno 17 da 0,62 a 0,52. **Nessuna decisione cambia**: le tre operazioni e il +0,72% restano uguali. È un esempio di mutazione piccola, con effetto piccolo e graduale sull'uscita.

**Mutazione 2: cambia una conclusione (gene discreto).** La regola 2 (D alta e R bassa) passa da «Neutro» a «Compra». Le uscite dei giorni 8, 9 e 20, nei quali R è sotto 1, passano da 0,95, 0,37 e 0,59 a 1,00. Anche qui nessuna decisione cambia (erano già buy). Un cambio di un gene produce un cambio nelle uscite di tre giorni su venti.

**Mutazione 3: rompe l'ordine e viene riparata.** Il primo numero della funzione «alta» di D passa da 0 a 3,5, e il secondo resta 3: la coppia (3,5; 3) non è una rampa valida. Con il riordino diventa (3; 3,5): la rampa va da 0 a 1 tra D = 3 e D = 3,5, uno scatto quasi netto. Effetto: con D = 2,22 il grado di «alta» è 0, la regola 1 non scatta e l'uscita del giorno 3 vale 0,00. Le decisioni dei giorni 3, 10 e 17 passano da buy a hold; le operazioni diventano: buy il giorno 5 (10,80), sell il giorno 13 (10,30), buy il giorno 19 (11,25); valore finale **966,42, rendimento -3,36%**. Una singola mutazione di un numero ha reso il sistema, in pratica, una regola secca con soglia a 3, e ha cambiato l'esito.

#### 8.4.4 Esempio numerico di crossover

Due genitori:

| | A (esempio) | B |
|---|---|---|
| D bassa | (-3; 0) | (-4; -1) |
| D media | (-3; 0; 3) | (-4; 0; 4) |
| D alta | (0; 3) | (1; 4) |
| R bassa | (0,8; 1,0) | (0,9; 1,05) |
| R media | (0,8; 1,0; 1,2) | (0,9; 1,05; 1,3) |
| R alta | (1,0; 1,2) | (1,05; 1,3) |
| Conclusioni regole 1-5 | C, N, N, V, N | C, N, N, V, V |
| Soglia | 0,3 | 0,4 |

(C = Compra, N = Neutro, V = Vendi.) Il genitore B da solo, valutato sul dataset, dà buy il giorno 4, sell il 13, buy il 19, con valore finale 989,32 (-1,07%): decide più tardi di A, perché le sue rampe sono più larghe e la soglia più alta.

**Figlio.** Prende da A tutti gli insiemi di D e la soglia (0,3); da B tutti gli insiemi di R e la conclusione della regola 5 (Vendi); le altre conclusioni sono uguali nei due genitori. Si scambiano **insiemi interi**, per non rompere gli ordini. Uscite di alcuni giorni:

| Giorno | D | R | uscita A | uscita B | uscita figlio |
|---|---|---|---|---|---|
| 8 | 5,66 | 0,99 | 0,95 | 0,60 | 0,60 |
| 9 | 4,11 | 0,87 | 0,37 | 0,00 | 0,00 |
| 14 | -3,81 | 0,91 | -0,54 | -0,95 | -1,00 |
| 15 | -1,92 | 0,77 | 0,00 | -0,37 | -0,64 |
| 20 | 4,37 | 0,92 | 0,59 | 0,12 | 0,12 |

Il figlio ha le stesse uscite di A in 12 giorni su 20 (1, 2, 4, 5, 6, 7, 11, 12, 13, 16, 17, 18), quelli in cui i gradi di R coincidono o non cambiano l'uscita, e uscite diverse negli altri (per esempio 8, 9, 14, 15, 20), dove le rampe di R di B danno gradi diversi. Le **decisioni** del figlio rispetto ad A cambiano nei giorni 9 (buy, poi hold), 15 (hold, poi sell) e 20 (buy, poi hold). Le operazioni del figlio sono però le stesse di A (buy il 4, sell il 13, buy il 18) e il risultato è lo stesso, **1007,23 (+0,72%)**. Non è un fatto generale: nel giorno 9 il figlio non vende, ma non ha motivo di vendere perché ha già la posizione; il sell del giorno 15 trova la posizione già chiusa; il giorno 20 è l'ultimo, la cui decisione è ignorata. In un altro dataset le differenze avrebbero un effetto sul risultato.

**Se invece si scambiassero singoli numeri.** Un terzo genitore ipotetico con la funzione «alta» di D (3,5; 5), incrociato con A (0; 3) in modo che il figlio prenda il primo numero da uno e il secondo dall'altro, produrrebbe (3,5; 3): coppia fuori ordine, da riordinare come nella mutazione 3. È un caso illustrativo, senza calcolo sul dataset.

### 8.5 Cosa ricorda del passato

Il sistema fuzzy standard **non ha memoria propria**: l'uscita di oggi dipende solo dagli ingressi di oggi. Tutta la memoria sta negli **indicatori a monte**: nell'esempio le due medie mobili con `c = 0,2` (circa 5 giorni di memoria), da cui nascono D e R. Il giorno 12 il sistema «sa» che il prezzo è sotto la media lenta perché D = -2,83, e quella media contiene la storia dei giorni precedenti. Se si cambia il `c` della media, cambia la memoria del sistema, senza toccare le regole.

Esiste la possibilità di dare uno stato al sistema, per esempio facendogli rileggere la propria uscita del giorno prima come ingresso aggiuntivo (sistemi fuzzy con stato o ricorrenti). Non è la forma standard; aggiungerebbe lo stato da azzerare in `reset()` e avvicinerebbe il sistema a una macchina a stati continua [ipotesi, nessuna fonte letta]. L'esempio non lo usa.

### 8.6 Punti di forza e debolezze

**Quanto sa esprimere.** Le regole sovrapposte descrivono una decisione a tratti, ma continua: l'uscita cambia gradualmente tra una regione e l'altra. Può rappresentare congiunzioni («prezzo alto e volume alto»), che un punteggio lineare non rappresenta. Che i sistemi fuzzy siano approssimatori universali di funzioni è una proprietà nota che qui non è stata verificata [ipotesi, fonte da verificare].

**Quanto è grande lo spazio di ricerca.** Medio o grande. L'esempio ha 15 numeri e 5 scelte; con sei ingressi si arriva a 42-54 numeri più la base di regole (sezione 8.4.1). Più parametri significano più libertà e più rischio di **sovradattamento** (adattarsi al rumore dei dati di addestramento, funzionando poi peggio su dati nuovi). La rassegna ricorda, con [4], il rischio quando si provano molte configurazioni su dati limitati (2517 barre di un solo titolo); per questa forma non c'è una misura [ipotesi].

**Si capisce perché decide così?** In parte. Ogni regola si legge come una frase («se il prezzo è molto sopra la media e il volume è normale, compra»), e per un giorno qualsiasi si può dire quali regole hanno scattato e quanto (come nella tabella dei 20 giorni). Per ottenere l'uscita però serve aggregare più regole, e il numero finale è una media pesata: livello di leggibilità «con calcolo». Con molti insiemi e molte regole la lettura si perde: 10 regole su 6 ingressi non sono più frasi semplici.

**Quanto costa calcolarlo.** Per ogni barra: due medie mobili (circa 6 operazioni), due divisioni, sei funzioni di appartenenza (circa 4 operazioni ciascuna), cinque regole con minimi e massimi, una media pesata. Con l'esempio, nell'ordine di alcune decine di operazioni. Con sei ingressi, 18 funzioni e una decina di regole: nell'ordine di un centinaio [ipotesi: stima dell'autore, non misurata]. Il costo non discrimina tra le forme (vedi la sezione «Griglia di confronto» della rassegna).

**Si mescola e si muta bene?** Con accorgimenti (sezione 8.4.2): riordino dei numeri, limiti, unità di scambio. Senza, si producono figli con funzioni malformate o buchi di copertura. Gli accorgimenti non sono difficili da scrivere, ma sono codice in più da provare.

**Si adatta al nostro motore?** Sì, con un adattamento (vedi la sezione seguente).

### 8.7 Come si integra nel nostro motore

Ogni giorno il motore dà alla strategia prezzo e volume del giorno e riceve buy, sell o hold. Per la forma fuzzy il flusso è: aggiornare le due medie mobili, calcolare D e R, fuzzificare, applicare le regole, aggregare, defuzzificare, confrontare con le soglie. Non c'è stato interno da azzerare in `reset()` oltre alle medie (come per i filtri IIR del genoma attuale, `src/vendor/consilium/algorithm.js`, righe 369-372). Il contratto della strategia (`src/engine/strategy.js`, righe 12-33) richiede:

- **`labels`**, la lista finita delle etichette di stato. **Scelta dichiarata: le tre fasce dell'uscita defuzzificata (sell, hold, buy)**, quelle determinate dalle soglie. Alternativa: le tre uscite fuzzy (Vendi, Neutro, Compra), prendendo ogni giorno quella con il grado aggregato più alto. Le due scelte possono non coincidere: il giorno 9 l'uscita Neutro ha grado 0,63 e Compra 0,37, ma la media pesata è 0,37 e la decisione è buy. Con la prima scelta l'etichetta è coerente con la decisione.
- **`describe()`**: i gradi di appartenenza di D e di R, i gradi di attivazione delle regole e l'uscita defuzzificata. Sono numeri finiti, utili per l'ispezione.
- **`serialize()`**: i parametri (insiemi, conclusioni, soglia) come JSON. È un insieme di numeri e di scelte, semplice da salvare.
- **`crossover` e `mutate`**: da scrivere, con gli accorgimenti di 8.4.2. Il motore genetico di Consilium li chiama (`src/vendor/consilium/ga.js`, righe 116-125, 345-351).

Esito sul contratto: **con adattamento** (le etichette vanno derivate dall'uscita, come nella sezione sul contratto della rassegna).

### 8.8 Cosa dice la letteratura

- **Fondazione.** Zadeh introdusse gli insiemi fuzzy nel 1965: un insieme in cui ogni elemento ha un grado di appartenenza tra 0 e 1 [10]. La fonte è stata vista solo come scheda e abstract; il testo integrale non è stato raggiunto e l'URL risponde in modo intermittente. Il lavoro di Zadeh fonda gli insiemi, non i sistemi a regole come sono descritti qui: la struttura regole, aggregazione, defuzzificazione è descritta dall'autore con parole proprie [ipotesi, fonte da verificare].
- **Uso nel trading.** La rassegna cita un lavoro di conferenza su un sistema fuzzy per il trading di azioni, con funzioni di appartenenza e regole ottimizzate da un algoritmo genetico [11], letto in parte e su un caso solo; non se ne riportano i risultati. Per un uso evolutivo del fuzzy su dati finanziari oltre a [11] **non c'è una fonte letta** nella rassegna: ciò che questo capitolo dice sul comportamento di questa forma con un algoritmo genetico su ENI è [ipotesi].
- **Approssimatori universali, varianti delle conclusioni, altri operatori di combinazione:** noti in letteratura, non verificati qui [ipotesi, fonte da verificare].

### 8.9 In breve

- La logica fuzzy sostituisce le soglie nette con **gradi** tra 0 e 1; regole in forma di frase si combinano con minimo («e») e massimo («o») e un numero finale si ottiene con una media pesata; due soglie danno buy, sell o hold.
- Sul dataset giocattolo, con due ingressi, tre insiemi ciascuno e cinque regole, il sistema porta a 3 operazioni e +0,72% (buy&hold: +12,87%). I numeri sono inventati e non provano nulla.
- Il vantaggio è la gradualità (uscita 0,27, 0,72, 1,00 in tre giorni invece di un salto) e la leggibilità delle regole; il costo è il numero di parametri (15 numeri e 5 scelte nell'esempio, 42-54 numeri con sei ingressi) e gli accorgimenti per crossover e mutazione.
- La memoria sta negli indicatori a monte (le medie); non c'è stato proprio.
- Nel contratto va con adattamento (`labels` dalle fasce dell'uscita). Per l'uso evolutivo sui dati finanziari c'è una sola fonte nota [11], letta in parte.

## 9. Il modello a stati nascosti (HMM)

### 9.1 In una frase e un'analogia

Un modello a stati nascosti (in inglese *hidden Markov model*, HMM) suppone che il mercato si trovi ogni giorno in un **regime** che non vediamo (per esempio «salita», «laterale», «calo») e che possiamo solo osservare i suoi effetti, cioè i movimenti giornalieri del prezzo. Il modello tiene una **credenza**, cioè una probabilità per ogni regime, e la aggiorna ogni giorno.

**Un'analogia.** Immagina di stare in una stanza senza finestre, e di voler indovinare che tempo fa fuori guardando soltanto chi entra. Il tempo (sole, pioggia) è lo stato nascosto. Le persone con l'ombrello sono le osservazioni. Un ombrello non prova che piove: chi lo porta può essere prudente, e con la pioggia qualcuno lo dimentica. Però dopo tre persone con l'ombrello di fila la tua stima «sta piovendo» sale molto, e dopo due persone senza ombrello torna a scendere. Inoltre sai che il tempo cambia di rado da un'ora all'altra: questo ti rende prudente nel cambiare idea per una sola persona. L'HMM formalizza esattamente questo ragionamento, con tre insiemi di numeri: quanto è probabile che il tempo cambi (**transizioni**), quanto è probabile vedere un ombrello con la pioggia o con il sole (**osservazioni**), e che cosa pensavi all'inizio (**credenza iniziale**).

**Per un programmatore.** È un oggetto con uno stato interno (un vettore di K probabilità) e un metodo `update(osservazione)` che lo aggiorna con una moltiplicazione di matrice e una normalizzazione. L'azione si legge dallo stato con una tabella `regime -> buy/sell/hold`.

**Nota di cautela.** Tutti i numeri di questo capitolo sono **inventati** e sono calcolati su un dataset di 20 giorni inventato. Mostrano come funziona il meccanismo e non dicono nulla su come funzioni, o se funzioni, sui mercati reali.

### 9.2 Come funziona

#### 9.2.1 Passo 1: i regimi nascosti

Si sceglie un numero K di regimi e un nome per ciascuno. Nel nostro esempio K = 3: **salita**, **laterale**, **calo**. «Nascosto» vuol dire che il programma non sa mai con certezza in quale regime si trova il mercato. Sa solo quanto è probabile ciascuno. Un regime non è una previsione: è un'etichetta per un modo di comportarsi del prezzo («tende a salire»).

#### 9.2.2 Passo 2: la matrice di transizione

Ogni giorno il mercato **resta nel regime in cui è oppure passa a un altro**, con probabilità fisse che dipendono solo dal regime di ieri (non da quello di ieri l'altro: questa è l'ipotesi di Markov). Le probabilità si scrivono in una tabella, la **matrice di transizione**, con un simbolo `a_ij` per «probabilità di passare dal regime `i` al regime `j` in un giorno». Ogni riga somma 1, perché da `i` si va comunque da qualche parte (anche restando in `i`).

Nel nostro esempio (righe: regime di partenza, colonne: regime di arrivo):

| da \ a | Salita | Laterale | Calo |
|---|---|---|---|
| **Salita** | 0,80 | 0,15 | 0,05 |
| **Laterale** | 0,20 | 0,60 | 0,20 |
| **Calo** | 0,05 | 0,15 | 0,80 |

In parole: un regime di salita ha l'80 per cento di probabilità di durare anche domani, il 15 per cento di sfumare nel laterale e il 5 per cento di diventare un calo di colpo. I numeri sulla diagonale grandi vogliono dire «i regimi durano». Un regime che dura in media 1 / (1 − 0,80) = 5 giorni è un modello di salite che durano circa cinque giorni.

#### 9.2.3 Passo 3: il modello di osservazione

Ogni giorno vediamo una cosa sola: **come si è mosso il prezzo**. Per semplicità la riduciamo a tre simboli, con soglie dichiarate. Sia `r[t] = prezzo[t] / prezzo[t-1] - 1` la variazione percentuale del giorno `t` rispetto a ieri.

- **su**: `r[t] > +0,5 per cento`
- **giù**: `r[t] < -0,5 per cento`
- **fermo**: tra i due.

Il **modello di osservazione** dice, per ciascun regime, quanto è probabile ciascun simbolo. Si indica con `b_j(O_t)` la probabilità di osservare il simbolo `O_t` quando il regime è `j`. Anche qui ogni riga somma 1.

| regime \ osservazione | su | fermo | giù |
|---|---|---|---|
| **Salita** | 0,70 | 0,20 | 0,10 |
| **Laterale** | 0,25 | 0,50 | 0,25 |
| **Calo** | 0,10 | 0,20 | 0,70 |

In parole: in un regime di salita il 70 per cento dei giorni sale, ma il 10 per cento dei giorni scende lo stesso. Questo è il punto: anche un giorno di calo isolato non basta a dire che il regime è cambiato. È lo stesso ragionamento dell'ombrello dimenticato.

#### 9.2.4 Passo 4: la credenza e il suo aggiornamento giornaliero (filtro in avanti)

La **credenza** è il vettore delle probabilità dei K regimi, calcolate sapendo che cosa si è osservato fino a oggi. Parte da una credenza iniziale `pi_i` (qui 0,25 salita, 0,50 laterale, 0,25 calo: «prima di vedere nulla il mercato è più probabilmente fermo»). Poi, ogni giorno, due mosse:

1. **Previsione.** Si spinge la credenza di ieri attraverso la matrice di transizione: dove può essere il mercato oggi, prima di guardare il prezzo?
2. **Correzione.** Si pesa ogni regime per la probabilità che avrebbe avuto di produrre l'osservazione di oggi, e si normalizza in modo che le probabilità sommino 1.

L'algoritmo «in avanti» di Rabiner [2] scrive entrambe le mosse in una formula. Con i simboli di Rabiner (usati anche dalla rassegna), `alfa_t(j)` è la probabilità di aver visto le osservazioni fino al giorno `t` **e** di essere nel regime `j` oggi:

```
inizializzazione:  alfa_1(i)     = pi_i * b_i(O_1)
induzione:         alfa_{t+1}(j) = [ somma su i di alfa_t(i) * a_ij ] * b_j(O_{t+1})
scaling:           si divide ogni alfa_t per la somma su tutti i regimi
```

In parole: la parte tra parentesi quadre è la **previsione** (la probabilità di arrivare in `j` oggi, sommando i percorsi da ogni regime `i` di ieri); la moltiplicazione per `b_j(O_{t+1})` è la **correzione** (chi spiega meglio l'osservazione di oggi guadagna peso). Lo **scaling** (normalizzazione) serve per due ragioni: i numeri `alfa` diventano piccolissimi dopo molti giorni, e dopo la divisione per la somma si leggono come probabilità che sommano 1, cioè come la credenza [2]. D'ora in poi «credenza» indica `alfa_t` normalizzata.

Una piccola semplificazione nostra: Rabiner inizia dall'osservazione del giorno 1. Nel nostro dataset il giorno 1 non ha un giorno precedente, quindi non ha una variazione, e perciò il giorno 1 non ha osservazione: la credenza del giorno 1 è la credenza iniziale e le osservazioni cominciano dal giorno 2.

**Calcolo a mano: il giorno 2.** Il prezzo passa da 10,00 a 10,10, quindi `r = +1,00 per cento` e l'osservazione è **su**. La credenza di ieri è (0,25; 0,50; 0,25) per (salita, laterale, calo).

*Previsione.* Per ogni regime di arrivo `j` si somma, su tutti i regimi `i` di ieri, credenza(i) per `a_ij`.

```
salita:   0,25*0,80 + 0,50*0,20 + 0,25*0,05 = 0,2000 + 0,1000 + 0,0125 = 0,3125
laterale: 0,25*0,15 + 0,50*0,60 + 0,25*0,15 = 0,0375 + 0,3000 + 0,0375 = 0,3750
calo:     0,25*0,05 + 0,50*0,20 + 0,25*0,80 = 0,0125 + 0,1000 + 0,2000 = 0,3125
```

La previsione somma 1 (0,3125 + 0,375 + 0,3125). Prima di guardare il prezzo, il mercato di domani è già un po' più incerto di quello di oggi: l'80 per cento di durata non è il 100.

*Correzione.* Si moltiplica per la probabilità di vedere «su» in ciascun regime (colonna «su» della tabella di osservazione: 0,70; 0,25; 0,10).

```
salita:   0,3125 * 0,70 = 0,21875
laterale: 0,3750 * 0,25 = 0,09375
calo:     0,3125 * 0,10 = 0,03125
somma = 0,34375
```

*Normalizzazione.* Si divide per 0,34375.

```
salita   = 0,21875 / 0,34375 = 0,64
laterale = 0,09375 / 0,34375 = 0,27
calo     = 0,03125 / 0,34375 = 0,09
```

Dopo un solo giorno in rialzo la credenza passa da (0,25; 0,50; 0,25) a (0,64; 0,27; 0,09). Il regime più probabile è ora «salita», ma con il 64 per cento, non con il 100.

**Un giorno in cui il modello esita: il giorno 9.** Il prezzo scende da 11,35 a 11,30 (-0,44 per cento): osservazione **fermo**. La credenza di ieri, arrotondata, è (0,91; 0,08; 0,01). Previsione: salita 0,91*0,80 + 0,08*0,20 + 0,01*0,05 = 0,7445; laterale 0,91*0,15 + 0,08*0,60 + 0,01*0,15 = 0,186; calo 0,91*0,05 + 0,08*0,20 + 0,01*0,80 = 0,0695. Correzione con la colonna «fermo» (0,20; 0,50; 0,20): 0,1489; 0,0930; 0,0139, somma 0,2558. Normalizzati: circa (0,58; 0,36; 0,05). Il valore esatto dello script è (0,58; 0,36; 0,06): la differenza sta negli arrotondamenti. Un giorno «fermo» non cambia il regime più probabile, ma sposta molto peso dalla salita al laterale, perché il regime laterale spiega meglio un giorno fermo.

#### 9.2.5 Passo 5: dalla credenza all'azione

La credenza non è ancora una decisione. Serve una regola di lettura, che è parte del genoma. Due scelte semplici:

- **Regime più probabile.** Si prende il regime con la credenza più alta e si usa una mappa regime → azione. Nel nostro esempio: salita → `buy`, laterale → `hold`, calo → `sell`.
- **Soglia.** Si agisce solo se la credenza di un regime supera una soglia (per esempio 0,60); sotto la soglia, `hold`. Evita di cambiare idea con credenze incerte, a costo di reagire più tardi.

L'esempio sotto usa la prima (il regime più probabile). La seconda è un'alternativa che il genoma può avere come numero in più.

### 9.3 Esempio applicato al dataset giocattolo

#### 9.3.1 Semplificazioni di questo esempio

- Dataset giocattolo di 20 giorni, inventato (capitolo 1): non dice nulla sui mercati reali.
- Osservazione: la variazione giornaliera del prezzo, in tre simboli (su, fermo, giù) con soglie ±0,5 per cento. **Il volume non è usato**: l'HMM di questo esempio guarda solo il prezzo.
- Tre regimi, matrici e credenza iniziale scritte sopra: **scelte a mano**, non stimate dai dati.
- Giorno 1: nessuna osservazione, credenza = credenza iniziale.
- Decisione: regime più probabile; salita → buy, laterale → hold, calo → sell.
- Il valutatore: decisione alla chiusura del giorno `t`, eseguita al prezzo del giorno `t+1`; compra con tutto il denaro o vende tutto; azioni frazionarie; nessun costo, nessuno stop loss né take profit; l'ultima decisione è ignorata. Capitale 1000. Se la decisione è `buy` ma si è già in posizione, o `sell` senza posizione, non succede nulla.
- Numeri arrotondati a due decimali nelle tabelle (i calcoli interni no).

#### 9.3.2 La tabella giorno per giorno

La colonna «Osserv.» è il simbolo del giorno. Le tre colonne di credenza sono la credenza **dopo** l'aggiornamento di quel giorno. La decisione del giorno `t` è presa alla chiusura e si esegue il giorno `t+1`.

| Giorno | Prezzo | Var. % | Osserv. | Salita | Laterale | Calo | Più probabile | Decisione |
|---|---|---|---|---|---|---|---|---|
| 1 | 10,00 | - | - | 0,25 | 0,50 | 0,25 | laterale | hold |
| 2 | 10,10 | 1,00 | su | 0,64 | 0,27 | 0,09 | salita | buy |
| 3 | 10,30 | 1,98 | su | 0,83 | 0,14 | 0,03 | salita | buy |
| 4 | 10,55 | 2,43 | su | 0,88 | 0,10 | 0,02 | salita | buy |
| 5 | 10,80 | 2,37 | su | 0,90 | 0,09 | 0,01 | salita | buy |
| 6 | 11,00 | 1,85 | su | 0,90 | 0,08 | 0,01 | salita | buy |
| 7 | 11,20 | 1,82 | su | 0,91 | 0,08 | 0,01 | salita | buy |
| 8 | 11,35 | 1,34 | su | 0,91 | 0,08 | 0,01 | salita | buy |
| 9 | 11,30 | -0,44 | fermo | 0,58 | 0,36 | 0,06 | salita | buy |
| 10 | 11,10 | -1,77 | giù | 0,23 | 0,33 | 0,44 | calo | sell |
| 11 | 10,80 | -2,70 | giù | 0,07 | 0,19 | 0,75 | calo | sell |
| 12 | 10,50 | -2,78 | giù | 0,02 | 0,11 | 0,86 | calo | sell |
| 13 | 10,30 | -1,90 | giù | 0,02 | 0,09 | 0,89 | calo | sell |
| 14 | 10,20 | -0,97 | giù | 0,01 | 0,08 | 0,90 | calo | sell |
| 15 | 10,35 | 1,47 | su | 0,30 | 0,27 | 0,43 | calo | sell |
| 16 | 10,55 | 1,93 | su | 0,67 | 0,21 | 0,13 | salita | buy |
| 17 | 10,80 | 2,37 | su | 0,84 | 0,13 | 0,04 | salita | buy |
| 18 | 11,05 | 2,31 | su | 0,89 | 0,09 | 0,02 | salita | buy |
| 19 | 11,25 | 1,81 | su | 0,90 | 0,08 | 0,01 | salita | buy |
| 20 | 11,40 | 1,33 | su | 0,90 | 0,08 | 0,01 | salita | buy |

Le righe non sommano sempre esattamente 1,00 per gli arrotondamenti (per esempio il giorno 3: 0,83 + 0,14 + 0,03 = 1,00; il giorno 9: 0,58 + 0,36 + 0,06 = 1,00; in altri giorni 0,99 o 1,01).

#### 9.3.3 Risultato col valutatore

| Operazione | Giorno di esecuzione | Prezzo |
|---|---|---|
| compra | 3 | 10,30 |
| vende | 11 | 10,80 |
| compra | 17 | 10,80 |

Valore finale **1106,80**, rendimento **+10,68 per cento**, contro **+12,87 per cento** del buy&hold (1128,71). L'esito non è un giudizio sulla forma: la somma dipende dalle matrici inventate e da 20 giorni inventati.

#### 9.3.4 Che cosa si vede

- **Ritardo all'ingresso.** Il primo giorno la credenza è ancora «laterale» (hold). Dopo una sola osservazione «su» la credenza dice già «salita» (64 per cento), e la decisione `buy` presa il giorno 2 si esegue il giorno 3 a 10,30. Il modello non compra al giorno 1, perché non ha ancora visto nulla.
- **Esitazione alla svolta.** Il picco è il giorno 8 (11,35). Il giorno 9 è «fermo» e la credenza scende da 0,91 a 0,58 per la salita, ma resta il regime più probabile, quindi si continua a tenere. Il giorno 10 (primo «giù» netto) la credenza di calo è 0,44 e supera quella laterale (0,33) e quella di salita (0,23): la decisione `sell` è presa il giorno 10 ed eseguita l'11 a 10,80. Ha rinunciato a circa 0,55 euro per azione rispetto al picco, il prezzo dell'attesa di una conferma.
- **Il calo non viene scambiato per un rumore.** Quattro giorni «giù» di fila portano la credenza di calo a 0,90 e la tengono lì.
- **Il rimbalzo.** Il giorno 15 il prezzo sale (+1,47 per cento) dopo il fondo del giorno 14, ma la credenza di calo vale ancora 0,43 contro 0,30 di salita: il modello **non si fida di una sola osservazione** (come con l'ombrello) e il giorno 15 resta `sell`. Il giorno 16, con la seconda osservazione «su», la salita vale 0,67 e la decisione `buy` si esegue il giorno 17 a 10,80. La stessa prudenza che evita le false svolte ritarda quelle vere di un giorno o due.

Un solo «su» dopo cinque «giù» non basta a cambiare il regime: è un effetto voluto della matrice (le diagonali alte, 0,80, rendono il modello lento a cambiare idea), non un difetto del calcolo.

### 9.4 Come evolve

#### 9.4.1 I geni

Nel nostro esempio il genoma contiene:

- gli elementi della **matrice di transizione** `A`, 3 righe da 3 numeri che sommano 1 (6 numeri liberi, perché l'ultimo di ogni riga si ricava dagli altri);
- gli elementi della **matrice di osservazione** `B`, 3 righe da 3 numeri che sommano 1 (altri 6 numeri liberi);
- la **credenza iniziale** `pi` (2 numeri liberi);
- la **mappa regime → azione** (3 scelte discrete tra buy, hold e sell);
- eventualmente le **soglie** per l'osservazione (le due soglie ±0,5 per cento qui fissate) e la **soglia di decisione** sulla credenza.

Il vincolo «ogni riga somma 1» non è una proprietà che un'operazione genetica semplice conserva da sola: dopo una mutazione o un crossover bisogna **rinormalizzare** ogni riga.

#### 9.4.2 Un esempio di mutazione

Si prende la riga «laterale» di `A`, (0,20; 0,60; 0,20), e si alza a 0,80 la probabilità di restare nel laterale. La riga non somma più 1: (0,20 + 0,80 + 0,20 = 1,20). Si rinormalizza dividendo per 1,20:

```
(0,20; 0,80; 0,20) / 1,20 = (0,17; 0,67; 0,17)
```

Su questo dataset la mutazione **non cambia nessuna decisione** (nessuno dei 20 giorni): le credenze si spostano di pochi centesimi (per esempio il giorno 9 la salita passa da 0,58 a 0,57) ma il regime più probabile resta lo stesso. Il rendimento resta +10,68 per cento. Una mutazione di questo tipo è **neutra** per questo dataset: l'algoritmo genetico non la vedrebbe come migliore né peggiore.

Una seconda mutazione, più incisiva: nella riga «salita» si abbassa a 0,50 la probabilità di restare in salita: (0,50; 0,15; 0,05), che si rinormalizza dividendo per 0,70 in (0,71; 0,21; 0,07). Qui il giorno 9 cambia: la credenza è (0,46; 0,47; 0,07), il laterale supera la salita di un soffio e la decisione diventa `hold` invece di `buy`. Essendo il modello già in posizione, `hold` non cambia nulla nel valutatore: le operazioni e il rendimento restano gli stessi (+10,68 per cento). Una decisione cambia, il risultato no: la distinzione conta, perché il GA vede solo il risultato (la fitness).

#### 9.4.3 Un esempio di crossover

Il secondo genitore ha una matrice di transizione più «nervosa» (le diagonali sono più basse):

| da \ a | Salita | Laterale | Calo |
|---|---|---|---|
| **Salita** | 0,60 | 0,30 | 0,10 |
| **Laterale** | 0,30 | 0,40 | 0,30 |
| **Calo** | 0,10 | 0,30 | 0,60 |

Il genitore 2, con la stessa matrice di osservazione, la stessa credenza iniziale e la stessa mappa, dà operazioni a 3 (compra), 11 (vende) e **16** (compra a 10,55): valore finale 1133,02, **+13,30 per cento**. Il rimbalzo viene riconosciuto un giorno prima perché le righe meno «appiccicose» fanno cambiare idea più in fretta.

Due modi di fare il figlio con numeri:

- **Crossover aritmetico (media riga per riga).** Ogni elemento è la media dei due genitori. Le righe somma 1 si conservano da sole, perché la media di due righe che sommano 1 somma 1 (non serve rinormalizzare). La riga «salita» diventa (0,70; 0,225; 0,075), la riga «laterale» (0,25; 0,50; 0,25), la riga «calo» (0,075; 0,225; 0,70). Il figlio decide diversamente dal genitore 1 i giorni 9 e 15, ottiene +13,30 per cento (operazioni ai giorni 3, 11 e 16).
- **Scambio di righe.** Il figlio prende la riga «salita» dal genitore 1 e le righe «laterale» e «calo» dal genitore 2. Le righe sono intere, quindi ognuna somma già 1. Differisce dal genitore 1 il giorno 15 (decisione `buy` invece di `sell`); +13,30 per cento.

Qui l'esito è lo stesso dei genitori migliori solo perché il dataset è minuscolo; non è un risultato generale.

#### 9.4.4 La stima classica: Baum-Welch

Fuori dal mondo degli algoritmi genetici, gli HMM si addestrano con un metodo classico, l'algoritmo di **Baum-Welch**, una forma di **EM** (*expectation-maximization*, «aspettazione e massimizzazione»), descritto da Rabiner [2]. In parole semplici procede così:

1. parte con matrici qualsiasi;
2. guarda **tutta** la sequenza storica e, per ogni giorno, calcola quanto è probabile ciascun regime tenendo conto non solo del passato, ma anche di ciò che accade **dopo** (è la parte «all'indietro» dell'algoritmo, che usa il futuro rispetto al giorno considerato);
3. da queste probabilità ricostruisce nuove matrici, quelle che rendono più probabile la sequenza vista;
4. ripete finché la sequenza non diventa più probabile.

È un metodo ben fondato e molto usato per gli HMM [2]. Per noi ha due caratteristiche da conoscere.

**Primo: usa tutta la serie, futuro compreso.** Se si stimano le matrici sull'intera storia e poi si valuta la strategia sulla stessa storia, la strategia ha già «visto» i giorni futuri attraverso le matrici. È l'**anticipazione dei dati** (look-ahead). Il filtro in avanti è causale (usa solo il passato), ma i suoi parametri non lo sono, se sono stimati così.

**Un esempio concreto sul dataset giocattolo.** Il filtro causale non conosce il futuro e decide ogni giorno con ciò che ha. Se invece si cerca il percorso di regimi più probabile sull'intera sequenza (metodo di Viterbi [2], che fa lo stesso tipo di calcolo ma all'indietro e in avanti), si ottiene un «regime con il senno di poi»:

| Giorno | 1-8 | 9 | 10-14 | 15-20 |
|---|---|---|---|---|
| Filtro (solo passato) | salita (da 2) | salita | calo | calo il 15, poi salita |
| Con il senno di poi | salita | **laterale** | calo | **salita già dal 15** |

Con il senno di poi il giorno 9 viene riconosciuto come regime laterale, il giorno 15 come ripartenza, e perfino il giorno 1 come salita (il filtro lo dava laterale). Se si decidesse con questo percorso, le operazioni sarebbero ai giorni 2 (compra a 10,10), 11 (vende a 10,80) e 16 (compra a 10,55): **+15,55 per cento**, contro +10,68 per cento del filtro. La differenza non è merito del modello: è l'informazione del futuro. Nessuna strategia reale potrebbe sapere il giorno 1 che il mercato sarà in salita.

**Secondo, un caso di sovradattamento.** Se si fa girare Baum-Welch per 30 iterazioni su questi 20 giorni, partendo dalle nostre matrici, si ottengono parametri che memorizzano la sequenza: la credenza iniziale diventa (1,00; 0,00; 0,00), la matrice di osservazione diventa quasi la matrice identità (ogni regime produce un solo simbolo, con probabilità 1,00), e il regime «laterale» diventa un regime che dura un solo giorno e passa al calo con probabilità 1,00. Il filtro con questi parametri compra il giorno 2 a 10,10 (+15,55 per cento). Il modello «sa» come va questo dataset, non come vanno i mercati. Con una sola iterazione la deriva è moderata (credenza iniziale (0,80; 0,19; 0,01)); con tre è già forte (0,99; 0,01; 0,00). Numeri inventati, ma il meccanismo è reale: più un modello è libero e più si adatta alla sequenza che ha visto.

**Che cosa propone la rassegna.** La rassegna presenta due strade, senza sceglierne una: (a) i parametri si evolvono con l'algoritmo genetico, senza stima globale (nessun uso di Baum-Welch); (b) si stimano solo su dati che **precedono** la valutazione. La scelta del metodo di stima è **rimandata alla ricerca R6** (protocollo di valutazione). Questo capitolo non la anticipa.

### 9.5 Cosa ricorda del passato

L'HMM ha **memoria nel lettore**, non negli indicatori a monte: la memoria è la credenza, un vettore di K numeri (qui 3) aggiornato a ogni osservazione. È una **memoria ricorsiva**, simile al filtro IIR dell'FSM attuale (`algorithm.js`, righe 369-372): lì `y[t] = y[t-1] + c * (x[t] - y[t-1])`, qui la credenza di oggi dipende dalla credenza di ieri e dal dato nuovo. La differenza sta nel modo di pesare: il filtro IIR usa un solo coefficiente `c` fisso, mentre la credenza pesa **per regime** (un'osservazione «su» pesa molto per la salita e poco per il calo) e **in modo non lineare** (con la normalizzazione).

Nell'esempio, la «lunghezza» della memoria non è un numero, ma emerge dalle matrici: con la diagonale 0,80 un regime dura in media circa cinque giorni, e per ribaltare una credenza di 0,90 ci vogliono più giorni coerenti (il rimbalzo dei giorni 15 e 16).

#### 9.5.1 Una tensione da dire con franchezza: i regimi sono stati discreti

Il progetto vuole una memoria che nasca da indicatori noti e non da una macchina a stati. L'HMM non è un indicatore: ha K **stati discreti scritti nel modello** (salita, laterale, calo), con transizioni tra stati e una mappa stato → azione. **È una macchina a stati probabilistica**: gli stati sono «morbidi» (si è in tutti con una probabilità) e le transizioni sono calcolate dalle osservazioni, invece di essere scritte come liste di condizioni.

Luca ha già risposto alla domanda 1: l'HMM è **ammesso come forma da valutare**; questa sezione descrive la vicinanza e non la giudica. Il confronto con la macchina a stati attuale:

| Aspetto | FSM attuale (Consilium) | HMM di questo capitolo |
|---|---|---|
| Stati | 9, su una griglia 3x3 | K regimi (qui 3), con un nome |
| In che stato si è | Esattamente uno, in ogni momento | Una probabilità per ogni regime (credenza) |
| Come si cambia stato | Scatta la prima transizione le cui condizioni (confronti tra filtri) sono tutte vere | Si ricalcola la credenza con la matrice di transizione e le probabilità di osservazione |
| Da dove viene l'informazione sul passato | Dallo stato corrente e dai filtri IIR | Dalla credenza (il filtro IIR in ingresso non c'è, se l'osservazione è il solo movimento del prezzo) |
| Cosa fa decidere l'azione | L'azione scritta nello stato (nel genoma fisso solo uno stato ha `buy`) | La mappa regime → azione, letta sul regime più probabile o su una soglia |
| Cosa è nel genoma | Struttura discreta variabile (transizioni, condizioni) più 11 numeri | Matrici di numeri (righe che sommano 1) più una mappa di poche scelte |
| Cosa si legge a occhio | Il grafo degli stati; lo stato attuale richiede di seguire la storia | I nomi dei regimi; la credenza richiede di eseguire la ricorsione |

Gli elementi in comune sono la presenza di stati discreti e di transizioni tra stati. Le differenze sono la natura probabilistica (stati morbidi) e il fatto che le transizioni nascono da numeri, non da liste di condizioni. Per Luca il confronto serve a valutare quanto l'HMM abbia in comune con la forma che si vuole lasciare e quanto di diverso.

### 9.6 Punti di forza e debolezze

**Quanto sa esprimere?** Ogni regime è una «modalità» del mercato, con una propria dinamica. Nel nostro esempio le decisioni dipendono dalla sequenza di osservazioni, non solo dall'ultima: lo stesso «su» del giorno 15 dà `sell` e quello del giorno 16 dà `buy`. Con osservazioni discrete la regola è una funzione di tutta la storia pesata dalle matrici. La rassegna la classifica «a tratti» (una regione per regime) con osservazioni gaussiane [2], [ipotesi] sulla qualifica.

**Quanti numeri ha il genoma?** Nel nostro esempio: 6 (matrice di transizione) + 6 (osservazione) + 2 (credenza iniziale) = **14 numeri liberi**, più la mappa regime → azione (3 scelte). Con 3 regimi e 5 simboli di osservazione: 6 + 12 + 2 = **20**. Con 5 regimi e 7 simboli: 20 + 30 + 4 = **54**. Cresce con il quadrato dei regimi (transizioni) e con regimi per simboli (osservazione). La rassegna conta circa 44 numeri per K = 3 con sei ingressi gaussiani a covarianza diagonale: lì le osservazioni sono numeri continui con media e varianza, non simboli discreti [2], conteggio dell'autore. In ogni caso la dimensione è fissa, ma i numeri sono più di quelli di un punteggio lineare.

**Si capisce perché decide così?** A metà. I regimi hanno nomi, e vedere «credenza di calo 0,89» è leggibile. Ma capire perché la credenza ha quel valore richiede di eseguire la ricorsione dall'inizio: non basta guardare la tabella dei numeri. Inoltre i nomi sono etichette che **scegliamo noi**: nulla impedisce a un genoma evoluto di avere un regime chiamato «salita» che in realtà si comporta da «calo» (per questo la mappa regime → azione è nel genoma e la fitness è l'unico giudice).

**Quanto costa calcolarlo?** Poco, per un giorno. Con K = 3: 9 prodotti e 6 somme per la previsione, 3 prodotti per la correzione, 3 somme e 3 divisioni per la normalizzazione: circa 25 operazioni per giorno più la classificazione del movimento **[ipotesi: conteggio a mano dell'autore, non misurato]**. Il costo cresce con K al quadrato.

**Si mescola e si muta bene?** Con accorgimenti. La mutazione è semplice (cambiare un elemento e rinormalizzare la riga). Per il crossover, la media di due righe che sommano 1 somma 1 senza altro lavoro, ma c'è un problema più sottile: **scambiare i nomi dei regimi dà lo stesso modello con un genoma diverso**. Se nel genitore 1 il regime 1 è la «salita» e nel genitore 2 il regime 1 è il «calo», la media delle loro matrici mescola due cose diverse e il figlio è quasi sempre peggiore. È lo stesso problema delle «competing conventions» delle reti neurali [1]: una soluzione è ordinare i regimi (per esempio per rendimento atteso) prima del crossover, [ipotesi].

**Si adatta al nostro motore?** Bene, tra le forme considerate è quella con `labels` naturali. Vedi sotto.

**Rischi.** Anticipazione nella stima dei parametri (vedi sopra); regimi che collassano su uno solo o che non osservano mai nulla; e il fatto che i regimi non si osservano, quindi nessuno controlla che «salita» sia davvero salita: l'unico giudice è la fitness [ipotesi].

### 9.7 Come si integra nel nostro motore

Ogni giorno il motore dà alla strategia la barra del giorno. L'HMM calcola l'osservazione (su, fermo, giù) dal prezzo, aggiorna la credenza e restituisce buy, sell o hold secondo la mappa. Si adatta così al contratto di strategia (sezione «Il contratto di strategia, forma per forma» della rassegna):

- **`labels`**: i K regimi (salita, laterale, calo). È la scelta più naturale tra le forme, perché le altre devono derivare le etichette da fasce dell'uscita; qui sono già nel modello.
- **`describe()`**: la credenza (K numeri) e il regime più probabile; si possono mostrare nella tabella o nel grafico del PoC come lo stato dell'FSM.
- **`serialize()`**: le matrici, la credenza iniziale e la mappa come JSON (numeri e poche scelte).
- **`reset()`**: riporta la credenza alla credenza iniziale, come per gli IIR (`algorithm.js`, righe 342-358).
- **`crossover` e `mutate`**: da scrivere, con la rinormalizzazione delle righe e, se si vuole, l'ordinamento dei regimi (R3 ed E2).

Una parte che non si adatta da sola: la discretizzazione dell'osservazione (le soglie ±0,5 per cento) e il tipo di osservazione (solo prezzo, o anche volume) non sono dati dal motore: sono scelte di progetto, da fare insieme alla ricerca sugli indicatori (R2).

### 9.8 Cosa dice la letteratura

- **Algoritmo in avanti e stima.** Rabiner [2] (letto per le parti citate) definisce il filtro in avanti, lo scaling, la decodifica di Viterbi e l'algoritmo di Baum-Welch. Il testo riguarda il **riconoscimento del parlato**, non la finanza.
- **Regimi nell'economia e nei mercati.** Hamilton [12] introduce un modello di cambio di regime a stati discreti di Markov in economia (scheda con abstract, non letto per intero). Ang e Timmermann [13] trattano i cambi di regime nei mercati finanziari (scheda con abstract). Gupta e altri [14] (letto in parte) propongono un insieme di modelli HMM per rilevare i cambi di regime nei mercati e fare trading. Di nessuno riportiamo risultati.
- **HMM con algoritmo genetico nel trading.** Nessuna fonte letta: la rassegna non l'ha trovata. **[ipotesi]** che sia possibile (i parametri sono numeri evolvibili); non è accertato che funzioni.
- **Equivalenza con altri filtri.** L'idea che la credenza in avanti sia una media «a più canali» pesata da regimi è una lettura nostra, **[ipotesi]**.

### 9.9 In breve

- L'HMM tiene una **credenza** (una probabilità per regime) e la aggiorna ogni giorno con due matrici: transizione tra regimi e osservazione del movimento di prezzo; la decisione si legge dal regime più probabile.
- Sul dataset giocattolo con tre regimi e matrici scelte a mano: operazioni ai giorni 3, 11 e 17, **+10,68 per cento**, contro +12,87 per cento del buy&hold, con ritardo di uno o due giorni alle svolte e prudenza davanti al singolo rimbalzo. Numeri inventati.
- Il genoma ha 14 numeri liberi nell'esempio, più la mappa regime → azione; mutazione e crossover richiedono la rinormalizzazione delle righe e, per il crossover, l'ordinamento dei regimi.
- Stimare le matrici su tutta la storia (Baum-Welch) fa anticipare i dati futuri: sull'esempio il «regime con il senno di poi» dà +15,55 per cento. Il metodo di stima è rimandato a R6.
- È una **macchina a stati probabilistica**: stati discreti e transizioni come l'FSM, con stati morbidi e transizioni calcolate. È ammessa come forma da valutare; le etichette (`labels`) sono i regimi.
- Nessuna fonte letta sull'uso con un algoritmo genetico nel trading.

## 10. Confronto e guida alla scelta

Questo capitolo mette a confronto le sette forme descritte nei capitoli da 3 a 9 (la macchina a stati attuale compresa), mostra che cosa decide ciascun esempio giorno per giorno sullo stesso dataset e raccoglie le domande che restano a Luca. **Non sceglie al posto di Luca**: le opzioni di default sono suggerimenti prudenti e sono dichiarate tali.

### 10.1 Le sette forme a confronto

La tabella usa parole semplici. I giudizi su leggibilità ed espressività sono quelli dei capitoli e della rassegna, in buona parte **[ipotesi]** dell'autore. La colonna dei numeri riporta i conteggi dei capitoli, che dipendono dagli esempi scelti (6 ingressi di esempio dove non è detto altro).

| Forma | In una riga | Che cosa ricorda del passato | Che cosa sa esprimere | Quanto si legge | Quanti numeri ha | Da tenere presente |
|---|---|---|---|---|---|---|
| Macchina a stati attuale (capitolo 3) | Nove stati collegati da regole, a ogni stato può corrispondere un acquisto | Lo stato in cui si trova, più quattro medie mobili esponenziali | Più condizioni insieme e sequenze («prima A, poi B») | A metà: il grafo si legge, lo stato di oggi richiede di ripercorrere la storia | 11 numeri continui più una struttura variabile (nel genoma fisso 36 transizioni e 135 identificatori di condizione) | Già integrata nel motore. La memoria è scoperta dall'evoluzione e i nomi degli stati non hanno un significato |
| Punteggio lineare (capitolo 4) | Somma pesata di indicatori e due soglie | Solo gli indicatori a monte (con Kalman, anche un piccolo stato continuo) | Una soglia su un mix di indicatori, niente «A e B» a meno di ingressi preparati | Molto: si vede il contributo di ogni ingresso | Circa 9 con 6 ingressi, 2 nella forma minima | Gli ingressi vanno portati sulla stessa scala. Ogni figlio è un genoma valido |
| Alberi di espressioni, GP (capitolo 5) | Una formula ad albero che l'evoluzione fa crescere e cambia | Indicatori a monte, oppure anche registri propri | Quasi qualsiasi funzione degli ingressi, dimensione permettendo | Un albero piccolo sì, uno grande no | Variabile: nessun numero fisso (l'esempio ha 21 nodi e una costante) | Gli alberi tendono a crescere senza migliorare (bloat); molti rami non scattano mai |
| Lista di regole (capitolo 6) | Elenco ordinato di «se condizione allora azione», vince la prima vera | Solo gli indicatori a monte | Regioni delimitate da confronti, congiunzioni; non il tempo trascorso | Molto: si legge come un regolamento, se è corta | Variabile (l'esempio ha 2 margini; con 5 regole da 3 condizioni sono circa 15 confronti **[ipotesi]**) | Il crossover può dare figli senza senso; l'ordine delle regole conta |
| Reti neurali, MLP e NEAT (capitolo 7) | Piccoli calcoli collegati da pesi, con una funzione che li schiaccia | Indicatori a monte, oppure anche collegamenti ricorrenti | Funzioni continue qualsiasi, con abbastanza neuroni | Poco: il significato è distribuito tra i pesi | 11 nell'esempio, 43 in una rete da 6 ingressi e 4 neuroni nascosti; NEAT variabile | Due reti equivalenti con neuroni in ordine diverso danno figli scadenti (NEAT lo risolve con più complessità) |
| Logica fuzzy (capitolo 8) | Regole con gradi tra 0 e 1, un numero finale e due soglie | Solo gli indicatori a monte | Regioni sovrapposte con passaggio graduale, congiunzioni | In parte: le regole si leggono, l'uscita è una media pesata | 15 numeri e 5 scelte nell'esempio; 42-54 con 6 ingressi, più la base di regole | Molti parametri; crossover e mutazione devono riordinare e limitare i numeri |
| Modello a stati nascosti, HMM (capitolo 9) | Una probabilità per ogni regime di mercato, aggiornata ogni giorno | Una credenza (vettore di probabilità) che si aggiorna da sola | Decisione a tratti, una regione per regime, con dinamica nel tempo | A metà: i regimi hanno un nome, la credenza richiede di eseguire la ricorsione | 14 nell'esempio; circa 44 nella rassegna (osservazioni continue) | È una macchina a stati probabilistica; stimare i numeri su tutta la serie anticipa i dati; i regimi evoluti vanno ordinati prima del crossover **[ipotesi]** |

Alcuni conteggi (le operazioni per barra) sono stime a mano degli autori e non sono state misurate; con i parametri di esempio la rassegna colloca tutte le forme tra decine e centinaia di operazioni per barra, quindi il costo di calcolo per barra non distingue le forme.

### 10.2 Che cosa usa ciascun esempio

Gli esempi dei capitoli non sono costruiti per essere confrontabili: ognuno usa gli ingressi e i parametri più semplici che mostrano il meccanismo. La tabella dice che cosa c'è dietro la griglia della sezione successiva.

| Esempio | Ingressi usati | Parametri | Scelti da |
|---|---|---|---|
| Macchina a stati (ridotta a 3 stati, capitolo 3) | EMA veloce (c = 0,5) e lenta (c = 0,2) del prezzo | Tabella di 4 transizioni, margine 0 | A mano |
| Punteggio lineare, esempio A (capitolo 4) | `x1`, `x2`, `x3` (distanza dalla EMA lenta, distanza tra le EMA, scarto del volume) | Pesi 1, 1, 10, bias 0, soglie +3 e -3 | A mano |
| Albero, albero A (capitolo 5) | Prezzo, EMA veloce e lenta, volume e sua EMA | 21 nodi, una costante (1,1) | A mano |
| Lista di regole, lista A (capitolo 6) | Prezzo, EMA lenta, volume e sua EMA | Margini 1% | A mano |
| Rete, MLP 3-2-1 (capitolo 7) | `x1`, `x2`, `x3` | 11 pesi, soglie ±0,5 | A mano |
| Fuzzy (capitolo 8) | `D` (come `x1`) e `R` (volume diviso la sua EMA) | 15 numeri e 5 scelte, soglie ±0,3 | A mano |
| HMM (capitolo 9) | Solo la variazione giornaliera del prezzo, in tre simboli (su, fermo, giù); il volume non è usato | Due matrici e una credenza iniziale | A mano |

Nessuno di questi parametri è stato evoluto: sono scelti a mano, su questi stessi 20 giorni, solo per far funzionare il meccanismo.

### 10.3 Le decisioni giorno per giorno

> **Questa non è una classifica.** I parametri di ogni esempio sono scelti a mano, su questi 20 giorni inventati, solo per mostrare il meccanismo di ciascuna forma. La griglia dice una cosa sola: **forme diverse, con parametri diversi, decidono in modo diverso sugli stessi dati**. Non dice quale forma sia migliore né quale darebbe un risultato migliore con parametri evoluti o su dati veri. I valori finali sono riportati per completezza e non vanno confrontati tra loro come prove di qualità.

La tabella riporta la decisione presa **alla chiusura di ogni giorno** da ciascun esempio. Il valutatore la esegue al prezzo del giorno dopo; un `buy` con la posizione già aperta, un `sell` senza posizione e la decisione del giorno 20 non producono operazioni. I segnali sono stati ricalcolati per questa guida con uno script indipendente da quelli dei capitoli e coincidono con le tabelle dei capitoli.

| Giorno | Prezzo | Macchina a stati (cap. 3) | Punteggio lineare (cap. 4) | Albero (cap. 5) | Lista di regole (cap. 6) | Rete MLP (cap. 7) | Fuzzy (cap. 8) | HMM (cap. 9) |
|---|---|---|---|---|---|---|---|---|
| 1 | 10,00 | sell | hold | hold | hold | hold | hold | hold |
| 2 | 10,10 | hold | hold | hold | hold | hold | hold | buy |
| 3 | 10,30 | buy | buy | buy | buy | buy | buy | buy |
| 4 | 10,55 | buy | buy | buy | buy | hold | buy | buy |
| 5 | 10,80 | buy | buy | buy | buy | hold | buy | buy |
| 6 | 11,00 | buy | buy | buy | buy | hold | buy | buy |
| 7 | 11,20 | buy | buy | buy | buy | hold | buy | buy |
| 8 | 11,35 | buy | buy | hold | hold | hold | buy | buy |
| 9 | 11,30 | buy | buy | hold | hold | buy | buy | buy |
| 10 | 11,10 | buy | buy | hold | hold | buy | buy | sell |
| 11 | 10,80 | buy | buy | sell | hold | hold | hold | sell |
| 12 | 10,50 | sell | hold | sell | sell | sell | sell | sell |
| 13 | 10,30 | sell | sell | sell | sell | sell | sell | sell |
| 14 | 10,20 | sell | sell | sell | sell | sell | sell | sell |
| 15 | 10,35 | sell | sell | sell | sell | sell | hold | sell |
| 16 | 10,55 | sell | hold | sell | hold | hold | hold | buy |
| 17 | 10,80 | hold | hold | hold | hold | buy | buy | buy |
| 18 | 11,05 | buy | buy | hold | buy | buy | buy | buy |
| 19 | 11,25 | buy | buy | hold | buy | buy | buy | buy |
| 20 | 11,40 | buy | buy | hold | hold | buy | buy | buy |

Operazioni e valori finali degli stessi esempi (valutatore comune, capitale 1000, nessun costo; il buy&hold compra il giorno 2 a 10,10):

| Esempio | Operazioni (giorno di esecuzione, tipo, prezzo) | Valore finale | Rendimento |
|---|---|---|---|
| Macchina a stati (cap. 3) | g. 4 buy 10,55; g. 13 sell 10,30; g. 19 buy 11,25 | 989,32 | -1,07 % |
| Punteggio lineare (cap. 4) | g. 4 buy 10,55; g. 14 sell 10,20; g. 19 buy 11,25 | 979,72 | -2,03 % |
| Albero (cap. 5) | g. 4 buy 10,55; g. 12 sell 10,50 | 995,26 | -0,47 % |
| Lista di regole (cap. 6) | g. 4 buy 10,55; g. 13 sell 10,30; g. 19 buy 11,25 | 989,32 | -1,07 % |
| Rete MLP (cap. 7) | g. 4 buy 10,55; g. 13 sell 10,30; g. 18 buy 11,05 | 1007,23 | +0,72 % |
| Fuzzy (cap. 8) | g. 4 buy 10,55; g. 13 sell 10,30; g. 18 buy 11,05 | 1007,23 | +0,72 % |
| HMM (cap. 9) | g. 3 buy 10,30; g. 11 sell 10,80; g. 17 buy 10,80 | 1106,80 | +10,68 % |
| Buy&hold (riferimento) | g. 2 buy 10,10 | 1128,71 | +12,87 % |

Che cosa si legge, senza trarne conclusioni sulla qualità:

- I sette esempi decidono allo stesso modo solo nei giorni 3, 13, 14. Negli altri 17 giorni almeno un esempio decide diversamente dagli altri.
- Il giorno 11 compaiono tutte e tre le mosse: macchina a stati e punteggio lineare dicono `buy`, albero e HMM dicono `sell`, lista di regole, rete e fuzzy dicono `hold`. Dietro c'è il fatto che in quel giorno il prezzo scende sotto la media lenta mentre la media veloce è ancora sopra: ogni forma pesa questa situazione in modo diverso.
- L'HMM è l'unico a decidere `buy` il giorno 2, l'unico a decidere `sell` il giorno 10 e l'unico a decidere `buy` il giorno 16. Guarda solo la variazione giornaliera del prezzo, senza medie lente né volume: le sue decisioni seguono la credenza sui regimi e non la distanza dalle medie (capitolo 9).
- Decisioni diverse non implicano operazioni diverse. La macchina a stati e la lista di regole fanno le stesse tre operazioni pur decidendo in modo diverso in 7 giorni; la rete e il fuzzy fanno le stesse tre operazioni pur decidendo in modo diverso in 6 giorni. Molte differenze cadono mentre la posizione è già aperta (un `buy` in più o in meno non cambia nulla) oppure nell'ultimo giorno, la cui decisione è ignorata.
- L'albero è l'unico che fa due sole operazioni: dopo la vendita del giorno 12 il suo ingresso richiede un volume sopra la media e non scatta più (capitolo 5). Gli altri sei fanno tre operazioni ciascuno: un acquisto, una vendita e un riacquisto, in giorni che cambiano da esempio a esempio.
- Questo è un effetto dei parametri scelti a mano, non una proprietà delle forme: con altri numeri, anche la stessa forma deciderebbe in modo diverso (nei capitoli da 3 a 9 la mutazione di un solo numero cambia spesso alcune decisioni sullo stesso dataset, anche se qualche mutazione è neutra).

### 10.4 Le domande per Luca

Le domande sono quelle della rassegna, riscritte con esempi. Per ciascuna si dice che cosa cambia nella pratica a seconda della risposta e, dove ha senso, si indica **un'opzione prudente di default**. Il default è un suggerimento, non una decisione: la scelta è di Luca e va registrata nel file del ciclo (`.swhouse/cycles/current-010.md`, blocco «Human Verification»), non in questo documento.

#### Domanda 1 (già risolta, richiamata come premessa)

Il requisito «la memoria non deve venire da una macchina a stati» **non è stringente**. Ne segue che l'HMM e le reti ricorrenti sono ammessi come forme da valutare, anche se hanno stati interni. Le altre domande partono da qui.

#### Domanda 2. Ricorrenze e registri: la forma può avere una memoria propria?

In parole semplici: oltre alla memoria che arriva dagli indicatori (le medie mobili e simili), il genoma può avere **una variabile sua** che si porta dietro da un giorno all'altro (un registro in un albero, un collegamento ricorrente in una rete)? Questa domanda tocca soprattutto gli alberi (capitolo 5) e le reti (capitolo 7).

| | Risposta «no, solo indicatori a monte» | Risposta «sì, si ammettono registri e ricorrenze» |
|---|---|---|
| Che cosa cambia nella pratica | Il programma o la rete sono funzioni pure: stesso ingresso, stessa risposta. `reset()` non ha nulla da azzerare oltre agli indicatori. Si testano con una tabella di ingressi | Il genoma tiene uno stato che `reset()` deve azzerare. Per capire una decisione si deve rifare la sequenza dei giorni precedenti |
| Che cosa si guadagna | Più leggibilità e collaudo semplice | Una memoria su misura, che nessun indicatore offre: per esempio «il massimo del prezzo dopo l'acquisto» (capitolo 5) o «il volume è stato alto negli ultimi giorni» (capitolo 7) |
| Che cosa si perde | Se manca un indicatore utile, il genoma non può inventarselo: una regola come «vendi tre giorni dopo l'acquisto» non si scrive (capitolo 6) | Leggibilità, ricerca più ampia, una mutazione si propaga su tutti i giorni successivi, rischio di ricreare di nascosto una macchina a stati, cioè ciò che si voleva lasciare |
| Effetto sui candidati | A resta com'è (nessuno stato, salvo il piccolo stato dell'osservatore di Kalman). B resta nella variante «solo indicatori» | B si estende alla variante «con memoria interna» senza cambiare candidato |

**Opzione prudente di default (suggerimento).** Partire con «no, solo indicatori a monte», e riaprire la domanda in E2 solo se si vede che un indicatore utile manca. Il motivo è che la scelta si può allargare dopo (B si estende senza cambiare candidato), mentre è più difficile tornare indietro da un genoma con stato interno **[ipotesi]**.

#### Domanda 3. Quanto pesa la leggibilità rispetto all'espressività?

In parole semplici: quanto è importante poter dire, guardando un giorno del grafico, «ha comprato perché...», rispetto al poter scrivere regole più complesse? La rassegna non assegna pesi, perché sarebbe una scelta di valore.

- **Peso alto sulla leggibilità.** Si orientano le scelte verso il punteggio lineare (capitolo 4, si vede il contributo di ogni ingresso), la lista di regole corta (capitolo 6) e alberi piccoli. Si accetta di non poter scrivere «A e B insieme» tra indicatori che non siano già stati combinati a monte.
- **Peso alto sull'espressività.** Si orientano verso gli alberi (capitolo 5) e le reti (capitolo 7). Si accetta che l'albero cresca o che la rete abbia significato solo come insieme di pesi, e che spiegare una decisione richieda di rifare il calcolo.
- **In mezzo.** La logica fuzzy (capitolo 8) e l'HMM (capitolo 9) si leggono «con calcolo»: ogni regola o regime si legge, la decisione finale richiede di aggregare.

Un criterio che può aiutare: il PoC è uno strumento di ispezione storica (si mostra giorno per giorno che cosa ha fatto la strategia), quindi la capacità di spiegare una decisione ha un valore diretto per chi guarda.

**Opzione prudente di default (suggerimento).** Partire dal lato leggibile e salire in espressività solo se E2 mostra che serve. La forma minima del capitolo 4 (un filtro e una soglia) dà il metro: una forma più ricca deve giustificare ciò che aggiunge.

#### Domanda 4. Un candidato o due? Una forma semplice e una ricca, o due dello stesso livello?

In parole semplici: E2 implementa una sola forma, o due da confrontare?

| Scelta | Che cosa cambia nella pratica |
|---|---|
| **Solo A** (punteggio lineare, con la forma minima come metro) | Un'implementazione sola, semplice (ganci di indicatori e decisione, crossover aritmetico, tre etichette). Se A non basta lo si scopre dopo aver investito in A |
| **Solo B** (alberi, «solo indicatori») | Un valutatore ricorsivo, crossover tra sottoalberi, limite di dimensione contro il bloat, etichette dalle azioni. Più capacità, più rischio di adattarsi al rumore dei dati |
| **A e B insieme** (una semplice e una ricca) | Due implementazioni dello stesso contratto e un confronto sulla stessa fitness e sullo stesso protocollo di valutazione. Costo doppio, ma se la forma ricca non fa meglio di quella semplice su dati non usati per l'evoluzione lo si vede subito |
| **Due forme dello stesso livello** (per esempio punteggio lineare e lista di regole) | Si confronta la leggibilità a parità di semplicità; resta aperta la domanda se serva una forma più espressiva |

**Opzione prudente di default (suggerimento).** È la proposta della rassegna: A (con la forma minima come metro) come base e B come secondo candidato. Si limita il costo perché le due forme condividono gli stessi ganci del contratto e lo stesso modo di calcolare gli indicatori.

#### Domanda 5. Si vuole l'esperimento di controllo?

In parole semplici: la rassegna dice che le forme con più numeri si adattano più facilmente al rumore dei dati, ma questa è un'**[ipotesi]**, non una misura. L'esperimento di controllo la misurerebbe: far evolvere ogni forma con lo stesso budget e la stessa fitness su serie senza struttura prevedibile (dove nessuna strategia dovrebbe funzionare) e misurare il divario tra risultato in addestramento e risultato su dati nuovi. Misurerebbe forma e fitness insieme, non la forma da sola.

| Risposta | Che cosa cambia nella pratica |
|---|---|
| **Sì, in un ciclo futuro** | Serve codice e calcolo su dati (fuori dal perimetro di questo ciclo). Si ottiene un dato sulla capacità di adattarsi al rumore di ogni forma implementata. Va deciso a valle di quale ciclo: dopo E2 (quando esistono almeno due forme) o dopo R6 (protocollo di valutazione) |
| **No** | Si resta con l'ipotesi e si affida il controllo del sovradattamento al protocollo di valutazione (R6) e alle tre separazioni di dati del capitolo 2 |

**Opzione prudente di default (suggerimento).** Rimandare la decisione a dopo E2: prima dell'implementazione non c'è codice da mettere alla prova, e l'esperimento ha senso solo con almeno due forme da confrontare.

### 10.5 I candidati A e B, in parole semplici

**Candidato A: punteggio lineare con soglie.**

- *Che cos'è.* Ogni indicatore ha un peso, si sommano i prodotti e due soglie traducono il totale in `buy`, `sell` o `hold` (capitolo 4).
- *Perché è la base prudente.* Pochi numeri (9 con 6 ingressi di esempio, contro i 43 pesi di una rete di esempio), quindi meno capacità di adattarsi al rumore su 2517 barre di un solo titolo [4], **[ipotesi]**; lettura diretta; crossover e mutazione naturali; adattamento minimo al contratto (tre fasce del punteggio come etichette); memoria negli indicatori, senza stato da azzerare. La sua forma minima fa da metro.
- *Condizioni di scarto.* Si passa a B se E2 mostra che le decisioni utili richiedono congiunzioni tra indicatori (per esempio «prezzo sopra il filtro **e** volume sopra la media»), che una somma pesata non rappresenta, o se la memoria degli indicatori di R2 non basta e serve uno stato proprio.

**Candidato B: alberi di espressioni, variante «solo indicatori».**

- *Che cos'è.* Una formula ad albero, che l'evoluzione fa crescere e modifica, legge gli indicatori e restituisce la decisione (capitolo 5).
- *Perché è un candidato.* Espressività universale e crossover naturale sui sottoalberi [5]; insieme agli algoritmi genetici è una delle forme più studiate per scoprire regole di trading con metodi evolutivi [7] (letto l'abstract). Copre ciò che A non rappresenta e può esprimere come caso particolare un punteggio lineare o una lista di regole **[ipotesi]**.
- *Condizioni di scarto.* Si passa ad A o alla lista di regole se, in E2, la dimensione degli alberi cresce senza miglioramento (bloat) [5], se gli alberi evoluti non sono più leggibili, o se il divario tra fitness di addestramento e di valutazione cresce con la dimensione dell'albero.

**Che cosa significherebbe scegliere l'uno, l'altro o entrambi.** Le conseguenze per le ricerche R2-R6 sono un ragionamento dell'autore su come sono fatte le forme, **[ipotesi]**, non un risultato.

| | Scegliere A | Scegliere B | Scegliere entrambi |
|---|---|---|---|
| R2, indicatori | Gli indicatori sono l'unica memoria e vanno su scala comparabile; le combinazioni «A e B» vanno fornite già pronte (per esempio un ingresso prodotto) | Un insieme più ricco di indicatori semplici, che l'albero combina da sé; l'insieme delle funzioni ammesse va fissato | Un unico elenco di indicatori per entrambe, quindi si sceglie una volta sola |
| R3, codifica genetica | Vettore di numeri reali: crossover per scelta o aritmetico e mutazione standard, soglie da tenere in ordine | Albero (o sequenza di istruzioni): crossover tra sottoalberi, limite di profondità o penalità di dimensione contro il bloat | Due codifiche e due serie di operatori da scrivere |
| R4, equazioni di decisione | La decisione è la somma pesata con due soglie: poca libertà, tutto è nei pesi | La decisione è in larga parte il genoma stesso: l'equazione è ciò che evolve | Due equazioni da confrontare sugli stessi dati |
| R5 e R6, fitness e protocollo | Meno rischio di adattarsi al rumore, ma servono comunque la separazione addestramento, validazione e prova finale e una fitness che guardi il rischio | Il rischio di adattarsi al rumore è più alto (struttura variabile), quindi il protocollo di valutazione pesa di più | Si possono confrontare le due forme con la stessa fitness e lo stesso protocollo |
| E2, implementazione | Un'implementazione semplice sui ganci `initIndicators`, `updateIndicators`, `resetIndicators`, `decide`; tre etichette | Un valutatore ricorsivo, un limite di dimensione e le etichette dalle azioni o dalle fasce dell'uscita | Due classi sullo stesso contratto, più il codice per confrontarle |

Le forme di riserva (lista di regole, reti, fuzzy) e di confine (HMM) hanno una scheda piena nei capitoli 6-9; la rassegna non le porta come candidati per i motivi riportati lì (HMM: stima dei parametri senza anticipazione e nessuna fonte sull'uso con un algoritmo genetico nel trading; reti e fuzzy: nessun criterio per cui servano rispetto ad A e B **[ipotesi]**).

### 10.6 Che cosa non si è potuto accertare

- **Applicazione al trading** di HMM, Kalman, reti ricorrenti e reservoir con un algoritmo genetico: nessuna fonte letta. [12], [13] e [14] trattano regimi in economia e nei mercati, non strategie evolute.
- **Equivalenza tra il filtro di Kalman a guadagno costante e il livellamento esponenziale doppio**: [15] presenta i modelli ma non l'equivalenza.
- **Fonti non lette nel testo**: [6] (solo il riassunto di un corso), [7], [10], [12], [13] e [16] (solo scheda o abstract). Learning classifier system (Urbanowicz e Moore, 2009) e CART (Breiman e altri, 1984) sono state identificate e non verificate, e non sono usate come prova. Il lavoro di Fogel sulle macchine a stati evolute (capitolo 3) è citato come **[ipotesi]**, senza averlo cercato.
- **Fuzzy come approssimatore universale** e **uso di reti e fuzzy con un algoritmo genetico nel trading** (oltre a [11]): non verificati.
- **Capacità di adattamento al rumore per forma**: non misurata (domanda 5).
- **Costo di calcolo**: i conteggi di operazioni per barra sono stime a mano degli autori, non misure.
- **Tutta l'adeguatezza al contratto** è sulla carta fino a E2: il contratto è provato con una sola strategia di test.
- **Dettagli del genoma attuale rimasti aperti** (capitolo 3): per lo stato SW la lista con chiave `_SW` è collegata alla direzione sud, il cui vicino sulla griglia avvolta è NW, mentre per le altre 35 uscite chiave e vicino coincidono (voluto o residuo della traduzione dal C++?); la mutazione dei coefficienti dei filtri sembra tenerli tra 0,001 e 0,5, quindi i valori 0,73 e 0,99 del genoma fisso non sarebbero raggiungibili con la sola mutazione (lettura del codice, non provata); la mutazione «raw» degli stati usa chiavi che non corrispondono ai nomi di stato di arrivo (da controllare prima di scrivere qualcosa sulla mutazione reale); non è stato verificato che cosa faccia il `Trader` se riceve un `buy` con una posizione già aperta.
- **Parti del codice di Consilium non rilette** (capitolo 2): il significato esatto del campo `success_rate` e le righe del crossover degli stati in `ga/ga.js`.
- **Tutti i numeri degli esempi sono inventati**: nessuna cifra della guida è un risultato su dati reali.

## Glossario

- **Addestramento (training).** Parte dei dati su cui l'algoritmo genetico valuta i genomi e li fa evolvere. Si affianca a validazione e prova finale.
- **Aggregazione (fuzzy).** Unione delle regole che hanno la stessa conclusione; negli esempi si prende il massimo dei loro gradi.
- **Algoritmo genetico (GA).** Metodo di ricerca che fa evolvere una popolazione di candidati con selezione, crossover (scambio di parti tra due genitori) e mutazione (piccole modifiche casuali).
- **Anticipazione dei dati (look-ahead bias).** Errore per cui una decisione usa informazioni non ancora disponibili quel giorno, e il risultato appare migliore di quello ottenibile davvero.
- **Azione.** Quota di proprietà di un'azienda quotata in borsa, che si compra e si vende. (Nel resto della guida «azione» indica anche la decisione `buy`, `sell` o `hold`: il contesto chiarisce.)
- **Backtest.** Prova di una strategia sui dati storici, come se fosse stata applicata allora.
- **Barra.** Un periodo di negoziazione (qui un giorno) riassunto nei suoi valori OHLCV.
- **Baum-Welch (EM).** Metodo classico per stimare i numeri di un modello a stati nascosti da una sequenza intera di dati. Usa anche i giorni successivi a ciascun giorno, quindi può anticipare i dati.
- **Bias.** Costante che si somma alla somma pesata degli ingressi di un punteggio o di un neurone; in una rete è un peso senza ingresso.
- **Bloat.** Crescita della dimensione degli alberi evoluti senza miglioramento della fitness.
- **Buy&hold.** Strategia di riferimento: comprare all'inizio e tenere fino alla fine, senza altre operazioni.
- **CAGR (compound annual growth rate).** Tasso di crescita annuo composto: il rendimento annuo costante che porterebbe dal capitale iniziale a quello finale. È la fitness attuale di Consilium.
- **Candidato A, candidato B.** Le due forme che la rassegna porta a Luca come candidate: A è il punteggio lineare con soglie, B sono gli alberi di espressioni (programmazione genetica) nella variante «solo indicatori». Nessuna delle due è una scelta già fatta.
- **Capitale.** Denaro di partenza di una simulazione (1000 negli esempi).
- **Classificatore lineare.** Regola che decide in base a una somma pesata degli ingressi confrontata con una soglia. È il nome in uso per il punteggio lineare **[ipotesi, fonte da verificare]**.
- **Codice morto (introne).** Parte di un programma che non viene mai eseguita o che non cambia il risultato.
- **Competing conventions (convenzioni concorrenti).** Due genomi che calcolano la stessa cosa con neuroni o regimi in ordine diverso: mescolarli con un crossover ingenuo produce figli scadenti.
- **Condizione.** Confronto che dà vero o falso. Nel genoma Consilium ce ne sono 14, numerate da 0 a 13.
- **Congiunzione.** Condizione composta da più confronti uniti da «e»: è vera solo se lo sono tutti.
- **Connessione ricorrente.** Collegamento di una rete che riporta il valore di un neurone al giorno dopo, dando alla rete una memoria propria.
- **Consilium.** Il progetto da cui il motore genetico e il genoma attuale sono ereditati. Il repository Consilium ospita l'evoluzione; SwarmTrader-core riproduce nel browser un genoma già evoluto.
- **Contratto di strategia.** L'insieme dei membri che una forma deve avere per girare nel motore: `kind`, `labels`, `describe()`, `serialize()`, `reset()` e i ganci per indicatori e decisione.
- **Convergenza.** Il fatto che i genomi di una popolazione diventino simili e i voti smettano di migliorare.
- **Costi di transazione.** Commissioni e scarti di prezzo pagati a ogni operazione. Gli esempi della guida li trascurano.
- **Credenza.** Nel modello a stati nascosti, il vettore di probabilità (una per regime) aggiornato ogni giorno.
- **Crossover.** Operazione che produce un figlio combinando parti di due genitori. Può essere per scelta (copia di singoli geni) o aritmetico (media).
- **Dataset giocattolo.** I 20 giorni di prezzi e volumi inventati usati in tutti gli esempi della guida. Non rappresentano nessun mercato reale.
- **Defuzzificazione.** Passaggio da più gradi di appartenenza a un solo numero; negli esempi è una media pesata dei centri.
- **Deviazione standard.** Misura di quanto un valore varia di solito intorno alla sua media.
- **Distanza dalla media (`x1`, `D`).** Di quanti punti percentuali il prezzo sta sopra (positivo) o sotto (negativo) la propria media: `(prezzo / EMA - 1) * 100`.
- **E2.** Fase di implementazione dell'epica, che segue le ricerche R1…R6: qui si scrive il codice della forma scelta.
- **Elitismo.** Tecnica che passa invariati alla generazione successiva i genomi migliori.
- **Epica.** Gruppo di lavori del progetto (qui: il genoma non basato su macchina a stati) diviso in ricerche (R1…R6) e implementazione (E2).
- **Espressività.** Che cosa una forma di genoma sa rappresentare: quali regole di decisione può scrivere.
- **Feedforward.** Rete senza memoria interna: l'uscita dipende solo dagli ingressi del momento.
- **Filtro alfa-beta.** Stima ricorsiva di livello e pendenza di una serie con due guadagni fissi, `alfa` e `beta`. È la versione semplice dell'osservatore di Kalman usata nell'esempio.
- **Filtro di Kalman.** Metodo classico per stimare in modo ricorsivo grandezze nascoste di un sistema lineare con rumore [3].
- **Filtro in avanti (forward).** Aggiornamento giornaliero della credenza di un modello a stati nascosti con una previsione e una correzione [2].
- **Fitness.** Numero che dice quanto un candidato è «buono» per l'algoritmo genetico; oggi in Consilium è basato sul CAGR.
- **Forma di genoma.** Il modo di rappresentare una strategia con numeri e scelte: macchina a stati, punteggio lineare, albero, lista di regole, rete, fuzzy, HMM.
- **Forma minima.** Punteggio lineare con un solo filtro e una soglia (due numeri nel genoma), usato come metro di confronto per le forme più ricche.
- **Funzione di appartenenza.** Funzione che associa a un numero il suo grado in un insieme fuzzy (negli esempi una rampa o un triangolo).
- **Funzione di attivazione (`tanh`).** Funzione che schiaccia un numero tra -1 e +1; è ciò che rende una rete non lineare.
- **Fuzzificazione.** Passaggio da un numero ai suoi gradi di appartenenza.
- **Gene.** Uno dei numeri (o delle scelte) che compongono un genoma.
- **Generazione.** Un ciclo completo di valutazione, selezione e produzione di nuovi genomi.
- **Genoma.** L'insieme dei parametri che definiscono una strategia, ciò che l'algoritmo genetico fa evolvere.
- **GP lineare, GP cartesiana.** Varianti della programmazione genetica: sequenza di istruzioni che usano registri; genoma di interi che descrive un grafo di funzioni [5].
- **Grado di appartenenza.** Numero tra 0 e 1 che dice quanto un valore appartiene a un insieme fuzzy.
- **Grado di attivazione.** Grado con cui una regola fuzzy scatta: minimo («e») o massimo («o») dei gradi della sua condizione.
- **Griglia avvolta (toro).** Griglia in cui uscire da un bordo riporta al bordo opposto; è la disposizione dei nove stati del genoma attuale.
- **HMM (modello a stati nascosti).** Modello in cui il mercato è in uno di K regimi non osservati, che cambiano con probabilità fisse; di essi si vedono solo gli effetti (le osservazioni) [2].
- **Holdout.** Parte finale dei dati tenuta fuori dall'addestramento per una verifica.
- **IIR (infinite impulse response).** Filtro ricorsivo: ogni valore dipende dal valore precedente dell'uscita oltre che dal dato nuovo. La media mobile esponenziale è un filtro IIR.
- **Indicatore (tecnico).** Numero calcolato dai prezzi e dai volumi passati per riassumerne l'andamento, per esempio una media mobile.
- **Ingresso.** Indicatore calcolato dai dati passati e consegnato a una forma di genoma.
- **Insieme fuzzy.** Insieme in cui ogni elemento ha un grado di appartenenza tra 0 e 1.
- **Interazione.** Caso in cui l'effetto di un indicatore dipende dal valore di un altro («se A e B allora...»).
- **Interpretabilità.** Quanto si capisce perché una forma ha deciso in un certo modo, leggendo il genoma.
- **Learning classifier system (LCS).** Sistemi che fanno evolvere regole «se condizione allora azione»: nello stile Michigan ogni individuo è una regola e a ogni regola si associa una forza appresa; nello stile Pittsburgh ogni individuo è un insieme completo di regole **[ipotesi, fonte da verificare]**.
- **Lineare.** Che dipende dagli ingressi solo tramite una somma di prodotti con costanti, senza interazioni tra gli ingressi.
- **Lista di decisione (decision list).** Nome in letteratura della lista di regole [8].
- **Lista di regole (rule list).** Elenco ordinato di coppie «condizione, azione»: si applica la prima regola con condizione vera; l'ultima è sempre vera.
- **Livello, pendenza, residuo.** Nel filtro alfa-beta: posizione stimata del prezzo, sua variazione giornaliera stimata, errore tra il prezzo osservato e la previsione.
- **Macchina a stati (FSM).** Insieme finito di stati con regole di transizione tra uno stato e l'altro in base a condizioni sui dati; lo stato ricorda ciò che è successo prima.
- **Margine.** Percentuale del genoma che sposta la soglia di un confronto, per non reagire a differenze minime.
- **Massimo calo (maximum drawdown).** La perdita più grande dal valore massimo raggiunto in precedenza.
- **Massimo locale.** Soluzione che nessuna piccola modifica migliora, ma che non è la migliore possibile.
- **Matrice di transizione.** Probabilità di passare da un regime all'altro in un giorno; ogni riga somma 1.
- **Media mobile esponenziale (EMA).** Media che pesa di più i dati recenti: `e[t] = e[t-1] * (1 - c) + x[t] * c`. Il coefficiente `c` è il peso del dato nuovo: vicino a 1 poca memoria, vicino a 0 molta. Nel codice di Consilium si chiama filtro IIR.
- **Media mobile semplice (SMA).** Media degli ultimi N valori.
- **Memoria a monte.** Storia del passato riassunta dagli indicatori, calcolati prima del genoma.
- **Memoria nel genoma (stato interno).** Variabile che il genoma aggiorna da un giorno all'altro (stato di una macchina a stati, credenza di un HMM, registri, neuroni ricorrenti).
- **MLP (perceptron multistrato).** Rete a strati: ingressi, uno o più strati nascosti, uscita.
- **Modello di osservazione.** Nell'HMM, la probabilità di vedere un dato simbolo (su, fermo, giù) in ciascun regime.
- **Momentum.** Variazione percentuale del prezzo su N giorni.
- **Motore.** La parte del progetto che fa girare una strategia sulle barre storiche e mostra il risultato nel browser.
- **Mutazione.** Modifica casuale di uno o più geni di un genoma.
- **Mutazione neutra.** Modifica che cambia il genoma ma non l'esito della valutazione su quei dati.
- **NEAT.** Neuroevoluzione di topologie crescenti: evolve pesi e struttura di una rete partendo da reti minime [1].
- **Neuroevoluzione.** Far evolvere i pesi (e la struttura) di una rete con un algoritmo genetico, senza discesa del gradiente.
- **Neurone (artificiale).** Calcola la somma pesata dei suoi ingressi più un bias e ne applica una funzione di attivazione.
- **Nodo, foglia, sottoalbero.** Elementi di un albero: nodo interno (operazione con figli), foglia (ingresso o costante, senza figli), sottoalbero (un nodo con tutto ciò che sta sotto di esso).
- **Normalizzazione.** Portare gli ingressi su scale confrontabili, per esempio dividendo per la deviazione standard.
- **Numero di innovazione.** Etichetta permanente di una connessione NEAT, usata per allineare i genitori nel crossover.
- **OHLCV.** Open, high, low, close, volume: prezzo di apertura, massimo, minimo, chiusura e volume scambiato in una barra.
- **Ombreggiamento.** In una lista di regole, una regola che non scatta mai perché una precedente copre già tutti i suoi casi.
- **Overfitting (sovradattamento).** Adattarsi troppo ai dati di addestramento, rumore compreso, e funzionare peggio su dati nuovi.
- **PoC.** Proof of concept: la dimostrazione nel browser, che riproduce un genoma già evoluto sui dati storici incorporati; non evolve nulla.
- **Popolazione.** L'insieme dei genomi presenti in un dato momento.
- **Posizione aperta (posizione lunga).** Si possiedono azioni, in attesa che il prezzo salga. Senza posizione si ha solo denaro.
- **Prezzo.** Costo di una azione in un momento; qui il prezzo di chiusura del giorno.
- **Programmazione genetica (GP).** Algoritmo genetico applicato a programmi (alberi o sequenze di istruzioni) invece che a vettori di numeri [5].
- **Prova finale (test).** Dati tenuti da parte e usati una volta sola, alla fine, per una stima onesta su dati nuovi.
- **Punteggio lineare.** Somma pesata degli ingressi più un bias, confrontata con due soglie per ottenere buy, sell o hold.
- **R1…R6.** Le ricerche dell'epica: R1 è la scelta della forma del genoma (questa guida e la rassegna), R2 gli indicatori, R3 la codifica genetica, R4 le equazioni di decisione, R5 la fitness, R6 il protocollo di valutazione.
- **Regime.** Etichetta per un modo di comportarsi del prezzo (salita, laterale, calo); nell'HMM è uno stato nascosto.
- **Registro.** Variabile di un programma che conserva il suo valore da un giorno al successivo.
- **Regola di default.** Ultima regola di una lista, sempre vera: garantisce una decisione ogni giorno.
- **Rendimento.** Guadagno o perdita in percentuale del capitale iniziale: valore finale diviso valore iniziale, meno 1, per 100.
- **Reservoir computing.** Rete ricorrente casuale e fissa di cui si addestra solo la lettura finale [17].
- **RSI, stocastico, ATR.** Indicatori che non sono una semplice media (forza relativa, posizione nell'intervallo recente, escursione media); descritti nel capitolo 1 **[ipotesi, fonte da verificare]**.
- **Selezione.** Scelta dei genitori in base al voto di fitness.
- **Soglia (alta e bassa).** Valori del punteggio sopra i quali si compra e sotto i quali si vende.
- **Speciazione.** In NEAT, raggruppare reti simili in specie perché una novità abbia il tempo di ottimizzarsi [1].
- **Stato nascosto (di una rete).** Valori interni di una rete ricorrente, non visibili al motore e da azzerare in `reset()`.
- **Stop loss.** Soglia di perdita oltre la quale una posizione viene chiusa automaticamente.
- **Take profit.** Soglia di guadagno oltre la quale una posizione viene chiusa automaticamente.
- **Torneo.** Metodo di selezione in cui si pescano alcuni individui a caso e vince il migliore (3 in Consilium).
- **Trader.** Oggetto del motore che esegue gli ordini e tiene capitale, posizione, stop loss e take profit; la forma di genoma decide soltanto.
- **Transizione.** Regola «dallo stato X, se la condizione Y è vera, vai allo stato Z».
- **Validazione (validation).** Dati non usati per evolvere, su cui si confrontano i candidati e si prendono le decisioni (scegliere, fermare, regolare).
- **Variabile linguistica.** Grandezza descritta con valori a parole («bassa», «media», «alta»), ciascuno associato a un insieme fuzzy.
- **Viterbi.** Metodo che trova il percorso di regimi più probabile sull'intera sequenza, futuro compreso [2].
- **Volume.** Numero di azioni scambiate in un giorno.

## Riferimenti

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
15. R. J. Hyndman, G. Athanasopoulos, *Forecasting: Principles and Practice*, 3a edizione online, OTexts, capitolo 8. https://otexts.com/fpp3/exponential-smoothing.html. Letto in parte. Anno di edizione non confermato. Il server risponde 403 a richieste con User-Agent di browser e 200 a `curl`: la pagina esiste (verificato il 2026-10-11).
16. C. Ryan, M. O'Neill, J. J. Collins, *Introduction to 20 Years of Grammatical Evolution*, in *Handbook of Grammatical Evolution*, Springer, 2018, 1-21. https://gpbib.pmacs.upenn.edu/gp-html/Ryan_2018_hbge_intro.html. Scheda con abstract.
17. Gruppo MINDS, *Echo State Networks and Reservoir Computing*, pagina ospitata su `ai.rug.nl`. https://www.ai.rug.nl/minds/esnresearch/. Pagina letta; è di un gruppo di ricerca, non una rassegna con revisione.
18. Consilium, *Train/Holdout Experiments, Generalizzazione della popolazione GA*, 2026-09-12 (rapporto interno): `archive/reports/2026-09-12_train-test-holdout-experiments.md` nel repository Consilium. Letto per intero. Riguarda titoli e panieri con fitness basata sul CAGR, non la serie ENI di questo PoC.

**Conteggio.** 18 fonti: testo letto per 12 (1, 2, 3, 4, 5, 8, 9, 11, 14, 15, 17, 18), solo scheda o abstract per 6 (6, 7, 10, 12, 13, 16). **Identificate e non verificate, non usate come prova** (non numerate): R. J. Urbanowicz, J. H. Moore, *Learning Classifier Systems: A Complete Introduction, Review, and Roadmap*, 2009 (pagina dell'editore 403, copia su PubMed Central con verifica anti-robot); L. Breiman, J. H. Friedman, R. A. Olshen, C. J. Stone, *Classification and Regression Trees*, 1984 (nessuna pagina letta).

**Fonti di questa guida.** La guida non aggiunge fonti numerate rispetto alla rassegna: i numeri [1]-[18] sono gli stessi e hanno lo stesso stato di verifica (testo letto, solo scheda o non verificata). Per questo non esistono voci da [19] in poi. I fatti nuovi della guida vengono dal codice del repository, da un rapporto interno già numerato [18] e da conteggi eseguiti con script di lavoro; ciò che non ha fonte è marcato **[ipotesi]**. Citati nel testo senza numero e non verificati: il lavoro di Fogel sulla programmazione evolutiva (anni Sessanta, capitolo 3, **[ipotesi, fonte da verificare]**, non cercato né letto) e le due fonti identificate sopra (LCS, CART).
