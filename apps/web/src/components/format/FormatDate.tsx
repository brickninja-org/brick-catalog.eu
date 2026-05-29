'use client';

import type { FC } from 'react';

import { Tooltip } from '@heroui/react';

import { useFormat } from './Format.context';
import { getRelativeDateDifference, isValidDate } from './FormatDate.logic';

export interface FormatDateProps {
  date?: Date | null,
  relative?: boolean,
}

export const FormatDate: FC<FormatDateProps> = ({ date = null, relative = false }) => {
  const { relativeFormat, localFormat } = useFormat();
  const difference = isValidDate(date) && relative ? getRelativeDateDifference(date) : undefined;

  if (!isValidDate(date)) {
    return <span className="whitespace-nowrap">-</span>;
  }

  if (relative) {
    return (
      <Tooltip delay={0}>
        <Tooltip.Trigger>
          <time suppressHydrationWarning className="whitespace-nowrap" dateTime={date.toISOString()}>
            {relativeFormat.format(Math.round(difference!.value), difference!.unit)}
          </time>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <Tooltip.Arrow/>
          {localFormat.format(date)}
        </Tooltip.Content>
      </Tooltip>
    );
  }

  return (
    <time suppressHydrationWarning className="whitespace-nowrap" dateTime={date?.toISOString()}>
      {localFormat.format(date)}
    </time>
  );
};
