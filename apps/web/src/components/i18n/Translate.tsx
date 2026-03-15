import 'server-only';

import type { TranslationId } from '@/lib/translate';
import type { Language } from '@brickcatalog/database';
import type { FC } from 'react';

import { getLanguage, translate } from '@/lib/translate';

export interface TranslateProps {
  id: TranslationId,
  language?: Language,
}

export const Translate: FC<TranslateProps> = async ({ id, language }) => {
  language ??= await getLanguage();
  const translation = translate(id, language);

  return <>{translation}</>;
};
