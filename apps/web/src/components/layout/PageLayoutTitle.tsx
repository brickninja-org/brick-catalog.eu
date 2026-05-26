import type { FC, ReactNode } from 'react';

import { Typography } from '@heroui/react';

export interface DetailLayoutTitleProps {
  badge?: ReactNode,
  title: string,
  subtitle?: string,
}

export const DetailLayoutTitle: FC<DetailLayoutTitleProps> = ({
  badge,
  subtitle,
  title
}) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <Typography truncate type="h1">{title}</Typography>
        {badge}
      </div>
      {!!subtitle && (
        <Typography color="muted" type="body">{subtitle}</Typography>
      )}
    </div>
  );
};
