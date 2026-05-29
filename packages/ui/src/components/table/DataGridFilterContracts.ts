import type { DataGridFilterSearchIndex } from './DataGridFilter';
import type { Selection } from '@heroui/react';
import type { ReactNode } from 'react';

export type FilterMode = 'or' | 'and';
export type DataGridFilterId = number | string;

export interface DataGridFilterOption {
  id: DataGridFilterId,
  label: ReactNode,
  rowIndices: number[],
}

export type DataGridFilterOptionMap = Map<DataGridFilterId, Omit<DataGridFilterOption, 'id'>>;
export type DataGridActiveFilter = Pick<DataGridFilterOption, 'id' | 'label'>;

export interface DataGridFilterState {
  visibleRowIndices?: number[] | undefined,
  filtersById: DataGridFilterOptionMap,
  allFilterIds: DataGridFilterId[],
  filterMode: FilterMode,
  selectedFilterKeys: Selection,
  selectedFilterIds: DataGridFilterId[],
  selectedFilters: DataGridActiveFilter[],
  hasActiveSearch: boolean,
  hasActiveSelection: boolean,
  hasActiveCriteria: boolean,
  activeFilterCount: number,
  searchIndex?: DataGridFilterSearchIndex,
  searchQuery: string,
}

export interface DataGridFilterActions {
  setSelectedFilterKeys: (selectedFilterKeys: Selection) => void,
  toggleFilterId: (filterId: DataGridFilterId) => void,
  removeFilterId: (filterId: DataGridFilterId) => void,
  resetSelectedFilters: () => void,
  setSearchQuery: (query: string) => void,
  clearSearchQuery: () => void,
  clearAll: () => void,
}

export interface DataGridFilterValue {
  actions: DataGridFilterActions,
  state: DataGridFilterState,
}

export interface DataGridFilterRootProps {
  filters: DataGridFilterOption[],
  filterMode?: FilterMode,
  searchIndex?: DataGridFilterSearchIndex,
  children: ReactNode,
  language: string,
}

export interface DataGridFilterContextProviderProps {
  actions: DataGridFilterActions,
  children: ReactNode,
  state: DataGridFilterState,
}
