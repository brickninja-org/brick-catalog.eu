import type { ProcessEntitiesData } from '../helper/process-entities';
import type { Prisma } from '@brickcatalog/database';

import { ColorFamily } from '@brickcatalog/database/enums';
import { isEmptyObject } from '@brickninja-org/helper/is';

import { db } from '../../db';
import { loadEntities } from '../helper/entity';
import { fetchApi } from '../helper/fetch-api';
import { Changes, createSubJobs, processEntities } from '../helper/process-entities';
import { toId } from '../helper/toId';
import { JobDefinition } from '../job-definition';

function mapColorFamily(colorId: number, family: string | undefined): Prisma.ColorUncheckedCreateInput['family'] {
  switch (family) {
    case ColorFamily.Black:
    case ColorFamily.Blue:
    case ColorFamily.Brown:
    case ColorFamily.Green:
    case ColorFamily.Grey:
    case ColorFamily.Lilac:
    case ColorFamily.Metallic:
    case ColorFamily.Multicombination:
    case ColorFamily.Orange:
    case ColorFamily.Purple:
    case ColorFamily.Red:
    case ColorFamily.White:
    case ColorFamily.Yellow:
      return family;
    default:
      throw new Error(`Unknown color family for color ${colorId}: ${String(family)}`);
  }
}

export const ColorJob: JobDefinition = {
  async run(payload: ProcessEntitiesData<number> | Record<string, never>) {
    const CURRENT_VERSION = 2;

    if (isEmptyObject(payload)) {
      return createSubJobs(
        'elements.colors',
        () => fetchApi('/v2/elements/colors'),
        db.color.findMany,
        CURRENT_VERSION,
      );
    }

    const knownElementIds = (await db.element.findMany({ select: { id: true }})).map(toId);

    return processEntities(
      payload,
      'Color',
      (ids) => loadEntities('/v2/elements/colors', ids),
      (colorId, revisionId) => ({ colorId_revisionId: { colorId, revisionId }}),
      (color, _, change) => {
        const connectOrSet = change === Changes.New ? 'connect' : 'set';

        return {
          id: color.id,
          name: color.name,
          family: mapColorFamily(color.id, color.color_family),

          pieceColor: color.piece_color,
          contrastColor: color.contrast_color,

          elements: { [connectOrSet]: color.element_ids.filter((id) => knownElementIds.includes(Number(id))).map((id) => ({ id })) },
        } satisfies Partial<Prisma.ColorUncheckedCreateInput | Prisma.ColorUncheckedUpdateInput>;
      },
      db.color.findMany,
      (tx, data) => tx.color.create(data),
      (tx, data) => tx.color.update(data),
      CURRENT_VERSION,
    );
  },
};
