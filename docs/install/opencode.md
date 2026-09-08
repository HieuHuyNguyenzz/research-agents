# Install for OpenCode

Add this repository through OpenCode's plugin installer using its git-backed
package mechanism. The bundled plugin registers its own skills path at runtime;
do not add `skills.paths` or manually copy a plugin into global configuration.
Restart OpenCode and ask the agent to list installed research skills.

After discovery, use the [research workflow guide](../research-workflow.md) for
the end-to-end sequence and the [skill reference](../skill-reference.md) for
inputs, outputs, and example requests.

## Initialize a research project

Ask in natural language: `Initialize a research project.` The agent asks the
initializer questionnaire one field at a time, shows the complete scaffold
summary, and waits for your explicit confirmation before creating files.

The selected IEEE template is downloaded from its configured source, so this
step requires network access. The generated `paper/TEMPLATE.md` records the
selected source for later review.

## Write and review a paper

After initialization, follow the [paper-writing guide](../paper-writing.md).
For example, ask: `Review the complete paper and repository for evidence,
citations, reproducibility, and submission readiness.` The
`paper-reviewing` skill reports structured findings; invoke a section
writer afterward when you want an edit.

## Migrating from 0.1.0

Update or reinstall `research-agents`, then start a clean session. Do not keep
old skill directories beside the new domain-prefixed catalog; duplicate
descriptions make skill discovery ambiguous. Ask the agent to list installed
research skills and confirm `research-using-skills` and `paper-reviewing`
before continuing.

This migration does not change the native-support evidence boundary. Consult
the [compatibility matrix](../compatibility.md) for recorded smoke-test status.
