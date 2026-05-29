---
name: ai-blog-regenerate
description: Regenerate existing blog posts by dataType/month while preserving page structure and cache behavior.
---

# AI Blog Regenerate Skill

Use this skill when the user asks to regenerate existing posts.

## Goal

Refresh an existing post with updated catalog metrics while keeping page-compatible markdown and publish flow stable.

## Steps

1. Confirm target:
- `month`
- `dataType`
- optional `postId`

2. Run regenerate flow using `generateAndSavePostFromCatalogSnapshot`.

3. Validate output constraints:
- Title <= 60 chars (preferred by prompt policy).
- Content excludes duplicate executive-summary headings.
- Exactly 3 highlights.

4. Verify post appears in list/detail:
- Query cache tags align (`post:list`, `post:slug:*`).
- If needed, trigger revalidation tags.

5. Return concise summary:
- Previous slug/title vs new slug/title.
- Updated timestamp.
- Any warnings.

## Guardrails

- Do not inject external statistics unless they are explicitly reliable and source-backed.
- Keep markdown plain and page-compatible.
