import { PostStatus } from '@brickcatalog/database';

export const POST_STATUS = {
  draft: PostStatus.Draft,
  published: PostStatus.Published,
} as const;

export const POST_SEARCH_LIMIT = 20;
export const POST_SIMILARITY_THRESHOLD = 0.3;
