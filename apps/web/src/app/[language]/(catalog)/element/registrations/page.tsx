import type { Prisma } from '@brickcatalog/database';

import {
  createDataGrid,
  createDataGridSearchIndex,
  DataGridSearchField,
  DataGridToolbar,
  DataGridToolbarActions,
  Headline,
} from '@brickninja-org/ui';
import { Card } from '@heroui/react/card';
import { Chip } from '@heroui/react/chip';
import { Typography } from '@heroui/react/typography';
import { Button } from '@heroui/react/button';
import { KPI, KPIGroup, Segment } from '@heroui-pro/react';
import Link from 'next/link';

import { Description } from '@/components/layout/Description';
import { DataGridFilterRoot } from '@/components/table/DataGridFilterProvider';
import { cache } from '@/lib/cache';
import { db } from '@/lib/prisma';
import { RegistrationsTrendCard } from './RegistrationsTrendCard.client';

type RegistrationRange = '7d' | '30d' | '90d';
type KpiTrend = 'up' | 'down' | 'neutral';

const DEFAULT_RANGE: RegistrationRange = '30d';
const RANGE_OPTIONS: RegistrationRange[] = ['7d', '30d', '90d'];
const SIGNAL_KEYS = ['name', 'designId', 'colorId', 'itemId'] as const;
const REGISTRATION_ROWS_PER_PAGE = [10, 25, 50, 100];
const NO_DATA_LABEL = 'n/a';

interface RegistrationPayloadShape {
  name?: unknown,
  designId?: unknown,
  colorId?: unknown,
  itemId?: unknown,
  [key: string]: unknown,
}

function getRangeStart(range: RegistrationRange): Date {
  const now = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;

  return new Date(now.valueOf() - days * 24 * 60 * 60 * 1000);
}

function normalizeRange(value: string | undefined): RegistrationRange {
  if (!value) {
    return DEFAULT_RANGE;
  }

  return RANGE_OPTIONS.includes(value as RegistrationRange) ? value as RegistrationRange : DEFAULT_RANGE;
}

function toPercent(part: number, total: number): string {
  if (total <= 0) {
    return '0.0';
  }

  return ((part / total) * 100).toFixed(1);
}

function toTrend(delta: number): KpiTrend {
  if (delta > 0) {
    return 'up';
  }
  if (delta < 0) {
    return 'down';
  }

  return 'neutral';
}

function parsePayload(raw: string): RegistrationPayloadShape | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return parsed as RegistrationPayloadShape;
  } catch {
    return null;
  }
}

const getRegistrationOverview = cache(
  async (range: RegistrationRange) => {
    const from = getRangeStart(range);
    const to = new Date();
    const durationMs = to.valueOf() - from.valueOf();
    const previousFrom = new Date(from.valueOf() - durationMs);

    const where: Prisma.ElementWhereInput = {
      createdAt: { gte: from },
    };
    const previousWhere: Prisma.ElementWhereInput = {
      createdAt: { gte: previousFrom, lt: from },
    };

    const [totalRegistered, previousTotalRegistered, registeredRows, topAddedColorsRaw] = await Promise.all([
      db.element.count({ where }),
      db.element.count({ where: previousWhere }),
      db.element.findMany({
        where,
        include: {
          color: { select: { id: true, name: true }},
          design: {
            select: {
              id: true,
              name: true,
              pieceType: true,
              subcategory: { select: { id: true, name: true }},
            },
          },
          current: {
            select: {
              type: true,
              data: true,
              createdAt: true,
              description: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      db.element.groupBy({
        by: ['colorId'],
        where: {
          createdAt: { gte: from },
          colorId: { not: null },
        },
        _count: { colorId: true },
        orderBy: { _count: { colorId: 'desc' }},
        take: 5,
      }),
    ]);

    const colorIds = topAddedColorsRaw.map((row) => row.colorId).filter((id): id is number => id != null);
    const colorMap = new Map(
      (await db.color.findMany({
        where: { id: { in: colorIds }},
        select: { id: true, name: true },
      })).map((color) => [color.id, color]),
    );

    const topAddedColors = topAddedColorsRaw
      .map((row) => {
        if (row.colorId == null) {
          return null;
        }
        const color = colorMap.get(row.colorId);
        if (!color) {
          return null;
        }

        return {
          id: color.id,
          name: color.name,
          count: row._count.colorId ?? 0,
        };
      })
      .filter((row): row is { id: number, name: string, count: number } => row !== null);

    const rows = registeredRows.map((row) => {
      const payload = parsePayload(row.current.data);
      const payloadName = typeof payload?.name === 'string' ? payload.name.trim() : '';
      const payloadKeys = payload ? Object.keys(payload) : [];
      const signalKeys = payloadKeys
        .filter((key) => SIGNAL_KEYS.includes(key as (typeof SIGNAL_KEYS)[number]))
        .sort((a, b) => a.localeCompare(b));

      return {
        id: row.id,
        name: row.name || payloadName || 'Unknown',
        designId: row.design?.id ?? null,
        designName: row.design?.name ?? null,
        pieceType: row.design?.pieceType ?? null,
        subcategoryId: row.design?.subcategory?.id ?? null,
        subcategoryName: row.design?.subcategory?.name ?? null,
        colorId: row.color?.id ?? null,
        colorName: row.color?.name ?? null,
        itemId: row.itemId ?? null,
        createdAt: row.createdAt,
        revisionType: row.current.type,
        revisionAt: row.current.createdAt,
        revisionDescription: row.current.description ?? null,
        payloadSignal: signalKeys.join(', ') || '-',
      };
    });

    const withDesignCount = rows.filter((row) => row.designId != null).length;
    const withColorCount = rows.filter((row) => row.colorId != null).length;
    const withItemCount = rows.filter((row) => row.itemId != null).length;

    const byDayMap = new Map<string, number>();
    const pieceTypeMap = new Map<string, number>();
    const subcategoryMap = new Map<string, { id: number, name: string, count: number }>();

    for (const row of rows) {
      const dayKey = row.createdAt.toISOString().slice(0, 10);
      byDayMap.set(dayKey, (byDayMap.get(dayKey) ?? 0) + 1);

      const pieceType = row.pieceType ?? 'Unknown';
      pieceTypeMap.set(pieceType, (pieceTypeMap.get(pieceType) ?? 0) + 1);

      if (row.subcategoryId != null && row.subcategoryName) {
        const existing = subcategoryMap.get(row.subcategoryName);
        if (existing) {
          existing.count += 1;
        } else {
          subcategoryMap.set(row.subcategoryName, {
            id: row.subcategoryId,
            name: row.subcategoryName,
            count: 1,
          });
        }
      }
    }

    const registrationsPerDay = Array.from(byDayMap.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.day.localeCompare(a.day))
      .slice(0, 14);

    const topPieceTypes = Array.from(pieceTypeMap.entries())
      .map(([pieceType, count]) => ({ pieceType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topSubcategories = Array.from(subcategoryMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      totalRegistered,
      previousTotalRegistered,
      withDesignCount,
      withColorCount,
      withItemCount,
      registrationsPerDay,
      topPieceTypes,
      topSubcategories,
      rows,
      topAddedColors,
      from,
    };
  },
  ['element-registrations-overview'],
  { revalidate: 60 },
);

export default async function ElementRegistrationsPage({ searchParams }: PageProps<'/[language]/element/registrations'>) {
  const { range } = await searchParams;
  const selectedRange = normalizeRange(range);
  const data = await getRegistrationOverview(selectedRange);
  const Registrations = createDataGrid(data.rows, (row) => row.id);

  const registrationSearchIndex = createDataGridSearchIndex(
    data.rows,
    (row) => [String(row.id), row.name, row.designName ?? '', row.colorName ?? '', row.payloadSignal],
  );
  const chartData = data.registrationsPerDay
    .slice()
    .reverse()
    .map((entry) => ({
      label: entry.day,
      value: entry.count,
    }));
  const avgPerDay = chartData.length > 0
    ? chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length
    : 0;
  const peak = chartData.reduce<{ label: string, value: number } | null>(
    (best, curr) => (best == null || curr.value > best.value ? curr : best),
    null,
  );
  const delta = data.totalRegistered - data.previousTotalRegistered;
  const trend = toTrend(delta);
  const designCoverage = `${toPercent(data.withDesignCount, data.totalRegistered)}% of new parts`;
  const colorCoverage = `${toPercent(data.withColorCount, data.totalRegistered)}% of new parts`;
  const itemCoverage = `${toPercent(data.withItemCount, data.totalRegistered)}% of new parts`;
  const topPieceType = data.topPieceTypes[0];
  const topPieceTypeShare = topPieceType ? `${toPercent(topPieceType.count, data.totalRegistered)}% share` : NO_DATA_LABEL;
  const topColor = data.topAddedColors[0];
  const topColorShare = topColor ? `${toPercent(topColor.count, data.totalRegistered)}% share` : NO_DATA_LABEL;
  const totalActiveSubcategories = data.topSubcategories.length;

  return (
    <div className="mx-auto flex w-full max-w-248 flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div>
          <Headline count={data.totalRegistered} id="element-registrations">New Element Registrations</Headline>
          <Description>
            Recently added LEGO elements in the catalog, with trend and discovery signals for fans, builders and collectors.
          </Description>
        </div>

        <Card>
          <Card.Content>
            <Typography color="muted" type="body-sm">Select Range</Typography>
            <Segment aria-label="Registration range" selectedKey={selectedRange} size="sm">
              <Segment.Item id="7d">
                <Link href="/element/registrations?range=7d">Last 7 days</Link>
              </Segment.Item>
              <Segment.Item id="30d">
                <Link href="/element/registrations?range=30d">Last 30 days</Link>
              </Segment.Item>
              <Segment.Item id="90d">
                <Link href="/element/registrations?range=90d">Last 90 days</Link>
              </Segment.Item>
            </Segment>
          </Card.Content>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <KPIGroup>
        <KPI>
          <KPI.Header>
            <KPI.Icon>N</KPI.Icon>
            <Link aria-label="Open element registrations table" href="#details">
              <KPI.Actions variant="tertiary">Open</KPI.Actions>
            </Link>
          </KPI.Header>
          <KPI.Header><KPI.Title>New Parts Added</KPI.Title></KPI.Header>
          <KPI.Content>
            <KPI.Value locale="en-US" maximumFractionDigits={0} value={data.totalRegistered}/>
            <KPI.Trend trend={trend} variant="secondary">
              {delta > 0 ? '+' : ''}{delta} vs previous period
            </KPI.Trend>
          </KPI.Content>
          <KPI.Chart data={chartData}/>
          <KPI.Footer>
            <Typography color="muted" type="body-xs">Overall additions in selected period</Typography>
          </KPI.Footer>
        </KPI>
        <KPIGroup.Separator />
        <KPI>
          <KPI.Header>
            <KPI.Icon>D</KPI.Icon>
            <Link href="/element/design-variants">
              <Button size="sm" variant="tertiary">Open</Button>
            </Link>
          </KPI.Header>
          <KPI.Header><KPI.Title>With Design Name</KPI.Title></KPI.Header>
          <KPI.Content>
            <KPI.Value locale="en-US" maximumFractionDigits={0} value={data.withDesignCount}/>
            <KPI.Trend trend="up" variant="secondary">{designCoverage}</KPI.Trend>
          </KPI.Content>
          <KPI.Footer>
            <Typography color="muted" type="body-xs">Better discoverability for builders</Typography>
          </KPI.Footer>
        </KPI>
        <KPIGroup.Separator />
        <KPI>
          <KPI.Header>
            <KPI.Icon>C</KPI.Icon>
            <Link href="/element/color">
              <Button size="sm" variant="tertiary">Open</Button>
            </Link>
          </KPI.Header>
          <KPI.Header><KPI.Title>With Color Name</KPI.Title></KPI.Header>
          <KPI.Content>
            <KPI.Value locale="en-US" maximumFractionDigits={0} value={data.withColorCount}/>
            <KPI.Trend trend="up" variant="secondary">{colorCoverage}</KPI.Trend>
          </KPI.Content>
          <KPI.Footer>
            <Typography color="muted" type="body-xs">Useful for color-based searches</Typography>
          </KPI.Footer>
        </KPI>
        <KPIGroup.Separator />
        <KPI>
          <KPI.Header>
            <KPI.Icon>I</KPI.Icon>
            <Link href="/element">
              <Button size="sm" variant="tertiary">Open</Button>
            </Link>
          </KPI.Header>
          <KPI.Header><KPI.Title>With Item Link</KPI.Title></KPI.Header>
          <KPI.Content>
            <KPI.Value locale="en-US" maximumFractionDigits={0} value={data.withItemCount}/>
            <KPI.Trend trend="neutral" variant="secondary">{itemCoverage}</KPI.Trend>
          </KPI.Content>
          <KPI.Footer>
            <Typography color="muted" type="body-xs">Connected to sets/inventories</Typography>
          </KPI.Footer>
        </KPI>
        </KPIGroup>

        <Typography color="muted" type="body-sm">Market Insights</Typography>
        <KPIGroup>
        <KPI>
          <KPI.Header><KPI.Title>Top Piece Type</KPI.Title></KPI.Header>
          <KPI.Content>
            <Typography type="h4">{topPieceType?.pieceType ?? NO_DATA_LABEL}</Typography>
            <KPI.Trend trend="neutral" variant="secondary">{topPieceTypeShare}</KPI.Trend>
          </KPI.Content>
        </KPI>
        <KPIGroup.Separator />
        <KPI>
          <KPI.Header><KPI.Title>Top Added Color</KPI.Title></KPI.Header>
          <KPI.Content>
            <Typography type="h4">{topColor?.name ?? NO_DATA_LABEL}</Typography>
            <KPI.Trend trend="neutral" variant="secondary">{topColorShare}</KPI.Trend>
          </KPI.Content>
        </KPI>
        <KPIGroup.Separator />
        <KPI>
          <KPI.Header><KPI.Title>Active Subcategories</KPI.Title></KPI.Header>
          <KPI.Content>
            <KPI.Value locale="en-US" maximumFractionDigits={0} value={totalActiveSubcategories}/>
            <KPI.Trend trend="neutral" variant="secondary">in current top activity</KPI.Trend>
          </KPI.Content>
        </KPI>
        </KPIGroup>
      </div>

      <div className="flex flex-col gap-4">
        <Typography color="muted" type="body-sm">Insights</Typography>
        <div className="grid gap-3 md:grid-cols-3">
        <RegistrationsTrendCard
          avgPerDay={avgPerDay}
          data={chartData}
          peakLabel={peak?.label ?? NO_DATA_LABEL}
          peakValue={peak?.value ?? 0}
        />

        <Card>
          <Card.Header>
            <Typography type="body-sm">Top Piece Types</Typography>
          </Card.Header>
          <Card.Content>
            <KPIGroup>
              {data.topPieceTypes.map((entry) => (
                <KPI key={entry.pieceType}>
                  <KPI.Header><KPI.Title>{entry.pieceType}</KPI.Title></KPI.Header>
                  <KPI.Content>
                    <KPI.Value locale="en-US" maximumFractionDigits={0} value={entry.count}/>
                  </KPI.Content>
                </KPI>
              ))}
            </KPIGroup>
          </Card.Content>
        </Card>
        </div>

        <Card>
        <Card.Header>
          <Typography type="body-sm">Top Added Colors ({selectedRange})</Typography>
        </Card.Header>
        <Card.Content>
          {data.topAddedColors.length === 0 ? (
            <Typography color="muted" type="body-sm">No color additions in this range.</Typography>
          ) : (
            <KPIGroup>
              {data.topAddedColors.map((color) => (
                <KPI key={color.id}>
                  <KPI.Header><KPI.Title>{color.name}</KPI.Title></KPI.Header>
                  <KPI.Content>
                    <KPI.Value locale="en-US" maximumFractionDigits={0} value={color.count}/>
                  </KPI.Content>
                </KPI>
              ))}
            </KPIGroup>
          )}
        </Card.Content>
        </Card>

        <Card>
        <Card.Header>
          <Typography type="body-sm">Top Subcategories in New Registrations</Typography>
        </Card.Header>
        <Card.Content>
          {data.topSubcategories.length === 0 ? (
            <Typography color="muted" type="body-sm">No subcategory-linked registrations in this range.</Typography>
          ) : (
            <KPIGroup>
              {data.topSubcategories.map((subcategory) => (
                <KPI key={subcategory.id}>
                  <KPI.Header>
                    <KPI.Title>
                      <Link href={`/element/subcategory/${subcategory.id}`}>{subcategory.name}</Link>
                    </KPI.Title>
                  </KPI.Header>
                  <KPI.Content>
                    <KPI.Value locale="en-US" maximumFractionDigits={0} value={subcategory.count}/>
                  </KPI.Content>
                </KPI>
              ))}
            </KPIGroup>
          )}
        </Card.Content>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Typography color="muted" id="details" type="body-sm">Details</Typography>
        <DataGridFilterRoot filters={[]} searchIndex={registrationSearchIndex}>
        <DataGridToolbar>
          <DataGridToolbarActions>
            <DataGridSearchField placeholder="Search element ID, name, design, color, payload fields..."/>
          </DataGridToolbarActions>
        </DataGridToolbar>

        <Registrations.Table
          enablePagination
          defaultRowsPerPage={25}
          initialSortBy="created_at"
          initialSortDirection="descending"
          rowsPerPageOptions={REGISTRATION_ROWS_PER_PAGE}
        >
          <Registrations.Column isRowHeader header="Element ID" id="id" sortBy="id" title="Element ID">
            {({ id }) => id}
          </Registrations.Column>
          <Registrations.Column header="Name" id="name" sortBy="name" title="Name">
            {({ name }) => name}
          </Registrations.Column>
          <Registrations.Column header="Design" id="design" title="Design">
            {({ designId, designName }) => (designId ? <Link href={`/element/design/${designId}`}>{designName ?? designId}</Link> : '-')}
          </Registrations.Column>
          <Registrations.Column header="Color" id="color" title="Color">
            {({ colorId, colorName }) => (colorId ? <Link href="/element/color">{colorName ?? colorId}</Link> : '-')}
          </Registrations.Column>
          <Registrations.Column header="Piece Type" id="piece_type" sortBy="pieceType" title="Piece Type">
            {({ pieceType }) => pieceType ?? '-'}
          </Registrations.Column>
          <Registrations.Column header="Subcategory" id="subcategory" title="Subcategory">
            {({ subcategoryId, subcategoryName }) => (subcategoryId ? <Link href={`/element/subcategory/${subcategoryId}`}>{subcategoryName ?? subcategoryId}</Link> : '-')}
          </Registrations.Column>
          <Registrations.Column header="Registered" id="created_at" sortBy="createdAt" title="Registered">
            {({ createdAt }) => createdAt.toLocaleDateString()}
          </Registrations.Column>
          <Registrations.Column header="Revision Type" id="revision_type" sortBy="revisionType" title="Revision Type">
            {({ revisionType }) => revisionType}
          </Registrations.Column>
          <Registrations.Column header="Payload Signals" id="payload_signals" title="Payload Signals">
            {({ payloadSignal }) => payloadSignal}
          </Registrations.Column>
        </Registrations.Table>
        </DataGridFilterRoot>
      </div>
    </div>
  );
}
