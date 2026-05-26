'use client';

import type { RefProp } from '@/lib/react';
import type { FC, ReactNode } from 'react';

import { useMemo } from 'react';
import { cn } from 'tailwind-variants';

import { useFormat } from './Format.context';

const NARROW_NO_BREAK_SPACE = '\u{202F}';

export interface FormatNumberProps extends RefProp<HTMLDataElement> {
  value: number | bigint | undefined | null,
  className?: string,
  unit?: ReactNode,
  options?: Intl.NumberFormatOptions,
  approx?: boolean,
}

const format = new Intl.NumberFormat(undefined, { useGrouping: true });

export const FormatNumber: FC<FormatNumberProps> = ({ ref, value, className, unit, options, approx }) => {
  const formatted = useFormattedNumber(value, options);

  return (
    <data ref={ref} suppressHydrationWarning className={cn('whitespace-nowrap', className)} value={value?.toString() ?? undefined}>
      {(formatted === '0' && value !== 0 && approx) ? '~0' : formatted}
      {!!unit && <>{NARROW_NO_BREAK_SPACE}{unit}</>}
    </data>
  );
};

export function useFormattedNumber(value: number | bigint | undefined | null, options?: Intl.NumberFormatOptions): string {
  const { numberFormat, locale } = useFormat();

  const customFormat = useMemo(() => {
    if(!options) {
      return numberFormat;
    }

    return new Intl.NumberFormat(locale, { ...numberFormat.resolvedOptions(), ...options });
  }, [numberFormat, locale, options]);

  const formatted = value != null ? customFormat.format(value) : '?';

  return formatted;
}

export function formatNumber(value: number): string {
  return format.format(value);
}
