'use client';

import type { Design } from './Component';
import type { TranslationSubset } from '@/i18n/types';
import type { FC } from 'react';

import { Breadcrumbs } from '@heroui/react';

export interface ComponentBreadcrumbsProps {
  design: Design,
  translations: TranslationSubset<
    | 'category.unknown'
    | 'subcategory.unknown'
    | 'navigation.elements'
  >,
}

export const ComponentBreadcrumbs: FC<ComponentBreadcrumbsProps> = ({ design, translations }) => {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Item href="/element">{translations['navigation.elements']}</Breadcrumbs.Item>
      {design.subcategory?.category
        ? <Breadcrumbs.Item href={`/element#${design.subcategory.category.id}`}>{design.subcategory.category.name}</Breadcrumbs.Item>
        : <Breadcrumbs.Item>{translations['category.unknown']}</Breadcrumbs.Item>
      }
      {design.subcategory
        ? <Breadcrumbs.Item href={`/element/subcategory/${design.subcategoryId}`}>{design.subcategory.name}</Breadcrumbs.Item>
        : <Breadcrumbs.Item>{translations['subcategory.unknown']}</Breadcrumbs.Item>
      }
      <Breadcrumbs.Item>{design.name}</Breadcrumbs.Item>
    </Breadcrumbs>
  );
};
