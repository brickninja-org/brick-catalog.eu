import {
  generatePostEmbedding,
  POST_EMBEDDING_DIMENSIONS,
  POST_EMBEDDING_MODEL,
  POST_EMBEDDING_PROVIDER,
  POST_EMBEDDING_VERSION,
} from '@brickcatalog/ai';

import { db } from '@/lib/prisma';

interface UpsertPostEmbeddingInput {
  postId: string,
  title: string,
  excerpt?: string | null,
  content: string,
}

export async function upsertPostEmbedding({
  postId,
  title,
  excerpt,
  content,
}: UpsertPostEmbeddingInput) {
  const embedding = await generatePostEmbedding({
    title,
    excerpt,
    content,
  });

  const vector = `[${embedding.join(',')}]`;

  await db.$executeRaw`
    INSERT INTO "PostEmbedding" (
      "postId",
      "provider",
      "model",
      "dimensions",
      "version",
      "embedding"
    )
    VALUES (
      ${postId}::uuid,
      ${POST_EMBEDDING_PROVIDER},
      ${POST_EMBEDDING_MODEL},
      ${POST_EMBEDDING_DIMENSIONS},
      ${POST_EMBEDDING_VERSION},
      ${vector}::vector
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
}
