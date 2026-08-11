import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pluginDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(pluginDir, '../..');
const skillsDir = path.join(rootDir, 'skills');
let bootstrap;

function loadBootstrap() {
  if (bootstrap) return bootstrap;

  const skill = fs.readFileSync(path.join(skillsDir, 'using-research-agents', 'SKILL.md'), 'utf8');
  const mapping = fs.readFileSync(path.join(rootDir, 'references', 'tool-mapping', 'opencode.md'), 'utf8');
  bootstrap = `<IMPORTANT>\n${skill}\n\n${mapping}\n</IMPORTANT>`;
  return bootstrap;
}

export async function ResearchAgentsPlugin() {
  return {
    async config(config) {
      config.skills ??= {};
      config.skills.paths ??= [];
      if (!config.skills.paths.includes(skillsDir)) config.skills.paths.push(skillsDir);
    },
    async 'experimental.chat.messages.transform'(_input, output) {
      const firstUser = output.messages.find((message) => message.info.role === 'user');
      if (!firstUser?.parts?.length || firstUser.parts.some((part) => part.text?.includes('using-research-agents'))) return;
      firstUser.parts.unshift({ type: 'text', text: loadBootstrap() });
    }
  };
}
