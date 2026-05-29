import { describe, expect, it } from 'vitest';

import { getMonthlyChangeTrend } from './MonthlyChangeSummary.logic';

describe('getMonthlyChangeTrend', () => {
  it('returns up trend for positive growth', () => {
    const result = getMonthlyChangeTrend(120, 100);

    expect(result).toEqual({
      changeAmount: 20,
      changeRatio: 0.2,
      trend: 'up',
    });
  });

  it('returns down trend for negative growth', () => {
    const result = getMonthlyChangeTrend(80, 100);

    expect(result).toEqual({
      changeAmount: -20,
      changeRatio: -0.2,
      trend: 'down',
    });
  });

  it('returns neutral trend for equal totals', () => {
    const result = getMonthlyChangeTrend(100, 100);

    expect(result).toEqual({
      changeAmount: 0,
      changeRatio: 0,
      trend: 'neutral',
    });
  });

  it('returns neutral trend when previous total is zero', () => {
    const result = getMonthlyChangeTrend(50, 0);

    expect(result).toEqual({
      changeAmount: 50,
      changeRatio: 0,
      trend: 'neutral',
    });
  });
});
