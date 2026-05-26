# Vercel Workspaces Setup

This repository is configured as a pnpm workspace monorepo and is currently set up for the web app on Vercel.

## Goal

Use one Git repository with a Vercel project for:

- `apps/web`

## What is already configured in code

- Workspace layout via `pnpm-workspace.yaml`
- Web app Vercel config file:
  - `apps/web/vercel.ts`
- `apps/web/vercel.ts` includes region and bot-branch deployment guardrails.

## Dashboard setup (required)

Create one Vercel project for `apps/web`:

1. Import this Git repository in Vercel.
2. For the web project, set **Root Directory** to `apps/web`.
3. Verify the project uses the correct install/build commands from `apps/web`.

## Notes

- Keep package names unique across workspace packages (`package.json -> name`).
- If you later want worker linked again, add `relatedProjects` back in `apps/web/vercel.ts`.
- If you want a single domain with multiple services under path prefixes, use Vercel Services (`experimentalServices`).

## CLI flow (copy/paste)

Run from repository root:

```bash
pwd
```

Authenticate (once):

```bash
vercel login
```

Link `apps/web` to the correct Vercel project:

```bash
cd apps/web
vercel link
```

When prompted:
- scope/team: choose your team
- link to existing project: yes (if already created in dashboard) or create new
- project name: your `web` project

Pull environment variables for local development:

```bash
vercel env pull .env.local
```

Optional local Vercel runtime check:

```bash
vercel dev -L
```

Verify the linked project:

```bash
vercel project inspect
```

Deploy with Git (recommended for linked monorepo projects):

```bash
git add -A
git commit -m "chore: configure vercel workspaces"
git push
```
