import type { Language } from '@brickcatalog/database';
import type { Metadata } from 'next';

import { Typography } from '@heroui/react/typography';
import { getTranslations } from 'next-intl/server';

import { PageLayout } from '@/components/layout/PageLayout';
import { routing } from '@/i18n/routing';

import { AnimatedGrid } from './components/AnimatedGrid';
import { AnimatedSection } from './components/AnimatedSection';
import { MonthlyChangeSummary } from './components/MonthlyChangeSummary';
import { getOverviewData } from './components/overview-data';
import { PieceTypeBreakdownChart, YearlyElementsChart } from './components/OverviewBarCharts';
import { SummaryCard } from './components/SummaryCard';

const OVERVIEW_LANGUAGES = routing.locales as readonly Language[];

function resolveOverviewLanguage(value: unknown): Language {
  return typeof value === 'string' && OVERVIEW_LANGUAGES.includes(value as Language)
    ? value as Language
    : routing.defaultLocale;
}

export default async function OverviewPage({ params }: PageProps<'/[language]'>) {
  const { language: languageParam } = await params;
  const language = resolveOverviewLanguage(languageParam);
  const t = await getTranslations({ locale: language });
  const overviewData = await getOverviewData();
  const chartTranslations = {
    yearlyTitle: t('overview.chart.yearly.title'),
    yearlyDescription: t('overview.chart.yearly.description'),
    yearlyOpenAriaLabel: t('overview.chart.yearly.open'),
    yearlyTooltipLabelPrefix: t('overview.chart.yearly.tooltipLabelPrefix'),
    pieceTypeTitle: t('overview.chart.pieceType.title'),
    pieceTypeDescription: t('overview.chart.pieceType.description'),
    pieceTypeOpenAriaLabel: t('overview.chart.pieceType.open'),
    pieceTypeEmptyState: t('overview.chart.pieceType.empty'),
    pieceTypeTotalLabel: t('overview.chart.pieceType.labels.total'),
    pieceTypeLegoLabel: t('overview.chart.pieceType.labels.lego'),
    pieceTypeDuploLabel: t('overview.chart.pieceType.labels.duplo'),
    pieceTypeTechnicLabel: t('overview.chart.pieceType.labels.technic'),
  };

  return (
    <PageLayout>
      <section className="flex flex-col gap-8">
        <AnimatedGrid className="grid grid-cols-12 gap-4">
          <AnimatedSection className="col-span-12 lg:col-span-4">
            <div className="flex flex-col justify-center gap-2">
              <Typography type="h1">{t('overview.title')}</Typography>
            </div>
          </AnimatedSection>

          <AnimatedSection className="col-span-12 lg:col-span-4">
            <SummaryCard
              language={language}
              noDataLabel={t('overview.kpi.noData')}
              openAriaLabel={t('overview.kpi.totalElements.open')}
              title={t('overview.kpi.totalElements.title')}
              trendSuffix={t('overview.kpi.vsPreviousYear')}
              yearlyData={overviewData.yearlyData}
            />
          </AnimatedSection>

          <AnimatedSection className="col-span-12 lg:col-span-4">
            <MonthlyChangeSummary
              comparison={overviewData.monthlyComparison}
              emptyStateMessage={t('overview.kpi.monthlyChange.empty')}
              language={language}
              latestMonth={overviewData.latestMonth}
              openAriaLabelPrefix={t('overview.kpi.monthlyChange.openPrefix')}
              title={t('overview.kpi.monthlyChange.title')}
              trendSuffix={t('overview.kpi.vsPreviousMonth')}
            />
          </AnimatedSection>

          <AnimatedSection className="col-span-12 lg:col-span-6">
            <YearlyElementsChart
              language={language}
              translations={chartTranslations}
              yearlyData={overviewData.yearlyData}
            />
          </AnimatedSection>

          <AnimatedSection className="col-span-12 lg:col-span-6">
            <PieceTypeBreakdownChart
              language={language}
              pieceTypeSummary={overviewData.pieceTypeSummary}
              translations={chartTranslations}
            />
          </AnimatedSection>
        </AnimatedGrid>
      </section>
    </PageLayout>
  );
}

export function generateStaticParams() {
  return OVERVIEW_LANGUAGES.map((language) => ({ language }));
}

export async function generateMetadata({ params }: PageProps<'/[language]'>): Promise<Metadata> {
  const { language: languageParam } = await params;
  const language = resolveOverviewLanguage(languageParam);
  const t = await getTranslations({ locale: language });
  const title = t('overview.meta.title');
  const description = t('overview.meta.description');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'brick-catalog.eu',
    },
  };
}
