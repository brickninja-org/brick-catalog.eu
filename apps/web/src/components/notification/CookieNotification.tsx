'use client';

import { Alert } from '@heroui/react';

import { withSuspense } from '@/lib/with-suspense';

export const CookieNotification = withSuspense(() => {
  /** TODO: useUser() */

  return (
    <Alert status="warning">
      <Alert.Indicator/>
      <Alert.Content>
        <Alert.Description>
          Changing settings will store cookies in your browser.
        </Alert.Description>
      </Alert.Content>
    </Alert>
  );
});