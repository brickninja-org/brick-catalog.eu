import type { Language } from '@brickcatalog/database';
import type { ReactNode } from 'react';

import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { routing } from '@/i18n/routing';

import { AdminAppLayout } from './AdminAppLayout.client';

const ADMIN_LANGUAGES = routing.locales as readonly Language[];

function resolveAdminLanguage(value: unknown): Language {
  return typeof value === 'string' && ADMIN_LANGUAGES.includes(value as Language)
    ? value as Language
    : routing.defaultLocale;
}

export default function DashboardLayout({
  params,
  children,
}: LayoutProps<'/[language]'>) {
  return (
    <Suspense fallback={<DashboardLayoutFallback>{children}</DashboardLayoutFallback>}>
      <DashboardLayoutContent params={params}>
        {children}
      </DashboardLayoutContent>
    </Suspense>
  );
}

async function DashboardLayoutContent({
  params,
  children,
}: {
  params: LayoutProps<'/[language]'>['params'],
  children: ReactNode,
}) {
  const { language: languageParam } = await params;
  const language = resolveAdminLanguage(languageParam);
  const t = await getTranslations({ locale: language });

  return (
    <AdminAppLayout
      translations={{
        title: t('admin.layout.title'),
        navigationLabel: t('admin.layout.navigation'),
        dashboard: t('admin.layout.dashboard'),
        content: t('admin.layout.content'),
        blog: t('admin.content.blog.title'),
        views: t('admin.layout.views'),
        menuToggle: t('admin.layout.menuToggle'),
      }}
    >
      {children}
    </AdminAppLayout>
  );
}

function DashboardLayoutFallback({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl p-6">
      {children}
    </div>
  );
}
