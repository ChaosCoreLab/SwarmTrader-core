---
cycle: 005
status: open
opened: 2026-09-30
problem: "Fix app data 404 on Pages (embed snapshot) + stakeholder-grade documentation UI with visible interactive ArchiMate"
track: F
---

## Step 1 — COORDINATOR: Open the Problem

**Agent:** claude-opus-5-5
**Track:** F — cross-cutting: app data loading, Jekyll UI redesign, SVG generator upgrade, framework protocol.

**Problem statement**
Due difetti blocking sul sito Pages: (1) l'app PoC a /app/ mostra "Snapshot ENI non disponibile (HTTP 404)" perché `src/main.js:230` usa `fetch('/data/eni-ohlcv.json')` con path assoluto non riscritto da Vite base; (2) la documentazione non è presentabile per stakeholder e l'ArchiMate non si vede (SVG 404 per path relativo, fixed-size non responsive, PlantUML/Mermaid non renderizzati, tema minima default).

**Why now**
Il ciclo 004 ha pubblicato il sito (DEFERRED, PENDING_HUMAN). L'Owner ha ispezionato e trovato entrambi i difetti. Risolverli ora chiude il PENDING_HUMAN del ciclo 004 e fonda il template di documentazione stakeholder-grade per la lunga serie di use case.

**Scope — IN**
- Embed dello snapshot come JSON module (elimina il fetch e la classe di bug base-path).
- UI Jekyll stakeholder-grade (light clean): layout custom, landing con value frame, pagina use-case con ArchiMate interattivo (tab+hover+click), Mermaid renderizzato, navigazione scalabile.
- SVG generator upgrade: responsive + interattivo, output in `_includes/`.
- Framework: protocollo `documentation-presentation.md` (Article 21).
- ADR-004, MAP, operations, memoria, workflow (npm test in CI).

**Scope — OUT**
- Celle-collassabili extra dal generatore (interattività è tab+hover+click).
- Webfont esterno.
- Custom domain.
- Nuovi use case oltre eni-replay.
- O1/O2 (limiti noti accettati).

**Estimated complexity:** Medium-High.

**Owner decisions:** ArchiMate interattivo (tab+hover+click); light clean (system font, no webfont, CSS tokens, #fbfcfa).

**Context check**
- Memory: ADR-003 (Pages rendering), pattern archimate-cell-based-source, ADR-002.
- Validation matrix: target github-pages (PENDING_HUMAN dal cycle 004); questo ciclo risolve e chiude.
- NRC: il ciclo tocca `src/main.js` (data loading) e `src/engine/` (nuovo validator) → NRC-A01..A04 sono target; e2e (NRC-A03) va verificato.
- H-item: nessun modulo NRC toccato oltre a data loading; l'ispezione visiva del sito pubblicato è la H-verification del ciclo 004.

## Step 2 — PRODUCT OWNER: Define the Value

**Who:** business angel e stakeholder tecnici che visitano il sito Pages per valutare il PoC e l'architettura.
**Problem:** l'app non carica i dati (404) e la documentazione è opaca/non presentabile.
**Impact of solving:** app funzionante online + documentazione professionale che trasferisce valore (diagrammi prima, prosa come annotazione) e scala a N use case.
**Impact of NOT solving:** demo rotta, architettura invisibile, perdita di credibilità con gli stakeholder.
**AC:**
- AC-01: l'app a /app/ carica lo snapshot embedded (no fetch, no 404), replay funzionante.
- AC-02: landing con value frame (Who/Problem/Impact) + entry cards; presentabile a business angel.
- AC-03: pagina use-case mostra ArchiMate SVG responsive, visibile, con tab layer + hover tooltip + click-to-cell.
- AC-04: simulator-overview Mermaid renderizzato (non raw code).
- AC-05: responsive ≤480px, no overflow, no console error, prefers-reduced-motion rispettato (frontend-checklist).
- AC-06: navigazione scalabile (use_cases.yml); eni-replay è il primo di una serie.
- AC-07: NRC-A01..A04 verdi; e2e verde; validateSnapshot unit test.
- AC-08: framework documentation-presentation.md + project pattern.
- AC-09: ADR-004, MAP, operations, workflow (npm test) aggiornati.

## Step 3 — ARCHITECT: Propose Structure
(see plan file: Part A embed import; Part B Jekyll layouts; Part C responsive interactive SVG; Part D framework protocol)
Recommended A1: embed JSON import + snapshotValidator; custom Jekyll layouts (no minima); inline SVG via _includes; Mermaid CDN pinned.

## Step 4 — EXPLORER: Alternatives
- B: fetch base-aware (rejected: keeps runtime fetch + public dup).
- minima + CSS override (rejected: fragile, limited).
- img absolute baseurl (rejected: no responsive/interactive).

## Step 5 — CRITIC
- JSON import 230KB inline: fine (~30KB gzip). Test path updates needed (5 refs).
- Mermaid CDN: pinned version + onerror fallback per frontend-checklist.
- SVG interactive JS: must respect reduced-motion; no auto-advance (Art. 19).

## Step 6 — DESTROYER
- Tamper e2e test breaks (no fetch) → replace with validateSnapshot unit test.
- public/data removal → data:update script + tests updated together.
