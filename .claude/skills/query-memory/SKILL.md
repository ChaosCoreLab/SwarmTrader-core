---
name: query-memory
description: Search the Software House AI organizational memory in .swhouse/memory/ for decisions, patterns, errors and knowledge.
argument-hint: "query"
---

Read `software-house-ai/instances/claude-code/skills/query-memory.md` and follow its instructions.

Arguments: $ARGUMENTS

Project rules that take precedence over that file:

- Resolve the active instance as described in `CLAUDE.md` (Instance selection) wherever the skill reads `.swhouse/instance.yaml`.
- The steps required are those of the cycle's track in `software-house-ai/protocols/operational-cycle.md` (S, M, F, SA), not always all 12.
- One step per session is the default; continue in the same session only when the operator asks for it.
