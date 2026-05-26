'use client';

import type { FC, ReactNode } from 'react';

import { useLocale } from 'next-intl';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { resolveLocale } from './FormatContext.logic';

type FormatLanguage = string | 'auto';
type FormatRegion = string | 'browser';

function getBrowserLocale(): string {
  if (typeof window === 'undefined') {
    return 'en-US';
  }

  return new Intl.NumberFormat(undefined).resolvedOptions().locale;
}

function getDefaultRegionFromBrowser() {
  if(typeof window === 'undefined') {
    return 'US';
  }

  const localeWithRegionRegex = /^[a-z]{2,4}(?:[_-][a-z]{4})?[_-]([a-z]{2,3})/i;
  const browserLocale = getBrowserLocale();

  const match = [browserLocale, ...navigator.languages]
    .map((locale) => locale.match(localeWithRegionRegex))
    .find((result) => result !== null);

  return match?.[1]?.toUpperCase() ?? 'US';
}

function getStoredLanguage(): FormatLanguage {
  if (typeof window === 'undefined') {
    return 'auto';
  }

  const value = localStorage.getItem('bc.format.language');

  return value || 'auto';
}

function getStoredRegion(): FormatRegion {
  if (typeof window === 'undefined') {
    return 'browser';
  }

  const value = localStorage.getItem('bc.format.region');

  return value || 'browser';
}

interface FormatContextProps {
  language: FormatLanguage,
  region: FormatRegion,
  locale: string,
  defaultLocale: string,
  defaultRegion: string,
  setLocale: (language: FormatLanguage, region: FormatRegion) => void,

  utcFormat: Intl.DateTimeFormat,
  localFormat: Intl.DateTimeFormat,
  relativeFormat: Intl.RelativeTimeFormat,
  numberFormat: Intl.NumberFormat,
}

const FormatContext = createContext<FormatContextProps>(null!);

export function useFormat() {
  return useContext(FormatContext);
}

export interface FormatProviderProps {
  children: ReactNode,
}

export const FormatProvider: FC<FormatProviderProps> = ({ children }) => {
  const currentLanguage = useLocale();
  const [region, setRegion] = useState<FormatRegion>(getStoredRegion);
  const [language, setLanguage] = useState<FormatLanguage>(getStoredLanguage);

  const defaultLocale = useMemo(() => getBrowserLocale(), []);
  const defaultRegion = useMemo(() => getDefaultRegionFromBrowser(), []);

  const locale = useMemo(() => {
    return resolveLocale(language, region, currentLanguage, defaultLocale, defaultRegion);
  }, [language, region, currentLanguage, defaultLocale, defaultRegion]);

  useEffect(() => {
    localStorage.setItem('bc.format.language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('bc.format.region', region);
  }, [region]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const utcFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        timeZone: 'UTC',
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    [locale],
  );

  const localFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    [locale],
  );

  const relativeFormat = useMemo(
    () =>
      new Intl.RelativeTimeFormat(locale, {
        numeric: 'auto',
      }),
    [locale],
  );

  const numberFormat = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        useGrouping: true,
      }),
    [locale],
  );

  const setLocale = useCallback((nextLanguage: FormatLanguage, nextRegion: FormatRegion) => {
    setLanguage(nextLanguage);
    setRegion(nextRegion);
  }, []);

  const value = useMemo<FormatContextProps>(
    () => ({
      language,
      region,
      locale,
      defaultLocale,
      defaultRegion,
      setLocale,
      utcFormat,
      localFormat,
      relativeFormat,
      numberFormat,
    }),
    [
      language,
      region,
      locale,
      defaultLocale,
      defaultRegion,
      setLocale,
      utcFormat,
      localFormat,
      relativeFormat,
      numberFormat,
    ],
  );

  return <FormatContext.Provider value={value}>{children}</FormatContext.Provider>;
};
