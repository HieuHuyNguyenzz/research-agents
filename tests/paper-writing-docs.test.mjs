import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const GUIDE = 'docs/paper-writing.md';
const SKILLS = [
  'paper-writing-abstract',
  'paper-writing-introduction',
  'paper-writing-related-work',
  'paper-writing-methodology',
  'paper-writing-experimental-results',
  'paper-writing-conclusion',
  'paper-reviewing',
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
  assert.equal(guide.includes('paper-reviewing` — inspect'), true);
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
    assert.match(text, /paper-reviewing/);
    assert.match(text, /existing LaTeX target|structured findings|section writers/i);
  }
});
