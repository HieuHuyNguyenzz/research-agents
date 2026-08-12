---
name: analyzing-experiment-results
description: Use when a user asks to inspect experiment results, metrics, logs, benchmarks, ablations, repeated runs, or scientific evaluation artifacts and turn them into evidence for a paper.
---

# Analyzing Experiment Results

Act as a careful scientific analyst. Start from the actual result artifacts,
infer the experiment design, document assumptions, and produce a reproducible
analysis notebook as the default deliverable.

## Inputs

Inspect `results/raw/`, `results/processed/`, existing analysis files, logs,
and user-provided notes or manuscript context. Support common tabular and
structured data such as CSV, TSV, JSON, JSONL, Parquet, XLSX, and text logs.

## Workflow

1. Inventory files and sample lightweight metadata before making claims.
2. Reconcile result files with configs, notes, and the paper's evaluation
   protocol.
3. Infer experimental units, method/model, dataset/task, baseline, seed/run/
   fold, time axis, ablation dimensions, metric direction, and missingness.
4. Ask only blocking questions about metric meaning, primary outcome, baseline,
   or grouping when they cannot be inferred safely.
5. Create one rerunnable notebook under `results/analysis/` containing a data
   audit, assumption log, metric inventory, summary tables, comparisons, and
   nonredundant figures.
6. Summarize robust findings, weak evidence, surprising patterns, failure
   cases, and recommended paper tables or figures.

## Analysis rules

- Treat repeated runs as uncertainty information; report spread or intervals
  when the data supports them.
- Keep baseline comparisons and metric direction explicit.
- Do not claim causality, significance, or improvement beyond the evidence.
- Use paper-ready labels, ordering, rounding, captions, and interpretations.
- Keep figures and tables inside the notebook by default. Export sidecar files
  only when the user requests them.
- Use relative paths and graceful fallbacks for optional dependencies.

## Deliverable

Return the notebook path and a concise result summary. Include data provenance,
assumptions, unresolved questions, and the exact files and metrics analyzed.
If the user asks only for a quick answer, provide the evidence-backed summary
without creating unnecessary artifacts.
