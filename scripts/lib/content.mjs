import fs from 'node:fs/promises';
import path from 'node:path';

const TARGET_TOOLS = ['apply_patch', 'bash', 'glob', 'grep', 'todowrite', 'webfetch', 'Bash', 'Read', 'Task'];

export function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('SKILL.md must start with YAML-style frontmatter');
  const attributes = new Map(match[1].split('\n').filter(Boolean).map((line) => {
    const index = line.indexOf(':');
    return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
  }));
  return { attributes, body: match[2] };
}

export function validateSkill(relativePath, markdown) {
  const errors = [];
  let parsed;
  try { parsed = parseFrontmatter(markdown); } catch (error) { return [`${relativePath}: ${error.message}`]; }
  for (const field of ['name', 'description']) {
    if (!parsed.attributes.get(field)) errors.push(`${relativePath}: missing required frontmatter field: ${field}`);
  }
  const namedTools = TARGET_TOOLS.filter((tool) => new RegExp(`\\\`${tool}\\\``, 'i').test(parsed.body));
  if (namedTools.length) errors.push(`${relativePath}: shared skills must not name target tools: ${namedTools.join(', ')}`);
  return errors;
}

export async function validateSkillTree(rootDir) {
  const skillsDir = path.join(rootDir, 'skills');
  const entries = await fs.readdir(skillsDir, { withFileTypes: true });
  const errors = [];
  for (const entry of entries.filter((item) => item.isDirectory())) {
    const file = path.join(skillsDir, entry.name, 'SKILL.md');
    const markdown = await fs.readFile(file, 'utf8');
    errors.push(...validateSkill(path.relative(rootDir, file), markdown));
  }
  return errors;
}
