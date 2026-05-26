'use client';

import type { Post } from '@brickcatalog/database';

import { Chip, Card as HeroUICard, Typography } from '@heroui/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { FormatDate } from '@/components/format';

import { Cover } from './Cover';
import { getExcerpt, getReadingTime, isNewPost } from './helpers';

interface PostCardProps {
  post: Post,
}

/**
 * Blog post card - vertical layout wrapped in HeroUI Card.
 * Cover image in top, text below.
 */
export function Card({ post }: PostCardProps) {
  const publishedDate = post.publishedAt ?? post.createdAt;
  const readingTime = getReadingTime(post);
  const excerpt = getExcerpt(post);

  // check if post is new only on client to avoid prerender issues with new Date()
  const [isNew, setIsNew] = useState(false);
  useEffect(() => {
    setIsNew(isNewPost(post));
  }, [post]);

  return (
    <Link className="block h-full no-underline" href={`/blog/${post.slug}`}>
      <HeroUICard className="h-full gap-0 p-0 overflow-hidden transition-shadow hover:shadow-lg">
        <HeroUICard.Content>
          {post.heroImage
            ? (
                <>TODO: hero image</>
              ) : (
                <Cover
                  category={post.dataType ?? 'default'}
                  className="aspect-2/1"
                />
              )}

          <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center gap-2 text-muted text-xs">
              <FormatDate date={publishedDate}/>
              <span className="size-1 rounded-full bg-default"/>
              <span>{readingTime} min read</span>
              {!!isNew && (
                <Chip color="warning" size="sm" variant="primary">
                  NEW
                </Chip>
              )}
            </div>
            <Typography type="h3">{post.title}</Typography>
            {!!excerpt && (
              <Typography type="body-sm">{excerpt}</Typography>
            )}
          </div>
        </HeroUICard.Content>
      </HeroUICard>
    </Link>
  );
}