import { Card } from '@heroui/react/card';
import { FileText, PenSquare } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function AdminContentPage({ params }: PageProps<'/[language]/admin/content'>) {
  const { language } = await params;
  const t = await getTranslations({ locale: language });

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{t('admin.content.title')}</h1>
        <p className="text-muted">{t('admin.content.description')}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Link className="no-underline" href="/admin/content/blog">
          <Card className="h-full transition-colors hover:border-accent">
            <Card.Header className="items-start gap-3">
              <FileText className="size-5 text-accent"/>
              <div>
                <Card.Title>{t('admin.content.blog.title')}</Card.Title>
                <Card.Description>{t('admin.content.blog.description')}</Card.Description>
              </div>
            </Card.Header>
          </Card>
        </Link>

        <Card className="h-full opacity-80">
          <Card.Header className="items-start gap-3">
            <PenSquare className="size-5"/>
            <div>
              <Card.Title>{t('admin.content.comingSoon.title')}</Card.Title>
              <Card.Description>{t('admin.content.comingSoon.description')}</Card.Description>
            </div>
          </Card.Header>
        </Card>
      </div>
    </div>
  );
}
