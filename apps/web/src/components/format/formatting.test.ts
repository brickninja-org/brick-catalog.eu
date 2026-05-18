import { describe, expect, it } from 'vitest';

import {
  formatDate,
  getAvailableLocales,
  getFormatPreview,
  getLanguageOptions,
  getRegionOptions,
  isSupportedLanguage,
  SUPPORTED_LANGUAGES,
} from './formatting';

describe('isSupportedLanguage', () => {
  it('accepts supported languages', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      expect(isSupportedLanguage(language)).toBe(true);
    }
  });

  it('rejects unsupported languages', () => {
    expect(isSupportedLanguage('fr')).toBe(false);
    expect(isSupportedLanguage('')).toBe(false);
  });
});

describe('getAvailableLocales', () => {
  it('returns default locales in non-browser environment', () => {
    const result = getAvailableLocales();

    expect(result.languages).toEqual([...SUPPORTED_LANGUAGES]);
    expect(result.regions).toEqual(['US', 'GB', 'DE', 'NL']);
  });
});

describe('language and region option helpers', () => {
  it('returns language options with auto item first', () => {
    const options = getLanguageOptions('en');

    expect(options[0]).toEqual({
      key: 'auto',
      label: 'Current Language (en)',
    });
    expect(options.map((item) => item.key)).toEqual(['auto', ...SUPPORTED_LANGUAGES]);
  });

  it('returns region options with browser item first', () => {
    const options = getRegionOptions('en', 'US');

    expect(options[0]).toEqual({
      key: 'browser',
      label: 'Browser Region (US)',
    });
    expect(options.slice(1).map((item) => item.key)).toEqual(['US', 'GB', 'DE', 'NL']);
  });
});

describe('date preview helpers', () => {
  it('formats date to a non-empty string', () => {
    const formatted = formatDate('en-US', new Date('2026-01-01T00:00:00.000Z'));
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('returns preview with locale and formatted date', () => {
    const preview = getFormatPreview('nl-NL');

    expect(preview.locale).toBe('nl-NL');
    expect(typeof preview.date).toBe('string');
    expect(preview.date.length).toBeGreaterThan(0);
  });
});
