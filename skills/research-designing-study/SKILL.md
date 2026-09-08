---
name: research-designing-study
description: Use when a user has an early research idea and needs to turn it into a testable study design by defining the problem, provisional research gap, research questions, hypotheses, expected contributions, variables, required evidence, feasibility constraints, threats to validity, and scientific acceptance criteria before project initialization or implementation.
---

# Designing a Research Study

Turn an early idea into a scientifically testable study design. Establish what
the project should investigate and what evidence could support or refute its
claims without taking ownership of implementation or experiment execution.

## Inspect before asking

Inspect user-provided notes and, when present, `README.md`, `AGENTS.md`, `docs/`,
`paper/`, the bibliography, existing study designs, and relevant decisions.
Separate verified evidence, user constraints, assumptions, and unknowns before
asking questions.

Ask one question at a time only when an answer materially changes scientific
validity, feasibility, or scope. Explain the trade-offs and recommend an option
when repository evidence supports one. Do not repeat a fixed questionnaire or
ask for information that is already available.

Use local and user-provided sources first. Search public sources only when that
capability is available and permitted. Never treat model memory or a limited
source set as an exhaustive literature review. Mark novelty and the research
gap as provisional until sufficient literature evidence supports them.

## Design the study

1. Define the problem, context, motivation, target population or system, and
   why the unknown matters.
2. State focused research questions that are answerable with observable
   evidence and fit the available time, data, and compute.
3. Add falsifiable hypotheses when appropriate. Identify independent and
   dependent variables, experimental units, interventions or methods,
   comparators, controls, confounders, and expected direction without inventing
   effect sizes or thresholds.
4. Separate expected scientific contributions from engineering deliverables.
   Classify contributions as methodological, empirical, theoretical, dataset,
   system, or reproducibility work.
5. Build a claim-to-evidence contract. For each intended claim, identify the
   evidence needed, relevant metrics and direction, baselines, uncertainty
   units, ablations, robustness checks, qualitative evidence, or failure cases.
   Keep this at study-design level rather than creating runnable configs.
6. Assess feasibility: data access and licensing, leakage risk, implementation
   dependencies, compute and time constraints, expected artifacts, privacy or
   ethics concerns, and the minimum viable study versus optional extensions.
7. Analyze construct, internal, external, statistical, and reproducibility
   threats to validity plus bounded mitigations.
8. Record assumptions, contradictions, blockers, unresolved questions, and
   scientific acceptance criteria. Do not convert missing evidence into facts.

## Confirm and deliver

Present the complete proposed study design and ask for confirmation before
persisting it. A changed research question, hypothesis, scope, or evidence
requirement needs a revised proposal and new confirmation.

Produce a study design brief containing:

1. problem, context, motivation, and evidence status;
2. provisional research gap and novelty boundary;
3. research questions and hypotheses;
4. expected scientific contributions and engineering deliverables;
5. study type, variables, units, comparators, controls, and confounders;
6. claim-to-evidence contract;
7. feasibility, resources, ethics, and data constraints;
8. threats to validity and mitigations;
9. assumptions, deviations, blockers, and open questions;
10. minimum viable study, optional extensions, and scientific acceptance
    criteria; and
11. handoff notes.

If the repository has an established research-spec convention and the user
requested a written artifact, use that convention. Otherwise return the brief
directly. Never overwrite or silently duplicate an existing study design.

For a new project, pass the confirmed brief to `research-initializing-project`.
When an engineering workflow such as Superpowers is available, pass the brief
as upstream scientific requirements for design and implementation. Use
`paper-reading` and `paper-planning-reimplementation` instead when the primary
goal is faithful reproduction of a specific paper. Leave the concrete run
matrix and runnable configs to `experiments-designing-configurations`.

Do not write source code, configs, datasets, results, manuscript prose, or a
file-by-file engineering plan. Do not run experiments or claim that the study
has established novelty, significance, or improvement.
