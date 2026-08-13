import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_TIMEOUT_MS = 15_000;

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function nonEmptyString(value, name) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError(`${name} must be a non-empty string`);
  }
  return value;
}

function positiveInteger(value, name) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive integer`);
  }
  return value;
}

function fetchOptions(definition, options) {
  if (!definition || typeof definition !== 'object') {
    throw new TypeError('Template definition must be an object');
  }

  const fetchImpl = options?.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== 'function') {
    throw new TypeError('fetchImpl must be a function');
  }

  return {
    sourceUrl: nonEmptyString(definition.sourceUrl, 'Template sourceUrl'),
    expectedClassOption: nonEmptyString(definition.expectedClassOption, 'Template expectedClassOption'),
    fetchImpl,
    maxBytes: positiveInteger(options?.maxBytes ?? definition.maxBytes, 'maxBytes'),
    timeoutMs: positiveInteger(options?.timeoutMs ?? DEFAULT_TIMEOUT_MS, 'timeoutMs')
  };
}

async function readBoundedBody(response, maxBytes, signal) {
  const declaredLength = response.headers?.get?.('content-length');
  if (declaredLength && Number(declaredLength) > maxBytes) {
    throw new Error(`Template download exceeds maximum download size of ${maxBytes} bytes`);
  }

  if (!response.body || typeof response.body.getReader !== 'function') {
    throw new Error('Template response has no readable body');
  }

  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  const cancelReader = () => {
    void reader.cancel().catch(() => {});
  };
  signal?.addEventListener('abort', cancelReader, { once: true });
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = Buffer.from(value);
      size += chunk.length;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error(`Template download exceeds maximum download size of ${maxBytes} bytes`);
      }
      chunks.push(chunk);
    }
  } finally {
    signal?.removeEventListener('abort', cancelReader);
    reader.releaseLock();
  }

  return Buffer.concat(chunks, size);
}

function decodeHtmlEntities(value) {
  const namedEntities = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    quot: '"'
  };
  return value.replace(/&(?:#(x[0-9a-f]+|\d+)|([a-z]+));/gi, (entity, numeric, named) => {
    if (numeric) {
      const codePoint = numeric.toLowerCase().startsWith('x')
        ? Number.parseInt(numeric.slice(1), 16)
        : Number.parseInt(numeric, 10);
      return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : entity;
    }
    return namedEntities[named.toLowerCase()] ?? entity;
  });
}

function extractPublicSource(text) {
  if (!/^\s*<(?:!doctype\s+html|html\b)/i.test(text)) return text;

  const sourceBlocks = [
    /<pre\b[^>]*>([\s\S]*?)<\/pre\s*>/gi,
    /<code\b[^>]*>([\s\S]*?)<\/code\s*>/gi
  ];
  for (const pattern of sourceBlocks) {
    for (const match of text.matchAll(pattern)) {
      const inner = match[1].trim().match(/^<code\b[^>]*>([\s\S]*?)<\/code\s*>$/i);
      const candidate = decodeHtmlEntities((inner ? inner[1] : match[1])
        .replace(/<br\s*\/?\s*>/gi, '\n'));
      if (/\\documentclass\b/.test(candidate)) return candidate;
    }
  }
  throw new Error('Template page did not contain a readable LaTeX source');
}

function stripLatexComments(text) {
  return text.split(/\r\n|\n|\r/).map((line) => {
    let backslashes = 0;
    for (let index = 0; index < line.length; index += 1) {
      if (line[index] === '\\') {
        backslashes += 1;
        continue;
      }
      if (line[index] === '%' && backslashes % 2 === 0) return line.slice(0, index);
      backslashes = 0;
    }
    return line;
  }).join('\n');
}

/** Validates that a LaTeX source uses IEEEtran in the requested IEEE mode. */
export function validateTemplateSource(text, expectedClassOption) {
  nonEmptyString(text, 'Template source');
  const expected = nonEmptyString(expectedClassOption, 'Expected class option').toLowerCase();
  if (!['conference', 'journal'].includes(expected)) {
    throw new TypeError('Expected class option must be conference or journal');
  }

  const documentClasses = [...stripLatexComments(text)
    .matchAll(/\\documentclass\s*(?:\[([^\]]*)\])?\s*\{\s*IEEEtran\s*\}/g)];
  if (documentClasses.length === 0) {
    throw new Error('Template source must declare an IEEEtran document class');
  }

  const hasExpectedMode = documentClasses.some((match) => {
    const options = (match[1] ?? '').split(',').map((option) => option.trim().toLowerCase());
    return options.includes(expected);
  });
  if (!hasExpectedMode) {
    throw new Error(`Template source expected ${expected} mode`);
  }
}

/** Rejects archive names that could escape an extraction destination. */
export function validateArchiveEntry(entryName) {
  nonEmptyString(entryName, 'Archive entry name');
  const normalized = entryName.replaceAll('\\', '/');
  if (path.posix.isAbsolute(normalized) || path.win32.isAbsolute(entryName)) {
    throw new Error(`Archive entry uses an absolute path: ${entryName}`);
  }
  if (normalized.split('/').includes('..')) {
    throw new Error(`Archive entry contains path traversal: ${entryName}`);
  }
}

/**
 * Downloads the configured public source through an injected or native fetch,
 * retaining only a validated, size-bounded UTF-8 source representation.
 */
export async function fetchTemplate(definition, options = {}) {
  const {
    sourceUrl, expectedClassOption, fetchImpl, maxBytes, timeoutMs
  } = fetchOptions(definition, options);
  const controller = new AbortController();
  let timer;
  const timeoutError = new Error(`Template download timed out after ${timeoutMs} ms`);
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(timeoutError);
      controller.abort(timeoutError);
    }, timeoutMs);
  });

  try {
    const response = await Promise.race([
      fetchImpl(sourceUrl, { signal: controller.signal }),
      timeout
    ]);

    if (!response || typeof response !== 'object') {
      throw new Error('Template fetch returned no response');
    }
    if (!response.ok) {
      throw new Error(`Template download failed with HTTP ${response.status}`);
    }

    const bytes = await Promise.race([
      readBoundedBody(response, maxBytes, controller.signal),
      timeout
    ]);
    let responseText;
    try {
      responseText = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      throw new Error('Template source is not valid UTF-8');
    }
    const text = extractPublicSource(responseText);
    validateTemplateSource(text, expectedClassOption);

    return {
      text,
      sourceUrl,
      sha256: sha256(Buffer.from(text, 'utf8'))
    };
  } finally {
    clearTimeout(timer);
  }
}

function provenance(metadata, material) {
  const id = nonEmptyString(metadata?.id, 'Template id');
  const expectedClassOption = nonEmptyString(
    metadata?.expectedClassOption,
    'Template expectedClassOption'
  );
  const sourceUrl = nonEmptyString(metadata?.sourceUrl, 'Template sourceUrl');
  const retrievedAt = new Date().toISOString();

  return `# Template provenance\n\n- Template ID: ${id}\n- Source URL: ${sourceUrl}\n- Retrieved at (UTC): ${retrievedAt}\n- SHA-256: ${material.sha256}\n- Expected class option: ${expectedClassOption}\n\nReview the template guidance before submission.\n`;
}

/**
 * Writes the single supported paper entry point and its provenance after all
 * supplied template material has passed source and checksum validation.
 */
export async function materializeTemplate(paperDir, material, metadata) {
  nonEmptyString(paperDir, 'paperDir');
  const text = nonEmptyString(material?.text, 'Template material text');
  const expectedClassOption = nonEmptyString(
    metadata?.expectedClassOption,
    'Template expectedClassOption'
  );
  const sourceUrl = nonEmptyString(material?.sourceUrl, 'Template sourceUrl');
  const configuredSourceUrl = nonEmptyString(metadata?.sourceUrl, 'Configured template sourceUrl');
  if (sourceUrl !== configuredSourceUrl) {
    throw new Error('Template source URL does not match the configured definition');
  }
  validateTemplateSource(text, expectedClassOption);

  const expectedDigest = nonEmptyString(material?.sha256, 'Template SHA-256');
  const actualDigest = sha256(Buffer.from(text, 'utf8'));
  if (expectedDigest !== actualDigest) {
    throw new Error('Template SHA-256 does not match its source text');
  }
  const templateProvenance = provenance(metadata, material);
  const references = typeof material.referencesBib === 'string' ? material.referencesBib : '';

  await mkdir(paperDir, { recursive: true });
  await writeFile(path.join(paperDir, 'main.tex'), text, 'utf8');
  await writeFile(path.join(paperDir, 'references.bib'), references, 'utf8');
  await writeFile(path.join(paperDir, 'TEMPLATE.md'), templateProvenance, 'utf8');

  return ['main.tex', 'references.bib', 'TEMPLATE.md'];
}
