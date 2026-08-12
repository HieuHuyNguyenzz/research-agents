# research-agents

Portable research workflows for modern coding agents.

`research-agents` provides shared skills and native adapters for Codex, Claude
Code, OpenCode, and other agents that support portable skill packages. The first
workflow is a research-project initializer that turns an empty repository into a
structured, reproducible workspace.

> Skills first, agents later: this repository currently focuses on deterministic
> skills and installation contracts rather than autonomous research agents.

## What it provides

- A guided initializer triggered by requests such as **“Initialize a research
  project.”**
- A structured questionnaire covering the project overview, objectives,
  research questions, data, methods, authors, and paper format.
- IEEE conference and IEEE journal LaTeX templates with recorded source URL,
  retrieval time, and SHA-256 provenance in `paper/TEMPLATE.md`.
- A deterministic project layout for source code, configurations, experiments,
  results, documentation, and paper artifacts.
- Conflict detection, explicit overwrite confirmation, idempotent reruns, and
  cross-platform Node.js tooling.

## Quick start

Install the repository using the native mechanism for your coding agent:

- [Codex installation](docs/install/codex.md)
- [Claude Code installation](docs/install/claude-code.md)
- [OpenCode installation](docs/install/opencode.md)

Then start a new session and ask:

```text
Initialize a research project.
```

The initializer asks questions one at a time, shows the complete plan, and waits
for explicit confirmation before writing anything. Template downloads require
network access. Existing files are preserved unless you explicitly choose an
overwrite mode.

## Generated project layout

The initializer creates a consistent research workspace:

```text
src/          source code, configs, scripts, and data
tests/        automated tests
results/      raw data, processed outputs, figures, and tables
paper/        main.tex, sections, figures, tables, references, provenance
docs/         architecture, methodology, experiments, and reproduction notes
superpowers/  specs, plans, and decisions
```

It also creates `README.md`, `AGENTS.md`, `.gitignore`, and `pyproject.toml` at
the project root.

## Compatibility

The shared initializer CLI targets Node.js 20+ and is covered by the repository's
automated test suite. Native installation, skill discovery, and clean-session
support for each coding agent remain explicitly **unverified** until a native
smoke test is recorded.

See the [compatibility matrix](docs/compatibility.md) for the current evidence
boundary and the [tool mappings](references/tool-mapping/) for platform-specific
guidance.

## Development

Requirements: Node.js 20 or newer.

```bash
npm run verify
```

This runs the shared-skill content checks, the complete Node.js test suite, and
the initializer integration contract.

## License and status

This project is under active development. The current release is an early,
skills-first foundation for reproducible research repositories.
