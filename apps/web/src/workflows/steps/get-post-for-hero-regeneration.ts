import 'server-only';

import { isRegeneratablePostDataType } from '@brickcatalog/ai';

export async function getPostForHeroRegeneration(postId: string) {
  const { db } = await import('@/lib/prisma');

  const post = await db.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      id: true,
      title: true,
      excerpt: true,
      slug: true,
      dataType: true,
    },
  });

  if (!post) {
    throw new Error(`Post not found: ${postId}`);
  }

  if (!post.dataType || !isRegeneratablePostDataType(post.dataType)) {
    throw new Error(
      `Unsupported dataType for hero regeneration: ${post.dataType ?? 'null'}`,
    );
  }

  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt ?? '',
    slug: post.slug,
    dataType: post.dataType,
  };
}
