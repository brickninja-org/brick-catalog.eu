import type { EntityIconType } from '@/components/entity/EntityIcon';
import type { IconSize } from '@/lib/icon';
import type { LocalizedEntity } from '@/lib/localized-name';
import type { RefProp } from '@/lib/react';
import type { WithIcon } from '@/lib/with';
import type { Language } from '@brickcatalog/database';
import type { LinkProps } from '@heroui/react';
import type { FC, ReactElement, ReactNode } from 'react';

import { getLinkProperties } from '@/lib/link-properties';

import { EntityLinkInternal } from './EntityLinkInternal';

type NameEntity = { name: string };

type LinkEntity = LocalizedEntity | NameEntity;

type LinkEntityWithId = WithIcon<LinkEntity> & {
  id: unknown,
};

interface CustomEntityLinkProps extends RefProp<HTMLAnchorElement> {
  href: string,
  entity: LinkEntityWithId,
  icon?: IconSize | 'none' | ReactElement,
  iconType?: EntityIconType,
  language?: Language,
  children?: ReactNode,
}

export type EntityLinkProps = Omit<LinkProps, keyof CustomEntityLinkProps> & CustomEntityLinkProps;

export const EntityLink: FC<CustomEntityLinkProps> = ({
  ref,
  entity,
  ...props
}) => {
  const cleanEntity = getLinkProperties(entity);

  return (
    <EntityLinkInternal
      ref={ref}
      entity={cleanEntity}
      {...props}
    />
  );
};
