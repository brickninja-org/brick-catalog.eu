import { revalidateTag } from 'next/cache';

import { getPostPublishRevalidationTags } from '@/lib/cache-tags/posts';
import { db } from '@/lib/prisma';

export async function deletePost(id: string) {
  const existing = await db.post.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!existing) {
    throw new Error('Post not found');
  }

  await db.post.delete({
    where: {
      id: existing.id,
    },
  });

  for (const tag of getPostPublishRevalidationTags(existing.slug)) {
    revalidateTag(tag, 'max');
  }
}
