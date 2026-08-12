---
name: writing-paper-methodology
description: Use when drafting or revising a research-paper methodology section from repository code, configurations, and manuscript evidence.
---

# Writing Paper Methodology

Write or revise `paper/sections/methodology.tex` using the implementation as
the source of truth.

## Inspect before editing

Inspect the whole repository and the existing target first: project instructions,
`README.md`, `docs/`, code, configs, tests, results, `paper/`, and
`paper/references.bib`. Establish the manuscript's terminology and venue style.

## Shared edit contract

- Write directly to `paper/sections/methodology.tex`; create it if absent.
- If the existing manuscript uses a noncanonical included section path, edit
  that path rather than creating a parallel canonical file and report the
  deviation.
- Preserve unrelated content and surrounding conventions. Update an existing
  methodology section instead of appending a duplicate.
- Separate observed evidence from interpretation. Mark missing evidence,
  assumptions, and unresolved citations for follow-up; do not invent facts.
- Use existing citation keys only, unless the user explicitly supplies or
  requests a new source; do not fabricate a citation or source.
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
