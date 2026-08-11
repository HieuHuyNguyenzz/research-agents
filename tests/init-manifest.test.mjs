import assert from 'node:assert/strict';
import test from 'node:test';

import { parseManifest, validateManifest } from '../scripts/lib/init/manifest.mjs';
import { getTemplateDefinition } from '../scripts/lib/init/templates.mjs';

test('normalizes required and optional manifest fields', () => {
  const manifest = parseManifest(JSON.stringify({
    projectName: '  Robust FL  ',
    overview: ' Study robust aggregation. ',
    objectives: 'Compare robustness',
    researchQuestions: 'What fails?\nWhat recovers?',
    dataSources: 'MNIST, CIFAR-10',
    methods: 'FedAvg\nTrimmed mean',
    authors: 'Ada Lovelace, Grace Hopper',
    paperTemplate: 'IEEE conference'
  }));

  assert.deepEqual(manifest, {
    projectName: 'Robust FL',
    overview: 'Study robust aggregation.',
    objectives: ['Compare robustness'],
    researchQuestions: ['What fails?', 'What recovers?'],
    dataSources: ['MNIST', 'CIFAR-10'],
    methods: ['FedAvg', 'Trimmed mean'],
    authors: ['Ada Lovelace', 'Grace Hopper'],
    paperTemplate: 'ieee-conference'
  });
  assert.deepEqual(validateManifest(manifest), []);
});

test('accepts manifest objects and defaults absent optional values', () => {
  const manifest = parseManifest({
    projectName: 'Robust FL',
    overview: 'Study robust aggregation.',
    paperTemplate: 'IEEE JOURNAL'
  });

  assert.deepEqual(manifest, {
    projectName: 'Robust FL',
    overview: 'Study robust aggregation.',
    objectives: [],
    researchQuestions: [],
    dataSources: [],
    methods: [],
    authors: [],
    paperTemplate: 'ieee-journal'
  });
});

test('rejects missing overview and unsupported paper template', () => {
  const errors = validateManifest({ projectName: 'x', paperTemplate: 'acl' });

  assert.deepEqual(errors, [
    'overview is required',
    'paperTemplate must be ieee-conference or ieee-journal'
  ]);
});

test('rejects whitespace-only required values in stable field order', () => {
  const errors = validateManifest({
    projectName: ' ',
    overview: ' ',
    paperTemplate: ''
  });

  assert.deepEqual(errors, [
    'projectName is required',
    'overview is required',
    'paperTemplate must be ieee-conference or ieee-journal'
  ]);
});

test('exposes pinned definitions for both IEEE presets', () => {
  const conference = getTemplateDefinition('ieee-conference');
  const journal = getTemplateDefinition('ieee-journal');

  assert.deepEqual(conference, {
    id: 'ieee-conference',
    label: 'IEEE Conference',
    sourceUrl: 'https://www.overleaf.com/latex/templates/ieee-conference-template/grfzhhncsfqn',
    sourceKind: 'overleaf',
    expectedClassOption: 'conference',
    maxBytes: 5_000_000
  });
  assert.deepEqual(journal, {
    id: 'ieee-journal',
    label: 'IEEE Journal',
    sourceUrl: 'https://www.overleaf.com/latex/templates/ieee-journal-paper-template/jbbbdkztwxrd',
    sourceKind: 'overleaf',
    expectedClassOption: 'journal',
    maxBytes: 5_000_000
  });
});

test('throws when a template id is unsupported', () => {
  assert.throws(() => getTemplateDefinition('acl'), /Unsupported paper template: acl/);
});

test('rejects inherited object property names as unsupported template ids', () => {
  for (const id of ['__proto__', 'toString', 'constructor']) {
    assert.throws(
      () => getTemplateDefinition(id),
      new RegExp(`Unsupported paper template: ${id}`)
    );
  }
});
