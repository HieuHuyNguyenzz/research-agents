# Domain-Prefixed Skill Names Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 14 public skill IDs with portable domain-prefixed IDs and migrate every active adapter, import, test, and user-facing reference without compatibility aliases.

**Architecture:** Keep the existing flat `skills/` source of truth and encode grouping in each lowercase kebab-case directory name. Migrate one domain at a time while preserving every skill body and behavioral contract; bootstrap adapters and the initializer root wrappers continue to reference the shared files directly. Finish with one exact-catalog gate, a `0.2.0` version bump, and clean-session migration guidance.

**Tech Stack:** Agent Skills `SKILL.md`, Node.js 20 ESM, built-in `node:test`, Bash hook, Codex/Claude Code/OpenCode plugin manifests.

## Global Constraints

- Canonical grammar: `<domain>-<action>[-<object>]`.
- Canonical names must match `^[a-z0-9]+(-[a-z0-9]+)*$`, contain at most 64 characters, and equal the parent directory name.
- Supported domain prefixes are exactly `research`, `paper`, `results`, and `notebook`.
- Keep a single flat `skills/<canonical-id>/SKILL.md` namespace; do not create nested namespace directories.
- Do not use literal colons in canonical IDs, directories, or invocation examples.
- Do not retain compatibility aliases or duplicate skill bodies under legacy paths.
- Preserve all existing skill behavior, generated project structure, and IEEE template handling.
- Keep shared skills agent-neutral and free of target-specific tool names.
- Advance every version-bearing package/plugin manifest from `0.1.0` to `0.2.0`.
- Do not mark any native coding-agent compatibility row verified without recorded clean-session smoke evidence.
- Preserve unrelated untracked `.DS_Store` and `.superpowers/` artifacts.

---

### Task 1: Enforce the portable skill-name contract

**Files:**
- Modify: `scripts/lib/content.mjs`
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Consumes: `validateSkill(relativePath: string, markdown: string): string[]` and `validateSkillTree(rootDir: string): Promise<string[]>`.
- Produces: validation for the Agent Skills name regex, 64-character limit, directory/frontmatter equality, and safe omission of directories that contain no `SKILL.md`.

- [ ] **Step 1: Add failing unit tests for invalid and mismatched names**

Append tests that exercise the public validator directly:

```js
test('rejects non-portable and mismatched skill names', () => {
  assert.deepEqual(
    validateSkill('skills/writing/SKILL.md', '---\nname: writing:paper\ndescription: Use when writing.\n---\n\nWrite.'),
    [
      'skills/writing/SKILL.md: name must match ^[a-z0-9]+(-[a-z0-9]+)*$',
      'skills/writing/SKILL.md: name must match parent directory: writing'
    ]
  );
  assert.deepEqual(
    validateSkill('skills/paper-writing/SKILL.md', '---\nname: paper-reviewing\ndescription: Use when reviewing.\n---\n\nReview.'),
    ['skills/paper-writing/SKILL.md: name must match parent directory: paper-writing']
  );
});

test('rejects skill names longer than 64 characters', () => {
  const name = `paper-${'a'.repeat(59)}`;
  assert.deepEqual(
    validateSkill(`skills/${name}/SKILL.md`, `---\nname: ${name}\ndescription: Use when testing.\n---\n\nTest.`),
    [`skills/${name}/SKILL.md: name must be at most 64 characters`]
  );
});
```

- [ ] **Step 2: Add a failing tree test for a non-skill metadata directory**

Create a temporary `skills/metadata-only/` directory without `SKILL.md`, invoke
`validateSkillTree`, and assert that it returns `[]`. Clean the temporary root
in `finally`. This protects local legacy directories that may remain only
because an ignored `.DS_Store` was not deleted.

Add `node:fs/promises`, `node:os`, and `node:path` imports, then add:

```js
test('ignores directories without SKILL.md', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'skill-tree-'));
  try {
    await fs.mkdir(path.join(root, 'skills', 'metadata-only'), { recursive: true });
    assert.deepEqual(await validateSkillTree(root), []);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
```

- [ ] **Step 3: Run the focused tests and confirm RED**

Run: `node --test tests/content.test.mjs`

Expected: FAIL because `validateSkill` does not validate names and
`validateSkillTree` currently tries to read every child directory.

- [ ] **Step 4: Implement the minimal validation**

Add these checks after required-field validation in `validateSkill`:

```js
const SKILL_NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const name = parsed.attributes.get('name');
if (name) {
  if (name.length > 64) errors.push(`${relativePath}: name must be at most 64 characters`);
  if (!SKILL_NAME_PATTERN.test(name)) {
    errors.push(`${relativePath}: name must match ^[a-z0-9]+(-[a-z0-9]+)*$`);
  }
  const parent = path.basename(path.dirname(relativePath));
  if (name !== parent) errors.push(`${relativePath}: name must match parent directory: ${parent}`);
}
```

In `validateSkillTree`, catch only `ENOENT` from reading a child
`SKILL.md` and continue; rethrow every other filesystem error:

```js
let markdown;
try {
  markdown = await fs.readFile(file, 'utf8');
} catch (error) {
  if (error.code === 'ENOENT') continue;
  throw error;
}
```

- [ ] **Step 5: Verify and commit the validator**

Run: `node --test tests/content.test.mjs && npm run check:content`

Expected: all focused tests pass and the existing catalog remains valid.

```bash
git add scripts/lib/content.mjs tests/content.test.mjs
git commit -m "test: enforce portable skill names"
```

---

### Task 2: Rename research-core and initializer skills

**Files:**
- Rename: `skills/using-research-skills/SKILL.md` → `skills/research-using-skills/SKILL.md`
- Rename: `skills/listing-research-skills/SKILL.md` → `skills/research-listing-skills/SKILL.md`
- Rename: `skills/initializing-research-project/SKILL.md` → `skills/research-initializing-project/SKILL.md`
- Rename: `skills/initializing-research-project/scripts/` → `skills/research-initializing-project/scripts/`
- Modify: `.opencode/plugins/research-agents.js`
- Modify: `hooks/session-start`
- Modify: `scripts/init-project.mjs`
- Modify: `scripts/lib/init/manifest.mjs`
- Modify: `scripts/lib/init/paths.mjs`
- Modify: `scripts/lib/init/render.mjs`
- Modify: `scripts/lib/init/templates-fetch.mjs`
- Modify: `scripts/lib/init/templates.mjs`
- Modify: `tests/claude-artifact.test.mjs`
- Modify: `tests/opencode-plugin.test.mjs`
- Modify: `tests/init-skill.test.mjs`
- Modify: `tests/init-integration.test.mjs`
- Modify: `tests/release-contract.test.mjs`
- Modify: `tests/research-analysis-skills.test.mjs`
- Modify: `tests/paper-writing-skills.test.mjs`
- Modify: `tests/skill-naming.test.mjs`

**Interfaces:**
- Consumes: the existing initializer CLI exports `main()` and `runInit()` and the shared bootstrap body.
- Produces: `skills/research-initializing-project/scripts/init-project.mjs` with unchanged exports, plus bootstrap discovery through `research-using-skills` and catalog discovery through `research-listing-skills`.

- [ ] **Step 1: Change focused tests to the three new IDs**

Replace core path/name expectations with:

```js
const CORE = [
  'research-using-skills',
  'research-listing-skills',
  'research-initializing-project'
];
```

Update initializer tests to read/copy
`skills/research-initializing-project`, Claude/OpenCode tests to look for
`research-using-skills`, release tests to require the renamed initializer, and
paper/analysis discovery tests to read
`skills/research-listing-skills/SKILL.md`.

- [ ] **Step 2: Run focused tests and confirm RED**

Run:

```bash
node --test tests/skill-naming.test.mjs tests/init-skill.test.mjs tests/init-integration.test.mjs tests/claude-artifact.test.mjs tests/opencode-plugin.test.mjs tests/release-contract.test.mjs
```

Expected: FAIL with missing renamed skill paths or legacy bootstrap text.

- [ ] **Step 3: Move only tracked skill content**

Create destination directories and move tracked files so ignored metadata in a
legacy directory is not deleted or moved:

```bash
mkdir -p skills/research-using-skills skills/research-listing-skills skills/research-initializing-project
git mv skills/using-research-skills/SKILL.md skills/research-using-skills/SKILL.md
git mv skills/listing-research-skills/SKILL.md skills/research-listing-skills/SKILL.md
git mv skills/initializing-research-project/SKILL.md skills/research-initializing-project/SKILL.md
git mv skills/initializing-research-project/scripts skills/research-initializing-project/scripts
```

- [ ] **Step 4: Update frontmatter, bootstrap paths, sentinels, and root exports**

Set the three frontmatter names exactly to their destination directory names.
Change both adapter bootstrap paths and message sentinels from
`using-research-skills` to `research-using-skills`. Change every root initializer
import/re-export from `skills/initializing-research-project/` to
`skills/research-initializing-project/`; keep exported function names and CLI
arguments unchanged.

Apply this exact replacement set:

```text
using-research-skills             -> research-using-skills
listing-research-skills           -> research-listing-skills
initializing-research-project     -> research-initializing-project
skills/initializing-research-project/ -> skills/research-initializing-project/
```

- [ ] **Step 5: Update the library's three core entries**

In `research-listing-skills`, replace only the three core IDs in this task. Keep
the other 11 legacy IDs temporarily so Tasks 3 and 4 can migrate them with their
own focused tests.

- [ ] **Step 6: Verify behavior and commit**

Run the focused command from Step 2, then run `npm run verify`.

Expected: all tests pass; standalone initializer execution still succeeds from
an unrelated working directory.

```bash
git add .opencode/plugins/research-agents.js hooks/session-start scripts/init-project.mjs scripts/lib/init/*.mjs
git add skills/research-using-skills skills/research-listing-skills skills/research-initializing-project
git add tests/claude-artifact.test.mjs tests/opencode-plugin.test.mjs tests/init-skill.test.mjs tests/init-integration.test.mjs tests/release-contract.test.mjs tests/research-analysis-skills.test.mjs tests/paper-writing-skills.test.mjs tests/skill-naming.test.mjs
git commit -m "refactor: rename research core skills"
```

---

### Task 3: Rename the complete paper domain

**Files:**
- Rename: `skills/reading-research-paper/` → `skills/paper-reading/`
- Rename: `skills/planning-paper-reimplementation/` → `skills/paper-planning-reimplementation/`
- Rename: `skills/writing-paper-abstract/` → `skills/paper-writing-abstract/`
- Rename: `skills/writing-paper-introduction/` → `skills/paper-writing-introduction/`
- Rename: `skills/writing-paper-related-work/` → `skills/paper-writing-related-work/`
- Rename: `skills/writing-paper-methodology/` → `skills/paper-writing-methodology/`
- Rename: `skills/writing-paper-experimental-results/` → `skills/paper-writing-experimental-results/`
- Rename: `skills/writing-paper-conclusion/` → `skills/paper-writing-conclusion/`
- Rename: `skills/reviewing-research-paper/` → `skills/paper-reviewing/`
- Modify: `skills/research-listing-skills/SKILL.md`
- Modify: `README.md`
- Modify: `docs/paper-writing.md`
- Modify: `docs/install/codex.md`
- Modify: `docs/install/claude-code.md`
- Modify: `docs/install/opencode.md`
- Modify: `tests/research-analysis-skills.test.mjs`
- Modify: `tests/paper-writing-skills.test.mjs`
- Modify: `tests/paper-writing-docs.test.mjs`
- Modify: `tests/skill-naming.test.mjs`

**Interfaces:**
- Consumes: the nine existing paper skill bodies and their established evidence, citation, direct-write, alternate-layout, and review-only contracts.
- Produces: nine paper-prefixed skill IDs with byte-for-byte-equivalent workflow behavior apart from canonical-name references.

- [ ] **Step 1: Replace paper constants and fixtures in focused tests**

Use this exact test mapping:

```js
const PAPER_IDS = [
  'paper-reading',
  'paper-planning-reimplementation',
  'paper-writing-abstract',
  'paper-writing-introduction',
  'paper-writing-related-work',
  'paper-writing-methodology',
  'paper-writing-experimental-results',
  'paper-writing-conclusion',
  'paper-reviewing'
];
```

Update fixture frontmatter, citation-capable writer sets, review constants,
workflow-order assertions, and guide/install documentation expectations. Do not
weaken any behavioral regex or path assertion.

- [ ] **Step 2: Run paper-focused tests and confirm RED**

Run:

```bash
node --test tests/paper-writing-skills.test.mjs tests/paper-writing-docs.test.mjs tests/research-analysis-skills.test.mjs tests/skill-naming.test.mjs
```

Expected: FAIL because the nine new paper directories do not exist.

- [ ] **Step 3: Rename the nine directories and frontmatter names**

Move each directory according to `PAPER_IDS`, then set every `name:` field to
the new directory basename. In `paper-reading`, change its recommendation from
`planning-paper-reimplementation` to `paper-planning-reimplementation`.

```bash
git mv skills/reading-research-paper skills/paper-reading
git mv skills/planning-paper-reimplementation skills/paper-planning-reimplementation
git mv skills/writing-paper-abstract skills/paper-writing-abstract
git mv skills/writing-paper-introduction skills/paper-writing-introduction
git mv skills/writing-paper-related-work skills/paper-writing-related-work
git mv skills/writing-paper-methodology skills/paper-writing-methodology
git mv skills/writing-paper-experimental-results skills/paper-writing-experimental-results
git mv skills/writing-paper-conclusion skills/paper-writing-conclusion
git mv skills/reviewing-research-paper skills/paper-reviewing
```

- [ ] **Step 4: Update catalog and user-facing workflow references**

Replace all nine paper IDs in `research-listing-skills`, README, the full
paper-writing guide, and each installation page. Group the catalog entries under
a `Paper` heading and keep this order: reading, planning, six section writers,
review.

- [ ] **Step 5: Verify unchanged contracts and commit**

Run the focused command from Step 2, `npm run check:content`, and
`npm run verify`.

Expected: every paper writer/reviewer contract and documentation contract
passes under the new IDs.

```bash
git add skills/paper-* skills/research-listing-skills/SKILL.md README.md docs/paper-writing.md docs/install/*.md
git add tests/research-analysis-skills.test.mjs tests/paper-writing-skills.test.mjs tests/paper-writing-docs.test.mjs tests/skill-naming.test.mjs
git commit -m "refactor: rename paper skills"
```

---

### Task 4: Rename results-analysis and notebook skills

**Files:**
- Rename: `skills/analyzing-experiment-results/` → `skills/results-analyzing-experiments/`
- Rename: `skills/creating-research-notebook/` → `skills/notebook-creating-research/`
- Modify: `skills/research-listing-skills/SKILL.md`
- Modify: `README.md`
- Modify: `docs/paper-writing.md`
- Modify: `tests/research-analysis-skills.test.mjs`
- Modify: `tests/paper-writing-skills.test.mjs`
- Modify: `tests/skill-naming.test.mjs`

**Interfaces:**
- Consumes: current results-analysis and notebook behavior, including the notebook output and reproducibility contracts.
- Produces: `results-analyzing-experiments` and `notebook-creating-research` with unchanged task behavior.

- [ ] **Step 1: Change focused test constants and workflow assertions**

Replace the two legacy keys with:

```js
'results-analyzing-experiments': [
  'results', 'metrics', 'baseline', 'repeated', 'uncertainty', 'notebook', 'figures'
],
'notebook-creating-research': [
  'notebook', 'relative paths', 'top-to-bottom', 'optional', 'validate'
]
```

Update the paper workflow assertion to place
`results-analyzing-experiments` after all writers and before `paper-reviewing`.

- [ ] **Step 2: Run focused tests and confirm RED**

Run:

```bash
node --test tests/research-analysis-skills.test.mjs tests/paper-writing-skills.test.mjs tests/skill-naming.test.mjs
```

Expected: FAIL because both renamed directories are missing.

- [ ] **Step 3: Rename directories, frontmatter, catalog, and docs**

Move both skill directories, make `name:` equal the new basename, and update
the two IDs in `research-listing-skills`, README, and `docs/paper-writing.md`.
Group them under explicit `Results` and `Notebook` catalog headings.

```bash
git mv skills/analyzing-experiment-results skills/results-analyzing-experiments
git mv skills/creating-research-notebook skills/notebook-creating-research
```

The two destination frontmatter fields are exactly:

```yaml
name: results-analyzing-experiments
name: notebook-creating-research
```

- [ ] **Step 4: Verify behavior and commit**

Run the focused command from Step 2 and `npm run verify`.

Expected: all tests pass with unchanged analysis/notebook phrases and outputs.

```bash
git add skills/results-analyzing-experiments skills/notebook-creating-research skills/research-listing-skills/SKILL.md
git add README.md docs/paper-writing.md tests/research-analysis-skills.test.mjs tests/paper-writing-skills.test.mjs tests/skill-naming.test.mjs
git commit -m "refactor: rename results and notebook skills"
```

---

### Task 5: Lock the catalog, version, and migration contract

**Files:**
- Modify: `tests/skill-naming.test.mjs`
- Modify: `tests/release-contract.test.mjs`
- Modify: `tests/init-integration.test.mjs`
- Modify: `package.json`
- Modify: `.codex-plugin/plugin.json`
- Modify: `.claude-plugin/plugin.json`
- Modify: `docs/install/codex.md`
- Modify: `docs/install/claude-code.md`
- Modify: `docs/install/opencode.md`

**Interfaces:**
- Consumes: all 14 renamed skill directories from Tasks 2–4 and existing manifest-version equality checks.
- Produces: exact catalog enforcement, legacy-path rejection, synchronized `0.2.0` manifests, and clean-session upgrade guidance.

- [ ] **Step 1: Add the exact-catalog and legacy-path regression**

Replace the partial canonical list with all 14 IDs:

```js
const CANONICAL = [
  'research-using-skills',
  'research-listing-skills',
  'research-initializing-project',
  'paper-reading',
  'paper-planning-reimplementation',
  'paper-writing-abstract',
  'paper-writing-introduction',
  'paper-writing-related-work',
  'paper-writing-methodology',
  'paper-writing-experimental-results',
  'paper-writing-conclusion',
  'paper-reviewing',
  'results-analyzing-experiments',
  'notebook-creating-research'
];

const LEGACY = [
  'using-research-skills', 'listing-research-skills',
  'initializing-research-project', 'reading-research-paper',
  'planning-paper-reimplementation', 'writing-paper-abstract',
  'writing-paper-introduction', 'writing-paper-related-work',
  'writing-paper-methodology', 'writing-paper-experimental-results',
  'writing-paper-conclusion', 'reviewing-research-paper',
  'analyzing-experiment-results', 'creating-research-notebook'
];
```

Enumerate immediate `skills/` children that contain `SKILL.md` and assert their
sorted basenames equal sorted `CANONICAL`. For each legacy ID, assert that
`skills/<legacy>/SKILL.md` is inaccessible. Assert each canonical frontmatter
name, description prefix, length, and regex.

```js
const entries = await fs.readdir(path.join(ROOT, 'skills'), { withFileTypes: true });
const actual = [];
for (const entry of entries.filter((item) => item.isDirectory())) {
  try {
    await fs.access(path.join(ROOT, 'skills', entry.name, 'SKILL.md'));
    actual.push(entry.name);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
assert.deepEqual(actual.sort(), [...CANONICAL].sort());
for (const legacy of LEGACY) {
  await assert.rejects(fs.access(path.join(ROOT, 'skills', legacy, 'SKILL.md')));
}
```

- [ ] **Step 2: Add failing release and installation assertions**

Assert `package.json`, Codex, and Claude versions are exactly `0.2.0`. For every
installation page, require the canonical bootstrap or paper ID plus wording
that tells users to update/reinstall, start a clean session, and avoid retaining
legacy skill directories beside the new catalog.

```js
assert.equal(pkg.version, '0.2.0');
assert.equal(codex.version, '0.2.0');
assert.equal(claude.version, '0.2.0');
for (const text of installationPages) {
  assert.match(text, /update|reinstall/i);
  assert.match(text, /clean session/i);
  assert.match(text, /do not keep[\s\S]*old skill directories/i);
}
```

- [ ] **Step 3: Run focused tests and confirm RED**

Run:

```bash
node --test tests/skill-naming.test.mjs tests/release-contract.test.mjs tests/init-integration.test.mjs
```

Expected: FAIL because versions remain `0.1.0` and migration notes are absent.

- [ ] **Step 4: Bump manifests and add migration guidance**

Set `version` to `0.2.0` in `package.json`, `.codex-plugin/plugin.json`, and
`.claude-plugin/plugin.json`. Add a `Migrating from 0.1.0` section to each
installation page with the three tested requirements. Keep compatibility
language explicitly unverified.

Use this shared migration contract, adapting only the platform-specific update
verb:

```markdown
## Migrating from 0.1.0

Update or reinstall `research-agents`, then start a clean session. Do not keep
old skill directories beside the new domain-prefixed catalog; duplicate
descriptions make skill discovery ambiguous. Ask the agent to list installed
research skills and confirm the new canonical IDs before continuing.
```

- [ ] **Step 5: Run the complete release gate**

Run:

```bash
npm run verify
git diff --check
rg -n "using-research-skills|listing-research-skills|initializing-research-project|reading-research-paper|planning-paper-reimplementation|analyzing-experiment-results|creating-research-notebook|writing-paper-|reviewing-research-paper" README.md docs/install docs/paper-writing.md hooks scripts skills tests .opencode .codex-plugin .claude-plugin package.json --glob '!tests/skill-naming.test.mjs'
```

Expected: `npm run verify` passes, `git diff --check` is silent, and the legacy
search returns no matches. Historical `docs/superpowers/` records and the
explicit migration-rejection fixture are intentionally excluded from that
search.

- [ ] **Step 6: Inspect scope and commit the release migration**

Run `git status --short` and confirm only planned tracked files are staged;
leave unrelated untracked metadata untouched.

```bash
git add package.json .codex-plugin/plugin.json .claude-plugin/plugin.json docs/install tests/skill-naming.test.mjs tests/release-contract.test.mjs tests/init-integration.test.mjs
git commit -m "release: migrate skill catalog to 0.2.0"
```
