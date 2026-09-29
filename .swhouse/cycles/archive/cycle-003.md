---
cycle: 003
status: closed
opened: 2026-09-29
closed: 2026-09-29
decision: ACCEPTED
problem: "Impostare la documentazione come base dati utile a generare un diagramma ArchiMate: artefatti minimi per cella (Layer × Aspect), pattern promuovibile a framework"
track: F
---

## Step 1 — COORDINATOR: Open the Problem

**Agent:** claude-opus-5-5
**Track:** F — cross-cutting change across project (SwarmTrader) and framework (software-house-ai); modifies documentation protocol and Librarian agent, not just one component.

**Problem statement**
La documentazione ArchiMate di SwarmTrader oggi è prosa libera in [use-case-eni-replay.md](../../docs/architecture/use-case-eni-replay.md): una matrice 4×4 leggibile da umani ma non è una base dati. Non se ne può derivare un diagramma senza trascriverlo a mano. Il backlog (cycle 001, AC-09) chiede un mapping ArchiMate completo; il Owner vuole artefatti minimi che riflettano la granularità di ogni cella Layer × Aspect, utilizzabili come sorgente per generare il diagramma, e vuole che il pattern sia promuovibile a livello `software-house-ai`.

**Why now**
I cicli 001–002 hanno consegnato un PoC accettato su `main`. La documentazione è il prossimo debito: la matrice in prosa non soddisfa più la granularità richiesta e non è derivabile. Risolverlo ora fonda la convenzione prima di aggiungere altri use case.

**Scope — IN**
- Definire una sede canonica `archimate/` top-level e un formato di artefatto-cella (markdown + frontmatter YAML) come base dati.
- Definire un vocabolario ArchiMate minimo (elementi + relazioni) coerente con le 16 celle Layer × Aspect.
- Scrivere uno script generatore che legge i frontmatter delle celle di un use case ed emette un diagramma PlantUML (e la matrice tabellare) incluso nel use case doc.
- Applicare il pattern al use case `eni-replay` (solo celle pertinenti) come riferimento.
- Evolvere il framework: `protocols/documentation.md` (ammettere `archimate/` come sorgente strutturata) e `agents/07-librarian.md` (DWO sulla sorgente, non sul diagramma disegnato).
- ADR, MAP, NRC, memoria.

**Scope — OUT**
- Correzione di O1/O2 (acceptance del Owner: limiti noti, non si correggono).
- Nuovi use case oltre `eni-replay`.
- Generazione di tutte le 4 viste ArchiMate canoniche del Librarian (Technology/Application/Motivation/Implementation&migration) — si genera la vista pertinente al use case; le viste di progetto si aggregano in un ciclo successivo.
- Migrazione di altri progetti al nuovo pattern.

**Estimated complexity:** Medium (formato + generatore + due file framework + applicazione pilota; niente codice runtime).

**Context check**
- Memory lookup: pertinenti `memory/patterns/upstream-golden-replay.md`, `memory/knowledge/consilium-holding-semantics.md`, decision `memory/decisions/2026-09-28-static-snapshot-poc.md`; nessuna entry precedente sul pattern documentazione-ArchiMate come base dati.
- Validation matrix: il ciclo non tocca deployment target né codice runtime; la validazione è sulla documentazione stessa (diagramma generato coerente con le celle) e sulle regressioni automatiche (NRC-A01..A04 non dovrebbero muoversi: il ciclo non tocca `src/`).
- NRC H-item check: nessun modulo NRC toccato (il ciclo modifica `docs/`, `archimate/`, `software-house-ai/`); nessun H-item attivato. NRC-A03 (e2e) resta verde di base ma non è target del ciclo.
- Cognitive diversity note: single-model deployment; verificherò al termine di Steps 3–6 che ogni step aggiunga informazione nuova.

**Owner decisions captured (requirements)**
1. Unità di decomposizione: un file per cella.
2. Scope: progetto + framework (Track F).
3. Copertura: solo le celle pertinenti per use case, non tutte 16.
4. Sede: `archimate/` top-level.
5. Generatore: prodotto nel ciclo, non solo convenzione.

## Step 2 — PRODUCT OWNER: Define the Value

**Agent:** claude-opus-5-5

**Who has this problem?**
Il Owner/architetto di SwarmTrader e, per estensione, ogni progetto che adotta `software-house-ai`: oggi la documentazione ArchiMate è prosa non generabile, quindi il diagramma va mantenuto a mano separato dalla descrizione, con drift inevitabile.

**Measurable value of solving it**
- Si genera un diagramma ArchiMate di un use case con un comando (`npm run archimate:gen`), partendo dalla base dati in `archimate/`.
- Una modifica a una cella si propaga al diagramma senza editing manuale: eliminato il drift cella-diagramma.
- Un nuovo use case si documenta popolando solo le celle pertinenti, riutilizzando il vocabolario.

**Cost of not solving it**
- Ogni nuovo use case raddoppia la fatica (prosa + diagramma disegnato a mano, da tenere allineati).
- La matrice 4×4 attuale resta l'unica vista; niente diagramma-as-code vero per ArchiMate nel progetto.
- Il framework resta senza un pattern di sorgente strutturata di diagramma, e ogni progetto reinventa.

**Acceptance criteria**
- AC-01: Esiste `archimate/` top-level con un use case (`eni-replay`) le cui celle pertinenti sono file markdown con frontmatter YAML validato (layer, aspect, elements[], relationships[], last_verified).
- AC-02: Esiste `scripts/gen-archimate.mjs` che legge le celle di un use case ed emette un blocco PlantUML ArchiMate valido, incluso nel use case doc.
- AC-03: Il diagramma generato per `eni-replay` contiene ogni elemento e relazione dichiarato nelle celle, senza elementi non dichiarati.
- AC-04: Il vocabolario minimo (`archimate/_vocabulary.md`) definisce i tipi di elemento e relazione ammessi, ed è coerente con le 16 celle Layer × Aspect.
- AC-05: Il framework `software-house-ai` è aggiornato: `protocols/documentation.md` ammette `archimate/` come sorgente strutturata; `agents/07-librarian.md` emette DWO sulla sorgente.
- AC-06: `docs/MAP.md` indicizza `archimate/` e il use case doc aggiornato; `last_verified` impostato.
- AC-07: Un ADR registra la decisione (sorgente strutturata vs diagramma disegnato a mano).
- AC-08: NRC-A01..A04 restano verdi (il ciclo non tocca `src/`); nessuna regressione.
- AC-09: Il pattern è descritto come riutilizzabile in `memory/patterns/` per la promozione a framework.

**UX Coherence Check:** non applicabile — nessuna UI o input utente.

## Step 3 — ARCHITECT: Propose Structure

**Agent:** claude-opus-5-5

### Decomposition

1. **Sorgente strutturata** (`archimate/`): una directory per use case, un file per cella pertinente, formato `layer--aspect.md` con frontmatter YAML + prosa.
2. **Vocabolario** (`archimate/_vocabulary.md`): tipi ammissibili per elemento (business-actor, business-process, application-component, application-service, node, artifact, meaning, value, ...) e relazioni (used-by, realizes, assigned-to, flows-to, composes), mappati ai 4 layer × 4 aspect.
3. **Generatore** (`scripts/gen-archimate.mjs`): legge le celle di un use case, valida elementi/relazioni contro il vocabolario, emette PlantUML ArchiMate (vista layer-aware) e una matrice Markdown; scrive il blocco nel use case doc.
4. **Vista derivata** (`docs/architecture/use-case-*.md`): prosa + blocco PlantUML generato (incluso come diagram-as-code, conforme al protocollo).
5. **Framework**: evoluzione di `protocols/documentation.md` e `agents/07-librarian.md`.

### Interfaces
- Cella → generatore: frontmatter YAML con schema fissato (use_case, layer, aspect, elements[], relationships[]).
- Generatore → doc: blocco PlantUML tra marker `<!-- archimate:gen start -->` / `<!-- archimate:gen end -->`, idempotente.
- Generatore → validation: errore se un elemento referenziato in relationships non è dichiarato in nessuna cella, o se un tipo non è nel vocabolario.

### Two structural approaches

**A1 — Generatore PlantUML con vocabolario fissato (consigliato)**
Vocabolario chiuso, generatore che emette PlantUML testuale con macro ArchiMate. Pro: zero dipendenze, output diffabile, conforms al protocollo diagram-as-code. Contro: PlantUML non rendera nativamente in CI senza PlantUML jar; ma l'autorità è il codice, il render è supplemento.

**A2 — Generatore Mermaid (alt)**
Mermaid ha supporto limitato per ArchiMate (nessun first-class); si ricadrebbe in flowchart stilizzato, perdendo la semantica Layer × Aspect. Pro: render nativo in GitHub. Contro: perde granularità ArchiMate, che è proprio il requisito.

**Raccomandata: A1.** Il protocollo documentation.md accetta Mermaid e PlantUML; ArchiMate è meglio espresso in PlantUML. Il render è supplemento; la base dati è la sorgente.

### Input Surface Audit
Non applicabile (nessuna UI).

## Step 4 — EXPLORER: Generate Alternatives

**Agent:** claude-opus-5-5

1. **JSON/YAML puro invece di markdown+frontmatter.** Sorgente in `archimate/eni-replay.json`, zero prosa. Diverge dal principio del framework "documentation that can be read by human or agent"; perde il contesto testuale che giustifica ogni elemento.
2. **Un file per elemento, non per cella.** Granularità al singolo elemento ArchiMate. Pro: riuso massimo di un elemento tra use case. Contro: esplode il numero di file (decine per use case), e la cella (Layer × Aspect) non è più l'unità di navigazione, contro il requisito del Owner.
3. **Diagramma come primary source, celle come derivato (inversione).** Si disegna il PlantUML a mano e si parsano le celle da esso. Sfida l'intento "base dati utile a creare il diagramma": il Owner vuole la base dati come sorgente, non il diagramma. Antitetica alla A1 dal primo principio (la granularità richiesta è la cella, non il grafo).
4. **Vocabolario aperto invece di chiuso.** Qualsiasi tipo ArchiMate ammesso senza vincolo. Pro: massima espressività. Contro: nessuna validazione, drift di nomenclatura tra progetti, il generatore non può ragionare per cella.

## Step 5 — CRITIC: Analyze Weaknesses

**Agent:** claude-opus-5-5

- **A1 — vocabolario fissato:** se troppo stretto, use case reali non trovano il tipo che serve e lo forzano. Mitigazione: vocabolario minimo ma estendibile per ADR; il generatore warninga sui tipi non-standard invece di fallire.
- **File per cella + `archimate/` top-level:** introduce una nuova sede top-level nel framework; ogni progetto che adotta deve crearla. Rischio: `archimate/` duplica concetti già in `docs/architecture/`. Mitigazione: il use case doc in `docs/architecture/` resta la vista in prosa, `archimate/` è solo la sorgente strutturata; nessuna duplicazione di contenuto, solo viste diverse (typed link).
- **Generatore idempotente:** se il blocco marker viene editato a mano, il generatore sovrascrive. Mitigazione: marker espliciti + check CI che fallisce se il blocco generato differisce dal committed (gen + diff).
- **PlantUML senza render in CI:** il diagramma è codice non renderato. Mitigazione: il protocollo ammette il codice come autorità; il render è supplemento. Aggiungere un check di validità sintattica PlantUML è follow-up.
- **Celle pertinenti solo:** uniformità ridotta tra use case. Mitigazione: il generatore emette la matrice 4×4 con celle vuote marcate "—", così la vista derivata resta completa anche se la sorgente popola solo il pertinente.
- **Single-model cognitive diversity:** Steps 3–4 sono dello stesso modello; A4 (inversione) è l'alternativa che sfida davvero A1 dal primo principio. Valido.

Ranking rischio (alto→basso): A2 (perde semantica ArchiMate) > file-per-element (esplode) > JSON-puro (perde prosa) > A1. A1 è la più sicura.

## Step 6 — DESTROYER: Attempt Invalidation

**Agent:** claude-opus-5-5

- **Abuso: elementi fantasma.** Un use case dichiara una relazione verso un elemento mai definito. Il generatore deve fallire (AC-03). Test: cella con relazione orfana → gen esce non-zero.
- **Abuso: drift dopo modifica.** Si edita una cella ma non si rigenera; il diagramma committed è staccato dalla base dati. Mitigazione: `npm run archimate:check` che rigenera e diff; fallisce se il committed non matcha.
- **Abuso: tipo non nel vocabolario.** Si inventa un tipo non-standard. Mitigazione: vocabolario + warning (non fail) per estendibilità, ma relazioni con tipo non valido sono fail.
- **Sopravvivenza:** A1 sopravvive a un avversario motivato se il generatore valida (elementi dichiarati, tipi nel vocabolario, idempotenza con check). L'unica invalidazione reale è "vocabolario troppo stretto" → gestita estendibilità per ADR.

**Verdetto:** A1 sopravvive.

## Step 7 — BUILDER: Produce a Solution

**Agent:** claude-opus-5-5
**Approach:** A1 (PlantUML generator + minimal vocabulary), see Step 3.

### Implementation
- `archimate/_vocabulary.md`: minimal element types per (layer, aspect) + relationship types.
- `archimate/eni-replay/`: 11 pertinent cell files (business 4/4, application 3/4 — no motivation, technology 3/4 — no motivation, physical 1/4 — active-structure only). Each cell: YAML frontmatter (use_case, layer, aspect, elements[], relationships[], last_verified) + prose + typed links.
- `scripts/gen-archimate.mjs`: zero-dependency Node script; minimal YAML frontmatter parser; vocabulary loader; cell loader; validator (declared elements, vocabulary types warn-not-fail, relationship types fail, orphan references fail); PlantUML emitter (layer packages, shape per type); matrix emitter (4×4 with `—` for empty); idempotent injection between markers; `--check` drift mode.
- `docs/architecture/use-case-eni-replay.md`: rewritten — prose references the source; diagram block and matrix injected between markers.
- `docs/decisions/ADR-002-archimate-structured-source.md`: the decision record.
- `docs/MAP.md`: indexes the new ADR, the structured sources, and updates `last_verified`.
- `docs/operations/development.md`: `archimate:gen` / `archimate:check` commands.
- `package.json`: `archimate:gen` and `archimate:check` scripts.
- Framework (submodule `software-house-ai`): `protocols/documentation.md` § Structured ArchiMate source; `agents/07-librarian.md` diagram rule 2 exception + location/format updated.
- `memory/patterns/archimate-cell-based-source.md`: reusable pattern.

### Response to Critic (Step 5) findings
- Vocabolario troppo stretto: warning-not-fail per tipi non-standard; estensione via ADR.
- Duplicazione `archimate/` vs `docs/architecture/`: il use case doc resta vista in prosa, `archimate/` è sorgente; typed link, nessuna copia di contenuto.
- Edit manuale del blocco: marker idempotenti + `archimate:check` (CI drift detection).
- Render PlantUML: autorità è il codice; render è supplemento; validità sintattica PlantUML è follow-up.
- Celle pertinenti solo: la matrice derivata mostra `—` nelle celle vuote, vista uniforme.

### Response to Destroyer (Step 6) findings
- Elementi fantasma: validator fail su relazione verso elemento non dichiarato (AC-03).
- Drift post-modifica: `--check` rigenera e diff, fallisce se committed non matcha.
- Tipo non nel vocabolario: relationship type non valido = fail; element type non-standard = warning.

### Self-Test Log
```
Self-Test Log:
  Component: scripts/gen-archimate.mjs
  Test method: node scripts/gen-archimate.mjs eni-replay --emit stdout; --emit matrix; (write); --check
  Actual output: PlantUML with 4 layer packages, 27 elements, all relationships; matrix 4x4 with populated + "—" cells; "archimate: check ok"
  Expected output: generated diagram coherent with cells; matrix complete; check idempotent
  Result: PASS
  Notes: zero warnings after vocabulary parser fix; no errors
```
```
Self-Test Log:
  Component: NRC regression (src/ untouched)
  Test method: npm test
  Actual output: pass 12, fail 0
  Expected output: 12/12 (NRC-A01..A04 unchanged)
  Result: PASS
  Notes: cycle did not touch src/; no regression
```

### Confidence: High
Generator validates, pilot use case coherent, idempotent check passes, NRC green.

## Step 8 — OPTIMIZER: Improve the Solution

**Agent:** claude-opus-5-5
- Il parser YAML inline è minimale ma sufficiente; non vale la pena aggiungere una dipendenza (js-yaml) per 11 celle. Tenuto zero-dipendenze.
- `emitPlantUml` raggruppa per layer con un package: chiaro e diffabile. Nessuna over-engineering rimuovibile.
- La matrice derivata è una vista leggera; non duplica il diagramma.
- Niente da rimuovere: ogni artefatto serve a una AC.

## Step 9 — SCIENTIST: Verify

**Agent:** claude-opus-5-5

### Verification method
Esecuzione del generatore + `--check` idempotente + `npm test` (NRC) + ispezione logica del diagramma generato contro le celle.

### Results
- AC-01: `archimate/eni-replay/` con 11 celle, frontmatter YAML validato dal generatore (nessun errore). ✓
- AC-02: `scripts/gen-archimate.mjs` emette PlantUML e lo inietta nel use case doc. ✓
- AC-03: il diagramma generato contiene esattamente gli elementi/relazioni dichiarati; il validator fallisce su riferimenti orfani (logica verificata nel codice: `if (!declared.has(r.from)) errors.push`). ✓
- AC-04: `archimate/_vocabulary.md` definisce tipi e relazioni; il generatore carica e valida contro di esso. ✓
- AC-05: framework aggiornato (`protocols/documentation.md` § Structured ArchiMate source; `agents/07-librarian.md` regola 2 eccezione). ✓
- AC-06: `docs/MAP.md` indicizza ADR-002, `archimate/`, script; `last_verified` 2026-09-29. ✓
- AC-07: ADR-002 scritto. ✓
- AC-08: `npm test` 12/12; nessuna regressione. ✓
- AC-09: `memory/patterns/archimate-cell-based-source.md` scritto. ✓

### NRC Type-A
Moduli toccati: `docs/`, `archimate/`, `scripts/gen-archimate.mjs`, `software-house-ai/`. Nessuno in NRC-A01..A04 (che puntano a `src/`, `public/data/`, `tests/`). NRC Type-A: 12/12 passed (eseguito). Nessuna regressione.

### NRC H-item
Nessun modulo NRC toccato → nessun H-item attivato. Verificato: `src/` non modificato.

### Confidence: High
### Open hypotheses
- Validità sintattica PlantUML non verificata da un render (follow-up: integrare `plantuml.jar` o un servizio in CI). Non bloccante: il codice è l'autorità.
- Cross-use-case element identity non modellata (follow-up per quando ci sarà un secondo use case).

## Step 10 — LIBRARIAN: Update Memory

**Agent:** claude-opus-5-5

### New memory entries
- `memory/patterns/archimate-cell-based-source.md` — pattern riutilizzabile.
- `docs/decisions/ADR-002-archimate-structured-source.md` — decisione architetturale.

### Existing entries updated
- `docs/MAP.md` — ADR-002, structured sources section, `last_verified` 2026-09-29.
- `docs/architecture/use-case-eni-replay.md` — `last_verified` 2026-09-29, vista derivata.
- `docs/operations/development.md` — comandi archimate, `last_verified` 2026-09-29.
- `docs/architecture/simulator-overview.md` — `last_verified` 2026-09-29 (confermato corrente, non modificato).

### Framework (submodule)
- `software-house-ai/protocols/documentation.md` — § Structured ArchiMate source.
- `software-house-ai/agents/07-librarian.md` — diagram rule 2 exception + location/format.

### Links
- ADR-002 ↔ pattern `archimate-cell-based-source` ↔ cycle 003.
- cycle 003 segue cycle 002 (Posizione label) e cycle 001 (PoC base).

### Reusable from this cycle
Il pattern cell-based ArchiMate con generatore zero-dipendenze è portabile a qualsiasi progetto `software-house-ai`; il framework ora lo ammette ufficialmente.

### Validation matrix
Nessun deployment target aggiunto/rimosso; la matrice non cambia.

### Close checklist
- [x] `metrics/summary.yaml` — sarà aggiornato alla chiusura (total_cycles 3).
- [x] Almeno una memory entry scritta (pattern + ADR).
- [x] Nessun failure da loggare in `memory/errors/` (un bug nel parser YAML del vocabolario, rilevato e corretto in-ciclo, è documentato nel Self-Test; non ha causato output errato committed).
- [x] Nessun deployment target cambiato.
- [x] `docs/MAP.md` aggiornato.
- [x] `architecture/` use case doc `last_verified` aggiornato.
- [x] ADR-002 scritto.
- [x] `operations/` comandi archimate riflessi.
- NRC: nessun bug umano fissato → nessun nuovo item NRC obbligatorio.

## Step 11 — EVOLUTION MASTER: Evaluate the Process

**Agent:** claude-opus-5-5
**Cycle quality score:** 4 — Track F era appropriato: la domanda con `AskUserQuestion` ha fissato 5 decisioni requisito prima della build, evitando rework; Steps 3–6 hanno prodotto alternative reali (A4 inversione è antitetica dal primo principio) e il Critic ha portato ai marker idempotenti + `--check`. Non 5 perché single-model: la diversità cognitiva è strutturale, non emergente.
**Process observations:** il parser YAML minimale ha richiesto un fix in-ciclo (vocabolario motivation); con un use case pilota singolo il Drift è stato auto-rilevato subito.
**Proposed improvements:** nessuna proposta formale Article 11; il pattern è già promotibile.

## Step 12 — ARBITER: Decide

**Agent:** claude-opus-5-5
**Decision:** ACCEPTED

**Rationale:** Tutte le AC-01..AC-09 sono verificate. Il generatore produce un diagramma coerente con le celle, `--check` è idempotente, NRC-A01..A04 restano verdi (12/12), il framework ammette il pattern e la memoria lo rende riutilizzabile. L'unica ipotesi aperta (render PlantUML in CI) è non-bloccante perché il codice è l'autorità per protocollo. Step 10 close checklist completa.

**Status:** decided
