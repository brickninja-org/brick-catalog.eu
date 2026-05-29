import type { PostStatus } from '@brickcatalog/database';

import { fetch } from 'workflow';

interface PostStatusChangedPayload {
  postId: string,
  previousStatus: PostStatus,
  nextStatus: PostStatus,
}

export async function postStatusChangedWorkflow({
  postId,
  previousStatus,
  nextStatus,
}: PostStatusChangedPayload) {
  'use workflow';

  const baseUrl = process.env.BC_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://127.0.0.1:3000';

  const response = await fetch(`${baseUrl}/api/admin/post-status-changed`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      postId,
      previousStatus,
      nextStatus,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to process post status side effects');
  }

  return {
    postId,
    previousStatus,
    nextStatus,
  };
}
