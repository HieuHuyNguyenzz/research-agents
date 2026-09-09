import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

import { TARGET_PATHS } from '../skills/research-initializing-project/scripts/lib/init/paths.mjs';

const SECTION_TARGETS = [
  'abstract', 'introduction', 'related-work', 'methodology',
  'experimental-results', 'conclusion'
];

async function skill(name) {
  return fs.readFile(`skills/${name}/SKILL.md`, 'utf8');
}

test('initializer owns the complete canonical research scaffold', () => {
  for (const target of [
    'src/core/.gitkeep', 'src/configs/baselines/.gitkeep',
    'results/raw/.gitkeep', 'results/analysis/.gitkeep',
    'docs/notes/.gitkeep', 'superpowers/specs/.gitkeep',
    ...SECTION_TARGETS.map((name) => `paper/sections/${name}.tex`)
  ]) assert.ok(TARGET_PATHS.includes(target), target);
  assert.ok(!TARGET_PATHS.includes('paper/sections/.gitkeep'));
});

test('research evidence and briefs use canonical initialized roots', async () => {
  const using = await skill('research-using-skills');
  const design = await skill('research-designing-study');
  const literature = await skill('literature-synthesizing-evidence');
  const reading = await skill('paper-reading');
  const planning = await skill('paper-planning-reimplementation');

  assert.match(using, /`docs\/notes\/`[\s\S]*`superpowers\/specs\/`[\s\S]*`src\/`[\s\S]*`results\/`[\s\S]*`paper\/`/i);
  assert.match(design, /`superpowers\/specs\/study-design\.md`/i);
  assert.match(literature, /`docs\/notes\/literature-synthesis\.md`/i);
  assert.doesNotMatch(literature, /`literature\/synthesis\.md`/i);
  assert.match(reading, /`docs\/notes\/paper-evidence-map\.md`/i);
  assert.match(planning, /`superpowers\/specs\/`/i);
});

test('experiment and manuscript skills stay on canonical artifact paths', async () => {
  const experiments = await skill('experiments-designing-configurations');
  const analysis = await skill('results-analyzing-experiments');
  for (const target of [
    'docs/experiments.md', 'src/configs/baselines/', 'src/configs/proposed/',
    'src/configs/ablations/', 'src/configs/experiments/'
  ]) assert.ok(experiments.includes(`\`${target}\``), target);
  for (const target of [
    'results/raw/', 'results/processed/', 'results/analysis/',
    'results/figures/', 'results/tables/'
  ]) assert.ok(analysis.includes(`\`${target}\``), target);

  for (const name of SECTION_TARGETS) {
    const writer = await skill(`paper-writing-${name}`);
    assert.ok(writer.includes(`\`paper/sections/${name}.tex\``), name);
    assert.match(writer, /include graph from `paper\/main\.tex`/i);
    assert.match(writer, /unreachable parallel section file/i);
  }
});
