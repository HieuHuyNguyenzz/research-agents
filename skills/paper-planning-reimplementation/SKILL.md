---
name: paper-planning-reimplementation
description: Use when a user wants to reproduce a research paper and needs an evidence-grounded research implementation brief that constrains and hands off to Superpowers or another engineering planning workflow, rather than a duplicate coding plan.
---

# Preparing a Paper Reimplementation Brief

Translate an evidence-based paper understanding into the scientific contract
that an engineering workflow needs. Preserve the paper's experimental intent
without taking ownership of implementation planning or execution.

## Inputs

Use the paper evidence map, target repository, requested reproduction scope,
dataset constraints, available code, and expected deliverable. If the paper
has not been examined, request or create an evidence-aware paper summary first.

## Workflow

1. Inspect the evidence map and the repository's runtime, dependencies, entry
   points, configs, training and evaluation paths, results, and tests.
2. Inspect existing `superpowers/specs/`, `superpowers/plans/`, and
   `superpowers/decisions/` when present. Reuse their decisions and report
   conflicts instead of creating a competing plan.
3. Define the reproduction objective, scope, and non-goals. Separate the
   minimum faithful reproduction from optional extensions.
4. Establish the scientific contract: data and splits, preprocessing, model
   behavior, objectives, training and inference behavior, baselines, metrics,
   uncertainty units, and expected research artifacts.
5. Map paper components to repository responsibilities such as data loading,
   models, losses, optimization, evaluation, logging, and outputs. Identify
   affected components without decomposing them into coding tasks.
6. Classify each unresolved detail as an evidence gap, assumption, proposed
   deviation, risk, or blocker. Ask only about choices that materially affect
   fidelity or scientific validity.
7. Define scientific acceptance criteria that an implementation and its tests
   must demonstrate, while leaving test design and execution details to the
   engineering workflow.

## Deliverable

Produce a research implementation brief with these sections:

1. reproduction objective, scope, and non-goals;
2. source evidence and paper-to-repository mapping;
3. fidelity requirements and scientific contract;
4. assumptions, approved deviations, risks, gaps, and blockers;
5. scientific acceptance criteria; and
6. engineering handoff notes.

In an initialized research repository, persist the brief under
`superpowers/specs/` with a descriptive `*-research-brief.md` name when the
user requests a written artifact. Otherwise return the complete brief directly.
Never overwrite or silently duplicate an existing spec or plan, and do not
write a competing brief outside the canonical `superpowers/specs/` root.

Treat the brief as upstream evidence for Superpowers. When Superpowers skills
are available, hand off the brief and its unresolved blockers to them for
engineering design, task decomposition, file-level planning, implementation,
test execution, and review. When they are unavailable, identify the brief as
input to the next engineering planning workflow.

Do not create a second coding plan, implementation checklist, commit strategy,
or coding milestone sequence. Do not implement code in this skill. Leave the
experiment matrix and runnable configuration files to
`experiments-designing-configurations` after the required execution paths are
supported.

## Fidelity rules

- Keep the paper's inputs, outputs, data splits, metrics, and baseline
  comparisons intact unless a deviation is explicitly documented.
- Reuse repository conventions before introducing new abstractions.
- Separate reported evidence from assumptions and engineering proposals.
- Make every fidelity-relevant uncertainty visible in the handoff.
