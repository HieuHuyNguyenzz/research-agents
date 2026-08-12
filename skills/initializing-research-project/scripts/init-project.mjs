import { createHash } from 'node:crypto';
import { lstat, mkdir, open, readFile, realpath, rename, rmdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseManifest, validateManifest } from './lib/init/manifest.mjs';
import { planWrites, selectWriteTargets } from './lib/init/paths.mjs';
import { renderFile } from './lib/init/render.mjs';
import { fetchTemplate, validateTemplateSource } from './lib/init/templates-fetch.mjs';
import { getTemplateDefinition } from './lib/init/templates.mjs';

const CONFLICT_MODES = new Set(['abort', 'overwrite', 'skip']);
const TEMPLATE_FILES = new Set([
  'paper/main.tex',
  'paper/references.bib',
  'paper/TEMPLATE.md'
]);

class CliArgumentError extends Error {}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function templateProvenance(
  definition,
  material,
  mainText,
  referencesText,
  retrievedAt = new Date().toISOString()
) {
  return `# Template provenance\n\n- Template ID: ${definition.id}\n- Source URL: ${definition.sourceUrl}\n- Retrieved at (UTC): ${retrievedAt}\n- SHA-256: ${material.sha256}\n- Expected class option: ${definition.expectedClassOption}\n- main.tex SHA-256: ${sha256(mainText)}\n- references.bib SHA-256: ${sha256(referencesText)}\n\nReview the template guidance before submission.\n`;
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

function writeContent(relativePath, manifest, material) {
  if (relativePath === 'paper/main.tex') return renderFile(relativePath, manifest, material);
  if (relativePath === 'paper/references.bib') return material.referencesBib ?? '';
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

function provenanceField(text, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text?.match(new RegExp(`^- ${escapedLabel}: (.+)$`, 'm'))?.[1]?.trim();
}

async function classifyTemplateTargets(rootDir, plan, manifest, definition) {
  const existing = new Map();
  for (const relativePath of TEMPLATE_FILES) {
    if (plan.conflicts.includes(relativePath)) {
      existing.set(relativePath, await existingText(rootDir, relativePath));
    }
  }

  const mainText = existing.get('paper/main.tex');
  const referencesText = existing.get('paper/references.bib');
  const provenanceText = existing.get('paper/TEMPLATE.md');
  let exactGeneratedSet = typeof mainText === 'string'
    && typeof referencesText === 'string'
    && typeof provenanceText === 'string';

  if (exactGeneratedSet) {
    try {
      validateTemplateSource(mainText, definition.expectedClassOption);
      exactGeneratedSet = renderFile('paper/main.tex', manifest, { text: mainText }) === mainText
        && provenanceField(provenanceText, 'Template ID') === definition.id
        && provenanceField(provenanceText, 'Source URL') === definition.sourceUrl
        && provenanceField(provenanceText, 'Expected class option') === definition.expectedClassOption
        && provenanceField(provenanceText, 'main.tex SHA-256') === sha256(mainText)
        && provenanceField(provenanceText, 'references.bib SHA-256') === sha256(referencesText);

      if (exactGeneratedSet) {
        const material = { sha256: provenanceField(provenanceText, 'SHA-256') };
        exactGeneratedSet = /^[a-f0-9]{64}$/.test(material.sha256 ?? '')
          && templateProvenance(
            definition,
            material,
            mainText,
            referencesText,
            retainedRetrievalTime(provenanceText)
          ) === provenanceText;
      }
    } catch {
      exactGeneratedSet = false;
    }
  }

  return exactGeneratedSet
    ? {
      unchanged: [...TEMPLATE_FILES],
      conflicts: [],
      sha256: provenanceField(provenanceText, 'SHA-256')
    }
    : { unchanged: [], conflicts: [...existing.keys()], sha256: undefined };
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

async function createdFileIdentity(targetPath) {
  const status = await assertNotSymlink(targetPath);
  return status?.isFile() ? identity(status) : undefined;
}

async function createFile(rootCanonical, targetPath, content, writeFileImpl, onCreated) {
  await assertSafeOperationPath(rootCanonical, targetPath);
  if (writeFileImpl !== writeFile) {
    try {
      await writeFileImpl(targetPath, content, { encoding: 'utf8', flag: 'wx' });
    } catch (error) {
      const fileIdentity = await createdFileIdentity(targetPath);
      if (fileIdentity) onCreated(fileIdentity);
      throw error;
    }
    const fileIdentity = await createdFileIdentity(targetPath);
    if (!fileIdentity) throw new Error(`Created path is not a regular file: ${targetPath}`);
    onCreated(fileIdentity);
    return;
  }

  const handle = await open(targetPath, 'wx');
  onCreated(identity(await handle.stat()));
  try {
    await handle.writeFile(content, 'utf8');
  } finally {
    await handle.close();
  }
}

function retainedTemporaryError(error, temporaryPath) {
  const retained = new Error(`${error.message}; retained temporary file: ${temporaryPath}`, {
    cause: error
  });
  retained.temporaryPath = temporaryPath;
  return retained;
}

async function overwriteFile(rootCanonical, targetPath, content, writeFileImpl, renameImpl) {
  await assertSafeOperationPath(rootCanonical, targetPath);
  const temporaryPath = path.join(
    path.dirname(targetPath),
    `.${path.basename(targetPath)}.init-${process.pid}-${Date.now()}`
  );
  await assertSafeOperationPath(rootCanonical, temporaryPath);

  try {
    if (writeFileImpl !== writeFile) {
      await writeFileImpl(temporaryPath, content, { encoding: 'utf8', flag: 'wx' });
    } else {
      const handle = await open(temporaryPath, 'wx');
      try {
        await handle.writeFile(content, 'utf8');
      } finally {
        await handle.close();
      }
    }
  } catch (error) {
    if (await createdFileIdentity(temporaryPath)) {
      throw retainedTemporaryError(error, temporaryPath);
    }
    throw error;
  }

  try {
    await assertSafeOperationPath(rootCanonical, temporaryPath);
    await assertSafeOperationPath(rootCanonical, targetPath);
    await renameImpl(temporaryPath, targetPath);
  } catch (error) {
    throw retainedTemporaryError(error, temporaryPath);
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
      const content = writeContent(relativePath, manifest, undefined);
      desired.set(relativePath, content);
      if (!plannedConflicts.has(relativePath)) continue;
      const current = await existingText(root, relativePath);
      if (current === content) unchanged.add(relativePath);
      else knownConflicts.add(relativePath);
    }

    const templateTargets = plan.files.filter((target) => TEMPLATE_FILES.has(target));
    const templateState = await classifyTemplateTargets(root, plan, manifest, definition);
    for (const relativePath of templateState.unchanged) unchanged.add(relativePath);
    for (const relativePath of templateState.conflicts) knownConflicts.add(relativePath);

    const preflightConflicts = [...knownConflicts].sort();
    if (mode === 'abort' && preflightConflicts.length > 0) {
      throw new Error(`Initialization conflicts: ${preflightConflicts.join(', ')}`);
    }
    if (mode === 'overwrite' && preflightConflicts.length > 0 && confirmOverwrite !== true) {
      throw new Error('Overwrite mode requires explicit confirmation');
    }

    const needsTemplate = templateTargets.some((target) => (
      !unchanged.has(target) && (!plannedConflicts.has(target) || mode !== 'skip')
    ));
    const material = needsTemplate ? await fetchTemplate(definition, { fetchImpl }) : undefined;

    if (material) {
      const mainText = writeContent('paper/main.tex', manifest, material);
      const referencesText = writeContent('paper/references.bib', manifest, material);
      desired.set('paper/main.tex', mainText);
      desired.set('paper/references.bib', referencesText);
      desired.set('paper/TEMPLATE.md', templateProvenance(
        definition,
        material,
        mainText,
        referencesText
      ));
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
        await createFile(
          rootCanonical,
          targetPath,
          content,
          writeFileImpl,
          (fileIdentity) => createdFiles.push({ path: relativePath, identity: fileIdentity })
        );
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
        sha256: material?.sha256 ?? templateState.sha256 ?? null
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
