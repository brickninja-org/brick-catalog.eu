import type { FC } from 'react';

import { cn } from 'tailwind-variants';

interface BrickCatalogLogoProps {
  className?: string,
}

export const BrickCatalogLogo: FC<BrickCatalogLogoProps> = ({
  className,
}) => {
  return (
    <>
      {/** TODO: add svg */}
      <h2 className={cn('font-semibold text-2xl', className)}>
        BRICK
        <span className="font-light">CATALOG</span>
      </h2>
    </>
  );
};
