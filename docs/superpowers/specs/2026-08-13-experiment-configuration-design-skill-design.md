# Experiment Configuration Design Skill

**Date:** 2026-08-13  
**Status:** Approved in conversation; awaiting written-spec review

## Goal

Add one portable skill that inspects a research repository, brainstorms only
the unresolved experimental decisions with the user, and turns the confirmed
design into a scientifically complete experiment matrix, repository-native
configuration files, and an updated `docs/experiments.md`.

The skill designs the evidence needed for a paper. It does not reduce the
matrix to fit available compute, change implementation code, run the full
matrix, analyze results, or write the manuscript's results section.

## Canonical Identity

The canonical skill ID is `experiments-designing-configurations`.

It follows the repository's `<domain>-<action>-<object>` convention:

- domain: `experiments`;
- action: `designing`; and
- object: `configurations`.

The directory, frontmatter `name`, catalog entry, and documentation must use
this exact ID. The frontmatter description starts with `Use when` and contains
only trigger conditions, including unclear experimental protocols, incomplete
paper evidence, missing experiment matrices, or experiment configurations
that need to be designed or reconciled.

## Workflow Position

The skill sits between research-claim definition and execution:

```text
paper and repository evidence
  -> experiments-designing-configurations
  -> experiment execution
  -> results-analyzing-experiments
  -> paper-writing-experimental-results
```

It may use outputs from `paper-reading` or
`paper-planning-reimplementation`, but neither is a mandatory prerequisite
when the repository already supplies equivalent evidence.

## Architecture

The first release is one self-contained
`skills/experiments-designing-configurations/SKILL.md`. It contains the
inspection, questioning, matrix, confirmation, write, conflict, and validation
contracts. It has no script, template, or reference bundle because config
formats and schemas vary by repository. Reusable assets may be introduced
later only after repeated real use demonstrates a stable cross-project need.

The shared skill remains agent-neutral and does not name platform-specific
tools. Existing native adapters already expose the complete flat `skills/`
directory, so no adapter behavior changes are required.

## Evidence Inspection

Before asking questions or proposing experiments, inspect the complete
repository for:

- research questions, hypotheses, claims, scope, and intended venue in
  `README.md`, `docs/`, and `paper/`;
- existing bibliography entries and paper evidence;
- datasets, preprocessing, splits, methods, baselines, metrics, and evaluation
  logic in code and tests;
- configuration directories, formats, schemas, inheritance, naming, defaults,
  and composition behavior;
- train, evaluate, sweep, dry-run, and smoke-test entry points;
- result artifacts that prove an experiment already exists or expose an
  incomplete comparison; and
- repository instructions and constraints in `AGENTS.md`.

Use executable code, checked-in configuration, tests, and recorded artifacts
as evidence for what can run. Do not treat a paper claim or conversational
idea as proof that the current code supports a configuration field.

Maintain an internal decision ledger containing verified facts, assumptions,
contradictions, and unresolved decisions. Do not create a separate ledger file
unless the user asks for it.

## Collaborative Questioning

Infer every safely verifiable decision before asking the user. Ask one question
at a time only when a missing or conflicting choice affects the scientific
matrix or prevents a runnable config.

Questions may cover:

- primary research questions, hypotheses, and claims;
- datasets, versions, preprocessing, and splits;
- proposed methods and comparison baselines;
- primary, secondary, and diagnostic metrics plus metric direction;
- repetitions, seeds, folds, and uncertainty reporting;
- controlled variables, ablation axes, and sensitivity ranges;
- robustness, distribution-shift, efficiency, qualitative, and failure-case
  evaluation; and
- expected artifacts and acceptance criteria.

Do not repeat a fixed questionnaire when the repository already answers a
question. When offering choices, explain their scientific trade-offs and give
a recommendation grounded in the inspected evidence.

## Literature and Web Boundary

Use the repository, manuscript, and existing bibliography first. If they do
not provide enough evidence to choose a baseline or evaluation protocol, ask
the user for permission before searching the web.

When permission is granted, prefer primary papers, official benchmarks, and
official dataset or method documentation. Record the title or identifier,
source URL, and the decision it supports. Do not place an unverified baseline,
metric definition, parameter, or protocol into a runnable config. When web
access is unavailable or permission is declined, keep the decision unresolved
or mark the affected experiment `blocked`.

## Scientific Matrix

Design the scientifically complete matrix without removing experiments because
of compute cost. Estimate run count and resource implications so the user can
plan execution, but do not use compute as an automatic exclusion criterion.

Organize experiments into:

- `core`: experiments required to support or refute the paper's primary claims;
  and
- `supplementary`: robustness, sensitivity, efficiency, qualitative, and
  failure-case evidence that tests generality or limitations.

Every experiment entry contains:

- a unique stable ID and `core` or `supplementary` tier;
- the research question, hypothesis, or claim it tests;
- method, baselines, dataset, preprocessing, and split;
- primary and secondary metrics with improvement direction;
- seeds, repetitions, folds, or other uncertainty units;
- independent variables and controlled variables;
- linked config paths and expected result artifacts;
- dependencies and scientific rationale;
- estimated run count; and
- status `ready` or `blocked`.

The total run count must follow from the declared Cartesian dimensions rather
than an unsupported guess. Identify existing completed runs separately so the
design does not silently schedule duplicates.

## Ready and Blocked Experiments

An experiment is `ready` only when the current repository supports its data,
method, evaluation path, and complete configuration schema.

If the experiment needs an unsupported parameter, implementation feature,
dataset adapter, metric, or entry point:

- do not create a speculative or non-runnable config;
- keep the scientifically necessary experiment in `docs/experiments.md` with
  status `blocked`;
- record the exact code or infrastructure gap;
- identify the evidence used to diagnose the gap; and
- state the concrete condition that would unblock config creation.

The skill never modifies source code, tests, package dependencies, data, or
runtime infrastructure to unblock an experiment.

## Confirmation Gate

Before any write, present a complete proposal containing:

- the `core` and `supplementary` matrix;
- verified facts, assumptions, and unresolved decisions;
- ready and blocked experiments with code gaps;
- per-experiment and total estimated run counts;
- every documentation and config path to create or modify;
- expected result artifacts;
- literature provenance introduced during the session; and
- any existing-file conflict with its proposed resolution.

Write only after the user explicitly confirms this complete proposal. A reply
that changes a matrix choice is a revision, not confirmation; update the
proposal and ask again.

## Documentation Output

Create or update `docs/experiments.md` as the human-readable experimental
contract. Preserve accurate existing content and update relevant sections
instead of appending duplicates.

The document records:

- research questions, hypotheses, and paper claims;
- datasets, splits, methods, baselines, metrics, and evaluation protocol;
- `core` and `supplementary` matrix entries;
- repetitions, seeds, controlled variables, and run counts;
- config paths, execution dependencies, and expected artifacts;
- ready and blocked status plus unblock conditions;
- assumptions, unresolved choices, and literature provenance; and
- validation and smoke-test commands that are verified from the repository.

Do not claim that an experiment ran or passed because its config was created.

## Configuration Output

Write confirmed, runnable configurations only under:

- `src/configs/baselines/` for baseline-specific definitions;
- `src/configs/proposed/` for the proposed method;
- `src/configs/ablations/` for controlled component removals or substitutions;
  and
- `src/configs/experiments/` for composed runs, evaluations, or sweeps.

Follow the repository's existing config format, extension, schema, inheritance,
composition, naming, and path conventions. Reuse shared definitions rather
than duplicating a full configuration when the repository has a verified
composition mechanism.

If no reliable config example exists, ask the user to choose the format before
creating files. Format selection alone is not sufficient evidence of
runnability: when no parser, schema, accepted keys, or execution path can be
verified, mark the experiment `blocked` and do not create a config.

Use values supported by inspected code or explicitly confirmed by the user
when the code accepts an unconstrained value. Do not invent secret paths,
credentials, dataset locations, hardware availability, benchmark values, or
expected numerical results.

## Existing-File Conflicts

Inspect every intended target before writing. A target conflicts when its
existing semantics differ from the confirmed proposal; formatting differences
alone are not conflicts.

For each conflict, show the relevant differences and request one explicit
resolution:

- `preserve`: leave the existing file unchanged and reflect the unresolved
  difference in the report;
- `merge`: apply only the reviewed, non-destructive changes while retaining
  unrelated values and comments; or
- `overwrite`: replace the existing target with the confirmed content.

Do not apply one blanket answer to unlisted conflicts. Do not overwrite or
merge a conflicting file until the user has confirmed that file's resolution.
Never create suffixed duplicates merely to avoid resolving a semantic conflict.

## Validation

After writing, validate as much as the repository safely supports:

1. parse every created or changed config with its native parser or a
   format-appropriate parser;
2. run schema or application config validation when a verified command exists;
3. verify referenced local paths, config inheritance, and composed references;
4. check unique experiment IDs and consistency between
   `docs/experiments.md`, config paths, dimensions, and total run count;
5. run a documented dry-run or bounded smoke test only when the repository
   exposes an explicitly safe mechanism; and
6. confirm that validation created no full experiment or unrequested result
   artifacts.

Do not run training, full evaluation, a complete sweep, or the experiment
matrix. If validation fails, stop and report the exact file, command, observed
error, and affected experiment. Do not hide the failure by changing source
code or silently weakening the scientific design.

## Completion Report

Report:

- **Changed:** documentation and config files created or modified;
- **Matrix:** core/supplementary counts, ready/blocked counts, and total
  estimated runs;
- **Blocked:** code gaps and conditions required to unblock them;
- **Conflicts:** each preserve/merge/overwrite decision and result;
- **Assumptions:** user-confirmed and unresolved assumptions;
- **Provenance:** repository evidence and any approved external sources;
- **Validation:** parse, schema, consistency, dry-run, or smoke checks with
  observed outcomes; and
- **Next commands:** repository-verified commands the user may run to execute
  the matrix, clearly identified as not yet executed.

## Integration and Versioning

Add `experiments-designing-configurations` to
`research-listing-skills` under an `Experiments` group and expose it in the
README workflow before `results-analyzing-experiments`. The README includes a
natural-language request such as:

`Design the experiment matrix and configurations needed to support this paper.`

The package stays at version `0.2.0`. This is an additive portable skill and
does not rename or remove a public ID. Compatibility rows remain unverified
until the repository's existing native clean-session evidence requirements are
met.

## Verification Contract

Automated contract tests must prove that:

- the canonical ID matches its directory and frontmatter;
- the trigger-only description begins with `Use when`;
- inspection covers paper, bibliography, code, config, tests, results, and
  repository instructions before questions;
- questions are one at a time and limited to missing or conflicting decisions;
- the matrix contains all required fields and both scientific tiers;
- compute does not automatically remove experiments and run counts are exposed;
- web search requires permission and external evidence has provenance;
- writes require confirmation of the complete proposal;
- documentation and config writes use the exact allowed target roots;
- repository-native config conventions are preserved;
- unsupported experiments become documented `blocked` entries without
  speculative configs or source-code changes;
- existing-file conflicts require explicit per-file
  preserve/merge/overwrite decisions;
- validation is bounded to parsing, schema, consistency, and safe dry-run or
  smoke behavior;
- full experiments and result analysis remain out of scope;
- the completion report includes every required field;
- the catalog and README make the skill discoverable; and
- shared content remains portable and contains no platform-specific tool names.

The release gate is `npm run verify` followed by `git diff --check`.

## Non-Goals

- Running training, full evaluation, sweeps, or the confirmed experiment
  matrix.
- Reducing the scientific matrix automatically to fit compute or time limits.
- Modifying code, tests, dependencies, datasets, or infrastructure to support
  a proposed experiment.
- Analyzing result artifacts or writing paper sections.
- Inventing unsupported config schemas, benchmark protocols, literature,
  expected results, or credentials.
- Searching the web without the user's permission.
- Adding a universal config generator before repository conventions justify
  one.
