---
name: vote
description: Record a reputation vote for an intervention in the current Software House AI cycle.
argument-hint: operator-id step score "rationale"
---

Read `software-house-ai/instances/claude-code/skills/vote.md` and follow its instructions.

Arguments: $ARGUMENTS

Project rules that take precedence over that file:

- Resolve the active instance as described in `CLAUDE.md` (Instance selection) wherever the skill reads `.swhouse/instance.yaml`.
- The steps required are those of the cycle's track in `software-house-ai/protocols/operational-cycle.md` (S, M, F, SA), not always all 12.
- One step per session is the default; continue in the same session only when the operator asks for it.
