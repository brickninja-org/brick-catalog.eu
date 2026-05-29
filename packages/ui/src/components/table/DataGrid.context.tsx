'use client';

import type { AvailableColumn } from './DataGrid.types';
import type { Selection, SortDescriptor } from '@heroui/react';
import type { ReactNode } from 'react';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type DataGridState = {
  id: string,
  interacted: boolean,
  page: number,
  rowsPerPage: number,
  sortDescriptor: SortDescriptor,
};

export interface DataGridActions {
  setState: (
    state: Partial<DataGridState> | ((previousState: DataGridState) => Partial<DataGridState>)
  ) => void,
}

export interface DataGridContextProviderProps {
  actions: DataGridActions,
  children: ReactNode,
  state: DataGridState,
}

export const defaultDataGridState: DataGridState = {
  id: '',
  interacted: false,
  page: 1,
  rowsPerPage: 10,
  sortDescriptor: { column: '', direction: 'ascending' },
};

type DataGridContextValue = {
  actions: DataGridActions,
  state: DataGridState,
};

type DataGridGlobalState = {
  visibleColumnSelections: Record<string, Selection | undefined>,
  availableColumns: Record<string, AvailableColumn[] | undefined>,
};

type DataGridGlobalActions = {
  setVisibleColumnSelection: (id: string, selection: Selection | undefined) => void,
  setAvailableColumns: (id: string, columns: AvailableColumn[]) => void,
  clearGridState: (id: string) => void,
};

type DataGridGlobalValue = {
  actions: DataGridGlobalActions,
  state: DataGridGlobalState,
};

type DataGridSortRegistryState = {
  sortDescriptors: Record<string, SortDescriptor | undefined>,
};

type DataGridSortRegistryActions = {
  setSortDescriptorById: (id: string, sortDescriptor: SortDescriptor | undefined) => void,
};

type DataGridSortRegistryValue = {
  actions: DataGridSortRegistryActions,
  state: DataGridSortRegistryState,
};

const DataGridContext = createContext<DataGridContextValue | null>(null);
DataGridContext.displayName = 'DataGridContext';

const DataGridGlobalContext = createContext<DataGridGlobalValue | null>(null);
DataGridGlobalContext.displayName = 'DataGridGlobalContext';

const DataGridSortRegistryContext = createContext<DataGridSortRegistryValue | null>(null);
DataGridSortRegistryContext.displayName = 'DataGridSortRegistryContext';

export interface DataGridGlobalProps {
  children: ReactNode,
}

export type DataGridRootProps = DataGridGlobalProps;

interface DataGridSortRegistryProviderProps {
  children: ReactNode,
}

function DataGridSortRegistryProvider({ children }: DataGridSortRegistryProviderProps) {
  const [sortDescriptors, setSortDescriptorsInternal] = useState<Record<string, SortDescriptor | undefined>>({});

  const setSortDescriptorById = useCallback<DataGridSortRegistryActions['setSortDescriptorById']>((id, sortDescriptor) => {
    setSortDescriptorsInternal((current) => updateRecordEntry(current, id, sortDescriptor));
  }, []);

  const actions = useMemo<DataGridSortRegistryActions>(() => ({
    setSortDescriptorById,
  }), [setSortDescriptorById]);
  const state = useMemo<DataGridSortRegistryState>(() => ({
    sortDescriptors,
  }), [sortDescriptors]);
  const value = useMemo<DataGridSortRegistryValue>(() => ({
    actions,
    state,
  }), [actions, state]);

  return (
    <DataGridSortRegistryContext.Provider value={value}>
      {children}
    </DataGridSortRegistryContext.Provider>
  );
}

export function DataGridContextProvider({ actions, children, state }: DataGridContextProviderProps) {
  const value = useMemo<DataGridContextValue>(
    () => ({ actions, state }),
    [actions, state],
  );

  return (
    <DataGridContext.Provider value={value}>
      {children}
    </DataGridContext.Provider>
  );
}

export function DataGridGlobalProvider({ children }: DataGridGlobalProps) {
  const [availableColumns, setAvailableColumnsInternal] = useState<Record<string, AvailableColumn[] | undefined>>({});
  const [visibleColumnSelections, setVisibleColumnSelectionsInternal] = useState<Record<string, Selection | undefined>>({});

  const setVisibleColumnSelection = useCallback((id: string, nextSelection: Selection | undefined) => {
    setVisibleColumnSelectionsInternal((current) => updateRecordEntry(current, id, nextSelection));
  }, []);

  const setAvailableColumns = useCallback((id: string, nextColumns: AvailableColumn[]) => {
    setAvailableColumnsInternal((current) => ({
      ...current,
      [id]: nextColumns,
    }));
  }, []);

  const clearGridState = useCallback((id: string) => {
    setAvailableColumnsInternal((current) => removeRecordEntry(current, id));
    setVisibleColumnSelectionsInternal((current) => removeRecordEntry(current, id));
  }, []);

  const stateValue = useMemo<DataGridGlobalState>(() => ({
    availableColumns,
    visibleColumnSelections,
  }), [availableColumns, visibleColumnSelections]);

  const actionsValue = useMemo<DataGridGlobalActions>(() => ({
    clearGridState,
    setAvailableColumns,
    setVisibleColumnSelection,
  }), [clearGridState, setAvailableColumns, setVisibleColumnSelection]);
  const contextValue = useMemo<DataGridGlobalValue>(() => ({
    actions: actionsValue,
    state: stateValue,
  }), [actionsValue, stateValue]);

  return (
    <DataGridGlobalContext.Provider value={contextValue}>
      <DataGridSortRegistryProvider>
        {children}
      </DataGridSortRegistryProvider>
    </DataGridGlobalContext.Provider>
  );
}

export const DataGridProvider = DataGridGlobalProvider;

export function useDataGridState(): DataGridState {
  const value = useContext(DataGridContext);

  if (!value) {
    throw new Error('useDataGridState must be used within DataGridGlobalProvider');
  }

  return value.state;
}

export function useDataGridActions(): DataGridActions {
  const value = useContext(DataGridContext);

  if (!value) {
    throw new Error('useDataGridActions must be used within DataGridGlobalProvider');
  }

  return value.actions;
}

export function useSortDescriptor() {
  const state = useDataGridState();
  const { setState } = useDataGridActions();

  return useMemo(
    () => [state.sortDescriptor, (sortDescriptor: SortDescriptor) => setState({ interacted: true, sortDescriptor })] as const,
    [setState, state.sortDescriptor],
  );
}

export function useDataGridInteracted() {
  const state = useDataGridState();
  const { setState } = useDataGridActions();

  return useMemo(
    () => [state.interacted, (interacted: boolean) => setState({ interacted })] as const,
    [setState, state.interacted],
  );
}

export function useOptionalDataGridInteracted() {
  const value = useContext(DataGridContext);

  return useMemo(
    () => value ? [value.state.interacted, (interacted: boolean) => value.actions.setState({ interacted })] as const : null,
    [value],
  );
}

export function useDataGridSortDescriptorById(id: string, fallbackSortDescriptor?: SortDescriptor) {
  const value = useContext(DataGridSortRegistryContext);

  if (!value) {
    throw new Error('useDataGridSortDescriptorById must be used within DataGridGlobalProvider');
  }

  const sortDescriptor = value.state.sortDescriptors[id] ?? fallbackSortDescriptor;
  const setSortDescriptor = useCallback((nextSortDescriptor: SortDescriptor | undefined) => {
    value.actions.setSortDescriptorById(id, nextSortDescriptor);
  }, [id, value.actions]);

  return useMemo(
    () => ({ setSortDescriptor, sortDescriptor }),
    [setSortDescriptor, sortDescriptor],
  );
}

export function useDataGridGlobalState(): DataGridGlobalState {
  const value = useContext(DataGridGlobalContext);

  if (!value) {
    throw new Error('useDataGridGlobalState must be used within DataGridGlobalProvider');
  }

  return value.state;
}

export function useDataGridGlobalActions(): DataGridGlobalActions {
  const value = useContext(DataGridGlobalContext);

  if (!value) {
    throw new Error('useDataGridGlobalActions must be used within DataGridGlobalProvider');
  }

  return value.actions;
}

function getDefaultVisibleColumnIds(columns: AvailableColumn[]): Set<string> {
  return new Set(
    columns
      .filter((column) => !column.hidden)
      .map((column) => column.id),
  );
}

export function useVisibleColumns(id: string, fallbackColumns?: AvailableColumn[]) {
  const { availableColumns, visibleColumnSelections } = useDataGridGlobalState();
  const { setVisibleColumnSelection } = useDataGridGlobalActions();

  return useMemo(() => {
    const currentAvailableColumns = availableColumns[id] ?? fallbackColumns ?? [];
    const availableColumnIds = new Set(currentAvailableColumns.map((column) => column.id));
    const defaultColumns = getDefaultVisibleColumnIds(currentAvailableColumns);
    const selection = visibleColumnSelections[id];
    const visibleColumns = toVisibleColumnIds({
      availableColumnIds,
      defaultColumns,
      selection,
    });

    const setVisibleColumns = (selection: Selection | undefined) => {
      if (selection === undefined) {
        setVisibleColumnSelection(id, undefined);

        return;
      }

      if (selection === 'all') {
        setVisibleColumnSelection(id, 'all');

        return;
      }

      setVisibleColumnSelection(
        id,
        normalizeVisibleColumnSelection({
          availableColumnIds,
          defaultColumns,
          selection,
        }),
      );
    };

    const resetColumns = () => {
      setVisibleColumnSelection(id, undefined);
    };

    return {
      currentAvailableColumns,
      resetColumns,
      setVisibleColumns,
      visibleColumns,
    };
  }, [availableColumns, fallbackColumns, id, setVisibleColumnSelection, visibleColumnSelections]);
}

function normalizeVisibleColumnSelection({
  availableColumnIds,
  defaultColumns,
  selection,
}: {
  availableColumnIds: Set<string>,
  defaultColumns: Set<string>,
  selection: Exclude<Selection, 'all' | undefined>,
}): Set<string> {
  const normalizedSelection = new Set(
    Array.from(selection, (key) => String(key)).filter((columnId) =>
      availableColumnIds.has(columnId),
    ),
  );

  if (normalizedSelection.size > 0) {
    return normalizedSelection;
  }

  if (defaultColumns.size > 0) {
    return new Set(defaultColumns);
  }

  const firstAvailableColumnId = availableColumnIds.values().next().value;

  return firstAvailableColumnId ? new Set([firstAvailableColumnId]) : new Set();
}

function toVisibleColumnIds({
  availableColumnIds,
  defaultColumns,
  selection,
}: {
  availableColumnIds: Set<string>,
  defaultColumns: Set<string>,
  selection: Selection | undefined,
}): Set<string> {
  if (selection === undefined) {
    return defaultColumns;
  }

  if (selection === 'all') {
    return new Set(availableColumnIds);
  }

  return normalizeVisibleColumnSelection({
    availableColumnIds,
    defaultColumns,
    selection,
  });
}

function updateRecordEntry<T>(
  current: Record<string, T | undefined>,
  id: string,
  nextValue: T | undefined,
): Record<string, T | undefined> {
  if (nextValue !== undefined) {
    return {
      ...current,
      [id]: nextValue,
    };
  }

  return removeRecordEntry(current, id);
}

function removeRecordEntry<T>(
  current: Record<string, T | undefined>,
  id: string,
): Record<string, T | undefined> {
  if (!(id in current)) {
    return current;
  }

  const next = { ...current };

  delete next[id];

  return next;
}
