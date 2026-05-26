'use client';

import type { FC, ReactNode } from 'react';

import { Surface, cn } from '@heroui/react';

interface CodeClientProps {
  borderless?: boolean,
  children: ReactNode,
}

export const CodeClient: FC<CodeClientProps> = ({ borderless = false, children }) => {
  return (
    <Surface
      variant="tertiary"
      className={cn(
        'relative rounded-xl',
        !borderless && 'border border-divider/70',
      )}
    >
      <div className="overflow-x-auto p-2 md:p-3">
        {children}
      </div>
    </Surface>
  );
};
