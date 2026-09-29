# Non-Regression Checklist

last_updated: 2026-09-29 (cycle 002)
owner: U422756 (VALIDATOR role not configured; Owner acts as validator)

Constitution Article 25. Type-A items must pass before the Arbiter may issue ACCEPTED for any cycle touching the listed modules. The list only grows; duplicates are merged.

| ID | Type | Modules | Check | Pass criterion | Since |
|----|------|---------|-------|----------------|-------|
| NRC-A01 | A | `src/engine/*`, `src/vendor/consilium/*` | `npm.cmd test` | 0 failures; genome adapter equals upstream `Individual.fromJSON`; full ENI replay 2,517 bars, FitnessValidator valid, deterministic trace | cycle 001 |
| NRC-A02 | A | `src/engine/*`, `src/vendor/consilium/*`, `public/data/eni-ohlcv.json` | `npm.cmd test` (`tests/golden.test.js`) | Golden test executed (not skipped) and equal frame-by-frame to the upstream `Life.cycle()` trace | cycle 001 |
| NRC-A03 | A | `src/main.js`, `src/styles.css`, `index.html`, `src/engine/*` | `npm.cmd run test:e2e` | 12/12 pass (desktop + 390 px): load and hash, step equals engine frame, reset, replay ledger equals broker operations, overlays, no overflow, tampered snapshot rejected, no console errors | cycle 001 |
| NRC-A04 | A | `src/engine/simulationController.js`, `src/main.js` | `npm.cmd test` (positionOpen test) and `npm.cmd run test:e2e` (replay test) | `frame.positionOpen` equals shares held per ledger on all 2,517 frames; the "Posizione" label shows "Aperta" inside an `isHolding()` gap | cycle 002 |
| NRC-H01 | H | UI as a whole | Human session, see procedure below | Owner confirms each point; outcome recorded in the cycle file | cycle 001 — ✅ VERIFIED 2026-09-29 (cycles 001, 002) |

## NRC-H01 — Human UI validation procedure

1. `npm.cmd run dev`, open `http://127.0.0.1:5173/` in a desktop browser.
2. Header shows "Dati pronti", 2.517 barre, last date 28 set 2026, SHA-256 prefix in the footer.
3. Avvia replay at the fastest speed; the chart grows bar by bar, IIR lines follow price, BUY/SELL/TP/SL markers appear on the bars where the ledger lists them.
4. Pause, toggle Stati: the background colouring matches the state chip; toggle IIR off and on.
5. Spot-check two ledger rows against the chart (date, side, price) and the inspector (Posizione, cash, total value): "Posizione" is "Aperta" whenever the position value is above zero.
6. Run to the end: state "Replay completato", validation reported valid, no error banner.
7. Reset, then repeat step 3 briefly at a ≤480 px window: controls usable, no horizontal scroll, text readable.
8. Record verdict (pass / issues found) and any observation in the current cycle file.
