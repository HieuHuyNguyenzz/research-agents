# Domain-Prefixed Skill Names Design

**Date:** 2026-08-13  
**Status:** Approved

## Context

The repository currently uses action-oriented skill IDs such as
`writing-paper-abstract` and `analyzing-experiment-results`. These names are
portable, but related capabilities do not always sort together in an installed
skill catalog. The library now has enough paper, result-analysis, notebook, and
core research skills for domain grouping to improve discovery.

The desired conceptual notation is `<purpose>:<skill>`. A literal colon cannot
be used in the canonical ID: the Agent Skills naming contract permits only
lowercase letters, numbers, and single hyphen separators, and a skill name must
match its parent directory. A colon would also make the package less portable
across filesystems and coding agents.

## Decision

Use this canonical grammar:

```text
<domain>-<action>[-<object>]
```

The first segment is the catalog grouping. Remaining segments describe the
operation. Canonical IDs, directory names, documentation, tests, and runtime
references use only the hyphenated form. Documentation groups skills under
domain headings instead of presenting colon-based pseudo-IDs that users might
try to invoke.

The supported domains are:

- `research`: library discovery and research-project lifecycle operations;
- `paper`: reading, planning, writing, and reviewing manuscripts;
- `results`: analyzing experimental outputs; and
- `notebook`: creating research notebooks.

Names must match `^[a-z0-9]+(-[a-z0-9]+)*$`, contain at most 64 characters, and
match the parent directory exactly.

## Canonical Mapping

| Existing ID | New canonical ID |
| --- | --- |
| `using-research-skills` | `research-using-skills` |
| `listing-research-skills` | `research-listing-skills` |
| `initializing-research-project` | `research-initializing-project` |
| `reading-research-paper` | `paper-reading` |
| `planning-paper-reimplementation` | `paper-planning-reimplementation` |
| `writing-paper-abstract` | `paper-writing-abstract` |
| `writing-paper-introduction` | `paper-writing-introduction` |
| `writing-paper-related-work` | `paper-writing-related-work` |
| `writing-paper-methodology` | `paper-writing-methodology` |
| `writing-paper-experimental-results` | `paper-writing-experimental-results` |
| `writing-paper-conclusion` | `paper-writing-conclusion` |
| `reviewing-research-paper` | `paper-reviewing` |
| `analyzing-experiment-results` | `results-analyzing-experiments` |
| `creating-research-notebook` | `notebook-creating-research` |

This is a complete replacement of the active skill catalog. No compatibility
alias directories or duplicate `SKILL.md` files will remain.

## Migration Scope

For every mapping, the implementation will:

1. rename the directory under `skills/`;
2. change the `name` frontmatter to the new canonical ID;
3. update cross-skill references and bundled script paths;
4. update native bootstrap and adapter references;
5. update README, installation guides, the paper-writing guide, and active
   library documentation; and
6. update tests and fixtures to assert the new ID and reject the old ID.

Historical specs and plans remain immutable records of earlier decisions. They
may mention old names. Active source, current user documentation, adapters, and
tests must not rely on them.

The initializer's bundled scripts move together with
`skills/research-initializing-project/`, while the root compatibility entry
point remains `scripts/init-project.mjs`. Its imports must target the renamed
skill directory. Generated research-project layouts and paper templates do not
change.

## Catalog and User Experience

`research-listing-skills` presents the library in four explicit domain groups.
Within each group, skills are ordered by workflow rather than alphabetically:

1. research discovery and initialization;
2. paper reading and reimplementation planning;
3. paper section writing followed by review;
4. results analysis and notebook creation.

Natural-language triggering remains the primary interface. Documentation may
show exact canonical IDs for explicit invocation, but it must not show a colon
form as if it were executable. Descriptions retain their trigger-focused
`Use when ...` contract so agents can select skills without exact-name prompts.

## Versioning and Installation

The rename changes public skill IDs and invalidates existing explicit
references. Because the project is pre-1.0, all version-bearing package and
plugin manifests advance from `0.1.0` to `0.2.0`. This signals the breaking
catalog migration and gives installers a new version for cache refresh.

Installation documentation includes a short migration note: update or
reinstall the plugin, start a clean session, and use the new canonical IDs.
Users with the earlier checkout must not keep old skill directories beside the
new ones, because duplicate descriptions make discovery ambiguous.

Compatibility claims remain unchanged. Automated portability tests do not
constitute recorded native clean-session smoke evidence.

## Validation

Tests will enforce:

- the exact 14-entry canonical catalog;
- the naming regex, maximum length, and directory/frontmatter match;
- absence of all 14 legacy directories;
- updated bootstrap references for Codex, Claude Code, and OpenCode;
- standalone execution of the renamed initializer skill;
- discovery documentation containing every canonical ID in workflow order;
- version equality across all version-bearing manifests; and
- unchanged behavioral contracts for initialization, paper writing, review,
  result analysis, and notebooks.

The release gate remains `npm run verify`, followed by `git diff --check` and a
search of active source for legacy IDs. Any legacy match outside historical
specs/plans and the explicit migration-rejection fixture is a migration
failure.

## Non-Goals

- Literal colon characters in skill IDs or directory names.
- Nested skill directories as namespaces.
- Multiple plugins split by domain.
- Compatibility aliases for the old IDs.
- Changes to skill behavior, generated project structure, or paper templates.
- Upgrading any coding agent's compatibility status without recorded native
  smoke-test evidence.
