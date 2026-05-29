export interface Announcement {
  content: string,
  paths?: string[],
}

export const announcements: Announcement[] = [
  {
    content: 'brick.ninja is now Brick Catalog',
  }
];
