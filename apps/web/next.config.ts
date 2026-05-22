import type { NextConfig } from 'next';

import path from 'node:path';

import createNextIntlPlugin from 'next-intl/plugin';
import { withWorkflow } from 'workflow/next';

const ONE_DAY = 60 * 60 * 24;
const isDev = process.env.NODE_ENV !== 'production';
const enableProdSourceMaps = process.env.NEXT_PROD_SOURCEMAPS === 'true';
const enableServerSourceMaps = process.env.NEXT_SERVER_SOURCEMAPS === 'true';

const nextConfig: NextConfig = {
  // add deploymentId
  deploymentId: process.env.DEPLOYMENT_ID || undefined,

  // enable stricter React runtime checks in development
  reactStrictMode: true,

  // use React Compiler optimizations
  reactCompiler: true,

  // improve DX by surfacing fetch and browser warnings in terminal output
  logging: {
    browserToTerminal: isDev ? 'warn' : false,
    fetches: {
      fullUrl: isDev,
    },
  },

  // avoid automatic trailing-slash normalization redirects
  skipTrailingSlashRedirect: true,

  // enable experimental features
  experimental: {
    // generate server source maps when explicitly enabled
    serverSourceMaps: enableServerSourceMaps,

    // typed environment variables (.env)
    typedEnv: true,

    // enable next/root-params
    rootParams: true,
    appNewScrollHandler: true,
    cachedNavigations: true,
    mcpServer: isDev,
    turbopackFileSystemCacheForBuild: true,
    turbopackFileSystemCacheForDev: true,
  },

  // enable cache
  cacheComponents: true,
  cacheLife: {
    max: {
      stale: ONE_DAY * 30,
      revalidate: ONE_DAY * 30,
      expire: ONE_DAY * 365,
    },
  },

  // enable production source maps only when explicitly requested
  productionBrowserSourceMaps: enableProdSourceMaps,

  // allow cross-origin request during development
  allowedDevOrigins: ['*.brickcatalog.localhost'],

  // transpile workspace/ui packages for consistent bundling
  transpilePackages: ['@brickninja-org/ui', '@heroui/react', '@heroui-pro/react'],

  // disable typechecking during some CI jobs, as there are separate jobs for it
  typescript: { ignoreBuildErrors: !!process.env.SKIP_TYPES },

  // transpile @brickcatalog/ui package
  outputFileTracingRoot: path.join(__dirname, '../../'),

  // align Turbopack module resolution with monorepo root
  turbopack: {
    root: path.join(__dirname, '../../'),
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withWorkflow(withNextIntl(nextConfig));
