'use client';

import type { SortDescriptor } from '@heroui/react';
import type { FC, ReactNode } from 'react';

import { Button, Dropdown, Label } from '@heroui/react';
import { useMemo } from 'react';

import { useDataGridSortDescriptorById, useVisibleColumns as useDataGridVisibleColumns } from './DataGrid.context';

export interface DataGridSortSelectionProps {
  id: string,
  children: ReactNode,
  label?: string,
}

export const DataGridSortSelection: FC<DataGridSortSelectionProps> = ({
  id,
  children,
  label = 'Sort column',
}) => {
  const { currentAvailableColumns, visibleColumns } = useDataGridVisibleColumns(id);
  const { sortDescriptor, setSortDescriptor } = useDataGridSortDescriptorById(id);

  const visibleColumnIds = useMemo(
    () => new Set(Array.from(visibleColumns, (value) => String(value))),
    [visibleColumns],
  );

  const items = useMemo(() => currentAvailableColumns.filter((column) =>
    !column.hidden && column.sortable && visibleColumnIds.has(column.id),
  ), [currentAvailableColumns, visibleColumnIds]);

  const selectedKey = sortDescriptor?.column != null
    && items.some((item) => item.id === String(sortDescriptor.column))
    ? String(sortDescriptor.column)
    : undefined;

  return (
    <Dropdown>
      <Button aria-label={label} isDisabled={items.length === 0} size="sm" variant="secondary">
        {children}
      </Button>

      <Dropdown.Popover>
        <Dropdown.Menu
          aria-label={label}
          selectedKeys={selectedKey ? new Set([selectedKey]) : new Set()}
          selectionMode="single"
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0];

            if (!key) {
              return;
            }

            const keyString = String(key);
            const nextSortDescriptor: SortDescriptor = {
              column: keyString,
              direction: sortDescriptor?.column === keyString && sortDescriptor.direction === 'ascending'
                ? 'descending'
                : 'ascending',
            };

            setSortDescriptor(nextSortDescriptor);
          }}
        >
          {items.map((item) => (
            <Dropdown.Item key={item.id} id={item.id} textValue={typeof item.title === 'string' ? item.title : item.id}>
              <Dropdown.ItemIndicator/>
              <Label>{item.title ?? item.id}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};
