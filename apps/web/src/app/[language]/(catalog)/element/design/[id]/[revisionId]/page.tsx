import { DesignPageComponent } from '../Component';

export default async function DesignPRevisionPage({ params }: PageProps<'/[language]/element/design/[id]/[revisionId]'>) {
  const { id, language, revisionId } = await params;
  const designId = Number(id);

  return <DesignPageComponent designId={designId} language={language} revisionId={revisionId}/>;
}
