# Repository Documentation Skill Design

**Date:** 2026-08-13  
**Status:** Approved

## Goal

Add one portable skill that audits and synchronizes the repository's primary
human and agent documentation with the implementation. The skill writes
changes directly, while preserving user-authored policy and avoiding invented
commands, architecture, APIs, or research claims.

## Canonical Identity

The canonical skill ID is `docs-maintaining-repository`.

It follows the repository's `<domain>-<action>-<object>` convention:

- domain: `docs`;
- action: `maintaining`; and
- object: `repository`.

The ID, parent directory, and `name` frontmatter must match exactly. The skill
description starts with `Use when` and contains only trigger conditions for
creating, refreshing, auditing, or synchronizing repository documentation.

## Scope

Every invocation inspects the complete repository and audits these six targets:

1. `README.md`;
2. `AGENTS.md`;
3. `docs/architecture.md`;
4. `docs/methodology.md`;
5. `docs/experiments.md`; and
6. `docs/reproduction.md`.

The skill creates a missing target and updates an existing target only when it
is incomplete, inaccurate, internally inconsistent, or stale relative to the
repository. It does not rewrite an already accurate file for style alone.

Other documents may be inspected as evidence. They are outside the write scope
unless the user explicitly requests an additional target.

## Sources of Truth

The skill resolves factual conflicts using this precedence:

1. executable code, package manifests, and checked-in configuration;
2. automated tests and workflow definitions;
3. current entry points, scripts, and generated project structure;
4. recorded research artifacts and provenance;
5. existing documentation; and
6. conversational context supplied by the user.

The higher-precedence source wins when evidence conflicts. The skill updates
the affected documentation and reports the conflict and evidence used. It does
not silently reconcile ambiguity when two equal-precedence sources disagree;
it preserves the existing statement, marks the uncertainty in its response,
and asks the user only when the missing choice blocks an accurate edit.

## Target Responsibilities

### README.md

Keep the project purpose, supported capabilities, installation or setup,
primary usage, repository layout, compatibility boundary, development commands,
and links to deeper documentation accurate. Do not advertise an unimplemented
feature or unverified platform status.

### AGENTS.md

Treat existing instructions, safety rules, policies, and user-authored
constraints as protected content. Preserve their wording and ordering. Add or
update only repository facts that can be verified, including layout, entry
points, test commands, generated files, and local contribution conventions.
Never remove, weaken, reinterpret, or replace an existing policy.

If no `AGENTS.md` exists, create a concise repository-scoped file containing
only verified project facts and normal validation guidance. Do not invent
organizational policy.

### docs/architecture.md

Describe actual components, boundaries, data/control flow, entry points,
dependencies, and relevant runtime adapters. Distinguish implemented structure
from planned work.

### docs/methodology.md

Describe the implemented research method, assumptions, objectives, and mapping
from code/configuration to methodological stages. Mark unsupported or planned
method details explicitly rather than filling gaps.

### docs/experiments.md

Document configured datasets, splits, methods, baselines, metrics, seeds,
ablations, run matrix, and result locations only when supported by the
repository. This target records the current experimental design; selecting
which experiments should be run belongs to a separate brainstorming skill.

### docs/reproduction.md

Document verified environment requirements, dependency installation, data
preparation, commands, configuration selection, random seeds, output paths, and
validation steps. A command must be copied from an executable entry point,
manifest, workflow, or tested script; otherwise mark it as unresolved.

## Workflow

1. Inspect repository instructions and the complete file tree before editing.
2. Identify package manifests, entry points, configuration, tests, workflows,
   research artifacts, and existing documentation.
3. Build an internal six-target audit with status `missing`, `accurate`,
   `incomplete`, `stale`, `conflicting`, or `not applicable`.
4. Map every proposed factual statement to repository evidence.
5. Preserve accurate content and edit only targets that require a change.
6. Apply the target-specific rules, including protected handling for
   `AGENTS.md`.
7. Validate referenced local paths, internal links, and commands that can be
   checked safely with the repository's existing validation mechanism.
8. Report changed files, unchanged files, evidence used, conflicts resolved,
   unresolved facts, and validation results.

The skill writes directly without a mandatory confirmation gate because edits
are limited to documentation within the user's repository and the user can
review the diff. It asks a question only when a factual choice cannot be
derived and proceeding would create inaccurate documentation.

## Preservation and Safety Rules

- Do not fabricate commands, APIs, dependencies, support status, architecture,
  research methods, experimental settings, results, citations, or provenance.
- Preserve unrelated content, formatting conventions, anchors, and working
  links.
- Update a relevant existing section instead of appending a duplicate section.
- Do not copy global coding-agent configuration into the repository.
- Do not modify code, configuration, tests, result artifacts, paper content, or
  global user files as a side effect of documenting them.
- Do not overwrite protected `AGENTS.md` instructions even when they differ
  from common practice.
- Do not claim a command works merely because it appears in prose; distinguish
  recorded commands from commands actually validated during the invocation.

## Completion Report

The response contains:

- **Changed:** each created or updated target with a concise reason;
- **Unchanged:** accurate targets that were audited but not rewritten;
- **Evidence:** the key code, config, test, workflow, or artifact paths used;
- **Conflicts:** outdated claims corrected and the authoritative source;
- **Unresolved:** missing facts or equal-precedence contradictions; and
- **Validation:** link, path, command, and repository checks performed with
  their observed result.

An invocation that finds all six targets accurate reports that no write was
needed.

## Integration

Add `docs-maintaining-repository` to `research-listing-skills` under a `Docs`
group and document it in the README's research workflow. Existing Codex,
Claude Code, and OpenCode adapters already expose the shared flat `skills/`
directory, so no adapter behavior changes are required.

The package remains at version `0.2.0`: this is an additive skill and does not
rename or remove a public ID. Native compatibility rows remain unverified until
their existing clean-session evidence requirements are met.

## Verification

Automated contract tests must prove that:

- the canonical ID is portable and matches its directory/frontmatter;
- the trigger-only description begins with `Use when`;
- all six targets and their distinct responsibilities are present;
- the complete repository and evidence precedence are inspected;
- accurate targets are not rewritten and missing targets are created;
- code/config conflicts update documentation and are reported;
- existing `AGENTS.md` policy is protected;
- unsupported facts and commands are not invented;
- writes are documentation-scoped and direct;
- the completion report contains every required field;
- the catalog and README discover the skill; and
- shared content contains no platform-specific tool names.

The release gate is `npm run verify` followed by `git diff --check`.

## Non-Goals

- Choosing or generating new experimental configurations.
- Running experiments or analyzing their outputs.
- Writing or reviewing manuscript sections under `paper/`.
- Generating API reference from language-specific introspection.
- Reformatting accurate documentation solely for stylistic consistency.
- Replacing a dedicated documentation website generator.
- Editing user-global agent instructions or configuration.
