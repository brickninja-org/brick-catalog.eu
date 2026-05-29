import type { DesignTooltip } from './DesignTooltip';
import type { FC, ReactNode } from 'react';

import { isTruthy } from '@brickninja-org/helper/is';
import { use } from 'react';

import { EntityIcon } from '../entity/EntityIcon';
import { FormatNumber } from '../format/FormatNumber';

export interface ClientDesignTooltipProps {
  tooltip: DesignTooltip | Promise<DesignTooltip>,
  fallbackIcon?: { id: number, signature: string } | null,
  hideTitle?: boolean,
}

function formatWeight(grams: number) {
  const units = ['g', 'kg', 't'];
  let value = grams;
  let unitIndex = 0;

  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }

  return (
    <>
      <FormatNumber value={value}/>
      {units[unitIndex]}
    </>
  );
}

export const ClientDesignTooltip: FC<ClientDesignTooltipProps> = ({
  tooltip: tooltipMaybePromise,
  fallbackIcon,
  hideTitle = false,
}) => {
  const tooltip = 'then' in tooltipMaybePromise
    ? use(tooltipMaybePromise)
    : tooltipMaybePromise;

  const icon = tooltip.icon ?? fallbackIcon;

  const data: ReactNode[] = [
    tooltip.id,
    tooltip.type,
    tooltip.weight && <p>Weight: {formatWeight(tooltip.weight)}</p>,
  ];

  return (
    <div className="max-w-md px-1 py-1.5">
      {!hideTitle && (
        <div className="flex flex-col items-center">
          {!!icon && <EntityIcon icon={icon} size={32}/>}
          <p className="mb-1 font-semibold">{tooltip.name}</p>
        </div>
      )}

      {data.filter(isTruthy).map((content, index) => {
        return <div key={index} className="">{content}</div>;
      })}
    </div>
  );
};
