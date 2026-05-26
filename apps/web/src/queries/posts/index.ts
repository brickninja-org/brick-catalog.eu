import type { Post } from '@brickcatalog/database';

import { cacheLife, cacheTag } from 'next/cache';

import { db } from '@/lib/prisma';

export type SearchPost = Post & {
  similarity?: number,
};

export async function searchPosts(query: string): Promise<SearchPost[]> {
  const keywordResults = await db.post.findMany({
    where: {
      publishedAt: {
        not: null,
      },
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          excerpt: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 20,
  });

  if (keywordResults.length > 0) {
    return keywordResults;
  }

  const { generatePostEmbedding } = await import('@brickcatalog/ai');

  const embedding = await generatePostEmbedding({
    title: query,
    content: query,
  });

  const vector = `[${embedding.join(',')}]`;

  return db.$queryRaw<SearchPost[]>`
    SELECT
      *,
      1 - ("embedding" <=> ${vector}::vector) AS "similarity"
    FROM "posts"
    WHERE
      "publishedAt" IS NOT NULL
      AND "embedding" IS NOT NULL
      AND 1 - ("embedding" <=> ${vector}::vector) > 0.3
    ORDER BY "similarity" DESC
    LIMIT 20
  `;
}

export async function getAllPosts() {
  'use cache';

  cacheLife('max');
  cacheTag('post:list');

  return db.post.findMany({
    where: { NOT: { publishedAt: null }},
    orderBy: { publishedAt: 'desc' },
  });
}

export async function getPostBySlug(slug: string) {
  'use cache';

  cacheLife('max');
  cacheTag(`post:slug:${slug}`);

  return db.post.findFirst({
    where: {
      slug,
      NOT: { publishedAt: null },
    },
  });
}

export async function getPostCountsByCategory() {
  'use cache';

  cacheLife('max');
  cacheTag('post:list');

  const rows = await db.post.groupBy({
    by: ['dataType'],
    where: {
      publishedAt: {
        not: null,
      },
    },
    _count: {
      _all: true,
    },
  });

  return rows.map((row) => ({
    category: row.dataType,
    count: row._count._all,
  }));
}

export async function getPreviousPost(publishedAt: Date) {
  'use cache';

  cacheLife('max');
  cacheTag('post:list');

  return db.post.findFirst({
    where: {
      publishedAt: {
        not: null,
        lt: publishedAt,
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });
}

export async function getNextPost(publishedAt: Date) {
  'use cache';

  cacheLife('max');
  cacheTag('post:list');

  return db.post.findFirst({
    where: {
      publishedAt: {
        not: null,
        gt: publishedAt,
      },
    },
    orderBy: {
      publishedAt: 'asc',
    },
  });
}
