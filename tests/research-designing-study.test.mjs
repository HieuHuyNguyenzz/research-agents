import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const SKILL_PATH = 'skills/research-designing-study/SKILL.md';

async function loadSkill() {
  return fs.readFile(SKILL_PATH, 'utf8');
}

test('research-designing-study has a portable idea-to-study trigger', async () => {
  const text = await loadSkill();
  assert.match(text, /^name: research-designing-study$/m);
  assert.match(text, /^description: Use when[^\n]*early research idea[^\n]*testable study design/m);
  assert.doesNotMatch(text, /`(bash|webfetch|apply_patch|Bash|Read|Task)`/i);
  assert.ok(text.split('\n').length < 500);
});

test('research-designing-study inspects evidence before asking one question', async () => {
  const text = await loadSkill();
  const inspectAt = text.indexOf('Inspect user-provided notes');
  const askAt = text.indexOf('Ask one question at a time');
  assert.ok(inspectAt >= 0 && askAt > inspectAt);
  assert.match(text, /do not repeat a fixed questionnaire/i);
  assert.match(text, /verified evidence[\s\S]*assumptions[\s\S]*unknowns/i);
});

test('research-designing-study protects novelty and scientific validity', async () => {
  const text = await loadSkill();
  assert.match(text, /novelty and the research\s+gap as provisional/i);
  assert.match(text, /never treat model memory[\s\S]*exhaustive literature review/i);
  assert.match(text, /falsifiable hypotheses/i);
  assert.match(text, /independent and[\s\S]*dependent variables/i);
  assert.match(text, /claim-to-evidence contract/i);
  assert.match(text, /construct, internal, external, statistical, and reproducibility/i);
  assert.match(text, /do not convert missing evidence into facts/i);
});

test('research-designing-study produces a complete confirmed brief', async () => {
  const text = await loadSkill();
  assert.match(text, /ask for confirmation before[\s\S]*persisting it/i);
  for (const phrase of [
    'problem, context, motivation',
    'research questions and hypotheses',
    'scientific contributions',
    'claim-to-evidence contract',
    'feasibility, resources, ethics',
    'threats to validity',
    'minimum viable study',
    'scientific acceptance criteria',
    'handoff notes'
  ]) assert.match(text, new RegExp(phrase, 'i'));
});

test('research-designing-study hands off without owning downstream work', async () => {
  const text = await loadSkill();
  assert.match(text, /pass the confirmed brief to `research-initializing-project`/i);
  assert.match(text, /Superpowers[\s\S]*upstream scientific requirements/i);
  assert.match(text, /`paper-reading` and `paper-planning-reimplementation` instead/i);
  assert.match(text, /runnable configs to `experiments-designing-configurations`/i);
  assert.match(text, /do not write source code, configs, datasets, results, manuscript prose/i);
  assert.match(text, /do not run experiments/i);
});

test('README exposes study design before implementation', async () => {
  const readme = await fs.readFile('README.md', 'utf8');
  const workflow = readme.match(/## Research workflow\n([\s\S]*?)\n## Repository documentation/);
  assert.ok(workflow);
  const designAt = workflow[1].indexOf('`research-designing-study`');
  const implementationAt = workflow[1].indexOf('Superpowers');
  assert.ok(designAt >= 0 && implementationAt > designAt);
  assert.match(workflow[1], /Turn this idea into a testable study design/i);
});
