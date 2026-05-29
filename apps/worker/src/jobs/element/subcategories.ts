import type { ProcessEntitiesData } from '../helper/process-entities';
import type { JobDefinition } from '../job-definition';
import type { Prisma } from '@brickcatalog/database';

import { isEmptyObject } from '@brickninja-org/helper/is';

import { db } from '../../db';
import { loadEntities } from '../helper/entity';
import { fetchApi } from '../helper/fetch-api';
import { Changes, createSubJobs, processEntities } from '../helper/process-entities';
import { toId } from '../helper/toId';

export const SubcategoryJob: JobDefinition = {
  async run(payload: ProcessEntitiesData<number> | Record<string, never>) {
    const CURRENT_VERSION = 2;

    if (isEmptyObject(payload)) {
      return createSubJobs(
        'elements.subcategories',
        () => fetchApi('/v2/elements/subcategories'),
        db.subcategory.findMany,
        CURRENT_VERSION,
      );
    }

    const knownDesignIds = (await db.design.findMany({ select: { id: true }})).map(toId);

    return processEntities(
      payload,
      'ElementSubcategory',
      (ids) => loadEntities('/v2/elements/subcategories', ids),
      (subcategoryId, revisionId) => ({ subcategoryId_revisionId: { subcategoryId, revisionId }}),
      (subcategory, _, change) => {
        const connectOrSet = change === Changes.New ? 'connect' : 'set';

        return {
          id: subcategory.id,
          name: subcategory.name,

          // @ts-expect-error TODO: fix designs_ids to design_ids in @brickninaapi/types
          designs: { [connectOrSet]: subcategory.design_ids?.filter((id) => knownDesignIds.includes(id)).map((id) => ({ id })) ?? [] },
        } satisfies Partial<Prisma.SubcategoryUncheckedCreateInput | Prisma.SubcategoryUncheckedUpdateInput>;
      },
      db.subcategory.findMany,
      (tx, data) => tx.subcategory.create(data),
      (tx, data) => tx.subcategory.update(data),
      CURRENT_VERSION,
    );
  },
};
