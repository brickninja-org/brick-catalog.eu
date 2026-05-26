import { PostStatus } from '@brickcatalog/database';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/lib/prisma';

const postStatusChangedSchema = z.object({
  postId: z.string().uuid(),
  previousStatus: z.enum(PostStatus),
  nextStatus: z.enum(PostStatus),
});

export async function POST(request: Request) {
  const parsed = postStatusChangedSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.message },
      { status: 400 },
    );
  }

  const { postId, previousStatus, nextStatus } = parsed.data;

  const post = await db.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      slug: true,
      status: true,
    },
  });

  if (!post) {
    return NextResponse.json(
      { error: 'Blog post not found' },
      { status: 404 },
    );
  }

  revalidateTag('posts', 'max');
  revalidateTag(`post:${post.id}`, 'max');
  revalidatePath('/admin/content/blog');
  revalidatePath(`/blog/${post.slug}`);

  console.info('Blog post status side effects processed', {
    postId,
    previousStatus,
    nextStatus,
  });

  return NextResponse.json({ success: true });
}
