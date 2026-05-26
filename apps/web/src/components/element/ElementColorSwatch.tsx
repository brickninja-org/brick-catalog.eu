'use client';

import type { ColorFamily } from '@brickcatalog/database';
import type { FC } from 'react';

import { Chip, ColorSwatch, cn } from '@heroui/react';

import { Tooltip } from '@/components/tooltip/Tooltip';

export interface ElementColorInput {
  id?: number | string,
  name?: string | null,
  family?: ColorFamily | string | null,
  pieceColor?: string | null,
  contrastColor?: string | null,
}

export interface ElementColorSwatchProps {
  color?: ElementColorInput | null,
  colors?: ElementColorInput[] | null,
  pieceColor?: string | null,
  colorName?: string | null,
  colorId?: number | string,
  colorFamily?: ColorFamily | string | null,
  contrastColor?: string | null,
  className?: string,
  swatchClassName?: string,
  showMeta?: boolean,
  showTooltip?: boolean,
  swatchSize?: 'sm' | 'md' | 'lg',
  maxVisible?: number,
  density?: 'compact' | 'comfortable',
}

const FALLBACK_LABEL = 'Unknown color';

export const ElementColorSwatch: FC<ElementColorSwatchProps> = ({
  color,
  colors,
  pieceColor,
  colorName,
  colorId,
  colorFamily,
  contrastColor,
  className,
  swatchClassName,
  showMeta,
  showTooltip = true,
  swatchSize = 'md',
  maxVisible = 6,
  density = 'compact',
}) => {
  const resolvedList = (colors?.length
    ? colors
    : [{
      id: color?.id ?? colorId,
      name: color?.name ?? colorName,
      family: color?.family ?? colorFamily,
      pieceColor: color?.pieceColor ?? pieceColor,
      contrastColor: color?.contrastColor ?? contrastColor,
    }]).map((entry) => ({
    id: entry.id,
    name: entry.name?.trim() || FALLBACK_LABEL,
    family: entry.family,
    pieceColor: entry.pieceColor?.trim() || null,
    contrastColor: entry.contrastColor?.trim() || null,
  }));

  const visible = resolvedList.slice(0, Math.max(1, maxVisible));
  const hiddenCount = Math.max(0, resolvedList.length - visible.length);
  const isMulti = resolvedList.length > 1;
  const withMeta = showMeta ?? !isMulti;
  const isCompact = density === 'compact';

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className={cn('inline-flex items-center', isCompact ? 'gap-1' : 'gap-1.5')}>
        {visible.map((entry, index) => {
          const hasColor = Boolean(entry.pieceColor);
          const ariaLabel = entry.id ? `${entry.name} (#${entry.id})` : entry.name;
          const metaText = [entry.family, entry.pieceColor].filter(Boolean).join(' • ');

          const node = hasColor ? (
            <ColorSwatch
              aria-label={ariaLabel}
              className={cn('shrink-0 ring-1 ring-black/10', swatchClassName)}
              color={entry.pieceColor!}
              shape="square"
              size={swatchSize}
              style={entry.contrastColor ? { borderColor: entry.contrastColor } : undefined}
            />
          ) : (
            <div
              aria-label={FALLBACK_LABEL}
              className={cn(
                'grid place-items-center rounded-small border border-dashed border-divider bg-content2 text-[10px] font-semibold uppercase tracking-wide text-foreground-500',
                {
                  'size-4': swatchSize === 'sm',
                  'size-5': swatchSize === 'md',
                  'size-6': swatchSize === 'lg',
                },
                swatchClassName,
              )}
              role="img"
            >
              ?
            </div>
          );

          return showTooltip ? (
            <Tooltip
              key={`${entry.id ?? entry.pieceColor ?? 'unknown'}-${index}`}
              content={(
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{entry.name}</span>
                  {entry.id ? <span className="font-mono text-xs text-foreground-500">#{entry.id}</span> : null}
                  {metaText ? <span className="text-xs text-foreground-500">{metaText}</span> : null}
                </div>
              )}
              placement="top"
              showArrow
            >
              {node}
            </Tooltip>
          ) : (
            <span key={`${entry.id ?? entry.pieceColor ?? 'unknown'}-${index}`}>{node}</span>
          );
        })}

        {hiddenCount > 0 ? (
          <Chip size="sm" variant="soft">
            +{hiddenCount}
          </Chip>
        ) : null}
      </div>

      {withMeta && visible[0] ? (
        <span className={cn('inline-flex min-w-0 items-baseline', isCompact ? 'gap-1.5' : 'gap-2')}>
          <span className="truncate font-medium text-foreground">{visible[0].name}</span>
          {visible[0].id ? <span className="shrink-0 font-mono text-xs text-foreground-500">#{visible[0].id}</span> : null}
          {visible[0].family ? (
            <Chip className="max-w-28 truncate" size="sm" variant="flat">
              {visible[0].family}
            </Chip>
          ) : null}
        </span>
      ) : null}
    </div>
  );
};
