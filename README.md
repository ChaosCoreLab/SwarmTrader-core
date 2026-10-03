# SwarmTrader-core

PoC statico per riprodurre nel browser il trader virtuale Consilium su uno snapshot giornaliero OHLCV di ENI. La simulazione usa un genoma fisso, senza backend runtime e senza trading reale.

## Avvio rapido

```sh
npm install
npm run dev
```

Aprire `http://127.0.0.1:5173/`. Lo snapshot ENI (`src/data/eni-ohlcv.json`) è versionato; `npm run data:update` serve solo per aggiornarlo dalla fonte Borsa Italiana.

I comandi valgono su Linux, macOS e Windows `cmd`; in Windows PowerShell usare `npm.cmd` al posto di `npm`.

## Verifica

```sh
npm test
npm run build
```

## Documentazione

Consultare [docs/MAP.md](docs/MAP.md) come indice per architettura, caso d'uso ArchiMate, ADR e procedure operative.
