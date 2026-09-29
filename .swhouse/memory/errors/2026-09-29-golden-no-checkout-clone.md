---
date: 2026-09-29
cycle: 001
severity: low
occurred_at: 2026-09-29T10:20
logged_at: 2026-09-29T10:40
---

## What was attempted
First run of `npm run golden` with no local Consilium reference.

## What was observed
The script aborted with "Consilium reference has local changes in public/src" on a fresh clone.

## Root cause
The clone used `--no-checkout`. The default branch tip was already the pinned commit, so the script skipped `checkout`; the index stayed empty and `git status` reported every file as deleted.

## Fix
A freshly created clone now always runs `git checkout --force --detach <commit>`. A user-supplied `CONSILIUM_REF_DIR` is never forced.

## How it was detected
The pristine-source guard in the script itself.
