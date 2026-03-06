import baseConfig from '@brickninja/standard/eslint/base.mjs';
import { defineConfig } from 'eslint/config';

const config = defineConfig([
  {
    ignores: [
      // Build outputs
      '**/.temp',
      '**/.next',
      '**/.swc',
      '**/.turbo',
      '**/.cache',
      '**/.build',
      '**/.vercel',
      '**/dist',
      '**/build',
      // Dependencies
      '**/node_modules/',
      '**/public/',
      // Generated files
      'pnpm-lock.yaml',
    ],
  },
  ...baseConfig,
]);

export default config;
