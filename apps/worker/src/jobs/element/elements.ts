import type { ProcessEntitiesData } from '../helper/process-entities';
import type { JobDefinition } from '../job-definition';
import type { Prisma } from '@brickcatalog/database';

import { isEmptyObject } from '@brickninja-org/helper/is';

import { db } from '../../db';
import { loadEntities } from '../helper/entity';
import { fetchApi } from '../helper/fetch-api';
import { createSubJobs, processEntities } from '../helper/process-entities';

export const ElementJob: JobDefinition = {
  run(payload: ProcessEntitiesData<number> | Record<string, never>) {
    const CURRENT_VERSION = 0;

    if (isEmptyObject(payload)) {
      return createSubJobs(
        'elements',
        () => fetchApi('/v2/elements'),
        db.element.findMany,
        CURRENT_VERSION,
      );
    }

    return processEntities(
      payload,
      'Element',
      (ids) => loadEntities('/v2/elements', ids),
      (elementId, revisionId) => ({ elementId_revisionId: { elementId: Number(elementId), revisionId }}),
      (element) => {
        return {
          id: element.id,
          name: element.name,
        } satisfies Partial<Prisma.ElementUncheckedCreateInput | Prisma.ElementUncheckedUpdateInput>;
      },
      db.element.findMany,
      (tx, data) => tx.element.create(data),
      (tx, data) => tx.element.update(data),
      CURRENT_VERSION,
    );
  },
};
