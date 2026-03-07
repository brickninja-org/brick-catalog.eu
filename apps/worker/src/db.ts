import type { PrismaClient } from '@brickcatalog/database';

import { createPrismaClient } from '@brickcatalog/database/setup';

const datasourceURL = new URL(process.env.DATABASE_URL!);

datasourceURL.searchParams.set('application_name', 'worker');

export const db = createPrismaClient(datasourceURL.toString(), {
  log: ['info', { level: 'query', emit: 'event' }, 'error', 'warn'],
});

export type PrismaTransaction = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>;

export const dbDebug = { log: false };

db.$on('query', (event) => {
  if (!dbDebug.log) return;

  console.log('query', event.query, `(${event.duration} ms)`);
});
