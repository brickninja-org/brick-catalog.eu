---
name: cache-components
description: Ensure caching is used strategically to minimize CPU usage and regeneration overhead. Use when creating/modifying queries to verify cache decisions align with data update patterns and cost optimization.
---

# Cache Components Skill

This skill ensures strategic use of caching in `apps/web` to reduce CPU usage and avoid unnecessary regeneration work.

## When to Activate

- After creating new data fetching queries
- When modifying existing query functions
- During performance optimization reviews
- Before deploying changes that affect data loading
- When evaluating caching strategy for new features

## Core Philosophy: Cache Strategically, Not Universally

**Not every query should be cached**. Apply caching only when:

✅ **Good Caching Candidates**
- Data that changes infrequently (daily/weekly/monthly)
- Expensive DB queries with stable results
- Read-heavy operations shared by many users
- Public catalog/statistics pages

❌ **Poor Caching Candidates**
- User-specific queries
- Frequently changing live counters
- One-off highly dynamic parameter combinations
- Write operations (mutations, imports, submissions)
- Request-bound values that should not be globally reused

## Current Project Patterns

This app currently uses two patterns:

1. **Next.js cache primitives**
   - `cacheLife(...)`
   - `cacheTag(...)`
   - with `"use cache"` where appropriate

2. **Local wrapper around `unstable_cache`**
   - `src/lib/cache.ts`
   - Usage pattern: `cache(asyncFn, keyParts, { revalidate, tags })`

Both are valid in this codebase. Prefer consistency with nearby files.

## CPU & Regeneration Cost Analysis

Without caching:
- Every request can trigger DB work + server compute
- Higher CPU and slower responses under load

With well-planned caching:
- Lower repeated DB work
- Lower repeated render compute
- Faster responses for hot paths

With poor caching:
- Too many invalidations/revalidations
- Stale data where freshness matters
- Complexity without measurable wins

## Implementation Checklist

### 1. Evaluate Caching Necessity

Before adding cache, ask:
- How often does this data change?
- Is this data global or user/request-specific?
- Will cache materially reduce repeated compute?
- What is acceptable staleness for this route?

### 2. Use Correct Pattern for the File Area

#### Pattern A: Next cache primitives

```ts
import {cacheLife, cacheTag} from "next/cache";

export async function getSomething() {
  "use cache";
  cacheLife("max");
  cacheTag("elements:annual");
  // query...
}
```

#### Pattern B: Local `cache(...)` wrapper

```ts
import {cache} from "@/lib/cache";

const getSomething = cache(
  async (param: string) => {
    // query...
  },
  ["feature-name"],
  {revalidate: 60, tags: ["feature-name"]},
);
```

### 3. Tag Strategy

Use stable, domain-oriented tags (e.g. `elements:*`, `jobs`, `db-stats`) rather than overly granular ad-hoc tags unless required.

### 4. Revalidation Strategy

Use shorter `revalidate` only when freshness demands it.
Use longer cache windows for stable datasets.
Invalidate intentionally after writes/imports when needed.

## Common Patterns

### ✅ Good: Stable Aggregates

```ts
cache(async () => {
  // expensive aggregate
}, ["annual-stats"], {revalidate: 3600, tags: ["annual-stats"]});
```

### ❌ Bad: User-specific cache pollution

```ts
// Avoid globally caching per-user request data without user-key partitioning strategy
```

### ✅ Good: Writes are not cached

```ts
export async function createThing(input: Input) {
  // write
  // optional targeted invalidation
}
```

## Validation Checklist

When reviewing query functions, verify:

1. Caching is justified by read patterns and freshness needs
2. Pattern matches local file conventions (Next primitives vs wrapper)
3. Revalidation window is intentional
4. Tags are stable and useful for invalidation
5. No caching for write operations
6. No accidental request-specific global cache leaks

## Tools Used

- `rg` to find cache usage and missing patterns
- file reads for nearby conventions
- targeted route checks after caching changes

## Target Directories

- `apps/web/src/queries/`
- `apps/web/src/app/[language]/**/page.tsx`
- `apps/web/src/app/[language]/**/route.ts`
- `apps/web/src/lib/cache.ts`

## Related Files

- `apps/web/next.config.ts`
- `apps/web/src/lib/cache.ts`
- Query modules under `apps/web/src/queries/`
