import 'server-only';

import { createPrismaClient } from '@brickcatalog/database/setup';

const prismaClientSingleton = () => {
  const datasourceUrl = new URL(process.env.DATABASE_URL!);

  datasourceUrl.searchParams.set('application_name', 'web');

  if (!datasourceUrl.searchParams.has('connection_limit')) {
    datasourceUrl.searchParams.set('connection_limit', '16');
  }

  return createPrismaClient(datasourceUrl.toString(), {
    log: ['error', 'warn', 'info'],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  db: PrismaClientSingleton | undefined,
};

export const db = globalForPrisma.db ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.db = db;
}
