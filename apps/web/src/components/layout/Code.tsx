import type { FC, ReactNode } from 'react';

import { Source_Code_Pro } from 'next/font/google';
import { cn } from 'tailwind-variants';

import { CodeClient } from './Code.client';

export interface CodeProps {
  borderless?: boolean,
  inline?: boolean,
  lines?: ReactNode[],
  showLineNumbers?: boolean,
  children?: ReactNode,
}

const font = Source_Code_Pro({
  subsets: ['latin'],
  weight: 'variable',
  fallback: ['monospace'],
});

export const Code: FC<CodeProps> = ({
  borderless = false,
  inline = false,
  lines,
  showLineNumbers = true,
  children = null,
}) => {
  if (inline) {
    return (
      <code className={cn(font.className)}>{children}</code>
    );
  }

  return (
    <CodeClient borderless={borderless}>
      {lines ? (
        <ol className={cn('m-0 list-none p-0 text-sm leading-5', font.className)}>
          {lines.map((line, index) => (
            <li
              key={index}
              className={cn(
                'grid items-start rounded-md px-2 py-px',
                showLineNumbers
                  ? 'grid-cols-[auto_1fr] gap-4'
                  : 'grid-cols-1',
              )}
            >
              {showLineNumbers ? (
                <span className="select-none text-right text-xs text-muted">
                  {String(index + 1).padStart(2, ' ')}
                </span>
              ) : null}
              <code className="min-w-0 whitespace-pre">{line}</code>
            </li>
          ))}
        </ol>
      ) : (
        <pre className={cn('m-0 rounded-md px-2 py-1 text-sm leading-5', font.className)}>
          <code>{children}</code>
        </pre>
      )}
    </CodeClient>
  );
};
