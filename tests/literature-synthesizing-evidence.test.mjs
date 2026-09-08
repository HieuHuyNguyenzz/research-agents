import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const SKILL_PATH = 'skills/literature-synthesizing-evidence/SKILL.md';

async function loadSkill() {
  return fs.readFile(SKILL_PATH, 'utf8');
}

test('literature synthesis defaults to user-provided local PDFs', async () => {
  const text = await loadSkill();
  assert.match(text, /^name: literature-synthesizing-evidence$/m);
  assert.match(text, /^description: Use when[^\n]*local research-paper PDF files or folders/m);
  assert.match(text, /Require the user to provide one or more PDF paths/i);
  assert.match(text, /files from different locations/i);
  assert.match(text, /within that folder only/i);
  assert.match(text, /do not search the\s+web or download papers by default/i);
  assert.doesNotMatch(text, /`(bash|webfetch|apply_patch|Bash|Read|Task)`/i);
  assert.ok(text.split('\n').length < 500);
});

test('literature synthesis protects source scope and local privacy', async () => {
  const text = await loadSkill();
  assert.match(text, /do not treat every paper-like file[\s\S]*as in scope/i);
  assert.match(text, /do not[\s\S]*move, copy, rename, delete, or upload source files/i);
  assert.match(text, /propose candidate sources[\s\S]*wait for source-set confirmation/i);
  assert.match(text, /Ask one question at a time/i);
});

test('literature synthesis inventories and reads every included source', async () => {
  const text = await loadSkill();
  assert.match(text, /stable source inventory/i);
  assert.match(text, /exact and likely duplicates/i);
  assert.match(text, /encrypted, corrupt, image-only, truncated/i);
  assert.match(text, /never silently omit a failed source/i);
  assert.match(text, /Apply `paper-reading` to each included paper/i);
  assert.match(text, /page, section, table, figure, equation, or[\s\S]*algorithm locations/i);
});

test('literature synthesis compares evidence instead of concatenating summaries', async () => {
  const text = await loadSkill();
  assert.match(text, /rather than concatenating per-paper summaries/i);
  assert.match(text, /cross-paper evidence matrix/i);
  assert.match(text, /agreements, contradictions,[\s\S]*incomparable protocols/i);
  assert.match(text, /paper-reported facts[\s\S]*synthesis-level[\s\S]*inferences/i);
});

test('literature synthesis keeps gap and novelty claims bounded', async () => {
  const text = await loadSkill();
  assert.match(text, /research gap or novelty claim as provisional/i);
  assert.match(text, /Never infer absence[\s\S]*from the provided PDFs alone/i);
  assert.match(text, /systematic[\s\S]*exhaustive[\s\S]*documented protocol/i);
  assert.match(text, /do not[\s\S]*convert missing details into[\s\S]*negative findings/i);
});

test('literature synthesis has a scoped artifact and downstream handoff', async () => {
  const text = await loadSkill();
  assert.match(text, /`literature\/synthesis\.md`/i);
  assert.match(text, /Update `paper\/references\.bib` only when the user requests it/i);
  assert.match(text, /Pass the synthesis to `research-designing-study`/i);
  assert.match(text, /`paper-writing-introduction`, `paper-writing-related-work`/i);
  assert.match(text, /Do not write paper[\s\S]*design runnable experiments[\s\S]*implement code/i);
});

test('README exposes local-PDF literature synthesis in the study workflow', async () => {
  const readme = await fs.readFile('README.md', 'utf8');
  const workflow = readme.match(/## Research workflow\n([\s\S]*?)\n## Repository documentation/);
  assert.ok(workflow);
  const designAt = workflow[1].indexOf('`research-designing-study`');
  const synthesisAt = workflow[1].indexOf('`literature-synthesizing-evidence`');
  const initializationAt = workflow[1].indexOf('`research-initializing-project`');
  assert.ok(designAt >= 0 && synthesisAt > designAt && initializationAt > synthesisAt);
  assert.match(workflow[1], /user-provided local PDFs/i);
});
