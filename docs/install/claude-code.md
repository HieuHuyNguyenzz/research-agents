# Install for Claude Code

Install the repository through Claude Code's plugin marketplace or plugin
installer. The bundled `SessionStart` hook loads the bootstrap on startup,
clear, and compact events. Do not edit personal `CLAUDE.md` files. Start a new
session and ask the agent to list installed research skills.

## Initialize a research project

Ask in natural language: `Initialize a research project.` The agent asks the
initializer questionnaire one field at a time, shows the complete scaffold
summary, and waits for your explicit confirmation before creating files.

The selected IEEE template is downloaded from its configured source, so this
step requires network access. The generated `paper/TEMPLATE.md` records the
selected source for later review.

## Write and review a paper

After initialization, follow the [paper-writing guide](../paper-writing.md).
For example, ask: `Write the experimental results from results/processed and
results/tables.` The section writers edit the existing LaTeX target and explain
their evidence; `reviewing-research-paper` produces a report only until you
explicitly request changes.
