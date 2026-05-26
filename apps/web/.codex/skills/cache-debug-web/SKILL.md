---
name: cache-debug-web
description: Diagnose and fix Next.js cache tag mismatches for blog and content pages.
---

# Cache Debug Web Skill

Use this skill when new posts or updates do not show in list/detail pages.

## Checklist

1. Identify query cache tags (`cacheTag(...)`) for list/detail.
2. Identify invalidation tags (`revalidateTag(...)`) used by actions/workflows.
3. Ensure singular/plural tag names match exactly.
4. Validate behavior in dev vs production cache modes.
5. Re-test list page, detail page, and admin publish flow.

## Common Failure

- `post:*` vs `posts:*` mismatch.
