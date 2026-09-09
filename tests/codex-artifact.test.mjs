import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('Codex manifest exposes the shared skills without foreign hooks', async () => {
  const manifest = JSON.parse(await fs.readFile('.codex-plugin/plugin.json', 'utf8'));
  assert.equal(manifest.name, 'research-agents');
  assert.equal(manifest.version, '0.2.0');
  assert.equal(manifest.skills, './skills/');
  assert.deepEqual(manifest.hooks, {});
});

test('Codex repository exposes a local marketplace entry for installation', async () => {
  const marketplace = JSON.parse(await fs.readFile('.agents/plugins/marketplace.json', 'utf8'));
  assert.equal(marketplace.name, 'research-agents');
  assert.equal(marketplace.plugins[0].name, 'research-agents');
  assert.equal(marketplace.plugins[0].source.path, '.');
});
