'use client';

import type { FC, ReactNode } from 'react';

import { Chip } from '@heroui/react/chip';
import { cn } from '@heroui/styles';
import React from 'react';

import { useTableOfContentAnchor } from '../navigation/toc/TableOfContent.context';

export interface HeadlineProps {
  children: ReactNode,
  id: string,
  tableOfContentLabel?: ReactNode,
  noToc?: boolean,
  count?: number,
  meta?: ReactNode,
  actions?: ReactNode,
  className?: string,
  contentClassName?: string,
  metaClassName?: string,
  actionsClassName?: string,
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
  level?: number,
}

export const Headline: FC<HeadlineProps> = ({
  children,
  id,
  tableOfContentLabel,
  noToc = false,
  count,
  meta,
  actions,
  className,
  contentClassName,
  metaClassName,
  actionsClassName,
  as: Component = 'h2',
  level,
}) => {
  const ref = useTableOfContentAnchor(id, {
    label: tableOfContentLabel ?? children,
    enabled: !noToc,
    level,
  });

  return (
    <div
      className={cn(
        'mt-8 mb-4 flex min-w-0 items-start justify-between gap-4 first:mt-0 last:mb-0',
        className,
      )}
    >
      {/* Title + meta */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Component
          ref={ref}
          id={id}
          className={cn(
            'min-w-0 scroll-mt-24 wrap-break-word text-2xl font-semibold leading-tight tracking-tight',
            contentClassName,
          )}
        >
          {children}
        </Component>

        {meta ? (
          <div
            className={cn(
              'flex shrink-0 items-center text-sm leading-5 text-default-500 translate-y-px',
              metaClassName,
            )}
          >
            {meta}
          </div>
        ) : null}

        {!meta && count !== undefined ? (
          <Chip
            className={cn('shrink-0 translate-y-px', metaClassName)}
            size="sm"
            variant="soft"
          >
            {count}
          </Chip>
        ) : null}
      </div>

      {/* Actions */}
      {actions ? (
        <div
          className={cn(
            'flex shrink-0 items-center gap-2',
            actionsClassName,
          )}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
};
