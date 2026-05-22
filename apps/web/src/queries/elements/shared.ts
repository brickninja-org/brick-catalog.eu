import { cacheLife, cacheTag } from 'next/cache';

import { db } from '@/lib/prisma';

type ElementsCacheScope = 'annual' | 'monthly' | 'piece-types';
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const INVALID_MONTH_MESSAGE = 'Invalid month format, expected YYYY-MM';

interface LatestCreatedAtRow {
  latestCreatedAt: Date | null,
}

export function applyElementsCache(...scopes: ElementsCacheScope[]): void {
  cacheLife('max');
  cacheTag('elements');

  for (const scope of new Set(scopes)) {
    cacheTag(`elements:${scope}`);
  }
}

export async function getLatestElementCreatedAt(): Promise<Date | null> {
  const rows = await db.$queryRaw<LatestCreatedAtRow[]>`
    SELECT MAX("createdAt") AS "latestCreatedAt"
    FROM "Element"
  `;

  return rows[0]?.latestCreatedAt ?? null;
}

export function getYearRange(year: number): { from: Date, to: Date } {
  return {
    from: new Date(Date.UTC(year, 0, 1)),
    to: new Date(Date.UTC(year + 1, 0, 1)),
  };
}

export function getMonthRange(month: string): { from: Date, to: Date } {
  if (!MONTH_PATTERN.test(month)) {
    throw new Error(`${INVALID_MONTH_MESSAGE}: "${month}"`);
  }

  const [yearPart, monthPart] = month.split('-');
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;

  if (!Number.isInteger(year) || !Number.isInteger(monthIndex)) {
    throw new Error(`${INVALID_MONTH_MESSAGE}: "${month}"`);
  }

  return {
    from: new Date(Date.UTC(year, monthIndex, 1)),
    to: new Date(Date.UTC(year, monthIndex + 1, 1)),
  };
}

export function formatYearMonth(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
}
