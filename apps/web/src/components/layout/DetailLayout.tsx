import type { CSSProperties, FC, ReactNode } from 'react';

import { TableOfContent, TableOfContentProvider } from '@brickninja-org/ui';
import { cn } from 'tailwind-variants';

import { DetailLayoutActions, DetailLayoutInfobox } from './DetailLayout.client';

export interface DetailLayoutProps {
  title: ReactNode,
  icon?: ReactNode,
  breadcrumbs?: ReactNode,
  actions?: ReactNode[],
  infobox?: ReactNode,
  className?: string,
  color?: string,
  children: ReactNode,
}

export const DetailLayout: FC<DetailLayoutProps> = ({
  title,
  icon,
  breadcrumbs,
  actions,
  infobox,
  className,
  color,
  children,
}) => {
  const hasIcon = !!icon;
  const hasActions = !!actions?.length;
  const hasInfobox = !!infobox;
  const titleStyle: CSSProperties | undefined = color ? { color } : undefined;
  const headlineStyle: CSSProperties | undefined = color
    ? { backgroundImage: `linear-gradient(150deg, color-mix(in srgb, ${color} 15%, transparent), transparent 128px)` }
    : undefined;
  const layoutClassName = cn(
    'grid w-full',
    'max-[920px]:grid-cols-1 max-[920px]:grid-rows-[min-content_min-content_1fr]',
    'min-[921px]:grid-cols-[calc(100%-clamp(250px,25%,360px)-16px)_clamp(250px,25%,360px)_16px]',
    hasInfobox ? 'min-[921px]:grid-rows-[min-content_min-content_1fr]' : 'min-[921px]:grid-rows-[min-content_1fr]',
  );

  return (
    <TableOfContentProvider>
      <main className={cn(layoutClassName, className)}>
        <div
          aria-hidden
          className="hidden min-[921px]:col-start-3 min-[921px]:row-start-1 min-[921px]:block min-[921px]:border-b min-[921px]:border-default-200 min-[921px]:bg-default-100"
        />

        <header
          style={headlineStyle}
          className={cn(
            'p-4',
            'grid items-start gap-x-4 gap-y-2',
            hasIcon ? 'grid-cols-[3.25rem_minmax(0,1fr)_min-content]' : 'grid-cols-[minmax(0,1fr)_min-content]',
            'min-[921px]:col-start-1 min-[921px]:row-start-1',
            hasInfobox ? 'min-[921px]:col-end-2' : 'min-[921px]:col-end-3',
          )}
        >
          <div className="contents">
            {hasIcon ? (
              <div className="row-span-2 mt-0.5 size-13 overflow-hidden rounded-lg">
                {icon}
              </div>
            ) : null}

            <div className={cn('min-w-0', hasIcon ? 'col-start-2' : 'col-start-1')}>
              <h1
                className="min-w-0 break-words text-[22px] font-semibold leading-tight tracking-tight text-foreground"
                style={titleStyle}
              >
                {title}
              </h1>

              {!!breadcrumbs && (
                <div className="mt-2 min-w-0 text-xs leading-5 text-muted">
                  {breadcrumbs}
                </div>
              )}
            </div>

            {hasActions ? (
              <div className={cn('row-span-2 row-start-1 self-start', hasIcon ? 'col-start-3' : 'col-start-2')}>
                <DetailLayoutActions>
                  {actions?.map((action, index) => (
                    <div key={index}>{action}</div>
                  ))}
                </DetailLayoutActions>
              </div>
            ) : null}

            {!hasActions && !hasIcon ? (
              <div aria-hidden className="hidden md:block"/>
            ) : null}
          </div>
        </header>

        {hasInfobox ? (
          <DetailLayoutInfobox>
            {infobox}
          </DetailLayoutInfobox>
        ) : null}

        <div
          className={cn(
            'min-w-0 p-4 min-[921px]:col-start-1',
            hasInfobox ? 'min-[921px]:col-end-2 min-[921px]:row-start-2 min-[921px]:row-end-4' : 'min-[921px]:col-end-2 min-[921px]:row-start-2',
          )}
        >
          {children}
        </div>

        <aside
          className={cn(
            'max-[920px]:hidden min-[921px]:col-start-2 min-[921px]:col-end-3',
            hasInfobox ? 'min-[921px]:row-start-3' : 'min-[921px]:row-start-2',
          )}
        >
          <TableOfContent/>
        </aside>
      </main>
    </TableOfContentProvider>
  );
};
