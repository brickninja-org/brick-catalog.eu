import type { LocalizedObject } from './types';
import type { Prisma, Revision } from '@brickcatalog/database';

import { createHash } from 'node:crypto';

import { db, PrismaTransaction } from '../../db';

import { schema } from './schema';

export function createRevision(data: Prisma.RevisionUncheckedCreateInput, tx?: PrismaTransaction) {
  return (tx ?? db).revision.create({ data, select: { id: true }});
}

export async function createRevisions(data: LocalizedObject, revision: Omit<Prisma.RevisionUncheckedCreateInput, 'data' | 'hash' | 'language' | 'schema'>): Promise<LocalizedObject<Revision>> {
  const data_de = JSON.stringify(data.de);
  const data_en = JSON.stringify(data.en);
  const data_nl = JSON.stringify(data.nl);

  const [de, en, nl] = await Promise.all([
    db.revision.create({ data: { schema, data: data_de, hash: createRevisionHash(data_de), language: 'de', ...revision }}),
    db.revision.create({ data: { schema, data: data_en, hash: createRevisionHash(data_en), language: 'en', ...revision }}),
    db.revision.create({ data: { schema, data: data_nl, hash: createRevisionHash(data_nl), language: 'nl', ...revision }}),
  ]);

  return {
    de, en, nl,
  };
}

export function createRevisionHash(data: string) {
  return createHash('sha256').update(data).digest('base64');
}