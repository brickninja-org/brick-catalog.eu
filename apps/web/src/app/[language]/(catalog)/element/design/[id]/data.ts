import type { Design } from '@brickcatalog/database';

import { cache } from '@/lib/cache';
import { db } from '@/lib/prisma';

export const getRevision = cache(
  async (id: number, revisionId?: string) => {
    const revision = revisionId
      ? await db.revision.findUnique({ where: { id: revisionId }})
      : await db.revision.findFirst({ where: { currentDesign: { id }}});

    return {
      revision,
      data: revision ? JSON.parse(revision.data) as Design : undefined,
    };
  },
  ['revision-design'],
  { revalidate: 60 },
);
