import type { FC, ReactNode } from 'react';

import { LastUpdate } from '../last-updated/LastUpdated';

export interface PageLayoutMetaProps {
  lastUpdate?: Date | null,
  children?: ReactNode,
}

export const PageLayoutMeta: FC<PageLayoutMetaProps> = ({
  lastUpdate,
  children,
}) => {
  return (
    <div className="flex flex-col items-start gap-2">
      {lastUpdate ? <LastUpdate date={lastUpdate}/> : null}
      {children}
    </div>
  );
};
