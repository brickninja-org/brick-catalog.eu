import { createDataGrid } from '@brickninja-org/ui';
import Link from 'next/link';

import { Description } from '@/components/layout/Description';
import { cache } from '@/lib/cache';
import { db } from '@/lib/prisma';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const getDesignVariants = cache(
  async () => {
    const grouped = await db.element.groupBy({
      by: ['designId'],
      where: { designId: { not: null }},
      _count: { designId: true },
      orderBy: { _count: { designId: 'desc' }},
      take: 250,
    });

    const designIds = grouped.map((row) => row.designId).filter((id): id is number => id != null);
    const designMap = new Map(
      (await db.design.findMany({
        where: { id: { in: designIds }},
        select: {
          id: true,
          name: true,
          pieceType: true,
        },
      })).map((design) => [design.id, design]),
    );

    return grouped
      .map((row) => {
        if (row.designId == null) {
          return null;
        }
        const design = designMap.get(row.designId);
        if (!design) {
          return null;
        }

        return {
          id: design.id,
          name: design.name,
          pieceType: design.pieceType,
          variantCount: row._count.designId ?? 0,
        };
      })
      .filter((row): row is { id: number, name: string, pieceType: string, variantCount: number } => row !== null);
  },
  ['element-design-variants'],
  { revalidate: 60 },
);

export default async function ElementDesignVariantsPage() {
  const rows = await getDesignVariants();
  const DesignVariants = createDataGrid(rows, (row) => row.id);

  return (
    <div className="mx-auto w-full max-w-248">
      <Description>
        Designs with the most element variants. Great for builders who want maximum color and inventory flexibility.
      </Description>
      <DesignVariants.Table
        enablePagination
        defaultRowsPerPage={25}
        initialSortBy="variant_count"
        initialSortDirection="descending"
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      >
        <DesignVariants.Column isRowHeader header="Design ID" id="id" sortBy="id" title="Design ID">
          {({ id }) => id}
        </DesignVariants.Column>
        <DesignVariants.Column header="Name" id="name" sortBy="name" title="Name">
          {({ id, name }) => <Link href={`/element/design/${id}`}>{name}</Link>}
        </DesignVariants.Column>
        <DesignVariants.Column header="Piece Type" id="piece_type" sortBy="pieceType" title="Piece Type">
          {({ pieceType }) => pieceType}
        </DesignVariants.Column>
        <DesignVariants.Column header="Element Variants" id="variant_count" title="Element Variants">
          {({ variantCount }) => variantCount}
        </DesignVariants.Column>
      </DesignVariants.Table>
    </div>
  );
}
