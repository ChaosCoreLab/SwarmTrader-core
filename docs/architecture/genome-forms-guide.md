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

Questa guida spiega, con parole semplici e con esempi numerici, quali forme potrebbe avere il **genoma** del nuovo motore di SwarmTrader-core: l'insieme dei numeri e delle scelte che dice a una strategia di compravendita di azioni (in inglese «trading») quando comprare e quando vendere. Le forme possibili sono alternative alla macchina a stati ereditata da Consilium. La guida serve a chi deve scegliere la forma (nel progetto, Luca e Simone). È scritta per chi sa programmare ma non ha competenze di finanza né conosce algoritmi genetici, reti neurali, modelli a stati nascosti, logica fuzzy o programmazione genetica: ogni termine è spiegato da zero nel capitolo in cui compare, anche se è già comparso prima.

> **Avvertenza: tutti i numeri degli esempi sono inventati.** Gli esempi usano un dataset di 20 giorni di prezzi e volumi scritto a mano (capitolo 1), non dati di ENI né di nessun mercato. I risultati mostrano come funziona il meccanismo di ogni forma. Non dicono nulla sulla qualità delle forme, né su come si comporterebbero sul mercato reale, e nessun esempio è una promessa di guadagno. Se in un esempio una forma ottiene più o meno del buy&hold (comprare il primo giorno e tenere), non ne segue niente.

### Parole del progetto

Queste parole compaiono fin dalle prime pagine. Eccole in una riga ciascuna.

- **Consilium**: il software già esistente che fa evolvere strategie di compravendita di azioni (strategie di trading); da lì vengono il genoma a macchina a stati usato oggi e i dati di addestramento, cioè i dati storici su cui i genomi sono provati e scelti.
- **PoC** (proof of concept): il piccolo prototipo che gira nel browser e ripete giorno per giorno, su dati reali di ENI, ciò che farebbe il genoma attuale, in modo da poterlo vedere e controllare.
- **Epica**: il filone di lavoro più ampio di cui questa guida fa parte. Lo scopo è studiare se il genoma possa avere una forma diversa dalla macchina a stati, far evolvere molti genomi di quella forma e confrontare nel PoC il migliore con quello attuale.
- **Ciclo**: un blocco di lavoro con un obiettivo, una serie di controlli e una decisione finale registrata. Questa guida è un prodotto del ciclo 010; per leggerla non serve sapere altro.
- **Rassegna**: il documento compatto che precede questa guida («Rassegna delle forme di genoma»), con gli stessi contenuti in forma più sintetica. Qui si trova il [testo della rassegna](../genome-forms-review/).
- **R2…R6 ed E2** sono le tappe successive alla scelta della forma, non ancora fatte. **R2** ricerca sugli indicatori da usare; **R3** ricerca sulla codifica genetica (come un genoma si scrive, si mescola, si modifica); **R4** ricerca sulle equazioni di decisione (come si arriva a comprare, vendere o aspettare); **R5** ricerca sulla funzione di fitness (il «voto» dato a un genoma); **R6** ricerca sul protocollo di valutazione (come si separano addestramento, validazione e prova finale); **E2** implementazione del genoma scelto.

**Che cosa significa `[ipotesi]`.** Il segno **[ipotesi]** marca un'affermazione che è un giudizio dell'autore, o una conoscenza generale, per cui non c'è una fonte letta per questa guida: va presa come opinione da verificare, non come fatto. Quando un paragrafo ne contiene più d'una, il segno compare una volta sola, a fine paragrafo. Espressioni come «fonte non verificata», «fonte da verificare» o «non letta» dicono che la fonte esiste o dovrebbe esistere, ma l'autore non l'ha aperta o non ne ha controllato il contenuto.

**Come è fatta.** Il capitolo 1 spiega il problema e gli strumenti di base (prezzi, indicatori, memoria, genoma). Il capitolo 2 spiega l'algoritmo genetico e come si valuta un genoma. I capitoli da 3 a 9 descrivono una forma ciascuno: la macchina a stati attuale, il punteggio lineare, gli alberi di espressioni, la lista di regole, le reti neurali, la logica fuzzy, il modello a stati nascosti. Il capitolo 10 le confronta, mostra le decisioni di tutti gli esempi giorno per giorno e raccoglie le domande per chi decide. Seguono il glossario, i riferimenti e un'appendice di approfondimenti (dettagli sul codice, tabelle e questioni tecniche spostate dal testo per non interrompere il filo).

**Convenzioni.** I decimali usano la virgola nel testo e nelle tabelle, il punto nei blocchi di codice. I numeri tra parentesi quadre, per esempio [4], rimandano ai Riferimenti (stessa numerazione della rassegna). Le formule e i disegni sono in blocchi di codice. I numeri degli esempi sono stati ricalcolati da un revisore indipendente.

**Percorso rapido, per chi ha fretta.**

1. Leggere la sezione «In breve» qui sotto (una pagina).
2. Nel capitolo 1 leggere le sezioni 1.1.5 e 1.1.6 (che cosa decide un genoma e che cos'è l'anticipazione dei dati), 1.3.2 (la media mobile esponenziale) e 1.4 (due posti dove può stare la memoria).
3. Di ogni capitolo da 3 a 9 leggere «In una frase e un'analogia» e «In breve».
4. Passare al capitolo 10: tabella di confronto, griglia giorno per giorno, domande per chi decide.
5. Quando compare un termine sconosciuto, cercarlo nel glossario.

Chi ha tempo legga i capitoli nell'ordine, a partire dalla macchina a stati attuale (capitolo 3): serve a capire che cosa si lascia e che cosa si cerca.

## In breve

Questa pagina riassume la guida senza gergo. Non sostituisce i capitoli: dice che problema si affronta, quali sono le opzioni, che cosa deve decidere chi sceglie e dove cercare le risposte.

### Il problema

Una **strategia di trading** guarda ogni giorno i prezzi e i volumi di un'azione e decide una di tre mosse: comprare (`buy`), vendere (`sell`) o aspettare (`hold`). Un **genoma** è l'insieme dei numeri e delle scelte che dice come la strategia prende quella decisione. Un **algoritmo genetico** cerca buoni genomi imitando l'evoluzione: ne prova molti sui dati storici, tiene i migliori e ne produce di nuovi mescolando i numeri di due genitori e cambiandone qualcuno a caso, come un orticoltore che sceglie e incrocia le piante migliori.

Oggi il genoma ha la forma di una **macchina a stati**: nove «situazioni» collegate da regole che confrontano medie di prezzi e di volumi. Il lavoro in corso vuole capire quali altre **forme** di genoma esistano, soprattutto forme che ricordano il passato attraverso **indicatori** noti (numeri calcolati dai prezzi passati, come le medie mobili) e non attraverso una macchina a stati nascosta nel genoma.

### Le sette forme, in una riga ciascuna

- **Macchina a stati attuale** (capitolo 3). Nove situazioni e regole di passaggio tra una e l'altra. Ricorda grazie alla situazione in cui si trova. È già nel motore, ma che cosa ricordi davvero ogni situazione non si legge dal nome.
- **Punteggio lineare** (capitolo 4). Ogni indicatore ha un peso, si somma tutto e due soglie decidono: sopra si compra, sotto si vende. Ha pochi numeri e si legge subito. Non sa dire «se X e Y insieme», a meno che qualcuno prepari un indicatore apposta.
- **Alberi di espressioni** (capitolo 5). Il genoma è una formula scritta ad albero, e l'evoluzione ne cambia anche la forma. Sa esprimere quasi qualsiasi regola, ma gli alberi tendono a crescere senza migliorare e quelli grandi non si leggono.
- **Lista di regole** (capitolo 6). Un elenco ordinato di «se condizione allora mossa»: vince la prima regola vera. Si legge come un regolamento. Mescolare due liste può dare figli senza senso, e non sa parlare di tempo trascorso.
- **Reti neurali** (capitolo 7). Piccoli calcoli collegati, con molti pesi (numeri che dicono quanto conta ogni collegamento). Sono molto espressive e poco leggibili. Alcune hanno collegamenti ricorrenti (l'uscita di ieri torna come ingresso di oggi). Un metodo, detto NEAT, fa crescere la rete un pezzo alla volta.
- **Logica fuzzy** (capitolo 8). Regole scritte come frasi che lavorano con gradi tra 0 e 1 invece che con sì e no, così la decisione cambia senza salti. Ha molti parametri e richiede cure nel mescolare due genitori.
- **Modello a stati nascosti** (capitolo 9). Tiene una probabilità per ciascun «regime» di mercato (salita, laterale, calo), cioè per ciascun tipo di periodo, e la aggiorna ogni giorno. È di fatto una macchina a stati probabilistica, quindi è la forma più vicina a quella attuale.

### Che cosa si decide, e che cosa no

La guida **non sceglie** al posto di chi decide e non dice quale forma «guadagni di più»: gli esempi sono numeri inventati. Descrive come funziona ciascuna forma, che cosa ricorda, quanti numeri richiede e che cosa la rende comoda o scomoda.

La rassegna aveva però indicato due **candidati**, scelti sulle caratteristiche delle forme e mai sul rendimento atteso. La guida li riporta come proposta di partenza, non come decisione.

- **Candidato A, punteggio lineare.** Base semplice: pochi numeri, lettura diretta. Ha una **forma minima** (un solo indicatore e una sola soglia) che fa da metro: una forma più ricca deve giustificare perché ciò che aggiunge non sia solo capacità di adattarsi al caso. Si passa al candidato B se, scrivendo il codice, si vede che servono regole del tipo «X e Y insieme» o che gli indicatori da soli non danno memoria sufficiente.
- **Candidato B, alberi di espressioni.** Copre ciò che A non sa fare. Si torna ad A o alla lista di regole se gli alberi crescono senza migliorare, se non si leggono più o se la differenza tra i risultati sui dati di addestramento (quelli su cui il genoma è scelto) e su dati nuovi cresce con la loro dimensione.

Le altre forme restano come riserva. La domanda 1 ha già avuto risposta e riguarda **quali forme si valutano**: tutte e sette, comprese quelle che hanno una memoria propria per costruzione (il modello a stati nascosti e le reti con ricorrenze). Restano quattro domande, spiegate con esempi nel capitolo 10.

- **Domanda 2.** Una volta scelta la forma, dove deve stare la memoria del passato: solo negli indicatori (medie e simili, calcolati prima), in variabili che il genoma si porta dietro da un giorno all'altro (come un taccuino), oppure nello stato del portafoglio fornito dal motore (in posizione sì o no, prezzo d'acquisto, giorni e massimo dall'acquisto)? Non riapre la domanda 1: quella dice quali forme si valutano, questa come è scritta la forma scelta. È ancora aperta.
- **Domanda 3.** Quanto pesa la leggibilità, cioè poter capire perché una strategia compra, rispetto all'espressività, cioè poter scrivere regole complicate?
- **Domanda 4.** Si parte da una forma sola, semplice, o da due, una semplice e una ricca?
- **Domanda 5.** Si vuole un esperimento di controllo su dati senza struttura prevedibile (per esempio prezzi generati a caso)? Una forma che su quei dati ottenesse buoni risultati starebbe solo imparando il caso: l'esperimento misura quanto ogni forma è incline a farlo.

### Dove trovare le risposte

- Che cosa decide un genoma ogni giorno e come si calcolano gli indicatori: capitolo 1.
- Come funziona l'algoritmo genetico e perché i risultati su pochi dati ingannano: capitolo 2.
- Una forma alla volta, con un esempio giorno per giorno: capitoli da 3 a 9.
- Confronto tra le forme, decisioni di tutti gli esempi affiancate e le domande per chi decide: capitolo 10.
- Parole sconosciute: glossario. Dettagli tecnici e sul codice: appendice.

### Una cosa da ricordare

I numeri degli esempi sono inventati e non formano una classifica. Dalla guida si capisce come funziona ciascuna forma; non si ricava quale sia la migliore, perché questa guida non lo ha misurato.

## 1. Il problema e gli strumenti di base

Questo capitolo non descrive una forma di genoma. Spiega il problema che il progetto affronta e gli strumenti di base che gli altri capitoli danno per noti: che cosa decide una strategia ogni giorno, che cos'è un indicatore, che cosa vuol dire «memoria», che cos'è un genoma, come una forma di genoma si collega al nostro motore. Non servono competenze di finanza. Ogni termine è spiegato alla prima occorrenza, con un esempio.

I numeri degli esempi sono inventati: l'avvertenza completa è in premessa e nella sezione 1.2.

### 1.1 Che cosa facciamo, in parole povere

#### 1.1.1 Azione, prezzo, volume

Un'**azione** è una piccola quota di proprietà di un'azienda. Se un'azienda è quotata in borsa, le sue azioni si comprano e si vendono ogni giorno lavorativo. Il progetto usa le azioni di una sola azienda, ENI, perciò si parla di «un titolo». Per non confondere la parola «azione» con ciò che la strategia decide, le tre decisioni possibili (comprare, vendere, aspettare) si chiamano **mosse**.

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

Questo insieme di cinque valori è una **barra** (in inglese, bar o candle). Una barra riassume un giorno, come una riga di un log riassume una giornata di lavoro. I dati del progetto sono 2517 barre giornaliere di ENI, dal 2016-09-29 al 2026-09-28; sono una copia fissa dei dati storici, incorporata nel progetto e detta «snapshot».

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

Poi c'è la regola di esecuzione: **si decide alla chiusura del giorno t, si esegue all'apertura del giorno t+1**. Esempio: lunedì sera il genoma guarda i dati e dice `buy`. L'ordine viene eseguito martedì mattina, al prezzo di apertura di martedì, non al prezzo di chiusura di lunedì. Nel codice del progetto, a ogni barra l'ordine è: si aggiornano gli indicatori con la barra nuova, si esegue l'ordine deciso alla barra precedente, poi si decide l'ordine per la barra successiva.

#### 1.1.6 Perché non si può usare il futuro: l'anticipazione dei dati (look-ahead)

Il motivo della regola «decido oggi, eseguo domani» è evitare un errore grave e subdolo, chiamato **anticipazione dei dati** (in inglese **look-ahead bias**): usare, per decidere un giorno, informazioni che quel giorno non erano ancora disponibili.

Esempio concreto, sul dataset giocattolo della sezione 1.2. Se lunedì sera la regola potesse guardare il prezzo di martedì, basterebbe questa: «se domani il prezzo sale, compra; altrimenti vendi». Sembra una regola come un'altra, ma nessuno può applicarla davvero, perché il prezzo di domani non si conosce. Sul dataset giocattolo questa regola, che «bara», ottiene +23,23 per cento, contro il +12,87 per cento del buy&hold. Il risultato è alto perché la regola conosce la risposta prima di scegliere, non perché sia una buona regola.

Il pericolo è che l'anticipazione possa entrare senza che nessuno se ne accorga: un indicatore calcolato su una finestra che comprende giorni futuri, oppure una stima di parametri fatta su tutta la serie e poi usata per «decidere» sul passato (per esempio calcolare la media di tutti i 20 giorni e usarla per giudicare il giorno 3, quando quella media non si poteva ancora conoscere). Il risultato sembra ottimo e non vale nulla. Per questo ogni capitolo della guida segnala dove l'anticipazione potrebbe nascere. Nel nostro motore non nasce dall'ordine delle operazioni, che la esclude per costruzione; può nascere dalla stima dei parametri o dalla fitness (misura di qualità, sezione 1.5).

### 1.2 Il dataset giocattolo

Tutta la guida usa gli stessi **20 giorni** inventati. Ogni capitolo li usa nei propri esempi, così i numeri sono confrontabili.

**Avvertenza completa.** I numeri sono **inventati**. Il prezzo sale, scende, risale in un disegno semplice, scelto perché mostri bene i meccanismi. Non sono dati di ENI né di nessun mercato reale, non dicono nulla su come un approccio si comporterebbe davvero e non dicono quale forma di genoma sia migliore. Se in un esempio una forma ottiene più o meno del buy&hold, non ne segue niente.

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

Il prezzo sale nei giorni 1-8, scende nei giorni 9-14, risale nei giorni 15-20. Il volume è più alto nel tratto di discesa (giorni 11-13, con il picco di 2200 il giorno 12) e più basso ai due cambi di direzione (giorni 9 e 15, con 1200). Il grafico in testo mostra il prezzo (arrotondato al decimo più vicino; l'asse orizzontale è il giorno):

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
- `buy` senza posizione aperta (non si possiedono azioni) compra con **tutto** il denaro; `sell` con una posizione aperta vende **tutto**. Un `buy` con la posizione già aperta, o un `sell` senza posizione, non fa nulla.
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

La **media mobile esponenziale** (EMA, exponential moving average) dà più peso ai dati recenti, senza una finestra fissa. È il tipo di media usato dal motore di Consilium, dove si chiama «filtro» (nel codice, «filtro IIR»): è il nome che ricorre nel capitolo 3.

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

Con `c` vicino a 1 la media coincide quasi con il dato di oggi e quindi ricorda poco del passato; con `c` vicino a 0 il dato nuovo pesa poco e la media si sposta lentamente, ricordando a lungo. Come regola pratica, la «durata della memoria» è circa 1/c giorni. Con `c` = 0,5 sono circa 2 giorni (nella riga `c` = 0,5 della tabella, dopo 2 giorni la media ha già fatto tre quarti del salto); con `c` = 0,2 sono circa 5 giorni.

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

- Il giorno 12 il prezzo è sotto entrambe le medie; la veloce (10,74) è sotto la lenta (10,81): le due medie si sono incrociate. Un **incrocio** tra medie, una veloce e una lenta, è un segnale classico: indica che l'andamento recente è cambiato rispetto a quello di fondo.
- La media **veloce** (`c` = 0,5) segue il prezzo da vicino: il giorno 8 è 11,17, vicina al prezzo 11,35. La media **lenta** (`c` = 0,2) ritarda molto: lo stesso giorno è 10,74.
- Quando il prezzo comincia a scendere (giorno 9), la veloce gira prima della lenta. Il giorno 11 il prezzo (10,80) è sotto la media veloce (10,98) e, di poco, anche sotto la lenta (10,88): il confronto del prezzo con una media dice se, rispetto alla storia recente, siamo «sopra» o «sotto».
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

`v[t]` è il volume del giorno e `mv[t]` la sua EMA (qui con `c` = 0,2, calcolata come quella del prezzo, a partire dal primo volume). In parole: un valore sopra 1 dice che oggi si è scambiato più del solito; sotto 1, meno del solito. Giorno 12: il volume è 2200, la EMA del volume è 1612,93 e il rapporto è 1,36: giornata molto attiva, e infatti il prezzo sta scendendo con decisione. Un movimento con molto volume è considerato più significativo di uno con poco volume. Nei capitoli successivi si usa spesso lo scarto `vr - 1` (sezione 1.3.6).

**Variazione su N giorni (momentum).**

```
mom_N[t] = ( x[t] / x[t-N] - 1 ) * 100
```

`x[t-N]` è il prezzo di N giorni fa. In parole: di quanto è cambiato il prezzo in N giorni, in percentuale. Qui N = 5. Giorno 6: 11,00 / 10,00 = 1,10, quindi +10,00. Se è positivo il prezzo è salito nell'ultima settimana di borsa, se è negativo è sceso.

| Giorno | Distanza da EMA c=0,2 (`dist`, %) | Volume su EMA c=0,2 (`vr`) | Variazione su 5 giorni (`mom_5`, %) |
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

Si legge: la distanza dalla media è positiva nei giorni di salita e negativa nel calo dei giorni 11-16 (il giorno 16 vale -0,02, appena sotto zero); il volume passa da sopra la media (giorni 11-13, quando il prezzo scende) a sotto (giorni 14-17); la distanza e il momentum diventano negativi lo stesso giorno (il 11) e toccano il minimo lo stesso giorno (il 14: -3,81 e -9,73). Le tre grandezze hanno scale diverse: il momentum guarda 5 giorni indietro e si muove di più, la distanza si misura rispetto a una media che ritarda, il rapporto del volume sta vicino a 1. Per questo nel capitolo 4 gli ingressi vanno portati su scale simili.

Per i primi giorni la variazione su 5 giorni non è definita (trattino): servono 5 giorni di storia. È un dettaglio pratico di ogni indicatore con finestra, detto «periodo di avvio».

#### 1.3.5 Indicatori che non sono una semplice media

Non tutti gli indicatori si ottengono con una media: esistono per esempio i massimi e i minimi degli ultimi N giorni, l'RSI (confronta i rialzi recenti con i ribassi recenti), lo stocastico e l'ATR (quanto si muove il prezzo in un giorno). Gli esempi della guida non li usano. Scegliere quali indicatori adottare è un compito di ricerca a parte (R2, la ricerca sugli indicatori da usare), svolto nel [Catalogo degli indicatori del genoma](../genome-indicators-catalog/). Una descrizione breve di questi quattro è nell'appendice, sezione «Dal capitolo 1: Altri indicatori».

#### 1.3.6 Gli ingressi usati negli esempi dei capitoli

I capitoli sulle forme usano le stesse tre grandezze (prezzo, media del prezzo, volume), ma le scrivono in due modi. I capitoli 4, 7 e 8 usano **distanze e rapporti**; i capitoli 5 e 6 confrontano direttamente i **valori grezzi**, per esempio `prezzo > media_lenta` invece della distanza percentuale (il significato è lo stesso). Queste tabelle sono un dizionario: non serve impararle a memoria, ogni capitolo ripete i nomi che usa. Le medie sono sempre EMA (sezione 1.3.2): lenta con `c` = 0,2, veloce con `c` = 0,5, e una EMA del volume con `c` = 0,2.

Distanze e rapporti (capitoli 4, 7 e 8):

| Grandezza | Nome nei capitoli 4 e 7 | Nome nel capitolo 8 | Definizione |
|---|---|---|---|
| distanza del prezzo dalla EMA lenta | `x1` | `D` | `(prezzo / EMA lenta - 1) * 100` |
| distanza della EMA veloce da quella lenta | `x2` | non usato | `(EMA veloce / EMA lenta - 1) * 100` |
| scarto del volume dalla sua EMA | `x3` | `R` meno 1 | `volume / EMA del volume - 1`; `R` e `vr` (sezione 1.3.4) sono il rapporto `volume / EMA del volume` |

Valori grezzi (capitoli 5 e 6):

| Valore | Nome nel capitolo 5 (albero) | Nome nel capitolo 6 (lista) |
|---|---|---|
| prezzo del giorno | `P` | `prezzo` |
| EMA lenta del prezzo | `S` | `media_lenta` |
| EMA veloce del prezzo | `F` | `media_veloce` |
| volume del giorno | `V` | `volume` |
| EMA del volume | `VA` | `media_volume` |

In particolare `P` e `S` dei capitoli 5 e 6 sono il prezzo e la EMA lenta, **non** le distanze di `x1`. Il capitolo 9 (modello a stati nascosti) usa solo la variazione giornaliera del prezzo, e il capitolo 3 (macchina a stati ridotta) solo le due EMA del prezzo.

### 1.4 Due posti dove può stare la memoria

Ogni forma di genoma deve ricordare il passato in qualche modo, e ci sono due posti dove la memoria può stare.

**Memoria a monte (negli indicatori).** Gli indicatori sono calcolati **prima** e consegnati al genoma già pronti: la EMA, la distanza dalla media, il rapporto del volume. Il genoma legge i numeri di oggi e basta. Non ha nessuna memoria sua: se gli si ridanno gli stessi numeri, risponde sempre allo stesso modo. Per un programmatore: è una **funzione pura**, stesso input stesso output; la storia l'ha digerita qualcun altro e gli arriva sotto forma di input.

**Memoria dentro il genoma (stato interno).** Il genoma ha una variabile che si porta dietro da un giorno al successivo e che aggiorna: lo stato in cui si trova una macchina a stati, l'uscita di ieri che una rete neurale «ricorrente» rilegge come ingresso di oggi, i «registri» (variabili che un genoma scritto come programma può scrivere e rileggere). Per un programmatore: è un **oggetto con campi**, e il risultato di oggi dipende anche dai campi, che sono cambiati ieri.

Un'analogia con l'auto. La memoria a monte è un cruscotto con strumenti già pronti (la velocità media dell'ultima ora, il consumo medio), calcolati da qualcun altro e letti dal guidatore. La memoria interna è un guidatore che tiene un taccuino e annota di sua iniziativa quello che gli pare importante.

| | Memoria a monte | Memoria nel genoma |
|---|---|---|
| Dove sta | negli indicatori, calcolati prima | in uno stato che il genoma aggiorna |
| Chi decide che cosa ricordare | chi sceglie gli indicatori (noi) | l'evoluzione, insieme al resto del genoma |
| Il genoma da solo | una funzione dei numeri di oggi | dipende anche da ciò che ha fatto ieri |
| Va azzerato a ogni nuova simulazione | no, lo fanno gli indicatori | sì, il genoma ha stato da riportare all'inizio |
| Si legge perché ha deciso così | più facile: i numeri letti sono lì | più difficile: bisogna ripercorrere la storia |

**Perché è importante per il progetto.** L'obiettivo dell'epica (il programma di lavoro descritto in premessa) è una memoria che nasca da **indicatori noti** (medie mobili e simili), e non da una macchina a stati. Il motivo, secondo l'autore: gli indicatori hanno un significato che chiunque può leggere (la EMA è la EMA), e il genoma si limita a combinarli **[ipotesi]**. In una macchina a stati la memoria è nascosta nella struttura evoluta, ed è difficile dire che cosa ricordi davvero. Il requisito di partenza era che la memoria non venisse da una macchina a stati; la rassegna precisa che non è stringente: sono ammesse anche forme con stato interno (domanda 1 del capitolo 10), e la scelta tra le due classi di memoria spetta a chi decide (domanda 2). Alcune forme hanno entrambe le varianti (per esempio gli alberi con o senza registri, le reti con o senza ricorrenze).

**Il fatto sul genoma attuale.** Il genoma fisso (il genoma già evoluto da Consilium, che il PoC ripete giorno per giorno) ha quattro indicatori di tipo EMA, due sul prezzo e due sul volume, aggiornati con la formula della sezione 1.3.2 (la riga di codice è nell'appendice, sezione «Riferimenti al codice: capitolo 1»).

Nel genoma fisso il secondo filtro del prezzo, `iir_price_2`, ha c = 0,99. Vista la tabella dei tre valori di `c` sopra, con 0,99 il filtro coincide quasi con il prezzo di oggi: **quasi nessuna memoria**. Il filtro `iir_price_1` ha c = 0,73 (memoria di circa 1,4 giorni), `iir_volume_2` ha 0,40 e `iir_volume_1` 0,12 (circa 8,5 giorni). La memoria che conta nel genoma attuale sta quindi soprattutto nello stato della macchina a stati: è il tema del capitolo 3 di questa guida.

Lo si dice qui per mostrare che il genoma attuale usa già indicatori di questo tipo, e per ritrovarlo nel capitolo 3. Un'avvertenza di lettura: che `iir_price_2` abbia poca memoria è un fatto di questi numeri del genoma fisso, non una proprietà delle macchine a stati.

### 1.5 Che cos'è un genoma e che cos'è un algoritmo genetico

Un **genoma** è una descrizione completa di una strategia, fatta di numeri e scelte che si possono modificare. Un **algoritmo genetico** (GA) è un metodo per cercare buoni genomi, che imita l'evoluzione. Il capitolo 2 lo spiega nel dettaglio. Qui ne diamo un esempio minimo, per capire il linguaggio degli altri capitoli.

**Una strategia minima.** Si usano due numeri.

- `c`: il coefficiente della EMA del prezzo (sezione 1.3.2).
- `m`: un margine, scritto come frazione con la percentuale tra parentesi (per esempio `m = 0,01 (1%)`).

La regola, volutamente semplificata a due vie (qui non c'è l'attesa: nel capitolo 2 si aggiunge `hold`), è: se il prezzo di oggi è sopra la EMA di un margine `m`, decido `buy`, altrimenti decido `sell`. In formula, `buy` se `x[t] > e[t] * (1 + m)`. Il genoma è la coppia `(c, m)`.

Questo è un genoma di due numeri, ma si capisce già il principio: cambiando i numeri cambiano le decisioni, quindi i risultati. Sul dataset giocattolo, con il valutatore della sezione 1.2:

| Genoma (c, m), scelto a mano | Operazioni (giorno di esecuzione, tipo, prezzo) | Valore finale | Rendimento |
|---|---|---|---|
| (0,2; 0) | 3 buy 10,30; 12 sell 10,50; 18 buy 11,05 | 1051,71 | +5,17% |
| (0,5; 0,01 (1%)) | 4 buy 10,55; 10 sell 11,10; 18 buy 11,05 | 1085,46 | +8,55% |

**Valutare** un genoma vuol dire farlo girare sui dati storici e misurare un numero che dice se è «buono». Questo numero si chiama **fitness** (in inglese «idoneità»), o più semplicemente «voto». Nel progetto è basato sul rendimento annuo composto (CAGR: il rendimento annuo costante che porterebbe dal capitale iniziale a quello finale). Qui, per semplicità, usiamo il rendimento sul dataset giocattolo.

Il GA procede così.

1. Parte da una **popolazione** di genomi, creati a caso (per esempio 50 coppie `(c, m)` diverse).
2. Valuta ognuno e tiene i migliori (**selezione**).
3. Produce nuovi genomi mescolando i genitori. Il **crossover** prende due genomi e ne combina le parti. Esempio: dati i due genomi della tabella, (0,2; 0) e (0,5; 0,01 (1%)), il figlio prende `c` dal primo e `m` dal secondo, ottenendo (0,2; 0,01 (1%)). Sul dataset il figlio dà 1026,78 (+2,68 per cento): ha unito un pezzo di ciascun genitore e ha ottenuto un genoma diverso da entrambi.
4. Applica la **mutazione**, una piccola modifica casuale. Esempio: il primo genoma, (0,2; 0), con `c` che passa da 0,2 a 0,3, quindi (0,3; 0). Sul dataset dà 1076,05 (+7,61 per cento): con la EMA più veloce il prezzo risulta sopra la media un giorno prima, e il secondo acquisto avviene il giorno 17 al prezzo 10,80 anziché il giorno 18 a 11,05.
5. Ripete per molte **generazioni**, sostituendo i peggiori con i figli dei migliori.

Questo esempio non dice niente sulla bontà di una forma, e non è nemmeno l'esito di una vera evoluzione: serve a far capire che i «geni» sono i numeri che l'algoritmo può cambiare e che anche una piccola modifica sposta le decisioni. Un'ultima osservazione, utile da tenere a mente: il risultato dipende dal dataset. Con questi 20 giorni inventati, per esempio, la regola con `m` = 0 e `c` = 0,99 (poca memoria) ottiene +16,45 per cento e quella con `m` = 0 e `c` = 0,1 ottiene +5,56 per cento; non c'è nessuna conclusione da trarne sul valore della memoria in generale, solo il fatto che un cambio di `c` cambia il risultato, e che un algoritmo genetico che cercasse sui soli 20 giorni sceglierebbe quello che va meglio **su quei 20 giorni**. Adattarsi troppo ai dati di addestramento, rumore compreso, si chiama **sovradattamento** (overfitting) ed è un rischio costante.

### 1.6 Come una forma di genoma si inserisce nel nostro motore

Il **motore** è la parte del progetto che fa girare una strategia sulle barre storiche e mostra il risultato nel browser. Una **forma di genoma** è un modo di rappresentare la strategia (macchina a stati, punteggio lineare, albero, rete, e così via). Per funzionare nel motore la forma deve rispettare un accordo, il **contratto di strategia** (i riferimenti ai file sono nell'appendice, sezione «Riferimenti al codice: capitolo 1»). In parole semplici:

- **Ogni giorno** il motore consegna alla forma i dati (la barra di oggi), la forma aggiorna i propri indicatori ed eventuale stato, e **restituisce una decisione: `buy`, `sell` o `hold`**.
- Il **motore esegue** l'ordine all'apertura del giorno dopo, con il suo `Trader` (l'oggetto che tiene capitale, posizione e parametri di rischio come stop loss e take profit). La forma non esegue ordini: decide soltanto.
- La forma deve dichiarare una **etichetta di stato**: una parola breve tra un elenco finito e fisso (`labels`, per esempio «in osservazione»), che il motore mostra a schermo accanto al grafico per dire «in che situazione si trova la strategia oggi». Una macchina a stati ha i nomi dei suoi nove stati; per una forma con uscita continua (un punteggio, una rete) l'etichetta si deve derivare, per esempio con tre fasce dell'uscita.
- La forma deve poter **esporre dei numeri da mostrare** (`describe()`), per esempio gli indicatori letti o il punteggio del giorno, perché chi guarda il grafico possa capire che cosa ha visto la strategia.
- La forma deve poter essere **salvata come dati** (`serialize()`, un oggetto JSON) e **ricostruita**: un genoma deve potersi scrivere in un file e rileggere.
- Deve poter essere **riportata allo stato iniziale** (`reset()`) per rilanciare la simulazione dall'inizio; per le forme con stato interno questo vuol dire azzerare lo stato.
- Se la forma deve evolvere deve anche saper fare **crossover** e **mutazione** (il GA li richiama).

La tabella completa del contratto, forma per forma, con i punti in cui una forma si adatta bene o male, è nella sezione «Il contratto di strategia, forma per forma» della rassegna, che resta come riferimento. Ogni capitolo di questa guida ha una sezione «Come si integra nel nostro motore» che dice, per quella forma, dove il contratto è rispettato direttamente e dove serve un adattamento. Oltre ai punti elencati qui, la classe base del motore fornisce già alcuni metodi comuni (avvio, lettura di una barra, rendimento annuo, riepilogo), che le forme non devono riscrivere. L'adeguatezza al contratto è oggi verificata soltanto con una strategia di test, quindi per le altre forme è una valutazione sulla carta fino all'implementazione.

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
| 10. Confronto e guida alla scelta | confronto tra le forme sulle stesse domande, griglia giorno per giorno, domande per chi decide | aiutare a decidere |
| Glossario e Riferimenti | termini e fonti | consultazione |

Ogni capitolo sulle forme (dal 3 al 9) ha, con qualche variante, la stessa struttura: una frase e un'analogia; come funziona; un esempio sul dataset giocattolo con tabella giorno per giorno; come evolve (crossover e mutazione con numeri); che cosa ricorda del passato; punti di forza e debolezze; come si integra nel motore; che cosa dice la letteratura; un riepilogo «In breve». Il percorso di lettura rapido è nella premessa della guida.

**Una regola di lettura valida per tutta la guida.** Quello che conta in un esempio è il meccanismo: come i dati diventano una decisione, che cosa ricorda la forma, che cosa cambia quando l'evoluzione modifica i numeri.

## 2. L'algoritmo genetico e la valutazione dei genomi

Questo capitolo spiega il meccanismo che hanno in comune tutte le forme di genoma descritte nei capitoli successivi: come una popolazione di strategie di trading evolve, e come si decide quale strategia è migliore di un'altra. Le forme di genoma cambiano ciò che si evolve. Il meccanismo che le fa evolvere resta lo stesso, ed è meglio capirlo una volta sola, con numeri, prima di confrontare le forme.

Numeri di esempio inventati: mostrano il meccanismo, non dicono nulla sulla qualità della forma. Sono arrotondati a due decimali.

### 2.1 Il dataset e il valutatore giocattolo, in breve

Il dataset è una serie inventata di 20 giorni di borsa con il prezzo di chiusura di un titolo. Il prezzo sale dal giorno 1 al giorno 8 (da 10,00 a 11,35), scende dal giorno 9 al giorno 14 (fino a 10,20) e risale dal giorno 15 al giorno 20 (fino a 11,40). Un **genoma** è l'insieme dei numeri che definiscono una strategia. Ogni giorno, alla chiusura, la strategia decide una tra tre mosse: comprare (`buy`), vendere (`sell`) o aspettare (`hold`).

Il valutatore (lo stesso della sezione 1.2.1) prende le 20 decisioni e le esegue su un capitale di 1000.

**Semplificazioni di questo esempio** (valgono per tutto il capitolo):

- La decisione presa alla chiusura del giorno t viene eseguita al prezzo del giorno t+1.
- Un acquisto usa tutto il denaro; una vendita vende tutto. Le azioni possono essere frazionarie.
- Non ci sono costi di transazione, né stop loss né take profit (soglie che chiudono la posizione da sole).
- La decisione dell'ultimo giorno viene ignorata, perché non c'è un giorno dopo.
- Il valore finale è il denaro più le azioni valutate al prezzo del giorno 20.

Come riferimento c'è il **buy&hold**: comprare il giorno 1 e tenere fino alla fine. Qui dà 1128,71 (+12,87%). È la strategia più semplice che esista, e nei capitoli seguenti è il metro di confronto minimo.

### 2.2 Il genoma di esempio a due geni

Per tutto il capitolo usiamo un genoma minuscolo, con due numeri, chiamati **geni**.

- Il gene `c` è il coefficiente della **media mobile esponenziale** (EMA) del prezzo, definita nella sezione 1.3.2: `e[t] = e[t-1] * (1 - c) + PRICE[t] * c`, con `e[1] = PRICE[1]`. Sta tra 0 e 1 e pesa il dato nuovo: vicino a 1 la media segue il prezzo da vicino, vicino a 0 si muove lentamente. Esempio: con `c` = 0,60, se ieri la media era 10,00 e oggi il prezzo è 10,50, la media di oggi è 10,00 · 0,40 + 10,50 · 0,60 = 10,30.

- Il gene `m` è il **margine**, un numero non negativo. È una fascia di tolleranza attorno alla media, espressa in proporzione e scritta con la percentuale tra parentesi: `m = 0,005 (0,5%)`.

La regola di decisione del genoma `(c, m)` è, ogni giorno t:

```
se  PRICE[t] > e[t] * (1 + m)   allora buy
se  PRICE[t] < e[t] * (1 - m)   allora sell
altrimenti                      hold
```

In parole: se il prezzo è sopra la media di più del margine, il titolo sta salendo e si compra; se è sotto di più del margine, sta scendendo e si vende; se è vicino alla media non si fa nulla. Il margine serve a non reagire alle oscillazioni minime.

Esempio con `c` = 0,60 e `m = 0,005 (0,5%)` (il genoma 3 della tabella più sotto). La media parte dal prezzo del giorno 1 (10,00), poi vale 10,06 il giorno 2 (10,00 · 0,40 + 10,10 · 0,60) e 10,204 il giorno 3 (10,06 · 0,40 + 10,30 · 0,60). Il giorno 3 il prezzo è 10,30 e la soglia di acquisto è 10,204 · 1,005 = 10,255: poiché 10,30 è più grande, la decisione è `buy` (il giorno 2 il prezzo, 10,10, era sotto la sua soglia di 10,110, quindi `hold`). Il simulatore la esegue il giorno 4 al prezzo di 10,55. Si ritrova nella tabella delle operazioni del genoma 3: «buy g4 @10,55».

La valutazione di un genoma è dunque: calcolare la media, produrre le 20 decisioni, farle eseguire dal valutatore. Il risultato (il valore finale) è il suo **voto**. In questo capitolo «voto», «valore finale» e «fitness» sono la stessa cosa. Nel progetto la fitness è un altro numero, il CAGR (sezione 2.7).

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
| Fitness (il voto) | Il numero che dice quanto un genoma è buono, calcolato valutandolo sui dati | il valore finale del valutatore |
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

Scegliamo a mano sei genomi con valori diversi di `c` e `m` (`m` in proporzione: 0,005 = 0,5%). In un caso vero sarebbero generati a caso. Il valore finale è quello del valutatore sui 20 giorni. Le operazioni sono indicate con il giorno di esecuzione e il prezzo.

| Genoma | `c` | `m` | Operazioni | Valore finale | Rendimento |
|---|---|---|---|---|---|
| 1 | 0,15 | 0,010 | buy g4 @10,55; sell g13 @10,30; buy g18 @11,05 | 1007,23 | +0,72% |
| 2 | 0,35 | 0,020 | buy g5 @10,80; sell g13 @10,30; buy g19 @11,25 | 966,42 | -3,36% |
| 3 | 0,60 | 0,005 | buy g4 @10,55; sell g11 @10,80; buy g17 @10,80 | 1080,57 | +8,06% |
| 4 | 0,80 | 0,030 | nessuna | 1000,00 | 0,00% |
| 5 | 0,25 | 0,000 | buy g3 @10,30; sell g12 @10,50; buy g17 @10,80 | 1076,05 | +7,61% |
| 6 | 0,90 | 0,015 | nessuna | 1000,00 | 0,00% |
| buy&hold | | | buy g2 @10,10 | 1128,71 | +12,87% |

Che cosa si vede, a parole. I genomi 4 e 6 non operano mai: con una media che segue il prezzo da vicino (`c` alto) e un margine abbastanza largo, il prezzo non esce mai dalla fascia, e la decisione è sempre `hold`. Restano a 1000 per costruzione. Il genoma 2 perde: ha un margine largo e una media lenta, entra tardi (g5), vende troppo tardi (g13, quasi sul minimo) e ricompra tardi. I genomi 3 e 5 sono i migliori: entrano presto, escono dopo il picco e prima del fondo. Nessuno batte il buy&hold, perché in questi dati il prezzo sale più di quanto scenda e ogni uscita costa i giorni di rialzo persi.

I valori finali di una generazione sono i **voti** (fitness) dei suoi genomi. La media dei voti della popolazione iniziale è 1021,71 e il migliore è 1080,57 (genoma 3).

#### 2.4.2 La selezione

Ordinando per voto: genoma 3 (1080,57), genoma 5 (1076,05), genoma 1 (1007,23), genomi 4 e 6 a pari merito (1000,00), genoma 2 (966,42). Si tengono i due migliori, i genomi 3 e 5, come genitori. Nell'algoritmo di Consilium la scelta è un po' diversa (sezione 2.7), ma il principio è questo: i genomi con un voto più alto hanno più probabilità di avere figli.

Perché ha senso? Perché i genomi migliori contengono, almeno in parte, valori dei geni più adatti ai dati. Combinare i geni di due genomi buoni è una scommessa ragionevole: se `c` = 0,60 funziona bene nel genoma 3 e `m` = 0 funziona bene nel genoma 5, forse stanno bene anche insieme.

#### 2.4.3 Il crossover, con i numeri

Il crossover prende i geni da due genitori. Ci sono due modi comuni. Il primo, quello **per scelta**, copia ogni gene da uno dei due genitori. Il secondo, quello **aritmetico**, fa la media dei due valori.

Genitori: genoma 3 = (`c` 0,60; `m` 0,005), genoma 5 = (`c` 0,25; `m` 0,000). I figli si numerano di seguito (7, 8, 9).

| Figlio | Come nasce | `c` | `m` |
|---|---|---|---|
| 7 | `c` dal genoma 3, `m` dal genoma 5 | 0,60 | 0,000 |
| 8 | `c` dal genoma 5, `m` dal genoma 3 | 0,25 | 0,005 |
| 9 | media dei due genitori | (0,60 + 0,25) / 2 = 0,425 | (0,005 + 0,000) / 2 = 0,0025 |

#### 2.4.4 La mutazione, con un numero dichiarato

La mutazione cambia un gene di una quantità piccola e casuale. Qui la quantità è fissata a mano per poter riprodurre il calcolo: applichiamo al genoma 8 una variazione di **+0,12 su `c`** e di **+0,003 su `m`**. Il genoma mutato, il 10, vale `c` = 0,25 + 0,12 = 0,37 e `m` = 0,005 + 0,003 = 0,008. Dopo una mutazione si controlla che i valori restino ammissibili (`c` tra 0 e 1, `m` non negativo).

Perché serve? Il crossover può solo ricombinare ciò che c'è già nella popolazione: tutti i `c` dei figli stanno tra 0,25 e 0,60. Se il valore migliore di `c` fosse 0,9, senza mutazione la popolazione non ci arriverebbe mai. La mutazione introduce valori nuovi.

#### 2.4.5 La nuova generazione

La nuova popolazione tiene i due genitori (i genomi 3 e 5, senza modifiche: tecnica detta **elitismo**, che evita di perdere i migliori per caso) e aggiunge i quattro nuovi genomi.

| Genoma | `c` | `m` | Operazioni | Valore finale | Rendimento |
|---|---|---|---|---|---|
| 3 | 0,60 | 0,005 | buy g4 @10,55; sell g11 @10,80; buy g17 @10,80 | 1080,57 | +8,06% |
| 5 | 0,25 | 0,000 | buy g3 @10,30; sell g12 @10,50; buy g17 @10,80 | 1076,05 | +7,61% |
| 7 | 0,60 | 0,000 | buy g3 @10,30; sell g11 @10,80; buy g16 @10,55 | 1133,02 | +13,30% |
| 8 | 0,25 | 0,005 | buy g3 @10,30; sell g12 @10,50; buy g18 @11,05 | 1051,71 | +5,17% |
| 9 | 0,425 | 0,0025 | buy g3 @10,30; sell g11 @10,80; buy g17 @10,80 | 1106,80 | +10,68% |
| 10 | 0,37 | 0,008 | buy g4 @10,55; sell g12 @10,50; buy g18 @11,05 | 1026,78 | +2,68% |

Che cosa è successo ai risultati:

- Il voto medio della popolazione è salito da 1021,71 a 1079,15, e il migliore da 1080,57 (genoma 3) a 1133,02 (genoma 7).
- Il genoma 7 è un caso in cui il crossover ha dato un buon figlio: unisce la media del genoma 3, che segue il prezzo abbastanza da vicino, con il margine nullo del genoma 5, che fa scattare gli acquisti un giorno prima. Compra al giorno 3 (10,30) invece che al giorno 4 (10,55), e vende al giorno 11. Il suo valore finale supera anche il buy&hold (1128,71), ma questo è un effetto dei prezzi inventati, non una prova di qualità.
- Il genoma 9 è un buon figlio ottenuto con la media. Il genoma 8 ha un valore finale più basso di entrambi i genitori (1051,71 contro 1080,57 e 1076,05), e il genoma 10 (mutato) è peggiore del suo originale, il genoma 8. **Non tutti i figli sono migliori**: i nuovi genomi sono tentativi, e la selezione della generazione dopo scarta quelli che non funzionano. Si impara solo perché si prova molto.

Le decisioni di ogni genoma, giorno per giorno (B = buy, S = sell, `.` = hold), mostrano come cambiano con i geni:

```
B = decide buy, S = sell, . = hold (decisione del giorno,
eseguita il giorno dopo)
giorno             11111111112
          12345678901234567890
genoma 3  ..BBBBBB.SSSSS.BBBBB
genoma 5  .BBBBBBBBBSSSSSBBBBB
genoma 7  .BBBBBBBBSSSSSBBBBBB
genoma 8  .BBBBBBBBBSSSSS.BBBB
genoma 9  .BBBBBBBBSSSSSSBBBBB
genoma 10 ..BBBBBBB.SSSS..BBBB
```

Un `B` ripetuto non compra di nuovo: se la posizione è già aperta, il simulatore lo ignora (stesso discorso per una `S` a posizione chiusa). I genomi 7 e 9 decidono di vendere il giorno 10, eseguito l'11 dopo il picco del giorno 8, e tornano a comprare con una decisione del giorno 15 (genoma 7) o 16 (genoma 9), eseguita il giorno dopo, quando il prezzo risale. Il genoma 7 rientra a 10,55 e il 9 a 10,80: è la differenza tra i loro voti finali.

### 2.5 Perché una popolazione e non un solo genoma, e che cosa significa «convergere»

Si potrebbe partire da un solo genoma e provare a migliorarlo con piccole modifiche. Il rischio è fermarsi in un punto da cui ogni piccola modifica peggiora, ma che non è il migliore possibile (un **massimo locale**, come la cima di una collina bassa, quando poco più in là c'è un monte più alto). Una popolazione esplora più punti dello spazio dei genomi contemporaneamente. Il crossover mette insieme informazione che sta in individui diversi, e la mutazione, applicata a tanti genomi, tenta direzioni diverse. Con un solo genoma tutto ciò non è possibile **[ipotesi]**.

In termini di programmatore: una popolazione è una ricerca in parallelo con un meccanismo per travasare tra i candidati le parti riuscite.

**Convergere** vuol dire che i genomi della popolazione diventano sempre più simili tra loro e i voti smettono di migliorare. Per vederlo, abbiamo ripetuto il ciclo una sola volta su una popolazione di 12 genomi iniziali casuali (diversa da quella a 6 genomi dell'esempio), per 10 generazioni sull'intero periodo: si tengono ogni volta i 2 migliori e i genitori si scelgono tra la metà migliore. Gli intervalli di `c` e `m` sono quelli della popolazione in quel momento. Il miglior voto della generazione 0 (1133,02) è uguale a quello del genoma 7 della sezione 2.4: non è un errore, sono le stesse tre operazioni (acquisto il giorno 3, vendita l'11, acquisto il 16).

| Generazione | Voto migliore | Voto medio | `c` va da | a | `m` va da | a |
|---|---|---|---|---|---|---|
| 0 | 1133,02 | 1021,26 | 0,13 | 0,93 | 0,001 | 0,029 |
| 1 | 1133,02 | 1058,06 | 0,21 | 0,98 | 0,001 | 0,017 |
| 2 | 1133,02 | 1095,02 | 0,31 | 0,67 | 0,001 | 0,007 |
| 3 | 1133,02 | 1110,85 | 0,47 | 0,75 | 0,000 | 0,006 |
| 5 | 1164,50 | 1113,36 | 0,47 | 0,85 | 0,000 | 0,005 |
| 10 | 1164,50 | 1114,72 | 0,63 | 0,85 | 0,000 | 0,007 |

Si osserva questo. Il voto medio sale rapidamente nelle prime generazioni, da 1021 a 1110 in tre generazioni. Gli intervalli di `c` e `m` si restringono: `m` converge verso zero, `c` verso valori attorno a 0,6-0,85. Il voto migliore migliora a scatti (alla generazione 5, per una mutazione fortunata, arriva a 1164,50 con `c` = 0,78 e `m` = 0) e poi resta fermo. Il voto medio non è garantito salire a ogni generazione, perché alcune mutazioni producono figli peggiori: è normale.

La popolazione converge quando è tutta vicino a uno stesso punto. Questo è utile (si è trovato qualcosa di buono) e anche pericoloso: una popolazione che converge troppo presto ha perso la varietà e non esplora più. Per questo contano la dimensione della popolazione e la frequenza della mutazione. Qui il risultato dipende dai numeri casuali estratti in questa esecuzione e dai prezzi inventati: con altri valori di partenza si arriverebbe altrove.

### 2.6 Il problema dell'overfitting (sovradattamento)

#### 2.6.1 L'idea: compiti, simulazione d'esame, esame

Uno studente prepara un esame rifacendo mille volte gli stessi compiti. Alla fine li sa a memoria e prende il massimo sui compiti. Ma quel voto non dice come andrà all'esame, dove le domande sono nuove: forse ha capito la materia, forse ha solo imparato le risposte. Per saperlo servono due cose: una simulazione d'esame con compiti mai visti, per correggere lo studio, e poi l'esame vero, che si fa una volta sola.

Con i genomi succede lo stesso. L'algoritmo genetico sceglie i genomi in base al voto che ottengono su certi giorni, i «compiti». Un genoma può ottenere un voto altissimo su quei giorni solo perché si è adattato proprio a quei giorni, compresi i casi e le irregolarità che non si ripeteranno. Questo si chiama **overfitting** (in italiano sovradattamento): voto alto sui dati visti, risultato peggiore sui dati nuovi. Le sezioni seguenti lo mostrano con i numeri: prima un caso estremo che rende evidente l'effetto, poi un caso con due soli geni dove l'effetto, onestamente, è mite.

#### 2.6.2 Un genoma che impara a memoria

Si pensi a un genoma estremo, con un gene per ogni giorno: una tabella di 12 decisioni, una per ciascuno dei giorni 1-12. Supponiamo di usare **solo i giorni 1-12 come addestramento** e che l'evoluzione trovi la tabella «giorno 1: compra; giorno 7: vendi; negli altri giorni: aspetta».

- Sui giorni 1-12 questa tabella compra a 10,10 (eseguita il giorno 2) e vende a 11,35 (eseguita il giorno 8, il picco). Il valore finale è **1123,76 (+12,38%)**. È il massimo ottenibile su quei 12 giorni: lo si verifica provando tutte le 177.147 combinazioni di decisioni dei primi 11 giorni (tre scelte per ciascuno degli 11 giorni, cioè 3 moltiplicato per sé stesso 11 volte; la decisione del giorno 12 non viene eseguita). Il buy&hold sugli stessi 12 giorni dà 1039,60 (+3,96%). Sui giorni visti, la tabella sembra imbattibile.
- Sui **giorni nuovi 13-20** la tabella non ha geni: non sa che cosa fare, quindi resta in contanti. Valore finale 1000,00 (0,00%), contro 1117,65 (+11,76%) del buy&hold sugli stessi giorni.

La tabella non ha capito nulla del mercato: ha memorizzato 12 giorni. È un caso estremo, costruito apposta per far vedere l'effetto. Più un genoma ha geni e più è flessibile, più facilmente può imparare a memoria. Un genoma con molte regole, un albero grande o una rete con decine di pesi può farlo molto, e per questo la quantità di geni è uno dei criteri di confronto tra le forme (capitoli successivi).

#### 2.6.3 Il secondo meccanismo: provare moltissime volte

Anche con pochi geni c'è un secondo rischio. Si lanciano mille monete dieci volte ciascuna e si tiene quella con più teste: sembra bravissima, ma è solo la più fortunata. Con le strategie succede lo stesso. Si generano 1000 sequenze a caso di 20 decisioni ciascuna (ogni giorno `buy`, `sell` o `hold` con la stessa probabilità; nel calcolo, un generatore con seme 1, `random.Random(1)`, che sceglie uno dei tre simboli per volta). Le prime 12 decisioni di ogni sequenza si valutano sui giorni 1-12; le ultime 8, che sono la continuazione della stessa sequenza, anch'essa a caso, si valutano sui giorni nuovi 13-20.

- La migliore sui giorni 1-12 ottiene 1123,76, cioè il massimo possibile. La media delle 1000 è 1016,50.
- La stessa sequenza, sui giorni nuovi 13-20, ottiene 1056,12 (+5,61%). La media delle 1000 sequenze, sugli stessi giorni, è 1054,48. In questi dati il prezzo sale, quindi anche le sequenze a caso guadagnano in media, e tutti i numeri sono positivi. Conta il confronto: la sequenza scelta perché era la migliore sui giorni visti fa sui giorni nuovi quanto la media delle altre. Il suo risultato sui giorni visti non diceva nulla di ciò che avrebbe fatto dopo.

Chi prova molte configurazioni sugli stessi dati rischia di trovare, per caso, quella che sembra ottima: è il tema di [4] (il rapporto tra numero di prove e sovradattamento; letto per la parte sul metodo hold-out, cioè tenere fuori una parte dei dati). Questo rende l'evoluzione stessa, che prova migliaia di genomi, una fonte di sovradattamento anche quando i geni sono pochi.

#### 2.6.4 Con due soli geni l'effetto è mite

Torniamo al genoma a due geni `(c, m)` e vediamo se anche lì si vede qualcosa. Si fa evolvere la popolazione usando **solo i giorni 1-12** (stesso procedimento della sezione 2.5), poi si prova il migliore sui **giorni 13-20**, che l'algoritmo non ha mai visto. Dopo 10 generazioni il genoma migliore sui giorni 1-12 ha `c` = 0,8952 e `m` = 0,0001 (0,01%).

Semplificazioni di questa prova. Le decisioni si calcolano con la media mobile partendo dal giorno 1 anche per il tratto 13-20 (un genoma vero conosce il passato). Ogni tratto riparte da un capitale di 1000 senza posizioni aperte, ed è valutato dallo stesso valutatore: nel primo tratto si valutano solo i primi 12 giorni, nel secondo solo gli ultimi 8. Il giorno 12 e il giorno 20 non hanno un giorno successivo, quindi la loro decisione è ignorata.

| Tratto | Operazioni | Valore finale | Rendimento | Buy&hold sullo stesso tratto |
|---|---|---|---|---|
| Giorni 1-12 (addestramento) | buy g3 @10,30; sell g10 @11,10 | 1077,67 | +7,77% | 1039,60 (+3,96%) |
| Giorni 13-20 (nuovi) | buy g16 @10,55 | 1080,57 | +8,06% | 1117,65 (+11,76%) |

Come si legge. Sui giorni di addestramento il genoma batte nettamente il buy&hold (+7,77% contro +3,96%). Sui giorni nuovi non va male in assoluto (+8,06%), ma ora è **sotto** il buy&hold (+11,76%). Ciò che cambia è il confronto: su dati già visti sembrava superiore al riferimento, sui dati nuovi no.

Per onestà: con due soli numeri e dati molto regolari come questi l'effetto è **mite**, non c'è un vero collasso. Controllando anche gli altri sei genomi della popolazione iniziale della sezione 2.4, nessuno dei sei crolla sui giorni nuovi (valore sui giorni 1-12 e sui giorni 13-20: genoma 3, 1023,70 e 1055,56; genoma 5, 1019,42 e 1055,56; genoma 1, 995,26 e 1031,67; genoma 2, 972,22 e 1013,33; genomi 4 e 6, sempre 1000,00). Per alcuni di questi genomi il valore sui giorni nuovi è perfino più alto di quello di addestramento: i due tratti hanno lunghezza e andamento diversi, quindi i due valori non si confrontano tra loro ma ciascuno con il buy&hold dello stesso tratto. Il fenomeno diventa grave quando il genoma ha molta libertà, come nella tabella di 12 geni del caso estremo.

#### 2.6.5 Perché servono tre insiemi di dati separati

La difesa è dividere i dati in tre parti, usate in momenti diversi, come nell'immagine dello studente.

| Insieme | Che cosa è | A che cosa serve | Analogia |
|---|---|---|---|
| **Addestramento** (training) | I dati su cui l'algoritmo valuta i genomi e li fa evolvere | Guida la selezione: è il voto che fa evolvere la popolazione | I compiti a casa: si possono rifare mille volte, finché vengono bene |
| **Validazione** (validation) | Dati non usati per evolvere, su cui si confrontano i candidati | Scegliere tra più candidati, fermare l'evoluzione, regolare le impostazioni (per esempio si fa evolvere per 10, 20 o 30 generazioni e si tiene il numero che dà il voto migliore sulla validazione) | La simulazione d'esame: dice come si va su compiti nuovi e permette di correggere lo studio |
| **Prova finale** (test) | Dati tenuti da parte e usati **una volta sola**, alla fine | Una stima onesta di come andrebbe il genoma scelto su dati nuovi | L'esame vero: si fa una volta, e il voto non si può rifare |

Perché non bastano due insiemi? Se si sceglie il genoma in base al voto sui dati di prova, quei dati diventano parte della scelta: ogni volta che li si guarda per decidere, si perde un po' della loro onestà, e come per i compiti a casa a un certo punto si arriva a «conoscerli». La validazione serve a prendere tutte le decisioni (scegliere, fermare, regolare), così la prova finale resta pulita. Per questa ragione i dati di prova non devono essere guardati finché non si è deciso tutto il resto.

Un dettaglio che conta nei dati di borsa: i tre insiemi sono tratti **consecutivi nel tempo**, nell'ordine addestramento, validazione, prova. Quanto sia lungo ciascun tratto e come si dividano i 2517 giorni del progetto non è deciso qui: spetta alla ricerca sul protocollo di valutazione (R6). Mescolare i giorni a caso significherebbe usare il futuro per spiegare il passato, che nell'uso vero non è possibile.

#### 2.6.6 Che cosa mostra il caso reale di Consilium

Il rapporto interno di Consilium sui propri esperimenti (riferimento [18]) ha fatto proprio questo: tenere da parte una finestra di dati finale (in inglese holdout, equivalente a una prova finale) e ri-valutare i genomi evoluti su di essa. Quattro esperimenti, in ordine di realismo crescente. Non riportiamo le cifre. Gli esiti qualitativi, con la fonte:

1. **Addestramento corto su un solo titolo: collasso fuori dal campione.** Nel primo esperimento (circa 21 mesi di addestramento, 3 mesi di prova), tutti i 10 genomi migliori hanno avuto un rendimento negativo sui dati nuovi, nonostante un buon voto in addestramento. Il rapporto lo definisce «overfitting severo e sistematico», e nota che il campione di operazioni era molto piccolo (da 1 a 4 per genoma).
2. **Finestra più lunga sullo stesso titolo: il collasso sparisce, ma i genomi evoluti non battono il buy&hold.** Nel secondo esperimento nessun genoma crolla in modo sistematico, ma tutti i 10 restano nettamente sotto il buy&hold dello stesso periodo.
3. **Più titoli insieme: la generalizzazione migliora, ma il buy&hold non viene mai battuto.** Nel terzo esperimento si usa un **paniere**, cioè un gruppo di titoli, invece di un titolo solo. Il divario tra addestramento e prova è il più piccolo, ma né in un anno positivo né in un anno negativo i genomi battono il buy&hold: nell'anno positivo limitano i guadagni, in quello negativo li amplificano.
4. **Le strategie non si trasferiscono tra panieri di titoli.** Nel quarto esperimento i genomi evoluti su un paniere (una «partizione») sono stati provati sugli altri nove panieri: quasi sempre vanno peggio che sul paniere di origine, in particolare su uno che nell'anno di prova era salito molto.

Il rapporto attribuisce una parte dei risultati ai parametri di rischio degenerati (uno **stop loss**, cioè la soglia di perdita oltre la quale la posizione si chiude da sola, quasi mai raggiungibile, e un take profit, la soglia di guadagno, troppo stretto) e alla fitness basata sul solo CAGR: è il tema della sezione 2.7. Il rapporto non confronta forme di genoma, quindi non può separare il peso della forma da quello della fitness. Questo capitolo non ne trae conclusioni sulle forme di genoma.

### 2.7 Che cosa conta davvero: la funzione di fitness

#### 2.7.1 Il voto decide che cosa viene premiato

L'evoluzione non sa che cosa sia una «buona strategia»: sa solo che i genomi con il voto più alto hanno più figli. Perciò il voto, cioè la **funzione di fitness**, decide tutto. Se il voto premia solo il guadagno finale, l'evoluzione produrrà genomi che puntano al guadagno finale, anche se arrivano a ottenerlo con percorsi pericolosi. Se il voto dovesse premiare anche la stabilità, l'evoluzione cercherebbe genomi stabili. Il genoma non cambia: cambia ciò che la selezione considera meglio.

#### 2.7.2 Che cosa premia oggi Consilium

Il motore genetico di Consilium (il file `ga/ga.js`, nel repository Consilium) dà un voto a ogni individuo in due modi.

- Il **CAGR** (compound annual growth rate, tasso di crescita annuo composto) è il rendimento annuo costante che porterebbe dal capitale iniziale al capitale finale. Annualizzando, un rendimento `r` ottenuto in `n` giorni di borsa diventa `(1 + r)^(250/n) - 1`, con circa 250 giorni di borsa all'anno. Esempio con i nostri dati inventati e `n` = 20: +8,06% in 20 giorni equivale a circa +163% in un anno; il buy&hold, +12,87%, a circa +354%. Per questo i valori annualizzati su periodi brevi possono sembrare enormi, e il rapporto di Consilium lo nota per il suo primo esperimento. Negli esempi di questa guida non lo useremo.
- Una **proporzione tra operazioni vincenti e perdenti**, ricavata da un campo che ogni individuo salva insieme al genoma.

Consilium usa il CAGR per scegliere il primo genitore e la proporzione di operazioni vincenti per scegliere il secondo. Non lavora a generazioni intere come nell'esempio di questo capitolo: genera un figlio alla volta e la popolazione cresce. Il principio (selezione, crossover, mutazione) è lo stesso. I dettagli (torneo tra tre individui, soglia di popolazione, probabilità di mutazione) sono nell'appendice, sezione «Come funziona l'algoritmo genetico di Consilium».

#### 2.7.3 Che cosa non premia

Nessuna delle due funzioni guarda il **rischio**: quanto si scende prima di risalire, o quanto è irregolare il percorso. Un esempio sul dataset giocattolo lo rende concreto.

Per prima cosa, un termine da definire. Il **massimo calo** (in inglese *maximum drawdown*) è la perdita più grande dal punto più alto raggiunto in precedenza. Si calcola così: per ogni giorno si guarda il valore del capitale (denaro più azioni valutate al prezzo di chiusura) e il massimo valore avuto fino ad allora; il calo di quel giorno è il rapporto tra i due, meno 1; il massimo calo è il peggiore tra tutti i giorni. È una misura di quanto «ci si fa male» nel percorso, anche se poi si recupera.

Due genomi diversi della stessa famiglia `(c, m)`: il genoma 3 della sezione 2.4, con `c` = 0,60 e `m = 0,005 (0,5%)`, e un nuovo genoma, il numero 11, con `c` = 0,05 e `m = 0,02 (2%)`. Il genoma 11 è di fatto un genoma «compra e tieni»: compra il giorno 4 e non vende più.

| Genoma | Operazioni | Valore finale | Rendimento | Massimo calo |
|---|---|---|---|---|
| 3 (0,60; 0,005) | buy g4 @10,55; sell g11 @10,80; buy g17 @10,80 | 1080,57 | +8,06% | -4,85% |
| 11 (0,05; 0,02) | buy g4 @10,55 (poi tiene) | 1080,57 | +8,06% | -10,13% |
| buy&hold | buy g2 @10,10 | 1128,71 | +12,87% | -10,13% |

I due genomi finiscono con lo **stesso valore finale**, 1080,57, e per un voto basato sul solo rendimento sono identici. Ma hanno attraversato i 20 giorni in modo diverso.

- Il genoma 3 ha comprato il giorno 4 e ha raggiunto 1075,83 il giorno 8 (il picco). Poi ha venduto il giorno 11, quando il capitale era sceso a 1023,70, e ha aspettato fuori dal mercato. Il calo massimo è (1023,70 / 1075,83) - 1 = -4,85%.
- Il genoma 11 ha comprato il giorno 4 e non ha mai venduto. Dal picco di 1075,83 (giorno 8) è sceso fino a 966,82 (giorno 14), sotto il capitale iniziale, e poi è risalito. Il calo massimo è (966,82 / 1075,83) - 1 = -10,13%.

Per un investitore la differenza è grande: il genoma 11 ha passato quattro giorni (dal 12 al 15) sotto il capitale iniziale e al punto più basso aveva perso il 3,3% di quello che aveva messo; il genoma 3 non è mai sceso sotto 1000. Il voto basato sul rendimento non distingue i due. Una funzione che penalizzasse il massimo calo preferirebbe il genoma 3. Il rapporto di Consilium, tra le possibili direzioni future, elenca «una fitness che penalizzi il drawdown massimo o la volatilità dei rendimenti, non solo il CAGR medio».

Attenzione al contrario: si potrebbe pensare che penalizzare il rischio sia sempre meglio. Ma ogni scelta sposta ciò che l'evoluzione produce: una fitness che penalizza molto il calo premierebbe genomi che non operano mai (come i genomi 4 e 6 della sezione 2.4, che non hanno alcun calo), e con il ragionamento di questo capitolo non c'è una scelta «giusta» in assoluto.

#### 2.7.4 La scelta della fitness non è decisa qui

Quale voto usare è oggetto di una ricerca a parte, chiamata **R5** (la ricerca sulla funzione di fitness) nell'epica del progetto. Questa guida descrive il meccanismo e mostra che la scelta conta: **non decide** quale fitness adottare. Vale per tutte le forme di genoma, ed è una scelta indipendente dalla forma che verrà scelta.

### 2.8 Come cambia l'algoritmo genetico secondo la forma del genoma

Il ciclo (valutare, selezionare, incrociare, mutare) è identico per tutte le forme. Cambia che cosa sono i geni, e quindi come si mescolano due genitori (crossover) e come si modifica un genitore (mutazione).

- Se il genoma è un elenco di numeri, come nel punteggio lineare, è facile: si scambiano o si mediano i numeri, e se ne cambia uno di poco, come negli esempi di questo capitolo.
- Se il genoma ha una struttura, serve più cura. Mescolare due formule ad albero vuol dire scambiare rami. Mescolare due elenchi di regole può dare figli senza senso, perché l'ordine delle regole ne cambia il significato. Mescolare due reti che fanno la stessa cosa ma hanno i neuroni in ordine diverso dà figli scadenti. Mescolare due modelli a regimi richiede di tenere in ordine i numeri, perché le probabilità di ogni riga devono sommare a 1.
- Per la macchina a stati attuale, l'algoritmo genetico di Consilium mescola due genitori **lista per lista**: per ogni lista di condizioni di uno stato prende a caso quella di un genitore o dell'altro, e i numeri uno per uno. La mutazione sposta di poco i coefficienti delle medie, cambia i margini e cambia, aggiunge o toglie una condizione in una lista (dettagli nell'appendice).

Questi punti sono ripresi, con numeri, nel capitolo di ciascuna forma. La tabella con una riga per forma (che cosa sono i geni, quanti sono, come si fanno crossover e mutazione) è nell'appendice, sezione «Crossover e mutazione per le sette forme»: conviene leggerla dopo aver visto le forme.

### 2.9 Dove stiamo nel progetto

Questo capitolo ha mostrato l'algoritmo genetico su una piccola scala, come si fa per capirlo. Nel progetto le cose stanno così.

- L'**evoluzione avverrà fuori dal browser**, in Node, nel repository Consilium su un branch dedicato. Una popolazione grande e molte generazioni sono un lavoro lungo e pesante, che il browser non è fatto per svolgere.
- Il **PoC** di SwarmTrader-core (il prototipo nel browser, descritto in premessa) **non evolve nulla**: riproduce, sui dati storici di ENI già incorporati, un genoma già evoluto, e lo mostra giorno per giorno.
- La forma del genoma, che questa guida aiuta a scegliere, determina che cosa il motore di evoluzione deve gestire (i geni, il crossover, la mutazione, come nella sezione 2.8) e che cosa il PoC deve saper riprodurre.

### 2.10 In breve

- Un algoritmo genetico fa evolvere una popolazione di strategie: ogni genoma riceve un voto (la fitness), i migliori fanno da genitori, i figli nascono per crossover e mutazione, e il ciclo si ripete.
- Nell'esempio a due geni (`c`, `m`) sul dataset giocattolo, una generazione ha portato il voto medio da 1021,71 a 1079,15 e il migliore da 1080,57 a 1133,02. Sono numeri inventati: mostrano il meccanismo e non provano nulla sui mercati.
- Si usa una popolazione perché esplora più punti e mette insieme le parti riuscite di individui diversi; la popolazione converge quando i genomi diventano simili e i voti smettono di salire.
- Un genoma può imparare a memoria i dati su cui è scelto (overfitting): per questo servono tre insiemi di dati separati (addestramento, validazione, prova finale). Gli esperimenti di Consilium mostrano, qualitativamente, collasso fuori campione con addestramento corto, genomi che non battono il buy&hold e strategie che non si trasferiscono tra panieri.
- La fitness decide che cosa viene premiato: Consilium usa il CAGR (e per il secondo genitore la proporzione di operazioni vincenti), che non guarda il rischio. Due genomi con lo stesso valore finale (1080,57) hanno massimi cali di -4,85% e -10,13%. La scelta della fitness è oggetto di una ricerca a parte (R5) e non è decisa qui.
- La forma del genoma cambia che cosa sono i geni e come si fanno crossover e mutazione, non il ciclo.

## 3. La macchina a stati attuale

Questo capitolo descrive la forma di genoma che il progetto usa oggi, quella ereditata da Consilium. Serve da metro di confronto per tutte le alternative: per giudicarle bisogna sapere bene com'è fatto il genoma di oggi, che cosa sa fare e dove tiene il ricordo del passato.

**Il fatto da tenere a mente.** La macchina reale decide solo quando entrare; l'uscita è affidata alle soglie di perdita e di guadagno. Nel genoma fisso (il genoma già evoluto che il PoC ripete giorno per giorno) un solo stato, chiamato SW (sezione 3.3.2), porta l'ordine di comprare. Nessuno stato porta l'ordine di vendere: una posizione aperta si chiude da sola quando il prezzo tocca la soglia di perdita (stop loss) o quella di guadagno (take profit). Queste soglie non appartengono alla macchina ma al `Trader`, il modulo che esegue gli ordini e tiene il portafoglio (vedi 3.3.7). Il lavoro del genoma evoluto è quindi uno solo: disporre stati e condizioni in modo che la macchina arrivi in SW nei momenti in cui conviene comprare. Il resto del capitolo spiega come ci arriva, anche su un tratto di giorni veri di ENI (sezione 3.3.8).

**Avvertenza sull'esempio ridotto.** Per l'esempio giorno per giorno (sezione 3.4) si usa una **versione ridotta a tre stati**. Quella versione ha azioni che la macchina reale non ha: ogni suo stato compra, vende o aspetta, mentre la reale compra solo in SW e non vende mai per scelta di uno stato. La si usa lo stesso per due motivi. Il valutatore del dataset giocattolo non ha stop loss né take profit, e senza uscite una macchina che compra soltanto non avrebbe nulla da mostrare. E ciò che l'esempio vuole far vedere, cioè come uno stato ricordi il passato e come le liste di condizioni si mescolino e si cambino, non dipende da dove stanno le azioni.

### 3.1 In una frase e un'analogia

Il genoma attuale è una macchina a stati: una rete di nove «situazioni» in cui la strategia può trovarsi, collegate da regole che dicono, in base a confronti tra medie di prezzi e di volumi, quando passare da una situazione all'altra. Una sola situazione, SW, porta con sé l'ordine di comprare.

L'analogia più semplice è un semaforo. Ha tre stati (verde, giallo, rosso) e passa dall'uno all'altro quando scade un timer: il verde diventa giallo, il giallo diventa rosso, il rosso diventa verde. Quello che il semaforo fa dipende dallo stato in cui si trova, non solo dall'evento. Per un programmatore è lo stesso schema di un `switch` su una variabile `state` che viene riassegnata a ogni ciclo.

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
| Attesa | l'utente preme «annulla» | Attesa | nessuna |
| Credito | il credito basta per la bevanda scelta | Erogazione | rilascia la bevanda |
| Credito | l'utente preme «annulla» | Attesa | restituisce le monete |
| Erogazione | la bevanda è caduta | Attesa | nessuna |

Lo stesso evento, «l'utente preme annulla», ha effetti diversi a seconda dello stato: in Attesa non succede nulla, in Credito le monete tornano indietro. Lo stato è quindi una **memoria**: ricorda che cosa è successo prima (c'è una moneta dentro) e permette di rispondere in modo diverso allo stesso dato in ingresso. È questa proprietà che interessa a noi.

### 3.3 Come funziona: il genoma reale di Consilium

I numeri di questa sezione sono stati ricontrollati facendo girare il motore del progetto sul genoma fisso, sui dati di ENI. Le citazioni del codice sono raccolte nell'appendice «Approfondimenti», sezione «Riferimenti al codice: capitolo 3».

#### 3.3.1 Che cosa decide ogni giorno

Il genoma non decide in autonomia che cosa fare dei soldi. Ogni giorno la macchina riceve la barra del giorno (apertura, massimo, minimo, chiusura e volume scambiato, cioè il numero di azioni passate di mano), aggiorna i suoi filtri, valuta se cambiare stato e, se lo stato in cui si trova porta l'azione di acquisto, chiede al `Trader` di comprare. Il `Trader` esegue l'ordine il giorno dopo, all'apertura, e si occupa anche delle uscite per stop loss e take profit (vedi 3.3.7).

Come «prezzo del giorno» la macchina usa la media di apertura, massimo, minimo e chiusura. Il «volume» è il volume del giorno.

#### 3.3.2 I nove stati e la bussola

I nove stati si chiamano come i punti di una bussola e sono disposti su una griglia di tre righe per tre colonne:

```
          colonna 0   colonna 1   colonna 2
riga 0      NW          N           NE
riga 1      W           C           E
riga 2      SW          S           SE
```

La macchina parte dallo stato centrale **C**. Da ogni stato si può uscire in quattro direzioni: nord, est, sud, ovest. La direzione porta allo stato confinante sulla griglia. Da C, per esempio, il nord porta a N e l'est a E. La griglia è «avvolta»: uscendo dal bordo si rientra dal bordo opposto. Da NW il nord porta a SW (si esce in alto e si rientra in basso) e l'ovest porta a NE. Il risultato è che ogni stato ha esattamente quattro vicini e il grafo non ha bordi.

Perché questa disposizione? Nel codice non c'è scritto e non risulta un documento che la motivi **[ipotesi]**. Si può solo osservare che quattro direzioni danno a ogni stato lo stesso numero di uscite, e quindi un formato fisso del genoma: per ogni stato ci sono al più quattro liste di condizioni, nient'altro. Questo semplifica la codifica e lo scambio di stati tra due genitori. Il codice nasce come traduzione di una versione in C++, quindi la scelta è ereditata.

I nomi NW, N, NE e così via sono solo posizioni sulla griglia. Nulla nel nome dice che cosa lo stato «rappresenti». Come sono scritte le uscite nel genoma, e una stranezza di nome nello stato SW che non ha effetti sul genoma fisso, si trovano nell'appendice «Approfondimenti», sezione «Dal capitolo 3: la griglia e i nomi delle uscite».

#### 3.3.3 I quattro filtri

La macchina non guarda direttamente i prezzi passati: ne mantiene quattro riassunti, detti filtri. Ciascuno è una media mobile esponenziale (EMA, vedi 1.3; nel codice si chiama «IIR»): un numero `c` tra 0 e 1 dice quanto pesa il dato di oggi, e un `c` grande segue il dato da vicino, uno piccolo cambia piano. Due filtri seguono il prezzo, due il volume. I loro `c` fanno parte del genoma e valgono:

| Filtro | Segue | Coefficiente c | Durata tipica 1/c (giorni) | In pratica |
|---|---|---|---|---|
| prezzo 1 (`iir_price_1`) | il prezzo | 0,731 | 1,4 | media breve, un po' più morbida del prezzo |
| prezzo 2 (`iir_price_2`) | il prezzo | 0,990 | 1,0 | quasi uguale al prezzo di oggi |
| volume 1 (`iir_volume_1`) | il volume | 0,118 | 8,5 | media **lenta** del volume |
| volume 2 (`iir_volume_2`) | il volume | 0,396 | 2,5 | media **veloce** del volume |

«Durata tipica» è un modo grossolano per dire quanti giorni di passato pesano in modo apprezzabile (circa 1 diviso c). I nomi «veloce» e «lento» hanno senso solo dentro una coppia e per questi valori: sono i coefficienti, che sono geni, a dire quale dei due filtri sia il più rapido. Qui per il volume il filtro 1 è il lento e il 2 è il veloce.

#### 3.3.4 I quattro margini

A ciascun filtro è associato un **margine**, un numero percentuale del genoma che sposta la soglia di confronto. Il margine è proporzionale al filtro: `margine assoluto = filtro · margine percentuale / 100`. Il suo scopo è evitare di reagire a differenze minime, oppure, con un margine negativo, di tollerare un piccolo scarto nella direzione opposta.

Valori del genoma fisso: margine del prezzo 1 = 0,10 per cento; margine del prezzo 2 = -1,10 per cento (negativo); margine del volume 1 = 2,40 per cento; margine del volume 2 = 11,62 per cento.

Due esempi con numeri scelti per capire (non sono dati ENI). Il filtro del prezzo 1 vale 10,90 e il margine 1 vale 0,10 per cento: il margine è 10,90 · 0,001 = 0,0109 e la soglia è 10,90 + 0,0109 = 10,9109. Con un margine negativo la soglia scende: filtro del prezzo 2 a 11,00 e margine -1,10 per cento danno una soglia di 11,00 - 0,121 = 10,879. Un prezzo di 10,95 sta sopra questa soglia anche se è sotto il filtro (11,00): il margine negativo ha abbassato la soglia dell'1,1 per cento, a 10,879.

#### 3.3.5 Le quattordici condizioni

Una **condizione** è un confronto che dà vero o falso. Ce ne sono quattordici, numerate da 0 a 13. Le prime due sono banali: la 0 è sempre falsa e la 1 è sempre vera. Le altre dodici sono coppie «maggiore di» / «minore di». In tabella «margine 1» e «margine 2» sono quelli del prezzo, «margine volume 1» e «margine volume 2» quelli del volume, e ogni confronto usa la soglia già spostata del suo margine. La colonna «In parole» legge i confronti come se il margine fosse zero: il margine sposta la soglia e conta di più quando è grande, come per il volume 2 (11,62 per cento).

| N. | Confronto | In parole |
|---|---|---|
| 0 | sempre falso | non scatta mai |
| 1 | sempre vero | scatta sempre |
| 2 | prezzo > filtro prezzo 1 + margine 1 | il prezzo di oggi è sopra il filtro prezzo 1 |
| 3 | prezzo < filtro prezzo 1 + margine 1 | il prezzo di oggi è sotto il filtro prezzo 1 |
| 4 | prezzo > filtro prezzo 2 + margine 2 | il prezzo di oggi è sopra il filtro prezzo 2 |
| 5 | prezzo < filtro prezzo 2 + margine 2 | il prezzo di oggi è sotto il filtro prezzo 2 |
| 6 | filtro prezzo 1 > filtro prezzo 2 + margine 2 | il filtro prezzo 1 sta sopra il filtro prezzo 2 |
| 7 | filtro prezzo 1 < filtro prezzo 2 + margine 2 | il filtro prezzo 1 sta sotto il filtro prezzo 2 |
| 8 | volume > filtro volume 1 + margine volume 1 | oggi si scambia più della media lenta del volume |
| 9 | volume < filtro volume 1 + margine volume 1 | oggi si scambia meno della media lenta del volume |
| 10 | volume > filtro volume 2 + margine volume 2 | il volume di oggi è sopra la media veloce del volume |
| 11 | volume < filtro volume 2 + margine volume 2 | il volume di oggi è sotto la media veloce del volume |
| 12 | filtro volume 1 > filtro volume 2 + margine volume 2 | la media lenta del volume supera la veloce di più del margine (a margine zero: il volume sta calando) |
| 13 | filtro volume 1 < filtro volume 2 + margine volume 2 | la media lenta del volume non supera la veloce di più del margine (a margine zero: il volume sta crescendo) |

Le righe 12 e 13 usano il margine del volume 2, che nel genoma fisso è grande: 11,62 per cento del filtro volume 2. A margine zero direbbero «volume in calo» (12: la lenta sta sopra la veloce) e «volume in crescita» (13: la lenta sta sotto la veloce), perché nel genoma fisso il volume 1 è il filtro lento e il volume 2 il veloce (sezione 3.3.3). Con il margine del genoma fisso la 13 è vera anche quando la media lenta sta **sopra** la veloce, purché di meno dell'11,62 per cento di questa. Il 21 aprile 2020 (sezione 3.3.8) la media lenta del volume vale 27,38, la veloce 24,96 e la soglia, 24,96 più l'11,62 per cento, 27,86: la 13 è vera, anche se il volume non è affatto in crescita. Sull'intero replay ENI la 13 è vera in 1854 giorni su 2516 e in 791 di questi la media lenta sta sopra la veloce (conteggio fatto con il motore del progetto). In un altro genoma, con coefficienti e margini diversi, i ruoli potrebbero invertirsi.

Dei 14 identificatori, 12 hanno un contenuto di mercato e 2 sono costanti. Le dodici sono sei coppie «maggiore di» e «minore di» sullo stesso confronto (le coppie non coprono il caso di uguaglianza esatta).

Un esempio concreto con numeri scelti per capire: prezzo di oggi 11,00, filtro del prezzo 1 a 10,90. La condizione 2 confronta 11,00 con 10,9109: è vera. Un altro: volume di oggi 1500, filtro del volume 1 a 1300, margine volume 1 = 2,40 per cento. La soglia è 1300 + 1300 · 0,0240 = 1331,2; 1500 > 1331,2, quindi la condizione 8 è vera.

#### 3.3.6 Le transizioni: liste di condizioni

Ogni stato ha fino a quattro **liste di condizioni**, una per direzione. La lista è un elenco di identificatori e la transizione scatta solo se **tutte** le condizioni della lista sono vere (un AND). Esempio dal genoma fisso: la lista dello stato NW verso sud è `[1]`, cioè «condizione 1», sempre vera. La lista di C verso sud è `[0, 1, 1, 8, 0, 10]`: contiene due volte la condizione 0 (sempre falsa), perciò non può mai scattare. Anche una lista con due condizioni opposte, come la 2 e la 3 insieme, non può mai scattare.

Ogni giorno si controllano le direzioni **nell'ordine nord, est, sud, ovest** e si prende la prima la cui lista è tutta vera; se nessuna lo è, lo stato non cambia. Si fa al massimo una transizione al giorno.

In cifre, il genoma fisso ha 36 liste (quattro per stato) con 135 identificatori in totale, da 1 a 8 per lista; 7 liste contengono lo 0 e non scattano mai, 2 sono fatte solo di 1 e scattano sempre (NW verso sud e C verso nord). Il resto dei conteggi è nell'appendice, sezione «Dal capitolo 3: conteggi sul genoma fisso».

Un esempio di come la macchina cammina: la macchina parte in C e la lista di C verso nord è `[1, 1]`, sempre vera. Quindi, il primo giorno in cui decide, passa da C a N, indipendentemente dai dati. Il giorno dopo guarda le liste di N, e così via. Nella sezione 3.3.8 si vede il meccanismo su giorni veri.

#### 3.3.7 Azioni, stop loss, take profit, percentuale investita

Ogni stato può avere un'**azione**, `buy` o `sell`. Nel genoma fisso solo lo stato **SW** ha un'azione, `buy`. Ogni giorno in cui la macchina si trova in SW, chiede di comprare; negli altri otto stati non fa nulla (è un «hold» implicito). **Non esiste uno stato con `sell`: la macchina reale non vende mai di sua iniziativa.** Le vendite avvengono per un'altra via, descritta qui sotto.

**Che cosa fa il `Trader` con un `buy`.** Se riceve un `buy` e c'è denaro disponibile, impiega la quota prevista (vedi sotto) del denaro **che ha in quel momento**, anche se una posizione è già aperta. Nel replay ENI succede: il 19 maggio 2020, con una posizione aperta dal 14 maggio, un secondo acquisto compra 4 azioni con il denaro rimasto. Poiché dopo il primo acquisto resta poco denaro, i `buy` successivi comprano quasi nulla.

**Percentuale investita (`buy_percent`).** È la quota del denaro disponibile che un acquisto impiega. Nel genoma fisso è 99,62 per cento: su 1000 euro disponibili si comprano azioni per circa 996,17 euro (parte del denaro può andare in costi o nell'arrotondamento a un numero intero di azioni).

**Stop loss.** È una soglia di perdita: se il prezzo scende sotto un certo livello rispetto al prezzo di acquisto, la posizione si chiude automaticamente per limitare il danno. Esempio: compro a 10,00 con stop loss 50 per cento; la posizione si chiude se il prezzo scende a 10,00 · (1 - 0,50) = 5,00. Nel genoma fisso è 50 per cento: una soglia così lontana scatta soltanto in un crollo. Il controllo usa il minimo del giorno: se il minimo tocca la soglia, si esce al prezzo della soglia.

**Take profit.** È la soglia di guadagno: se il prezzo sale oltre un certo livello rispetto all'acquisto, la posizione si chiude per incassare. Esempio: compro a 10,00 con take profit 5,8 per cento; la posizione si chiude se il prezzo sale a 10,00 · 1,058 = 10,58. Nel genoma fisso è 5,8 per cento. Il controllo usa il massimo del giorno.

Nel genoma fisso, quindi, la strategia è: gli stati e le condizioni decidono **quando entrare** (stato SW); stop loss e take profit decidono **quando uscire**. Questi tre parametri (percentuale, stop loss, take profit) sono del `Trader`, non della macchina a stati, e valgono per qualsiasi forma di genoma (vedi la sezione «Metodo e fonti» della rassegna). Conseguenza per il confronto con le altre forme: queste decidono anche l'uscita con i loro stessi numeri, mentre la macchina reale la lascia alle due soglie.

#### 3.3.8 Un tratto di giorni veri: come la macchina arriva in SW

Qui non ci sono numeri inventati: sono i giorni veri di ENI dello snapshot del progetto, fatti passare dal motore con il genoma fisso. L'esempio mostra un meccanismo; non dice niente su quanto bene o male la macchina si comporti.

**Come si arriva fin lì.** Il primo bar dello snapshot (la copia fissa dei dati storici incorporata nel progetto; 29 settembre 2016) serve a inizializzare i filtri. Il giorno dopo la macchina passa da C a N (lista `[1, 1]`). Poi, per più di tre anni, si muove tra N, NE e SE senza mai toccare SW. Il 24 marzo 2020 entra in NW; da quel giorno, fino al tratto che segue, resta tra NW e W. Per leggere i passaggi servono le liste di tre stati (numeri come nella tabella delle condizioni; per ogni direzione si indica lo stato a cui porta):

| Stato | Nord | Est | Sud | Ovest |
|---|---|---|---|---|
| NW | verso SW: `[8, 4, 6, 10]` | verso N: `[2, 8, 7, 5, 12, 3]` | verso W: `[1]` | verso NE: `[8]` |
| W | verso NW: `[3, 3, 11, 4]` | verso C: `[9, 11, 2, 8, 10, 5, 8, 5]` | verso SW: `[3]` | verso E: `[11, 0, 12, 5, 4, 0]` |
| SW | verso W: `[6]` | verso S: `[9, 2, 0, 12]` | verso NW: `[3, 9, 9, 3, 2, 4]` | verso SE: `[10, 4, 4, 5, 12, 5, 6, 7]` |

Si controllano nell'ordine nord, est, sud, ovest. Alcune liste non possono scattare mai: quella a est di NW contiene la 2 e la 3 (prezzo sopra e sotto lo stesso filtro), quella a est di W contiene la 8 e la 9 (volume sopra e sotto la stessa soglia) e quella a ovest di W contiene lo 0.

**Il tratto, dal 16 al 22 aprile 2020.** Prima i filtri e le soglie (soglia = filtro più margine; i volumi sono in milioni di azioni):

| Giorno | Prezzo | Filtro prezzo 1 | Soglia 1 | Filtro prezzo 2 | Soglia 2 |
|---|---|---|---|---|---|
| 16 apr | 8,572 | 8,678 | 8,687 | 8,574 | 8,480 |
| 17 apr | 8,597 | 8,619 | 8,627 | 8,597 | 8,502 |
| 20 apr | 8,443 | 8,490 | 8,499 | 8,444 | 8,351 |
| 21 apr | 8,080 | 8,191 | 8,199 | 8,084 | 7,995 |
| 22 apr | 8,158 | 8,167 | 8,175 | 8,157 | 8,067 |

| Giorno | Volume | Filtro volume 1 | Soglia V1 | Filtro volume 2 | Soglia V2 |
|---|---|---|---|---|---|
| 16 apr | 19,34 | 28,94 | 29,63 | 22,13 | 24,71 |
| 17 apr | 18,85 | 27,75 | 28,42 | 20,83 | 23,25 |
| 20 apr | 18,90 | 26,71 | 27,35 | 20,07 | 22,40 |
| 21 apr | 32,42 | 27,38 | 28,04 | 24,96 | 27,86 |
| 22 apr | 22,69 | 26,83 | 27,47 | 24,06 | 26,86 |

Poi le condizioni risultate vere e la transizione (la riga del 21 aprile è quella decisiva). La 13 è vera anche il 21 aprile, pur con la media lenta (27,38) sopra la veloce (24,96): conta la soglia V2, 27,86, che include il margine (sezione 3.3.5).

| Giorno | Condizioni vere | Stato prima | Lista che scatta | Stato dopo |
|---|---|---|---|---|
| 16 apr | 1, 3, 4, 6, 9, 11, 12 | W | nord di W, `[3, 3, 11, 4]` | NW |
| 17 apr | 1, 3, 4, 6, 9, 11, 12 | NW | sud di NW, `[1]` | W |
| 20 apr | 1, 3, 4, 6, 9, 11, 12 | W | nord di W, `[3, 3, 11, 4]` | NW |
| 21 apr | 1, 3, 4, 6, 8, 10, 13 | NW | nord di NW, `[8, 4, 6, 10]` | **SW** |
| 22 apr | 1, 3, 4, 6, 9, 11, 13 | SW | nord di SW, `[6]` | W |

**Come si legge, passo per passo.**

1. *16 aprile, in W.* Si guarda prima la lista a nord, `[3, 3, 11, 4]`: prezzo sotto la soglia 1 (8,572 contro 8,687, condizione 3), volume sotto la soglia V2 (19,34 contro 24,71, condizione 11), prezzo sopra la soglia 2 (8,572 contro 8,480, condizione 4). Sono tutte vere (la 3 compare due volte), la transizione scatta e la macchina va in NW.
2. *17 aprile, in NW.* La lista a nord, `[8, 4, 6, 10]`, chiede il volume sopra la soglia V1 (condizione 8). Il volume è 18,85 milioni e la soglia 28,42: la 8 è falsa, la lista non scatta. La lista a est non può scattare mai. La lista a sud è `[1]`, sempre vera: la macchina torna in W. Il 20 aprile si ripete lo stesso giro (W a NW, per la lista a nord di W).
3. *21 aprile, in NW.* Questa volta il volume del giorno è 32,42 milioni, sopra sia la soglia V1 (28,04) sia la V2 (27,86): le condizioni 8 e 10 sono vere. Con la 4 (prezzo sopra la soglia 2, 8,080 contro 7,995) e la 6 (filtro prezzo 1 sopra la soglia 2: 8,191 contro 7,995) la lista a nord di NW, `[8, 4, 6, 10]`, è tutta vera. Viene controllata per prima, quindi vince sulla lista a sud: la macchina passa da NW a **SW**.
4. *Lo stato SW porta `buy`.* Alla fine del 21 aprile la macchina è in SW e chiede di comprare. Il `Trader` esegue l'ordine il giorno dopo, all'apertura: il 22 aprile 2020 al prezzo di 7,995.
5. *22 aprile, in SW.* La macchina è già ripartita: la lista a nord di SW è `[6]`, la 6 è vera e la macchina torna in W. Non chiede altri acquisti.
6. *L'uscita non passa dalla macchina.* Alla posizione aperta il 22 aprile il `Trader` ha attaccato le due soglie: take profit a 7,995 · 1,058 = 8,45871 e stop loss a 7,995 · 0,50 = 3,9975. Il 23 aprile il massimo del giorno (8,669) tocca la prima soglia e il `Trader` chiude la posizione a 8,45871. Nessuna lista di condizioni è intervenuta.

Che cosa mostra il tratto. Primo: lo stato in cui si è conta, perché la stessa condizione sul volume porta in posti diversi a seconda di dove si è. Secondo: l'ordine di controllo conta, perché la lista a nord vince sulla lista a sud. Terzo: la macchina può passare moltissimi giorni oscillando tra stati senza comprare, finché una combinazione di condizioni non la porta in SW (qui: un giorno di volume alto mentre era in NW). Il tratto è stato scelto perché contiene il primo acquisto; non è un campione del comportamento generale della macchina.

### 3.4 Esempio applicato al dataset giocattolo

Numeri di esempio inventati: mostrano il meccanismo, non dicono nulla sulla qualità della forma.

**Versione ridotta, dichiarata come tale.** La macchina reale ha nove stati, quattro filtri, quattordici condizioni e 36 transizioni: non entrerebbe in una tabella giorno per giorno. Per capire il meccanismo si usa una versione ridotta che ne conserva lo spirito: **tre stati**, **due filtri**, **due condizioni** (più una «sempre vera» che serve nella parte sull'evoluzione). Ricordiamo la differenza detta all'inizio del capitolo: qui ogni stato ha un'azione (buy, sell o hold), mentre la macchina reale compra solo in SW e non vende per stato.

**Gli ingredienti.**

- Stati: **Fuori** (non ho posizione), **In osservazione** (ieri il filtro veloce ha superato il lento), **Dentro** (ho deciso di tenere o comprare).
- Filtri sul prezzo: veloce con c = 0,5 e lento con c = 0,2.
- Margine: 0.
- Condizioni: **SOPRA** = filtro veloce > filtro lento; **SOTTO** = filtro veloce < filtro lento; **SEMPRE** = sempre vera. I nomi in maiuscolo servono solo a non confonderle con altri esempi.
- Azioni: Fuori = sell, In osservazione = hold, Dentro = buy (azioni che la macchina reale non ha: vedi sopra).

**Tabella delle transizioni.** Si controllano nell'ordine scritto, la prima vera scatta; se nessuna è vera si resta dove si è.

| Stato attuale | Condizione | Stato successivo |
|---|---|---|
| Fuori | SOPRA | In osservazione |
| In osservazione | SOTTO | Fuori |
| In osservazione | SOPRA | Dentro |
| Dentro | SOTTO | Fuori |

Le uscite da In osservazione sono due liste in ordine: prima SOTTO, poi SOPRA.

**Semplificazioni di questo esempio.** Decisione alla chiusura del giorno t, eseguita al prezzo del giorno t+1; compra con tutto il denaro o vende tutto; azioni frazionarie; nessun costo, nessuno stop loss né take profit; l'ultima decisione è ignorata; capitale 1000. La macchina parte in Fuori (quella reale parte in C). Il prezzo del giorno è quello di chiusura del dataset giocattolo, non la media di quattro valori. Il volume non è usato. Nelle tabelle i numeri sono arrotondati a due decimali. Per chi vuole vedere la macchina reale in azione su giorni veri c'è la sezione 3.3.8.

**Tabella giorno per giorno:**

| Giorno | Prezzo | Filtro veloce | Filtro lento | Stato prima | Transizione | Stato dopo | Decisione |
|---|---|---|---|---|---|---|---|
| 1 | 10,00 | 10,00 | 10,00 | Fuori | nessuna | Fuori | sell |
| 2 | 10,10 | 10,05 | 10,02 | Fuori | SOPRA | In osservazione | hold |
| 3 | 10,30 | 10,18 | 10,08 | In osservazione | SOPRA | Dentro | buy |
| 4 | 10,55 | 10,36 | 10,17 | Dentro | nessuna | Dentro | buy |
| 5 | 10,80 | 10,58 | 10,30 | Dentro | nessuna | Dentro | buy |
| 6 | 11,00 | 10,79 | 10,44 | Dentro | nessuna | Dentro | buy |
| 7 | 11,20 | 11,00 | 10,59 | Dentro | nessuna | Dentro | buy |
| 8 | 11,35 | 11,17 | 10,74 | Dentro | nessuna | Dentro | buy |
| 9 | 11,30 | 11,24 | 10,85 | Dentro | nessuna | Dentro | buy |
| 10 | 11,10 | 11,17 | 10,90 | Dentro | nessuna | Dentro | buy |
| 11 | 10,80 | 10,98 | 10,88 | Dentro | nessuna | Dentro | buy |
| 12 | 10,50 | 10,74 | 10,81 | Dentro | SOTTO | Fuori | sell |
| 13 | 10,30 | 10,52 | 10,70 | Fuori | nessuna | Fuori | sell |
| 14 | 10,20 | 10,36 | 10,60 | Fuori | nessuna | Fuori | sell |
| 15 | 10,35 | 10,36 | 10,55 | Fuori | nessuna | Fuori | sell |
| 16 | 10,55 | 10,45 | 10,55 | Fuori | nessuna | Fuori | sell |
| 17 | 10,80 | 10,63 | 10,60 | Fuori | SOPRA | In osservazione | hold |
| 18 | 11,05 | 10,84 | 10,69 | In osservazione | SOPRA | Dentro | buy |
| 19 | 11,25 | 11,04 | 10,80 | Dentro | nessuna | Dentro | buy |
| 20 | 11,40 | 11,22 | 10,92 | Dentro | nessuna | Dentro | buy |

**Che cosa succede, giorno per giorno.** Il giorno 1 le due medie sono uguali al prezzo, nessuna condizione è vera. Il giorno 2 il prezzo sale, il filtro veloce (che reagisce di più) supera il lento: scatta SOPRA e la macchina passa da Fuori a In osservazione. Il giorno 3 SOPRA è ancora vera e, essendo In osservazione, la macchina passa a Dentro e decide `buy`. Nei giorni 4-11 SOPRA resta vera, ma dallo stato Dentro non esiste una transizione che usi SOPRA, quindi si resta lì. Il giorno 12 il prezzo è sceso a 10,50 e il filtro veloce (10,74) è sceso sotto il lento (10,81): scatta SOTTO e si torna a Fuori, con `sell`. I giorni 13-16 il filtro veloce è sotto il lento: da Fuori non c'è una transizione per SOTTO, si resta Fuori. Il giorno 17 il veloce supera di nuovo il lento e il ciclo si ripete.

**Come lo stato ricorda.** Gli stessi dati in ingresso, SOPRA vera, producono tre effetti diversi: il giorno 2 portano da Fuori a In osservazione, il giorno 3 da In osservazione a Dentro, il giorno 4 non cambiano nulla. La macchina non conta quante volte SOPRA sia stata vera; il suo stato lo ricorda al posto suo. «In osservazione» significa: «ieri ero Fuori e il filtro veloce ha superato quello lento». È una frase sul passato, scritta nel nome dello stato. Dentro significa: «ho già visto due giorni di fila il veloce sopra il lento». Così, usando soltanto confronti che guardano il giorno corrente, la macchina esprime una regola con conferma di due giorni. Una regola che guarda solo i dati di oggi non saprebbe scriverla da sola: servirebbe un indicatore che porti già con sé il giorno prima, cosa possibile ma diversa (capitolo 4). Su questo dataset il ramo In osservazione verso Fuori non viene mai usato (dopo un SOPRA non arriva mai subito un SOTTO), ma esiste e si userebbe con un falso segnale.

**Risultato col valutatore.**

| Strategia | Operazioni (giorno, tipo, prezzo) | Valore finale | Rendimento |
|---|---|---|---|
| Macchina ridotta | giorno 4 buy a 10,55; giorno 13 sell a 10,30; giorno 19 buy a 11,25 | 989,32 | -1,07 per cento |
| Buy&hold (comprare il giorno 1 e tenere, riferimento) | giorno 2 buy a 10,10 | 1128,71 | +12,87 per cento |

La macchina ridotta compra con un giorno di ritardo rispetto al segnale (come impone il valutatore), vende in ritardo rispetto al massimo e rientra tardi. Nel dataset giocattolo quindi non batte il buy&hold, e va bene: l'esempio mostra il meccanismo, non un risultato.

### 3.5 Come evolve

Il PoC non fa evolvere nulla: rigioca un genoma già evoluto. L'evoluzione vera è quella dell'algoritmo genetico (GA) di Consilium, che ha prodotto il genoma fisso, e questa sezione descrive quella. Il PoC contiene anche una copia ridotta del codice di Consilium, adattata al browser (nel seguito il «fork»: una versione diversa dal software originale), con una mutazione e un crossover propri: non è il GA che ha prodotto il genoma fisso e non la useremo come descrizione (dettagli nell'appendice «Approfondimenti», sezione «Dal capitolo 3: come evolve il genoma in Consilium»).

#### 3.5.1 I geni

Il genoma di una macchina a stati ha due tipi di «geni».

- **Numeri continui:** i coefficienti dei filtri, i margini e (nella macchina reale) percentuale investita, stop loss, take profit. Sono 11. Nella versione ridotta sono i due coefficienti (0,5 e 0,2) e il margine (0).
- **Struttura discreta:** per ogni stato, le liste di condizioni delle transizioni (nella macchina reale: 36 liste, lunghe fino a 8 identificatori) e le azioni degli stati. Nella versione ridotta è la tabella delle transizioni.

Che cosa fa il GA di Consilium, in parole (i valori esatti sono in appendice):

- **Il crossover** mescola due genitori scegliendo, per ciascuno degli 11 numeri e **per ciascuna delle 36 liste**, il valore dell'uno o dell'altro genitore con probabilità metà. Non si scambiano stati interi: ogni lista è una scelta indipendente. Un figlio può quindi avere, nello stesso stato, una lista a nord del genitore 1 e una a sud del genitore 2.
- **La mutazione** agisce con una probabilità bassa (circa il 6,7 per cento per ogni gene). Sposta un coefficiente di filtro di un valore a caso tra -0,125 e +0,125, tenendolo poi tra 0,01 e 1,0. Sposta i margini di qualche punto percentuale. Su una lista, può sostituire un identificatore con un altro scelto a caso tra 0 e 12, può togliere il primo, oppure aggiungerne uno in fondo. Le azioni degli stati non vengono mai mutate.

Una conseguenza che il codice rende verificabile: stop loss e take profit del genoma fisso (50 e 5,8 per cento) coincidono con i valori massimi che il GA consente a quei due numeri. È un fatto osservato nel codice; che cosa lo abbia causato non è accertato. Altre due conseguenze, sui coefficienti 0,73 e 0,99 e sulla condizione 13, sono nell'appendice, sezione «Dal capitolo 3: come evolve il genoma in Consilium».

#### 3.5.2 Esempio di mutazione (versione ridotta)

Quattro mutazioni a partire dalla macchina di base, provate col valutatore. Il coefficiente di M1 si sposta di +0,10, dentro il limite di ±0,125 del GA vero.

| Mutazione | Che cosa cambia | Operazioni | Valore finale | Rendimento |
|---|---|---|---|---|
| (base) | c lento 0,2; margine 0 | buy g.4 a 10,55; sell g.13 a 10,30; buy g.19 a 11,25 | 989,32 | -1,07 per cento |
| M1 | coefficiente lento da 0,2 a 0,3 | buy g.4 a 10,55; sell g.12 a 10,50; buy g.19 a 11,25 | 1008,53 | +0,85 per cento |
| M2 | nella lista In osservazione verso Dentro, un identificatore sostituito: da SOPRA a SEMPRE (sempre vera) | identiche alla base | 989,32 | -1,07 per cento |
| M3 | margine da 0 a 0,005 (0,5%) | buy g.5 a 10,80; sell g.13 a 10,30; buy g.20 a 11,40 | 953,70 | -4,63 per cento |
| M4 | in fondo alla lista Dentro verso Fuori si aggiunge un identificatore sempre falso | buy g.4 a 10,55, poi nessuna vendita | 1080,57 | +8,06 per cento |

Che cosa è successo, uno per uno.

- **M1.** Un filtro lento meno lento segue di più il prezzo, quindi il veloce passa sotto il lento un giorno prima (decisione del giorno 11 invece del 12) e la vendita arriva a 10,50 invece di 10,30.
- **M2.** Cambia un identificatore, ma sul dataset le decisioni restano le stesse. Da In osservazione si controlla prima SOTTO (torna a Fuori) e poi la lista cambiata: SEMPRE scatta quando SOTTO è falsa, e nei due giorni in cui la macchina è In osservazione SOTTO era falsa e SOPRA vera, quindi la strada era la stessa. Le due macchine si comporterebbero in modo diverso solo in un giorno in cui i due filtri fossero esattamente uguali (né SOPRA né SOTTO vere). È una mutazione **neutra** su questi dati: il genoma è diverso, il comportamento no. Molte modifiche della struttura non cambiano nulla, quindi la ricerca si muove anche su zone piane in cui la fitness non varia.
- **M3.** Con un margine positivo i due confronti SOPRA e SOTTO usano la soglia «filtro lento più 0,005 (0,5%) del filtro»: il segnale SOPRA arriva un giorno dopo, si entra e si rientra più tardi.
- **M4.** In una lista, i confronti sono in AND: aggiungere una condizione che non è mai vera rende la lista inutilizzabile. Da Dentro non si esce più, e la macchina tiene la posizione fino alla fine. È l'effetto di una singola aggiunta in una lista; nel genoma reale 7 liste su 36 sono fatte così.

I numeri non dicono nulla su quale dei cambiamenti sia «giusto»: mostrano che un cambiamento piccolo può non avere effetto (M2) o averlo grande (M4).

#### 3.5.3 Esempio di crossover (versione ridotta)

Per mescolare lista per lista serve che i due genitori abbiano le stesse liste. Nella versione ridotta ogni stato ha una lista verso ciascuno degli altri due, quindi sei liste in tutto. Una lista che non fa mai scattare la transizione è scritta «mai» (equivale alla condizione 0 del genoma reale, sempre falsa). Dentro ogni stato le liste si controllano nell'ordine della tabella.

| Lista (da stato verso stato) | Genitore 1 | Genitore 2 |
|---|---|---|
| Fuori verso In osservazione | SOPRA | mai |
| Fuori verso Dentro | mai | SOPRA |
| In osservazione verso Fuori | SOTTO | mai |
| In osservazione verso Dentro | SOPRA | SOPRA |
| Dentro verso Fuori | SOTTO | mai |
| Dentro verso In osservazione | mai | SOTTO |

I coefficienti sono (veloce 0,5; lento 0,2) per il genitore 1 e (0,7; 0,3) per il genitore 2. Il genitore 1 è la macchina di base: -1,07 per cento. Il genitore 2 compra al giorno 3 a 10,30 e non vende mai (esce da Dentro verso In osservazione con SOTTO, ma da In osservazione non c'è uscita verso Fuori): 1106,80, +10,68 per cento.

Due **figli** costruiti a mano scegliendo, per ciascun numero e ciascuna lista, un genitore (nel GA vero la scelta è a sorte, qui è dichiarata per mostrare il meccanismo):

- **Figlio 1.** Coefficiente veloce dal genitore 1 (0,5), coefficiente lento dal genitore 2 (0,3). Le liste «Fuori verso In osservazione», «In osservazione verso Fuori» e «Dentro verso Fuori» dal genitore 1; le altre tre dal genitore 2. Operazioni: buy g.4 a 10,55; sell g.12 a 10,50; buy g.19 a 11,25; valore finale 1008,53, **+0,85 per cento**. La lista «Fuori verso Dentro» ereditata dal genitore 2 non scatta mai: da Fuori si controlla prima la lista verso In osservazione, che ha la stessa condizione SOPRA.
- **Figlio 2.** Coefficienti (0,5; 0,2) dal genitore 1. Le liste «Fuori verso In osservazione» (SOPRA) e «Fuori verso Dentro» (mai) dal genitore 1; le altre quattro dal genitore 2. Operazioni: buy g.4 a 10,55, poi nessuna vendita; valore finale 1080,57, **+8,06 per cento**. Da Dentro si esce verso In osservazione con SOTTO, ma da In osservazione non si torna a Fuori: la struttura a valle è quella del genitore 2, i numeri e l'ingresso sono del genitore 1.

Che cosa mostra. Primo: il crossover lista per lista produce figli ben formati, con decisioni diverse da entrambi i genitori. Secondo: il significato di una lista dipende dalle altre: nel figlio 1 una lista presa dal genitore 2 non fa nulla, per colpa dell'ordine di controllo; nel figlio 2 una lista presa da un genitore ha senso solo accanto alle altre. Terzo, la ridondanza: nell'esempio i figli possibili sono 256 (due scelte per ciascuno dei 2 coefficienti e delle 6 liste), e sul dataset danno solo 15 sequenze di decisioni diverse. Con 11 numeri e 36 liste le scelte indipendenti sono 47 e l'effetto di dipendenza reciproca è più forte. Gli esempi sono tentativi scelti dall'autore per mostrare il meccanismo: non esprimono la probabilità che un figlio sia migliore.

### 3.6 Cosa ricorda del passato

La memoria sta in due punti.

1. **Nei filtri.** Ogni filtro è una media che dipende da tutto il passato attraverso il valore di ieri. Nell'esempio ridotto, i due filtri a ogni giorno «ricordano» i prezzi precedenti con pesi che decrescono: il filtro lento con c = 0,2 ricorda più a lungo del veloce con c = 0,5. Se il prezzo salta di colpo da 100 a 110, dopo 6 giorni il filtro con c = 0,5 vale 109,84; quello con c = 0,2 vale 107,38.
2. **Nello stato discreto.** La macchina ricorda in quale stato si trova, che può sintetizzare una storia di giorni («ieri il veloce ha superato il lento», «sono già dentro»). Questo ricordo è **scritto nel genoma**: sono le transizioni che lo costruiscono. Nel genoma reale ci sono nove stati; il numero di storie distinguibili è al più nove, tante quanti sono gli stati.

**Il filtro prezzo 2 (`iir_price_2`) con c = 0,99.** Un coefficiente così vicino a 1 dà un filtro quasi privo di memoria. La formula è `nuova = vecchia · 0,01 + dato · 0,99`: il passato pesa l'uno per cento. Esempio: salto da 100 a 110; il filtro vale 109,90 dopo un giorno e 110,00 dopo due, praticamente subito. Il filtro è quindi quasi uguale al prezzo di oggi. Conseguenze sul genoma fisso, misurate sui 2516 giorni ENI: la condizione 4 (prezzo sopra il filtro 2 più il margine) è vera tutti i giorni e la 5 mai. Il motivo è che il margine è negativo (-1,10 per cento, vedi l'esempio in 3.3.4) e che il filtro segue il prezzo da vicino (scarto massimo 0,26 per cento). Le due condizioni sono, in pratica, «sempre vera» e «sempre falsa». Le condizioni 6 e 7 confrontano il filtro prezzo 1 (c = 0,73) con il filtro quasi-prezzo: sono meno degeneri, ma anche loro quasi costanti, perché la 6 è vera in 2497 giorni su 2516 e la 7 in 19.

Questa lettura vale per i numeri del genoma fisso, non per la forma: un altro genoma potrebbe avere un c diverso.

**Che cosa «ricorda» lo stato SW.** Su tutto il replay ENI (2516 giorni) nel genoma fisso a SW si arriva in due modi: da NW (81 volte), con un volume del giorno sopra le due soglie del volume, come nel tratto di 3.3.8; e da W (97 volte), con il prezzo sotto il filtro prezzo 1 e il volume non sotto la soglia del filtro volume 2 (in questo genoma la condizione 4 è sempre vera). Da W si arriva in SW perché la lista a nord di W non scatta (il volume non è sotto la soglia V2) e la lista a sud, che chiede solo il prezzo sotto la soglia 1 (condizione 3), è vera. Sono due storie diverse che finiscono nello stesso stato, e lo stato non dice quale delle due sia accaduta: ricorda soltanto «sono in SW».

**Perché è il limite che si vorrebbe superare.** La memoria del genoma attuale ha due difetti da dichiarare con cautela, perché sono considerazioni dell'autore **[ipotesi]**. Primo, la memoria di stato è costruita dall'evoluzione stessa: per avere «ieri il filtro ha incrociato» bisogna che il GA trovi la giusta combinazione di stati e transizioni, mentre con un indicatore finanziario noto (una media, un incrocio di medie) la memoria è già data e non va scoperta. Secondo, lo stato è un'etichetta di nove valori: sapere in che stato si è dice poco su che cosa sia successo prima, e quindi spiegare perché la macchina si trova in C o in SE richiede di ripercorrere la storia delle transizioni.

### 3.7 Che cosa non ha funzionato secondo gli esperimenti di Consilium

Il rapporto interno di Consilium sugli esperimenti di addestramento e verifica fuori campione [18] riporta risultati qualitativi, già raccontati nella sezione 2.6.6: qui si riprendono in breve, senza cifre, per ciò che dicono sulla macchina a stati. Sono esiti dell'**insieme** formato dalla macchina a stati, dalla fitness basata sul rendimento annuo composto (CAGR), dai parametri di rischio e dalla scelta dei dati. I dati sono titoli e panieri italiani, per lo più diversi dalla serie ENI di questo progetto (ENI è uno dei 14 titoli di un paniere usato in uno degli esperimenti).

- Con un addestramento corto su un solo titolo, i genomi migliori in addestramento hanno reso male sulla finestra tenuta fuori, in modo sistematico: sovradattamento severo (il genoma si è adattato ai dati visti, rumore compreso).
- Con un addestramento più lungo l'inversione sparisce, ma i genomi restano sotto il semplice buy&hold quando il titolo sale con decisione.
- Con più titoli insieme la generalizzazione migliora, ma i genomi non battono il buy&hold né in un anno favorevole (uscivano troppo presto) né in uno sfavorevole (perdevano più del titolo tenuto fermo).
- Tra panieri diversi, i genomi evoluti su uno funzionano peggio sugli altri: sono specializzati sul comportamento di quei titoli.
- Causa comune indicata: parametri di rischio degeneri (stop loss troppo largo per scattare, take profit stretto che taglia i guadagni nei trend) e una fitness che non premia la gestione del rischio. Il genoma fisso di questo progetto ha stop loss 50 per cento e take profit 5,8 per cento, che sono anche i valori massimi consentiti a quei due numeri dal GA (sezione 3.5.1).

Che cosa **non** si può concludere. Il rapporto non confronta forme: non dice che la macchina a stati sia peggiore di un'altra forma e non può separare il peso della forma da quello della fitness (questa osservazione è della rassegna). Quei difetti nascono almeno in parte da parametri di rischio e fitness che sono comuni a tutte le forme (sezione «Metodo e fonti» della rassegna); una forma diversa con la stessa fitness e gli stessi parametri potrebbe ripeterli.

### 3.8 Punti di forza e debolezze, in parole semplici

**Quanto sa esprimere?** Ogni transizione è un AND di confronti tra prezzo, filtri e margini, e l'azione dipende dallo stato. Può quindi rappresentare regole con più condizioni insieme («prezzo sopra la media e volume alto») e con una sequenza («prima X, poi Y»), cosa che una semplice somma pesata non fa. Non può usare indicatori diversi dai quattro filtri e dai confronti fissi: l'insieme delle condizioni è chiuso a 14 (il GA ne sa produrre 13). Non decide l'uscita: quella è dello stop loss e del take profit. Nella scala a tre livelli della rassegna (affine: una somma pesata; a tratti: regioni delimitate da confronti; universale: qualsiasi funzione) è «a tratti».

**Quanto è grande lo spazio di ricerca?** Grande: 11 numeri continui più una struttura discreta (nel genoma fisso 36 liste con 135 identificatori). Una parte consistente dello spazio è sprecata o ridondante: almeno 16 liste su 36 non possono scattare mai (7 contengono lo 0, le altre contengono due condizioni opposte), due sono sempre vere, e molte combinazioni portano a stati mai raggiunti. Un genoma con tanti gradi di libertà ha più facilità ad adattarsi al rumore dei dati di addestramento **[ipotesi]**.

**Si capisce perché decide così?** A metà. Una singola regola si legge («da N a NE se il volume supera il filtro»), ma sapere in quale stato si è alla barra t richiede di ripercorrere tutte le transizioni dall'inizio. I nomi NW, N, NE sono posizioni su una griglia, non significati: nulla nel nome dice che cosa lo stato rappresenti. Nel nostro esempio ridotto abbiamo dato i nomi «Fuori» e «Dentro» per leggibilità; nel genoma reale nessuno ha attribuito un significato agli stati: se ne ha uno, lo ha trovato l'evoluzione e va ricostruito leggendo le transizioni.

**Quanto costa calcolarlo?** Poco: quattro aggiornamenti dei filtri e al più quattro liste di condizioni al giorno, qualche decina di operazioni **[ipotesi: conteggio a mano dell'autore, non misurato]**.

**Si mescola e si muta bene?** Sì, per costruzione: lo scambio lista per lista produce figli ben formati e la mutazione tocca numeri o liste. Il rischio è la dipendenza reciproca tra liste (figli sensati sul piano formale ma senza senso sul piano del comportamento, come nell'esempio di 3.5.3) e le mutazioni neutre dell'esempio M2, che allargano la ricerca senza effetto.

**Si adatta al nostro motore?** È già integrata: vedi la sezione seguente.

### 3.9 Come si integra nel nostro motore

Qui la forma è già integrata. Il motore del PoC fa girare il genoma fisso di ENI con una classe che avvolge l'individuo di Consilium e rispetta il contratto di strategia del motore: dichiara il tipo della forma (`fsm`), l'elenco dei nove stati (il motore mostra in che stato si trova la strategia ogni giorno), un riassunto di stato e quattro filtri, e il genoma in formato leggibile e salvabile (JSON, cioè i numeri e le liste di condizioni). Il genoma fisso è costruito una volta e il motore ne fa un individuo per ogni replay. Nessuna parte si adatta male: è il riferimento rispetto al quale le altre forme dovranno adattare le proprie etichette e i propri indicatori. I nomi delle classi e dei file sono nell'appendice «Approfondimenti», sezione «Riferimenti al codice: capitolo 3».

### 3.10 Cosa dice la letteratura

- Le macchine a stati finiti evolute con metodi evolutivi sono un filone antico: il lavoro di riferimento è quello di Fogel e collaboratori sulla programmazione evolutiva (anni Sessanta) **[ipotesi, fonte da verificare, non letta]**.
- Per il trading, l'evoluzione di regole su medie mobili e massimi e minimi è in [6] (letto solo un riassunto: nelle condizioni di quello studio, dopo i costi di transazione non si guadagna con le regole trovate), e una rassegna sistematica dell'uso di calcolo evolutivo per regole di trading azionario è in [7] (letto l'abstract).
- Una macchina a stati ha come cugina probabilistica il modello a stati nascosti, descritto in [2] (vedi il capitolo 9).
- Sul sovradattamento di strategie provate su dati storici, e sul perché la sola verifica fuori campione non basta quando si provano molte configurazioni: [4].
- Sugli esperimenti del progetto Consilium, descritti sopra: [18].

### 3.11 In breve

- La macchina reale decide solo quando entrare (lo stato SW porta il `buy`); l'uscita è di stop loss e take profit, che sono del Trader.
- Il genoma attuale è una rete di nove stati disposti su una griglia 3x3 avvolta (nomi di bussola); ogni stato ha fino a quattro uscite, ciascuna una lista di condizioni da 0 a 13 che devono essere tutte vere; nel genoma fisso: 36 transizioni e 135 identificatori.
- Le condizioni confrontano il prezzo e il volume del giorno con quattro filtri (medie esponenziali) spostati di quattro margini; stop loss, take profit e percentuale investita sono del Trader.
- Lo stato ricorda: lo stesso dato dà effetti diversi a seconda di dove si è. Ma la memoria va scoperta dall'evoluzione e il nome di uno stato non dice che cosa ricorda.
- Nel genoma fisso il filtro prezzo 2 con c = 0,99 non ha quasi memoria e fa risultare la condizione 4 sempre vera e la 5 mai.
- L'evoluzione vera (GA di Consilium) mescola lista per lista e muta i coefficienti in [0,01; 1,0]; la condizione 13 non viene mai prodotta.
- Gli esperimenti di Consilium riportano sovradattamento e risultati sotto il buy&hold, che sono esiti di forma, fitness e parametri insieme, non della sola forma.
- Spazio grande, lettura a metà, integrazione già fatta.

## 4. Il punteggio lineare con soglie

Questo capitolo descrive la forma che la rassegna chiama «candidato A». Comprende anche due varianti: la **forma minima** (un solo indicatore e una sola soglia) e l'**osservatore di Kalman** (gli indicatori sono stimati da un piccolo modello). Tutti i numeri degli esempi sono calcolati con un programma sul dataset giocattolo di 20 giorni comune a tutta la guida. Numeri di esempio inventati: mostrano il meccanismo, non dicono nulla sulla qualità della forma. Nessun esempio vuole battere il buy&hold (comprare il giorno 1 e tenere: +12,87 per cento sul dataset).

### 4.1 In una frase e un'analogia

Ogni giorno si calcolano alcuni numeri che descrivono l'andamento recente del prezzo e del volume, si fa una somma pesata di quei numeri e si confronta il risultato con due soglie: sopra la soglia alta si compra, sotto la soglia bassa si vende, in mezzo si aspetta.

**Analogia.** È un esame con più prove. Lo studente prende un voto in ciascuna prova (gli ingressi), ogni prova conta più o meno nel voto finale (i pesi), e il voto finale (il punteggio) decide l'esito: sopra 24 su 30 si è ammessi, sotto 18 si è respinti, in mezzo si rimanda. Le soglie sono le linee del 24 e del 18. Chi scrive il regolamento decide le soglie e i pesi; nel nostro caso li sceglie l'algoritmo genetico.

Un'altra analogia, da programmatore: sono due confronti (sopra la soglia alta? sotto la soglia bassa?) applicati a un solo numero, che è una combinazione lineare delle variabili.

### 4.2 Come funziona

#### 4.2.1 Gli ingredienti

Prima di tutto alcune parole di finanza che servono qui.

- Una **barra** è un giorno di borsa riassunto in pochi numeri. Per ora ci bastano il prezzo di chiusura e il **volume** (il numero di azioni scambiate quel giorno).
- Una **media mobile** è una media dei prezzi recenti. Quella che usa il progetto è la **media mobile esponenziale** (EMA, vedi 1.3), che dà più peso ai giorni più vicini: il coefficiente `c` è il peso del dato nuovo. In questo capitolo `c` = 0,5 per la media veloce e `c` = 0,2 per la lenta (e `c` = 0,2 per quella del volume).
- Un **indicatore** è un numero calcolato dai prezzi e dai volumi passati per riassumerne l'andamento. Una media mobile è un indicatore; anche la distanza tra il prezzo e la media lo è. La scelta degli indicatori è materia di un'altra ricerca dell'epica, quella sugli indicatori da usare (R2); qui ne usiamo tre come esempio.
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
2. **Confine retto.** Con due ingressi, i punti in cui il punteggio vale esattamente la soglia formano una linea retta (con tre ingressi un piano): da una parte si compra, dall'altra si aspetta. In pratica significa che la regola è sempre del tipo «un certo mix degli indicatori supera un livello».

Lo spazio delle decisioni possibili è quindi limitato: lo vedremo in dettaglio nella sezione 4.8.

#### 4.2.4 Pesi, soglie e bias hanno ruoli in parte ridondanti

Moltiplicare tutti i pesi, il bias e le due soglie per lo stesso numero positivo non cambia nessuna decisione (verificato sul dataset: raddoppiando tutto si ottengono le stesse decisioni). Spostare il bias di una quantità e le due soglie della stessa quantità non cambia nessuna decisione (verificato: bias 1 con soglie 4 e -2 dà le stesse decisioni di bias 0 con soglie 3 e -3). Quindi, di quei numeri, qualcuno è superfluo. La rassegna conta ugualmente `b` per semplicità. La conseguenza pratica: lo spazio in cui l'algoritmo genetico cerca è un po' più piccolo di quanto il conteggio dei numeri faccia pensare.

### 4.3 Esempio applicato al dataset giocattolo

#### 4.3.1 Semplificazioni di questo esempio

- Dataset giocattolo di 20 giorni. Capitale iniziale 1000.
- Decisione presa alla chiusura del giorno `t`, eseguita al prezzo del giorno `t+1`.
- Acquisto con tutto il denaro, vendita di tutta la posizione; azioni frazionarie; nessun costo di transazione; nessuno stop loss né take profit; la decisione dell'ultimo giorno è ignorata.
- Un `buy` mentre si è già in posizione, o un `sell` senza posizione, non fa nulla.
- Numeri arrotondati a due decimali nelle tabelle (con virgola), calcolati con tutte le cifre.
- Le medie mobili partono dal primo dato, quindi il primo giorno tutti gli ingressi valgono 0.

#### 4.3.2 I tre ingressi

| Ingresso | Definizione | In parole |
|---|---|---|
| `x1` | (prezzo / EMA lenta - 1) * 100, con EMA lenta di `c` = 0,2 | di quanti punti percentuali il prezzo sta sopra (positivo) o sotto (negativo) la sua media lenta |
| `x2` | (EMA veloce / EMA lenta - 1) * 100, con EMA veloce di `c` = 0,5 | quanto la media veloce sta sopra la media lenta, in percentuale: indica se il prezzo sta salendo o scendendo |
| `x3` | volume / EMA del volume (`c` = 0,2) - 1 | di quanto il volume del giorno supera (positivo) o è sotto (negativo) il suo livello abituale, in frazione: 0,30 significa 30 per cento sopra |

Esempio di `x1` al giorno 4: il prezzo è 10,55, l'EMA lenta 10,17; `x1 = (10,55 / 10,17 - 1) * 100 = 3,73`. Il prezzo è 3,73 per cento sopra la sua media lenta.

#### 4.3.3 La scelta dei pesi e delle soglie

Dichiarata e semplice, non ottimizzata: **w1 = 1, w2 = 1, w3 = 10, b = 0, soglia alta = +3, soglia bassa = -3.** I valori sono scelti a mano per l'esempio; in un genoma vero li cercherebbe l'algoritmo genetico. Il peso 10 sul volume compensa il fatto che `x3` ha valori piccoli (da -0,23 a 0,36), mentre `x1` e `x2` vanno da -3,81 a 5,76 e da -2,29 a 4,01 (la sezione 4.8.3 spiega perché).

Il punteggio è quindi `s = x1 + x2 + 10 * x3`.

#### 4.3.4 Tabella giorno per giorno

Le colonne «base» usano i pesi sopra. Le colonne «senza volume» sono un secondo genoma, uguale al primo salvo `w3 = 0`: il volume non conta. I due si chiamano qui «esempio base» e «esempio senza volume». Gli ingressi `x1`, `x2`, `x3` sono gli stessi per i due. Le sigle sono `buy`, `sell`, `hold`.

| Giorno | Prezzo | x1 | x2 | x3 | s (base) | Dec. base | s (senza vol.) | Dec. senza vol. |
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
| Base (`w3` = 10) | acquisto g.4 a 10,55; vendita g.14 a 10,20; acquisto g.19 a 11,25 | 979,72 | -2,03 % |
| Senza volume (`w3` = 0) | acquisto g.4 a 10,55; vendita g.13 a 10,30; acquisto g.19 a 11,25 | 989,32 | -1,07 % |
| Buy&hold (riferimento) | acquisto g.1 | 1128,71 | +12,87 % |

Che cosa succede, in parole.

- Il prezzo sale dal giorno 2: `x1` e `x2` crescono, il punteggio supera +3 al giorno 3 e si compra (eseguito al giorno 4 a 10,55).
- Dal giorno 9 il prezzo scende. Nell'esempio base, al giorno 11 il prezzo è già sotto la media lenta (`x1` negativo) ma il volume è alto (30 per cento sopra il normale), e con peso 10 questo aggiunge quasi 3 punti: `s = 3,14`, ancora sopra la soglia. Si continua a tenere. Il segnale di vendita arriva al giorno 13, un giorno dopo l'esempio senza volume, che ignora il volume e vende dopo la decisione del giorno 12.
- In questo dataset il volume alto coincide con i giorni di svolta (è così che l'abbiamo inventato), perciò con peso positivo ritarda l'uscita. Che sia un bene o un male dipende dal peso e dalla serie: qui non dimostra nulla.
- Entrambe le versioni perdono contro il buy&hold, perché escono dopo il picco e rientrano più in alto del punto di uscita. Non è un difetto da correggere nell'esempio: il meccanismo è quello.
- Tra l'esempio base e quello senza volume le decisioni differiscono in soli due giorni (11 e 12). Un peso diverso cambia il comportamento, ma in modo graduale: i punteggi cambiano di poco e solo i giorni vicini alle soglie cambiano decisione.

### 4.4 La forma minima: un filtro e una soglia

#### 4.4.1 Che cos'è

È il caso più semplice della stessa forma: un solo indicatore (un solo filtro) e una sola soglia. Nel genoma ci sono **due numeri**: il coefficiente `c` del filtro e la soglia `m`. L'indicatore è la distanza relativa del prezzo dalla propria media, `d = prezzo / media - 1`: è l'ingresso `x1` della tabella 4.3.4 diviso 100. La soglia `m` è una frazione, per esempio `m = 0,02 (2%)`, e la regola è simmetrica:

```
buy   se  d > +m
sell  se  d < -m
hold  altrimenti
```

In parole: si compra quando il prezzo sta più di `m` sopra la sua media, si vende quando sta più di `m` sotto, altrimenti si aspetta. È un punteggio lineare con un solo peso fisso a 1, `b = 0`, e la soglia bassa uguale all'opposto della soglia alta [ipotesi di metodo, come nella rassegna].

#### 4.4.2 Esempio sul dataset giocattolo

Con `c` = 0,2 e `m = 0,02 (2%)` (cioè `x1` oltre ±2 nella tabella della sezione 4.3.4):

| Giorni | Decisione |
|---|---|
| 1-2 | hold (`x1` = 0,00 e 0,80) |
| 3-9 | buy (`x1` da 2,22 a 5,76 e poi 4,11) |
| 10-11 | hold (`x1` = 1,81 e -0,76) |
| 12-14 | sell (`x1` = -2,83, -3,78, -3,81) |
| 15-17 | hold |
| 18-20 | buy |

Risultato: acquisto g.4 a 10,55; vendita g.13 a 10,30; acquisto g.19 a 11,25; valore finale 989,32; **-1,07 %**. Con `m = 0,01 (1%)` (stesso `c`) il risultato è +0,72 % (acquisto g.4, vendita g.13, riacquisto g.18); con `c` = 0,5 e `m = 0,02 (2%)` è -6,36 %. Questi tre numeri non classificano le scelte: mostrano che anche due soli parametri cambiano le operazioni.

#### 4.4.3 Perché serve come metro

Una forma più ricca (più ingressi, alberi, reti) ha più parametri e quindi può adattarsi meglio ai dati di addestramento. Una parte di quell'adattamento può essere **rumore**, cioè le irregolarità casuali dei dati: l'**overfitting** (sovradattamento) è proprio l'adattarsi ai dati su cui si evolve, rumore compreso, con peggioramento sui dati nuovi. Più numeri ha un genoma, più modi ha di adattarsi al caso; la forma minima ne ha due e ha poco spazio per farlo. Il lavoro di Bailey e coautori [4] sostiene che con molte prove sullo stesso insieme di dati i risultati migliori possono essere dovuti al caso.

La forma minima è quindi un termine di paragone, come un buy&hold che però si può evolvere: se una forma ricca non fa meglio di questa su dati non usati per l'evoluzione, la complessità in più non ha giustificazione. Questo uso come metro è un'**[ipotesi di metodo]** della rassegna, non un risultato di letteratura.

### 4.5 L'osservatore di Kalman: livello e pendenza

#### 4.5.1 L'idea

Finora gli ingressi sono medie calcolate con formule fisse, e dicono dove sta il prezzo rispetto al suo passato. Questa variante prova a rispondere a un'altra domanda: **in che direzione sta andando il prezzo, e con quale velocità?**

Un'immagine. Una pallina rotola su una strada piena di buche. Ogni giorno vedi dove si trova, ma la vedi «sballottata» dalle buche, cioè con un piccolo disturbo casuale. Allora ti fai due idee, e le aggiorni ogni giorno:

- il **livello**: dove si trova davvero la pallina, senza il disturbo del giorno;
- la **pendenza**: di quanto sale o scende ogni giorno.

Il metodo è sempre lo stesso. Prima prevedi dove sarà oggi la pallina (livello di ieri più pendenza di ieri). Poi guardi dove si trova e calcoli l'errore. Infine correggi le due idee di una frazione dell'errore: più o meno sul livello, più o meno sulla pendenza. La pendenza stimata è l'ingresso della strategia: positiva vuol dire che il prezzo sale, negativa che scende. Metodi di questo tipo, che stimano grandezze che non si vedono direttamente, si chiamano **osservatori**; il più famoso è il filtro di Kalman [3].

**Che cosa dice la fonte e che cosa no.** L'articolo di Kalman [3] tratta la stima ricorsiva (che riparte ogni giorno dalla stima di ieri) in generale. Non parla né di prezzi di titoli né di medie esponenziali. Il modello «livello più pendenza» applicato ai prezzi e la sua parentela con le medie mobili sono scelte e ragionamenti di questa guida **[ipotesi, fonte da verificare]**. Il metodo lineare di Holt [15] fa lo stesso lavoro con due costanti. Le verifiche algebriche stanno nell'appendice «Approfondimenti», sezione «Dal capitolo 4: il filtro alfa-beta, Holt e Kalman».

#### 4.5.2 Il filtro alfa-beta usato nell'esempio

Nell'esempio le due correzioni sono due numeri fissi, `alfa` per il livello e `beta` per la pendenza (non vengono calcolati dal filtro di Kalman completo). Con `l` il livello stimato ieri, `v` la pendenza stimata ieri e `p` il prezzo di oggi, ogni giorno:

```
previsto  = l + v                  (dove ci aspettiamo il prezzo oggi)
residuo   = p - previsto           (di quanto ci siamo sbagliati)
l_nuovo   = previsto + alfa * residuo
v_nuovo   = v + beta * residuo
```

**Esempio numerico del giorno 3** (valori dalla tabella sotto): il livello di ieri è 10,05, la pendenza 0,02; previsto = 10,05 + 0,02 = 10,07; il prezzo è 10,30 e il residuo vale 0,23. Con `alfa` = 0,5 il livello nuovo è 10,07 + 0,5 · 0,23 = 10,19; con `beta` = 0,2 la pendenza nuova è 0,02 + 0,2 · 0,23 = 0,07 (arrotondata). Se il prezzo sale più del previsto, il residuo è positivo e la pendenza stimata aumenta.

La decisione si legge dalla **pendenza in percentuale del livello**, `pend% = v / l · 100`: `buy` se `pend%` è sopra +0,5, `sell` se è sotto -0,5, altrimenti `hold`. Anche qui è una scelta dichiarata, non ottimizzata. (Se la pendenza fosse sempre zero, la correzione del livello diventerebbe `l + alfa * (p - l)`, cioè proprio una media mobile esponenziale con `c = alfa`: la parentela è spiegata in appendice.)

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

Commento. Il prezzo tocca il massimo al giorno 8 e poi scende; la pendenza stimata raggiunge il massimo al giorno 7 (0,23) e cala piano, perché il filtro la corregge solo di una frazione `beta` dell'errore ogni giorno. Al giorno 10 la pendenza vale ancora 0,52 per cento, appena sopra la soglia, e diventa negativa al giorno 11 (-0,57 per cento, vendita). Il filtro non vede il picco prima che accada: lo riconosce con ritardo, come ogni indicatore costruito sul passato. Il risultato di questo esempio dipende dal dataset inventato e dalla scelta di `alfa`, `beta` e soglia: con `beta` = 0,1 (stessa soglia) lo stesso filtro dà -5,56 %. Non dice quale valore sia «giusto»: dice che le due correzioni sono parametri che contano.

**Come entra nel punteggio lineare.** Si può usare la pendenza percentuale come unico ingresso (come sopra) oppure come uno degli ingressi `x1...xn` di un punteggio più ricco. In entrambi i casi la forma resta «somma pesata più soglie»; cambia da dove vengono gli ingressi.

#### 4.5.4 Limiti da tenere presenti

- Il filtro di Kalman è ottimale (in un senso preciso) quando il disturbo è «regolare» (gaussiano). Le serie giornaliere dei prezzi reali hanno spesso eventi estremi più frequenti di quanto preveda quel modello **[ipotesi]**. L'esempio usa correzioni fisse decise dal genoma e non fa nessuna ipotesi sul disturbo.
- Se `alfa` e `beta` sono geni, non c'è stima su tutta la serie, quindi nessuna anticipazione dei dati (look-ahead: usare informazione non ancora disponibile).
- Nessuna fonte letta tratta l'uso del filtro di Kalman con un algoritmo genetico nel trading (rassegna, sezione «Ciò che non si è potuto accertare»).

### 4.6 Come evolve

#### 4.6.1 I geni

L'algoritmo genetico fa evolvere numeri. Nella nostra istanza generale con tre ingressi i geni sono:

| Gene | Che cosa è | Intervallo di esempio |
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
- Esempio della rassegna: 6 ingressi già calcolati, cioè il prezzo del giorno, il volume del giorno e i quattro filtri che il genoma attuale ha già (nessun coefficiente di filtro tra i geni), quindi 6 pesi + `b` + 2 soglie = **9 numeri**. Se anche i 4 coefficienti dei filtri del genoma attuale fossero geni, sarebbero 13.
- Forma minima: **2 numeri** (`c` e `m`).
- Variante Kalman sulla sola pendenza: **3 numeri** (`alfa`, `beta`, soglia).
- Per confronto, la rassegna conta per una rete piccola di esempio 43 pesi, e per l'FSM attuale 11 numeri più una struttura discreta variabile di decine di transizioni.

Come visto nella sezione 4.2.4, qualche numero è ridondante (il bias rispetto alle soglie, la scala complessiva), quindi lo spazio effettivo è un po' più piccolo del conteggio.

**Che cosa significa per la ricerca.** Con una decina di numeri reali lo spazio da esplorare è piccolo: l'algoritmo genetico lo esplora con una popolazione modesta, e ci sono meno gradi di libertà con cui adattarsi al rumore dei dati di addestramento, anche se non vengono eliminati [4] **[ipotesi]**. Il rovescio è la minore espressività (sezione 4.8).

#### 4.6.3 Esempio numerico di mutazione

La **mutazione** modifica a caso uno o più geni di un individuo. Partiamo dall'individuo dell'esempio base (`w1 = 1, w2 = 1, w3 = 10, b = 0, soglie +3 e -3`). **Mutiamo `w1` da 1 a 0,5.**

Effetto sulle decisioni (giorni in cui cambiano):

| Giorno | Punteggio con `w1` = 1 | Decisione | Punteggio con `w1` = 0,5 | Decisione |
|---|---|---|---|---|
| 10 | 3,82 | buy | 2,91 | hold |
| 13 | -3,66 | sell | -1,77 | hold |

Il punteggio al giorno 10 scende di 0,5 * 1,81 = 0,91; al giorno 13 sale di 0,5 * 3,78 = 1,89. Il giorno 14 il punteggio è -5,12 e si vende.

Sequenza delle decisioni (`B` = buy, `S` = sell, `.` = hold, giorni 1-20):

```
base:     ..BBBBBBBBB.SSS..BBB
mutante:  ..BBBBBBB.B..SS..BBB
```

Risultato col valutatore: la vendita si sposta dal giorno 14 al giorno 15 (a 10,35); il valore finale è 994,12, **-0,59 %**, contro -2,03 % dell'esempio base. Una mutazione di un solo numero ha cambiato due decisioni su venti e una delle operazioni. (Il `B` al giorno 11 del mutante è ininfluente: si è già in posizione. L'esito riguarda solo questo dataset inventato e non dice che 0,5 sia preferibile a 1.)

#### 4.6.4 Esempio numerico di crossover

Il **crossover** produce un figlio mescolando i geni di due genitori. Il primo genitore è l'esempio base. Il secondo, il **genitore 2**, ha `w1 = 2, w2 = 0,5, w3 = 5, b = 0`, soglie +4 e -2. Risultato del genitore 2 da solo: acquisto g.4, vendita g.13, acquisto g.19, valore finale 989,32, **-1,07 %**.

- **Scambio di geni** (crossover uniforme): il figlio prende `w1` e `w3` dal primo genitore, `w2` e le due soglie dal genitore 2. Figlio: `w1 = 1, w2 = 0,5, w3 = 10`, soglie +4 e -2.
- **Media dei geni** (crossover aritmetico): il figlio ha ogni numero uguale alla media dei due. Figlio: `w1 = 1,5, w2 = 0,75, w3 = 7,5`, soglie +3,5 e -2,5.

Decisioni giorno per giorno (stessa legenda):

```
base:      ..BBBBBBBBB.SSS..BBB
gen. 2:    ..BBBBBBBB.SSSS..BBB
scambio:   ..BBBBBBB...SSS..BBB
media:     ..BBBBBBBB..SSS..BBB
```

Risultato dei due figli: acquisto g.4, vendita g.14, acquisto g.19; valore finale 979,72; **-2,03 %** entrambi, cioè le stesse operazioni dell'esempio base. Le decisioni del figlio per scambio differiscono da quelle di A in due giorni (10 e 11), quelle del figlio per media in un giorno (11): le differenze cadono mentre si è già in posizione, e la vendita resta al giorno 13 di decisione. Dettaglio onesto: in questo esempio il crossover non produce comportamenti nuovi. Un caso in cui il crossover produce comportamenti diversi dai genitori si vede nella macchina a stati (sezione 3.5.3). Quanto sia produttivo su serie vere non è accertato.

Il punto da ricordare è che i figli sono **sempre individui validi**: qualunque mescolanza di numeri è un punteggio lineare con soglie. Basta tenere le soglie nell'ordine giusto (con le medie e gli scambi dell'esempio questo accade da solo, perché ogni genitore ha soglia alta positiva e bassa negativa).

### 4.7 Cosa ricorda del passato

**Variante «solo indicatori».** Tutta la memoria sta negli indicatori a monte: le EMA di `x1`, `x2`, `x3` portano con sé la storia dei prezzi e dei volumi. La forma, di per sé, **non ha stato interno**: dati gli stessi tre ingressi, il punteggio è sempre lo stesso, qualunque sia la storia (è una funzione pura). Per questo non c'è nulla da azzerare nella strategia quando si ricomincia da capo, salvo i filtri. Nella tabella della sezione 4.3.4 si vede: al giorno 11 il punteggio dipende solo da `x1`, `x2`, `x3` di quel giorno, non dalle decisioni dei giorni prima. La stessa strategia, quando si è già in posizione, non lo «sa»: spetta al motore ignorare un `buy` ripetuto.

**Variante Kalman.** Livello e pendenza sono **uno stato** che si aggiorna a ogni giorno: ricorrenza interna, sì. La differenza con la macchina a stati del genoma attuale è che questo stato appartiene al **filtro** (un indicatore, un calcolo a monte della decisione), non alla **strategia** (la regola che trasforma numeri in buy, sell, hold). Cambia così il modo di salvarlo e azzerarlo: la strategia resta una funzione pura dei numeri che il filtro le consegna; il filtro ha un suo stato iniziale (livello = primo prezzo, pendenza = 0) da reimpostare quando si ricomincia da capo, come già avviene per le EMA. Una EMA ha anch'essa uno stato (l'ultimo valore), e nessuno la considera «memoria nella strategia».

Un'altra conseguenza: lo stato del filtro **non si evolve**, si calcola. L'algoritmo genetico evolve `alfa`, `beta`, soglia, non il livello e la pendenza di oggi.

### 4.8 Punti di forza e debolezze

#### 4.8.1 Che cosa sa esprimere

Poco, e in modo prevedibile: **una soglia su una combinazione lineare degli ingressi**. Va bene per regole del tipo «compra quando il prezzo è sopra la media di abbastanza, e lo è tanto di più quanto più sale il volume». Non va bene per regole che dipendono da **combinazioni** di condizioni (sezione 4.8.2).

#### 4.8.2 Il limite delle interazioni: «se X e Y allora...»

Un'**interazione** è un caso in cui l'effetto di un indicatore cambia in base al valore di un altro. Nel punteggio lineare questo non può succedere: ogni peso vale sempre uguale (sezione 4.2.3).

**Caso concreto dal dataset giocattolo.** Vogliamo la regola: «se il volume è alto (`x3` sopra 0,2), il movimento è **confermato**: si compra se il prezzo è sopra la sua media (`x1` positivo), si vende se è sotto. Se il volume è basso, si aspetta qualunque sia `x1`». Quattro giorni del dataset la illustrano (nella tabella sono ordinati per coppie con lo stesso `x1` e volume diverso, non in ordine cronologico):

| Giorno | `x1` | `x3` | Decisione voluta | Perché |
|---|---|---|---|---|
| 5 | 4,89 | 0,29 | buy | volume alto, prezzo sopra la media |
| 12 | -2,83 | 0,36 | sell | volume alto, prezzo sotto la media |
| 20 | 4,37 | -0,08 | hold | volume basso |
| 14 | -3,81 | -0,09 | hold | volume basso |

Un punteggio `s = w1*x1 + w3*x3 + b` con due soglie **non può** dare queste quattro decisioni. Il caso è un «o esclusivo» mascherato: l'effetto del volume dovrebbe cambiare verso a seconda del segno di `x1`. Si vede bene in una versione ridotta, con `x1` uguale a +1 o -1 e `x3` uguale a +1 (alto) o -1 (basso), e le stesse quattro decisioni (alto/+1 compra, alto/-1 vende, basso con ambedue i segni aspetta). Nell'ordine dei giorni 5, 12, 20, 14, i punteggi sono `w1 + w3 + b`, `-w1 + w3 + b`, `w1 - w3 + b`, `-w1 - w3 + b`. Il giorno 5 deve stare sopra il giorno 20, che differisce solo per il volume: serve `w3` positivo. Il giorno 12 deve stare sotto il giorno 14, che differisce solo per il volume: serve `w3` negativo. Le due richieste si contraddicono, qualunque siano le soglie.

Sui quattro giorni veri del dataset i valori non sono perfettamente simmetrici, quindi il ragionamento sopra è un'illustrazione. La verifica è numerica: ho provato 3600 direzioni possibili del vettore `(w1, w3)` e nessuna produce un punteggio con il giorno 5 sopra gli altri due e il giorno 12 sotto (solo allora esisterebbe una coppia di soglie adatta). Il bias `b` non conta perché sposta tutti i punteggi allo stesso modo. (Illustrazione e verifica numerica sono dell'autore, non tratte da una fonte.)

**Come lo risolvono gli alberi.** Un albero di decisione (o di espressioni) può scrivere la regola con un annidamento: `se x3 > 0,2 allora (se x1 > 0 allora buy altrimenti sell) altrimenti hold`. Un controllo numerico verifica che questa regola dà esattamente `buy, sell, hold, hold` sui quattro giorni. Questa capacità è la ragione per cui la rassegna indica gli alberi (candidato B) come forma da considerare se l'esperienza mostrasse che servono congiunzioni tra indicatori.

Resta un'osservazione: se tra gli ingressi si aggiunge un indicatore che **è già** un prodotto, per esempio `x1 * x3`, il punteggio lineare riesce a rappresentare quel caso. Sui quattro giorni, `x1 * x3` vale 1,44, -1,03, -0,36 e 0,35; con soglie +0,8 e -0,8 le decisioni sono buy, sell, hold, hold. La limitazione sta quindi nella scelta degli ingressi più che nella forma; il costo è che qualcuno deve pensare a quali prodotti inserire [ipotesi].

#### 4.8.3 Sensibilità alla scala degli ingressi

Ogni ingresso ha una scala diversa: `x1` e `x2` si muovono di qualche punto percentuale, `x3` tra -0,23 e 0,36. Con peso 1 il volume può spostare il punteggio al massimo di 0,36, mentre le soglie sono a ±3. **Esito del controllo numerico:** con `w3` = 1 si ottengono esattamente le stesse decisioni di `w3` = 0, cioè il volume è ignorato (esempio senza volume). Per farlo contare serve un peso grande (10, nell'esempio base). Inoltre un genoma con intervalli di peso uguali per tutti favorirebbe gli ingressi di scala grande. Il difetto è dichiarato anche nella rassegna (ingressi di scala grande che prevalgono).

La soluzione si chiama **normalizzazione**: portare gli ingressi sulla stessa scala prima della somma, per esempio dividendo ciascuno per la propria deviazione standard (una misura di quanto il valore varia di solito). Sul dataset le deviazioni standard (calcolate sui 20 giorni) di `x1`, `x2`, `x3` sono 3,07, 1,93 e 0,17. Con ingressi normalizzati e pesi tutti uguali a 1, con soglie ±1,5, il punteggio del giorno 5 è 4,73 e il calcolo dà acquisto g.4, vendita g.15, acquisto g.19, **-0,59 %**. Equivale a usare sugli ingressi grezzi i pesi 0,33, 0,52 e 5,76. Due avvertenze.

- Calcolare la deviazione standard su tutti i 20 giorni usa informazione futura (anticipazione dei dati). In un uso reale la scala dovrebbe essere fissata prima o stimata con dati passati [ipotesi sul metodo].
- Con ingressi normalizzati i geni hanno intervalli simili: la ricerca è più facile, perché nessun gene domina gli altri [ipotesi].

#### 4.8.4 Etichette finite e soglie

Il punteggio è un numero **continuo**. Il motore però mostra a ogni giorno un'etichetta di stato scelta da un elenco finito (`labels`). Le soglie fanno proprio questo lavoro: trasformano il numero in una fascia. **Scelta dichiarata per questo capitolo:** tre etichette, `sopra` (punteggio sopra la soglia alta, decisione `buy`), `neutro` (tra le soglie, `hold`) e `sotto` (sotto la soglia bassa, `sell`). Il valore del punteggio e la distanza dalle soglie si espongono comunque insieme agli indicatori mostrati dal motore, quindi nel replay non si perde il numero, ma l'etichetta riassume solo tre fasce. È una scelta di presentazione, non del genoma; si possono preferire più fasce, per esempio cinque, e la differenza resta di interfaccia.

#### 4.8.5 Le altre domande

| Domanda | Risposta in parole semplici |
|---|---|
| Quanto sa esprimere? | Poco: una soglia su una somma pesata. Niente «X e Y» tra indicatori, se non si aggiungono ingressi prodotto. |
| Quanto è grande lo spazio di ricerca? | Piccolo: circa 9 numeri con 6 ingressi, 2 con la forma minima, 3 con Kalman sulla sola pendenza. |
| Si capisce perché decide così? | Sì. Ogni giorno si vedono i contributi `w_i * x_i`: nella tabella 4.3.4 il giorno 11 la decisione `buy` si spiega con 2,96 punti dovuti al volume (10 per 0,296). Segno e peso dicono il verso dell'effetto. |
| Quanto costa calcolarlo? | Decine di operazioni a barra: 6 prodotti, 6 somme e 2 confronti con 6 ingressi, più i filtri a monte. |
| Si mescola e si muta bene? | Sì. Ogni figlio è valido (sezione 4.6.4). Occorre tenere le soglie in ordine e normalizzare gli ingressi. |
| Si adatta al nostro motore? | Con un piccolo adattamento (sezione 4.9). |

### 4.9 Come si integra nel nostro motore

Il motore chiama la strategia una volta per barra: dà i dati del giorno e riceve `buy`, `sell` o `hold`. Il contratto che una forma deve rispettare chiede poche cose: un tipo di forma, l'elenco delle etichette di stato, una descrizione di ciò che la strategia sta guardando, il genoma in formato salvabile (JSON), più i metodi che la classe base di strategia fornisce già. Per le strategie diverse dalla macchina a stati restano da scrivere quattro funzioni (i «ganci»; nomi e righe nell'appendice «Approfondimenti», sezione «Riferimenti al codice: capitolo 4»). Per il punteggio lineare:

- aggiornare gli indicatori a ogni barra: le EMA e gli ingressi `x1`, `x2`, `x3` (con Kalman: livello e pendenza);
- decidere: calcolare `s` e confrontarlo con le soglie;
- riportare le EMA (e il filtro) allo stato iniziale quando si ricomincia da capo;
- esporre i numeri del genoma come JSON e, per la descrizione, `s`, gli ingressi e le distanze dalle soglie;
- le etichette sono le tre fasce (sezione 4.8.4).

Due punti da segnalare, come nella rassegna. L'etichetta è una **trasformazione** dell'uscita continua (adeguatezza «con adattamento»). Crossover e mutazione non sono richiesti dal contratto, ma l'algoritmo genetico li chiama: vanno scritti, e per un vettore di numeri sono semplici (sezioni 4.6.3 e 4.6.4). L'adeguatezza al contratto è, per ora, sulla carta fino all'implementazione.

### 4.10 Cosa dice la letteratura

- La somma pesata con soglia è un **classificatore lineare**. La rassegna non ha letto un testo di riferimento: **[ipotesi, fonte da verificare]**.
- Il filtro di Kalman [3] (letto per le parti citate) copre il filtraggio ricorsivo lineare; non tratta livellamento esponenziale né prezzi. Il metodo lineare di Holt (livello e pendenza) è in [15] (letto in parte); l'equivalenza con Kalman a guadagno costante non è in nessuna fonte letta.
- L'overfitting nelle strategie provate sui dati storici è discusso in [4] (letto per la parte sul metodo hold-out, cioè dati tenuti fuori dall'addestramento). Bailey e coautori sostengono che la sola validazione su dati tenuti fuori non basta quando si provano molte configurazioni.
- L'uso di algoritmi genetici e programmazione genetica per scoprire regole di trading azionario è ampio [7] (letto l'abstract); un precedente classico con medie mobili è [6] (letto solo il riassunto di un corso). Non riportiamo risultati numerici.
- Nessuna fonte letta tratta l'uso di un punteggio lineare di indicatori evoluto con un GA nel trading, né dell'osservatore di Kalman con un GA nel trading: **non accertato**.

### 4.11 In breve

- Si calcola ogni giorno `s = w1*x1 + ... + wn*xn + b` e si confronta con due soglie: sopra si compra, sotto si vende, in mezzo si aspetta.
- Il genoma è un vettore di circa 9 numeri (pesi, bias, soglie e, volendo, i coefficienti dei filtri): spazio piccolo, mutazione e crossover semplici, figli sempre validi.
- La memoria sta negli indicatori a monte; la strategia non ha stato proprio. Con l'osservatore di Kalman lo stato (livello e pendenza) sta nel filtro.
- È facile da leggere (si vede il contributo di ogni ingresso), ma non esprime «X e Y» tra indicatori e richiede ingressi sulla stessa scala.
- La forma minima (2 numeri) è il metro: una forma più ricca deve giustificare ciò che aggiunge.
- Sul dataset giocattolo gli esempi base, senza volume e alfa-beta danno -2,03 %, -1,07 % e +2,68 % (buy&hold: +12,87 %): mostrano il meccanismo, non l'efficacia.

## 5. Alberi di espressioni e programmazione genetica

Questo capitolo descrive il candidato B della rassegna (il documento compatto che precede questa guida): la strategia è un piccolo programma, scritto come albero, che l'algoritmo genetico fa evolvere. La tecnica si chiama **programmazione genetica** (*genetic programming*, GP). Il capitolo la applica al dataset inventato del capitolo 1 e presenta le varianti sulla memoria (la domanda 2, ancora aperta).

Numeri di esempio inventati: mostrano il meccanismo, non dicono nulla sulla qualità della forma. Decimali con la virgola nel testo e il punto nei blocchi di codice; tabelle arrotondate a due decimali.

### 5.1 In una frase e un'analogia

**In una frase.** Il genoma è una formula, scritta come albero di operazioni, che ogni giorno riceve i numeri del giorno (prezzo, medie, volume) e restituisce la decisione; l'algoritmo genetico fa evolvere la forma della formula e i numeri che contiene.

**Analogia.** Una cella di un foglio di calcolo con una formula annidata (C2 è il prezzo, D2 la media lenta, B2 la media veloce, A2 il volume, E2 la media del volume):

```
=SE(E(C2>D2; B2>D2; A2>1,1*E2); "compra"; SE(C2<D2; "vendi"; "aspetta"))
```

L'albero è il modo in cui il computer tiene in memoria la formula (un nodo per funzione, gli argomenti sono i figli). Qui la scrive l'evoluzione, mescolando pezzi di formule che già funzionano un po'.

**Due parole di finanza.** Il **prezzo di chiusura** è l'ultimo prezzo del giorno; una **media mobile** riassume i prezzi recenti in un numero che cambia lentamente (la **lenta** segue il prezzo in ritardo, la **veloce** più da vicino); il **volume** è il numero di azioni scambiate in un giorno. Prezzo sopra la media lenta si legge di solito come tendenza al rialzo [ipotesi].

### 5.2 Come funziona

#### 5.2.1 Gli ingredienti

Un albero ha due tipi di nodi.

- **Nodi interni**: operazioni con uno o più figli. Aritmetica (`+`, `-`, `*`, divisione), confronti (`>`, `<`, risultato vero o falso), logica (`and`, `or`) e il nodo `if` con tre figli (condizione, ramo «allora», ramo «altrimenti») [5].
- **Foglie**: i valori di partenza, cioè **ingressi** (prezzo, una media già calcolata, volume) o **costanti** (1,1; 0,97); in un programma che decide direttamente possono essere le parole `buy`, `sell`, `hold`.

Nodi e foglie ammessi sono fissati prima della ricerca (in GP: insieme delle funzioni e dei terminali); l'evoluzione sceglie come combinarli.

#### 5.2.2 Valutazione dall'alto verso il basso

Si parte dalla radice: ogni nodo chiede il valore ai figli e applica la sua operazione; `if` valuta solo il ramo scelto. Costo: i nodi visitati (21 nodi, al massimo 21 operazioni al giorno). Esempio: `(+ P (* 2 S))` con P = 10 e S = 4 vale 10 + 2·4 = 18.

#### 5.2.3 Dall'uscita a buy, sell, hold

Ci sono due modi di ottenere una decisione da un albero.

1. **Albero numerico con soglie.** L'albero dà un numero `u`: sopra una soglia alta `buy`, sotto una bassa `sell`, in mezzo `hold` [5]. È il punteggio lineare del capitolo 4 con un'espressione qualunque al posto della somma pesata. Negli esempi non lo si usa.
2. **Albero che decide direttamente.** Le foglie sono le azioni e i confronti scelgono il ramo: è l'esempio di questo capitolo. Si legge come un elenco di regole, con condizioni più liberamente annidate.

#### 5.2.4 Il disegno dell'albero

La regola in italiano:

> se (prezzo > media lenta) e (media veloce > media lenta) e (volume > 1,1 · media del volume) allora **buy**; altrimenti se (prezzo < media lenta) allora **sell**; altrimenti **hold**.

Come albero (chiamiamolo **albero T1**; ha 21 nodi e una profondità di 4 passi dalla radice alla foglia più lontana):

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

Nelle pagine seguenti i confronti sono disegnati su una riga (`P > S` al posto dei tre nodi); i nodi si contano sempre per intero.

#### 5.2.5 Da dove parte l'evoluzione: il primo albero

L'algoritmo genetico parte da una popolazione di alberi che il programma genera a caso: dalla radice sceglie a caso un'operazione tra quelle ammesse e, per ogni argomento, un'altra operazione o una foglia, e così via. Una **profondità massima** (per esempio 4 passi dalla radice) impedisce all'albero di crescere senza fine: al limite si scelgono solo foglie. Il limite vale anche per i figli del crossover. Esistono varianti della generazione (alberi sempre pieni, di forma libera, una miscela) [5].

Gli alberi casuali sono quasi tutti poco sensati (molti decidono sempre `hold`), ma la selezione tiene i meno cattivi e crossover e mutazione li migliorano. L'albero T1 dell'esempio è scritto a mano, per poterlo leggere [ipotesi: i dettagli dei metodi di generazione non sono stati riletti].

#### 5.2.6 Il vincolo di tipo

Non ogni nodo può stare sotto ogni altro. Un albero come T1 ha tre tipi di valore: **numeri** (prezzo, medie, volume, costanti, `+`, `*`), **vero/falso** (`>`, `<`, `and`, `or`) e **azioni** (`buy`, `sell`, `hold`). `>` vuole due numeri, `and` due vero/falso, `if` un vero/falso e due rami dello stesso tipo. Il **vincolo di tipo** dice che un sottoalbero si sostituisce solo con uno dello stesso tipo.

Senza il vincolo nascono alberi senza senso. Esempio: se il crossover scambia il sottoalbero numerico `1,1 * VA` (primo genitore) con il vero/falso `F > 1,01 * S` (secondo genitore), nasce `V > (F > 1,01 * S)`, un volume confrontato con un vero/falso. Un programma rigoroso rifiuta l'albero; uno permissivo che legge «vero» come 1 lo esegue, ma la condizione diventa `V > 1`, sempre vera sul dataset, e nessuno lo ha voluto. Perciò nel crossover il secondo taglio è tra nodi dello stesso tipo del primo, e nella mutazione un nodo si sostituisce con uno dello stesso tipo (`>` con `<`, `and` con `or`, non `>` con `+`). In 5.4.2 i due pezzi scambiati sono entrambi vero/falso. In GP si parla di programmazione genetica con tipi [ipotesi: nome e fonte non riletti].

### 5.3 Esempio applicato al dataset giocattolo

#### 5.3.1 Semplificazioni di questo esempio

- Dataset e valutatore del capitolo 1: decisione alla chiusura del giorno t, eseguita al prezzo del giorno t+1; si compra con tutto il denaro e si vende tutto; azioni frazionarie; nessun costo, stop loss o take profit; l'ultima decisione è ignorata; capitale 1000. Un `buy` con la posizione già aperta, o un `sell` a posizione chiusa, non fa nulla.
- Medie calcolate a monte, già pronte per l'albero (EMA, vedi 1.3): lenta S con `c = 0,2`, veloce F con `c = 0,5`, media del volume VA con `c = 0,2`.

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

- Giorni 3-7: prezzo sopra la media lenta, veloce sopra lenta, volume oltre il 10% della sua media: scatta `buy`. Il giorno 2 il volume (1100) non supera 1122: `hold`. Giorni 8-10: il volume è calato, `hold`.
- Giorno 11: il prezzo (10,80) scende sotto la media lenta (10,88), scatta `sell`. Dal giorno 17 il prezzo è di nuovo sopra la lenta ma il volume è sotto la soglia: l'albero non rientra.

**Risultato col valutatore.** Compra al prezzo del giorno 4 (10,55), perché la prima decisione `buy` è del giorno 3 (i `buy` dei giorni 4-7 sono ignorati: la posizione è già aperta). Vende al prezzo del giorno 12 (10,50), perché la prima decisione `sell` è del giorno 11. Valore finale **995,26**, rendimento **-0,47%**; comprare il giorno 1 e tenere dà 1128,71 (+12,87%). Il confronto non dice che l'albero sia peggiore: l'esempio mostra il meccanismo.

#### 5.3.4 Che cosa sa esprimere l'albero e un punteggio lineare no

Un **punteggio lineare** (candidato A della rassegna, capitolo 4) è una somma pesata `s = w1·x + w2·y + ...` con soglie: ogni indicatore spinge sempre nella stessa direzione, qualunque sia il valore degli altri. Un'**interazione** è una regola in cui l'effetto di un indicatore dipende da un altro. L'albero la esprime con `*` o con un `if` annidato; la somma pesata no.

Esempio inventato, con due numeri relativi:

```
x = (P - S) / S       di quanto il prezzo sta sopra la media lenta (in frazione)
y = (V - VA) / VA     di quanto il volume sta sopra la sua media (in frazione)
```

Regola: `buy` quando `x · y > 0,003`, cioè quando prezzo e volume si scostano dalla loro media **nello stesso verso** (entrambi sopra o entrambi sotto) di abbastanza. Che abbia un senso finanziario non lo sostengo: serve a mostrare un'interazione. Come albero (13 nodi):

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

Quattro giorni, uno per combinazione di segni; «Obiettivo» è ciò che la regola dice quel giorno:

| Giorno | x | y | x·y | albero: buy? | Obiettivo |
|---|---|---|---|---|---|
| 4 | 0,0373 | 0,3103 | 0,0116 | sì | buy |
| 9 | 0,0411 | -0,1254 | -0,0052 | no | hold |
| 12 | -0,0283 | 0,3640 | -0,0103 | no | hold |
| 15 | -0,0192 | -0,2317 | 0,0045 | sì | buy |

Un lineare `w1·x + w2·y > soglia` non la riproduce: è la difficoltà dello XOR (vero quando uno solo dei due ingressi è vero). Sul piano (x, y) i giorni «buy» (4 e 15) e «hold» (9 e 12) sono gli angoli opposti di un quadrilatero: i segmenti che li uniscono si incrociano e nessuna retta separa i due «buy» dai due «hold». Il miglior lineare (3600 direzioni provate) indovina al massimo 3 giorni su 4; sui 20 giorni ne indovina 17, l'albero 20 per costruzione.

Nota onesta: se tra gli indicatori a monte ci fosse già `x · y`, anche il lineare lo userebbe. L'albero però può **costruirsi da solo** un prodotto, un rapporto o un massimo da ingressi semplici. In teoria, con aritmetica e `if`, qualsiasi funzione degli ingressi è raggiungibile, dimensione permettendo [5, ipotesi].

### 5.4 Come evolve

#### 5.4.1 I geni

Il **genoma** è l'albero stesso. L'evoluzione può cambiare: la **forma** (un `if` in più, un sottoalbero tolto); le **operazioni** (`>` al posto di `<`, `and` al posto di `or`, nel rispetto del vincolo di tipo); le **foglie ingresso** (P al posto di F); le **costanti** (1,1 diventa 1,3).

A differenza della macchina a stati, il numero di geni cambia con la dimensione dell'albero: T1 ha 21 nodi e una costante.

#### 5.4.2 Crossover tra sottoalberi

Il **crossover** prende due genitori, sceglie in ciascuno un nodo (punto di taglio) e scambia i sottoalberi sotto quei nodi; ogni figlio è un genitore con un pezzo preso dall'altro [5]. Il secondo taglio è tra nodi dello stesso tipo del primo (5.2.6): qui sono pezzi vero/falso.

Genitori. Il primo è l'albero T1 (21 nodi). Il secondo, **albero T2**, ha 15 nodi:

```
Genitore 1 (albero T1)                Genitore 2 (albero T2)
if                                    if
├── and                               ├── F > 1.01 * S      <- pezzo Y (5 nodi)
│   ├── and (P > S, F > S)             ├── buy
│   └── V > 1.1 * VA   <- pezzo X     └── if
│       (5 nodi)                           ├── V > 1.5 * VA
├── buy                                    ├── sell
└── if (P < S) sell hold                   └── hold
```

L'albero T2 in parole: se la media veloce supera di oltre l'1% la lenta, `buy`; altrimenti, se il volume supera una volta e mezza la sua media, `sell`; altrimenti `hold`. Si scambiano il pezzo X (confronto sul volume, genitore 1) e il pezzo Y (confronto tra le medie, genitore 2):

- **Figlio 1** = genitore 1 con X sostituito da Y: compra quando P > S, F > S e F > 1,01·S (ha tolto la condizione sul volume e ne ha messa una sulla distanza tra le medie); vende se P < S. 21 nodi.
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
| Genitore 1 (T1) | 21 | compra g. 4, vende g. 12 | 995,26 | -0,47% |
| Genitore 2 (T2) | 15 | compra g. 5, tiene | 1055,56 | +5,56% |
| Figlio 1 | 21 | compra g. 5, vende g. 12, ricompra g. 19 | 985,19 | -1,48% |
| Figlio 2 | 15 | compra g. 4, tiene | 1080,57 | +8,06% |

Che cosa si osserva:

- Il figlio 1 è una via di mezzo: ha l'uscita del genitore 1 e un ingresso più simile al genitore 2.
- Il figlio 2 ha un ramo che **non scatta mai, per come è costruito**: il `sell` sta sotto l'«altrimenti» di `V > 1,1·VA`, ma ogni volume maggiore di 1,5·VA è anche maggiore di 1,1·VA, quindi `buy` scatterebbe prima. La vendita è irraggiungibile su qualsiasi dataset, non solo su questo. Il figlio 2 non vende mai e diventa «compra e tieni» dal giorno 4. Un ramo che non scatta mai è **codice morto** (in GP *introne*); qui lo ha prodotto il crossover. Il suo rendimento migliore dipende dal fatto che il dataset sale in fondo, non dalla struttura.
- Un figlio non è la media dei genitori: può andare meglio o peggio di entrambi.

#### 5.4.3 Mutazione

La **mutazione** cambia a caso un pezzo piccolo. Tre esempi sull'albero T1 (tutti inventati, uno per tipo):

| Mutazione | Cambia | Giorni con decisione diversa da T1 | Operazioni | Valore finale | Rendimento |
|---|---|---|---|---|---|
| Costante: 1,1 diventa 1,3 | `V > 1,3·VA` | 3, 5, 7 (da buy a hold) | compra g. 5, vende g. 12 | 972,22 | -2,78% |
| Foglia: nel ramo `sell`, P diventa F | `F < S` al posto di `P < S` | 11 (da sell a hold) | compra g. 4, vende g. 13 | 976,30 | -2,37% |
| Sottoalbero: il ramo `hold` finale è sostituito da `if V > 1,5·VA then buy else hold` | 7 nodi in più (28 in tutto) | nessuno | come T1 | 995,26 | -0,47% |

Nel primo caso la prima operazione slitta di un giorno (si perdono i giorni 3, 5, 7; il 4 e il 6 passano). Nel secondo, F al giorno 11 è ancora sopra S (10,98 contro 10,88): la vendita scatta un giorno dopo. Nel terzo nessuna decisione cambia (il nuovo ramo scatterebbe solo con un volume oltre 1,5 volte la media, mai qui): è una **mutazione neutra**. Molte lo sono, la selezione le lascia passare e l'albero cresce (vedi sotto).

#### 5.4.4 La crescita incontrollata (bloat)

Il **bloat** è la crescita degli alberi senza miglioramento della fitness [5, sez. 11.3]. Esempio costruito a mano: in T1 la condizione `P > S` diventa `P > S and (P > S or V < 0)`; poiché `V < 0` non è mai vero, vale quanto prima. L'albero passa da 21 a 29 nodi (quasi il 40% in più da calcolare) con le stesse decisioni nei 20 giorni; ripetendo il gioco cresce ancora e si legge sempre peggio.

Perché cresce? Il crossover scambia pezzi casuali e un pezzo in più raramente peggiora la fitness (il codice morto non fa danni), quindi sopravvive. Difese proposte dalla letteratura GP: penalizzare la dimensione nella fitness o limitare dimensione o profondità [5, sez. 11.3]. La rassegna fissa già una condizione di scarto: se gli alberi crescono senza miglioramento di fitness si passa ad altre forme.

### 5.5 Cosa ricorda del passato: le due varianti

Le prime due varianti sono quelle della rassegna («solo indicatori» e «con registri»); se ne aggiunge una terza (5.5.3-bis): l'albero legge solo ingressi, ma tra questi c'è lo stato del portafoglio fornito dal motore. Le tre sono affiancate, senza sceglierne una.

#### 5.5.1 Variante «solo indicatori»

L'albero T1 (sezione 5.2.4: tre confronti uniti da «e» per comprare, un confronto per vendere) è già un esempio: legge solo numeri riassunti **a monte** dal motore e non ha nulla di suo che passi da un giorno all'altro. Dati gli stessi ingressi dà sempre la stessa risposta; se serve un ricordo diverso (il massimo del prezzo da un certo giorno) serve un indicatore apposito a monte. Non c'è nulla da azzerare oltre agli indicatori e l'albero si testa con una tabella di ingressi.

#### 5.5.2 Variante «con memoria interna»: i registri

Un **registro** è una variabile che il programma scrive in un giorno e rilegge il giorno dopo, come una variabile globale in un programma richiamato una volta al giorno; all'inizio vale 0. È naturale nella GP lineare (sequenza di istruzioni su registri, sez. 7.1 di [5]; vedi l'appendice, sezione «Altre rappresentazioni della programmazione genetica»).

**Esempio sul dataset giocattolo.** Un solo registro, `R0`, il massimo del prezzo dopo l'acquisto (0 se non in posizione). Il programma, ogni giorno:

```
decisione:
  se R0 = 0 (non in posizione):
      se (P > S) e (F > S) e (V > 1.1 * VA): buy    # acquisto come in T1
      altrimenti: hold
  altrimenti (in posizione):
      se P < 0.97 * R0: sell         # uscita: prezzo sceso del 3% dal massimo
      altrimenti: hold
aggiornamento di R0 (dopo la decisione):
  se la decisione e' buy e R0 = 0: R0 = P
  altrimenti se R0 > 0:           R0 = max(R0, P)
  se la decisione e' sell:        R0 = 0
```

Come albero ha 28 nodi (il test «R0 = 0» è `R0 < 0,0001`). L'**uscita sul massimo** (*trailing stop*: si vende se il prezzo scende di una percentuale dal massimo dopo l'acquisto) non è calcolata da nessun indicatore a monte, perché dipende dal giorno in cui il programma ha comprato. Il motore ha già stop loss e take profit fissi, misurati dal prezzo d'acquisto e fuori dal genoma: è un'altra cosa.

Giorno per giorno (R0 in ingresso è il valore a inizio giorno; uscita se `P < 0,97·R0`):

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

Il giorno 3 decide `buy` e scrive 10,30; poi `R0` segue il massimo fino a 11,35. Il giorno 11 il prezzo (10,80) scende sotto 0,97·11,35 = 11,01: `sell`, e `R0` torna a 0. Poi le condizioni di acquisto non sono mai vere insieme (giorni 12-16 prezzo sotto la lenta, dal 17 volume sotto la soglia).

Il registro conosce le decisioni del programma, non lo stato reale del portafoglio: il giorno 3 prende 10,30, ma l'acquisto vero avviene il giorno 4 a 10,55 e il motore potrebbe non eseguirlo. È uno dei motivi per cui la terza via (5.5.3-bis) è interessante.

**Risultato col valutatore:** compra al giorno 4 (10,55), vende al 12 (10,50), valore finale **995,26** (**-0,47%**), uguale a T1 per coincidenza (le due uscite scattano lo stesso giorno). Cambiando solo 0,97 le uscite divergono: con 0,99 il `sell` scatta il giorno 10 (1023,70, +2,37%); con 0,95 il giorno 12 (976,30, -2,37%). Nessuna cifra dice se una soglia sia migliore.

**Lo stesso ingresso, due risposte.** Il giorno 11 gli indicatori valgono P = 10,80, S = 10,88, F = 10,98, V = 1900: con `R0 = 0` la risposta è `hold`, con `R0 = 11,35` è `sell`. Con i registri la risposta dipende anche da ciò che è successo prima.

#### 5.5.3 Che cosa guadagna e che cosa perde

**Guadagna.** Una memoria su misura (contatore di giorni, massimo dopo l'acquisto, etichetta «già in posizione») e regole di uscita legate alla propria storia.

**Perde.**
- **Si legge meno:** per capire una decisione bisogna aver simulato i giorni precedenti.
- **Spazio di ricerca più grande:** ogni registro è un gene in più, con il suo aggiornamento.
- **Una mutazione si propaga nel tempo:** cambiare 0,97 cambia `R0` in tutti i giorni dopo l'acquisto (0,99 sposta la vendita di un giorno e il prezzo di vendita cambia di 30 centesimi).
- **Rischia di diventare una macchina a stati nascosta:** `R0 = 0` o `R0 > 0` distingue due situazioni (fermo, in posizione), con in più un numero che si porta dietro. Registri liberi potrebbero ricreare, meno leggibile, ciò che si voleva lasciare.

#### 5.5.3-bis La terza via: lo stato del portafoglio fornito dal motore

Un'alternativa è dare all'albero, tra gli ingressi, lo **stato del portafoglio fornito dal motore**: «in posizione sì o no», «prezzo d'acquisto», **«giorni dall'acquisto»** (G) e «massimo del prezzo dall'acquisto». I giorni e il massimo vanno calcolati dal motore (vedi sotto). L'esempio usa solo G. L'albero resta una funzione pura dei suoi ingressi, senza registri: da quanto si è in posizione lo sa il motore, non il genoma.

Esempio: la regola «vendi dopo tre giorni». G = giorni di borsa con la posizione aperta, contando il giorno in cui l'acquisto viene eseguito (0 se non in posizione). L'albero:

```
se G = 0 (non in posizione):
    se (P > S) e (F > S) e (V > 1.1 * VA): buy        # acquisto come in T1
    altrimenti: hold
altrimenti (in posizione):
    se G >= 3: sell                                    # uscita dopo tre giorni
    altrimenti: hold
```

| Giorno | P | G (dal motore) | Decisione |
|---|---|---|---|
| 3 | 10,30 | 0 | buy |
| 4 | 10,55 | 1 | hold |
| 5 | 10,80 | 2 | hold |
| 6 | 11,00 | 3 | sell |
| 7 | 11,20 | 0 | buy |
| 8 | 11,35 | 1 | hold |
| 9 | 11,30 | 2 | hold |
| 10 | 11,10 | 3 | sell |
| 11-20 | 10,80 ... 11,40 | 0 | hold |

(Giorni 1 e 2: `hold` con G = 0; dal giorno 11 le condizioni di acquisto non sono mai vere insieme.) Operazioni: compra al giorno 4 (10,55), vende al 7 (11,20), compra all'8 (11,35), vende all'11 (10,80). Valore finale **1010,17** (+1,02%). Il numero non dice altro: mostra che «dopo tre giorni» si scrive senza registri né macchina a stati, se il motore fornisce G. Scritta come lista di regole, la stessa idea dà 1023,64 nel capitolo 6 (6.6), perché la regola di acquisto della lista è un'altra (prezzo sopra la media lenta più 1% e volume sopra la sua media) e permette un acquisto in più, il giorno 19.

Guadagna la leggibilità di «solo indicatori», nessun registro da mutare, informazioni vere sul portafoglio invece di una stima del programma (niente acquisto non ancora eseguito). Costa lavoro al motore, che deve calcolare G, e l'albero può usare solo ciò che il motore offre. G entra tra gli ingressi della ricerca sugli indicatori da usare (R2) [ipotesi].

Che cosa il motore possiede già: il `Trader` (che compra e vende) conosce lo stato della posizione e, per ogni posizione aperta, prezzo e momento di acquisto, ed è disponibile alla strategia come `this.trader`. Manca un valore pronto «giorni di borsa dall'acquisto» (il momento di acquisto è un'ora, non un conteggio di barre) e non c'è nulla sul massimo dopo l'acquisto: vanno calcolati, per esempio contando le barre. Dettagli nell'appendice, sezione «Riferimenti al codice: capitoli 5 e 6» [ipotesi: come il motore passerebbe G alla forma non è stato stabilito].

#### 5.5.4 La domanda aperta per chi decide

> **Domanda 2.** Nella forma scelta (qui l'albero), la memoria sta solo negli indicatori già calcolati, in variabili del genoma (registri o altra memoria interna), oppure in uno stato del portafoglio fornito dal motore?

Questa domanda riguarda come è scritta la forma scelta. Non riapre la domanda 1, che ha già stabilito quali forme si valutano.

In termini di cosa cambia:

- **Solo indicatori:** la memoria sta nell'elenco di indicatori a monte (la ricerca sugli indicatori da usare, R2). Programma puro, leggibile; se manca un indicatore, non può inventarselo.
- **Con registri:** il programma inventa la memoria che gli serve, ma si legge meno, la ricerca è più ampia e torna uno stato interno, come nella macchina a stati di oggi.
- **Stato del portafoglio fornito dal motore:** programma puro e leggibile, con ingressi in più; il costo è del motore, e la memoria utile è solo quella che il motore offre.

Il capitolo non sceglie: la decisione spetta a chi decide. È una scelta di progetto, non una proprietà della forma: albero e GP cartesiana ammettono tutte le varianti [5].

#### 5.5.5 Cenno alle varianti di rappresentazione

Esistono altre rappresentazioni della GP (GP lineare, evoluzione grammaticale, GP cartesiana). Non sono candidati di questa guida: la descrizione è nell'appendice, sezione «Altre rappresentazioni della programmazione genetica».

### 5.6 Punti di forza e debolezze

#### 5.6.1 Quanto sa esprimere

Molto: in teoria qualsiasi funzione degli ingressi, dimensione permettendo [5, ipotesi]. Il caso concreto è l'interazione tra volume e prezzo di 5.3.4, che la somma pesata non esprime. Esprimere molto non vuol dire esprimere cose utili: la maggior parte degli alberi possibili è priva di senso.

#### 5.6.2 Quanto è grande lo spazio di ricerca

Grande e a dimensione variabile: T1 ha 21 nodi, 5 ingressi possibili per le foglie e una costante, ma l'evoluzione cambia anche il numero di nodi (il lineare ha una decina di numeri, la macchina a stati di oggi un numero fisso più una struttura discreta, capitolo 3). Uno spazio grande dà più possibilità di trovare regole utili e di adattarsi al rumore dei soli 2517 giorni di un titolo: provare molte configurazioni sugli stessi dati rende poco affidabile la validazione [4]. Limitare il rischio spetta alla ricerca sulla funzione di fitness (R5) e a quella sul protocollo di valutazione (R6).

#### 5.6.3 Si capisce perché decide così?

Dipende dalla dimensione. T1 si legge come una frase («compra se il prezzo è sopra la media lenta, la veloce sta sopra la lenta e il volume è alto») e la tabella 5.3.2 mostra il ramo che scatta ogni giorno. L'albero del bloat (29 nodi) fa le stesse scelte ma si legge peggio; con i registri peggio ancora (5.5.3) [5, ipotesi per l'illeggibilità in pratica].

#### 5.6.4 Quanto costa calcolarlo

Proporzionale ai nodi: da decine a centinaia di operazioni al giorno per 10-100 nodi [ipotesi]. Non discrimina tra le forme; pesano la dimensione massima ammessa e quella della popolazione (R5 e R6).

#### 5.6.5 Si mescola e si muta bene?

Il crossover tra sottoalberi è il caso «naturale» della GP [5], ma non funziona sempre: con nodi di tipo diverso serve il vincolo di tipo di 5.2.6, altrimenti un sottoalbero vero/falso può finire dove serviva un numero. Con il vincolo due alberi qualunque danno due alberi validi; resta la qualità dei figli (rami morti, 5.4.2). La mutazione è semplice e molte sono neutre (5.4.3). La GP cartesiana usa di norma solo la mutazione.

#### 5.6.6 Che etichette (`labels`) ha

Il motore mostra a schermo, per ogni giorno, un'etichetta scelta da una lista fissa di «stati». Un albero non ha stati, ma l'etichetta si ricava dalla foglia che scatta (`buy`, `sell`, `hold`) o dalle fasce dell'uscita numerica: dettagli nell'appendice, sezione «Etichette (`labels`) per l'albero».

### 5.7 Come si integra nel nostro motore

Ogni giorno il motore aggiorna gli indicatori, passa i dati all'albero e riceve `buy`, `sell` o `hold`. Il valutatore ricorsivo è breve, l'albero si salva come JSON e vanno scritti `crossover` e `mutate` (funzioni ricorsive di poche righe). Le parti scomode: le etichette (5.6.6), il limite di dimensione (bloat) e, con i registri, l'azzeramento a ogni ripartenza. Riferimenti al codice: appendice, sezione «Riferimenti al codice: capitoli 5 e 6».

### 5.8 Cosa dice la letteratura

Un precedente classico [6] cerca con un GA combinazioni logiche di regole su medie mobili e massimi e minimi; non è stato letto, e il riassunto dice che, in quello studio, dopo i costi di transazione non si guadagna. Una rassegna sistematica [7] osserva una forte concentrazione di studi su GA e GP per le regole di trading (letto l'abstract). Il manuale della GP è [5]. Nessuna fonte dice come vada la GP su ENI.

### 5.9 In breve

- Un albero di operazioni legge indicatori già calcolati e dà `buy`, `sell` o `hold`; piccolo si legge come una regola, grande no. Il primo albero è casuale con profondità massima e i nodi rispettano un vincolo di tipo (5.2.5, 5.2.6).
- Esprime interazioni che il lineare non esprime (5.3.4); evolve per crossover tra sottoalberi (5.4.2) e mutazione (5.4.3).
- Costi: spazio di ricerca ampio, bloat (5.4.4), rami morti anche per costruzione.
- Memoria, tre varianti affiancate: «solo indicatori» (programma puro), «con registri» (memoria su misura, ma meno leggibile, può ricreare una macchina a stati) e «stato del portafoglio fornito dal motore» (programma puro, ingressi forniti dal motore). La domanda 2 spetta a chi decide.

## 6. La lista di regole

Numeri di esempio inventati: mostrano il meccanismo, non dicono nulla sulla qualità della forma.

### 6.1 In una frase e un'analogia

Una lista di regole è un elenco ordinato di frasi «se la condizione è vera, allora fai questa azione»: ogni giorno si scorre l'elenco dall'alto e si esegue l'azione della **prima** regola con condizione vera. L'ultima regola vale sempre ed è la scelta di riserva (default).

**Analogia.** Se hai mai scritto una catena di `if / else if / else`, hai scritto una lista di regole:

```
if (prezzo sopra la media lenta di almeno l'1% e volume sopra la media) buy
else if (prezzo sotto la media lenta di almeno l'1%)                    sell
else                                                                    hold
```

È come le regole di un firewall: il messaggio si confronta con le regole in ordine, la prima che corrisponde decide. In letteratura è una **lista di decisione** (decision list), studiata da Rivest [8].

### 6.2 Come funziona

#### 6.2.1 Gli ingredienti

- **Condizione.** Un confronto tra due numeri («il prezzo è maggiore della media lenta»); più confronti si uniscono con «e» e la condizione è vera solo se lo sono tutti.
- **Azione.** Una delle tre decisioni del progetto: `buy`, `sell`, `hold` (non fare nulla e mantenere la posizione).
- **Ordine.** Le regole sono numerate e si valutano nell'ordine, fermandosi alla prima vera.
- **Regola di default.** L'ultima, senza condizione: scatta se nessuna delle precedenti è scattata, così ogni giorno c'è una decisione.
- **Margine.** Sposta il confronto: «prezzo sopra la media di almeno 1%» è `prezzo > media × (1 + m)` con `m = 0,01 (1%)`; evita di reagire a differenze minime. `m1` e `m2` sono numeri del genoma.

Gli indicatori sono medie mobili esponenziali (EMA, vedi 1.3): media **veloce** con `c = 0,5`, **lenta** con `c = 0,2`, e media del volume con `c = 0,2`.

#### 6.2.2 Nessuno stato: ogni giorno si rivaluta tutto

La lista non conserva nulla da un giorno all'altro: ogni giorno riceve i valori degli indicatori, scorre le regole da capo e decide. Non sa che cosa ha deciso ieri né se è in posizione. La **macchina a stati** di Consilium invece ha uno stato interno (uno tra nove) e la decisione di oggi dipende da quello di ieri. La lista, dati gli stessi indicatori, dà sempre la stessa risposta.

#### 6.2.3 Una lista è un albero molto sbilanciato

Un **albero di decisione** pone a ogni nodo una domanda e scende a sinistra o a destra fino a una foglia con l'azione. La lista è un albero in cui a ogni domanda un ramo finisce subito in una foglia:

```
        R1: sopra l'1% e volume alto?
              /                \
            si                  no
           buy         R2: sotto l'1%?
                              /      \
                            si        no
                           sell      hold
```

Un albero qualsiasi può avere domande su entrambi i rami; la lista è il caso «a pettine». È più semplice da leggere (si va dall'alto in basso) e meno flessibile (non si fanno domande diverse sui due rami di una domanda).

### 6.3 Esempio applicato al dataset giocattolo

#### 6.3.1 Semplificazioni di questo esempio

Dataset e valutatore: quelli del capitolo 1.

- Decisione alla chiusura del giorno `t`, eseguita al prezzo di `t+1` (l'ultima è ignorata). `buy` compra con tutto il denaro solo se non si è in posizione, `sell` vende tutto solo se lo si è: lo controlla il valutatore, non la lista.
- Azioni frazionarie, nessun costo, stop loss o take profit; capitale 1000; tabelle arrotondate a due decimali, confronti sui valori non arrotondati. I margini sono **relativi** alla media lenta (`m = 0,01 (1%)` vale `media × 0,01`).

#### 6.3.2 La lista

```
R1  se  prezzo > media_lenta × (1 + m1)  e  volume > media_volume   allora buy
R2  altrimenti se  prezzo < media_lenta × (1 - m2)                  allora sell
D   altrimenti                                                      hold
```

con `m1 = m2 = 0,01 (1%)`, media lenta del prezzo con `c = 0,2`, media del volume con `c = 0,2`.

In parole: compra quando il prezzo è nettamente sopra la tendenza e quel giorno si scambia più del solito; vendi quando è nettamente sotto; altrimenti aspetta.

#### 6.3.3 Giorno per giorno

«Distanza %» è `(prezzo / media lenta - 1) × 100`. «R1 vera?» e «R2 vera?» dicono se la condizione di R1 (sopra di almeno 1% e volume sopra la media) o di R2 (sotto di almeno 1%) è vera; scatta la prima regola vera (D = default).

| Giorno | Prezzo | Media lenta | Distanza % | Volume | Media volume | R1 vera? | R2 vera? | Regola | Decisione |
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

- **Giorno 2.** Prezzo sopra la media (+0,80%) e volume sopra la media, ma il margine di 1% non è raggiunto: R1 è falsa e scatta il default. Il margine fa il suo lavoro.
- **Giorno 8.** Prezzo ben sopra la media (+5,66%) ma volume (1400) appena sotto la sua media (1415): R1 è falsa, R2 anche, scatta `hold`. Una regola «e» richiede che tutti i confronti siano veri.
- **Giorni 9-11.** Il prezzo scende ma non abbastanza sotto la media: nessuna regola scatta, `hold`.
- **Giorno 15.** Il prezzo risale, ma è ancora a -1,92% dalla media lenta: R2 dice ancora `sell`. La media lenta ha molta memoria e reagisce in ritardo.

#### 6.3.4 Risultato col valutatore

Il valutatore esegue le decisioni (il `buy` del giorno 3 viene eseguito al prezzo del giorno 4, e così via):

| Operazione | Giorno di esecuzione | Prezzo |
|---|---|---|
| buy | 4 | 10,55 |
| sell | 13 | 10,30 |
| buy | 19 | 11,25 |

Valore finale **989,32**, rendimento **-1,07%**; il riferimento (comprare il giorno 1 e tenere) dà +12,87%. L'esempio mostra il meccanismo e non deve battere il riferimento. Il `buy` si ripete per cinque giorni (3-7) ma il valutatore compra una volta sola: la lista non sa di essere in posizione, lo sa il motore.

### 6.4 Che cosa cambia se si scambia l'ordine di due regole

Nella lista dell'esempio le due condizioni (sopra di almeno 1% e sotto di almeno 1%) non possono essere vere insieme: scambiare R1 e R2 non cambia nulla (decisioni identiche nei 20 giorni). L'ordine conta solo quando due condizioni possono essere vere insieme. Costruiamo un secondo esempio in cui capita:

```
Rb  se  media_veloce > media_lenta                              allora buy
Rs  se  volume > media_volume  e  prezzo < media_veloce         allora sell
D   altrimenti                                                  hold
```

In parole: Rb dice «compra se la tendenza breve è sopra quella lunga»; Rs dice «vendi se oggi si scambia più del solito e il prezzo è sceso sotto la tendenza breve». Due liste con le **stesse** regole in ordine diverso:

- Lista C1: Rs, Rb, D. Lista C2: Rb, Rs, D. Le decisioni coincidono in tutti i giorni tranne uno; ecco i giorni 9-14 (media veloce con `c = 0,5`, lenta con `c = 0,2`):

| Giorno | Prezzo | Media veloce | Media lenta | Rb vera? | Rs vera? | C1 (Rs, Rb) | C2 (Rb, Rs) |
|---|---|---|---|---|---|---|---|
| 9 | 11,30 | 11,24 | 10,85 | sì | no | buy | buy |
| 10 | 11,10 | 11,17 | 10,90 | sì | no | buy | buy |
| 11 | 10,80 | 10,98 | 10,88 | sì | sì | **sell** | **buy** |
| 12 | 10,50 | 10,74 | 10,81 | no | sì | sell | sell |
| 13 | 10,30 | 10,52 | 10,70 | no | sì | sell | sell |
| 14 | 10,20 | 10,36 | 10,60 | no | no | hold | hold |

Il giorno 11 la media veloce (10,98) è sopra la lenta (10,88), quindi Rb è vera; ma il volume (1900) è sopra la media (1466) e il prezzo (10,80) è sotto la media veloce, quindi è vera anche Rs. Se Rs viene prima, il giorno 11 è `sell`; se viene prima Rb è `buy`, e la vendita arriva un giorno dopo.

Col valutatore:

| Lista | Operazioni (giorno, tipo, prezzo) | Valore finale | Rendimento |
|---|---|---|---|
| C1 (Rs, Rb) | 3 buy 10,30; 12 sell 10,50; 18 buy 11,05 | 1051,71 | +5,17% |
| C2 (Rb, Rs) | 3 buy 10,30; 13 sell 10,30; 18 buy 11,05 | 1031,67 | +3,17% |

Un solo giorno di decisione diversa sposta la vendita di un giorno e cambia il risultato di due punti percentuali: l'**ordine è un gene a tutti gli effetti**. Che C1 vada meglio di C2 su questi dati inventati non ha valore generale.

### 6.5 Come evolve

#### 6.5.1 I geni

L'algoritmo genetico può cambiare, in una lista di regole:

- le **soglie e i margini** (`m1`, `m2`: numeri continui);
- per ogni confronto, **quali indicatori** mette a confronto (per esempio «prezzo contro media lenta», «media veloce contro media lenta», «volume contro media volume») e con quale operatore (`>` o `<`);
- l'**azione** di ogni regola (`buy`, `sell`, `hold`);
- l'**ordine** delle regole;
- il **numero di regole** e il numero di condizioni per regola.

L'ultimo punto è una differenza importante: il genoma ha lunghezza variabile.

#### 6.5.2 Mutazione: quattro esempi sulla lista dell'esempio

Si parte dalla lista L1 (R1, R2, D), risultato 989,32 (-1,07%). Ogni mutazione modifica una cosa sola.

1. **Cambiare una soglia: `m1` da 0,01 (1%) a 0,04 (4%).** R1 richiede il prezzo sopra la media di almeno il 4%. Cambiano i giorni 3, 4 e 18 (da `buy` a `hold`). Operazioni: buy giorno 6 a 11,00, sell giorno 13 a 10,30, buy giorno 20 a 11,40. Valore finale 936,36 (-6,36%).
2. **Cambiare un'altra soglia: `m2` da 0,01 (1%) a 0,03 (3%).** R2 richiede il prezzo sotto la media di almeno il 3%. Cambiano i giorni 12 e 15 (da `sell` a `hold`). Operazioni: buy giorno 4 a 10,55, sell giorno 14 a 10,20, buy giorno 19 a 11,25. Valore finale 979,72 (-2,03%).
3. **Sostituire un indicatore: R2 guarda la media veloce al posto del prezzo.** La condizione diventa `media_veloce < media_lenta × (1 - m2)` con `m2 = 0,01 (1%)`: R2 vende solo quando è la media veloce a scendere sotto la lenta di almeno l'1%. Cambia solo il giorno 12 (da `sell` a `hold`): il prezzo (10,50) è già sotto la soglia, ma la media veloce (10,74) è ancora sopra 10,81 × 0,99 = 10,70. Il giorno 13 la media veloce (10,52) scende sotto 10,70 × 0,99 = 10,60 e la lista vende, un giorno dopo. Operazioni: buy giorno 4 a 10,55, sell giorno 14 a 10,20, buy giorno 19 a 11,25. Valore finale 979,72 (-2,03%), come al punto 2 perché le operazioni sono le stesse.
4. **Aggiungere una regola in testa:** Rs («se volume sopra la media e prezzo sotto la media veloce allora sell»). La lista diventa Rs, R1, R2, D. Cambia solo il giorno 11 (da `hold` a `sell`). Operazioni: buy giorno 4 a 10,55, sell giorno 12 a 10,50, buy giorno 19 a 11,25. Valore finale 1008,53 (+0,85%).

Gli esempi coprono tre tipi di mutazione: cambiare una soglia (punti 1 e 2), sostituire un indicatore (punto 3), aggiungere una regola (punto 4). Un quarto tipo, spostare una regola, non è tra gli esempi: ha effetto solo se le regole si sovrappongono (6.4). I risultati dipendono dai 20 giorni inventati e non dicono quale mutazione sia «buona».

#### 6.5.3 Crossover: scambiare un blocco di regole

Il **crossover** prende due genitori e costruisce due figli; nelle liste si scambiano blocchi di regole (il default D resta in fondo a tutte le liste). Prendiamo:

- Genitore P1 = lista L1: `[R1 (buy), R2 (sell)]`, risultato 989,32.
- Genitore P2 = lista C1: `[Rs (sell), Rb (buy)]`, risultato 1051,71.

Taglio dopo la prima regola: F1 = `[R1 (buy), Rb (buy)]` (prima regola di P1, seconda di P2) e F2 = `[Rs (sell), R2 (sell)]` (prima di P2, seconda di P1).

| Individuo | Regole | Operazioni | Valore finale | Rendimento |
|---|---|---|---|---|
| P1 | R1 buy, R2 sell | buy 4, sell 13, buy 19 | 989,32 | -1,07% |
| P2 | Rs sell, Rb buy | buy 3, sell 12, buy 18 | 1051,71 | +5,17% |
| F1 | R1 buy, Rb buy | buy 3 (poi nessuna vendita) | 1106,80 | +10,68% |
| F2 | Rs sell, R2 sell | nessuna operazione | 1000,00 | 0,00% |

Entrambi i figli sono **degeneri**: F1 ha due regole di acquisto e nessuna di vendita, quindi compra al giorno 3 e tiene; F2 ha solo regole di vendita e non compra mai. Il rendimento alto di F1 non vale nulla (il prezzo sale in fondo; in una discesa non venderebbe mai). È il punto debole del crossover per le liste: le regole hanno senso solo rispetto alle altre. Servirebbero accorgimenti (scambiare regole in coppie compatibili, scartare i figli senza almeno una regola di acquisto e una di vendita) [ipotesi].

### 6.6 Cosa ricorda del passato

La lista **non ha memoria propria**: nessun contatore, nessuna variabile che sopravviva da un giorno all'altro. Tutta la memoria viene dagli **indicatori a monte**: la media lenta con `c = 0,2` «ricorda» i prezzi degli ultimi giorni, la media del volume i volumi passati.

Una lista come L1 non può quindi esprimere regole sul **tempo trascorso** o su **ciò che ha fatto prima**, per esempio «vendi se sono passati tre giorni dall'acquisto». Sul dataset: la lista L1 compra ogni giorno dal 3 al 7 (R1 è vera cinque giorni di fila). Una strategia che vende tre giorni dopo l'acquisto direbbe `buy` il giorno 3, `hold` il 4 e il 5, `sell` il 6; ma per la lista i giorni 3-7 sono indistinguibili (stesse condizioni, stessa regola, stessa risposta). Per distinguerli serve sapere da quanti giorni si è in posizione, e questo è uno stato.

Quella strategia, con un contatore (stesso acquisto di R1; vende al terzo giorno), fa: buy giorno 4 a 10,55, sell giorno 7 a 11,20, buy giorno 8 a 11,35, sell giorno 11 a 10,80, buy giorno 19 a 11,25; valore finale 1023,64 (+2,36%). Una lista che confronta solo indicatori come quelli dell'esempio non può riprodurla in modo generale. Una lista molto lunga, con soglie su misura per quei 20 giorni, potrebbe imitarla, ma avrebbe imparato a memoria quei giorni e non generalizzerebbe.

Tre strade: una **macchina a stati**, con lo stato «in posizione da un giorno», «da due giorni» e così via esplicito (capitolo 3); un **albero con registri** (capitolo 5); oppure un ingresso «giorni dall'acquisto» fornito dal motore (la terza via di 5.5.3-bis, lo stato del portafoglio fornito dal motore). Con questo ingresso G la lista diventa `[G ≥ 3 sell, R1 buy, D hold]` e sul dataset dà lo stesso 1023,64. Qui lo stato sta fuori dalla lista e lo porta il motore [ipotesi].

### 6.7 I learning classifier system: stili Michigan e Pittsburgh

Spostata nell'appendice, sezione «Learning classifier system (stili Michigan e Pittsburgh)»: una famiglia vicina (regole evolute con metodi genetici) che non è un candidato di questa guida.

### 6.8 Punti di forza e debolezze

**Quanto sa esprimere?** Regioni delimitate da confronti: ogni regola è una congiunzione di confronti e la lista dà una decisione a tratti nello spazio degli indicatori [ipotesi]. Rivest [8] tratta funzioni booleane su attributi vero/falso, non regioni di indicatori continui. Non fa somme pesate graduate né ragiona sul tempo trascorso.

**Quanto è grande lo spazio di ricerca?** Variabile. Nell'esempio il genoma è piccolo (due margini, tre indicatori, tre azioni, un ordine) ma cresce con regole e condizioni: 5 regole da 3 condizioni sono una quindicina di confronti, ognuno con indicatori, operatore e margine. Più è lunga, più può adattarsi al rumore (sovradattamento: andare bene sul passato e male sul futuro); limitarlo spetta alla ricerca sulla funzione di fitness (R5) e a quella sul protocollo di valutazione (R6) [conteggio dell'autore, ipotesi].

**Si capisce perché decide così?** Sì, molto: si legge come un regolamento («ha deciso `sell` perché R2 è scattata e R1 no»), finché la lista è corta; con cinquanta regole è leggibile solo in teoria [ipotesi]. Rischio da conoscere: l'**ombreggiamento**, cioè una regola che non scatta mai perché una precedente copre già i suoi casi (se in testa mettessimo «se prezzo > media allora hold», le regole che richiedono il prezzo sopra la media non scatterebbero mai).

**Quanto costa calcolarla?** Poco: una condizione per regola al giorno, poche decine di confronti in tutto [ipotesi].

**Si mescola e si muta bene?** La mutazione di una soglia è semplice. Il crossover è delicato: l'ordine conta e regole di genitori diversi possono non funzionare insieme (figli F1 e F2).

**Si adatta al nostro motore?** Quasi direttamente: vedi 6.9.

#### 6.8.1 Confronto con punteggio lineare e albero

Che cosa sa esprimere ciascuna forma. Il **punteggio lineare** è una somma pesata degli indicatori (`p1 × indicatore1 + p2 × indicatore2 + ...`) con due soglie: sopra la alta `buy`, sotto la bassa `sell`, in mezzo `hold`.

| Domanda | Punteggio lineare | Lista di regole | Albero (programmazione genetica) |
|---|---|---|---|
| Combina molti segnali deboli sommandoli? | Sì, è il suo mestiere | No (ogni confronto è vero o falso) | Sì, se ha nodi di somma |
| Esprime «X e Y insieme»? | No, una somma pesata non è una congiunzione | Sì, con «e» tra confronti | Sì |
| Esprime «prima controlla X, poi eventualmente Y»? | No | Sì, è la sua struttura | Sì, con nodi condizionali |
| Domande diverse sui due rami di una domanda? | No | No, un ramo termina subito | Sì |
| Numero di numeri del genoma | Fisso e piccolo (pesi e soglie) | Variabile | Variabile (anche molto) |
| Si legge il motivo di una decisione? | Sì, guardando i contributi dei pesi | Sì, guardando la regola che scatta | Sì se piccolo, meno se grande |
| Memoria del passato | Solo dagli indicatori | Solo dagli indicatori | Solo dagli indicatori, con registri, o con lo stato del portafoglio fornito dal motore |

Le prime righe sono fatti sulla struttura; le ultime tre riprendono le schede della rassegna, con valutazioni a tratti da `[ipotesi]`. Non è una classifica: ogni forma esprime cose che l'altra non esprime.

### 6.9 Come si integra nel nostro motore

La forma si integra quasi direttamente. Come etichetta (`labels`, lo stato che il motore mostra ogni giorno) c'è la **regola che scatta** (R1, R2 o D) o l'azione stessa. Servono `describe()` (i valori delle condizioni), `serialize()` (la lista si salva come JSON) e, per evolvere, `crossover` e `mutate`; `hold` è il non chiamare né `buy()` né `sell()`. Non c'è stato da azzerare oltre agli indicatori. Riferimenti al codice: appendice, sezione «Riferimenti al codice: capitoli 5 e 6».

### 6.10 Cosa dice la letteratura

- La lista di decisione è di Rivest [8] (letto in parte: abstract e definizione), che tratta funzioni booleane su attributi vero/falso; l'estensione a soglie su indicatori continui è un'ipotesi di questa guida.
- Sugli algoritmi evolutivi per le regole di trading la letteratura è ampia [7] (abstract); un precedente con combinazioni logiche su medie mobili è [6] (riassunto). Nessuna fonte letta tratta una lista di regole evoluta su un titolo come ENI: **non accertato**. I learning classifier system sono nell'appendice.

### 6.11 In breve

- Elenco ordinato di «se condizione allora azione»: vince la prima regola vera, l'ultima è un default. Senza stato; è un albero a pettine, più semplice e meno flessibile.
- Lista L1: 989,32 (-1,07%). Scambiare due regole sovrapposte cambia un giorno di decisione e due punti di risultato.
- Evolve su soglie, indicatori, azioni, ordine e numero di regole; il crossover può dare figli degeneri.
- Non esprime il tempo trascorso («vendi dopo tre giorni») con soli indicatori di prezzo e volume: serve una macchina a stati, dei registri o un ingresso del motore.
- Forza: leggibilità. Debolezze: lunghezza variabile, rischio di adattarsi al rumore, crossover delicato.

## 7. Le reti neurali piccole (MLP e NEAT)

*Numeri di esempio inventati: mostrano il meccanismo, non dicono nulla sulla qualità della forma.*

### 7.1 In una frase e un'analogia

Una rete neurale è una funzione fatta di tanti piccoli calcoli collegati tra loro: ogni calcolo somma alcuni numeri, ciascuno moltiplicato per un «peso», e ne fa passare il risultato attraverso una funzione che lo schiaccia in un intervallo fisso. I pesi sono i numeri che definiscono la rete, e sono ciò che l'algoritmo genetico fa evolvere.

**Analogia.** Pensa a un foglio di calcolo con tre colonne. La prima contiene i dati del giorno (gli ingressi). Ogni cella della seconda è una formula del tipo «0,3 volte la cella A, più 0,3 volte la cella B, più una costante», seguita da una funzione che limita il risultato. La terza combina allo stesso modo le celle della seconda e produce un solo numero. Le costanti sono i pesi: qui le sceglie l'evoluzione, tenendo i fogli con la fitness più alta (il «voto» dato a un genoma).

**Una precisazione.** Di solito le reti neurali si «addestrano» con la discesa del gradiente, che corregge i pesi un poco alla volta nella direzione che riduce l'errore. Qui non la usiamo: l'algoritmo genetico prova molte reti e ne ricava di nuove da quelle con la fitness migliore. Questo approccio si chiama **neuroevoluzione**. Che il gradiente sia il metodo usuale è conoscenza generale dell'autore **[ipotesi]**.

### 7.2 Come funziona

#### 7.2.1 Un neurone

Un neurone (artificiale) riceve alcuni numeri in ingresso e produce un numero in uscita, in tre passi: **moltiplica** ogni ingresso per il suo peso; **somma** i prodotti e aggiunge una costante, il **bias** (un peso che non si moltiplica per nessun ingresso); **applica una funzione di attivazione** al risultato.

```
somma  = w1*x1 + w2*x2 + w3*x3 + b
uscita = tanh(somma)
```

`x1, x2, x3` sono gli ingressi, `w1, w2, w3` i loro pesi, `b` il bias. `tanh` (tangente iperbolica) è la funzione di attivazione usata in tutto il capitolo: prende qualunque numero e lo schiaccia tra -1 e +1. Vicino a zero si comporta quasi come l'identità; lontano da zero si **satura**, cioè si avvicina a -1 o a +1 senza mai superarli.

| somma | tanh(somma) | lettura |
|---|---|---|
| -2 | -0,96 | molto negativa: quasi -1 |
| 0,5 | 0,46 | piccola: quasi invariata |
| 3 | 1,00 (0,995) | grande: quasi +1, e con 4 o con 40 il risultato è praticamente lo stesso |

La saturazione rende la rete diversa da una semplice somma pesata: dopo un certo punto, aumentare ancora l'ingresso non cambia più l'uscita (sezione 7.3.5).

#### 7.2.2 Un MLP (perceptron multistrato)

Un **MLP** (multilayer perceptron) mette i neuroni in strati. I neuroni dello **strato nascosto** leggono gli ingressi; il neurone dello **strato di uscita** legge le uscite dello strato nascosto. «Nascosto» significa solo che questi numeri non sono né dati né decisioni: sono valori intermedi.

```
            +--> h1 --+
 x1, x2, x3 |         +--> y --> soglie --> buy / hold / sell
 (ognuno a  +--> h2 --+
  entrambi)
```

Ogni ingresso è collegato a entrambi i neuroni nascosti (6 collegamenti, ciascuno con il suo peso) e ogni neurone nascosto all'uscita (altri 2). In formule:

```
h = tanh( W1 * x + b1 )       (strato nascosto)
y = W2 * h + b2               (uscita: un punteggio)
```

`W1` è una piccola tabella di pesi (qui 2 righe, una per neurone nascosto, e 3 colonne, una per ingresso), `b1` raccoglie i loro bias; `W2` e `b2` fanno lo stesso dallo strato nascosto all'uscita. Nell'uscita non c'è `tanh`: `y` resta una somma pesata dei neuroni nascosti. L'esempio della sezione 7.3 è:

```
h1 = tanh( 0,3*x1 + 0,3*x2 + 0*x3 + 0 )
h2 = tanh( 1,0*x1 + 0*x2 + 6*x3 - 5,2 )
y  = 1,5*h1 - 1,0*h2 - 1,0
```

**Dall'uscita alle tre azioni.** Il punteggio `y` è un numero continuo; due soglie lo trasformano in un'azione:

```
buy   se y >  0,5
sell  se y < -0,5
hold  altrimenti
```

Le soglie sono parte della forma: qui sono fisse (±0,5), ma potrebbero evolvere, e allora sarebbero due numeri in più nel genoma. Un'alternativa è una rete con **tre uscite**, una per azione, scegliendo la più alta: è più comoda da leggere («la rete vuole comprare») ma ha più pesi. L'esempio ha una sola uscita; la rete a tre uscite compare solo nel conteggio dei pesi (sezione 7.7).

### 7.3 Esempio applicato al dataset giocattolo

#### 7.3.1 Gli ingressi

I tre ingressi sono quelli definiti nella sezione 1.3.6, con la media lenta (EMA con `c` = 0,2, vedi 1.3.2) e la veloce (`c` = 0,5) sul prezzo, e la media lenta (`c` = 0,2) sul volume:

- `x1`: distanza percentuale del prezzo dalla media lenta;
- `x2`: distanza percentuale della media veloce dalla lenta (positiva se il prezzo sta salendo da qualche giorno);
- `x3`: scarto del volume dalla sua media lenta, in frazione (0 in un giorno normale, 0,30 con il 30 per cento di scambi in più del solito).

I loro valori giorno per giorno sono nella tabella della sezione 7.3.4 (arrotondati a due decimali; i calcoli interni usano i numeri non arrotondati).

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

**Che cosa fanno davvero i due neuroni.** I pesi sono stati scelti a mano, e una rete evoluta non avrebbe neuroni con un significato dichiarato. Si può però leggere dalla tabella 7.3.4 che cosa fanno questi due sui 20 giorni.

- `h1` = tanh(0,3 `x1` + 0,3 `x2`) è positivo quando il prezzo sta sopra la media lenta e la veloce sopra la lenta, negativo nel caso opposto. In pratica segue il rialzo o il ribasso, e resta tra 0,98 e 0,99 dal giorno 5 al 9.
- `h2` = tanh(`x1` + 6 `x3` - 5,2) è positivo quando `x1` + 6 `x3` supera 5,2. Con volume normale (`x3` vicino a 0) serve `x1` sopra 5,2: succede nei giorni 6, 7 e 8 (`x1` = 5,39; 5,76; 5,66), anche con `x3` = 0,20 e -0,01 nei giorni 7 e 8. Con volume alto, 6 `x3` vale circa 2 e basta `x1` intorno a 3,4: è ciò che succede nei giorni 4 e 5. Quindi `h2` dice «il prezzo è già molto sopra la sua media lenta», e un volume alto abbassa la soglia. Non è un «e» tra prezzo alto e volume alto.

L'uscita `y` = 1,5 `h1` - `h2` - 1 compra quando `h1` è alto e `h2` è ancora vicino a -1: rialzo avviato, ma prezzo non lontano dalla media (giorno 3, e di nuovo i giorni 9 e 10 e 17-20). Se `h2` si attiva (prezzo molto sopra la media) toglie spinta e la decisione resta `hold` (giorni 4-8). Vende quando `h1` è molto negativo (giorni 12-15). È una lettura **a posteriori**, fatta per capire l'esempio.

#### 7.3.3 Calcolo dettagliato per tre giorni

**Giorno 3.** Ingressi: `x1` = 2,22, `x2` = 0,98, `x3` = 0,14.

```
somma di h1 = 0,3*2,2231 + 0,3*0,9825 + 0*0,1364 + 0     =  0,9617
h1          = tanh( 0,9617 )                              =  0,7450
somma di h2 = 1,0*2,2231 + 0*0,9825 + 6*0,1364 - 5,2      = -2,1587
h2          = tanh( -2,1587 )                             = -0,9737
y           = 1,5*0,7450 - 1,0*(-0,9737) - 1,0            =  1,0912
```

La tendenza è positiva (`h1` = 0,75); `h2` è vicino a -1, il suo peso negativo trasforma il -0,97 in un +0,97 che si somma. `y` = 1,09 supera 0,5: **buy**.

**Giorno 6.** Ingressi: `x1` = 5,39, `x2` = 3,39, `x3` = 0,33.

```
somma di h1 = 0,3*5,3911 + 0,3*3,3851 + 0*0,3346 + 0      =  2,6329
h1          = tanh( 2,6329 )                              =  0,9897
somma di h2 = 1,0*5,3911 + 0*3,3851 + 6*0,3346 - 5,2      =  2,1990
h2          = tanh( 2,1990 )                              =  0,9757
y           = 1,5*0,9897 - 1,0*0,9757 - 1,0               = -0,4911
```

La tendenza è fortissima (`h1` = 0,99), ma il prezzo è molto sopra la media lenta: `h2` scatta (0,98) e sottrae. `y` = -0,49 sta appena sopra -0,5: **hold**. Con volume normale (`x3` = 0) `y` sarebbe 0,30: sempre `hold`.

**Giorno 12.** Ingressi: `x1` = -2,83, `x2` = -0,59, `x3` = 0,36.

```
somma di h1 = 0,3*(-2,8299) + 0,3*(-0,5900) + 0*0,3640 + 0 = -1,0260
h1          = tanh( -1,0260 )                              = -0,7723
somma di h2 = 1,0*(-2,8299) + 0*(-0,5900) + 6*0,3640 - 5,2 = -5,8460
h2          = tanh( -5,8460 )                              = -1,0000
y           = 1,5*(-0,7723) - 1,0*(-1,0000) - 1,0          = -1,1584
```

Il prezzo scende da giorni, `h1` è negativo; il volume è alto (`x3` = 0,36, quasi come il giorno 6) ma `h2` resta a -1 perché il prezzo non è alto. `y` = -1,16 sta sotto -0,5: **sell**.

#### 7.3.4 Tutti i 20 giorni e il risultato col valutatore

Le colonne «somma» sono i valori prima di `tanh`; `h1` e `h2` quelli dopo.

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

Applicando le decisioni al valutatore comune (sezione 1.2.1: decisione eseguita il giorno dopo, tutto il denaro, nessun costo):

| Operazione | Giorno di esecuzione | Prezzo |
|---|---|---|
| buy | 4 | 10,55 |
| sell | 13 | 10,30 |
| buy | 18 | 11,05 |

Valore finale 1007,23 su 1000 (+0,72 per cento); riferimento buy&hold: 1128,71 (+12,87 per cento). I pesi sono scelti a mano e non evoluti.

**Che cosa si vede.** I giorni 9 e 10 danno `buy`, ma la posizione è già aperta dal giorno 4 e il valutatore li ignora; la prima operazione nasce dalla decisione del giorno 3. Dal giorno 12 al 15 `y` è sotto -0,5: il valutatore vende il giorno 13 e le vendite successive non fanno altro. **Che cosa ricorda:** nulla da sola. Tutta la memoria sta nelle medie mobili che producono `x1, x2, x3` (la lenta ricorda circa 1/0,2 = 5 giorni, la veloce circa 2): è la variante «in avanti» della sezione 7.6.

#### 7.3.5 Perché una rete può fare ciò che un punteggio lineare non fa

Il **punteggio lineare** (capitolo 4) calcola `s = w1*x1 + w2*x2 + w3*x3 + b` e applica le soglie. Lì **ogni ingresso contribuisce sempre allo stesso modo**: aumentare `x3` di una quantità fissa sposta `s` della stessa quantità, qualunque siano `x1` e `x2`. Con un punteggio lineare i giorni a «prezzo alto» e quelli a «prezzo basso» hanno la stessa sensibilità al volume.

Nella nostra rete no. I giorni 6 e 12 hanno un volume simile (`x3` = 0,33 e 0,36). Si confronti `y` con volume normale (`x3` = 0) e con il volume reale:

| Giorno | y con x3 = 0 | y con x3 reale | Effetto del volume alto su y |
|---|---|---|---|
| 6 (prezzo alto, in salita) | 0,30 | -0,49 | -0,79 |
| 12 (prezzo basso, in discesa) | -1,16 | -1,16 | 0,00 |

Nella colonna da guardare c'è lo spostamento di `y`, non la decisione. Lo stesso volume alto sposta `y` di -0,79 quando il prezzo è già molto sopra la media e di 0,00 quando è sotto, dove `h2` è già saturo a -1: il volume conta solo vicino alla zona in cui `h2` può attivarsi. Un punteggio lineare dovrebbe spostare `s` della stessa quantità nei due giorni. È lo stesso motivo per cui un solo neurone senza strato nascosto non può calcolare lo XOR (vero se uno solo dei due ingressi è vero) **[ipotesi]**.

Un secondo effetto è la **saturazione**. Tra i giorni 6 e 7 la somma di `h1` sale da 2,63 a 2,88, ma `h1` resta 0,99 in entrambi: la rete dice «già al massimo», un punteggio lineare continuerebbe a crescere. In generale, somme pesate e schiacciamenti possono rappresentare confini curvi e interazioni tra ingressi, mentre un punteggio lineare separa «buy» da «non buy» solo con una retta (un piano, con più ingressi).

Un MLP con almeno uno strato nascosto e un'attivazione di questo tipo può approssimare funzioni continue qualsiasi, se ha abbastanza neuroni [9]. È una proprietà teorica: non dice che l'algoritmo genetico trovi i pesi giusti, né quanti neuroni servano.

### 7.4 NEAT: far evolvere anche la struttura

#### 7.4.1 L'idea

In un MLP la struttura (3 ingressi, 2 neuroni nascosti, 1 uscita) è decisa da chi progetta: evolvono solo i pesi. Con **NEAT** (NeuroEvolution of Augmenting Topologies) evolvono insieme i pesi e la **topologia**, cioè quali neuroni esistono e quali collegamenti li uniscono [1]. Si parte da una rete minima, senza neuroni nascosti, e le mutazioni possono **aggiungere un collegamento** o **aggiungere un neurone** spezzando un collegamento esistente [1]. Se la complessità non serve, la selezione la elimina; se serve, la rete la tiene.

Una rete NEAT senza neuroni nascosti, con i tre ingressi collegati direttamente all'uscita, è esattamente un punteggio lineare: NEAT parte da lì e può crescere verso forme più ricche.

#### 7.4.2 Un esempio disegnato, prima e dopo

Il genoma di NEAT è un elenco di **geni di connessione**: ciascuno dice da quale nodo a quale nodo va il collegamento, con quale peso, se è attivo, e porta un **numero di innovazione**, un'etichetta assegnata la prima volta che quel collegamento compare e che non cambia più. Nei disegni, `i1, i2, i3` sono gli ingressi `x1, x2, x3` e `o` l'uscita lineare.

**Rete 0 (minima)**, tre connessioni:

```
      i1 ---(0,20)---+
      i2 ---(0,10)---+--> o        y = 0,20*x1 + 0,10*x2 - 0,30*x3
      i3 --(-0,30)---+
```

**Dopo l'aggiunta di un neurone `n` sul collegamento 1.** NEAT disattiva il collegamento 1 e ne crea due: da `i1` a `n` con peso 1,0, e da `n` a `o` con il peso del collegamento spezzato (0,20) [1]. Il neurone nuovo cambia un poco la funzione, ma non la sconvolge [1].

```
      i1 ---(1,00)--> [ n ] ---(0,20)--+
      i2 ---------------(0,10)---------+--> o
      i3 ---------------(-0,30)--------+
      (il collegamento 1, i1 --> o, resta nel genoma ma disattivato)
```

Le tabelle dei geni, i valori di `y` prima e dopo la mutazione e una seconda mutazione sono nell'appendice, sezione «NEAT in dettaglio».

#### 7.4.3 Il problema dei «genitori incompatibili»

Il crossover (un figlio che mescola due genitori) è facile con i pesi di un MLP di forma fissa. C'è però un problema noto, le **competing conventions** («convenzioni concorrenti») [1]: due reti possono calcolare **esattamente la stessa funzione** con i neuroni nascosti scritti in ordine diverso.

Nel nostro esempio: la rete N1 ha `h1` in prima posizione e `h2` in seconda; la rete N1' è la stessa con le due posizioni scambiate (e i pesi di uscita scambiati di conseguenza, -1,0 e 1,5). N1 e N1' prendono le stesse identiche decisioni sul dataset (+0,72 per cento).

Un crossover ingenuo, che prende la prima riga da N1 e la seconda da N1', ottiene due volte lo stesso neurone `h1` e perde `h2`. Con i pesi di uscita di N1 (1,5 e -1,0) l'uscita diventa `y = 0,5*h1 - 1`, sempre sotto circa -0,5: il figlio risponde `sell` tutti i giorni e il valutatore non apre nessuna operazione (1000,00). Due genitori che prendono le stesse decisioni producono un figlio inutile solo perché i loro neuroni sono in ordine diverso.

**Come lo affronta NEAT.** Ogni connessione porta il suo numero di innovazione; al crossover si mescolano le connessioni che hanno lo stesso numero, quindi la stessa connessione, anche se la rete intorno è diversa. Il costo è molto codice in più. Il meccanismo completo (geni corrispondenti, disgiunti e in eccesso, speciazione, geni disattivati) è nell'appendice, sezione «NEAT in dettaglio».

#### 7.4.4 Esempio di crossover NEAT con i numeri

Spostato nell'appendice, sezione «NEAT in dettaglio» (un crossover con sette numeri di innovazione, le operazioni del figlio e una mutazione di un peso).

### 7.5 Come evolve la rete: pesi, mutazione e crossover

Nell'MLP di esempio i geni sono gli 11 pesi (e, se si evolvono, le due soglie); la forma è fissa. In NEAT i geni sono i geni di nodo e di connessione, con numero di innovazione, e la forma cambia.

**Mutazione sull'MLP.** Si porta il bias di `h2` da -5,2 a -3,2, quindi `h2` scatta più facilmente. Cambiano le decisioni dei giorni 3, 4-7, 9 e 18-20: il giorno 3 passa da `buy` a `hold` (`y` = 0,27), i giorni 18-20 da `buy` a `hold`, i giorni 4-7 e 9 cambiano senza effetto sul valutatore. Le operazioni diventano: acquisto a 10,80 (giorno 11), vendita a 10,30 (giorno 13), acquisto a 11,05 (giorno 18); valore finale 983,91 (-1,61 per cento). Una mutazione piccola cambia molte decisioni e cambia l'esito.

**Una mutazione senza effetto sull'esito.** Portando il peso di `x3` in `h2` da 6,0 a 4,0 cambia una sola decisione: il giorno 4 passa da `hold` a `buy` (`y` da 0,03 a 0,63). La posizione è già aperta, quindi il valutatore la ignora e l'esito resta 1007,23. È una **mutazione neutra**: cambia la decisione ma non l'esito, quindi il numero di decisioni diverse non dice da solo quanto due genomi differiscano.

**Crossover sull'MLP.** Due genitori: N1 (la rete della sezione 7.3) e N2 con pesi diversi.

| Parte | N1 | N2 |
|---|---|---|
| h1 (x1, x2, x3, bias) | 0,3; 0,3; 0; 0 | 0,5; 0,1; 0; 0,2 |
| h2 (x1, x2, x3, bias) | 1,0; 0; 6,0; -5,2 | 0,8; 0; 5,0; -4,0 |
| Uscita (h1, h2, bias) | 1,5; -1,0; -1,0 | 1,0; -0,6; -0,4 |

Il figlio prende da N1 la riga di `h1` e il peso di `h1` in uscita (1,5), da N2 la riga di `h2`, il peso di `h2` in uscita (-0,6) e il bias di uscita (-0,4). Sul dataset il figlio compra al giorno 3 (10,30), vende al 13 (10,30) e ricompra al 18 (11,05): valore finale 1031,67. Ha le stesse operazioni di N2, con decisioni giornaliere diverse (i giorni 4-8 sono `buy`, per N2 `hold`). Il crossover tra neuroni di posizioni corrispondenti funziona qui perché N1 e N2 hanno lo stesso ordine dei neuroni; con N1' sarebbe fallito (sezione 7.4.3).

### 7.6 Cosa ricorda del passato: ricorrenze e memoria interna (domanda aperta)

#### 7.6.1 Due varianti

Finora la rete è **in avanti** (feedforward): i dati scorrono dagli ingressi verso l'uscita e l'uscita dipende solo dagli ingressi di quel giorno. Se domani il motore desse alla rete gli stessi tre numeri, avrebbe la stessa risposta, qualunque cosa fosse successa prima.

Una **connessione ricorrente** fa tornare il valore di un neurone come ingresso dello stesso neurone (o di un altro) **il giorno dopo**. La rete ha così una memoria **sua**: i valori dei neuroni del giorno precedente sono informazione che non passa dagli indicatori. NEAT ammette di natura le ricorrenze: [1] dichiara che con esse la memoria è facilmente rappresentata.

| | Rete in avanti | Rete ricorrente |
|---|---|---|
| Da dove viene la memoria | Solo dagli indicatori calcolati a monte | Dagli indicatori e dallo stato interno della rete |
| Stesso ingresso, stessa uscita? | Sì | No: dipende dai giorni precedenti |
| `reset()` (riporta la strategia al giorno zero) | Non fa nulla sulla rete | Deve azzerare i valori dei neuroni |
| Leggibilità | Bassa, ma la rete è una funzione | Più bassa: occorre seguire i giorni uno dopo l'altro |

«Feedforward» e «ricorrente» sono **due scelte di progetto**, non due forme diverse: la stessa rete può essere usata in entrambi i modi.

#### 7.6.2 Un esempio: un neurone che si ricorda dei giorni passati

Prendiamo un neurone `r` che guarda soltanto lo scarto del volume `x3` e ha un collegamento a sé stesso:

```
r[t] = tanh( u[t] + w * r[t-1] )     con  u[t] = 5*(x3[t] - 0,15)
```

`u[t]` è un ingresso che diventa positivo quando il volume sta più del 15 per cento sopra la media; `w` è il peso del collegamento a sé stesso e `r[t-1]` il valore del giorno prima. Al giorno 1 si parte da `r[0]` = 0 (stato azzerato). Con `w` = 0 il neurone non ricorda nulla: legge solo il volume di oggi.

**Il ponte con la media mobile esponenziale.** Se si toglie `tanh`, il neurone calcola `r[t] = u[t] + w*r[t-1]`. La EMA del capitolo 1 (sezione 1.3.2) è `e[t] = (1-c)*e[t-1] + c*u[t]`. Con `w` = 1 - c le due formule sono la stessa, a meno di un fattore di scala: moltiplicando la EMA per 1/c si ottiene esattamente `r`. Con `w` = 0,8 (cioè `c` = 0,2, memoria di circa 5 giorni):

| Giorno | u | r senza tanh, w = 0,8 | (1/c) * EMA di u, c = 0,2 | r con tanh, w = 0,8 |
|---|---|---|---|---|
| 1 | -0,75 | -0,75 | -0,75 | -0,64 |
| 2 | -0,36 | -0,96 | -0,96 | -0,70 |
| 3 | -0,07 | -0,83 | -0,83 | -0,56 |
| 4 | 0,80 | 0,13 | 0,13 | 0,34 |
| 5 | 0,72 | 0,83 | 0,83 | 0,76 |
| 6 | 0,92 | 1,59 | 1,59 | 0,91 |
| 7 | 0,24 | 1,51 | 1,51 | 0,75 |
| 8 | -0,80 | 0,40 | 0,40 | -0,20 |

Le due colonne centrali coincidono in tutti i 20 giorni (la EMA parte da zero come il neurone, non dal primo dato). Quindi **un neurone ricorrente è una media mobile esponenziale che la rete impara**: il peso `w` fa il ruolo di `1 - c`, e quando l'evoluzione cambia `w` cambia la lunghezza della memoria, invece di fissarla a mano come si fa con `c`. Le differenze sono due: `tanh` limita il risultato tra -1 e +1 (ultima colonna), e un `w` maggiore di 1 non corrisponde a nessuna EMA (il passato verrebbe amplificato, non attenuato; solo `tanh` impedisce che il valore esploda).

Il calcolo del giorno 5 con `w` = 0,8: `r[4]` = 0,34, quindi `r[5]` = tanh(0,72 + 0,8*0,34) = tanh(0,99) = 0,76.

La stessa cosa su tutti i 20 giorni, con `w` = 0, 0,8 e 1,6:

| Giorno | x3 | u | r, w = 0 (nessuna memoria) | r, w = 0,8 | r, w = 1,6 |
|---|---|---|---|---|---|
| 1 | 0,00 | -0,75 | -0,64 | -0,64 | -0,64 |
| 2 | 0,08 | -0,36 | -0,34 | -0,70 | -0,88 |
| 3 | 0,14 | -0,07 | -0,07 | -0,56 | -0,90 |
| 4 | 0,31 | 0,80 | 0,66 | 0,34 | -0,56 |
| 5 | 0,29 | 0,72 | 0,62 | 0,76 | -0,18 |
| 6 | 0,33 | 0,92 | 0,73 | 0,91 | 0,56 |
| 7 | 0,20 | 0,24 | 0,24 | 0,75 | 0,82 |
| 8 | -0,01 | -0,80 | -0,67 | -0,20 | 0,46 |
| 9 | -0,13 | -1,38 | -0,88 | -0,91 | -0,56 |
| 10 | -0,04 | -0,96 | -0,75 | -0,93 | -0,95 |
| 11 | 0,30 | 0,73 | 0,62 | -0,02 | -0,66 |
| 12 | 0,36 | 1,07 | 0,79 | 0,78 | 0,01 |
| 13 | 0,18 | 0,17 | 0,16 | 0,66 | 0,18 |
| 14 | -0,09 | -1,21 | -0,84 | -0,59 | -0,73 |
| 15 | -0,23 | -1,91 | -0,96 | -0,98 | -1,00 |
| 16 | -0,14 | -1,44 | -0,89 | -0,98 | -1,00 |
| 17 | -0,01 | -0,78 | -0,65 | -0,91 | -0,98 |
| 18 | 0,10 | -0,25 | -0,25 | -0,75 | -0,95 |
| 19 | 0,03 | -0,61 | -0,55 | -0,84 | -0,97 |
| 20 | -0,08 | -1,16 | -0,82 | -0,95 | -0,99 |

**Che cosa si vede.**

- Giorni 4-7, volume alto e poi appena sopra la norma. Con `w` = 0 il neurone segue il volume del giorno (0,66; 0,62; 0,73; poi 0,24). Con `w` = 0,8 parte più piano (0,34) ma sale (0,76; 0,91) e il giorno 7 resta a 0,75: «si ricorda» dei giorni a volume alto.
- Giorni 11-13, un nuovo episodio di volume alto. Il giorno 11 il neurone con memoria vale -0,02 (esce da giorni a volume basso) e senza memoria 0,62; il giorno 13 vale 0,66 con memoria e 0,16 senza. La memoria **ritarda** la risposta al primo giorno di un episodio e **prolunga** quella dopo la fine.
- Stato iniziale. Se il neurone partisse da 0,9 invece che da 0, con `w` = 0,8 i valori coinciderebbero con quelli della tabella già dal giorno 7 (a due decimali): l'errore di partenza si dimentica, come in una EMA. Per questo il reset deve azzerare lo stato.
- Con `w` = 1,6 il neurone è guidato più dal proprio passato che dai dati (giorno 9: con ingresso -1,38 vale -0,56, con `w` = 0,8 vale -0,91). Pesi ricorrenti grandi rendono la risposta lenta e possono dare dinamiche instabili [ipotesi].

#### 7.6.3 La rete intera con una ricorrenza

Si rifà la rete della sezione 7.3 con un solo cambiamento: il neurone `h2` somma anche 0,8 volte il suo valore del giorno prima (stato iniziale 0). Gli altri pesi non cambiano.

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

Rispetto alla rete in avanti le decisioni cambiano in due giorni. Il giorno 4 diventa `buy`: `h2` ricorda i giorni precedenti a prezzo non ancora alto (-0,38 invece di +0,37). Il giorno 6 diventa `sell` per un soffio: `y` = -0,509, appena sotto la soglia (nella tabella arrotondata -0,51), mentre il giorno 7 vale -0,497 (arrotondato -0,50) e resta `hold`. Operazioni: buy a 10,55 (giorno 4), sell a 11,20 (giorno 7), buy a 11,10 (giorno 10), sell a 10,30 (giorno 13), buy a 11,05 (giorno 18); valore finale 1016,30 (+1,63 per cento). Il valore dipende dai pesi scelti a mano per l'esempio, e ha senso solo come descrizione di questa rete.

#### 7.6.4 Che cosa si guadagna e che cosa si perde

**Si guadagna** una memoria su misura: la rete può costruire da sola una persistenza che gli indicatori non offrono, con la durata decisa da `w` (sezione 7.6.2).

**Si perde** in leggibilità e in controllo: per capire una decisione occorre ripercorrere tutti i giorni precedenti, e lo **stato nascosto** (i valori dei neuroni che il motore non vede) va azzerato a ogni nuovo giorno zero. Una mutazione di un peso ricorrente cambia il comportamento su tutti i giorni successivi: per l'algoritmo genetico il paesaggio da esplorare è meno regolare [ipotesi].

#### 7.6.5 La domanda a chi decide

La domanda 2 della rassegna, in forma semplice, riferita alla rete (la domanda 1 ha già ammesso le reti ricorrenti tra le forme da valutare: qui si chiede se, nella rete scelta, la ricorrenza si usi):

> **La rete deve poter avere una memoria sua, oltre a quella delle medie mobili?**
>
> - **No:** la rete legge i soli indicatori del giorno. È più semplice da testare e da azzerare; la memoria dipende dagli indicatori scelti (ricerca sugli indicatori, R2).
> - **Sì:** la rete può ricordare i giorni passati con i propri neuroni. Ha più possibilità, ma è più difficile da leggere e da far evolvere.

La scelta non è del capitolo: dipende da quanto peso si dà alla leggibilità rispetto alla flessibilità (domanda 3).

#### 7.6.6 Nota di contrasto: reservoir computing

Spostata nell'appendice, sezione «Reservoir computing»: una rete ricorrente con pesi casuali e fissi di cui si addestra solo l'ultimo strato [17]. Non è una forma candidata.

### 7.7 Punti di forza e debolezze

#### 7.7.1 Domande e risposte

**Quanto sa esprimere?** Molto. Un MLP con uno strato nascosto sufficiente approssima funzioni continue qualsiasi [9]. Nel dataset: un effetto che dipende da un altro ingresso e una saturazione, impossibili per un punteggio lineare (sezione 7.3.5).

**Quanto è grande lo spazio di ricerca?** Si contano i pesi: ingressi per neuroni nascosti, più i bias nascosti, più nascosti per uscite, più i bias di uscita.

| Rete | Calcolo | Pesi |
|---|---|---|
| Esempio di questo capitolo (3 ingressi, 2 nascosti, 1 uscita) | 3*2 + 2 + 2*1 + 1 | 11 |
| Rete della rassegna (6 ingressi, 4 nascosti, 3 uscite) | 6*4 + 4 + 4*3 + 3 | 43 |
| 6 ingressi, 8 nascosti, 3 uscite | 6*8 + 8 + 8*3 + 3 | 83 |
| 6 ingressi, 16 nascosti, 3 uscite | 6*16 + 16 + 16*3 + 3 | 163 |
| NEAT di partenza (6 ingressi diretti a 1 uscita) | 6 + 1 | 7, ma poi cresce |

Per confronto, il punteggio lineare con 6 ingressi ha 9 numeri (6 pesi, un bias, 2 soglie). Una rete di 43 pesi, su 2517 giorni di un solo titolo, ha molta libertà di adattarsi anche al rumore: è il **sovradattamento** (sezione 2.6) [ipotesi]. Come limitare il rischio è materia della ricerca sul protocollo di valutazione (R6), e la validazione su dati tenuti fuori da sola non basta quando si provano molte configurazioni [4]. In NEAT lo spazio è grande per costruzione (struttura e pesi), anche se la crescita è graduale [1].

**Si capisce perché decide così?** Poco. In una rete evoluta un neurone nascosto è una miscela di ingressi senza un significato dichiarato (quello letto nella sezione 7.3.2 è una lettura a posteriori). Per spiegare una decisione bisogna rifare il calcolo del giorno, come in 7.3.3, e anche così si ha un calcolo, non una «ragione». Con una ricorrenza occorre seguire tutti i giorni precedenti. Tra le forme presentate è la meno leggibile [ipotesi].

**Quanto costa calcolarla?** Poco: l'esempio ha circa 8 prodotti, 8 somme e 2 `tanh` per giorno, la rete da 43 pesi circa 36 prodotti, 43 somme e 4 `tanh` (conteggi a mano dell'autore, non misure). Su 2517 giorni è trascurabile; il costo vero è il numero di reti da valutare in ogni generazione [ipotesi].

**Si mescola e si muta bene?** La mutazione sì: perturbare un peso dà un cambiamento piccolo dell'uscita. Il crossover è delicato: le convenzioni concorrenti lo rendono distruttivo (sezione 7.4.3); NEAT lo risolve con i numeri di innovazione, con più codice da scrivere [1].

**Si adatta al nostro motore?** Con adattamenti (sezione 7.8).

#### 7.7.2 Etichette (`labels`)

Il contratto di strategia richiede una lista finita di etichette (gli «stati» da mostrare); per la rete si usano le tre fasce delle soglie dell'azione (`sell`, `hold`, `buy`). Ragionamento completo nell'appendice, sezione «Etichette (`labels`) della rete, del fuzzy e dell'HMM».

### 7.8 Come si integra nel nostro motore

Ogni giorno il motore dà alla rete i dati (prezzo, volume e gli indicatori scelti dalla ricerca sugli indicatori, R2), la rete calcola `y`, le soglie lo trasformano in `buy`, `sell` o `hold`, e il motore esegue l'ordine il giorno dopo.

- **In avanti.** Si scrivono il calcolo degli indicatori (le medie mobili) e la decisione (rete più soglie) in una classe che estende la base delle strategie del motore; il reset azzera solo le medie.
- **Ricorrente.** In più, la classe tiene i valori dei neuroni del giorno prima, e il reset deve riportarli allo stato iniziale, come per le medie mobili del genoma attuale.
- **Descrizione e salvataggio.** `describe()` può esporre `y` e le uscite dei neuroni nascosti; `serialize()` salva i pesi e le soglie come JSON (per NEAT, i geni di nodo e di connessione con i numeri di innovazione).
- **Crossover e mutazione.** Il motore genetico di Consilium li chiama, quindi vanno scritti. Per l'MLP sono semplici (con i limiti della sezione 7.4.3); per NEAT sono la parte più lunga da realizzare e non esistono nel codice attuale [ipotesi].
- **Parte che si adatta meno bene.** La mancanza di etichette naturali (7.7.2) e, per NEAT, la struttura del genoma, che non è un vettore di numeri di lunghezza fissa come quello dei genomi attuali.

I file e le righe di codice citati sono elencati nell'appendice, sezione «Riferimenti al codice: capitoli 7, 8 e 9».

### 7.9 Cosa dice la letteratura

- **NEAT.** Stanley e Miikkulainen (2002) descrivono NEAT: numeri di innovazione contro le convenzioni concorrenti, speciazione per proteggere le innovazioni, topologia che cresce da reti minime [1]. Letto per le parti citate; gli esperimenti sono su problemi di controllo, non sul trading.
- **Espressività degli MLP.** Hornik, Stinchcombe e White (1989): reti in avanti con uno strato nascosto approssimano funzioni continue qualsiasi, con abbastanza neuroni [9]. È un risultato di esistenza, non una promessa di apprendimento.
- **Neuroevoluzione nel trading.** Nessuna fonte letta sull'uso di NEAT o di reti ricorrenti con un algoritmo genetico per strategie di trading azionario: non accertato. Hu e altri [7] segnalano una forte concentrazione di studi su algoritmi genetici e programmazione genetica per regole di trading (letto l'abstract), non sulle reti.
- **Sovradattamento.** [4]: con molti tentativi la sola validazione su dati tenuti fuori non basta, in particolare per forme con molti parametri.

### 7.10 In breve

- Una rete è una catena di somme pesate e di schiacciamenti (`tanh`); i pesi sono i geni, e l'evoluzione li cambia senza discesa del gradiente.
- Può esprimere ciò che un punteggio lineare non può (effetti che dipendono da un altro ingresso, saturazione): nell'esempio, lo stesso volume alto sposta `y` di -0,79 nel giorno 6 e di 0,00 nel giorno 12.
- Costa molti pesi (11 nell'esempio piccolo, 43 in una rete da 6 ingressi e 4 neuroni nascosti), leggibilità minima e un crossover delicato (convenzioni concorrenti).
- NEAT fa crescere anche la struttura e risolve i genitori incompatibili con i numeri di innovazione, ma è più complesso da realizzare.
- Un neurone ricorrente è una media mobile esponenziale imparata: la rete impara quanto ricordare. Domanda aperta per chi decide: la rete può avere una memoria sua oltre a quella degli indicatori? La risposta cambia leggibilità, azzeramento e difficoltà di evoluzione; il capitolo non sceglie.

## 8. La logica fuzzy

*Numeri di esempio inventati: mostrano il meccanismo, non dicono nulla sulla qualità della forma.*

Questo capitolo spiega una possibile forma per il genoma: un sistema a regole in logica fuzzy («logica sfumata»). Non occorre conoscerla: si parte da zero.

### 8.1 In una frase e un'analogia

**In una frase.** La logica fuzzy sostituisce il «sì o no» con un «quanto»: invece di dire «il prezzo è alto: sì o no», si dice «il prezzo è alto al 70%», e le regole del tipo «se il prezzo è alto e il volume è basso allora aspetta» lavorano con questi gradi.

**Analogia.** Si chiede a una persona «fa caldo?». Una risposta da programmatore sarebbe `temperatura > 25`: a 25,1 gradi sì, a 24,9 no, anche se la differenza è impercettibile. Una persona risponde «un po'» a 22 gradi, «abbastanza» a 25, «molto» a 30. Il **grado di appartenenza** è questo «quanto»: un numero tra 0 (per niente) e 1 (del tutto), senza salti.

Termini che servono subito:

- **Insieme fuzzy** (o valore linguistico): per esempio «alta», per la distanza del prezzo dalla media, definito da una **funzione di appartenenza** che a ogni numero (per esempio 2,2%) associa un grado (per esempio 0,74).
- **Fuzzificazione:** il passaggio da un numero ai gradi di appartenenza. **Defuzzificazione:** il passaggio inverso, da più gradi a un solo numero.

Una parola da non confondere: «media» indica in tutto il capitolo la media mobile (come nel capitolo 1); l'insieme fuzzy di mezzo si chiama **intermedia**.

### 8.2 Come funziona

Un sistema fuzzy a regole ha cinque passaggi. Si descrivono uno alla volta, con numeri.

#### 8.2.1 Gli ingressi: indicatori già noti

Il sistema non guarda i prezzi grezzi: riceve **indicatori**, numeri calcolati dai prezzi e dai volumi passati. Nell'esempio sono due, definiti nella sezione 1.3.6 e calcolati con una media mobile esponenziale lenta (EMA con `c` = 0,2, vedi 1.3.2) sul prezzo e sul volume:

- **D**, la distanza percentuale del prezzo dalla media lenta: `D = (prezzo - EMA del prezzo) / EMA del prezzo * 100`. È l'ingresso `x1` degli altri capitoli. Positivo vuol dire prezzo sopra la sua media, negativo sotto. Il giorno 2: `(10,10 - 10,02) / 10,02 * 100 = 0,80`.
- **R**, il rapporto del volume con la sua media: `R = volume / EMA del volume`. Sopra 1 vuol dire che oggi si è scambiato più del solito. È `x3` più 1. Il giorno 2: volume 1100, media del volume 1020, `R = 1,08`.

#### 8.2.2 Le funzioni di appartenenza

Per ogni ingresso si definiscono tre insiemi: «bassa», «intermedia», «alta». Ognuno è una retta spezzata: la **bassa** vale 1 fino a un certo punto e poi scende linearmente a 0; la **alta** vale 0 fino a un certo punto e poi sale linearmente a 1; la **intermedia** è un triangolo che sale da 0 a 1 e riscende a 0. Quel tratto in salita o in discesa è la zona «sfumata».

Nell'esempio, per D (in punti percentuali) i punti sono: bassa vale 1 fino a -3 e scende a 0 in 0; intermedia è un triangolo con piedi in -3 e 3 e picco in 0; alta vale 0 fino a 0 e sale a 1 in 3. In tabella:

| D (%) | -3 o meno | -1,5 | 0 | 1,5 | 3 o più |
|---|---|---|---|---|---|
| bassa | 1,00 | 0,50 | 0,00 | 0,00 | 0,00 |
| intermedia | 0,00 | 0,50 | 1,00 | 0,50 | 0,00 |
| alta | 0,00 | 0,00 | 0,00 | 0,50 | 1,00 |

Per R: bassa vale 1 fino a 0,8 e scende a 0 in 1,0; intermedia è un triangolo con piedi in 0,8 e 1,2 e picco in 1,0; alta vale 0 fino a 1,0 e sale a 1 in 1,2.

| R | 0,8 o meno | 0,9 | 1,0 | 1,1 | 1,2 o più |
|---|---|---|---|---|---|
| bassa | 1,00 | 0,50 | 0,00 | 0,00 | 0,00 |
| intermedia | 0,00 | 0,50 | 1,00 | 0,50 | 0,00 |
| alta | 0,00 | 0,00 | 0,00 | 0,50 | 1,00 |

Un valore cade quasi sempre in due insiemi insieme. Con D = 2,22 (giorno 3): alta = `2,22 / 3 = 0,74`; intermedia (lato destro del triangolo) = `(3 - 2,22) / 3 = 0,26`; bassa = 0. Si legge «alta al 74% e intermedia al 26%». Qui i gradi sommano 1 per come sono disegnati i triangoli, ma in generale non è richiesto.

#### 8.2.3 Le regole e la combinazione dei gradi

Una **regola** ha la forma «se condizione allora conclusione». Le condizioni sono frasi sugli ingressi, unite da «e» e da «o». Per ottenere un grado dalla frase si usa:

- **«e»: il minimo** dei gradi. Se «D è alta» vale 0,74 e «R è alta» vale 0,68, «D alta e R alta» vale `min(0,74; 0,68) = 0,68`: la frase è vera quanto la sua parte meno vera.
- **«o»: il massimo** dei gradi. «R è intermedia o R è alta», con 0,32 e 0,68, vale `max(0,32; 0,68) = 0,68`.

Sono la scelta più semplice e la più usata; altre combinazioni esistono, ma non servono a capire il meccanismo [ipotesi, fonte non letta]. Il grado della condizione è il **grado di attivazione** della regola: indica quanto la regola «conta» oggi.

#### 8.2.4 Aggregazione e defuzzificazione

Ogni regola ha una conclusione, che è un'uscita. Nell'esempio le uscite sono tre: **Vendi**, **Neutro**, **Compra**, ognuna con un **centro**, cioè un numero che la rappresenta: Vendi = -1, Neutro = 0, Compra = +1.

1. **Aggregazione.** Più regole possono avere la stessa conclusione: per ogni uscita si prende il **massimo** dei gradi di attivazione delle regole che la concludono. Se due regole concludono «Compra» con 0,3 e 0,6, il grado di «Compra» è 0,6.
2. **Defuzzificazione.** Da questi gradi si ricava un solo numero con la **media pesata dei centri**:

```
uscita = somma( grado_uscita * centro_uscita ) / somma( grado_uscita )
```

Ogni uscita «tira» il risultato verso il proprio centro con la propria forza. Esempio con Compra 0,68, Neutro 0,26, Vendi 0: `(0,68 * 1 + 0,26 * 0 + 0 * (-1)) / (0,68 + 0,26 + 0) = 0,68 / 0,94 = 0,72`.

**Che cosa misura questo numero.** Poiché si divide per la somma dei gradi, conta solo la **proporzione** tra le uscite attive, non la loro forza assoluta. Se è attiva una sola uscita, per esempio Compra a 0,50 e le altre a 0, il risultato è `0,50 * 1 / 0,50 = 1,00`: la stessa uscita che si avrebbe con Compra a 1,00. L'uscita non dice «quanto sono sicuro», dice «come si dividono le regole». Lo si vede nel giorno 18 (sezione 8.3.3).

In questa versione ogni conclusione è un solo numero (il suo centro); nella forma più classica ogni conclusione è invece un'intera curva da combinare con le altre. La versione semplice basta per capire l'idea [ipotesi, fonte non letta]. Se nessuna regola è attiva il denominatore vale 0, e per convenzione l'uscita è 0 (aspetta).

#### 8.2.5 Dalle uscite a buy, sell, hold: le soglie

Un numero tra -1 e +1 va tradotto in un'azione con due soglie:

```
uscita >  0,3  ->  buy
uscita < -0,3  ->  sell
altrimenti     ->  hold
```

La soglia 0,3 è un numero del genoma. Il passaggio ai tre comandi ha quindi un salto finale, come in ogni sistema che deve decidere; la parte che precede è graduale (vedi 8.3.4).

### 8.3 Esempio applicato al dataset giocattolo

#### 8.3.1 L'istanza

Ingressi: D e R come in 8.2.1. Insiemi: quelli di 8.2.2. Regole:

```
Regola 1: se D è alta  e (R è intermedia o R è alta)  allora Compra
Regola 2: se D è alta  e  R è bassa                   allora Neutro
Regola 3: se D è intermedia                           allora Neutro
Regola 4: se D è bassa e (R è intermedia o R è alta)  allora Vendi
Regola 5: se D è bassa e  R è bassa                   allora Neutro
```

In italiano: sopra la media con volume normale o alto si compra; sopra la media con poco volume, o vicino alla media, o sotto la media con poco volume, si aspetta; sotto la media con volume normale o alto si vende. Sono regole scelte per l'esempio, non regole consigliate. Centri: Vendi = -1, Neutro = 0, Compra = +1. Soglie: ±0,3.

Il valutatore è quello comune (sezione 1.2.1): decisione eseguita il giorno dopo, tutto il denaro, nessun costo; un `buy` a posizione aperta o un `sell` a posizione chiusa non fanno nulla.

#### 8.3.2 Calcolo dettagliato di tre giorni

Si seguono tre giorni scelti perché diversi: il 3 (inizio del rialzo), il 9 (il prezzo ha già girato ma resta sopra la media), il 12 (ribasso con volume alto).

**Giorno 3.** Prezzo 10,30; EMA del prezzo 10,076; `D = (10,30 - 10,076) / 10,076 * 100 = 2,22`. Volume 1200; EMA del volume 1056,0; `R = 1200 / 1056,0 = 1,14`.

- Gradi di D: bassa 0; intermedia `(3 - 2,22)/3 = 0,26`; alta `2,22/3 = 0,74`.
- Gradi di R: bassa 0; intermedia `(1,2 - 1,14)/0,2 = 0,32`; alta `(1,14 - 1,0)/0,2 = 0,68`.
- Regola 1: D alta 0,74 e (R intermedia 0,32 o R alta 0,68). L'«o» dà `max(0,32; 0,68) = 0,68`; l'«e» dà `min(0,74; 0,68) = 0,68`.
- Regola 2: D alta 0,74 e R bassa 0: `min = 0`. Regola 3: D intermedia = 0,26. Regole 4 e 5: D bassa = 0, quindi 0.
- Aggregazione: Compra = 0,68; Neutro = `max(0; 0,26; 0) = 0,26`; Vendi = 0.
- Defuzzificazione: `(0,68 * 1 + 0,26 * 0) / (0,68 + 0,26) = 0,72`. Soglia: 0,72 > 0,3, quindi **buy**.

**Giorno 9.** Prezzo 11,30; EMA del prezzo 10,8535; `D = 4,11`. Volume 1200; EMA del volume 1372,12; `R = 0,87`.

- D: bassa 0; intermedia 0; alta 1 (oltre 3 la rampa è a 1).
- R: bassa `(1,0 - 0,87)/0,2 = 0,63`; intermedia `(0,87 - 0,8)/0,2 = 0,37`; alta 0.
- Regola 1: D alta 1 e (R intermedia 0,37 o R alta 0): `min(1; 0,37) = 0,37`. Regola 2: D alta 1 e R bassa 0,63: `0,63`. Regole 3, 4, 5: 0.
- Aggregazione: Compra 0,37; Neutro 0,63; Vendi 0. Defuzzificazione: `0,37 / (0,37 + 0,63) = 0,37`.
- Soglia: 0,37 > 0,3, quindi **buy**, ma di poco. Il prezzo ha già cominciato a scendere (11,35 il giorno 8, 11,30 il 9); il volume basso accende la regola 2 («aspetta»), che pesa 0,63 contro lo 0,37 della regola 1, e la spinta scende da 1 a 0,37.

**Giorno 12.** Prezzo 10,50; EMA del prezzo 10,8058; `D = -2,83`. Volume 2200; EMA del volume 1612,93; `R = 1,36`.

- D: bassa `(0 + 2,83)/3 = 0,94`; intermedia `(-2,83 + 3)/3 = 0,06`; alta 0. R: bassa 0; intermedia 0; alta 1.
- Regola 3: 0,06. Regola 4: D bassa 0,94 e (R intermedia 0 o R alta 1): `min(0,94; 1) = 0,94`. Le regole 1, 2 e 5 valgono 0.
- Aggregazione: Vendi 0,94; Neutro 0,06; Compra 0. Defuzzificazione: `(0,94 * (-1) + 0,06 * 0) / (0,94 + 0,06) = -0,94`.
- Soglia: -0,94 < -0,3, quindi **sell**.

#### 8.3.3 Tabella dei 20 giorni

Colonne: giorno, prezzo, `D` (%), `R`, i gradi di D e di R, i gradi di attivazione delle regole 1-5, i gradi aggregati delle uscite, l'uscita defuzzificata e la decisione. Valori arrotondati a due decimali.

| g | prezzo | D (%) | R | D: bassa/intermedia/alta | R: bassa/intermedia/alta | regole 1-5 | Compra/Neutro/Vendi | uscita | decisione |
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

**Risultato col valutatore.** Buy eseguito il giorno 4 a 10,55 (decisione del 3), sell il giorno 13 a 10,30, buy il giorno 18 a 11,05. Valore finale **1007,23, rendimento +0,72%**; riferimento buy&hold: 1128,71 (+12,87%). Il sistema entra al giorno 4 perché l'uscita del giorno 2 (0,27) è ancora sotto 0,3.

Osservazioni sul comportamento:

- **Gradualità.** L'uscita sale da 0,00 (giorno 1) a 0,27 (giorno 2), 0,72 (giorno 3), 1,00 (giorno 4): quattro giorni per passare da «aspetta» a «compra con convinzione», senza salti.
- **Che cosa fa il volume.** Il volume non «attenua» il segnale: decide quale regola entra in gioco. Con volume basso la regola 2 («aspetta») concorre con la regola 1: nei giorni 9 e 20 (R = 0,87 e 0,92) la regola 2 vale 0,63 e 0,41 contro 0,37 e 0,59, e l'uscita scende a 0,37 e 0,59. Il giorno 10 concorre invece la regola 3 (prezzo vicino alla media, 0,40). Nel giorno 18, con volume intermedio (R = 1,10), la regola 1 vale solo 0,50, ma nessuna regola concorre e l'uscita è 1,00; il giorno 19 (regola 1 a 0,86) dà ancora 1,00. Come visto in 8.2.4, l'uscita misura la proporzione tra le regole attive, non la loro forza: una regola attivata a metà, da sola, pesa quanto una attivata del tutto. In nessuno di questi giorni la decisione cambia, perché la soglia è 0,3.
- **Ritardo.** Il giorno 9 il prezzo è già in calo da un giorno e la decisione resta buy: come ogni sistema basato su medie, reagisce dopo il cambio di direzione.

#### 8.3.4 Il vantaggio tipico: nessun salto quando un valore passa una soglia

Confronto con una regola «secca»: `D > 1` allora buy, altrimenti hold. Con R = 1,2 (volume alto) la regola 1 vale `D/3` fino a D = 3, e l'uscita del sistema fuzzy è esattamente `D/3`:

| D | 0 | 0,5 | 0,9 | 1,0 | 1,5 | 2,0 | 2,5 | 3,0 | 3,5 |
|---|---|---|---|---|---|---|---|---|---|
| uscita | 0,00 | 0,17 | 0,30 | 0,33 | 0,50 | 0,67 | 0,83 | 1,00 | 1,00 |

L'uscita cresce in modo continuo: un valore vicino alla soglia dà una spinta vicina a quella dei valori accanto, mentre la regola secca passa da 0 a 1 in D = 1. Due precisazioni.

- **Il salto finale c'è ancora.** L'uscita supera la soglia 0,3 a D = 0,9: con D = 0,89 l'uscita è 0,297 (hold), con D = 0,91 è 0,303 (buy). La differenza nell'uscita è di 0,006, ma la decisione cambia. Se il motore usasse il valore dell'uscita (per esempio per la quota di capitale da investire), la gradualità arriverebbe fino all'ordine. Oggi il motore riceve solo buy, sell o hold, quindi il vantaggio resta nel calcolo intermedio [ipotesi: nessuna fonte letta sull'utilità della gradualità].
- **Sul dataset la differenza si perde.** La regola secca «D > 1 buy, D < -1 sell, altrimenti hold» dà le stesse tre operazioni e lo stesso risultato (+0,72%) del sistema fuzzy, con una sola decisione giornaliera diversa (giorno 15: sell invece di hold). L'esempio non mostra che il fuzzy sia migliore o peggiore: mostra che è un altro modo, graduale, di scrivere la stessa idea.

### 8.4 Come evolve

#### 8.4.1 I geni e il loro numero

Un **gene** è un numero (o una scelta) che l'algoritmo genetico può cambiare. Nell'esempio:

| Parte del genoma | Numeri | Quanti |
|---|---|---|
| Insiemi di D | bassa: 2 (fine del tratto a 1, punto dove va a 0); intermedia: 3 (due piedi e picco); alta: 2 (inizio salita, punto dove arriva a 1) | 7 |
| Insiemi di R | gli stessi 7 numeri | 7 |
| Conclusioni delle 5 regole | ciascuna una scelta tra Vendi, Neutro, Compra (gene discreto) | 5 |
| Soglia di decisione | un numero (0,3, simmetrica per buy e sell) | 1 |

Totale: **15 numeri reali** (14 + 1) più **5 scelte discrete**. Le condizioni delle regole e i centri delle uscite (-1, 0, 1) sono fissi; potrebbero evolvere anch'essi, a costo di uno spazio di ricerca più grande.

**Con sei ingressi** (i sei dati del genoma attuale: prezzo e volume del giorno e quattro filtri) i numeri sulle funzioni di appartenenza sono `6 * 7 = 42` con lo schema di questo esempio (la rassegna ne conta 54, con tre numeri per ognuno dei tre triangoli di ogni ingresso). Si aggiunge la **base di regole**: con quattro scelte per ogni ingresso (bassa, intermedia, alta, «non conta»), 10 regole richiedono 60 scelte per le condizioni e 10 per le conclusioni, cioè 70 geni discreti. È un conteggio d'esempio, non una dimensione proposta: il fuzzy ha **molti parametri**, quasi tutti sulle funzioni di appartenenza.

#### 8.4.2 Perché crossover e mutazione richiedono accorgimenti

Le funzioni di appartenenza hanno un **ordine interno**: il piede sinistro del triangolo viene prima del picco, che viene prima del piede destro. Un figlio che prende un numero da un genitore e uno dall'altro può rompere l'ordine. Gli insiemi devono anche **coprire** l'intervallo degli ingressi e sovrapporsi: con un buco tra due insiemi nessuna regola è attiva per alcuni valori e l'uscita è 0 per mancanza di informazione. Gli accorgimenti tipici, proposti dall'autore e non da una fonte letta [ipotesi], sono: trattare un insieme intero (o tutti gli insiemi di un ingresso) come unità di scambio nel crossover; **riordinare** i numeri di ogni funzione dopo mutazione o crossover; limitare ogni numero al dominio dell'ingresso e imporre una distanza minima tra numeri vicini.

#### 8.4.3 Esempi numerici di mutazione

Il genitore 1 è l'istanza dell'esempio; per ogni mutazione si rifà il calcolo dei 20 giorni.

**Mutazione 1: sposta un numero.** Il secondo numero della funzione «alta» di D passa da 3 a 4,5, e la rampa sale più lentamente: il giorno 3 il grado di «alta» scende da 0,74 a `2,22/4,5 = 0,49` e l'uscita da 0,72 a 0,66 (il giorno 2 da 0,27 a 0,19; il 10 da 0,60 a 0,50; il 17 da 0,62 a 0,52). **Nessuna decisione cambia**: le tre operazioni e il +0,72% restano uguali.

**Mutazione 2: cambia una conclusione (gene discreto).** La regola 2 (D alta e R bassa) passa da «Neutro» a «Compra». Le uscite dei giorni 8, 9 e 20, nei quali R è sotto 1, passano da 0,95, 0,37 e 0,59 a 1,00. Nessuna decisione cambia (erano già buy). Un gene cambiato sposta le uscite di tre giorni su venti.

**Mutazione 3: rompe l'ordine e viene riparata.** Il primo numero della funzione «alta» di D passa da 0 a 3,5, e il secondo resta 3: la coppia (3,5; 3) non è una rampa valida. Con il riordino diventa (3; 3,5): la rampa va da 0 a 1 tra D = 3 e D = 3,5, uno scatto quasi netto. Con D = 2,22 il grado di «alta» è 0, la regola 1 non scatta e l'uscita del giorno 3 vale 0,00. Le decisioni dei giorni 3, 10 e 17 passano da buy a hold; le operazioni diventano buy il giorno 5 (10,80), sell il 13 (10,30), buy il 19 (11,25); valore finale **966,42, rendimento -3,36%**. Un singolo numero cambiato ha reso il sistema, in pratica, una regola secca con soglia a 3, e ha cambiato l'esito.

#### 8.4.4 Esempio numerico di crossover

Due genitori:

| | Genitore 1 (esempio) | Genitore 2 |
|---|---|---|
| D bassa | (-3; 0) | (-4; -1) |
| D intermedia | (-3; 0; 3) | (-4; 0; 4) |
| D alta | (0; 3) | (1; 4) |
| R bassa | (0,8; 1,0) | (0,9; 1,05) |
| R intermedia | (0,8; 1,0; 1,2) | (0,9; 1,05; 1,3) |
| R alta | (1,0; 1,2) | (1,05; 1,3) |
| Conclusioni regole 1-5 | C, N, N, V, N | C, N, N, V, V |
| Soglia | 0,3 | 0,4 |

(C = Compra, N = Neutro, V = Vendi.) Il genitore 2 da solo dà buy il giorno 4, sell il 13, buy il 19, con valore finale 989,32 (-1,07%): decide più tardi del genitore 1, perché le sue rampe sono più larghe e la soglia più alta.

**Figlio.** Prende dal genitore 1 tutti gli insiemi di D e la soglia (0,3); dal genitore 2 tutti gli insiemi di R e la conclusione della regola 5 (Vendi); le altre conclusioni sono uguali nei due genitori. Si scambiano **insiemi interi**, per non rompere gli ordini. Uscite di alcuni giorni:

| Giorno | D | R | uscita genitore 1 | uscita genitore 2 | uscita figlio |
|---|---|---|---|---|---|
| 8 | 5,66 | 0,99 | 0,95 | 0,60 | 0,60 |
| 9 | 4,11 | 0,87 | 0,37 | 0,00 | 0,00 |
| 14 | -3,81 | 0,91 | -0,54 | -0,95 | -1,00 |
| 15 | -1,92 | 0,77 | 0,00 | -0,37 | -0,64 |
| 20 | 4,37 | 0,92 | 0,59 | 0,12 | 0,12 |

Il figlio ha le stesse uscite del genitore 1 in 12 giorni su 20 (1, 2, 4, 5, 6, 7, 11, 12, 13, 16, 17, 18) e uscite diverse negli altri, dove le rampe di R del genitore 2 danno gradi diversi. Le **decisioni** del figlio cambiano rispetto al genitore 1 nei giorni 9 (buy, poi hold), 15 (hold, poi sell) e 20 (buy, poi hold), ma le operazioni sono le stesse del genitore 1 (buy il 4, sell il 13, buy il 18) e il risultato è lo stesso, **1007,23 (+0,72%)**: il giorno 9 la posizione è già aperta, il sell del giorno 15 trova la posizione già chiusa, il giorno 20 è l'ultimo e la sua decisione è ignorata. In un altro dataset le differenze potrebbero avere effetto sul risultato.

### 8.5 Cosa ricorda del passato

Il sistema fuzzy standard **non ha memoria propria**: l'uscita di oggi dipende solo dagli ingressi di oggi. Tutta la memoria sta negli **indicatori a monte**: nell'esempio le due medie mobili con `c` = 0,2 (circa 5 giorni), da cui nascono D e R. Il giorno 12 il sistema «sa» che il prezzo è sotto la media lenta perché D = -2,83, e quella media contiene la storia dei giorni precedenti. Cambiando il `c` della media cambia la memoria del sistema, senza toccare le regole.

Si potrebbe dare uno stato al sistema, per esempio facendogli rileggere la propria uscita del giorno prima: non è la forma standard, aggiungerebbe uno stato da azzerare e lo avvicinerebbe a una macchina a stati continua. L'esempio non lo usa [ipotesi, nessuna fonte letta].

### 8.6 Punti di forza e debolezze

**Quanto sa esprimere.** Le regole sovrapposte descrivono una decisione a tratti, ma continua: l'uscita cambia gradualmente tra una regione e l'altra. Può rappresentare congiunzioni («prezzo alto e volume alto») che un punteggio lineare non rappresenta. Che i sistemi fuzzy siano approssimatori universali di funzioni è una proprietà nota che qui non è stata verificata [ipotesi].

**Quanto è grande lo spazio di ricerca.** Medio o grande. L'esempio ha 15 numeri e 5 scelte; con sei ingressi si arriva a 42-54 numeri più la base di regole (sezione 8.4.1). Più parametri significano più libertà e più rischio di sovradattamento (sezione 2.6); con [4], il rischio cresce quando si provano molte configurazioni su dati limitati (2517 barre di un solo titolo). Per questa forma non c'è una misura [ipotesi].

**Si capisce perché decide così?** In parte. Ogni regola si legge come una frase («se il prezzo è molto sopra la media e il volume è normale, compra»), e per un giorno qualsiasi si può dire quali regole hanno scattato e quanto. Per ottenere l'uscita però serve aggregare più regole, e il numero finale è una media pesata (che misura una proporzione, sezione 8.2.4): leggibilità «con calcolo». Con molti insiemi e molte regole la lettura si perde: 10 regole su 6 ingressi non sono più frasi semplici.

**Quanto costa calcolarlo.** Nell'esempio, alcune decine di operazioni per barra; con sei ingressi e una decina di regole, un centinaio [ipotesi: stima dell'autore, non misurata]. Il costo non discrimina tra le forme (sezione «Griglia di confronto» della rassegna).

**Si mescola e si muta bene?** Con accorgimenti (sezione 8.4.2): senza, si producono figli con funzioni malformate o buchi di copertura. Non sono difficili da scrivere, ma sono codice in più da provare.

**Si adatta al nostro motore?** Sì, con un adattamento (sezione 8.7).

### 8.7 Come si integra nel nostro motore

Ogni giorno il motore dà alla strategia prezzo e volume e riceve buy, sell o hold. Il flusso è: aggiornare le due medie mobili, calcolare D e R, fuzzificare, applicare le regole, aggregare, defuzzificare, confrontare con le soglie. Non c'è stato interno da azzerare oltre alle medie. Il contratto della strategia richiede:

- **`labels`**: la lista finita delle etichette di stato. Scelta dichiarata: le tre fasce dell'uscita defuzzificata (sell, hold, buy). Ragionamento nell'appendice, sezione «Etichette (`labels`) della rete, del fuzzy e dell'HMM».
- **`describe()`**: i gradi di appartenenza di D e di R, i gradi di attivazione delle regole e l'uscita defuzzificata (numeri finiti, utili per l'ispezione).
- **`serialize()`**: i parametri (insiemi, conclusioni, soglia) come JSON.
- **`crossover` e `mutate`**: da scrivere, con gli accorgimenti di 8.4.2. Il motore genetico di Consilium li chiama (appendice, sezione «Riferimenti al codice: capitoli 7, 8 e 9»).

Esito sul contratto: **con adattamento** (le etichette vanno derivate dall'uscita).

### 8.8 Cosa dice la letteratura

- **Fondazione.** Zadeh introdusse gli insiemi fuzzy nel 1965: ogni elemento ha un grado di appartenenza tra 0 e 1 [10]. La fonte è stata vista solo come scheda e abstract (il 2026-10-14 l'URL rispondeva con errore 503). Zadeh fonda gli insiemi, non i sistemi a regole descritti qui: la struttura regole, aggregazione, defuzzificazione è descritta dall'autore con parole proprie [ipotesi].
- **Uso nel trading.** La rassegna cita un lavoro di conferenza su un sistema fuzzy per il trading di azioni, con funzioni di appartenenza e regole ottimizzate da un algoritmo genetico [11], letto in parte e su un caso solo; non se ne riportano i risultati. Oltre a [11] non c'è una fonte letta sull'uso evolutivo del fuzzy su dati finanziari: ciò che il capitolo dice sul comportamento di questa forma con un algoritmo genetico su ENI è [ipotesi].
- **Approssimatori universali, varianti delle conclusioni, altri operatori di combinazione:** noti in letteratura, non verificati qui [ipotesi].

### 8.9 In breve

- La logica fuzzy sostituisce le soglie nette con **gradi** tra 0 e 1; regole in forma di frase si combinano con minimo («e») e massimo («o») e il numero finale è una media pesata, che misura la proporzione tra le uscite attive e non la loro forza; due soglie danno buy, sell o hold.
- Sul dataset giocattolo (due ingressi, tre insiemi ciascuno, cinque regole): 3 operazioni, +0,72% (buy&hold: +12,87%).
- Il vantaggio è la gradualità e la leggibilità delle regole; il costo è il numero di parametri (15 numeri e 5 scelte nell'esempio, 42-54 con sei ingressi) e gli accorgimenti per crossover e mutazione.
- La memoria sta negli indicatori a monte (le medie); non c'è stato proprio.
- Nel contratto va con adattamento (`labels` dalle fasce dell'uscita). Per l'uso evolutivo sui dati finanziari c'è una sola fonte nota [11], letta in parte.

## 9. Il modello a stati nascosti (HMM)

*Numeri di esempio inventati: mostrano il meccanismo, non dicono nulla sulla qualità della forma.*

### 9.1 In una frase e un'analogia

Un modello a stati nascosti (in inglese *hidden Markov model*, HMM) suppone che il mercato si trovi ogni giorno in un **regime** che non vediamo (per esempio «salita», «laterale», «calo») e che possiamo solo osservare i suoi effetti, cioè i movimenti giornalieri del prezzo. Il modello tiene una **credenza**, cioè una probabilità per ogni regime, e la aggiorna ogni giorno.

**Per un programmatore.** È un oggetto con uno stato interno (un vettore di K probabilità) e un metodo `update(osservazione)` che lo aggiorna con una moltiplicazione di matrice e una normalizzazione. L'azione si legge dallo stato con una tabella `regime -> buy/sell/hold`.

**Un'analogia.** Sei in una stanza senza finestre e vuoi indovinare che tempo fa fuori guardando chi entra. Il tempo (sole, pioggia) è lo stato nascosto; le persone con l'ombrello sono le osservazioni. Un ombrello non prova che piove: chi lo porta può essere prudente, e con la pioggia qualcuno lo dimentica. Però dopo tre persone con l'ombrello di fila la tua stima «sta piovendo» sale molto, e dopo due senza ombrello torna a scendere. Inoltre sai che il tempo cambia di rado da un'ora all'altra, e questo ti rende prudente nel cambiare idea per una sola persona. L'HMM formalizza il ragionamento con tre gruppi di numeri: quanto è probabile che il tempo cambi (le **transizioni**), quanto è probabile vedere un ombrello con la pioggia o con il sole (le **osservazioni**), e che cosa pensavi all'inizio (la **credenza iniziale**).

### 9.2 Come funziona

#### 9.2.1 Passo 1: i regimi nascosti

Si sceglie un numero K di regimi e un nome per ciascuno. Nell'esempio K = 3: **salita**, **laterale**, **calo**. «Nascosto» vuol dire che il programma non sa mai con certezza in quale regime si trova il mercato: sa solo quanto è probabile ciascuno. Un regime non è una previsione ma un'etichetta per un modo di comportarsi del prezzo.

#### 9.2.2 Passo 2: la matrice di transizione

Ogni giorno il mercato **resta nel regime in cui è oppure passa a un altro**, con probabilità fisse che dipendono solo dal regime di ieri (non da quello dell'altro ieri: è l'ipotesi di Markov). Le probabilità stanno in una tabella, la **matrice di transizione**. Ogni riga somma 1, perché da un regime si va comunque da qualche parte (anche restando).

Righe: regime di partenza; colonne: regime di arrivo.

| da \ a | Salita | Laterale | Calo |
|---|---|---|---|
| **Salita** | 0,80 | 0,15 | 0,05 |
| **Laterale** | 0,20 | 0,60 | 0,20 |
| **Calo** | 0,05 | 0,15 | 0,80 |

Un regime di salita ha l'80 per cento di probabilità di durare anche domani, il 15 di sfumare nel laterale e il 5 di diventare un calo di colpo. I numeri grandi sulla diagonale dicono «i regimi durano»: con 0,80, in media 1 / (1 - 0,80) = 5 giorni.

#### 9.2.3 Passo 3: il modello di osservazione

Ogni giorno vediamo una cosa sola: **come si è mosso il prezzo**. Per semplicità la riduciamo a tre simboli, con soglie dichiarate. Sia `r` la variazione percentuale del giorno rispetto a ieri, `r = prezzo di oggi / prezzo di ieri - 1`.

- **su**: `r` > +0,5 per cento;
- **giù**: `r` < -0,5 per cento;
- **fermo**: tra i due.

Il **modello di osservazione** dice, per ciascun regime, quanto è probabile ciascun simbolo. Anche qui ogni riga somma 1.

| regime \ osservazione | su | fermo | giù |
|---|---|---|---|
| **Salita** | 0,70 | 0,20 | 0,10 |
| **Laterale** | 0,25 | 0,50 | 0,25 |
| **Calo** | 0,10 | 0,20 | 0,70 |

In un regime di salita il 70 per cento dei giorni sale, ma il 10 per cento scende lo stesso: un giorno di calo isolato non basta a dire che il regime è cambiato (l'ombrello dimenticato).

#### 9.2.4 Passo 4: la credenza e il suo aggiornamento giornaliero (filtro in avanti)

La **credenza** è l'elenco delle probabilità dei K regimi, calcolate sapendo che cosa si è osservato fino a oggi. Parte da una credenza iniziale (qui 0,25 salita, 0,50 laterale, 0,25 calo: «prima di vedere nulla il mercato è più probabilmente fermo»). Poi, ogni giorno, due mosse:

1. **Previsione.** Si spinge la credenza di ieri attraverso la matrice di transizione: dove può essere il mercato oggi, prima di guardare il prezzo?
2. **Correzione.** Si pesa ogni regime per la probabilità che avrebbe avuto di produrre l'osservazione di oggi, e si divide per la somma, in modo che le probabilità sommino 1 (**normalizzazione**).

È il filtro «in avanti» della letteratura [2]; nell'appendice, sezione «Baum-Welch e Viterbi per esteso», c'è la stessa cosa con i simboli di Rabiner per chi vuole confrontare. Nel nostro dataset il giorno 1 non ha un giorno precedente, quindi non ha una variazione né un'osservazione: la credenza del giorno 1 è la credenza iniziale e le osservazioni cominciano dal giorno 2.

**Calcolo a mano: il giorno 2.** Il prezzo passa da 10,00 a 10,10 (+1,00 per cento): osservazione **su**. La credenza di ieri è (0,25; 0,50; 0,25) per (salita, laterale, calo).

*Previsione.* Per ogni regime di arrivo si somma, su tutti i regimi di ieri, credenza per probabilità di transizione.

```
salita:   0,25*0,80 + 0,50*0,20 + 0,25*0,05 = 0,2000 + 0,1000 + 0,0125 = 0,3125
laterale: 0,25*0,15 + 0,50*0,60 + 0,25*0,15 = 0,0375 + 0,3000 + 0,0375 = 0,3750
calo:     0,25*0,05 + 0,50*0,20 + 0,25*0,80 = 0,0125 + 0,1000 + 0,2000 = 0,3125
```

Prima di guardare il prezzo il mercato è già un po' più incerto di quello di oggi: l'80 per cento di durata non è il 100.

*Correzione.* Si moltiplica per la probabilità di vedere «su» in ciascun regime (colonna «su»: 0,70; 0,25; 0,10).

```
salita:   0,3125 * 0,70 = 0,21875
laterale: 0,3750 * 0,25 = 0,09375
calo:     0,3125 * 0,10 = 0,03125
somma = 0,34375
```

*Normalizzazione.* Si divide per 0,34375: salita 0,64, laterale 0,27, calo 0,09. Dopo un solo giorno in rialzo la credenza passa da (0,25; 0,50; 0,25) a (0,64; 0,27; 0,09): il regime più probabile è «salita», ma con il 64 per cento, non con il 100.

**Un giorno in cui il modello esita: il giorno 9.** Il prezzo scende da 11,35 a 11,30 (-0,44 per cento): osservazione **fermo**. La credenza di ieri è (0,906; 0,081; 0,013). Previsione: salita 0,742; laterale 0,187; calo 0,072. Correzione con la colonna «fermo» (0,20; 0,50; 0,20): 0,148; 0,093; 0,014, somma 0,256. Normalizzati: (0,579; 0,365; 0,056), cioè (0,58; 0,36; 0,06) a due decimali, come in tabella 9.3.2 (i calcoli usano i numeri non arrotondati). Un giorno «fermo» non cambia il regime più probabile, ma sposta molto peso dalla salita al laterale, perché il laterale spiega meglio un giorno fermo.

#### 9.2.5 Passo 5: dalla credenza all'azione

La credenza non è ancora una decisione. Serve una regola di lettura, che è parte del genoma. Due scelte semplici:

- **Regime più probabile.** Si prende il regime con la credenza più alta e si usa una mappa regime → azione. Nel nostro esempio: salita → `buy`, laterale → `hold`, calo → `sell`.
- **Soglia.** Si agisce solo se la credenza di un regime supera una soglia (per esempio 0,60); sotto la soglia, `hold`. Evita di cambiare idea con credenze incerte, a costo di reagire più tardi.

L'esempio usa la prima. La seconda è un'alternativa che il genoma può avere come numero in più.

### 9.3 Esempio applicato al dataset giocattolo

#### 9.3.1 Semplificazioni di questo esempio

- Osservazione: la variazione giornaliera del prezzo, in tre simboli (su, fermo, giù) con soglie ±0,5 per cento. **Il volume non è usato.**
- Tre regimi, matrici e credenza iniziale scritte sopra: **scelte a mano**, non stimate dai dati.
- Giorno 1: nessuna osservazione, credenza = credenza iniziale. Decisione: regime più probabile; salita → buy, laterale → hold, calo → sell.
- Valutatore comune (sezione 1.2.1): decisione alla chiusura del giorno `t`, eseguita il giorno dopo; tutto il denaro; nessun costo; l'ultima decisione è ignorata. Un `buy` a posizione aperta o un `sell` senza posizione non fanno nulla.

#### 9.3.2 La tabella giorno per giorno

Le tre colonne di credenza sono la credenza **dopo** l'aggiornamento di quel giorno. La decisione del giorno `t` si esegue il giorno `t+1`.

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

Le righe possono non sommare esattamente 1,00 per gli arrotondamenti (in alcuni giorni 0,99 o 1,01).

#### 9.3.3 Risultato col valutatore

| Operazione | Giorno di esecuzione | Prezzo |
|---|---|---|
| compra | 3 | 10,30 |
| vende | 11 | 10,80 |
| compra | 17 | 10,80 |

Valore finale **1106,80**, rendimento **+10,68 per cento**; riferimento buy&hold: 1128,71 (+12,87 per cento). La somma dipende dalle matrici scelte a mano e da 20 giorni inventati.

#### 9.3.4 Che cosa si vede

- **Ritardo all'ingresso.** Il primo giorno la credenza è ancora «laterale» (hold). Dopo una sola osservazione «su» dice già «salita» (64 per cento), e la decisione `buy` del giorno 2 si esegue il giorno 3 a 10,30.
- **Esitazione alla svolta.** Il picco è il giorno 8 (11,35). Il giorno 9 è «fermo»: la credenza di salita scende da 0,91 a 0,58 ma resta la più alta, quindi si tiene. Il giorno 10 (primo «giù» netto) la credenza di calo è 0,44 e supera il laterale (0,33) e la salita (0,23): `sell` decisa il 10, eseguita l'11 a 10,80, circa 0,55 euro per azione sotto il picco.
- **Il rimbalzo.** Il giorno 15 il prezzo sale (+1,47 per cento) dopo il fondo del giorno 14, ma la credenza di calo vale ancora 0,43 contro 0,30: il modello **non si fida di una sola osservazione** (come con l'ombrello) e resta `sell`. Il giorno 16, con la seconda osservazione «su», la salita vale 0,67 e il `buy` si esegue il giorno 17 a 10,80. La stessa prudenza che evita le false svolte ritarda quelle vere di un giorno o due.

### 9.4 Come evolve

#### 9.4.1 I geni

Nel nostro esempio il genoma contiene:

- gli elementi della **matrice di transizione**, 3 righe da 3 numeri che sommano 1 (6 numeri liberi, perché l'ultimo di ogni riga si ricava dagli altri);
- gli elementi della **matrice di osservazione**, 3 righe da 3 numeri che sommano 1 (altri 6 numeri liberi);
- la **credenza iniziale** (2 numeri liberi);
- la **mappa regime → azione** (3 scelte discrete tra buy, hold e sell);
- eventualmente le **soglie** per l'osservazione (le due soglie ±0,5 per cento, qui fissate) e la **soglia di decisione** sulla credenza.

Il vincolo «ogni riga somma 1» non è conservato da sola da un'operazione genetica semplice: dopo una mutazione o un crossover bisogna **rinormalizzare** ogni riga.

#### 9.4.2 Un esempio di mutazione

Si prende la riga «laterale» della matrice di transizione, (0,20; 0,60; 0,20), e si alza a 0,80 la probabilità di restare nel laterale. La riga non somma più 1 (0,20 + 0,80 + 0,20 = 1,20): si rinormalizza dividendo per 1,20, e si ottiene (0,17; 0,67; 0,17).

Su questo dataset la mutazione **non cambia nessuna decisione**: le credenze si spostano di pochi centesimi (il giorno 9 la salita passa da 0,58 a 0,57) ma il regime più probabile resta lo stesso, e l'esito resta +10,68 per cento. È una mutazione **neutra** per questo dataset.

Una seconda mutazione, più incisiva: nella riga «salita» si abbassa a 0,50 la probabilità di restare in salita, (0,50; 0,15; 0,05), che si rinormalizza dividendo per 0,70 in (0,71; 0,21; 0,07). Il giorno 9 cambia: la credenza è (0,46; 0,47; 0,07), il laterale supera la salita di un soffio e la decisione diventa `hold` invece di `buy`. Il modello è già in posizione, quindi le operazioni e l'esito restano gli stessi (+10,68 per cento). Una decisione cambia, il risultato no: la distinzione conta, perché l'algoritmo genetico vede solo il risultato (la fitness).

#### 9.4.3 Un esempio di crossover

Il secondo genitore ha una matrice di transizione più «nervosa» (le diagonali sono più basse), e le stesse matrice di osservazione, credenza iniziale e mappa del primo:

| da \ a | Salita | Laterale | Calo |
|---|---|---|---|
| **Salita** | 0,60 | 0,30 | 0,10 |
| **Laterale** | 0,30 | 0,40 | 0,30 |
| **Calo** | 0,10 | 0,30 | 0,60 |

Con questa matrice le credenze cambiano più in fretta: la differenza si vede nei giorni 9 (la credenza dà `hold` invece di `buy`) e 15 (`buy` invece di `sell`). Le sue operazioni sono ai giorni 3 (compra), 11 (vende) e 16 (compra a 10,55); valore finale 1133,02.

Due modi di fare il figlio, con numeri:

- **Crossover aritmetico (media riga per riga).** Ogni elemento è la media dei due genitori. La media di due righe che sommano 1 somma 1, quindi non serve rinormalizzare. La riga «salita» diventa (0,70; 0,225; 0,075), la «laterale» (0,25; 0,50; 0,25), la «calo» (0,075; 0,225; 0,70). Il figlio decide diversamente dal primo genitore nei giorni 9 e 15, con le stesse operazioni del secondo (giorni 3, 11 e 16).
- **Scambio di righe.** Il figlio prende la riga «salita» dal primo genitore e le righe «laterale» e «calo» dal secondo. Le righe sono intere, quindi ognuna somma già 1. Differisce dal primo genitore solo il giorno 15 (`buy` invece di `sell`); le operazioni sono ancora ai giorni 3, 11 e 16.

#### 9.4.4 La stima classica: Baum-Welch

Fuori dal mondo degli algoritmi genetici, gli HMM si addestrano con un metodo classico, l'algoritmo di **Baum-Welch** [2]. In parole semplici: parte con matrici qualsiasi; guarda **tutta** la sequenza storica e, per ogni giorno, calcola quanto è probabile ciascun regime tenendo conto anche di ciò che accade **dopo**; da queste probabilità ricostruisce nuove matrici, quelle che rendono più probabile la sequenza vista; e ripete finché la probabilità della sequenza smette di crescere. Il calcolo passo per passo è nell'appendice, sezione «Baum-Welch e Viterbi per esteso».

Per noi conta una conseguenza: **usa tutta la serie, futuro compreso.** Se si stimano le matrici sull'intera storia e poi si valuta la strategia sulla stessa storia, la strategia ha già «visto» i giorni futuri attraverso le matrici. È l'**anticipazione dei dati** (look-ahead, sezione 1.1.6). Il filtro in avanti è causale (usa solo il passato), ma i suoi parametri non lo sono, se stimati così.

**Un esempio breve.** Il filtro decide ogni giorno con ciò che ha. Se invece si cerca il percorso di regimi più probabile sull'intera sequenza (metodo di Viterbi [2], che prende ogni volta la scelta migliore invece di sommare le possibilità), si ottiene un «regime con il senno di poi»:

| Giorno | 1-8 | 9 | 10-14 | 15-20 |
|---|---|---|---|---|
| Filtro (solo passato) | salita (da 2) | salita | calo | calo il 15, poi salita |
| Con il senno di poi | salita | laterale | calo | salita già dal 15 |

Con il senno di poi il giorno 1 è già «salita», il 9 «laterale», il 15 una ripartenza. Decidere con quel percorso significherebbe operazioni ai giorni 2 (10,10), 11 (10,80) e 16 (10,55): +15,55 per cento. Quella cifra serve solo a mostrare l'effetto dell'informazione del futuro: nessuna strategia reale potrebbe sapere il giorno 1 che il mercato sarà in salita.

**Un caso di sovradattamento.** Con 30 iterazioni di Baum-Welch su questi 20 giorni, partendo dalle nostre matrici, i parametri memorizzano la sequenza: la credenza iniziale diventa (1,00; 0,00; 0,00), la matrice di osservazione quasi l'identità (ogni regime produce un solo simbolo), e il «laterale» diventa un regime di un solo giorno che passa al calo con probabilità 1,00. Il modello «sa» come va questo dataset, non come vanno i mercati: più un modello è libero e più si adatta alla sequenza che ha visto.

**Che cosa propone la rassegna.** La rassegna presenta due strade, senza sceglierne una: i parametri si evolvono con l'algoritmo genetico, senza stima globale; oppure si stimano solo su dati che **precedono** la valutazione. La scelta è rimandata alla ricerca sul protocollo di valutazione (R6).

### 9.5 Cosa ricorda del passato

L'HMM ha **memoria nel modello**, non negli indicatori a monte: la memoria è la credenza, K numeri (qui 3) aggiornati a ogni osservazione. È una **memoria ricorsiva**, della stessa famiglia della EMA (sezione 1.3.2). Scritta come `y[t] = y[t-1] + c * (x[t] - y[t-1])`, la EMA è lo stesso filtro di `e[t] = e[t-1]*(1 - c) + x[t]*c`, e la credenza di oggi dipende in modo analogo dalla credenza di ieri e dal dato nuovo. La differenza sta nel pesare: la EMA usa un solo coefficiente `c` fisso, mentre la credenza pesa **per regime** (un'osservazione «su» pesa molto per la salita e poco per il calo) e **in modo non lineare** (per via della normalizzazione). La «lunghezza» della memoria non è un numero ma emerge dalle matrici: per ribaltare una credenza di 0,90 servono più giorni coerenti (il rimbalzo dei giorni 15 e 16).

**Che cosa aggiunge rispetto a una media mobile della variazione giornaliera?** Risposta onesta: sul dataset giocattolo, niente di visibile. Una EMA con `c` = 0,5 della variazione giornaliera in percentuale, con soglie ±0,3 (compra sopra +0,3, vende sotto -0,3, altrimenti aspetta), ha le stesse tre operazioni dell'HMM (giorni 3, 11 e 17), lo stesso valore finale (1106,80) e una sola decisione diversa su 20 (il giorno 15: `hold` invece di `sell`). Servono due numeri (`c` e la soglia) contro i 14 dell'HMM. In teoria l'HMM aggiunge tre cose: un'osservazione pesa in modo diverso a seconda di che cosa si crede già (la EMA pesa sempre allo stesso modo); l'uscita è una probabilità e dice quanto il modello è incerto; durata e passaggi tra regimi sono parametri espliciti. Per contro riduce ogni giorno a un simbolo e butta via l'ampiezza del movimento. L'esempio non mostra nessuno di questi vantaggi: se valgano i 14 numeri in più sui dati veri è una domanda aperta [ipotesi].

#### 9.5.1 Una tensione da dire con franchezza: i regimi sono stati discreti

Il progetto vuole una memoria che nasca da indicatori noti e non da una macchina a stati. L'HMM non è un indicatore: ha K **stati discreti scritti nel modello** (salita, laterale, calo), con transizioni tra stati e una mappa stato → azione. **È una macchina a stati probabilistica**: gli stati sono «morbidi» (si è in tutti con una probabilità) e le transizioni sono calcolate dalle osservazioni, invece di essere scritte come liste di condizioni.

La domanda 1 ha già avuto risposta: l'HMM è **ammesso come forma da valutare**; questa sezione descrive la vicinanza e non la giudica. Per ricordare la macchina a stati attuale (capitolo 3): ha 9 stati disposti su una griglia 3x3, si trova in uno solo per volta, e passa a un altro quando scatta la prima transizione le cui condizioni (confronti tra medie mobili) sono tutte vere.

| Aspetto | Macchina a stati attuale (Consilium) | HMM di questo capitolo |
|---|---|---|
| Stati | 9, su una griglia 3x3 | K regimi (qui 3), con un nome |
| In che stato si è | Esattamente uno, in ogni momento | Una probabilità per ogni regime (credenza) |
| Come si cambia stato | Scatta la prima transizione le cui condizioni sono tutte vere | Si ricalcola la credenza con le due matrici |
| Da dove viene l'informazione sul passato | Dallo stato corrente e dalle medie mobili | Dalla credenza (nessuna media in ingresso se l'osservazione è il solo movimento del prezzo) |
| Cosa fa decidere l'azione | L'azione scritta nello stato (nel genoma fisso solo uno stato ha `buy`) | La mappa regime → azione |
| Cosa è nel genoma | Struttura discreta variabile (transizioni, condizioni) più 11 numeri | Matrici di numeri (righe che sommano 1) più una mappa di poche scelte |
| Cosa si legge a occhio | Il grafo degli stati; lo stato attuale richiede di seguire la storia | I nomi dei regimi; la credenza richiede di eseguire la ricorsione |

In comune: stati discreti e transizioni tra stati. Di diverso: la natura probabilistica (stati morbidi) e il fatto che le transizioni nascono da numeri, non da liste di condizioni.

### 9.6 Punti di forza e debolezze

**Quanto sa esprimere?** Ogni regime è una «modalità» del mercato, con una propria dinamica. Nell'esempio le decisioni dipendono dalla sequenza di osservazioni, non solo dall'ultima: lo stesso «su» del giorno 15 dà `sell` e quello del giorno 16 dà `buy`. La rassegna lo descrive come una decisione «a tratti» (una regione per regime) [ipotesi].

**Quanti numeri ha il genoma?** Nel nostro esempio: 6 (transizione) + 6 (osservazione) + 2 (credenza iniziale) = **14 numeri liberi**, più la mappa regime → azione (3 scelte). Con 3 regimi e 5 simboli di osservazione: 6 + 12 + 2 = 20. Con 5 regimi e 7 simboli: 20 + 30 + 4 = 54. Cresce con il quadrato dei regimi (transizioni) e con regimi per simboli (osservazione). Se l'osservazione non è un simbolo ma sei numeri (i sei ingressi del genoma attuale), ogni regime ha per ciascuno una media e una dispersione (quanto i valori si allargano intorno alla media): 3 regimi * 6 ingressi * 2 = 36, più 6 di transizione e 2 di credenza iniziale, cioè i circa 44 della rassegna (conteggio dell'autore, assumendo che dentro un regime gli ingressi siano indipendenti e distribuiti «a campana»). In ogni caso la dimensione è fissa, ma i numeri sono più di quelli di un punteggio lineare [ipotesi].

**Si capisce perché decide così?** A metà. I regimi hanno nomi, e «credenza di calo 0,89» è leggibile, ma capire perché la credenza ha quel valore richiede di eseguire la ricorsione dall'inizio. Inoltre i nomi li **scegliamo noi**: un genoma evoluto può avere un regime chiamato «salita» che si comporta da «calo» (per questo la mappa regime → azione è nel genoma e la fitness è l'unico giudice).

**Quanto costa calcolarlo?** Poco, per un giorno. Con K = 3: 9 prodotti e 6 somme per la previsione, 3 prodotti per la correzione, 3 somme e 3 divisioni per la normalizzazione: circa 25 operazioni per giorno più la classificazione del movimento. Il costo cresce con K al quadrato [ipotesi: conteggio a mano dell'autore, non misurato].

**Si mescola e si muta bene?** Con accorgimenti. La mutazione è semplice (cambiare un elemento e rinormalizzare la riga). Per il crossover, la media di due righe che sommano 1 somma 1 senza altro lavoro, ma c'è un problema più sottile: **scambiare i nomi dei regimi dà lo stesso modello con un genoma diverso**. Se nel genitore 1 il regime 1 è la «salita» e nel genitore 2 il regime 1 è il «calo», la media delle loro matrici mescola due cose diverse. È lo stesso problema delle «competing conventions» delle reti neurali (sezione 7.4.3) [1]. Una soluzione è mettere i regimi in un ordine fisso prima del crossover, per esempio in base a quanto è probabile vedere «su» rispetto a «giù» in ciascuno [ipotesi].

**Si adatta al nostro motore?** Bene: tra le forme considerate è quella con `labels` naturali (sezione 9.7).

**Rischi.** Anticipazione nella stima dei parametri (sezione 9.4.4); regimi che collassano su uno solo; regimi mai verificabili, perché non si osservano [ipotesi].

### 9.7 Come si integra nel nostro motore

Ogni giorno il motore dà alla strategia la barra del giorno. L'HMM calcola l'osservazione (su, fermo, giù) dal prezzo, aggiorna la credenza e restituisce buy, sell o hold secondo la mappa.

- **`labels`**: i K regimi (salita, laterale, calo). È la scelta più naturale tra le forme: le altre devono derivare le etichette da fasce dell'uscita, qui sono già nel modello (appendice, sezione «Etichette (`labels`) della rete, del fuzzy e dell'HMM»).
- **`describe()`**: la credenza (K numeri) e il regime più probabile; si possono mostrare nella tabella o nel grafico del PoC come lo stato della macchina a stati.
- **`serialize()`**: le matrici, la credenza iniziale e la mappa come JSON.
- **Azzeramento**: il reset riporta la credenza alla credenza iniziale, come per le medie mobili del genoma attuale (appendice, sezione «Riferimenti al codice: capitoli 7, 8 e 9»).
- **`crossover` e `mutate`**: da scrivere, con la rinormalizzazione delle righe e, se si vuole, l'ordinamento dei regimi (ricerca sulla codifica genetica, R3, e implementazione del genoma scelto, E2).

Una parte che non si adatta da sola: la discretizzazione dell'osservazione (le soglie ±0,5 per cento) e il tipo di osservazione (solo prezzo, o anche volume) non sono dati dal motore. Sono scelte di progetto, da fare insieme alla ricerca sugli indicatori (R2).

### 9.8 Cosa dice la letteratura

- **Algoritmo in avanti e stima.** Rabiner [2] definisce il filtro in avanti, la normalizzazione, la decodifica di Viterbi e l'algoritmo di Baum-Welch (letto per le parti citate). Il testo riguarda il **riconoscimento del parlato**, non la finanza.
- **Regimi nell'economia e nei mercati.** Hamilton [12] introduce un modello di cambio di regime a stati discreti di Markov in economia; Ang e Timmermann [13] trattano i cambi di regime nei mercati finanziari (schede con abstract); Gupta e altri [14] propongono un insieme di modelli HMM per rilevare i cambi di regime e fare trading. Di nessuno riportiamo risultati.
- **HMM con algoritmo genetico nel trading.** Nessuna fonte letta: la rassegna non l'ha trovata. Che sia possibile (i parametri sono numeri evolvibili) è [ipotesi]; non è accertato che funzioni. Anche la lettura della credenza in avanti come una media «a più canali» pesata dai regimi è una lettura dell'autore.

### 9.9 In breve

- L'HMM tiene una **credenza** (una probabilità per regime) e la aggiorna ogni giorno con due matrici: transizione tra regimi e osservazione del movimento di prezzo; la decisione si legge dal regime più probabile.
- Sul dataset giocattolo con tre regimi e matrici scelte a mano: operazioni ai giorni 3, 11 e 17, +10,68 per cento (buy&hold: +12,87 per cento), con ritardo di uno o due giorni alle svolte e prudenza davanti al singolo rimbalzo.
- Sul dataset una media mobile della variazione giornaliera dà le stesse operazioni: ciò che l'HMM aggiunge (pesi diversi per regime, una probabilità come uscita) l'esempio non lo mostra.
- Il genoma ha 14 numeri liberi nell'esempio, più la mappa regime → azione; mutazione e crossover richiedono la rinormalizzazione delle righe e l'ordinamento dei regimi.
- Stimare le matrici su tutta la storia (Baum-Welch) fa anticipare i dati futuri; il metodo di stima è rimandato al protocollo di valutazione (R6).
- È una **macchina a stati probabilistica**: stati discreti e transizioni come la macchina a stati attuale, con stati morbidi e transizioni calcolate. È ammessa come forma da valutare; le etichette (`labels`) sono i regimi. Nessuna fonte letta sull'uso con un algoritmo genetico nel trading.

## 10. Confronto e guida alla scelta

Numeri di esempio inventati: mostrano il meccanismo, non dicono nulla sulla qualità della forma.

**Che cosa si deve decidere, e che cosa no.** Chi decide deve scegliere da quale forma di genoma partire per il nuovo motore e, insieme, quattro scelte che ne dipendono (le domande da 2 a 5, più sotto). Questo capitolo mette a confronto le sette forme dei capitoli da 3 a 9, macchina a stati attuale compresa, e mostra che cosa decide ciascun esempio giorno per giorno sullo stesso dataset. Per ogni domanda dice che cosa cambia nella pratica a seconda della risposta, porta un caso concreto e mette sulla bilancia vantaggi e svantaggi di ogni risposta, con lo stesso numero di argomenti per ciascuna. **La guida non decide e non indica una risposta preferita.** Non dice quale forma sia migliore, perché gli esempi hanno numeri inventati e parametri scelti a mano, e perché nessuna forma è stata evoluta o provata su dati veri. Offre solo, alla fine delle domande, due **percorsi alternativi e coerenti** da usare come punto di partenza: il **percorso 1** (una forma sola, semplice) e il **percorso 2** (due forme, una semplice e una espressiva). La scelta è di chi decide, anche solo in parte.

**A che cosa serve ciascuna domanda.** Dopo questa scelta il lavoro si divide in cinque ricerche, seguite dall'implementazione del genoma scelto (E2): la ricerca sugli indicatori da usare (R2), quella sulla codifica genetica, cioè su come un genoma si scrive, si mescola e si modifica (R3), quella sulle equazioni di decisione, cioè su come si arriva a comprare, vendere o aspettare (R4), quella sulla funzione di fitness, il «voto» dato a un genoma (R5), e quella sul protocollo di valutazione, cioè su come si separano addestramento, validazione e prova finale (R6). Queste ricerche e l'implementazione sono le tappe successive alla scelta: non sono ancora state fatte, e ciascuna domanda sblocca una parte di questo lavoro.

- **Domanda 1** (già risolta): **quali forme si valutano.** Sono ammesse tutte e sette, comprese quelle che hanno una memoria interna per costruzione (il modello a stati nascosti, le reti con collegamenti ricorrenti). Serve a non escludere nessuna forma in partenza.
- **Domanda 2**: **dentro la forma scelta, dove sta la memoria**: solo negli indicatori, in variabili che il genoma si porta dietro, o nello stato del portafoglio fornito dal motore? Decide quali indicatori servono alla ricerca sugli indicatori (R2) e quanta struttura deve gestire la ricerca sulla codifica genetica (R3).
- **Domanda 3**: quanto pesa poter spiegare una decisione rispetto a poter scrivere regole complicate? Orienta la ricerca sulle equazioni di decisione (R4), cioè che cosa il genoma può dire.
- **Domanda 4**: si implementa una forma o due? Decide la dimensione di E2 e il tipo di confronto possibile tra forme.
- **Domanda 5**: si misura quanto ogni forma si adatta al rumore dei dati? Serve alla ricerca sulla funzione di fitness (R5) e a quella sul protocollo di valutazione (R6), e decide quando affrontare il rischio di sovradattamento (adattarsi ai dati di addestramento, caso compreso, e andare peggio su dati nuovi).

Chi ha poco tempo può leggere la tabella della sezione 10.1, la griglia della sezione 10.3 e, per ogni domanda, i casi concreti e la parte «Vantaggi e svantaggi».

### 10.1 Le sette forme a confronto

La tabella è in parole semplici. I giudizi su leggibilità e memoria sono quelli dei capitoli e della rassegna (il documento compatto che precede questa guida), e in buona parte opinioni dell'autore **[ipotesi]**. Per ogni forma c'è una riga di definizione, ciò che ricorda del passato, quanto si legge e il punto da tenere presente. I conteggi dei numeri da far evolvere sono sotto la tabella.

| Forma e che cos'è in una riga | Che cosa ricorda del passato | Quanto si legge | Punto da tenere presente |
|---|---|---|---|
| **Macchina a stati attuale** (capitolo 3). Nove «situazioni» collegate da regole; a ogni situazione può corrispondere un acquisto | La situazione in cui si trova, più le medie mobili che le arrivano | A metà: lo schema si legge, ma per sapere in che situazione si è oggi bisogna ripercorrere i giorni passati | Già nel motore. Nel genoma reale solo una situazione compra e nessuna vende: si esce per stop loss o take profit (soglie automatiche di perdita e di guadagno). Che cosa ricordi ogni situazione lo scopre l'evoluzione, e i nomi non lo dicono |
| **Punteggio lineare** (capitolo 4). Somma pesata di indicatori e due soglie: sopra si compra, sotto si vende | Solo gli indicatori, calcolati prima del genoma | Molto: si vede quanto pesa ogni ingresso | Non sa dire «X e Y insieme» se nessuno prepara un ingresso apposta. Gli ingressi vanno portati su scale simili |
| **Alberi di espressioni** (capitolo 5). Una formula ad albero («se... allora...», confronti, operazioni) che l'evoluzione fa crescere e cambia | Solo gli indicatori; nella variante con registri anche variabili proprie | Un albero piccolo sì, uno grande no | Gli alberi tendono a crescere senza migliorare (in letteratura si chiama bloat) e molti rami non scattano mai |
| **Lista di regole** (capitolo 6). Elenco ordinato di «se condizione, allora azione»: vince la prima regola vera | Solo gli indicatori | Molto, se è corta: si legge come un regolamento | Mescolare due liste può dare figli senza senso. L'ordine delle regole conta. Non sa dire «da tre giorni» |
| **Reti neurali** (capitolo 7). Piccoli calcoli collegati da pesi, con una funzione che tiene i valori tra -1 e +1 | Solo gli indicatori; con collegamenti ricorrenti (l'uscita di ieri torna come ingresso) anche una memoria propria | Poco: il significato è sparso tra tutti i pesi | Due reti equivalenti con i neuroni in ordine diverso, mescolate, danno figli scadenti. Un metodo (NEAT) lo evita ma aggiunge complessità |
| **Logica fuzzy** (capitolo 8). Regole scritte come frasi che lavorano con gradi tra 0 e 1 invece che con sì e no; un numero finale e due soglie | Solo gli indicatori | In parte: le regole si leggono, il numero finale è una media pesata | Molti parametri; per mescolarli e mutarli servono accorgimenti (riordinare e limitare i numeri) |
| **Modello a stati nascosti** (capitolo 9). Una probabilità per ciascun «regime» di mercato (salita, laterale, calo), aggiornata ogni giorno | Un elenco di probabilità, una per regime, che si aggiorna da solo ogni giorno | A metà: i regimi hanno un nome, ma per capire una decisione si rifà l'aggiornamento giorno per giorno | È di fatto una macchina a stati probabilistica. Stimarne i numeri su tutta la serie usa informazioni non ancora disponibili quel giorno (anticipazione dei dati) **[ipotesi]** |

**Quanti numeri hanno** (conteggi degli esempi dei capitoli, che dipendono dagli esempi scelti):

- Macchina a stati: 11 numeri continui più una struttura variabile (nel genoma fisso, 36 liste di condizioni con 135 identificatori in tutto).
- Punteggio lineare: circa 9 con 6 ingressi (6 pesi, un bias, 2 soglie); 2 nella forma minima. I 6 ingressi sono i dati che il genoma attuale già usa: prezzo e volume del giorno e quattro medie mobili.
- Alberi: nessun numero fisso; l'esempio ha 21 nodi e una costante.
- Lista di regole: variabile; l'esempio ha 2 margini; con 5 regole da 3 condizioni sarebbero circa 15 confronti **[ipotesi]**.
- Rete: 11 pesi nell'esempio, 43 in una rete di 6 ingressi, 4 neuroni nascosti e 3 uscite; con NEAT variabile.
- Fuzzy: 15 numeri e 5 scelte nell'esempio; da 42 a 54 con 6 ingressi, più le regole.
- Modello a stati nascosti: 14 numeri nell'esempio; circa 44 nella rassegna.

Le operazioni per barra sono stime a mano degli autori, non misure: con i parametri di esempio stanno tra decine e centinaia per tutte le forme, quindi il costo di calcolo non le distingue.

### 10.2 Che cosa usa ciascun esempio

Gli esempi dei capitoli non sono costruiti per essere confrontabili: ognuno usa gli ingressi e i parametri più semplici che mostrano il meccanismo, e **nessun parametro è stato evoluto**. Sono scelti a mano, sugli stessi 20 giorni, solo perché il meccanismo funzioni. Le differenze di ingressi contano per leggere la griglia che segue: il modello a stati nascosti guarda solo la variazione giornaliera del prezzo e non usa il volume; il fuzzy usa la distanza dalla media e il rapporto del volume; gli altri usano medie mobili del prezzo, e tutti tranne la macchina a stati ridotta usano anche il volume. La macchina a stati dell'esempio è quella **ridotta a tre stati** del capitolo 3, che ha un'azione `sell`; il genoma reale ha invece solo un acquisto e vende per stop loss o take profit.

### 10.3 Le decisioni giorno per giorno

La tabella riporta la decisione presa **alla chiusura di ogni giorno** da ciascun esempio. Il valutatore la esegue al prezzo del giorno dopo; un `buy` con la posizione già aperta, un `sell` senza posizione e la decisione del giorno 20 non producono operazioni. Le decisioni sono lette dalle tabelle giorno per giorno dei capitoli e ricontrollate con lo stesso valutatore: ogni sequenza dà le stesse operazioni dichiarate nel suo capitolo.

> **Questa non è una classifica.** I parametri di ogni esempio sono scelti a mano, su questi 20 giorni inventati, solo per mostrare il meccanismo di ciascuna forma. La griglia dice una cosa sola: **forme diverse, con parametri diversi, decidono in modo diverso sugli stessi dati**. Non dice quale forma sia migliore, né che cosa farebbe con parametri evoluti o su dati veri. Le colonne seguono l'ordine dei capitoli e non un ordine di merito. Non sono riportati valori finali né rendimenti, proprio perché non devono essere confrontati.
>
> | Giorno | Prezzo | Macchina a stati ridotta (cap. 3) | Punteggio lineare (cap. 4) | Albero (cap. 5) | Lista di regole (cap. 6) | Rete (cap. 7) | Fuzzy (cap. 8) | Stati nascosti (cap. 9) |
> |---|---|---|---|---|---|---|---|---|
> | 1 | 10,00 | sell | hold | hold | hold | hold | hold | hold |
> | 2 | 10,10 | hold | hold | hold | hold | hold | hold | buy |
> | 3 | 10,30 | buy | buy | buy | buy | buy | buy | buy |
> | 4 | 10,55 | buy | buy | buy | buy | hold | buy | buy |
> | 5 | 10,80 | buy | buy | buy | buy | hold | buy | buy |
> | 6 | 11,00 | buy | buy | buy | buy | hold | buy | buy |
> | 7 | 11,20 | buy | buy | buy | buy | hold | buy | buy |
> | 8 | 11,35 | buy | buy | hold | hold | hold | buy | buy |
> | 9 | 11,30 | buy | buy | hold | hold | buy | buy | buy |
> | 10 | 11,10 | buy | buy | hold | hold | buy | buy | sell |
> | 11 | 10,80 | buy | buy | sell | hold | hold | hold | sell |
> | 12 | 10,50 | sell | hold | sell | sell | sell | sell | sell |
> | 13 | 10,30 | sell | sell | sell | sell | sell | sell | sell |
> | 14 | 10,20 | sell | sell | sell | sell | sell | sell | sell |
> | 15 | 10,35 | sell | sell | sell | sell | sell | hold | sell |
> | 16 | 10,55 | sell | hold | sell | hold | hold | hold | buy |
> | 17 | 10,80 | hold | hold | hold | hold | buy | buy | buy |
> | 18 | 11,05 | buy | buy | hold | buy | buy | buy | buy |
> | 19 | 11,25 | buy | buy | hold | buy | buy | buy | buy |
> | 20 | 11,40 | buy | buy | hold | hold | buy | buy | buy |

Che cosa si legge, senza trarne conclusioni sulla qualità:

- I sette esempi decidono allo stesso modo solo nei giorni 3, 13 e 14. Negli altri 17 giorni almeno un esempio decide diversamente dagli altri.
- Il giorno 11 compaiono tutte e tre le mosse. Il prezzo (10,80) è appena sotto la media lenta (10,88, cioè 0,76% sotto) mentre la media veloce (10,98) è ancora sopra e il volume è alto. La macchina a stati ridotta dice `buy` perché per uscire aspetta che la media veloce scenda sotto la lenta, cosa che accade il giorno dopo. Il punteggio lineare dice `buy` perché il volume alto vale 2,96 punti e compensa gli altri due: -0,76 + 0,94 + 2,96 = 3,14, sopra la soglia di +3 (capitolo 4). L'albero dice `sell` perché ha una regola di uscita «prezzo sotto la media lenta». Il modello a stati nascosti dice `sell` perché guarda solo la variazione del giorno (-2,7%) e la legge come passaggio al calo. La lista di regole dice `hold` perché la sua regola di vendita chiede un prezzo almeno 1% sotto la media, e qui è sotto di 0,76%. Rete e fuzzy dicono `hold` perché combinano gli ingressi in un valore che cade tra le due soglie.
- Il modello a stati nascosti guarda solo la variazione giornaliera del prezzo, senza medie lente né volume: le sue decisioni seguono la probabilità dei regimi e non la distanza dalle medie (capitolo 9). Per questo nei giorni 2, 10 e 16 la sua decisione differisce da quella di tutti gli altri esempi.
- Decisioni diverse non implicano operazioni diverse. Molte differenze cadono mentre la posizione è già aperta (un `buy` in più o in meno non cambia nulla) oppure nell'ultimo giorno, la cui decisione è ignorata; il `sell` del giorno 1 della macchina ridotta non produce nulla, perché non c'è ancora una posizione. La griglia riporta decisioni, non operazioni né risultati.
- Questo è un effetto dei parametri scelti a mano, non una proprietà delle forme: con altri numeri, anche la stessa forma deciderebbe in modo diverso (nei capitoli da 3 a 9 la mutazione di un solo numero cambia spesso alcune decisioni sullo stesso dataset, anche se qualche mutazione è neutra).

**A che cosa serve la griglia per scegliere.** Serve a una cosa sola: vedere che le forme non sono lo stesso calcolo scritto in modi diversi. Davanti a una situazione ambigua come il giorno 11, ciascuna forma dà una lettura diversa, e la forma scelta decide quali letture il genoma potrà scrivere. Per scegliere servono le domande che seguono, non la griglia.

### 10.4 Le domande per chi decide

Le domande sono quelle della rassegna, riscritte con esempi. Per ciascuna ci sono cinque cose: la domanda in parole semplici, che cosa cambia nella pratica a seconda della risposta, un caso concreto tratto dai capitoli, i vantaggi e gli svantaggi di ogni risposta (lo stesso numero di argomenti per ogni risposta; sono ragionamenti dell'autore, non misure **[ipotesi]**) e il posto della domanda nei due percorsi proposti in fondo alla sezione. **Non c'è una risposta preferita.** La risposta di chi decide si annota a parte, nel documento di lavoro del ciclo 010, nel punto riservato alla conferma della persona che decide: questa guida non registra scelte.

#### Domanda 1 (già risolta, richiamata come premessa)

La domanda 1 riguarda **quali forme si valutano**. La risposta già data è: tutte e sette, comprese quelle che hanno una memoria interna per costruzione, come il modello a stati nascosti e le reti con collegamenti ricorrenti. Il requisito «la memoria non deve venire da una macchina a stati» **non è stringente**. Questa domanda non dice come sia scritta la forma che verrà scelta: a questo risponde la domanda 2. Le altre domande partono da qui.

#### Domanda 2. Dentro la forma scelta, dove sta la memoria?

**Che cosa distingue questa domanda dalla 1.** La domanda 1 ha deciso quali forme si valutano. La domanda 2 riguarda **come è scritta la forma scelta**: per esempio, dato un albero o una rete, la memoria sta solo negli indicatori, in variabili che il genoma si porta dietro, oppure nello stato del portafoglio fornito dal motore? Rispondere alla domanda 2 non riapre la 1.

**In parole semplici.** Oltre alla memoria che arriva dagli indicatori (medie mobili e simili, calcolate prima che il genoma decida), il genoma può avere **un suo «taccuino»**, cioè una variabile che si porta da un giorno all'altro? Il caso tipico è una regola di uscita come «vendi se il prezzo scende del 3% sotto il massimo raggiunto dopo l'acquisto». Per scriverla bisogna sapere qual è stato il massimo da quando si è comprato, e nessuna media mobile lo dice. Le vie possibili sono tre.

**Che cosa cambia nella pratica.** La risposta decide se il genoma è una funzione pura degli indicatori (si prova con una tabella di ingressi e di risposte) o se tiene uno stato che `reset()` deve azzerare e che rende una decisione comprensibile solo rifacendo i giorni precedenti; decide quali indicatori deve preparare la ricerca sugli indicatori; decide se il motore deve fornire nuovi ingressi sul portafoglio.

**Via 1: solo indicatori.** Il genoma è una funzione che, dagli indicatori di oggi, dà la decisione di oggi. Stessi ingressi, stessa risposta.

- *Vantaggi.* Il comportamento si prova con una tabella di ingressi e di risposte. Non c'è nulla da azzerare oltre agli indicatori. Una decisione si spiega guardando gli ingressi del giorno.
- *Svantaggi.* Se manca un indicatore utile, il genoma non può inventarselo: ogni bisogno di memoria diventa un nuovo indicatore da definire nella ricerca sugli indicatori. Il genoma non sa se è in posizione né a che prezzo ha comprato. Le uscite legate alla propria posizione (il massimo dall'acquisto, i giorni dall'acquisto) si possono solo approssimare.

**Via 2: memoria interna del genoma** (per esempio registri negli alberi, o collegamenti ricorrenti nelle reti, quando la forma scelta ne ha una variante). Il genoma conserva variabili sue, che aggiorna ogni giorno. Il modello a stati nascosti, che ha una memoria interna per costruzione, rientra nella domanda 1 (forma ammessa) e non è l'oggetto di questa via.

- *Vantaggi.* Può costruirsi la memoria che gli serve (il massimo dopo l'acquisto, un contatore di giorni) senza chiedere nulla al motore. L'evoluzione decide che cosa ricordare, quindi non serve prevedere in anticipo ogni indicatore. Non richiede modifiche al motore.
- *Svantaggi.* Si legge meno: per capire una decisione si rifanno i giorni precedenti. Una mutazione si propaga a tutti i giorni successivi e lo spazio di ricerca cresce. Si rischia di ricreare di nascosto una macchina a stati, la forma che si voleva lasciare (nell'esempio del capitolo 5 la variabile distingue già due situazioni, «fermo» e «in posizione»); inoltre il registro dell'esempio si aggiorna con le decisioni del programma e non con gli ordini realmente eseguiti (la decisione `buy` del giorno 3 viene eseguita il giorno 4, a un altro prezzo, e potrebbe non esserlo affatto).

**Via 3: stato del portafoglio fornito dal motore.** Il genoma resta una funzione pura, ma tra i suoi ingressi, oltre agli indicatori, il motore mette alcune informazioni sulla posizione aperta: se si è in posizione (sì o no), il prezzo d'acquisto, i giorni passati dall'acquisto, il massimo del prezzo dall'acquisto. Il `Trader` (la parte del motore che esegue gli ordini) tiene già le posizioni aperte con prezzo e momento di acquisto; i giorni dall'acquisto e il massimo dall'acquisto non ci sono già pronti e vanno calcolati.

- *Vantaggi.* La memoria è quella vera (ordini eseguiti, prezzi reali). Il genoma resta una funzione degli ingressi, quindi si prova e si legge come nella via 1. Vale per tutte le forme allo stesso modo e copre le uscite che dipendono da ciò che si è comprato.
- *Svantaggi.* Richiede una modifica del motore, uguale per tutte le forme, e relativi collaudi. L'elenco delle informazioni dello stato del portafoglio va deciso in anticipo: se ne manca una, vale lo stesso limite della via 1, un livello più su. «In posizione sì o no» diventa un ingresso, quindi la forma può comportarsi come una macchina a due situazioni, anche se la situazione le viene dal motore e non l'ha inventata lei.

**Che cosa copre già il `Trader`.** Ogni acquisto riceve due soglie fissate al momento dell'acquisto. Lo stop loss chiude la posizione se il prezzo minimo del giorno tocca un livello sotto il prezzo d'acquisto; il take profit la chiude se il prezzo massimo del giorno tocca un livello sopra il prezzo d'acquisto. Nel genoma fisso sono 50% (che quasi non scatta mai) e 5,8%. Nel contratto attuale sono parametri del `Trader` e non decisioni della forma, ma potrebbero diventare numeri in più del genoma. **Non** copre le uscite relative al massimo raggiunto dopo l'acquisto, quelle dopo un certo numero di giorni e quelle che nascono dalla decisione della forma: questi tre casi sono proprio ciò che le vie 2 e 3 permettono di scrivere.

**Un caso concreto.** Si riprende la regola di uscita «prezzo sotto il 97% del massimo dopo l'acquisto» del capitolo 5. Sul dataset giocattolo il giorno 11 gli indicatori valgono prezzo 10,80, media lenta 10,88, media veloce 10,98, volume 1900. Con il registro a 0 (nessuna posizione) il programma risponde `hold`; con il registro a 11,35 (il massimo dopo l'acquisto) risponde `sell`. Con gli stessi ingressi, due risposte. Le tre vie si confrontano così:

| Via | Come si scrive «esci se il prezzo scende del 3% sotto il massimo dopo l'acquisto» | Che cosa serve in più |
|---|---|---|
| 1. Solo indicatori | Non si scrive esattamente. Si può approssimare con «prezzo sotto il 97% del massimo degli ultimi N giorni», che non dipende da quando si è comprato | Un indicatore di massimo degli ultimi N giorni |
| 2. Memoria interna | Si scrive esattamente, con un registro che segue il massimo dall'acquisto | Registri azzerati a ogni `reset()`, regole di aggiornamento nel genoma |
| 3. Stato del portafoglio fornito dal motore | Si scrive esattamente, con l'ingresso «massimo dall'acquisto» | Modifica del motore per fornire l'ingresso (il massimo va calcolato) |

Un'avvertenza dai capitoli: non tutte le memorie richiedono un registro. «Il volume è stato alto negli ultimi giorni» si ottiene con la media mobile del volume, cioè con un indicatore (via 1). Il caso che richiede davvero una memoria legata alla propria posizione è quello dell'uscita sul massimo dopo l'acquisto o del conteggio dei giorni dall'acquisto.

**Chi è toccato.** La domanda riguarda soprattutto alberi e reti. Il punteggio lineare e la lista di regole non hanno registri per natura: se si sceglie solo il punteggio lineare, la via 2 non si pone e restano la 1 e la 3. Il modello a stati nascosti ha già una memoria interna per costruzione: per la domanda 1 è una forma ammessa, e qui non c'è nulla da scegliere.

**Nei due percorsi.** Percorso 1: via 1; la via 3 è la prima estensione da considerare se manca un indicatore. Percorso 2: via 2 o via 3.

#### Domanda 3. Quanto pesa la leggibilità rispetto all'espressività?

**In parole semplici.** Quanto è importante poter dire, guardando un giorno del grafico, «ha comprato perché...», rispetto al poter scrivere regole più complesse? La rassegna non assegna pesi, perché sarebbe una scelta di valore. Il PoC (il prototipo nel browser) mostra giorno per giorno che cosa ha fatto la strategia, quindi una decisione che si spiega ha un valore diretto per chi guarda. Ma una forma che non sa scrivere ciò che serve lascia un buco che l'evoluzione non può riempire.

**Che cosa cambia nella pratica.** Con più peso sulla leggibilità si orienta la scelta verso il punteggio lineare, la lista di regole corta e gli alberi piccoli. Con più peso sull'espressività, verso alberi e reti, accettando che un albero cresca o che una rete abbia significato solo come insieme di pesi. In mezzo stanno la logica fuzzy e il modello a stati nascosti, che si leggono «con un calcolo» (ogni regola o regime si legge, la decisione finale richiede di aggregare).

**Un caso di leggibilità (dal capitolo 4).** Il giorno 11 il punteggio lineare compra. La spiegazione sta in una riga: `s = -0,76 (prezzo sotto la media lenta) + 0,94 (media veloce sopra la lenta) + 2,96 (volume 30% sopra il normale) = 3,14`, sopra la soglia di +3. Chi guarda il grafico vede quanto ha pesato ciascun ingresso. In una rete di 43 pesi la stessa domanda richiede di rifare l'intero calcolo dei neuroni nascosti (il capitolo 7 lo fa a mano per tre giorni, con 11 pesi). Anche un albero piccolo o una lista corta si spiegano in una riga: la leggibilità non obbliga al punteggio lineare, ma lo rende il caso più semplice.

**Un caso di espressività, costruito sul dataset giocattolo.** Si vuole una regola semplice: «non segnalare acquisto quando il prezzo è sotto la sua media, per quanto alto sia il volume». Il giorno 11 mostra il problema: il punteggio lineare segnala `buy` perché il volume alto compensa il prezzo sotto la media, e una somma pesata lascia sempre che un ingresso ne compensi un altro. L'albero e la lista di regole, che chiedono insieme «prezzo sopra la media e volume sopra la sua media», non segnalano acquisto (l'albero dice `sell`, la lista `hold`). Il capitolo 4 mostra anche che nessuna somma pesata riesce a imitare una regola del tipo «X e Y insieme» su quattro giorni scelti. Due note oneste: se qualcuno prepara come ingresso il prodotto dei due indicatori, anche il punteggio lineare lo usa (l'espressività si può comprare anche con indicatori più ricchi, a patto che qualcuno li pensi); e che la regola abbia senso finanziario non è stato accertato.

**Un caso realistico, non costruito per questa guida.** Una regola comune tra quelle di analisi tecnica è la «rottura confermata dal volume»: si compra quando il prezzo supera il massimo degli ultimi N giorni **e** il volume è sopra la sua media (la «rottura» e il massimo su N giorni sono descritti nell'appendice, sezione «Altri indicatori»). La fonte [6] (letto solo un riassunto di corso) riguarda regole su medie mobili e massimi e minimi combinate da operatori logici; che proprio questa combinazione compaia in [6] non è stato verificato **[ipotesi]**. Un punteggio lineare non la scrive come congiunzione: un volume molto alto può compensare un prezzo che non ha rotto il massimo. La scrive solo se qualcuno prepara un ingresso apposito, per esempio il prodotto dei due. Un albero o una lista di regole la scrivono con un «e» tra due confronti. Un secondo caso è l'uscita sul massimo dopo l'acquisto della domanda 2: la scrive soltanto una forma con memoria propria, o una forma qualunque che riceva lo stato del portafoglio fornito dal motore.

**Vantaggi e svantaggi.**

| Risposta | Vantaggi | Svantaggi |
|---|---|---|
| **Peso alto sulla leggibilità** | Le decisioni si spiegano al volo nel PoC. Pochi numeri, quindi meno spazio per adattarsi al rumore dei dati **[ipotesi]**. Più facile da provare e da correggere | Regole come «X e Y insieme» vanno preparate a mano come indicatori. Se un'idea utile non si può scrivere, l'evoluzione non la troverà mai. Si scopre che la forma non basta solo scrivendo il codice |
| **Peso alto sull'espressività** | Può scrivere congiunzioni, soglie condizionate, memorie su misura. Meno lavoro a mano per preparare indicatori. L'evoluzione può trovare regole che nessuno aveva previsto | Decisioni da spiegare con un calcolo. Alberi che crescono senza migliorare, reti con significato distribuito. Più spazio per adattarsi al rumore **[ipotesi]** |
| **In mezzo** (fuzzy, modello a stati nascosti, o una forma semplice con indicatori più ricchi) | Regole leggibili con passaggio graduale; oppure leggibilità della forma semplice con parte dell'espressività portata dagli indicatori. Si può passare a una forma più espressiva dopo aver visto dove la semplice non basta | Molti parametri (fuzzy). Vicinanza alla macchina a stati (modello a stati nascosti). Lavoro di scelta degli indicatori |

**Nei due percorsi.** Percorso 1: peso alto sulla leggibilità, con la forma minima come metro. Percorso 2: peso alto sull'espressività, con un limite di dimensione.

#### Domanda 4. Una forma o due? Una semplice e una ricca, o due dello stesso livello?

**In parole semplici.** L'implementazione del genoma scelto (E2) scrive il codice di una sola forma, o di due da confrontare? Le forme in gioco sono le candidate della rassegna: A (punteggio lineare, con la forma minima, cioè un solo indicatore e una sola soglia, come metro) e B (alberi di espressioni, solo indicatori); ma si possono proporre altre forme.

**Stima dello sforzo relativo [ipotesi].** Non si stimano giorni di lavoro. Si contano invece i pezzi di codice da scrivere, sulla base del contratto che ogni forma deve rispettare nel motore. La stima è dell'autore e non è stata provata.

**Perché non c'è una stima in giorni.** Il tempo dipende da chi scrive il codice e dagli strumenti, dalla risposta alla domanda 2 (i registri aggiungono due pezzi) e dalla forma scelta. E nessuna forma nuova è ancora stata scritta nel progetto: non c'è un tempo misurato su cui basarsi, e il ponte attuale della macchina a stati è corto perché riusa tutto Consilium, quindi non è un riferimento. Per stimarlo in modo onesto servirebbe scrivere in prova almeno un pezzo di una forma nuova (per esempio il valutatore di alberi) e misurarne il tempo, oltre a sapere quante persone ci lavorano.

| Pezzo da scrivere | A: punteggio lineare | B: alberi |
|---|---|---|
| Ingressi (indicatori calcolati dal motore) | sì (condiviso) | sì (condiviso) |
| Rappresentazione del genoma | elenco di circa 9 numeri (2 nella forma minima) | albero di nodi, con tipo (numero o vero/falso); nessun numero fisso |
| Regola di decisione | somma pesata e due soglie | valutatore che percorre l'albero |
| Genomi casuali | numeri entro intervalli | alberi casuali con limite di profondità |
| Mescolare due genitori | scelta o media dei numeri, soglie in ordine | scambio di sottoalberi che rispetti i tipi e la dimensione |
| Mutazione | piccoli spostamenti con limiti | tre tipi: costante, foglia, sottoalbero |
| Controllo della crescita | non serve | limite di dimensione o penalità |
| Salvataggio, descrizione e etichette per il PoC | tre etichette dalle fasce del punteggio | ramo che scatta, tre etichette |
| Se si ammettono i registri (domanda 2, via 2) | non applicabile | aggiornamento e azzeramento dei registri (2 pezzi in più) |
| **Totale pezzi** | **7** | **8 (10 con i registri)** |
| Test attesi, per gruppi | 5: decisione su tabella, mescolanza, mutazione nei limiti, azzeramento, salvataggio | 8: gli stessi più validità dei tipi, limite di dimensione, stesso albero stesso risultato |

Ne seguono le stime relative. **Solo A**: 7 pezzi e 5 gruppi di test. **Solo B**: 8 pezzi (10 con i registri) e 8 gruppi di test: il numero di pezzi è simile, ma quelli di B sono più complessi e i test più numerosi, perché lo spazio dei casi (alberi di forma qualsiasi) è molto più ampio, quindi lo sforzo in più di B sta nella complessità e nei test più che nel conteggio. **A e B insieme**: 14 pezzi (il calcolo degli ingressi si scrive una volta sola), più un pezzo per far girare il confronto sulla stessa fitness e sullo stesso protocollo: 15 in tutto, circa il doppio di A. Una forma nuova non ha codice da riusare tranne la classe base del motore, che già gestisce il `Trader` e l'ordine di aggiornamento.

**Due casi concreti, uno per lato.** *Si comincia da A.* A metà di E2 si vede che la regola «prezzo sopra la media lenta e volume sopra la sua media» serve davvero (il giorno 11 dell'esempio) e A non la scrive: si passa a B. Il calcolo degli ingressi e il contratto con il motore restano, il genoma e gli operatori di A no. *Si comincia con A e B insieme.* A metà di E2 si vede che gli alberi crescono senza migliorare (la condizione di scarto di B) e che A basta: il lavoro su B (valutatore ad albero, limite di dimensione, scambio di sottoalberi) è in gran parte perso, e si è pagata fin dall'inizio un'implementazione in più. In entrambi i casi il calcolo degli ingressi e il contratto con il motore restano.

**Vantaggi e svantaggi.**

| Scelta | Vantaggi | Svantaggi |
|---|---|---|
| **Solo A** | Meno test e pezzi più semplici. Forma leggibile, pochi numeri. Il risultato arriva prima | Se A non basta, lo si scopre dopo aver investito in A. Senza una forma ricca non si sa quanto manca. Le regole che A non scrive vanno preparate a mano come indicatori |
| **Solo B** | Copre ciò che A non scrive. Un solo codice da mantenere. Può esprimere come caso particolare un punteggio lineare **[ipotesi]** | Pezzi più complessi e più test. Più spazio per adattarsi al rumore. Nessun metro semplice con cui confrontarsi |
| **A e B insieme** | Confronto sulla stessa fitness e sullo stesso protocollo. La forma minima fa da metro. Si vede subito se la forma ricca non fa meglio su dati nuovi | Circa il doppio del lavoro di A. Due codifiche e due serie di operatori da mantenere. Due serie di risultati da leggere e da spiegare |
| **Due forme dello stesso livello** (per esempio punteggio lineare e lista di regole) | Si confronta la leggibilità a parità di semplicità | Resta aperto se serva una forma più espressiva |

**Nei due percorsi.** Percorso 1: solo A in E2, con B pronto come seconda fase se si verificano le condizioni di scarto. Percorso 2: A e B insieme, sullo stesso contratto.

#### Domanda 5. Si vuole l'esperimento nullo?

**In parole semplici.** L'«esperimento nullo» è questo: far evolvere ciascuna forma, con lo stesso budget di calcolo e la stessa fitness, su serie di prezzi **senza struttura prevedibile** (per esempio generate a caso, dove nessuna strategia dovrebbe funzionare), e misurare il divario tra il risultato sui dati usati per evolvere e quello su dati nuovi. Misura forma e fitness insieme, non la forma da sola.

**Perché serve.** Sui dati veri, un buon risultato in addestramento può venire da una regola vera o dal caso, e non si distinguono. Un esempio semplice: dieci lanci di moneta già avvenuti. Un «genoma» a un solo numero («sempre testa») ne indovina circa cinque. Un genoma con dieci numeri liberi, uno per lancio, ne indovina dieci su dieci, ma sui dieci lanci successivi ne indovina ancora circa cinque: il suo dieci su dieci era solo adattamento al caso. Il capitolo 2 mostra lo stesso effetto con il calendario «giorno 1 compra, giorno 7 vendi». Su una serie senza struttura si sa in anticipo che qualunque guadagno in addestramento è adattamento al caso, e il divario con i dati nuovi dice quanto ogni forma è incline a farlo. La rassegna sostiene che le forme con più numeri si adattano di più al rumore, ma è un'**[ipotesi]**, non una misura: l'esperimento la metterebbe alla prova.

**Che cosa costa.** Servono: un generatore di serie senza struttura; un ciclo che fa evolvere ogni forma su ciascuna serie, più volte; un rapporto che confronti il divario tra addestramento e dati nuovi. Il numero di valutazioni si ottiene moltiplicando: forme, serie, ripetizioni, genomi della popolazione e generazioni; ciascuna valutazione scorre circa 2517 barre. Come esempio di conteggio, non come proposta: 2 forme, 10 serie, 5 ripetizioni, una popolazione di 300 genomi (l'ordine di grandezza di quella di Consilium) e 100 generazioni fanno 100 evoluzioni e 3 milioni di valutazioni. Il codice in più è poco rispetto a E2, ma l'esperimento ha senso solo con almeno due forme già implementate e con il protocollo di valutazione definito. È fuori dal perimetro del ciclo 010.

**Perché non si può dare un tempo.** Il numero di valutazioni è un conteggio, ma quanto tempo richiedano non si può stimare in modo onesto adesso. Dipende da cose non ancora decise: quante forme (domanda 4), quante serie e ripetizioni, quanti genomi e quante generazioni (le fissano la ricerca sul protocollo di valutazione, R6, e quella sulla fitness, R5), e da quanto è veloce valutare un genoma, che non si sa finché nessuna forma nuova è implementata. Per stimarlo servirebbero tre cose: una forma già scritta, il tempo misurato per valutare un genoma sui 2517 giorni (anche su poche decine di genomi), e il numero di processi che si possono far girare in parallelo. Con questi dati il tempo si ottiene dividendo valutazioni per velocità. Senza, qualsiasi cifra in ore sarebbe inventata.

**Che cosa se ne farebbe.**

| Risultato | Che cosa suggerisce |
|---|---|
| La forma ricca ha un divario molto più grande della semplice | Limitare la forma ricca (limite di dimensione, penalità sulla complessità, protocollo più severo) oppure tornare alla semplice |
| Il divario è simile in tutte le forme | Il problema non è la forma: guardare la fitness e il protocollo di valutazione. La forma ricca può restare |
| Il divario è grande in tutte le forme | La fitness o il protocollo hanno un difetto che va corretto prima di scegliere una forma |

Non dice nulla sul comportamento sul mercato vero: dice solo quanto ogni forma si lascia ingannare dal caso.

**Vantaggi e svantaggi.**

| Risposta | Vantaggi | Svantaggi |
|---|---|---|
| **Sì, dopo E2** | Si misurano le forme davvero implementate. Si ha un dato prima di fidarsi dei risultati su dati veri. Non si scrive codice di prova che poi si butta | Costa codice e calcolo. Arriva dopo E2: la forma è già stata scelta. Un esito sfavorevole obbliga a tornare indietro quando il lavoro è già avanzato |
| **Sì, dopo la ricerca sul protocollo di valutazione (R6)** | Prova il protocollo vero, prima di E2. Un difetto del protocollo si scopre prima di scrivere le forme. Il risultato può orientare la scelta della forma | Servono comunque forme da far evolvere: o si anticipa parte di E2 o si usano prototipi. I prototipi possono non essere riusati. Costa calcolo prima di avere una forma scelta |
| **No** | Si risparmia lavoro. Si affida il controllo del sovradattamento al protocollo di valutazione e alle tre separazioni dei dati del capitolo 2. Nessun ritardo prima di E2 | Si resta con un'ipotesi non misurata. Se il rischio è reale, lo si scopre solo con i dati veri. Con due forme di dimensioni diverse non si ha un confronto del rischio di adattamento |

**Nei due percorsi.** Percorso 1: non adesso. Con una sola forma non c'è nulla da confrontare, e il tema si riapre dopo E2 se si aggiunge B. Percorso 2: sì, dopo E2 o dopo la ricerca sul protocollo di valutazione, perché con una forma ricca è proprio il rischio da misurare.

#### I due percorsi, a confronto

Ciascuno è una combinazione coerente di risposte. **Nessuno dei due è la scelta della guida**: sono due punti di partenza tra cui chi decide può scegliere, oppure combinare risposte diverse. I nomi descrivono soltanto la composizione.

| Domanda | Percorso 1: una forma sola, semplice | Percorso 2: due forme, una semplice e una espressiva |
|---|---|---|
| 2. Dove sta la memoria | Solo indicatori (via 1); lo stato del portafoglio fornito dal motore (via 3) se manca un indicatore | Memoria interna (via 2) o stato del portafoglio fornito dal motore (via 3) |
| 3. Leggibilità o espressività | Peso alto sulla leggibilità, forma minima come metro | Peso alto sull'espressività, con limite di dimensione |
| 4. Una forma o due | Solo A; B come seconda fase se servono congiunzioni o memoria propria | A e B insieme sullo stesso contratto |
| 5. Esperimento nullo | Non adesso; si riapre se si aggiunge B | Sì, dopo E2 o dopo la ricerca sul protocollo di valutazione |
| **Che cosa si guadagna** | Meno lavoro iniziale. Un risultato leggibile prima. Pochi numeri, quindi meno spazio per adattarsi al rumore **[ipotesi]** | Un confronto diretto tra una forma semplice e una espressiva fin dall'inizio. Meno lavoro a mano sugli indicatori. Le regole che la forma semplice non scrive sono già coperte |
| **Che cosa si rischia** | Scoprire dopo che A non basta, con lavoro da rifare in parte. Non sapere quanto manca senza una forma ricca. Preparare a mano come indicatori le regole che A non scrive | Circa il doppio del lavoro iniziale. Più spazio per adattarsi al rumore **[ipotesi]**. Risultati più difficili da spiegare |

Le risposte non sono tutte indipendenti. Se si sceglie solo A, la domanda 2 si riduce alla scelta tra le vie 1 e 3. Se si sceglie B con memoria interna, la domanda 5 pesa di più, perché lo spazio di ricerca cresce.

### 10.5 I candidati A e B, in parole semplici

La rassegna porta due candidati, scelti sulle caratteristiche delle forme e mai sul rendimento atteso. Non sono una decisione.

| | Candidato A: punteggio lineare con soglie | Candidato B: alberi di espressioni, solo indicatori |
|---|---|---|
| **Che cos'è** | Ogni indicatore ha un peso, si sommano i prodotti e due soglie traducono il totale in `buy`, `sell` o `hold` (capitolo 4) | Una formula ad albero, che l'evoluzione fa crescere e modifica, legge gli indicatori e restituisce la decisione (capitolo 5) |
| **Perché la rassegna lo propone** | Pochi numeri (9 con 6 ingressi di esempio, contro i 43 pesi di una rete di esempio), quindi meno spazio per adattarsi al rumore su 2517 barre di un solo titolo [4] **[ipotesi]**. Lettura diretta, crossover e mutazione semplici, memoria negli indicatori senza stato da azzerare. La forma minima fa da metro | Espressività universale e crossover naturale sui sottoalberi [5]; con gli algoritmi genetici è una delle forme più studiate per scoprire regole di trading con metodi evolutivi [7] (letto l'abstract). Copre ciò che A non rappresenta e può esprimere come caso particolare un punteggio lineare o una lista di regole **[ipotesi]** |
| **Condizioni di scarto** | Si passa a B se, scrivendo il codice, si vede che le decisioni utili richiedono congiunzioni tra indicatori (per esempio «prezzo sopra il filtro **e** volume sopra la media»), che una somma pesata non rappresenta, oppure se gli indicatori non bastano come memoria e serve uno stato proprio | Si passa ad A o alla lista di regole se la dimensione degli alberi cresce senza miglioramento della fitness [5], se gli alberi evoluti non si leggono più, o se il divario tra fitness sui dati di addestramento e su quelli di valutazione cresce con la dimensione |

**Che cosa significherebbe scegliere l'uno, l'altro o entrambi.** Le conseguenze per le ricerche successive sono un ragionamento dell'autore su come sono fatte le forme, non un risultato **[ipotesi]**.

| Ricerca | Scegliere A | Scegliere B | Scegliere entrambi |
|---|---|---|---|
| Indicatori (R2) | Sono l'unica memoria e vanno su scale simili; le combinazioni «X e Y» vanno preparate come ingressi | Un insieme di indicatori semplici, che l'albero combina da sé; va fissato l'elenco di operazioni ammesse | Un solo elenco valido per entrambe |
| Codifica genetica (R3) | Elenco di numeri; mescolare significa scegliere o fare la media; soglie da tenere in ordine | Albero; scambio di sottoalberi; limite di profondità o penalità sulla dimensione | Due codifiche e due serie di operatori |
| Equazioni di decisione (R4) | Somma pesata e due soglie: poca libertà, tutto è nei pesi | La decisione è il genoma stesso: l'equazione è ciò che evolve | Due equazioni da confrontare sugli stessi dati |
| Fitness (R5) e protocollo di valutazione (R6) | Meno rischio di adattarsi al rumore, ma servono comunque le tre separazioni dei dati e un voto che guardi il rischio | Rischio più alto di adattarsi al rumore, quindi il protocollo pesa di più | Si confrontano le due forme con la stessa fitness e lo stesso protocollo |
| Implementazione (E2) | Un'implementazione semplice (7 pezzi, sezione 10.4); tre etichette | Un valutatore di alberi e un limite di dimensione (8 pezzi); etichette dalle azioni | Due forme sullo stesso contratto più il codice di confronto (circa 15 pezzi) |

**E le altre forme?** La lista di regole, le reti, il fuzzy e il modello a stati nascosti non sono candidate, ma non per un difetto dimostrato: la rassegna ha voluto pochi candidati e li ha scelti sulle caratteristiche descritte nei capitoli. Ciascuna offre qualcosa di preciso: la lista di regole, leggibilità con congiunzioni; le reti, funzioni continue qualsiasi; il fuzzy, passaggio graduale tra le decisioni; il modello a stati nascosti, una memoria di regime. I motivi della rassegna: per il modello a stati nascosti, la stima dei parametri senza anticipazione dei dati e il fatto che non si è trovata alcuna fonte sul suo uso con un algoritmo genetico nel trading; per le reti e il fuzzy, che non si è trovato un criterio per cui servano rispetto ad A e B **[ipotesi]**. Quel criterio dipende dalla domanda 3: con più peso sull'espressività le reti rientrano in gioco, con più peso sulla leggibilità la lista di regole può sostituire B. Chi decide, se dà valore a ciò che una di queste forme offre, può proporla al posto di A o di B.

### 10.6 Che cosa non si è potuto accertare

Spostata nell'appendice, sezione «Dal capitolo 10: che cosa non si è potuto accertare» (serve a chi controlla le fonti e il codice e non cambia le scelte sopra).

I riferimenti al codice usati in questo capitolo sono nell'appendice, sezione «Riferimenti al codice: capitolo 10».

## 11. Appendice: approfondimenti

Materiale per chi vuole approfondire: dettagli che nel corpo dei capitoli avrebbero interrotto la lettura. Ogni sezione dice da quale capitolo viene; i capitoli rimandano qui per nome.

### Dal capitolo 1: Altri indicatori

Non tutti gli indicatori si ottengono con una media. Quattro esempi, senza calcolo, che compaiono nei capitoli successivi o nella letteratura. Gli esempi della guida non li usano, e le descrizioni sono conoscenza generale senza una fonte letta per questa guida. [ipotesi]

- **RSI** (relative strength index, indice di forza relativa): confronta la grandezza media dei rialzi con quella dei ribassi recenti e la trasforma in un numero tra 0 e 100. I valori alti si leggono come «ipercomprato» (il titolo è salito molto in fretta), quelli bassi come «ipervenduto»; le soglie con cui si distinguono non sono fissate qui. Contiene un rapporto, quindi non è una combinazione lineare dei prezzi passati (una somma pesata, come nel capitolo 4).
- **Massimi e minimi su N giorni**: il prezzo più alto e più basso degli ultimi N giorni. Servono per regole del tipo «compra se il prezzo supera il massimo degli ultimi 20 giorni» (si parla di «rottura»). Non sono una somma: non sono lineari.
- **Stocastico**: dice dove si trova il prezzo di oggi dentro l'intervallo tra il minimo e il massimo degli ultimi N giorni, da 0 (sul minimo) a 100 (sul massimo).
- **ATR** (average true range, escursione media vera): misura quanto il prezzo si muove in un giorno, includendo i salti tra la chiusura di ieri e l'apertura di oggi. Dice quanto è «nervoso» il titolo, non in che direzione va.

Quali indicatori usare davvero è un compito di ricerca a parte (R2, la ricerca sugli indicatori da usare): vedi il [Catalogo degli indicatori del genoma](../genome-indicators-catalog/).

### Dal capitolo 2: Crossover e mutazione per le sette forme

La tabella è l'anticipazione dei capitoli dedicati a ciascuna forma. Conviene leggerla dopo aver visto le forme: usa termini che il capitolo 2 non ha ancora spiegato (NEAT, marcatori storici, funzioni di appartenenza, matrice di transizione, regimi, rinormalizzazione). I conteggi di geni sono quelli della rassegna e si riferiscono ai sei ingressi di esempio. Per la macchina a stati la riga descrive l'algoritmo genetico vero di Consilium (si veda la sezione «Come funziona l'algoritmo genetico di Consilium»), non il codice del browser.

| Forma | I geni sono... | Crossover | Mutazione |
|---|---|---|---|
| **Lineare** (punteggio con soglie) | un vettore di numeri: un peso per indicatore, una costante, due soglie (9 numeri con 6 ingressi di esempio) | scambio di geni tra genitori, o media aritmetica come il genoma 9 della sezione 2.4 | piccola variazione casuale di un numero, come la mutazione della sezione 2.4 |
| **Albero di espressioni** (programmazione genetica) | i nodi di un albero di operazioni e indicatori, di forma e dimensione variabili | scambio di sottoalberi tra due genitori [5] | sostituzione di un nodo o di un sottoalbero con uno casuale |
| **Lista di regole** | una lista ordinata di regole «se condizione allora azione» con margini numerici | scambio di regole, con cautela perché l'ordine cambia il significato; i margini si mescolano facilmente | cambio di un margine, di un indicatore, di un'azione; aggiunta o rimozione di una regola |
| **Rete neurale** | i pesi di una rete (43 con la rete di esempio), e per NEAT anche la sua struttura [1] | scambio di pesi, delicato perché due reti equivalenti con neuroni in ordine diverso danno figli scadenti; NEAT usa marcatori storici per allinearle [1] | variazione di un peso; in NEAT aggiunta di un neurone o di una connessione |
| **Fuzzy** (logica sfumata) | i parametri delle funzioni di appartenenza (54 con 6 ingressi di esempio) e la base di regole | scambio di parametri o di regole, mantenendoli ordinati e dentro l'intervallo ammesso | variazione di un parametro o di una regola |
| **Modello a stati nascosti (HMM)** | medie e varianze di ogni regime, matrice di transizione e mappa regime-azione (circa 44 numeri con 3 regimi) | delicato: permutare i regimi dà lo stesso modello con numeri diversi, e le righe della matrice devono sommare a 1 | variazione di un parametro, poi rinormalizzazione delle righe |
| **Macchina a stati attuale** | 11 numeri continui più la struttura (nove stati con liste di condizioni) | lista per lista: per ogni lista di condizioni di ogni stato si prende quella di un genitore o dell'altro; i numeri continui si scelgono uno per uno | variazione additiva dei coefficienti delle medie (al massimo 0,125, tra 0,01 e 1), dei margini, di stop loss e take profit; in una lista si cambia, si aggiunge o si toglie una condizione |

Il giudizio su quanto ciascun crossover sia «sensato» è dell'autore della rassegna ed è un criterio che i capitoli seguenti riprendono, forma per forma. Le celle senza un numero di riferimento tra parentesi quadre (tutte le righe tranne alberi e reti) sono valutazioni dell'autore, non risultati di una fonte; l'ultima riga è invece letta dal codice. [ipotesi]

### Dal capitolo 2: Come funziona l'algoritmo genetico di Consilium

Il motore genetico di Consilium è nel file `ga/ga.js` del repository Consilium (branch `experiment/lb77`). Il capitolo 2 ne richiama solo il principio. Qui i dettagli, per chi vuole capire che cosa fa davvero.

- **Voti.** Il primo voto è il CAGR dell'individuo (campo `cagr`). Il secondo è il rapporto tra due numeri di un campo `success_rate` scritto come `num:den` (se `den` è zero si usa 0,5). Che `den` conti le operazioni perdenti è un'ipotesi: dal codice si legge solo il rapporto tra i due numeri. [ipotesi]
- **Come nasce un individuo.** Se la popolazione è abbastanza grande, con probabilità circa 0,666 si fa un crossover tra due genitori e poi una mutazione; altrimenti si crea un individuo del tutto casuale.
- **Scelta dei genitori.** Il primo genitore è scelto per CAGR, a meno che la popolazione superi 300 individui, caso in cui si usa la proporzione di operazioni vincenti; il secondo è sempre scelto per la proporzione di operazioni vincenti. La scelta è un **torneo**: si pescano 3 individui a caso e vince il migliore.
- **Crossover.** Per i numeri continui (coefficienti delle medie, margini, percentuali, stop loss e take profit) si prende ogni numero da uno dei due genitori con probabilità 1/2. Per gli stati, si scorre ogni stato e, dentro lo stato, ogni lista di condizioni (una per stato di arrivo): si sceglie a caso la lista del genitore 1 o del genitore 2. Non si scambiano quindi stati interi.
- **Mutazione.** Ogni numero è modificato con probabilità 0,0666. I coefficienti delle medie si spostano di una quantità casuale tra -0,125 e +0,125 e restano tra 0,01 e 1,0: i valori 0,73 e 0,99 del genoma fisso sono quindi raggiungibili. Per le liste di condizioni, con la stessa probabilità si sostituisce una condizione con una a caso (e, con la stessa probabilità, si toglie la prima); con probabilità pari alla metà si aggiunge una condizione in fondo.
- **Il fork del browser.** In `src/vendor/consilium/individual.js` del progetto SwarmTrader-core c'è una versione ridotta, portata nel browser, che non è il codice che ha prodotto il genoma fisso. Lì il crossover scambia **stati interi** e la mutazione dei coefficienti ha limiti diversi. Gli esempi di crossover per stati interi nei capitoli 2 e 3 sono quindi una variante, non il comportamento di Consilium.

### Riferimenti al codice: capitolo 1

Una voce per ogni citazione tolta dal testo del capitolo 1.

- Dati di ENI (sezione 1.1.2): 2517 barre giornaliere nel file `src/data/eni-ohlcv.json`.
- Ordine delle operazioni a ogni barra (sezione 1.1.5): `src/engine/strategy.js`, classe `StrategyIndividual` (aggiornamento indicatori, esecuzione dell'ordine della barra precedente, nuova decisione).
- Formula della EMA nel codice (sezione 1.4): `src/vendor/consilium/algorithm.js`, righe 369-372:

```
this.ema = this.ema * (1 - this.IIR_COEFF) + actualValue * this.IIR_COEFF;
```

- Coefficiente di `iir_price_2` (sezione 1.4): `src/engine/genome.js`, riga 15 (c = 0,99).
- Contratto di strategia (sezione 1.6): `src/engine/strategy.js` e sezione «Strategy contract» di `docs/architecture/simulator-overview.md`. La classe base richiede i metodi `init`, `feed`, `reset`, `getCAGR`, `getPerformanceSummary`, `describe`, `serialize`, più le proprietà `kind`, `labels` e `trader`.

### Riferimenti al codice: capitolo 2

Una voce per ogni citazione tolta dal testo del capitolo 2.

- Formula della EMA (sezione 2.2): `src/vendor/consilium/algorithm.js`, righe 369-372 (la stessa riga di codice riportata sopra).
- Funzioni di voto (sezione 2.7.2): `ga/ga.js`, repository Consilium, `GetAnnualGrowthRate` alla riga 85 e `GetSuccessRatio` alla riga 89.
- Scelta dei genitori (sezione 2.7.2): `CreateIndividual` in `ga/ga.js`, a partire dalla riga 208; soglia di popolazione `MAX_POPULATION_REQUIRED` = 300 (riga 12); torneo di 3 individui in `tournamentSelection`, righe 102-113.
- Crossover e mutazione (sezioni 2.7.2 e 2.8): `ga/ga.js`, righe 115-206 (crossover da riga 115, mutazione da riga 148); probabilità di mutazione `gaParams.MUTATION_PROBABILITY` = 0,0666 (riga 14).
- Fork del browser (sezione 2.8): `src/vendor/consilium/individual.js`, mutazione a partire dalla riga 191 e crossover alle righe 350-380 circa.
- Rapporto sugli esperimenti (sezione 2.6.6): `archive/reports/2026-09-12_train-test-holdout-experiments.md` nel repository Consilium, riferimento [18].

### Dal capitolo 3: la griglia e i nomi delle uscite

#### Come sono scritte le uscite nel genoma

Ogni stato ha quattro liste di condizioni, una per direzione (nord, est, sud, ovest). Nel file del genoma ogni lista porta una chiave che comincia con un trattino basso e indica uno stato di arrivo: la chiave `_SW` dello stato NW è la lista che porta a SW, la chiave `_0` indica il centro C. Nel motore, però, non è il nome della chiave a decidere dove si va: il motore associa a ciascuna direzione una chiave fissa, per ogni stato (per NW, per esempio: nord = `_SW`, est = `_N`, sud = `_W`, ovest = `_NE`), e la destinazione è lo stato vicino sulla griglia in quella direzione. Per questo la lista a nord di NW porta a SW (nella griglia avvolta il vicino a nord di NW è SW) e il nome della chiave coincide con la destinazione.

In 35 liste su 36 il nome della chiave coincide con il vicino sulla griglia. L'eccezione è lo stato SW: la lista a sud ha chiave `_SW` (cioè se stesso), ma il vicino a sud di SW sulla griglia avvolta è NW.

#### La stranezza dello stato SW: che cosa risulta dal codice

- Il collegamento è presente anche nell'implementazione di Consilium in JavaScript (la copia del codice dell'algoritmo che non è nel PoC), non solo nella copia del PoC: la riga che costruisce lo stato SW è identica. Quindi non è una svista della copia nel browser.
- Non ho potuto consultare il sorgente C++ originale, quindi **resta aperto** se sia voluto o un residuo della traduzione.
- Per il genoma fisso la questione **non ha effetto**: la lista in questione (`[3, 9, 9, 3, 2, 4]`) contiene la condizione 2 e la 3 insieme, cioè «prezzo sopra» e «prezzo sotto» lo stesso filtro, e non può mai essere vera. Un controllo sui 2516 giorni ENI con una riscrittura indipendente della regola «prima lista vera in ordine nord, est, sud, ovest» riproduce lo stato del motore in tutti i giorni.

### Dal capitolo 3: conteggi sul genoma fisso

| Elemento | Valore |
|---|---|
| Stati | 9 |
| Transizioni (liste di condizioni) | 36, quattro per stato |
| Identificatori di condizione in totale | 135 |
| Lunghezza di una lista | da 1 a 8, media 3,75 |
| Identificatori diversi usati | 13 (da 0 a 12; il 13 non compare, vedi sezione 3.5.1) |
| Liste che contengono lo 0 e quindi non scattano mai | 7 |
| Liste che contengono lo 0 oppure due condizioni opposte (2 e 3, 4 e 5, ...) e quindi non possono scattare | 16 |
| Liste fatte solo di 1 e quindi scattano sempre | 2 (NW verso sud, C verso nord) |
| Numeri continui (4 coefficienti, percentuale investita, 4 margini, stop loss, take profit) | 11 |
| Liste che scattano almeno una volta nel replay ENI (2516 giorni) | 10 su 36 |

Quante volte è vera ciascuna condizione nei 2516 giorni del replay ENI (condizioni da 0 a 13): 0, 2516, 1011, 1505, 2516, 0, 2497, 19, 906, 1610, 541, 1975, 662, 1854. Giorni passati in ciascuno stato: W 1048, NE 437, SE 431, NW 410, SW 178, N 12; C solo il giorno di partenza. Sono conteggi descrittivi del meccanismo, non risultati.

### Dal capitolo 3: come evolve il genoma in Consilium

#### Il GA di Consilium

L'algoritmo genetico che ha prodotto il genoma fisso è quello del progetto Consilium (ramo sperimentale `experiment/lb77` del suo repository), non la copia vendorizzata nel PoC. Per ogni nuovo individuo: con probabilità 0,666, se la popolazione della partizione ha almeno 20 individui, nasce da due genitori scelti per torneo (tre candidati a caso, vince il migliore) e da crossover più mutazione; altrimenti nasce casuale.

- **Individuo casuale.** Coefficienti dei filtri uniformi in [0, 1); percentuale investita in [0, 100); margini piccoli, con segno; stop loss in [0, 50); take profit in [0, 5,8) con distribuzione verso i valori bassi. Per ogni stato, quattro liste con identificatori distinti tra 0 e 12, lunghe da 1 a 6 (di solito 1). Due stati scelti a caso hanno l'azione `buy` e `sell`.
- **Crossover.** Per ognuno degli 11 numeri continui si sceglie il genitore con probabilità metà. Per ogni stato e per ogni chiave del suo contenuto (le quattro liste e l'eventuale azione), si sceglie il genitore con probabilità metà, purché la chiave esista in entrambi. Quindi: scelta lista per lista, non stato per stato; e l'azione di uno stato passa al figlio solo se entrambi i genitori ce l'hanno nello stesso stato (dal codice; non verificato con un'esecuzione).
- **Mutazione.** Probabilità 0,0666 per gene. Coefficienti dei filtri: spostamento uniforme in [-0,125; +0,125], poi tenuto in [0,01; 1,0]. Percentuale investita e margini: spostamento in [-5; +5], con limiti propri (margine prezzo 1 e volume 1 non sotto 0,1; margine prezzo 2 e volume 2 non sotto -100; tutti non sopra 100). Stop loss: spostamento fino a ±6,25, limite 0,1-50. Take profit: spostamento fino a ±0,725, limite 0,1-5,8. Liste: con probabilità 0,0666 un identificatore a caso è sostituito da uno tra 0 e 12 e, con la stessa probabilità, viene tolto il primo; altrimenti, con probabilità 0,0333, si aggiunge un identificatore in fondo. **Le azioni degli stati non vengono mai mutate.**

Conseguenze usate nel capitolo: 0,73 e 0,99 sono raggiungibili (limite 1,0); l'identificatore 13 non viene mai generato (il numero di condizioni usato dal GA è 13, valori da 0 a 12), pur esistendo nel motore; stop loss 50 e take profit 5,8 del genoma fisso sono esattamente i massimi consentiti dal GA. Una lista a un solo elemento, se mutata con la rimozione del primo, diventa vuota, e una lista vuota è sempre vera (AND di nessuna condizione).

#### La copia del PoC

Il PoC contiene una copia di codice di Consilium adattata al browser, con un proprio crossover (per stato intero: ogni stato è copiato da uno dei due genitori) e una propria mutazione (coefficienti dei filtri tenuti in [0,001; 0,5], aggiunte e rimozioni di identificatori con altre probabilità). Non è il GA che ha prodotto il genoma fisso e il PoC non la esegue: l'oggetto che fa girare il replay restituisce sempre lo stesso individuo. La mutazione degli stati di questa copia agisce sulle chiavi `_N`, `_E`, `_S`, `_W`, che non corrispondono alle chiavi del genoma (nominate con lo stato di arrivo): se fosse usata, toccherebbe liste sbagliate o ne creerebbe di nuove. È un problema di quella copia, non del GA di Consilium.

#### Che cosa resta aperto

Come sia stato prodotto precisamente il genoma fisso (quale partizione, quante generazioni) non risulta dai materiali letti. Che stop loss e take profit siano ai massimi del GA è un fatto osservato; la causa non è accertata. Che l'assenza di un'azione `sell` nel genoma fisso derivi da come il crossover tratta le azioni è un'ipotesi coerente col codice, non verificata **[ipotesi]**.

### Riferimenti al codice: capitolo 3

Una voce per ogni citazione tolta dal testo del capitolo. I percorsi sono nel repository del PoC (`SwarmTrader-core`) salvo dove è indicato Consilium.

- Genoma fisso: `src/engine/genome.js`, righe 13-36 (`FIXED_GENOME`); nomi degli stati, riga 4 (`GENOME_STATES`); azioni `buy` e `sell`, righe 58-61; percentuali divise per 100 con `toFraction`.
- Che cosa decide ogni giorno: `src/vendor/consilium/algorithm.js`, righe 365-417 (aggiornamento dei filtri, controllo della transizione, richiesta dell'acquisto).
- Prezzo del giorno come media di apertura, massimo, minimo e chiusura: `src/vendor/consilium/stockStream.js`, righe 32-34.
- Griglia: costruzione degli stati, `algorithm.js` righe 289-303 (lo stato SW alla riga 301); vicini della griglia avvolta, righe 305-335; stato di partenza C, righe 270-271 e 358 (`init()`, righe 342-359; `reset()`, righe 422-446); traduzione dal C++, riga 3.
- Collegamento di SW in Consilium (JavaScript): `public/src/algorithm.js` nel repository Consilium, riga 301.
- Filtri EMA: `algorithm.js`, righe 369-372. Margini: righe 381-384.
- Le quattordici condizioni: `algorithm.js`, righe 20-62. Valutazione di una lista, `evaluateConditions`, righe 135-170. Scelta della transizione, `getNextState`, righe 177-193.
- Ordine delle operazioni del Trader (un `buy` fissa lo stato di acquisto, `update` esegue l'ordine alla barra successiva, anche con una posizione già aperta se c'è denaro): `src/vendor/consilium/trader.js`, righe 372-399 e 430-437.
- Soglie di stop loss e take profit: `src/vendor/consilium/portfolio.js`, righe 62-71 (stop loss se il minimo del giorno tocca la soglia, take profit se lo fa il massimo).
- GA di Consilium: `ga/ga.js` nel repository Consilium (ramo `experiment/lb77`): parametri, righe 10-23; creazione dell'individuo (casuale o per crossover), righe 208-286; crossover, righe 115-146; mutazione, righe 148-206; selezione per torneo, righe 102-113.
- Copia del PoC: `src/vendor/consilium/individual.js`, righe 191-380 (mutazione e crossover; limiti dei coefficienti da riga 196; `mutateFloat` riga 271; `mutateRawState` righe 323-345); `src/engine/fixedGenomeGA.js` (il GA che restituisce sempre lo stesso individuo).
- Integrazione: `src/engine/fsmStrategy.js` (classe `FsmIndividual`, funzione `createFsmFactory`, metodi `describe()` e `serialize()`; i quattro filtri sono esposti come `iirPrice1`, `iirPrice2`, `iirVolume1`, `iirVolume2`).
- Costo di calcolo per barra: stima a mano su `algorithm.js`, righe 365-417 **[ipotesi]**.
- Rapporto sugli esperimenti [18]: `archive/reports/2026-09-12_train-test-holdout-experiments.md` nel repository Consilium.

### Dal capitolo 4: il filtro alfa-beta, Holt e Kalman

#### Forma del filtro e parentela con la media mobile esponenziale

Con `l` livello, `v` pendenza, `p` prezzo, il filtro alfa-beta del capitolo calcola `previsto = l + v`, `residuo = p - previsto`, `l_nuovo = previsto + alfa · residuo`, `v_nuovo = v + beta · residuo`. Se la pendenza fosse sempre zero la correzione del livello sarebbe `l_nuovo = l + alfa · (p - l)`, che è la formula della media mobile esponenziale (vedi 1.3) con `c = alfa`. Il filtro alfa-beta aggiunge quindi alla EMA una seconda grandezza, la pendenza, che «anticipa» dove va il livello.

#### Parentela con il metodo di Holt

Il metodo lineare di Holt [15] aggiorna livello e pendenza con due costanti di livellamento, `alfa` e `beta*`: `l_nuovo = alfa · p + (1 - alfa) · (l + v)` e `v_nuovo = beta* · (l_nuovo - l) + (1 - beta*) · v`. Il filtro alfa-beta del capitolo coincide con questa forma quando `beta = alfa · beta*`. È un controllo algebrico dell'autore, non una frase della fonte: sul dataset giocattolo (`alfa` = 0,5, `beta` = 0,2, quindi `beta*` = 0,4) i due procedimenti danno livello e pendenza che differiscono al più di 2e-15, cioè per arrotondamento.

#### Parentela con il filtro di Kalman

Il filtro di Kalman [3] è un procedimento ricorsivo che, per un modello lineare con disturbi di tipo gaussiano, calcola a ogni passo un coefficiente di correzione («guadagno») ottimo. Nell'esempio i due coefficienti sono fissi (`alfa` e `beta`) e decisi dal genoma: non si calcola nessun guadagno ottimo. Che un filtro di Kalman con guadagni a regime coincida con un livellamento esponenziale doppio è una proprietà che non è in nessuna delle fonti lette: **[ipotesi, fonte da verificare]**. L'ipotesi che i prezzi giornalieri abbiano disturbi gaussiani è dubbia, perché le serie reali hanno code più pesanti **[ipotesi]**.

#### Verifiche numeriche usate nel capitolo

Tutta la tabella 4.5.3 (previsto, residuo, livello, pendenza, percentuale), il valore finale 1026,78 (+2,68 per cento) e quello con `beta` = 0,1 (944,44, -5,56 per cento) sono stati ricalcolati con un programma sul dataset giocattolo.

### Riferimenti al codice: capitolo 4

- Formula della media esponenziale: `src/vendor/consilium/algorithm.js`, righe 369-372.
- Contratto di strategia: `src/engine/strategy.js`, righe 12-87. La funzione `assertStrategy` (righe 12-33) richiede `kind`, `labels`, `trader` e i metodi `init`, `feed`, `reset`, `getCAGR`, `getPerformanceSummary`, `describe`, `serialize`; la classe base `StrategyIndividual` (righe 35-87) fornisce già `init`, `feed`, `reset`, `getCAGR` e `getPerformanceSummary`, e il Trader. Le strategie diverse dalla macchina a stati scrivono i ganci `initIndicators`, `updateIndicators`, `resetIndicators` e `decide`, più `describe` e `serialize`.
- Il GA chiama `crossover` e `mutate` degli individui: `src/vendor/consilium/ga.js`, righe 116-125 e 345-351.
- Reimpostazione dello stato del filtro di Kalman: il gancio `resetIndicators()`.

### Dal capitolo 5: Altre rappresentazioni della programmazione genetica

Il capitolo 5 usa la rappresentazione ad albero, quella classica. Esistono altre rappresentazioni; nessuna è un candidato di questa guida, e si descrivono qui per chi vuole approfondire [5].

#### GP lineare

Il programma è una **sequenza di istruzioni** del tipo `R1 = R1 + P`, `R2 = R1 > S`, eseguite una dopo l'altra; i registri sono la memoria di lavoro. Il crossover scambia segmenti di istruzioni tra genitori. I registri esistono già dentro un singolo giorno; farli durare da un giorno al successivo è la variante «con memoria interna» del capitolo 5 (sez. 7.1 di [5]).

#### Evoluzione grammaticale

Il genoma è una stringa di interi che una grammatica traduce in un programma o in una regola. Cambiando la grammatica cambia la famiglia di forme raggiungibili senza cambiare l'algoritmo di ricerca: è un meccanismo di codifica, che spetta alla ricerca sulla codifica genetica (R3), e non una forma. Una grammatica che riproducesse una macchina a stati ricreerebbe la forma che si vuole lasciare. La fonte [16] (Ryan e coautori, letta la sola scheda con l'abstract) dice che l'uso delle grammatiche distingue questo metodo; la descrizione della codifica come stringa di interi non è sostenuta da quella scheda [ipotesi].

#### GP cartesiana (CGP)

Il genoma è una lista di interi a lunghezza fissa che descrive un grafo di funzioni (un nodo può servire a più nodi). Tradizionalmente evolve per sola mutazione (sez. 7.2.3 di [5]); non si è letto altro, quindi il dettaglio non è descritto [ipotesi].

### Dal capitolo 5: Etichette (`labels`) per l'albero

Il contratto della strategia richiede una lista **fissa e finita** di etichette (gli «stati» che il motore mostra a schermo, per ogni giorno). Un albero non ha stati. Due modi di derivarle:

- **Le tre azioni.** L'etichetta di un giorno è `buy`, `sell` o `hold`, cioè la foglia che scatta. Per l'albero T1: 3 etichette. È semplice ed è ciò che la rassegna propone per la lista di regole.
- **Fasce dell'uscita**, per gli alberi numerici con soglie: etichetta bassa, media, alta.

Per un albero che decide direttamente, l'etichetta naturale sarebbe **il ramo che scatta** (nella tabella 5.3.2, il ramo `buy`, `sell` o `hold`). Un'etichetta per ogni foglia dell'albero non funzionerebbe come lista fissa, perché ogni albero ha un numero diverso di foglie; per questo si ricade sulle tre azioni. L'uscita numerica o i confronti intermedi si possono comunque esporre tra gli `indicators` del `describe()` (il metodo con cui la strategia espone al motore i numeri da mostrare). La rassegna segnala come estensione del contratto, da trattare nell'implementazione del genoma scelto (E2), il fatto che nessuna forma continua abbia etichette «naturali».

### Dal capitolo 6: Learning classifier system (stili Michigan e Pittsburgh)

I **learning classifier system** (LCS) sono sistemi che fanno evolvere regole del tipo «se condizione allora azione» con metodi genetici. Esistono due famiglie:

- **Michigan.** Ogni individuo dell'algoritmo genetico è **una regola**; la popolazione intera è la strategia. A ogni regola si associa un valore di forza (o di idoneità), appreso dall'esperienza: le regole che hanno portato buoni risultati vengono rafforzate.
- **Pittsburgh.** Ogni individuo è un **insieme completo di regole**, cioè una strategia intera; l'algoritmo genetico valuta l'insieme e lo fa evolvere come un genoma qualsiasi.

La lista di regole del capitolo 6 è più vicina allo stile Pittsburgh, perché un genoma contiene tutto l'insieme di regole ed è valutato per intero. In un LCS Pittsburgh le regole di solito non hanno un ordine e, quando più regole scattano, si ricorre a un voto tra le regole; nella lista c'è un ordine e vince la prima, e c'è un default. Nello stile Michigan l'individuo del GA sarebbe una singola regola e la strategia sarebbe l'intera popolazione: questo è in tensione con l'ipotesi del contratto del progetto, «un genoma è una strategia». Per questo gli LCS non sono portati a scheda nella rassegna e restano una nota. Tutto questo viene dalla conoscenza generale dell'autore ed è `[ipotesi, fonte da verificare]`: la fonte nota (Urbanowicz e Moore, 2009) è stata identificata ma non letta nel testo, non è numerata fra i riferimenti e non è usata come prova.

### Riferimenti al codice: capitoli 5 e 6

Una voce per ogni citazione spostata fuori dal corpo dei capitoli 5 e 6.

| Dove nel capitolo | File | Righe | Che cosa c'è |
|---|---|---|---|
| 5.7, schema `StrategyIndividual` con i ganci `initIndicators`, `updateIndicators`, `resetIndicators`, `decide` | `src/engine/strategy.js` | 35-87 | Classe base delle strategie: possiede il `Trader` e definisce i ganci da implementare |
| 5.7 e 6.9, `crossover` e `mutate` chiamati dal GA | `src/vendor/consilium/ga.js` | 116-125 e 345-351 | Il GA del fork del browser chiama `parent1.crossover(parent2)` e `child.mutate(...)` (come riportato dalla rassegna) |
| 6.9, `hold` come assenza di chiamate a `buy()` e `sell()` | `src/engine/strategy.js` | 46-55 | Il metodo `feed`: aggiorna gli indicatori, fa eseguire al `Trader` l'ordine della barra precedente, poi chiama `decide()` e inoltra `buy` o `sell` |
| 6.2.1 (ora in 1.3), formula della media mobile esponenziale | `src/vendor/consilium/algorithm.js` | 369-372 | `ema = ema * (1 - c) + valore * c`, per i filtri del prezzo e del volume |
| 5.5.3-bis, la strategia ha un proprio `trader` | `src/engine/strategy.js` | 37 | Il costruttore di `StrategyIndividual` crea `this.trader` |
| 5.5.3-bis, stato della posizione | `src/vendor/consilium/trader.js` | 527-538 (`getState`, `isHolding`) | Dicono se si è in posizione |
| 5.5.3-bis, posizioni aperte con prezzo e momento di acquisto | `src/vendor/consilium/portfolio.js` e `trader.js` | `portfolio.js` 12-19 (`Position`: `entryTime`, `stock_data.open`) e 443 (`getPositions()`); `trader.js` `broker.portfolio` | Ogni posizione aperta ha il momento di acquisto (un'ora, non un conteggio di barre) e il prezzo di apertura della barra di acquisto. Non esiste un campo «giorni di borsa dall'acquisto» né «massimo dopo l'acquisto»: vanno calcolati dal motore o dalla strategia [ipotesi: come il motore passerebbe G alla forma non è stato stabilito] |
| 5.5.3-bis, ordine delle operazioni in una barra | `src/engine/strategy.js` | 46-55 | Quando la forma decide, il `Trader` ha già eseguito l'ordine del giorno prima: lo stato del portafoglio è già aggiornato |

### Dal capitolo 7: NEAT in dettaglio

Il capitolo 7 (sezione 7.4) spiega l'idea di NEAT e mostra un disegno prima e dopo la prima mutazione. Qui c'è il resto del meccanismo, con i numeri. Numeri di esempio inventati: mostrano il meccanismo, non dicono nulla sulla qualità della forma.

#### I geni e le due mutazioni

**Rete 0 (minima).** Tre connessioni, nessun neurone nascosto: `y = 0,20*x1 + 0,10*x2 - 0,30*x3`.

| Innovazione | Da | A | Peso | Stato |
|---|---|---|---|---|
| 1 | i1 | o | 0,20 | attivo |
| 2 | i2 | o | 0,10 | attivo |
| 3 | i3 | o | -0,30 | attivo |

**Mutazione 1: aggiunta di un neurone `n` sul collegamento 1.** NEAT disattiva la connessione 1 e ne crea due: da `i1` a `n` con peso 1,0 e da `n` a `o` con il peso della connessione spezzata (0,20) [1].

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

La mutazione 1 non lascia l'uscita invariata: `tanh` schiaccia `x1` (2,22 diventa 0,98, 5,39 diventa 1,00). L'effetto è piccolo per ingressi vicino a zero e più grande per ingressi grandi. La mutazione 2 aggiunge invece un termine nuovo a `n`. NEAT non garantisce che la rete resti uguale: garantisce solo che la perturbazione non sia distruttiva [1].

#### Geni corrispondenti, disgiunti e in eccesso; speciazione

Ogni connessione porta il suo numero di innovazione, assegnato quando compare per la prima volta e mai cambiato. Se due genitori hanno entrambi la connessione con numero 4, è la stessa connessione, anche se la rete intorno è diversa. Al crossover NEAT allinea i geni per numero: i geni presenti in entrambi i genitori («corrispondenti») sono ereditati a caso da uno dei due; i geni presenti in uno solo («disgiunti» se stanno in mezzo, «in eccesso» se stanno alla fine) sono ereditati dal genitore più adatto. Un gene disattivato in uno dei genitori ha una certa probabilità di restare disattivato nel figlio [1].

NEAT aggiunge la **speciazione**: le reti con struttura simile sono raggruppate in specie e competono tra loro, così che una struttura nuova, che all'inizio funziona peggio, abbia il tempo di ottimizzarsi prima di essere eliminata [1].

#### Un crossover con i numeri, e una mutazione di un peso

Due genitori con le connessioni dell'esempio precedente. Il genitore P2 è più adatto di P1: sul dataset giocattolo, con questi pesi, P2 dà +0,72 per cento (stesse operazioni della rete N1 del capitolo 7) e P1 +0,44 per cento (una sola operazione).

| Innovazione | P1 | P2 | Figlio | Origine |
|---|---|---|---|---|
| 1 (i1 a o) | 0,20, disattiva | 0,60, disattiva | 0,60, disattiva | corrispondente, da P2; resta disattiva (lo è in entrambi) |
| 2 (i2 a o) | 0,10 | -0,20 | 0,10 | corrispondente, da P1 |
| 3 (i3 a o) | -0,30 | -0,10 | -0,10 | corrispondente, da P2 |
| 4 (i1 a n) | 1,00 | 0,40 | 1,00 | corrispondente, da P1 |
| 5 (n a o) | 0,20 | 0,90 | 0,90 | corrispondente, da P2 |
| 6 (i3 a n) | 0,50 | assente | assente | presente solo in P1, scartato (P2 è più adatto) |
| 7 (i2 a n) | assente | 0,80 | 0,80 | presente solo in P2, ereditato |

Il figlio ha cinque connessioni attive. Sul dataset dà `buy` dal giorno 2 al 10, `hold` il giorno 11, `sell` dal 12 al 16, e `buy` dal 17 in poi: compra a 10,30 (giorno 3), vende a 10,30 (giorno 13) e ricompra a 11,05 (giorno 18); valore finale 1031,67 (+3,17 per cento). Lo stesso valore compare in altri esempi della guida (per esempio il crossover dell'MLP, sezione 7.5): sono forme diverse con le stesse tre operazioni, quindi lo stesso valore finale.

**Mutazione dei pesi.** Sulla connessione 4 di P1 il peso passa da 1,00 a 0,60: l'uscita del giorno 3 passa da 0,253 a 0,235, quella del giorno 6 resta 0,438, quella del giorno 12 passa da -0,366 a -0,350. Un piccolo cambiamento del peso dà un piccolo cambiamento dell'uscita; qui nessuna decisione cambia sui 20 giorni. È il comportamento tipico di una mutazione gaussiana (una piccola perturbazione casuale) sui pesi.

### Dal capitolo 7: reservoir computing

Una famiglia vicina alle reti ricorrenti è il **reservoir computing** (echo state network): una rete ricorrente di molti neuroni con pesi **casuali e fissi** (il «serbatoio») e un solo strato di uscita, lineare, i cui pesi si addestrano [17]. L'idea è evitare di far evolvere o addestrare le ricorrenze, che sono la parte più difficile, tenendo solo la lettura da addestrare. Il costo è uno stato di centinaia di numeri e un'interpretabilità molto bassa [ipotesi]. Non ha una scheda tra le forme del capitolo 10: è citata come forma di contrasto. [17] è una pagina di un gruppo di ricerca, non una rassegna con revisione; nessuna fonte letta tratta l'uso del reservoir con un algoritmo genetico nel trading.

### Dal capitolo 7: etichette (`labels`) della rete, del fuzzy e dell'HMM

Il contratto di strategia richiede una lista finita di etichette, gli «stati» che il PoC mostra. Le tre forme dei capitoli 7, 8 e 9 le ricavano in modi diversi.

#### Etichette della rete (capitolo 7)

La rete produce un numero continuo, non uno stato: bisogna ricavare le etichette dall'uscita. Il modo più semplice sono le **fasce** definite dalle stesse soglie dell'azione, cioè tre etichette: `sell` (`y` < -0,5), `hold` (tra -0,5 e 0,5), `buy` (`y` > 0,5). Nell'esempio il giorno 6 sta in `hold` (`y` = -0,49), il giorno 12 in `sell` (`y` = -1,16). Si può fare di più: fasce più fini (per esempio cinque: vendi forte, vendi, aspetta, compra, compra forte) danno più informazione, a costo di soglie in più. In entrambi i casi la perdita è nell'etichetta, non nel numero: il valore continuo `y` si può comunque esporre in `describe().indicators`. Nessuna fascia ha un significato «naturale» come lo ha uno stato di una macchina a stati: è una richiesta di estensione del contratto, da trattare nell'implementazione del genoma scelto (E2; sezione «Il contratto di strategia, forma per forma» della rassegna).

#### Etichette del sistema fuzzy (capitolo 8)

Scelta dichiarata: le tre fasce dell'uscita defuzzificata (sell, hold, buy), quelle determinate dalle soglie. Alternativa: le tre uscite fuzzy (Vendi, Neutro, Compra), prendendo ogni giorno quella con il grado aggregato più alto. Le due scelte possono non coincidere: il giorno 9 l'uscita Neutro ha grado 0,63 e Compra 0,37, ma la media pesata è 0,37 e la decisione è buy. Con la prima scelta l'etichetta è coerente con la decisione. Anche qui, le etichette vanno derivate dall'uscita: esito «con adattamento».

#### Etichette dell'HMM (capitolo 9)

Sono i K regimi (salita, laterale, calo). È la scelta più naturale tra le forme, perché le altre devono derivare le etichette da fasce dell'uscita, mentre qui sono già nel modello. Il PoC può mostrare la credenza (K numeri) e il regime più probabile come mostra lo stato della macchina a stati attuale.

### Dal capitolo 9: Baum-Welch e Viterbi per esteso

Il capitolo 9 (sezione 9.4.4) descrive in parole la stima classica di un HMM e il caso del «senno di poi». Qui c'è il calcolo. Numeri di esempio inventati: mostrano il meccanismo, non dicono nulla sulla qualità della forma.

#### Il filtro in avanti con i simboli di Rabiner

Rabiner [2] scrive le due mosse del filtro in un'unica formula. Con `alfa_t(j)` = probabilità di aver visto le osservazioni fino al giorno `t` e di essere nel regime `j` oggi, `a_ij` = probabilità di passare dal regime `i` al `j`, `b_j(O)` = probabilità di vedere il simbolo `O` nel regime `j`:

```
alfa_{t+1}(j) = [ somma su i di alfa_t(i) * a_ij ] * b_j(O_{t+1})
```

La parte tra parentesi quadre è la previsione, la moltiplicazione per `b_j` è la correzione. Poi si divide ogni `alfa_t` per la somma sui regimi (**scaling**: i numeri `alfa` altrimenti diventano piccolissimi dopo molti giorni, e dopo la divisione si leggono come la credenza) [2]. Rabiner inizia dall'osservazione del giorno 1; nel dataset giocattolo il giorno 1 non ha un giorno precedente, quindi qui la credenza del giorno 1 è la credenza iniziale e le osservazioni cominciano dal giorno 2.

#### Baum-Welch passo per passo

L'algoritmo di Baum-Welch è una forma di **EM** (*expectation-maximization*, «aspettazione e massimizzazione») [2]. Un giro:

1. **Avanti.** Si calcola la credenza di ogni giorno con il solo passato (il filtro del capitolo 9).
2. **Indietro.** Si calcola, partendo dall'ultimo giorno e tornando verso il primo, quanto ogni regime di un giorno spiega le osservazioni dei giorni successivi.
3. **Combinazione.** Per ogni giorno, la probabilità di ogni regime tenendo conto di tutta la sequenza (passato e futuro) è il prodotto dei due calcoli, normalizzato.
4. **Nuovi parametri.** Si ricostruisce: la credenza iniziale dalla probabilità dei regimi del giorno 1; ogni riga della matrice di transizione contando quante volte, in media, si passa da un regime a un altro rispetto a quante volte si è nel primo; ogni riga del modello di osservazione contando quante volte, in media, ogni regime ha prodotto ciascun simbolo.
5. Si ripete finché la probabilità della sequenza smette di crescere.

**Convenzione usata in questi numeri.** Il giorno 1 non ha un'osservazione; la credenza iniziale si riferisce al giorno 1 e le osservazioni sono quelle dei giorni da 2 a 20. Partendo dalle matrici del capitolo 9, la credenza iniziale (salita, laterale, calo) diventa:

| Iterazione | Salita | Laterale | Calo |
|---|---|---|---|
| inizio | 0,25 | 0,50 | 0,25 |
| 1 | 0,57 | 0,38 | 0,05 |
| 3 | 0,87 | 0,13 | 0,00 |
| 30 | 1,00 | 0,00 | 0,00 |

(Chi riferisse invece la credenza iniziale al giorno 2, già comprensivo della prima osservazione, otterrebbe (0,80; 0,19; 0,01) alla prima iterazione e (0,99; 0,01; 0,00) alla terza; a 30 iterazioni le due convenzioni coincidono.)

Dopo 30 iterazioni la matrice di osservazione è quasi l'identità (ogni regime produce un solo simbolo con probabilità 1,00: il primo regime «su», il secondo «fermo», il terzo «giù») e la matrice di transizione è quasi

```
salita   -> (0,92; 0,08; 0,00)
laterale -> (0,00; 0,00; 1,00)
calo     -> (0,20; 0,00; 0,80)
```

Il «laterale» diventa un regime di un solo giorno che passa al calo con probabilità 1,00: il modello ha memorizzato il giorno 9 (l'unico «fermo» seguito da «giù»). Il filtro con questi parametri decide `buy` già il giorno 1, e compra il giorno 2 a 10,10; con il resto delle decisioni dà le operazioni ai giorni 2, 11 e 16, +15,55 per cento. Il modello «sa» come va questo dataset, non come vanno i mercati.

#### Viterbi

La decodifica di Viterbi [2] cerca la **sequenza di regimi** più probabile su tutta la serie, invece di dare per ogni giorno una credenza. A ogni giorno tiene, per ciascun regime, la migliore sequenza che termina in quel regime (prendendo il massimo invece della somma, come fa il filtro), poi riparte dalla fine e torna indietro seguendo le scelte migliori. Sul dataset giocattolo, con le matrici del capitolo 9, il percorso è:

| Giorni | 1-8 | 9 | 10-14 | 15-20 |
|---|---|---|---|---|
| Regime più probabile con il senno di poi | salita | laterale | calo | salita |

Decisioni da questo percorso: `buy` il giorno 1, `sell` il 10, `buy` il 15. Operazioni: giorno 2 (10,10), giorno 11 (10,80), giorno 16 (10,55); valore finale 1155,46 (+15,55 per cento). Il percorso usa informazione che il giorno `t` non può avere (i giorni successivi): serve solo a mostrare l'effetto dell'anticipazione dei dati.

### Riferimenti al codice: capitoli 7, 8 e 9

Una voce per ogni citazione spostata dal corpo dei capitoli. I percorsi sono relativi alla radice del repository SwarmTrader-core.

- **Filtro IIR del genoma attuale** (sezioni 7.3.1, 8.2.1, 8.7, 9.5): `src/vendor/consilium/algorithm.js`, righe 369-372. Aggiorna `ema = ema*(1 - c) + x*c` per le quattro medie (due sul prezzo, due sul volume): è la EMA del capitolo 1.
- **Inizializzazione e azzeramento delle medie** (sezioni 7.8, 8.7, 9.7): `src/vendor/consilium/algorithm.js`, `init()` righe 342-359 (le medie partono dal primo dato) e `reset()` righe 422-446 (le medie tornano a zero). Nelle versioni precedenti della guida le righe 342-358 erano indicate come `reset()`: sono `init()`.
- **Base delle strategie del motore** (sezioni 7.8, 8.7): `src/engine/strategy.js`, classe `StrategyIndividual` (riga 35), con i ganci `initIndicators`, `updateIndicators`, `resetIndicators` e `decide` (righe 82-85).
- **Contratto di strategia** (sezioni 7.8, 8.7, 9.7): `src/engine/strategy.js`, funzione `assertStrategy`, righe 12-33. Richiede `kind`, `labels`, `trader` e i metodi `init`, `feed`, `reset`, `getCAGR`, `getPerformanceSummary`, `describe`, `serialize`. `crossover` e `mutate` non sono richiesti da questo controllo.
- **Chiamata di crossover e mutazione da parte del GA** (sezioni 7.8, 8.7, 9.7): `src/vendor/consilium/ga.js`, righe 116-125 e 345-351. Il motore genetico chiama `parent1.crossover(parent2)` e `child.mutate(...)` su ogni individuo, quindi ogni nuova forma deve fornirli.

### Dal capitolo 10: che cosa non si è potuto accertare

Per chi controlla le fonti e il codice. Nessun punto di questa sezione cambia una delle scelte del capitolo 10. Il **fork** è la copia ridotta del codice di Consilium che il PoC usa nel browser (`src/vendor/consilium/individual.js`): non è il software originale di Consilium e non è il GA che ha prodotto il genoma fisso.

**Risolto dalla verifica.**

- I valori 0,73 e 0,99 dei coefficienti dei filtri del genoma fisso **sono raggiungibili**: nel GA vero di Consilium la mutazione sposta ogni coefficiente di un valore casuale fino a ±0,125 e lo tiene tra 0,01 e 1,0. Il limite a 0,5 che aveva fatto sorgere il dubbio è del fork per il browser, che non è il GA che ha prodotto quel genoma. Il crossover vero sceglie un genitore per ogni lista di condizioni (non per ogni stato intero). Le righe del GA in questione sono state lette.
- Il `Trader` non ignora un `buy` con una posizione già aperta: compra ancora, con la quota di denaro che ha ancora a disposizione, se basta per almeno un'azione. Con la quota del genoma fisso (99,6%) il denaro che resta dopo un acquisto è minimo, quindi di fatto non succede nulla; con quote più basse un `buy` ripetuto accumulerebbe azioni. Il valutatore giocattolo ignora invece il `buy` ripetuto, per semplicità.
- La mutazione «raw» degli stati, con chiavi che non corrispondono ai nomi di stato, è un difetto del fork del browser e non del GA vero. Non riguarda la scelta della forma.

**Ancora aperti.**

- **Applicazione al trading** di modello a stati nascosti, filtro di Kalman, reti ricorrenti e reservoir con un algoritmo genetico: nessuna fonte letta. Le fonti [12], [13] e [14] trattano regimi in economia e nei mercati, non strategie evolute.
- **Equivalenza tra filtro di Kalman a guadagno costante e livellamento esponenziale doppio**: [15] presenta i modelli ma non l'equivalenza (verificata numericamente nel capitolo 4, senza fonte).
- **Fonti non lette per intero.** [6] è letto solo come riassunto di un corso; [7], [12], [13] e [16] solo come scheda o abstract; [10] oggi non risponde (503 persistente il 2026-10-14), quindi non verificabile. Learning classifier system (Urbanowicz e Moore, 2009) e CART (Breiman e altri, 1984) sono state identificate e non verificate, e non sono usate come prova. Il lavoro di Fogel sulle macchine a stati evolute (capitolo 3) è citato come **[ipotesi]**, senza averlo cercato.
- **Fuzzy come approssimatore universale** e **uso di reti e fuzzy con un algoritmo genetico nel trading** (oltre a [11]): non verificati.
- **Capacità di adattamento al rumore per forma**: non misurata (domanda 5).
- **Costo di calcolo**: i conteggi di operazioni per barra e la stima dei pezzi di codice (domanda 4) sono stime a mano degli autori, non misure.
- **Adeguatezza al contratto**: è sulla carta fino a E2; il contratto è provato con una sola strategia di test.
- **Genoma attuale**: per lo stato SW la lista con chiave `_SW` è collegata alla direzione sud, il cui vicino sulla griglia avvolta è NW, mentre per le altre 35 uscite chiave e vicino coincidono. Lo stesso schema compare nel generatore di genomi casuali del GA vero, quindi non è un errore del fork; non si sa se sia voluto.
- **Tutti i numeri degli esempi sono inventati**: nessuna cifra della guida è un risultato su dati reali.

### Riferimenti al codice: capitolo 10

Percorsi relativi alla cartella `src/` del repository SwarmTrader-core, salvo dove indicato il repository Consilium.

#### Stop loss, take profit e acquisti ripetuti del `Trader`

- **Soglie per posizione.** Ogni posizione aperta riceve al momento dell'acquisto un prezzo di stop loss (prezzo di apertura per uno meno la percentuale) e uno di take profit (per uno più la percentuale): `vendor/consilium/portfolio.js`, righe 13-19. Lo stop loss scatta se il minimo del giorno è uguale o sotto il livello (righe 62-63); il take profit se il massimo del giorno è uguale o sopra (righe 70-71); la chiusura automatica è alle righe 275-286.
- **Valori nel genoma fisso.** `stop_loss_percent` 50, `take_profit_percent` 5,8, `buy_percent` 99,617: `engine/genome.js`, righe 18, 23-24; convertiti in frazioni alle righe 96-102.
- **Soglie come parametri del `Trader`.** La classe base delle strategie del motore passa `buyPercent`, `stopLossPercent` e `takeProfitPercent` al `Trader`: `engine/strategy.js`, righe 36-37.
- **`buy` con posizione già aperta.** `Trader.update` esegue `buyOperation` ogni volta che lo stato è `BUYING` e il denaro è maggiore di zero (`vendor/consilium/trader.js`, righe 434-436). `buyOperation` investe `capital * investmentQuota` (righe 372-390), e `Broker.buy` calcola il numero di azioni intere acquistabili e non compra nulla se è zero (righe 98-103 e 116-118). Non c'è un controllo «posizione già aperta»: un `buy` ripetuto aggiunge una nuova posizione se il denaro rimasto basta per almeno un'azione.
- **Posizioni con prezzo e data di acquisto.** La classe `Position` tiene `stock_data` (con il prezzo di apertura) e l'istante di acquisto: `vendor/consilium/portfolio.js`, righe 13-19 e 118.

#### GA di Consilium e fork del browser

- **GA vero** (repository Consilium, `ga/ga.js`): crossover alle righe 115-146 (sceglie un genitore per ciascuna lista di condizioni di ogni stato), mutazione alle righe 148-206 (i coefficienti dei filtri si spostano con probabilità `MUTATION_PROBABILITY` di `(rand - 0,5) / 4`, cioè fino a ±0,125, e restano tra 0,01 e 1,0), generazione di un genoma casuale alle righe 208-290.
- **Eccezione `_SW` dello stato SW.** La lista a sud dello stato SW ha chiave `_SW` ma il vicino a sud sulla griglia avvolta è NW. Lo schema compare identico nel generatore di genomi casuali del GA vero (`ga/ga.js`, riga 269).
- **Fork per il browser** (`vendor/consilium/individual.js`): la mutazione limita i coefficienti dei filtri tra 0,001 e 0,5 (righe 196-208) e usa chiavi di stato diverse da quelle del genoma fisso nella mutazione «raw»; per questo il fork non va citato come descrizione del GA che ha prodotto il genoma fisso.

## Glossario

- **Addestramento (training).** Parte dei dati su cui l'algoritmo genetico valuta i genomi e li fa evolvere. Si affianca a validazione e prova finale.
- **Aggregazione (fuzzy).** Unione delle regole che hanno la stessa conclusione; negli esempi si prende il massimo dei loro gradi.
- **Algoritmo genetico (GA).** Metodo di ricerca che fa evolvere una popolazione di candidati con selezione, crossover (scambio di parti tra due genitori) e mutazione (piccole modifiche casuali).
- **Anticipazione dei dati (look-ahead bias).** Errore per cui una decisione usa informazioni non ancora disponibili quel giorno, e il risultato appare migliore di quello ottenibile davvero.
- **Azione.** Quota di proprietà di un'azienda quotata in borsa, che si compra e si vende. Per la decisione `buy`, `sell` o `hold` la guida usa di norma «mossa» o «decisione»; dove compare «azione» in quel senso, il contesto lo chiarisce.
- **Backtest.** Prova di una strategia sui dati storici, come se fosse stata applicata allora.
- **Barra.** Un periodo di negoziazione (qui un giorno) riassunto nei suoi valori OHLCV.
- **Base di regole (fuzzy).** L'elenco delle regole «se... allora...» di un sistema fuzzy. I suoi numeri si contano a parte rispetto a quelli delle funzioni di appartenenza.
- **Baum-Welch (EM).** Metodo classico per stimare i numeri di un modello a stati nascosti da una sequenza intera di dati: ripete la stima finché la probabilità dei dati smette di crescere. Usa anche i giorni successivi a ciascun giorno, quindi può anticipare i dati [2].
- **Bias.** Costante che si somma alla somma pesata degli ingressi di un punteggio o di un neurone; in una rete è un peso senza ingresso.
- **Bloat.** Crescita della dimensione degli alberi evoluti senza miglioramento della fitness.
- **Budget (di calcolo).** La quantità di calcolo concessa a una ricerca: in un algoritmo genetico, popolazione per numero di generazioni.
- **Buy&hold.** Strategia di riferimento: comprare all'inizio e tenere fino alla fine, senza altre operazioni.
- **CAGR (compound annual growth rate).** Tasso di crescita annuo composto: il rendimento annuo costante che porterebbe dal capitale iniziale a quello finale. È la fitness attuale di Consilium.
- **Candidato A, candidato B.** Le due forme che la rassegna porta a chi decide come candidate: A è il punteggio lineare con soglie, B sono gli alberi di espressioni (programmazione genetica) nella variante «solo indicatori». Nessuna delle due è una scelta già fatta.
- **Capitale.** Denaro di partenza di una simulazione (1000 negli esempi).
- **Ciclo.** Un blocco di lavoro con un obiettivo, una serie di controlli e una decisione finale registrata. Questa guida è un prodotto del ciclo 010; per leggerla non serve sapere altro.
- **Classificatore lineare.** Regola che decide in base a una somma pesata degli ingressi confrontata con una soglia. È il nome in uso per il punteggio lineare **[ipotesi, fonte da verificare]**.
- **Codice morto (introne).** Parte di un programma che non viene mai eseguita o che non cambia il risultato.
- **Competing conventions (convenzioni concorrenti).** Due genomi che calcolano la stessa cosa con neuroni o regimi in ordine diverso: mescolarli con un crossover ingenuo produce figli scadenti.
- **Condizione.** Confronto che dà vero o falso. Nel genoma di Consilium ce ne sono 14, numerate da 0 a 13 (capitolo 3).
- **Congiunzione.** Condizione composta da più confronti uniti da «e»: è vera solo se lo sono tutti.
- **Connessione ricorrente.** Collegamento di una rete che riporta il valore di un neurone al giorno dopo, dando alla rete una memoria propria.
- **Consilium.** Il software già esistente che fa evolvere strategie di compravendita di azioni (strategie di trading); da lì vengono il genoma a macchina a stati usato oggi e i dati di addestramento, cioè i dati storici su cui i genomi sono provati e scelti.
- **Contratto di strategia.** L'insieme dei membri che una forma deve avere per girare nel motore: `kind`, `labels`, `describe()`, `serialize()`, `reset()`, i ganci per indicatori e decisione e i metodi che la classe base del motore fornisce già.
- **Convergenza.** Il fatto che i genomi di una popolazione diventino simili e i voti smettano di migliorare.
- **Costi di transazione.** Commissioni e scarti di prezzo pagati a ogni operazione. Gli esempi della guida li trascurano.
- **Credenza.** Nel modello a stati nascosti, l'elenco di probabilità (una per regime, che sommano 1) aggiornato ogni giorno: dice quanto il modello ritiene probabile ciascun regime in quel momento.
- **Crossover.** Operazione che produce un figlio combinando parti di due genitori. Può essere per scelta (copia di singoli geni, come nel GA di Consilium, che sceglie un genitore per ogni lista di condizioni) o aritmetico (media).
- **Dataset giocattolo.** I 20 giorni di prezzi e volumi inventati usati in tutti gli esempi della guida. Non rappresentano nessun mercato reale.
- **Defuzzificazione.** Passaggio da più gradi di appartenenza a un solo numero; negli esempi è una media pesata dei centri.
- **Deviazione standard.** Misura di quanto un valore varia di solito intorno alla sua media.
- **Distanza dalla media (`x1`, `D`).** Di quanti punti percentuali il prezzo sta sopra (positivo) o sotto (negativo) la propria media: `(prezzo / EMA - 1) * 100`.
- **E2.** Implementazione del genoma scelto: la fase in cui si scrive il codice della forma.
- **Elitismo.** Tecnica che passa invariati alla generazione successiva i genomi migliori.
- **Epica.** Il filone di lavoro più ampio di cui questa guida fa parte. Lo scopo è studiare se il genoma possa avere una forma diversa dalla macchina a stati, far evolvere molti genomi di quella forma e confrontare nel PoC il migliore con quello attuale.
- **Esperimento nullo (esperimento di controllo).** Far evolvere ogni forma su serie di prezzi senza struttura prevedibile e misurare il divario tra risultato in addestramento e su dati nuovi. Dove nessuna strategia dovrebbe funzionare, un buon risultato in addestramento è solo adattamento al caso (domanda 5).
- **Espressività.** Che cosa una forma di genoma sa rappresentare: quali regole di decisione può scrivere.
- **Evoluzione grammaticale (GE).** Variante della programmazione genetica in cui una grammatica traduce il genoma in un programma. Più un meccanismo di codifica che una forma [16]. La scheda letta dice solo che l'uso delle grammatiche la distingue: come è scritto il genoma non è stato verificato **[ipotesi]**.
- **Feedforward.** Rete senza memoria interna: l'uscita dipende solo dagli ingressi del momento.
- **Filtro.** Nel capitolo 3 e nel codice di Consilium, una media mobile esponenziale (EMA) del prezzo o del volume, con il suo coefficiente `c`. Il genoma attuale ne ha quattro.
- **Filtro alfa-beta.** Stima ricorsiva di livello e pendenza di una serie con due guadagni fissi, `alfa` e `beta`. È la versione semplice dell'osservatore di Kalman usata nell'esempio.
- **Filtro di Kalman.** Metodo classico per stimare in modo ricorsivo grandezze nascoste di un sistema lineare con rumore [3].
- **Filtro in avanti (forward).** Aggiornamento giornaliero della credenza di un modello a stati nascosti con una previsione e una correzione [2].
- **Fitness.** Numero che dice quanto un candidato è «buono» per l'algoritmo genetico; oggi in Consilium è basato sul CAGR.
- **Fork (del browser).** Copia adattata del codice di Consilium che gira nel browser. Contiene l'algoritmo del genoma, ma non è il GA che ha evoluto il genoma fisso: quel GA sta nel repository Consilium.
- **Forma di confine.** Forma ammessa dalla domanda 1 ma non portata come candidata dalla rassegna, perché somiglia troppo a quella che si vuole lasciare (qui il modello a stati nascosti).
- **Forma di genoma.** Il modo di rappresentare una strategia con numeri e scelte: macchina a stati, punteggio lineare, albero, lista di regole, rete, fuzzy, HMM.
- **Forma minima.** Punteggio lineare con un solo filtro e una soglia (due numeri nel genoma), usato come metro di confronto per le forme più ricche.
- **Funzione di appartenenza.** Funzione che associa a un numero il suo grado in un insieme fuzzy (negli esempi una rampa o un triangolo).
- **Funzione di attivazione (`tanh`).** Funzione che schiaccia un numero tra -1 e +1; è ciò che rende una rete non lineare.
- **Funzione pura.** Funzione che, con gli stessi ingressi, dà sempre la stessa risposta e non conserva nulla tra una chiamata e l'altra.
- **Fuzzificazione.** Passaggio da un numero ai suoi gradi di appartenenza.
- **Ganci.** I metodi che una forma di genoma deve scrivere per il motore: calcolare e azzerare gli indicatori e decidere. La classe base del motore chiama i ganci nell'ordine giusto.
- **Gaussiana (distribuzione normale).** Curva a campana: i valori vicini alla media sono molto più frequenti di quelli lontani.
- **Gene.** Uno dei numeri (o delle scelte) che compongono un genoma.
- **Generazione.** Un ciclo completo di valutazione, selezione e produzione di nuovi genomi.
- **Genoma.** L'insieme dei parametri che definiscono una strategia, ciò che l'algoritmo genetico fa evolvere.
- **Genoma fisso.** Il genoma già evoluto da Consilium che il PoC incorpora e ripete giorno per giorno sui dati di ENI. Il browser non lo fa evolvere.
- **GP lineare, GP cartesiana.** Varianti della programmazione genetica: sequenza di istruzioni che usano registri; genoma di interi che descrive un grafo di funzioni [5].
- **Grado di appartenenza.** Numero tra 0 e 1 che dice quanto un valore appartiene a un insieme fuzzy.
- **Grado di attivazione.** Grado con cui una regola fuzzy scatta: minimo («e») o massimo («o») dei gradi della sua condizione.
- **Griglia avvolta (toro).** Griglia in cui uscire da un bordo riporta al bordo opposto; è la disposizione dei nove stati del genoma attuale.
- **HMM (modello a stati nascosti).** Modello in cui il mercato è in uno di K regimi non osservati, che cambiano con probabilità fisse; di essi si vedono solo gli effetti (le osservazioni) [2].
- **Holdout.** Parte finale dei dati tenuta fuori dall'addestramento per una verifica.
- **Identificatore (di condizione).** Il numero da 0 a 13 che indica una delle 14 condizioni; una lista di condizioni è un elenco di identificatori (capitolo 3).
- **IIR (infinite impulse response).** Filtro ricorsivo: ogni valore dipende dal valore precedente dell'uscita oltre che dal dato nuovo. La media mobile esponenziale è un filtro IIR.
- **Indicatore (tecnico).** Numero calcolato dai prezzi e dai volumi passati per riassumerne l'andamento, per esempio una media mobile.
- **Ingresso.** Indicatore calcolato dai dati passati e consegnato a una forma di genoma.
- **Insieme fuzzy.** Insieme in cui ogni elemento ha un grado di appartenenza tra 0 e 1.
- **Interazione.** Caso in cui l'effetto di un indicatore dipende dal valore di un altro («se X e Y allora...»).
- **Interpretabilità.** Quanto si capisce perché una forma ha deciso in un certo modo, leggendo il genoma.
- **Learning classifier system (LCS).** Sistemi che fanno evolvere regole «se condizione allora azione»: nello stile Michigan ogni individuo è una regola e a ogni regola si associa una forza appresa; nello stile Pittsburgh ogni individuo è un insieme completo di regole **[ipotesi, fonte da verificare]**.
- **Lineare.** Che dipende dagli ingressi solo tramite una somma di prodotti con costanti, senza interazioni tra gli ingressi.
- **Lista di decisione (decision list).** Nome in letteratura della lista di regole [8]. La fonte tratta funzioni vero/falso su attributi, non indicatori continui: l'uso per i prezzi è un'estensione dell'autore **[ipotesi]**.
- **Lista di regole (rule list).** Elenco ordinato di coppie «condizione, azione»: si applica la prima regola con condizione vera; l'ultima è sempre vera.
- **Livello, pendenza, residuo.** Nel filtro alfa-beta: posizione stimata del prezzo, sua variazione giornaliera stimata, errore tra il prezzo osservato e la previsione.
- **Macchina a stati (FSM).** Insieme finito di stati con regole di transizione tra uno stato e l'altro in base a condizioni sui dati; lo stato ricorda ciò che è successo prima.
- **Margine.** Numero del genoma che sposta di una piccola percentuale la soglia di un confronto, per non reagire a differenze minime. In questa guida si scrive come frazione con la percentuale tra parentesi, per esempio 0,01 (1%).
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
- **Mutazione.** Modifica casuale di uno o più geni di un genoma (nel GA di Consilium, per esempio, un coefficiente di filtro si sposta fino a ±0,125 e resta tra 0,01 e 1,0).
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
- **Paniere.** Insieme di titoli azionari usato per far evolvere o provare i genomi (nel rapporto interno [18], una partizione di titoli).
- **Peso.** Numero che dice quanto conta un ingresso (o un collegamento tra neuroni) nella somma che produce il risultato.
- **PoC.** Proof of concept: il piccolo prototipo che gira nel browser e ripete giorno per giorno, su dati reali di ENI, ciò che farebbe il genoma attuale, in modo da poterlo vedere e controllare.
- **Popolazione.** L'insieme dei genomi presenti in un dato momento.
- **Posizione aperta (posizione lunga).** Si possiedono azioni, in attesa che il prezzo salga. Senza posizione si ha solo denaro.
- **Prezzo.** Costo di una azione in un momento; qui il prezzo di chiusura del giorno.
- **Programmazione genetica (GP).** Algoritmo genetico applicato a programmi (alberi o sequenze di istruzioni) invece che a vettori di numeri [5].
- **Prova finale (test).** Dati tenuti da parte e usati una volta sola, alla fine, per una stima onesta su dati nuovi.
- **Punteggio lineare.** Somma pesata degli ingressi più un bias, confrontata con due soglie per ottenere buy, sell o hold.
- **R2…R6.** Le cinque ricerche che seguono la scelta della forma. **R2**: ricerca sugli indicatori da usare. **R3**: ricerca sulla codifica genetica (come un genoma si scrive, si mescola, si modifica). **R4**: ricerca sulle equazioni di decisione (come si arriva a comprare, vendere o aspettare). **R5**: ricerca sulla funzione di fitness (il «voto» dato a un genoma). **R6**: ricerca sul protocollo di valutazione (come si separano addestramento, validazione e prova finale).
- **Rassegna.** Il documento compatto che precede questa guida («Rassegna delle forme di genoma»), con gli stessi contenuti in forma più sintetica.
- **Regime.** Etichetta per un modo di comportarsi del prezzo (salita, laterale, calo); nell'HMM è uno stato nascosto.
- **Registro.** Variabile di un programma che conserva il suo valore da un giorno al successivo.
- **Regola di default.** Ultima regola di una lista, sempre vera: garantisce una decisione ogni giorno.
- **Rendimento.** Guadagno o perdita in percentuale del capitale iniziale: valore finale diviso valore iniziale, meno 1, per 100.
- **Replay.** Il PoC ripete («rigioca») giorno per giorno i dati storici facendo decidere il genoma, per mostrarne le decisioni.
- **Reservoir computing.** Rete ricorrente casuale e fissa di cui si addestra solo la lettura finale [17].
- **RSI, stocastico, ATR.** Indicatori che non sono una semplice media (forza relativa, posizione nell'intervallo recente, escursione media); descritti nel capitolo 1 **[ipotesi, fonte da verificare]**.
- **Rumore.** La parte dei dati dovuta al caso e non a una regola che si ripete. Un genoma che si adatta al rumore va bene sui dati di addestramento e male sui dati nuovi.
- **Selezione.** Scelta dei genitori in base al voto di fitness.
- **Seme.** Numero che fissa la successione dei numeri casuali di una simulazione: con lo stesso seme si ottiene lo stesso risultato.
- **Snapshot.** Copia fissa dei dati storici di ENI (2517 barre giornaliere) incorporata nel progetto.
- **Soglia (alta e bassa).** Valori del punteggio sopra i quali si compra e sotto i quali si vende.
- **Speciazione.** In NEAT, raggruppare reti simili in specie perché una novità abbia il tempo di ottimizzarsi [1].
- **Stato del portafoglio fornito dal motore.** Informazioni sulla posizione aperta che il motore fornisce alla forma come ingressi: se si è in posizione, il prezzo d'acquisto, i giorni dall'acquisto, il massimo del prezzo dall'acquisto (gli ultimi due vanno calcolati dal motore, che non li ha già pronti). Il genoma non deve ricordarle (domanda 2, via 3).
- **Stato nascosto (di una rete).** Valori interni di una rete ricorrente, non visibili al motore e da azzerare in `reset()`.
- **Stop loss.** Soglia di perdita oltre la quale una posizione viene chiusa automaticamente. Nel motore: se il prezzo minimo del giorno tocca un livello sotto il prezzo d'acquisto.
- **Strato nascosto.** Gruppo di neuroni di una rete che sta tra gli ingressi e l'uscita e non è visto dall'esterno.
- **Take profit.** Soglia di guadagno oltre la quale una posizione viene chiusa automaticamente. Nel motore: se il prezzo massimo del giorno tocca un livello sopra il prezzo d'acquisto.
- **Titolo.** L'azione di una singola azienda quotata (qui ENI), considerata come strumento da comprare e vendere.
- **Torneo.** Metodo di selezione in cui si pescano alcuni individui a caso e vince il migliore (3 in Consilium).
- **Trader.** Oggetto del motore che esegue gli ordini e tiene capitale, posizioni aperte (con prezzo e data d'acquisto), stop loss e take profit. La forma di genoma decide soltanto `buy`, `sell` o `hold`. Un `buy` con una posizione già aperta non viene ignorato: compra ancora con la quota di denaro rimasta.
- **Transizione.** Regola «dallo stato X, se la condizione Y è vera, vai allo stato Z».
- **Uscita sul massimo (trailing stop).** Regola che vende quando il prezzo scende di una certa percentuale sotto il massimo raggiunto dopo l'acquisto. Richiede di sapere quale è stato quel massimo.
- **Validazione (validation).** Dati non usati per evolvere, su cui si confrontano i candidati e si prendono le decisioni (scegliere, fermare, regolare).
- **Variabile linguistica.** Grandezza descritta con valori a parole («bassa», «intermedia», «alta»), ciascuno associato a un insieme fuzzy.
- **Vincolo di tipo.** In un albero ogni nodo produce un numero oppure un vero/falso. Il vincolo di tipo impedisce di collegare, per esempio, un vero/falso dove serve un numero; mescolare due alberi deve rispettarlo, altrimenti nascono alberi che non si possono calcolare.
- **Viterbi.** Metodo che trova la sequenza di regimi più probabile sull'intera serie, futuro compreso; a differenza del filtro in avanti usa il massimo dei percorsi e non la loro somma [2].
- **Volume.** Numero di azioni scambiate in un giorno.

## Riferimenti

Stato: **letto** = testo integrale scaricato e letto per le parti citate; **scheda** = vista solo la scheda bibliografica o l'abstract. Le voci sono state verificate il **2026-10-11** e ricontrollate da un revisore indipendente il **2026-10-14**: 17 URL su 18 hanno risposto con codice 200; [10] ha dato 503 in modo persistente (5 tentativi) e oggi non è verificabile.

1. K. O. Stanley, R. Miikkulainen, *Evolving Neural Networks through Augmenting Topologies*, Evolutionary Computation 10(2), 99-127, 2002. https://www.cse.unr.edu/~sushil/class/gas/papers/NEAT.pdf. Letto per le parti citate.
2. L. R. Rabiner, *A Tutorial on Hidden Markov Models and Selected Applications in Speech Recognition*, Proceedings of the IEEE 77(2), 257-286, 1989. https://people.engr.tamu.edu/rgutier/web_courses/cpsc689_s07/rabiner1989tutorialHMM.pdf. Letto per le parti citate. Riguarda il riconoscimento del parlato, non la finanza.
3. R. E. Kalman, *A New Approach to Linear Filtering and Prediction Problems*, Journal of Basic Engineering (Trans. ASME) 82, 1960. https://www.cs.yale.edu/homes/yry/readings/general/Kalman1960.pdf. Letto per le parti citate. Non tratta livellamento esponenziale né prezzi.
4. D. H. Bailey, J. M. Borwein, M. López de Prado, Q. J. Zhu, *The Probability of Backtest Overfitting*, versione di novembre 2014 (working paper). https://carmamaths.org/jon/backtest2.pdf. Letto per la parte sul metodo "hold-out" (parte dei dati tenuta fuori dall'addestramento) e sul test multiplo. L'articolo critica l'hold-out come insufficiente per più motivi (tra cui dati pubblici e campioni piccoli) e tratta separatamente il fatto che provare molte configurazioni produce vincitori dovuti al caso: la guida li riassume insieme, quindi va letta come sintesi e non come citazione di un singolo motivo. Rivista e anno di pubblicazione **non confermati** dal PDF.
5. R. Poli, W. B. Langdon, N. F. McPhee, *A Field Guide to Genetic Programming*, 2008. https://faculty.washington.edu/seattle/GA-2008/FieldGuideGP.pdf. Letto per le sezioni citate.
6. F. Allen, R. Karjalainen, *Using Genetic Algorithms to Find Technical Trading Rules*, Journal of Financial Economics 51, 1999. Letto solo un **riassunto di corso**: https://www.cs.montana.edu/courses/spring2007/536/materials/Lopez/GAsInFinance.html; l'articolo non è stato letto e i dati bibliografici sono quelli del riassunto. Scheda.
7. Y. Hu, K. Liu, X. Zhang, L. Su, E. W. T. Ngai, M. Liu, *Application of evolutionary computation for rule discovery in stock algorithmic trading: A literature review*, Applied Soft Computing 36, 534-551, 2015. https://research.polyu.edu.hk/en/publications/application-of-evolutionary-computation-for-rule-discovery-in-sto. Scheda e abstract; la pagina dell'editore ha risposto 403 in una verifica precedente.
8. R. L. Rivest, *Learning Decision Lists*, Machine Learning 2(3), 229-246, 1987. https://people.csail.mit.edu/rivest/pubs/Riv87b.pdf. Letto in parte (abstract e definizione). Tratta funzioni vero/falso su attributi vero/falso: non dice che una lista di regole divida lo spazio degli indicatori in regioni, che nella guida è un'interpretazione dell'autore **[ipotesi]**.
9. K. Hornik, M. Stinchcombe, H. White, *Multilayer feedforward networks are universal approximators*, Neural Networks 2(5), 359-366, 1989. https://cognitivemedium.com/magic_paper/assets/Hornik.pdf. Letto in parte (abstract e teoremi).
10. L. A. Zadeh, *Fuzzy Sets*, Information and Control 8(3), 338-353, 1965. https://mathnet.ru/eng/fssc12. Scheda e abstract visti in precedenza; testo integrale non raggiunto. Il 2026-10-14 l'URL ha dato 503 in modo persistente: **non verificabile**.
11. F. M. Raimondi, S. Pennacchio, P. Via, M. Mulè, *A New Fuzzy Logic Controller for Trading on the Stock Market*, ICEIS 2007, 322-329. https://www.scitepress.org/Papers/2007/23458/23458.pdf. Letto in parte (abstract, regole, funzioni di appartenenza). Lavoro di conferenza su un caso.
12. J. D. Hamilton, *A New Approach to the Economic Analysis of Nonstationary Time Series and the Business Cycle*, Econometrica 57(2), 357-384, 1989. https://www.econometricsociety.org/publications/econometrica/1989/03/01/new-approach-economic-analysis-nonstationary-time-series-and. Scheda con abstract.
13. A. Ang, A. Timmermann, *Regime Changes and Financial Markets*, NBER Working Paper 17182, 2011. https://www.nber.org/papers/w17182. Scheda con abstract; la versione pubblicata (2012) non è stata verificata.
14. R. Gupta, S. Kapoor, H. Gupta, S. Natesan, *A forest of opinions: A multi-model ensemble-HMM voting framework for market regime shift detection and trading*, Data Science in Finance and Economics 5(4), 466-501, 2025. https://www.aimspress.com/aimspress-data/dsfe/2025/4/PDF/DSFE-05-04-019.pdf. Letto in parte.
15. R. J. Hyndman, G. Athanasopoulos, *Forecasting: Principles and Practice*, 3a edizione online, OTexts, capitolo 8. https://otexts.com/fpp3/exponential-smoothing.html. Letto in parte. Anno di edizione non confermato. In una verifica precedente il server rispondeva 403 a certi client; nella verifica del 2026-10-14 la pagina ha risposto 200.
16. C. Ryan, M. O'Neill, J. J. Collins, *Introduction to 20 Years of Grammatical Evolution*, in *Handbook of Grammatical Evolution*, Springer, 2018, 1-21. https://gpbib.pmacs.upenn.edu/gp-html/Ryan_2018_hbge_intro.html. Scheda con abstract. L'abstract dice che l'uso di grammatiche distingue la GE; **non** dice che il genoma sia una stringa di interi, e la guida non lo afferma come dato di fonte.
17. Gruppo MINDS, *Echo State Networks and Reservoir Computing*, pagina ospitata su `ai.rug.nl`. https://www.ai.rug.nl/minds/esnresearch/. Pagina letta; è di un gruppo di ricerca, non una rassegna con revisione.
18. Consilium, *Train/Holdout Experiments, Generalizzazione della popolazione GA*, 2026-09-12 (rapporto interno): `archive/reports/2026-09-12_train-test-holdout-experiments.md` nel repository Consilium. Letto per intero. Quattro esperimenti sulla generalizzazione della popolazione GA, con fitness basata sul CAGR: due su un solo titolo (PST.MTA), uno sul paniere P10 di 14 titoli (ENI.MTA ne fa parte), uno su tutte le partizioni. Il rapporto non confronta forme di genoma e non contiene un avvertimento sulla separazione tra forma e fitness: quell'osservazione è della rassegna. Nella guida se ne usano solo gli esiti qualitativi.

**Conteggio.** 18 fonti: testo letto per 12 (1, 2, 3, 4, 5, 8, 9, 11, 14, 15, 17, 18), solo scheda o abstract per 6 (6, 7, 10, 12, 13, 16), di cui [10] oggi non raggiungibile. **Identificate e non verificate, non usate come prova** (non numerate): R. J. Urbanowicz, J. H. Moore, *Learning Classifier Systems: A Complete Introduction, Review, and Roadmap*, 2009 (pagina dell'editore 403, copia su PubMed Central con verifica anti-robot); L. Breiman, J. H. Friedman, R. A. Olshen, C. J. Stone, *Classification and Regression Trees*, 1984 (nessuna pagina letta).

**Fonti di questa guida.** La guida non aggiunge fonti numerate rispetto alla rassegna: i numeri [1]-[18] sono gli stessi e hanno lo stesso stato di verifica (testo letto, solo scheda o non verificata). Per questo non esistono voci da [19] in poi. I fatti nuovi della guida vengono dal codice del repository e del GA di Consilium, da un rapporto interno già numerato [18] e da conteggi eseguiti con script di lavoro; ciò che non ha fonte è marcato **[ipotesi]**. Citati nel testo senza numero e non verificati: il lavoro di Fogel sulla programmazione evolutiva (anni Sessanta, capitolo 3, **[ipotesi, fonte da verificare]**, non cercato né letto) e le due fonti identificate sopra (LCS, CART).
