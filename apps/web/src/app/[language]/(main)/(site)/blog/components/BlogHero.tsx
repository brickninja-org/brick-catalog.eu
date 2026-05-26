import { Chip } from '@heroui/react';
import Image from 'next/image';
// import { Suspense } from 'react';

// import { ViewCounter } from '@/app/(main)/(site)/blog/components/view-counter';

interface BlogHeroProps {
  title: string,
  slug: string,
  publishedAt: Date,
  readingTimeText: string,
  tags: string[] | null,
  postId: string,
  initialViewCount: number,
  heroImage: string | null,
}

export function BlogHero({
  title,
  publishedAt,
  // readingTimeText,
  tags,
  // postId,
  // initialViewCount,
  heroImage,
}: BlogHeroProps) {
  const categoryLabel = tags && tags.length > 0 ? tags[0] : 'Market Analysis';

  return (
    <div className="relative mb-12 w-full overflow-hidden bg-linear-to-br from-accent to-accent/70 py-16 md:py-24">
      {!!heroImage && <>
        <Image
          fill
          priority
          alt={title}
          className="object-cover"
          sizes="100vw"
          src={heroImage}
        />
        <div className="absolute inset-0 bg-linear-to-br from-accent/85 to-accent/70" />
      </>}
      <div className="container relative mx-auto flex flex-col justify-end px-6 md:px-12">
        <Chip
          className="mb-3 bg-white/15 font-bold text-white/80 text-xs uppercase tracking-[0.3em]"
          size="sm"
          variant="primary"
        >
          {categoryLabel}
        </Chip>
        <h1 className="mb-3 max-w-4xl font-black text-2xl text-white leading-tight tracking-tight sm:text-4xl md:text-6xl md:leading-[0.95]">
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 font-medium text-white/70 text-xs uppercase tracking-wider sm:gap-4 sm:text-sm">
          <span>
            {publishedAt.toLocaleDateString('en-SG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {/*
          <span className="h-1 w-1 rounded-full bg-white/50" />
          <span>{readingTimeText}</span>
          <span className="h-1 w-1 rounded-full bg-white/50" />
          <Suspense fallback={null}>
            =<ViewCounter
              className="text-inherit"
              initialCount={initialViewCount}
              postId={postId}
            />
          </Suspense>
          */}
        </div>
      </div>
    </div>
  );
}
