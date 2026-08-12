import assert from 'node:assert/strict';
import { execFile as execFileCallback } from 'node:child_process';
import { mkdir, mkdtemp, readFile, realpath, rename, rm, stat, symlink, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';

import { runInit } from '../scripts/init-project.mjs';

const execFile = promisify(execFileCallback);
const source = String.raw`\documentclass[conference]{IEEEtran}
\title{{{PROJECT_NAME}}}
\author{{{AUTHORS}}}
\begin{document}
\maketitle
\end{document}
`;
const manifest = {
  projectName: 'Robust FL',
  overview: 'Study robust aggregation.',
  objectives: 'Compare robustness',
  researchQuestions: 'Which aggregators resist Byzantine clients?',
  dataSources: 'CIFAR-10',
  methods: 'FedAvg, Trimmed mean',
  authors: 'Ada Lovelace, Grace Hopper',
  paperTemplate: 'ieee-conference'
};

function fakeFetch() {
  return Promise.resolve(new Response(source));
}

async function withTempRoot(run) {
  const tempRoot = await temporaryDirectory('research-init-cli-');
  try {
    await run(tempRoot);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function temporaryDirectory(prefix) {
  return mkdtemp(path.join(await realpath(os.tmpdir()), prefix));
}

async function runCli(args) {
  try {
    const result = await execFile(process.execPath, ['scripts/init-project.mjs', ...args], {
      cwd: process.cwd()
    });
    return { code: 0, ...result };
  } catch (error) {
    return {
      code: error.code,
      stdout: error.stdout,
      stderr: error.stderr
    };
  }
}

test('creates an empty repository and reports all generated paths', async () => {
  await withTempRoot(async (tempRoot) => {
    const result = await runInit({ rootDir: tempRoot, manifest, fetchImpl: fakeFetch });

    assert.ok(result.created.includes('README.md'));
    assert.ok(result.created.includes('paper/TEMPLATE.md'));
    assert.deepEqual(result.skipped, []);
    assert.deepEqual(result.conflicts, []);
    assert.deepEqual(result.template.id, 'ieee-conference');
    assert.ok(await stat(path.join(tempRoot, 'paper/main.tex')));
    assert.ok(await stat(path.join(tempRoot, 'paper/TEMPLATE.md')));
  });
});

test('abort mode performs no writes or template request when conflicts exist', async () => {
  await withTempRoot(async (tempRoot) => {
    let fetchCalls = 0;
    await writeFile(path.join(tempRoot, 'README.md'), 'keep');

    await assert.rejects(
      runInit({
        rootDir: tempRoot,
        manifest,
        conflictMode: 'abort',
        fetchImpl: async () => {
          fetchCalls += 1;
          return new Response(source);
        }
      }),
      /conflicts: README\.md/
    );

    assert.equal(fetchCalls, 0);
    assert.equal(await readFile(path.join(tempRoot, 'README.md'), 'utf8'), 'keep');
  });
});

test('skip mode preserves conflicts and creates remaining files', async () => {
  await withTempRoot(async (tempRoot) => {
    await writeFile(path.join(tempRoot, 'README.md'), 'keep');

    const result = await runInit({
      rootDir: tempRoot, manifest, conflictMode: 'skip', fetchImpl: fakeFetch
    });

    assert.deepEqual(result.skipped, ['README.md']);
    assert.equal(await readFile(path.join(tempRoot, 'README.md'), 'utf8'), 'keep');
    assert.ok(await stat(path.join(tempRoot, 'paper/main.tex')));
  });
});

test('skip mode does not fetch a template when all template files conflict', async () => {
  await withTempRoot(async (tempRoot) => {
    await mkdir(path.join(tempRoot, 'paper'), { recursive: true });
    await Promise.all([
      writeFile(path.join(tempRoot, 'paper/main.tex'), 'keep main'),
      writeFile(path.join(tempRoot, 'paper/references.bib'), 'keep references'),
      writeFile(path.join(tempRoot, 'paper/TEMPLATE.md'), 'keep provenance')
    ]);

    const result = await runInit({
      rootDir: tempRoot,
      manifest,
      conflictMode: 'skip',
      fetchImpl: async () => {
        throw new Error('template fetch must not run');
      }
    });

    assert.deepEqual(result.skipped, [
      'paper/main.tex', 'paper/references.bib', 'paper/TEMPLATE.md'
    ]);
    assert.ok(await stat(path.join(tempRoot, 'README.md')));
  });
});

test('overwrite mode requires an explicit confirmation before replacing conflicts', async () => {
  await withTempRoot(async (tempRoot) => {
    await writeFile(path.join(tempRoot, 'README.md'), 'keep');

    await assert.rejects(
      runInit({ rootDir: tempRoot, manifest, conflictMode: 'overwrite', fetchImpl: fakeFetch }),
      /explicit confirmation/
    );
    assert.equal(await readFile(path.join(tempRoot, 'README.md'), 'utf8'), 'keep');

    const result = await runInit({
      rootDir: tempRoot,
      manifest,
      conflictMode: 'overwrite',
      confirmOverwrite: true,
      fetchImpl: fakeFetch
    });
    assert.ok(result.created.includes('README.md'));
    assert.match(await readFile(path.join(tempRoot, 'README.md'), 'utf8'), /Robust FL/);
  });
});

test('rejects symlinked roots and target paths before fetching or writing outside root', async () => {
  await withTempRoot(async (tempRoot) => {
    const outside = await temporaryDirectory('research-init-outside-');
    const rootLink = `${tempRoot}-link`;
    const outsideReadme = path.join(outside, 'README.md');
    try {
      await writeFile(outsideReadme, 'outside data');
      await symlink(outsideReadme, path.join(tempRoot, 'README.md'));
      await assert.rejects(
        runInit({
          rootDir: tempRoot,
          manifest,
          conflictMode: 'overwrite',
          confirmOverwrite: true,
          fetchImpl: async () => {
            throw new Error('template fetch must not run');
          }
        }),
        /symlink/i
      );
      assert.equal(await readFile(outsideReadme, 'utf8'), 'outside data');

      await unlink(path.join(tempRoot, 'README.md'));
      await symlink(outside, path.join(tempRoot, 'docs'));
      await assert.rejects(
        runInit({
          rootDir: tempRoot,
          manifest,
          fetchImpl: async () => {
            throw new Error('template fetch must not run');
          }
        }),
        /symlink/i
      );

      await symlink(tempRoot, rootLink);
      await assert.rejects(
        runInit({
          rootDir: rootLink,
          manifest,
          fetchImpl: async () => {
            throw new Error('template fetch must not run');
          }
        }),
        /symlink/i
      );

      const nestedRoot = path.join(tempRoot, 'link', 'project');
      await symlink(outside, path.join(tempRoot, 'link'));
      await assert.rejects(
        runInit({
          rootDir: nestedRoot,
          manifest,
          fetchImpl: async () => {
            throw new Error('template fetch must not run');
          }
        }),
        /symlink/i
      );
    } finally {
      await unlink(path.join(tempRoot, 'docs')).catch(() => {});
      await unlink(path.join(tempRoot, 'link')).catch(() => {});
      await unlink(rootLink).catch(() => {});
      await rm(outside, { recursive: true, force: true });
    }
  });
});

test('rejects a root swapped to an outside symlink during template fetch', async () => {
  await withTempRoot(async (tempRoot) => {
    const root = path.join(tempRoot, 'project');
    const originalRoot = path.join(tempRoot, 'project-original');
    const outside = await temporaryDirectory('research-init-outside-');
    try {
      await mkdir(root);
      await assert.rejects(
        runInit({
          rootDir: root,
          manifest,
          fetchImpl: async () => {
            await rename(root, originalRoot);
            await symlink(outside, root);
            return new Response(source);
          }
        }),
        /symlink|escapes project root/i
      );
      await assert.rejects(stat(path.join(outside, 'README.md')), { code: 'ENOENT' });
    } finally {
      await unlink(root).catch(() => {});
      await rename(originalRoot, root).catch(() => {});
      await rm(outside, { recursive: true, force: true });
    }
  });
});

test('retains a replaced overwrite temporary file after a failed rename', async () => {
  await withTempRoot(async (tempRoot) => {
    await writeFile(path.join(tempRoot, 'README.md'), 'keep');
    let retainedError;
    await assert.rejects(
      runInit({
        rootDir: tempRoot,
        manifest,
        conflictMode: 'overwrite',
        confirmOverwrite: true,
        fetchImpl: fakeFetch,
        renameImpl: async (temporaryPath) => {
          await rename(temporaryPath, `${temporaryPath}.original`);
          await writeFile(temporaryPath, 'external replacement');
          throw new Error('injected rename failure');
        }
      }),
      (error) => {
        retainedError = error;
        return /retained temporary file/.test(error.message);
      }
    );

    assert.equal(await readFile(retainedError.temporaryPath, 'utf8'), 'external replacement');
  });
});

test('leaves invocation-created paths on failure rather than risking deletion of a raced replacement', async () => {
  await withTempRoot(async (tempRoot) => {
    await assert.rejects(
      runInit({
        rootDir: tempRoot,
        manifest,
        fetchImpl: async () => {
          await mkdir(path.join(tempRoot, 'docs'), { recursive: true });
          await writeFile(path.join(tempRoot, 'docs/architecture.md'), 'external conflict');
          return new Response(source);
        }
      }),
      /EEXIST/
    );

    assert.ok(await stat(path.join(tempRoot, 'README.md')));
    assert.equal(await readFile(path.join(tempRoot, 'docs/architecture.md'), 'utf8'), 'external conflict');
  });
});

test('rollback preserves a concurrently replaced invocation-created path', async () => {
  await withTempRoot(async (tempRoot) => {
    const readme = path.join(tempRoot, 'README.md');
    await assert.rejects(
      runInit({
        rootDir: tempRoot,
        manifest,
        fetchImpl: fakeFetch,
        writeFileImpl: async (targetPath, content, options) => {
          if (targetPath.endsWith('AGENTS.md')) {
            await rename(readme, path.join(tempRoot, 'original-readme.md'));
            await writeFile(readme, 'external replacement');
            throw new Error('injected later write failure');
          }
          await writeFile(targetPath, content, options);
        }
      }),
      /injected later write failure/
    );
    assert.equal(await readFile(readme, 'utf8'), 'external replacement');
  });
});

test('creates a nested missing root before fetching the template', async () => {
  await withTempRoot(async (tempRoot) => {
    const nestedRoot = path.join(tempRoot, 'one', 'two', 'project');
    let rootExistsAtFetch = false;

    await runInit({
      rootDir: nestedRoot,
      manifest,
      fetchImpl: async () => {
        rootExistsAtFetch = true;
        assert.ok(await stat(nestedRoot));
        return new Response(source);
      }
    });

    assert.equal(rootExistsAtFetch, true);
    assert.ok(await stat(path.join(nestedRoot, 'README.md')));
  });
});

test('CLI argument failures use exit code 2 and concise stderr messages', async () => {
  await withTempRoot(async (tempRoot) => {
    const malformed = path.join(tempRoot, 'malformed.json');
    const scalar = path.join(tempRoot, 'scalar.json');
    const invalidTemplate = path.join(tempRoot, 'invalid-template.json');
    await writeFile(malformed, '{', 'utf8');
    await writeFile(scalar, '[]', 'utf8');
    await writeFile(invalidTemplate, JSON.stringify({
      ...manifest,
      paperTemplate: 'acl'
    }), 'utf8');

    const missing = await runCli([]);
    assert.equal(missing.code, 2);
    assert.match(missing.stderr, /Usage:/);

    const unknownMode = await runCli([
      '--root', tempRoot, '--manifest', malformed, '--conflicts', 'replace'
    ]);
    assert.equal(unknownMode.code, 2);
    assert.match(unknownMode.stderr, /conflicts must be abort, overwrite, or skip/);

    const malformedResult = await runCli([
      '--root', tempRoot, '--manifest', malformed, '--conflicts', 'abort'
    ]);
    assert.equal(malformedResult.code, 2);
    assert.match(malformedResult.stderr, /Manifest JSON is invalid/);

    const scalarResult = await runCli([
      '--root', tempRoot, '--manifest', scalar, '--conflicts', 'abort'
    ]);
    assert.equal(scalarResult.code, 2);
    assert.match(scalarResult.stderr, /Manifest JSON must contain an object/);

    const invalidTemplateResult = await runCli([
      '--root', tempRoot, '--manifest', invalidTemplate, '--conflicts', 'abort'
    ]);
    assert.equal(invalidTemplateResult.code, 2);
    assert.match(invalidTemplateResult.stderr, /paperTemplate must be ieee-conference or ieee-journal/);
  });
});

test('CLI prints a stable JSON success report on stdout', async () => {
  await withTempRoot(async (tempRoot) => {
    const manifestPath = path.join(tempRoot, 'manifest.json');
    await mkdir(path.join(tempRoot, 'paper'), { recursive: true });
    await Promise.all([
      writeFile(path.join(tempRoot, 'paper/main.tex'), 'keep main'),
      writeFile(path.join(tempRoot, 'paper/references.bib'), 'keep references'),
      writeFile(path.join(tempRoot, 'paper/TEMPLATE.md'), 'keep provenance'),
      writeFile(manifestPath, JSON.stringify(manifest), 'utf8')
    ]);

    const result = await runCli([
      '--root', tempRoot, '--manifest', manifestPath, '--conflicts', 'skip'
    ]);

    assert.equal(result.code, 0);
    assert.equal(result.stderr, '');
    assert.deepEqual(JSON.parse(result.stdout), {
      created: [
        'README.md', 'AGENTS.md', '.gitignore', 'pyproject.toml',
        'docs/architecture.md', 'docs/methodology.md', 'docs/experiments.md', 'docs/reproduction.md',
        'src/core/.gitkeep', 'src/configs/baselines/.gitkeep', 'src/configs/proposed/.gitkeep',
        'src/configs/ablations/.gitkeep', 'src/configs/experiments/.gitkeep', 'src/scripts/.gitkeep',
        'src/data/.gitkeep', 'tests/.gitkeep', 'results/raw/.gitkeep', 'results/processed/.gitkeep',
        'results/analysis/.gitkeep', 'results/figures/.gitkeep', 'results/tables/.gitkeep',
        'paper/sections/.gitkeep', 'paper/figures/.gitkeep', 'paper/tables/.gitkeep',
        'paper/templates/.gitkeep', 'docs/notes/.gitkeep', 'superpowers/specs/.gitkeep',
        'superpowers/plans/.gitkeep', 'superpowers/decisions/.gitkeep'
      ],
      skipped: ['paper/main.tex', 'paper/references.bib', 'paper/TEMPLATE.md'],
      conflicts: ['paper/TEMPLATE.md', 'paper/main.tex', 'paper/references.bib'],
      template: {
        id: 'ieee-conference',
        sourceUrl: 'https://www.overleaf.com/latex/templates/ieee-conference-template/grfzhhncsfqn',
        sha256: null
      }
    });
  });
});
