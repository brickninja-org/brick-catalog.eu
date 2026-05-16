export function getCurrencyFormatOptions(
  currency: string,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormatOptions {
  return {
    style: 'currency',
    currency,
    ...options,
  };
}
