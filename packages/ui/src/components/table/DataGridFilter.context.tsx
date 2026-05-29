'use client';

import type {
  DataGridFilterActions,
  DataGridFilterContextProviderProps,
  DataGridFilterId,
  DataGridFilterOption,
  DataGridFilterOptionMap,
  DataGridFilterRootProps,
  DataGridFilterState,
  DataGridFilterValue,
  FilterMode as DataGridFilterMode,
} from './DataGridFilterContracts';
import type { FC } from 'react';
import type { Selection } from '@heroui/react';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  getSelectedFilters,
  hasActiveFilterSelection,
  hasActiveSearchQuery,
  toggleFilterIdInSelection,
  buildNormalizedSearchEntries,
  getActiveFilterCount,
  getDefaultSelectedFilterKeys,
  buildFilterOptionMap,
  getAllFilterIds,
  getVisibleRowIndicesByFilter,
  getVisibleRowIndicesBySearch,
  mergeVisibleRowIndices,
  normalizeFilterTerm,
  resolveSelectedFilterIdsFromSelection,
} from './DataGridFilterDerivations';

export type {
  DataGridFilterActions,
  DataGridFilterContextProviderProps,
  DataGridFilterId,
  DataGridFilterOption,
  DataGridFilterOptionMap,
  DataGridFilterRootProps,
  DataGridFilterState,
  DataGridFilterValue,
  DataGridFilterMode,
};

const DataGridFilterContext = createContext<DataGridFilterValue | null>(null);
DataGridFilterContext.displayName = 'DataGridFilterContext';

export function DataGridFilterContextProvider({ actions, children, state }: DataGridFilterContextProviderProps) {
  const value = useMemo<DataGridFilterValue>(
    () => ({ actions, state }),
    [actions, state],
  );

  return (
    <DataGridFilterContext.Provider value={value}>
      {children}
    </DataGridFilterContext.Provider>
  );
}

export const DataGridFilterRoot: FC<DataGridFilterRootProps> = ({
  children,
  filters,
  filterMode = 'or',
  searchIndex,
  language,
}) => {
  const { allFilterIds, allFilterIdSet, filtersById } = useFilterCatalog(filters);
  const { clearSearchQuery, searchQuery, setSearchQuery } = useSearchQueryState();
  const {
    clearSelection,
    removeFilterId,
    resetSelectedFilters,
    selectedFilterIds,
    selectedFilterKeys,
    setSelectedFilterKeys,
    toggleFilterId,
  } = useFilterSelectionState({
    allFilterIds,
    allFilterIdSet,
    filterMode,
  });

  const {
    activeFilterCount,
    hasActiveCriteria,
    hasActiveSearch,
    hasActiveSelection,
    selectedFilters,
    visibleRowIndices,
  } = useDerivedFilterState({
    allFilterIds,
    filterMode,
    filtersById,
    language,
    searchIndex,
    searchQuery,
    selectedFilterIds,
  });

  const clearAll = useCallback(() => {
    clearSearchQuery();
    clearSelection();
  }, [clearSearchQuery, clearSelection]);

  const stateValue = useMemo<DataGridFilterState>(() => ({
    activeFilterCount,
    allFilterIds,
    filterMode,
    filtersById,
    hasActiveCriteria,
    hasActiveSearch,
    hasActiveSelection,
    searchIndex,
    searchQuery,
    selectedFilterIds,
    selectedFilterKeys,
    selectedFilters,
    visibleRowIndices,
  }), [
    activeFilterCount,
    allFilterIds,
    filterMode,
    filtersById,
    hasActiveCriteria,
    hasActiveSearch,
    hasActiveSelection,
    searchIndex,
    searchQuery,
    selectedFilterIds,
    selectedFilterKeys,
    selectedFilters,
    visibleRowIndices,
  ]);

  const actionsValue = useMemo<DataGridFilterActions>(() => ({
    clearAll,
    clearSearchQuery,
    removeFilterId,
    resetSelectedFilters,
    setSearchQuery,
    setSelectedFilterKeys,
    toggleFilterId,
  }), [clearAll, clearSearchQuery, removeFilterId, resetSelectedFilters, setSearchQuery, setSelectedFilterKeys, toggleFilterId]);

  return (
    <DataGridFilterContextProvider actions={actionsValue} state={stateValue}>
      {children}
    </DataGridFilterContextProvider>
  );
};

export function useDataGridFilterState(): DataGridFilterState {
  const value = useContext(DataGridFilterContext);

  if (!value) {
    throw new Error('`useDataGridFilterState` must be used within `DataGridFilterRoot`');
  }

  return value.state;
}

export function useDataGridFilterActions(): DataGridFilterActions {
  const value = useContext(DataGridFilterContext);

  if (!value) {
    throw new Error('`useDataGridFilterActions` must be used within `DataGridFilterRoot`');
  }

  return value.actions;
}

export function useDataGridFilter(): DataGridFilterValue {
  const value = useContext(DataGridFilterContext);

  if (!value) {
    throw new Error('`useDataGridFilter` must be used within `DataGridFilterRoot`');
  }

  return value;
}

export function useOptionalDataGridFilterState(): DataGridFilterState | null {
  return useContext(DataGridFilterContext)?.state ?? null;
}

export function useOptionalDataGridFilterActions(): DataGridFilterActions | null {
  return useContext(DataGridFilterContext)?.actions ?? null;
}

function useFilterCatalog(filters: DataGridFilterOption[]) {
  const filtersById = useMemo<DataGridFilterOptionMap>(
    () => buildFilterOptionMap(filters),
    [filters],
  );
  const allFilterIds = useMemo<DataGridFilterId[]>(
    () => getAllFilterIds(filters),
    [filters],
  );
  const allFilterIdSet = useMemo(() => new Set(allFilterIds), [allFilterIds]);

  return {
    allFilterIds,
    allFilterIdSet,
    filtersById,
  };
}

function useSearchQueryState() {
  const [searchQuery, setSearchQueryInternal] = useState('');

  const setSearchQuery = useCallback((nextQuery: string) => {
    setSearchQueryInternal((currentQuery) => currentQuery === nextQuery ? currentQuery : nextQuery);
  }, []);

  const clearSearchQuery = useCallback(() => {
    setSearchQueryInternal('');
  }, []);

  return {
    clearSearchQuery,
    searchQuery,
    setSearchQuery,
  };
}

function useFilterSelectionState({
  allFilterIds,
  allFilterIdSet,
  filterMode,
}: {
  allFilterIds: DataGridFilterId[],
  allFilterIdSet: Set<DataGridFilterId>,
  filterMode: DataGridFilterMode,
}) {
  const [selectedFilterKeys, setSelectedFilterKeysInternal] = useState<DataGridFilterState['selectedFilterKeys']>(
    () => getDefaultSelectedFilterKeys(filterMode),
  );

  useEffect(() => {
    setSelectedFilterKeysInternal((currentSelectedFilterKeys) => {
      const normalizedSelection = normalizeSelectedFilterKeys({
        allFilterIds,
        filterMode,
        selectedFilterKeys: currentSelectedFilterKeys,
      });

      return areSelectionsEqual(normalizedSelection, currentSelectedFilterKeys)
        ? currentSelectedFilterKeys
        : normalizedSelection;
    });
  }, [allFilterIds, filterMode]);

  const selectedFilterIds = useMemo<DataGridFilterId[]>(() => resolveSelectedFilterIdsFromSelection({
    allFilterIds,
    selectedFilterKeys,
  }), [allFilterIds, selectedFilterKeys]);

  const setSelectedFilterKeys = useCallback<DataGridFilterActions['setSelectedFilterKeys']>((nextSelectedFilterKeys) => {
    setSelectedFilterKeysInternal(normalizeSelectedFilterKeys({
      allFilterIds,
      filterMode,
      selectedFilterKeys: nextSelectedFilterKeys,
    }));
  }, [allFilterIds, filterMode]);

  const clearSelection = useCallback(() => {
    setSelectedFilterKeysInternal(getDefaultSelectedFilterKeys(filterMode));
  }, [filterMode]);

  const toggleFilterId = useCallback<DataGridFilterActions['toggleFilterId']>((filterId) => {
    if (!allFilterIdSet.has(filterId)) {
      return;
    }

    setSelectedFilterKeysInternal((currentSelectedFilterKeys) => toggleFilterIdInSelection({
      allFilterIds,
      filterId,
      selectedFilterKeys: currentSelectedFilterKeys,
    }));
  }, [allFilterIdSet, allFilterIds]);

  const removeFilterId = useCallback<DataGridFilterActions['removeFilterId']>((filterId) => {
    if (!allFilterIdSet.has(filterId)) {
      return;
    }

    setSelectedFilterKeysInternal((currentSelectedFilterKeys) => {
      const currentSelectedFilterIds = resolveSelectedFilterIdsFromSelection({
        allFilterIds,
        selectedFilterKeys: currentSelectedFilterKeys,
      });

      return new Set(currentSelectedFilterIds.filter((id) => id !== filterId));
    });
  }, [allFilterIdSet, allFilterIds]);

  return {
    clearSelection,
    removeFilterId,
    resetSelectedFilters: clearSelection,
    selectedFilterIds,
    selectedFilterKeys,
    setSelectedFilterKeys,
    toggleFilterId,
  };
}

function useDerivedFilterState({
  allFilterIds,
  filterMode,
  filtersById,
  language,
  searchIndex,
  searchQuery,
  selectedFilterIds,
}: {
  allFilterIds: DataGridFilterId[],
  filterMode: DataGridFilterMode,
  filtersById: DataGridFilterOptionMap,
  language: string,
  searchIndex?: DataGridFilterRootProps['searchIndex'],
  searchQuery: string,
  selectedFilterIds: DataGridFilterId[],
}) {
  const normalizedSearchEntries = useMemo(
    () => buildNormalizedSearchEntries({
      language,
      searchIndex,
    }),
    [language, searchIndex],
  );
  const normalizedSearchQuery = normalizeFilterTerm(searchQuery, language);

  const visibleRowIndicesBySearch = useMemo(() => {
    return getVisibleRowIndicesBySearch({
      normalizedSearchEntries,
      normalizedSearchQuery,
    });
  }, [normalizedSearchEntries, normalizedSearchQuery]);

  const visibleRowIndicesByFilter = useMemo(() => {
    return getVisibleRowIndicesByFilter({
      allFilterIds,
      filterMode,
      filtersById,
      selectedFilterIds,
    });
  }, [allFilterIds, filterMode, filtersById, selectedFilterIds]);

  const visibleRowIndices = useMemo(() => {
    return mergeVisibleRowIndices({
      visibleRowIndicesByFilter,
      visibleRowIndicesBySearch,
    });
  }, [visibleRowIndicesByFilter, visibleRowIndicesBySearch]);

  const activeFilterCount = useMemo(
    () => getActiveFilterCount({
      allFilterIds,
      filterMode,
      selectedFilterIds,
    }),
    [allFilterIds, filterMode, selectedFilterIds],
  );
  const hasActiveSearch = hasActiveSearchQuery(searchQuery);
  const hasActiveSelection = hasActiveFilterSelection({
    allFilterIds,
    filterMode,
    selectedFilterIds,
  });
  const selectedFilters = useMemo(
    () => getSelectedFilters({
      filtersById,
      selectedFilterIds,
    }),
    [filtersById, selectedFilterIds],
  );

  return {
    activeFilterCount,
    hasActiveCriteria: hasActiveSearch || hasActiveSelection,
    hasActiveSearch,
    hasActiveSelection,
    selectedFilters,
    visibleRowIndices,
  };
}

function normalizeSelectedFilterKeys({
  allFilterIds,
  filterMode,
  selectedFilterKeys,
}: {
  allFilterIds: DataGridFilterId[],
  filterMode: DataGridFilterMode,
  selectedFilterKeys: Selection,
}): Selection {
  if (selectedFilterKeys === 'all') {
    return filterMode === 'or' ? 'all' : new Set(allFilterIds);
  }

  const normalizedIds = resolveSelectedFilterIdsFromSelection({
    allFilterIds,
    selectedFilterKeys,
  });

  if (filterMode === 'or' && normalizedIds.length === allFilterIds.length) {
    return 'all';
  }

  return new Set(normalizedIds);
}

function areSelectionsEqual(a: Selection, b: Selection): boolean {
  if (a === b) {
    return true;
  }

  if (a === 'all' || b === 'all') {
    return false;
  }

  if (a.size !== b.size) {
    return false;
  }

  for (const key of a) {
    if (!b.has(key)) {
      return false;
    }
  }

  return true;
}
