# Research Project Init Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a portable `init` skill and Node.js scaffold that collects structured research metadata, materializes an IEEE conference or IEEE journal paper template, and safely creates the agreed research repository structure.

**Architecture:** Keep the agent-facing workflow in a shared `SKILL.md` and put deterministic validation, rendering, downloading, and transactional filesystem behavior in small Node.js modules. The CLI accepts a JSON manifest and injects network functions in tests so platform adapters remain thin and cross-platform.

**Tech Stack:** Node.js 20 built-ins (`node:fs/promises`, `node:path`, `node:crypto`, `node:test`, `fetch`), Markdown, LaTeX, no runtime dependency on a platform-specific shell.

## Global Constraints

- The first release supports only `ieee-conference` and `ieee-journal`.
- Existing files are never overwritten without explicit confirmation after a conflict list is shown.
- The script never deletes unrelated files or sends project content to remote services.
- Downloads have a bounded size, validate the expected source, and reject archive/path traversal.
- A failed template download or validation must stop before template creation and must not silently substitute another template.
- Node.js 20 is the minimum runtime and the implementation must work on macOS, Linux, and Windows, including paths with spaces.
- Shared skills must not name target-specific tools or global configuration files.
- No research agents, orchestration, dataset downloads, experiment execution, LaTeX compilation, or publication submission are in scope.

---

### Task 1: Define the init manifest and template registry

**Files:**
- Create: `scripts/lib/init/manifest.mjs`
- Create: `scripts/lib/init/templates.mjs`
- Test: `tests/init-manifest.test.mjs`

**Interfaces:**
- `parseManifest(input: string | object): InitManifest` accepts JSON text or an object and returns normalized fields `{ projectName, overview, objectives, researchQuestions, dataSources, methods, authors, paperTemplate }`.
- `validateManifest(manifest: unknown): string[]` returns deterministic field and enum errors.
- `getTemplateDefinition(id: string): { id, label, sourceUrl, sourceKind, expectedClassOption, maxBytes }` throws for an unsupported id.
- The registry uses the official public Overleaf IEEE conference page `https://www.overleaf.com/latex/templates/ieee-conference-template/grfzhhncsfqn` and official IEEE journal page `https://www.overleaf.com/latex/templates/ieee-journal-paper-template/jbbbdkztwxrd` as provenance URLs. The source adapter in Task 3 will retrieve the public source representation from these entries.

- [ ] **Step 1: Write failing manifest and registry tests**

```js
test('normalizes required and optional manifest fields', () => {
  const manifest = parseManifest(JSON.stringify({
    projectName: 'Robust FL',
    overview: 'Study robust aggregation.',
    objectives: 'Compare robustness',
    paperTemplate: 'IEEE conference'
  }));
  assert.deepEqual(manifest.objectives, ['Compare robustness']);
  assert.equal(manifest.paperTemplate, 'ieee-conference');
  assert.deepEqual(validateManifest(manifest), []);
});

test('rejects missing overview and unsupported paper template', () => {
  const errors = validateManifest({ projectName: 'x', paperTemplate: 'acl' });
  assert.deepEqual(errors, [
    'overview is required',
    'paperTemplate must be ieee-conference or ieee-journal'
  ]);
});

test('exposes pinned definitions for both IEEE presets', () => {
  assert.equal(getTemplateDefinition('ieee-conference').expectedClassOption, 'conference');
  assert.equal(getTemplateDefinition('ieee-journal').expectedClassOption, 'journal');
});
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run: `node --test tests/init-manifest.test.mjs`

Expected: FAIL because the init modules do not exist.

- [ ] **Step 3: Implement normalization and registry**

Normalize scalar strings, trim whitespace, convert comma/newline-separated optional values to arrays, map case-insensitive labels to the two canonical ids, and return stable error ordering. Reject empty required values and unknown template ids. Keep the source URLs and byte limits in one registry object so later presets can be added without changing the workflow.

- [ ] **Step 4: Run focused tests and the shared content checker**

Run: `node --test tests/init-manifest.test.mjs && npm run check:content`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/init/manifest.mjs scripts/lib/init/templates.mjs tests/init-manifest.test.mjs
git commit -m "feat: define research init manifest and templates"
```

### Task 2: Implement conflict planning and deterministic scaffold rendering

**Files:**
- Create: `scripts/lib/init/paths.mjs`
- Create: `scripts/lib/init/render.mjs`
- Test: `tests/init-scaffold.test.mjs`

**Interfaces:**
- `TARGET_PATHS` is the complete relative path list for the requested scaffold.
- `planWrites(rootDir: string, manifest: InitManifest): Promise<{ files, directories, conflicts }>` returns all paths before writing.
- `renderFile(relativePath: string, manifest: InitManifest, template: TemplateMaterial): string` renders project files and rejects unknown targets.

- [ ] **Step 1: Write failing scaffold tests**

```js
test('plans the complete research tree without touching disk', async () => {
  const plan = await planWrites(tempRoot, manifest);
  assert.ok(plan.files.includes('README.md'));
  assert.ok(plan.files.includes('paper/main.tex'));
  assert.ok(plan.files.includes('results/figures/.gitkeep'));
  assert.deepEqual(plan.conflicts, []);
});

test('reports existing files before any write', async () => {
  await fs.writeFile(path.join(tempRoot, 'README.md'), 'keep me');
  const plan = await planWrites(tempRoot, manifest);
  assert.deepEqual(plan.conflicts, ['README.md']);
});

test('renders metadata into README, docs, and paper entry point', () => {
  assert.match(renderFile('README.md', manifest, conferenceTemplate), /Robust FL/);
  assert.match(renderFile('docs/methodology.md', manifest, conferenceTemplate), /Compare robustness/);
  assert.match(renderFile('paper/main.tex', manifest, conferenceTemplate), /\\documentclass\[conference\]\{IEEEtran\}/);
});
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run: `node --test tests/init-scaffold.test.mjs`

Expected: FAIL because path planning and renderers do not exist.

- [ ] **Step 3: Implement the path manifest and renderers**

Use only relative constants from the target structure. Generate required text files (`README.md`, `AGENTS.md`, `.gitignore`, `pyproject.toml`, the four docs, `references.bib`) with stable headings and explicit “not specified” markers for blank optional fields. Generate `.gitkeep` only for directories that have no other generated file. Preserve the downloaded template body in `paper/main.tex` and replace only safe title/author placeholders supplied by the manifest.

- [ ] **Step 4: Run focused tests and inspect the planned path set**

Run: `node --test tests/init-scaffold.test.mjs`

Expected: PASS and the path set contains every mandatory directory from the spec.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/init/paths.mjs scripts/lib/init/render.mjs tests/init-scaffold.test.mjs
git commit -m "feat: render research project scaffold"
```

### Task 3: Add safe template source retrieval and materialization

**Files:**
- Create: `scripts/lib/init/templates-fetch.mjs`
- Test: `tests/init-template-fetch.test.mjs`

**Interfaces:**
- `fetchTemplate(definition, { fetchImpl, maxBytes }): Promise<{ text, sourceUrl, sha256 }>` retrieves the public source representation with a bounded response body.
- `validateTemplateSource(text: string, expectedClassOption: string): void` requires an `IEEEtran` document class and the expected `conference` or `journal` option.
- `validateArchiveEntry(entryName: string): void` rejects absolute paths and any `..` path segment before an archive entry can be extracted.
- `materializeTemplate(paperDir, material, metadata): Promise<string[]>` writes `main.tex`, `references.bib`, and `TEMPLATE.md` only after validation.

- [ ] **Step 1: Write failing downloader tests with injected fetch**

```js
test('accepts a valid conference source and records its digest', async () => {
  const result = await fetchTemplate(conferenceDefinition, {
    fetchImpl: async () => new Response('\\documentclass[conference]{IEEEtran}\\begin{document}\\end{document}')
  });
  assert.match(result.sha256, /^[a-f0-9]{64}$/);
});

test('rejects a journal source for the conference preset', async () => {
  await assert.rejects(
    fetchTemplate(conferenceDefinition, {
      fetchImpl: async () => new Response('\\documentclass[journal]{IEEEtran}')
    }),
    /expected conference mode/
  );
});

test('rejects oversized and path-traversing downloaded content', async () => {
  await assert.rejects(fetchTemplate(conferenceDefinition, {
    maxBytes: 10,
    fetchImpl: async () => new Response('01234567890')
  }), /maximum download size/);
  assert.throws(() => validateArchiveEntry('../outside.tex'), /path traversal/);
});
```

- [ ] **Step 2: Run focused tests and verify they fail**

Run: `node --test tests/init-template-fetch.test.mjs`

Expected: FAIL because the fetch/materialization module does not exist.

- [ ] **Step 3: Implement bounded retrieval and validation**

Use `fetch` with an explicit timeout, reject non-2xx responses, enforce the configured byte limit while reading the body, calculate SHA-256 with `node:crypto`, and validate the expected class option. If the public source is represented as an archive, inspect each entry before extraction and reject absolute paths, `..` segments, and entries outside `paper/`. Do not write to the destination until the complete source passes validation.

- [ ] **Step 4: Write provenance and materialize safely**

Write `paper/TEMPLATE.md` with the canonical id, source URL, UTC retrieval time, SHA-256, expected class option, and a note that the template guidance must be reviewed before submission. Ensure the generated `paper/main.tex` is the only entry point and preserve a blank `paper/references.bib` if the source does not provide one.

- [ ] **Step 5: Run focused tests and commit**

Run: `node --test tests/init-template-fetch.test.mjs`

Expected: PASS.

```bash
git add scripts/lib/init/templates-fetch.mjs tests/init-template-fetch.test.mjs
git commit -m "feat: safely materialize IEEE paper templates"
```

### Task 4: Add transactional CLI orchestration

**Files:**
- Create: `scripts/init-project.mjs`
- Modify: `scripts/lib/init/paths.mjs`
- Test: `tests/init-cli.test.mjs`

**Interfaces:**
- CLI command: `node scripts/init-project.mjs --root <repo> --manifest <manifest.json> --conflicts abort|overwrite|skip`.
- `runInit({ rootDir, manifest, conflictMode, fetchImpl }): Promise<{ created, skipped, conflicts, template }>` is importable for tests.

- [ ] **Step 1: Write failing orchestration tests**

```js
test('creates an empty repository and reports all generated paths', async () => {
  const result = await runInit({ rootDir: tempRoot, manifest, fetchImpl: fakeFetch });
  assert.ok(result.created.includes('README.md'));
  assert.ok(await fs.stat(path.join(tempRoot, 'paper/main.tex')));
  assert.ok(await fs.stat(path.join(tempRoot, 'paper/TEMPLATE.md')));
});

test('abort mode performs no writes when conflicts exist', async () => {
  await fs.writeFile(path.join(tempRoot, 'README.md'), 'keep');
  await assert.rejects(runInit({ rootDir: tempRoot, manifest, conflictMode: 'abort', fetchImpl: fakeFetch }), /conflicts/);
  assert.equal(await fs.readFile(path.join(tempRoot, 'README.md'), 'utf8'), 'keep');
});

test('skip mode preserves conflicts and creates remaining files', async () => {
  await fs.writeFile(path.join(tempRoot, 'README.md'), 'keep');
  const result = await runInit({ rootDir: tempRoot, manifest, conflictMode: 'skip', fetchImpl: fakeFetch });
  assert.deepEqual(result.skipped, ['README.md']);
  assert.equal(await fs.readFile(path.join(tempRoot, 'README.md'), 'utf8'), 'keep');
});
```

- [ ] **Step 2: Run focused tests and verify they fail**

Run: `node --test tests/init-cli.test.mjs`

Expected: FAIL because the orchestration entry point does not exist.

- [ ] **Step 3: Implement preflight, conflict modes, and transactional writes**

Parse and validate the manifest, build the full write plan, and resolve conflicts before fetching or writing. `abort` throws with the sorted conflict list, `skip` omits only conflicting files, and `overwrite` is accepted only when the caller has already supplied explicit confirmation. Track paths created by this invocation and remove only those paths if a later write fails. Return a stable JSON report for the agent to summarize to the user.

- [ ] **Step 4: Add CLI argument parsing and run tests**

Reject missing arguments, unknown conflict modes, malformed JSON, and invalid template ids with exit code 2. Print the success report as JSON on stdout and errors as concise messages on stderr.

Run: `node --test tests/init-cli.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/init-project.mjs scripts/lib/init/paths.mjs tests/init-cli.test.mjs
git commit -m "feat: add research project init CLI"
```

### Task 5: Write the portable agent skill and expose it in the library

**Files:**
- Create: `skills/initializing-research-project/SKILL.md`
- Modify: `README.md`
- Test: `tests/init-skill.test.mjs`

**Interfaces:**
- The skill body must describe the trigger, the eight questionnaire fields, the confirmation gate, the conflict prompt, and the neutral Node CLI invocation without naming any platform-specific tool.

- [ ] **Step 1: Write failing skill contract tests**

```js
test('init skill documents the required questionnaire and confirmation gate', async () => {
  const text = await fs.readFile('skills/initializing-research-project/SKILL.md', 'utf8');
  for (const phrase of ['project overview', 'research objectives', 'research questions', 'IEEE conference', 'IEEE journal', 'confirm', 'conflict']) {
    assert.match(text, new RegExp(phrase, 'i'));
  }
});

test('init skill remains portable', async () => {
  const text = await fs.readFile('skills/initializing-research-project/SKILL.md', 'utf8');
  assert.doesNotMatch(text, /\`(bash|webfetch|apply_patch|Bash|Read|Task)\`/i);
});
```

- [ ] **Step 2: Run focused tests and verify they fail**

Run: `node --test tests/init-skill.test.mjs`

Expected: FAIL because the skill does not exist.

- [ ] **Step 3: Write the concise skill**

Use frontmatter `name: initializing-research-project` and a trigger-only description beginning with “Use when…”. In the body, instruct the agent to ask the fields one at a time, normalize them into the manifest shape, show a complete summary and conflict list, and invoke the neutral Node command only after confirmation. Explain that network/template errors are surfaced rather than silently substituted. Keep the body below 500 lines and do not add a README inside the skill directory.

- [ ] **Step 4: Update discovery documentation and run checks**

Update the root README to state that the repository now includes the portable research-project initializer and link to the installation pages. Run:

```bash
node --test tests/init-skill.test.mjs
npm run check:content
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add skills/initializing-research-project/SKILL.md tests/init-skill.test.mjs README.md
git commit -m "feat: add portable research project init skill"
```

### Task 6: Integrate verification and document the user-facing contract

**Files:**
- Modify: `package.json`
- Modify: `tests/release-contract.test.mjs`
- Modify: `docs/install/codex.md`
- Modify: `docs/install/claude-code.md`
- Modify: `docs/install/opencode.md`
- Modify: `docs/compatibility.md`
- Test: `tests/init-integration.test.mjs`

**Interfaces:**
- `npm run verify` must execute the content checker, all unit tests, and the init integration tests.

- [ ] **Step 1: Write failing integration tests**

```js
test('verify contract includes the init skill and CLI entry point', async () => {
  const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
  assert.match(pkg.scripts.verify, /npm test/);
  assert.equal(await exists('skills/initializing-research-project/SKILL.md'), true);
  assert.equal(await exists('scripts/init-project.mjs'), true);
});

test('the generated scaffold has no global-agent configuration instructions', async () => {
  const skill = await fs.readFile('skills/initializing-research-project/SKILL.md', 'utf8');
  assert.doesNotMatch(skill, /global.*(AGENTS|CLAUDE|opencode)/i);
});
```

- [ ] **Step 2: Run the integration tests and verify they fail**

Run: `node --test tests/init-integration.test.mjs`

Expected: FAIL until scripts and docs are wired into verification.

- [ ] **Step 3: Update scripts, release assertions, and install docs**

Keep `npm run verify` as the single local gate, add assertions that the shared skill and CLI exist, and document the natural-language request plus the questionnaire/confirmation behavior in each platform installation page. State that template downloads require network access and that the selected source is recorded in `paper/TEMPLATE.md`.

- [ ] **Step 4: Run the complete verification suite**

Run:

```bash
npm run verify
git diff --check
```

Expected: content checker passes, all tests pass, and `git diff --check` is clean.

- [ ] **Step 5: Commit**

```bash
git add package.json tests/release-contract.test.mjs tests/init-integration.test.mjs docs/install/codex.md docs/install/claude-code.md docs/install/opencode.md docs/compatibility.md
git commit -m "test: integrate research init verification"
```

## Final review checklist

- [ ] Both template presets produce the expected `IEEEtran` class option.
- [ ] A conflict is shown before any overwrite and refusal leaves existing files untouched.
- [ ] Network failure, invalid source, checksum failure, and unsafe paths leave no partial template behind.
- [ ] The skill is discoverable and contains no platform-specific tool names.
- [ ] `npm run verify` and `git diff --check` pass on the final branch.
