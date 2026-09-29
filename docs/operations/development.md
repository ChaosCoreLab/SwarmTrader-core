# Development and Operations

last_verified: 2026-09-29

## Requirements

- Node.js 20 or newer and npm.
- Windows PowerShell: use `npm.cmd` to avoid execution-policy issues with `npm.ps1`.
- Borsa Italiana network access only when refreshing data.

## Install

```powershell
npm.cmd install
```

With npm versions that gate lifecycle scripts, review and approve only the `esbuild` install script required by Vite, then run the install again if npm requests it.

## Update local ENI snapshot

```powershell
npm.cmd run data:update
```

The script requests daily OHLCV from Borsa Italiana for `ENI.MTA`, validates row shape, ordering, finite numeric values and OHLC bounds, filters inclusive dates 29/09/2016–28/09/2026, and atomically writes `public/data/eni-ohlcv.json`. It prints actual bar count, first/last dates and SHA-256. If the endpoint is unavailable or malformed, it fails without replacing the prior snapshot.

The data asset is versioned in Git (Owner confirmed Borsa Italiana reuse terms on 29/09/2026). Commit a refreshed snapshot only together with its new hash and coverage in the cycle log.

## Run locally

```powershell
npm.cmd run dev
```

Open `http://127.0.0.1:5173/`. The static page reports a visible error if the local snapshot is missing or fails integrity validation.

## Build and test

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

The build output is static under `dist/`; no Node server is required during replay. Tests include a full replay of the local ENI snapshot and representative invalid-data and trade-invariant cases.

## Browser smoke check

1. Open the local UI at desktop size and at 390 px viewport width.
2. Confirm snapshot coverage and bar count.
3. Enable/disable IIR and state overlays; advance a bar and reset.
4. Confirm the event ledger uses Broker fills and no console errors appear.

## Data and financial disclaimer

The PoC is historical analysis only. It does not execute real trades or claim profitability. Borsa Italiana reuse of the snapshot was confirmed by the Owner on 29/09/2026; keep the source attribution in the snapshot metadata.