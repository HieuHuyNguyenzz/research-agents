import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { ResearchAgentsPlugin } from '../.opencode/plugins/research-agents.js';

test('OpenCode config registers shared skills exactly once', async () => {
  const plugin = await ResearchAgentsPlugin({ directory: process.cwd() });
  const config = { skills: { paths: [] } };
  await plugin.config(config);
  await plugin.config(config);
  assert.deepEqual(config.skills.paths, [path.join(process.cwd(), 'skills')]);
});

test('OpenCode transform prepends one bootstrap to the first user message', async () => {
  const plugin = await ResearchAgentsPlugin({ directory: process.cwd() });
  const output = { messages: [{ info: { role: 'user' }, parts: [{ type: 'text', text: 'find papers' }] }] };
  await plugin['experimental.chat.messages.transform']({}, output);
  await plugin['experimental.chat.messages.transform']({}, output);
  assert.equal(output.messages[0].parts.filter((part) => part.text?.includes('research-using-skills')).length, 1);
});
