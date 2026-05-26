import type { Prisma } from '@brickcatalog/database';

import { ColorFamily } from '@brickcatalog/database';
import {
  createDataGrid,
  createDataGridSearchIndex,
  DataGridFilterTrigger,
  DataGridSearchField,
  DataGridToolbar,
  DataGridToolbarActions,
} from '@brickninja-org/ui';
import { Funnel } from '@gravity-ui/icons';

import { ColumnSelect } from '@/components/table/ColumnSelect';
import { DataGridFilterRoot } from '@/components/table/DataGridFilterProvider';
import { cache } from '@/lib/cache';
import { db } from '@/lib/prisma';

import { ColorSwatch } from './ColorSwatch.client';

const getColors = cache(
  (where?: Prisma.ColorWhereInput) => db.color.findMany({
    where,
    orderBy: { id: 'asc' },
    include: { _count: { select: { elements: true }}},
  }),
  ['colors'],
  { revalidate: 60 },
);

export default async function ColorPage({ searchParams }: PageProps<'/[language]/element/color'>) {
  const { family, hasElements, q } = await searchParams;
  const searchQuery = typeof q === 'string' ? q.trim() : '';
  const selectedFamily = typeof family === 'string' ? family.trim() : '';
  const onlyWithElements = hasElements === '1';
  const selectedColorFamily = Object.values(ColorFamily).includes(selectedFamily as ColorFamily)
    ? selectedFamily as ColorFamily
    : undefined;
  const where: Prisma.ColorWhereInput = {
    ...(selectedColorFamily ? { family: selectedColorFamily } : {}),
    ...(searchQuery ? {
      OR: [
        { name: { contains: searchQuery, mode: 'insensitive' }},
        Number.isFinite(Number(searchQuery)) ? { id: Number(searchQuery) } : undefined,
      ].filter(Boolean) as Prisma.ColorWhereInput[],
    } : {}),
    ...(onlyWithElements ? { elements: { some: {}}} : {}),
  };
  const filteredColors = await getColors(where);
  const Colors = createDataGrid(filteredColors, (row) => row.id);

  const visibleFamilyOptions = Array.from(
    new Set(filteredColors.map((color) => color.family).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));

  const colorFilters = visibleFamilyOptions.map((family) => ({
    id: family,
    label: family,
    rowIndices: filteredColors.map(({ family }, index) => [family, index] as const)
      .filter(([f]) => family === f)
      .map(([, index]) => index),
  }));

  const colorFamilySearchIndex = createDataGridSearchIndex(visibleFamilyOptions, (family) => family);

  return (
    <DataGridFilterRoot filters={colorFilters} searchIndex={colorFamilySearchIndex}>
      <section className="content-auto mx-auto w-full max-w-248 px-4 py-8 [contain-intrinsic-size:auto_900px]" id="top">
        <DataGridToolbar className="mb-3 justify-between rounded-medium border border-divider bg-content1 p-2">
          <DataGridToolbarActions>
            <DataGridFilterTrigger
              label={(
                <span className="inline-flex items-center gap-1.5">
                  <Funnel className="size-3.5"/>
                  Filters
                </span>
              )}
            />
            <ColumnSelect table={Colors}/>
            <DataGridSearchField className="min-w-64 max-w-80" placeholder="Filter visible color families..."/>
          </DataGridToolbarActions>
        </DataGridToolbar>

        <Colors.Table
          enablePagination
          defaultRowsPerPage={25}
          initialSortBy="name"
          initialSortDirection="ascending"
          rowsPerPageOptions={[10, 25, 50, 100]}
        >
          <Colors.Column isRowHeader className="w-px whitespace-nowrap font-mono" header="Id" id="id" sortBy="id" title="Id">{({ id }) => id}</Colors.Column>
          <Colors.Column className="w-px" header="Swatch" id="piece_color" title="Swatch">{({ pieceColor }) => <ColorSwatch color={pieceColor} shape="square"/>}</Colors.Column>
          <Colors.Column isRowHeader header="Name" id="name" sortBy="name" title="Name">{({ name }) => <span className="font-medium">{name}</span>}</Colors.Column>
          <Colors.Column header="Color Family" id="color_family" sortBy="family" title="Color Family">{({ family }) => <span className="text-muted">{family}</span>}</Colors.Column>
          <Colors.Column className="w-px text-right whitespace-nowrap" header="Elements" id="element_count" title="Elements">{(({ _count: { elements }}) => elements)}</Colors.Column>
        </Colors.Table>
      </section>
    </DataGridFilterRoot>
  );
}
