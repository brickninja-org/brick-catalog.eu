import type { Dropdown, Key, SortDescriptor } from '@heroui/react';
import type { DataGridProps as HeroUIProDataGridProps } from '@heroui-pro/react';
import type { ComponentProps, ReactNode } from 'react';

export type AvailableColumn = {
  id: string,
  title?: ReactNode,
  hidden?: boolean,
  sortable?: boolean,
  isRowHeader?: boolean,
  className?: string,
};

export type Comparable =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | Date;

export type ComparableProperties<T> = {
  [K in keyof T]: T[K] extends Comparable ? K : never;
}[keyof T];

export interface DataGridProps {
  id: string,
  columns: AvailableColumn[],
  rows: DataGridRow[],
  footer?: ReactNode,
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
  isLoadingMore?: boolean,
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

export type DataGridRow = {
  key: Key,
  originalIndex: number,
  cells: Record<string, ReactNode>,
  sortRanks: Record<string, number | undefined>,
};

export type DataGridVariant = HeroUIProDataGridProps<DataGridRow>['variant'];
export type DataGridSelectionMode = HeroUIProDataGridProps<DataGridRow>['selectionMode'];
export type DataGridSelection = HeroUIProDataGridProps<DataGridRow>['selectedKeys'];
export type DataGridOnSelectionChange = HeroUIProDataGridProps<DataGridRow>['onSelectionChange'];
export type DataGridSelectionBehavior = HeroUIProDataGridProps<DataGridRow>['selectionBehavior'];

export type DataGridColumnSelectionDropdownProps = Omit<
  ComponentProps<typeof Dropdown>,
  'children' | 'aria-label'
>;
export type DataGridColumnSelectionMenuProps = Omit<
  ComponentProps<typeof Dropdown.Menu>,
  'children' | 'aria-label' | 'selectedKeys' | 'selectionMode' | 'shouldCloseOnSelect' | 'onSelectionChange'
>;
