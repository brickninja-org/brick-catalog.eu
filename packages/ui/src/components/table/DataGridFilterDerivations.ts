import type { DataGridFilterSearchIndex } from './DataGridFilter';
import type {
  DataGridActiveFilter,
  DataGridFilterId,
  DataGridFilterOption,
  DataGridFilterOptionMap,
  FilterMode,
} from './DataGridFilterContracts';
import type { Key, Selection } from '@heroui/react';

import { isDefined } from '@brickninja-org/helper/is';

export function buildFilterOptionMap(filters: DataGridFilterOption[]): DataGridFilterOptionMap {
  return new Map(filters.map(({ id, ...option }) => [id, option]));
}

export function getAllFilterIds(filters: DataGridFilterOption[]): DataGridFilterId[] {
  return filters.map(({ id }) => id);
}

export function getDefaultSelectedFilterKeys(filterMode: FilterMode): Selection {
  return filterMode === 'or' ? 'all' : new Set();
}

export function toggleFilterIdInSelection({
  allFilterIds,
  filterId,
  selectedFilterKeys,
}: {
  allFilterIds: DataGridFilterId[],
  filterId: DataGridFilterId,
  selectedFilterKeys: Selection,
}): Selection {
  const currentSelectedIds = resolveSelectedFilterIdsFromSelection({
    allFilterIds,
    selectedFilterKeys,
  });

  if (currentSelectedIds.includes(filterId)) {
    return new Set(currentSelectedIds.filter((id) => id !== filterId));
  }

  return new Set([...currentSelectedIds, filterId]);
}

export function resolveSelectedFilterIdsFromSelection({
  allFilterIds,
  selectedFilterKeys,
}: {
  allFilterIds: DataGridFilterId[],
  selectedFilterKeys: Selection,
}): DataGridFilterId[] {
  if (selectedFilterKeys === 'all') {
    return [...allFilterIds];
  }

  const selectedKeySet = new Set(Array.from(selectedFilterKeys, (key) => key as DataGridFilterId));

  return allFilterIds.filter((id) => selectedKeySet.has(id));
}

export function getActiveFilterCount({
  allFilterIds,
  filterMode,
  selectedFilterIds,
}: {
  allFilterIds: DataGridFilterId[],
  filterMode: FilterMode,
  selectedFilterIds: DataGridFilterId[],
}): number {
  if (filterMode === 'or') {
    return selectedFilterIds.length === allFilterIds.length ? 0 : selectedFilterIds.length;
  }

  return selectedFilterIds.length;
}

export function hasActiveSearchQuery(searchQuery: string): boolean {
  return searchQuery.trim().length > 0;
}

export function hasActiveFilterSelection({
  allFilterIds,
  filterMode,
  selectedFilterIds,
}: {
  allFilterIds: DataGridFilterId[],
  filterMode: FilterMode,
  selectedFilterIds: DataGridFilterId[],
}): boolean {
  if (filterMode === 'or') {
    return selectedFilterIds.length !== allFilterIds.length;
  }

  return selectedFilterIds.length > 0;
}

export function getSelectedFilters({
  filtersById,
  selectedFilterIds,
}: {
  filtersById: DataGridFilterOptionMap,
  selectedFilterIds: DataGridFilterId[],
}): DataGridActiveFilter[] {
  return selectedFilterIds.map((id) => ({
    id,
    label: filtersById.get(id)?.label ?? String(id),
  }));
}

export function normalizeFilterTerm(term: string, language: string): string {
  return term.trim().toLocaleLowerCase(language);
}

export function buildNormalizedSearchEntries({
  language,
  searchIndex,
}: {
  language: string,
  searchIndex?: DataGridFilterSearchIndex,
}): Array<[string, number[]]> | undefined {
  if (searchIndex === undefined) {
    return undefined;
  }

  return Object.entries(searchIndex).map(([term, indexes]) => [
    normalizeFilterTerm(term, language),
    indexes,
  ]);
}

export function getVisibleRowIndicesBySearch({
  normalizedSearchEntries,
  normalizedSearchQuery,
}: {
  normalizedSearchEntries?: Array<[string, number[]]>,
  normalizedSearchQuery: string,
}): number[] | undefined {
  if (normalizedSearchEntries === undefined || normalizedSearchQuery === '') {
    return undefined;
  }

  const rowIndices = normalizedSearchEntries
    .flatMap(([term, indexes]) =>
      term.includes(normalizedSearchQuery) ? indexes : [],
    );

  return toSortedUniqueRowIndices(rowIndices);
}

export function getVisibleRowIndicesByFilter({
  allFilterIds,
  filterMode,
  filtersById,
  selectedFilterIds,
}: {
  allFilterIds: DataGridFilterId[],
  filterMode: FilterMode,
  filtersById: DataGridFilterOptionMap,
  selectedFilterIds: DataGridFilterId[],
}): number[] | undefined {
  if (filterMode === 'or') {
    if (selectedFilterIds.length === allFilterIds.length) {
      return undefined;
    }

    return toSortedUniqueRowIndices(
      selectedFilterIds.flatMap((id) => filtersById.get(id)?.rowIndices ?? []),
    );
  }

  if (selectedFilterIds.length === 0) {
    return undefined;
  }

  return reduceOrUndefined(
    selectedFilterIds.map((id) => filtersById.get(id)?.rowIndices).filter(isDefined),
    (common, indexes) => {
      const indexSet = new Set(indexes);

      return common.filter((index) => indexSet.has(index));
    },
  );
}

export function mergeVisibleRowIndices({
  visibleRowIndicesBySearch,
  visibleRowIndicesByFilter,
}: {
  visibleRowIndicesBySearch?: number[] | undefined,
  visibleRowIndicesByFilter?: number[] | undefined,
}): number[] | undefined {
  if (visibleRowIndicesBySearch === undefined && visibleRowIndicesByFilter === undefined) {
    return undefined;
  }

  if (visibleRowIndicesBySearch === undefined) {
    return visibleRowIndicesByFilter;
  }

  if (visibleRowIndicesByFilter === undefined) {
    return visibleRowIndicesBySearch;
  }

  const visibleByFilter = new Set(visibleRowIndicesByFilter);

  return visibleRowIndicesBySearch.filter((index) => visibleByFilter.has(index));
}

/** Returns `undefined` if rows is empty, otherwise applies the reducer */
function reduceOrUndefined<T>(rows: T[], reducer: (prev: T, current: T) => T) {
  return rows.length > 0 ? rows.reduce(reducer) : undefined;
}

function toSortedUniqueRowIndices(indexes: number[]): number[] {
  return Array.from(new Set(indexes)).sort((a, b) => a - b);
}
