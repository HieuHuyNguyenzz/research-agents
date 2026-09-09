# Compatibility matrix

Support is not claimed as verified until a native clean-session smoke test has
been recorded here. For each target, install the native artifact, start a clean
session, ask `List the installed research skills.`, and record the exact
version, date, result, and transcript location.

The core skills are Markdown instructions executed through each coding agent's
built-in capabilities; they do not require users to install Node.js or Python.
Python remains optional for analysis and notebook workloads. Node.js 20 is used
only by the bundled initializer CLI and this repository's current automated
test suite. Passing those tests does not validate native harness installation,
discovery, or clean-session behavior; that evidence remains required for every
platform below.

A local installation and invocation record for Codex and OpenCode is available
in the [2026-09-09 smoke-test report](compatibility-smoke-2026-09-09.md).

A status exactly equal to `Full` requires a non-placeholder tested version and
date, native clean-session command, `PASS` or `Passed` result, and transcript
or other evidence location. Until those fields are recorded, the status must
remain `Unverified (pending recorded smoke test)`.

| Harness | Status | Tested version | Tested date | Native clean-session command | Result | Evidence location | Bootstrap mechanism | Fallback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Codex | Local smoke passed (release pending) | 0.148.0-alpha.9 | 2026-09-09 | `codex plugin ...`, `codex debug prompt-input` | Passed | [Smoke report](compatibility-smoke-2026-09-09.md) | Native skill discovery | [Codex mapping](../references/tool-mapping/codex.md) |
| Claude Code | Unverified (pending recorded smoke test) | Not recorded | Not recorded | Not recorded | Not recorded | Not recorded | `SessionStart` hook | [Claude Code mapping](../references/tool-mapping/claude-code.md) |
| OpenCode | Local smoke passed (release pending) | 1.18.21 | 2026-09-09 | `opencode plugin ...`, `opencode run ...` | Passed | [Smoke report](compatibility-smoke-2026-09-09.md) | Runtime plugin message transform | [OpenCode mapping](../references/tool-mapping/opencode.md) |
