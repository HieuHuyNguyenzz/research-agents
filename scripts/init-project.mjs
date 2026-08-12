import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { main } from '../skills/initializing-research-project/scripts/init-project.mjs';

export { runInit } from '../skills/initializing-research-project/scripts/init-project.mjs';

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
