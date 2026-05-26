'use client';

import type { WithIcon } from '@/lib/with';
import type { Design } from '@brickcatalog/database';
import type { FC } from 'react';

import { Skeleton } from '@heroui/react';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { useJsonFetchPromise } from '@/lib/use-fetch';

import { EntityIcon } from '../entity/EntityIcon';

import { DesignTooltip } from './DesignTooltip';
import { ClientDesignTooltip } from './DesignTooltip.client';

export interface DesignLinkTooltipProps {
  design: WithIcon<Pick<Design, 'id' | 'name'>>,
  revision?: string,
}

export const DesignLinkTooltip: FC<DesignLinkTooltipProps> = ({
  design,
  revision,
}) => {
  const tooltip = useJsonFetchPromise<DesignTooltip>(`/element/design/${design.id}/tooltip${revision ? `?revision=${revision}` : ''}`);

  return (
    <div>
      <ErrorBoundary fallback={<DesignLinkTooltipFallback error design={design}/>}>
        <Suspense fallback={<DesignLinkTooltipFallback design={design}/>}>
          <ClientDesignTooltip fallbackIcon={design.icon} tooltip={tooltip}/>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

type DesignLinkTooltipInternalProps = DesignLinkTooltipProps & { error?: boolean };

const DesignLinkTooltipFallback: FC<DesignLinkTooltipInternalProps> = ({
  design,
  error,
}) => {
  return (
    <>
      <div className="w-full max-w-md space-y-2">
        {!!design.icon && <EntityIcon icon={design.icon} size={32}/>}
        {design.name}
      </div>
      {error
        ? (<div className="text-danger">Error loading tooltip</div>)
        : (<div className=""><Skeleton className="h-3 w-3/6 rounded"/><Skeleton className="h-3 w-5/6 rouned"/></div>)
      }
    </>
  );
};
