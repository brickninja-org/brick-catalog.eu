import type { UpdatePostInput } from './post.schemas';

import { PostStatus } from '@brickcatalog/database';
import { revalidateTag } from 'next/cache';

import { getPostPublishRevalidationTags } from '@/lib/cache-tags/posts';
import { db } from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

import { upsertPostEmbedding } from './post-embedding';
import { updatePostSchema } from './post.schemas';

export async function updatePost(input: UpdatePostInput) {
  const parsed = updatePostSchema.parse(input);

  const existing = await db.post.findUnique({
    where: {
      id: parsed.id,
    },
    select: {
      id: true,
      slug: true,
      status: true,
      publishedAt: true,
    },
  });

  if (!existing) {
    throw new Error('Post not found');
  }

  const slug = slugify(parsed.title);
  const status = parsed.status;

  const publishedAt =
    parsed.status === PostStatus.Published && existing.status !== status
      ? new Date()
      : existing.publishedAt;

  const post = await db.post.update({
    where: {
      id: parsed.id,
    },
    data: {
      title: parsed.title,
      slug,
      content: parsed.content,
      excerpt: parsed.excerpt,
      tags: parsed.tags,
      highlights: parsed.highlights,
      status,
      month: parsed.month,
      dataType: parsed.dataType,
      publishedAt,
    },
  });

  try {
    await upsertPostEmbedding({
      postId: post.id,
      title: parsed.title,
      excerpt: parsed.excerpt,
      content: parsed.content,
    });
  } catch (error) {
    console.error(
      '[ADMIN] Failed to update post embedding:',
      error instanceof Error ? error.message : String(error),
    );
  }

  for (const slugToInvalidate of new Set([existing.slug, post.slug])) {
    for (const tag of getPostPublishRevalidationTags(slugToInvalidate)) {
      revalidateTag(tag, 'max');
    }
  }

  return post;
}
