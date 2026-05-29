import nodeConfig from '@brickninja-org/standard/eslint/node.mjs';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(
  nodeConfig,
  globalIgnores(['dist/']),
);
