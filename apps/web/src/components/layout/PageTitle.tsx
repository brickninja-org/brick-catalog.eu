import type { FC, ReactNode } from 'react';

import { cn } from 'tailwind-variants';

interface PageTitleProps {
  children: ReactNode,
  className?: string,
}

export const PageTitle: FC<PageTitleProps> = ({ children, className }) => {
  return (
    <h1 className={cn('mb-2 text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-4xl md:text-5xl', className)}>
      {children}
    </h1>
  );
};
