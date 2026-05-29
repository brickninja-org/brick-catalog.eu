import { describe, expect, it } from 'vitest';

import { getCurrencyFormatOptions } from './FormatCurrency.logic';

describe('getCurrencyFormatOptions', () => {
  it('builds currency defaults', () => {
    expect(getCurrencyFormatOptions('EUR')).toEqual({
      style: 'currency',
      currency: 'EUR',
    });
  });

  it('allows overriding number format options', () => {
    expect(getCurrencyFormatOptions('USD', { maximumFractionDigits: 0 })).toEqual({
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
  });
});

describe('currency formatting behavior', () => {
  it('formats with locale-specific symbols/placement', () => {
    const usd = new Intl.NumberFormat('en-US', getCurrencyFormatOptions('USD')).format(1234.56);
    const eur = new Intl.NumberFormat('de-DE', getCurrencyFormatOptions('EUR')).format(1234.56);

    expect(usd).toContain('$');
    expect(eur).toContain('€');
    expect(usd).not.toBe(eur);
  });

  it('respects options override (fraction digits)', () => {
    const formatted = new Intl.NumberFormat(
      'en-US',
      getCurrencyFormatOptions('USD', { maximumFractionDigits: 0 }),
    ).format(1234.56);

    expect(formatted).toBe('$1,235');
  });
});
