'use client';

import type { TranslationId } from '@/i18n/types';
import type { Language } from '@brickcatalog/database';
import type { Key } from '@heroui/react';
import type { FC, KeyboardEvent as ReactKeyboardEvent } from 'react';

import { isTruthy } from '@brickninja-org/helper/is';
import {
  Alert,
  AlertDialog,
  Badge,
  Button,
  Card,
  Label,
  Kbd,
  ListBox,
  Modal,
  SearchField,
  SearchFieldGroup,
  Separator,
  Select,
  Surface,
  Table,
  TextArea,
  TextField,
  useOverlayState,
} from '@heroui/react';
import { useCallback, useMemo, useState } from 'react';
import { cn } from 'tailwind-variants';

const languages = ['en', 'nl', 'de'] as const satisfies Language[];

type TranslationDictionary = Record<Language, Partial<Record<TranslationId, string>>>;
type StateFilter = 'all' | 'changed' | 'missing';
type ActiveField = { language: Language, key: TranslationId } | null;
type Density = 'compact' | 'comfortable';

export interface TranslationEditorProps {
  dictionaries: {
    de: Partial<Record<TranslationId, string>>,
    en: Record<TranslationId, string>,
    nl: Partial<Record<TranslationId, string>>,
  },
}

export const TranslationEditor: FC<TranslationEditorProps> = ({
  dictionaries,
}) => {
  const keys = Object.keys(dictionaries.en) as TranslationId[];
  const editorDialog = useOverlayState();

  const [changes, setChanges] = useState<TranslationDictionary>({ de: {}, en: {}, nl: {}});
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [draftValue, setDraftValue] = useState('');
  const [query, setQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<Language | 'all'>('all');
  const [stateFilter, setStateFilter] = useState<StateFilter>('all');
  const [density, setDensity] = useState<Density>('compact');
  const closeConfirmDialog = useOverlayState();

  const getStoredValue = useCallback((language: Language, id: TranslationId) => {
    return changes[language][id] ?? dictionaries[language][id];
  }, [changes, dictionaries]);

  const hasChange = useCallback((language: Language, id: TranslationId) => {
    return changes[language][id] !== undefined && changes[language][id] !== dictionaries[language][id];
  }, [changes, dictionaries]);

  const usesFallback = useCallback((language: Language, id: TranslationId) => {
    return language !== 'en' && getStoredValue(language, id) === undefined && !!dictionaries.en[id]?.trim();
  }, [dictionaries, getStoredValue]);

  const getDisplayValue = useCallback((language: Language, id: TranslationId) => {
    return getStoredValue(language, id) ?? (language === 'en' ? '' : dictionaries.en[id] ?? '');
  }, [dictionaries, getStoredValue]);

  const isMissing = useCallback((language: Language, id: TranslationId) => {
    if (usesFallback(language, id)) {
      return false;
    }

    return !(getStoredValue(language, id) ?? '').trim();
  }, [getStoredValue, usesFallback]);

  const commitValue = useCallback((language: Language, key: TranslationId, value: string) => {
    setChanges((current) => ({
      ...current,
      [language]: {
        ...current[language],
        [key]: value === (dictionaries[language][key] ?? '') ? undefined : value,
      },
    }));
  }, [dictionaries]);

  const openEditor = useCallback((language: Language, key: TranslationId) => {
    setActiveField({ language, key });
    setDraftValue(getStoredValue(language, key) ?? '');
    editorDialog.open();
  }, [editorDialog, getStoredValue]);

  const activeFieldValue = activeField ? (getStoredValue(activeField.language, activeField.key) ?? '') : '';
  const activeFieldUsesFallback = activeField ? usesFallback(activeField.language, activeField.key) : false;

  const clearEditorState = useCallback(() => {
    setActiveField(null);
    setDraftValue('');
    closeConfirmDialog.close();
  }, [closeConfirmDialog]);

  const hasUnsavedDraftChanges = useMemo(
    () => !!activeField && draftValue !== activeFieldValue,
    [activeField, activeFieldValue, draftValue],
  );

  const requestCloseEditor = useCallback(() => {
    if (hasUnsavedDraftChanges) {
      editorDialog.open();
      closeConfirmDialog.open();

      return;
    }

    editorDialog.close();
    clearEditorState();
  }, [clearEditorState, closeConfirmDialog, editorDialog, hasUnsavedDraftChanges]);

  const closeEditor = useCallback(() => {
    editorDialog.close();
    clearEditorState();
  }, [clearEditorState, editorDialog]);

  const handleSaveEditor = useCallback(() => {
    if (!activeField) {
      return;
    }

    commitValue(activeField.language, activeField.key, draftValue);
    closeEditor();
  }, [activeField, closeEditor, commitValue, draftValue]);

  const handleResetEditor = useCallback(() => {
    if (!activeField) {
      return;
    }

    setDraftValue(dictionaries[activeField.language][activeField.key] ?? '');
  }, [activeField, dictionaries]);

  const handleExport = useCallback((language: Language) => {
    const json = JSON.stringify(
      Object.fromEntries(
        keys.map((id) => [id, changes[language][id] ?? dictionaries[language][id] ?? '']),
      ),
      null,
      2,
    );

    const download = document.createElement('a');
    download.setAttribute('href', `data:text/json;charset=utf-8,${encodeURIComponent(json + '\n')}`);
    download.setAttribute('download', `${language}.json`);
    document.body.append(download);
    download.click();
    download.remove();
  }, [changes, dictionaries, keys]);

  const suggestions = useMemo(
    () => activeField
      ? Array.from(new Set([
          ...Object.entries(dictionaries.de).filter(([id, value]) => id !== activeField.key && (value === dictionaries.de[activeField.key] || value === changes.de[activeField.key] || (draftValue.length > 2 && value.startsWith(draftValue)))).map(([id]) => dictionaries[activeField.language][id as TranslationId]),
          ...Object.entries(dictionaries.en).filter(([id, value]) => id !== activeField.key && (value === dictionaries.en[activeField.key] || value === changes.en[activeField.key] || (draftValue.length > 2 && value.startsWith(draftValue)))).map(([id]) => dictionaries[activeField.language][id as TranslationId]),
          ...Object.entries(dictionaries.nl).filter(([id, value]) => id !== activeField.key && (value === dictionaries.nl[activeField.key] || value === changes.nl[activeField.key] || (draftValue.length > 2 && value.startsWith(draftValue)))).map(([id]) => dictionaries[activeField.language][id as TranslationId]),
          ...Object.entries(changes.de).filter(([id, value]) => id !== activeField.key && (value === dictionaries.de[activeField.key] || value === changes.de[activeField.key] || (draftValue.length > 2 && value.startsWith(draftValue)))).map(([id]) => changes[activeField.language][id as TranslationId]),
          ...Object.entries(changes.en).filter(([id, value]) => id !== activeField.key && (value === dictionaries.en[activeField.key] || value === changes.en[activeField.key] || (draftValue.length > 2 && value.startsWith(draftValue)))).map(([id]) => changes[activeField.language][id as TranslationId]),
          ...Object.entries(changes.nl).filter(([id, value]) => id !== activeField.key && (value === dictionaries.nl[activeField.key] || value === changes.nl[activeField.key] || (draftValue.length > 2 && value.startsWith(draftValue)))).map(([id]) => changes[activeField.language][id as TranslationId]),
        ].filter(isTruthy)))
      : [],
    [activeField, changes, dictionaries, draftValue],
  );

  const filteredKeys = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return keys.filter((id) => {
      const queryMatch = !normalizedQuery || [
        id,
        getDisplayValue('en', id),
        getDisplayValue('nl', id),
        getDisplayValue('de', id),
      ].some((value) => value.toLowerCase().includes(normalizedQuery));

      if (!queryMatch) {
        return false;
      }

      const languagesToCheck = languageFilter === 'all' ? languages : [languageFilter];

      if (stateFilter === 'changed') {
        return languagesToCheck.some((language) => hasChange(language, id));
      }

      if (stateFilter === 'missing') {
        return languagesToCheck.some((language) => isMissing(language, id));
      }

      return true;
    });
  }, [getDisplayValue, hasChange, isMissing, keys, languageFilter, query, stateFilter]);

  const stats = useMemo(
    () => Object.fromEntries(
      languages.map((language) => [
        language,
        {
          changed: keys.filter((id) => hasChange(language, id)).length,
          missing: keys.filter((id) => isMissing(language, id)).length,
        },
      ]),
    ) as Record<Language, { changed: number, missing: number }>,
    [hasChange, isMissing, keys],
  );

  const changeCount = useMemo(
    () => languages.reduce((total, language) => total + stats[language].changed, 0),
    [stats],
  );
  const missingCount = useMemo(
    () => languages.reduce((total, language) => total + stats[language].missing, 0),
    [stats],
  );

  const handleLanguageFilterChange = (key: Key | Key[] | null) => {
    if (key === null || Array.isArray(key)) {
      return;
    }

    const nextKey = typeof key === 'string' ? key : String(key);
    if (nextKey === 'all' || languages.includes(nextKey as Language)) {
      setLanguageFilter(nextKey as Language | 'all');
    }
  };

  const handleStateFilterChange = (key: Key | Key[] | null) => {
    if (key === null || Array.isArray(key)) {
      return;
    }

    const nextKey = typeof key === 'string' ? key : String(key);
    if (nextKey === 'all' || nextKey === 'changed' || nextKey === 'missing') {
      setStateFilter(nextKey);
    }
  };

  const handleDensityChange = (key: Key | Key[] | null) => {
    if (key === null || Array.isArray(key)) {
      return;
    }

    const nextKey = typeof key === 'string' ? key : String(key);
    if (nextKey === 'compact' || nextKey === 'comfortable') {
      setDensity(nextKey);
    }
  };

  const selectedLanguageLabel = languageFilter === 'all' ? 'All languages' : languageFilter.toUpperCase();
  const selectedStateLabel = ({
    all: 'All rows',
    changed: 'Changed only',
    missing: 'Missing only',
  } as const)[stateFilter];
  const selectedDensityLabel = density === 'compact' ? 'Compact' : 'Comfortable';
  const visibleLanguages = languageFilter === 'all' ? languages : [languageFilter];
  const activeFieldLanguage = activeField?.language ?? null;
  const activeFieldKey = activeField?.key ?? null;
  const activeFieldMissing = activeField ? isMissing(activeField.language, activeField.key) : false;
  const activeFieldChanged = activeField ? hasChange(activeField.language, activeField.key) : false;
  const activeEnglishReference = activeFieldKey ? dictionaries.en[activeFieldKey] ?? '' : '';
  const activeFieldStatus = activeFieldMissing ? 'Missing' : activeFieldChanged ? 'Changed' : activeFieldUsesFallback ? 'Fallback' : 'Current';
  const navigableFields = useMemo(
    () => filteredKeys.flatMap((key) => visibleLanguages.map((language) => ({ key, language }))),
    [filteredKeys, visibleLanguages],
  );
  const activeFieldIndex = useMemo(
    () => activeField
      ? navigableFields.findIndex((field) => field.key === activeField.key && field.language === activeField.language)
      : -1,
    [activeField, navigableFields],
  );
  const canNavigatePrevious = activeFieldIndex > 0;
  const canNavigateNext = activeFieldIndex >= 0 && activeFieldIndex < navigableFields.length - 1;

  const handleNavigateEditor = useCallback((offset: -1 | 1) => {
    if (!activeField || activeFieldIndex < 0) {
      return;
    }

    const nextField = navigableFields[activeFieldIndex + offset];

    if (!nextField) {
      return;
    }

    commitValue(activeField.language, activeField.key, draftValue);
    setActiveField(nextField);
    setDraftValue(getStoredValue(nextField.language, nextField.key) ?? '');
  }, [activeField, activeFieldIndex, commitValue, draftValue, getStoredValue, navigableFields]);

  const handleEditorKeyDown = useCallback((event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      requestCloseEditor();

      return;
    }

    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      handleSaveEditor();

      return;
    }

    if (event.altKey && event.key === 'ArrowUp') {
      event.preventDefault();
      handleNavigateEditor(-1);

      return;
    }

    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault();
      handleNavigateEditor(1);
    }
  }, [handleNavigateEditor, handleSaveEditor, requestCloseEditor]);

  const getFieldTone = useCallback((language: Language, id: TranslationId) => {
    if (isMissing(language, id)) {
      return 'missing';
    }

    if (hasChange(language, id)) {
      return 'changed';
    }

    if (usesFallback(language, id)) {
      return 'fallback';
    }

    return 'current';
  }, [hasChange, isMissing, usesFallback]);

  const getRowSummary = useCallback((id: TranslationId) => {
    const missing = visibleLanguages.filter((language) => getFieldTone(language, id) === 'missing').length;
    const changed = visibleLanguages.filter((language) => getFieldTone(language, id) === 'changed').length;
    const fallback = visibleLanguages.filter((language) => getFieldTone(language, id) === 'fallback').length;

    return { changed, fallback, missing };
  }, [getFieldTone, visibleLanguages]);

  const formatRowSummary = useCallback((id: TranslationId) => {
    const summary = getRowSummary(id);
    const parts = [
      summary.missing > 0 ? `${summary.missing} needs translation` : null,
      summary.changed > 0 ? `${summary.changed} edited` : null,
      summary.fallback > 0 ? `${summary.fallback} using fallback` : null,
    ].filter(isTruthy);

    return parts.length > 0 ? parts.join(' • ') : null;
  }, [getRowSummary]);

  const renderTranslationButton = (language: Language, id: TranslationId, compact = false) => {
    const value = getDisplayValue(language, id);
    const tone = getFieldTone(language, id);
    const changed = tone === 'changed';
    const missing = tone === 'missing';
    const hasFallback = tone === 'fallback';

    return (
      <button
        type="button"
        className={cn(
          'flex h-full w-full flex-col rounded-large border text-left transition-colors hover:bg-content2/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          compact ? 'min-h-16 gap-1.5 p-2.5' : density === 'compact' ? 'min-h-20 gap-1.5 p-2.5' : 'min-h-24 gap-2 p-3',
          missing && 'border-danger/50 bg-danger/5',
          changed && !missing && 'border-warning/50 bg-warning/5',
          hasFallback && 'border-default-300 bg-default-50/40',
          !changed && !missing && !hasFallback && 'border-content3/70 bg-background/70',
        )}
        onClick={() => openEditor(language, id)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
              {language}
            </span>
            <span
              className={cn(
                'inline-block size-2 rounded-full',
                missing && 'bg-danger',
                changed && !missing && 'bg-warning',
                hasFallback && 'bg-default-400',
                !changed && !missing && !hasFallback && 'bg-success',
              )}
            />
          </div>
        </div>

        <div
          className={cn(
            'flex-1 text-sm text-foreground/90',
            compact || density === 'compact' ? 'min-h-8 leading-5' : 'min-h-10 leading-6',
          )}
        >
          <div
            className={cn(
              'whitespace-pre-wrap break-words',
              compact || density === 'compact' ? 'line-clamp-2' : 'line-clamp-3',
              hasFallback && 'italic text-muted',
            )}
          >
            {value || (
              <span className="italic text-muted">No translation yet</span>
            )}
          </div>
        </div>
      </button>
    );
  };

  const renderRowSummary = (id: TranslationId, className: string) => {
    const summary = formatRowSummary(id);

    if (!summary) {
      return null;
    }

    return <div className={className}>{summary}</div>;
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <Card>
          <Card.Header className="flex flex-row items-center justify-between gap-3">
            <div className="space-y-1">
              <Card.Title className="text-xl tracking-[-0.02em]">Translation Editor</Card.Title>
              <Card.Description className="text-sm">
                Review and edit saved translations for each language.
              </Card.Description>
            </div>
            <div className="text-sm text-muted">{filteredKeys.length} rows</div>
          </Card.Header>
          <Card.Content className="flex flex-wrap gap-2 pt-0">
            <CompactStat label="Keys" value={String(keys.length)}/>
            <CompactStat label="Edited" value={String(changeCount)}/>
            <CompactStat label="Missing" value={String(missingCount)}/>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="space-y-3">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_220px_220px_auto] xl:items-end">
              <SearchField fullWidth value={query} onChange={setQuery}>
                <Label>Search</Label>
                <SearchFieldGroup>
                  <SearchField.SearchIcon/>
                  <SearchField.Input placeholder="Search by key or translation value"/>
                  <SearchField.ClearButton onClick={() => setQuery('')}/>
                </SearchFieldGroup>
              </SearchField>

              <Select
                fullWidth
                placeholder="Language"
                selectedKey={languageFilter}
                variant="secondary"
                onChange={handleLanguageFilterChange}
              >
                <Label>Language scope</Label>
                <Select.Trigger>
                  <span className="truncate">{selectedLanguageLabel}</span>
                  <Select.Indicator/>
                </Select.Trigger>
                <Select.Popover>
                  <ListBox aria-label="Language scope">
                    <ListBox.Item key="all" id="all" textValue="All languages">
                      <Label>All languages</Label>
                      <ListBox.ItemIndicator/>
                    </ListBox.Item>
                    {languages.map((language) => (
                      <ListBox.Item key={language} id={language} textValue={language.toUpperCase()}>
                        <Label>{language.toUpperCase()}</Label>
                        <ListBox.ItemIndicator/>
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>

              <Select
                fullWidth
                placeholder="State"
                selectedKey={stateFilter}
                variant="secondary"
                onChange={handleStateFilterChange}
              >
                <Label>Row state</Label>
                <Select.Trigger>
                  <span className="truncate">{selectedStateLabel}</span>
                  <Select.Indicator/>
                </Select.Trigger>
                <Select.Popover>
                  <ListBox aria-label="Row state">
                    <ListBox.Item key="all" id="all" textValue="All rows">
                      <Label>All rows</Label>
                      <ListBox.ItemIndicator/>
                    </ListBox.Item>
                    <ListBox.Item key="changed" id="changed" textValue="Changed only">
                      <Label>Changed only</Label>
                      <ListBox.ItemIndicator/>
                    </ListBox.Item>
                    <ListBox.Item key="missing" id="missing" textValue="Missing only">
                      <Label>Missing only</Label>
                      <ListBox.ItemIndicator/>
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>

              <Select
                fullWidth
                placeholder="Density"
                selectedKey={density}
                variant="secondary"
                onChange={handleDensityChange}
              >
                <Label>Density</Label>
                <Select.Trigger>
                  <span className="truncate">{selectedDensityLabel}</span>
                  <Select.Indicator/>
                </Select.Trigger>
                <Select.Popover>
                  <ListBox aria-label="Density">
                    <ListBox.Item key="compact" id="compact" textValue="Compact">
                      <Label>Compact</Label>
                      <ListBox.ItemIndicator/>
                    </ListBox.Item>
                    <ListBox.Item key="comfortable" id="comfortable" textValue="Comfortable">
                      <Label>Comfortable</Label>
                      <ListBox.ItemIndicator/>
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>

              <div className="flex flex-wrap gap-2 xl:justify-end">
                {languages.map((language) => (
                  <Button key={language} size="sm" variant="secondary" onPress={() => handleExport(language)}>
                    {language.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-muted">
              <span>{visibleLanguages.length} column{visibleLanguages.length === 1 ? '' : 's'}</span>
              {languages.map((language) => (
                <Badge
                  key={language}
                  color={stats[language].missing > 0 ? 'danger' : 'default'}
                  size="sm"
                  variant="soft"
                >
                  {language.toUpperCase()} {stats[language].missing}
                </Badge>
              ))}
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title className="text-base">Translations</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-3 p-2">
            {filteredKeys.length === 0 ? (
              <Surface className="p-8 text-center text-sm text-muted" variant="secondary">
                No translation rows match the current filters.
              </Surface>
            ) : (
              <>
                <div className="grid gap-3 lg:hidden">
                  {filteredKeys.map((id) => (
                    <details key={id} className="group overflow-hidden rounded-large border border-content3/70 bg-content2/35">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-3 py-2.5 marker:hidden">
                        <div className="min-w-0 space-y-1">
                          <code className="block text-xs leading-5 break-all text-muted">{id}</code>
                          {renderRowSummary(id, 'text-xs text-muted')}
                        </div>
                        <div className="text-[11px] text-muted">{visibleLanguages.length} field{visibleLanguages.length === 1 ? '' : 's'}</div>
                      </summary>
                      <div className="grid gap-2 border-t border-content3/70 p-2.5">
                        {visibleLanguages.map((language) => (
                          <div key={`${id}:${language}`}>{renderTranslationButton(language, id, true)}</div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>

                <div className="hidden overflow-x-auto lg:block">
                  <Table aria-label="Translation editor" variant="secondary">
                    <Table.Content>
                      <Table.Header>
                        <Table.Column
                          isRowHeader
                          className={cn(
                            'sticky left-0 z-10 bg-secondary',
                            density === 'compact' ? 'min-w-44' : 'min-w-56',
                          )}
                        >
                          Key
                        </Table.Column>
                        {visibleLanguages.map((language) => (
                          <Table.Column
                            key={language}
                            className={density === 'compact' ? 'min-w-52' : 'min-w-64'}
                          >
                            {language.toUpperCase()}
                          </Table.Column>
                        ))}
                      </Table.Header>

                      <Table.Body>
                        {filteredKeys.map((id) => (
                          <Table.Row key={id}>
                            <Table.Cell className="sticky left-0 z-10 align-top bg-secondary">
                              <div className={cn('flex flex-col', density === 'compact' ? 'gap-1' : 'gap-1.5')}>
                                <code
                                  className={cn(
                                    'text-xs break-all text-muted',
                                    density === 'compact' ? 'leading-4' : 'leading-5',
                                  )}
                                >
                                  {id}
                                </code>
                                {renderRowSummary(id, 'text-[11px] leading-4 text-muted')}
                              </div>
                            </Table.Cell>

                            {visibleLanguages.map((language) => {
                              return (
                                <Table.Cell key={`${id}:${language}`} className="align-top">
                                  {renderTranslationButton(language, id)}
                                </Table.Cell>
                              );
                            })}
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Content>
                  </Table>
                </div>
              </>
            )}
          </Card.Content>
        </Card>
      </div>

      <Modal state={editorDialog}>
        <Modal.Backdrop
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              requestCloseEditor();
            }
          }}
        >
          <Modal.Container className="w-full max-w-4xl" size="lg">
            <Modal.Dialog aria-labelledby="translation-editor-dialog-title" className="w-full min-w-0 max-w-full">
              <Modal.CloseTrigger aria-label="Close translation editor"/>
              <Modal.Header className="pb-2">
                <div className="flex w-full flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Modal.Heading className="break-all text-xl" id="translation-editor-dialog-title">
                      {activeFieldKey ?? 'Translation field'}
                    </Modal.Heading>
                    {activeFieldLanguage ? (
                      <p className="mt-1 text-sm text-muted">
                        {activeFieldLanguage.toUpperCase()} • {activeFieldStatus.toLowerCase()}
                      </p>
                    ) : null}
                  </div>

                  {activeFieldIndex >= 0 ? (
                    <Badge size="sm" variant="soft">
                      {activeFieldIndex + 1} / {navigableFields.length}
                    </Badge>
                  ) : null}
                </div>
              </Modal.Header>

              <Modal.Body className="w-full min-w-0 max-w-full space-y-3">
                {activeField ? (
                  <>
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)]">
                      <div className="flex flex-col gap-4">
                        <Surface className="flex flex-col gap-3 p-3" variant="secondary">
                          <div className="flex items-center justify-between gap-3">
                            <h2 className="text-sm font-semibold">Translation</h2>
                            {activeFieldLanguage ? (
                              <Badge size="sm" variant="soft">{activeFieldLanguage.toUpperCase()}</Badge>
                            ) : null}
                          </div>

                          <div className="space-y-3">
                            {activeFieldUsesFallback ? (
                              <Alert>
                                <Alert.Content>
                                  <Alert.Title>Using English fallback</Alert.Title>
                                  <Alert.Description>
                                    This language does not have its own saved value yet. You are creating one now.
                                  </Alert.Description>
                                </Alert.Content>
                              </Alert>
                            ) : null}

                            <TextField fullWidth variant="secondary">
                              <Label>Edit translation</Label>
                              <TextArea
                                autoFocus
                                fullWidth
                                className="min-h-20 resize-y text-sm leading-6"
                                spellCheck="false"
                                value={draftValue}
                                onChange={(event) => setDraftValue(event.target.value)}
                                onKeyDown={handleEditorKeyDown}
                              />
                            </TextField>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                              <span>Draft {draftValue.length} chars</span>
                              <span aria-hidden="true">•</span>
                              <span className="inline-flex items-center gap-1">
                                <Kbd>Ctrl</Kbd>/<Kbd>Cmd</Kbd>+<Kbd>Enter</Kbd>
                              </span>
                              <span>save</span>
                              <span aria-hidden="true">•</span>
                              <span className="inline-flex items-center gap-1">
                                <Kbd>Esc</Kbd>
                              </span>
                              <span>close</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 border-t border-content3/70 pt-3">
                            <Button
                              isDisabled={!canNavigatePrevious}
                              variant="secondary"
                              onPress={() => handleNavigateEditor(-1)}
                            >
                              Previous
                            </Button>
                            <Button
                              isDisabled={!canNavigateNext}
                              variant="secondary"
                              onPress={() => handleNavigateEditor(1)}
                            >
                              Next
                            </Button>
                          </div>
                        </Surface>

                        {suggestions.length > 0 ? (
                          <Surface className="flex flex-col gap-2 p-3" variant="secondary">
                            <div className="flex flex-row items-center justify-between gap-3">
                              <h2 className="text-sm font-semibold">Suggestions</h2>
                              <Badge size="sm" variant="soft">{Math.min(suggestions.length, 5)}</Badge>
                            </div>
                            <div className="grid gap-2">
                              {suggestions.slice(0, 5).map((suggestion) => (
                                <button
                                  key={suggestion}
                                  className="rounded-large border border-content3/70 bg-background px-3 py-2 text-left text-sm transition hover:bg-content2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                  type="button"
                                  onClick={() => setDraftValue(suggestion)}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </Surface>
                        ) : null}
                      </div>

                      <div className="flex flex-col gap-4">
                        <Surface className="flex flex-col gap-3 p-3" variant="secondary">
                          <h2 className="text-sm font-semibold">Reference</h2>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="text-xs font-medium tracking-[0.16em] text-muted uppercase">English</div>
                              <div className="text-sm leading-6 whitespace-pre-wrap break-words">
                                {activeEnglishReference || <span className="italic text-muted">No English reference</span>}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-xs font-medium tracking-[0.16em] text-muted uppercase">
                                {activeFieldUsesFallback ? 'Saved Value' : 'Current Value'}
                              </div>
                              <div className="text-sm leading-6 whitespace-pre-wrap break-words">
                                {activeFieldValue || (
                                  <span className="italic text-muted">
                                    {activeFieldUsesFallback ? 'No saved translation yet. English is currently shown.' : 'No saved value'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Surface>

                        <Surface className="p-3 text-sm text-muted" variant="secondary">
                          Use <Kbd>Alt</Kbd>+<Kbd>Up</Kbd> and <Kbd>Alt</Kbd>+<Kbd>Down</Kbd> to move through the filtered fields.
                        </Surface>
                      </div>
                    </div>

                    <Separator/>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm">
                        {activeFieldValue !== draftValue ? (
                          <span className="font-medium text-warning">Unsaved changes</span>
                        ) : (
                          <span className="text-muted">No unsaved changes</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onPress={closeEditor}>
                          Cancel
                        </Button>
                        <Button variant="secondary" onPress={handleResetEditor}>
                          Reset
                        </Button>
                        <Button onPress={handleSaveEditor}>
                          Save
                        </Button>
                      </div>
                    </div>
                  </>
                ) : null}
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <AlertDialog
        isOpen={closeConfirmDialog.isOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeConfirmDialog.close();
          }
        }}
      >
        <AlertDialog.Backdrop>
          <AlertDialog.Container className="w-full max-w-md">
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Heading>Discard changes?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                You have unsaved changes in this translation. If you close now, your draft will be lost.
              </AlertDialog.Body>
              <AlertDialog.Footer className="flex justify-end gap-2">
                <Button variant="secondary" onPress={closeConfirmDialog.close}>
                  Keep editing
                </Button>
                <Button onPress={closeEditor}>
                  Discard changes
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </>
  );
};

function CompactStat({
  label,
  value,
}: {
  label: string,
  value: string,
}) {
  return (
    <Badge size="sm" variant="soft">
      {label}: {value}
    </Badge>
  );
}
