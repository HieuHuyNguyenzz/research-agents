import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

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

test('installation pages describe the initializer request, confirmation, and template provenance', async () => {
  for (const file of [
    'docs/install/codex.md',
    'docs/install/claude-code.md',
    'docs/install/opencode.md',
  ]) {
    const text = await fs.readFile(file, 'utf8');
    assert.match(text, /initialize.*research project/i);
    assert.match(text, /questionnaire/i);
    assert.match(text, /confirm/i);
    assert.match(text, /network/i);
    assert.match(text, /paper\/TEMPLATE\.md/i);
  }
});

test('compatibility documentation contains Node portability within the unverified native smoke boundary', async () => {
  const text = await fs.readFile('docs/compatibility.md', 'utf8');
  assert.match(text, /Node\.js 20/i);
  assert.match(text, /does not validate[\s\S]*native[\s\S]*smoke/i);
});
