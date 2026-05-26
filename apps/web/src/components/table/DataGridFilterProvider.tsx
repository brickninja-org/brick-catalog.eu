import type { Language } from '@brickcatalog/database';
import type { DataGridFilterRootProps } from '@brickninja-org/ui';
import type { FC, ReactNode } from 'react';

import { Language as LanguageEnum } from '@brickcatalog/database';
import { DataGridFilterRoot as BaseProvider } from '@brickninja-org/ui';

export const DataGridFilterRoot: FC<Omit<DataGridFilterRootProps, 'children' | 'language'> & { children: ReactNode, language?: Language }> = (props) => {
  const language = props.language ?? LanguageEnum.en;

  return (
    <BaseProvider {...props} language={language}/>
  );
};
