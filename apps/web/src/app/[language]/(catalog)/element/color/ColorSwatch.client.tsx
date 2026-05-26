'use client';

import type { ColorSwatchProps } from '@heroui/react';
import type { FC } from 'react';

import { ColorSwatch as HeroColorSwatch } from '@heroui/react';

export const ColorSwatch: FC<ColorSwatchProps> = (props) => {
  return (
    <HeroColorSwatch {...props}/>
  );
};
