import type { Prisma } from '@brickcatalog/database';

import { isTruthy } from '@brickninja-org/helper/is';

import { cache } from '@/lib/cache';
import { db } from '@/lib/prisma';

export function splitSearchTerms(query: string): string[] {
  const terms = Array.from(query.matchAll(/"(?:\\\\.|[^\\\\"])+"|\S+/g)).map((term) => {
    return unpackQuotes(term[0])
      .replaceAll('\\\\', '\\')
      .replaceAll('\\"', '"')
      .replaceAll('%', '\\%');
  });

  return terms;
}

function unpackQuotes(value: string): string {
  if(value.at(0) === '"' && value.at(-1) === '"') {
    return value.substring(1, value.length - 1);
  }

  return value;
}

function toNumber(value: string): number | undefined {
  const number = Number(value);

  if(number.toFixed() === value && number > 0) {
    return number;
  }

  return undefined;
}

type NameInput = {
  AND?: NameInput[],
  OR?: NameInput[],
  name?: Prisma.StringFilter | string,
};

function nameQuery(terms: string[]): NameInput {
  if (terms.length === 0) {
    return {};
  }

  return {
    AND: terms.map((term) => ({
      name: { contains: term, mode: 'insensitive' },
    })),
  };
}

export const searchDesigns = cache(async (terms: string[]) => {
  const nameQueries = nameQuery(terms);

  const numberTerms = terms.map(toNumber).filter(isTruthy);

  const [designs, designCategories, designGroups] = await Promise.all([
    db.design.findMany({
      where: terms.length > 0 ? { OR: [nameQueries, { id: { in: numberTerms }}] } : undefined,
      take: 5,
      include: { subcategory: true },
      // orderBy: { views: 'desc' },
    }),
    db.subcategory.findMany({
      where: terms.length > 0 ? { OR: [nameQueries] } : undefined,
      take: 5,
      include: { category: true },
    }),
    db.category.findMany({
      where: terms.length > 0 ? { OR: [nameQueries] } : undefined,
      take: 5,
    }),
  ]);

  return { designs, designCategories, designGroups };
}, ['search', 'search-designs'], { revalidate: 60 });


export const searchElements = cache(async (terms: string[]) => {
  // don't show anything for empty search
  if (terms.length === 0) return [];

  const numberTerms = terms.map(toNumber).filter(isTruthy);

  const exactWhere: Prisma.ElementWhereInput = {
    OR: [
      nameQuery(terms),
      { id: { in: numberTerms }},
    ],
  };

  const exactNameMatchers = terms.length > 0
    ? await db.element.findMany({
        where: exactWhere,
        take: 50,
      })
    : [];

  const termMatches = exactNameMatchers.length < 5
    ? await db.element.findMany({
        where: { AND: [{ id: { notIn: exactNameMatchers.map(({ id }) => id) }}] },
        take: 5 - exactNameMatchers.length,
      })
    : [];

  return [...exactNameMatchers, ...termMatches];
}, ['search', 'search-elements'], { revalidate: 60 });
