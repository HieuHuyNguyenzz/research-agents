import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const WORKFLOW = 'docs/research-workflow.md';
const REFERENCE = 'docs/skill-reference.md';

async function installedSkillNames() {
  const entries = await fs.readdir('skills', { withFileTypes: true });
  const names = [];
  for (const entry of entries.filter((item) => item.isDirectory())) {
    try {
      const text = await fs.readFile(path.join('skills', entry.name, 'SKILL.md'), 'utf8');
      const name = text.match(/^name: ([a-z0-9-]+)$/m)?.[1];
      if (name) names.push(name);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return names.sort();
}

test('skill reference documents every installed skill and its usage contract', async () => {
  const reference = await fs.readFile(REFERENCE, 'utf8');
  const names = await installedSkillNames();

  assert.equal(names.length, 16);
  for (const name of names) assert.equal(reference.includes(`\`${name}\``), true, name);
  for (const heading of [
    'Research setup and evidence',
    'Experiments and analysis',
    'Manuscript writing and review',
    'Repository maintenance',
    'Choosing between similar-looking skills'
  ]) {
    assert.match(reference, new RegExp(`^## ${heading}$`, 'm'));
  }
  assert.match(reference, /Use it when[\s\S]*Give the agent[\s\S]*Expected result/);
  assert.match(reference, /another workstation[\s\S]*revision[\s\S]*provenance/i);
});

test('research workflow covers both entry paths and the external execution handoff', async () => {
  const workflow = await fs.readFile(WORKFLOW, 'utf8');

  for (const heading of [
    'Path A: original study',
    'Path B: faithful paper reproduction',
    'Implement and design experiments',
    'Run on another workstation',
    'Analyze results',
    'Write the manuscript',
    'Human confirmation points'
  ]) {
    assert.match(workflow, new RegExp(`^###? ${heading}$`, 'm'));
  }

  const designAt = workflow.indexOf('`experiments-designing-configurations`');
  const runAt = workflow.indexOf('## Run on another workstation');
  const analysisAt = workflow.indexOf('## Analyze results');
  assert.ok(designAt >= 0 && runAt > designAt && analysisAt > runAt);
  assert.match(workflow, /source revision[\s\S]*environment[\s\S]*hardware[\s\S]*run ID[\s\S]*seed/i);
});

test('paper guide establishes evidence before result prose and writes abstract last', async () => {
  const guide = await fs.readFile('docs/paper-writing.md', 'utf8');
  const recommended = guide.match(/## Recommended workflow\n([\s\S]*?)\n## Skill map/);
  assert.ok(recommended);

  const analysisAt = recommended[1].indexOf('`results-analyzing-experiments`');
  const resultsAt = recommended[1].indexOf('`paper-writing-experimental-results`');
  const conclusionAt = recommended[1].indexOf('`paper-writing-conclusion`');
  const abstractAt = recommended[1].indexOf('`paper-writing-abstract`');
  const reviewAt = recommended[1].indexOf('`paper-reviewing`');
  assert.ok(analysisAt >= 0 && resultsAt > analysisAt);
  assert.ok(conclusionAt >= 0 && abstractAt > conclusionAt && reviewAt > abstractAt);
});

test('active documentation links to the user guides and design-history docs stay removed', async () => {
  const readme = await fs.readFile('README.md', 'utf8');
  assert.match(readme, /\[research workflow guide\]\(docs\/research-workflow\.md\)/);
  assert.match(readme, /\[skill reference\]\(docs\/skill-reference\.md\)/);

  for (const file of [
    'docs/install/codex.md',
    'docs/install/claude-code.md',
    'docs/install/opencode.md'
  ]) {
    const text = await fs.readFile(file, 'utf8');
    assert.match(text, /\[research workflow guide\]\(\.\.\/research-workflow\.md\)/, file);
    assert.match(text, /\[skill reference\]\(\.\.\/skill-reference\.md\)/, file);
  }

  await assert.rejects(fs.access('docs/superpowers'));
});
