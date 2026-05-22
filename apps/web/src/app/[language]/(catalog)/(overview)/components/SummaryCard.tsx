import { ArrowUpRight } from '@gravity-ui/icons';
import { KPI, NumberValue, TrendChip } from '@heroui-pro/react';
import { BarChart3 } from 'lucide-react';
import Link from 'next/link';

import { getYearlyElements } from '@/queries/elements/yearly-statistics';

import { OVERVIEW_LOCALE } from './formatting';

export async function SummaryCard() {
  const yearlyData = await getYearlyElements();
  const currentYear = yearlyData.at(-1);
  const previousYear = yearlyData.at(-2);

  const totalElements = currentYear?.total ?? 0;
  const previousTotal = previousYear?.total ?? 0;
  const displayYear = currentYear?.year ?? 'No data';
  const changeRatio =
    previousTotal > 0
      ? (totalElements - previousTotal) / previousTotal
      : 0;
  const isPositive = totalElements >= previousTotal;
  const trend = changeRatio > 0 ? 'up' : changeRatio < 0 ? 'down' : 'neutral';

  return (
    <KPI>
      <KPI.Header>
        <KPI.Icon className="bg-accent-soft">
          <BarChart3 className="size-6 text-accent"/>
        </KPI.Icon>
        <KPI.Title>Total Elements ({displayYear})</KPI.Title>
      </KPI.Header>
      <KPI.Actions>
        <Link aria-label="Open all elements" href="/element">
          <ArrowUpRight className="size-5"/>
        </Link>
      </KPI.Actions>
      <KPI.Content>
        <KPI.Value
          className="text-4xl"
          locale={OVERVIEW_LOCALE}
          maximumFractionDigits={0}
          value={totalElements}
        />
        <TrendChip trend={trend} variant="tertiary">
          <NumberValue
            maximumFractionDigits={1}
            signDisplay="exceptZero"
            style="percent"
            value={isPositive ? Math.abs(changeRatio) : -Math.abs(changeRatio)}
          />
          {' '}
          <TrendChip.Suffix>vs previous year</TrendChip.Suffix>
        </TrendChip>
      </KPI.Content>
    </KPI>
  );
}
