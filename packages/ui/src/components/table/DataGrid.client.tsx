'use client';

import type { DataGridActions, DataGridState } from './DataGrid.context';
import type { DataGridProps } from './DataGrid.types';
import type { SortDescriptor } from '@heroui/react';
import type { FC } from 'react';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DataGridContextProvider,
  defaultDataGridState,
  useDataGridGlobalActions,
  useDataGridSortDescriptorById,
} from './DataGrid.context';
import { DataGridClientTable } from './DataGridTable.client';

export type {
  DataGridColumnSelectionDropdownProps,
  DataGridColumnSelectionMenuProps,
  DataGridOnSelectionChange,
  DataGridRow,
  DataGridSelection,
  DataGridSelectionBehavior,
  DataGridSelectionMode,
  DataGridVariant,
} from './DataGrid.types';
export type { DataGridProps };

export type { DataGridColumnVisibilityMenuProps } from './DataGridColumnVisibilityMenu.client';
export { DataGridColumnVisibilityMenu } from './DataGridColumnVisibilityMenu.client';

export const DataGrid: FC<DataGridProps> = ({
  id,
  columns,
  rows,
  footer,
  collapsed,
  initialSortBy,
  initialSortDirection = 'ascending',
  sortDescriptor: controlledSortDescriptor,
  onSortDescriptorChange,
  variant,
  selectionMode,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  selectionBehavior,
  showSelectionCheckboxes,
  ariaLabel,
  emptyState,
  collapsedToggleLabel,
  enableInfiniteLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  enablePagination,
  page,
  defaultPage,
  onPageChange,
  rowsPerPage,
  defaultRowsPerPage,
  rowsPerPageOptions,
  onRowsPerPageChange,
}) => {
  const resolvedInitialSortColumn = getInitialSortColumn({
    columns,
    controlledSortDescriptor,
    initialSortBy,
  });

  const [state, setStateInternal] = useState<DataGridState>(() => ({
    ...defaultDataGridState,
    id,
    page: defaultPage ?? defaultDataGridState.page,
    rowsPerPage: defaultRowsPerPage ?? defaultDataGridState.rowsPerPage,
    sortDescriptor: {
      column: controlledSortDescriptor?.column ?? resolvedInitialSortColumn,
      direction: controlledSortDescriptor?.direction ?? initialSortDirection,
    },
  }));

  const { clearGridState, setAvailableColumns } = useDataGridGlobalActions();
  const {
    sortDescriptor: globalSortDescriptor,
    setSortDescriptor: setGlobalSortDescriptor,
  } = useDataGridSortDescriptorById(id);

  const setState = useCallback<DataGridActions['setState']>((update) => {
    setStateInternal((currentState) => ({
      ...currentState,
      ...(typeof update === 'function' ? update(currentState) : update),
    }));
  }, []);

  useEffect(
    () => {
      setAvailableColumns(id, columns);

      return () => {
        clearGridState(id);
        setGlobalSortDescriptor(undefined);
      };
    },
    [clearGridState, columns, id, setAvailableColumns, setGlobalSortDescriptor],
  );

  useEffect(() => {
    if (globalSortDescriptor === undefined) {
      setGlobalSortDescriptor(state.sortDescriptor);
    }
  }, [globalSortDescriptor, setGlobalSortDescriptor, state.sortDescriptor]);

  useEffect(() => {
    if (controlledSortDescriptor !== undefined) {
      setGlobalSortDescriptor(controlledSortDescriptor);
    }
  }, [controlledSortDescriptor, setGlobalSortDescriptor]);

  const activeSortDescriptor = controlledSortDescriptor ?? globalSortDescriptor ?? state.sortDescriptor;

  const handleSortDescriptorChange = useCallback((nextSortDescriptor: SortDescriptor) => {
    setState({ interacted: true, sortDescriptor: nextSortDescriptor });
    setGlobalSortDescriptor(nextSortDescriptor);
    onSortDescriptorChange?.(nextSortDescriptor);
  }, [onSortDescriptorChange, setGlobalSortDescriptor, setState]);

  const actions = useMemo<DataGridActions>(
    () => ({ setState }),
    [setState],
  );

  const contextState = useMemo<DataGridState>(() => ({
    ...state,
    page: page ?? state.page,
    rowsPerPage: rowsPerPage ?? state.rowsPerPage,
    sortDescriptor: activeSortDescriptor,
  }), [activeSortDescriptor, page, rowsPerPage, state]);

  return (
    <DataGridContextProvider actions={actions} state={contextState}>
      <DataGridClientTable
        ariaLabel={ariaLabel}
        collapsed={collapsed}
        collapsedToggleLabel={collapsedToggleLabel}
        columns={columns}
        defaultSelectedKeys={defaultSelectedKeys}
        emptyState={emptyState}
        enableInfiniteLoading={enableInfiniteLoading}
        enablePagination={enablePagination}
        footer={footer}
        hasMore={hasMore}
        id={id}
        isLoadingMore={isLoadingMore}
        page={page}
        rows={rows}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        selectedKeys={selectedKeys}
        selectionBehavior={selectionBehavior}
        selectionMode={selectionMode}
        showSelectionCheckboxes={showSelectionCheckboxes}
        variant={variant}
        onLoadMore={onLoadMore}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onSelectionChange={onSelectionChange}
        onSortDescriptorChange={handleSortDescriptorChange}
      />
    </DataGridContextProvider>
  );
};

function getInitialSortColumn({
  columns,
  controlledSortDescriptor,
  initialSortBy,
}: {
  columns: DataGridProps['columns'],
  controlledSortDescriptor?: DataGridProps['sortDescriptor'],
  initialSortBy?: DataGridProps['initialSortBy'],
}): string {
  const controlledSortColumn = controlledSortDescriptor?.column;

  if (controlledSortColumn != null && String(controlledSortColumn).length > 0) {
    return String(controlledSortColumn);
  }

  if (initialSortBy && initialSortBy.length > 0) {
    return initialSortBy;
  }

  const firstVisibleSortableColumn = columns.find((column) => column.sortable && !column.hidden);

  if (firstVisibleSortableColumn) {
    return firstVisibleSortableColumn.id;
  }

  return columns.find((column) => column.sortable)?.id ?? '';
}
