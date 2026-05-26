# Codex.md - Web Application

This file provides guidance to Codex when working on `apps/web` in this repository.

## Development Commands

Essential commands for this app:

```bash
# From apps/web
pnpm dev                 # Start Next.js dev server (webpack)
pnpm build               # Production build with debug build paths
pnpm build:raw           # Production build (plain)
pnpm start               # Start production server

# Tests
pnpm test                # Run Vitest tests
pnpm test:format         # Run format-related test suite only

# Code quality
pnpm lint                # Run ESLint
pnpm lint:fix            # Run ESLint with autofix
```

Monorepo shortcuts from repo root:

```bash
pnpm dev:web             # Run web dev via Turbo
pnpm build               # Run all builds in monorepo
pnpm test                # Run all tests in monorepo
pnpm lint                # Run all lint tasks in monorepo
```

## Architecture Overview

### Tech Stack

- Framework: Next.js 16 App Router + React 19
- Styling: Tailwind CSS v4 + HeroUI (`@heroui/react`) + HeroUI Pro (`@heroui-pro/react`)
- Data: Prisma via `@brickcatalog/database`
- Runtime patterns: Server Components + selective Client Components
- Tests: Vitest

### Key Directories

```text
apps/web/src/
├── app/[language]/                      # Main localized app router tree
│   ├── (catalog)/(overview)/            # Overview landing section
│   ├── (catalog)/element/               # Element listing and detail routes
│   ├── admin/views/                     # Admin view analytics
│   ├── build/[id]/                      # Build detail routes
│   ├── status/                          # Status pages (api/database/jobs)
│   ├── translate/                       # Translation editor
│   ├── api/search/                      # Search route handlers
│   └── layout.tsx                       # Localized root layout
├── api/                                 # Non-localized API routes
├── components/                          # Shared UI components
│   ├── format/                          # Formatting providers/utilities
│   ├── i18n/                            # i18n primitives/providers
│   ├── layout/                          # Global layout/header primitives
│   ├── search/                          # Search UI
│   ├── table/                           # Table/data-grid helpers
│   └── ...
├── lib/                                 # Shared server/client helpers
├── proxy/                               # Request proxy pipeline
├── queries/                             # DB query modules
└── translations/                        # en/nl/de dictionaries
```

## Routing & Language Model

This app uses a proxy-driven language model:

1. `subdomainProxy` resolves language subdomain (e.g. `en.*`, `nl.*`, `de.*`).
2. `languageProxy` sets `x-bc-lang` request header.
3. `rewriteProxy` rewrites path to `/{subdomain}{pathname}` internally.

Important implications:

- Language is a runtime concern, not only a URL segment concern.
- `getLanguage()` may resolve from `next/root-params` and fallback to `headers()`.
- Incorrect path + subdomain combinations can create double language prefixes.

## Server/Client Boundaries (Critical)

### General Rules

1. Keep data fetching in Server Components when possible.
2. Move interactive logic (stateful UI, event-driven overlays) to Client Components.
3. Use `<Suspense>` around async subtrees that can resolve after initial shell.

### Blocking Navigation Rule

With Next.js blocking-route checks, avoid request-bound async reads at top-level layout without suspense strategy.

If reading request data (e.g. headers) is unavoidable:

- Isolate it in an async boundary component.
- Wrap boundary in `<Suspense fallback={...}>`.

### HeroUI Import Rule

In Server Components, avoid broad root-barrel imports from `@heroui/react` when they trigger `client-only` errors.

Prefer targeted imports where needed:

- `@heroui/react/card`
- `@heroui/react/skeleton`
- etc.

Use `@heroui-pro/react` for Pro components as documented by MCP docs.

## HeroUI + MCP Workflow

Use MCP as source of truth before implementing or refactoring components.

Required flow:

1. `list_components`
2. `get_component_docs`
3. (Optional) `get_css` / `get_theme_variables`
4. Implement exact compound API patterns from docs

Do not guess component anatomy or prop names.

## Component Conventions

### Co-location

Keep route-specific components close to their route folder under `app/[language]/...`.

Use shared `src/components/*` only when reused across multiple route areas.

### Import Strategy

Prefer alias imports (`@/...`) over deep relative imports.

Examples:

```ts
import Layout from "@/components/layout/Layout";
import {getLanguage} from "@/lib/translate";
import {getYearlyElements} from "@/queries/elements/yearly-statistics";
```

### Interaction API

For HeroUI interactions, prefer `onPress` over `onClick` where applicable.

### Type Safety

1. Avoid `any` unless there is no practical alternative.
2. Keep route and query types explicit.
3. When using generated Next route types, verify they are available in the current build mode.

## Data Layer & Caching

### Query Pattern

- Query modules live under `src/queries/*`.
- Prefer deterministic query helpers and explicit types.

### Cache Pattern

The codebase uses cache helpers (including Next cache primitives and local wrappers). Prefer:

1. Stable cache keys.
2. Explicit revalidation decisions.
3. Avoiding accidental per-request recomputation for static-ish data.

When changing cache behavior, validate impact on:

- navigation speed
- blocking-route warnings
- stale data tolerance

## UI & Styling Guidance

1. Preserve existing visual language and spacing.
2. Reuse existing layout primitives in `components/layout`.
3. Prefer semantic Tailwind utility composition over one-off ad hoc styles.
4. Keep class names readable and concise.
5. Preserve responsive behavior on mobile and desktop.
6. Use `Typography` from `@heroui/react` as the default typography system.

## Testing & Validation Checklist

Before finalizing a change:

1. Lint passes for touched code (`pnpm lint`).
2. Relevant tests pass (`pnpm test` or targeted suite).
3. No new server/client boundary errors.
4. No new blocking-route warnings.
5. Route still resolves correctly under language subdomain flows.
6. No unintended proxy/language rewrite regressions.

## Common Pitfalls

1. Importing `@heroui/react` root barrel in a Server Component and hitting `client-only`.
2. Reading `headers()` at top-level layout without suspense strategy.
3. Confusing external route path with internally rewritten language-prefixed route.
4. Mixing interactive client behavior into server-only files.
5. Forgetting to verify behavior on language subdomains (`en.*`, `nl.*`, `de.*`).

## Safe Change Strategy

For risky changes (routing/layout/i18n/proxy):

1. Make smallest possible change.
2. Verify one route end-to-end.
3. Expand only after confirming behavior.

For UI-only updates:

1. Confirm docs via MCP.
2. Implement with existing patterns.
3. Validate on both desktop and mobile layouts.
