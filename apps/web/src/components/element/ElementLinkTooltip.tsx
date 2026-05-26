'use client';

import type { ElementTooltip } from './ElementTooltip';
import type { WithIcon } from '@/lib/with';
import type { Element } from '@brickcatalog/database';
import type { FC } from 'react';

import { Skeleton } from '@heroui/react';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { useJsonFetchPromise } from '@/lib/use-fetch';

import { EntityIcon } from '../entity/EntityIcon';

import { ClientElementTooltip } from './ElementTooltip.client';


export interface ElementLinkTooltipProps {
  element: WithIcon<Pick<Element, 'id' | 'name'>>,
  revision?: string,
}

export const ElementLinkTooltip: FC<ElementLinkTooltipProps> = ({
  element,
  revision,
}) => {
  const tooltip = useJsonFetchPromise<ElementTooltip>(`/element/${element.id}/tooltip${revision ? `?revision=${revision}` : ''}`);

  return (
    <div>
      <ErrorBoundary fallback={<ElementLinkTooltipFallback element={element}/>}>
        <Suspense fallback={<ElementLinkTooltipFallback element={element}/>}>
          <ClientElementTooltip fallbackIcon={element.icon} tooltip={tooltip}/>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

type ElementLinkTooltipInternalProps = ElementLinkTooltipProps & { error?: boolean };

const ElementLinkTooltipFallback: FC<ElementLinkTooltipInternalProps> = ({ element, error }) => {
  return (
    <>
      <div className="">
        {!!element.icon && (<EntityIcon icon={element.icon} size={32}/>)}
        {element.name}
      </div>
      {error
        ? (<div className="text-warning">Error loading tooltip</div>)
        : (
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 shrink-0"/>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-30 rounded-lg"/>
              </div>
            </div>
          )
      }
    </>
  );
};
