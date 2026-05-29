import type { FC, ReactNode } from 'react';

interface DescriptionProps {
  actions?: ReactNode,
  children: ReactNode,
}

export const Description: FC<DescriptionProps> = ({
  actions,
  children,
}) => {
  return (
    <div className="mb-8 flex flex-wrap items-start gap-4 pb-1">
      <p className="mb-0 min-w-[18rem] max-w-3xl flex-1 text-sm leading-7 text-muted sm:text-base">
        {children}
      </p>
      {!!actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
};
