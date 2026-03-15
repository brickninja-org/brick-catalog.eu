import type { NextConfig } from 'next';

import path from 'node:path';

const nextConfig: NextConfig = {
  // publish as standalone docker image
  output: 'standalone',

  // add deploymentId
  deploymentId: process.env.DEPLOYMENT_ID || undefined,

  // enable expiremental features
  experimental: {
    // generate server sourcee maps for better errors
    serverSourceMaps: true,

    // typed environment variables (.env)
    typedEnv: true,

    // enable next/root-params
    rootParams: true,
  },

  // enable production source maps
  productionBrowserSourceMaps: true,

  // allow cross-origin request during development
  allowedDevOrigins: ['*.brickcatalog.localhost'],

  // disable typechecking during some CI jobs, as there are separate jobs for it
  typescript: { ignoreBuildErrors: !!process.env.SKIP_TYPES },

  // transpile @brickcatalog/ui package
  outputFileTracingRoot: path.join(__dirname, '../../'),

  reactCompiler: true,
};

export default nextConfig;
