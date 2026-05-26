'use client';

import type { HoverCardContentProps, HoverCardProps, } from '@heroui-pro/react';
import type { FC, HTMLProps, ReactElement, ReactNode } from 'react';

import { HoverCard } from '@heroui-pro/react';

export interface TooltipProps extends HoverCardProps, Pick<HoverCardContentProps, 'offset' | 'placement'> {
  content: ReactNode,
  showArrow?: boolean,
  children: ReactElement<HTMLProps<HTMLElement>>,
}

export const Tooltip: FC<TooltipProps> = ({
  content,
  offset,
  placement,
  showArrow = false,
  children,
  ...props
}) => {
  return (
    <HoverCard {...props}>
      <HoverCard.Trigger aria-label="Tooltip">
        {children}
      </HoverCard.Trigger>
      <HoverCard.Content offset={offset} placement={placement}>
        {!!showArrow && <HoverCard.Arrow/>}
        {content}
      </HoverCard.Content>
    </HoverCard>
  );
};
