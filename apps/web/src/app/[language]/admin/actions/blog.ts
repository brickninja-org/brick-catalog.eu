'use server';

import type { CreatePostInput, UpdatePostInput } from '../lib/post.schemas';
import type { RegeneratablePostDataType } from '@brickcatalog/ai';
import type { Prisma } from '@brickcatalog/database';

import { start } from 'workflow/api';

import { db } from '@/lib/prisma';
import { regeneratePostWorkflow } from '@/workflows/regenerate-post';

import { createPost } from '../lib/create-post';
import { deletePost } from '../lib/delete-post';
import { updatePost } from '../lib/update-post';

const postWithMetadataSelect = {
  id: true,

  title: true,
  slug: true,
  excerpt: true,
  heroImage: true,
  content: true,

  tags: true,
  highlights: true,

  status: true,

  month: true,
  dataType: true,

  createdAt: true,
  updatedAt: true,
  publishedAt: true,

  metadata: true,
  embedding: {
    select: {
      provider: true,
      model: true,
      dimensions: true,
      version: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.PostSelect;

export type PostWithMetadata = Prisma.PostGetPayload<{
  select: typeof postWithMetadataSelect,
}>;

export async function getAllBlogPosts(): Promise<PostWithMetadata[]> {
  const posts = await db.post.findMany({
    select: postWithMetadataSelect,
  });

  return posts;
}

export async function getBlogPostById(id: string): Promise<PostWithMetadata | null> {
  const post = await db.post.findFirst({
    where: { id },
    select: postWithMetadataSelect,
  });

  return post ?? null;
}

export async function regeneratePost(params: {
  postId: string,
  month: string,
  dataType: RegeneratablePostDataType,
}): Promise<{ success: boolean, error?: string, runId?: string }> {
  try {
    const run = await start(regeneratePostWorkflow, [params]);

    return {
      success: true,
      runId: run.runId,
    };
  } catch (error) {
    console.error('Error triggering regeneration workflow:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function createBlogPost(
  input: CreatePostInput,
): Promise<{ success: boolean, error?: string, postId?: string }> {
  try {
    const created = await createPost(input);

    return {
      success: true,
      postId: created.id,
    };
  } catch (error) {
    console.error(
      '[ADMIN] Failed to create blog post',
      error instanceof Error ? error.message : String(error),
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create blog post',
    };
  }
}

export async function updateBlogPost(
  input: UpdatePostInput,
): Promise<{ success: boolean, error?: string, postId?: string }> {
  try {
    const updated = await updatePost(input);

    return {
      success: true,
      postId: updated.id,
    };
  } catch (error) {
    console.error(
      '[ADMIN] Failed to update blog post',
      error instanceof Error ? error.message : String(error),
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update blog post',
    };
  }
}

export async function deleteBlogPostById(
  id: string,
): Promise<{ success: boolean, error?: string }> {
  try {
    await deletePost(id);

    return { success: true };
  } catch (error) {
    console.error(
      '[ADMIN] Failed to delete blog post',
      error instanceof Error ? error.message : String(error),
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to delete blog post',
    };
  }
}
