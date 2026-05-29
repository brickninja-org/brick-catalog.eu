import type { IconProp } from '.';
import type { RefProp } from '../lib/react';
import type { FC } from 'react';

import { cloneElement } from 'react';
import { cn } from 'tailwind-variants';

import { getIcon } from './index';

export interface IconProps extends RefProp {
  icon: IconProp,
  color?: unknown,
  className?: string,
}

export const Icon: FC<IconProps> = ({ ref, icon, color, className }) => {
  const c = getIcon(icon);

  return c ? cloneElement(c, { className: cn('', className), style: { '--icon-color': color }, ref }) : null;
};