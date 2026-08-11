# Research Project Init Skill Design

**Date:** 2026-08-11
**Status:** Approved design, pending implementation

## Goal

Add a portable `init` skill for empty or partially empty research repositories. A
user can ask a coding agent to “initialize my project”; the skill collects the
minimum project metadata, confirms the plan, and creates a consistent research
repository structure across Codex, Claude Code, and OpenCode.

The first release supports two paper presets:

- `IEEE conference`
- `IEEE journal`

The skill must create the selected paper template under `paper/`, rather than
only recording a template name.

## User workflow

The skill triggers for requests to initialize, scaffold, or set up a new research
project. It asks one structured questionnaire:

1. Project name (required)
2. Project overview (required)
3. Research objectives
4. Research questions or problem statement
5. Dataset or data sources
6. Planned methods/models
7. Authors and affiliations
8. Paper template (required: `ieee-conference` or `ieee-journal`)

Unknown optional fields may be left blank. Before writing, the agent presents a
summary of the collected values, the selected template, and the planned file
changes. The user must confirm that summary.

## Target structure

The scaffold creates:

```
README.md
AGENTS.md
.gitignore
pyproject.toml
src/core/
src/configs/{baselines,proposed,ablations,experiments}/
src/scripts/
src/data/
tests/
results/{raw,processed,analysis,figures,tables}/
paper/main.tex
paper/sections/
paper/figures/
paper/tables/
paper/references.bib
paper/templates/
paper/TEMPLATE.md
docs/architecture.md
docs/methodology.md
docs/experiments.md
docs/reproduction.md
docs/notes/
superpowers/{specs,plans,decisions}/
```

Empty directories receive `.gitkeep` files when needed for Git tracking. The
generated README and docs use the questionnaire values, while `AGENTS.md`
describes the project-specific research conventions and safe operating rules.

## Portable architecture

The implementation has two layers:

1. `skills/initializing-research-project/SKILL.md` contains the agent-facing
   trigger, questionnaire, confirmation gate, and instructions for invoking the
   scaffold.
2. `skills/initializing-research-project/scripts/init-project.mjs` contains
   deterministic filesystem, manifest, download, and validation logic. It runs
   with Node.js 20 on macOS, Linux, and Windows and does not depend on a
   platform-specific shell.

The script accepts a temporary JSON manifest with project metadata and the
normalized template id. Platform-specific adapters expose the same shared skill;
the skill must not require a Codex-only, Claude-only, or OpenCode-only command.

## Template materialization

The template id maps to a pinned, public source configured by the repository:

- `ieee-conference`: IEEE conference LaTeX starter using `IEEEtran` conference
  mode.
- `ieee-journal`: IEEE journal LaTeX starter using the journal mode of
  `IEEEtran`.

The script downloads the configured archive or source, validates its expected
format, and materializes it under `paper/` with `paper/main.tex` as the entry
point. It fills title and author metadata when supplied without removing
template guidance that is needed for the selected format.

`paper/TEMPLATE.md` records the normalized template id, source URL, retrieval
timestamp, and checksum. The source URL and checksum make updates auditable and
allow a future release to add more presets without changing the workflow.

If the source cannot be reached, the archive is malformed, or validation fails,
the script stops before template creation and reports the reason. It must not
silently substitute a different template.

## Safety and idempotency

Before any write, the script computes the complete set of target paths and checks
which already exist. Existing files are never overwritten without an explicit
confirmation value passed by the agent after the user approves the conflict list.
The default path is to abort on conflicts while still allowing creation of
non-conflicting paths only when the user explicitly chooses that behavior.

The script never deletes unrelated files, sends project content to remote
services, or extracts archive paths outside `paper/`. Downloads have a bounded
size and archive extraction rejects path traversal. A rerun with the same manifest
is idempotent when no changes are requested. On an error after writes begin, the
script reports created paths and can remove only paths created by that invocation.

## Validation and tests

The implementation must test:

- a completely empty repository;
- existing-file conflicts and user refusal to overwrite;
- both IEEE presets and metadata propagation;
- failed network requests, invalid archives, and checksum mismatch;
- archive path traversal and download-size limits;
- reruns and partial failure reporting;
- paths containing spaces on macOS, Linux, and Windows.

Success requires all mandatory files and directories, a valid `paper/main.tex`,
the selected IEEE mode, and a complete `paper/TEMPLATE.md`. The shared content
checker and platform artifact tests must continue to pass.

## Out of scope

- Research agents or autonomous multi-agent orchestration.
- Automatic dataset downloads or experiment execution.
- LaTeX compilation and publication submission.
- Additional paper formats beyond IEEE conference and IEEE journal.
- Editing global user configuration for any coding agent.
