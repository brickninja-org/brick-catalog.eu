'use client';

import type { Post } from '@brickcatalog/database';

import { Card, Typography } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';

import { FormatDate } from '@/components/format';

import { Cover } from './Cover';
import { getExcerpt, getReadingTime } from './helpers';

interface HeroProps {
  post: Post,
}

/**
 * Featured blog post — horizontal layout wrapped in HeroUI Card.
 * Cover image on the left, text on the right.
 */
export function Hero({ post }: HeroProps) {
  const publishedDate = post.publishedAt ?? post.createdAt;
  const readingTime = getReadingTime(post);
  const excerpt = getExcerpt(post);

  return (
    <Link className="block no-underline" href={`/blog/${post.slug}`}>
      <Card className="gap-0 p-0 overflow-hidden transition-shadow hover:shadow-lg">
        <Card.Content className="grid grid-cols-1 md:grid-cols-5">
          {post.heroImage ? (
            <div className="relative aspect-2/1 overflow-hidden md:col-span-2 md:aspect-4/3">
              <Image
                fill
                priority
                alt={post.title}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
                src={post.heroImage}
              />
              <div className="absolute inset-0 bg-linear-to-br from-accent/40 to-accent/20" />
            </div>
          ) : (
            <Cover
              category={post.dataType ?? 'default'}
              className="aspect-2/1 md:col-span-2 md:aspect-4/3"
            />
          )}
          <div className="flex flex-col justify-center gap-4 p-6 md:col-span-3">
            <div className="flex items-center gap-2 text-muted text-sm">
              <FormatDate date={publishedDate}/>
              <span className="size-1 rounded-full bg-default" />
              <span>{readingTime} min read</span>
            </div>
            <Typography type="h2">{post.title}</Typography>
            {!!excerpt && (
              <Typography type="body">{excerpt}</Typography>
            )}
          </div>
        </Card.Content>
      </Card>
    </Link>
  );
}
