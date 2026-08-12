---
name: planning-paper-reimplementation
description: Use when a user wants to reproduce a research paper in a codebase and needs a concrete implementation, experiment, or validation plan before coding.
---

# Planning Paper Reimplementation

Convert an evidence-based paper understanding into an executable plan for the
current research repository. Preserve the paper's experimental contract while
making assumptions visible.

## Inputs

Use the paper evidence map, target repository, requested reproduction scope,
dataset constraints, available code, and expected deliverable. If the paper
has not been examined, request or create a paper summary first.

## Workflow

1. Inspect the repository's runtime, dependencies, entry points, configs,
   training/evaluation scripts, result layout, and tests.
2. Define scope and non-goals. Separate the minimum faithful reproduction from
   optional extensions.
3. Map paper components to repository components: data loading, preprocessing,
   models, losses, optimization, training, evaluation, logging, and outputs.
4. Specify datasets, splits, seeds, metrics, baselines, hyperparameters,
   checkpoints, and expected result artifacts.
5. Order milestones by dependency. Each milestone must include a focused test,
   smoke run, or result sanity check.
6. List risks and open questions, especially details absent from the paper or
   likely to change the reported results.

## Deliverable

Write a plan containing scope, a paper-to-code mapping table, target files,
data/model/evaluation steps, configuration changes, tests, milestones, risks,
and validation commands. Do not start implementation until the user accepts a
plan when the request is explicitly planning-only.

## Fidelity rules

- Keep the paper's inputs, outputs, data splits, metrics, and baseline
  comparisons intact unless a deviation is explicitly documented.
- Reuse repository conventions before introducing new abstractions.
- Mark every assumption that is not stated by the paper or repository.
- Prove one small vertical slice before scaling to full experiments.
