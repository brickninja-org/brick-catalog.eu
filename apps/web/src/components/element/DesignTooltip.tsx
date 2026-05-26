import 'server-only';

import type { PieceType } from '@brickcatalog/database';
import type { ElementDesign } from '@brickninjaapi/types/data/element';
import type { FC } from 'react';

import { ClientDesignTooltip } from './DesignTooltip.client';


export interface DesignTooltip {
  id: number,
  name: string,
  icon?: { id: number, signature: string },
  type: PieceType,
  weight: number,
}

export interface DesignTooltipProps {
  design: ElementDesign,
  hideTitle?: boolean,
}

export const DesignTooltip: FC<DesignTooltipProps> = async ({
  design,
  hideTitle,
}) => {
  const tooltip = await createTooltip(design);

  return <ClientDesignTooltip hideTitle={hideTitle} tooltip={tooltip}/>;
};

export function createTooltip(design: ElementDesign): DesignTooltip {
  return {
    id: design.id,
    name: design.name,
    // icon: parseIcon(design.icon),
    type: design.piece_type,
    weight: design.weight,
  };
}
