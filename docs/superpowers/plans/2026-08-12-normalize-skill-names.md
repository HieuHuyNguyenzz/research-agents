# Normalize Research Skill Names Implementation Plan

> **For agentic workers:** Use the repository's skill-writing and verification workflows while executing this plan.

**Goal:** Align the research skill names with Superpowers' lowercase, hyphenated, action-oriented convention.

**Decision:** Keep existing domain names that already use a clear action phrase. Rename `using-research-agents` to `using-research-skills` and `library-index` to `listing-research-skills`, because the repository currently publishes skills rather than autonomous agents and the index name is a noun.

**Scope:** Rename directories and frontmatter, update runtime hooks, tests, README, library discovery, and active installation documentation. Historical design records may retain old names only when they describe an earlier commit; operational references must use the canonical names.

**Verification:** Run `npm run verify`, `git diff --check`, and search the active source for the two legacy names before committing.
