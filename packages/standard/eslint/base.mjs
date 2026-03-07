import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import ts from 'typescript-eslint';

const config = defineConfig([
  js.configs.recommended,
  ts.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@stylistic': stylistic,
      'import': importPlugin,
    },
    rules: {
      // indent with 2 spaces
      '@stylistic/indent': ['warn', 2, { SwitchCase: 1, flatTernaryExpressions: true, offsetTernaryExpressions: true }],
      // `"foo"` → `'foo'`
      '@stylistic/quotes': ['warn', 'single'],
      // `a => a` → `(a) => a`
      '@stylistic/arrow-parens': 'warn',
      // `(a)=>a` → `(a) => a`
      '@stylistic/arrow-spacing': 'warn',
      // `foo( bar )` → `foo(bar)`
      '@stylistic/space-in-parens': 'warn',
      // disallows multipe spaces
      '@stylistic/no-multi-spaces': 'warn',
      // disallow multiple empty lines
      '@stylistic/no-multiple-empty-lines': 'warn',
      // only 1 property per line for objects (enforced only for > 3 properties or multiline values)
      '@stylistic/object-curly-newline': ['warn', { multiline: true, consistent: true }],
      // `{foo: bar}` → `{ foo: bar }`
      '@stylistic/object-curly-spacing': ['warn', 'always', { objectsInObjects: false }],
      // `{ foo:bar }` → `{ foo: bar }`
      '@stylistic/key-spacing': 'warn',
      // `{ x: x }` → `{ x }`
      'object-shorthand': 'warn',
      // `{ 'foo': 'bar' }` → `{ foo: 'bar' }`
      'quote-props': ['warn', 'consistent-as-needed'],
      // allows (but does not require) dangling commas in multiline
      '@stylistic/comma-dangle': ['warn', 'only-multiline'],
      // `foo(bar,baz)` → `foo(bar, baz)`
      '@stylistic/comma-spacing': 'warn',
      // `1+1` → `1 + 1`
      '@stylistic/space-infix-ops': 'warn',
      // require semicolon
      '@stylistic/semi': 'warn',
      // no unnecessary semicolon
      '@stylistic/no-extra-semi': ['warn'],
      // disallows async functions not using await
      'require-await': 'warn',

      // require dependencies to be in package.json
      // 'import/no-extraneous-dependencies': 'error',
      // disable import/no-unresolved, ts is already handling this
      'import/no-unresolved': 'off',
      // require node protocol in imports (`import { x } from 'node:util'`)
      'import/enforce-node-protocol-usage': ['warn', 'always'],
      // `const foo:Bar` → `const foo: Bar`
      '@stylistic/type-annotation-spacing': 'warn',
      // `class foo_bar` → `class FooBar`
      '@typescript-eslint/naming-convention': [
        'warn',
        { selector: 'default', format: null },
        { selector: 'typeLike', format: ['PascalCase'] }
      ],
      // require comma as delimiter in typescript interfaces and type aliases
      '@stylistic/member-delimiter-style': ['warn', {
        multiline: { delimiter: 'comma', requireLast: true },
        singleline: { delimiter: 'comma', requireLast: false },
      }],

      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/newline-after-import': ['error', { count: 1 }],
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          'alphabetize': {
            caseInsensitive: true,
            order: 'asc',
          },
          'groups': [
            'type',
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'unknown',
          ],
          'newlines-between': 'always',
          'pathGroups': [
            {
              group: 'type',
              pattern: 'server-only',
              position: 'before',
            },
            {
              group: 'unknown',
              pattern: '**/*.+(css|sass|scss)',
              patternOptions: { dot: true, nocomment: true },
              position: 'after',
            },
            {
              group: 'unknown',
              pattern: '{.,..}/**/*.+(css|sass|scss)',
              patternOptions: { dot: true, nocomment: true },
              position: 'after',
            },
            {
              group: 'internal',
              pattern: '~env',
              position: 'before',
            },
            {
              group: 'internal',
              pattern: '@/**',
              position: 'after',
            },
          ],
          'pathGroupsExcludedImportTypes': ['type'],
          'warnOnUnassignedImports': true,
        },
      ],

      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', next: '*', prev: 'directive' },
        { blankLine: 'any', next: 'directive', prev: 'directive' },
        { blankLine: 'always', next: '*', prev: ['const', 'let', 'var'] },
        { blankLine: 'any', next: ['const', 'let', 'var'], prev: ['const', 'let', 'var'] },
        { blankLine: 'always', next: 'return', prev: '*' },
      ],
    },
  },
  {
    files: ['.*.js', '.*.cjs', '.*.mjs'],
    ...ts.configs.disableTypeChecked,
  },
  {
    ignores: [
      '**/.temp/**',
      '**/.next/**',
      '**/.swc/**',
      '**/.turbo/**',
      '**/.cache/**',
      '**/.build/**',
      '**/.vercel/**',
      '**/.DS_Store',
      '**/dist/**',
      '**/node_modules/**',
      '**/pnpm-lock.yaml',
      '**/next-env.d.ts',
      '!.vscode/**',
      '!scripts/**',
    ],
  },
]);

export default config;
