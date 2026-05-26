export type LocalizedObject<T = object> = {
  de: T, en: T, nl: T,
};

export function localeExists<X, T extends LocalizedObject<X>>(value: Partial<T>): value is T {
  return value.de !== undefined && value.en !== undefined && value.nl !== undefined;
}