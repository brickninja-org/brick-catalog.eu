export const getPostPublishRevalidationTags = (slug: string): string[] => {
  return ['post:list', 'posts:recent', `post:slug:${slug}`];
};

export const getPostsWorkflowRevalidationTags = (): string[] => {
  return ['post:list', 'posts:recent'];
};
