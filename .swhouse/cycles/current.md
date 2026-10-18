---
cycle: 011
status: open
opened: 2026-10-18
problem: "Non è noto quali indicatori finanziari, calcolabili in streaming da prezzi e volumi giornalieri, il genoma a punteggio lineare può usare come ingressi e come unica fonte di memoria del passato: serve un catalogo ragionato di ammessi ed esclusi (issue #6, epica #4)"
track: M
---

## Step 1 — COORDINATOR: Open the Problem

**Agent:** claude-opus-5-5
**Instance:** ubuntu-workstation (operator: Luca)
**Issue:** [#6 R2](https://github.com/ChaosCoreLab/SwarmTrader-core/issues/6), epica [#4](https://github.com/ChaosCoreLab/SwarmTrader-core/issues/4). Repository di lavoro: SwarmTrader-core, branch `epic-genoma-non-fsm` (riallineata a `main` dopo il merge della PR #18).
**Track:** M — ricerca con una decisione da prendere (quali indicatori ammettere) e nessun codice di prodotto. **Step 4 (Explorer) incluso:** il catalogo minimo dell'issue è un punto di partenza; l'Explorer cerca indicatori e trasformazioni che l'elenco non prevede (volatilità, rapporti normalizzati, velocità diverse di EMA, indicatori di volume). **Step 6 (Destroyer) omesso:** nessun input esterno né superficie d'attacco; anticipazione dei dati (look-ahead) e instabilità numerica le esamina il Critic allo Step 5 per ogni indicatore.
**Cicli in parallelo:** nessuno. I cicli 007, 008, 009 e 010 sono chiusi e uniti in `main` (PR #18, approvata da Simone); l'eccezione sul ciclo parallelo non serve più e il ciclo vive in `current.md`. Numerazione: l'ultimo ciclo in `main` è il 010, quindi il prossimo è l'011.
**Stato precedente:** il ciclo 009 e il ciclo 010 restano DEFERRED fino alla verifica di Pages (NRC-H03); il workflow di deploy sul merge è verde, ma la verifica visiva è umana.

**Problem statement**
Il ciclo 010 ha fissato la forma del nuovo genoma: **punteggio lineare di indicatori con soglie**, con la memoria del passato **solo negli indicatori** (nessuna variabile portata dal genoma, nessuno stato del portafoglio fornito dal motore), e una sola forma per cominciare (`memory/decisions/2026-10-18-genome-form-linear-score.md`). In una forma lineare l'espressività sta tutta nella scelta degli ingressi: due ingressi che non esistono non possono essere combinati. Il genoma attuale usa solo quattro filtri IIR (medie esponenziali su prezzo e volume) e confronti con margini (`src/vendor/consilium/algorithm.js`). Non è noto quali altri indicatori siano calcolabili in modo incrementale, con stato limitato e senza anticipare il futuro, quali siano adatti a un punteggio lineare (scala, normalizzazione) e quali siano ridondanti con le medie esponenziali già presenti.

**Why now**
È il prossimo passo della catena: R3 (codifica genetica), R4 (equazioni di decisione) ed E2 (implementazione) dipendono dall'elenco degli ingressi. La scelta di Luca sulla memoria solo negli indicatori rende questo elenco la parte che decide quanto il genoma «ricorda».

**Scope — IN**
- Catalogo con almeno EMA/SMA, MACD, RSI, Bande di Bollinger, ATR, ROC, stocastico, OBV, CMF; più gli indicatori emersi dallo Step 4.
- Per ciascuno: formula, aggiornamento incrementale in tempo costante, stato da conservare, periodo di warm-up, campi OHLCV usati.
- Relazione con i quattro filtri IIR presenti (equivalenza con medie esponenziali, costanti di tempo).
- Adeguatezza di ciascun indicatore a un punteggio lineare: scala, normalizzazione, dimensionalità, correlazione con gli altri.
- Esito: elenco ragionato degli indicatori ammessi al genoma e di quelli esclusi, con motivazione, da portare a Luca.

**Scope — OUT**
- La codifica genetica (R3), le equazioni di decisione (R4), la fitness (R5), il protocollo di valutazione (R6): R2 ne usa solo ciò che serve a giudicare gli indicatori.
- Qualsiasi codice in `src/`, `tests/`, `scripts/`; prove su dati salvo piccoli calcoli di esempio dichiarati come tali.
- La scelta finale dell'elenco: è di Luca (criterio di accettazione dell'issue).

**Estimated complexity:** Medium (conoscenza ampia da sintetizzare e tracciare; formule da verificare sul codice e su un dataset di esempio).

**Lezioni da applicare (ciclo 010)**
- Il lettore è Luca, senza competenze finanziarie: lo Step 2 dichiara il profilo del lettore e include come criterio di accettazione una **lettura simulata** prima della consegna (proposta dell'Evolution Master del ciclo 010).
- Italiano, matematica intermedia, termini di finanza spiegati alla prima occorrenza, esempio numerico per indicatore, fonte o `[ipotesi]` per ogni affermazione (`decisions/2026-10-11-research-document-conventions`).
- Orientamento dei coefficienti IIR verificato sul codice, non sul ricordo (`errors/2026-10-11-iir-formula-inverted-coefficient`, `knowledge/consilium-iir-filter-orientation`).
- Catena di verifica indipendente (`patterns/independent-verification-chain-research`); script di lavoro in cartella persistente fuori da `/tmp`.
- Il documento può essere commentato da Luca e Simone sull'artefatto: le risposte si registrano nel file del ciclo.

**Context check**
- Memory lookup: `decisions/2026-10-18-genome-form-linear-score`, `decisions/2026-10-11-strategy-contract` (indicatori: `initIndicators`, `updateIndicators`, `resetIndicators`), `knowledge/consilium-iir-filter-orientation`, `knowledge/genome-forms-state-memory`, `decisions/2026-10-11-research-document-conventions`, `patterns/jekyll-stakeholder-docs`, `patterns/independent-verification-chain-research`. La guida `docs/architecture/genome-forms-guide.md` (ch. 1 e 4) spiega già EMA, rapporti di volume e punteggio lineare: R2 la estende, non la ripete.
- Validation matrix: nessun deploy nuovo; il documento va pubblicato su Pages (verifica umana dopo il merge, come NRC-H03).
- NRC H-item check: nessun H-item attivato dal contenuto; il nuovo documento in `docs/` si aggiunge alla verifica di NRC-H03 se lo stile locale alla pagina è lo stesso. Nessun modulo NRC (`src/engine/*`, `src/vendor/consilium/*`, `src/main.js`, `src/style.css`, `index.html`, `archimate/**`) è toccato.
- Domande aperte per Luca (da porre allo Step 2): (1) l'elenco finale è un insieme di ingressi o anche famiglie parametrizzate (ad es. EMA a velocità evolvibile)? (2) quanti ingressi al massimo, per tenere il punteggio leggibile (Q3 del ciclo 010: decisioni intuibili)?
- Fonti: Step 2 stabilisce quelle ammesse (letteratura, documentazione di librerie, codice di Consilium); ogni affermazione riporta la sua fonte.

**Esecuzione:** gli Step 2–11 sono assegnati a sub-agent quando l'operatore lo chiede; lo Step 12 aspetta la scelta di Luca (AC dell'issue). Il track, gli step omessi e lo stato si riportano a commento di #6.

**Prossimo step:** Step 2 — PRODUCT OWNER

### Risposte dell'operatore alle domande dello Step 1 (2026-10-18)

1. **Famiglie con parametri evolvibili: ammesse.** L'elenco può contenere indicatori con parametri (ad es. la velocità di una EMA) che il genoma porta come geni e l'algoritmo genetico fa evolvere, oltre agli ingressi fissi.
2. **Limite di ingressi: 10**, superabile fino a **12 se strategico** (con motivazione esplicita nel documento). Per «ingressi» si intendono i termini della somma pesata del punteggio lineare.
Da portare allo Step 2 come vincoli del criterio di accettazione; il catalogo può restare più ampio dell'elenco ammesso.
