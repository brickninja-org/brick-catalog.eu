import { defineConfig } from 'eslint/config';
import globals from 'globals';

import baseConfig from './base.mjs';

const config = defineConfig(
  baseConfig,
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx,mts,cts}'],
    languageOptions: {
      globals: globals.node,
    },
  },
);

export default config;
