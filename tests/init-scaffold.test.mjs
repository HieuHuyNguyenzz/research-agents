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
      'paper/sections/abstract.tex', 'paper/sections/introduction.tex',
      'paper/sections/related-work.tex', 'paper/sections/methodology.tex',
      'paper/sections/experimental-results.tex', 'paper/sections/conclusion.tex',
      'docs/architecture.md', 'docs/methodology.md', 'docs/experiments.md', 'docs/reproduction.md',
      'src/core/.gitkeep', 'src/configs/baselines/.gitkeep', 'src/configs/proposed/.gitkeep',
      'src/configs/ablations/.gitkeep', 'src/configs/experiments/.gitkeep', 'src/scripts/.gitkeep',
      'src/data/.gitkeep', 'tests/.gitkeep', 'results/raw/.gitkeep', 'results/processed/.gitkeep',
      'results/analysis/.gitkeep', 'results/figures/.gitkeep', 'results/tables/.gitkeep',
      'paper/figures/.gitkeep', 'paper/tables/.gitkeep',
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

test('reports ancestor file blockers before checking descendant targets', async () => {
  await withTempRoot(async (tempRoot) => {
    await writeFile(path.join(tempRoot, 'docs'), 'not a directory');

    const plan = await planWrites(tempRoot, manifest);

    assert.deepEqual(plan.conflicts, ['docs']);
  });
});

test('renders metadata into README, docs, and paper entry point', () => {
  assert.match(renderFile('README.md', manifest, conferenceTemplate), /Robust FL/);
  assert.match(renderFile('docs/methodology.md', manifest, conferenceTemplate), /Compare robustness/);
  assert.match(renderFile('paper/main.tex', manifest, conferenceTemplate), /\\documentclass\[conference\]\{IEEEtran\}/);
  assert.match(renderFile('paper/main.tex', manifest, conferenceTemplate), /\\title\{Robust FL\}/);
  assert.match(renderFile('paper/main.tex', manifest, conferenceTemplate), /\\author\{Ada Lovelace, Grace Hopper\}/);
  assert.match(renderFile('paper/main.tex', manifest, conferenceTemplate), /\\input\{sections\/abstract\}/);
  assert.match(renderFile('paper/main.tex', manifest, conferenceTemplate), /\\input\{sections\/conclusion\}/);
  assert.match(renderFile('paper/sections/abstract.tex', manifest), /\\begin\{abstract\}/);
  assert.equal(renderFile('paper/sections/introduction.tex', manifest), '\\section{Introduction}\n');
});

test('replaces template sample body with the canonical manuscript include graph', () => {
  const sampleTemplate = {
    text: String.raw`\documentclass[conference]{IEEEtran}
\title{Sample}
\author{Sample Author}
\begin{document}
\maketitle
\section{Template Sample Content}
Remove this body.
\end{document}
`
  };
  const paper = renderFile('paper/main.tex', manifest, sampleTemplate);
  assert.doesNotMatch(paper, /Template Sample Content|Remove this body/);
  for (const section of [
    'abstract', 'introduction', 'related-work', 'methodology',
    'experimental-results', 'conclusion'
  ]) {
    assert.match(paper, new RegExp(`\\\\input\\{sections/${section}\\}`));
  }
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

test('escapes metadata for Markdown, TOML, BibTeX, and LaTeX outputs', () => {
  const hostileManifest = parseManifest({
    projectName: 'Robust\\{FL}\n## injected',
    overview: 'Quote " and a newline\n[project]\nname = "injected"',
    objectives: 'Keep markdown # literal',
    paperTemplate: 'ieee-conference'
  });

  const readme = renderFile('README.md', hostileManifest);
  const pyproject = renderFile('pyproject.toml', hostileManifest);
  const bibliography = renderFile('paper/references.bib', hostileManifest);
  const paper = renderFile('paper/main.tex', hostileManifest, conferenceTemplate);

  assert.ok(readme.includes(String.raw`Robust\\\{FL\} \#\# injected`));
  assert.doesNotMatch(readme, /\n## injected/);
  assert.match(pyproject, /description = "Quote \\" and a newline\\n\[project\]\\nname = \\"injected\\""/);
  assert.doesNotMatch(bibliography, /\n## injected/);
  assert.match(
    renderFile('paper/references.bib', parseManifest({
      projectName: 'Study 100%', overview: 'Percent handling.', paperTemplate: 'ieee-conference'
    })),
    /Study 100\\%/
  );
  assert.ok(paper.includes(String.raw`Robust\textbackslash{}\{FL\} \#\# injected`));
});

test('renders non-paper targets without template material', () => {
  assert.match(renderFile('README.md', manifest), /Robust FL/);
});
