import 'server-only';

import type {
  AvailableColumn,
  Comparable,
  ComparableProperties,
  DataGridRow,
} from './DataGrid.types';
import type {
  DataGrid as DataGridContract,
  DataGridChild,
  DataGridColumnElement,
  DataGridColumnProps,
  DataGridColumnSelectionElement,
  DataGridColumnSelectionProps,
  DataGridDynamicColumnsElement,
  DataGridDynamicColumnsProps,
  DataGridProps,
  DataGridSortSelectionElement,
  DataGridSortSelectionProps,
  DataGridFooterElement,
  DataGridFooterProps,
} from './DataGridContracts';
import type { Key } from '@heroui/react';
import type { FC, ReactNode } from 'react';

import { isTruthy } from '@brickninja-org/helper/is';
import { Children, isValidElement } from 'react';

import {
  DataGrid,
  DataGridColumnVisibilityMenu,
} from './DataGrid.client';
import { DataGridSortSelection } from './DataGridSortSelection.client';

type DataGridFlatColumn<T> = {
  id: string,
  title: ReactNode,
  hidden?: boolean,
  sortable?: boolean,
  isRowHeader?: boolean,
  className?: string,
  render: (row: T, index: number) => ReactNode,
  sort?: (a: T, b: T, aIndex: number, bIndex: number) => number,
  sortBy?: ComparableProperties<T> | ((row: T) => Comparable),
};

function buildDataGridFlatColumns<T>(
  columns: Array<DataGridColumnElement<T> | DataGridDynamicColumnsElement<T>>,
  isStaticColumn: (child: ReactNode) => child is DataGridColumnElement<T>,
): DataGridFlatColumn<T>[] {
  return columns.flatMap((column) => {
    if (isStaticColumn(column)) {
      return [{
        id: column.props.id,
        title: column.props.title,
        hidden: column.props.hidden,
        sortable: Boolean(column.props.sort || column.props.sortBy),
        isRowHeader: column.props.isRowHeader,
        className: column.props.className,
        render: column.props.children,
        sort: column.props.sort,
        sortBy: column.props.sortBy,
      }];
    }

    return column.props.columns.map((subColumn) => ({
      id: `${column.props.id}.${subColumn.id}`,
      title: subColumn.title,
      hidden: subColumn.hidden,
      sortable: Boolean(subColumn.sort || subColumn.sortBy),
      isRowHeader: subColumn.isRowHeader,
      className: subColumn.className,
      render: subColumn.render,
      sort: subColumn.sort,
      sortBy: subColumn.sortBy,
    }));
  });
}

function toDataGridAvailableColumns<T>(columns: DataGridFlatColumn<T>[]): AvailableColumn[] {
  return columns
    .map((column) => ({
      id: column.id,
      title: column.title,
      hidden: Boolean(column.hidden),
      sortable: Boolean(column.sortable),
      isRowHeader: Boolean(column.isRowHeader),
      className: column.className,
    }));
}

function getDataGridSortableColumns<T>(columns: DataGridFlatColumn<T>[]): DataGridFlatColumn<T>[] {
  return columns.filter((column) => Boolean(column.sort || column.sortBy));
}

function buildDataGridSortRankMaps<T>(
  rows: T[],
  sortableColumns: DataGridFlatColumn<T>[],
): Record<string, Map<number, number>> {
  return Object.fromEntries(
    sortableColumns.map((column) => {
      const compareFn = column.sort ?? sortBy(column.sortBy!);
      const sortedIndices = rows
        .map((row, index) => ({ row, index }))
        .toSorted((a, b) => {
          const result = compareFn(a.row, b.row, a.index, b.index);

          if (result === 0) {
            return compare(a.index, b.index);
          }

          return result;
        })
        .map(({ index }) => index);

      const rankMap = new Map<number, number>();

      sortedIndices.forEach((rowIndex, rank) => {
        rankMap.set(rowIndex, rank);
      });

      return [column.id, rankMap] as const;
    }),
  );
}

function buildDataGridClientRows<T>(
  rows: T[],
  flatColumns: DataGridFlatColumn<T>[],
  sortableColumns: DataGridFlatColumn<T>[],
  sortRankMaps: Record<string, Map<number, number>>,
  getRowKey: (row: T, index: number) => Key,
): DataGridRow[] {
  return rows.map((row, index) => ({
    key: getRowKey(row, index),
    originalIndex: index,
    cells: Object.fromEntries(
      flatColumns.map((column) => [column.id, column.render(row, index)]),
    ),
    sortRanks: Object.fromEntries(
      sortableColumns.map((column) => [
        column.id,
        sortRankMaps[column.id]?.get(index),
      ]),
    ),
  }));
}

function compare<T extends Comparable>(a: T, b: T): number {
  if (a == null) {
    if (b == null) {
      return 0;
    }

    return 1;
  }

  if (b == null) {
    return -1;
  }

  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return a < b ? -1 : a > b ? 1 : 0;
  }

  if (typeof a === 'bigint' && typeof b === 'bigint') {
    return a < b ? -1 : a > b ? 1 : 0;
  }

  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return Number(a) - Number(b);
  }

  if (a instanceof Date && b instanceof Date) {
    return a.valueOf() - b.valueOf();
  }

  throw new Error(`Cannot compare ${typeof a} and ${typeof b}`);
}

function sortBy<T>(
  by: ComparableProperties<T> | ((x: T) => Comparable),
): (a: T, b: T) => number {
  return typeof by === 'function'
    ? (a, b) => compare(by(a), by(b))
    : (a, b) => compare(a[by] as Comparable, b[by] as Comparable);
}

type NormalizedDataGridContent<T> = {
  columnDefinitions: Array<DataGridColumnElement<T> | DataGridDynamicColumnsElement<T>>,
  footer?: ReactNode,
};

function createDataGridStructure<T>(
  rows: T[],
  getRowKey: (row: T, index: number) => Key,
): DataGridContract<T> {
  const dataGridId = crypto.randomUUID();

  const Column: FC<DataGridColumnProps<T>> = () => {
    throw new Error('Only use DataGrid.Column inside of DataGrid.Table');
  };

  const DynamicColumns: FC<DataGridDynamicColumnsProps<T>> = () => {
    throw new Error('Only use DataGrid.DynamicColumns inside of DataGrid.Table');
  };

  const ColumnSelection: FC<DataGridColumnSelectionProps> = ({
    buttonLabel,
    dropdownProps,
    menuLabel,
    menuProps,
    reset,
    children,
  }) => (
    <DataGridColumnVisibilityMenu
      buttonLabel={buttonLabel}
      dropdownProps={dropdownProps}
      id={dataGridId}
      menuLabel={menuLabel}
      menuProps={menuProps}
      reset={reset}
    >
      {children}
    </DataGridColumnVisibilityMenu>
  );

  const SortSelection: FC<DataGridSortSelectionProps> = ({ children, label }) => (
    <DataGridSortSelection
      id={dataGridId}
      label={label}
    >
      {children}
    </DataGridSortSelection>
  );

  const Footer: FC<DataGridFooterProps> = ({ children }) => children;

  function isStaticColumn(child: ReactNode): child is DataGridColumnElement<T> {
    return isValidElement(child) && child.type === Column;
  }

  function isDynamicColumn(child: ReactNode): child is DataGridDynamicColumnsElement<T> {
    return isValidElement(child) && child.type === DynamicColumns;
  }

  function isColumnSelection(child: ReactNode): child is DataGridColumnSelectionElement {
    return isValidElement(child) && child.type === ColumnSelection;
  }

  function isFooter(child: ReactNode): child is DataGridFooterElement {
    return isValidElement(child) && child.type === Footer;
  }

  function isSortSelection(child: ReactNode): child is DataGridSortSelectionElement {
    return isValidElement(child) && child.type === SortSelection;
  }

  function isSupportedChild(child: ReactNode): child is DataGridChild<T> {
    return isStaticColumn(child)
      || isDynamicColumn(child)
      || isColumnSelection(child)
      || isSortSelection(child)
      || isFooter(child);
  }

  function normalizeTableChildren(children: DataGridProps<T>['children']): NormalizedDataGridContent<T> {
    const normalizedChildren = Children.toArray(children).filter(isTruthy);

    if (normalizedChildren.some((child) => !isSupportedChild(child))) {
      throw new Error('DataGrid only supports DataGrid.Column, DataGrid.DynamicColumns, DataGrid.ColumnSelection, DataGrid.SortSelection, and DataGrid.Footer children');
    }

    return {
      columnDefinitions: normalizedChildren.filter(
        (child): child is DataGridColumnElement<T> | DataGridDynamicColumnsElement<T> =>
          isStaticColumn(child) || isDynamicColumn(child),
      ),
      footer: normalizedChildren.find(isFooter)?.props.children,
    };
  }

  const TableComponent = function DataGridTable({
    children,
    collapsed,
    initialSortBy,
    initialSortDirection,
    ...props
  }: DataGridProps<T>) {
    const { columnDefinitions, footer } = normalizeTableChildren(children);
    const flatColumns = buildDataGridFlatColumns(columnDefinitions, isStaticColumn);
    const availableColumns = toDataGridAvailableColumns(flatColumns);
    const sortableColumns = getDataGridSortableColumns(flatColumns);
    const sortRankMaps = buildDataGridSortRankMaps(rows, sortableColumns);
    const clientRows: DataGridRow[] = buildDataGridClientRows(rows, flatColumns, sortableColumns, sortRankMaps, getRowKey);

    return (
      <div className="flex w-full max-w-none flex-col gap-3 p-0">
        <DataGrid
          ariaLabel={props.ariaLabel ?? 'Data Table'}
          collapsed={collapsed}
          collapsedToggleLabel={props.collapsedToggleLabel}
          columns={availableColumns}
          defaultPage={props.defaultPage}
          defaultRowsPerPage={props.defaultRowsPerPage}
          defaultSelectedKeys={props.defaultSelectedKeys}
          emptyState={props.emptyState}
          enableInfiniteLoading={props.enableInfiniteLoading}
          enablePagination={props.enablePagination}
          footer={footer}
          hasMore={props.hasMore}
          id={dataGridId}
          initialSortBy={initialSortBy}
          initialSortDirection={initialSortDirection}
          page={props.page}
          rows={clientRows}
          rowsPerPage={props.rowsPerPage}
          rowsPerPageOptions={props.rowsPerPageOptions}
          selectedKeys={props.selectedKeys}
          selectionBehavior={props.selectionBehavior}
          selectionMode={props.selectionMode}
          showSelectionCheckboxes={props.showSelectionCheckboxes}
          sortDescriptor={props.sortDescriptor}
          variant={props.variant}
          onLoadMore={props.onLoadMore}
          onPageChange={props.onPageChange}
          onRowsPerPageChange={props.onRowsPerPageChange}
          onSelectionChange={props.onSelectionChange}
          onSortDescriptorChange={props.onSortDescriptorChange}
        />
      </div>
    );
  };

  return {
    Table: TableComponent,
    Column,
    DynamicColumns,
    ColumnSelection,
    SortSelection,
    Footer,
  };
}

export function createDataGrid<T>(
  rows: T[],
  getRowKey: (row: T, index: number) => Key,
): DataGridContract<T> {
  return createDataGridStructure(rows, getRowKey);
}
