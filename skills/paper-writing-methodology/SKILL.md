---
name: paper-writing-methodology
description: Use when drafting or revising a research-paper methodology section from repository code, configurations, and manuscript evidence.
---

# Writing Paper Methodology

Write or revise `paper/sections/methodology.tex` using the implementation as
the source of truth.

## Inspect before editing

Inspect the whole repository and the existing target first: project instructions,
`README.md`, `docs/methodology.md`, `src/core/`, `src/configs/`, `src/scripts/`,
tests, results, `paper/`, and
`paper/references.bib`. Establish the manuscript's terminology and venue style.

## Shared edit contract

- Trace the include graph from `paper/main.tex` before writing. Write directly
  to `paper/sections/methodology.tex` and create it if absent when the canonical
  include points to it.
- If the manuscript uses a noncanonical included file or an inline section in
  `paper/main.tex`, edit that reachable target instead and report the deviation.
  Do not create or update an unreachable parallel section file.
- Preserve unrelated content and surrounding conventions. Update an existing
  methodology section instead of appending a duplicate.
- Separate observed evidence from interpretation. Mark missing evidence,
  assumptions, and unresolved citations for follow-up; do not invent facts.
- Use existing citation keys only. A new source is allowed only when the user
  explicitly supplies or requests it; never fabricate a citation or source,
  and mark unresolved citations for follow-up.
- Keep LaTeX valid, including escaping special characters and preserving the
  target's fragment structure.
- Report changed files, claims and evidence used, assumptions, unresolved
  citations, and validation performed and its result.

## Section content

Explain the formulation, assumptions, data flow, model or algorithm, objective,
training and inference procedure, and implementation details supported by code
and configs. Flag any mismatch between repository behavior and the paper
narrative. Do not infer omitted hyperparameters, preprocessing, or algorithmic
steps.

## Validate

Confirm the target exists, contains the methodology once, and presents no
missing evidence as fact. Run an available LaTeX or manuscript validation
command; if none is available, report that compilation could not be run.
