'use client';

import { PostStatus } from '@brickcatalog/database';
import { ListBox } from '@heroui/react';
import { CellSelect } from '@heroui-pro/react';

interface PostStatusCellSelectProps {
  value: PostStatus,
  onValueChange: (value: PostStatus) => void,
  isDisabled?: boolean,
  label: string,
  draftLabel: string,
  publishedLabel: string,
}

function isPostStatus(value: unknown): value is PostStatus {
  return value === PostStatus.Draft || value === PostStatus.Published;
}

export function PostStatusCellSelect({
  value,
  onValueChange,
  isDisabled,
  label,
  draftLabel,
  publishedLabel,
}: PostStatusCellSelectProps) {
  const options = [
    { id: PostStatus.Draft, label: draftLabel },
    { id: PostStatus.Published, label: publishedLabel },
  ] as const;

  const selectedOption =
    options.find((option) => option.id === value) ?? options[0];

  return (
    <CellSelect
      aria-label={label}
      isDisabled={isDisabled}
      selectedKey={value}
      onSelectionChange={(key) => {
        if (isPostStatus(key)) {
          onValueChange(key);
        }
      }}
    >
      <CellSelect.Trigger>
        <CellSelect.Label>{label}</CellSelect.Label>
        <CellSelect.Value>{selectedOption.label}</CellSelect.Value>
        <CellSelect.Indicator />
      </CellSelect.Trigger>

      <CellSelect.Popover>
        <ListBox aria-label={label}>
          {options.map((option) => (
            <ListBox.Item
              key={option.id}
              id={option.id}
              textValue={option.label}
            >
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </CellSelect.Popover>
    </CellSelect>
  );
}
