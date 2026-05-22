'use client';

import { ArrowUpRight } from '@gravity-ui/icons';
import { Button } from '@heroui/react/button';
import { Card } from '@heroui/react/card';
import { Chip } from '@heroui/react/chip';
import { BarChart } from '@heroui-pro/react';
import Link from 'next/link';

interface PieceTypeBreakdownBarChartProps {
  year: number,
  total: number,
  lego: number,
  duplo: number,
  technic: number,
}

export function PieceTypeBreakdownBarChart({ year, total, lego, duplo, technic }: PieceTypeBreakdownBarChartProps) {
  const chartData = [
    { type: 'TOTAL', units: total },
    { type: 'LEGO', units: lego },
    { type: 'DUPLO', units: duplo },
    { type: 'TECHNIC', units: technic },
  ];

  return (
    <Card className="w-full rounded-2xl">
      <Card.Header className="flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <Card.Title className="text-base">Piece Type Breakdown</Card.Title>
          <Card.Description className="text-muted text-xs">Distribution of elements by piece type</Card.Description>
        </div>
        <div className="flex items-center gap-2">
          <Chip color="accent" size="sm">{year}</Chip>
          <Link href="/element/piece-types">
            <Button isIconOnly aria-label="Open piece type details" variant="tertiary">
              <ArrowUpRight className="size-5"/>
            </Button>
          </Link>
        </div>
      </Card.Header>
      <Card.Content>
        <BarChart data={chartData} height={180} layout="vertical">
          <BarChart.XAxis allowDecimals={false} tickMargin={4} type="number"/>
          <BarChart.YAxis dataKey="type" tickMargin={4} type="category" width={60}/>
          <BarChart.Bar barSize={14} dataKey="units" fill="var(--chart-3)" radius={[0, 24, 24, 0]}/>
          <BarChart.Tooltip content={<BarChart.TooltipContent />}/>
        </BarChart>
      </Card.Content>
    </Card>
  );
}
