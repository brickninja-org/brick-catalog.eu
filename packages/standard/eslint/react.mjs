import { defineConfig } from 'eslint/config';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

import baseConfig from './base.mjs';

const config = defineConfig(
  // extend ./base
  ...baseConfig,
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: {
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      // Custom overrides
      'react-hooks/exhaustive-deps': 'off',
      'react/jsx-boolean-value': [
        'error',
        'never',
        {
          always: ['personal'],
        },
      ],
      'react/jsx-curly-brace-presence': [
        'error',
        {
          children: 'never',
          props: 'never',
        },
      ],
    },
  },
);

export default config;
