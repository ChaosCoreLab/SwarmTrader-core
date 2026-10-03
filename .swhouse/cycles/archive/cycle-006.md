---
cycle: 006
status: closed
opened: 2026-10-03
closed: 2026-10-03
decision: DEFERRED
problem: "Riallineare i riferimenti obsoleti allo snapshot, rendere la documentazione operativa multi-piattaforma (Windows/Linux/macOS) e introdurre l'istanza Ubuntu + Claude come alternativa selezionabile a quella Windows + Copilot"
track: M
---

## Step 1 — COORDINATOR: Open the Problem

**Agent:** claude-opus-5-5
**Instance:** ubuntu-workstation (operator: Luca)
**Track:** M — due parti a design già deciso (riferimenti obsoleti, comandi multi-piattaforma) più una piccola decisione di design (selezione del profilo di istanza). Explorer (Step 4) e Destroyer (Step 6) omessi: spazio del problema ristretto, nessun codice runtime toccato.

**Problem statement**
Tre difetti di allineamento, emersi alla prima sessione su una postazione Linux con Claude Code:

1. Dal ciclo 005 lo snapshot ENI è in `src/data/eni-ohlcv.json` ed è importato nel bundle, ma molti file descrivono ancora `public/data/eni-ohlcv.json` e un fetch locale a runtime.
2. La documentazione operativa, la checklist NRC, la matrice di validazione e i task VS Code assumono Windows PowerShell (`npm.cmd`, `npx.cmd`); su Linux e macOS i comandi non sono descritti e i task VS Code non partono.
3. `.swhouse/instance.yaml` descrive una sola istanza (windows-workstation, provider copilot, operator U422756). Non esiste un modo dichiarato di operare da una seconda postazione con un altro provider, e Claude Code non ha alcun aggancio al framework (mancano `CLAUDE.md` e `.claude/`): l'unico adapter presente è `.github/copilot-instructions.md`.

**Why now**
Un secondo operatore (Luca) inizia a lavorare da Ubuntu con Claude Code mentre la postazione Windows + Copilot (Simone, U422756) resta in uso. Senza questo ciclo il secondo operatore lavora con istruzioni sbagliate e con un `instance.yaml` che non lo descrive.

**Scope — IN**
- Riferimenti obsoleti a `public/data/…` e al fetch runtime in: `README.md`, `docs/architecture/simulator-overview.md` (prosa e Mermaid), celle `archimate/eni-replay/*` (6 file) con rigenerazione di `docs/architecture/use-case-eni-replay.md` e dell'include ArchiMate, `.gitattributes`, `.gitignore`, `.swhouse/memory/validation/validation_matrix.md`, `.swhouse/memory/validation/non_regression_checklist.md`, `.swhouse/memory/patterns/static-historical-replay.md`.
- Comandi multi-piattaforma in `README.md`, `docs/operations/development.md`, checklist NRC e matrice di validazione; `.vscode/tasks.json` utilizzabile su Windows, Linux e macOS.
- Profili di istanza versionati (`windows-workstation`, `ubuntu-workstation`) e meccanismo di selezione manuale tramite file locale non versionato; istruzione identica per Claude e Copilot; procedura per l'operatore.
- Adapter Claude Code: `CLAUDE.md` di progetto e skill del framework, con verifica che Claude Code le riconosca.
- Decisione in `memory/decisions/`, MAP, memoria.

**Scope — OUT**
- Codice in `src/`, `tests/`, `scripts/` (salvo quanto serve alla rigenerazione ArchiMate, che non modifica gli script).
- Cicli archiviati, ADR accettati ed `errors/2026-09-28-terminal-control-character.md`: sono registri storici, non si riscrivono.
- Modifiche al submodule `software-house-ai/` (l'eventuale proposta upstream è un ciclo a parte).
- Verifica su macOS: nessuna postazione disponibile; le istruzioni macOS vanno dichiarate come non verificate.

**Estimated complexity:** Medium (molti file, nessuna logica; una decisione di design contenuta).

**Context check**
- Memory lookup: `memory/patterns/archimate-cell-based-source.md` (le celle sono la sorgente, il doc si rigenera), `memory/patterns/jekyll-stakeholder-docs.md` (escape Liquid nella prosa), `memory/patterns/static-historical-replay.md` (contiene un riferimento obsoleto, in scope). Nessuna entry precedente su istanze multiple o adapter Claude Code.
- Validation matrix: nessun nuovo target di deployment. Il target `github-pages` è toccato indirettamente (doc e include ArchiMate rigenerati): la build Jekyll va verificata. La matrice stessa è in scope come file da correggere.
- NRC H-item check: file previsti in modifica — `README.md`, `docs/**`, `archimate/**`, `_includes/use-cases/*`, `.gitattributes`, `.gitignore`, `.vscode/tasks.json`, `.swhouse/**`, `CLAUDE.md`, `.claude/**`, `.github/copilot-instructions.md`. Moduli NRC — A01/A02: `src/engine/*`, `src/vendor/consilium/*`, snapshot; A03: `src/main.js`, `src/styles.css`, `index.html`, `src/engine/*`; A04: `src/engine/simulationController.js`, `src/main.js`; H01: UI nel suo insieme. Nessuna intersezione: module trigger non attivo. Age trigger non attivo: NRC-H01 è VERIFIED (2026-09-29), non PENDING. **No H-items triggered this cycle.** NRC-A01..A04 vanno comunque eseguiti allo Step 9 come prova che i comandi documentati funzionano su Linux.
- Cognitive diversity note: single-model deployment; con Track M senza Step 4 e 6 il controllo si riduce a Step 3 → Step 5: il CRITIC deve aggiungere informazione nuova rispetto all'ARCHITECT.

**Owner / operator decisions captured (requirements)**
1. La postazione Windows + Copilot resta in uso; Ubuntu + Claude si aggiunge come alternativa, non la sostituisce.
2. La scelta del profilo attivo è una configurazione manuale dell'operatore su un file non versionato, a condizione che l'istruzione sia chiara.
3. L'operatore della postazione Ubuntu è Luca. U422756 è Simone.
4. La documentazione deve coprire Windows, Linux e macOS.

**Open point for Step 2**
- U422756 è registrato come Owner e validatore (matrice di validazione, NRC). Va stabilito se le validazioni umane eseguite da Luca valgono come quelle dell'Owner. Assunzione di lavoro finché non deciso: l'Owner resta U422756 e Luca è operatore.

## Step 2 — PRODUCT OWNER: Define the Value

**Agent:** claude-opus-5-5

**Who:** gli operatori del progetto (Simone su Windows + Copilot, Luca su Ubuntu + Claude Code) e chiunque cloni il repository su Linux o macOS; in seconda battuta gli stakeholder che leggono l'architettura pubblicata.
**Value:** un operatore su qualunque dei tre sistemi installa, testa e avvia il PoC seguendo la documentazione senza adattare i comandi; ogni agente sa quale istanza sta eseguendo; la documentazione descrive il percorso dati reale.
**Cost of not solving:** istruzioni che falliscono su Linux/macOS (`npm.cmd` non esiste), architettura pubblicata che descrive un file e un fetch che non esistono più, cicli eseguiti da Claude registrati sotto un'istanza che dichiara Copilot e un altro operatore.

**Acceptance criteria**
- AC-01: nessun riferimento a `public/data/` né a un fetch runtime dello snapshot nei file vivi (esclusi cicli archiviati, ADR, `memory/errors/`, `human-interaction/`).
- AC-02: `npm run archimate:check` passa; documento use-case e include ArchiMate rigenerati dalle celle corrette.
- AC-03: README e `docs/operations/development.md` danno comandi validi su Windows, Linux e macOS; le parti macOS non verificate sono dichiarate tali.
- AC-04: `.vscode/tasks.json` usa `npm` su Linux/macOS e `npm.cmd` su Windows.
- AC-05: esiste un profilo versionato Ubuntu + Claude (12 ruoli, operator Luca); il comportamento della postazione Windows non cambia senza alcuna azione di Simone.
- AC-06: la regola di selezione è scritta in modo identico per Claude e Copilot, la procedura per l'operatore è in `operations/`, il file locale è ignorato da git.
- AC-07: Claude Code carica il framework all'avvio (`CLAUDE.md`) e dispone delle skill di ciclo.
- AC-08: su Linux `npm ci`, `npm test`, `npm run build` passano (NRC-A01, A02, A04 parte unit); e2e (NRC-A03) eseguito se Chromium è installabile.
- AC-09: decisione registrata in `memory/decisions/`, MAP e metriche aggiornate.

**Owner/validator:** l'Owner resta U422756. Questo ciclo non contiene H-item; l'unica conferma esterna prevista è l'esito della build Pages dopo il push.

**UX Coherence Check:** non applicabile — nessuna funzionalità o input rivolto all'utente dell'app è modificato.

## Step 3 — ARCHITECT: Propose Structure

**Agent:** claude-opus-5-5

**Decomposition**
- P1 — Riferimenti obsoleti: correzione testuale; per ArchiMate si corregge la sorgente (celle) e si rigenera.
- P2 — Multi-piattaforma: forma canonica `npm …` (valida ovunque), nota Windows PowerShell `npm.cmd`; `tasks.json` con override `windows`.
- P3 — Istanza: profili + selezione.
- P4 — Adapter Claude Code: `CLAUDE.md` + skill.

**P3 — approcci**
- A1 — *Default + override locale a puntatore.* `.swhouse/instance.yaml` resta versionato ed è il default (Windows). I profili alternativi stanno in `.swhouse/instances/<nome>.yaml`. `.swhouse/instance.local.yaml` (gitignored) contiene `profile: <nome>`; se esiste, l'agente legge quel profilo al posto del default. Pro: zero cambi per Windows, conforme al framework (instance.yaml presente e committato), profili rivedibili. Contro: asimmetria default/alternativi; regola in più da leggere.
- A2 — *`instance.yaml` locale non versionato, copiato da un profilo.* Pro: un solo file letto, nessuna regola di precedenza. Contro: viola la checklist del framework, un clone pulito non ha istanza, la copia diverge in silenzio, Windows deve agire.
- A3 — *Branch per macchina.* Suggerito da INSTALL.md. Contro: conflitti ricorrenti su `.swhouse/`, stato condiviso frammentato; sproporzionato.

**Raccomandato: A1.**

**P4 — approcci**
- B1 — `CLAUDE.md` che copia l'adapter `instances/claude-code/CLAUDE.md`. Contro: l'adapter è anteriore a `protocols/session.md` v1.0 (prefisso `[COORDINATOR]` sempre, 12 step obbligatori) e diverge da ciò che legge Copilot.
- B2 — `CLAUDE.md` equivalente a `.github/copilot-instructions.md` (rimanda a `protocols/session.md`) più regola di selezione dell'istanza e contesto di progetto; skill come wrapper sottili che rimandano ai file del submodule. Pro: i due agenti seguono lo stesso protocollo; nessuna copia che diverge all'aggiornamento del submodule.

**Raccomandato: B2.**

**Interfaces:** regola di selezione = un paragrafo identico in `CLAUDE.md` e `copilot-instructions.md`; procedura operatore in `docs/operations/development.md`; ogni Step 1 dichiara profilo e operatore attivi.

## Step 5 — CRITIC: Analyze Weaknesses

**Agent:** claude-opus-5-5

- C1 (A1, Medium) — *Fallimento silenzioso.* Se `instance.local.yaml` nomina un profilo inesistente o ha un refuso, un agente potrebbe ripiegare sul default e registrare il ciclo sotto l'istanza sbagliata. Mitigazione: la regola deve dire "fermati e segnala", mai fallback.
- C2 (A1, Medium) — *Invisibilità in git.* Il file locale non lascia traccia: dal repository non si può sapere quale istanza ha eseguito un ciclo. Mitigazione: riga `**Instance:**` obbligatoria nello Step 1.
- C3 (A1, Low) — *`framework_version` duplicato* in default e profili: all'upgrade del submodule vanno aggiornati tutti. Mitigazione: nota nella procedura; nessuna soluzione strutturale senza toccare lo schema.
- C4 (A1, Low) — *Estensione non nota al framework:* `protocols/session.md` conosce solo `instance.yaml`; un agente che legge solo il submodule ignora l'override. Mitigazione: la regola sta negli adapter di progetto, che sono ciò che gli agenti caricano per primi; decisione in memoria; proposta upstream fuori scope.
- C5 (P1, Medium) — *Correggere il generato invece della sorgente.* Il doc use-case e l'include derivano dalle celle; va verificato quale comando produce davvero l'include committato (`eni-replay.html`), dato che workflow e doc citano `archimate:svg`. Mitigazione: rigenerare e confrontare il diff; `archimate:check` come prova.
- C6 (P2, Medium) — *macOS non verificabile* e Windows non riverificabile da questa postazione: un `tasks.json` modificato potrebbe rompere Windows. Mitigazione: usare solo il meccanismo documentato di VS Code (`windows` override) lasciando `npm.cmd` invariato su Windows; dichiarare macOS non verificato.
- C7 (P4, Medium) — *Skill non riconosciute:* INSTALL.md indica file `.md` piatti in `.claude/skills/`, formato che Claude Code potrebbe non caricare. Mitigazione: usare la struttura `<nome>/SKILL.md` con frontmatter; il riconoscimento è verificabile solo in una nuova sessione.
- C8 (P4, Low) — La skill upstream `/close-cycle` pretende tutti e 12 gli step e `/open-cycle` impone la fine sessione: in conflitto con i track S/M del protocollo. Mitigazione: il wrapper dichiara che prevale `protocols/operational-cycle.md`.

**Ranking per rischio (alto → basso):** A2, A3, A1. **Inaccettabili:** A2 (rompe la postazione Windows e la checklist del framework), A3 (frammenta la memoria condivisa). B1 inaccettabile perché crea due protocolli diversi per i due agenti.
**UX Coherence standing check:** non applicabile (nessuna UI né input utente).
**Diversità cognitiva:** C1, C2, C5, C7, C8 non erano presenti nello Step 3.

## Step 7 — BUILDER: Produce a Solution

**Agent:** claude-opus-5-5

**Implemented**
- P1: `public/data/` → `src/data/` e rimozione del "fetch locale" in README, `simulator-overview.md` (prosa + Mermaid `bundled import`), 6 celle ArchiMate, `.gitattributes`, `.gitignore`, NRC, matrice di validazione, pattern `static-historical-replay`. Il servizio tecnologico `tech_svc_render` è rinominato "Local static load and render". Doc use-case e include rigenerati con `archimate:gen` e `archimate:html`.
- P2: comandi `npm …` / `npx …` come forma canonica in README, `development.md`, NRC e matrice, con nota PowerShell; `tasks.json` con `"command": "npm"` e override `"windows": {"command": "npm.cmd"}` sui 7 task.
- P3 (A1): `.swhouse/instances/ubuntu-workstation.yaml`, `.swhouse/instance.local.yaml.example`, `.swhouse/instance.local.yaml` (non versionato, creato su questa postazione), regola in `.gitignore`, sezione "Select the agent instance" in `development.md`.
- P4 (B2): `CLAUDE.md`, `.claude/skills/{open-cycle,close-cycle,vote,query-memory}/SKILL.md` come wrapper, sezione "Instance selection" identica in `.github/copilot-instructions.md`; `CLAUDE.md` escluso dalla build Jekyll in `_config.yml`.

**Risposta ai finding del Critic**
- C1: la regola impone stop e segnalazione, senza fallback. C2: riga `**Instance:**` richiesta nello Step 1 (già presente in questo ciclo). C3: nota nella procedura operatore. C4: regola negli adapter, decisione in memoria; proposta upstream differita.
- C5: l'include committato è prodotto da `archimate:html`, non da `archimate:svg`; `development.md` descriveva il comando sbagliato ed è stato corretto. Il workflow Pages genera ancora un SVG che il layout non include: non modificato (fuori scope), segnalato.
- C6: su Windows il comando resta `npm.cmd` tramite override; macOS dichiarato non verificato.
- C7: struttura `<nome>/SKILL.md` con frontmatter. C8: i wrapper dichiarano la precedenza del protocollo.

**Scoperte fuori dal piano, corrette perché obsolete**
- NRC-A03 dichiarava 12/12 e2e e il test "tampered snapshot": dal ciclo 005 i test sono 10 e la manomissione è coperta dagli unit test. NRC-A03 citava `src/styles.css`; il file è `src/style.css`.

**Unresolved**
- Build Jekyll non eseguibile qui (Ruby/Jekyll assenti). Riconoscimento delle skill verificabile solo in una nuova sessione Claude Code. Postazione Windows e macOS non verificabili da qui.

```
Self-Test Log:
  Component: celle ArchiMate + generatore
  Test method: npm run archimate:gen; npm run archimate:html; npm run archimate:check
  Actual output: "archimate: check ok"; diff limitato a nome/tech degli elementi corretti
  Expected output: check ok, nessuna altra variazione
  Result: PASS

  Component: comandi documentati (install/test/build) su Linux
  Test method: npm ci; npm test; npm run build
  Actual output: 0 vulnerabilità; tests 16, pass 16, fail 0; "✓ built"
  Expected output: installazione pulita, 0 failure, build completata
  Result: PASS

  Component: procedura e2e documentata su Linux
  Test method: npx playwright install chromium; npx playwright test
  Actual output: 10 passed (desktop + 390 px); prima dell'install 10 failed per browser mancante, come previsto dalla doc
  Expected output: tutti i test verdi
  Result: PASS

  Component: .vscode/tasks.json
  Test method: JSON.parse del file; conteggio override
  Actual output: JSON valido, 7 task con override windows
  Expected output: idem
  Result: PASS (solo sintassi)
  Notes: l'esecuzione dei task da VS Code non è stata provata né su Linux né su Windows.

  Component: selezione istanza
  Test method: git check-ignore .swhouse/instance.local.yaml; lettura del profilo puntato
  Actual output: file ignorato (.gitignore:13); profilo ubuntu-workstation presente, 12 ruoli provider claude, operator Luca
  Expected output: idem
  Result: PASS

  Component: build Jekyll / skill Claude Code
  Self-Test: SKIPPED
  Reason: Ruby e Jekyll non installati; le skill vengono caricate all'avvio di sessione
  Risk: errore Liquid o di include in CI; skill non elencate
  Mitigation: nessun `{%`/`{{` aggiunto alla prosa (verificato con grep); verifica umana dopo il push e in una nuova sessione
```

**Confidence:** Medium-High.

## Step 8 — OPTIMIZER: Improve the Solution

**Agent:** claude-opus-5-5

- Rimosso dal progetto iniziale il profilo duplicato `instances/windows-workstation.yaml`: il default `instance.yaml` *è* il profilo Windows; tenerne una copia avrebbe creato due file da mantenere allineati.
- Le skill non copiano i file del submodule: rimandano ad essi. Un upgrade del framework non richiede di ricopiarle.
- `CLAUDE.md` è derivato dal testo di `copilot-instructions.md` più contesto e skill, non dall'adapter upstream: un solo insieme di regole per due agenti.
- Niente altro da rimuovere. Non introdotto alcuno script di selezione: la regola è dichiarativa, come il resto del framework.

## Step 9 — SCIENTIST: Verify

**Agent:** claude-opus-5-5

**Metodo:** esecuzione su Ubuntu (Node v20.20.2) dei comandi documentati; ricerca testuale dei residui; confronto del diff generato.

**Risultati**
- AC-01: `grep` di `public/data|npm.cmd|npx.cmd` sui file vivi → restano solo le note PowerShell volute, gli override `windows` di `tasks.json` e `memory/errors/` (storico, fuori scope). VERIFIED.
- AC-02: `archimate:check` ok dopo la rigenerazione. VERIFIED.
- AC-03: Linux VERIFIED per esecuzione; Windows non rieseguito (i comandi PowerShell restano quelli dei cicli 001–005); macOS NON VERIFICATO, dichiarato nel documento.
- AC-04: sintassi VERIFIED; esecuzione da VS Code non provata.
- AC-05, AC-06: VERIFIED per ispezione dei file e `git check-ignore`; il default non è cambiato nei contenuti (solo un commento in testa).
- AC-07: `CLAUDE.md` presente; skill NON VERIFICATE in sessione.
- AC-08: VERIFIED.

**NRC:** il ciclo non modifica alcun modulo NRC (nessun file in `src/`, `index.html`). Eseguiti comunque come prova di portabilità — **NRC Type-A: 4/4 passed** (A01, A02, A04 via `npm test` 16/16 con golden non saltato; A03 e A04 via `npx playwright test` 10/10). Nessun H-item applicabile.

**Deployment targets**
```
Target: local-static-ui
Reachable by automation: YES
Verification method: npm run build; npx playwright test
Status: VERIFIED

Target: simulation-engine
Reachable by automation: YES
Verification method: npm test (incl. golden)
Status: VERIFIED

Target: data-snapshot
Reachable by automation: YES
Verification method: hash verificato dai test unit ed e2e; file non modificato
Status: VERIFIED

Target: github-pages
Reachable by automation: NO (nessun push in questa sessione; Jekyll non disponibile in locale)
Verification method: dopo il push su main, workflow "Deploy GitHub Pages" verde; la pagina use-case mostra "Local static load and render" e l'artefatto "src/data/eni-ohlcv.json"; development.md renderizzato senza errori Liquid
Status: PENDING_HUMAN
```

**Ipotesi aperte**
- Una nuova sessione Claude Code nel repository elenca `/open-cycle`, `/close-cycle`, `/vote`, `/query-memory` e annuncia l'avvio come COORDINATOR.
- I task VS Code partono su Linux e continuano a partire su Windows.
- I comandi funzionano su macOS.

**Confidence:** High sui contenuti verificati per esecuzione; Medium su Pages e skill.

## Step 10 — LIBRARIAN: Update Memory

**Agent:** claude-opus-5-5

- Nuova decisione: `memory/decisions/2026-10-03-instance-profile-selection.md`.
- Aggiornati: `memory/patterns/static-historical-replay.md` (percorso e nota sull'embedding), `memory/validation/validation_matrix.md` (percorso, comandi, piattaforme verificate, `last_updated`), `memory/validation/non_regression_checklist.md` (comandi, percorso snapshot, NRC-A03 10/10, `style.css`).
- Collegamenti: ciclo 005 (embedding dello snapshot, origine dei riferimenti obsoleti), ciclo 003 (pattern celle ArchiMate applicato per la rigenerazione).
- Riutilizzabile: il meccanismo profilo + file locale vale per ogni nuova postazione; basta aggiungere un file in `.swhouse/instances/`.
- Validation matrix: nessun target aggiunto o rimosso; staleness ok (aggiornata in questo ciclo).
- NRC H-item: nessun H-item eseguito; nessun bug segnalato da umano corretto → nessun nuovo item dovuto.
- Errori: un solo evento, e2e falliti per browser Playwright mancante alla prima esecuzione; è il comportamento atteso su macchina nuova, ora documentato con la variante Linux `--with-deps`. Non registrato in `memory/errors/`.

**Close checklist**
- [x] `metrics/summary.yaml` — `total_cycles` 6, `decisions` 3, `last_updated` 2026-10-03
- [x] Almeno una entry di memoria scritta
- [x] Fallimenti del ciclo: nessuno da registrare (vedi sopra)
- [x] Target di deployment aggiunti/rimossi: nessuno
- [x] `docs/MAP.md` aggiornato (date, due nuove righe per istanze e adapter)
- [x] `architecture/simulator-overview.md` e use-case: `last_verified` aggiornato
- [x] Decisione nuova: registrata in `memory/decisions/`; nessun ADR, perché riguarda il processo e non l'architettura del prodotto
- [x] Procedure nuove: in `operations/development.md`

## Step 11 — EVOLUTION MASTER: Evaluate the Process

**Agent:** claude-opus-5-5

**Cycle quality score: 3** — lo Step 5 ha cambiato l'esito in due punti concreti (C5 ha fatto emergere che la documentazione indicava il comando di generazione sbagliato; C1/C2 hanno prodotto la regola "nessun fallback" e la riga `**Instance:**`), ma tutti i ruoli sono stati eseguiti dallo stesso modello nella stessa sessione, su richiesta dell'operatore.

**Osservazioni**
- La ricerca dei residui andava fatta prima dello Step 1 della conversazione: lo scope iniziale era sottostimato (3 file contro 14).
- Il framework non definisce la selezione dell'istanza tra più macchine, e le skill dell'adapter Claude Code sono in conflitto con i track S/M e con il formato delle skill. Entrambe sono lacune del framework.

**Proposte (Article 11, non adottate in questo ciclo):** portare upstream la regola `instance.local.yaml`; allineare `instances/claude-code/` a `protocols/session.md` v1.0 e ai track.

## Step 12 — ARBITER: Decide

**Agent:** claude-opus-5-5

**Decision: DEFERRED**

Il contenuto è completo e verificato per esecuzione su Linux: riferimenti corretti, viste rigenerate senza drift, NRC Type-A 4/4, close checklist completa. Lo Step 9 contiene però un target `PENDING_HUMAN` (github-pages), e in quel caso il protocollo non consente ACCEPTED. Resta inoltre non verificato il caricamento delle skill in Claude Code, che è un criterio di accettazione (AC-07).

**Condizioni per la rivalutazione**
1. Target `github-pages` — dopo commit e push su `main`: il workflow "Deploy GitHub Pages" termina verde; su `https://chaoscorelab.github.io/SwarmTrader-core/docs/architecture/use-case-eni-replay/` il livello Technology mostra "Local static load and render" e `src/data/eni-ohlcv.json`; la pagina operations si apre senza testo Liquid grezzo.
2. AC-07 — in una nuova sessione Claude Code nel repository: `/open-cycle`, `/close-cycle`, `/vote`, `/query-memory` compaiono tra le skill.

**Responsabile:** Owner (U422756) per la condizione 1; operatore Luca per la condizione 2.
**Riapertura:** appendere a `cycles/archive/cycle-006.md` il blocco `## Human Verification — [data]` (Performed by / Target / Result / Notes) per ciascuna condizione. Con entrambe VERIFIED lo stato diventa `ACCEPTED`; se una fallisce si apre un ciclo Sprint che referenzia `cycle-006`.

## Human Verification — 2026-10-03
Performed by: Luca
Target: AC-07 — skill Claude Code (condizione 2 dello Step 12)
Result: VERIFIED
Notes: nuova sessione aperta dall'app Claude sul branch `cycle-006-docs-platforms-instance`. Esito positivo riferito dall'operatore su tutti i punti della procedura: (1) le quattro skill `/open-cycle`, `/close-cycle`, `/vote`, `/query-memory` compaiono nell'elenco; (2) `/query-memory "instance"` eseguita in sola lettura; (3) avvio di sessione come COORDINATOR con istanza `ubuntu-workstation`. `/open-cycle` non è stata eseguita, per non aprire un ciclo. Resta aperta la condizione 1 (target `github-pages`, verificabile solo dopo il merge su `main`): la decisione rimane DEFERRED.
