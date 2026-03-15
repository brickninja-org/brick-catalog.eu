import 'server-only';

import { Language } from '@brickcatalog/database';
import { headers } from 'next/headers';
import { language as getLanguageParam } from 'next/root-params';

import de from '@/translations/de.json';
import en from '@/translations/en.json';
import nl from '@/translations/nl.json';

export type TranslationId = keyof typeof en;
export type TranslationSubset<T extends TranslationId> = Record<T, string>;

const dictionaryDe: Record<TranslationId, string> = { ...en, ...de };
const dictionaryNl: Record<TranslationId, string> = { ...en, ...nl };

const getDictionary = (language: Language): Record<TranslationId, string> => {
  switch (language) {
    case 'de': return dictionaryDe;
    case 'en': return en;
    case 'nl': return dictionaryNl;
  }
};

export function getTranslate(language: Language) {
  const messages = getDictionary(language);

  return (id: TranslationId) => {
    return messages[id] ?? 'Missing translation: ' + id + ']';
  };
}

export function translate(id: TranslationId, language: Language) {
  const translate = getTranslate(language);

  return translate(id);
}

export function translateMany<T extends TranslationId>(ids: T[], language: Language): TranslationSubset<T> {
  const translate = getTranslate(language);

  return Object.fromEntries(ids.map((id) => [id, translate(id)])) as TranslationSubset<T>;
}

export function getLanguage(): Promise<Language> {
  try {
    // for some reason await does not work with root params here (they will always return `undefined`)
    // so we just use good old `.then()` to check that the root param contains a valid language and fallback to headers if not
    return getLanguageParam().then((language: string) =>
      isValidLanguage(language)
        ? language
        : getFallbackLanguageFromHeaders()
    );
  } catch {
    // route handlers don't support root params yet and will throw when using `getLanguageParam`
    // we just fallback to getting the language from headers
    return getFallbackLanguageFromHeaders();
  }
}

async function getFallbackLanguageFromHeaders(): Promise<Language> {
  // get language from internal `x-bc-lang` header
  const language = (await headers()).get('x-bc-lang');

  if (isValidLanguage(language)) {
    return language;
  }

  throw new Error('Could not detect language');
}

function isValidLanguage(language: unknown): language is Language {
  return !!language && typeof language === 'string' && language in Language;
}
