import baseConfig from '@brickninja/standard/eslint/base.mjs';
import { defineConfig, globalIgnores } from 'eslint/config';

const config = defineConfig(
  globalIgnores([
    '**/build/**',
    '**/public/**',
  ]),
  baseConfig,
);

export default config;
