import type { Highlight } from './schemas';
import type { PostStatus, Prisma, PrismaClient } from '@brickcatalog/database';
import { slugify } from '@brickninja-org/utils';
import type { LanguageModelUsage } from 'ai';
import { randomUUID } from 'node:crypto';

import {
  generatePostEmbedding,
  POST_EMBEDDING_DIMENSIONS,
  POST_EMBEDDING_MODEL,
  POST_EMBEDDING_PROVIDER,
  POST_EMBEDDING_VERSION,
} from './embedding';
import type { PostDataType } from './config';

export interface PostParams {
  postId?: string,
  title: string,
  content: string,
  excerpt: string,
  heroImage: string | null,
  tags: string[],
  highlights: Highlight[],
  month: string,
  dataType: PostDataType,
  status?: PostStatus,
  generatedByAi?: boolean,
  responseMetadata: {
    responseId: string,
    modelId: string,
    timestamp: Date,
    usage?: LanguageModelUsage,
  },
}

function toJsonValue<T>(value: T): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export interface SavePostResult {
  id: string,
  title: string,
  slug: string,
  excerpt: string | null,
  dataType: string | null,
}

function normaliseGeneratedText(value: string): string {
  const unescaped = value
    .trim()
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t');

  if (!/\s10\s/.test(unescaped)) {
    return unescaped;
  }

  return unescaped
    .replace(/\s+10\s+10(?=\s*(?:#{1,6}\s|\||[A-Z]))/g, '\n\n')
    .replace(/\s+10(?=\s*(?:#{1,6}\s|\|))/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const savePost = async (
  db: Pick<PrismaClient, 'post' | '$executeRaw'>,
  data: PostParams,
): Promise<SavePostResult> => {
  const title = normaliseGeneratedText(data.title);
  const excerpt = normaliseGeneratedText(data.excerpt);
  const content = normaliseGeneratedText(data.content);
  const slug = slugify(title);
  const metadata = toJsonValue({
    ...data.responseMetadata,
    generatedByAi: data.generatedByAi ?? true,
  });
  const highlights = toJsonValue(data.highlights);

  const post = data.postId
    ? await db.post.update({
      where: { id: data.postId },
      data: {
        title,
        slug,
        content,
        excerpt,
        heroImage: data.heroImage,
        tags: data.tags,
        highlights,
        metadata,
        month: data.month,
        dataType: data.dataType,
        status: data.status ?? 'Draft',
        publishedAt: data.status === 'Published' ? new Date() : null,
      },
    })
    : await db.post.upsert({
      where: {
        month_dataType: {
          month: data.month,
          dataType: data.dataType,
        },
      },
      create: {
        title,
        slug,
        content,
        excerpt,
        heroImage: data.heroImage,

        tags: data.tags,
        highlights,

        status: data.status ?? 'Draft',

        metadata,
        month: data.month,
        dataType: data.dataType,

        publishedAt: data.status === 'Published' ? new Date() : null,
      },
      update: {
        title,
        slug,
        content,
        excerpt,
        heroImage: data.heroImage,

        tags: data.tags,
        highlights,

        metadata,
        status: data.status ?? 'Draft',
        publishedAt: data.status === 'Published' ? new Date() : null,
      }
    });

  console.log(
    `[POST_SAVE] Post saved successfully - id: ${post.id}, slug: ${post.slug}, ${data.month}, category: ${data.dataType}`,
  );

  try {
    const embedding = await generatePostEmbedding({
      title,
      excerpt,
      content,
    });

    const vector = `[${embedding.join(',')}]`;
    const embeddingId = randomUUID();

    await db.$executeRaw`
      INSERT INTO "PostEmbedding" (
        "id",
        "postId",
        "provider",
        "model",
        "dimensions",
        "version",
        "embedding",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${embeddingId}::uuid,
        ${post.id}::uuid,
        ${POST_EMBEDDING_PROVIDER},
        ${POST_EMBEDDING_MODEL},
        ${POST_EMBEDDING_DIMENSIONS},
        ${POST_EMBEDDING_VERSION},
        ${vector}::vector,
        NOW(),
        NOW()
      )
      ON CONFLICT ("postId")
      DO UPDATE SET
        "provider" = EXCLUDED."provider",
        "model" = EXCLUDED."model",
        "dimensions" = EXCLUDED."dimensions",
        "version" = EXCLUDED."version",
        "embedding" = EXCLUDED."embedding",
        "updatedAt" = NOW()
    `;

    console.log(`[POST_SAVE] Embedding upserted for post ${post.id}`);
  } catch (error) {
    console.error(
      '[POST_SAVE] Failed to upsert post embedding:',
      error instanceof Error ? error.message : String(error),
    );
  }

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    dataType: post.dataType,
  };
};
