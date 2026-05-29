export type CatalogDomainKey = 'elements' | 'sets' | 'gear';

export interface CatalogDomain {
  key: CatalogDomainKey,
  label: string,
  href?: string,
  available: boolean,
}

export const catalogDomains: CatalogDomain[] = [
  { key: 'elements', label: 'Elements', href: '/element', available: true },
  { key: 'sets', label: 'Sets', available: false },
  { key: 'gear', label: 'Gear', available: false },
];

