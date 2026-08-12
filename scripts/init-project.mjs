import { lstat, mkdir, open, readFile, rename, rmdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseManifest, validateManifest } from './lib/init/manifest.mjs';
import { planWrites, selectWriteTargets } from './lib/init/paths.mjs';
import { renderFile } from './lib/init/render.mjs';
import { fetchTemplate } from './lib/init/templates-fetch.mjs';
import { getTemplateDefinition } from './lib/init/templates.mjs';

const CONFLICT_MODES = new Set(['abort', 'overwrite', 'skip']);
const TEMPLATE_FILES = new Set([
  'paper/main.tex',
  'paper/references.bib',
  'paper/TEMPLATE.md'
]);

class CliArgumentError extends Error {}

function templateProvenance(definition, material) {
  return `# Template provenance\n\n- Template ID: ${definition.id}\n- Source URL: ${definition.sourceUrl}\n- Retrieved at (UTC): ${new Date().toISOString()}\n- SHA-256: ${material.sha256}\n- Expected class option: ${definition.expectedClassOption}\n\nReview the template guidance before submission.\n`;
}

function validateConflictMode(conflictMode) {
  const mode = conflictMode ?? 'abort';
  if (!CONFLICT_MODES.has(mode)) {
    throw new TypeError('conflictMode must be abort, overwrite, or skip');
  }
  return mode;
}

function validatedManifest(input) {
  const manifest = parseManifest(input);
  const errors = validateManifest(manifest);
  if (errors.length > 0) {
    throw new Error(`Invalid manifest: ${errors.join('; ')}`);
  }
  return manifest;
}

function writeContent(relativePath, manifest, definition, material) {
  if (relativePath === 'paper/main.tex') return material.text;
  if (relativePath === 'paper/references.bib') return material.referencesBib ?? '';
  if (relativePath === 'paper/TEMPLATE.md') return templateProvenance(definition, material);
  return renderFile(relativePath, manifest, material);
}

function parentDirectories(rootDir, relativePaths) {
  const directories = new Set([rootDir]);
  for (const relativePath of relativePaths) {
    let parent = path.posix.dirname(relativePath);
    while (parent !== '.') {
      directories.add(path.join(rootDir, ...parent.split('/')));
      parent = path.posix.dirname(parent);
    }
  }

  return [...directories].sort((left, right) => (
    left.split(path.sep).length - right.split(path.sep).length || left.localeCompare(right)
  ));
}

function pathIdentity(status) {
  const dev = Number(status.dev);
  const ino = Number(status.ino);
  return Number.isSafeInteger(dev) && Number.isSafeInteger(ino) && ino > 0
    ? { dev, ino }
    : undefined;
}

function hasSameIdentity(status, identity) {
  const current = pathIdentity(status);
  return Boolean(current && identity && current.dev === identity.dev && current.ino === identity.ino);
}

async function assertNotSymlink(targetPath) {
  try {
    const status = await lstat(targetPath);
    if (status.isSymbolicLink()) throw new Error(`Refusing symlink path: ${targetPath}`);
    return status;
  } catch (error) {
    if (error?.code === 'ENOENT') return undefined;
    throw error;
  }
}

async function ensureRootDirectory(rootDir, createdDirectories) {
  const rootStatus = await assertNotSymlink(rootDir);
  if (rootStatus) {
    if (!rootStatus.isDirectory()) throw new Error(`Root path is not a directory: ${rootDir}`);
    return;
  }

  const missing = [];
  let current = rootDir;
  while (true) {
    const status = await assertNotSymlink(current);
    if (status) {
      if (!status.isDirectory()) throw new Error(`Root path is not a directory: ${current}`);
      break;
    }
    missing.push(current);
    const parent = path.dirname(current);
    if (parent === current) throw new Error(`Root path has no existing parent: ${rootDir}`);
    current = parent;
  }

  for (const directory of missing.reverse()) {
    await mkdir(directory);
    const createdStatus = await assertNotSymlink(directory);
    createdDirectories.push({ path: directory, identity: pathIdentity(createdStatus) });
  }
}

async function ensureDirectory(directory, createdDirectories) {
  const status = await assertNotSymlink(directory);
  if (status) {
    if (!status.isDirectory()) throw new Error(`Directory path is not a directory: ${directory}`);
    return;
  }
  await mkdir(directory);
  const createdStatus = await assertNotSymlink(directory);
  createdDirectories.push({ path: directory, identity: pathIdentity(createdStatus) });
}

async function rollback(createdFiles, createdDirectories, rootDir) {
  for (const created of [...createdFiles].reverse()) {
    const targetPath = path.join(rootDir, ...created.path.split('/'));
    const status = await assertNotSymlink(targetPath).catch(() => undefined);
    if (status && hasSameIdentity(status, created.identity)) {
      await rm(targetPath, { force: true }).catch(() => {});
    }
  }
  for (const created of [...createdDirectories].reverse()) {
    const status = await assertNotSymlink(created.path).catch(() => undefined);
    if (status?.isDirectory() && hasSameIdentity(status, created.identity)) {
      await rmdir(created.path).catch(() => {});
    }
  }
}

async function createFile(targetPath, content, writeFileImpl) {
  if (writeFileImpl !== writeFile) {
    await writeFileImpl(targetPath, content, { encoding: 'utf8', flag: 'wx' });
    return pathIdentity(await assertNotSymlink(targetPath));
  }

  const handle = await open(targetPath, 'wx');
  try {
    await handle.writeFile(content, 'utf8');
    return pathIdentity(await handle.stat());
  } finally {
    await handle.close();
  }
}

async function overwriteFile(targetPath, content, writeFileImpl) {
  if (writeFileImpl !== writeFile) {
    await writeFileImpl(targetPath, content, 'utf8');
    return;
  }

  const temporaryPath = path.join(
    path.dirname(targetPath),
    `.${path.basename(targetPath)}.init-${process.pid}-${Date.now()}`
  );
  const handle = await open(temporaryPath, 'wx');
  try {
    await handle.writeFile(content, 'utf8');
  } finally {
    await handle.close();
  }
  try {
    await rename(temporaryPath, targetPath);
  } catch (error) {
    await rm(temporaryPath, { force: true }).catch(() => {});
    throw error;
  }
}

/**
 * Builds, validates, then materializes a research-project scaffold. All
 * conflicts are resolved before any download or filesystem mutation begins.
 */
export async function runInit({
  rootDir, manifest: manifestInput, conflictMode, confirmOverwrite = false, fetchImpl,
  writeFileImpl = writeFile
} = {}) {
  if (typeof rootDir !== 'string' || !rootDir) {
    throw new TypeError('rootDir must be a non-empty string');
  }

  const manifest = validatedManifest(manifestInput);
  const mode = validateConflictMode(conflictMode);
  const definition = getTemplateDefinition(manifest.paperTemplate);
  const root = path.resolve(rootDir);
  const createdFiles = [];
  const createdDirectories = [];

  try {
    await ensureRootDirectory(root, createdDirectories);
    const plan = await planWrites(root, manifest);
    const selection = selectWriteTargets(plan, mode);

    if (mode === 'abort' && selection.conflicts.length > 0) {
      throw new Error(`Initialization conflicts: ${selection.conflicts.join(', ')}`);
    }
    if (mode === 'overwrite' && selection.conflicts.length > 0 && confirmOverwrite !== true) {
      throw new Error('Overwrite mode requires explicit confirmation');
    }

    const needsTemplate = selection.files.some((relativePath) => TEMPLATE_FILES.has(relativePath));
    const material = needsTemplate ? await fetchTemplate(definition, { fetchImpl }) : undefined;
    const conflicts = new Set(selection.conflicts);

    for (const directory of parentDirectories(root, selection.files)) {
      await ensureDirectory(directory, createdDirectories);
    }

    for (const relativePath of selection.files) {
      const targetPath = path.join(root, ...relativePath.split('/'));
      const content = writeContent(relativePath, manifest, definition, material);
      await assertNotSymlink(targetPath);
      if (conflicts.has(relativePath)) {
        await overwriteFile(targetPath, content, writeFileImpl);
      } else {
        createdFiles.push({
          path: relativePath,
          identity: await createFile(targetPath, content, writeFileImpl)
        });
      }
    }

    return {
      created: selection.files,
      skipped: selection.skipped,
      conflicts: selection.conflicts,
      template: {
        id: definition.id,
        sourceUrl: definition.sourceUrl,
        sha256: material?.sha256 ?? null
      }
    };
  } catch (error) {
    await rollback(createdFiles, createdDirectories, root);
    error.created = createdFiles.map((created) => created.path);
    throw error;
  }
}

function usage() {
  return 'Usage: node scripts/init-project.mjs --root <repo> --manifest <manifest.json> --conflicts abort|overwrite|skip';
}

function parseCliArguments(argumentsList) {
  const allowed = new Set(['--root', '--manifest', '--conflicts']);
  const values = {};

  for (let index = 0; index < argumentsList.length; index += 1) {
    const name = argumentsList[index];
    if (!allowed.has(name)) throw new CliArgumentError(`Unknown argument: ${name}`);
    if (Object.hasOwn(values, name)) throw new CliArgumentError(`Argument supplied more than once: ${name}`);
    const value = argumentsList[index + 1];
    if (!value || value.startsWith('--')) throw new CliArgumentError(`Missing value for ${name}`);
    values[name] = value;
    index += 1;
  }

  if (!values['--root'] || !values['--manifest'] || !values['--conflicts']) {
    throw new CliArgumentError(usage());
  }
  if (!CONFLICT_MODES.has(values['--conflicts'])) {
    throw new CliArgumentError('conflicts must be abort, overwrite, or skip');
  }
  return {
    rootDir: values['--root'],
    manifestPath: values['--manifest'],
    conflictMode: values['--conflicts']
  };
}

async function loadCliManifest(manifestPath) {
  let text;
  try {
    text = await readFile(manifestPath, 'utf8');
  } catch {
    throw new CliArgumentError(`Manifest file could not be read: ${manifestPath}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new CliArgumentError('Manifest JSON is invalid');
  }
  let manifest;
  try {
    manifest = parseManifest(parsed);
  } catch {
    throw new CliArgumentError('Manifest JSON must contain an object');
  }
  const errors = validateManifest(manifest);
  if (errors.length > 0) throw new CliArgumentError(errors.join('; '));
  return parsed;
}

async function main() {
  try {
    const options = parseCliArguments(process.argv.slice(2));
    const manifest = await loadCliManifest(options.manifestPath);
    const report = await runInit({
      rootDir: options.rootDir,
      manifest,
      conflictMode: options.conflictMode,
      confirmOverwrite: options.conflictMode === 'overwrite'
    });
    process.stdout.write(`${JSON.stringify(report)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = error instanceof CliArgumentError ? 2 : 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
