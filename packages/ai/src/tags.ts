export const ELEMENT_TAGS = [
  'Elements',
  'Piece Types',
  'Monthly Update',
  'New Elements',
  'Set Trends',
] as const;

export const SET_TAGS = [
  'Sets',
  'Monthly Update',
] as const;

export type ElementTag = (typeof ELEMENT_TAGS)[number];
export type SetTag = (typeof SET_TAGS)[number];
