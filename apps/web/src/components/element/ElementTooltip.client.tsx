import type { ElementTooltip } from './ElementTooltip';
import type { FC } from 'react';

import { use } from 'react';

import { EntityIcon } from '../entity/EntityIcon';

export interface ClientElementTooltipProps {
  tooltip: ElementTooltip | Promise<ElementTooltip>,
  fallbackIcon?: { id: number, signature: string } | null,
  hideTitle?: boolean,
}

export const ClientElementTooltip: FC<ClientElementTooltipProps> = ({
  tooltip: tooltipMaybePromise,
  fallbackIcon,
  hideTitle = false,
}) => {
  const tooltip = 'then' in tooltipMaybePromise
    ? use(tooltipMaybePromise)
    : tooltipMaybePromise;

  const icon = tooltip.icon ?? fallbackIcon;

  return (
    <div>
      {!hideTitle && (
        <div className="">
          {!!icon && <EntityIcon icon={icon} size={32}/>}
          {tooltip.name}
        </div>
      )}

      <div>no body</div>
    </div>
  );
};
