'use client';

import type { FC } from 'react';

import { Typography } from '@heroui/react';

import { FormatDate } from '@/components/format';

export interface LastUpdateProps {
  date: Date,
}

export const LastUpdate: FC<LastUpdateProps> = ({ date }) => {
  return (
    <Typography type="body-xs">
      Last updated:{' '}
      <FormatDate date={date}/>
    </Typography>
  );
};

