import { notFound } from 'next/navigation';

import { getCategory } from '@/lib/api/cached-fetchers';

type CategoryDescriptionProps = {
  params: Promise<{ slug: string }>;
};

export async function CategoryDescription({
  params,
}: CategoryDescriptionProps): Promise<React.JSX.Element | null> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  if (!category.descriptionHtml) {
    return null;
  }

  return (
    <section
      className="prose prose-neutral max-w-none border-t border-neutral-200 pt-8"
      dangerouslySetInnerHTML={{ __html: category.descriptionHtml }}
    />
  );
}
