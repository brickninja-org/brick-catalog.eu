'use client';

import type { FC, ReactNode } from 'react';

import { ToastProvider } from '@heroui/react';

export const Providers: FC<Readonly<{ children: ReactNode }>> = ({
  children,
}) => {
  return (
    <>
      {children}
      <ToastProvider
        className="bottom-4 right-4 sm:bottom-6 sm:right-6"
        gap={10}
        maxVisibleToasts={4}
        placement="bottom end"
        width={420}
      />
    </>
  );
};
