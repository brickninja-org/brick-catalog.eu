import type { LucideIcon } from 'lucide-react';
import type { Route } from 'next';

import { BookOpen, LayoutDashboard } from 'lucide-react';

export interface NavigationItem {
  title: string,
  url: string,
  icon?: LucideIcon,
  description?: string,
  show?: boolean,
  badge?: 'beta' | 'new',
  iconColor?: string,
  matchPrefix?: boolean,
}

export interface NavigationLinks {
  elements: NavigationItem[],
  general: NavigationItem[],
}

export interface NavigationSection {
  name: string,
  href: string,
  icon: LucideIcon,
  children: NavigationItem[],
}

export const navLinks: NavigationLinks = {
  elements: [
    {
      title: 'New Elements',
      url: '/elements/new'
    }
  ],
  general: [
    {
      title: 'Learn',
      url: '/learn',
      icon: BookOpen,
      description: 'Educational hub with FAQs, glossery, guides and data sources',
      show: true,
    }
  ],
};

const dashboardItems: NavigationItem[] = [
  { title: 'Overview', url: '/', icon: LayoutDashboard },
];

export const navigationSections: NavigationSection[] = [
  {
    name: 'Overview',
    href: '/',
    icon: LayoutDashboard,
    children: dashboardItems,
  }
];

export type NavItem = {
  href: Route,
  label: string,
};

export const NAV_ITEMS = [
  { href: '/', label: 'Overview' },
  { href: '/blog', label: 'Blog' },
] as const satisfies readonly NavItem[];
