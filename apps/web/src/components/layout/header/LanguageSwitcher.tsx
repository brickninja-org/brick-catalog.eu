'use client';

import type { TranslationSubset } from '@/lib/translate';
import type { Language } from '@brickcatalog/database';
import type { Key, Selection } from '@heroui/react';
import type { FC } from 'react';

import { Language as LanguageEnum } from '@brickcatalog/database';
import { Gear, Globe } from '@gravity-ui/icons';
import { Dropdown, Label, useOverlayState } from '@heroui/react';
import { usePathname, useSearchParams } from 'next/navigation';

import { FormatPreferencesModal } from '@/components/format/FormatPreferencesModal';
import { useLanguage } from '@/components/i18n/I18n.context';
import { localizedUrl } from '@/lib/localized-url';

const languages = Object.values(LanguageEnum);

const languageLabels: Record<Language, string> = {
  de: 'Deutsch',
  en: 'English',
  nl: 'Nederlands',
};

export interface LanguageSwitcherProps {
  translations: TranslationSubset<
    | 'locale.formatting-settings.label'
  >,
}

export const LanguageSwitcher: FC<LanguageSwitcherProps> = ({ translations }) => {
  const currentLanguage = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const href = `${pathname}${query ? `?${query}` : ''}`;
  const currentLanguageLabel = languageLabels[currentLanguage];
  const formattingDialog = useOverlayState();

  const handleLanguageAction = (key: Key) => {
    if (typeof key !== 'string' || !(key in languageLabels)) {
      return;
    }

    window.location.assign(localizedUrl(href, key as Language));
  };

  const handleLanguageSelectionChange = (selection: Selection) => {
    if (selection === 'all') {
      return;
    }

    const [first] = Array.from(selection);
    if (typeof first !== 'string' || first == null) {
      return;
    }

    handleLanguageAction(first);
  };

  return (
    <>
      <Dropdown aria-label="Language switcher">
        <Dropdown.Trigger
          aria-label={currentLanguageLabel}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Globe/>
          <span className="hidden truncate sm:inline">{currentLanguageLabel}</span>
          <span className="sm:hidden">{currentLanguage.toUpperCase()}</span>
        </Dropdown.Trigger>

        <Dropdown.Popover placement="bottom end">
          <Dropdown.Menu>
            <Dropdown.Section
              disallowEmptySelection
              aria-label="Language options"
              selectedKeys={new Set([currentLanguage])}
              selectionMode="single"
              onSelectionChange={handleLanguageSelectionChange}
            >
              {languages.map((language) => (
                <Dropdown.Item
                  key={language}
                  id={language}
                  textValue={languageLabels[language]}
                >
                  <Dropdown.ItemIndicator/>
                  <Label>{languageLabels[language]}</Label>
                  <span className="ml-auto text-xs tracking-[0.16em] text-muted uppercase">
                    {language}
                  </span>
                </Dropdown.Item>
              ))}

              <Dropdown.Item onPress={formattingDialog.open}>
                <Gear/>
                <Label>{translations['locale.formatting-settings.label']}</Label>
              </Dropdown.Item>
            </Dropdown.Section>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      <FormatPreferencesModal state={formattingDialog}/>
    </>
  );
};
