# Research Analysis Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four portable research skills for paper reading, reimplementation planning, experiment analysis, and reproducible notebooks.

**Architecture:** Each skill is a self-contained `SKILL.md` under `skills/` with trigger-only frontmatter, a concise workflow, explicit input/output contracts, and no target-agent tool names. Shared content validation remains the single gate; focused tests assert the domain-specific contract.

**Tech Stack:** Markdown skill contracts, Node.js 20 test runner, existing shared-content validator.

## Global Constraints

- Skill names use lowercase hyphen-case and match their directory names.
- Frontmatter contains `name` and a description beginning with `Use when`.
- Shared skills use abstract capabilities and must not name platform-specific tools.
- Each skill stays below 500 lines and contains no auxiliary README or installation guide.
- Analysis outputs stay inside the initialized research layout unless the user explicitly requests another location.

### Task 1: Add contract tests

**Files:**
- Create: `tests/research-analysis-skills.test.mjs`

- [ ] **Step 1: Assert the four skill files exist and have normalized metadata.**
- [ ] **Step 2: Assert each workflow contains its trigger, required inputs, deliverable, and verification behavior.**
- [ ] **Step 3: Run `node --test tests/research-analysis-skills.test.mjs` and confirm it fails before the skills exist.**

### Task 2: Write the portable skills

**Files:**
- Create: `skills/reading-research-paper/SKILL.md`
- Create: `skills/planning-paper-reimplementation/SKILL.md`
- Create: `skills/analyzing-experiment-results/SKILL.md`
- Create: `skills/creating-research-notebook/SKILL.md`

- [ ] **Step 1:** Document evidence-aware paper extraction with page/section references and uncertainty labels.
- [ ] **Step 2:** Document paper-to-code planning with scope, mapping, data, evaluation, tests, milestones, and risks.
- [ ] **Step 3:** Document result inspection, metric inference, repeated-run uncertainty, paper-ready tables/figures, and a reproducible notebook as the default deliverable.
- [ ] **Step 4:** Document notebook scaffolding, relative paths, top-to-bottom execution, optional dependencies, and validation.
- [ ] **Step 5:** Run the focused test and shared-content validator.

### Task 3: Update discovery documentation

**Files:**
- Modify: `skills/listing-research-skills/SKILL.md`
- Modify: `README.md`
- Modify: `tests/research-analysis-skills.test.mjs`

- [ ] **Step 1:** Make the library index enumerate the four new skills without inventing unavailable ones.
- [ ] **Step 2:** Add the analysis workflow and skill list to the README.
- [ ] **Step 3:** Run `npm run verify` and `git diff --check`.

### Task 4: Integrate and publish

**Files:**
- Commit only the planned tracked files.

- [ ] **Step 1:** Review the diff for portability, naming, and accidental platform-specific instructions.
- [ ] **Step 2:** Commit with `feat: add research analysis skills`.
- [ ] **Step 3:** Push `main` and verify the remote points at the new commit.
