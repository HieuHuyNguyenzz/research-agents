import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('Codex manifest exposes the shared skills without foreign hooks', async () => {
  const manifest = JSON.parse(await fs.readFile('.codex-plugin/plugin.json', 'utf8'));
  assert.equal(manifest.name, 'research-agents');
  assert.equal(manifest.version, '0.1.0');
  assert.equal(manifest.skills, './skills/');
  assert.deepEqual(manifest.hooks, {});
});
