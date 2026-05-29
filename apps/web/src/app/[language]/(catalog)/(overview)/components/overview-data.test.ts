import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getOverviewData } from './overview-data';

const {
  getYearlyElements,
  getPieceTypeSummaryByYear,
  getElementsLatestMonth,
  getElementsComparison,
} = vi.hoisted(() => ({
  getYearlyElements: vi.fn(),
  getPieceTypeSummaryByYear: vi.fn(),
  getElementsLatestMonth: vi.fn(),
  getElementsComparison: vi.fn(),
}));

vi.mock('@/queries/elements/yearly-statistics', () => ({
  getYearlyElements,
}));

vi.mock('@/queries/elements/piece-type-summary-by-year', () => ({
  getPieceTypeSummaryByYear,
}));

vi.mock('@/queries/elements/latest-month', () => ({
  getElementsLatestMonth,
}));

vi.mock('@/queries/elements/monthly-comparison', () => ({
  getElementsComparison,
}));

describe('getOverviewData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns monthly comparison when latest month exists', async () => {
    getYearlyElements.mockResolvedValue([{ year: 2026, total: 123 }]);
    getPieceTypeSummaryByYear.mockResolvedValue({
      year: 2026,
      total: 123,
      lego: 100,
      duplo: 10,
      technic: 13,
    });
    getElementsLatestMonth.mockResolvedValue('2026-05');
    getElementsComparison.mockResolvedValue({
      currentMonth: { total: 20 },
      previousMonth: { total: 10 },
    });

    const result = await getOverviewData();

    expect(getElementsComparison).toHaveBeenCalledWith('2026-05');
    expect(result).toEqual({
      yearlyData: [{ year: 2026, total: 123 }],
      pieceTypeSummary: {
        year: 2026,
        total: 123,
        lego: 100,
        duplo: 10,
        technic: 13,
      },
      latestMonth: '2026-05',
      monthlyComparison: {
        currentMonth: { total: 20 },
        previousMonth: { total: 10 },
      },
    });
  });

  it('skips monthly comparison when no latest month exists', async () => {
    getYearlyElements.mockResolvedValue([]);
    getPieceTypeSummaryByYear.mockResolvedValue(null);
    getElementsLatestMonth.mockResolvedValue(null);

    const result = await getOverviewData();

    expect(getElementsComparison).not.toHaveBeenCalled();
    expect(result).toEqual({
      yearlyData: [],
      pieceTypeSummary: null,
      latestMonth: null,
      monthlyComparison: null,
    });
  });
});
