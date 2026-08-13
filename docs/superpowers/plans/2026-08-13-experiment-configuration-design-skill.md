# Experiment Configuration Design Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `experiments-designing-configurations`, a portable skill that collaborates with users to define a scientifically complete experiment matrix, then writes confirmed repository-native configs and `docs/experiments.md` without running the full experiments.

**Architecture:** Implement one self-contained `SKILL.md` in the existing flat domain-prefixed catalog. A focused Node contract suite locks inspection, one-question collaboration, matrix shape, confirmation, config boundaries, blocked gaps, conflicts, validation, and completion reporting; existing shared-content validation supplies portability checks. Discovery changes remain isolated to the skill library and README because every native adapter already exposes the complete shared `skills/` directory.

**Tech Stack:** Agent Skills `SKILL.md`, Node.js 20 ESM, built-in `node:test`, Markdown documentation.

## Global Constraints

- Canonical ID, directory, and frontmatter are exactly `experiments-designing-configurations`.
- The description starts with `Use when` and contains trigger conditions only.
- Inspect repository instructions, paper, bibliography, docs, code, configs, tests, entry points, and results before asking questions.
- Ask one question at a time only for missing or conflicting decisions that affect the matrix or runnable config.
- Design both `core` and `supplementary` evidence; do not remove experiments automatically because of compute cost.
- Ask permission before web search, prefer primary or official sources, and record provenance for external evidence.
- Present the complete matrix, assumptions, run counts, blocked gaps, target paths, conflicts, and provenance; write only after explicit confirmation.
- Write only `docs/experiments.md` and runnable configs under `src/configs/baselines/`, `src/configs/proposed/`, `src/configs/ablations/`, or `src/configs/experiments/`.
- Follow verified repository-native format, schema, inheritance, composition, and naming; if format has no reliable example, ask the user to choose it.
- Format selection does not establish runnability. If parser, accepted keys, schema, or execution path cannot be verified, document the experiment as `blocked` and create no speculative config.
- Resolve every semantic file conflict explicitly as `preserve`, `merge`, or `overwrite`; do not apply a blanket answer to unlisted conflicts.
- Validate parsing, schema, paths, composition, IDs, documentation/config consistency, and run counts; use only a verified safe dry-run or bounded smoke test.
- Do not modify code, tests, dependencies, data, results, paper content, or infrastructure, and do not run training, full evaluation, sweeps, or result analysis.
- Keep the shared skill agent-neutral and free of target-specific tool names.
- Keep all native compatibility rows unverified and all version-bearing manifests at `0.2.0`.
- Preserve unrelated untracked `.DS_Store`, `.superpowers/`, and legacy metadata-only directories.

---

### Task 1: Define and implement the experiment-design contract

**Files:**
- Create: `tests/experiment-configuration-skill.test.mjs`
- Create: `skills/experiments-designing-configurations/SKILL.md`
- Modify: `tests/skill-naming.test.mjs:7-23`
- Modify: `tests/release-contract.test.mjs:39-48`

**Interfaces:**
- Consumes: the flat `skills/<canonical-id>/SKILL.md` discovery contract and the repository-wide shared-content validator.
- Produces: one portable `experiments-designing-configurations` skill with a stable inspect, collaborate, confirm, write, conflict, validate, and report contract.

- [ ] **Step 1: Write the focused failing contract suite**

Create `tests/experiment-configuration-skill.test.mjs`:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const SKILL_PATH = 'skills/experiments-designing-configurations/SKILL.md';
const CONFIG_ROOTS = [
  'src/configs/baselines/',
  'src/configs/proposed/',
  'src/configs/ablations/',
  'src/configs/experiments/'
];
const MATRIX_FIELDS = [
  'unique ID', 'tier', 'claim', 'method', 'baseline', 'dataset', 'split',
  'metric', 'direction', 'seeds', 'repetitions', 'independent variables',
  'controlled variables', 'config paths', 'expected artifacts',
  'dependencies', 'rationale', 'run count', 'status'
];
const REPORT_FIELDS = [
  'Changed', 'Matrix', 'Blocked', 'Conflicts', 'Assumptions',
  'Provenance', 'Validation', 'Next commands'
];

async function loadSkill() {
  return fs.readFile(SKILL_PATH, 'utf8');
}

function compact(text) {
  return text.replace(/\s+/g, ' ');
}

test('experiments-designing-configurations inspects evidence before asking one question', async () => {
  const text = await loadSkill();
  const normalized = compact(text);

  assert.match(text, /^---\nname: experiments-designing-configurations\ndescription: Use when\b/m);
  for (const literal of [
    '`AGENTS.md`', '`README.md`', '`docs/`', '`paper/`',
    '`paper/references.bib`', 'code', 'configs', 'tests', 'results'
  ]) {
    assert.equal(text.includes(literal), true, literal);
  }
  const inspectAt = normalized.indexOf('Inspect the complete repository');
  const askAt = normalized.indexOf('Ask one question at a time');
  assert.ok(inspectAt >= 0 && askAt > inspectAt);
  assert.match(normalized, /Ask one question at a time[^.]*missing or conflicting/i);
  assert.match(normalized, /do not repeat a fixed questionnaire/i);
});

test('experiments-designing-configurations defines the complete scientific matrix', async () => {
  const text = await loadSkill();
  const normalized = compact(text);

  assert.match(text, /`core`/);
  assert.match(text, /`supplementary`/);
  for (const field of MATRIX_FIELDS) assert.match(normalized, new RegExp(field, 'i'));
  for (const dimension of ['robustness', 'sensitivity', 'efficiency', 'qualitative', 'failure']) {
    assert.match(text, new RegExp(dimension, 'i'));
  }
  assert.match(normalized, /do not remove[^.]*compute/i);
  assert.match(normalized, /Cartesian[^.]*run count/i);
  assert.match(text, /`ready`/);
  assert.match(text, /`blocked`/);
});

test('experiments-designing-configurations requires permission, confirmation, and scoped writes', async () => {
  const text = await loadSkill();
  const normalized = compact(text);

  assert.match(normalized, /ask[^.]*permission[^.]*before searching the web/i);
  assert.match(normalized, /prefer[^.]*primary[^.]*official/i);
  assert.match(normalized, /title or identifier[^.]*source URL[^.]*decision/i);
  assert.match(normalized, /write only after[^.]*explicitly confirms/i);
  assert.equal(text.includes('`docs/experiments.md`'), true);
  for (const root of CONFIG_ROOTS) assert.equal(text.includes(`\`${root}\``), true, root);
  assert.match(normalized, /follow[^.]*format[^.]*schema[^.]*inheritance[^.]*composition[^.]*naming/i);
  assert.match(normalized, /no reliable config example[^.]*ask[^.]*format/i);
});

test('experiments-designing-configurations blocks unsupported work and resolves conflicts per file', async () => {
  const text = await loadSkill();
  const normalized = compact(text);

  assert.match(normalized, /do not create[^.]*speculative[^.]*config/i);
  assert.match(normalized, /`blocked`[^.]*code gap[^.]*unblock/i);
  assert.match(normalized, /do not modify[^.]*code[^.]*tests[^.]*dependencies[^.]*data/i);
  for (const mode of ['`preserve`', '`merge`', '`overwrite`']) assert.match(text, new RegExp(mode));
  assert.match(normalized, /semantic[^.]*formatting[^.]*not[^.]*conflict/i);
  assert.match(normalized, /each conflicting file|each conflict/i);
  assert.match(normalized, /do not apply[^.]*blanket/i);
});

test('experiments-designing-configurations validates safely and reports the outcome', async () => {
  const text = await loadSkill();
  const normalized = compact(text);

  for (const check of ['parse', 'schema', 'referenced paths', 'duplicate IDs', 'run count', 'dry-run', 'smoke test']) {
    assert.match(normalized, new RegExp(check, 'i'));
  }
  assert.match(normalized, /do not run[^.]*training[^.]*full evaluation[^.]*sweep/i);
  assert.match(normalized, /do not analyze[^.]*results/i);
  for (const field of REPORT_FIELDS) assert.match(text, new RegExp(`\\*\\*${field}:\\*\\*`));
  assert.ok(text.split('\n').length < 500);
});
```

The production mutations caught by this suite are skipping repository evidence,
asking a generic questionnaire, dropping matrix dimensions, silently reducing
scientific coverage, searching without permission, writing without
confirmation, creating non-runnable configs, applying blanket conflict modes,
running full experiments, or omitting report fields.

- [ ] **Step 2: Add the canonical name and release-presence failures**

Insert `'experiments-designing-configurations'` in `CANONICAL`, immediately
after `'docs-maintaining-repository'`, in `tests/skill-naming.test.mjs`. Do not
add it to `LEGACY`.

Append this test to `tests/release-contract.test.mjs`:

```js
test('release includes experiment configuration design without a version bump', async () => {
  const pkg = await json('package.json');
  const codex = await json('.codex-plugin/plugin.json');
  const claude = await json('.claude-plugin/plugin.json');

  assert.equal(pkg.version, '0.2.0');
  assert.equal(codex.version, '0.2.0');
  assert.equal(claude.version, '0.2.0');
  await fs.access('skills/experiments-designing-configurations/SKILL.md');
});
```

- [ ] **Step 3: Run the focused suite and verify RED**

Run:

```bash
node --test tests/experiment-configuration-skill.test.mjs tests/skill-naming.test.mjs tests/release-contract.test.mjs
```

Expected: FAIL because
`skills/experiments-designing-configurations/SKILL.md` is absent, the exact
canonical directory set is missing the new skill, and the release-presence
test observes `ENOENT`. Existing release tests remain green.

- [ ] **Step 4: Create the minimal self-contained skill**

Create `skills/experiments-designing-configurations/SKILL.md`:

```markdown
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
`blocked` in `docs/experiments.md`, record the exact code gap and supporting
evidence, and state the condition required to unblock config creation. Do not
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
```

- [ ] **Step 5: Run focused GREEN checks**

Run:

```bash
node --test tests/experiment-configuration-skill.test.mjs tests/skill-naming.test.mjs tests/release-contract.test.mjs
npm run check:content
git diff --check
```

Expected: all focused tests pass, shared-content validation exits zero, and
`git diff --check` is silent. If a contract regex fails only because Markdown
wrapped a required phrase, make the skill wording explicit; do not weaken the
behavioral requirement.

- [ ] **Step 6: Review and commit Task 1**

Inspect only the task-owned diff and confirm the unrelated metadata remains
unstaged:

```bash
git diff -- skills/experiments-designing-configurations/SKILL.md tests/experiment-configuration-skill.test.mjs tests/skill-naming.test.mjs tests/release-contract.test.mjs
git status --short
git add skills/experiments-designing-configurations/SKILL.md tests/experiment-configuration-skill.test.mjs tests/skill-naming.test.mjs tests/release-contract.test.mjs
git commit -m "feat: add experiment configuration design skill"
```

---

### Task 2: Expose the skill in the catalog and README workflow

**Files:**
- Modify: `tests/experiment-configuration-skill.test.mjs`
- Modify: `skills/research-listing-skills/SKILL.md:41-44`
- Modify: `README.md:48-60`

**Interfaces:**
- Consumes: canonical ID and behavior from Task 1.
- Produces: an `Experiments` catalog group and a user-facing workflow position before result analysis.

- [ ] **Step 1: Add a failing discovery and workflow-order test**

Append to `tests/experiment-configuration-skill.test.mjs`:

```js
test('catalog and README expose experiment design before result analysis', async () => {
  const [catalog, readme] = await Promise.all([
    fs.readFile('skills/research-listing-skills/SKILL.md', 'utf8'),
    fs.readFile('README.md', 'utf8')
  ]);

  assert.match(catalog, /Experiments:[\s\S]*`experiments-designing-configurations`/);
  assert.match(catalog, /matrix|configurations/i);

  const workflow = readme.match(/## Research workflow\n([\s\S]*?)\n## Repository documentation/);
  assert.ok(workflow, 'README must contain a bounded research workflow section');
  const designAt = workflow[1].indexOf('`experiments-designing-configurations`');
  const analyzeAt = workflow[1].indexOf('`results-analyzing-experiments`');
  assert.ok(designAt >= 0 && analyzeAt > designAt);
  assert.match(workflow[1], /core[^.]*supplementary/i);
  assert.match(
    workflow[1],
    /Design the experiment matrix and configurations needed to support this paper\./
  );
});
```

This test catches an installed skill that users cannot discover, a misplaced
design step after result analysis, or a README that omits the approved natural
request and two-tier matrix behavior.

- [ ] **Step 2: Run discovery RED**

Run:

```bash
node --test tests/experiment-configuration-skill.test.mjs
```

Expected: the five Task 1 contract tests pass and the discovery test fails
because the catalog has no `Experiments` group and the README workflow has no
canonical design step.

- [ ] **Step 3: Add the catalog group**

In `skills/research-listing-skills/SKILL.md`, insert this group after `Paper`
and before `Results`:

```markdown
Experiments:

- `experiments-designing-configurations`: collaborate on a scientifically
  complete experiment matrix and materialize confirmed repository-native
  configurations.
```

- [ ] **Step 4: Update the README research workflow**

Replace the numbered sequence and example under `## Research workflow` with:

```markdown
After initialization, the shared research skills support this sequence:

1. `paper-reading` — build an evidence map from a paper.
2. `paper-planning-reimplementation` — map the paper to code, data, and tests.
3. `experiments-designing-configurations` — inspect repository evidence,
   brainstorm unresolved choices one at a time, and confirm a `core` plus
   `supplementary` experiment matrix before writing repository-native configs.
4. `results-analyzing-experiments` — inspect metrics, runs, baselines, and
   ablations under `results/` after experiments have been executed.
5. `notebook-creating-research` — produce a rerunnable notebook under
   `results/analysis/`.

Ask naturally: `Design the experiment matrix and configurations needed to support this paper.`

After execution, ask: `Analyze the experiment results in results/raw and prepare a paper-ready notebook.`
```

- [ ] **Step 5: Verify discovery GREEN and the complete release gate**

Run:

```bash
node --test tests/experiment-configuration-skill.test.mjs
npm run check:content
npm run verify
git diff --check
git status --short
```

Expected: the focused suite passes, the complete Node suite and initializer
integration suite report zero failures, shared content remains portable,
`git diff --check` is silent, and only Task 2 files plus preserved unrelated
metadata appear in status.

- [ ] **Step 6: Review and commit Task 2**

```bash
git diff -- README.md skills/research-listing-skills/SKILL.md tests/experiment-configuration-skill.test.mjs
git add README.md skills/research-listing-skills/SKILL.md tests/experiment-configuration-skill.test.mjs
git commit -m "docs: expose experiment configuration design"
```

---

## Final Verification

After both task commits, use `superpowers:verification-before-completion` and
run fresh verification against committed `HEAD`:

```bash
npm run verify
git diff --check
git status --short --branch
git log -4 --oneline --decorate
```

Confirm that all tests pass with zero failures, `main` contains both new task
commits, and the pre-existing metadata remains untracked and untouched. Then
use `superpowers:finishing-a-development-branch` to present the integration
choice appropriate to the current workspace.
