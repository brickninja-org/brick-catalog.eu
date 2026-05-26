import { DesignPageComponent } from './Component';

export type DesignPageProps = PageProps<'/[language]/element/design/[id]'>;

export default async function DesignPage({ params }: DesignPageProps) {
  const { id, language } = await params;
  const designId = Number(id);

  return <DesignPageComponent designId={designId} language={language}/>;
}
