import type { OverviewData } from './overview-data';
import type { Language } from '@brickcatalog/database';

import { OverviewEmptyStateCard } from './OverviewEmptyStateCard';
import { PieceTypeBreakdownBarChart } from './PieceTypeBreakdownBarChart.client';
import { YearlyElementsBarChart } from './YearlyElementsBarChart.client';

interface OverviewBarChartsProps {
  language: Language,
  yearlyData: OverviewData['yearlyData'],
  pieceTypeSummary: OverviewData['pieceTypeSummary'],
  translations: {
    yearlyTitle: string,
    yearlyDescription: string,
    yearlyOpenAriaLabel: string,
    yearlyTooltipLabelPrefix: string,
    pieceTypeTitle: string,
    pieceTypeDescription: string,
    pieceTypeOpenAriaLabel: string,
    pieceTypeEmptyState: string,
    pieceTypeTotalLabel: string,
    pieceTypeLegoLabel: string,
    pieceTypeDuploLabel: string,
    pieceTypeTechnicLabel: string,
  },
}

export function YearlyElementsChart({
  language,
  yearlyData,
  translations,
}: Pick<OverviewBarChartsProps, 'language' | 'yearlyData' | 'translations'>) {
  return (
    <YearlyElementsBarChart
      data={yearlyData}
      description={translations.yearlyDescription}
      language={language}
      openAriaLabel={translations.yearlyOpenAriaLabel}
      title={translations.yearlyTitle}
      tooltipLabelPrefix={translations.yearlyTooltipLabelPrefix}
    />
  );
}

export function PieceTypeBreakdownChart({
  language,
  pieceTypeSummary,
  translations,
}: Pick<OverviewBarChartsProps, 'language' | 'pieceTypeSummary' | 'translations'>) {
  if (!pieceTypeSummary) {
    return <OverviewEmptyStateCard message={translations.pieceTypeEmptyState}/>;
  }

  return (
    <PieceTypeBreakdownBarChart
      description={translations.pieceTypeDescription}
      duplo={pieceTypeSummary.duplo}
      duploLabel={translations.pieceTypeDuploLabel}
      language={language}
      lego={pieceTypeSummary.lego}
      legoLabel={translations.pieceTypeLegoLabel}
      openAriaLabel={translations.pieceTypeOpenAriaLabel}
      technic={pieceTypeSummary.technic}
      technicLabel={translations.pieceTypeTechnicLabel}
      title={translations.pieceTypeTitle}
      total={pieceTypeSummary.total}
      totalLabel={translations.pieceTypeTotalLabel}
      year={pieceTypeSummary.year}
    />
  );
}
