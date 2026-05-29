import { createDataGrid } from '@brickninja-org/ui';

import { ElementSubcategoryLink } from '@/components/element/ElementSubcategoryLink';
import { Description } from '@/components/layout/Description';
import { cache } from '@/lib/cache';
import { db } from '@/lib/prisma';

const getSubcategories = cache(
  () => db.subcategory.findMany({
    include: { designs: true, category: { select: { name: true }}},
    orderBy: { id: 'asc' },
  }),
  ['element-subcategories'],
  { revalidate: 60 },
);

export default async function ElementSubcategoryPage() {
  const categories = await getSubcategories();
  const Categories = createDataGrid(categories, (row) => row.id);

  return (
    <>
      <div className="content-auto mx-auto w-full max-w-248 [contain-intrinsic-size:auto_900px] max-md:px-4">
        <Description>
          Official LEGO<sup>&reg;</sup> element subcategories
        </Description>
        <Categories.Table>
          <Categories.Column isRowHeader header="Id" id="id" sortBy="id" title="Id">{({ id }) => id}</Categories.Column>
          <Categories.Column isRowHeader header="Name" id="name" title="Name">{(subcategory) => <ElementSubcategoryLink elementSubcategory={subcategory}/>}</Categories.Column>
          <Categories.Column header="Category" id="category" sortBy="categoryId" title="Category">{(subcategory) => subcategory.category?.name ?? 'Unknown'}</Categories.Column>
        </Categories.Table>
      </div>
    </>
  );
}
