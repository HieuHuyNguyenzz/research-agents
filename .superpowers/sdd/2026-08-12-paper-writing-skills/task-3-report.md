# Task 3 Report: Review Research Paper Skill

## Delivered

- Added `skills/reviewing-research-paper/SKILL.md` with complete-paper and
  repository review coverage, structured findings, exact severities, and a
  review-only/no-file-modification boundary.
- Expanded `tests/paper-writing-skills.test.mjs` with review-specific contract
  requirements, including required finding fields and the stop-until-fixes rule.

## Verification

- Initial RED run: the review skill contract failed because the skill was absent.
- Focused test: `node --test tests/paper-writing-skills.test.mjs`
  - Expected Task 3 status: seven skill contracts and two regression tests pass.
  - Expected remaining failure: library/README discoverability, owned by Task 4.
- `git diff --check` completed without whitespace errors.

## Scope

No manuscript, repository, or other user files were modified by the review skill.

## Fix Round 1

- Added a `validReviewSkill` fixture and negative review-contract regressions.
- The regressions reject omitted complete-paper/repository inspection, a missing
  review dimension, malformed severity values, missing finding fields,
  permission to modify files, and platform-specific tool references.
- Focused test: `node --test tests/paper-writing-skills.test.mjs`
  - 15 tests passed: seven skill contracts, two existing regressions, and six
    review-specific negative regressions.
  - One discovery failure remains, as expected until Task 4 updates the skill
    index and README.
- `git diff --check` completed without whitespace errors.
