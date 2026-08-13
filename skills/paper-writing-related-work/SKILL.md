---
name: paper-writing-related-work
description: Use when drafting or revising a research-paper related-work section from an existing bibliography and manuscript evidence.
---

# Writing Paper Related Work

Write or revise `paper/sections/related-work.tex` to position the work within
the existing bibliography.

## Inspect before editing

Inspect the whole repository and the existing target first: project instructions,
`README.md`, `docs/`, code, configs, tests, results, `paper/`, and
`paper/references.bib`. Establish the manuscript's terminology and venue style.

## Shared edit contract

- Write directly to `paper/sections/related-work.tex`; create it if absent.
- If the existing manuscript uses a noncanonical included section path, edit
  that path rather than creating a parallel canonical file and report the
  deviation.
- Preserve unrelated content and surrounding conventions. Update existing
  related work instead of appending a duplicate.
- Separate observed evidence from interpretation. Mark missing evidence,
  assumptions, and unresolved citations for follow-up; do not invent facts.
- Use existing bibliography citation keys only. A new source is allowed only
  when the user explicitly supplies or requests it; never fabricate a citation
  or source, and mark unresolved citations for follow-up.
- Keep LaTeX valid, including escaping special characters and preserving the
  target's fragment structure.
- Report changed files, claims and evidence used, assumptions, unresolved
  citations, and validation performed and its result.

## Section content

Organize related work by meaningful themes or problem dimensions, not a catalog
of papers. Make cited comparisons only where repository evidence supports the
distinction or limitation. Use existing bibliography keys, then position the
current work precisely without unsupported superiority or novelty claims.

## Validate

Confirm the target exists, contains related work once, and presents no missing
evidence as fact. Run an available LaTeX or manuscript validation command; if
none is available, report that compilation could not be run.
