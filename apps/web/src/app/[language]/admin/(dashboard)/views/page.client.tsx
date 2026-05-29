'use client';

import type { Interval, TopPage, TopPagesColumnConfig } from './page';
import type { TranslationSubset } from '@/i18n/types';
import type { Key } from '@heroui/react';
import type { DataGridColumn } from '@heroui-pro/react';
import type { FC, ReactNode } from 'react';

import { Card } from '@heroui/react';
import { AreaChart, DataGrid, Segment } from '@heroui-pro/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { FormatDate, FormatNumber } from '@/components/format';

type Days = '7' | '30';

type ViewsSegmentsProps = {
  translations: ViewsTranslations,
  interval: Interval,
  days: Days,
};

type ViewsTranslationKeys =
  | 'admin.views.week'
  | 'admin.views.month'
  | 'admin.views.hourly'
  | 'admin.views.daily'
  | 'admin.views.viewsOverTime'
  | 'admin.views.last7Days'
  | 'admin.views.last30Days'
  | 'admin.views.noPreviousComparison'
  | 'admin.views.vsPreviousPeriod'
  | 'admin.views.avgPerBucket'
  | 'admin.views.peak'
  | 'admin.views.latest'
  | 'admin.views.previousTotal'
  | 'admin.views.previous'
  | 'admin.views.noViewsInPeriod'
  | 'admin.views.totalViewsInPeriod'
  | 'admin.views.views';

type ViewsTranslations = TranslationSubset<ViewsTranslationKeys>;

export function ViewsSegments({ translations, interval, days }: ViewsSegmentsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRouterReady, setIsRouterReady] = useState(false);

  useEffect(() => {
    setIsRouterReady(true);
  }, []);

  const updateParam = (name: string, value: string) => {
    if (!isRouterReady) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    const currentValue = params.get(name);
    if (currentValue === value) {
      return;
    }
    params.set(name, value);

    const nextQuery = `?${params.toString()}`;
    const currentQuery = `?${searchParams.toString()}`;
    if (nextQuery === currentQuery) {
      return;
    }

    router.replace(nextQuery, { scroll: false });
  };

  return (
    <>
      <Segment
        selectedKey={days === '30' ? 'month' : 'week'}
        size="sm"
        onSelectionChange={(key: Key) => {
          updateParam('days', key === 'month' ? '30' : '7');
        }}
      >
        <Segment.Item id="week">
          <Segment.Separator />
          {translations['admin.views.week']}
        </Segment.Item>

        <Segment.Item id="month">
          <Segment.Separator />
          {translations['admin.views.month']}
        </Segment.Item>
      </Segment>

      <Segment
        selectedKey={interval}
        size="sm"
        onSelectionChange={(key: Key) => {
          updateParam('interval', String(key));
        }}
      >
        <Segment.Item id="hour">
          <Segment.Separator />
          {translations['admin.views.hourly']}
        </Segment.Item>

        <Segment.Item id="day">
          <Segment.Separator />
          {translations['admin.views.daily']}
        </Segment.Item>
      </Segment>
    </>
  );
}

export interface TopPagesCardProps {
  columns: TopPagesColumnConfig[],
  views: TopPage[],
}

export interface ViewsChartPoint {
  time: Date | string,
  value: number | null,
}

export interface ViewsChartProps {
  days: Days,
  interval: Interval,
  language: string,
  previousViews: ViewsChartPoint[],
  translations: ViewsTranslations,
  views: ViewsChartPoint[],
}

export const ViewsChart: FC<ViewsChartProps> = ({ days, interval, language, previousViews, translations, views }) => {
  const periodMs = Number(days) * 24 * 60 * 60 * 1000;

  const previousMap = useMemo(
    () => new Map(
      previousViews.map((item) => [new Date(item.time).getTime() + periodMs, Number(item.value ?? 0)]),
    ),
    [periodMs, previousViews],
  );

  const data = useMemo(
    () => views
      .map((item) => ({
        label: new Date(item.time).valueOf(),
        previousValue: previousMap.get(new Date(item.time).getTime()) ?? 0,
        value: Number(item.value ?? 0),
      })),
    [previousMap, views],
  );

  const total = useMemo(
    () => data.reduce((acc, item) => acc + item.value, 0),
    [data],
  );
  const previousTotal = useMemo(
    () => data.reduce((acc, item) => acc + item.previousValue, 0),
    [data],
  );
  const avgPerBucket = data.length ? total / data.length : 0;
  const peak = useMemo(
    () => data.reduce((max, item) => Math.max(max, item.value), 0),
    [data],
  );
  const latest = data.at(-1)?.value ?? 0;
  const deltaPct = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : null;
  const hasData = data.some((item) => item.value > 0 || item.previousValue > 0);

  const granularityLabel = interval === 'hour' ? translations['admin.views.hourly'] : translations['admin.views.daily'];
  const periodLabel = days === '30' ? translations['admin.views.last30Days'] : translations['admin.views.last7Days'];

  return (
    <Card className="rounded-2xl">
      <Card.Header className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Card.Title className="text-base">{translations['admin.views.viewsOverTime']}</Card.Title>
          <Card.Description>{periodLabel} • {granularityLabel}</Card.Description>
          <div className="flex items-baseline gap-2">
            <FormatNumber className="text-foreground text-2xl font-semibold tabular-nums" value={total}/>
          </div>
          <span className="text-muted text-xs">
            {deltaPct === null ? translations['admin.views.noPreviousComparison'] : (
              <>
                {deltaPct >= 0 ? '+' : ''}
                <FormatNumber options={{ maximumFractionDigits: 1 }} value={deltaPct}/>
                % {translations['admin.views.vsPreviousPeriod']}
              </>
            )}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
          <Metric label={translations['admin.views.avgPerBucket']} value={<FormatNumber className="tabular-nums" value={avgPerBucket}/>}/>
          <Metric label={translations['admin.views.peak']} value={<FormatNumber className="tabular-nums" value={peak}/>}/>
          <Metric label={translations['admin.views.latest']} value={<FormatNumber className="tabular-nums" value={latest}/>}/>
          <Metric label={translations['admin.views.previousTotal']} value={<FormatNumber className="tabular-nums" value={previousTotal}/>}/>
        </div>
        <div className="flex items-center gap-4 self-start">
          <LegendDot color="var(--chart-1)" label={translations['admin.views.views']}/>
          <LegendDot color="var(--chart-2)" label={translations['admin.views.previous']}/>
        </div>
      </Card.Header>
      <Card.Content>
        {!hasData ? (
          <div className="flex h-70 items-center justify-center rounded-xl border border-dashed border-border bg-default-50/40 text-sm text-muted">
            {translations['admin.views.noViewsInPeriod']}
          </div>
        ) : (
          <AreaChart data={data} height={280}>
            <AreaChart.Grid strokeDasharray="4 4" vertical={false}/>
            <AreaChart.XAxis
              axisLine={false}
              dataKey="label"
              minTickGap={24}
              tickLine={false}
              tickFormatter={(value: number | string) => new Date(value).toLocaleDateString(language, {
                day: '2-digit',
                hour: interval === 'hour' ? '2-digit' : undefined,
                minute: interval === 'hour' ? '2-digit' : undefined,
                month: interval === 'hour' ? undefined : 'short',
                weekday: interval === 'day' ? 'short' : undefined,
              })}
            />
            <AreaChart.YAxis allowDecimals={false} axisLine={false} tickLine={false}/>
            <AreaChart.Area
              dataKey="previousValue"
              dot={false}
              fill="var(--chart-2)"
              fillOpacity={0.06}
              isAnimationActive={false}
              name={translations['admin.views.previous']}
              stroke="var(--chart-2)"
              strokeDasharray="6 6"
              strokeWidth={2}
              type="monotone"
            />
            <AreaChart.Area
              activeDot={{ r: 4, strokeWidth: 2 }}
              dataKey="value"
              dot={{ r: 2 }}
              fill="var(--chart-1)"
              fillOpacity={0.15}
              isAnimationActive={false}
              name={translations['admin.views.views']}
              stroke="var(--chart-1)"
              strokeWidth={2}
              type="monotone"
            />
            <AreaChart.Tooltip
              cursor={{ stroke: 'var(--chart-1)', strokeDasharray: '4 4' }}
              content={(
                <AreaChart.TooltipContent
                  labelFormatter={(label) => (
                    interval === 'hour'
                      ? <FormatDate relative date={new Date(label)}/>
                      : <FormatDate date={new Date(label)}/>
                  )}
                  valueFormatter={(value) => (
                    <FormatNumber className="tabular-nums" value={Number(value) || 0}/>
                  )}
                />
              )}
            />
          </AreaChart>
        )}
      </Card.Content>
    </Card>
  );
};

function Metric({ label, value }: { label: string, value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span>{label}</span>
      <span className="text-muted">{value}</span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="size-3 rounded-full" style={{ backgroundColor: color }}/>
      <span className="text-muted text-xs">{label}</span>
    </div>
  );
}

export const TopPagesCard: FC<TopPagesCardProps> = ({ columns: columnConfig, views }) => {
  const columns = useMemo<DataGridColumn<TopPage>[]>(
    () => columnConfig.map((config) => ({
      ...config,
      cell: (item: TopPage) => {
        if (config.id === 'views') {
          return <FormatNumber className="tabular-nums" value={item._sum.count ?? 0}/>;
        }

        if (config.id === 'path') {
          return <span className="font-medium">{item.page}</span>;
        }

        return <span>{item.pageId}</span>;
      },
    })),
    [columnConfig],
  );

  return (
    <DataGrid
      aria-label="Top pages"
      columns={columns}
      contentClassName="min-w-160"
      data={[...views]}
      getRowId={(item) => item.page}
    />
  );
};
