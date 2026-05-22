import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  db: {
    $queryRaw: vi.fn(),
  },
}));

let formatYearMonth: typeof import('./shared').formatYearMonth;
let getMonthRange: typeof import('./shared').getMonthRange;
let getYearRange: typeof import('./shared').getYearRange;

beforeAll(async () => {
  const mod = await import('./shared');
  formatYearMonth = mod.formatYearMonth;
  getMonthRange = mod.getMonthRange;
  getYearRange = mod.getYearRange;
});

describe('getYearRange', () => {
  it('returns UTC year bounds', () => {
    const { from, to } = getYearRange(2026);

    expect(from.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(to.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });
});

describe('getMonthRange', () => {
  it('returns UTC month bounds for a valid month', () => {
    const { from, to } = getMonthRange('2026-02');

    expect(from.toISOString()).toBe('2026-02-01T00:00:00.000Z');
    expect(to.toISOString()).toBe('2026-03-01T00:00:00.000Z');
  });

  it('supports year transitions for December', () => {
    const { from, to } = getMonthRange('2026-12');

    expect(from.toISOString()).toBe('2026-12-01T00:00:00.000Z');
    expect(to.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });

  it('throws for invalid month formats', () => {
    expect(() => getMonthRange('2026-2')).toThrow('Invalid month format');
    expect(() => getMonthRange('2026-13')).toThrow('Invalid month format');
    expect(() => getMonthRange('2026/02')).toThrow('Invalid month format');
  });
});

describe('formatYearMonth', () => {
  it('formats using UTC year and month', () => {
    const value = formatYearMonth(new Date('2026-03-15T12:34:56.000Z'));

    expect(value).toBe('2026-03');
  });
});
