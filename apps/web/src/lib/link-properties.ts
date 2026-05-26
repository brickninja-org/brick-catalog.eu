import type { LocalizedEntity } from './localized-name';
import type { WithIcon } from './with';

export type SingleNameEntity = {
  name: string,
};

type LinkEntity = LocalizedEntity | SingleNameEntity;

type LinkProperties<T extends WithIcon<LinkEntity> & { id: unknown }> =
  T extends WithIcon<SingleNameEntity>
    ? WithIcon<SingleNameEntity> & { id: T['id'] }
    : WithIcon<LocalizedEntity> & { id: T['id'] };

export const localizedLinkProperties = {
  id: true,
  icon: true,
  name_de: true,
  name_en: true,
  name_nl: true,
} as const;

export const singleLinkProperties = {
  id: true,
  icon: true,
  name: true,
} as const;

export function getLinkProperties<T extends WithIcon<LinkEntity> & { id: unknown }>(
  value: T
): LinkProperties<T> {
  if ('name' in value) {
    return {
      id: value.id,
      icon: value.icon,
      name: value.name,
    } as LinkProperties<T>;
  }

  return {
    id: value.id,
    icon: value.icon,
    name_de: value.name_de,
    name_en: value.name_en,
    name_nl: value.name_nl,
  } as LinkProperties<T>;
}
