import 'server-only';

import type { Element } from '@brickninjaapi/types/data/element';
import type { FC } from 'react';

import { parseIcon } from '@/lib/icon';

import { ClientElementTooltip } from './ElementTooltip.client';

export interface ElementTooltipProps {
  element: Element,
  hideTitle?: boolean,
}

export const ElementTooltip: FC<ElementTooltipProps> = async ({
  element,
  hideTitle,
}) => {
  const tooltip = await createTooltip(element);

  return <ClientElementTooltip hideTitle={hideTitle} tooltip={tooltip}/>;
};

export function createTooltip(element: Element): ElementTooltip {
  return {
    name: element.name,
    icon: parseIcon(element.icon),
  };
}

export interface ElementTooltip {
  name: string,
  icon?: { id: number, signature: string },
}
