import type { ReactNode } from 'react';

import { Button } from '@heroui/react/button';
import { Card } from '@heroui/react/card';
import { FileText, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Suspense } from 'react';
import remarkGfm from 'remark-gfm';

import { getAllBlogPosts } from '@/app/[language]/admin/actions/blog';
import { ListSkeleton } from '@/components/shared/skeleton';
import { getMDXComponents } from '@/mdx-components';

import { BlogPostsTable } from './components/BlogPostsTable.client';

export default function AdminBlogContentPage({ params }: PageProps<'/[language]/admin/content/blog'>) {
  return (
    <Suspense fallback={<BlogContentFallback />}>
      <AdminBlogContentPageContent params={params} />
    </Suspense>
  );
}

async function AdminBlogContentPageContent({ params }: { params: PageProps<'/[language]/admin/content/blog'>['params'] }) {
  const { language } = await params;
  const t = await getTranslations({ locale: language });
  const posts = await getAllBlogPosts();

  const previews: Record<string, ReactNode> = {};
  for (const post of posts) {
    const content = (post as unknown as { content: string }).content;
    if (content) {
      previews[post.id] = (
        <article className="prose max-w-none p-6">
          <MDXRemote
            components={getMDXComponents()}
            source={content}
            options={{
              mdxOptions: { format: 'md', remarkPlugins: [remarkGfm ] },
            }}
          />
        </article>
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-bold text-3xl tracking-tight">
            <FileText className="size-8"/>
            Blog Management
          </h1>
          <p className="text-muted">
            View and regenerate blog posts generated from catalogus data.
          </p>
        </div>
        <Link href="/admin/content/blog/create">
          <Button>
            <PlusIcon className="mr-2 size-4"/>
            Create Post
          </Button>
        </Link>
      </div>

      {/* Posts Table */}
      <Suspense fallback={<ListSkeleton count={5} itemHeight="h-16"/>}>
        <BlogPostsTable initialPosts={posts} previews={previews}/>
      </Suspense>

      {/* Instructions */}
      <Card>
        <Card.Header>
          <Card.Title>Instructions</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4 text-muted text-sm">
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">🤖</span>
            <span>
              <strong>AI Generation:</strong> Posts are generated using Google
              Gemini 2.5 Flash with market data analysis.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">🔄</span>
            <span>
              <strong>Regeneration:</strong> Regenerating a post will fetch
              fresh data and create new content, replacing the existing version.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">💾</span>
            <span>
              <strong>Auto-save:</strong> Regenerated posts are automatically
              saved to the database and published.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">🚀</span>
            <span>
              <strong>Cache Revalidation:</strong> The web app cache is
              automatically revalidated after regeneration.
            </span>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}

function BlogContentFallback() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="bg-default-200 h-9 w-64 animate-pulse rounded-lg" />
          <div className="bg-default-200 h-5 w-96 animate-pulse rounded-md" />
        </div>
      </header>
      <Card>
        <Card.Content className="space-y-4">
          <div className="bg-default-100 h-12 animate-pulse rounded-lg" />
          <div className="bg-default-100 h-72 animate-pulse rounded-lg" />
        </Card.Content>
      </Card>
    </div>
  );
}
