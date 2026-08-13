import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('init skill documents the required questionnaire and confirmation gate', async () => {
  const text = await fs.readFile('skills/research-initializing-project/SKILL.md', 'utf8');
  for (const phrase of ['project overview', 'research objectives', 'research questions', 'IEEE conference', 'IEEE journal', 'confirm', 'conflict']) {
    assert.match(text, new RegExp(phrase, 'i'));
  }
});

test('init skill remains portable', async () => {
  const text = await fs.readFile('skills/research-initializing-project/SKILL.md', 'utf8');
  assert.doesNotMatch(text, /\`(bash|webfetch|apply_patch|Bash|Read|Task)\`/i);
});

test('init skill resolves the initializer relative to its installed package', async () => {
  const text = await fs.readFile('skills/research-initializing-project/SKILL.md', 'utf8');
  assert.match(text, /<skill-directory>\/scripts\/init-project\.mjs/);
  assert.doesNotMatch(text, /node scripts\/init-project\.mjs/);
});
