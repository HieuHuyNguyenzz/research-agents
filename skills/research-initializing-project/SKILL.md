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
normalized paper-template identifier, and the planned scaffold. Ask the user to
confirm the summary. Do not invoke the initializer until the user explicitly
confirms.

Create a temporary JSON file containing the confirmed manifest, then invoke the
portable initializer with Node:

`node <skill-directory>/scripts/init-project.mjs --root <target-directory> --manifest <manifest.json> --conflicts abort`

Resolve `<skill-directory>` to the directory containing this `SKILL.md`; do not
assume the current working directory is the source repository. Report the
result, including created, unchanged, skipped, and conflicting paths. If it
reports a conflict, show the complete conflict list and ask the user which mode
to use:

- `abort` stops without writing when conflicts exist.
- `skip` preserves conflicting paths and creates only non-conflicting paths.
- `overwrite` replaces conflicting paths only after the user explicitly
  confirms that exact conflict list.

After the user selects a mode, invoke the same Node command with that mode. Do
not use `overwrite` unless the user explicitly confirmed the conflicts. Never
delete unrelated paths.

If the initializer reports a network, download, archive, checksum, or template
validation error, surface the error and stop. Do not silently substitute a
different template; ask the user whether to retry or revise the request.
