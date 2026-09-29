---
discovered: 2026-09-29
cycle: 001
applicability: "Projects that vendor or adapt an upstream engine and must prove behavioural identity with it."
---

## Problem
A vendored or adapted engine (forked modules, custom data provider, custom driver loop) can drift from the upstream behaviour in ways unit tests do not reveal.

## Solution
Keep a script that checks out the upstream at the pinned commit, refuses local changes, runs the **unmodified** upstream entry point on the same input (inputs read from the requirement source, not from project code), and records a compact per-step trace plus final outcomes as a versioned golden file. A test replays the project path and requires exact equality; it is skipped, not failed, while the golden is absent. Normalize through a JSON round-trip before comparing, because the golden cannot store `undefined`.

## References
`scripts/golden-consilium.mjs`, `tests/golden.test.js`, `docs/operations/development.md#golden-reference-trace`.
