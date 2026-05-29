'use client';

import { Card } from '@heroui/react/card';
import { Chip } from '@heroui/react/chip';
import { Typography } from '@heroui/react/typography';
import { AreaChart } from '@heroui-pro/react';

export interface RegistrationsTrendPoint {
  label: string,
  value: number,
}

export interface RegistrationsTrendCardProps {
  data: RegistrationsTrendPoint[],
  avgPerDay: number,
  peakLabel: string,
  peakValue: number,
}

export function RegistrationsTrendCard({ data, avgPerDay, peakLabel, peakValue }: RegistrationsTrendCardProps) {
  const summaryChips = [
    { label: 'Avg/day', value: avgPerDay.toFixed(1) },
    { label: 'Peak', value: `${peakLabel} (${peakValue})` },
  ];

  return (
    <Card>
      <Card.Header>
        <Typography type="body-sm">Registration Trend</Typography>
      </Card.Header>
      <Card.Content>
        <AreaChart data={data} height={240}>
          <AreaChart.Grid strokeDasharray="4 4" vertical={false}/>
          <AreaChart.XAxis axisLine={false} dataKey="label" minTickGap={20} tickLine={false}/>
          <AreaChart.YAxis allowDecimals={false} axisLine={false} tickLine={false}/>
          <AreaChart.Area
            activeDot={{ r: 4, strokeWidth: 2 }}
            dataKey="value"
            dot={{ r: 2 }}
            fill="var(--chart-1)"
            fillOpacity={0.15}
            isAnimationActive={false}
            name="Registrations"
            stroke="var(--chart-1)"
            strokeWidth={2}
            type="monotone"
          />
          <AreaChart.Tooltip/>
        </AreaChart>
      </Card.Content>
      <Card.Footer>
        {summaryChips.map((chip) => (
          <Chip key={chip.label} size="sm" variant="soft">{chip.label}: {chip.value}</Chip>
        ))}
      </Card.Footer>
    </Card>
  );
}
