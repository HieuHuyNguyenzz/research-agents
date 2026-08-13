import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parseFrontmatter, validateSkill, validateSkillTree } from '../scripts/lib/content.mjs';

test('parses the required name and description frontmatter', () => {
  const parsed = parseFrontmatter('---\nname: sample\ndescription: Sample skill\n---\n\nUse abstract actions.\n');
  assert.equal(parsed.attributes.get('name'), 'sample');
  assert.equal(parsed.body.trim(), 'Use abstract actions.');
});

test('rejects a skill that names a platform tool', () => {
  const errors = validateSkill('skills/example/SKILL.md', '---\nname: example\ndescription: Example\n---\n\nRun `webfetch`.\n');
  assert.deepEqual(errors, ['skills/example/SKILL.md: shared skills must not name target tools: webfetch']);
});

test('permits ordinary prose that uses generic action words', () => {
  const errors = validateSkill('skills/example/SKILL.md', '---\nname: example\ndescription: Example\n---\n\nRead files before a task.\n');
  assert.deepEqual(errors, []);
});

test('rejects non-portable and mismatched skill names', () => {
  assert.deepEqual(
    validateSkill('skills/writing/SKILL.md', '---\nname: writing:paper\ndescription: Use when writing.\n---\n\nWrite.'),
    [
      'skills/writing/SKILL.md: name must match ^[a-z0-9]+(-[a-z0-9]+)*$',
      'skills/writing/SKILL.md: name must match parent directory: writing'
    ]
  );
  assert.deepEqual(
    validateSkill('skills/paper-writing/SKILL.md', '---\nname: paper-reviewing\ndescription: Use when reviewing.\n---\n\nReview.'),
    ['skills/paper-writing/SKILL.md: name must match parent directory: paper-writing']
  );
});

test('rejects skill names longer than 64 characters', () => {
  const name = `paper-${'a'.repeat(59)}`;
  assert.deepEqual(
    validateSkill(`skills/${name}/SKILL.md`, `---\nname: ${name}\ndescription: Use when testing.\n---\n\nTest.`),
    [`skills/${name}/SKILL.md: name must be at most 64 characters`]
  );
});

test('ignores directories without SKILL.md', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'skill-tree-'));
  try {
    await fs.mkdir(path.join(root, 'skills', 'metadata-only'), { recursive: true });
    assert.deepEqual(await validateSkillTree(root), []);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('validates every committed shared skill', async () => {
  assert.deepEqual(await validateSkillTree(process.cwd()), []);
});
