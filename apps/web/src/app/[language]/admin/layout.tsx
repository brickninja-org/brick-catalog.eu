export default function AdminLayout({
  children,
}: LayoutProps<'/[language]'>) {
  return (
    <>
      {children}
    </>
  );
}