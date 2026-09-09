---
name: results-analyzing-experiments
description: Use when a user asks to inspect experiment results, metrics, logs, benchmarks, ablations, repeated runs, or scientific evaluation artifacts and turn them into evidence and a reproducible analysis notebook for a paper.
---

# Analyzing Experiment Results

Act as a careful scientific analyst. Start from the actual result artifacts,
infer the experiment design, document assumptions, and produce a reproducible
analysis notebook as the default deliverable.

## Inputs

Inspect `results/raw/`, `results/processed/`, `results/analysis/`,
`docs/experiments.md`, the relevant `src/configs/` branches, logs, and
user-provided notes or manuscript context. Preserve the intent of an existing
notebook when revising it. Support common tabular and structured data such as
CSV, TSV, JSON, JSONL, Parquet, XLSX, and text logs.

## Workflow

1. Inventory files and sample lightweight metadata before making claims.
2. Reconcile result files with configs, notes, and the paper's evaluation
   protocol.
3. Infer experimental units, method/model, dataset/task, baseline, seed/run/
   fold, time axis, ablation dimensions, metric direction, and missingness.
4. Ask only blocking questions about metric meaning, primary outcome, baseline,
   or grouping when they cannot be inferred safely.
5. Create or revise one rerunnable notebook under `results/analysis/`. Keep
   each code cell focused on one operation and add concise markdown for the
   objective, assumptions, expected outputs, and interpretation. Include a data
   audit, metric inventory, summary tables, comparisons, and nonredundant
   figures.
6. Execute the notebook from top to bottom when the environment permits.
   Verify that it does not rely on hidden state, that outputs are visible, and
   that table and figure labels are readable.
7. Summarize robust findings, weak evidence, surprising patterns, failure
   cases, and recommended paper tables or figures.

## Analysis rules

- Treat repeated runs as uncertainty information; report spread or intervals
  when the data supports them.
- Keep baseline comparisons and metric direction explicit.
- Do not claim causality, significance, or improvement beyond the evidence.
- Use paper-ready labels, ordering, rounding, captions, and interpretations.
- Keep figures and tables inside the notebook by default. Export sidecar files
  only when the user requests them, using `results/figures/` for figures and
  `results/tables/` for tables. Copy publication-selected artifacts into
  `paper/figures/` or `paper/tables/` only when the user explicitly requests a
  manuscript handoff.
- Use repository-relative paths, centralize reusable loading and plotting
  helpers, and provide graceful fallbacks for optional dependencies.
- Avoid absolute paths, stale variables, hidden state, filler charts, and
  duplicated code.

## Deliverable

Return the notebook path and a concise result summary. Include data provenance,
assumptions, unresolved questions, the exact files and metrics analyzed, and
the notebook validation result. If execution is not possible, report why and
give the exact command needed to validate it. If the user asks only for a quick
answer, provide the evidence-backed summary without creating unnecessary
artifacts.
