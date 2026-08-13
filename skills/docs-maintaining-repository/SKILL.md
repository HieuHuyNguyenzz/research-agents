---
name: docs-maintaining-repository
description: Use when repository documentation is missing, stale, inconsistent with implementation, or needs a complete accuracy audit.
---

Audit the complete repository and write directly to documentation targets. Inspect
code, manifests, checked-in config, tests, workflows, entry points, scripts,
research artifacts, and documentation targets before editing.

Audit exactly these targets on every invocation:

- `README.md`: purpose, setup, usage, layout, compatibility, development
  commands, and deeper links.
- `AGENTS.md`: protected policy and instructions plus verified repository facts;
  preserve existing wording and never remove or weaken policy.
- `docs/architecture.md`: implemented components, boundaries, data/control flow,
  dependencies, and entry points.
- `docs/methodology.md`: implemented method, assumptions, objectives, and
  code/config mapping.
- `docs/experiments.md`: configured datasets, splits, methods, baselines,
  metrics, seeds, ablations, run matrix, and result paths.
- `docs/reproduction.md`: verified environment, dependencies, data preparation,
  commands, configuration, seeds, output paths, and validation.

Classify each target as `missing`, `accurate`, `incomplete`, `stale`,
`conflicting`, or `not applicable`. Create a missing target. Update an
incomplete, stale, or conflicting target. Leave an accurate target unchanged;
do not rewrite it for style alone.

Resolve facts in this order: executable code, package manifests, and checked-in
configuration; automated tests and workflows; entry points, scripts, and
generated structure; research artifacts and provenance; existing documentation;
conversational context. Use the higher-precedence evidence and
report corrected conflicts. Preserve equal-precedence ambiguity. Ask only when the missing choice blocks an accurate edit.

Do not invent commands, APIs, dependencies, support status, architecture,
methods, experimental settings, results, citations, or provenance.
Do not modify code, config, tests, results, paper content, or global user files. Update
existing sections instead of adding duplicates. Validate referenced local
paths, links, and safely checkable recorded commands.

Report:

- **Changed:** created or updated targets and reasons.
- **Unchanged:** accurate audited targets.
- **Evidence:** key supporting paths.
- **Conflicts:** corrected claims and authoritative sources.
- **Unresolved:** missing facts and equal-precedence ambiguity.
- **Validation:** checks run and observed results.

If every target is accurate, report that no write was needed.
