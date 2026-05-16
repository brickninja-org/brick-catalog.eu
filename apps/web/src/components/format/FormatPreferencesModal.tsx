'use client';

import type { Key, UseOverlayStateReturn } from '@heroui/react';
import type { ReactNode } from 'react';

import {
  Button,
  Label,
  ListBox,
  Modal,
  Select,
  Surface
} from '@heroui/react';
import { useMemo } from 'react';

import { useLanguage } from '../i18n/I18n.context';

import { useFormatContext } from './Format.context';
import { FormatCurrency } from './FormatCurrency';
import { FormatDate } from './FormatDate';
import { FormatNumber } from './FormatNumber';
import { FormatWeight } from './FormatWeight';
import { getFormatPreview, getLanguageOptions, getRegionOptions, isSupportedLanguage } from './formatting';

export interface FormatPreferencesModalProps {
  onOpenChange?: (isOpen: boolean) => void,
  state?: UseOverlayStateReturn,
  trigger?: ReactNode,
}

export function FormatPreferencesModal({
  onOpenChange,
  state,
  trigger,
}: FormatPreferencesModalProps) {
  const currentLanguage = useLanguage();
  const { locale, language, region, setLocale, defaultRegion } = useFormatContext();

  const languageOptions = useMemo(
    () => getLanguageOptions(currentLanguage),
    [currentLanguage],
  );

  const regionOptions = useMemo(
    () => getRegionOptions(currentLanguage, defaultRegion),
    [currentLanguage, defaultRegion],
  );

  const selectedLanguageLabel = useMemo(
    () => languageOptions.find((option) => option.key === language)?.label ?? 'Select a language',
    [language, languageOptions],
  );
  const selectedRegionLabel = useMemo(
    () => regionOptions.find((option) => option.key === region)?.label ?? 'Select a region',
    [region, regionOptions],
  );
  const preview = useMemo(() => getFormatPreview(locale), [locale]);
  const previewCurrency = useMemo(() => {
    const localeRegion = (() => {
      try {
        return new Intl.Locale(locale).region ?? '';
      } catch {
        return '';
      }
    })();

    switch (localeRegion) {
      case 'GB':
        return 'GBP';
      case 'DE':
      case 'NL':
      case 'FR':
      case 'BE':
        return 'EUR';
      case 'CH':
        return 'CHF';
      case 'JP':
        return 'JPY';
      default:
        return 'USD';
    }
  }, [locale]);

  const handleLanguageChange = (key: Key | Key[] | null) => {
    if (key === null || Array.isArray(key)) return;

    const nextLanguage = typeof key === 'string' ? key : String(key);
    if (!nextLanguage || nextLanguage === language) return;

    if (nextLanguage === 'auto') {
      setLocale('auto', region);

      return;
    }

    if (!isSupportedLanguage(nextLanguage)) return;

    setLocale(nextLanguage, region);
  };

  const handleRegionChange = (key: Key | Key[] | null) => {
    if (key === null || Array.isArray(key)) return;

    const nextRegion = typeof key === 'string' ? key : String(key);
    if (!nextRegion || nextRegion === region) return;

    setLocale(language, nextRegion);
  };

  return (
    <Modal state={state}>
      {trigger ?? (!state ? (
        <Button variant="secondary">
          Formatting
        </Button>
      ) : null)}

      <Modal.Backdrop onOpenChange={onOpenChange}>
        <Modal.Container
          className="w-full max-w-2xl"
          size="lg"
        >
          <Modal.Dialog aria-labelledby="format-preferences-title" className="w-full min-w-0 max-w-full">
            <Modal.CloseTrigger aria-label="Close formatting preferences"/>
            <Modal.Header>
              <Modal.Heading id="format-preferences-title">
                Formatting
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body className="w-full min-w-0 max-w-full space-y-2">
              <p>Choose the language and region used for dates, times, and numbers.</p>

              <div className="mb-3 grid w-full min-w-0 grid-cols-2 gap-3 max-sm:grid-cols-1">
                <Select
                  fullWidth
                  className="min-w-0"
                  placeholder="Current Language"
                  // HeroUI exposes `selectedKey` here even though upstream React Aria marks it deprecated.
                  // The suggested `selectedKeys` replacement is not available on this Select wrapper yet.
                  selectedKey={language}
                  variant="secondary"
                  onSelectionChange={handleLanguageChange}
                >
                  <Label>Language</Label>

                  <Select.Trigger>
                    <span className="truncate">{selectedLanguageLabel}</span>
                    <Select.Indicator/>
                  </Select.Trigger>

                  <Select.Popover>
                    <ListBox aria-label="Language options">
                      {languageOptions.map((item) => (
                        <ListBox.Item key={item.key} id={item.key} textValue={item.label}>
                          <Label>{item.label}</Label>
                          <ListBox.ItemIndicator/>
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

                <Select
                  fullWidth
                  className="min-w-0"
                  placeholder="Browser Region"
                  // HeroUI exposes `selectedKey` here even though upstream React Aria marks it deprecated.
                  // The suggested `selectedKeys` replacement is not available on this Select wrapper yet.
                  selectedKey={region}
                  variant="secondary"
                  onSelectionChange={handleRegionChange}
                >
                  <Label>Region</Label>

                  <Select.Trigger>
                    <span className="truncate">{selectedRegionLabel}</span>
                    <Select.Indicator/>
                  </Select.Trigger>

                  <Select.Popover>
                    <ListBox aria-label="Region options">
                      {regionOptions.map((item) => (
                        <ListBox.Item key={item.key} id={item.key} textValue={item.label}>
                          <Label>{item.label}</Label>
                          <ListBox.ItemIndicator/>
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <Surface className="flex flex-col gap-2 p-3" variant="secondary">
                <PreviewRow label="Locale" value={preview.locale}/>
                <PreviewRow label="Date" value={<FormatDate date={new Date()}/>}/>
                <PreviewRow label="Relative time" value={<FormatDate relative date={new Date()}/>}/>
                <PreviewRow label="Number" value={<FormatNumber value={1234567.89}/>}/>
                <PreviewRow
                  label="Weight"
                  value={(
                    <>
                      <FormatWeight weight={0.017}/> / <FormatWeight weight={1234.50}/>
                    </>
                  )}
                />
                <PreviewRow label="Currency" value={<FormatCurrency currency={previewCurrency} value={1234.56}/>}/>
              </Surface>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function PreviewRow({
  label,
  value,
}: {
  label: string,
  value: ReactNode,
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
