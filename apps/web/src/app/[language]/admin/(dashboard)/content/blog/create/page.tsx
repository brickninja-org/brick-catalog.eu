import { Card } from '@heroui/react/card';
import { getTranslations } from 'next-intl/server';

import { BlogPostForm } from '../components/BlogPostForm.client';

export default async function AdminBlogCreatePage({ params }: PageProps<'/[language]/admin/content/blog/create'>) {
  const { language } = await params;
  const t = await getTranslations({ locale: language });

  const blogIndexHref = '/admin/content/blog';

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{t('admin.content.blog.createTitle')}</h1>
        <p className="text-muted">{t('admin.content.blog.createDescription')}</p>
      </header>

      <Card>
        <Card.Header>
          <Card.Title>{t('admin.content.blog.form.title')}</Card.Title>
          <Card.Description>{t('admin.content.blog.form.description')}</Card.Description>
        </Card.Header>
        <Card.Content>
          <BlogPostForm
            cancelHref={blogIndexHref}
            cancelLabel={t('admin.content.blog.form.cancel')}
            contentLabel={t('admin.content.blog.form.content')}
            excerptLabel={t('admin.content.blog.form.excerpt')}
            mode="create"
            saveLabel={t('admin.content.blog.form.save')}
            slugLabel={t('admin.content.blog.form.slug')}
            statusDraftLabel={t('admin.content.blog.form.statusDraft')}
            statusLabel={t('admin.content.blog.form.status')}
            statusPublishedLabel={t('admin.content.blog.form.statusPublished')}
            titleLabel={t('admin.content.blog.form.titleLabel')}
            validationContentRequired={t('admin.content.blog.form.validation.contentRequired')}
            validationSlugUnique={t('admin.content.blog.form.validation.slugUnique')}
            validationTitleRequired={t('admin.content.blog.form.validation.titleRequired')}
          />
        </Card.Content>
      </Card>
    </div>
  );
}
