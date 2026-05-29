'use client';

import type {
  DataGridOnSelectionChange,
  DataGridRow,
  DataGridSelection,
  DataGridSelectionBehavior,
  DataGridSelectionMode,
  DataGridVariant,
  AvailableColumn,
} from './DataGrid.types';
import type { Selection as HeroUISelection, SortDescriptor } from '@heroui/react';
import type { DataGridColumn as HeroUIProDataGridColumn } from '@heroui-pro/react';
import type { FC, ReactNode } from 'react';

import { Button, Dropdown, EmptyState, Label, Pagination, Separator, Spinner } from '@heroui/react';
import { DataGrid as HeroUIProDataGrid } from '@heroui-pro/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  useDataGridActions,
  useDataGridInteracted,
  useSortDescriptor as useDataGridSortDescriptor,
  useDataGridState,
  useVisibleColumns as useDataGridVisibleColumns,
} from './DataGrid.context';
import { useOptionalDataGridFilterState } from './DataGridFilter.context';
import { buildDataGridRenderModel } from './DataGridRenderModel';

export interface DataGridClientTableProps {
  id: string,
  columns: AvailableColumn[],
  rows: DataGridRow[],
  footer?: ReactNode,
  collapsed?: boolean | number,
  ariaLabel?: string,
  onSortDescriptorChange?: (sortDescriptor: SortDescriptor) => void,
  variant?: DataGridVariant,
  selectionMode?: DataGridSelectionMode,
  selectedKeys?: DataGridSelection,
  defaultSelectedKeys?: DataGridSelection,
  onSelectionChange?: DataGridOnSelectionChange,
  selectionBehavior?: DataGridSelectionBehavior,
  showSelectionCheckboxes?: boolean,
  emptyState?: ReactNode,
  collapsedToggleLabel?: (rowCount: number) => ReactNode,
  enableInfiniteLoading?: boolean,
  isLoadingMore?: boolean,
  hasMore?: boolean,
  onLoadMore?: () => void | Promise<void>,
  enablePagination?: boolean,
  page?: number,
  onPageChange?: (page: number) => void,
  rowsPerPage?: number,
  rowsPerPageOptions?: number[],
  onRowsPerPageChange?: (rowsPerPage: number) => void,
}

export const DataGridClientTable: FC<DataGridClientTableProps> = ({
  id,
  columns,
  rows,
  footer,
  collapsed,
  ariaLabel,
  onSortDescriptorChange,
  variant,
  selectionMode,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  selectionBehavior,
  showSelectionCheckboxes,
  emptyState,
  collapsedToggleLabel,
  enableInfiniteLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  enablePagination,
  page: controlledPage,
  onPageChange,
  rowsPerPage: controlledRowsPerPage,
  rowsPerPageOptions,
  onRowsPerPageChange,
}) => {
  const [interacted, setInteracted] = useDataGridInteracted();
  const [sortDescriptor, setSortDescriptor] = useDataGridSortDescriptor();
  const { visibleColumns: visibleColumnIds } = useDataGridVisibleColumns(id, columns);
  const { page: contextPage, rowsPerPage: contextRowsPerPage } = useDataGridState();
  const { setState } = useDataGridActions();
  const filterState = useOptionalDataGridFilterState();
  const [uncontrolledSelectedKeys, setUncontrolledSelectedKeys] = useState<DataGridSelection | undefined>(
    () => defaultSelectedKeys,
  );

  useEffect(() => {
    if (filterState?.visibleRowIndices !== undefined && !interacted) {
      setInteracted(true);
    }
  }, [filterState?.visibleRowIndices, interacted, setInteracted]);

  const handleSortChange = useCallback((nextSortDescriptor: SortDescriptor) => {
    setSortDescriptor(nextSortDescriptor);
    onSortDescriptorChange?.(nextSortDescriptor);
  }, [onSortDescriptorChange, setSortDescriptor]);

  const handlePageChange = useCallback((nextPage: number) => {
    if (controlledPage === undefined) {
      setState({ interacted: true, page: nextPage });
    }

    onPageChange?.(nextPage);
  }, [controlledPage, onPageChange, setState]);

  const handleRowsPerPageChange = useCallback((nextRowsPerPage: number) => {
    if (controlledRowsPerPage === undefined) {
      setState({ interacted: true, page: 1, rowsPerPage: nextRowsPerPage });
    } else if (controlledPage === undefined) {
      setState({ interacted: true, page: 1 });
    }

    onRowsPerPageChange?.(nextRowsPerPage);
    onPageChange?.(1);
  }, [controlledPage, controlledRowsPerPage, onPageChange, onRowsPerPageChange, setState]);

  const safeSortDescriptor = useMemo(
    () => resolveSortDescriptor({
      columns,
      sortDescriptor,
      visibleColumnIds,
    }),
    [columns, sortDescriptor, visibleColumnIds],
  );

  useEffect(() => {
    if (areSortDescriptorsEqual(sortDescriptor, safeSortDescriptor)) {
      return;
    }

    setSortDescriptor(safeSortDescriptor);
    onSortDescriptorChange?.(safeSortDescriptor);
  }, [onSortDescriptorChange, safeSortDescriptor, setSortDescriptor, sortDescriptor]);

  const renderModel = useMemo(
    () => buildDataGridRenderModel({
      collapsed,
      columns,
      interacted,
      rows,
      sortDescriptor: safeSortDescriptor,
      visibleRowIndices: filterState?.visibleRowIndices,
      visibleColumnIds,
    }),
    [collapsed, columns, filterState?.visibleRowIndices, interacted, rows, safeSortDescriptor, visibleColumnIds],
  );

  const currentPage = Math.max(1, controlledPage ?? contextPage);
  const currentRowsPerPage = Math.max(1, controlledRowsPerPage ?? contextRowsPerPage);
  const totalPages = Math.max(1, Math.ceil(renderModel.visibleRows.length / currentRowsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    if (!enablePagination) {
      return renderModel.visibleRows;
    }

    const start = (safePage - 1) * currentRowsPerPage;

    return renderModel.visibleRows.slice(start, start + currentRowsPerPage);
  }, [currentRowsPerPage, enablePagination, renderModel.visibleRows, safePage]);

  const normalizedRowsPerPageOptions = useMemo(() => {
    const candidateOptions = rowsPerPageOptions && rowsPerPageOptions.length > 0
      ? rowsPerPageOptions
      : [10, 25, 50, 100];

    return Array.from(new Set([...candidateOptions, currentRowsPerPage]))
      .filter((value) => value > 0)
      .sort((a, b) => a - b);
  }, [currentRowsPerPage, rowsPerPageOptions]);

  const resolvedSelectedKeys = selectedKeys ?? uncontrolledSelectedKeys;

  const selectionCount = useMemo(() => {
    if (resolvedSelectedKeys === 'all') {
      return renderModel.totalRowCount;
    }

    return resolvedSelectedKeys ? resolvedSelectedKeys.size : 0;
  }, [renderModel.totalRowCount, resolvedSelectedKeys]);

  const columnSignature = useMemo(
    () => renderModel.visibleColumns.map((column) => column.id).join('|'),
    [renderModel.visibleColumns],
  );

  const handleSelectionChange = useCallback((nextSelection: HeroUISelection) => {
    if (selectedKeys === undefined) {
      setUncontrolledSelectedKeys(nextSelection);
    }

    onSelectionChange?.(nextSelection);
  }, [onSelectionChange, selectedKeys]);

  const gridColumns = useMemo<HeroUIProDataGridColumn<DataGridRow>[]>(() => (
    renderModel.visibleColumns.map((column) => ({
      accessorFn: (row: DataGridRow) => row.cells[column.id],
      id: column.id,
      header: column.title,
      allowsSorting: column.sortable,
      isRowHeader: column.isRowHeader,
      sortFn: (a, b) => compareRowsBySortRank(a, b, column.id),
      cell: (row) => row.cells[column.id],
    }))
  ), [renderModel.visibleColumns]);

  useEffect(() => {
    if (!enablePagination || safePage === currentPage) {
      return;
    }

    if (controlledPage === undefined) {
      setState({ interacted: true, page: safePage });
    }

    onPageChange?.(safePage);
  }, [controlledPage, currentPage, enablePagination, onPageChange, safePage, setState]);

  return (
    <div className="flex flex-col gap-3">
      <HeroUIProDataGrid
        key={columnSignature}
        aria-label={ariaLabel ?? 'Data Table'}
        columns={gridColumns}
        data={paginatedRows}
        defaultSelectedKeys={defaultSelectedKeys}
        getRowId={(row) => row.key}
        isLoadingMore={enableInfiniteLoading && hasMore ? isLoadingMore : undefined}
        loadMoreContent={enableInfiniteLoading && hasMore && isLoadingMore ? <Spinner size="sm"/> : null}
        renderEmptyState={() => renderEmptyState(emptyState)}
        selectedKeys={resolvedSelectedKeys}
        selectionBehavior={selectionBehavior}
        selectionMode={selectionMode}
        showSelectionCheckboxes={showSelectionCheckboxes}
        sortDescriptor={safeSortDescriptor}
        variant={variant === 'secondary' ? 'secondary' : 'primary'}
        onSelectionChange={handleSelectionChange}
        onSortChange={handleSortChange}
        onLoadMore={enableInfiniteLoading && hasMore
          ? () => {
              void onLoadMore?.();
            }
          : undefined}
      />

      <DataGridPaginationPanel
        currentPage={safePage}
        enablePagination={enablePagination}
        rowsPerPage={currentRowsPerPage}
        rowsPerPageOptions={normalizedRowsPerPageOptions}
        selectionCount={selectionMode === 'multiple' ? selectionCount : undefined}
        totalPages={totalPages}
        totalRowCount={renderModel.totalRowCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      <DataGridFooterPanel footer={footer}/>

      <DataGridCollapsedToggle
        collapsedToggleLabel={collapsedToggleLabel}
        hasCollapsedRows={renderModel.hasCollapsedRows}
        totalRowCount={renderModel.totalRowCount}
        onExpand={() => setInteracted(true)}
      />
    </div>
  );
};

function resolveSortDescriptor({
  columns,
  sortDescriptor,
  visibleColumnIds,
}: {
  columns: AvailableColumn[],
  sortDescriptor: SortDescriptor,
  visibleColumnIds: Set<string>,
}): SortDescriptor {
  const sortableVisibleColumns = columns.filter((column) => column.sortable && visibleColumnIds.has(column.id));

  if (sortableVisibleColumns.length === 0) {
    return { column: '', direction: sortDescriptor.direction };
  }

  const activeColumnId = sortDescriptor.column != null ? String(sortDescriptor.column) : '';
  const isActiveColumnSortableAndVisible = sortableVisibleColumns.some((column) => column.id === activeColumnId);

  if (isActiveColumnSortableAndVisible) {
    return sortDescriptor;
  }

  return {
    column: sortableVisibleColumns[0]!.id,
    direction: sortDescriptor.direction,
  };
}

function areSortDescriptorsEqual(left: SortDescriptor, right: SortDescriptor): boolean {
  return String(left.column ?? '') === String(right.column ?? '')
    && left.direction === right.direction;
}

function compareRowsBySortRank(a: DataGridRow, b: DataGridRow, columnId: string): number {
  const aRank = a.sortRanks[columnId];
  const bRank = b.sortRanks[columnId];
  const safeARank = aRank ?? Number.MAX_SAFE_INTEGER;
  const safeBRank = bRank ?? Number.MAX_SAFE_INTEGER;
  const result = safeARank - safeBRank;

  if (result === 0) {
    return a.originalIndex - b.originalIndex;
  }

  return result;
}

interface DataGridPaginationPanelProps {
  enablePagination?: boolean,
  currentPage: number,
  totalPages: number,
  rowsPerPage: number,
  rowsPerPageOptions: number[],
  totalRowCount: number,
  selectionCount?: number,
  onPageChange: (page: number) => void,
  onRowsPerPageChange: (rowsPerPage: number) => void,
}

function DataGridPaginationPanel({
  enablePagination,
  currentPage,
  totalPages,
  rowsPerPage,
  rowsPerPageOptions,
  totalRowCount,
  selectionCount,
  onPageChange,
  onRowsPerPageChange,
}: DataGridPaginationPanelProps) {
  if (!enablePagination) {
    return null;
  }

  return (
    <div className="flex items-center justify-between whitespace-nowrap text-xs">
      <Pagination size="sm">
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous
              isDisabled={currentPage === 1}
              onPress={() => onPageChange(Math.max(1, currentPage - 1))}
            >
              <Pagination.PreviousIcon/>
            </Pagination.Previous>
          </Pagination.Item>

          {buildPaginationPages(currentPage, totalPages).map((page, index) =>
            page === 'ellipsis' ? (
              <Pagination.Item key={`ellipsis-${index}`}>
                <Pagination.Ellipsis/>
              </Pagination.Item>
            ) : (
              <Pagination.Item key={page}>
                <Pagination.Link
                  isActive={page === currentPage}
                  onPress={() => onPageChange(page)}
                >
                  {page}
                </Pagination.Link>
              </Pagination.Item>
            ),
          )}

          <Pagination.Item>
            <Pagination.Next
              isDisabled={currentPage === totalPages}
              onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            >
              <Pagination.NextIcon/>
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-muted">Rows per page</span>
          <Dropdown>
            <Button size="sm" variant="secondary">
              {rowsPerPage}
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu
                selectedKeys={new Set([String(rowsPerPage)])}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0];

                  if (!key) {
                    return;
                  }

                  onRowsPerPageChange(Number(key));
                }}
              >
                {rowsPerPageOptions.map((option) => (
                  <Dropdown.Item key={String(option)} id={String(option)} textValue={String(option)}>
                    <Label>{option}</Label>
                    <Dropdown.ItemIndicator/>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>

        {selectionCount !== undefined ? (
          <>
            <Separator className="h-4!" orientation="vertical"/>
            <span className="text-muted">
              {selectionCount} of {totalRowCount} selected
            </span>
          </>
        ) : null}

        <div className="flex gap-2">
          <Button
            isDisabled={currentPage === 1}
            size="sm"
            variant="secondary"
            onPress={() => onPageChange(Math.max(1, currentPage - 1))}
          >
            Previous
          </Button>
          <Button
            isDisabled={currentPage === totalPages}
            size="sm"
            variant="secondary"
            onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function buildPaginationPages(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  const pages: Array<number | 'ellipsis'> = [];

  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page++) {
      pages.push(page);
    }

    return pages;
  }

  pages.push(1);

  if (currentPage > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page++) {
    pages.push(page);
  }

  if (currentPage < totalPages - 2) {
    pages.push('ellipsis');
  }

  pages.push(totalPages);

  return pages;
}

function DataGridFooterPanel({
  footer,
}: {
  footer?: ReactNode,
}) {
  if (!footer) {
    return null;
  }

  return (
    <section aria-label="Table footer" className="rounded-medium border border-divider bg-content2 px-3 py-2">
      {footer}
    </section>
  );
}

function DataGridCollapsedToggle({
  collapsedToggleLabel,
  hasCollapsedRows,
  totalRowCount,
  onExpand,
}: {
  collapsedToggleLabel?: (rowCount: number) => ReactNode,
  hasCollapsedRows: boolean,
  totalRowCount: number,
  onExpand: () => void,
}) {
  if (!hasCollapsedRows) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <Button variant="ghost" onPress={onExpand}>
        {collapsedToggleLabel?.(totalRowCount) ?? `Show all ${totalRowCount} rows`}
      </Button>
    </div>
  );
}

function renderEmptyState(emptyState?: ReactNode) {
  if (emptyState) {
    return emptyState;
  }

  return (
    <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
      <span className="text-sm text-muted">No results found</span>
    </EmptyState>
  );
}
