# Portable Research Agents — Phase 0 Design

**Date:** 2026-08-11

## Purpose

Create a distribution foundation for a future library of research skills and
agent profiles. A user must be able to install the library through the native
installation path of popular coding agents, beginning with Codex, Claude Code,
and OpenCode.

This phase deliberately does not define any research workflow. It establishes
the portability, installation, compatibility, and verification mechanisms that
later research skills and agents will use.

## Decisions

1. The project is portable-first: skills and agent profiles have one shared,
   agent-neutral source of truth.
2. Native plugin/extension or marketplace installation is the primary user
   experience. A cross-agent CLI is not the primary installer and must never
   edit a user's global configuration to simulate integration.
3. Codex, Claude Code, and OpenCode are the first full-support targets.
4. A platform is not called fully supported unless the installed artifact can
   make the shared skills available in every new session without requiring the
   user to paste setup instructions each time.
5. Each platform integration maps abstract capabilities to its native tools and
   declares fallbacks for unavailable capabilities.

## Architecture

```text
research-agents/
├── skills/                         # Shared, agent-neutral skills
│   └── literature-review/SKILL.md   # Example future skill
├── agents/                         # Shared agent profiles
├── .codex-plugin/                   # Native Codex manifest
├── .claude-plugin/                  # Native Claude Code manifest
├── .opencode/                       # Native OpenCode plugin entry point
├── hooks/                           # Claude Code session bootstrap
├── references/
│   └── tool-mapping/
│       ├── codex.md
│       ├── claude-code.md
│       └── opencode.md
├── docs/
│   ├── install/
│   └── compatibility.md
└── tests/
    └── integrations/
```

`skills/` and `agents/` are the only content source. The root-level native
manifest, hook, and plugin-entry directories are thin integration artifacts.
Keeping them at the locations each harness expects lets one Git repository be
installed directly by the native installer of any supported harness. They do
not fork or rewrite the source skills.

## Portable authoring contract

Skills and agent profiles describe capabilities rather than literal tool names.
They may ask an agent to read or edit files, run commands, search the web, load
another skill, dispatch parallel work, or request approval. They must not assume
particular tools such as `bash`, `Read`, `Task`, or `webfetch`.

Every skill is self-contained in `SKILL.md` and contains:

- minimal frontmatter (name and description);
- purpose and activation conditions;
- required inputs and expected outputs;
- workflow steps;
- safety limits and approval boundaries;
- verification criteria;
- documented fallback behavior for missing capabilities where feasible.

Agent profiles follow the same capability-neutral language. An agent profile is
published only to integrations that can host the required agent or subagent
behavior; otherwise it is marked unavailable rather than silently degraded.

## Integration contract

An integration has three responsibilities:

1. **Native delivery:** package the project through the target agent's supported
   plugin, extension, or marketplace mechanism.
2. **Session bootstrap:** ensure the agent is aware of the installed library at
   the beginning of every session. The exact mechanism may be native skill
   discovery, a session-start hook, an in-process plugin, or an
   extension-declared context file.
3. **Tool mapping:** translate abstract capabilities used by the shared content
   into the target agent's actual tools and fallbacks.

The project must never achieve these responsibilities by modifying a user's
global instruction file, shell profile, or unrelated agent configuration. If a
platform has no reliable native integration surface, it cannot receive Full
support.

## Compatibility tiers

| Tier | Meaning |
| --- | --- |
| Full | Native installation plus automatic discovery/bootstrap in every new session. |
| Compatible | The content installs and runs, but the user must explicitly invoke a skill or command. |
| Unsupported | There is no safe, reliable native installation/bootstrap path. Documentation may explain the limitation, but the project makes no configuration edits to work around it. |

The initial goal is Full support for Codex, Claude Code, and OpenCode. Every
additional platform must receive an explicit capability review before it is
advertised.

## User installation experience

The README and per-platform installation pages guide users to the native path:

- marketplace installation when the platform offers it;
- the platform's plugin or extension command otherwise;
- a version-pinned artifact where the platform supports pinning.

An optional future CLI may provide read-only commands such as `doctor`, `list`,
and compatibility reporting. It is not trusted to rewrite global settings and
is not necessary to install an integration.

## Release and verification flow

```text
shared skills + agent profiles (one version)
        -> build/package native integration artifacts
        -> marketplace or native plugin delivery
        -> session bootstrap and tool mapping
        -> skills and agents available to the user
```

Every release must:

1. validate structure, frontmatter, links, and absence of platform-specific tool
   names in shared content;
2. test every native artifact in a clean fixture or environment;
3. run a fresh-session smoke test proving skill discovery/bootstrap;
4. record tested agent versions, capability gaps, and fallbacks in the
   compatibility matrix;
5. keep the source version, integration manifests, and release tag aligned.

The smoke test is an acceptance test: in a clean session, a representative
research request must make the intended shared skill discoverable or activate
it according to the declared tier. A failure downgrades or blocks the integration
release.

## Failure handling and privacy

Installations must preview or clearly report their target artifact and must stop
safely on error. They must not overwrite unrelated configuration, remove user
data, silently weaken compatibility claims, or transmit research materials or
credentials. Error messages must identify the failed integration, likely cause,
and a non-destructive recovery step.

## Scope boundaries

This phase delivers the portable project skeleton, the three initial integration
adapters, installation and compatibility documentation, and integration tests.
It excludes the substantive library of research skills and specialized agents;
those will be designed in later phases on top of this contract.

## Sources and rationale

The design follows the portable-content pattern demonstrated by
[obra/superpowers](https://github.com/obra/superpowers): shared skills use
agent-neutral action language; integrations provide tool mappings and startup
bootstrap; users install through each harness's native mechanism. This avoids
content drift and avoids modifying a user's personal configuration merely to
make an integration appear supported.
