'use client';

import type { TocNode } from './TableOfContent.context';
import type { FC, ReactNode } from 'react';

import { cn, ListBox } from '@heroui/react';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import {
  useTableOfContentAnchor,
  useTableOfContentContext
} from './TableOfContent.context';

export interface TableOfContentAnchorProps {
  id: string,
  children?: ReactNode,
  className?: string,
  as?: React.ElementType,
  level?: number,
}

export const TableOfContentAnchor: FC<TableOfContentAnchorProps> = ({
  id,
  children,
  className,
  as: Component = 'h2',
  level,
}) => {
  const ref = useTableOfContentAnchor(id, { label: children, level });

  return (
    <Component
      ref={ref}
      className={className}
      id={id}
      style={{ scrollMarginTop: '96px' }}
      tabIndex={-1}
    >
      {children}
    </Component>
  );
};

interface TocTreeProps {
  nodes: Array<{
    id: string,
    label: ReactNode,
    element: HTMLElement,
  }>,
  activeId?: string,
  onNavigate: (node: Pick<TocNode, 'id' | 'element'>) => void,
}

function TocTree({
  nodes,
  activeId,
  onNavigate,
}: TocTreeProps) {
  if (nodes.length === 0) return null;

  return (
    <ListBox
      aria-label="Table of content items"
      onAction={(key) => {
        const node = nodes.find((item) => item.id === String(key));
        if (!node) return;

        onNavigate(node);
      }}
    >
      {nodes.map((node) => {
        const isActive = activeId === node.id;

        return (
          <ListBox.Item
            key={node.id}
            aria-current={isActive ? 'location' : undefined}
            href={`#${node.id}`}
            textValue={typeof node.label === 'string' ? node.label : node.id}
          >
            {node.label}
          </ListBox.Item>
        );
      })}
    </ListBox>
  );
}

export interface TableOfContentProps {
  title?: ReactNode,
  offsetTop?: number,
  className?: string,
  surfaceVariant?: 'default' | 'secondary' | 'tertiary',
}

export const TableOfContent: FC<TableOfContentProps> = ({
  title = 'Table of contents',
  offsetTop = 64,
  className,
}) => {
  const { anchors } = useTableOfContentContext();
  const [activeId, setActiveId] = useState<string>();
  const ignoreScrollRef = useRef(false);

  useEffect(() => {
    if (anchors.length === 0) return;

    const visibleAnchors = new Map<
      string,
      {
        top: number,
      }
    >();

    const pickActiveAnchor = () => {
      if (ignoreScrollRef.current || visibleAnchors.size === 0) return;

      const sorted = [...visibleAnchors.entries()].sort((a, b) => {
        const aTop = a[1].top;
        const bTop = b[1].top;

        const aPastTop = aTop <= offsetTop;
        const bPastTop = bTop <= offsetTop;

        if (aPastTop && bPastTop) {
          return bTop - aTop;
        }

        if (aPastTop) return -1;
        if (bPastTop) return 1;

        return aTop - bTop;
      });

      setActiveId(sorted[0]?.[0]);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;

          if (entry.isIntersecting) {
            visibleAnchors.set(id, {
              top: entry.boundingClientRect.top,
            });
          } else {
            visibleAnchors.delete(id);
          }
        }

        pickActiveAnchor();
      },
      {
        root: null,
        rootMargin: `-${offsetTop}px 0px -70% 0px`,
        threshold: [0, 1],
      },
    );

    for (const anchor of anchors) {
      observer.observe(anchor.element);
    }

    const syncFromHashOrTop = () => {
      if (ignoreScrollRef.current) return;

      const hash = window.location.hash.slice(1);
      if (hash && anchors.some((anchor) => anchor.id === hash)) {
        setActiveId(hash);

        return;
      }

      const firstVisible = anchors.find((anchor) => {
        const rect = anchor.element.getBoundingClientRect();

        return rect.top >= 0;
      });

      setActiveId(firstVisible?.id ?? anchors[anchors.length - 1]?.id);
    };

    syncFromHashOrTop();

    return () => {
      observer.disconnect();
      visibleAnchors.clear();
    };
  }, [anchors, offsetTop]);

  const onNavigate = useCallback((node: Pick<TocNode, 'id' | 'element'>) => {
    ignoreScrollRef.current = true;
    setActiveId(node.id);

    node.element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    node.element.focus({ preventScroll: true });
    node.element.blur();

    if (history.replaceState) {
      history.replaceState(null, '', `#${node.id}`);
    }

    window.setTimeout(() => {
      ignoreScrollRef.current = false;
    }, 900);
  }, []);

  if (anchors.length === 0) return null;

  return (
    <aside className={cn('sticky top-12 hidden py-4 md:block', className)}>
      <nav
        aria-label="Table of contents"
        id="toc"
      >
        <div className="sr-only">
          {title}
        </div>
        <TocTree activeId={activeId} nodes={anchors} onNavigate={onNavigate} />
      </nav>
    </aside>
  );
};
