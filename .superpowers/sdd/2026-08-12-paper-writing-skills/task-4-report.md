# Task 4 report: paper-writing discovery

## Delivered

- Added the six paper-section writers and `reviewing-research-paper` to the
  research-skill library index with concise capabilities.
- Documented that writers edit their assigned `paper/sections/*.tex` file,
  while the reviewer only reports findings unless fixes are requested.
- Added the README workflow: `reading-research-paper` → writers →
  `analyzing-experiment-results` → `reviewing-research-paper`, all seven skill
  names, and a natural-language methodology request.
- Strengthened the paper-writing test contract to require each writer's exact
  canonical target and the review-only `paper/` behavior.

## Verification

Ran successfully on 2026-08-12:

- `node --test tests/paper-writing-skills.test.mjs` — 17 passing tests.
- `npm run verify` — 103 passing Node tests and 15 passing integration tests.
- `git diff --check` — no whitespace errors.

## Concerns

None. Untracked `.DS_Store` files pre-existed and were deliberately excluded
from this task's commit.

## Fix round 1

- Replaced the blanket, case-insensitive platform-tool word matcher with
  explicit tool-reference patterns. Ordinary prose such as “Read the existing
  section” and “complete the task” is permitted; `apply_patch` and clearly
  named `Bash`, `Read`, or `Task` tool references are rejected.
- Strengthened README workflow validation to require the ordered sequence of
  all six writers between `reading-research-paper` and
  `analyzing-experiment-results`, followed by `reviewing-research-paper`.
- Added regressions for ordinary prose, named platform tools, and missing or
  reordered workflow writers.

Verification for this fix round:

- `node --test tests/paper-writing-skills.test.mjs` — 20 passing tests.
- `npm run verify` — 106 passing Node tests and 15 passing integration tests.
- `git diff --check` — no whitespace errors.
