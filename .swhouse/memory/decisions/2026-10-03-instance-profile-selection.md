---
date: 2026-10-03
cycle: 006
title: Per-machine instance profiles selected by an untracked local file
status: active
superseded_by: null
---

## Context
The project is operated from two workstations with different agents: Windows + Copilot (operator U422756, Simone) and Ubuntu + Claude Code (operator Luca). The framework defines a single committed `.swhouse/instance.yaml` and, for several machines, only suggests branches or a `.swhouse/instances/` naming convention, with no selection mechanism.

## Decision
`.swhouse/instance.yaml` stays committed and is the default instance (Windows). Alternative profiles are committed as `.swhouse/instances/<profile>.yaml`. The operator of a machine selects a profile by hand with the untracked `.swhouse/instance.local.yaml` (`profile: <name>`); if the file is absent the default applies; an unknown or missing profile name is an error, never a fallback. The rule is written identically in `CLAUDE.md` and `.github/copilot-instructions.md`, and every cycle records `**Instance:**` in Step 1.

## Rationale
Which machine is in use is a local fact, not a repository fact. Keeping the default committed leaves the Windows workstation unchanged and keeps the framework's install checklist satisfied. A pointer to a committed profile avoids an untracked full copy that drifts unnoticed. Rejected: an untracked `instance.yaml` copied from a profile (breaks a clean clone and the Windows flow) and per-machine branches (fragment shared memory).

## Consequences
- This is a project-level extension: `software-house-ai/protocols/session.md` knows only `instance.yaml`. The rule lives in the project adapters; a proposal upstream is open.
- `framework_version` is duplicated in the default and in each profile and must be updated together on a submodule upgrade.
- The local file is invisible in git, so the `**Instance:**` line in Step 1 is the only trace of who ran a cycle.
- Claude Code skills are thin wrappers in `.claude/skills/<name>/SKILL.md` pointing at the submodule's skill files; the flat `.md` layout described in the framework's INSTALL.md was not used.
- The Owner and validator remains U422756; Luca is an operator.

## Confidence
Medium — the rule is declarative and followed by agents reading the adapters; it has been exercised on the Ubuntu workstation only.
