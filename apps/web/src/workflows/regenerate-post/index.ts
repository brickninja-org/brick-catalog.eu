import type { RegeneratablePostDataType } from '@brickcatalog/ai';

import { fetch } from 'workflow';

import {
  emitEvent,
  generatePostHero,
  handleAIError,
  revalidatePostCache,
  revalidatePostsCache,
} from '../shared';

export interface RegeneratePostPayload {
  postId: string,
  month: string,
  dataType: RegeneratablePostDataType,
}

export interface RegeneratePostResult {
  message: string,
  postId?: string,
  title?: string,
  slug?: string,
}

async function fetchPostData(
  month: string,
  dataType: RegeneratablePostDataType,
): Promise<string> {
  'use step';

  const { fetchDataForPostRegeneration } = await import(
    '../steps/fetch-data-for-post-regeneration'
  );

  return fetchDataForPostRegeneration(month, dataType);
}

async function generateBlogPost(
  data: string,
  postId: string,
  month: string,
  dataType: RegeneratablePostDataType,
) {
  'use step';

  const { generateBlogContent } = await import(
    '../steps/generate-blog-content'
  );

  return generateBlogContent({
    data,
    postId,
    month,
    dataType,
  });
}

export async function regeneratePostWorkflow(
  payload: RegeneratePostPayload,
): Promise<RegeneratePostResult> {
  'use workflow';

  // Enable WDK's durable fetch for AI SDK
  globalThis.fetch = fetch;

  const { postId, month, dataType } = payload;

  await emitEvent({
    type: 'step:start',
    step: 'fetchData',
    data: { postId, month, dataType },
  });

  const data = await fetchPostData(month, dataType);

  await emitEvent({
    type: 'step:complete',
    step: 'fetchData',
  });

  await emitEvent({
    type: 'step:start',
    step: 'generatePost',
    data: { postId, month, dataType },
  });

  let post: Awaited<ReturnType<typeof generateBlogPost>>;

  try {
    post = await generateBlogPost(data, postId, month, dataType);
  } catch (error) {
    handleAIError(error);
  }

  await emitEvent({
    type: 'post:generated',
    step: 'generatePost',
    data: { postId: post.postId },
  });

  await emitEvent({
    type: 'step:start',
    step: 'regeneratePostHero',
    data: { postId: post.postId },
  });

  if (process.env.DISABLE_HERO_REGEN === 'true') {
    await emitEvent({
      type: 'step:complete',
      step: 'regeneratePostHero',
      data: {
        postId: post.postId,
        heroGenerated: false,
        skipped: true,
      },
    });
  } else {
    try {
      await generatePostHero({
        postId: post.postId,
        title: post.title,
        excerpt: post.excerpt,
        dataType: post.dataType,
      });

      await emitEvent({
        type: 'step:complete',
        step: 'regeneratePostHero',
        data: {
          postId: post.postId,
          heroGenerated: true,
        },
      });
    } catch (error) {
      console.error(
        '[REGENERATE] Hero image generation failed after retries:',
        error,
      );

      await emitEvent({
        type: 'step:complete',
        step: 'regeneratePostHero',
        data: {
          postId: post.postId,
          heroGenerated: false,
        },
      });
    }
  }

  await revalidatePostsCache();
  await revalidatePostCache(post.slug);

  return {
    message: `[REGENERATE] Successfully regenerated ${dataType} post for ${month}`,
    postId: post.postId,
    title: post.title,
    slug: post.slug,
  };
}
