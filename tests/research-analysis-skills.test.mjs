import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const ROOT = process.cwd();
const CONTRACTS = {
  'paper-reading': [
    'paper', 'PDF', 'evidence', 'page', 'uncertainty', 'reproducibility'
  ],
  'paper-planning-reimplementation': [
    'paper-to-code', 'scope', 'data', 'evaluation', 'tests', 'milestones', 'risks'
  ],
  'results-analyzing-experiments': [
    'results', 'metrics', 'baseline', 'repeated', 'uncertainty', 'notebook', 'figures'
  ],
  'notebook-creating-research': [
    'notebook', 'relative paths', 'top-to-bottom', 'optional', 'validate'
  ]
};

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, 'skill must start with frontmatter');
  const fields = Object.fromEntries(match[1].split('\n').map((line) => {
    const index = line.indexOf(':');
    return [line.slice(0, index), line.slice(index + 1).trim()];
  }));
  return fields;
}

for (const [name, phrases] of Object.entries(CONTRACTS)) {
  test(`${name} has the normalized portable contract`, async () => {
    const file = path.join(ROOT, 'skills', name, 'SKILL.md');
    const text = await fs.readFile(file, 'utf8');
    const frontmatter = parseFrontmatter(text);

    assert.equal(frontmatter.name, name);
    assert.match(frontmatter.description, /^Use when\b/);
    assert.ok(text.split('\n').length < 500, 'skill should remain concise');
    for (const phrase of phrases) assert.match(text, new RegExp(phrase, 'i'));
    assert.doesNotMatch(text, /`(bash|webfetch|apply_patch|Bash|Read|Task)`/i);
  });
}

test('library index and README discover the research analysis workflow', async () => {
  const index = await fs.readFile(path.join(ROOT, 'skills', 'research-listing-skills', 'SKILL.md'), 'utf8');
  const readme = await fs.readFile(path.join(ROOT, 'README.md'), 'utf8');
  for (const name of Object.keys(CONTRACTS)) {
    assert.match(index, new RegExp(name));
    assert.match(readme, new RegExp(name));
  }
  assert.match(readme, /results\/analysis/);
});
