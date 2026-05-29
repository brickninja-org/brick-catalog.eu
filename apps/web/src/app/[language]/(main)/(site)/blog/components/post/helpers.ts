import type { Post } from '@brickcatalog/database';
import type { ChipProps } from '@heroui/react';

import { differenceInDays } from '@/lib/date';

type ChipColor = ChipProps['color'];

// Unified category configuration supporting both text styling and HeroUI Chip.
export const categoryConfig: Record<
  string,
  {
    label: string,
    className: string,
    color: ChipColor,
  }
> = {
  elements: {
    label: 'Elements',
    className: 'text-warning',
    color: 'warning',
  },
};

// Default fallback for unknown categories
export const defaultCategory = {
  label: 'Insights',
  className: 'text-muted',
  color: 'default' as ChipColor,
};

// Get category configuration for a post
export const getCategoryConfig = (post: Post) => {
  // Use top-level dataType field (flattened schema)
  return categoryConfig[post.dataType ?? 'default'] || defaultCategory;
};

// Get reading time from post metadata with default fallback
export const getReadingTime = (post: Post): number => {
  const metadata = post.metadata as Record<string, unknown>;

  return metadata?.readingTime as number || 5;
};

// Get excerpt from post (top-level field in flattend schema)
export const getExcerpt = (post: Post): string | undefined => {
  return post.excerpt ?? undefined;
};

// Check if post is new (published within threshold days)
export const isNewPost = (post: Post, daysThreshold = 14): boolean => {
  const publishedDate = post.publishedAt ?? post.createdAt;

  return differenceInDays(new Date, publishedDate) <= daysThreshold;
};
