# Compatibility matrix

Support is not claimed as verified until a native clean-session smoke test has
been recorded here. For each target, install the native artifact, start a clean
session, ask `List the installed research skills.`, and record the exact
version, date, result, and transcript location.

The initializer's Node.js 20 portability is limited to the shared CLI and its
automated tests. It does not validate native harness installation, discovery,
or clean-session smoke behavior; that evidence remains required for every
platform below.

| Harness | Compatibility | Tested version | Bootstrap mechanism | Last verification date | Fallback |
| --- | --- | --- | --- | --- | --- |
| Codex | Unverified (pending recorded smoke test) | Not yet recorded | Native skill discovery | Not yet recorded | [Codex mapping](../references/tool-mapping/codex.md) |
| Claude Code | Unverified (pending recorded smoke test) | Not yet recorded | `SessionStart` hook | Not yet recorded | [Claude Code mapping](../references/tool-mapping/claude-code.md) |
| OpenCode | Unverified (pending recorded smoke test) | Not yet recorded | Runtime plugin message transform | Not yet recorded | [OpenCode mapping](../references/tool-mapping/opencode.md) |
