export interface MonthlyChangeTrend {
  changeAmount: number,
  changeRatio: number,
  trend: 'up' | 'down' | 'neutral',
}

export function getMonthlyChangeTrend(currentTotal: number, previousTotal: number): MonthlyChangeTrend {
  const changeAmount = currentTotal - previousTotal;
  const changeRatio = previousTotal > 0 ? changeAmount / previousTotal : 0;
  const trend = changeRatio > 0 ? 'up' : changeRatio < 0 ? 'down' : 'neutral';

  return {
    changeAmount,
    changeRatio,
    trend,
  };
}
