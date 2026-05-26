'use client';

import type { ReloadProps } from './Reload';
import type { RefProp } from '@/lib/react';
import type { FC } from 'react';

import { Checkbox, Label } from '@heroui/react';
import { useState } from 'react';

import { Reload } from './Reload';

export const ReloadCheckbox: FC<ReloadProps & RefProp<HTMLLabelElement>> = ({ ref, ...reloadProps }) => {
  const [autoRefresh, setAutoRefresh] = useState(false);

  return (
    <>
      {!!autoRefresh && <Reload {...reloadProps}/>}
      <Checkbox ref={ref} id="reload" isSelected={autoRefresh} onChange={setAutoRefresh}>
        <Checkbox.Control>
          <Checkbox.Indicator/>
        </Checkbox.Control>
        <Checkbox.Content>
          <Label htmlFor="reload">Auto Refresh</Label>
        </Checkbox.Content>
      </Checkbox>
    </>
  );
};
