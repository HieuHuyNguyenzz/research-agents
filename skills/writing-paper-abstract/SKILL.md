---
name: writing-paper-abstract
description: Use when drafting or revising a research-paper abstract from the available repository and manuscript evidence.
---

# Writing Paper Abstract

Write or revise `paper/sections/abstract.tex` as a self-contained, evidence-grounded abstract.

## Inspect before editing

Inspect the whole repository and the existing target first: project instructions,
`README.md`, `docs/`, code, configs, tests, results, `paper/`, and
`paper/references.bib`. Establish the manuscript's terminology and venue style.

## Shared edit contract

- Write directly to `paper/sections/abstract.tex`; create it if absent.
- If the existing manuscript uses a noncanonical included section path, edit
  that path rather than creating a parallel canonical file and report the
  deviation.
- Preserve unrelated content and surrounding conventions. Update an existing
  abstract instead of appending a duplicate.
- Separate observed evidence from interpretation. Mark missing evidence,
  assumptions, and unresolved citations for follow-up; do not invent facts.
- Use existing citation keys only when a citation is necessary, unless the user
  explicitly supplies or requests a new source. This section normally has no
  citations.
- Keep LaTeX valid, including escaping special characters and preserving the
  target's fragment structure.
- Report changed files, claims and evidence used, assumptions, unresolved
  citations, and validation performed and its result.

## Section content

Cover the problem, the gap, the method, the evaluation setting, the principal
result supported by repository evidence, and the conclusion. Use no unsupported
numbers, statistical claims, novelty claims, or citations. Keep the result and
conclusion consistent with the final manuscript rather than overstating them.

## Validate

Confirm the target exists, contains the abstract once, and presents no missing
evidence as fact. Run an available LaTeX or manuscript validation command; if
none is available, report that compilation could not be run.
