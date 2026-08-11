import { access } from 'node:fs/promises';
import path from 'node:path';

const GENERATED_FILES = Object.freeze([
  'README.md',
  'AGENTS.md',
  '.gitignore',
  'pyproject.toml',
  'paper/main.tex',
  'paper/references.bib',
  'paper/TEMPLATE.md',
  'docs/architecture.md',
  'docs/methodology.md',
  'docs/experiments.md',
  'docs/reproduction.md'
]);

const EMPTY_DIRECTORIES = Object.freeze([
  'src/core',
  'src/configs/baselines',
  'src/configs/proposed',
  'src/configs/ablations',
  'src/configs/experiments',
  'src/scripts',
  'src/data',
  'tests',
  'results/raw',
  'results/processed',
  'results/analysis',
  'results/figures',
  'results/tables',
  'paper/sections',
  'paper/figures',
  'paper/tables',
  'paper/templates',
  'docs/notes',
  'superpowers/specs',
  'superpowers/plans',
  'superpowers/decisions'
]);

const GITKEEP_FILES = Object.freeze(EMPTY_DIRECTORIES.map((directory) => `${directory}/.gitkeep`));

/** Complete relative target list, including Git-tracked empty directories. */
export const TARGET_PATHS = Object.freeze([...GENERATED_FILES, ...GITKEEP_FILES]);

function parentDirectories(relativePath) {
  const directories = [];
  let current = path.posix.dirname(relativePath);

  while (current !== '.') {
    directories.push(current);
    current = path.posix.dirname(current);
  }

  return directories;
}

export const TARGET_DIRECTORIES = Object.freeze([
  ...new Set(TARGET_PATHS.flatMap(parentDirectories))
].sort());

async function exists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

/**
 * Computes an ordered, side-effect-free scaffold write plan.
 * `manifest` is deliberately accepted here so the planning interface remains
 * aligned with the CLI, even though scaffold paths do not vary by metadata.
 */
export async function planWrites(rootDir, manifest) {
  void manifest;
  if (typeof rootDir !== 'string' || !rootDir) {
    throw new TypeError('rootDir must be a non-empty string');
  }

  const root = path.resolve(rootDir);
  const conflicts = [];

  for (const relativePath of TARGET_PATHS) {
    if (await exists(path.join(root, ...relativePath.split('/')))) {
      conflicts.push(relativePath);
    }
  }

  return {
    files: [...TARGET_PATHS],
    directories: [...TARGET_DIRECTORIES],
    conflicts
  };
}
