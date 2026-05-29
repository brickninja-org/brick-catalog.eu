This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Build Note

Current scripts:

```bash
pnpm run build       # next build
pnpm run build:raw   # next build
pnpm run build:debug-paths
```

Use `build:debug-paths` only for local diagnosis when build path tracing is needed.

## Next.js Runtime Profiles

`apps/web/next.config.ts` is configured with production-safe defaults and optional debug toggles.

### Local Development (recommended)

```bash
pnpm dev
```

Behavior:
- Verbose fetch URL logging enabled.
- Browser warnings forwarded to terminal.
- MCP server enabled.
- Turbopack filesystem cache enabled.

### Staging / Production (recommended)

No extra env vars required.

Behavior:
- Browser-to-terminal logging disabled.
- Full fetch URL logging disabled.
- MCP server disabled.
- Source maps disabled by default.

### Temporary Debug in Production-like Environments

Enable only when needed:

```bash
NEXT_PROD_SOURCEMAPS=true
NEXT_SERVER_SOURCEMAPS=true
```

Use short-lived deploys for this profile and disable immediately after diagnosis.

## HeroUI Pro Setup (Turborepo)

This repository uses `@heroui-pro/react` from private HeroUI Pro distribution.

Requirements:
- Node `22` or `24`
- `pnpm` (workspace install from repo root)

Login once on your machine:

```bash
npx heroui-pro login
```

If your shell still runs Node 18, run CLI commands with Node 22 explicitly:

```bash
npx -y node@22 /usr/local/bin/pnpm dlx heroui-pro login
```

After login, run install/rebuild from the repository root:

```bash
npx -y node@22 /usr/local/bin/pnpm install
npx -y node@22 /usr/local/bin/pnpm rebuild @heroui-pro/react --recursive
```

CI/CD:
- Set `HEROUI_AUTH_TOKEN` in CI secrets.
- Run `pnpm install` in repo root (do not use `--ignore-scripts`).
