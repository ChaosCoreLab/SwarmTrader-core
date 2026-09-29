## Software House AI

This project operates under the **Software House AI** framework.

- Framework: `software-house-ai/`
- Constitution: binding on all agents — `software-house-ai/CONSTITUTION.md`
- Session startup: `software-house-ai/protocols/session.md`
- Cycle protocol: `software-house-ai/protocols/operational-cycle.md`
- Instance config: `.swhouse/instance.yaml`

### Session startup — mandatory

At the start of every session, follow `software-house-ai/protocols/session.md`:
1. Read `.swhouse/instance.yaml`.
2. Check `.swhouse/cycles/current.md`; resume an open cycle if present.
3. Read `.swhouse/metrics/summary.yaml`.
4. Read `.swhouse/memory/validation/non_regression_checklist.md` and announce any applicable H-type items pending human validation.
5. Scan `.swhouse/memory/decisions/` and `.swhouse/memory/patterns/` when relevant.
6. Announce as COORDINATOR: `[COORDINATOR]: Session resumed. [one-line status.]`

Use the file-based protocols for cycle work. Prefix role output during formal cycles and keep cycle state in `.swhouse/cycles/current.md`.