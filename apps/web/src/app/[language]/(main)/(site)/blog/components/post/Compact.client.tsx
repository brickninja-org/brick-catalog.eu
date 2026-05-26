'use client';

import type { Post } from '@brickcatalog/database';

import { Chip, Link } from '@heroui/react';

import { FormatDate } from '@/components/format';

import { getCategoryConfig, getReadingTime } from './helpers';

interface CompactProps {
  post: Post,
}

export function Compact({ post }: CompactProps) {
  const publishedDate = post.publishedAt ?? post.createdAt;
  const category = getCategoryConfig(post);
  const readingTime = getReadingTime(post);

  return (
    <Link
      className="group flex items-center gap-4 p-4 transition-colors no-underline hover:bg-default"
      href={`/blog/${post.slug}`}
    >
      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="line-camp-1 font-medium text-sm transition-colors group-hover:text-accent">
          {post.title}
        </span>
        <span className="text-muted text-xs">
          <FormatDate date={publishedDate}/> · {readingTime} min read
        </span>
      </div>

      {/* Category Badge */}
      <Chip
        className="h-5 shrink-0 px-1 font-semibold text-[10px]"
        color={category.color}
        size="sm"
        variant="primary"
      >
        {category.label.split(' ')[0]}
      </Chip>
    </Link>
  );
}
