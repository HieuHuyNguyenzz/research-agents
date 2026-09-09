---
name: paper-writing-conclusion
description: Use when drafting or revising a research-paper conclusion from completed manuscript and repository evidence.
---

# Writing Paper Conclusion

Write or revise `paper/sections/conclusion.tex` as an evidence-grounded closing
section.

## Inspect before editing

Inspect the whole repository and the existing target first: project instructions,
`README.md`, `docs/`, `src/`, tests, `results/`, the complete `paper/sections/`, and
`paper/references.bib`. Establish the manuscript's terminology and venue style.

## Shared edit contract

- Trace the include graph from `paper/main.tex` before writing. Write directly
  to `paper/sections/conclusion.tex` and create it if absent when the canonical
  include points to it.
- If the manuscript uses a noncanonical included file or an inline section in
  `paper/main.tex`, edit that reachable target instead and report the deviation.
  Do not create or update an unreachable parallel section file.
- Preserve unrelated content and surrounding conventions. Update an existing
  conclusion instead of appending a duplicate.
- Separate observed evidence from interpretation. Mark missing evidence,
  assumptions, and unresolved citations for follow-up; do not invent facts.
- Use existing citation keys only when a citation is necessary. This section
  has no new evidence or citations.
- Keep LaTeX valid, including escaping special characters and preserving the
  target's fragment structure.
- Report changed files, claims and evidence used, assumptions, unresolved
  citations, and validation performed and its result.

## Section content

Answer the research question using supported findings. State implications
conservatively, and include limitations and grounded future work. Do not
introduce new evidence, citations, numerical claims, significance, or causal
claims in the conclusion.

## Validate

Confirm the target exists, contains the conclusion once, and presents no
missing evidence as fact. Run an available LaTeX or manuscript validation
command; if none is available, report that compilation could not be run.
