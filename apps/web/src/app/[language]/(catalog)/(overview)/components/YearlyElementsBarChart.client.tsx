'use client';

import { ArrowUpRight } from '@gravity-ui/icons';
import { Button } from '@heroui/react/button';
import { Card } from '@heroui/react/card';
import { Typography } from '@heroui/react/typography';
import { BarChart } from '@heroui-pro/react';
import Link from 'next/link';

import { OVERVIEW_LOCALE } from './formatting';

interface YearlyElementsBarChartProps {
  data: Array<{ year: number, total: number }>,
}

export function YearlyElementsBarChart({ data }: YearlyElementsBarChartProps) {
  const chartData = data.slice(-6).map((item) => ({
    year: String(item.year),
    total: item.total,
  }));

  return (
    <Card>
      <Card.Content>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <Typography type="h3">Yearly Elements</Typography>
            <p className="text-muted text-sm">Total registered elements per year</p>
          </div>
          <Link href="/element/registrations">
            <Button isIconOnly aria-label="Open yearly element registrations" variant="tertiary">
              <ArrowUpRight className="size-5"/>
            </Button>
          </Link>
        </div>

        <BarChart data={chartData} height={164}>
          <BarChart.Grid strokeDasharray="4 4" vertical={false}/>
          <BarChart.XAxis axisLine={false} dataKey="year" tickLine={false}/>
          <BarChart.YAxis allowDecimals={false} axisLine={false} tickLine={false}/>
          <BarChart.Bar dataKey="total" fill="var(--chart-1)" radius={[10, 10, 0, 0]}/>
          <BarChart.Tooltip
            content={(
              <BarChart.TooltipContent
                labelFormatter={(label) => `Year ${label}`}
                valueFormatter={(value) => Number(value).toLocaleString(OVERVIEW_LOCALE)}
              />
            )}
          />
        </BarChart>
      </Card.Content>
    </Card>
  );
}
