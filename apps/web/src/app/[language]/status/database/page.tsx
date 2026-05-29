import type { ReactNode } from 'react';

import { Prisma } from '@brickcatalog/database';
import { createDataGrid, Headline } from '@brickninja-org/ui';

import { FormatNumber } from '@/components/format';
import { PageLayout } from '@/components/layout/PageLayout';
import { cache } from '@/lib/cache';
import { db } from '@/lib/prisma';

const getDatabaseStats = cache(() => {
  const hypertables = ['PageView'];

  return Promise.all([
    db.$queryRaw<{ table_name: string, size: bigint, size_index: bigint, size_total: bigint, rows: number }[]>`
      SELECT * FROM (
        SELECT
          relname AS table_name,
          pg_table_size(c.oid) as size,
          pg_indexes_size(c.oid) AS size_index,
          pg_total_relation_size(c.oid) AS size_total,
          reltuples as rows
        FROM pg_class c
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE relkind = 'r' AND nspname = CURRENT_SCHEMA AND relname NOT LIKE 'User%' AND relname NOT IN (${Prisma.join(hypertables)})
        UNION SELECT 'PageView' as table_name, table_bytes as size, index_bytes as size_index, total_bytes as size_total, approximate_row_count('"PageView"') as rows FROM hypertable_detailed_size('"PageView"')
      )
      ORDER BY table_name;`,
    db.$queryRaw<[{ size: string }]>`SELECT pg_size_pretty(pg_database_size(current_database())) as size;`
  ]);
}, ['db-stats'], { revalidate: 60 });

export default async function StatusDatabasePage() {
  const [stats, total] = await getDatabaseStats();

  const DatabaseStats = createDataGrid(stats, ({ table_name }) => table_name);

  return (
    <PageLayout>
      <Headline id="db">Database</Headline>
      <p className="">Total size: {total[0].size}</p>

      <DatabaseStats.Table>
        <DatabaseStats.Column isRowHeader id="table" title="Table">
          {({ table_name }) => table_name}
        </DatabaseStats.Column>
        <DatabaseStats.Column id="rows" sortBy="rows" title="Row Estimate">
          {({ rows }) => rows - 1 ? <span className="text-muted">?</span> : <FormatNumber value={rows}/>}
        </DatabaseStats.Column>
        <DatabaseStats.Column align="end" id="data" sortBy="size" title="Size (Data)">
          {({ size }) => formatSize(size)}
        </DatabaseStats.Column>
        <DatabaseStats.Column align="end" id="index" sortBy="size_index" title="Size (Index)">
          {({ size_index }) => formatSize(size_index)}
        </DatabaseStats.Column>
        <DatabaseStats.Column align="end" id="total" sortBy="size_total" title="Size (Total)">
          {({ size_total }) => formatSize(size_total)}
        </DatabaseStats.Column>
      </DatabaseStats.Table>
    </PageLayout>
  );
}

function formatSize(size: bigint | null): ReactNode {
  if(size === null) {
    return '?';
  }

  const units = ['bytes', 'kB', 'MB', 'GB', 'TB'];

  while(size > 8192) {
    size /= BigInt(1024);
    units.shift();
  }

  return <FormatNumber className="tabular-nums" unit={units[0]} value={size}/>;
}
