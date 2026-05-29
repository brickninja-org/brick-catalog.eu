import baseReactConfig from '@brickninja-org/standard/eslint/react.mjs';
import { defineConfig } from 'eslint/config';


const config = defineConfig([
  ...baseReactConfig,

  // temporarily change some react-hook rules to warn
  {
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
]);

export default config;
