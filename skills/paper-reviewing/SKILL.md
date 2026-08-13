---
name: paper-reviewing
description: Use when assessing a completed research manuscript for submission readiness, technical accuracy, reproducibility, or consistency with its supporting repository.
---

# Reviewing a Research Paper

Review the complete paper and its supporting repository as a manuscript-quality
assessment. This is a review, not a revision: preserve existing files. The review does not modify files.
Do not modify files.
Stop after review output unless the user requests fixes.

## Inspect the evidence

Inspect the complete `paper/` tree, its root document and section includes,
`paper/references.bib`, venue template and instructions, plus relevant
`README.md`, documentation, code, configs, tests, and results artifacts. Do not
invent missing evidence; identify it as a finding.

Check:

- Section ordering, required sections, duplicate or unreachable includes, and
  coherent narrative flow.
- Correctness, completeness, coherence, terminology consistency, and venue fit.
- Citation-key resolution: every citation key resolves in the bibliography and
  citations accurately
  support the surrounding claim.
- LaTeX syntax, labels/references, figures, tables, equations, bibliography,
  and template compliance.
- Quantitative and qualitative claims against result artifacts and recorded
  results, including
  metrics, baselines, uncertainty, and stated experimental conditions.
- The described method against its actual implementation in code and configs:
  data handling, model or algorithm, objectives, training, evaluation, defaults,
  and limitations.
- Reproducibility details: datasets and splits, preprocessing, dependencies,
  commands, hardware, seeds, hyperparameters, evaluation protocol, and artifact
  provenance.

## Output only the review

First give a concise summary of submission readiness, the strongest evidence,
and the principal risks. Then list findings ordered by severity. Each finding
must contain:

- **Severity:** exactly `blocking`, `important`, or `minor`.
- **Location:** exact paper path with section, line, label, citation key, or
  repository path as applicable.
- **Evidence:** observed text, artifact value, code/config behavior, or the
  absence of required evidence.
- **Recommendation:** a concrete, bounded corrective action.

Use `blocking` for defects that prevent a credible or compilable submission,
`important` for material correctness, reproducibility, or venue-fit risks, and
`minor` for non-material clarity, style, or presentation improvements. Separate
confirmed defects from questions that need author evidence. Do not write a
patch, edit LaTeX, or modify files unless the user later requests fixes.
