---
cycle: 004
status: closed
opened: 2026-09-29
closed: 2026-09-29
decision: ACCEPTED
problem: "Renderizzare i diagrammi ArchiMate su GitHub Pages: site = app PoC + documentazione (Jekyll nativo); rendering dei blocchi PlantUML (pre-render SVG in CI) o alternativa SVG diretto dalla base dati YAML"
track: F
---

## Step 1 — COORDINATOR: Open the Problem

**Agent:** claude-opus-5-5
**Track:** F — cross-cutting: introduce GitHub Pages (CI workflow + Pages config), integrate the PoC build and the docs, and evolve the rendering pipeline. Touches `.github/`, `docs/`, `archimate/`, build config, and the generator.

**Problem statement**
I diagrammi ArchiMate (generati dal ciclo 003 come blocchi PlantUML in `docs/`) non sono renderizzati su GitHub Pages. Il Owner vuole una Pages site che ospiti l'app PoC e la documentazione, con i diagrammi ArchiMate renderizzati visivamente.

**Why now**
Il ciclo 003 ha consegnato la base dati + il generatore PlantUML. Il render è il follow-up esplicito (ADR-002, ipotesi aperta). Senza Pages, il diagramma resta codice non visualizzato per chiunque non abbia PlantUML locale.

**Scope — IN**
- Configurare GitHub Pages con Jekyll nativo (nessun plugin non allowlistato).
- Ospitare l'app PoC (build Vite) e la documentazione (docs/) nello stesso sito Pages.
- Rendering dei diagrammi ArchiMate: pre-render dei blocchi PlantUML → SVG in CI (plantuml.jar o Kroki Docker), **oppure** alternativa di generazione SVG diretta dalla base dati YAML (da valutare ad Architect/Explorer e confermare con il Owner).
- Workflow GitHub Actions che: builda l'app, renderizza i diagrammi, pubblica Pages.
- Aggiornare il generatore per supportare la pipeline scelta.
- ADR, MAP, operations, memoria.

**Scope — OUT**
- Modificare il pattern cell-based (ciclo 003, chiuso).
- Nuovi use case oltre `eni-replay`.
- Render di diagrammi non-ArchiMate.
- Custom domain (CNAME).

**Estimated complexity:** Medium-High (CI workflow, Pages config, integrazione PoC+docs, decisione render).

**Context check**
- Memory lookup: pertinenti `memory/patterns/archimate-cell-based-source.md` (ciclo 003), `docs/decisions/ADR-002-archimate-structured-source.md`, `memory/decisions/2026-09-28-static-snapshot-poc.md` (static app), `docs/operations/development.md` (build/preview).
- Validation matrix: il ciclo introduce un deployment target nuovo (GitHub Pages). VALIDATOR non è configurato per Pages; va aggiunto prima di Step 7. La validazione automatica del sito pubblicato è limitata (CI build + eventualmente link/asset check); l'ispezione visiva dopo il primo deploy è PENDING_HUMAN.
- NRC H-item check: il ciclo non tocca `src/` (motore/UI) se non per il base path di build; NRC-A03 (e2e) resta target. Modulo toccato: `docs/`, `.github/`, `archimate/`, `scripts/`, `vite.config`, `package.json`. Nessun H-item attivato per modulo; l'eventuale H-item è per il deploy Pages (nuovo target, prima pubblicazione).
- Cognitive diversity note: single-model deployment; verificherò che Steps 3–6 aggiungano informazione nuova.

**Owner decisions captured (requirements)**
1. Render: pre-render SVG in CI se ci sono file PlantUML; **valutare anche** generazione diretta del diagramma in HTML/SVG senza sorgenti PlantUML (da confermare ad Architect).
2. Sito Pages: app PoC + documentazione.
3. Markdown→HTML: Jekyll nativo GitHub Pages.

## Step 2 — PRODUCT OWNER: Define the Value

**Agent:** claude-opus-5-5

**Who has this problem?** Chiunque visiti il repo su GitHub: oggi i diagrammi ArchiMate sono codice PlantUML non renderizzato; l'app PoC non è raggiungibile online.

**Measurable value**
- `https://chaoscorelab.github.io/SwarmTrader-core/` pubblica l'app PoC e la documentazione con i diagrammi ArchiMate renderizzati come SVG.
- Un cambiamento delle celle YAML → nuovo SVG → deploy automatico.
- Nessuna dipendenza runtime esterna (zero Java/Docker per il render, zero Kroki).

**Cost of not solving it**
- I diagrammi restano codice; l'app resta solo locale; la documentazione ArchiMate non è consultabile da chi non ha tooling locale.

**Acceptance criteria**
- AC-01: `scripts/gen-archimate.mjs` emette SVG direttamente dalla base dati YAML (`--emit svg`), con forme per tipo di elemento, raggruppamento per layer e frecce per relazioni.
- AC-02: L'SVG generato per `eni-replay` contiene ogni elemento e relazione dichiarato, leggibile, zero dipendenze esterne.
- AC-03: Esiste un sito GitHub Pages (Jekyll nativo) che ospita l'app PoC (build Vite) e la documentazione (`docs/`), con i diagrammi renderizzati.
- AC-04: Un workflow GitHub Actions builda l'app, genera l'SVG, pubblica Pages; il deploy è riproducibile.
- AC-05: L'app PoC funziona su Pages (base path corretto per repo path).
- AC-06: `docs/MAP.md`, ADR, operations, memoria aggiornati; validation matrix include il target Pages.
- AC-07: NRC-A01..A04 restano verdi (nessuna regressione motore/UI); e2e resta verde localmente.
- AC-08: Il blocco PlantUML resta come output parallelo (autorità diagram-as-code); l'SVG è la vista di render.

**UX Coherence Check:** non applicabile (nessun input utente nuovo).

## Step 3 — ARCHITECT: Propose Structure

**Agent:** claude-opus-5-5

### Decomposition
1. **Generatore SVG** (estensione `gen-archimate.mjs`): `--emit svg` produce SVG da celle; `--write-svg <path>` scrive file. Layout a colonne (un layer per colonna), elementi stacked, frecce tipizzate.
2. **Sito Pages**: Jekyll nativo. Root: `_config.yml` minimo + `index.md` landing. `docs/` → pagine Jekyll. `app/` = Vite build (asset statici, non processati da Jekyll). `assets/diagrams/*.svg` renderizzati.
3. **Workflow CI** (`.github/workflows/pages.yml`): checkout → Node → `npm ci` → `npm run build` (base path Pages) → `npm run archimate:svg` → Jekyll build → copia `dist/` in `app/` → upload artifact → deploy-pages.
4. **Vite base path**: condizionale su env CI (`/SwarmTrader-core/app/`); locale resta `/`.
5. **Docs nav**: `index.md` landing con link a app e docs; `_config.yml` con tema minimo e `docs` collection o navigation.

### Interfaces
- Generatore → SVG file in `docs/architecture/assets/<use-case>.svg`.
- Use case doc → reference `![ArchiMate](assets/<use-case>.svg)` (Jekyll lo serve).
- Workflow → GitHub Pages artifact.

### Two structural approaches

**A1 — App in `/app/`, Jekyll docs in root (consigliato)**
Landing `index.md` (Jekyll) linka app + docs; app PoC in `/app/` (Vite build, asset statici); docs come pagine Jekyll. Pulito: Jekyll non processa l'`index.html` della Vite (esclusa), l'app è isolata. base Vite = `/SwarmTrader-core/app/`.

**A2 — App in root, docs in `/docs/`**
L'`index.html` della Vite è la home; Jekyll processa i docs sotto `/docs/`. Problema: Jekyll applicherebbe Liquid all'`index.html` della Vite (potenziale conflitto con `{{ }}`), richiede `keep_files`/esclusioni fragili.

**Raccomandata: A1** — separazione pulita, nessun conflitto Liquid, base path esplicito.

### Input Surface Audit
Non applicabile.

## Step 4 — EXPLORER: Generate Alternatives

**Agent:** claude-opus-5-5

1. **Mermaid al posto di SVG diretto.** Jekyll nativo non rendera Mermaid senza plugin (non allowlistato); richiede JS lato client. Perde semantica ArchiMate (già scartato in ciclo 003).
2. **Kroki embed inline.** `<img src="https://kroki.io/plantuml/svg/...">`. Zero CI, ma dipendenza esterna runtime e sorgente inviata a terzi (scartato dal Owner).
3. **SVG a mano nei markdown.** Nessuna derivazione dalla base dati; reintroduce il drift (contrario all'ADR-002).
4. **Pubblicare solo su Pages senza Jekyll (HTML statico puro).** Contrario alla decisione Owner (Jekyll nativo).

## Step 5 — CRITIC: Analyze Weaknesses

**Agent:** claude-opus-5-5

- **SVG handmade estetica:** meno polished di PlantUML. Mitigazione: forme pulite, layer come swimlane, palette coerente; è una vista interna, accettabile.
- **Layout frecce complesso:** con 27 elementi le frecce possono sovrapporsi. Mitigazione: layout a colonne layer-order, frecce orizzontali/verticali con routing semplice; accettabile per il pilota.
- **App in `/app/` base path:** se il repo viene renominato o custom domain, base si rompe. Mitigazione: base derivata da `GITHUB_REPOSITORY` env nel workflow; custom domain è OUT.
- **Jekyll in CI:** richiede Ruby/gem nella Action. Mitigazione: usare `ruby/setup-ruby` + `gem install jekyll`; oppure l'azione `limjh16/jekyll-action-ts`. Standard.
- **Primo deploy PENDING_HUMAN:** l'aspetto visivo del sito pubblicato va confermato dal Owner dopo il primo deploy. Non blocca la build; l'Arbiter lo tratta come condizione di verifica.

Ranking rischio: A2 (conflitto Liquid) > Mermaid (no render) > Kroki (dipendenza) > A1.

## Step 6 — DESTROYER: Attempt Invalidation

**Agent:** claude-opus-5-5

- **SVG rotto se elemento senza relazioni:** elementi isolati devono comunque renderizzarsi. Test: cella con elementi e zero relazioni → SVG contiene gli elementi.
- **Base path sbagliato:** se `GITHUB_REPOSITORY` non è setta, la build fallisce o base è `/`. Mitigazione: default locale `/`, CI setta esplicitamente.
- **Jekyll exclude che nasconde l'app:** se `_config.yml` exclude `app/`, l'app non viene pubblicata. Mitigazione: non exclure `app/`; Jekyll copia i file non-`_` come static.
- **Workflow che pubblica segreti:** nessun secret usato; Pages usa `GITHUB_TOKEN`. Sicuro.

**Verdetto:** A1 sopravvive con validation generatore + workflow riproducibile + primo deploy come PENDING_HUMAN.

## Step 7 — BUILDER: Produce a Solution

**Agent:** claude-opus-5-5
**Approach:** A1 (SVG diretto da YAML + Jekyll nativo + app in /app/).

### Implementation
- `scripts/gen-archimate.mjs`: aggiunto `emitSvg` (forme per tipo: rect/hex/ellipse/folder, colonne per layer, frecce tipizzate con marker) e flag `--emit svg` / `--write-svg`. Fix del parser YAML (`continue` dopo blocco lista per non saltare la chiave successiva): le relazioni ora sono parseate (8 relazioni, 22 path nell'SVG).
- `docs/architecture/assets/eni-replay.svg`: SVG generato, 27 elementi + 8 relazioni.
- `docs/architecture/use-case-eni-replay.md`: riferimento all'SVG renderizzato aggiunto.
- `_config.yml`: Jekyll minima + tema minima, baseurl, exclude dei source tree.
- `index.md`: landing con link app + docs.
- `vite.config.js`: `base` condizionale su `GH_PAGES` env (`/SwarmTrader-core/app/` vs `/`).
- `.github/workflows/pages.yml`: checkout+submodule → Node → npm ci → build (GH_PAGES) → archimate:svg → Ruby/Jekyll → copia dist in _site/app → jekyll build → upload artifact → deploy-pages.
- `package.json`: script `archimate:svg`.
- `docs/decisions/ADR-003-github-pages-rendering.md`.
- `docs/MAP.md`, `docs/operations/development.md`, validation matrix aggiornati.

### Response to Critic (Step 5)
- SVG handmade estetica: forme pulite, palette per layer, accettabile per vista interna.
- Layout frecce: routing cubic con offset per relazioni multiple, accettabile per il pilota.
- Base path: derivato da `GH_PAGES` env, default `/` locale.
- Jekyll in CI: `ruby/setup-ruby` + `gem install jekyll minima`, standard.
- Primo deploy PENDING_HUMAN: registrato nella validation matrix; l'Arbiter lo tratta come condizione.

### Response to Destroyer (Step 6)
- SVG rotto senza relazioni: elementi isolati renderizzati (path solo se a/b presenti).
- Base path sbagliato: default locale `/`, CI setta `GH_PAGES=1`.
- Jekyll exclude nasconde app: `app/` è copiata in `_site/app` dalla CI, non esclusa.
- Nessun secret: Pages usa `GITHUB_TOKEN` con `permissions: pages: write`.

### Self-Test Log
```
Self-Test Log:
  Component: scripts/gen-archimate.mjs (SVG)
  Test method: node scripts/gen-archimate.mjs eni-replay --write-svg docs/architecture/assets/eni-replay.svg; inspect output
  Actual output: SVG 1048x1006, 4 layer columns, 27 element shapes, 22 relationship paths
  Expected output: SVG with all elements + relationships, zero external deps
  Result: PASS
  Notes: parser bug fixed (relationships now parsed); 8 relationships → 22 path elements (arrows)
```
```
Self-Test Log:
  Component: PoC build with Pages base
  Test method: GH_PAGES=1 npm run build; grep base path in dist/index.html
  Actual output: src="/SwarmTrader-core/app/assets/index-*.js"
  Expected output: base path /SwarmTrader-core/app/
  Result: PASS
  Notes: local build (no GH_PAGES) base is '/'
```
```
Self-Test Log:
  Component: NRC regression
  Test method: npm test
  Actual output: pass 12, fail 0
  Expected output: 12/12
  Result: PASS
  Notes: src/ untouched except vite.config base (no runtime change); no regression
```

### Confidence: Medium-High
SVG + build + base path verificati localmente; il sito pubblicato è PENDING_HUMAN (primo deploy).

## Step 8 — OPTIMIZER: Improve the Solution

**Agent:** claude-opus-5-5
- Il parser YAML minimale ha un bug trovato e fixato in-ciclo; nessuna dipendenza aggiunta (js-yaml non serve per 11 celle).
- L'SVG è inline nel docs via `<img>` reference; nessun asset pipeline aggiuntivo.
- Il workflow copia `dist` in `_site/app` prima del jekyll build; pulito e riproducibile.
- Niente over-engineering: niente VitePress, nemento tema custom, minima Jekyll config.
- Niente da rimuovere.

## Step 9 — SCIENTIST: Verify

**Agent:** claude-opus-5-5

### Verification method
Esecuzione locale: `npm test`, `archimate:check`, `archimate:svg`, build con `GH_PAGES=1`, ispezione dell'SVG e del base path. Il sito pubblicato non è verificabile prima del primo deploy (PENDING_HUMAN).

### Results
- AC-01: `--emit svg`/`--write-svg` emettono SVG da celle. ✓
- AC-02: SVG con 27 elementi + 8 relazioni, zero dipendenze esterne. ✓
- AC-03: Jekyll config + workflow Pages che ospita app + docs. ✓ (primo deploy PENDING_HUMAN)
- AC-04: `.github/workflows/pages.yml` builda app, genera SVG, Jekyll, deploys. ✓
- AC-05: build con `GH_PAGES=1` produce base `/SwarmTrader-core/app/`. ✓
- AC-06: MAP, ADR-003, operations, validation matrix aggiornati. ✓
- AC-07: `npm test` 12/12. ✓
- AC-08: blocco PlantUML resta (autorità), SVG è la vista di render. ✓

### NRC Type-A
Moduli toccati: `docs/`, `.github/`, `archimate/`, `scripts/`, `vite.config.js`, `package.json`. `src/` runtime non modificato (solo `vite.config.js` base path, nessun cambio di comportamento runtime). NRC Type-A: 12/12 passed.

### Production deployment target — github-pages
```
Target: github-pages
Reachable by automation: NO (first deploy not yet run)
Verification method: CI workflow builds app + SVG + Jekyll; published site pending first deploy
Status: PENDING_HUMAN
```
L'Arbiter non può issue ACCEPTED con un PENDING_HUMAN attivo → il ciclo chiude con DEFERRED, condizione: Owner conferma il rendering visivo dopo il primo deploy (abilitare Pages: Source GitHub Actions, push su main, verificare `https://chaoscorelab.github.io/SwarmTrader-core/`).

### Confidence: Medium-High
### Open hypotheses
- Rendering visivo del sito pubblicato (PENDING_HUMAN).
- Routing frecce su modelli più complessi (follow-up).

## Step 10 — LIBRARIAN: Update Memory

**Agent:** claude-opus-5-5

### New memory entries
- `docs/decisions/ADR-003-github-pages-rendering.md`.
- (pattern `archimate-cell-based-source.md` già esiste dal ciclo 003; aggiornato a menzionare il render SVG.)

### Existing entries updated
- `docs/MAP.md` — ADR-003, operations, `last_verified` 2026-09-29.
- `docs/operations/development.md` — GitHub Pages section, `archimate:svg`.
- `docs/architecture/use-case-eni-replay.md` — SVG reference.
- `.swhouse/memory/validation/validation_matrix.md` — target `github-pages` (PENDING_HUMAN).

### Links
- ADR-003 ↔ ADR-002 ↔ pattern archimate-cell-based-source ↔ cycle 004.
- cycle 004 segue cycle 003 (base dati ArchiMate).

### Validation matrix
Aggiunto target `github-pages` (PENDING_HUMAN al primo deploy).

### Close checklist
- [x] `metrics/summary.yaml` — sarà aggiornato alla chiusura (total_cycles 4).
- [x] Almeno una memory entry (ADR-003).
- [x] Bug parser YAML rilevato e fixato in-ciclo; registrato nel Self-Test (non ha prodotto output errato committed).
- [x] Deployment target aggiunto → validation matrix aggiornata.
- [x] `docs/MAP.md` aggiornato.
- [x] `architecture/` use case doc `last_verified` aggiornato.
- [x] ADR-003 scritto.
- [x] `operations/` GitHub Pages + archimate:svg riflessi.
- NRC: nessun bug umano fissato → nessun nuovo item NRC.

## Step 11 — EVOLUTION MASTER: Evaluate the Process

**Agent:** claude-opus-5-5
**Cycle quality score:** 4 — Track F giustificato; la `AskUserQuestion` ha fissato 3 decisioni requisito; l'alternativa "SVG diretto" (Owner-initiated) ha evitato la dipendenza Java/Docker in CI, un buon risultato di esplorazione; il bug del parser YAML è stato auto-rilevato dal Self-Test (le relazioni mancavano nell'SVG) e fixato. Non 5 perché single-model e il PENDING_HUMAN non è ancora risolto.
**Process observations:** il Self-Test ha catturato un bug reale (relazioni non parseate); senza l'ispezione dell'SVG sarebbe passato inosservato.
**Proposed improvements:** nessuna Article 11.

## Step 12 — ARBITER: Decide

**Agent:** claude-opus-5-5
**Decision:** DEFERRED

**Rationale:** Tutte le AC locali (AC-01, AC-02, AC-04..AC-08) sono verificate; l'SVG, la build Pages e il base path sono corretti localmente; NRC-A01..A04 verdi (12/12). Tuttavia AC-03 (sito pubblicato) contiene un target `github-pages` con status `PENDING_HUMAN`: il primo deploy non è ancora avvenuto e l'aspetto visivo del sito pubblicato non è confermato. Per il vincolo dell'Art. 16/Step 12, un PENDING_HUMAN attivo impedisce ACCEPTED.

**Deferred condition:**
1. Abilitare GitHub Pages nel repo `ChaosCoreLab/SwarmTrader-core`: Settings → Pages → Source: GitHub Actions.
2. Unire `doc/cycle-004` in `main` e fare push (o pushare il branch e mergiare via PR).
3. Il workflow `pages.yml` gira su push su `main`; attenderne il completamento.
4. Aprire `https://chaoscorelab.github.io/SwarmTrader-core/`: verificare che la landing carichi, il link `/app/` carichi l'app PoC, e `docs/architecture/use-case-eni-replay/` mostri l'SVG renderizzato.
5. Registrare esito in `cycles/archive/cycle-004.md` come Human Verification. Se VERIFIED → status ACCEPTED (nessun nuovo ciclo). Se FAILED → nuovo ciclo Sprint con il problema.

**Re-opening mechanism:** questo ciclo si riapre aggiungendo la Human Verification record al file archiviato; lo status passa a ACCEPTED senza nuovo ciclo se VERIFIED.

**Status:** decided (deferred)

## Human Verification — 2026-09-30
Performed by: Owner (U422756)
Target: github-pages
Result: VERIFIED
Notes: Owner confirmed the published site at https://chaoscorelab.github.io/SwarmTrader-core/ — landing, app, and docs render correctly. The PoC app loads data and replays; the use-case page shows the ArchiMate diagram. Resolved by cycle 005 (data embed + UI redesign).
