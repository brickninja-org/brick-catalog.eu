import type { Language } from '@brickcatalog/database';

import { Language as LanguageEnum } from '@brickcatalog/database';

import Layout from '@/components/layout/Layout';
import { routing } from '@/i18n/routing';

const CATALOG_LANGUAGES = routing.locales as readonly Language[];

function resolveCatalogLanguage(value: unknown): Language {
  return typeof value === 'string' && CATALOG_LANGUAGES.includes(value as Language)
    ? value as Language
    : LanguageEnum.en;
}

export default async function CatalogLayout({
  params,
  children,
}: LayoutProps<'/[language]'>) {
  const { language: languageParam } = await params;
  const language = resolveCatalogLanguage(languageParam);

  return (
    <Layout language={language}>
      {children}
    </Layout>
  );
}
