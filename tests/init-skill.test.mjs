import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('init skill documents the required questionnaire and confirmation gate', async () => {
  const text = await fs.readFile('skills/research-initializing-project/SKILL.md', 'utf8');
  for (const phrase of ['project overview', 'research objectives', 'research questions', 'IEEE conference', 'IEEE journal', 'confirm', 'conflict']) {
    assert.match(text, new RegExp(phrase, 'i'));
  }
  for (const path of [
    'src/core/', 'src/configs/{baselines,proposed,ablations,experiments}/',
    'results/{raw,processed,figures,tables,analysis}/',
    'paper/{sections,figures,tables,templates}/', 'docs/notes/',
    'superpowers/{specs,plans,decisions}/'
  ]) assert.equal(text.includes(path), true, path);
  assert.match(text, /main\.tex` includes every canonical section/i);
});

test('init skill remains portable', async () => {
  const text = await fs.readFile('skills/research-initializing-project/SKILL.md', 'utf8');
  assert.doesNotMatch(text, /\`(bash|webfetch|apply_patch|Bash|Read|Task)\`/i);
});

test('init skill defaults to agent-native initialization and keeps the CLI optional', async () => {
  const text = await fs.readFile('skills/research-initializing-project/SKILL.md', 'utf8');
  assert.match(text, /built-in file and network capabilities by default/i);
  assert.match(text, /absence of Node\.js is not a blocker/i);
  assert.match(text, /explicitly requests the deterministic CLI/i);
  assert.match(text, /<skill-directory>\/scripts\/init-project\.mjs/);
  assert.doesNotMatch(text, /node scripts\/init-project\.mjs/);
});
