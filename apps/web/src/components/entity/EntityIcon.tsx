'use client';

import type { FixedIconSize } from '@/lib/icon';
import type { Icon } from '@brickcatalog/database';
import type { FC, RefCallback } from 'react';

import { useCallback, useState } from 'react';
import { cn } from 'tailwind-variants';

import { getIconSize, getIconUrl } from '@/lib/icon';

export type EntityIconType = unknown;

export interface EntityIconProps {
  icon: Omit<Icon, 'color' | 'signature'> & Partial<Pick<Icon, 'color' | 'signature'>>,
  size?: number,
  type?: unknown,
  className?: string,
}

export const EntityIcon: FC<EntityIconProps> = ({
  icon,
  size = 64,
  type,
  className,
}) => {
  const scaledIconSize = size;
  const iconSize = getIconSize(scaledIconSize);

  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  const handleLoad = useCallback(
    () => { setLoading(false); },
    [],
  );

  const handleError = useCallback(
    () => setErrored(true),
    [],
  );

  const handleRef: RefCallback<HTMLImageElement> = useCallback(
    (img) => {
      if (img?.complete) {
        setLoading(false);
      }
    },
    [],
  );

  return (
    <span data-icon-type={type}>
      <img
        ref={handleRef}
        alt=""
        className={cn(className)}
        decoding="async"
        height={size}
        loading="lazy"
        referrerPolicy="no-referrer"
        src={getIconUrl(icon, iconSize, errored)}
        srcSet={iconSize < 64 && !errored ? `${getIconUrl(icon, iconSize * 2 as FixedIconSize)} 2x` : undefined}
        width={size}
        onError={handleError}
        onLoad={handleLoad}
      />
    </span>
  );
};
