import nextConfig from '@next/eslint-plugin-next';
import { defineConfig, globalIgnores } from 'eslint/config';

import reactConfig from './react.mjs';

const config = defineConfig(
  // ignore Next.js generated files
  globalIgnores([
    '.next/',
    'next-env.d.ts',
  ]),

  // extends next/core-web-vitals
  nextConfig.configs['core-web-vitals'],

  // extend ./react.mjs
  ...reactConfig,

  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx,mts,cts}'],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-img-element': 'off',
      'no-console': 'off',
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
      'react/jsx-no-leaked-render': [
        'error',
        {
          validStrategies: ['coerce', 'ternary'],
        },
      ],
      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: true,
          ignoreCase: true,
          locale: 'auto',
          multiline: 'last',
          noSortAlphabetically: false,
          reservedFirst: true,
          shorthandFirst: true,
          shorthandLast: false,
        },
      ],
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/self-closing-comp': [
        'error',
        {
          component: true,
          html: true,
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
);

export default config;
