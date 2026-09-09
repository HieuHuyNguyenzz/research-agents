import { TARGET_PATHS } from './paths.mjs';

const NOT_SPECIFIED = 'Not specified.';

function singleLine(value) {
  return String(value).replace(/[\r\n]+/g, ' ');
}

function markdownText(value) {
  return singleLine(value).replace(/[\\`*_[\]{}<>#+\-!|]/g, '\\$&');
}

function tomlString(value) {
  return JSON.stringify(String(value));
}

function bibTeXText(value) {
  return singleLine(value).replace(/[\\{}%]/g, '\\$&');
}

function listOrNotSpecified(values) {
  return Array.isArray(values) && values.length > 0
    ? values.map(markdownText).join('; ')
    : NOT_SPECIFIED;
}

function markdownList(values) {
  return Array.isArray(values) && values.length > 0
    ? values.map((value) => `- ${markdownText(value)}`).join('\n')
    : `- ${NOT_SPECIFIED}`;
}

function latexEscape(value) {
  const escapedCharacters = {
    '\\': '\\textbackslash{}',
    '&': '\\&',
    '%': '\\%',
    '$': '\\$',
    '#': '\\#',
    _: '\\_',
    '{': '\\{',
    '}': '\\}',
    '~': '\\textasciitilde{}',
    '^': '\\textasciicircum{}'
  };

  return singleLine(value).replace(/[\\&%$#_{}~^]/g, (character) => escapedCharacters[character]);
}

function replaceLatexCommand(source, command, value) {
  const match = new RegExp(`\\\\${command}\\s*\\{`).exec(source);
  const replacement = `\\${command}{${value}}`;
  if (!match) {
    const documentStart = source.search(/\\begin\s*\{document\}/);
    if (documentStart < 0) return `${source.trimEnd()}\n${replacement}\n`;
    return `${source.slice(0, documentStart)}${replacement}\n${source.slice(documentStart)}`;
  }

  let depth = 1;
  let index = match.index + match[0].length;
  for (; index < source.length && depth > 0; index += 1) {
    const character = source[index];
    let precedingBackslashes = 0;
    for (let cursor = index - 1; cursor >= 0 && source[cursor] === '\\'; cursor -= 1) {
      precedingBackslashes += 1;
    }
    if (precedingBackslashes % 2 === 1) continue;
    if (character === '{') depth += 1;
    if (character === '}') depth -= 1;
  }
  if (depth !== 0) throw new Error(`Template has an unterminated \\${command} command`);
  return `${source.slice(0, match.index)}${replacement}${source.slice(index)}`;
}

function renderPaperMain(manifest, template) {
  if (!template || typeof template.text !== 'string') {
    throw new TypeError('Template material must provide text');
  }

  const authors = Array.isArray(manifest.authors) && manifest.authors.length > 0
    ? manifest.authors.join(', ')
    : NOT_SPECIFIED;
  const placeholdersApplied = template.text
    .replaceAll('{{PROJECT_NAME}}', latexEscape(manifest.projectName))
    .replaceAll('{{AUTHORS}}', latexEscape(authors));
  const withTitle = replaceLatexCommand(
    placeholdersApplied,
    'title',
    latexEscape(manifest.projectName)
  );
  const withAuthor = replaceLatexCommand(withTitle, 'author', latexEscape(authors));
  const documentStart = withAuthor.search(/\\begin\s*\{document\}/);
  const documentEnds = [...withAuthor.matchAll(/\\end\s*\{document\}/g)];
  if (documentStart < 0 || documentEnds.length === 0) {
    throw new Error('Template must contain a complete document environment');
  }
  const opening = /\\begin\s*\{document\}/.exec(withAuthor.slice(documentStart));
  const bodyStart = documentStart + opening.index + opening[0].length;
  const closing = documentEnds.at(-1);
  if (closing.index < bodyStart) {
    throw new Error('Template document environment is malformed');
  }
  const canonicalBody = `
\\maketitle

\\input{sections/abstract}
\\input{sections/introduction}
\\input{sections/related-work}
\\input{sections/methodology}
\\input{sections/experimental-results}
\\input{sections/conclusion}

\\bibliographystyle{IEEEtran}
\\bibliography{references}
`;
  return `${withAuthor.slice(0, bodyStart)}${canonicalBody}${withAuthor.slice(closing.index)}`;
}

function renderers(manifest, template) {
  const projectName = markdownText(manifest.projectName);
  const overview = markdownText(manifest.overview);
  const projectSlug = singleLine(manifest.projectName).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'research-project';

  return {
    'README.md': () => `# ${projectName}\n\n## Overview\n\n${overview}\n\n## Objectives\n\n${markdownList(manifest.objectives)}\n\n## Research questions\n\n${markdownList(manifest.researchQuestions)}\n\n## Data sources\n\n${markdownList(manifest.dataSources)}\n\n## Methods\n\n${markdownList(manifest.methods)}\n\n## Paper template\n\n${markdownText(manifest.paperTemplate)}\n`,
    'AGENTS.md': () => `# ${projectName} research conventions\n\n## Safe operating rules\n\n- Do not overwrite existing files without explicit confirmation.\n- Do not delete unrelated project files.\n- Keep data, results, and paper artifacts in their designated directories.\n\n## Project metadata\n\n- Overview: ${overview}\n- Authors: ${listOrNotSpecified(manifest.authors)}\n`,
    '.gitignore': () => `__pycache__/\n*.py[cod]\n.venv/\nvenv/\n.env\n.env.*\n.DS_Store\nresults/raw/*\n!results/raw/.gitkeep\n`,
    'pyproject.toml': () => `[project]\nname = ${tomlString(projectSlug)}\nversion = "0.1.0"\ndescription = ${tomlString(manifest.overview)}\nrequires-python = ">=3.10"\n\n[tool.pytest.ini_options]\ntestpaths = ["tests"]\n`,
    'docs/architecture.md': () => `# Architecture\n\n## Project overview\n\n${overview}\n\n## Planned components\n\n${markdownList(manifest.methods)}\n`,
    'docs/methodology.md': () => `# Methodology\n\n## Objectives\n\n${markdownList(manifest.objectives)}\n\n## Planned methods\n\n${markdownList(manifest.methods)}\n`,
    'docs/experiments.md': () => `# Experiments\n\n## Research questions\n\n${markdownList(manifest.researchQuestions)}\n\n## Data sources\n\n${markdownList(manifest.dataSources)}\n`,
    'docs/reproduction.md': () => `# Reproduction\n\n## Environment\n\nNot specified. Record dependencies, commands, and random seeds here.\n\n## Evaluation procedure\n\nNot specified.\n`,
    'paper/main.tex': () => renderPaperMain(manifest, template),
    'paper/references.bib': () => `@comment{Add bibliographic entries for ${bibTeXText(manifest.projectName)}.}\n`,
    'paper/sections/abstract.tex': () => `\\begin{abstract}\n\n\\end{abstract}\n`,
    'paper/sections/introduction.tex': () => `\\section{Introduction}\n`,
    'paper/sections/related-work.tex': () => `\\section{Related Work}\n`,
    'paper/sections/methodology.tex': () => `\\section{Methodology}\n`,
    'paper/sections/experimental-results.tex': () => `\\section{Experimental Results}\n`,
    'paper/sections/conclusion.tex': () => `\\section{Conclusion}\n`
  };
}

/** Renders one known scaffold file without writing it to disk. */
export function renderFile(relativePath, manifest, template) {
  if (!TARGET_PATHS.includes(relativePath)) {
    throw new Error(`Unknown scaffold target: ${relativePath}`);
  }

  if (relativePath.endsWith('/.gitkeep')) return '';

  const render = renderers(manifest, template)[relativePath];
  if (typeof render !== 'function') {
    throw new Error(`Unknown scaffold target: ${relativePath}`);
  }

  return render();
}
