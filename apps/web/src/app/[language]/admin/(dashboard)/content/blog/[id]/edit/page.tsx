import { Skeleton } from '@heroui/react/skeleton';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { getBlogPostById } from '@/app/[language]/admin/actions/blog';

import { BackButton } from '../../components/BackButton';
import { BlogPostForm } from '../../components/BlogPostForm.client';
import { PostStatusInlineUpdate } from '../../components/PostStatusInlineUpdate.client';

export default function AdminBlogEditPage({
  params,
}: PageProps<'/[language]/admin/content/blog/[id]/edit'>) {
  return (
    <Suspense fallback={<EditBlogFallback />}>
      <AdminBlogEditPageContent params={params} />
    </Suspense>
  );
}

async function AdminBlogEditPageContent({
  params,
}: {
  params: PageProps<'/[language]/admin/content/blog/[id]/edit'>['params'],
}) {
  const { language, id } = await params;

  const t = await getTranslations({ locale: language });
  const post = await getBlogPostById(id);

  if (!post) {
    notFound();
  }

  const blogIndexHref = '/admin/content/blog';

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <div className="flex flex-col gap-5">
        <BackButton href={blogIndexHref}>
          {t('admin.dashboard.back')}
        </BackButton>

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-muted text-sm font-medium">
              {t('admin.content.blog.editTitle')}
            </p>

            <h1 className="truncate text-3xl font-bold tracking-tight">
              {post.title}
            </h1>

            <p className="text-muted">
              {t('admin.content.blog.editDescription', { id })}
            </p>
          </div>

          <div className="w-full max-w-xs lg:w-64">
            <PostStatusInlineUpdate
              draftLabel={t('admin.content.blog.form.statusDraft')}
              label={t('admin.content.blog.form.status')}
              postId={post.id}
              publishedLabel={t('admin.content.blog.form.statusPublished')}
              value={post.status}
            />
          </div>
        </header>
      </div>

      <BlogPostForm
        key={`${post.id}:${post.updatedAt.toISOString()}`}
        cancelHref={blogIndexHref}
        cancelLabel={t('admin.content.blog.form.cancel')}
        contentLabel={t('admin.content.blog.form.content')}
        excerptLabel={t('admin.content.blog.form.excerpt')}
        initialPost={post}
        mode="edit"
        saveLabel={t('admin.content.blog.form.save')}
        titleLabel={t('admin.content.blog.form.titleLabel')}
      />
    </div>
  );
}

function EditBlogFallback() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <div className="flex flex-col gap-5">
        <Skeleton className="h-8 w-28 rounded-lg" />

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-9 w-80 rounded-lg" />
            <Skeleton className="h-5 w-96 rounded-md" />
          </div>

          <Skeleton className="h-14 w-64 rounded-xl" />
        </header>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton className="h-168 rounded-3xl" />
        <Skeleton className="h-136 rounded-3xl" />
      </div>
    </div>
  );
}
