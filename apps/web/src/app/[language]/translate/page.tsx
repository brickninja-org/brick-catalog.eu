import type { TranslationId } from '@/i18n/types';

import { PageLayout } from '@/components/layout/PageLayout';
import de from '@/translations/de.json';
import en from '@/translations/en.json';
import nl from '@/translations/nl.json';

import { TranslationEditor } from './TranslationEditor.client';

const dictionaries = {
  de: de as Partial<Record<TranslationId, string>>,
  en: en as Record<TranslationId, string>,
  nl: nl as Partial<Record<TranslationId, string>>,
};

export default function TranslationEditorPage() {
  return (
    <PageLayout>
      <TranslationEditor dictionaries={dictionaries}/>
    </PageLayout>
  );
}
