---
date: 2026-09-28
cycle: 001
severity: low
occurred_at: 2026-09-28T20:20
logged_at: 2026-09-28T20:24
---

## What was attempted
POST to the Borsa Italiana OHLCV endpoint from PowerShell to inspect ENI 10-year coverage.

## What was observed
The terminal prefixed the command with `^U`, then reported `$ErrorActionPreference` as an unrecognized command. The remaining request executed and returned 2,517 response rows.

## Root cause
Pending. The captured terminal input contained a control character before the first PowerShell statement.

## How it was detected
The PowerShell error appeared in the endpoint test output.

## Resolution
Pending. Endpoint results were returned despite the command-prefix error; subsequent commands will be run independently and checked for clean output.

## Lesson
Do not treat a partially successful terminal invocation as clean validation; separate data-request results from shell initialization errors.

## Related
- Cycle 001, Steps 3 and 9.

## Additional probe failure
At approximately 2026-09-28T22:50, the coverage inspection treated each Borsa OHLCV row as an object with a `.value` property. The endpoint rows are positional arrays; dereferencing `.value[0]` produced repeated `NullArray` errors. The endpoint request itself succeeded. Resolution: map indexes 0 and 2–6 directly and add a representative payload-shape check to the acquisition script.

## Additional probe failure
At approximately 2026-09-28T22:55, a PowerShell SHA-256 comparison command failed to parse because of nested `Join-Path` expressions. No project file was changed by the failed check. Resolution: split source-root and source-file path construction into separate variables before rerunning the hash comparison.

## Additional probe failure
At approximately 2026-09-28T22:56, the terminal reported the built-in PowerShell command `Test-Path` as unrecognized while the subsequent `npm.cmd exec vite -- --version` succeeded (`vite/7.3.6`). The repository was unchanged. Resolution: rely on the successful Vite execution check instead of this filesystem probe.

## Additional probe failure
At approximately 2026-09-28T23:00, PowerShell could not resolve `node` for a direct test invocation, although `npm.cmd` remained available. No project files were changed by the failed command. Resolution: invoke tests through `npm.cmd`, which selects its Node runtime internally, and record actual exit status.

## Additional probe failure
At approximately 2026-09-28T23:05, a later PowerShell terminal could no longer resolve `npm.cmd` for the snapshot update, despite the package being available to an earlier terminal and the VS Code build task. No snapshot file was written. Resolution: run the operation as a workspace task and verify the resulting asset through workspace files.

## Additional probe failure
At approximately 2026-09-28T23:12, the VS Code task runner injected the js-debug bootloader through `NODE_OPTIONS`; the Node test process logged `This Environment was initialized without a V8::Inspector`. All six tests nevertheless passed. Resolution: clear `NODE_OPTIONS` in project task definitions and rerun tests/build without the debugger preload.

## Additional probe failure
At approximately 2026-09-28T23:15, a browser smoke-test click used a stale accessibility reference after Vite hot reload and timed out while targeting the wrong control. The page remained unchanged. Resolution: re-read the page and use stable selectors for follow-up interactions.

## Additional probe failure
At approximately 2026-09-28T23:16, the browser click tool could not activate the visually hidden checkbox input; the visible label/track is the intended hit target. No page state changed. Resolution: target the visible switch track (`#state-toggle + .toggle-control__switch`) instead of the hidden input.

## Additional failure
At approximately 2026-09-28T23:20, Vite HMR returned HTTP 500 for `src/main.js` after the incremental-chart edit; the browser displayed its import-analysis error overlay. Root cause is under investigation. Resolution and regression test are pending; keep the Vite/browser smoke test as the reproducer.

## Additional probe failure
At approximately 2026-09-28T23:25, the full-replay Playwright probe passed timeout options as the second `waitForFunction` argument, so Playwright used its default 10-second timeout and stopped before the 2,517-bar replay completed. This is a test-harness error, not evidence of a simulation failure. Resolution: inspect the current page, then pass the timeout in Playwright's third argument and repeat.