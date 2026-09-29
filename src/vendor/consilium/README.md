# Consilium browser modules

Vendored from `simpego81/consilium` at commit `30ae93fca6a9a2eab59123a87f0ffdfbe993db45`.

The selected browser modules are vendored under the upstream MIT license in `LICENSE`. Project-specific adapters live outside this directory.

Two browser-only dead paths were removed from the vendor fork: the permanently disabled low-cap profile URL in `life.js`, and unused CSV/Node `fs`/`path` imports in `stockStream.js`. Trading, state transition, stream, Portfolio, and Trader logic remain as upstream.