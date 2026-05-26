import type React from 'react';

export type IconProp = React.JSX.Element;

export function getIcon(icon?: IconProp): React.JSX.Element | undefined;
export function getIcon(icon?: IconProp): React.JSX.Element | undefined {
  return icon;
}
