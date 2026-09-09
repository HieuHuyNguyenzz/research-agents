---
name: paper-writing-experimental-results
description: Use when drafting or revising a research-paper experimental-results section from result artifacts and repository evidence.
---

# Writing Paper Experimental Results

Write or revise `paper/sections/experimental-results.tex` from recorded
experimental evidence.

## Inspect before editing

Inspect the whole repository and the existing target first: project instructions,
`README.md`, `docs/experiments.md`, `src/configs/`, tests, `results/raw/`,
`results/processed/`, `results/analysis/`, `results/figures/`,
`results/tables/`, `paper/`, and
`paper/references.bib`. Establish the manuscript's terminology and venue style.

## Shared edit contract

- Trace the include graph from `paper/main.tex` before writing. Write directly
  to `paper/sections/experimental-results.tex` and create it if absent when the
  canonical include points to it.
- If the manuscript uses a noncanonical included file or an inline section in
  `paper/main.tex`, edit that reachable target instead and report the deviation.
  Do not create or update an unreachable parallel section file.
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
