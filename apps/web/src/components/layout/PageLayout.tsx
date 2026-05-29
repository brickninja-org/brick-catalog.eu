import type { FC, ReactNode } from 'react';

import { TableOfContent, TableOfContentProvider } from '@brickninja-org/ui';
import { cn } from 'tailwind-variants';

interface PageLayoutProps {
  thin?: boolean,
  toc?: boolean,
  className?: string,
  children: ReactNode,
}

export const PageLayout: FC<PageLayoutProps> = ({
  thin,
  toc = false,
  children,
  className,
}) => {
  const pageClassName = cn('[grid-area:main] flex gap-4 px-4', className);
  const contentClassName = cn(
    'w-3/4 max-w-full flex-1 py-4',
    thin && 'w-full max-w-4xl',
  );

  if (!toc) {
    return (
      <main className={pageClassName}>
        <div className={contentClassName}>
          {children}
        </div>
      </main>
    );
  }

  return (
    <TableOfContentProvider>
      <main className={pageClassName}>
        <aside className="order-1 w-1/4 min-w-62.5 max-w-90 shrink max-[760px]:hidden">
          <TableOfContent/>
        </aside>
        <div className={contentClassName}>
          {children}
        </div>
      </main>
    </TableOfContentProvider>
  );
};
