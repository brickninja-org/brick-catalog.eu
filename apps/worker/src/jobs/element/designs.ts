import type { ProcessEntitiesData } from '../helper/process-entities';
import type { JobDefinition } from '../job-definition';
import type { Prisma } from '@brickcatalog/database';

import { isEmptyObject } from '@brickninja-org/helper/is';

import { db } from '../../db';
import { loadEntities } from '../helper/entity';
import { fetchApi } from '../helper/fetch-api';
import { Changes, createSubJobs, processEntities } from '../helper/process-entities';
import { toId } from '../helper/toId';

export const DesignJob: JobDefinition = {
  async run(payload: ProcessEntitiesData<number> | Record<string, never>) {
    const CURRENT_VERSION = 2;

    if (isEmptyObject(payload)) {
      return createSubJobs(
        'elements.designs',
        () => fetchApi('/v2/elements/designs'),
        db.design.findMany,
        CURRENT_VERSION,
      );
    }

    const knownElementIds = (await db.element.findMany({ select: { id: true }})).map(toId);

    return processEntities(
      payload,
      'Design',
      (ids) => loadEntities('/v2/elements/designs', ids),
      (designId, revisionId) => ({ designId_revisionId: { designId, revisionId }}),
      (design, _, change) => {
        const connectOrSet = change === Changes.New ? 'connect' : 'set';

        return {
          id: design.id,
          name: design.name,

          pieceType: design.piece_type,
          weight: design.weight,

          elements: { [connectOrSet]: design.element_ids.filter((id) => knownElementIds.includes(Number(id))).map((id) => ({ id })) },
        } satisfies Partial<Prisma.DesignUncheckedCreateInput | Prisma.DesignUncheckedUpdateInput>;
      },
      db.design.findMany,
      (tx, data) => tx.design.create(data),
      (tx, data) => tx.design.update(data),
      CURRENT_VERSION,
    );
  },
};
