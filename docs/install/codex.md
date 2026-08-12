# Install for Codex

Install `research-agents` from the Codex plugin marketplace when published.
For a local checkout, use Codex's plugin interface to install this repository;
do not copy skills into a global instructions directory. Start a new session and
ask the agent to list installed research skills to smoke-test discovery.

## Initialize a research project

Ask in natural language: `Initialize a research project.` The agent asks the
initializer questionnaire one field at a time, shows the complete scaffold
summary, and waits for your explicit confirmation before creating files.

The selected IEEE template is downloaded from its configured source, so this
step requires network access. The generated `paper/TEMPLATE.md` records the
selected source for later review.

## Write and review a paper

After initialization, follow the [paper-writing guide](../paper-writing.md).
For example, ask: `Write the methodology from the current code and configs.`
The section writers update the existing LaTeX target directly and report the
evidence used; `reviewing-research-paper` reports findings without changing
files unless you request a fix.
