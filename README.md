# SwarmTrader-core

PoC statico per riprodurre nel browser il trader virtuale Consilium su uno snapshot giornaliero OHLCV di ENI. La simulazione usa un genoma fisso, senza backend runtime e senza trading reale.

## Avvio rapido

```powershell
npm.cmd install
npm.cmd run dev
```

Aprire `http://127.0.0.1:5173/`. Lo snapshot ENI (`src/data/eni-ohlcv.json`) è versionato e incorporato nell'app al build; `npm.cmd run data:update` serve solo per aggiornarlo dalla fonte Borsa Italiana.

## Verifica

```powershell
npm.cmd test
npm.cmd run build
```

## Documentazione

Consultare [docs/MAP.md](docs/MAP.md) come indice per architettura, caso d'uso ArchiMate, ADR e procedure operative.
