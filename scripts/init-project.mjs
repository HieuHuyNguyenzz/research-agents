import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { main } from '../skills/research-initializing-project/scripts/init-project.mjs';

export { runInit } from '../skills/research-initializing-project/scripts/init-project.mjs';

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
