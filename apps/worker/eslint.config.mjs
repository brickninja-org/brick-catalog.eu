import nodeConfig from '@brickninja-org/standard/eslint/node.mjs';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  nodeConfig,
  {
    rules: {
      // workers loggen bewust
      'no-console': 'off',

      // workers stoppen soms bewust
      'no-process-exit': 'off',
    },
  },
);
