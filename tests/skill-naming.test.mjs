import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const ROOT = process.cwd();
const CANONICAL = [
  'research-using-skills',
  'research-listing-skills',
  'research-initializing-project',
  'reading-research-paper',
  'planning-paper-reimplementation',
  'analyzing-experiment-results',
  'creating-research-notebook'
];

test('research skills use canonical action-oriented names', async () => {
  for (const name of CANONICAL) {
    const file = path.join(ROOT, 'skills', name, 'SKILL.md');
    const text = await fs.readFile(file, 'utf8');
    assert.match(text, new RegExp(`^name: ${name}$`, 'm'));
    assert.match(text, /^description: Use when\b/m);
  }
  for (const legacy of [
    'using-research-agents',
    'library-index',
    'using-research-skills',
    'listing-research-skills',
    'initializing-research-project'
  ]) {
    await assert.rejects(fs.access(path.join(ROOT, 'skills', legacy, 'SKILL.md')));
  }
});
