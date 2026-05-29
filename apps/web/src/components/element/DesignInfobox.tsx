import type { Design } from '@brickcatalog/database';
import type { FC } from 'react';

import { Headline } from '@brickninja-org/ui';
import { ArrowUpRightFromSquare } from '@gravity-ui/icons';
import Link from 'next/link';

interface DesignInfoboxProps {
  design: Design,
}

export const DesignInfobox: FC<DesignInfoboxProps> = ({
  design,
}) => {
  return (
    <div>
      <Headline noToc id="links">Links</Headline>
      <div className="flex flex-wrap">
        <Link className="button button--tertiary w-full" href={`https://api.brick.ninja/v2/elements/designs/${design.id}?v=latest`}>
          <ArrowUpRightFromSquare/>
          API
        </Link>
      </div>
    </div>
  );
};
