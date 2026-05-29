import type { ReactNode } from 'react';

import { buttonVariants } from '@heroui/styles';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface BackButtonProps {
  href: string,
  children: ReactNode,
}

export function BackButton({ href, children }: BackButtonProps) {
  return (
    <Link
      href={href}
      className={buttonVariants({
        variant: 'tertiary',
        size: 'sm',
        className: 'w-fit',
      })}
    >
      <ArrowLeft className="size-4" />
      {children}
    </Link>
  );
}
