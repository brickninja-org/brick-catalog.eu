import type { OverviewData } from './overview-data';
import type { Language } from '@brickcatalog/database';

import { ArrowUpRight } from '@gravity-ui/icons';
import { KPI, NumberValue, TrendChip } from '@heroui-pro/react';
import { CalendarDays } from 'lucide-react';
import Link from 'next/link';

import { formatMonthLabel, getOverviewLocale } from './formatting';
import { getMonthlyChangeTrend } from './MonthlyChangeSummary.logic';
import { OverviewEmptyStateCard } from './OverviewEmptyStateCard';

interface MonthlyChangeSummaryProps {
  language: Language,
  latestMonth: OverviewData['latestMonth'],
  comparison: OverviewData['monthlyComparison'],
  title: string,
  trendSuffix: string,
  openAriaLabelPrefix: string,
  emptyStateMessage: string,
}

export function MonthlyChangeSummary({
  language,
  latestMonth,
  comparison,
  title,
  trendSuffix,
  openAriaLabelPrefix,
  emptyStateMessage,
}: MonthlyChangeSummaryProps) {
  if (!latestMonth || !comparison) {
    return <OverviewEmptyStateCard message={emptyStateMessage}/>;
  }

  const locale = getOverviewLocale(language);
  const currentTotal = comparison.currentMonth.total;
  const previousTotal = comparison.previousMonth.total;

  const { changeAmount, changeRatio, trend } = getMonthlyChangeTrend(currentTotal, previousTotal);

  const displayMonth = formatMonthLabel(latestMonth, language);

  return (
    <KPI>
      <KPI.Header>
        <KPI.Icon className="bg-accent-soft">
          <CalendarDays className="size-6 text-accent"/>
        </KPI.Icon>
        <KPI.Title>{title} ({displayMonth})</KPI.Title>
      </KPI.Header>
      <KPI.Actions>
        <Link aria-label={`${openAriaLabelPrefix} ${displayMonth}`} href={`/element?month=${latestMonth}`}>
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
            locale={locale}
            maximumFractionDigits={0}
            signDisplay="exceptZero"
            value={changeAmount}
          />
          {' '}
          <TrendChip.Suffix>{trendSuffix}</TrendChip.Suffix>
        </TrendChip>
      </KPI.Content>
    </KPI>
  );
}
