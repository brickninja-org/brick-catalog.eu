'use client';

import type { AlertProps } from '@heroui/react';
import type { FC, ReactNode } from 'react';

import { Alert } from '@heroui/react';

export interface NotificationProps extends Pick<AlertProps, 'status'> {
  title: ReactNode,
  actions?: ReactNode,
  children: ReactNode,
}

export const Notification: FC<NotificationProps> = ({
  title,
  actions,
  children,
  status = 'accent',
}) => {
  return (
    <Alert status={status}>
      <Alert.Indicator/>
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        {!!children && <Alert.Description>{children}</Alert.Description>}
        {actions}
      </Alert.Content>
    </Alert>
  );
};
