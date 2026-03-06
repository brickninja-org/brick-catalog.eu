import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import ts from 'typescript-eslint';

export default defineConfig(
  js.configs.recommended,
  ts.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // `{ x: x }` → `{ x }`
      'object-shorthand': 'warn',

      // `{ 'foo': 'bar' }` → `{ foo: 'bar' }`
      'quote-props': ['warn', 'consistent-as-needed'],

      // disallows async functions not using await
      'require-await': 'warn',
    },
  },
);
