import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

async function json(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

test('native manifests use the package version and shared skills path', async () => {
  const pkg = await json('package.json');
  const codex = await json('.codex-plugin/plugin.json');
  const claude = await json('.claude-plugin/plugin.json');

  assert.equal(pkg.version, '0.2.0');
  assert.equal(codex.version, pkg.version);
  assert.equal(claude.version, pkg.version);
  assert.equal(codex.skills, './skills/');
});

test('release verification explicitly includes the initializer integration contract', async () => {
  const pkg = await json('package.json');

  assert.match(pkg.scripts.verify, /npm run test:init-integration/);
  await fs.access('skills/research-initializing-project/SKILL.md');
  await fs.access('scripts/init-project.mjs');
});

test('installation documentation forbids global-configuration edits', async () => {
  for (const file of [
    'docs/install/codex.md',
    'docs/install/claude-code.md',
    'docs/install/opencode.md',
  ]) {
    const text = await fs.readFile(file, 'utf8');
    assert.doesNotMatch(text, /copy .*?(AGENTS\.md|CLAUDE\.md|opencode\.json)/i);
  }
});
