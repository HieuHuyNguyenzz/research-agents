# Compatibility matrix

Support is not claimed as verified until a native clean-session smoke test has
been recorded here. For each target, install the native artifact, start a clean
session, ask `List the installed research skills.`, and record the exact
version, date, result, and transcript location.

The initializer's Node.js 20 portability is limited to the shared CLI and its
automated tests. It does not validate native harness installation, discovery,
or clean-session smoke behavior; that evidence remains required for every
platform below.

A status exactly equal to `Full` requires a non-placeholder tested version and
date, native clean-session command, `PASS` or `Passed` result, and transcript
or other evidence location. Until those fields are recorded, the status must
remain `Unverified (pending recorded smoke test)`.

| Harness | Status | Tested version | Tested date | Native clean-session command | Result | Evidence location | Bootstrap mechanism | Fallback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Codex | Unverified (pending recorded smoke test) | Not recorded | Not recorded | Not recorded | Not recorded | Not recorded | Native skill discovery | [Codex mapping](../references/tool-mapping/codex.md) |
| Claude Code | Unverified (pending recorded smoke test) | Not recorded | Not recorded | Not recorded | Not recorded | Not recorded | `SessionStart` hook | [Claude Code mapping](../references/tool-mapping/claude-code.md) |
| OpenCode | Unverified (pending recorded smoke test) | Not recorded | Not recorded | Not recorded | Not recorded | Not recorded | Runtime plugin message transform | [OpenCode mapping](../references/tool-mapping/opencode.md) |
