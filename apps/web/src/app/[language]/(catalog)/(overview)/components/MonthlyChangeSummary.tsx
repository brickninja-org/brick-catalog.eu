import { ArrowUpRight } from '@gravity-ui/icons';
import { KPI, NumberValue, TrendChip } from '@heroui-pro/react';
import { CalendarDays } from 'lucide-react';
import Link from 'next/link';

import { getElementsLatestMonth } from '@/queries/elements/latest-month';
import { getElementsComparison } from '@/queries/elements/monthly-comparison';

import { formatMonthLabel, OVERVIEW_LOCALE } from './formatting';

export async function MonthlyChangeSummary() {
  const latestMonth = await getElementsLatestMonth();

  if (!latestMonth) {
    return null;
  }

  const comparison = await getElementsComparison(latestMonth);
  const currentTotal = comparison.currentMonth.total;
  const previousTotal = comparison.previousMonth.total;

  const changeAmount = currentTotal - previousTotal;
  const changeRatio = previousTotal > 0 ? changeAmount / previousTotal : 0;
  const trend = changeRatio > 0 ? 'up' : changeRatio < 0 ? 'down' : 'neutral';

  const displayMonth = formatMonthLabel(latestMonth);

  return (
    <KPI>
      <KPI.Header>
        <KPI.Icon className="bg-accent-soft">
          <CalendarDays className="size-6 text-accent"/>
        </KPI.Icon>
        <KPI.Title>Monthly Change ({displayMonth})</KPI.Title>
      </KPI.Header>
      <KPI.Actions>
        <Link aria-label={`Open element list for ${displayMonth}`} href={`/element?month=${latestMonth}`}>
          <ArrowUpRight className="size-5"/>
        </Link>
      </KPI.Actions>
      <KPI.Content>
        <KPI.Value
          className="text-4xl"
          maximumFractionDigits={1}
          signDisplay="exceptZero"
          style="percent"
          value={changeRatio}
        />
        <TrendChip trend={trend} variant="tertiary">
          <NumberValue
            locale={OVERVIEW_LOCALE}
            maximumFractionDigits={0}
            signDisplay="exceptZero"
            value={changeAmount}
          />
          {' '}
          <TrendChip.Suffix>vs previous month</TrendChip.Suffix>
        </TrendChip>
      </KPI.Content>
    </KPI>
  );
}
