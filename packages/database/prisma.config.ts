import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { styleText } from 'node:util';

import { defineConfig, env } from 'prisma/config';

// load .env
if (existsSync('.env')) {
  console.log(styleText('dim', '[@brick-catalog.eu/database] load .env'));
  loadEnvFile('.env');
}

export default defineConfig({
  schema: './prisma/',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
