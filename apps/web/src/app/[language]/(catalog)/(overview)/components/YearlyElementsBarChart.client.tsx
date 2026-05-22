'use client';

import type { Language } from '@brickcatalog/database';

import { ArrowUpRight } from '@gravity-ui/icons';
import { Button } from '@heroui/react/button';
import { Card } from '@heroui/react/card';
import { BarChart } from '@heroui-pro/react';
import Link from 'next/link';

import { getOverviewLocale } from './formatting';

interface YearlyElementsBarChartProps {
  language: Language,
  data: Array<{ year: number, total: number }>,
  title: string,
  description: string,
  openAriaLabel: string,
  tooltipLabelPrefix: string,
}

export function YearlyElementsBarChart({
  language,
  data,
  title,
  description,
  openAriaLabel,
  tooltipLabelPrefix,
}: YearlyElementsBarChartProps) {
  const locale = getOverviewLocale(language);
  const chartData = data.slice(-6).map((item) => ({
    year: String(item.year),
    total: item.total,
  }));

  return (
    <Card>
      <Card.Header className="mb-1 grid grid-cols-[1fr_auto] items-start gap-x-3 gap-y-1">
        <Card.Title>{title}</Card.Title>
        <Link className="row-span-2" href="/element/registrations">
          <Button isIconOnly aria-label={openAriaLabel} variant="tertiary">
            <ArrowUpRight className="size-5"/>
          </Button>
        </Link>
        <Card.Description className="text-muted text-xs">{description}</Card.Description>
      </Card.Header>
      <Card.Content>
        <BarChart data={chartData} height={174}>
          <BarChart.Grid strokeDasharray="4 4" vertical={false}/>
          <BarChart.XAxis axisLine={false} dataKey="year" tickLine={false}/>
          <BarChart.YAxis allowDecimals={false} axisLine={false} tickLine={false}/>
          <BarChart.Bar dataKey="total" fill="var(--chart-1)" radius={[10, 10, 0, 0]}/>
          <BarChart.Tooltip
            content={(
              <BarChart.TooltipContent
                labelFormatter={(label) => `${tooltipLabelPrefix} ${label}`}
                valueFormatter={(value) => Number(value).toLocaleString(locale)}
              />
            )}
          />
        </BarChart>
      </Card.Content>
    </Card>
  );
}
