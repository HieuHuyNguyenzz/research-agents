import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const ROOT = process.cwd();
const CANONICAL = [
  'docs-maintaining-repository',
  'experiments-designing-configurations',
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
  'using-research-skills',
  'listing-research-skills',
  'initializing-research-project',
  'reading-research-paper',
  'planning-paper-reimplementation',
  'writing-paper-abstract',
  'writing-paper-introduction',
  'writing-paper-related-work',
  'writing-paper-methodology',
  'writing-paper-experimental-results',
  'writing-paper-conclusion',
  'reviewing-research-paper',
  'analyzing-experiment-results',
  'creating-research-notebook'
];

test('research skills use canonical action-oriented names', async () => {
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

  for (const name of CANONICAL) {
    const file = path.join(ROOT, 'skills', name, 'SKILL.md');
    const text = await fs.readFile(file, 'utf8');
    assert.match(text, new RegExp(`^name: ${name}$`, 'm'));
    assert.match(text, /^description: Use when\b/m);
    assert.match(name, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.ok(name.length <= 64);
  }
  for (const legacy of LEGACY) {
    await assert.rejects(fs.access(path.join(ROOT, 'skills', legacy, 'SKILL.md')));
  }
});
