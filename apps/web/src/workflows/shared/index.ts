import type { WorkflowEvent } from './types';
import type { RegeneratablePostDataType } from '@brickcatalog/ai';

import { generateHeroImage } from '@brickcatalog/ai';
import { revalidateTag } from 'next/cache';
import { FatalError, getWritable, RetryableError } from 'workflow';

import {
  getPostPublishRevalidationTags,
  getPostsWorkflowRevalidationTags,
} from '@/lib/cache-tags/posts';
import { slugify } from '@/lib/slugify';


export type { WorkflowEvent, WorkflowEventType } from './types';

export async function emitEvent(
  event: Omit<WorkflowEvent, 'timestamp'>,
): Promise<void> {
  'use step';

  const writer = getWritable<WorkflowEvent>().getWriter();

  try {
    await writer.write({
      ...event,
      timestamp: Date.now(),
    });
  } finally {
    writer.releaseLock();
  }
}

export async function revalidatePostsCache(): Promise<void> {
  'use step';

  for (const tag of getPostsWorkflowRevalidationTags()) {
    revalidateTag(tag, 'max');
  }

  console.log('[WORKFLOW] Posts cache invalidated');
}

export async function revalidatePostCache(slug: string): Promise<void> {
  'use step';

  for (const tag of getPostPublishRevalidationTags(slug)) {
    revalidateTag(tag, 'max');
  }

  console.log(`[WORKFLOW] Post cache invalidated for slug: ${slug}`);
}

export async function generatePostHero(params: {
  postId: string,
  title: string,
  excerpt: string,
  dataType: RegeneratablePostDataType,
}): Promise<string> {
  'use step';

  const { postId, title, excerpt, dataType } = params;

  const { url } = await generateHeroImage({
    title,
    excerpt,
    dataType,
    slug: slugify(title),
  });

  const { db } = await import('@/lib/prisma');

  await db.post.update({
    where: { id: postId },
    data: { heroImage: url },
  });

  return url;
}

generatePostHero.maxRetries = 0;

export function handleAIError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('429')) {
    throw new RetryableError('AI rate limited', { retryAfter: '1m' });
  }

  if (message.includes('401') || message.includes('403')) {
    throw new FatalError('AI authentication failed');
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error('Unknown workflow error');
}
