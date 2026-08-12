import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function hasCompleteFullEvidence(row) {
  const [, status, version, date, command, result, evidence] = row;
  const placeholder = /^(Not recorded|Not yet recorded|—)$/i;
  return status === 'Full'
    && [version, date, command, evidence].every((value) => (
      typeof value === 'string' && value.trim() && !placeholder.test(value)
    ))
    && /^(PASS|Passed)$/.test(result);
}

test('verify contract includes the init skill and CLI entry point', async () => {
  const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
  assert.match(pkg.scripts.verify, /npm test/);
  assert.equal(await exists('skills/initializing-research-project/SKILL.md'), true);
  assert.equal(await exists('scripts/init-project.mjs'), true);
});

test('initializer skill invokes the portable CLI without global-agent configuration instructions', async () => {
  const skill = await fs.readFile('skills/initializing-research-project/SKILL.md', 'utf8');
  assert.match(skill, /node scripts\/init-project\.mjs --root <target-directory> --manifest <manifest\.json> --conflicts abort/);
  assert.doesNotMatch(skill, /global.*(AGENTS|CLAUDE|opencode)/i);
});

test('installation pages describe the initializer request, confirmation, and template provenance', async () => {
  for (const file of [
    'docs/install/codex.md',
    'docs/install/claude-code.md',
    'docs/install/opencode.md',
  ]) {
    const text = await fs.readFile(file, 'utf8');
    assert.match(text, /initialize.*research project/i);
    assert.match(text, /questionnaire/i);
    assert.match(text, /confirm/i);
    assert.match(text, /network/i);
    assert.match(text, /paper\/TEMPLATE\.md/i);
  }
});

test('compatibility documentation contains Node portability within the unverified native smoke boundary', async () => {
  const text = await fs.readFile('docs/compatibility.md', 'utf8');
  assert.match(text, /Node\.js 20/i);
  assert.match(text, /does not validate[\s\S]*native[\s\S]*smoke/i);
});

test('compatibility rows require native smoke evidence before reporting Full support', async () => {
  const text = await fs.readFile('docs/compatibility.md', 'utf8');
  const lines = text.split('\n');
  const header = lines.find((line) => line.startsWith('| Harness |'))
    .split('|').slice(1, -1).map((cell) => cell.trim());
  const rows = lines.filter((row) => /^\| (Codex|Claude Code|OpenCode) \|/.test(row))
    .map((row) => row.split('|').slice(1, -1).map((cell) => cell.trim()));
  const placeholder = /^(Not recorded|Not yet recorded|—)$/i;

  assert.deepEqual(header, [
    'Harness', 'Status', 'Tested version', 'Tested date',
    'Native clean-session command', 'Result', 'Evidence location',
    'Bootstrap mechanism', 'Fallback'
  ]);
  assert.equal(rows.length, 3);
  for (const row of rows) {
    const [, status, version, date, command, result, evidence] = row;
    assert.equal(row.length, header.length);
    if (status === 'Full') {
      assert.equal(hasCompleteFullEvidence(row), true);
    } else {
      assert.equal(status, 'Unverified (pending recorded smoke test)');
      assert.match(version, placeholder);
      assert.match(date, placeholder);
      assert.match(command, placeholder);
      assert.match(result, placeholder);
      assert.match(evidence, placeholder);
    }
  }
});

const COMPLETE_FULL_ROW = [
  'Codex', 'Full', '0.1.0', '2026-08-12', 'List the installed research skills.',
  'PASS', 'docs/evidence/codex-smoke.md', 'Native skill discovery', 'fallback'
];

test('Full compatibility rows accept complete successful native smoke evidence', () => {
  assert.equal(hasCompleteFullEvidence(COMPLETE_FULL_ROW), true);
});

for (const [description, index, value] of [
  ['an unrecorded tested version', 2, 'Not recorded'],
  ['an unrecorded tested date', 3, 'Not recorded'],
  ['an unrecorded native command', 4, 'Not recorded'],
  ['a failed native result', 5, 'Failed'],
  ['a lowercase pass result', 5, 'pass'],
  ['a lowercase passed result', 5, 'passed'],
  ['an unrecorded evidence location', 6, 'Not recorded'],
  ['a suffixed Full status', 1, 'Full (pending)'],
]) {
  test(`Full compatibility rows reject ${description}`, () => {
    const row = [...COMPLETE_FULL_ROW];
    row[index] = value;
    assert.equal(hasCompleteFullEvidence(row), false);
  });
}
