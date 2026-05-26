import type { Highlight } from '../components/KeyHighlights';
import type { Metadata } from 'next';
import type { BlogPosting, WithContext } from 'schema-dts';

import { Button, Card, Separator, Typography } from '@heroui/react';
import { Undo2 } from 'lucide-react';
import { cacheLife, cacheTag } from 'next/cache';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';

import { StructuredData } from '@/components/structured-data';
import { SITE_TITLE, SITE_URL } from '@/config';
import { getMDXComponents } from '@/mdx-components';
import { getAllPosts, getNextPost, getPostBySlug, getPreviousPost } from '@/queries/posts';

import { BlogHero } from '../components/BlogHero';
import { KeyHighlights } from '../components/KeyHighlights';
import { PostNavigation } from '../components/PostNavigation';
import { ProgressBar } from '../components/ProgressBar.client';
import { TableOfContents } from '../components/TableOfContents.client';

interface BlogPostPageProps {
  params: Promise<{ slug: string, language: string }>,
}

export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const canonical = `/blog/${post.slug}`;
  const publishedDate = post.publishedAt ?? post.createdAt;

  return {
    title: post.title,
    description: post.excerpt ?? '',
    keywords: post.tags,
    authors: [{ name: SITE_TITLE, url: SITE_URL }],
    creator: SITE_TITLE,
    publisher: SITE_TITLE,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? '',
      type: 'article',
      publishedTime: publishedDate.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [SITE_TITLE],
      tags: post.tags,
      url: `${SITE_URL}${canonical}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt ?? '',
    },
    alternates: {
      canonical,
    },
  };
}

async function Article({ slug, content }: { slug: string, content: string }) {
  'use cache';

  cacheLife('max');
  cacheTag(`post:slug:${slug}`);

  return (
    <article className="prose max-w-none">
      <MDXRemote
        components={getMDXComponents()}
        source={content}
        options={{
          mdxOptions: {
            format: 'md',
            remarkPlugins: [
              remarkGfm,
              [
                remarkToc,
                {
                  heading: 'Table of Contents|Content|TOC',
                  maxDepth: 3,
                  tight: true,
                },
              ],
            ],
            rehypePlugins: [
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                {
                  behavior: 'append',
                  properties: {
                    className: ['permalink']
                  },
                },
              ],
            ],
          },
        }}
      />
    </article>
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publishedDate = post.publishedAt ?? post.createdAt;
  const [previousPost, nextPost] = await Promise.all([
    getPreviousPost(publishedDate),
    getNextPost(publishedDate),
  ]);

  const structuredData: WithContext<BlogPosting> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.excerpt ?? undefined,
    'datePublished': publishedDate.toISOString(),
    'dateModified': post.updatedAt.toISOString(),
    'url': `${SITE_URL}/blog/${post.slug}`,
    'mainEntityOfPage': `${SITE_URL}/blog/${post.slug}`,
    'wordCount': post.content.split(/\s+/).length,
    'inLanguage': 'en',
    'author': {
      '@type': 'Organization',
      'name': SITE_TITLE,
      'url': SITE_URL,
    },
    'publisher': {
      '@type': 'Organization',
      'name': SITE_TITLE,
      'url': SITE_URL,
    },
    'keywords': post.tags?.join(', '),
    'articleSection': post.dataType ?? 'Insights',
    'isPartOf': {
      '@type': 'Blog',
      'name': `${SITE_TITLE} Blog`,
      'url': `${SITE_URL}/blog`,
    },
  };

  return (
    <>
      <StructuredData data={structuredData}/>
      <ProgressBar/>

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <BlogHero
          heroImage={post.heroImage}
          // initialViewCount={initialViewCount}
          postId={post.id}
          publishedAt={publishedDate}
          // readingTimeText={readingTimeText}
          slug={post.slug}
          tags={post.tags}
          title={post.title}
        />

        {/* Table of Contents */}
        <TableOfContents/>

        {/* Excerpt / Executive Summary */}
        {!!post.excerpt && (
          <section>
            <Typography className="mb-6 font-bold text-foreground/60 uppercase tracking-[0.3em]" type="body-xs">
              Executive Summary
            </Typography>
            <Card className="border-accent border-l-4 bg-transparent rounded-none shadow-none">
              <Card.Content className="py-0 pl-4">
                <Typography className="text-foreground/90 leading-relaxed text-lg lg:text-xl" type="body">{post.excerpt}</Typography>
              </Card.Content>
            </Card>
          </section>
        )}

        {/* Key Highlights */}
        <KeyHighlights highlights={post.highlights as unknown as Highlight[] | undefined}/>

        <Article content={post.content} slug={post.slug}/>

        {/* Post Navigation */}
        <PostNavigation next={nextPost} previous={previousPost} />

        <Separator className="my-2"/>

        <div className="flex justify-center pb-8">
          <Link className="no-underline" href="/blog">
            <Button variant="ghost">
              <Undo2 className="size-4" />
              Back to blog
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
