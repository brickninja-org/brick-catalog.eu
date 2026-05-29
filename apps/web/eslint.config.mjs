import baseNextConfig from '@brickninja-org/standard/eslint/next.mjs';
import { defineConfig, globalIgnores } from 'eslint/config';

const config = defineConfig(
  baseNextConfig,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
);

export default config;
