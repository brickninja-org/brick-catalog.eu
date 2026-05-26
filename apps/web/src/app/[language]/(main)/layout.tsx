import { Announcement } from '@/components/announcement/Announcement.client';
import { AppNavbar } from '@/components/layout';

export default function MainLayout({ children }: LayoutProps<'/[language]'>) {
  return (
    <>
      <Announcement/>
      <AppNavbar/>
      {children}
    </>
  );
}