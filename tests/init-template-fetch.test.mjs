import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { getTemplateDefinition } from '../scripts/lib/init/templates.mjs';
import {
  fetchTemplate,
  materializeTemplate,
  validateArchiveEntry,
  validateTemplateSource
} from '../scripts/lib/init/templates-fetch.mjs';

const conferenceDefinition = getTemplateDefinition('ieee-conference');
const conferenceSource = String.raw`\documentclass[conference]{IEEEtran}
\begin{document}
\end{document}
`;

async function withTempDirectory(run) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'research-template-'));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test('fetches a valid conference source with a SHA-256 digest', async () => {
  const material = await fetchTemplate(conferenceDefinition, {
    fetchImpl: async () => new Response(conferenceSource)
  });

  assert.equal(material.text, conferenceSource);
  assert.equal(material.sourceUrl, conferenceDefinition.sourceUrl);
  assert.match(material.sha256, /^[a-f0-9]{64}$/);
});

test('extracts source text instead of materializing an Overleaf-like HTML page', async () => {
  const material = await fetchTemplate(conferenceDefinition, {
    fetchImpl: async () => new Response(`<!doctype html><html><body><h3>Source</h3><pre>${conferenceSource}</pre></body></html>`)
  });

  assert.equal(material.text, conferenceSource);
  assert.doesNotMatch(material.text, /<html>/i);
});

test('extracts a source nested in correctly paired pre and code elements', async () => {
  const material = await fetchTemplate(conferenceDefinition, {
    fetchImpl: async () => new Response(`<!doctype html><html><body><pre><code>${conferenceSource}</code></pre></body></html>`)
  });

  assert.equal(material.text, conferenceSource);
  assert.doesNotMatch(material.text, /<\/?code>/i);
});

test('rejects a journal source for the conference preset', async () => {
  await assert.rejects(
    fetchTemplate(conferenceDefinition, {
      fetchImpl: async () => new Response(String.raw`\documentclass[journal]{IEEEtran}`)
    }),
    /expected conference mode/
  );
});

test('rejects HTTP failures and bounded downloads before validating them', async () => {
  await assert.rejects(
    fetchTemplate(conferenceDefinition, {
      fetchImpl: async () => new Response('unavailable', { status: 503 })
    }),
    /HTTP 503/
  );

  await assert.rejects(
    fetchTemplate(conferenceDefinition, {
      maxBytes: 10,
      fetchImpl: async () => new Response('01234567890')
    }),
    /maximum download size/
  );
});

test('aborts a source fetch that exceeds its timeout', async () => {
  await assert.rejects(
    fetchTemplate(conferenceDefinition, {
      timeoutMs: 10,
      fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
      })
    }),
    /timed out/
  );
});

test('aborts a response whose body stalls after headers arrive', async () => {
  const stalledBody = new ReadableStream({
    start() {}
  });

  await assert.rejects(
    fetchTemplate(conferenceDefinition, {
      timeoutMs: 10,
      fetchImpl: async () => new Response(stalledBody)
    }),
    /timed out/
  );
});

test('rejects unsafe archive entry names', () => {
  for (const entryName of ['../outside.tex', '/absolute.tex', 'C:\\absolute.tex', 'paper/../outside.tex']) {
    assert.throws(() => validateArchiveEntry(entryName), /(?:path traversal|absolute path)/);
  }

  assert.doesNotThrow(() => validateArchiveEntry('paper/main.tex'));
});

test('materializes the validated entry point, blank bibliography, and provenance', async () => {
  await withTempDirectory(async (root) => {
    const paperDir = path.join(root, 'paper');
    const material = await fetchTemplate(conferenceDefinition, {
      fetchImpl: async () => new Response(conferenceSource)
    });

    const created = await materializeTemplate(paperDir, material, conferenceDefinition);

    assert.deepEqual(created, ['main.tex', 'references.bib', 'TEMPLATE.md']);
    assert.equal(await readFile(path.join(paperDir, 'main.tex'), 'utf8'), conferenceSource);
    assert.equal(await readFile(path.join(paperDir, 'references.bib'), 'utf8'), '');
    const provenance = await readFile(path.join(paperDir, 'TEMPLATE.md'), 'utf8');
    assert.match(provenance, /Template ID: ieee-conference/);
    assert.match(provenance, new RegExp(`Source URL: ${conferenceDefinition.sourceUrl}`));
    assert.match(provenance, new RegExp(`SHA-256: ${material.sha256}`));
    assert.match(provenance, /Expected class option: conference/);
    assert.match(provenance, /review the template guidance before submission/i);
  });
});

test('does not create template files when material validation fails', async () => {
  await withTempDirectory(async (root) => {
    const paperDir = path.join(root, 'paper');
    await assert.rejects(
      materializeTemplate(paperDir, {
        text: String.raw`\documentclass[journal]{IEEEtran}`,
        sourceUrl: conferenceDefinition.sourceUrl,
        sha256: '0'.repeat(64)
      }, conferenceDefinition),
      /expected conference mode/
    );
    await assert.rejects(access(paperDir));
  });
});

test('does not write a validated source whose SHA-256 was changed', async () => {
  await withTempDirectory(async (root) => {
    const paperDir = path.join(root, 'paper');
    await assert.rejects(
      materializeTemplate(paperDir, {
        text: conferenceSource,
        sourceUrl: conferenceDefinition.sourceUrl,
        sha256: '0'.repeat(64)
      }, conferenceDefinition),
      /SHA-256 does not match/
    );
    await assert.rejects(access(paperDir));
  });
});

test('does not write fabricated template provenance URLs', async () => {
  await withTempDirectory(async (root) => {
    const paperDir = path.join(root, 'paper');
    const material = await fetchTemplate(conferenceDefinition, {
      fetchImpl: async () => new Response(conferenceSource)
    });

    await assert.rejects(
      materializeTemplate(paperDir, {
        ...material,
        sourceUrl: 'https://example.invalid/fabricated-template.tex'
      }, conferenceDefinition),
      /source URL does not match/
    );
    await assert.rejects(access(paperDir));
  });
});

test('requires IEEEtran with the selected mode', () => {
  assert.throws(
    () => validateTemplateSource(String.raw`\documentclass[conference]{article}`, 'conference'),
    /IEEEtran/
  );
  assert.throws(
    () => validateTemplateSource(String.raw`\documentclass{IEEEtran}`, 'conference'),
    /expected conference mode/
  );
  assert.throws(
    () => validateTemplateSource(String.raw`% \documentclass[conference]{IEEEtran}
\documentclass[conference]{article}`, 'conference'),
    /IEEEtran/
  );
});
