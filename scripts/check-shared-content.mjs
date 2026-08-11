import { validateSkillTree } from './lib/content.mjs';

const errors = await validateSkillTree(process.cwd());
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
