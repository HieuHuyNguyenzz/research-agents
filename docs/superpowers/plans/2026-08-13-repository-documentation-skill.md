# Repository Documentation Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `docs-maintaining-repository`, a portable direct-write skill that audits six repository documentation targets, synchronizes stale facts with implementation evidence, and protects existing `AGENTS.md` policy.

**Architecture:** Implement one self-contained `SKILL.md` in the existing flat domain-prefixed catalog. A focused contract suite validates target responsibilities, evidence precedence, preservation rules, direct-write behavior, and the completion report; existing shared-content validation enforces portability. Discovery changes are isolated to the library index and README because all native adapters already expose the entire shared `skills/` directory.

**Tech Stack:** Agent Skills `SKILL.md`, Node.js 20 ESM, built-in `node:test`, Markdown documentation.

## Global Constraints

- Canonical ID, directory, and frontmatter are exactly `docs-maintaining-repository`.
- The description starts with `Use when` and contains trigger conditions only.
- Audit exactly `README.md`, `AGENTS.md`, `docs/architecture.md`, `docs/methodology.md`, `docs/experiments.md`, and `docs/reproduction.md` on every invocation.
- Create missing targets and update only incomplete, inaccurate, inconsistent, or stale targets; do not rewrite accurate files for style alone.
- Resolve factual conflicts using the approved evidence precedence; do not invent commands, APIs, dependencies, support status, architecture, research methods, experimental settings, results, citations, or provenance.
- Treat existing `AGENTS.md` instructions, policies, safety rules, and user-authored constraints as protected content that cannot be removed or weakened.
- Write only repository documentation unless the user explicitly requests an additional documentation target; do not modify code, config, tests, results, paper content, or global user files.
- Keep the shared skill agent-neutral and free of target-specific tool names.
- Keep all native compatibility rows unverified and all version-bearing manifests at `0.2.0`.
- Preserve unrelated untracked `.DS_Store`, `.superpowers/`, and legacy metadata-only directories.

---

### Task 1: Define and implement the documentation-maintenance contract

**Files:**
- Create: `tests/repository-documentation-skill.test.mjs`
- Create: `skills/docs-maintaining-repository/SKILL.md`
- Modify: `tests/skill-naming.test.mjs`
- Modify: `tests/release-contract.test.mjs`

**Interfaces:**
- Consumes: the existing flat `skills/<id>/SKILL.md` discovery contract and shared `validateSkillTree()` release check.
- Produces: one portable `docs-maintaining-repository` skill with a stable six-target audit and completion-report contract.

- [ ] **Step 1: Write a focused failing contract test**

Create `tests/repository-documentation-skill.test.mjs` with literal targets and
required responsibilities:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const SKILL_PATH = 'skills/docs-maintaining-repository/SKILL.md';
const TARGETS = {
  'README.md': ['purpose', 'setup', 'usage', 'compatibility'],
  'AGENTS.md': ['protected', 'policy', 'preserve'],
  'docs/architecture.md': ['components', 'boundaries', 'data', 'entry points'],
  'docs/methodology.md': ['method', 'assumptions', 'code', 'config'],
  'docs/experiments.md': ['datasets', 'baselines', 'metrics', 'seeds', 'ablations'],
  'docs/reproduction.md': ['environment', 'dependencies', 'commands', 'output paths']
};
const REPORT_FIELDS = ['Changed', 'Unchanged', 'Evidence', 'Conflicts', 'Unresolved', 'Validation'];

async function loadSkill() {
  return fs.readFile(SKILL_PATH, 'utf8');
}

test('docs-maintaining-repository audits the six documentation targets', async () => {
  const text = await loadSkill();
  assert.match(text, /^---\nname: docs-maintaining-repository\ndescription: Use when\b/m);
  assert.match(text, /complete repository|whole repository/i);
  for (const [target, phrases] of Object.entries(TARGETS)) {
    assert.equal(text.includes(`\`${target}\``), true, target);
    for (const phrase of phrases) assert.match(text, new RegExp(phrase, 'i'));
  }
  for (const status of ['missing', 'accurate', 'incomplete', 'stale', 'conflicting', 'not applicable']) {
    assert.match(text, new RegExp(`\`${status}\``));
  }
});

test('docs-maintaining-repository uses evidence precedence and direct scoped writes', async () => {
  const text = await loadSkill();
  const precedence = [
    'executable code', 'automated tests', 'entry points',
    'research artifacts', 'existing documentation', 'conversational context'
  ];
  let cursor = -1;
  for (const phrase of precedence) {
    const next = text.toLowerCase().indexOf(phrase, cursor + 1);
    assert.ok(next > cursor, `missing or reordered evidence source: ${phrase}`);
    cursor = next;
  }
  assert.match(text, /write directly|writes directly/i);
  assert.match(text, /create[^.]*missing/i);
  assert.match(text, /do not rewrite|leave[^.]*accurate[^.]*unchanged/i);
  assert.match(text, /do not modify[^.]*code[^.]*config[^.]*tests[^.]*results[^.]*paper/i);
});

test('docs-maintaining-repository protects policy and forbids unsupported facts', async () => {
  const text = await loadSkill();
  assert.match(text, /never (?:remove|delete)[^.]*policy|do not (?:remove|delete)[^.]*policy/i);
  assert.match(text, /do not (?:invent|fabricate)[^.]*commands/i);
  assert.match(text, /do not (?:invent|fabricate)[^.]*architecture/i);
  assert.match(text, /do not (?:invent|fabricate)[^.]*results/i);
  assert.match(text, /asks?[^.]*only when[^.]*blocks? an accurate edit/i);
});

test('docs-maintaining-repository reports the complete audit outcome', async () => {
  const text = await loadSkill();
  for (const field of REPORT_FIELDS) {
    assert.match(text, new RegExp(`\\*\\*${field}:\\*\\*`));
  }
  assert.match(text, /no write was needed|no changes? (?:were )?needed/i);
  assert.ok(text.split('\n').length < 500);
});
```

The production mutation caught by these tests is removal or weakening of a
required target, evidence source, safety rule, or report field.

- [ ] **Step 2: Add the canonical catalog entry to the naming test**

Insert `'docs-maintaining-repository'` into `CANONICAL` in
`tests/skill-naming.test.mjs`. Do not add it to `LEGACY`.

- [ ] **Step 3: Add the failing release-presence assertion**

Append this test to `tests/release-contract.test.mjs` while the skill file is
still absent:

```js
test('release includes the repository documentation skill without a version bump', async () => {
  const pkg = await json('package.json');
  const codex = await json('.codex-plugin/plugin.json');
  const claude = await json('.claude-plugin/plugin.json');

  assert.equal(pkg.version, '0.2.0');
  assert.equal(codex.version, '0.2.0');
  assert.equal(claude.version, '0.2.0');
  await fs.access('skills/docs-maintaining-repository/SKILL.md');
});
```

- [ ] **Step 4: Run focused tests and verify RED**

Run:

```bash
node --test tests/repository-documentation-skill.test.mjs tests/skill-naming.test.mjs tests/release-contract.test.mjs
```

Expected: FAIL because `skills/docs-maintaining-repository/SKILL.md` does not
exist, the exact catalog is missing the new directory, and the release-presence
assertion observes `ENOENT`.

- [ ] **Step 5: Create the minimal portable skill**

Create `skills/docs-maintaining-repository/SKILL.md` with this structure and
contract:

```markdown
---
name: docs-maintaining-repository
description: Use when repository documentation is missing, stale, inconsistent with implementation, or needs a complete accuracy audit.
---

Audit the complete repository and write documentation changes directly. Inspect
code, manifests, checked-in config, tests, workflows, entry points, scripts,
research artifacts, and existing documentation before editing.

Audit exactly these targets on every invocation:

- `README.md`: purpose, setup, usage, layout, compatibility, development commands, and deeper links.
- `AGENTS.md`: protected policy and instructions plus verified repository facts; preserve existing wording and never remove or weaken policy.
- `docs/architecture.md`: implemented components, boundaries, data/control flow, dependencies, and entry points.
- `docs/methodology.md`: implemented method, assumptions, objectives, and code/config mapping.
- `docs/experiments.md`: configured datasets, splits, methods, baselines, metrics, seeds, ablations, run matrix, and result paths.
- `docs/reproduction.md`: verified environment, dependencies, data preparation, commands, configuration, seeds, output paths, and validation.

Classify each target as `missing`, `accurate`, `incomplete`, `stale`,
`conflicting`, or `not applicable`. Create a missing target. Update an
incomplete, stale, or conflicting target. Leave an accurate target unchanged;
do not rewrite it for style alone.

Resolve facts in this order: executable code, package manifests, and checked-in
configuration; automated tests and workflows; entry points, scripts, and
generated structure; research artifacts and provenance; existing
documentation; conversational context. Use the higher-precedence evidence and
report corrected conflicts. Preserve equal-precedence ambiguity and ask only
when the missing choice blocks an accurate edit.

Do not invent commands, APIs, dependencies, support status, architecture,
methods, experimental settings, results, citations, or provenance. Do not
modify code, config, tests, results, paper content, or global user files. Update
existing sections instead of adding duplicates. Validate referenced local
paths, links, and safely checkable recorded commands.

Report:

- **Changed:** created or updated targets and reasons.
- **Unchanged:** accurate audited targets.
- **Evidence:** key supporting paths.
- **Conflicts:** corrected claims and authoritative sources.
- **Unresolved:** missing facts and equal-precedence ambiguity.
- **Validation:** checks run and observed results.

If every target is accurate, report that no write was needed.
```

Preserve the content contract exactly while wrapping long lines to match the
repository's Markdown style. Do not mention target-platform tool names.

- [ ] **Step 6: Verify GREEN and commit**

Run:

```bash
node --test tests/repository-documentation-skill.test.mjs tests/skill-naming.test.mjs tests/release-contract.test.mjs
npm run check:content
git diff --check
```

Expected: focused tests and shared-content validation pass; diff check is
silent.

```bash
git add skills/docs-maintaining-repository/SKILL.md tests/repository-documentation-skill.test.mjs tests/skill-naming.test.mjs tests/release-contract.test.mjs
git commit -m "feat: add repository documentation skill"
```

---

### Task 2: Expose the skill in the catalog and README

**Files:**
- Modify: `tests/repository-documentation-skill.test.mjs`
- Modify: `skills/research-listing-skills/SKILL.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: canonical ID `docs-maintaining-repository` and its six-target direct-write behavior from Task 1.
- Produces: a `Docs` catalog group and one user-facing natural-language invocation example.

- [ ] **Step 1: Add a failing discovery test**

Append:

```js
test('catalog and README expose repository documentation maintenance', async () => {
  const [catalog, readme] = await Promise.all([
    fs.readFile('skills/research-listing-skills/SKILL.md', 'utf8'),
    fs.readFile('README.md', 'utf8')
  ]);
  assert.match(catalog, /Docs:[\s\S]*`docs-maintaining-repository`/);
  assert.match(catalog, /audit|synchroniz|maintain/i);
  assert.match(readme, /`docs-maintaining-repository`/);
  assert.match(readme, /README\.md[\s\S]*AGENTS\.md[\s\S]*docs\//i);
  assert.match(readme, /Update the repository documentation from the current code and configs\./);
});
```

This fails when users cannot discover the installed capability even though the
skill directory exists.

- [ ] **Step 2: Run the discovery test and verify RED**

Run: `node --test tests/repository-documentation-skill.test.mjs`

Expected: the four existing contract tests pass and the new discovery test
fails because neither active document contains the canonical ID.

- [ ] **Step 3: Add the Docs catalog group**

In `skills/research-listing-skills/SKILL.md`, add this group after `Research`
and before `Paper`:

```markdown
Docs:

- `docs-maintaining-repository`: audit and synchronize the repository's primary
  human and agent documentation with implementation evidence.
```

- [ ] **Step 4: Document the workflow in README**

Add a `Repository documentation` section after `Research workflow`:

```markdown
## Repository documentation

Use `docs-maintaining-repository` to audit `README.md`, `AGENTS.md`, and the
primary files under `docs/` against the current code, config, tests, workflows,
and research artifacts. It writes only missing or stale documentation and
preserves existing agent policies.

Ask naturally: `Update the repository documentation from the current code and configs.`
```

- [ ] **Step 5: Verify GREEN and commit**

Run:

```bash
node --test tests/repository-documentation-skill.test.mjs
npm run check:content
npm run verify
git diff --check
git status --short
```

Expected: all documentation-skill tests and the complete release gate pass,
shared content remains portable, diff check is silent, and unrelated metadata
remains untracked.

```bash
git add README.md skills/research-listing-skills/SKILL.md tests/repository-documentation-skill.test.mjs
git commit -m "docs: expose repository documentation skill"
```
