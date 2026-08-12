import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const PAPER_SKILLS = {
  'writing-paper-abstract': ['paper/sections/abstract.tex', 'abstract', 'evidence', 'citation'],
  'writing-paper-introduction': ['paper/sections/introduction.tex', 'introduction', 'gap', 'contributions'],
  'writing-paper-related-work': ['paper/sections/related-work.tex', 'related work', 'citation', 'bibliography'],
  'writing-paper-methodology': ['paper/sections/methodology.tex', 'methodology', 'code', 'algorithm'],
  'writing-paper-experimental-results': ['paper/sections/experimental-results.tex', 'experimental results', 'metrics', 'uncertainty'],
  'writing-paper-conclusion': ['paper/sections/conclusion.tex', 'conclusion', 'limitations', 'future work'],
  'reviewing-research-paper': [
    'complete paper', 'correctness', 'completeness', 'coherence', 'venue fit',
    'reproducibility', 'citation', 'latex', 'code', 'configs', 'results',
    'section ordering', 'includes', 'citation-key', 'terminology',
    'result artifacts', 'implementation', 'summary', 'findings',
    'blocking', 'important', 'minor', 'location', 'evidence', 'recommendation',
    'does not modify'
  ]
};

const DISALLOWED_TOOL_NAMES = [
  'apply_patch', 'bash', 'glob', 'grep', 'todowrite', 'webfetch', 'Bash', 'Read', 'Task'
];

function assertReviewWorkflowContract(text) {
  assert.match(text, /inspect the complete[\s\S]*?paper[\s\S]*?repository/i);
  assert.match(text, /\*\*Severity:\*\*[\s\S]*?exactly `blocking`, `important`, or `minor`/i);
  for (const field of ['Location', 'Evidence', 'Recommendation']) {
    assert.match(text, new RegExp(`\\*\\*${field}:\\*\\*`));
  }
  assert.doesNotMatch(text, /\b(?:may|can|should|must|will|are allowed to)\s+modify files\b/i);
}

function assertPaperWritingSkillContract(name, text, phrases) {
  assert.match(text, new RegExp(`^name: ${name}$`, 'm'));
  assert.match(text, /^description: Use when\b/m);
  assert.ok(text.split('\n').length < 500);
  for (const phrase of phrases) {
    assert.ok(text.toLowerCase().includes(phrase.toLowerCase()), `missing required phrase: ${phrase}`);
  }
  assert.match(text, /direct|write/i);
  assert.match(text, /preserv|existing/i);
  assert.match(text, /missing|do not invent|must not/i);
  assert.doesNotMatch(text, new RegExp(`\\b(${DISALLOWED_TOOL_NAMES.join('|')})\\b`, 'i'));
  if (name === 'reviewing-research-paper') {
    assertReviewWorkflowContract(text);
    assert.match(text, /do not modify files/i);
    assert.match(text, /user requests fixes/i);
  }
}

for (const [name, phrases] of Object.entries(PAPER_SKILLS)) {
  test(`${name} has the paper-writing contract`, async () => {
    const text = await fs.readFile(path.join('skills', name, 'SKILL.md'), 'utf8');
    assertPaperWritingSkillContract(name, text, phrases);
  });
}

function validAbstractSkill(body) {
  return `---\nname: writing-paper-abstract\ndescription: Use when drafting an abstract.\n---\n\n${body}`;
}

function validReviewSkill(body) {
  return `---
name: reviewing-research-paper
description: Use when assessing a completed research manuscript before submission.
---

Inspect the complete paper in \`paper/\` and its supporting repository. Preserve
existing files. The review does not modify files. Do not modify files. Stop unless the user requests fixes.

Inspect correctness, completeness, coherence, venue fit, reproducibility,
citations, LaTeX, terminology, code, configs, results, result artifacts,
section ordering, includes, citation-key resolution, and implementation.
Do not invent missing evidence. Write findings after a concise summary.

Each finding has **Severity:** exactly \`blocking\`, \`important\`, or \`minor\`;
**Location:** an exact path or section; **Evidence:** observed repository evidence;
and **Recommendation:** a concrete action.

${body}`;
}

test('paper-writing contract rejects a path that differs from the required literal', () => {
  const text = validAbstractSkill(
    'Write an abstract with evidence and citation in paper/sections/abstractXtex. Preserve existing text when information is missing.'
  );
  assert.throws(() => assertPaperWritingSkillContract(
    'writing-paper-abstract', text, PAPER_SKILLS['writing-paper-abstract']
  ));
});

test('paper-writing contract rejects plain disallowed tool names', () => {
  const text = validAbstractSkill(
    'Write an abstract with evidence and citation in paper/sections/abstract.tex. Preserve existing text when information is missing. Use apply_patch.'
  );
  assert.throws(() => assertPaperWritingSkillContract(
    'writing-paper-abstract', text, PAPER_SKILLS['writing-paper-abstract']
  ));
});

test('valid review fixture satisfies the complete review contract', () => {
  assert.doesNotThrow(() => assertPaperWritingSkillContract(
    'reviewing-research-paper', validReviewSkill(''), PAPER_SKILLS['reviewing-research-paper']
  ));
});

test('review contract rejects an omitted complete-paper and repository inspection', () => {
  const text = validReviewSkill('').replace(
    'Inspect the complete paper in `paper/` and its supporting repository.',
    'Inspect only the abstract.'
  );
  assert.throws(() => assertPaperWritingSkillContract(
    'reviewing-research-paper', text, PAPER_SKILLS['reviewing-research-paper']
  ));
});

test('review contract rejects a missing required review dimension', () => {
  const text = validReviewSkill('').replace('LaTeX, ', '');
  assert.throws(() => assertPaperWritingSkillContract(
    'reviewing-research-paper', text, PAPER_SKILLS['reviewing-research-paper']
  ));
});

test('review contract rejects a malformed severity set', () => {
  const text = validReviewSkill('').replace('`blocking`, `important`, or `minor`', '`blocking`, `urgent`, or `minor`');
  assert.throws(() => assertPaperWritingSkillContract(
    'reviewing-research-paper', text, PAPER_SKILLS['reviewing-research-paper']
  ));
});

test('review contract rejects missing structured finding fields', () => {
  const text = validReviewSkill('').replace('**Evidence:** observed repository evidence;\n', '');
  assert.throws(() => assertPaperWritingSkillContract(
    'reviewing-research-paper', text, PAPER_SKILLS['reviewing-research-paper']
  ));
});

test('review contract rejects permission to modify files', () => {
  const text = validReviewSkill('You may modify files while reviewing.');
  assert.throws(() => assertPaperWritingSkillContract(
    'reviewing-research-paper', text, PAPER_SKILLS['reviewing-research-paper']
  ));
});

test('review contract rejects platform-tool references', () => {
  const text = validReviewSkill('Use Read to inspect the manuscript.');
  assert.throws(() => assertPaperWritingSkillContract(
    'reviewing-research-paper', text, PAPER_SKILLS['reviewing-research-paper']
  ));
});

test('paper-writing skills are discoverable in the library and README', async () => {
  const index = await fs.readFile('skills/listing-research-skills/SKILL.md', 'utf8');
  const readme = await fs.readFile('README.md', 'utf8');
  for (const name of Object.keys(PAPER_SKILLS)) {
    assert.match(index, new RegExp(name));
    assert.match(readme, new RegExp(name));
  }
});
