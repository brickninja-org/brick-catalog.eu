import type { DataGridSortSelectionProps } from '@brickninja-org/ui';
import type { FC, ReactNode } from 'react';

import { Sliders } from '@gravity-ui/icons';

import { Translate } from '../i18n/Translate';


export interface SortSelectProps {
  table: { SortSelection: FC<DataGridSortSelectionProps> },
  children?: ReactNode,
}

export const SortSelect: FC<SortSelectProps> = ({
  table: { SortSelection },
  children,
}) => {
  return (
    <SortSelection label="Sort options">
      {children ?? (
        <span className="inline-flex items-center gap-1.5">
          <Sliders className="size-3.5"/>
          <Translate id="datagrid.sort"/>
        </span>
      )}
    </SortSelection>
  );
};
