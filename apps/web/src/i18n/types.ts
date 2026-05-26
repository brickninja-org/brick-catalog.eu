import en from '@/translations/en.json';

export type TranslationId = keyof typeof en;
export type TranslationSubset<T extends TranslationId> = Record<T, string>;
