import type { Language } from '@brickcatalog/database';

export function toNestedMessages(messages: Record<string, string>) {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(messages)) {
    const path = key.split('.');
    let cursor: Record<string, unknown> = result;

    for (let i = 0; i < path.length - 1; i++) {
      const part = path[i];
      const next = cursor[part];

      if (!next || typeof next !== 'object' || Array.isArray(next)) {
        cursor[part] = {};
      }

      cursor = cursor[part] as Record<string, unknown>;
    }

    cursor[path[path.length - 1]] = value;
  }

  return result;
}

export async function getNestedMessages(locale: Language) {
  const flatMessages = (await import(`../translations/${locale}.json`)).default as Record<string, string>;

  return toNestedMessages(flatMessages);
}
