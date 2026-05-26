'use client';

import type { FC, ReactNode } from 'react';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef
} from 'react';

export type TocAnchor = {
  id: string,
  element: HTMLElement,
  label: ReactNode,
  level: number,
};

export type TocNode = TocAnchor & {
  children: TocNode[],
};

export interface UseTableOfContentAnchorOptions {
  label?: ReactNode,
  level?: number,
  enabled?: boolean,
}

export interface TableOfContentProviderProps {
  children: ReactNode,
}

type TocContextValue = {
  anchors: TocAnchor[],
  registerAnchor: (anchor: TocAnchor) => () => void,
};

type TocAction =
  | { type: 'register', anchor: TocAnchor }
  | { type: 'unregister', id: string };

const TocContext = createContext<TocContextValue>({
  anchors: [],
  registerAnchor: () => () => {},
});

function sortAnchorsByDomOrder(anchors: TocAnchor[]) {
  return [...anchors].sort((a, b) => {
    if (a.element === b.element) return 0;

    const position = a.element.compareDocumentPosition(b.element);

    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;

    return 0;
  });
}

function reducer(state: TocAnchor[], action: TocAction): TocAnchor[] {
  switch (action.type) {
    case 'register': {
      const exists = state.some((anchor) => anchor.id === action.anchor.id);

      const next = exists
        ? state.map((anchor) =>
            anchor.id === action.anchor.id ? action.anchor : anchor,
          )
        : [...state, action.anchor];

      return sortAnchorsByDomOrder(next);
    }

    case 'unregister':
      return state.filter((anchor) => anchor.id !== action.id);

    default:
      return state;
  }
}

export const TableOfContentProvider: FC<TableOfContentProviderProps> = ({
  children,
}) => {
  const [anchors, dispatch] = useReducer(reducer, []);

  const registerAnchor = useCallback((anchor: TocAnchor) => {
    dispatch({ type: 'register', anchor });

    return () => {
      dispatch({ type: 'unregister', id: anchor.id });
    };
  }, []);

  const value = useMemo(
    () => ({ anchors, registerAnchor }),
    [anchors, registerAnchor],
  );

  return <TocContext.Provider value={value}>{children}</TocContext.Provider>;
};

export function useTableOfContentContext() {
  return useContext(TocContext);
}

export function useTableOfContentAnchor(
  id: string,
  {
    label,
    level,
    enabled = true,
  }: UseTableOfContentAnchorOptions = {},
) {
  const { registerAnchor } = useTableOfContentContext();
  const elementRef = useRef<HTMLElement | null>(null);

  const setRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  useEffect(() => {
    const element = elementRef.current;

    if (!element || !enabled) return;

    const parsedLevel = Number.parseInt(element.tagName.replace('H', ''), 10);
    const derivedLevel = level ?? (Number.isNaN(parsedLevel) ? 2 : parsedLevel);

    return registerAnchor({
      id,
      element,
      label: label ?? id,
      level: derivedLevel,
    });
  }, [enabled, id, label, level, registerAnchor]);

  return setRef;
}

export function buildTocTree(anchors: TocAnchor[]): TocNode[] {
  const root: TocNode[] = [];
  const stack: TocNode[] = [];

  for (const anchor of anchors) {
    const node: TocNode = {
      ...anchor,
      children: [],
    };

    while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }

    stack.push(node);
  }

  return root;
}
