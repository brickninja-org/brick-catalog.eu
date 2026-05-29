'use client';

import type { FC, ReactNode } from 'react';

import { EllipsisVertical } from '@gravity-ui/icons';
import { Button, Dropdown, Surface } from '@heroui/react';

export interface DetailLayoutActionsProps {
  children: ReactNode,
}

export const DetailLayoutActions: FC<DetailLayoutActionsProps> = ({ children }) => {
  return (
    <Dropdown aria-label="Detail actions">
      <Dropdown.Trigger>
        <Button
          isIconOnly
          aria-label="Open actions"
          size="sm"
          variant="tertiary"
        >
          <EllipsisVertical aria-hidden className="size-4"/>
        </Button>
      </Dropdown.Trigger>

      <Dropdown.Popover placement="bottom end">
        <div className="flex min-w-48 flex-col gap-1 p-1">
          {children}
        </div>
      </Dropdown.Popover>
    </Dropdown>
  );
};

export interface DetailLayoutInfoboxProps {
  children: ReactNode,
}

export const DetailLayoutInfobox: FC<DetailLayoutInfoboxProps> = ({ children }) => {
  return (
    <Surface className="min-[921px]:col-start-2 min-[921px]:col-end-3 min-[921px]:row-start-1 min-[921px]:row-end-3 rounded-2xl p-4">
      {children}
    </Surface>
  );
};
