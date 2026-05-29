import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src'],
      exclude: [],
    },
    exclude: [...configDefaults.exclude, 'tests', '**/*.integration.test.ts'],
    setupFiles: './setup.tests.ts',
  },
});
