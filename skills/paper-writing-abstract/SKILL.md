---
name: paper-writing-abstract
description: Use when planning, drafting, or revising a research-paper abstract, including a preliminary research map or a final evidence-grounded abstract.
---

# Writing Paper Abstract

Write or revise `paper/sections/abstract.tex` as a self-contained abstract. Select
the mode from the state of the project: use a preliminary abstract as a research
map when the study or results are not yet fixed, and use a final abstract when
the manuscript and recorded results are stable. Never present planned or
expected findings as observed results.

## Inspect before editing

Inspect the whole repository and the existing target first: project instructions,
`README.md`, `superpowers/specs/`, `docs/notes/`, `docs/`, `src/`, tests,
`results/`, `paper/`, and `paper/references.bib`. Establish the manuscript's terminology, intended
audience, target venue, and venue-specific abstract requirements. If no venue
is specified, state that word-limit and style checks remain open rather than
assuming a generic limit.

## Shared edit contract

- Trace the include graph from `paper/main.tex` before writing. Write directly
  to `paper/sections/abstract.tex` and create it if absent when the canonical
  include points to it.
- If the manuscript uses a noncanonical included file or an inline section in
  `paper/main.tex`, edit that reachable target instead and report the deviation.
  Do not create or update an unreachable parallel section file.
- Preserve unrelated content and surrounding conventions. Update an existing
  abstract instead of appending a duplicate.
- Separate observed evidence from interpretation. Mark missing evidence,
  assumptions, and unresolved citations for follow-up; do not invent facts.
- Use existing citation keys only when a citation is necessary. This section
  normally has no citations.
- Keep LaTeX valid, including escaping special characters and preserving the
  target's fragment structure.
- Report changed files, claims and evidence used, assumptions, unresolved
  citations, and validation performed and its result.

## Choose the mode

- **Preliminary mode:** use before the paper is complete to map the motivation,
  gap, research question, planned method, expected contribution, and unresolved
  risks. Label expected results and implications as planned or provisional. Do
  not fabricate numbers or claim that an experiment has been completed.
- **Final mode:** use after implementation and analysis are recorded. Rewrite
  the abstract from the final manuscript and evidence, replacing planned
  claims with observed results and checking that every contribution is actually
  supported. This is normally the last paper-writing step.

Before initialization, return a preliminary abstract directly and pass its
confirmed research fields to `research-initializing-project`; do not create a
partial `paper/` tree. In an initialized repository, persist it through the
canonical reachable abstract target.

If the user does not specify a mode, infer it from the available evidence and
report the inference. Ask for the missing project state only when the choice
would materially change the abstract.

## Abstract structure

Use the MRCI logic while adapting the prose to the audience and venue:

1. **Motivation:** context, problem, gap, and why the problem matters.
2. **Results:** what was done and, in final mode, the principal recorded
   findings and evaluation setting.
3. **Contributions:** what the findings add to the existing work.
4. **Implications:** theoretical or practical meaning, reader benefit, and,
   when appropriate, what remains unsolved.

For practical drafting, check the flow `Why? -> What? -> How? -> What found? ->
So what?`. Ensure the abstract answers: who should read it, what was done, why
it was done, what happened, what the results mean, and what benefit the reader
gets. Omit limitations or future work when the venue does not allow them or
when they would displace a more important supported result.

## Section content

Cover the problem, gap, objective or research question, method, evaluation
setting, principal result, contribution, and implication at the level of detail
appropriate for the intended readers. Use no unsupported numbers, statistical
claims, novelty claims, or citations. Compare the wording and structure with
abstracts from the target venue when examples or the venue are available;
imitate their communication style, not their content.

## Validate

Confirm the target exists, contains the abstract once, and presents no missing
evidence as fact. Check consistency with the current research question, method,
results, contribution, and implications. Check the venue word limit and style
when known; otherwise report those checks as unresolved. Flag vague prose,
missing findings, missing contribution, absent “So what?”, audience mismatch,
and any claim that the paper does not support. Run an available LaTeX or
manuscript validation command; if none is available, report that compilation
could not be run.
