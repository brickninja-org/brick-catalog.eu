import type { IconSize } from '@/lib/icon';
import type { WithIcon } from '@/lib/with';
import type { Design } from '@brickcatalog/database';
import type { FC, ReactNode } from 'react';

import { getLinkProperties } from '@/lib/link-properties';

import { EntityLink } from '../link/EntityLink';
import { Tooltip } from '../tooltip/Tooltip';

import { DesignLinkTooltip } from './DesignLinkTooltip';

export interface DesignLinkProps {
  design: WithIcon<Pick<Design, 'id' | 'name'>>,
  icon?: IconSize | 'none',
  revision?: string,
  children?: ReactNode,
}

export const DesignLink: FC<DesignLinkProps> = ({
  design,
  icon = 32,
  revision,
  children,
}) => {
  const entity = getLinkProperties(design);

  return (
    <Tooltip content={<DesignLinkTooltip design={entity} revision={revision}/>} offset={9}>
      <EntityLink entity={entity} href={`/element/design/${design.id}${revision ? `/${revision}` : ''}`} icon={icon}>
        {children}
      </EntityLink>
    </Tooltip>
  );
};
