import { createDataGrid } from '@brickninja-org/ui';

import { Description } from '@/components/layout/Description';
import { cache } from '@/lib/cache';
import { db } from '@/lib/prisma';

const getCategories = cache(
  () => db.category.findMany({
    include: {
      subcategories: {
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { id: 'asc' },
  }),
  ['element-categories'],
  { revalidate: 60 },
);

export default async function ElementCategoryPage() {
  const categories = await getCategories();
  const Categories = createDataGrid(categories, (row) => row.id);

  return (
    <>
      <div className="content-auto mx-auto w-full max-w-248 [contain-intrinsic-size:auto_900px] max-md:px-4">
        <Description>
          Official LEGO<sup>&reg;</sup> element categories
        </Description>
        <Categories.Table>
          <Categories.Column header="Id" isRowHeader id="id" sortBy="id" title="Id">{({ id }) => id}</Categories.Column>
          <Categories.Column header="Name" isRowHeader id="name" title="Name">{({ name }) => name}</Categories.Column>
        </Categories.Table>
      </div>
    </>
  );
}
