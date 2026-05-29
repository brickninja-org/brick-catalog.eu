import { redirect } from 'next/navigation';

export type ElementGroupPageProps = PageProps<'/[language]/element/group'>;

export default async function ElementGroupRedirectPage({ params }: ElementGroupPageProps) {
  const { language } = await params;

  redirect(`/${language}/element/category`);
}
