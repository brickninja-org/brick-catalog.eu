export type ElementCategoryPageProps = PageProps<'/[language]/element/category/[id]'>;
import { redirect } from 'next/navigation';

export default async function ElementCategoryRedirectPage({ params }: ElementCategoryPageProps) {
  const { id, language } = await params;

  redirect(`/${language}/element/subcategory/${id}`);
}
