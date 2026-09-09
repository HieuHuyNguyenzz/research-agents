import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const PAPER_WRITERS = {
  'paper-writing-abstract': {
    target: 'paper/sections/abstract.tex',
    phrases: ['abstract', 'evidence', 'citation']
  },
  'paper-writing-introduction': {
    target: 'paper/sections/introduction.tex',
    phrases: ['introduction', 'gap', 'contributions']
  },
  'paper-writing-related-work': {
    target: 'paper/sections/related-work.tex',
    phrases: ['related work', 'citation', 'bibliography']
  },
  'paper-writing-methodology': {
    target: 'paper/sections/methodology.tex',
    phrases: ['methodology', 'code', 'algorithm']
  },
  'paper-writing-experimental-results': {
    target: 'paper/sections/experimental-results.tex',
    phrases: ['experimental results', 'metrics', 'uncertainty']
  },
  'paper-writing-conclusion': {
    target: 'paper/sections/conclusion.tex',
    phrases: ['conclusion', 'limitations', 'future work']
  }
};

const REVIEW_SKILL = 'paper-reviewing';
const CITATION_CAPABLE_WRITERS = new Set([
  'paper-writing-introduction',
  'paper-writing-related-work',
  'paper-writing-methodology',
  'paper-writing-experimental-results'
]);
const REVIEW_PHRASES = [
    'complete paper', 'correctness', 'completeness', 'coherence', 'venue fit',
    'reproducibility', 'citation', 'latex', 'code', 'configs', 'results',
    'section ordering', 'includes', 'citation-key', 'terminology',
    'result artifacts', 'implementation', 'summary', 'findings',
    'blocking', 'important', 'minor', 'location', 'evidence', 'recommendation',
    'does not modify'
];

const DISALLOWED_TOOL_REFERENCES = [
  /\bapply_patch\b/i,
  /\b(?:bash|glob|grep|todowrite|webfetch)\s+tool\b/i,
  /\b(?:use|run|invoke|call)\s+(?:the\s+)?`?(?:Bash|Read|Task)`?\b/i,
  /\b(?:Bash|Read|Task)\s+tool\b/,
  /`(?:Bash|Read|Task)`/
];

function assertReviewWorkflowContract(text) {
  assert.match(text, /inspect the complete[\s\S]*?paper[\s\S]*?repository/i);
  assert.match(text, /\*\*Severity:\*\*[\s\S]*?exactly `blocking`, `important`, or `minor`/i);
  for (const field of ['Location', 'Evidence', 'Recommendation']) {
    assert.match(text, new RegExp(`\\*\\*${field}:\\*\\*`));
  }
  assert.doesNotMatch(text, /\b(?:may|can|should|must|will|are allowed to)\s+modify files\b/i);
}

function assertPaperWritingSkillContract(name, text, phrases, target) {
  assert.match(text, new RegExp(`^name: ${name}$`, 'm'));
  assert.match(text, /^description: Use when\b/m);
  assert.ok(text.split('\n').length < 500);
  for (const phrase of phrases) {
    assert.ok(text.toLowerCase().includes(phrase.toLowerCase()), `missing required phrase: ${phrase}`);
  }
  if (target) {
    const escapedTarget = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(text, new RegExp(`write directly\\s+to\\s+\\\`${escapedTarget}\\\``, 'i'));
  }
  assert.match(text, /direct|write/i);
  assert.match(text, /preserv|existing/i);
  assert.match(text, /missing|do not invent|must not/i);
  if (target) {
    assert.match(text, /whole repository|entire repository/i);
    assert.match(text, /different (?:section )?layout|alternate (?:section )?layout|noncanonical included (?:section path|file)/i);
    assert.match(text, /include graph from `paper\/main\.tex`/i);
    assert.match(text, /do not create or update an unreachable parallel section file/i);
    if (CITATION_CAPABLE_WRITERS.has(name)) {
      assert.match(text, /user\s+explicitly\s+(?:supplies|provides|requests)[\s\S]{0,120}?(?:new\s+)?(?:citation|source)|(?:new\s+)?(?:citation|source)[\s\S]{0,120}?user\s+explicitly\s+(?:supplies|provides|requests)/i);
    }
  }
  for (const reference of DISALLOWED_TOOL_REFERENCES) {
    assert.doesNotMatch(text, reference);
  }
  if (name === REVIEW_SKILL) {
    assertReviewWorkflowContract(text);
    assert.match(text, /do not modify files/i);
    assert.match(text, /user requests fixes/i);
  }
}

for (const [name, { target, phrases }] of Object.entries(PAPER_WRITERS)) {
  test(`${name} has the paper-writing contract`, async () => {
    const text = await fs.readFile(path.join('skills', name, 'SKILL.md'), 'utf8');
    assertPaperWritingSkillContract(name, text, phrases, target);
  });
}

test(`${REVIEW_SKILL} has the review-only contract`, async () => {
  const text = await fs.readFile(path.join('skills', REVIEW_SKILL, 'SKILL.md'), 'utf8');
  assertPaperWritingSkillContract(REVIEW_SKILL, text, REVIEW_PHRASES);
  assert.match(text, /complete `paper\/` tree/i);
  assert.match(text, /does not modify files/i);
});

function validAbstractSkill(body) {
  return `---\nname: paper-writing-abstract\ndescription: Use when drafting an abstract.\n---\n\nInspect the whole repository and the existing target first.\n\nTrace the include graph from \`paper/main.tex\`. Write directly to \`paper/sections/abstract.tex\`; create it if absent. If the manuscript has a clearly established noncanonical included file, follow that layout instead of creating a duplicate. Do not create or update an unreachable parallel section file. Preserve existing text when information is missing and do not invent facts. Use existing citation keys only when a citation is necessary.\n\n${body}`;
}

function validIntroductionSkill(body) {
  return `---\nname: paper-writing-introduction\ndescription: Use when drafting an introduction.\n---\n\nInspect the whole repository and the existing target first.\n\nTrace the include graph from \`paper/main.tex\`. Write directly to \`paper/sections/introduction.tex\`; create it if absent. If the manuscript has a clearly established noncanonical included file, follow that layout instead of creating a duplicate. Do not create or update an unreachable parallel section file. Preserve existing text when information is missing and do not invent facts. Use existing citation keys only, unless the user explicitly supplies or requests a new source.\n\n${body}`;
}

function validReviewSkill(body) {
  return `---
name: paper-reviewing
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
  const text = validAbstractSkill('Write an abstract with evidence and citation.').replaceAll(
    'paper/sections/abstract.tex', 'paper/sections/abstractXtex'
  );
  assert.throws(() => assertPaperWritingSkillContract(
    'paper-writing-abstract', text, PAPER_WRITERS['paper-writing-abstract'].phrases,
    PAPER_WRITERS['paper-writing-abstract'].target
  ));
});

test('valid writer fixture satisfies the complete writer contract', () => {
  assert.doesNotThrow(() => assertPaperWritingSkillContract(
    'paper-writing-abstract', validAbstractSkill('Write an abstract with evidence and citation.'),
    PAPER_WRITERS['paper-writing-abstract'].phrases,
    PAPER_WRITERS['paper-writing-abstract'].target
  ));
});

test('abstract skill supports preliminary and final modes with MRCI and audience checks', async () => {
  const text = await fs.readFile('skills/paper-writing-abstract/SKILL.md', 'utf8');
  for (const phrase of [
    'preliminary', 'final mode', 'research map', 'MRCI', 'Motivation',
    'Results', 'Contributions', 'Implications', 'intended audience',
    'target venue', 'word limit', 'So what?'
  ]) {
    const pattern = phrase.replace(/[?]/g, '\\$&').replace(/\s+/g, '\\s+');
    assert.match(text, new RegExp(pattern, 'i'), `missing abstract guidance: ${phrase}`);
  }
  assert.match(text, /planned\s+or\s+expected\s+findings\s+as\s+observed\s+results/i);
  assert.match(text, /imitate their communication style, not their content/i);
});

test('writer contract rejects omitted alternate-layout exception', () => {
  const text = validAbstractSkill('Write an abstract with evidence and citation.').replace(
    ' If the manuscript has a clearly established noncanonical included file, follow that layout instead of creating a duplicate.',
    ''
  );
  assert.throws(() => assertPaperWritingSkillContract(
    'paper-writing-abstract', text, PAPER_WRITERS['paper-writing-abstract'].phrases,
    PAPER_WRITERS['paper-writing-abstract'].target
  ));
});

test('writer contract rejects omitted explicit user-supplied citation exception', () => {
  const text = validIntroductionSkill('Write an introduction with gap, contributions, and citation.').replace(
    ', unless the user explicitly supplies or requests a new source',
    ''
  );
  assert.throws(() => assertPaperWritingSkillContract(
    'paper-writing-introduction', text, PAPER_WRITERS['paper-writing-introduction'].phrases,
    PAPER_WRITERS['paper-writing-introduction'].target
  ));
});

test('paper-writing contract rejects plain disallowed tool names', () => {
  const text = validAbstractSkill(
    'Write an abstract with evidence and citation in paper/sections/abstract.tex. Preserve existing text when information is missing. Use apply_patch.'
  );
  assert.throws(() => assertPaperWritingSkillContract(
    'paper-writing-abstract', text, PAPER_WRITERS['paper-writing-abstract'].phrases,
    PAPER_WRITERS['paper-writing-abstract'].target
  ));
});

test('paper-writing contract allows ordinary prose that overlaps tool names', () => {
  const text = validAbstractSkill(
    'Write directly to `paper/sections/abstract.tex` with abstract evidence and citation. Read the existing section and complete the task without inventing missing facts.'
  );
  assert.doesNotThrow(() => assertPaperWritingSkillContract(
    'paper-writing-abstract', text, PAPER_WRITERS['paper-writing-abstract'].phrases,
    PAPER_WRITERS['paper-writing-abstract'].target
  ));
});

test('paper-writing contract rejects clearly named platform tools', () => {
  for (const body of [
    'Use Bash to write directly to `paper/sections/abstract.tex` with abstract evidence and citation. Preserve existing text when information is missing.',
    'Use Read to write directly to `paper/sections/abstract.tex` with abstract evidence and citation. Preserve existing text when information is missing.',
    'Use the Task tool to write directly to `paper/sections/abstract.tex` with abstract evidence and citation. Preserve existing text when information is missing.'
  ]) {
    const text = validAbstractSkill(body);
    assert.throws(() => assertPaperWritingSkillContract(
      'paper-writing-abstract', text, PAPER_WRITERS['paper-writing-abstract'].phrases,
      PAPER_WRITERS['paper-writing-abstract'].target
    ));
  }
});

test('valid review fixture satisfies the complete review contract', () => {
  assert.doesNotThrow(() => assertPaperWritingSkillContract(
    REVIEW_SKILL, validReviewSkill(''), REVIEW_PHRASES
  ));
});

test('review contract rejects an omitted complete-paper and repository inspection', () => {
  const text = validReviewSkill('').replace(
    'Inspect the complete paper in `paper/` and its supporting repository.',
    'Inspect only the abstract.'
  );
  assert.throws(() => assertPaperWritingSkillContract(
    REVIEW_SKILL, text, REVIEW_PHRASES
  ));
});

test('review contract rejects a missing required review dimension', () => {
  const text = validReviewSkill('').replace('LaTeX, ', '');
  assert.throws(() => assertPaperWritingSkillContract(
    REVIEW_SKILL, text, REVIEW_PHRASES
  ));
});

test('review contract rejects a malformed severity set', () => {
  const text = validReviewSkill('').replace('`blocking`, `important`, or `minor`', '`blocking`, `urgent`, or `minor`');
  assert.throws(() => assertPaperWritingSkillContract(
    REVIEW_SKILL, text, REVIEW_PHRASES
  ));
});

test('review contract rejects missing structured finding fields', () => {
  const text = validReviewSkill('').replace('**Evidence:** observed repository evidence;\n', '');
  assert.throws(() => assertPaperWritingSkillContract(
    REVIEW_SKILL, text, REVIEW_PHRASES
  ));
});

test('review contract rejects permission to modify files', () => {
  const text = validReviewSkill('You may modify files while reviewing.');
  assert.throws(() => assertPaperWritingSkillContract(
    REVIEW_SKILL, text, REVIEW_PHRASES
  ));
});

test('review contract rejects platform-tool references', () => {
  const text = validReviewSkill('Use Read to inspect the manuscript.');
  assert.throws(() => assertPaperWritingSkillContract(
    REVIEW_SKILL, text, REVIEW_PHRASES
  ));
});

function assertPaperWritingDiscovery(readme) {
  for (const name of [...Object.keys(PAPER_WRITERS), REVIEW_SKILL]) {
    assert.match(readme, new RegExp(name));
  }
  assert.match(readme, /paper-reading[\s\S]*paper-writing-methodology[\s\S]*results-analyzing-experiments[\s\S]*paper-writing-experimental-results[\s\S]*paper-writing-related-work[\s\S]*paper-writing-introduction[\s\S]*paper-writing-conclusion[\s\S]*paper-writing-abstract[\s\S]*paper-reviewing/i);
  assert.match(readme, /Write the methodology section from the current code and configs\./);
}

test('paper-writing skills are discoverable in the library and README', async () => {
  const readme = await fs.readFile('README.md', 'utf8');
  assertPaperWritingDiscovery(readme);
});

test('paper-writing discovery rejects a missing or reordered workflow writer', () => {
  const orderedWorkflow = [
    'paper-reading',
    'paper-writing-methodology',
    'results-analyzing-experiments',
    'paper-writing-experimental-results',
    'paper-writing-related-work',
    'paper-writing-introduction',
    'paper-writing-conclusion',
    'paper-writing-abstract',
    'paper-reviewing'
  ].join('\n');
  const example = 'Write the methodology section from the current code and configs.';
  assert.doesNotThrow(() => assertPaperWritingDiscovery(`${orderedWorkflow}\n${example}`));
  assert.throws(() => assertPaperWritingDiscovery(orderedWorkflow.replace(
    'results-analyzing-experiments\npaper-writing-experimental-results',
    'paper-writing-experimental-results\nresults-analyzing-experiments'
  ) + example));
  assert.throws(() => assertPaperWritingDiscovery(orderedWorkflow.replace(
    'paper-writing-related-work\n', ''
  ) + example));
});
