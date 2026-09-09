# Install for Codex

From a GitHub checkout, add the repository marketplace and install the plugin:

```bash
codex plugin marketplace add owner/research-agents
codex plugin add research-agents@research-agents
```

For a local checkout, run the same commands with `.` as the marketplace source.
Do not copy skills into a global instructions directory. Start a new session and
ask the agent to list installed research skills to smoke-test discovery.

No additional Node.js or Python installation is required for Codex to read and
execute the core skills. Python is needed only when the requested research task
itself runs Python code, such as notebook-based experiment analysis.

After discovery, use the [research workflow guide](../research-workflow.md) for
the end-to-end sequence and the [skill reference](../skill-reference.md) for
inputs, outputs, and example requests.

## Initialize a research project

Ask in natural language: `Initialize a research project.` The agent asks the
initializer questionnaire one field at a time, shows the complete scaffold
summary, and waits for your explicit confirmation before creating files.
The agent can create the scaffold with its built-in file tools; the bundled
Node.js initializer is an optional deterministic CLI, not a usage requirement.

The selected IEEE template is downloaded from its configured source, so this
step requires network access. The generated `paper/TEMPLATE.md` records the
selected source for later review.

## Write and review a paper

After initialization, follow the [paper-writing guide](../paper-writing.md).
For example, ask: `Write the methodology from the current code and configs.`
The section writers update the existing LaTeX target directly and report the
evidence used; `paper-reviewing` reports findings without changing
files unless you request a fix.

## Migrating from 0.1.0

Update or reinstall `research-agents`, then start a clean session. Do not keep
old skill directories beside the new domain-prefixed catalog; duplicate
descriptions make skill discovery ambiguous. Ask the agent to list installed
research skills and confirm `research-using-skills` and `paper-reviewing`
before continuing.

This migration does not change the native-support evidence boundary. Consult
the [compatibility matrix](../compatibility.md) for recorded smoke-test status.
