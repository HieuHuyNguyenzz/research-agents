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
