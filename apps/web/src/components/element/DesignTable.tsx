import type { DesignElementColor } from './DesignColorGroup.client';
import type { Design } from '@brickcatalog/database';
import type { FC, ReactNode } from 'react';

import {
  DataGridActiveFilters,
  createDataGrid,
  createDataGridSearchIndex,
  DataGridFilterTrigger,
  DataGridSearchField,
  DataGridToolbar,
  DataGridToolbarActions,
  DataGridToolbarHeader,
  Headline,
} from '@brickninja-org/ui';
import { Funnel } from '@gravity-ui/icons';

import { FormatWeight } from '../format/FormatWeight';
import { ColumnSelect } from '../table/ColumnSelect';
import { DataGridFilterRoot } from '../table/DataGridFilterProvider';
import { SortSelect } from '../table/SortSelect';

import { DesignColorGroup } from './DesignColorGroup.client';

type DesignRow = Design & {
  elements?: DesignElementColor[],
};

export interface DesignTableProps {
  designs: DesignRow[],
  headline?: ReactNode,
  headlineId?: string,
  sort?: boolean,
  children?: (table: ReactNode, columnSelect?: ReactNode) => ReactNode,
}

export const DesignTable: FC<DesignTableProps> = ({
  designs,
  headline,
  headlineId,
  sort = true,
  children,
}) => {
  const showHeadline = headline !== undefined && headlineId !== undefined;
  const Designs = createDataGrid(designs, ({ id }) => id);

  const designInitialToIndices = new Map<string, number[]>();
  const pieceTypeToIndices = new Map<string, number[]>();

  designs.forEach((design, index) => {
    const normalizedName = (design.name ?? '').trim();
    const initial = normalizedName.length > 0
      ? normalizedName[0].toUpperCase()
      : '#';
    const pieceType = (design.pieceType ?? '').trim() || 'Unknown';
    const existingIndexes = designInitialToIndices.get(initial);
    const existingPieceTypeIndexes = pieceTypeToIndices.get(pieceType);

    if (existingIndexes) {
      existingIndexes.push(index);
    } else {
      designInitialToIndices.set(initial, [index]);
    }

    if (existingPieceTypeIndexes) {
      existingPieceTypeIndexes.push(index);
    } else {
      pieceTypeToIndices.set(pieceType, [index]);
    }
  });

  const pieceTypes = Array.from(pieceTypeToIndices.keys()).sort((a, b) => a.localeCompare(b));
  const showPieceTypeFilter = pieceTypes.length > 1;

  const pieceTypeFilterIds = pieceTypes.map((pieceType) => `pieceType:${pieceType}`);

  const pieceTypeFilters = pieceTypes.map((pieceType) => ({
    id: `pieceType:${pieceType}`,
    label: pieceType,
    rowIndices: pieceTypeToIndices.get(pieceType) ?? [],
  }));
  const designFilters = [...pieceTypeFilters];

  const designSearchIndex = createDataGridSearchIndex(designs, (design) => {
    const designId = String(design.id);
    const designName = (design.name ?? '').trim();
    const pieceType = (design.pieceType ?? '').trim();
    const designInitial = designName.length > 0 ? designName[0]!.toUpperCase() : '#';

    return [
      designId,
      designName,
      pieceType,
      `${designId} ${designName}`.trim(),
      designInitial,
    ];
  });

  const table = (
    <DataGridFilterRoot filters={designFilters} searchIndex={designSearchIndex}>
      <div className="flex flex-col gap-2">
        {showHeadline ? (
          <DataGridToolbar className="mb-4 mt-8">
            <DataGridToolbarHeader>
              <Headline
                className="m-0"
                count={designs.length}
                id={headlineId}
              >
                {headline}
              </Headline>
            </DataGridToolbarHeader>
            <DataGridToolbarActions>
              {showPieceTypeFilter ? (
                <DataGridFilterTrigger
                  allLabel="All types"
                  filterIds={pieceTypeFilterIds}
                  label={<><Funnel/> Piece Type</>}
                  selectionMode="single"
                  title="Piece types"
                />
              ) : null}
              <ColumnSelect table={Designs}/>
              {sort ? <SortSelect table={Designs}/> : null}
              <DataGridSearchField className="min-w-72 max-w-80" placeholder="Search design ID, name, type, or initial..."/>
            </DataGridToolbarActions>
          </DataGridToolbar>
        ) : null}
        <DataGridActiveFilters searchPrefix="Search"/>

        <Designs.Table
          enablePagination
          defaultRowsPerPage={25}
          initialSortBy="id"
          initialSortDirection="descending"
          rowsPerPageOptions={[10, 25, 50, 100]}
        >
          <Designs.Column header="Design ID" id="id" sortBy="id" title="Design ID">
            {({ id }) => id}
          </Designs.Column>
          <Designs.Column isRowHeader header="Name" id="name" sortBy="name" title="Name">
            {({ name }) => name}
          </Designs.Column>
          <Designs.Column header="Colors" id="colors" title="Colors">
            {({ id, elements }) => <DesignColorGroup designId={id} elements={elements}/>}
          </Designs.Column>
          <Designs.Column header="Piece Type" id="type" sortBy="pieceType" title="Piece Type">
            {({ pieceType }) => pieceType}
          </Designs.Column>
          <Designs.Column header="Weight" id="weight" title="Weight">
            {({ weight }) => (weight != null ? <FormatWeight weight={weight} unit="auto"/> : '?')}
          </Designs.Column>
        </Designs.Table>
      </div>
    </DataGridFilterRoot>
  );

  if (children) {
    return children(table);
  }

  return table;
};
