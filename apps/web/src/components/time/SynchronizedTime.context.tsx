'use client';

import type { FC, ReactNode } from 'react';

import { createContext, startTransition, useContext, useMemo, useState } from 'react';

import { useInterval } from '@/lib/use-interval';

// this context is used to used to have a single interval updating the time
// otherwise it could happen that multiple timers update slightly offset
export const SynchronizedTimeContext = createContext<number | undefined>(undefined);

export interface SynchronizedTimeProviderProps {
  children: ReactNode,
}

export const SynchronizedTimeProvider: FC<SynchronizedTimeProviderProps> = ({ children }) => {
  // the time is undefined during SSR to avoid hydration warnings and allow caching
  const [time, setTime] = useState<number>();

  // TODO: stop interval if page is not visible (`useVisibilityState`)
  useInterval(() => {
    startTransition(() => setTime(Date.now()));
  }, 1000);

  const value = useMemo(() => time, [time]);

  return (
    <SynchronizedTimeContext.Provider value={value}>
      {children}
    </SynchronizedTimeContext.Provider>
  );
};

export function useSynchronizedTime() {
  return useContext(SynchronizedTimeContext);
}
