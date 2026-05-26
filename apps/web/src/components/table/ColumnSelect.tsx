import type { DataGridColumnSelectionProps } from '@brickninja-org/ui';
import type { FC, ReactNode } from 'react';

import { LayoutColumns3 } from '@gravity-ui/icons';

import { Translate } from '@/components/i18n/Translate';

export interface ColumnSelectProps {
  table: { ColumnSelection: FC<DataGridColumnSelectionProps> },
  children?: ReactNode,
}

export const ColumnSelect: FC<ColumnSelectProps> = ({
  table: { ColumnSelection },
  children,
}) => {
  return (
    <ColumnSelection reset={<Translate id="datagrid.columns.reset"/>}>
      {children ?? (
        <span className="inline-flex items-center gap-1.5">
          <LayoutColumns3 className="size-3.5"/>
          <Translate id="datagrid.columns"/>
        </span>
      )}
    </ColumnSelection>
  );
};
