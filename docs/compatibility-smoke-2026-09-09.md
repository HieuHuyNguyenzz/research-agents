# Compatibility smoke test — 2026-09-09

This record covers local installation and invocation on the development machine.
It does not claim that the package has been published to the Codex or npm
registry, and it does not cover Claude Code.

## Codex

- Version: `codex-cli 0.148.0-alpha.9`
- Source: local repository marketplace at `.agents/plugins/marketplace.json`
- Install: `codex plugin marketplace add .`, then `codex plugin add research-agents@research-agents`
- Discovery: all 16 research skill names appeared in `codex debug prompt-input`
- Invocation: a read-only `research-initializing-project` request loaded the
  installed skill from the Codex cache and asked `What is the project name?`
- Uninstall: `codex plugin remove research-agents@research-agents`, followed by
  removal of the temporary marketplace
- Result: **PASS**

## OpenCode

- Version: `1.18.21`
- Source: fresh local npm package directory produced from this repository
- Install: `opencode plugin <package-directory> --global --force`
- Discovery: `opencode debug config` showed the installed package's `skills`
  directory in the resolved skill paths
- Invocation: a read-only `research-initializing-project` request loaded the
  installed skill in an unrelated project and asked `What is the Project name?`
- Uninstall: removed only the temporary package entry from the global
  `opencode.jsonc` plugin list
- Result: **PASS**

## Scope boundary

The repository was not pushed during this test. Therefore a fresh machine
install directly from GitHub still requires a release containing these changes.
The OpenCode npm command likewise requires publishing the package under the
`research-agents` name before end users can install it from the registry.
