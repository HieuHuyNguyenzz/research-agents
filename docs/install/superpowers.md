# Superpowers companion

Research Agents provides the scientific workflow: study design, evidence
handling, experiment configuration, analysis, and paper writing. Superpowers
provides the software-engineering workflow used when that research produces or
changes code: brainstorming, implementation planning, TDD, debugging,
parallel work, review, and branch finalization.

They are complementary plugins, not one combined skill catalog.

## Installation

Install Research Agents using the page for your coding agent, then install
Superpowers separately for the same agent:

- **Codex:** open `/plugins`, search for `Superpowers`, and choose `Install Plugin`.
- **Claude Code:** run `/plugin marketplace add obra/superpowers-marketplace`,
  then `/plugin install superpowers@superpowers-marketplace`.
- **OpenCode:** ask the agent to fetch and follow
  `https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md`.

This separate step is required because coding agents do not generally allow a
plugin to install another publisher's plugin automatically. Superpowers is
therefore kept upstream so users receive its own updates and license terms.

## Handoff

Research skills write scientific requirements to the initialized project's
`superpowers/specs/` and `superpowers/plans/` directories. Superpowers can then
turn the confirmed requirements into file-level implementation work. If
Superpowers is unavailable, the research workflow remains usable with the
agent's native planning and coding capabilities.
