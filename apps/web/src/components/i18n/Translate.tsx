import type { TranslationId } from '@/i18n/types';
import type { FC } from 'react';

import { useTranslations } from 'next-intl';

export interface TranslateProps {
  id: TranslationId,
}

export const Translate: FC<TranslateProps> = ({ id }) => {
  const t = useTranslations();
  const translation = t(id);

  return <>{translation}</>;
};
