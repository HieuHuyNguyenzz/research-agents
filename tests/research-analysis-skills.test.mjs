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
    'research implementation brief', 'paper-to-repository', 'scope', 'fidelity',
    'scientific contract', 'assumptions', 'deviations', 'acceptance criteria',
    'Superpowers', 'handoff'
  ],
  'results-analyzing-experiments': [
    'results', 'metrics', 'baseline', 'repeated', 'uncertainty', 'notebook',
    'figures', 'relative paths', 'top to bottom', 'optional', 'validation'
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

test('paper reimplementation planning complements the engineering workflow', async () => {
  const file = path.join(ROOT, 'skills', 'paper-planning-reimplementation', 'SKILL.md');
  const text = await fs.readFile(file, 'utf8');

  assert.match(text, /inspect existing `superpowers\/specs\/`[\s\S]*`superpowers\/plans\/`[\s\S]*`superpowers\/decisions\/`/i);
  assert.match(text, /upstream evidence for Superpowers/i);
  assert.match(text, /engineering design, task decomposition[\s\S]*implementation[\s\S]*test execution[\s\S]*review/i);
  assert.match(text, /do not create a second coding plan/i);
  assert.match(text, /do not implement code in this skill/i);
  assert.match(text, /leave the[\s\S]*experiment matrix[\s\S]*`experiments-designing-configurations`/i);
  assert.doesNotMatch(text, /Each milestone must include/i);
});

test('result analysis owns the reproducible notebook contract', async () => {
  const file = path.join(ROOT, 'skills', 'results-analyzing-experiments', 'SKILL.md');
  const text = await fs.readFile(file, 'utf8');

  assert.match(text, /create or revise one rerunnable notebook/i);
  assert.match(text, /each code cell focused on one operation/i);
  assert.match(text, /objective, assumptions, expected outputs, and interpretation/i);
  assert.match(text, /execute the notebook from top to bottom/i);
  assert.match(text, /does not rely on hidden state/i);
  assert.match(text, /repository-relative paths/i);
  assert.match(text, /`results\/figures\/` for figures/i);
  assert.match(text, /`results\/tables\/` for tables/i);
  assert.match(text, /notebook validation result/i);
  assert.match(text, /quick\s+answer[\s\S]*without creating unnecessary\s+artifacts/i);
});

test('paper evidence and reimplementation briefs stay inside the initialized scaffold', async () => {
  const reading = await fs.readFile(path.join(ROOT, 'skills', 'paper-reading', 'SKILL.md'), 'utf8');
  const planning = await fs.readFile(path.join(ROOT, 'skills', 'paper-planning-reimplementation', 'SKILL.md'), 'utf8');
  assert.match(reading, /`docs\/notes\/paper-evidence-map\.md`/i);
  assert.match(planning, /canonical `superpowers\/specs\/` root/i);
});

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

test('README discovers the research analysis workflow', async () => {
  const readme = await fs.readFile(path.join(ROOT, 'README.md'), 'utf8');
  for (const name of Object.keys(CONTRACTS)) {
    assert.match(readme, new RegExp(name));
  }
  assert.match(readme, /results\/analysis/);
});
