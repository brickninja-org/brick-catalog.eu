---
name: ai-blog-generation
description: Generate and publish LEGO catalog blog posts safely with pnpm, including prechecks and post-save validation.
---

# AI Blog Generation Skill

Use this skill when the user asks to generate one or more blog posts from catalog data.

## Goal

Generate high-quality posts through `@brickcatalog/ai`, persist them as `Published`, and validate output sanity.

## Preconditions

- `apps/web/.env` exists and includes `DATABASE_URL` and AI provider keys.
- Database is reachable.
- Catalog data has been ingested by worker jobs.

## Steps

1. Precheck environment:
- `set -a; source apps/web/.env; set +a`
- Verify DB connectivity with a lightweight prisma command.

2. Generate posts:
- Prefer script-based generation in `packages/ai`.
- For batch generation, run data types in this order:
  1. `elements`
  2. `designs`
  3. `colors`
  4. `sets`
  5. `catalog-updates`

3. Validate each result:
- Post is saved with `status=Published`.
- `slug` and `title` are non-empty.
- `highlights` length is exactly 3.

4. Sanity-check content:
- No escaped newline artifacts (`\\n`, `\\r\\n`).
- No known broken tokens (for example stray ` 10 ` markers).
- Markdown structure contains expected H2/H3 sections and tables.

5. Report back:
- Return IDs, slugs, and failed checks (if any).

## Commands

- Health check:
  - `pnpm -C packages/ai run health:posts`
- Optional month override:
  - `BLOG_HEALTH_MONTH=2026-05 pnpm -C packages/ai run health:posts`

## Notes

- If generation succeeds but embedding upsert fails, do not lose the post; report embedding failure separately.
- Keep claims data-first and catalog-scoped.
