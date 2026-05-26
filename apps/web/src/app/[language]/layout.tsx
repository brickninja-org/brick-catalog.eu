import 'server-only';

import type { Metadata, Viewport } from 'next';

import { Language } from '@brickcatalog/database';
import { DataGridGlobalProvider } from '@brickninja-org/ui';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { cn } from 'tailwind-variants';

import { FormatProvider } from '@/components/format';
import { SynchronizedTimeProvider } from '@/components/time';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '@/config';
import { getNestedMessages } from '@/i18n/messages';
import { routing } from '@/i18n/routing';
import { getBaseUrl } from '@/lib/url';

import { Providers } from './providers';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const title = SITE_TITLE;
const description = SITE_DESCRIPTION;
const url = new URL(SITE_URL);

export function generateStaticParams() {
  return routing.locales.map((language) => ({ language }));
}

export default async function RootLayout({
  params,
  children,
}: LayoutProps<'/[language]'>) {
  const { language: languageParam } = await params;
  const language = isLanguage(languageParam) ? languageParam : Language.en;
  setRequestLocale(language);
  const messages = await getNestedMessages(language);

  return (
    <html
      suppressHydrationWarning
      className={cn('scroll-smooth antialiased', inter.variable)}
      data-base-url={getBaseUrl().toString()}
      data-scroll-behavior="smooth"
      data-theme="light"
      lang={language}
    >
      <body className="font-sans bg-background text-foreground">
        <NextIntlClientProvider locale={language} messages={messages}>
          <Providers>
            <SynchronizedTimeProvider>
              <FormatProvider>
                <DataGridGlobalProvider>
                  {children}
                </DataGridGlobalProvider>
              </FormatProvider>
            </SynchronizedTimeProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && value in Language;
}

export const metadata: Metadata = {
  metadataBase: url,
  title: {
    template: `%s - ${title}`,
    default: title,
  },
  description,
  authors: [{ name: SITE_TITLE, url: SITE_URL }],
  creator: SITE_TITLE,
  publisher: SITE_TITLE,
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { color: '#f4f4f5', media: '(prefers-color-scheme: light)' },
    { color: '#111111', media: '(prefers-color-scheme: dark)' },
  ],
  width: 'device-width',
};
