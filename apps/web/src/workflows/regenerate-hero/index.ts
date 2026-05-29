import type { RegeneratablePostDataType } from '@brickcatalog/ai';
import { fetch } from 'workflow';

import {
  emitEvent,
  generatePostHero,
  handleAIError,
  revalidatePostsCache,
} from '../shared';

export interface RegenerateHeroPayload {
  postId: string,
}

export interface RegenerateHeroResult {
  message: string,
  postId: string,
  heroImage?: string,
}

async function loadPost(postId: string) {
  'use step';

  const { getPostForHeroRegeneration } = await import(
    '../steps/get-post-for-hero-regeneration'
  );

  return getPostForHeroRegeneration(postId);
}

export async function regenerateHeroWorkflow(
  payload: RegenerateHeroPayload,
): Promise<RegenerateHeroResult> {
  'use workflow';

  globalThis.fetch = fetch;

  const { postId } = payload;

  await emitEvent({
    type: 'step:start',
    step: 'loadPost',
    data: { postId },
  });

  const post = await loadPost(postId);

  await emitEvent({
    type: 'step:complete',
    step: 'loadPost',
    data: { postId: post.id },
  });

  await emitEvent({
    type: 'step:start',
    step: 'generateHeroImage',
    data: { postId: post.id },
  });

  let heroImage: string | undefined;

  try {
    heroImage = await generatePostHero({
      postId: post.id,
      title: post.title,
      excerpt: post.excerpt,
      dataType: post.dataType,
    });

    await emitEvent({
      type: 'step:complete',
      step: 'generateHeroImage',
      data: {
        postId: post.id,
        heroGenerated: Boolean(heroImage),
      },
    });
  } catch (error) {
    await emitEvent({
      type: 'step:error',
      step: 'generateHeroImage',
      data: { postId: post.id },
    });

    handleAIError(error);
  }

  await revalidatePostsCache();

  return {
    message: `[REGENERATE-HERO] Successfully regenerated hero image for ${post.slug}`,
    postId: post.id,
    heroImage,
  };
}
