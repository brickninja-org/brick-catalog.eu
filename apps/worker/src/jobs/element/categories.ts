import type { ProcessEntitiesData } from '../helper/process-entities';
import type { JobDefinition } from '../job-definition';

import { Prisma } from '@brickcatalog/database';
import { isEmptyObject } from '@brickninja-org/helper/is';

import { db } from '../../db';
import { loadEntities } from '../helper/entity';
import { fetchApi } from '../helper/fetch-api';
import { Changes, createSubJobs, processEntities } from '../helper/process-entities';
import { toId } from '../helper/toId';

export const CategoryJob: JobDefinition = {
  async run(payload: ProcessEntitiesData<number> | Record<string, never>) {
    const CURRENT_VERSION = 2;

    if (isEmptyObject(payload)) {
      return createSubJobs(
        'elements.categories',
        () => fetchApi('/v2/elements/categories'),
        db.category.findMany,
        CURRENT_VERSION,
      );
    }

    const knownSubcategoryIds = (await db.subcategory.findMany({ select: { id: true }})).map(toId);

    return processEntities(
      payload,
      'ElementCategory',
      (ids) => loadEntities('/v2/elements/categories', ids),
      (categoryId, revisionId) => ({ categoryId_revisionId: { categoryId, revisionId }}),
      (category, version, changes) => {
        const connectOrSet = changes === Changes.New ? 'connect' : 'set';

        return {
          id: category.id,
          name: category.name,

          subcategoryIds: category.subcategory_ids,
          subcategories: { [connectOrSet]: category.subcategory_ids?.filter((id) => knownSubcategoryIds.includes(id)).map((id) => ({ id })) ?? [] },
        } satisfies Partial<Prisma.CategoryUncheckedCreateInput | Prisma.CategoryUncheckedUpdateInput>;
      },
      db.category.findMany,
      (tx, data) => tx.category.create(data),
      (tx, data) => tx.category.update(data),
      CURRENT_VERSION,
    );
  },
};
