import { PostStatus } from '@brickcatalog/database';
import { z } from 'zod';

export const postHighlightsSchema = z.array(
  z.object({
    value: z.string(),
    label: z.string(),
    detail: z.string(),
  }),
);

export const createPostSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  excerpt: z.string().trim().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  highlights: postHighlightsSchema.optional(),
  month: z.string().trim().optional(),
  dataType: z.string().trim().optional(),
  status: z.enum([PostStatus.Draft, PostStatus.Published]).default(PostStatus.Draft),
});

export const updatePostSchema = createPostSchema.extend({
  id: z.string().uuid(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
