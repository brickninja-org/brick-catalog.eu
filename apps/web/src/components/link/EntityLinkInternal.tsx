'use client';

import type { EntityLinkProps } from './EntityLink';
import type { Language } from '@brickcatalog/database';
import type { FC } from 'react';

import { Link } from '@heroui/react';
import { useLocale } from 'next-intl';

import { localizedName } from '@/lib/localized-name';

import { EntityIcon } from '../entity/EntityIcon';


export const EntityLinkInternal: FC<EntityLinkProps> = ({
  ref,
  href,
  entity,
  icon = 32,
  iconType,
  language,
  children,
  ...props
}) => {
  const defaultLanguage = useLocale() as Language;

  const name =
    'name' in entity
      ? entity.name
      : localizedName(entity, language ?? defaultLanguage);

  return (
    <Link
      ref={ref}
      href={href}
      hrefLang={language}
      {...props}
    >
      <>
        {icon !== 'none' && (typeof icon === 'number' ? (entity.icon ? <EntityIcon icon={entity.icon} size={icon} type={iconType}/> : null) : icon)}
        {children !== null && (children ?? name)}
      </>
    </Link>
  );
};
