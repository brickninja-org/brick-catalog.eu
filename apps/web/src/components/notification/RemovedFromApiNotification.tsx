import type { FC } from 'react';

import { Notification } from './Notification';

export interface RemovedFromApiNotificationProps {
  type: string,
}

export const RemovedFromApiNotification: FC<RemovedFromApiNotificationProps> = ({ type }) => {
  return (
    <Notification status="warning" title="Removed from API">
      This {type} is currently not available in the Brick Ninja API and you are seeing the last known version. The {type} has either been removed from the catalog or needs to be rediscovered.
    </Notification>
  );
};