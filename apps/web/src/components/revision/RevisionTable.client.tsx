'use client';

import type { TranslationSubset } from '@/i18n/types';
import type { Revision } from '@brickcatalog/database';
import type { DataGridColumn, DataGridProps } from '@heroui-pro/react';
import type { FC, ReactNode } from 'react';

import { EllipsisVertical, Eye } from '@gravity-ui/icons';
import { Button, Dropdown, Label } from '@heroui/react';
import { DataGrid } from '@heroui-pro/react';
import Link from 'next/link';

import { FormatDate } from '../format/FormatDate';

export interface RowActionsMenuProps {
  translations: TranslationSubset<
    | 'actions.view'
  >,
}

export const RowActionsMenu: FC<RowActionsMenuProps> = ({
  translations,
}) => {
  return (
    <Dropdown>
      <Button isIconOnly aria-label="Row actions" size="sm" variant="tertiary">
        <EllipsisVertical/>
      </Button>
      <Dropdown.Popover className="min-w-45">
        <Dropdown.Menu>
          <Dropdown.Item>
            <Eye/>
            <Label>{translations['actions.view']}</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};

export type RevisionTableRow = Pick<Revision, 'id' | 'buildId' | 'description' | 'createdAt' | 'type' | 'hash'> & { viewLink: ReactNode };

export interface RevisionDataGridProps extends Omit<DataGridProps<RevisionTableRow>, 'columns' | 'getRowId' | 'renderEmptyState'> {
  translations: TranslationSubset<
    | 'actions'
    | 'actions.view'
    | 'revisions.date'
    | 'revisions.description'
    | 'revisions.build'
    | 'revisions.empty-state'
  >,
}

export const RevisionDataGrid: FC<RevisionDataGridProps> = ({
  translations,
  ...props
}) => {
  const columns: DataGridColumn<RevisionTableRow>[] = [
    {
      accessorKey: 'buildId',
      header: translations['revisions.build'],
      headerClassName: 'w-px',
      cell: (item) => <Link className="link" href={`/build/${item.buildId}`}>{item.buildId}</Link>,
      cellClassName: 'w-px',
      id: 'buildId',
      isRowHeader: true,
    },
    {
      accessorKey: 'description',
      header: translations['revisions.description'],
      id: 'description',
    },
    {
      accessorKey: 'createdAt',
      cell: (item) => <FormatDate relative date={item.createdAt}/>,
      cellClassName: 'w-px',
      header: translations['revisions.date'],
      headerClassName: 'w-px',
      id: 'date',
    },
    {
      align: 'end',
      allowsResizing: false,
      cell: (item) => item.viewLink,
      cellClassName: 'w-px',
      header: translations['actions'],
      headerClassName: 'w-px',
      id: 'actions',
    },
  ];

  return (
    <DataGrid
      columns={columns}
      getRowId={(item) => item.id}
      renderEmptyState={() => translations['revisions.empty-state']}
      {...props}
    />
  );
};
