import type { MDXComponents } from '@types/mdx';
import type { Route } from 'next';
import type { ComponentPropsWithoutRef } from 'react';

import { cn, linkVariants, Separator, Typography } from '@heroui/react';
import NextLink from 'next/link';

type MDXLinkProps = ComponentPropsWithoutRef<'a'>;

function MDXLink({ href = '', children, className, ...props }: MDXLinkProps) {
  const isInternalLink = href.startsWith('/') || href.startsWith('#');
  const linkClassName = cn(linkVariants({ className }));

  if (isInternalLink) {
    return (
      <NextLink className={linkClassName} href={href as Route} {...props}>
        {children}
      </NextLink>
    );
  }

  return (
    <a
      className={linkClassName}
      href={href}
      rel="nooper noreferrer nofollow"
      target="_blank"
      {...props}
    >
      {children}
    </a>
  );
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    // Headings - with generous spacing for editorial feel
    h1: (props: Omit<ComponentPropsWithoutRef<typeof Typography['Heading']>, 'type'>) => (
      <Typography type="h1" {...props}/>
    ),
    h2: (props: Omit<ComponentPropsWithoutRef<typeof Typography['Heading']>, 'type'>) => (
      <Typography className="mt-12 mb-6" type="h2" {...props}/>
    ),
    h3: (props: Omit<ComponentPropsWithoutRef<typeof Typography['Heading']>, 'type'>) => (
      <Typography className="mt-8 mb-4" type="h3" {...props}/>
    ),
    h4: (props: Omit<ComponentPropsWithoutRef<typeof Typography['Heading']>, 'type'>) => (
      <Typography type="h4" {...props}/>
    ),

    // Body text
    p: (props: ComponentPropsWithoutRef<typeof Typography['Paragraph']>) => (
      <Typography type="body" {...props}/>
    ),

    // Blockquotes - editorial style with subtle background
    blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
      <blockquote
        className="my-8 border-accent border-l-4 bg-default py-4 pr-4 pl-6 text-foreground text-lg italic"
        {...props}
      />
    ),

    // Lists
    ul: (props: ComponentPropsWithoutRef<'ul'>) => (
      <ul className="my-6 ml-6 list-disc space-y-2" {...props}/>
    ),
    ol: (props: ComponentPropsWithoutRef<'ol'>) => (
      <ol className="my-6 ml-6 list-decimal space-y-2" {...props}/>
    ),
    li: (props: ComponentPropsWithoutRef<'li'>) => (
      <li className="text-base text-foreground leading-7" {...props}/>
    ),

    // Links - styled for blog content
    a: MDXLink,

    // Tables - Editorial style with accent border (HybridStyle)
    table: (props: ComponentPropsWithoutRef<'table'>) => (
      <div className="my-8 w-full overflow-x-auto border-accent border-l-4 pl-4">
        <table className="w-full border-collapse" {...props} />
      </div>
    ),
    thead: (props: ComponentPropsWithoutRef<'thead'>) => (
      <thead className="bg-transparent" {...props} />
    ),
    th: (props: ComponentPropsWithoutRef<'th'>) => (
      <th
        className="border-foreground border-b-2 px-4 py-3 text-left font-bold text-[10px] text-muted uppercase tracking-wider [&:not(:first-child)]:text-right [&[align=center]]:text-center [&[align=right]]:text-right"
        scope="col"
        {...props}
      />
    ),
    td: (props: ComponentPropsWithoutRef<'td'>) => (
      <td
        className="px-4 py-3 text-sm tabular-nums [&:last-child]:font-semibold [&:last-child]:text-accent [&:not(:first-child)]:text-right [&[align=center]]:text-center [&[align=right]]:text-right"
        {...props}
      />
    ),
    tr: (props: ComponentPropsWithoutRef<'tr'>) => (
      <tr
        className="border-border border-b transition-colors last:border-none hover:bg-default"
        {...props}
      />
    ),

    // Horizontal rule
    hr: () => <Separator className="my-12" />,

    // Strong/Bold - slightly heavier for emphasis
    strong: (props: ComponentPropsWithoutRef<'strong'>) => (
      <strong className="font-semibold text-foreground" {...props} />
    ),

    ...components,
  };
}

export const useMDXComponents = getMDXComponents;
