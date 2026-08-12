# Paper Writing Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add seven portable paper-writing skills that write evidence-grounded LaTeX sections directly into an initialized research repository and review the complete manuscript without making unrequested edits.

**Architecture:** Each skill is one concise `SKILL.md` in the flat `skills/` namespace. Six section writers share a common contract expressed in each file and target one canonical `paper/sections/*.tex`; the review skill inspects the full paper and reports structured findings without modifying files. Tests validate frontmatter, naming, direct-write targets, evidence/citation safeguards, and library discoverability; no runtime adapter changes are needed because adapters already expose the shared `skills/` directory.

**Tech Stack:** Markdown skill contracts, Node.js 20 test runner, existing `scripts/lib/content.mjs` shared-content validator, existing research repository layout.

## Global Constraints

- Skill names use lowercase hyphen-case and match their directories.
- Frontmatter descriptions begin with `Use when` and describe only triggering conditions.
- Writing skills write directly to their canonical section file and preserve unrelated content.
- The review skill reports findings and does not modify files unless the user explicitly asks for fixes afterward.
- Skills may read the whole repository, but must not manufacture numbers, citations, datasets, baselines, statistical claims, or implementation details.
- Use only citation keys already in `paper/references.bib` unless the user explicitly supplies or requests a new source.
- Keep LaTeX valid, preserve existing terminology/notation/venue style, and report missing inputs and validation status.
- Shared skills must not name target-specific tools or add README/install files inside skill directories.

## File map

| File | Responsibility |
| --- | --- |
| `skills/writing-paper-abstract/SKILL.md` | Write or revise the abstract section. |
| `skills/writing-paper-introduction/SKILL.md` | Write or revise problem framing, gap, contributions, and organization. |
| `skills/writing-paper-related-work/SKILL.md` | Organize and compare cited literature using existing bibliography keys. |
| `skills/writing-paper-methodology/SKILL.md` | Explain formulation, method, algorithm, and implementation details from repo evidence. |
| `skills/writing-paper-experimental-results/SKILL.md` | Write protocol, results, uncertainty, and evidence-grounded interpretation. |
| `skills/writing-paper-conclusion/SKILL.md` | Synthesize supported findings, limitations, implications, and future work. |
| `skills/reviewing-research-paper/SKILL.md` | Review the complete manuscript and report structured findings without edits. |
| `tests/paper-writing-skills.test.mjs` | Contract and discoverability tests for all seven skills. |
| `skills/listing-research-skills/SKILL.md` | Enumerate the expanded paper-writing library. |
| `README.md` | Document the paper-writing workflow and natural-language examples. |

---

### Task 1: Add the failing paper-writing skill contract

**Files:**
- Create: `tests/paper-writing-skills.test.mjs`

**Interfaces:**
- Consumes: canonical skill names and target paths from this plan.
- Produces: `PAPER_SKILLS`, a test-local map of skill name, target path, and required contract phrases.

- [ ] **Step 1: Write the failing contract test.**

```js
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const PAPER_SKILLS = {
  'writing-paper-abstract': ['paper/sections/abstract.tex', 'abstract', 'evidence', 'citation'],
  'writing-paper-introduction': ['paper/sections/introduction.tex', 'introduction', 'gap', 'contributions'],
  'writing-paper-related-work': ['paper/sections/related-work.tex', 'related work', 'citation', 'bibliography'],
  'writing-paper-methodology': ['paper/sections/methodology.tex', 'methodology', 'code', 'algorithm'],
  'writing-paper-experimental-results': ['paper/sections/experimental-results.tex', 'experimental results', 'metrics', 'uncertainty'],
  'writing-paper-conclusion': ['paper/sections/conclusion.tex', 'conclusion', 'limitations', 'future work'],
  'reviewing-research-paper': ['paper/', 'review', 'blocking', 'important', 'minor', 'does not modify']
};

for (const [name, phrases] of Object.entries(PAPER_SKILLS)) {
  test(`${name} has the paper-writing contract`, async () => {
    const text = await fs.readFile(path.join('skills', name, 'SKILL.md'), 'utf8');
    assert.match(text, new RegExp(`^name: ${name}$`, 'm'));
    assert.match(text, /^description: Use when\b/m);
    assert.ok(text.split('\n').length < 500);
    for (const phrase of phrases) assert.match(text, new RegExp(phrase, 'i'));
    assert.match(text, /direct|write/i);
    assert.match(text, /preserv|existing/i);
    assert.match(text, /missing|do not invent|must not/i);
    assert.doesNotMatch(text, /`(bash|webfetch|apply_patch|Bash|Read|Task)`/i);
  });
}

test('paper-writing skills are discoverable in the library and README', async () => {
  const index = await fs.readFile('skills/listing-research-skills/SKILL.md', 'utf8');
  const readme = await fs.readFile('README.md', 'utf8');
  for (const name of Object.keys(PAPER_SKILLS)) {
    assert.match(index, new RegExp(name));
    assert.match(readme, new RegExp(name));
  }
});
```

- [ ] **Step 2: Run the focused test to verify it fails because the seven skill files do not exist.**

Run: `node --test tests/paper-writing-skills.test.mjs`

Expected: FAIL with `ENOENT` for the first missing `SKILL.md`.

### Task 2: Write the six section-writing skills

**Files:**
- Create: `skills/writing-paper-abstract/SKILL.md`
- Create: `skills/writing-paper-introduction/SKILL.md`
- Create: `skills/writing-paper-related-work/SKILL.md`
- Create: `skills/writing-paper-methodology/SKILL.md`
- Create: `skills/writing-paper-experimental-results/SKILL.md`
- Create: `skills/writing-paper-conclusion/SKILL.md`

**Interfaces:**
- Consumes: repository context, existing section content, and the shared contract in the spec.
- Produces: direct edits to the canonical section target named in the skill; a final report containing changed files, evidence, assumptions, unresolved citations, and validation status.

- [ ] **Step 1: Give every skill identical safety and edit instructions.**

Each file must state: inspect the whole repository and existing target first; write directly to the target; create it if absent; preserve unrelated content; update an existing section instead of appending duplicates; use existing citation keys only; mark missing evidence; keep LaTeX valid; report changes and validation.

- [ ] **Step 2: Add section-specific writing guidance.**

Use these exact responsibilities:

```text
abstract: problem, gap, method, evaluation setting, supported principal result, conclusion; no citations or unsupported numbers.
introduction: importance, gap, approach, traceable contributions, organization preview.
related-work: thematic organization, cited comparisons, existing bibliography keys, positioning of current work.
methodology: formulation, assumptions, data flow, model/algorithm, objective, training/inference, implementation details from code/configs.
experimental-results: protocol, datasets, baselines, metrics, seeds/repetitions, reported values, uncertainty, tables/figures versus interpretation.
conclusion: supported answer, conservative implications, limitations, grounded future work; no new evidence or citations.
```

- [ ] **Step 3: Run focused paper-writing tests and shared-content validation.**

Run: `node --test tests/paper-writing-skills.test.mjs && npm run check:content`

Expected: all six writer tests and content checks PASS.

### Task 3: Write the paper review skill

**Files:**
- Create: `skills/reviewing-research-paper/SKILL.md`
- Modify: `tests/paper-writing-skills.test.mjs`

**Interfaces:**
- Consumes: complete `paper/`, repository evidence, bibliography, template, code/configs/results.
- Produces: structured findings with severity exactly `blocking`, `important`, or `minor`; each finding has location, evidence, and concrete recommendation; no file edits.

- [ ] **Step 1: Add review-specific regression assertions.**

Assert the review skill contains the complete-paper scope, checks correctness, completeness, coherence, venue fit, reproducibility, citations, LaTeX, and consistency with code/configs/results; requires severity/location/evidence/recommendation; and explicitly says it does not modify files.

- [ ] **Step 2: Write the review workflow.**

Require a pass over section ordering and includes, citation-key resolution, terminology consistency, claims versus result artifacts, method versus implementation, and missing reproducibility details. Require a concise summary followed by findings ordered by severity. Instruct the skill to stop at review output until the user requests fixes.

- [ ] **Step 3: Run focused tests.**

Run: `node --test tests/paper-writing-skills.test.mjs`

Expected: 8 tests PASS (seven skill contracts plus discoverability).

### Task 4: Update library and README discovery

**Files:**
- Modify: `skills/listing-research-skills/SKILL.md`
- Modify: `README.md`
- Modify: `tests/paper-writing-skills.test.mjs`

**Interfaces:**
- Consumes: the seven canonical skill names and section targets.
- Produces: a discoverable paper-writing workflow with examples that point to `paper/sections/` and review behavior.

- [ ] **Step 1: Add all seven skills to the library index.**

List each name with a one-line capability and state that writing skills edit their section directly while review only reports findings.

- [ ] **Step 2: Add a README paper-writing workflow.**

Document the sequence `reading-research-paper` → section writers → `analyzing-experiment-results` → `reviewing-research-paper`, list the seven names, and include a natural-language example such as `Write the methodology section from the current code and configs.`

- [ ] **Step 3: Assert discovery and direct-write targets.**

Keep the test map target paths and require every writer skill to mention its exact canonical `.tex` path; require the review skill to mention `paper/` and no automatic modification.

- [ ] **Step 4: Run the complete verification gate.**

Run: `npm run verify && git diff --check`

Expected: content validation, the full Node test suite, integration tests, and diff check all PASS.

### Task 5: Review, commit, and publish

**Files:**
- Commit only the planned skill, test, README, library, and plan files.

- [ ] **Step 1: Review the diff for evidence safety.**

Run: `git diff --stat`, `git diff --check`, and `rg -n "webfetch|apply_patch|bash|Bash|Read|Task" skills/writing-paper-* skills/reviewing-research-paper`.

Expected: no target-specific tool names in shared skills and no whitespace errors.

- [ ] **Step 2: Commit the implementation.**

```bash
git add README.md skills/listing-research-skills/SKILL.md skills/writing-paper-abstract skills/writing-paper-introduction skills/writing-paper-related-work skills/writing-paper-methodology skills/writing-paper-experimental-results skills/writing-paper-conclusion skills/reviewing-research-paper tests/paper-writing-skills.test.mjs docs/superpowers/plans/2026-08-12-paper-writing-skills.md
git commit -m "feat: add paper writing skills"
```

- [ ] **Step 3: Push `main` and verify the remote SHA.**

```bash
git push origin main
git ls-remote --heads origin main
```

Expected: `origin/main` equals the new local commit; unrelated `.DS_Store` and `.superpowers/` scratch files remain untracked and unstaged.

## Self-review checklist

- Spec coverage: all seven skills, direct-write behavior, whole-repository context, evidence/citation safeguards, review-only behavior, validation, library discovery, and README workflow have explicit tasks.
- Placeholder scan: no unresolved placeholder markers or vague “write tests” steps; every task includes paths, behavior, and commands.
- Interface consistency: writer targets are exact `.tex` paths; review output severity values are fixed; the test map is the shared contract consumed by Tasks 2–4.
