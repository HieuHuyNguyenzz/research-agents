---
name: literature-synthesizing-evidence
description: Use when a user provides multiple local research-paper PDF files or folders and wants a scoped literature synthesis, source inventory, cross-paper evidence matrix, thematic comparison, research-gap assessment, or evidence for study design and related work; use web discovery only when explicitly requested.
---

# Synthesizing Literature Evidence

Synthesize a user-scoped collection of papers into traceable cross-paper
evidence. Use local PDF files as the default source mode. Do not assume access
to a literature database, search service, or complete field-wide corpus.

## Establish the source set

Require the user to provide one or more PDF paths or explicitly named folders.
Accept files from different locations; they do not need to share a directory.
When a folder is named, inspect PDF files recursively within that folder only.
Do not treat every paper-like file in the repository as in scope, and do not
move, copy, rename, delete, or upload source files.

If no local source is provided, ask for PDF files or paths. Do not search the
web or download papers by default. When the user explicitly requests discovery
and that capability is available, first propose candidate sources with their
provenance and wait for source-set confirmation before reading them. If access
is unavailable, return a search strategy and the exact sources still needed.

Ask for the synthesis question, intended use, or inclusion boundary only when
it cannot be inferred. Ask one question at a time. Confirm the source scope
before a large review or when inclusion is ambiguous.

## Inventory and read

1. Build a stable source inventory with IDs, local paths, title, authors, year,
   venue, DOI or preprint identifier when present, and read status.
2. Detect exact and likely duplicates using file identity plus verified DOI,
   identifier, or normalized title metadata. Keep conflicting versions visible.
3. Report encrypted, corrupt, image-only, truncated, or otherwise unreadable
   PDFs. Request a text-accessible copy when local extraction is insufficient;
   never silently omit a failed source.
4. Apply `paper-reading` to each included paper or reuse an existing reliable
   evidence map. Extract the problem, contribution, method, assumptions, data,
   protocol, baselines, metrics, reported findings, limitations, and
   reproducibility gaps with page, section, table, figure, equation, or
   algorithm locations when available.
5. Separate paper-reported facts, author interpretations, and synthesis-level
   inferences. Use concise paraphrases and avoid unnecessary quotation.

## Synthesize across papers

Organize the synthesis by research question, theme, method family, assumption,
or evaluation dimension rather than concatenating per-paper summaries.

Create a cross-paper evidence matrix that makes agreements, contradictions,
coverage gaps, incomparable protocols, and evidence strength visible. Compare
datasets, splits, baselines, metrics, uncertainty, compute conditions, and
limitations only where the sources support the comparison.

Treat a research gap or novelty claim as provisional unless the confirmed
source scope and search protocol justify stronger language. Never infer absence
of prior work from the provided PDFs alone, claim that the review is systematic
or exhaustive without a documented protocol, or convert missing details into
negative findings.

## Confirm and deliver

Return a concise synthesis directly unless the user requests a persisted
artifact. For a repository that has no established convention, use
`literature/synthesis.md` after confirming the source set and target. Preserve
an existing synthesis and update its relevant sections instead of appending a
duplicate review.

Include:

- review question, intended use, scope, and limitations;
- source inventory, exclusions, duplicates, and unreadable sources;
- cross-paper evidence matrix;
- thematic findings, agreements, contradictions, and boundary conditions;
- methods, datasets, baselines, metrics, and protocol patterns;
- limitations and reproducibility gaps;
- provisional research gaps and unresolved questions;
- source-level evidence locations and synthesis-level inference labels; and
- handoff recommendations.

Update `paper/references.bib` only when the user requests it and the citation
metadata is verified. Preserve existing entries and report unresolved or
conflicting metadata instead of fabricating fields.

Pass the synthesis to `research-designing-study` to validate provisional gaps,
research questions, and claim-to-evidence requirements. Use it as evidence for
`paper-writing-introduction`, `paper-writing-related-work`, and scientifically
justified choices in `experiments-designing-configurations`. Do not write paper
prose, design runnable experiments, implement code, or claim that cited results
were reproduced.
