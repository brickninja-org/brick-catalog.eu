'use server';

import { PostStatus } from '@brickcatalog/database';
import { start } from 'workflow/api';
import { z } from 'zod';

import { db } from '@/lib/prisma';
import { postStatusChangedWorkflow } from '@/workflows/post-status-changed';

const updateBlogPostStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(PostStatus),
});

export async function updateBlogPostStatus(input: unknown) {
  const parsed = updateBlogPostStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.message,
    };
  }

  const { id, status } = parsed.data;

  const currentPost = await db.post.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      publishedAt: true,
    },
  });

  if (!currentPost) {
    return {
      success: false,
      error: 'Blog post not found',
    };
  }

  if (currentPost.status === status) {
    return {
      success: true,
      status: currentPost.status,
    };
  }

  const updatedPost = await db.post.update({
    where: { id },
    data: {
      status,
      publishedAt:
        status === PostStatus.Published
          ? (currentPost.publishedAt ?? new Date())
          : null,
    },
    select: {
      id: true,
      status: true,
    },
  });

  await start(postStatusChangedWorkflow, [
    {
      postId: updatedPost.id,
      previousStatus: currentPost.status,
      nextStatus: updatedPost.status,
    },
  ]);

  return {
    success: true,
    status: updatedPost.status,
  };
}
