---
use_case: eni-replay
layer: technology
last_verified: 2026-10-05
---

# Technology layer — ENI replay

<!--
Come modificare questo file
- Ogni elemento è una sezione "### Nome" seguita da righe "- campo: valore".
  Campi: id (univoco, senza spazi), aspect, type, role, tech (facoltativo).
- Ogni relazione è una riga della tabella "Relations", scritta nel file del livello dell'elemento "from".
- Tipi ammessi: archimate/_vocabulary.md. Regole: software-house-ai/protocols/archimate-modeling.md.
- Anteprima immediata: npm run archimate:watch. Verifica: npm run archimate:check.
-->

## Elements

### Web browser
- id: tech_browser
- aspect: active-structure
- type: node
- role: Runs the whole app on the analyst's machine; there is no server-side runtime.
- tech: Any modern browser; entry point src/main.js, bundled by Vite.

### GitHub Pages
- id: tech_pages
- aspect: active-structure
- type: node
- role: Static hosting that publishes the app and this documentation.
- tech: Built and deployed by .github/workflows/pages.yml (npm run build with the Pages base path); the app is served under /SwarmTrader-core/app/.

### Node.js toolchain
- id: tech_node
- aspect: active-structure
- type: system-software
- role: Runs the price-data refresh outside the app, on request; never part of the running app.
- tech: Node 20 or newer; npm run data:update (scripts/fetch-eni-data.mjs).

### Borsa Italiana chart service
- id: tech_borsa
- aspect: active-structure
- type: node
- role: External endpoint run by Borsa Italiana that returns ENI daily prices; called only when the data is refreshed, never by the browser.
- tech: HTTP POST from scripts/fetch-eni-data.mjs.

### Static hosting
- id: tech_svc_hosting
- aspect: behaviour
- type: technology-service
- role: Serves the app files and the documentation over HTTPS.
- tech: GitHub Pages deployment from .github/workflows/pages.yml.

### Price data refresh
- id: tech_svc_refresh
- aspect: behaviour
- type: technology-service
- role: On explicit request only, downloads ENI prices, checks them and writes the price file in one step.
- tech: npm run data:update (scripts/fetch-eni-data.mjs).

### ENI price file (src/data/eni-ohlcv.json)
- id: tech_art_snapshot
- aspect: passive-structure
- type: artifact
- role: The price file kept in the repository; its content is embedded in the app files at build time.
- tech: Imported by src/main.js; written by scripts/fetch-eni-data.mjs.

### Published app files (dist/)
- id: tech_art_bundle
- aspect: passive-structure
- type: artifact
- role: The static JavaScript, CSS and fonts that make up the app, including the embedded price data.
- tech: Output of vite build, copied to the Pages site under /app/ by .github/workflows/pages.yml.

## Relations

| from | relation | to | label |
|------|----------|----|-------|
| tech_pages | realizes | tech_svc_hosting | |
| tech_pages | assigned-to | tech_art_bundle | stores |
| tech_svc_hosting | serves | tech_browser | |
| tech_browser | assigned-to | tech_art_bundle | runs |
| tech_node | realizes | tech_svc_refresh | |
| tech_borsa | serves | tech_svc_refresh | |
| tech_svc_refresh | accesses | tech_art_snapshot | writes |
| tech_art_bundle | aggregates | tech_art_snapshot | embeds at build |
| tech_art_snapshot | realizes | app_data_stockdata | |
| tech_art_bundle | realizes | app_chart_ui | |
| tech_art_bundle | realizes | app_sim_ctrl | |
| tech_art_bundle | realizes | app_data_trainer | |
| tech_art_bundle | realizes | app_validator | |
| tech_svc_refresh | serves | bus_proc_acquire | |
