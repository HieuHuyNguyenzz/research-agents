---
name: research-initializing-project
description: Use when a user asks to initialize, scaffold, or set up a new research project repository.
---

Collect the project details before changing the target repository. Ask the
following questionnaire one field at a time; wait for each answer before asking
the next field.

1. Project name (required)
2. Project overview (required)
3. Research objectives (optional)
4. Research questions or problem statement (optional)
5. Dataset or data sources (optional)
6. Planned methods or models (optional)
7. Authors and affiliations (optional)
8. Paper template (required): IEEE conference or IEEE journal

Allow an optional field to be blank. If a required field is blank, ask again.
Normalize the answers into this manifest shape: `projectName`, `overview`,
`objectives`, `researchQuestions`, `dataSources`, `methods`, `authors`, and
`paperTemplate`. Trim text, turn optional list answers into arrays, and use
`ieee-conference` or `ieee-journal` for `paperTemplate`.

Before creating anything, show a complete summary of every manifest field, the
normalized paper-template identifier, and this planned scaffold:

```text
src/core/
src/configs/{baselines,proposed,ablations,experiments}/
src/{data,scripts}/
tests/
results/{raw,processed,figures,tables,analysis}/
paper/{sections,figures,tables,templates}/
docs/notes/
superpowers/{specs,plans,decisions}/
README.md, AGENTS.md, .gitignore, pyproject.toml
```

Also create `paper/main.tex`, `paper/references.bib`, `paper/TEMPLATE.md`, all
six canonical files under `paper/sections/`, and `docs/architecture.md`,
`docs/methodology.md`, `docs/experiments.md`, and `docs/reproduction.md`.
Ensure `paper/main.tex` includes every canonical section in manuscript order.
Create placeholder files only for directories that remain empty. Ask the user
to confirm the summary. Do not write until the user explicitly confirms.

Use the coding agent's built-in file and network capabilities by default; do
not require an external language runtime. Inspect every target and its
ancestors before writing. Classify paths as created, unchanged, or conflicting,
and show the complete conflict list before choosing a conflict mode:

- `abort` stops without writing when conflicts exist.
- `skip` preserves conflicting paths and creates only non-conflicting paths.
- `overwrite` replaces conflicting paths only after the user explicitly
  confirms that exact conflict list.

Do not use `overwrite` unless the user explicitly confirmed the exact conflict
list. Never delete unrelated paths. Apply paper files as one bundle so a failed
template operation does not leave a partial paper setup. Report all created,
unchanged, skipped, and conflicting paths.

If the user explicitly requests the deterministic CLI and Node.js 20+ is
available, create a temporary JSON manifest and run:

`node <skill-directory>/scripts/init-project.mjs --root <target-directory> --manifest <manifest.json> --conflicts abort`

Resolve `<skill-directory>` relative to this `SKILL.md`, not the current working
directory. Treat this CLI as optional; absence of Node.js is not a blocker for
agent-native initialization.

If the initializer reports a network, download, archive, checksum, or template
validation error, surface the error and stop. Do not silently substitute a
different template; ask the user whether to retry or revise the request.
