import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('Claude plugin declares a SessionStart command hook', async () => {
  const hooks = JSON.parse(await fs.readFile('hooks/hooks.json', 'utf8'));
  const entry = hooks.hooks.SessionStart[0];
  assert.equal(entry.matcher, 'startup|clear|compact');
  assert.equal(entry.hooks[0].type, 'command');
  assert.equal(entry.hooks[0].command, 'bash "${CLAUDE_PLUGIN_ROOT}/hooks/session-start"');
});

test('session-start emits Claude Code additional context and does not write files', { skip: process.platform === 'win32' }, async () => {
  const hooks = JSON.parse(await fs.readFile('hooks/hooks.json', 'utf8'));
  const command = hooks.hooks.SessionStart[0].hooks[0].command;
  const result = spawnSync('bash', ['-c', command], { env: { ...process.env, CLAUDE_PLUGIN_ROOT: process.cwd() }, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.hookSpecificOutput.hookEventName, 'SessionStart');
  assert.match(output.hookSpecificOutput.additionalContext, /using-research-agents/);
  assert.match(output.hookSpecificOutput.additionalContext, /Tool Mapping for Claude Code/);
  const content = await fs.readFile('skills/using-research-agents/SKILL.md', 'utf8');
  const mapping = await fs.readFile('references/tool-mapping/claude-code.md', 'utf8');
  assert.equal(output.hookSpecificOutput.additionalContext, `<IMPORTANT>\n${content}\n\n${mapping}\n</IMPORTANT>`);
});
