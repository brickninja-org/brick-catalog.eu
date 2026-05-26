'use client';

import type { FC } from 'react';

import { Chip, ColorSwatch } from '@heroui/react';

export interface DesignElementColor {
  color?: {
    pieceColor?: string | null,
  } | null,
}

export interface DesignColorGroupProps {
  designId: number,
  elements?: DesignElementColor[],
}

const MAX_VISIBLE_COLORS = 4;
const DEMO_COLOR_COUNT = 12;
const DEMO_COLORS = [
  '#0055BF',
  '#237841',
  '#C91A09',
  '#FECCCF',
  '#6D6E5C',
  '#81007B',
  '#958A73',
  '#582A12',
  '#F2CD37',
  '#A0A5A9',
  '#008F9B',
  '#9BA19D',
];

export const DesignColorGroup: FC<DesignColorGroupProps> = ({ designId, elements }) => {
  const colors = getUniqueColors(elements);
  const resolvedColors = colors.length > 0 ? colors : getDemoColorsForRow(designId);
  const visibleColors = resolvedColors.slice(0, MAX_VISIBLE_COLORS);
  const hiddenCount = resolvedColors.length - visibleColors.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visibleColors.map((color, index) => (
        <ColorSwatch
          key={`${color}-${index}`}
          aria-label={`Element color ${index + 1}`}
          color={color}
          shape="square"
          size="sm"
        />
      ))}
      {hiddenCount > 0 ? (
        <Chip size="sm" variant="soft">
          +{hiddenCount}
        </Chip>
      ) : null}
    </div>
  );
};

function getUniqueColors(elements?: DesignElementColor[]): string[] {
  const colorMap = new Map<string, string>();

  (elements ?? []).forEach((element) => {
    const pieceColor = element.color?.pieceColor?.trim();

    if (!pieceColor || colorMap.has(pieceColor)) {
      return;
    }

    colorMap.set(pieceColor, pieceColor);
  });

  return Array.from(colorMap.values());
}

function getDemoColorsForRow(designId: number): string[] {
  const start = Math.abs(designId) % DEMO_COLORS.length;
  const rotated = [
    ...DEMO_COLORS.slice(start),
    ...DEMO_COLORS.slice(0, start),
  ];

  return rotated.slice(0, DEMO_COLOR_COUNT);
}
