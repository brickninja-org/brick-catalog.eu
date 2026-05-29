---
name: blog-prompt-lint
description: Lint AI blog prompt config for structure, syntax, and policy consistency.
---

# Blog Prompt Lint Skill

Use this skill before/after editing `packages/ai/src/config.ts`.

## Checks

1. Template string integrity (no broken backticks).
2. No duplicate or conflicting instruction lines.
3. DataType-specific rules are in correct sections.
4. Output policy is consistent:
- exactly 3 highlights
- no escaped control sequences in output
- no TOC/index blocks like "In This Report"
5. Reliability policy:
- external data only when highly reliable and source-backed.

## Validation

- Run syntax check: `node --check packages/ai/src/config.ts`
