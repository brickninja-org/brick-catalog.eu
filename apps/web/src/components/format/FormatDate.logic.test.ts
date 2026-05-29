import { describe, expect, it } from 'vitest';

import { getRelativeDateDifference, isValidDate } from './FormatDate.logic';

describe('isValidDate', () => {
  it('accepts valid dates and rejects null/invalid dates', () => {
    expect(isValidDate(new Date('2026-01-01T00:00:00.000Z'))).toBe(true);
    expect(isValidDate(null)).toBe(false);
    expect(isValidDate(undefined)).toBe(false);
    expect(isValidDate(new Date('invalid-date'))).toBe(false);
  });
});

describe('getRelativeDateDifference', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  it('uses seconds up to threshold', () => {
    const target = new Date('2026-01-01T00:02:30.000Z'); // 150s
    const result = getRelativeDateDifference(target, now);

    expect(result.unit).toBe('second');
    expect(result.value).toBe(150);
  });

  it('switches to minutes after seconds threshold', () => {
    const target = new Date('2026-01-01T00:02:31.000Z'); // 151s
    const result = getRelativeDateDifference(target, now);

    expect(result.unit).toBe('minute');
    expect(result.value).toBeCloseTo(151 / 60, 8);
  });

  it('switches to hours after minutes threshold', () => {
    const target = new Date('2026-01-01T02:01:00.000Z'); // 121m
    const result = getRelativeDateDifference(target, now);

    expect(result.unit).toBe('hour');
    expect(result.value).toBeCloseTo(121 / 60, 8);
  });

  it('switches to days after hours threshold', () => {
    const target = new Date('2026-01-02T01:00:00.000Z'); // 25h
    const result = getRelativeDateDifference(target, now);

    expect(result.unit).toBe('day');
    expect(result.value).toBeCloseTo(25 / 24, 8);
  });

  it('keeps sign for past values', () => {
    const target = new Date('2025-12-31T23:58:00.000Z'); // -120s
    const result = getRelativeDateDifference(target, now);

    expect(result.unit).toBe('second');
    expect(result.value).toBe(-120);
  });
});
