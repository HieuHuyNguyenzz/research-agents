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
- A skills-first research workflow for reading papers, planning
  reimplementations, analyzing experiment results, and creating reproducible
  notebooks.

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

## Research workflow

After initialization, the shared research skills support this sequence:

1. `paper-reading` — build an evidence map from a paper.
2. `paper-planning-reimplementation` — map the paper to code, data, and tests.
3. `results-analyzing-experiments` — inspect metrics, runs, baselines, and
   ablations under `results/`.
4. `notebook-creating-research` — produce a rerunnable notebook under
   `results/analysis/`.

Ask the coding agent naturally, for example: `Analyze the experiment results in
results/raw and prepare a paper-ready notebook.`

## Paper-writing workflow

For a manuscript, use `paper-reading` to establish the source
evidence, then draft the necessary section(s), analyze the available results,
and finish with an independent review:

1. `paper-reading`
2. `paper-writing-abstract`, `paper-writing-introduction`,
   `paper-writing-related-work`, `paper-writing-methodology`,
   `paper-writing-experimental-results`, and `paper-writing-conclusion`
3. `results-analyzing-experiments`
4. `paper-reviewing`

The six writing skills edit their corresponding files under `paper/sections/`
directly. `paper-reviewing` inspects `paper/` and the supporting
repository, then only reports findings unless you request fixes.

Ask naturally, for example: `Write the methodology section from the current code and configs.`

See the [paper-writing guide](docs/paper-writing.md) for the complete skill
map, direct-write rules, evidence and citation policy, example requests, and
submission checklist.

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
