'use client';

import type { IconProp } from '@brickninja-org/ui/icons';
import type { HTMLProps, ReactElement, ReactNode } from 'react';

export interface SearchResult {
  href: string,
  title: ReactNode,
  subtitle?: ReactNode,
  icon: IconProp | null,
  render?: (link: ReactElement<HTMLProps<HTMLElement>>) => ReactNode,
}

export interface SearchResults<Id extends string> {
  id: Id,
  results: SearchResult[],
  loading: boolean,
}
