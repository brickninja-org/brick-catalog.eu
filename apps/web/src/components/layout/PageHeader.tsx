import type { FC, ReactNode } from 'react';

export interface PageHeaderProps {
  actions?: ReactNode,
  children: ReactNode,
}

export const PageHeader: FC<PageHeaderProps> = ({ actions, children }) => {
  return (
    <header className="mx-auto w-full max-w-248 px-4 pb-2 pt-8 md:px-6 md:pt-10">
      <div className="px-1 py-2 md:px-2 md:py-3">
        <div className="flex flex-wrap items-end gap-4 md:gap-5">
          <div className="min-w-0 flex-1">
            {children}
          </div>
          {!!actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
      </div>
    </header>
  );
};
