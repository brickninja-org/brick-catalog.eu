'use client';

import type { FC } from 'react';

import { getCurrencyFormatOptions } from './FormatCurrency.logic';
import { FormatNumber } from './FormatNumber';

export interface FormatCurrencyProps {
  value: number | bigint | undefined | null,
  currency: string,
  options?: Intl.NumberFormatOptions,
}

export const FormatCurrency: FC<FormatCurrencyProps> = ({ value, currency, options }) => {
  return (
    <FormatNumber
      options={getCurrencyFormatOptions(currency, options)}
      value={value}
    />
  );
};
