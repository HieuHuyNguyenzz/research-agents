import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const SKILL_PATH = 'skills/experiments-designing-configurations/SKILL.md';
const CONFIG_ROOTS = [
  'src/configs/baselines/',
  'src/configs/proposed/',
  'src/configs/ablations/',
  'src/configs/experiments/'
];
const MATRIX_FIELDS = [
  'unique ID', 'tier', 'claim', 'method', 'baseline', 'dataset', 'split',
  'metric', 'direction', 'seeds', 'repetitions', 'independent variables',
  'controlled variables', 'config paths', 'expected artifacts',
  'dependencies', 'rationale', 'run count', 'status'
];
const REPORT_FIELDS = [
  'Changed', 'Matrix', 'Blocked', 'Conflicts', 'Assumptions',
  'Provenance', 'Validation', 'Next commands'
];

async function loadSkill() {
  return fs.readFile(SKILL_PATH, 'utf8');
}

function compact(text) {
  return text.replace(/\s+/g, ' ');
}

test('experiments-designing-configurations inspects evidence before asking one question', async () => {
  const text = await loadSkill();
  const normalized = compact(text);

  assert.match(text, /^---\nname: experiments-designing-configurations\ndescription: Use when\b/m);
  for (const literal of [
    '`AGENTS.md`', '`README.md`', '`docs/`', '`paper/`',
    '`paper/references.bib`', 'code', 'configs', 'tests', 'results'
  ]) {
    assert.equal(text.includes(literal), true, literal);
  }
  const inspectAt = normalized.indexOf('Inspect the complete repository');
  const askAt = normalized.indexOf('Ask one question at a time');
  assert.ok(inspectAt >= 0 && askAt > inspectAt);
  assert.match(normalized, /Ask one question at a time[^.]*missing or conflicting/i);
  assert.match(normalized, /do not repeat a fixed questionnaire/i);
});

test('experiments-designing-configurations defines the complete scientific matrix', async () => {
  const text = await loadSkill();
  const normalized = compact(text);

  assert.match(text, /`core`/);
  assert.match(text, /`supplementary`/);
  for (const field of MATRIX_FIELDS) assert.match(normalized, new RegExp(field, 'i'));
  for (const dimension of ['robustness', 'sensitivity', 'efficiency', 'qualitative', 'failure']) {
    assert.match(text, new RegExp(dimension, 'i'));
  }
  assert.match(normalized, /do not remove[^.]*compute/i);
  assert.match(normalized, /Cartesian[^.]*run count/i);
  assert.match(text, /`ready`/);
  assert.match(text, /`blocked`/);
});

test('experiments-designing-configurations requires permission, confirmation, and scoped writes', async () => {
  const text = await loadSkill();
  const normalized = compact(text);

  assert.match(normalized, /ask[^.]*permission[^.]*before searching the web/i);
  assert.match(normalized, /prefer[^.]*primary[^.]*official/i);
  assert.match(normalized, /title or identifier[^.]*source URL[^.]*decision/i);
  assert.match(normalized, /write only after[^.]*explicitly confirms/i);
  assert.equal(text.includes('`docs/experiments.md`'), true);
  for (const root of CONFIG_ROOTS) assert.equal(text.includes(`\`${root}\``), true, root);
  assert.match(normalized, /follow[^.]*format[^.]*schema[^.]*inheritance[^.]*composition[^.]*naming/i);
  assert.match(normalized, /no reliable config example[^.]*ask[^.]*format/i);
});

test('experiments-designing-configurations blocks unsupported work and resolves conflicts per file', async () => {
  const text = await loadSkill();
  const normalized = compact(text);

  assert.match(normalized, /do not create[^.]*speculative[^.]*config/i);
  assert.match(normalized, /`blocked`[^.]*code gap[^.]*unblock/i);
  assert.match(normalized, /do not modify[^.]*code[^.]*tests[^.]*dependencies[^.]*data/i);
  for (const mode of ['`preserve`', '`merge`', '`overwrite`']) assert.match(text, new RegExp(mode));
  assert.match(normalized, /semantic[^.]*formatting[^.]*not[^.]*conflict/i);
  assert.match(normalized, /each conflicting file|each conflict/i);
  assert.match(normalized, /do not apply[^.]*blanket/i);
});

test('experiments-designing-configurations validates safely and reports the outcome', async () => {
  const text = await loadSkill();
  const normalized = compact(text);

  for (const check of ['parse', 'schema', 'referenced paths', 'duplicate IDs', 'run count', 'dry-run', 'smoke test']) {
    assert.match(normalized, new RegExp(check, 'i'));
  }
  assert.match(normalized, /do not run[^.]*training[^.]*full evaluation[^.]*sweep/i);
  assert.match(normalized, /do not analyze[^.]*results/i);
  for (const field of REPORT_FIELDS) assert.match(text, new RegExp(`\\*\\*${field}:\\*\\*`));
  assert.ok(text.split('\n').length < 500);
});
