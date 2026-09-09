# Skill reference

`research-agents` currently contains 16 portable skills. Ask for the desired
outcome in natural language; the exact skill ID is useful for precision but is
not required. Each skill inspects available evidence before acting and stays
within its documented ownership boundary.

## Research setup and evidence

| Skill | Use it when | Give the agent | Expected result |
| --- | --- | --- | --- |
| `research-using-skills` | Beginning a task that may match an installed research workflow | The desired outcome and relevant paths | Selection and use of the appropriate specialized skill; no research artifact by itself |
| `research-designing-study` | Turning an early idea into a testable study | Idea, constraints, available data/compute, and local notes | Confirmed brief directly before initialization or `superpowers/specs/study-design.md` afterward |
| `literature-synthesizing-evidence` | Comparing multiple papers or assessing a provisional gap | Explicit local PDF paths or named folders plus the synthesis question | Synthesis directly before initialization or optional `docs/notes/literature-synthesis.md` afterward |
| `research-initializing-project` | Scaffolding a new research repository | Confirmed project details and preferred IEEE template | Reproducible repository layout after a one-question-at-a-time questionnaire and explicit confirmation |
| `paper-reading` | Understanding one paper for engineering or scientific use | PDF, paper URL, DOI, supplement, or excerpt | Evidence-aware summary directly or optional evidence map under `docs/notes/` |
| `paper-planning-reimplementation` | Defining scientific requirements for reproducing a paper | Paper evidence map, target repository, scope, constraints, and available code | Research implementation brief for Superpowers or another engineering workflow; not a duplicate coding plan |

Example requests:

```text
Turn this idea into a testable study design and ask only decisions that affect validity.
Synthesize these local PDFs for evidence about <question>.
Read this paper and identify every detail needed for a faithful reproduction.
Prepare the scientific implementation brief, then hand it to the engineering workflow.
```

## Experiments and analysis

| Skill | Use it when | Give the agent | Expected result |
| --- | --- | --- | --- |
| `experiments-designing-configurations` | Claims need an evaluation protocol, run matrix, or runnable configs | Confirmed claims, current code/configs, resource constraints, completed-run evidence | Confirmed `core` and `supplementary` matrix, `docs/experiments.md`, runnable repository-native configs, blocked items, run counts, and unexecuted next commands |
| `results-analyzing-experiments` | Metrics, logs, benchmarks, ablations, or repeated runs need analysis | `results/raw/`, configs/protocol, metric meaning, and manuscript context | Notebook under `results/analysis/`; requested exports under `results/figures/` and `results/tables/` |

The experiment-design skill does not run training, full evaluation, or sweeps.
When execution happens on another workstation, transfer the confirmed configs,
record revision/environment/run provenance, and return structured outputs under
`results/` before invoking result analysis.

Example requests:

```text
Design a core and supplementary matrix for these claims using existing configs.
Analyze results/raw across seeds and create a paper-ready notebook.
Check which planned runs are missing or inconsistent before comparing methods.
```

## Manuscript writing and review

| Skill | Use it when | Primary evidence | Direct target or result |
| --- | --- | --- | --- |
| `paper-writing-methodology` | Describing the implemented method | Source code, algorithms, configs, and verified implementation choices | `paper/sections/methodology.tex` |
| `paper-writing-experimental-results` | Reporting measured outcomes | Result artifacts, logs, validated tables, figures, uncertainty, and analysis notebook | `paper/sections/experimental-results.tex` |
| `paper-writing-related-work` | Positioning the work against prior research | Existing bibliography, verified sources, and literature synthesis | `paper/sections/related-work.tex` |
| `paper-writing-introduction` | Establishing the problem, supported gap, motivation, and contributions | Confirmed study design, literature evidence, and manuscript context | `paper/sections/introduction.tex` |
| `paper-writing-conclusion` | Closing a manuscript whose findings are stable | Complete manuscript and supported results and limitations | `paper/sections/conclusion.tex` |
| `paper-writing-abstract` | Summarizing a nearly complete manuscript | Stable problem, method, contributions, and headline results | `paper/sections/abstract.tex` |
| `paper-reviewing` | Checking a complete manuscript before submission | Complete `paper/` tree plus code, configs, results, and provenance | Structured findings with severity, location, evidence, and recommendation; read-only by default |

The initializer connects all canonical targets to `paper/main.tex`. If another
manuscript uses a noncanonical include or inline section, a writer updates that
reachable target instead of creating a duplicate. Writers preserve unrelated
content and never invent a result, citation, dataset, or implementation detail.

Example requests:

```text
Write the methodology from the current code and configs; flag unverifiable details.
Write experimental results from the validated notebook, including uncertainty.
Update related work using the existing bibliography and literature synthesis.
Write the abstract last, using only claims already supported in the manuscript.
Review the complete paper and repository; report findings only.
```

## Repository maintenance

| Skill | Use it when | Give the agent | Expected result |
| --- | --- | --- | --- |
| `docs-maintaining-repository` | Documentation is missing, stale, incomplete, or conflicts with implementation | The current repository and any relevant user context | Evidence-based updates to the standard repository docs, with changed/unchanged/conflict/validation reporting |

Example request:

```text
Update the repository documentation from the current code and configs.
```

## Choosing between similar-looking skills

- Use `paper-reading` for one paper; use `literature-synthesizing-evidence` for
  cross-paper comparison.
- Use `research-designing-study` to decide what evidence the study needs; use
  `experiments-designing-configurations` later to encode that evidence as a
  concrete run matrix and runnable configs.
- Use `paper-planning-reimplementation` to define fidelity constraints; use
  Superpowers or another engineering workflow for file-level planning and code.
- Use `results-analyzing-experiments` to establish findings; use
  `paper-writing-experimental-results` to express those findings in manuscript
  prose.
- Use a section writer to edit; use `paper-reviewing` for an independent review
  that does not modify files by default.

For the end-to-end sequence, see the [research workflow guide](research-workflow.md).
