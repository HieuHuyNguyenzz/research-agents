---
name: writing-paper-experimental-results
description: Use when drafting or revising a research-paper experimental-results section from result artifacts and repository evidence.
---

# Writing Paper Experimental Results

Write or revise `paper/sections/experimental-results.tex` from recorded
experimental evidence.

## Inspect before editing

Inspect the whole repository and the existing target first: project instructions,
`README.md`, `docs/`, code, configs, tests, results, `paper/`, and
`paper/references.bib`. Establish the manuscript's terminology and venue style.

## Shared edit contract

- Write directly to `paper/sections/experimental-results.tex`; create it if
  absent.
- If the existing manuscript uses a noncanonical included section path, edit
  that path rather than creating a parallel canonical file and report the
  deviation.
- Preserve unrelated content and surrounding conventions. Update existing
  experimental results instead of appending a duplicate.
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

Describe the protocol, datasets, baselines, metrics, seeds or repetitions, and
available settings. Report values only from result artifacts and include
uncertainty only when supported. Clearly distinguish tables and figures from
their interpretation; do not infer statistical significance or causality.

## Validate

Confirm the target exists, contains experimental results once, and presents no
missing evidence as fact. Run an available LaTeX or manuscript validation
command; if none is available, report that compilation could not be run.
