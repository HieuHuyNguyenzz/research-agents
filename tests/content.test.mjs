import assert from 'node:assert/strict';
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

test('validates every committed shared skill', async () => {
  assert.deepEqual(await validateSkillTree(process.cwd()), []);
});
