import type { Language } from '@brickcatalog/database';

import { Headline } from '@brickninja-org/ui';
import { getTranslations } from 'next-intl/server';
import { cache, Suspense } from 'react';

import { PageLayout } from '@/components/layout/PageLayout';
import { db } from '@/lib/prisma';

import { TopPagesCard, ViewsChart, ViewsSegments } from './page.client';

export type Interval = 'hour' | 'day';
export type Days = '7' | '30';

const getViews = cache(async function getViews(interval: Interval, days: Days) {
  const dayCount = Number(days);
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - dayCount);
  const previousStart = new Date(daysAgo);
  previousStart.setDate(previousStart.getDate() - dayCount);

  const intervalSize = interval === 'hour' ? '1 hour' : '1 day';

  const [views, previousViews, mostViewed] = await Promise.all([
    db.$queryRaw<{ time: Date, value: number }[]>`
      SELECT
        time_bucket_gapfill(
          ${intervalSize}::INTERVAL,
          time,
          start => ${daysAgo}::timestamptz,
          finish => NOW()
        ) AS "time",
        COALESCE(COUNT(*), 0)::int AS "value"
      FROM "PageView"
      WHERE time >= ${daysAgo} AND time <= NOW()
      GROUP BY 1
      ORDER BY 1`,
    db.$queryRaw<{ time: Date, value: number }[]>`
      SELECT
        time_bucket_gapfill(
          ${intervalSize}::INTERVAL,
          time,
          start => ${previousStart}::timestamptz,
          finish => ${daysAgo}::timestamptz
        ) AS "time",
        COALESCE(COUNT(*), 0)::int AS "value"
      FROM "PageView"
      WHERE time >= ${previousStart} AND time <= ${daysAgo}
      GROUP BY 1
      ORDER BY 1`,
    db.pageView_daily.groupBy({
      by: ['page', 'pageId'],
      _sum: { count: true },
      where: { bucket: { gte: daysAgo }},
      orderBy: { _sum: { count: 'desc' }},
      take: 25,
    }),
  ]);

  return { views, previousViews, mostViewed };
});

export type TopPage = Awaited<ReturnType<typeof getViews>>['mostViewed'][number];
export type TopPagesColumnId = 'path' | 'pageId' | 'views';
export type TopPagesColumnConfig = {
  accessorKey: 'page' | 'pageId' | '_sum',
  allowsSorting?: boolean,
  header: string,
  id: TopPagesColumnId,
  isRowHeader?: boolean,
  minWidth: number,
};

export default async function AdminPageViewPage({ params, searchParams }: PageProps<'/[language]/admin/views'>) {
  // await ensureUserIsAdmin();

  const { language: languageParam } = await params;
  const language = (['en', 'nl', 'de'].includes(languageParam) ? languageParam : 'en') as Language;
  const { interval: intervalParam, days: daysParam } = await searchParams;
  const interval = (['hour', 'day']).includes(intervalParam as string) ? intervalParam as 'hour' | 'day' : 'hour';
  const days = (['7', '30']).includes(daysParam as string) ? daysParam as '7' | '30' : '7';
  const t = await getTranslations({ locale: language });
  const translations = {
    'admin.views.pageViews': t('admin.views.pageViews'),
    'admin.views.mostViewed': t('admin.views.mostViewed'),
    'admin.views.meta.lastDays': t('admin.views.meta.lastDays', { days }),
    'admin.views.week': t('admin.views.week'),
    'admin.views.month': t('admin.views.month'),
    'admin.views.hourly': t('admin.views.hourly'),
    'admin.views.daily': t('admin.views.daily'),
    'admin.views.viewsOverTime': t('admin.views.viewsOverTime'),
    'admin.views.last7Days': t('admin.views.last7Days'),
    'admin.views.last30Days': t('admin.views.last30Days'),
    'admin.views.noPreviousComparison': t('admin.views.noPreviousComparison'),
    'admin.views.vsPreviousPeriod': t('admin.views.vsPreviousPeriod'),
    'admin.views.avgPerBucket': t('admin.views.avgPerBucket'),
    'admin.views.peak': t('admin.views.peak'),
    'admin.views.latest': t('admin.views.latest'),
    'admin.views.previousTotal': t('admin.views.previousTotal'),
    'admin.views.views': t('admin.views.views'),
    'admin.views.previous': t('admin.views.previous'),
    'admin.views.noViewsInPeriod': t('admin.views.noViewsInPeriod'),
    'admin.views.totalViewsInPeriod': t('admin.views.totalViewsInPeriod'),
    'admin.views.table.path': t('admin.views.table.path'),
    'admin.views.table.id': t('admin.views.table.id'),
    'admin.views.table.views': t('admin.views.table.views'),
  };

  const { views, previousViews, mostViewed } = await getViews(interval, days);
  const topPagesColumns: TopPagesColumnConfig[] = [
    {
      accessorKey: 'page',
      allowsSorting: true,
      header: translations['admin.views.table.path'],
      id: 'path',
      isRowHeader: true,
      minWidth: 220,
    },
    {
      accessorKey: 'pageId',
      header: translations['admin.views.table.id'],
      id: 'pageId',
      minWidth: 100,
    },
    {
      accessorKey: '_sum',
      allowsSorting: true,
      header: translations['admin.views.table.views'],
      id: 'views',
      minWidth: 120,
    },
  ];

  return (
    <PageLayout>
      <Headline
        id="views"
        meta={<>({translations['admin.views.meta.lastDays']})</>}
        actions={(
          <Suspense fallback={null}>
            <ViewsSegments days={days} interval={interval} translations={translations}/>
          </Suspense>
        )}
      >
        {translations['admin.views.pageViews']}
      </Headline>
      <ViewsChart days={days} interval={interval} language={language} previousViews={previousViews} translations={translations} views={views}/>

      <Headline id="most-viewed">{translations['admin.views.mostViewed']}</Headline>
      <TopPagesCard columns={topPagesColumns} views={mostViewed}/>
    </PageLayout>
  );
}
