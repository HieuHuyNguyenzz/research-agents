---
name: paper-reading
description: Use when a user provides a research paper, PDF, preprint, DOI, paper URL, supplementary material, or excerpt and needs an evidence-aware technical understanding.
---

# Reading Research Paper

Turn a paper into a precise, implementation-oriented understanding. Preserve the
paper's evidence and separate reported facts from inferences.

## Inputs

Accept a local PDF, public paper URL, DOI or preprint identifier, supplementary
material, or pasted excerpts. Prefer the local artifact when several sources
are available. Ask only for missing information that blocks a reliable answer.

## Workflow

1. Identify the artifact and inspect its title, abstract, method, experiments,
   limitations, appendix, tables, figures, and references.
2. Build an evidence map: record page, section, table, figure, equation, or
   algorithm locations for important claims.
3. Extract the problem setting, contributions, method components, data pipeline,
   objective, training/inference flow, baselines, metrics, and reported results.
4. Translate the method into code-facing components, inputs, outputs,
   configuration values, and evaluation steps.
5. Record reproducibility gaps such as unspecified preprocessing, missing
   hyperparameters, ambiguous notation, unavailable code, or unclear splits.

## Evidence rules

- Say “the paper reports” for claims supported by the source.
- Label assumptions and inferences explicitly.
- Label uncertainty explicitly when extraction or interpretation is incomplete.
- Preserve exact names for methods, datasets, metrics, and baselines.
- Cite page or section locations whenever the source format allows it.
- Do not infer statistical significance from a table that does not report it.

## Deliverable

Provide a concise thesis, method summary, experiment and metric table when
useful, implementation notes, reproducibility risks, and unresolved questions.
If the next step is implementation, pass this evidence map to
`paper-planning-reimplementation` rather than inventing missing details.
