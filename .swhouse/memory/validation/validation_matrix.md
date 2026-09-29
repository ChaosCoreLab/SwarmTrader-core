# Validation Matrix

last_updated: 2026-09-28
provisional: true

## Targets

| Target | Scope | Verification procedure | Owner | Status |
|--------|-------|------------------------|-------|--------|
| local-static-ui | User-facing HTML/JavaScript at `http://127.0.0.1:5173/` | `npm.cmd run build`, then browser smoke at desktop and <=480px: data loaded, step/reset, overlays, no console errors | U422756 | Configured |
| data-snapshot | Local Borsa acquisition artifact; not a production deployment | `npm.cmd run data:update`; verify count, first/last dates, cutoff, checksum, OHLCV schema | U422756 | Configured |

No production deployment targets are in scope. Matrix is provisional because no VALIDATOR role is configured in `instance.yaml`; the SCIENTIST must use these procedures and record actual outcomes.