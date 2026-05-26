import type { PrismaClient } from '@brickcatalog/database';

export interface LegoCatalogSnapshot {
  totalElements: number,
  activeElements: number,
  removedElements: number,
  activeElementRate: number,
  removedElementRate: number,
  elementsWithDesign: number,
  elementsWithoutDesign: number,
  designCoverageRate: number,
  elementsWithColor: number,
  elementsWithoutColor: number,
  colorCoverageRate: number,
  totalDesigns: number,
  activeDesigns: number,
  removedDesigns: number,
  activeDesignRate: number,
  designsWithSubcategory: number,
  designsWithoutSubcategory: number,
  subcategoryCoverageRate: number,
  totalColors: number,
  activeColors: number,
  removedColors: number,
  activeColorRate: number,
  totalSubcategories: number,
  totalCategories: number,
  subcategoriesWithCategory: number,
  subcategoriesWithoutCategory: number,
  subcategoryCategoryCoverageRate: number,
  activeCategories: number,
  removedCategories: number,
  activeSubcategories: number,
  removedSubcategories: number,
  relationHealth: {
    elementDesignLinkedRate: number,
    elementColorLinkedRate: number,
    designSubcategoryLinkedRate: number,
    subcategoryCategoryLinkedRate: number,
  },
  latestBuildId: null | string,
  designElementDistribution: {
    avgElementsPerDesign: number,
    medianElementsPerDesign: number,
    p90ElementsPerDesign: number,
    maxElementsPerDesign: number,
  },
  colorElementDistribution: {
    avgElementsPerColor: number,
    medianElementsPerColor: number,
    p90ElementsPerColor: number,
    maxElementsPerColor: number,
  },
  topSubcategoriesMissingColor: Array<{
    subcategoryId: number,
    subcategoryName: string,
    missingColorElements: number,
  }>,
  topDesignsByElements: Array<{
    id: number,
    name: string,
    elementCount: number,
  }>,
  topColorsByElements: Array<{
    id: number,
    name: string,
    family: string,
    elementCount: number,
  }>,
  colorFamilyBreakdown: Array<{
    family: string,
    colorCount: number,
  }>,
  topCategoriesByDesigns: Array<{
    id: number,
    name: string,
    subcategoryCount: number,
    designCount: number,
  }>,
  topSubcategoriesByDesigns: Array<{
    id: number,
    name: string,
    categoryId: null | number,
    categoryName: null | string,
    designCount: number,
  }>,
  monthOverMonth: {
    latestMonth: null | string,
    previousMonth: null | string,
    elements: { latest: number, previous: number, delta: number, deltaRate: number },
    designs: { latest: number, previous: number, delta: number, deltaRate: number },
    colors: { latest: number, previous: number, delta: number, deltaRate: number },
  },
}

export type CatalogSnapshotSource = Pick<
  PrismaClient,
  'element' | 'design' | 'color' | 'subcategory' | 'category' | '$queryRaw'
>;

export async function getCatalogSnapshot(
  db: CatalogSnapshotSource,
): Promise<LegoCatalogSnapshot> {
  type DistributionRow = {
    avg: null | number,
    median: null | number,
    p90: null | number,
    max: null | number,
  };
  type MissingColorRow = {
    subcategoryId: number,
    subcategoryName: string,
    missingColorElements: bigint | number,
  };
  type MonthOverMonthRow = {
    latestMonth: null | string,
    previousMonth: null | string,
    elementsLatest: bigint | number,
    elementsPrevious: bigint | number,
    designsLatest: bigint | number,
    designsPrevious: bigint | number,
    colorsLatest: bigint | number,
    colorsPrevious: bigint | number,
  };

  const [
    totalElements,
    activeElements,
    removedElements,
    elementsWithDesign,
    elementsWithColor,

    totalDesigns,
    activeDesigns,
    removedDesigns,
    designsWithSubcategory,

    totalColors,
    activeColors,
    removedColors,
    totalSubcategories,
    totalCategories,
    activeCategories,
    removedCategories,
    activeSubcategories,
    removedSubcategories,
    subcategoriesWithCategory,

    colorFamilyRows,
    topDesignsRows,
    topColorsRows,
    topCategoryRows,
    topSubcategoryRows,
    designDistributionRows,
    colorDistributionRows,
    missingColorRows,
    monthOverMonthRows,
  ] = await Promise.all([
    db.element.count(),
    db.element.count({ where: { removedFromApi: false }}),
    db.element.count({ where: { removedFromApi: true }}),
    db.element.count({ where: { designId: { not: null }}}),
    db.element.count({ where: { colorId: { not: null }}}),

    db.design.count(),
    db.design.count({ where: { removedFromApi: false }}),
    db.design.count({ where: { removedFromApi: true }}),
    db.design.count({ where: { subcategoryId: { not: null }}}),

    db.color.count(),
    db.color.count({ where: { removedFromApi: false }}),
    db.color.count({ where: { removedFromApi: true }}),
    db.subcategory.count(),
    db.category.count(),
    db.category.count({ where: { removedFromApi: false } }),
    db.category.count({ where: { removedFromApi: true } }),
    db.subcategory.count({ where: { removedFromApi: false } }),
    db.subcategory.count({ where: { removedFromApi: true } }),
    db.subcategory.count({ where: { categoryId: { not: null } } }),

    db.color.groupBy({
      by: ['family'],
      _count: { _all: true },
      orderBy: { family: 'asc' },
    }),
    db.design.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        _count: {
          select: { elements: true },
        },
      },
      orderBy: {
        elements: {
          _count: 'desc',
        },
      },
    }),
    db.color.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        family: true,
        _count: {
          select: { elements: true },
        },
      },
      orderBy: {
        elements: {
          _count: 'desc',
        },
      },
    }),
    db.category.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        _count: {
          select: { subcategories: true },
        },
        subcategories: {
          select: {
            _count: {
              select: { designs: true },
            },
          },
        },
      },
      orderBy: {
        subcategories: {
          _count: 'desc',
        },
      },
    }),
    db.subcategory.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        categoryId: true,
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: { designs: true },
        },
      },
      orderBy: {
        designs: {
          _count: 'desc',
        },
      },
    }),
    db.$queryRaw<DistributionRow[]>`
      SELECT
        COALESCE(AVG(t."elementCount"), 0)::float8 AS "avg",
        COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t."elementCount"), 0)::float8 AS "median",
        COALESCE(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY t."elementCount"), 0)::float8 AS "p90",
        COALESCE(MAX(t."elementCount"), 0)::float8 AS "max"
      FROM (
        SELECT COUNT(e.id)::int AS "elementCount"
        FROM "Design" d
        LEFT JOIN "Element" e ON e."designId" = d.id
        GROUP BY d.id
      ) t
    `,
    db.$queryRaw<DistributionRow[]>`
      SELECT
        COALESCE(AVG(t."elementCount"), 0)::float8 AS "avg",
        COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t."elementCount"), 0)::float8 AS "median",
        COALESCE(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY t."elementCount"), 0)::float8 AS "p90",
        COALESCE(MAX(t."elementCount"), 0)::float8 AS "max"
      FROM (
        SELECT COUNT(e.id)::int AS "elementCount"
        FROM "Color" c
        LEFT JOIN "Element" e ON e."colorId" = c.id
        GROUP BY c.id
      ) t
    `,
    db.$queryRaw<MissingColorRow[]>`
      SELECT
        sc.id AS "subcategoryId",
        sc.name AS "subcategoryName",
        COUNT(e.id)::int AS "missingColorElements"
      FROM "Element" e
      INNER JOIN "Design" d ON e."designId" = d.id
      INNER JOIN "Category" sc ON d."categoryId" = sc.id
      WHERE e."colorId" IS NULL
      GROUP BY sc.id, sc.name
      ORDER BY "missingColorElements" DESC
      LIMIT 10
    `,
    db.$queryRaw<MonthOverMonthRow[]>`
      WITH monthly AS (
        SELECT DISTINCT DATE_TRUNC('month', r."createdAt") AS month_start
        FROM "Revision" r
        ORDER BY month_start DESC
        LIMIT 2
      ),
      ranked AS (
        SELECT month_start, ROW_NUMBER() OVER (ORDER BY month_start DESC) AS rn
        FROM monthly
      ),
      elements AS (
        SELECT DATE_TRUNC('month', r."createdAt") AS month_start, COUNT(DISTINCT eh."elementId")::int AS c
        FROM "ElementHistory" eh
        JOIN "Revision" r ON r.id = eh."revisionId"
        WHERE DATE_TRUNC('month', r."createdAt") IN (SELECT month_start FROM monthly)
        GROUP BY DATE_TRUNC('month', r."createdAt")
      ),
      designs AS (
        SELECT DATE_TRUNC('month', r."createdAt") AS month_start, COUNT(DISTINCT dh."designId")::int AS c
        FROM "DesignHistory" dh
        JOIN "Revision" r ON r.id = dh."revisionId"
        WHERE DATE_TRUNC('month', r."createdAt") IN (SELECT month_start FROM monthly)
        GROUP BY DATE_TRUNC('month', r."createdAt")
      ),
      colors AS (
        SELECT DATE_TRUNC('month', r."createdAt") AS month_start, COUNT(DISTINCT ch."colorId")::int AS c
        FROM "ColorHistory" ch
        JOIN "Revision" r ON r.id = ch."revisionId"
        WHERE DATE_TRUNC('month', r."createdAt") IN (SELECT month_start FROM monthly)
        GROUP BY DATE_TRUNC('month', r."createdAt")
      )
      SELECT
        TO_CHAR((SELECT month_start FROM ranked WHERE rn = 1), 'YYYY-MM') AS "latestMonth",
        TO_CHAR((SELECT month_start FROM ranked WHERE rn = 2), 'YYYY-MM') AS "previousMonth",
        COALESCE((SELECT c FROM elements WHERE month_start = (SELECT month_start FROM ranked WHERE rn = 1)), 0) AS "elementsLatest",
        COALESCE((SELECT c FROM elements WHERE month_start = (SELECT month_start FROM ranked WHERE rn = 2)), 0) AS "elementsPrevious",
        COALESCE((SELECT c FROM designs WHERE month_start = (SELECT month_start FROM ranked WHERE rn = 1)), 0) AS "designsLatest",
        COALESCE((SELECT c FROM designs WHERE month_start = (SELECT month_start FROM ranked WHERE rn = 2)), 0) AS "designsPrevious",
        COALESCE((SELECT c FROM colors WHERE month_start = (SELECT month_start FROM ranked WHERE rn = 1)), 0) AS "colorsLatest",
        COALESCE((SELECT c FROM colors WHERE month_start = (SELECT month_start FROM ranked WHERE rn = 2)), 0) AS "colorsPrevious"
    `,
  ]);

  const designDistribution = designDistributionRows[0] ?? {
    avg: 0,
    median: 0,
    p90: 0,
    max: 0,
  };
  const colorDistribution = colorDistributionRows[0] ?? {
    avg: 0,
    median: 0,
    p90: 0,
    max: 0,
  };
  const mom = monthOverMonthRows[0] ?? {
    latestMonth: null,
    previousMonth: null,
    elementsLatest: 0,
    elementsPrevious: 0,
    designsLatest: 0,
    designsPrevious: 0,
    colorsLatest: 0,
    colorsPrevious: 0,
  };
  const elementsLatest = Number(mom.elementsLatest);
  const elementsPrevious = Number(mom.elementsPrevious);
  const designsLatest = Number(mom.designsLatest);
  const designsPrevious = Number(mom.designsPrevious);
  const colorsLatest = Number(mom.colorsLatest);
  const colorsPrevious = Number(mom.colorsPrevious);

  return {
    totalElements,
    activeElements,
    removedElements,
    activeElementRate: totalElements ? activeElements / totalElements : 0,
    removedElementRate: totalElements ? removedElements / totalElements : 0,
    elementsWithDesign,
    elementsWithoutDesign: totalElements - elementsWithDesign,
    designCoverageRate: totalElements ? elementsWithDesign / totalElements : 0,
    elementsWithColor,
    elementsWithoutColor: totalElements - elementsWithColor,
    colorCoverageRate: totalElements ? elementsWithColor / totalElements : 0,

    totalDesigns,
    activeDesigns,
    removedDesigns,
    activeDesignRate: totalDesigns ? activeDesigns / totalDesigns : 0,
    designsWithSubcategory,
    designsWithoutSubcategory: totalDesigns - designsWithSubcategory,
    subcategoryCoverageRate: totalDesigns ? designsWithSubcategory / totalDesigns : 0,

    totalColors,
    activeColors,
    removedColors,
    activeColorRate: totalColors ? activeColors / totalColors : 0,
    totalSubcategories,
    totalCategories,
    subcategoriesWithCategory,
    subcategoriesWithoutCategory: totalSubcategories - subcategoriesWithCategory,
    subcategoryCategoryCoverageRate: totalSubcategories
      ? subcategoriesWithCategory / totalSubcategories
      : 0,
    activeCategories,
    removedCategories,
    activeSubcategories,
    removedSubcategories,
    relationHealth: {
      elementDesignLinkedRate: totalElements ? elementsWithDesign / totalElements : 0,
      elementColorLinkedRate: totalElements ? elementsWithColor / totalElements : 0,
      designSubcategoryLinkedRate: totalDesigns ? designsWithSubcategory / totalDesigns : 0,
      subcategoryCategoryLinkedRate: totalSubcategories
        ? subcategoriesWithCategory / totalSubcategories
        : 0,
    },
    // Kept for backward compatibility in consumers; intentionally no non-LEGO table dependency.
    latestBuildId: null,
    designElementDistribution: {
      avgElementsPerDesign: designDistribution.avg ?? 0,
      medianElementsPerDesign: designDistribution.median ?? 0,
      p90ElementsPerDesign: designDistribution.p90 ?? 0,
      maxElementsPerDesign: designDistribution.max ?? 0,
    },
    colorElementDistribution: {
      avgElementsPerColor: colorDistribution.avg ?? 0,
      medianElementsPerColor: colorDistribution.median ?? 0,
      p90ElementsPerColor: colorDistribution.p90 ?? 0,
      maxElementsPerColor: colorDistribution.max ?? 0,
    },
    topDesignsByElements: topDesignsRows.map((row) => ({
      id: row.id,
      name: row.name,
      elementCount: row._count.elements,
    })),
    topColorsByElements: topColorsRows.map((row) => ({
      id: row.id,
      name: row.name,
      family: row.family,
      elementCount: row._count.elements,
    })),
    colorFamilyBreakdown: colorFamilyRows.map((row) => ({
      family: String(row.family),
      colorCount: row._count._all,
    })),
    topCategoriesByDesigns: topCategoryRows.map((row) => ({
      id: row.id,
      name: row.name,
      subcategoryCount: row._count.subcategories,
      designCount: row.subcategories.reduce(
        (total, subcategory) => total + subcategory._count.designs,
        0,
      ),
    })),
    topSubcategoriesByDesigns: topSubcategoryRows.map((row) => ({
      id: row.id,
      name: row.name,
      categoryId: row.categoryId,
      categoryName: row.category?.name ?? null,
      designCount: row._count.designs,
    })),
    topSubcategoriesMissingColor: missingColorRows.map((row) => ({
      subcategoryId: row.subcategoryId,
      subcategoryName: row.subcategoryName,
      missingColorElements: Number(row.missingColorElements),
    })),
    monthOverMonth: {
      latestMonth: mom.latestMonth,
      previousMonth: mom.previousMonth,
      elements: {
        latest: elementsLatest,
        previous: elementsPrevious,
        delta: elementsLatest - elementsPrevious,
        deltaRate: elementsPrevious ? (elementsLatest - elementsPrevious) / elementsPrevious : 0,
      },
      designs: {
        latest: designsLatest,
        previous: designsPrevious,
        delta: designsLatest - designsPrevious,
        deltaRate: designsPrevious ? (designsLatest - designsPrevious) / designsPrevious : 0,
      },
      colors: {
        latest: colorsLatest,
        previous: colorsPrevious,
        delta: colorsLatest - colorsPrevious,
        deltaRate: colorsPrevious ? (colorsLatest - colorsPrevious) / colorsPrevious : 0,
      },
    },
  };
}
