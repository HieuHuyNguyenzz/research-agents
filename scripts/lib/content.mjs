import fs from 'node:fs/promises';
import path from 'node:path';

const TARGET_TOOLS = ['apply_patch', 'bash', 'glob', 'grep', 'todowrite', 'webfetch', 'Bash', 'Read', 'Task'];
const SKILL_NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

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
  const name = parsed.attributes.get('name');
  if (name) {
    if (name.length > 64) errors.push(`${relativePath}: name must be at most 64 characters`);
    if (!SKILL_NAME_PATTERN.test(name)) {
      errors.push(`${relativePath}: name must match ^[a-z0-9]+(-[a-z0-9]+)*$`);
    }
    const parent = path.basename(path.dirname(relativePath));
    if (name !== parent) errors.push(`${relativePath}: name must match parent directory: ${parent}`);
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
    let markdown;
    try {
      markdown = await fs.readFile(file, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    errors.push(...validateSkill(path.relative(rootDir, file), markdown));
  }
  return errors;
}
