'use client';

import type { ReactNode } from 'react';

import { AppLayout, Navbar, Sidebar } from '@heroui-pro/react';
import { BarChart3, FileText, LayoutDashboard, PenSquare, Shield } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AdminAppLayoutProps {
  children: ReactNode,
  translations: {
    title: string,
    navigationLabel: string,
    dashboard: string,
    content: string,
    blog: string,
    views: string,
    menuToggle: string,
  },
}

export function AdminAppLayout({ children, translations }: AdminAppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isRouterReady, setIsRouterReady] = useState(false);

  useEffect(() => {
    setIsRouterReady(true);
  }, []);

  const dashboardHref = '/admin';
  const contentHref = '/admin/content';
  const blogHref = '/admin/content/blog';
  const viewsHref = '/admin/views';
  const isDashboardCurrent = pathname === dashboardHref;
  const isContentCurrent = pathname === contentHref;
  const isBlogCurrent = pathname.startsWith(blogHref);
  const isViewsCurrent = pathname === viewsHref;

  return (
    <AppLayout
      className="min-h-screen"
      scrollMode="content"
      sidebarCollapsible="icon"
      navbar={(
        <Navbar maxWidth="full">
          <Navbar.Header>
            <AppLayout.MenuToggle srLabel={translations.menuToggle} tooltip={translations.menuToggle}/>
            <Sidebar.Trigger />
            <Navbar.Content className="ml-2">
              <Navbar.Label className="font-semibold">{translations.title}</Navbar.Label>
            </Navbar.Content>
          </Navbar.Header>
        </Navbar>
      )}
      navigate={(href) => {
        if (!isRouterReady) {
          return;
        }
        if (href === pathname) {
          return;
        }
        router.push(href);
      }}
      sidebar={(
        <>
          <Sidebar>
            <Sidebar.Header>
              <div className="flex items-center gap-2 px-1">
                <Shield className="size-4 text-accent"/>
                <span className="text-sm font-semibold">{translations.title}</span>
              </div>
            </Sidebar.Header>
            <Sidebar.Content>
              <Sidebar.Group>
                <Sidebar.GroupLabel>{translations.navigationLabel}</Sidebar.GroupLabel>
                <Sidebar.Menu aria-label={translations.navigationLabel}>
                  <Sidebar.MenuItem href={dashboardHref} id="dashboard" isCurrent={isDashboardCurrent} textValue={translations.dashboard}>
                    <Sidebar.MenuItemContent>
                      <Sidebar.MenuIcon>
                        <LayoutDashboard className="size-4"/>
                      </Sidebar.MenuIcon>
                      <Sidebar.MenuLabel>{translations.dashboard}</Sidebar.MenuLabel>
                    </Sidebar.MenuItemContent>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem href={contentHref} id="content" isCurrent={isContentCurrent} textValue={translations.content}>
                    <Sidebar.MenuItemContent>
                      <Sidebar.MenuIcon>
                        <FileText className="size-4"/>
                      </Sidebar.MenuIcon>
                      <Sidebar.MenuLabel>{translations.content}</Sidebar.MenuLabel>
                    </Sidebar.MenuItemContent>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem href={blogHref} id="content-blog" isCurrent={isBlogCurrent} textValue={translations.blog}>
                    <Sidebar.MenuItemContent>
                      <Sidebar.MenuIcon>
                        <PenSquare className="size-4"/>
                      </Sidebar.MenuIcon>
                      <Sidebar.MenuLabel>{translations.blog}</Sidebar.MenuLabel>
                    </Sidebar.MenuItemContent>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem href={viewsHref} id="views" isCurrent={isViewsCurrent} textValue={translations.views}>
                    <Sidebar.MenuItemContent>
                      <Sidebar.MenuIcon>
                        <BarChart3 className="size-4"/>
                      </Sidebar.MenuIcon>
                      <Sidebar.MenuLabel>{translations.views}</Sidebar.MenuLabel>
                    </Sidebar.MenuItemContent>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.Group>
            </Sidebar.Content>
          </Sidebar>

          <Sidebar.Mobile>
            <Sidebar>
              <Sidebar.Content>
                <Sidebar.Group>
                  <Sidebar.GroupLabel>{translations.navigationLabel}</Sidebar.GroupLabel>
                  <Sidebar.Menu aria-label={translations.navigationLabel}>
                    <Sidebar.MenuItem href={dashboardHref} id="dashboard-mobile" isCurrent={isDashboardCurrent} textValue={translations.dashboard}>
                      <Sidebar.MenuItemContent>
                        <Sidebar.MenuIcon>
                          <LayoutDashboard className="size-4"/>
                        </Sidebar.MenuIcon>
                        <Sidebar.MenuLabel>{translations.dashboard}</Sidebar.MenuLabel>
                      </Sidebar.MenuItemContent>
                    </Sidebar.MenuItem>
                    <Sidebar.MenuItem href={contentHref} id="content-mobile" isCurrent={isContentCurrent} textValue={translations.content}>
                      <Sidebar.MenuItemContent>
                        <Sidebar.MenuIcon>
                          <FileText className="size-4"/>
                        </Sidebar.MenuIcon>
                        <Sidebar.MenuLabel>{translations.content}</Sidebar.MenuLabel>
                      </Sidebar.MenuItemContent>
                    </Sidebar.MenuItem>
                    <Sidebar.MenuItem href={blogHref} id="content-blog-mobile" isCurrent={isBlogCurrent} textValue={translations.blog}>
                      <Sidebar.MenuItemContent>
                        <Sidebar.MenuIcon>
                          <PenSquare className="size-4"/>
                        </Sidebar.MenuIcon>
                        <Sidebar.MenuLabel>{translations.blog}</Sidebar.MenuLabel>
                      </Sidebar.MenuItemContent>
                    </Sidebar.MenuItem>
                    <Sidebar.MenuItem href={viewsHref} id="views-mobile" isCurrent={isViewsCurrent} textValue={translations.views}>
                      <Sidebar.MenuItemContent>
                        <Sidebar.MenuIcon>
                          <BarChart3 className="size-4"/>
                        </Sidebar.MenuIcon>
                        <Sidebar.MenuLabel>{translations.views}</Sidebar.MenuLabel>
                      </Sidebar.MenuItemContent>
                    </Sidebar.MenuItem>
                  </Sidebar.Menu>
                </Sidebar.Group>
              </Sidebar.Content>
            </Sidebar>
          </Sidebar.Mobile>
        </>
      )}
    >
      <div className="mx-auto w-full max-w-7xl p-6">
        {children}
      </div>
    </AppLayout>
  );
}
