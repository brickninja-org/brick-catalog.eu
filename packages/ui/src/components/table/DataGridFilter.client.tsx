'use client';

import type { DataGridFilterId } from './DataGridFilter.context';
import type { ButtonProps, Key, Selection } from '@heroui/react';
import type { ComponentProps, FC, ReactNode } from 'react';

import { Xmark } from '@gravity-ui/icons';
import { Button, Chip, Dropdown, Label, SearchField, Separator } from '@heroui/react';
import { useMemo } from 'react';

import { useOptionalDataGridInteracted } from './DataGrid.context';
import { useDataGridFilter } from './DataGridFilter.context';

type DataGridSearchFieldRootProps = Omit<ComponentProps<typeof SearchField>, 'children' | 'value' | 'onChange'>;
type DataGridFilterTriggerButtonProps = Omit<ButtonProps, 'children' | 'onPress'>;

export interface DataGridSearchFieldProps extends DataGridSearchFieldRootProps {
  placeholder?: string,
  ariaLabel?: string,
}

export interface DataGridFilterTriggerProps {
  label?: ReactNode,
  clearLabel?: ReactNode,
  emptyLabel?: ReactNode,
  allLabel?: ReactNode,
  buttonProps?: DataGridFilterTriggerButtonProps,
  filterIds?: DataGridFilterId[],
  selectionMode?: 'single' | 'multiple',
  renderLabel?: (activeFilterCount: number) => ReactNode,
  title?: ReactNode,
}

export interface DataGridActiveFiltersProps {
  className?: string,
  clearAllLabel?: ReactNode,
  searchPrefix?: ReactNode,
}

export const DataGridSearchField: FC<DataGridSearchFieldProps> = ({
  ariaLabel = 'Search table',
  placeholder = 'Search...',
  ...searchFieldProps
}) => {
  const { actions, state } = useDataGridFilter();
  const optionalInteracted = useOptionalDataGridInteracted();

  return (
    <SearchField
      {...searchFieldProps}
      aria-label={searchFieldProps['aria-label'] ?? ariaLabel}
      value={state.searchQuery}
      onChange={(value) => {
        optionalInteracted?.[1](true);
        actions.setSearchQuery(value);
      }}
    >
      <SearchField.Group>
        <SearchField.SearchIcon/>
        <SearchField.Input placeholder={placeholder}/>
        <SearchField.ClearButton/>
      </SearchField.Group>
    </SearchField>
  );
};

export const DataGridActiveFilters: FC<DataGridActiveFiltersProps> = ({
  className,
  clearAllLabel = 'Clear all',
  searchPrefix = 'Search',
}) => {
  const { actions, state } = useDataGridFilter();

  if (!state.hasActiveCriteria) {
    return null;
  }

  return (
    <div className={joinClasses('flex flex-wrap items-center gap-2', className)}>
      {state.hasActiveSearch ? (
        <DismissibleChip ariaLabel="Clear search query" label={`${searchPrefix}: ${state.searchQuery}`} onDismiss={actions.clearSearchQuery}/>
      ) : null}

      {state.selectedFilters.map((filter) => (
        <DismissibleChip
          key={String(filter.id)}
          ariaLabel={`Remove filter ${String(filter.id)}`}
          label={filter.label}
          onDismiss={() => actions.removeFilterId(filter.id)}
        />
      ))}

      <Button size="sm" variant="ghost" onPress={actions.clearAll}>
        {clearAllLabel}
      </Button>
    </div>
  );
};

export const DataGridFilterTrigger: FC<DataGridFilterTriggerProps> = ({
  label = 'Filters',
  clearLabel = 'Clear',
  emptyLabel = 'No filters available',
  allLabel = 'All',
  buttonProps,
  filterIds,
  selectionMode = 'multiple',
  renderLabel,
  title = 'Filters',
}) => {
  const { actions, state } = useDataGridFilter();
  const scopedFilterIds = filterIds ?? state.allFilterIds;
  const scopedFilterIdSet = useMemo(
    () => new Set(scopedFilterIds.map((id) => String(id))),
    [scopedFilterIds],
  );
  const scopedSelectedIds = useMemo<DataGridFilterId[]>(
    () => state.selectedFilterIds.filter((id) => scopedFilterIdSet.has(String(id))),
    [scopedFilterIdSet, state.selectedFilterIds],
  );
  const scopedSelectionMode = selectionMode === 'single' ? 'single' : 'multiple';
  const isScopeAllSelected = scopedFilterIds.length > 0 && scopedSelectedIds.length === scopedFilterIds.length;
  const scopedActiveCount = isScopeAllSelected ? 0 : scopedSelectionMode === 'single'
    ? Math.min(1, scopedSelectedIds.length)
    : scopedSelectedIds.length;
  const selectedKeys = useMemo(() => {
    if (scopedSelectionMode === 'single') {
      if (scopedFilterIds.length === 0 || isScopeAllSelected) {
        return new Set(['__all__']);
      }

      return new Set([String(scopedSelectedIds[0])]);
    }

    return new Set(scopedSelectedIds.map((id) => String(id)));
  }, [isScopeAllSelected, scopedFilterIds.length, scopedSelectedIds, scopedSelectionMode]);

  const triggerLabel = renderLabel?.(scopedActiveCount)
    ?? (scopedActiveCount > 0 ? `${label} (${scopedActiveCount})` : label);

  return (
    <Dropdown>
      <Button isDisabled={scopedFilterIds.length === 0} size="sm" variant="secondary" {...buttonProps}>
        {triggerLabel}
      </Button>

      <Dropdown.Popover>
        <Dropdown.Menu
          aria-label={typeof title === 'string' ? title : 'Filters'}
          shouldCloseOnSelect={false}
        >
          {scopedFilterIds.length > 0 ? (
            <Dropdown.Section
              selectedKeys={selectedKeys}
              selectionMode={scopedSelectionMode}
              onSelectionChange={(keys) => {
                const selectedInScope = resolveScopedSelection({
                  keys,
                  scopedFilterIds,
                  selectionMode: scopedSelectionMode,
                });
                const selectedOutsideScope = state.selectedFilterIds.filter(
                  (id) => !scopedFilterIdSet.has(String(id)),
                );

                actions.setSelectedFilterKeys(new Set([
                  ...selectedOutsideScope.map((id) => String(id)),
                  ...selectedInScope.map((id) => String(id)),
                ]));
              }}
            >
              {scopedSelectionMode === 'single' ? (
                <Dropdown.Item key="__all__" id="__all__" textValue={typeof allLabel === 'string' ? allLabel : 'All'}>
                  <Dropdown.ItemIndicator/>
                  <Label>{allLabel}</Label>
                </Dropdown.Item>
              ) : null}
              {scopedFilterIds.map((id) => (
                <Dropdown.Item key={id} id={String(id)} textValue={toFilterTextValue(state.filtersById.get(id)?.label, id)}>
                  <Dropdown.ItemIndicator/>
                  <Label>{state.filtersById.get(id)?.label ?? String(id)}</Label>
                </Dropdown.Item>
              ))}
            </Dropdown.Section>
          ) : (
            <Dropdown.Section>
              <Dropdown.Item isDisabled id="no-filters" textValue="No filters available">
                {emptyLabel}
              </Dropdown.Item>
            </Dropdown.Section>
          )}

          {scopedActiveCount > 0 ? (
            <>
              <Separator/>
              <Dropdown.Section>
                <Dropdown.Item onPress={() => {
                  if (filterIds && filterIds.length > 0) {
                    const scopeIdSet = new Set(filterIds.map((id) => String(id)));
                    const selectedOutsideScope = state.selectedFilterIds.filter(
                      (id) => !scopeIdSet.has(String(id)),
                    );

                    actions.setSelectedFilterKeys(new Set([
                      ...selectedOutsideScope.map((id) => String(id)),
                      ...filterIds.map((id) => String(id)),
                    ]));

                    return;
                  }

                  actions.resetSelectedFilters();
                }}
                >
                  {clearLabel}
                </Dropdown.Item>
              </Dropdown.Section>
            </>
          ) : null}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};

function DismissibleChip({
  ariaLabel,
  label,
  onDismiss,
}: {
  ariaLabel: string,
  label: ReactNode,
  onDismiss: () => void,
}) {
  return (
    <Chip size="sm" variant="secondary">
      <Chip.Label>{label}</Chip.Label>
      <button
        aria-label={ariaLabel}
        className="text-muted hover:text-foreground ml-1 inline-flex cursor-pointer items-center"
        type="button"
        onClick={onDismiss}
      >
        <Xmark className="size-3"/>
      </button>
    </Chip>
  );
}

function toFilterTextValue(label: ReactNode, id: string | number): string {
  return typeof label === 'string' ? label : String(id);
}

function joinClasses(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function resolveScopedSelection({
  keys,
  scopedFilterIds,
  selectionMode,
}: {
  keys: Selection,
  scopedFilterIds: DataGridFilterId[],
  selectionMode: 'single' | 'multiple',
}): DataGridFilterId[] {
  if (keys === 'all') {
    return [...scopedFilterIds];
  }

  const selectedKeys = new Set(Array.from(keys as Set<Key>, (key) => String(key)));

  if (selectionMode === 'single') {
    if (selectedKeys.has('__all__') || selectedKeys.size === 0) {
      return [...scopedFilterIds];
    }

    const firstId = scopedFilterIds.find((id) => selectedKeys.has(String(id)));

    return firstId !== undefined ? [firstId] : [...scopedFilterIds];
  }

  return scopedFilterIds.filter((id) => selectedKeys.has(String(id)));
}
