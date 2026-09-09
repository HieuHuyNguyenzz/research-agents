---
name: paper-writing-introduction
description: Use when drafting or revising a research-paper introduction from the available repository and manuscript evidence.
---

# Writing Paper Introduction

Write or revise `paper/sections/introduction.tex` to frame the work accurately.

## Inspect before editing

Inspect the whole repository and the existing target first: project instructions,
`README.md`, `superpowers/specs/study-design.md`, `docs/notes/`, `docs/`,
`src/`, tests, results, `paper/`, and
`paper/references.bib`. Establish the manuscript's terminology and venue style.

## Shared edit contract

- Trace the include graph from `paper/main.tex` before writing. Write directly
  to `paper/sections/introduction.tex` and create it if absent when the
  canonical include points to it.
- If the manuscript uses a noncanonical included file or an inline section in
  `paper/main.tex`, edit that reachable target instead and report the deviation.
  Do not create or update an unreachable parallel section file.
- Preserve unrelated content and surrounding conventions. Update an existing
  introduction instead of appending a duplicate.
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

Establish the problem's importance and the evidence-supported gap, then state
the approach at an appropriate level. Give traceable contributions: each must
map to code, evidence, or an explicitly supplied project claim. End with an
organization preview. Do not claim novelty, superiority, significance, or
causality without support.

## Validate

Confirm the target exists, contains the introduction once, and presents no
missing evidence as fact. Run an available LaTeX or manuscript validation
command; if none is available, report that compilation could not be run.
