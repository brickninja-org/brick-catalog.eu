import type { DataGridRow, AvailableColumn } from './DataGrid.types';
import type { SortDescriptor } from '@heroui/react';

export interface DataGridRenderModel {
  hasCollapsedRows: boolean,
  visibleColumns: AvailableColumn[],
  visibleRows: DataGridRow[],
  totalRowCount: number,
}

export function buildDataGridRenderModel({
  collapsed,
  columns,
  interacted,
  rows,
  sortDescriptor,
  visibleRowIndices,
  visibleColumnIds,
}: {
  collapsed?: boolean | number,
  columns: AvailableColumn[],
  interacted: boolean,
  rows: DataGridRow[],
  sortDescriptor: SortDescriptor,
  visibleRowIndices?: number[],
  visibleColumnIds: Set<string>,
}): DataGridRenderModel {
  const visibleColumns = columns.filter((column) => visibleColumnIds.has(column.id));
  const filteredRows = filterRowsByVisibility(rows, visibleRowIndices);
  const sortedRows = sortRows(filteredRows, sortDescriptor);
  const collapsedLimit = getCollapsedRowLimit(collapsed);
  const hasCollapsedRows = collapsedLimit !== undefined && sortedRows.length > collapsedLimit && !interacted;
  const visibleRows = hasCollapsedRows
    ? sortedRows.slice(0, collapsedLimit)
    : sortedRows;

  return {
    hasCollapsedRows,
    totalRowCount: sortedRows.length,
    visibleColumns,
    visibleRows,
  };
}

function filterRowsByVisibility(rows: DataGridRow[], visibleRowIndices?: number[]): DataGridRow[] {
  if (visibleRowIndices === undefined) {
    return rows;
  }

  const visibleRowIndexSet = new Set(visibleRowIndices);

  return rows.filter((row) => visibleRowIndexSet.has(row.originalIndex));
}

function sortRows(rows: DataGridRow[], sortDescriptor: SortDescriptor): DataGridRow[] {
  const activeColumnId = sortDescriptor.column != null ? String(sortDescriptor.column) : '';

  if (!activeColumnId) {
    return rows;
  }

  const hasSortRanks = rows.some((row) => row.sortRanks[activeColumnId] !== undefined);

  if (!hasSortRanks) {
    return rows;
  }

  return [...rows].sort((a, b) => {
    const aRank = a.sortRanks[activeColumnId];
    const bRank = b.sortRanks[activeColumnId];
    const safeARank = aRank ?? Number.MAX_SAFE_INTEGER;
    const safeBRank = bRank ?? Number.MAX_SAFE_INTEGER;
    const result = safeARank - safeBRank;

    if (result === 0) {
      return a.originalIndex - b.originalIndex;
    }

    return sortDescriptor.direction === 'descending' ? -result : result;
  });
}

function getCollapsedRowLimit(collapsed?: boolean | number): number | undefined {
  if (collapsed === true) {
    return 10;
  }

  return typeof collapsed === 'number' ? collapsed : undefined;
}
