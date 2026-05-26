'use client';

import type { SearchResults } from './Search.types';

type Page = { href: string, title: string, icon: null };

const pages: Page[] = [
  // static pages
  { href: '/status', title: 'Status', icon: null },
  { href: '/status/jobs', title: 'Job Status', icon: null },
  { href: '/status/api', title: 'API Status', icon: null },

  // element
  { href: '/element', title: 'Elements', icon: null },
  { href: '/element/color', title: 'Colors', icon: null },
];

export function usePageResults(searchValue: string): SearchResults<'pages'> {
  const results = pages
    .filter(({ title }) => title.toLowerCase().includes(searchValue.toLowerCase()))
    .filter((_, index) => index < 5)
    .map(({ title, href, icon }) => ({ title, href, icon }));

  return { id: 'pages', results, loading: false };
}
