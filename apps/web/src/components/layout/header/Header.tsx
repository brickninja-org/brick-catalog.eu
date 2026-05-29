import type { FC, ReactNode } from 'react';

export interface HeaderProps {
  children: ReactNode,
}

export const Header: FC<HeaderProps> = ({
  children,
}) => {
  return (
    <header className="fixed top-0 right-0 left-0 z-10 w-full bg-background">
      <div className="flex h-12 w-full items-center gap-4 px-4">
        {children}
      </div>
    </header>
  );
};
