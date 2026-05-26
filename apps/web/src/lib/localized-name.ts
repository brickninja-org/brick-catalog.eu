import type { Language } from '@brickcatalog/database';

export interface LocalizedEntity {
  name_de: string,
  name_en: string,
  name_nl: string,
}

export function localizedName(entity: LocalizedEntity, language: Language): string {
  return entity[`name_${language}`];
}
