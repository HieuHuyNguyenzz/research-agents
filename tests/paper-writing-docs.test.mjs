import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const GUIDE = 'docs/paper-writing.md';
const SKILLS = [
  'writing-paper-abstract',
  'writing-paper-introduction',
  'writing-paper-related-work',
  'writing-paper-methodology',
  'writing-paper-experimental-results',
  'writing-paper-conclusion',
  'reviewing-research-paper',
];
const TARGETS = [
  'paper/sections/abstract.tex',
  'paper/sections/introduction.tex',
  'paper/sections/related-work.tex',
  'paper/sections/methodology.tex',
  'paper/sections/experimental-results.tex',
  'paper/sections/conclusion.tex',
];

test('paper-writing guide documents the complete skill library and outputs', async () => {
  const guide = await fs.readFile(GUIDE, 'utf8');
  for (const skill of SKILLS) assert.equal(guide.includes(`\`${skill}\``), true, skill);
  for (const target of TARGETS) assert.equal(guide.includes(`\`${target}\``), true, target);
  assert.equal(guide.includes('Never invent a result'), true);
  assert.match(guide, /explicitly supplies or\s+requests/);
  assert.equal(guide.includes('reviewing-research-paper` — inspect'), true);
  assert.equal(guide.includes('review skill is read-only by default'), true);
});

test('README and every installation page link the paper-writing guide', async () => {
  const readme = await fs.readFile('README.md', 'utf8');
  assert.equal(readme.includes('[paper-writing guide](docs/paper-writing.md)'), true);

  for (const file of [
    'docs/install/codex.md',
    'docs/install/claude-code.md',
    'docs/install/opencode.md',
  ]) {
    const text = await fs.readFile(file, 'utf8');
    assert.equal(text.includes('[paper-writing guide](../paper-writing.md)'), true, file);
    assert.match(text, /Write and review a paper/);
    assert.match(text, /reviewing-research-paper/);
    assert.match(text, /existing LaTeX target|structured findings|section writers/i);
  }
});
