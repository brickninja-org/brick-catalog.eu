import 'server-only';

import type { Language } from '@brickcatalog/database';
import type { FC, ReactNode } from 'react';

import { I18nProvider as ContextProvider } from './I18n.context';

export interface I18nProviderProps {
  language: Language,
  children: ReactNode,
}

export const I18nProvider: FC<I18nProviderProps> = ({ children, language }) => {
  return <ContextProvider language={language}>{children}</ContextProvider>;
};
