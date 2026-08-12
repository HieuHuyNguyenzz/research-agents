---
name: creating-research-notebook
description: Use when a user asks to create, scaffold, edit, or make reproducible a notebook for research experiments, result analysis, or scientific tutorials.
---

# Creating Research Notebook

Create a readable notebook that can be rerun by another researcher. Choose the
smallest structure that supports the requested analysis or experiment.

## Inputs

Clarify the notebook objective, audience, data or code inputs, expected
outputs, and whether the mode is experiment, analysis, or tutorial. Inspect an
existing notebook before editing it and preserve its intent.

## Workflow

1. Choose a stable output path, normally `results/analysis/` for result
   analysis, and use relative paths rooted at the repository.
2. Start from a clean notebook structure or refactor the existing structure;
   keep each code cell focused on one operation.
3. Add short markdown cells for purpose, assumptions, expected outputs, and
   interpretation. Centralize loading, plotting style, and reusable helpers.
4. For experiment analysis, include data audit, metric definitions, summary
   tables, uncertainty, comparisons, and only figures that answer distinct
   questions.
5. Handle optional dependencies gracefully and avoid hidden state, absolute
   paths, and unnecessary sidecar files.
6. Execute from top-to-bottom when the environment permits. Check that outputs
   are visible, labels are readable, and a fresh run does not depend on stale
   variables.

## Quality rules

- Make assumptions and unresolved questions visible near the beginning.
- Use consistent, colorblind-safe visual styling and caption-ready titles.
- Keep tables ordered, labeled, and rounded appropriately for the claim.
- Prefer a concise reproducible notebook over a large collection of filler
  charts or duplicated code.
- Report when execution was not possible and give the exact validation command
  needed to reproduce it.

## Deliverable

Return the notebook path, its purpose, input assumptions, validation result,
and any dependencies or follow-up exports required by the user. Validate the
notebook or state why validation could not run.
