import { Headline } from '@brickninja-org/ui';

import { Translate } from '@/components/i18n/Translate';
import { HeroLayout } from '@/components/layout/HeroLayout';
import { cache } from '@/lib/cache';
import { db } from '@/lib/prisma';

import { ElementCatalogOverview } from './page.client';

const TOP_COLOR_LIMIT = 6;
const RARE_COLOR_LIMIT = 6;
const TOP_SUBCATEGORY_LIMIT = 6;
const TOP_CATEGORY_LIMIT = 6;
const TOP_DESIGN_VARIANT_LIMIT = 8;

type TopColorUsageRow = { id: number, name: string, hex: string, count: number };
type TopDesignVariantRow = { id: number, name: string, pieceType: string, count: number };

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}

const getCatalogOverview = cache(
  async () => {
    const [
      totalElements,
      totalDesigns,
      totalColors,
      totalCategories,
      totalSubcategories,
      removedElements,
      uncategorizedDesigns,
      topColorUsageRaw,
      rareColors,
      topSubcategories,
      topCategories,
      topDesignVariantsRaw,
      colorFamilies,
      pieceTypeDistribution,
    ] = await Promise.all([
      db.element.count(),
      db.design.count(),
      db.color.count(),
      db.category.count(),
      db.subcategory.count(),
      db.element.count({ where: { removedFromApi: true }}),
      db.design.count({ where: { subcategoryId: null }}),
      db.element.groupBy({
        by: ['colorId'],
        where: { colorId: { not: null }},
        _count: { colorId: true },
        orderBy: { _count: { colorId: 'desc' }},
        take: TOP_COLOR_LIMIT,
      }),
      db.color.findMany({
        where: { elements: { some: {}} },
        select: {
          id: true,
          name: true,
          pieceColor: true,
          _count: { select: { elements: true }},
        },
        orderBy: { elements: { _count: 'asc' }},
        take: RARE_COLOR_LIMIT,
      }),
      db.subcategory.findMany({
        select: { id: true, name: true, _count: { select: { designs: true }}},
        orderBy: { designs: { _count: 'desc' }},
        take: TOP_SUBCATEGORY_LIMIT,
      }),
      db.category.findMany({
        select: { id: true, name: true, _count: { select: { subcategories: true }}},
        orderBy: { subcategories: { _count: 'desc' }},
        take: TOP_CATEGORY_LIMIT,
      }),
      db.element.groupBy({
        by: ['designId'],
        where: { designId: { not: null }},
        _count: { designId: true },
        orderBy: { _count: { designId: 'desc' }},
        take: TOP_DESIGN_VARIANT_LIMIT,
      }),
      db.color.groupBy({
        by: ['family'],
        _count: { family: true },
        orderBy: { _count: { family: 'desc' }},
      }),
      db.design.groupBy({
        by: ['pieceType'],
        _count: { pieceType: true },
        orderBy: { _count: { pieceType: 'desc' }},
      }),
    ]);

    const topColorIds = topColorUsageRaw.map((row) => row.colorId).filter((id): id is number => id != null);
    const topColorMap = new Map(
      (await db.color.findMany({
        where: { id: { in: topColorIds }},
        select: { id: true, name: true, pieceColor: true },
      })).map((color) => [color.id, color]),
    );

    const topColorUsage: TopColorUsageRow[] = topColorUsageRaw
      .map((row) => {
        if (row.colorId == null) {
          return null;
        }
        const color = topColorMap.get(row.colorId);
        if (!color) {
          return null;
        }

        return {
          id: color.id,
          name: color.name,
          hex: color.pieceColor,
          count: row._count.colorId ?? 0,
        };
      })
      .filter(isDefined);

    const topDesignIds = topDesignVariantsRaw.map((row) => row.designId).filter((id): id is number => id != null);
    const topDesignMap = new Map(
      (await db.design.findMany({
        where: { id: { in: topDesignIds }},
        select: {
          id: true,
          name: true,
          pieceType: true,
        },
      })).map((design) => [design.id, design]),
    );

    const topDesignVariants: TopDesignVariantRow[] = topDesignVariantsRaw
      .map((row) => {
        if (row.designId == null) {
          return null;
        }
        const design = topDesignMap.get(row.designId);
        if (!design) {
          return null;
        }

        return {
          id: design.id,
          name: design.name,
          pieceType: design.pieceType,
          count: row._count.designId ?? 0,
        };
      })
      .filter(isDefined);

    return {
      totalElements,
      totalDesigns,
      totalColors,
      totalCategories,
      totalSubcategories,
      removedElements,
      uncategorizedDesigns,
      topColorUsage,
      rareColors: rareColors.map((color) => ({
        id: color.id,
        name: color.name,
        hex: color.pieceColor,
        count: color._count.elements,
      })),
      topSubcategories: topSubcategories.map((subcategory) => ({
        id: subcategory.id,
        name: subcategory.name,
        designCount: subcategory._count.designs,
      })),
      topCategories: topCategories.map((category) => ({
        id: category.id,
        name: category.name,
        subcategoryCount: category._count.subcategories,
      })),
      colorFamilies: colorFamilies.map((family) => ({
        family: family.family,
        count: family._count.family ?? 0,
      })),
      pieceTypeDistribution: pieceTypeDistribution.map((pieceType) => ({
        pieceType: pieceType.pieceType,
        count: pieceType._count.pieceType ?? 0,
      })),
      topDesignVariants,
    };
  },
  ['element-catalog-overview'],
  { revalidate: 60 },
);

export default async function ElementPage() {
  const overview = await getCatalogOverview();

  return (
    <HeroLayout
      hero={<Headline id="elements"><Translate id="navigation.elements"/></Headline>}
    >
      <ElementCatalogOverview overview={overview}/>
    </HeroLayout>
  );
}
