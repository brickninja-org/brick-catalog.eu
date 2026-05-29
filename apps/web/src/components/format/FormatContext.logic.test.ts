import { describe, expect, it } from 'vitest';

import { resolveLocale } from './FormatContext.logic';

describe('resolveLocale', () => {
  it('uses explicit language/region when supported', () => {
    const result = resolveLocale('de', 'DE', 'en', 'en-US', 'US');
    expect(result.toLowerCase()).toContain('de');
  });

  it('uses currentLanguage when language is auto', () => {
    const result = resolveLocale('auto', 'NL', 'nl', 'en-US', 'US');
    expect(result.toLowerCase()).toContain('nl');
  });

  it('uses defaultRegion when region is browser', () => {
    const result = resolveLocale('en', 'browser', 'nl', 'en-US', 'GB');
    expect(result).toMatch(/en(-|_)gb/i);
  });

  it('falls back safely when locale combo is not supported', () => {
    const result = resolveLocale('zz', 'ZZ', 'zz', 'xx-YY', 'ZZ');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
