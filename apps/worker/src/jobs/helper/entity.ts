import type { EndpointType, KnownBulkExpandedEndpoint, KnownLocalizedEndpoint } from '@brickninjaapi/types/endpoints';

import { groupById } from '@brickninja-org/helper/group-by';

import { fetchApi } from './fetch-api';
import { SchemaVersion } from './schema';

export async function createEntityMap<T extends { id: string | number }>(entities: T[] | Promise<T[]>): Promise<Map<T['id'], T>> {
  return new Map(
    (await entities)
      .map((entity) => [entity.id, entity])
  );
}

type ModelOfBulkEndpoint<E extends KnownBulkExpandedEndpoint> = EndpointType<`${E}?ids=$`, SchemaVersion> extends Array<infer T> ? T : never;

export async function loadEntities<Endpoint extends Exclude<KnownBulkExpandedEndpoint, KnownLocalizedEndpoint>>(
  endpoint: Endpoint,
  ids: EndpointType<Endpoint>,
): Promise<Map<EndpointType<Endpoint>[number], ModelOfBulkEndpoint<Endpoint>>> {
  const start = new Date();

  // @ts-expect-error TS is not smart enough here (or I'm not smart enough for those deeply nested generics)
  const entities = await fetchApi(`${endpoint}?ids=${ids.join(',')}`) as (ModelOfBulkEndpoint<Endpoint> & { id: number })[];

  console.log(`Fetched ${ids.length} entities in ${(new Date().valueOf() - start.valueOf()) / 1000}s`);

  return groupById(entities);
}
