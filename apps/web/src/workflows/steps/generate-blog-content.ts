import 'server-only';

import type { RegeneratablePostDataType } from '@brickcatalog/ai';

import {
  generateBlogContent as generateBlogContentWithPrisma,
  regenerateBlogContent as regenerateBlogContentWithPrisma,
} from '@brickcatalog/ai';

import { db } from '@/lib/prisma';

export interface GenerateBlogContentInput {
  data: string,
  month: string,
  dataType: RegeneratablePostDataType,
  postId?: string,
}

export function generateBlogContent({
  data,
  month,
  dataType,
  postId,
}: GenerateBlogContentInput) {
  console.log(`[REGENERATE] Generating ${dataType} blog content for ${month}`);

  if (postId) {
    return regenerateBlogContentWithPrisma(db, {
      data,
      month,
      dataType,
      postId,
    });
  }

  return generateBlogContentWithPrisma(db, { data, month, dataType });
}
