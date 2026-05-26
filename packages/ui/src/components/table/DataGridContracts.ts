import type {
  DataGridColumnSelectionDropdownProps,
  DataGridColumnSelectionMenuProps,
  DataGridOnSelectionChange,
  DataGridSelection,
  DataGridSelectionBehavior,
  DataGridSelectionMode,
  DataGridVariant,
} from './DataGrid.client';
import type { Comparable, ComparableProperties } from './DataGrid.types';
import type { SortDescriptor } from '@heroui/react';
import type { DataGridColumn as ColumnProps } from '@heroui-pro/react';
import type { FC, ReactElement, ReactNode } from 'react';

export interface DataGridProps<T> {
  children: Array<DataGridChild<T> | false>,
  collapsed?: boolean | number,
  initialSortBy?: string,
  initialSortDirection?: SortDescriptor['direction'],
  sortDescriptor?: SortDescriptor,
  onSortDescriptorChange?: (sortDescriptor: SortDescriptor) => void,
  variant?: DataGridVariant,
  selectionMode?: DataGridSelectionMode,
  selectedKeys?: DataGridSelection,
  defaultSelectedKeys?: DataGridSelection,
  onSelectionChange?: DataGridOnSelectionChange,
  selectionBehavior?: DataGridSelectionBehavior,
  showSelectionCheckboxes?: boolean,
  ariaLabel?: string,
  emptyState?: ReactNode,
  collapsedToggleLabel?: (rowCount: number) => ReactNode,
  enableInfiniteLoading?: boolean,
  hasMore?: boolean,
  onLoadMore?: () => void | Promise<void>,
  enablePagination?: boolean,
  page?: number,
  defaultPage?: number,
  onPageChange?: (page: number) => void,
  rowsPerPage?: number,
  defaultRowsPerPage?: number,
  rowsPerPageOptions?: number[],
  onRowsPerPageChange?: (rowsPerPage: number) => void,
}

export interface DataGridColumnProps<T> extends ColumnProps<T> {
  id: string,
  title: ReactNode,
  children: (row: T, index: number) => ReactNode,
  sort?: (a: T, b: T, aIndex: number, bIndex: number) => number,
  sortBy?: ComparableProperties<T> | ((row: T) => Comparable),
  hidden?: boolean,
  className?: string,
}

export type DataGridDynamicSubColumn<T> = {
  id: string,
  title: ReactNode,
  render: (row: T, index: number) => ReactNode,
  sort?: (a: T, b: T, aIndex: number, bIndex: number) => number,
  sortBy?: ComparableProperties<T> | ((row: T) => Comparable),
  hidden?: boolean,
  isRowHeader?: boolean,
  className?: string,
};

export interface DataGridDynamicColumnsProps<T> {
  id: string,
  columns: DataGridDynamicSubColumn<T>[],
}

export interface DataGridColumnSelectionProps {
  children: ReactNode,
  reset: ReactNode,
  buttonLabel?: string,
  dropdownProps?: DataGridColumnSelectionDropdownProps,
  menuLabel?: string,
  menuProps?: DataGridColumnSelectionMenuProps,
}

export interface DataGridSortSelectionProps {
  children: ReactNode,
  label?: string,
}

export interface DataGridFooterProps {
  children: ReactNode,
}

export type DataGrid<T> = {
  Table: FC<DataGridProps<T>>,
  Column: FC<DataGridColumnProps<T>>,
  DynamicColumns: FC<DataGridDynamicColumnsProps<T>>,
  ColumnSelection: FC<DataGridColumnSelectionProps>,
  SortSelection: FC<DataGridSortSelectionProps>,
  Footer: FC<DataGridFooterProps>,
};

export type DataGridColumnElement<T> = ReactElement<DataGridColumnProps<T>, FC<DataGridColumnProps<T>>>;
export type DataGridDynamicColumnsElement<T> = ReactElement<
  DataGridDynamicColumnsProps<T>,
  FC<DataGridDynamicColumnsProps<T>>
>;
export type DataGridColumnSelectionElement = ReactElement<
  DataGridColumnSelectionProps,
  FC<DataGridColumnSelectionProps>
>;
export type DataGridSortSelectionElement = ReactElement<
  DataGridSortSelectionProps,
  FC<DataGridSortSelectionProps>
>;
export type DataGridFooterElement = ReactElement<DataGridFooterProps, FC<DataGridFooterProps>>;

export type DataGridChild<T> =
  | DataGridColumnElement<T>
  | DataGridDynamicColumnsElement<T>
  | DataGridColumnSelectionElement
  | DataGridSortSelectionElement
  | DataGridFooterElement;
