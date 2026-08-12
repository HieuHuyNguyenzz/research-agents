# Install for OpenCode

Add this repository through OpenCode's plugin installer using its git-backed
package mechanism. The bundled plugin registers its own skills path at runtime;
do not add `skills.paths` or manually copy a plugin into global configuration.
Restart OpenCode and ask the agent to list installed research skills.

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
`reviewing-research-paper` skill reports structured findings; invoke a section
writer afterward when you want an edit.
