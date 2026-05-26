import type { ElementCategory } from '@brickninjaapi/types/data/element';

import { Headline } from '@brickninja-org/ui';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { DesignTable } from '@/components/element/DesignTable';
import { Json } from '@/components/format/Json';
import { DetailLayout } from '@/components/layout/DetailLayout';
import { cache } from '@/lib/cache';
import { db } from '@/lib/prisma';

import { ElementBreadcrumbs } from './page.client';

export interface ElementSubcategoryPageProps {
  params: Promise<{
    language: string,
    id: string,
  }>,
}

const getElementCategory = cache(async (id: number) => {
  const [elementSubcategory, revision] = await Promise.all([
    db.subcategory.findUnique({
      where: { id },
      include: {
        designs: { include: { elements: { select: { color: { select: { pieceColor: true }}}}}},
        category: true,
      },
    }),
    db.revision.findFirst({ where: { ['currentSubcategory']: { id }}}),
  ]);

  if (!elementSubcategory || !revision) {
    notFound();
  }

  return { elementSubcategory, revision };
}, ['element-subcategory'], { revalidate: 60 });

async function ElementSubcategoryPage({ params }: ElementSubcategoryPageProps) {
  const { id, language } = await params;
  const elementSubcategoryId = Number(id);

  const t = await getTranslations({ locale: language });
  const elementTranslations = { 'navigation.elements': t('navigation.elements') };

  if (isNaN(elementSubcategoryId)) {
    notFound();
  }

  const { elementSubcategory, revision } = await getElementCategory(elementSubcategoryId);

  const data: ElementCategory = JSON.parse(revision.data);

  return (
    <DetailLayout
      breadcrumbs={<ElementBreadcrumbs category={elementSubcategory?.category ? elementSubcategory.category.name : 'Unknown category'} translations={elementTranslations}/>}
      title={data.name}
    >
      <DesignTable
        designs={elementSubcategory.designs}
        headline="Designs"
        headlineId="designs"
      />

      <Headline id="data">Data</Headline>
      <Json data={data}/>
    </DetailLayout>
  );
}

export default ElementSubcategoryPage;
