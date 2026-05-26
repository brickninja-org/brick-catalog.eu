import type { Language } from '@brickcatalog/database';
import type { ReactNode } from 'react';

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { cn } from 'tailwind-variants';

import { Header } from '@/components/layout/header/Header';
import { LanguageSwitcher } from '@/components/layout/header/LanguageSwitcher';
import { Search } from '@/components/search/Search';

import { BrickCatalogLogo } from './Logo';

interface LayoutProps {
  language: Language,
  children: ReactNode,
}

export default async function Layout({ children, language }: LayoutProps) {
  const shellClassName = 'mx-auto w-full max-w-248 px-4';
  const t = await getTranslations({ locale: language });

  const searchTranslations = {
    'locale.formatting-settings.label': t('locale.formatting-settings.label'),
    'search.placeholder': t('search.placeholder'),
    'search.empty-state': t('search.empty-state'),
    'search.loading': t('search.loading'),
    'search.results.elements.label': t('search.results.elements.label'),
    'search.results.elements.categories': t('search.results.elements.categories'),
    'search.results.elements.colors': t('search.results.elements.colors'),
    'search.results.elements.designs': t('search.results.elements.designs'),
    'search.results.pages': t('search.results.pages'),
    'search.results.elements.subcategories': t('search.results.elements.subcategories'),
  };

  return (
    <div className="grid min-h-screen w-full grid-rows-[48px_min-content_min-content_1fr_min-content]">
      <div className="row-start-1">
        <Header>
          <Link className="max-[360px]:w-6 max-[360px]:overflow-hidden" href="/">
            <BrickCatalogLogo/>
          </Link>
          <Search className="md:min-w-sm max-md:w-full" translations={searchTranslations}/>
          <div className="ml-auto flex items-center">
            <Suspense fallback={null}>
              <LanguageSwitcher/>
            </Suspense>
          </div>
        </Header>
      </div>

      {/*<hr className="sticky top-12 z-2 row-start-2 -mb-px block h-px border-0 bg-default-200"/>*/}

      <main className="row-start-4 flex w-full flex-1 flex-col">
        {children}
      </main>

      <footer className="row-start-5 mt-0 border-t border-default-200">
        <div className={cn(shellClassName, 'flex items-center gap-4 py-4 text-sm text-muted')}>
          <Link className="underline-offset-2 transition hover:text-foreground hover:underline" href="/about">About</Link>
          <span className="hidden sm:inline">Built for browsing parts, colors, and design data quickly.</span>
        </div>
      </footer>
    </div>
  );
}
