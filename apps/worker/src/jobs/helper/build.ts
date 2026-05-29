import type { Build } from '@brickcatalog/database';

import { db } from '../../db';

import { fetchApi } from './fetch-api';

export async function getCurrentBuild(): Promise<Build> {
  const apiBuild = await getBuildFromApi();

  // check if build is known
  const build = await db.build.findUnique({ where: { id: apiBuild }});

  if(build) {
    return build;
  }

  console.log(`Creating new build ${apiBuild}`);

  return await db.build.create({ data: { id: apiBuild }});
}

async function getBuildFromApi() {
  const { id } = await fetchApi('/v2/build') as { id: string | number };

  return String(id);
}
