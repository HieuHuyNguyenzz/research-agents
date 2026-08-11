import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { parseManifest } from '../scripts/lib/init/manifest.mjs';
import { planWrites } from '../scripts/lib/init/paths.mjs';
import { renderFile } from '../scripts/lib/init/render.mjs';

const manifest = parseManifest({
  projectName: 'Robust FL',
  overview: 'Study robust aggregation.',
  objectives: 'Compare robustness',
  researchQuestions: 'Which aggregators resist Byzantine clients?',
  dataSources: 'CIFAR-10',
  methods: 'FedAvg, Trimmed mean',
  authors: 'Ada Lovelace, Grace Hopper',
  paperTemplate: 'IEEE conference'
});

const conferenceTemplate = {
  text: String.raw`\documentclass[conference]{IEEEtran}
\title{{{PROJECT_NAME}}}
\author{{{AUTHORS}}}
\begin{document}
\maketitle
\end{document}
`
};

async function withTempRoot(run) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'research-init-'));
  try {
    await run(tempRoot);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

test('plans the complete research tree without touching disk', async () => {
  await withTempRoot(async (tempRoot) => {
    const plan = await planWrites(tempRoot, manifest);

    assert.ok(plan.files.includes('README.md'));
    assert.ok(plan.files.includes('paper/main.tex'));
    assert.ok(plan.files.includes('results/figures/.gitkeep'));
    assert.deepEqual(plan.conflicts, []);
    assert.deepEqual(plan.files, [
      'README.md', 'AGENTS.md', '.gitignore', 'pyproject.toml',
      'paper/main.tex', 'paper/references.bib', 'paper/TEMPLATE.md',
      'docs/architecture.md', 'docs/methodology.md', 'docs/experiments.md', 'docs/reproduction.md',
      'src/core/.gitkeep', 'src/configs/baselines/.gitkeep', 'src/configs/proposed/.gitkeep',
      'src/configs/ablations/.gitkeep', 'src/configs/experiments/.gitkeep', 'src/scripts/.gitkeep',
      'src/data/.gitkeep', 'tests/.gitkeep', 'results/raw/.gitkeep', 'results/processed/.gitkeep',
      'results/analysis/.gitkeep', 'results/figures/.gitkeep', 'results/tables/.gitkeep',
      'paper/sections/.gitkeep', 'paper/figures/.gitkeep', 'paper/tables/.gitkeep',
      'paper/templates/.gitkeep', 'docs/notes/.gitkeep', 'superpowers/specs/.gitkeep',
      'superpowers/plans/.gitkeep', 'superpowers/decisions/.gitkeep'
    ]);
    assert.ok(plan.directories.includes('src/configs/experiments'));
    assert.ok(plan.directories.includes('superpowers/decisions'));
    assert.deepEqual(await readdir(tempRoot), []);
  });
});

test('reports existing files before any write', async () => {
  await withTempRoot(async (tempRoot) => {
    await writeFile(path.join(tempRoot, 'README.md'), 'keep me');

    const plan = await planWrites(tempRoot, manifest);

    assert.deepEqual(plan.conflicts, ['README.md']);
  });
});

test('renders metadata into README, docs, and paper entry point', () => {
  assert.match(renderFile('README.md', manifest, conferenceTemplate), /Robust FL/);
  assert.match(renderFile('docs/methodology.md', manifest, conferenceTemplate), /Compare robustness/);
  assert.match(renderFile('paper/main.tex', manifest, conferenceTemplate), /\\documentclass\[conference\]\{IEEEtran\}/);
  assert.match(renderFile('paper/main.tex', manifest, conferenceTemplate), /\\title\{Robust FL\}/);
  assert.match(renderFile('paper/main.tex', manifest, conferenceTemplate), /\\author\{Ada Lovelace, Grace Hopper\}/);
});

test('uses not specified markers and rejects unknown targets', () => {
  const blankManifest = parseManifest({
    projectName: 'Sparse Study',
    overview: 'A minimal study.',
    paperTemplate: 'ieee-journal'
  });

  assert.match(renderFile('docs/experiments.md', blankManifest, conferenceTemplate), /Not specified\./);
  assert.throws(
    () => renderFile('outside.md', manifest, conferenceTemplate),
    /Unknown scaffold target: outside\.md/
  );
});
