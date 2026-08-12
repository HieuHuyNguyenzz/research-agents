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
  'reviewing-research-paper': ['paper/', 'review', 'blocking', 'important', 'minor', 'does not modify']
};

for (const [name, phrases] of Object.entries(PAPER_SKILLS)) {
  test(`${name} has the paper-writing contract`, async () => {
    const text = await fs.readFile(path.join('skills', name, 'SKILL.md'), 'utf8');
    assert.match(text, new RegExp(`^name: ${name}$`, 'm'));
    assert.match(text, /^description: Use when\b/m);
    assert.ok(text.split('\n').length < 500);
    for (const phrase of phrases) assert.match(text, new RegExp(phrase, 'i'));
    assert.match(text, /direct|write/i);
    assert.match(text, /preserv|existing/i);
    assert.match(text, /missing|do not invent|must not/i);
    assert.doesNotMatch(text, /`(bash|webfetch|apply_patch|Bash|Read|Task)`/i);
  });
}

test('paper-writing skills are discoverable in the library and README', async () => {
  const index = await fs.readFile('skills/listing-research-skills/SKILL.md', 'utf8');
  const readme = await fs.readFile('README.md', 'utf8');
  for (const name of Object.keys(PAPER_SKILLS)) {
    assert.match(index, new RegExp(name));
    assert.match(readme, new RegExp(name));
  }
});
