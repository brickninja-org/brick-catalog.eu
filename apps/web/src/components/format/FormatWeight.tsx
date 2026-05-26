'use client';

import type { FormatWeightUnit } from './FormatWeight.logic';
import type { FC } from 'react';

import { useFormat } from './Format.context';
import { FormatNumber } from './FormatNumber';
import {
  getWeightDisplay,
  resolveAutoWeightUnit
} from './FormatWeight.logic';

export interface FormatWeightProps {
  // Always provide weight in grams.
  weight: number,
  unit?: FormatWeightUnit,
}

export const FormatWeight: FC<FormatWeightProps> = ({ weight, unit = 'auto' }) => {
  const { region } = useFormat();

  if (!Number.isFinite(weight)) {
    return <FormatNumber value={null}/>;
  }

  const resolvedUnit: Exclude<FormatWeightUnit, 'auto'> = unit === 'auto'
    ? resolveAutoWeightUnit(weight, region)
    : unit;

  const { value: displayValue, intlUnit, maximumFractionDigits } = getWeightDisplay(weight, resolvedUnit);

  return (
    <FormatNumber
      value={displayValue}
      options={{
        style: 'unit',
        unit: intlUnit,
        unitDisplay: 'short',
        maximumFractionDigits,
      }}
    />
  );
};
