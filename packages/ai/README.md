# @brickcatalog/ai

AI package for LEGO catalog content workflows.

## Scope

- Generate structured blog draft content from LEGO catalog data.
- Build catalog snapshots for prompts.
- Persist generated drafts to the `Post` model.

## Exports

- `generatePost(params)`
- `generateAndSavePostFromSnapshot(db, input)`
- `generateAndSavePostFromCatalogSnapshot(db, input)`
- `getCatalogSnapshot(db)`
- `savePost(db, input)`
- shared config, schemas, and tag helpers

## Environment

See `.env.example`:

- `GOOGLE_GENERATIVE_AI_API_KEY`
- `BLOG_MODEL` (default fallback in code)
- `DATABASE_URL`

## Example

```ts
import { generateAndSavePostFromCatalogSnapshot } from "@brickcatalog/ai";

const result = await generateAndSavePostFromCatalogSnapshot(db, {
  month: "2026-05",
  dataType: "elements",
  status: "Draft",
});

console.log(result.post.id, result.post.slug, result.model);
```

## Health Check

Use the built-in health check to validate end-to-end AI post generation.

It will:
- regenerate and publish posts for all main data types
- verify post content sanity (no escaped newline artifacts)
- verify embedding upsert exists for each post

Run:

```bash
pnpm -C packages/ai run health:posts
```

Optional month override:

```bash
BLOG_HEALTH_MONTH=2026-05 pnpm -C packages/ai run health:posts
```

Expected result:
- each dataType returns a published post id + slug
- embedding upsert succeeds for every post
- content sanity checks remain false for escaped newline artifacts

## Editorial Style Guide

Use these rules for generated LEGO catalog posts:

- Keep tone factual, concise, and neutral.
- Lead with concrete numbers from the snapshot; avoid vague claims.
- Use month-over-month framing when `monthOverMonth` data is present.
- Prefer "what changed", "why it matters", and "data quality impact" language.
- Avoid hype words like "massive", "revolutionary", or "game-changing".
- Do not claim official LEGO affiliation.
- Keep section structure aligned with the page: intro, data tables, analysis, impact.
