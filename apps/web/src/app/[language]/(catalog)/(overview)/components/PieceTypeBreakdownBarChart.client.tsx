'use client';

import type { Language } from '@brickcatalog/database';

import { ArrowUpRight } from '@gravity-ui/icons';
import { Button } from '@heroui/react/button';
import { Card } from '@heroui/react/card';
import { Chip } from '@heroui/react/chip';
import { BarChart } from '@heroui-pro/react';
import Link from 'next/link';

import { getOverviewLocale } from './formatting';

interface PieceTypeBreakdownBarChartProps {
  language: Language,
  year: number,
  total: number,
  lego: number,
  duplo: number,
  technic: number,
  title: string,
  description: string,
  totalLabel: string,
  legoLabel: string,
  duploLabel: string,
  technicLabel: string,
  openAriaLabel: string,
}

export function PieceTypeBreakdownBarChart({
  language,
  year,
  total,
  lego,
  duplo,
  technic,
  title,
  description,
  totalLabel,
  legoLabel,
  duploLabel,
  technicLabel,
  openAriaLabel,
}: PieceTypeBreakdownBarChartProps) {
  const locale = getOverviewLocale(language);
  const chartData = [
    { type: totalLabel, units: total },
    { type: legoLabel, units: lego },
    { type: duploLabel, units: duplo },
    { type: technicLabel, units: technic },
  ];

  return (
    <Card className="w-full rounded-2xl">
      <Card.Header className="grid grid-cols-[1fr_auto] items-start gap-x-3 gap-y-1">
        <Card.Title className="text-base">{title}</Card.Title>
        <div className="row-span-2 flex items-center gap-2">
          <Chip color="accent" size="sm">{year}</Chip>
          <Link href="/element/piece-types">
            <Button isIconOnly aria-label={openAriaLabel} variant="tertiary">
              <ArrowUpRight className="size-5"/>
            </Button>
          </Link>
        </div>
        <Card.Description className="text-muted text-xs">{description}</Card.Description>
      </Card.Header>
      <Card.Content>
        <BarChart data={chartData} height={180} layout="vertical">
          <BarChart.XAxis allowDecimals={false} tickMargin={4} type="number"/>
          <BarChart.YAxis dataKey="type" tickMargin={4} type="category" width={60}/>
          <BarChart.Bar barSize={14} dataKey="units" fill="var(--chart-3)" radius={[0, 24, 24, 0]}/>
          <BarChart.Tooltip
            content={(
              <BarChart.TooltipContent
                valueFormatter={(value) => Number(value).toLocaleString(locale)}
              />
            )}
          />
        </BarChart>
      </Card.Content>
    </Card>
  );
}
