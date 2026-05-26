'use client';

import type { TranslationSubset } from '@/i18n/types';
import type { FC } from 'react';

import { Breadcrumbs } from '@heroui/react';

export interface ElementBreadcrumbs {
  category: string,
  translations: TranslationSubset<
    | 'navigation.elements'
  >,
}

export const ElementBreadcrumbs: FC<ElementBreadcrumbs> = ({ category, translations }) => {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Item href="/element">{translations['navigation.elements']}</Breadcrumbs.Item>
      <Breadcrumbs.Item>{category}</Breadcrumbs.Item>
    </Breadcrumbs>
  );
};