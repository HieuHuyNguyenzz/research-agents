import { lstat, mkdir, open, readFile, realpath, rename, rmdir, unlink, writeFile } from 'node:fs/promises';
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

function templateProvenance(definition, material, retrievedAt = new Date().toISOString()) {
  return `# Template provenance\n\n- Template ID: ${definition.id}\n- Source URL: ${definition.sourceUrl}\n- Retrieved at (UTC): ${retrievedAt}\n- SHA-256: ${material.sha256}\n- Expected class option: ${definition.expectedClassOption}\n\nReview the template guidance before submission.\n`;
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

function writeContent(relativePath, manifest, definition, material, retrievedAt) {
  if (relativePath === 'paper/main.tex') return renderFile(relativePath, manifest, material);
  if (relativePath === 'paper/references.bib') return material.referencesBib ?? '';
  if (relativePath === 'paper/TEMPLATE.md') {
    return templateProvenance(definition, material, retrievedAt);
  }
  return renderFile(relativePath, manifest, material);
}

function identity(status) {
  return { dev: status.dev, ino: status.ino, kind: status.isDirectory() ? 'directory' : 'file' };
}

function sameIdentity(status, expected) {
  return status.dev === expected.dev
    && status.ino === expected.ino
    && (status.isDirectory() ? 'directory' : 'file') === expected.kind;
}

async function existingText(rootDir, relativePath) {
  try {
    return await readFile(path.join(rootDir, ...relativePath.split('/')), 'utf8');
  } catch (error) {
    if (['EISDIR', 'ENOENT', 'ENOTDIR'].includes(error?.code)) return undefined;
    throw error;
  }
}

function retainedRetrievalTime(existingProvenance) {
  const match = existingProvenance?.match(/^- Retrieved at \(UTC\): (.+)$/m);
  if (!match) return undefined;
  const timestamp = match[1].trim();
  return Number.isNaN(Date.parse(timestamp)) ? undefined : timestamp;
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

function isWithinRoot(rootPath, candidatePath) {
  return candidatePath === rootPath || candidatePath.startsWith(`${rootPath}${path.sep}`);
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

async function assertRootAncestorsNotSymlinks(rootDir) {
  const parsed = path.parse(rootDir);
  let current = parsed.root;
  await assertNotSymlink(current);

  for (const segment of path.relative(parsed.root, rootDir).split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    const status = await assertNotSymlink(current);
    if (status && !status.isDirectory()) {
      throw new Error(`Root path is not a directory: ${current}`);
    }
  }
}

async function assertSafeOperationPath(rootCanonical, targetPath) {
  await assertRootAncestorsNotSymlinks(path.dirname(targetPath));

  const isRoot = path.resolve(targetPath) === path.resolve(rootCanonical);
  if (!isRoot) {
    const parentCanonical = await realpath(path.dirname(targetPath));
    if (!isWithinRoot(rootCanonical, parentCanonical)) {
      throw new Error(`Path escapes project root: ${targetPath}`);
    }
  }

  const status = await assertNotSymlink(targetPath);
  if (status) {
    const targetCanonical = await realpath(targetPath);
    if (!isWithinRoot(rootCanonical, targetCanonical)) {
      throw new Error(`Path escapes project root: ${targetPath}`);
    }
  }
  return status;
}

async function ensureRootDirectory(rootDir, createdDirectories) {
  await assertRootAncestorsNotSymlinks(rootDir);
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
    if (!createdStatus?.isDirectory()) throw new Error(`Root path is not a directory: ${directory}`);
    createdDirectories.push({ absolutePath: directory, identity: identity(createdStatus) });
  }
}

async function ensureDirectory(rootCanonical, directory, createdDirectories) {
  const status = await assertSafeOperationPath(rootCanonical, directory);
  if (status) {
    if (!status.isDirectory()) throw new Error(`Directory path is not a directory: ${directory}`);
    return;
  }
  await mkdir(directory);
  const createdStatus = await assertSafeOperationPath(rootCanonical, directory);
  if (!createdStatus?.isDirectory()) throw new Error(`Directory path is not a directory: ${directory}`);
  createdDirectories.push({ absolutePath: directory, identity: identity(createdStatus) });
}

async function rollback(rootDir, createdFiles, createdDirectories) {
  const retained = [];
  for (const created of [...createdFiles].reverse()) {
    const targetPath = path.join(rootDir, ...created.path.split('/'));
    try {
      const status = await lstat(targetPath);
      if (!sameIdentity(status, created.identity)) {
        retained.push(created.path);
        continue;
      }
      // Portable Node 20 has no unlink-at-file-descriptor operation. The
      // identity check protects ordinary replacements, while a pathname swap
      // between this check and unlink remains a documented TOCTOU limit.
      await unlink(targetPath);
    } catch (error) {
      if (error?.code !== 'ENOENT') retained.push(created.path);
    }
  }

  for (const created of [...createdDirectories].reverse()) {
    try {
      const status = await lstat(created.absolutePath);
      if (!sameIdentity(status, created.identity)) {
        retained.push(path.relative(rootDir, created.absolutePath) || '.');
        continue;
      }
      await rmdir(created.absolutePath);
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        retained.push(path.relative(rootDir, created.absolutePath) || '.');
      }
    }
  }
  return [...new Set(retained)].sort();
}

async function createFile(rootCanonical, targetPath, content, writeFileImpl) {
  await assertSafeOperationPath(rootCanonical, targetPath);
  if (writeFileImpl !== writeFile) {
    await writeFileImpl(targetPath, content, { encoding: 'utf8', flag: 'wx' });
    const status = await assertNotSymlink(targetPath);
    return identity(status);
  }

  const handle = await open(targetPath, 'wx');
  try {
    await handle.writeFile(content, 'utf8');
    return identity(await handle.stat());
  } finally {
    await handle.close();
  }
}

async function overwriteFile(rootCanonical, targetPath, content, writeFileImpl, renameImpl) {
  await assertSafeOperationPath(rootCanonical, targetPath);
  if (writeFileImpl !== writeFile) {
    await writeFileImpl(targetPath, content, 'utf8');
    return;
  }

  const temporaryPath = path.join(
    path.dirname(targetPath),
    `.${path.basename(targetPath)}.init-${process.pid}-${Date.now()}`
  );
  await assertSafeOperationPath(rootCanonical, temporaryPath);
  const handle = await open(temporaryPath, 'wx');
  try {
    await handle.writeFile(content, 'utf8');
  } finally {
    await handle.close();
  }
  try {
    await assertSafeOperationPath(rootCanonical, temporaryPath);
    await assertSafeOperationPath(rootCanonical, targetPath);
    await renameImpl(temporaryPath, targetPath);
  } catch (error) {
    const retained = new Error(`${error.message}; retained temporary file: ${temporaryPath}`, {
      cause: error
    });
    retained.temporaryPath = temporaryPath;
    throw retained;
  }
}

/**
 * Builds, validates, then materializes a research-project scaffold. All
 * conflicts are resolved before any download or filesystem mutation begins.
 */
export async function runInit({
  rootDir, manifest: manifestInput, conflictMode, confirmOverwrite = false, fetchImpl,
  writeFileImpl = writeFile, renameImpl = rename
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
    const rootCanonical = await realpath(root);
    const plan = await planWrites(root, manifest);
    const plannedConflicts = new Set(plan.conflicts);
    const desired = new Map();
    const unchanged = new Set();
    const knownConflicts = new Set(plan.conflicts.filter((relativePath) => !plan.files.includes(relativePath)));

    for (const relativePath of plan.files.filter((target) => !TEMPLATE_FILES.has(target))) {
      const content = writeContent(relativePath, manifest, definition, undefined);
      desired.set(relativePath, content);
      if (!plannedConflicts.has(relativePath)) continue;
      const current = await existingText(root, relativePath);
      if (current === content) unchanged.add(relativePath);
      else knownConflicts.add(relativePath);
    }

    if (mode === 'abort' && knownConflicts.size > 0) {
      throw new Error(`Initialization conflicts: ${[...knownConflicts].sort().join(', ')}`);
    }

    const templateTargets = plan.files.filter((target) => TEMPLATE_FILES.has(target));
    const needsTemplate = templateTargets.some((target) => (
      !plannedConflicts.has(target) || mode !== 'skip'
    ));
    const material = needsTemplate ? await fetchTemplate(definition, { fetchImpl }) : undefined;

    if (material) {
      const existingProvenance = plannedConflicts.has('paper/TEMPLATE.md')
        ? await existingText(root, 'paper/TEMPLATE.md')
        : undefined;
      const retrievalTime = retainedRetrievalTime(existingProvenance);
      for (const relativePath of templateTargets) {
        const content = writeContent(relativePath, manifest, definition, material, retrievalTime);
        desired.set(relativePath, content);
        if (!plannedConflicts.has(relativePath)) continue;
        const current = relativePath === 'paper/TEMPLATE.md'
          ? existingProvenance
          : await existingText(root, relativePath);
        if (current === content) unchanged.add(relativePath);
        else knownConflicts.add(relativePath);
      }
    } else {
      for (const relativePath of templateTargets) {
        if (plannedConflicts.has(relativePath)) knownConflicts.add(relativePath);
      }
    }

    const effectivePlan = {
      files: plan.files.filter((relativePath) => !unchanged.has(relativePath)),
      conflicts: [...knownConflicts]
    };
    const selection = selectWriteTargets(effectivePlan, mode);

    if (mode === 'abort' && selection.conflicts.length > 0) {
      throw new Error(`Initialization conflicts: ${selection.conflicts.join(', ')}`);
    }
    if (mode === 'overwrite' && selection.conflicts.length > 0 && confirmOverwrite !== true) {
      throw new Error('Overwrite mode requires explicit confirmation');
    }

    const conflicts = new Set(selection.conflicts);

    for (const directory of parentDirectories(root, selection.files)) {
      await ensureDirectory(rootCanonical, directory, createdDirectories);
    }

    for (const relativePath of selection.files) {
      const targetPath = path.join(root, ...relativePath.split('/'));
      const content = desired.get(relativePath);
      if (typeof content !== 'string') {
        throw new Error(`No desired content was prepared for ${relativePath}`);
      }
      await assertSafeOperationPath(rootCanonical, targetPath);
      if (conflicts.has(relativePath)) {
        await overwriteFile(rootCanonical, targetPath, content, writeFileImpl, renameImpl);
      } else {
        const fileIdentity = await createFile(rootCanonical, targetPath, content, writeFileImpl);
        createdFiles.push({ path: relativePath, identity: fileIdentity });
      }
    }

    return {
      created: selection.files,
      skipped: selection.skipped,
      unchanged: plan.files.filter((relativePath) => unchanged.has(relativePath)),
      conflicts: selection.conflicts,
      template: {
        id: definition.id,
        sourceUrl: definition.sourceUrl,
        sha256: material?.sha256 ?? null
      }
    };
  } catch (error) {
    const retained = await rollback(root, createdFiles, createdDirectories);
    if (typeof error.temporaryPath === 'string' && isWithinRoot(root, error.temporaryPath)) {
      retained.push(path.relative(root, error.temporaryPath));
    }
    error.created = createdFiles.map((created) => created.path);
    error.retained = [...new Set(retained)].sort();
    throw error;
  }
}

function usage() {
  return 'Usage: node <skill-directory>/scripts/init-project.mjs --root <repo> --manifest <manifest.json> --conflicts abort|overwrite|skip';
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

export async function main() {
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
    if (error instanceof CliArgumentError) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 2;
    } else {
      process.stderr.write(`${JSON.stringify({
        error: error.message,
        created: error.created ?? [],
        retained: error.retained ?? []
      })}\n`);
      process.exitCode = 1;
    }
  }
}

const invokedPath = process.argv[1]
  ? await realpath(process.argv[1]).catch(() => path.resolve(process.argv[1]))
  : undefined;
const modulePath = await realpath(fileURLToPath(import.meta.url));
if (invokedPath === modulePath) {
  await main();
}
