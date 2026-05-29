import type { Subcategory } from '@brickcatalog/database';
import type { FC } from 'react';

import { EntityLink } from '../link/EntityLink';

export interface ElementSubcategoryLinkProps {
  elementSubcategory: Pick<Subcategory, 'id' | 'name'>,
}

export const ElementSubcategoryLink: FC<ElementSubcategoryLinkProps> = ({ elementSubcategory }) => {
  return <EntityLink entity={elementSubcategory} href={`/element/subcategory/${elementSubcategory.id}`}/>;
};
