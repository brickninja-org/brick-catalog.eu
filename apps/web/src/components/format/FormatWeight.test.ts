import { describe, expect, it } from 'vitest';

import {
  GRAMS_PER_KILOGRAM,
  GRAMS_PER_OUNCE,
  GRAMS_PER_POUND,
  getWeightDisplay,
  resolveAutoWeightUnit,
} from './FormatWeight.logic';

describe('resolveAutoWeightUnit', () => {
  it('uses g for very small US/GB values below 0.1 oz', () => {
    expect(resolveAutoWeightUnit(0.017, 'US')).toBe('g');
    expect(resolveAutoWeightUnit(0.017, 'GB')).toBe('g');
  });

  it('uses oz for US/GB values at or above 0.1 oz and up to 1 lb', () => {
    expect(resolveAutoWeightUnit(0.1 * GRAMS_PER_OUNCE, 'US')).toBe('oz');
    expect(resolveAutoWeightUnit(GRAMS_PER_POUND, 'US')).toBe('oz');
  });

  it('uses lb for US/GB values above 1 lb', () => {
    expect(resolveAutoWeightUnit(GRAMS_PER_POUND + 0.001, 'US')).toBe('lb');
  });

  it('uses g for non-US/GB values at or below 1 kg', () => {
    expect(resolveAutoWeightUnit(GRAMS_PER_KILOGRAM, 'NL')).toBe('g');
    expect(resolveAutoWeightUnit(500, 'DE')).toBe('g');
  });

  it('uses kg for non-US/GB values above 1 kg', () => {
    expect(resolveAutoWeightUnit(GRAMS_PER_KILOGRAM + 0.001, 'NL')).toBe('kg');
  });
});

describe('getWeightDisplay', () => {
  it('converts grams correctly for kg/lb/oz', () => {
    expect(getWeightDisplay(1000, 'kg').value).toBeCloseTo(1, 8);
    expect(getWeightDisplay(GRAMS_PER_POUND, 'lb').value).toBeCloseTo(1, 8);
    expect(getWeightDisplay(GRAMS_PER_OUNCE, 'oz').value).toBeCloseTo(1, 8);
  });
});
