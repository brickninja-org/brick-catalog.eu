'use client';

import type {
  DataGridColumnSelectionDropdownProps,
  DataGridColumnSelectionMenuProps,
} from './DataGrid.types';
import type { FC, ReactNode } from 'react';

import { Button, Dropdown, Label, Separator } from '@heroui/react';

import { useVisibleColumns as useDataGridVisibleColumns } from './DataGrid.context';

export interface DataGridColumnVisibilityMenuProps {
  buttonLabel?: string,
  dropdownProps?: DataGridColumnSelectionDropdownProps,
  id: string,
  children: ReactNode,
  menuLabel?: string,
  menuProps?: DataGridColumnSelectionMenuProps,
  reset: ReactNode,
}

export const DataGridColumnVisibilityMenu: FC<DataGridColumnVisibilityMenuProps> = ({
  buttonLabel = 'Columns',
  dropdownProps,
  id,
  children,
  menuLabel = 'Visible columns',
  menuProps,
  reset,
}) => {
  const {
    currentAvailableColumns,
    visibleColumns,
    setVisibleColumns,
    resetColumns,
  } = useDataGridVisibleColumns(id);

  return (
    <Dropdown {...dropdownProps}>
      <Button aria-label={buttonLabel} size="sm" variant="secondary">
        {children}
      </Button>

      <Dropdown.Popover>
        <Dropdown.Menu
          {...menuProps}
          aria-label={menuLabel}
          shouldCloseOnSelect={false}
        >
          <Dropdown.Section
            disallowEmptySelection
            selectedKeys={visibleColumns}
            selectionMode="multiple"
            onSelectionChange={setVisibleColumns}
          >
            {currentAvailableColumns
              .filter((column) => !column.hidden)
              .map((column) => (
                <Dropdown.Item
                  key={column.id}
                  id={column.id}
                  isDisabled={column.isRowHeader}
                  textValue={typeof column.title === 'string' ? column.title : column.id}
                >
                  <Dropdown.ItemIndicator/>
                  <Label>{column.title ?? column.id}</Label>
                </Dropdown.Item>
              ))}
          </Dropdown.Section>

          <Separator/>

          <Dropdown.Section>
            <Dropdown.Item onPress={resetColumns}>
              {reset}
            </Dropdown.Item>
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};
