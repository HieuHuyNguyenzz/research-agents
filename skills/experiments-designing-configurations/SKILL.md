---
name: experiments-designing-configurations
description: Use when a research paper needs an experimental protocol, experiment matrix, or repository-native configurations to resolve missing, incomplete, or conflicting evaluation decisions.
---

# Designing Experiment Configurations

Design the evidence needed to support or refute the paper's claims. Collaborate
with the user before writing, create only configs the current repository can
run, and leave full experiment execution to a later request.

## Inspect before asking

Inspect the complete repository before asking questions. Read `AGENTS.md`,
`README.md`, `docs/`, `paper/`, `paper/references.bib`, code, configs, tests,
entry points, and results. Infer research claims, datasets, splits, methods,
baselines, metrics, config format and schema, execution paths, completed runs,
and safe validation commands from this evidence.

Track verified facts, assumptions, contradictions, and unresolved decisions
internally. Ask one question at a time only for a missing or conflicting
decision that affects scientific validity or a runnable config. Do not repeat a
fixed questionnaire when repository evidence already answers the question.

Use the repository, paper, and bibliography first. If they cannot justify a
baseline or protocol, ask the user for permission before searching the web.
When approved, prefer primary papers, official benchmarks, and official dataset
or method documentation. For external evidence, record its title or identifier,
source URL, and the decision it supports. Do not use an unverified external
value in a config.

## Build the scientific matrix

Design both tiers:

- `core`: experiments required for the primary claims.
- `supplementary`: robustness, sensitivity, efficiency, qualitative, and
  failure-case evidence about generality and limitations.

Do not remove a scientifically necessary experiment because of compute cost.
Expose resource implications so the user can plan execution. Give every entry:

- a unique ID, tier, tested claim, and scientific rationale;
- method, baseline, dataset, preprocessing, and split;
- primary and secondary metric plus improvement direction;
- seeds, repetitions, folds, or other uncertainty units;
- independent variables and controlled variables;
- config paths, expected artifacts, and dependencies;
- a Cartesian-dimension-derived run count; and
- status `ready` or `blocked`.

Identify completed runs separately instead of silently scheduling duplicates.
An experiment is `ready` only when current code supports its data, method,
evaluation path, and complete config schema.

For unsupported work, do not create a speculative config. Keep the experiment
`blocked` with its exact code gap, supporting evidence, and condition required
to unblock config creation in `docs/experiments.md`. Do not
modify code, tests, dependencies, data, results, paper content, or
infrastructure.

## Confirm before writing

Present the complete `core` and `supplementary` matrix, verified facts,
assumptions, unresolved decisions, ready and blocked items, per-experiment and
total run counts, target paths, expected artifacts, external provenance, and
all conflicts. Write only after the user explicitly confirms this complete
proposal. A changed decision requires a revised proposal and new confirmation.

Treat a file as conflicting when its semantics differ from the confirmed
proposal; formatting differences alone are not a conflict. For each conflicting
file, show the relevant difference and request one mode:

- `preserve`: leave the file unchanged and report the unresolved difference.
- `merge`: apply reviewed non-destructive changes and retain unrelated content.
- `overwrite`: replace that file with the confirmed content.

Do not apply a blanket mode to unlisted conflicts, and do not create suffixed
duplicates to avoid a semantic conflict. Do not modify a conflicting file until
the user confirms that file's mode.

## Write documentation and runnable configs

Create or update `docs/experiments.md` with claims, protocol, both matrix tiers,
dimensions, run counts, config paths, expected artifacts, ready/blocked status,
code gaps, assumptions, provenance, and verified validation or execution
commands. Do not claim that an experiment ran because its config exists.

Write confirmed runnable configs only under:

- `src/configs/baselines/`
- `src/configs/proposed/`
- `src/configs/ablations/`
- `src/configs/experiments/`

Follow the existing format, schema, inheritance, composition, naming, and path
conventions. Reuse verified shared config definitions. If no reliable config
example exists, ask the user to choose the format. A selected format does not
prove runnability: without a verified parser, accepted keys, schema, and
execution path, keep the experiment `blocked` and create no config.

Do not invent credentials, secret paths, dataset locations, hardware,
benchmark values, expected results, config keys, or unsupported parameters.

## Validate without running the matrix

After writing:

1. Parse every changed config and run a verified schema check when available.
2. Verify referenced paths, inheritance, composition, and expected artifacts.
3. Check duplicate IDs plus docs/config dimensions and run count consistency.
4. Use a documented dry-run or bounded smoke test only when it is explicitly
   safe and does not create a full experiment or unrequested result artifact.

Do not run training, full evaluation, a sweep, or the experiment matrix. Do not
analyze results. On failure, stop and report the exact file, command, error, and
affected experiment without changing source code or weakening the design.

Report:

- **Changed:** documentation and config paths created or modified.
- **Matrix:** core/supplementary and ready/blocked counts plus total runs.
- **Blocked:** code gaps and unblock conditions.
- **Conflicts:** per-file preserve/merge/overwrite decisions and outcomes.
- **Assumptions:** confirmed and unresolved assumptions.
- **Provenance:** repository evidence and approved external sources.
- **Validation:** parse, schema, path, consistency, dry-run, or smoke results.
- **Next commands:** verified commands the user may run, marked not executed.
