# Paper Writing Skills Design

**Status:** Design approved in conversation; awaiting written-spec review

## Goal

Add a portable, skills-first paper-writing workflow that can draft and revise
individual research-paper sections directly in the initialized repository while
preserving evidence, citations, existing content, and the user's control over
the final text.

## Scope

The first release contains seven independent skills:

| Skill | Canonical output |
| --- | --- |
| `writing-paper-abstract` | `paper/sections/abstract.tex` |
| `writing-paper-introduction` | `paper/sections/introduction.tex` |
| `writing-paper-related-work` | `paper/sections/related-work.tex` |
| `writing-paper-methodology` | `paper/sections/methodology.tex` |
| `writing-paper-experimental-results` | `paper/sections/experimental-results.tex` |
| `writing-paper-conclusion` | `paper/sections/conclusion.tex` |
| `reviewing-research-paper` | A structured review of the complete `paper/` tree; no automatic edits |

The skills are section-focused, but each may read the whole repository to
understand the project. They are not autonomous agents and do not change the
installation or native adapter architecture.

## Repository context and inputs

Before writing or reviewing, inspect the relevant available context:

- `README.md`, `AGENTS.md`, `docs/`, and project metadata for scope and claims.
- `src/`, configs, scripts, and tests for implementation details.
- `results/raw/`, `results/processed/`, `results/analysis/`, tables, and figures
  for actual experimental evidence.
- `paper/`, existing sections, `paper/references.bib`, and template provenance
  for current manuscript structure and citation conventions.

If a required fact is absent, the skill must mark it as missing or ask a
blocking question. It must not manufacture numbers, citations, datasets,
baselines, statistical claims, or implementation details.

## Write and edit behavior

Writing skills write directly to their canonical section file. If the file does
not exist, create it; if it exists, preserve unrelated content and revise only
the requested section. Before writing, inspect the current file and identify
its surrounding conventions. After writing, report:

- files created or changed;
- the section's main claims and evidence used;
- assumptions, missing inputs, and unresolved citations;
- whether a LaTeX or structural validation was run and its result.

An edit request such as “rewrite the introduction” updates the existing section
instead of appending a duplicate. A request to change only one paragraph must
not rewrite unrelated sections.

## Shared writing contract

Every writing skill must:

1. Read existing paper context and relevant evidence before drafting.
2. Preserve the paper's terminology, notation, citation keys, and venue style.
3. Distinguish observed evidence, claims supported by citations, and proposed
   wording or interpretation.
4. Use only citation keys already present in `references.bib`, unless the user
   explicitly supplies or requests a new source; unresolved sources are marked
   for follow-up rather than fabricated.
5. Keep LaTeX valid and escape content appropriately for the target file.
6. Prefer precise, concise academic prose over generic filler.
7. Avoid claiming novelty, significance, superiority, or causality without
   evidence in the repository or an explicit user-provided statement.

## Section responsibilities

### Abstract

Summarize the problem, gap, method, evaluation setting, principal supported
result, and conclusion. Do not introduce citations or unsupported numerical
claims. Keep it self-contained and consistent with the final manuscript.

### Introduction

Establish the problem and importance, identify the gap, state the proposed
approach at an appropriate level, summarize contributions, and preview the
paper organization. Every contribution must be traceable to code, evidence, or
an explicitly supplied project claim.

### Related work

Organize cited work by meaningful themes or problem dimensions, not by a paper
catalog. Compare limitations and distinctions using existing bibliography keys;
do not invent related-work citations. End by positioning the present work.

### Methodology

Explain the problem formulation, assumptions, data flow, model or algorithm,
objective, training/inference procedure, and implementation-relevant details.
Use repository code/configs as the source of truth and flag any mismatch with
the paper narrative.

### Experimental results

Describe protocol, datasets, baselines, metrics, seeds or repetitions, and
hardware/settings when available. Report values from result artifacts, include
uncertainty when supported, distinguish tables/figures from interpretation,
and do not infer significance or causality without evidence.

### Conclusion

Answer the research question using only supported findings, state practical or
scientific implications conservatively, and include limitations and future
work grounded in the project. Do not introduce new evidence or citations.

### Review

Review the complete paper for correctness, completeness, coherence, venue
fit, reproducibility, citation support, LaTeX structure, and consistency with
code/configs/results. Produce findings with severity (`blocking`, `important`,
or `minor`), location, evidence, and a concrete recommendation. Reviewing does
not modify files unless the user explicitly asks for fixes afterward.

## File and format policy

The canonical section files are standalone LaTeX fragments included by the
paper template. If a repository uses a different include layout, follow the
existing layout and report the deviation rather than creating parallel files.
Do not add README or installation files inside a skill directory. Skill bodies
remain portable and must not name target-specific tools.

## Validation contract

At minimum, check that the target file exists, the requested content is
present once, and no unresolved placeholder is presented as a factual claim.
When the repository exposes a LaTeX or manuscript validation command, run it;
otherwise report that compilation was not available. Review skills must also
check section ordering, citation-key resolution, cross-section terminology,
and claims against available result artifacts.

## Non-goals

- No automatic full-paper rewrite when one section was requested.
- No automatic citation discovery or web scraping in the first release.
- No fabricated results, references, or reviewer scores.
- No autonomous submission, formatting upload, or venue-specific publishing.
- No specialized agent profiles; these remain skills for all supported coding
  agents.
