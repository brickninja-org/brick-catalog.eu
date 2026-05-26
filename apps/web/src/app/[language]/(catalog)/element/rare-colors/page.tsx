import { createDataGrid } from '@brickninja-org/ui';

import { ElementColorSwatch } from '@/components/element/ElementColorSwatch';
import { Description } from '@/components/layout/Description';
import { cache } from '@/lib/cache';
import { db } from '@/lib/prisma';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const getRareColors = cache(
  () => db.color.findMany({
    where: { elements: { some: {}}},
    select: {
      id: true,
      name: true,
      family: true,
      pieceColor: true,
      contrastColor: true,
      _count: { select: { elements: true }},
    },
    orderBy: [{ elements: { _count: 'asc' }}, { id: 'asc' }],
    take: 300,
  }),
  ['element-rare-colors'],
  { revalidate: 60 },
);

export default async function ElementRareColorsPage() {
  const colors = await getRareColors();
  const RareColors = createDataGrid(colors, (row) => row.id);

  return (
    <div className="mx-auto w-full max-w-248">
      <Description>
        Colors with the smallest part availability in the current catalog. Useful for rare color hunts and collection planning.
      </Description>
      <RareColors.Table
        enablePagination
        defaultRowsPerPage={25}
        initialSortBy="elements"
        initialSortDirection="ascending"
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      >
        <RareColors.Column isRowHeader header="Color ID" id="id" sortBy="id" title="Color ID">
          {({ id }) => id}
        </RareColors.Column>
        <RareColors.Column header="Color" id="color" title="Color">
          {(color) => (
            <ElementColorSwatch
              color={{
                id: color.id,
                name: color.name,
                family: color.family,
                pieceColor: color.pieceColor,
                contrastColor: color.contrastColor,
              }}
            />
          )}
        </RareColors.Column>
        <RareColors.Column header="Family" id="family" sortBy="family" title="Family">
          {({ family }) => family}
        </RareColors.Column>
        <RareColors.Column header="Elements Using Color" id="elements" title="Elements Using Color">
          {({ _count }) => _count.elements}
        </RareColors.Column>
      </RareColors.Table>
    </div>
  );
}
