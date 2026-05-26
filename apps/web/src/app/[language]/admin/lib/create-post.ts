import type { CreatePostInput } from './post.schemas';

import { PostStatus } from '@brickcatalog/database';
import { revalidateTag } from 'next/cache';

import { getPostPublishRevalidationTags } from '@/lib/cache-tags/posts';
import { db } from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

import { upsertPostEmbedding } from './post-embedding';
import { createPostSchema } from './post.schemas';

export async function createPost(input: CreatePostInput) {
  const parsed = createPostSchema.parse(input);

  const slug = slugify(parsed.title);
  const status = parsed.status;
  const publishedAt = parsed.status === PostStatus.Published ? new Date() : null;

  const data = {
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
  };

  const post =
    parsed.month && parsed.dataType
      ? await db.post.upsert({
          where: {
            month_dataType: {
              month: parsed.month,
              dataType: parsed.dataType,
            },
          },
          create: data,
          update: data,
        })
      : await db.post.create({
          data,
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
      '[ADMIN] Failed to generate post embedding:',
      error instanceof Error ? error.message : String(error),
    );
  }

  for (const tag of getPostPublishRevalidationTags(post.slug)) {
    revalidateTag(tag, 'max');
  }

  return post;
}
