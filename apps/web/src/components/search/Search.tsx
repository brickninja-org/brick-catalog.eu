'use client';

import type { TranslationSubset } from '@/i18n/types';
import type { SearchFieldProps } from '@heroui/react';
import type {
  FC,
  FormEventHandler,
  KeyboardEvent as ReactKeyboardEvent,
  ReactElement,
} from 'react';

import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useDismiss,
  useFloating,
  useFocus,
  useInteractions,
  useListNavigation,
  useRole,
} from '@floating-ui/react';
import {
  cn,
  Description,
  Form,
  Header,
  Kbd,
  Label,
  ListBox,
  SearchField,
  SearchFieldGroup,
  Spinner,
  Surface,
} from '@heroui/react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useDebounce } from '@/lib/use-debounce';

import { usePageResults } from './usePageResults';
import { useSearchApiResults } from './useSearchApiResults';

export interface SearchProps
  extends Pick<SearchFieldProps, 'className' | 'fullWidth'> {
  translations: TranslationSubset<
    | 'search.placeholder'
    | 'search.empty-state'
    | 'search.loading'
    | 'search.results.elements.label'
    | 'search.results.elements.categories'
    | 'search.results.elements.colors'
    | 'search.results.elements.designs'
    | 'search.results.pages'
    | 'search.results.elements.subcategories'
  >,
}

export const Search: FC<SearchProps> = ({
  className,
  fullWidth,
  translations,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<Array<HTMLElement | null>>([]);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const searchValue = useDebounce(value, 300);

  const searchResults = [
    ...useSearchApiResults(searchValue),
    usePageResults(searchValue),
  ];

  const loading = searchResults.some((result) => result.loading);
  const hasQuery = value.trim().length > 0;
  const hasResults = searchResults.some(({ results }) => results.length > 0);

  const flatResults = useMemo(
    () => searchResults.flatMap(({ results }) => results),
    [searchResults],
  );

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip(),
      shift({ padding: 16 }),
      size({
        padding: 16,
        apply({ rects, elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${Math.min(384, availableHeight)}px`,
          });
        },
      }),
    ],
  });

  const { getReferenceProps, getFloatingProps, getItemProps } =
    useInteractions([
      useFocus(context, {
        visibleOnly: false,
      }),
      useDismiss(context, {
        outsidePressEvent: 'mousedown',
      }),
      useRole(context, {
        role: 'listbox',
      }),
      useListNavigation(context, {
        listRef,
        activeIndex,
        onNavigate: setActiveIndex,
        virtual: true,
        loop: true,
        scrollItemIntoView: {
          block: 'nearest',
        },
      }),
    ]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        (
          event.target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)
        )
      ) {
        return;
      }

      if (event.ctrlKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        event.stopPropagation();

        inputRef.current?.focus();
        inputRef.current?.select();

        if (hasQuery) {
          setOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [hasQuery]);

  const closeAndReset = useCallback(() => {
    setOpen(false);
    setActiveIndex(null);
  }, []);

  const navigateToResult = useCallback(
    (href: string) => {
      closeAndReset();

      if (href.startsWith('http')) {
        window.open(href, '_blank', 'noopener,noreferrer');

        return;
      }

      window.location.assign(href);
    },
    [closeAndReset],
  );

  const handleSearchChange = useCallback((nextValue: string) => {
    const nextHasQuery = nextValue.trim().length > 0;

    setValue(nextValue);
    setOpen(nextHasQuery);
    setActiveIndex(null);
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      event.preventDefault();

      const result = flatResults[activeIndex ?? -1];

      if (result) {
        navigateToResult(result.href);
      }
    },
    [activeIndex, flatResults, navigateToResult],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAndReset();

        return;
      }

      if (event.key === 'Enter') {
        // get active element, fallback to first element
        const current = listRef.current.length > 0
          ? listRef.current[activeIndex ?? 0]
          : null;

        if (current === null) {
          return;
        }

        current.click();
        event.preventDefault();
      }
    },
    [activeIndex],
  );

  let itemIndex = 0;

  return (
    <div
      ref={refs.setReference}
      {...getReferenceProps()}
      className={cn('relative', className)}
    >
      <Form onSubmit={handleSubmit}>
        <SearchField
          fullWidth={fullWidth}
          name="search"
          value={value}
          onChange={handleSearchChange}
        >
          <SearchFieldGroup>
            <SearchField.SearchIcon />

            <SearchField.Input
              ref={inputRef}
              aria-controls="search-results"
              aria-expanded={open}
              autoComplete="off"
              enterKeyHint="search"
              placeholder={translations['search.placeholder']}
              spellCheck="false"
              aria-activedescendant={
                activeIndex !== null
                  ? `search-result-${activeIndex}`
                  : undefined
              }
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (hasQuery) {
                  setOpen(true);
                }
              }}
            />

            {!loading && !open ? (
              <span className="hidden md:flex items-center justify-center gap-1">
                <Kbd>
                  <Kbd.Content>Ctrl</Kbd.Content>
                </Kbd>
                <Kbd>
                  <Kbd.Content>S</Kbd.Content>
                </Kbd>
              </span>
            ) : null}

            {loading && open ? <Spinner /> : null}

            <SearchField.ClearButton
              onPress={() => {
                setValue('');
                closeAndReset();
              }}
            />
          </SearchFieldGroup>
        </SearchField>
      </Form>

      {!!open && (
        <Surface
          ref={refs.setFloating}
          {...getFloatingProps()}
          aria-label="Search results"
          id="search-results"
          style={floatingStyles}
          className="
            z-50 overflow-hidden rounded-xl
            border border-divider bg-content1 p-2
            shadow-large outline-none
          "
          onMouseDown={(event) => {
            event.preventDefault();
          }}
        >
          {loading && !hasResults ? (
            <div className="px-3 py-4 text-sm text-foreground-500">
              {translations['search.loading']}
            </div>
          ) : hasResults ? (
            <div className="max-h-96 overflow-y-auto">
              <ListBox aria-label="Search results">
                {searchResults.map(({ results, id }) =>
                  results.length > 0 ? (
                    <ListBox.Section key={id}>
                      <Header>
                        {translations[`search.results.${id}`]}
                      </Header>

                      {results.map((result) => {
                        const currentIndex = itemIndex++;
                        const isActive = activeIndex === currentIndex;
                        const render =
                          result.render ?? ((link: ReactElement) => link);

                        const isExternal = result.href.startsWith('http');

                        return render(
                          <ListBox.Item
                            key={result.href}
                            ref={(node) => {
                              listRef.current[currentIndex] =
                                node as HTMLElement | null;
                            }}
                            href={result.href}
                            id={result.href}
                            target={isExternal ? '_blank' : undefined}
                            className={`
                              rounded-medium px-2 py-1.5
                              outline-none transition-colors
                              ${
                    isActive
                      ? 'bg-default-100 text-foreground'
                      : ''
                    }
                            `}
                            rel={
                              isExternal
                                ? 'noreferrer noopener'
                                : undefined
                            }
                            {...getItemProps({
                              onMouseEnter: () => {
                                setActiveIndex(currentIndex);
                              },
                              onClick: () => {
                                closeAndReset();
                              },
                            })}
                          >
                            <div className="flex flex-col" id={`search-result-${currentIndex}`}>
                              <Label className="text-sm">{result.title}</Label>

                              {result.subtitle ? (
                                <Description>
                                  {result.subtitle}
                                </Description>
                              ) : null}
                            </div>
                          </ListBox.Item>,
                        );
                      })}
                    </ListBox.Section>
                  ) : null,
                )}
              </ListBox>
            </div>
          ) : (
            <div className="px-3 py-4 text-sm text-foreground-500">
              {translations['search.empty-state']}
            </div>
          )}
        </Surface>
      )}
    </div>
  );
};
