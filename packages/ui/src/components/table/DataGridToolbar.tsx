import type { ComponentProps, FC } from 'react';

import { tv } from 'tailwind-variants';

type DataGridToolbarRootProps = ComponentProps<'div'>;
type DataGridToolbarSectionRootProps = ComponentProps<'div'>;

export type DataGridToolbarProps = DataGridToolbarRootProps;
export type DataGridToolbarHeaderProps = DataGridToolbarSectionRootProps;
export type DataGridToolbarActionsProps = DataGridToolbarSectionRootProps;

const toolbarSlots = tv({
  slots: {
    actions: 'ml-auto flex flex-wrap items-center gap-3',
    header: 'flex items-center gap-2',
    root: 'flex flex-wrap items-center gap-6',
  },
});

const { actions, header, root } = toolbarSlots();

export const DataGridToolbar: FC<DataGridToolbarProps> = ({
  children,
  className,
  ...props
}) => (
  <div {...props} className={root({ class: className })}>
    {children}
  </div>
);

export const DataGridToolbarHeader: FC<DataGridToolbarHeaderProps> = ({
  children,
  className,
  ...props
}) => (
  <div {...props} className={header({ class: className })}>
    {children}
  </div>
);

export const DataGridToolbarActions: FC<DataGridToolbarActionsProps> = ({
  children,
  className,
  ...props
}) => (
  <div {...props} className={actions({ class: className })}>
    {children}
  </div>
);
