import { Chip } from '@heroui/react/chip';
import { Typography } from '@heroui/react/typography';
import { KPI, KPIGroup } from '@heroui-pro/react';

import { getPieceTypeSummaryByYear } from '@/queries/elements/piece-type-summary-by-year';

import { OVERVIEW_LOCALE } from './formatting';

export async function PieceTypeOverview() {
  const summary = await getPieceTypeSummaryByYear();

  if (!summary) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Typography type="h3">Piece Type Overview</Typography>
        <Chip color="accent" size="sm">
          {summary.year}
        </Chip>
      </div>
      <KPIGroup>
        <KPI>
          <KPI.Header>
            <KPI.Title>Total</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value
              className="text-2xl text-accent"
              locale={OVERVIEW_LOCALE}
              maximumFractionDigits={0}
              value={summary.total}
            />
          </KPI.Content>
        </KPI>
        <KPIGroup.Separator />
        <KPI>
          <KPI.Header>
            <KPI.Title>LEGO</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value
              className="text-2xl text-accent"
              locale={OVERVIEW_LOCALE}
              maximumFractionDigits={0}
              value={summary.lego}
            />
          </KPI.Content>
        </KPI>
        <KPIGroup.Separator />
        <KPI>
          <KPI.Header>
            <KPI.Title>TECHNIC</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value
              className="text-2xl text-accent"
              locale={OVERVIEW_LOCALE}
              maximumFractionDigits={0}
              value={summary.technic}
            />
          </KPI.Content>
        </KPI>
      </KPIGroup>
    </div>
  );
}
