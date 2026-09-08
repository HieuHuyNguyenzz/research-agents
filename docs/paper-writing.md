# Paper writing and review

This guide describes the paper workflow provided by `research-agents` after a
research project has been initialized. It is designed for a repository that
keeps source code, experiment artifacts, and the manuscript together so that
every claim can be traced back to evidence.

## Before you start

Initialize the project first, or make sure the repository has the equivalent
layout:

- `paper/main.tex`, `paper/sections/`, and `paper/references.bib`;
- source code and configuration under `src/`;
- recorded outputs under `results/` (especially `results/raw/`,
  `results/processed/`, `results/figures/`, and `results/tables/`); and
- user-provided local literature PDFs or an existing synthesis when the
  introduction or related-work argument depends on multiple sources; and
- enough project context in `README.md`, `docs/`, or the conversation to
  identify the research question, method, and intended venue.

The initializer supports the `ieee-conference` and `ieee-journal` templates.
The selected source URL, retrieval time, and SHA-256 digest are recorded in
`paper/TEMPLATE.md`; keep that provenance file with the manuscript.

## Recommended workflow

Use the skills in this order when preparing a complete manuscript:

1. `paper-reading` — extract claims, methods, assumptions, and
   reproducibility details from the primary paper or project sources.
2. `literature-synthesizing-evidence` — synthesize the user-scoped local PDF
   collection before making cross-paper comparisons or research-gap claims.
3. `paper-writing-methodology` — describe the implemented method from code and
   configuration.
4. `results-analyzing-experiments` — audit result artifacts and produce or
   refresh the rerunnable notebook, paper-ready tables, and figures.
5. `paper-writing-experimental-results` — report recorded metrics, comparisons,
   ablations, uncertainty, and limitations.
6. `paper-writing-related-work` — position the work using the bibliography and
   verified sources.
7. `paper-writing-introduction` — establish the problem, gap, and contributions.
8. `paper-writing-conclusion` — synthesize supported findings and future work.
9. `paper-writing-abstract` — summarize the stable manuscript evidence last.
10. `paper-reviewing` — inspect the complete paper and repository and
   report submission-readiness findings.

The order is a recommendation, not a requirement for editing one section. For
an incremental change, invoke only the relevant writer and then run the review
skill when you want a consistency check.

## Skill map

| Skill | Direct output | Primary evidence |
| --- | --- | --- |
| `literature-synthesizing-evidence` | `literature/synthesis.md` or an in-conversation report | user-scoped local PDF files and per-paper evidence maps |
| `results-analyzing-experiments` | one rerunnable notebook under `results/analysis/` by default | recorded metrics, logs, configs, baselines, ablations, and repeated runs |
| `paper-writing-abstract` | `paper/sections/abstract.tex` | paper claims, method, and recorded headline results |
| `paper-writing-introduction` | `paper/sections/introduction.tex` | problem context, gap, motivation, and contributions |
| `paper-writing-related-work` | `paper/sections/related-work.tex` | `paper/references.bib` and verified related sources |
| `paper-writing-methodology` | `paper/sections/methodology.tex` | `src/`, configs, algorithms, and implementation choices |
| `paper-writing-experimental-results` | `paper/sections/experimental-results.tex` | `results/`, logs, tables, figures, and uncertainty |
| `paper-writing-conclusion` | `paper/sections/conclusion.tex` | supported findings, limitations, and future work |
| `paper-reviewing` | review report only | the complete `paper/` tree plus the supporting repository |

If an initialized project uses a non-canonical `\\input` or `\\include` path,
the writer edits the existing included target instead of creating a parallel
section. The response identifies the actual file changed.

## Direct-write rules

The six writer skills inspect the complete repository and the existing target
before editing. They then:

- preserve unrelated content, formatting, labels, and citations;
- update or replace the relevant section instead of blindly appending a second
  draft;
- write only to the section requested (and closely related generated artifacts
  when the skill explicitly says so);
- keep LaTeX compilable and retain the template's conventions; and
- report changed paths, evidence used, assumptions, unresolved references, and
  validation performed.

The review skill is read-only by default. It reports findings with a severity,
location, evidence, and recommended fix. Ask a writer skill explicitly if you
want a reported issue applied.

## Evidence and citation policy

Never invent a result, dataset, citation, number, implementation detail, or
claim of significance. If evidence is missing, mark the statement as an open
item or ask for the missing artifact.

Writers may add a new citation only when the user explicitly supplies or
requests a source for the introduction, related work, methodology, or
experimental-results section. The source must be recorded in
`paper/references.bib` and the response must identify the addition. The
abstract and conclusion do not introduce new citations or unsupported
evidence.

Experimental numbers must come from recorded artifacts. Prefer the existing
analysis outputs and cite the corresponding table, figure, log, or notebook;
do not infer a metric from an image or memory when the underlying artifact is
unavailable.

For the stages before manuscript writing, including study design, literature
synthesis, implementation handoff, experiment configuration, and external
workstation execution, see the [research workflow guide](research-workflow.md).

## Example requests

Use natural language; the skill name does not need to be mentioned explicitly.

```text
Write the abstract from the current paper, implementation, and recorded results.
```

```text
Draft the introduction and state the research gap and contributions supported by this repository.
```

```text
Update related work using the existing bibliography. Do not add sources unless I provide them.
```

```text
Write the methodology from the code and configs. Flag any implementation detail that cannot be verified.
```

```text
Write the experimental results from results/processed and results/tables, including uncertainty and limitations.
```

```text
Rewrite the conclusion to match the evidence currently reported in the paper.
```

```text
Review the complete paper and repository for correctness, evidence, citations, reproducibility, and submission readiness. Report findings only.
```

For a revision, name the desired change and its evidence, for example: “Revise
the methodology to reflect `src/core/optimizer.py`; preserve the current
notation and update only that section.” After a direct write, inspect the diff
and ask `paper-reviewing` for an independent check.

## Validation checklist

Before submission, confirm that:

1. every cited source exists in `paper/references.bib` and every bibliography
   entry is used intentionally;
2. every number in the manuscript maps to a result artifact;
3. figures and tables use paths committed to the repository;
4. the selected template provenance remains in `paper/TEMPLATE.md`;
5. the paper compiles with the intended LaTeX toolchain; and
6. the review report has no unresolved high-severity finding.

The skills do not claim native support for a coding agent until a clean-session
smoke test is recorded. See [the compatibility matrix](compatibility.md) for
that evidence boundary and [the installation pages](install/) for
agent-specific setup.
