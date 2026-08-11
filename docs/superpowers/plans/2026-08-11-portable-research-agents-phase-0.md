# Portable Research Agents — Phase 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a single Git repository that exposes a small portable research-library bootstrap through native Codex, Claude Code, and OpenCode plugin artifacts.

**Architecture:** Shared skills are stored once in `skills/` and written without platform-specific tool names. Root-level native manifests, a Claude Code session hook, and an OpenCode plugin entry point load that shared directory through each harness's own installation mechanism. Node-based structural and behavioral tests validate the shared content and every adapter without modifying user configuration.

**Tech Stack:** Node.js 20 LTS, ECMAScript modules, Node built-in test runner, POSIX Bash for the Claude Code hook, JSON manifests.

## Global Constraints

- `skills/` and `agents/` are the only content source; adapters must not duplicate a skill body.
- The primary installation path is each harness's native plugin, extension, or marketplace mechanism.
- Initial Full-support targets are Codex, Claude Code, and OpenCode.
- No installer, hook, or test may edit a user's global instruction file, shell profile, or unrelated agent configuration.
- Shared skill content must use abstract capabilities rather than literal target-tool names.
- The phase ships distribution infrastructure only; do not add substantive research workflows or specialized research agents.
- Use zero production dependencies and keep the source version and native manifests aligned.

---

## Planned file structure

```text
package.json                                      # ESM scripts and shared version
skills/using-research-agents/SKILL.md             # Portable bootstrap skill
skills/library-index/SKILL.md                     # Minimal non-domain library discovery skill
agents/README.md                                  # Explicit phase-0 agent-profile boundary
references/tool-mapping/{codex,claude-code,opencode}.md
.codex-plugin/plugin.json                         # Codex native manifest
.claude-plugin/plugin.json                        # Claude Code native manifest
hooks/hooks.json                                  # Claude Code SessionStart declaration
hooks/session-start                               # Claude Code context-injection program
hooks/run-hook.cmd                                # Windows-compatible Bash launcher
.opencode/plugins/research-agents.js              # OpenCode plugin and bootstrap
docs/install/{codex,claude-code,opencode}.md      # Native installation instructions
docs/compatibility.md                             # Tiers and tested-version record
scripts/lib/content.mjs                           # Shared content inspection utilities
scripts/check-shared-content.mjs                  # CLI validation entry point
tests/content.test.mjs                            # Content validator tests
tests/codex-artifact.test.mjs                     # Codex manifest test
tests/claude-artifact.test.mjs                    # Claude manifest/hook tests
tests/opencode-plugin.test.mjs                    # OpenCode plugin behavior tests
tests/release-contract.test.mjs                   # Cross-artifact version/ownership tests
.github/workflows/verify.yml                      # Clean Linux/macOS/Windows structural CI
README.md                                         # Installation chooser and project scope
```

### Task 1: Establish the portable content contract and validator

**Files:**
- Create: `package.json`
- Create: `skills/using-research-agents/SKILL.md`
- Create: `skills/library-index/SKILL.md`
- Create: `agents/README.md`
- Create: `references/tool-mapping/codex.md`
- Create: `references/tool-mapping/claude-code.md`
- Create: `references/tool-mapping/opencode.md`
- Create: `scripts/lib/content.mjs`
- Create: `scripts/check-shared-content.mjs`
- Create: `tests/content.test.mjs`

**Interfaces:**
- Produces `parseFrontmatter(markdown: string): { attributes: Map<string, string>, body: string }`.
- Produces `validateSkill(relativePath: string, markdown: string): string[]`; an empty array means valid.
- Produces `validateSkillTree(rootDir: string): Promise<string[]>`; every subsequent verification command consumes this.
- Produces the shared bootstrap skill at `skills/using-research-agents/SKILL.md`, which all platform adapters load by path.

- [ ] **Step 1: Write the failing content-contract tests**

Create `tests/content.test.mjs` with a valid sample, a missing-frontmatter sample, and a tool-name violation:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { parseFrontmatter, validateSkill, validateSkillTree } from '../scripts/lib/content.mjs';

test('parses the required name and description frontmatter', () => {
  const parsed = parseFrontmatter('---\nname: sample\ndescription: Sample skill\n---\n\nUse abstract actions.\n');
  assert.equal(parsed.attributes.get('name'), 'sample');
  assert.equal(parsed.body.trim(), 'Use abstract actions.');
});

test('rejects a skill that names a platform tool', () => {
  const errors = validateSkill('skills/example/SKILL.md', '---\nname: example\ndescription: Example\n---\n\nRun `webfetch`.\n');
  assert.deepEqual(errors, ['skills/example/SKILL.md: shared skills must not name target tools: webfetch']);
});

test('permits ordinary prose that uses generic action words', () => {
  const errors = validateSkill('skills/example/SKILL.md', '---\nname: example\ndescription: Example\n---\n\nRead files before a task.\n');
  assert.deepEqual(errors, []);
});

test('validates every committed shared skill', async () => {
  assert.deepEqual(await validateSkillTree(process.cwd()), []);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/content.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/lib/content.mjs`.

- [ ] **Step 3: Add the project scripts and minimal shared content**

Create `package.json`:

```json
{
  "name": "research-agents",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "check:content": "node scripts/check-shared-content.mjs",
    "test": "node --test tests",
    "verify": "npm run check:content && npm test"
  }
}
```

Create `skills/using-research-agents/SKILL.md` with exactly this portable bootstrap body:

```markdown
---
name: using-research-agents
description: Use at the beginning of work to discover and apply installed research skills.
---

Before beginning a task, determine whether an installed research skill applies.
Load that skill before taking task actions. Describe requested work using capabilities:
read or edit files, run commands, search public sources, invoke another skill,
delegate independent work, or request approval for external changes. If a needed
capability is unavailable, state the limitation and use the documented fallback.
```

Create `skills/library-index/SKILL.md` with frontmatter `name: library-index` and a short body that tells the agent to list installed research skills and their descriptions without inventing missing skills. Create `agents/README.md` stating that Phase 0 deliberately publishes no specialized agent profiles. Add one mapping document per target with the exact target tool names; these files are intentionally outside `skills/`.

Use these exact mapping contents:

```markdown
# Tool Mapping for Codex

Load installed skills through Codex's native skill mechanism. Read files, edit
files, run commands, search public sources, and delegate work with the native
tools available in the active Codex session. If a capability is absent, state
the limitation instead of naming or emulating another platform's tool.
```

```markdown
# Tool Mapping for Claude Code

Load a skill with `Skill`; read with `Read`; edit with `Edit` or `Write`; run
commands with `Bash`; and delegate independent work with `Task`. If a requested
capability is unavailable, report that limitation and continue with the skill's
documented fallback.
```

```markdown
# Tool Mapping for OpenCode

Load a skill with `skill`; read with `read`; edit with `apply_patch`; run
commands with `bash`; search files with `grep` or `glob`; search public sources
with `webfetch`; and delegate independent work with `task`.
```

- [ ] **Step 4: Implement the validator**

Create `scripts/lib/content.mjs` with these concrete rules:

```js
import fs from 'node:fs/promises';
import path from 'node:path';

const TARGET_TOOLS = ['apply_patch', 'bash', 'glob', 'grep', 'todowrite', 'webfetch', 'Bash', 'Read', 'Task'];

export function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('SKILL.md must start with YAML-style frontmatter');
  const attributes = new Map(match[1].split('\n').filter(Boolean).map((line) => {
    const index = line.indexOf(':');
    return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
  }));
  return { attributes, body: match[2] };
}

export function validateSkill(relativePath, markdown) {
  const errors = [];
  let parsed;
  try { parsed = parseFrontmatter(markdown); } catch (error) { return [`${relativePath}: ${error.message}`]; }
  for (const field of ['name', 'description']) {
    if (!parsed.attributes.get(field)) errors.push(`${relativePath}: missing required frontmatter field: ${field}`);
  }
  const namedTools = TARGET_TOOLS.filter((tool) => new RegExp(`\\\\`${tool}\\\\``, 'i').test(parsed.body));
  if (namedTools.length) errors.push(`${relativePath}: shared skills must not name target tools: ${namedTools.join(', ')}`);
  return errors;
}

export async function validateSkillTree(rootDir) {
  const skillsDir = path.join(rootDir, 'skills');
  const entries = await fs.readdir(skillsDir, { withFileTypes: true });
  const errors = [];
  for (const entry of entries.filter((item) => item.isDirectory())) {
    const file = path.join(skillsDir, entry.name, 'SKILL.md');
    const markdown = await fs.readFile(file, 'utf8');
    errors.push(...validateSkill(path.relative(rootDir, file), markdown));
  }
  return errors;
}
```

Create `scripts/check-shared-content.mjs` that awaits `validateSkillTree(process.cwd())`, prints each returned error to stderr, and exits with status 1 if the array is non-empty.

- [ ] **Step 5: Run the content tests and validator**

Run: `npm run check:content && node --test tests/content.test.mjs`

Expected: all three tests PASS and the validator produces no output.

- [ ] **Step 6: Commit the shared contract**

```bash
git add package.json skills agents references scripts tests/content.test.mjs
git commit -m "feat: add portable skill content contract"
```

### Task 2: Add the native Codex plugin artifact

**Files:**
- Create: `.codex-plugin/plugin.json`
- Create: `tests/codex-artifact.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes `skills/` and the root version from `package.json`.
- Produces a Codex manifest with `skills: "./skills/"`, `hooks: {}`, and version `0.1.0`.
- Produces `npm run test`, which discovers the Codex manifest test through `tests/*.test.mjs`.

- [ ] **Step 1: Write the failing Codex-artifact test**

Create `tests/codex-artifact.test.mjs`:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('Codex manifest exposes the shared skills without foreign hooks', async () => {
  const manifest = JSON.parse(await fs.readFile('.codex-plugin/plugin.json', 'utf8'));
  assert.equal(manifest.name, 'research-agents');
  assert.equal(manifest.version, '0.1.0');
  assert.equal(manifest.skills, './skills/');
  assert.deepEqual(manifest.hooks, {});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/codex-artifact.test.mjs`

Expected: FAIL with `ENOENT` for `.codex-plugin/plugin.json`.

- [ ] **Step 3: Create the Codex manifest**

Create `.codex-plugin/plugin.json`:

```json
{
  "name": "research-agents",
  "version": "0.1.0",
  "description": "Portable research skills for coding agents.",
  "license": "MIT",
  "keywords": ["research", "skills", "literature", "experiments"],
  "skills": "./skills/",
  "hooks": {}
}
```

`hooks` must remain an empty object: the Claude Code hook exists in the same repository but must not be discovered as a Codex hook.

- [ ] **Step 4: Run the Codex artifact and complete suite**

Run: `npm test`

Expected: all content and Codex tests PASS.

- [ ] **Step 5: Commit the Codex artifact**

```bash
git add .codex-plugin/plugin.json tests/codex-artifact.test.mjs
git commit -m "feat: add Codex plugin artifact"
```

### Task 3: Add the Claude Code plugin and safe session bootstrap

**Files:**
- Create: `.claude-plugin/plugin.json`
- Create: `hooks/hooks.json`
- Create: `hooks/run-hook.cmd`
- Create: `hooks/session-start`
- Create: `tests/claude-artifact.test.mjs`

**Interfaces:**
- Consumes `skills/using-research-agents/SKILL.md`.
- Produces a Claude Code `SessionStart` hook with matcher `startup|clear|compact`.
- Produces JSON on stdout whose context is in `hookSpecificOutput.additionalContext`; it writes no files.

- [ ] **Step 1: Write the failing Claude artifact tests**

Create `tests/claude-artifact.test.mjs`:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('Claude plugin declares a SessionStart command hook', async () => {
  const hooks = JSON.parse(await fs.readFile('hooks/hooks.json', 'utf8'));
  const entry = hooks.hooks.SessionStart[0];
  assert.equal(entry.matcher, 'startup|clear|compact');
  assert.equal(entry.hooks[0].type, 'command');
  assert.match(entry.hooks[0].command, /run-hook\.cmd.*session-start/);
});

test('session-start emits Claude Code additional context and does not write files', { skip: process.platform === 'win32' }, () => {
  const result = spawnSync('bash', ['hooks/session-start'], { env: { ...process.env, CLAUDE_PLUGIN_ROOT: process.cwd() }, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.hookSpecificOutput.hookEventName, 'SessionStart');
  assert.match(output.hookSpecificOutput.additionalContext, /using-research-agents/);
  assert.match(output.hookSpecificOutput.additionalContext, /Tool Mapping for Claude Code/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/claude-artifact.test.mjs`

Expected: FAIL with `ENOENT` for `hooks/hooks.json`.

- [ ] **Step 3: Create the Claude Code manifest and hook declaration**

Create `.claude-plugin/plugin.json`:

```json
{
  "name": "research-agents",
  "version": "0.1.0",
  "description": "Portable research skills for Claude Code.",
  "license": "MIT",
  "keywords": ["research", "skills", "literature", "experiments"]
}
```

Create `hooks/hooks.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" session-start",
            "shell": "bash",
            "async": false
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 4: Create the session-start executable and Windows wrapper**

Create `hooks/session-start` (mark executable with `chmod +x hooks/session-start`) using Node only for JSON escaping:

```bash
#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SKILL_PATH="${PLUGIN_ROOT}/skills/using-research-agents/SKILL.md"
MAPPING_PATH="${PLUGIN_ROOT}/references/tool-mapping/claude-code.md"
CONTENT="$(node -e 'const fs=require("fs"); process.stdout.write(fs.readFileSync(process.argv[1], "utf8"));' "$SKILL_PATH")"
MAPPING="$(node -e 'const fs=require("fs"); process.stdout.write(fs.readFileSync(process.argv[1], "utf8"));' "$MAPPING_PATH")"
node -e 'const content = process.argv[1]; const mapping = process.argv[2]; process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:`<IMPORTANT>\n${content}\n\n${mapping}\n</IMPORTANT>`}}));' "$CONTENT" "$MAPPING"
```

Create `hooks/run-hook.cmd`:

```bat
@echo off
where bash >nul 2>nul || (echo Bash is required to run the research-agents hook. 1>&2 & exit /b 1)
bash "%~dp0%1"
```

The hook only reads its bundled skill and writes one JSON object to stdout; it must not run package installation or mutate a configuration file.

- [ ] **Step 5: Run the Claude tests and full suite**

Run: `npm test`

Expected: all tests PASS. On Windows, the structural hook test passes; the Bash execution test is run in Git Bash by CI's Ubuntu and macOS jobs.

- [ ] **Step 6: Commit the Claude Code artifact**

```bash
git add .claude-plugin hooks tests/claude-artifact.test.mjs
git commit -m "feat: add Claude Code bootstrap plugin"
```

### Task 4: Add the OpenCode plugin and message-transform bootstrap

**Files:**
- Create: `.opencode/plugins/research-agents.js`
- Create: `tests/opencode-plugin.test.mjs`

**Interfaces:**
- Consumes `skills/` and `references/tool-mapping/opencode.md` from the repository root.
- Produces `ResearchAgentsPlugin({ directory }): Promise<{ config(config): Promise<void>, 'experimental.chat.messages.transform'(input, output): Promise<void> }>`.
- `config` appends the absolute shared skills directory to `config.skills.paths` exactly once.
- The transform prepends the bootstrap exactly once to the first user message and performs no filesystem writes.

- [ ] **Step 1: Write the failing OpenCode plugin tests**

Create `tests/opencode-plugin.test.mjs`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { ResearchAgentsPlugin } from '../.opencode/plugins/research-agents.js';

test('OpenCode config registers shared skills exactly once', async () => {
  const plugin = await ResearchAgentsPlugin({ directory: process.cwd() });
  const config = { skills: { paths: [] } };
  await plugin.config(config);
  await plugin.config(config);
  assert.equal(config.skills.paths.length, 1);
  assert.match(config.skills.paths[0], /research-agents\/skills$/);
});

test('OpenCode transform prepends one bootstrap to the first user message', async () => {
  const plugin = await ResearchAgentsPlugin({ directory: process.cwd() });
  const output = { messages: [{ info: { role: 'user' }, parts: [{ type: 'text', text: 'find papers' }] }] };
  await plugin['experimental.chat.messages.transform']({}, output);
  await plugin['experimental.chat.messages.transform']({}, output);
  assert.equal(output.messages[0].parts.filter((part) => part.text?.includes('using-research-agents')).length, 1);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/opencode-plugin.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `.opencode/plugins/research-agents.js`.

- [ ] **Step 3: Implement the OpenCode plugin**

Create `.opencode/plugins/research-agents.js`:

```js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pluginDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(pluginDir, '../..');
const skillsDir = path.join(rootDir, 'skills');
let bootstrap;

function loadBootstrap() {
  if (bootstrap) return bootstrap;
  const skill = fs.readFileSync(path.join(skillsDir, 'using-research-agents', 'SKILL.md'), 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '');
  const mapping = fs.readFileSync(path.join(rootDir, 'references', 'tool-mapping', 'opencode.md'), 'utf8');
  bootstrap = `<IMPORTANT>\n${skill}\n\n${mapping}\n</IMPORTANT>`;
  return bootstrap;
}

export async function ResearchAgentsPlugin() {
  return {
    async config(config) {
      config.skills ??= {};
      config.skills.paths ??= [];
      if (!config.skills.paths.includes(skillsDir)) config.skills.paths.push(skillsDir);
    },
    async 'experimental.chat.messages.transform'(_input, output) {
      const firstUser = output.messages.find((message) => message.info.role === 'user');
      if (!firstUser?.parts?.length || firstUser.parts.some((part) => part.text?.includes('using-research-agents'))) return;
      firstUser.parts.unshift({ type: 'text', text: loadBootstrap() });
    }
  };
}
```

- [ ] **Step 4: Run the OpenCode tests and full suite**

Run: `npm test`

Expected: all tests PASS; the transform test proves the message array receives one bootstrap while the config test proves no duplicate skill path is introduced.

- [ ] **Step 5: Commit the OpenCode artifact**

```bash
git add .opencode/plugins/research-agents.js tests/opencode-plugin.test.mjs
git commit -m "feat: add OpenCode bootstrap plugin"
```

### Task 5: Add release contract checks, installation documentation, and CI

**Files:**
- Create: `docs/install/codex.md`
- Create: `docs/install/claude-code.md`
- Create: `docs/install/opencode.md`
- Create: `docs/compatibility.md`
- Create: `README.md`
- Create: `tests/release-contract.test.mjs`
- Create: `.github/workflows/verify.yml`
- Modify: `package.json`

**Interfaces:**
- Consumes the package version and all three manifests.
- Produces `npm run verify`, which checks shared content and runs the complete structural/behavioral suite.
- Produces user-facing per-harness installation pages; they must never instruct users to copy files into a global instruction directory.

- [ ] **Step 1: Write failing release-contract tests**

Create `tests/release-contract.test.mjs`:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

async function json(file) { return JSON.parse(await fs.readFile(file, 'utf8')); }

test('native manifests use the package version and shared skills path', async () => {
  const pkg = await json('package.json');
  const codex = await json('.codex-plugin/plugin.json');
  const claude = await json('.claude-plugin/plugin.json');
  assert.equal(codex.version, pkg.version);
  assert.equal(claude.version, pkg.version);
  assert.equal(codex.skills, './skills/');
});

test('installation documentation forbids global-configuration edits', async () => {
  for (const file of ['docs/install/codex.md', 'docs/install/claude-code.md', 'docs/install/opencode.md']) {
    const text = await fs.readFile(file, 'utf8');
    assert.doesNotMatch(text, /copy .*?(AGENTS\.md|CLAUDE\.md|opencode\.json)/i);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/release-contract.test.mjs`

Expected: FAIL with `ENOENT` for the first installation document.

- [ ] **Step 3: Write native installation and compatibility documentation**

Write the three installation files using these required instructions:

```markdown
# Install for Codex

Install `research-agents` from the Codex plugin marketplace when published.
For a local checkout, use Codex's plugin interface to install this repository;
do not copy skills into a global instructions directory. Start a new session and
ask the agent to list installed research skills to smoke-test discovery.
```

```markdown
# Install for Claude Code

Install the repository through Claude Code's plugin marketplace or plugin
installer. The bundled `SessionStart` hook loads the bootstrap on startup,
clear, and compact events. Do not edit personal `CLAUDE.md` files. Start a new
session and ask the agent to list installed research skills.
```

```markdown
# Install for OpenCode

Add this repository through OpenCode's plugin installer using its git-backed
package mechanism. The bundled plugin registers its own skills path at runtime;
do not add `skills.paths` or manually copy a plugin into global configuration.
Restart OpenCode and ask the agent to list installed research skills.
```

Create `docs/compatibility.md` with a table listing Codex, Claude Code, and OpenCode as `Full (pending recorded smoke test)` and columns for tested version, bootstrap mechanism, last verification date, and fallback. Create `README.md` that links to the three pages, declares Phase 0 scope, and links to the compatibility matrix.

- [ ] **Step 4: Add the clean-environment CI workflow**

Create `.github/workflows/verify.yml`:

```yaml
name: verify
on:
  pull_request:
  push:
    branches: [main]
jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm run verify
```

Do not modify `package.json` in this task. Do not add a dependency or lockfile.

- [ ] **Step 5: Run the complete local verification**

Run: `npm run verify && git diff --check`

Expected: validator exits 0; every Node test passes; `git diff --check` produces no output.

- [ ] **Step 6: Record real harness smoke-test evidence before publishing**

For each locally installed target harness, create a clean session, install the native artifact through that harness's own installer, and issue: `List the installed research skills.` Record the exact harness version, date, result, and log/transcript location in `docs/compatibility.md`.

If a harness is unavailable, leave it as `Full (pending recorded smoke test)` and do not publish a marketplace listing or claim verified support for that harness.

- [ ] **Step 7: Commit documentation and release safeguards**

```bash
git add README.md docs .github/workflows/verify.yml tests/release-contract.test.mjs package.json
git commit -m "docs: add installation and compatibility guidance"
```

## Plan self-review

### Spec coverage

- One shared source of truth: Task 1 places shared content in `skills/` and `agents/`; Tasks 2–4 only reference that content by path.
- Native installation and root-level artifacts: Tasks 2–4 add the exact Codex, Claude Code, and OpenCode artifact locations.
- Automatic bootstrap: Task 3 uses `SessionStart`; Task 4 uses an OpenCode message transform; Task 2 uses Codex native skill discovery.
- Tool mapping and fallbacks: Task 1 adds an explicit mapping file per target; the bootstrap refers to it only in target adapters.
- Privacy and no global configuration edits: Task 3's hook only reads/writes stdout; Task 4 changes runtime plugin config only; Task 5 rejects forbidden documentation and makes the policy explicit.
- Compatibility tiers, release alignment, and clean verification: Task 5 creates the matrix, cross-manifest version test, and CI.
- No substantive research workflow: Task 1's two skills only bootstrap and enumerate the library; `agents/README.md` records the deferred scope.

### Placeholder scan

The plan contains no open-ended implementation markers. Every task names files, interfaces, test commands, expected failures, concrete implementation content, verification, and a commit.

### Type and interface consistency

`validateSkillTree` is defined in Task 1 and used only through its documented script. Every adapter loads `skills/using-research-agents/SKILL.md`. The OpenCode exported symbol `ResearchAgentsPlugin` matches the import and test in Task 4. The release-contract test reads the manifests produced in Tasks 2 and 3.
