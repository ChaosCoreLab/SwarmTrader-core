# SwarmTrader-core

Static browser PoC replaying a fixed Consilium genome over an embedded ENI daily OHLCV snapshot. Start from `docs/MAP.md` for architecture, ADRs and operations; commands are in `docs/operations/development.md`.

## Software House AI

This project operates under the **Software House AI** framework.

- Framework: `software-house-ai/`
- Constitution: binding on all agents — `software-house-ai/CONSTITUTION.md`
- Session startup: `software-house-ai/protocols/session.md`
- Cycle protocol: `software-house-ai/protocols/operational-cycle.md`
- Instance config: `.swhouse/instance.yaml` (default; see Instance selection)

### Instance selection

The active instance is resolved before step 1 of the session startup:

- If `.swhouse/instance.local.yaml` exists, read its `profile` value and use `.swhouse/instances/<profile>.yaml` as the instance configuration in place of `.swhouse/instance.yaml`.
- If it does not exist, use `.swhouse/instance.yaml` (the default instance).
- If the local file names a profile with no matching file, or has no `profile` value, stop and report it to the operator. Do not fall back to the default.

`.swhouse/instance.local.yaml` is untracked and set by hand by the operator of each machine (see `docs/operations/development.md`). When opening a cycle, record the active profile and operator in Step 1 as `**Instance:** <machine> (operator: <operator>)`.

### Session startup — mandatory

At the start of every session, follow `software-house-ai/protocols/session.md`:
1. Read the active instance configuration (see Instance selection).
2. Check `.swhouse/cycles/current.md`; resume an open cycle if present.
3. Read `.swhouse/metrics/summary.yaml`.
4. Read `.swhouse/memory/validation/non_regression_checklist.md` and announce any applicable H-type items pending human validation.
5. Scan `.swhouse/memory/decisions/` and `.swhouse/memory/patterns/` when relevant.
6. Announce as COORDINATOR: `[COORDINATOR]: Session resumed. [one-line status.]`

Use the file-based protocols for cycle work. Prefix role output during formal cycles and keep cycle state in `.swhouse/cycles/current.md`.

Cycle skills: `/open-cycle`, `/close-cycle`, `/vote`, `/query-memory` (`.claude/skills/`). They wrap the framework's skill definitions; where a skill and `software-house-ai/protocols/operational-cycle.md` disagree (track-specific steps, steps per session), the protocol and the operator's instruction prevail.

This file and `.github/copilot-instructions.md` carry the same framework rules for two different agents. Change them together.
