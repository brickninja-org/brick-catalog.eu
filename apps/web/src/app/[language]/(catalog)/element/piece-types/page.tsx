import { createDataGrid } from '@brickninja-org/ui';
import Link from 'next/link';

import { Description } from '@/components/layout/Description';
import { cache } from '@/lib/cache';
import { db } from '@/lib/prisma';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const getPieceTypeStats = cache(
  async () => {
    const pieceTypes = await db.design.groupBy({
      by: ['pieceType'],
      _count: { pieceType: true },
      orderBy: { _count: { pieceType: 'desc' }},
    });

    const withElementCounts = await Promise.all(pieceTypes.map(async (row) => {
      const elementCount = await db.element.count({
        where: {
          design: {
            pieceType: row.pieceType,
          },
        },
      });

      return {
        pieceType: row.pieceType,
        designCount: row._count.pieceType ?? 0,
        elementCount,
      };
    }));

    return withElementCounts;
  },
  ['element-piece-type-stats'],
  { revalidate: 60 },
);

export default async function ElementPieceTypesPage() {
  const pieceTypes = await getPieceTypeStats();
  const PieceTypes = createDataGrid(pieceTypes, (row) => row.pieceType);

  return (
    <div className="mx-auto w-full max-w-248">
      <Description>
        Catalog breakdown by piece type (LEGO, TECHNIC, DUPLO). Helpful when filtering by build style.
      </Description>
      <PieceTypes.Table
        enablePagination
        defaultRowsPerPage={25}
        initialSortBy="design_count"
        initialSortDirection="descending"
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      >
        <PieceTypes.Column isRowHeader header="Piece Type" id="piece_type" sortBy="pieceType" title="Piece Type">
          {({ pieceType }) => pieceType}
        </PieceTypes.Column>
        <PieceTypes.Column header="Designs" id="design_count" title="Designs">
          {({ designCount }) => designCount}
        </PieceTypes.Column>
        <PieceTypes.Column header="Elements" id="element_count" title="Elements">
          {({ elementCount }) => elementCount}
        </PieceTypes.Column>
        <PieceTypes.Column header="Explore" id="explore" title="Explore">
          {({ pieceType }) => (
            <Link href={`/element?pieceType=${pieceType}`}>
              Open filtered list
            </Link>
          )}
        </PieceTypes.Column>
      </PieceTypes.Table>
    </div>
  );
}
