import type { CSSProperties, FC, ReactNode } from 'react';

import { preload } from 'react-dom';
import { cn } from 'tailwind-variants';

import { PageLayout } from './PageLayout';

const heroMask = new URL('./hero-mask.svg', import.meta.url).toString();

export interface HeroLayoutProps {
  children: ReactNode,
  hero: ReactNode,
  heroClassName?: string,
  navBar?: ReactNode,
  color?: string,
  toc?: boolean,
  skipPreload?: boolean,
  skipLayout?: boolean,
}

export const HeroLayout: FC<HeroLayoutProps> = ({
  children,
  hero,
  heroClassName,
  navBar,
  color,
  toc,
  skipPreload,
  skipLayout,
}) => {
  if (!skipPreload) {
    preload(heroMask, { as: 'image' });
  }

  const heroStyle: CSSProperties = {
    backgroundImage: `url("${heroMask}"), radial-gradient(at center, transparent, transparent 50%, rgba(0, 0, 0, 0.1) 90%)`,
    ...(color ? { '--hero-color': color } : {}),
  } as CSSProperties;

  return (
    <div className="w-full [--hero-color:#b7000d]">
      <section
        style={heroStyle}
        className={cn(
          'relative overflow-hidden border-b border-default-200 px-4 py-8 text-white',
          'bg-(--hero-color)',
          '[text-shadow:0_0_2px_rgba(0,0,0,0.2)]',
          'bg-blend-multiply',
          'bg-top-left',
          'bg-cover',
          'bg-no-repeat',
          heroClassName,
        )}
      >
        <div className="mx-auto w-full max-w-248">
          {hero}
        </div>
      </section>

      {navBar}

      {skipLayout ? children : <PageLayout className="p-0" toc={toc}>{children}</PageLayout>}
    </div>
  );
};
