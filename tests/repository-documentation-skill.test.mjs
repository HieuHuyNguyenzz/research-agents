import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const SKILL_PATH = 'skills/docs-maintaining-repository/SKILL.md';
const TARGETS = {
  'README.md': ['purpose', 'setup', 'usage', 'compatibility'],
  'AGENTS.md': ['protected', 'policy', 'preserve'],
  'docs/architecture.md': ['components', 'boundaries', 'data', 'entry points'],
  'docs/methodology.md': ['method', 'assumptions', 'code', 'config'],
  'docs/experiments.md': ['datasets', 'baselines', 'metrics', 'seeds', 'ablations'],
  'docs/reproduction.md': ['environment', 'dependencies', 'commands', 'output paths']
};
const REPORT_FIELDS = ['Changed', 'Unchanged', 'Evidence', 'Conflicts', 'Unresolved', 'Validation'];

async function loadSkill() {
  return fs.readFile(SKILL_PATH, 'utf8');
}

test('docs-maintaining-repository audits the six documentation targets', async () => {
  const text = await loadSkill();
  assert.match(text, /^---\nname: docs-maintaining-repository\ndescription: Use when\b/m);
  assert.match(text, /complete repository|whole repository/i);
  for (const [target, phrases] of Object.entries(TARGETS)) {
    assert.equal(text.includes(`\`${target}\``), true, target);
    for (const phrase of phrases) assert.match(text, new RegExp(phrase, 'i'));
  }
  for (const status of ['missing', 'accurate', 'incomplete', 'stale', 'conflicting', 'not applicable']) {
    assert.match(text, new RegExp(`\`${status}\``));
  }
});

test('docs-maintaining-repository uses evidence precedence and direct scoped writes', async () => {
  const text = await loadSkill();
  const precedence = [
    'executable code', 'automated tests', 'entry points',
    'research artifacts', 'existing documentation', 'conversational context'
  ];
  let cursor = -1;
  for (const phrase of precedence) {
    const next = text.toLowerCase().indexOf(phrase, cursor + 1);
    assert.ok(next > cursor, `missing or reordered evidence source: ${phrase}`);
    cursor = next;
  }
  assert.match(text, /write directly|writes directly/i);
  assert.match(text, /create[^.]*missing/i);
  assert.match(text, /do not rewrite|leave[^.]*accurate[^.]*unchanged/i);
  assert.match(text, /do not modify[^.]*code[^.]*config[^.]*tests[^.]*results[^.]*paper/i);
});

test('docs-maintaining-repository protects policy and forbids unsupported facts', async () => {
  const text = await loadSkill();
  assert.match(text, /never (?:remove|delete)[^.]*policy|do not (?:remove|delete)[^.]*policy/i);
  assert.match(text, /do not (?:invent|fabricate)[^.]*commands/i);
  assert.match(text, /do not (?:invent|fabricate)[^.]*architecture/i);
  assert.match(text, /do not (?:invent|fabricate)[^.]*results/i);
  assert.match(text, /asks?[^.]*only when[^.]*blocks? an accurate edit/i);
});

test('docs-maintaining-repository reports the complete audit outcome', async () => {
  const text = await loadSkill();
  for (const field of REPORT_FIELDS) {
    assert.match(text, new RegExp(`\\*\\*${field}:\\*\\*`));
  }
  assert.match(text, /no write was needed|no changes? (?:were )?needed/i);
  assert.ok(text.split('\n').length < 500);
});

test('catalog and README expose repository documentation maintenance', async () => {
  const [catalog, readme] = await Promise.all([
    fs.readFile('skills/research-listing-skills/SKILL.md', 'utf8'),
    fs.readFile('README.md', 'utf8')
  ]);
  assert.match(catalog, /Docs:[\s\S]*`docs-maintaining-repository`/);
  assert.match(catalog, /audit|synchroniz|maintain/i);
  assert.match(readme, /`docs-maintaining-repository`/);
  assert.match(readme, /README\.md[\s\S]*AGENTS\.md[\s\S]*docs\//i);
  assert.match(readme, /Update the repository documentation from the current code and configs\./);
});
