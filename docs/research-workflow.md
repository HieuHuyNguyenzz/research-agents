# Research workflow guide

This guide shows how to use `research-agents` from an initial idea or source
paper through implementation, experiments, manuscript preparation, and review.
The skills are invoked with natural-language requests; users do not need to
call a skill by its exact name.

## Before starting

1. Install the package using the guide for your coding agent.
2. Start a clean session so the agent can discover the installed skills.
3. Ask `List the installed research skills.` as a discovery smoke test.
4. Keep source papers, project notes, code, configs, and result artifacts in
   locations the agent can read. Do not place credentials in those files.

See the [skill reference](skill-reference.md) for inputs, outputs, and example
requests for all skills.

## Choose an entry path

Use the original-study path when the project begins with a research idea. Use
the reproduction path when the primary objective is to reproduce or extend a
specific paper. The paths converge before implementation.

### Path A: original study

1. Ask `research-designing-study` to turn the idea into research questions,
   falsifiable hypotheses, intended claims, evidence requirements, feasibility
   constraints, and threats to validity.
2. Provide the relevant local PDF files or folders to
   `literature-synthesizing-evidence`. By default it reads only this
   user-scoped source set; it does not search for or download papers.
3. Revise the study design using the synthesis. Treat novelty and the research
   gap as provisional when the source scope cannot justify a stronger claim.
4. Ask `research-initializing-project` to scaffold the repository only after
   the study brief is confirmed.

Example sequence:

```text
Turn this idea into a testable study design: <idea and constraints>.
Synthesize the PDF files in papers/core and assess the provisional gap.
Revise the study design using that synthesis.
Initialize a research project from the confirmed design.
```

### Path B: faithful paper reproduction

1. Give the source paper and supplementary material to `paper-reading` to
   build an evidence-aware technical understanding.
2. Ask `paper-planning-reimplementation` for a research implementation brief
   that records fidelity requirements, assumptions, deviations, gaps, and
   scientific acceptance criteria.
3. Pass that brief to Superpowers or another engineering workflow for software
   design, task decomposition, implementation, testing, and review.

Example sequence:

```text
Read paper.pdf and extract the method, protocol, assumptions, and missing details.
Prepare a research implementation brief for reproducing it in this repository.
Use the confirmed brief as the scientific contract for implementation planning.
```

The reimplementation skill deliberately does not create a competing coding
plan. It constrains the downstream engineering workflow with paper evidence.

## Implement and design experiments

Implementation is owned by the coding agent's engineering workflow. Once the
required data, training, and evaluation paths exist, ask
`experiments-designing-configurations` to create the evaluation protocol.

The skill separates:

- `core` experiments required for primary claims; and
- `supplementary` experiments covering robustness, sensitivity, efficiency,
  qualitative behavior, and failure cases.

It presents the complete matrix and asks for confirmation before writing
`docs/experiments.md` or repository-native configs. A config is marked
`blocked` when the current code cannot run it; the skill does not invent a
schema or silently schedule unsupported work.

Example request:

```text
Design the core and supplementary experiment matrix needed to test the
confirmed hypotheses. Use the repository's existing config format and stay
within 40 GPU-hours where possible.
```

## Run on another workstation

The current package designs configs but does not remotely execute a workstation.
Use this manual handoff:

1. Commit or transfer the exact code, dependency lock files, data instructions,
   and confirmed configs.
2. Record the source revision, environment, hardware, dataset version, config,
   run ID, and seed for every run.
3. Run the commands reported by the experiment-design skill. They are suggestions
   marked as not executed until the user runs them.
4. Return machine-readable metrics and logs to `results/raw/`, preserving run
   IDs and config provenance.
5. Keep partial, failed, and excluded runs visible rather than silently
   deleting them; record their status and reason.

This provenance is necessary to detect missing runs, configuration drift, and
invalid comparisons during analysis.

## Analyze results

Ask `results-analyzing-experiments` to inspect the returned metrics, logs,
baselines, ablations, repeated runs, and configs. Its default artifact is one
rerunnable notebook under `results/analysis/` containing the data audit,
summary tables, comparisons, uncertainty, and nonredundant figures.

Example request:

```text
Analyze results/raw against docs/experiments.md and the configs. Create a
paper-ready notebook, report missing or inconsistent runs, and do not infer
metrics that are absent.
```

Do not write the paper's result claims before this checkpoint. Every reported
number should map to a recorded artifact, and repeated runs should be treated
as uncertainty information.

## Write the manuscript

For a full manuscript, the practical order is:

1. `paper-writing-methodology` from implemented code and configs.
2. `results-analyzing-experiments` to establish result evidence.
3. `paper-writing-experimental-results` from the validated analysis.
4. `paper-writing-related-work` from the bibliography and literature synthesis.
5. `paper-writing-introduction` from the supported problem, gap, and contributions.
6. `paper-writing-conclusion` from the complete supported findings.
7. `paper-writing-abstract` last, after the claims and results are stable.
8. `paper-reviewing` for an independent, read-only submission-readiness review.

Writers update their existing LaTeX section target and preserve unrelated
content. They must not invent citations, implementation details, or results.
See the [paper-writing guide](paper-writing.md) for section targets and the
evidence policy.

## Keep repository documentation accurate

Run `docs-maintaining-repository` after material changes to architecture,
commands, configs, experiments, or reproduction steps. It audits the standard
repository documentation against higher-priority implementation evidence and
leaves already accurate content unchanged.

Example request:

```text
Update the repository documentation from the current code, configs, tests,
experiment protocol, and result paths.
```

## Human confirmation points

The user remains responsible for confirming decisions that materially change:

- the research question, hypothesis, scope, or evidence requirements;
- the literature source set and inclusion boundary;
- the project scaffold and overwrite behavior;
- the complete experiment matrix and per-file conflict handling;
- deviations from a reproduced paper; and
- unsupported claims, unresolved citations, and submission decisions.

Skills expose missing evidence and blockers instead of converting them into
facts. External execution, dataset access, ethics approval, and final scientific
judgment remain outside the package's automated guarantees.
