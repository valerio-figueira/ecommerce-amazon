import { notFound } from 'next/navigation';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ArticleForm } from '@/components/articles/ArticleForm';
import { getAdminArticle } from '@/lib/api/articles';

type EditArtigoPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditArtigoPageProps) {
  const { id } = await params;
  const article = await getAdminArticle(id);
  return {
    title: article ? `${article.title} — Artigos` : 'Artigo — Vitrine CMS',
  };
}

export default async function EditArtigoPage({ params }: EditArtigoPageProps) {
  const { id } = await params;
  const article = await getAdminArticle(id);
  if (!article) notFound();

  return (
    <>
      <AdminPageHeader
        title={article.title}
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Artigos', href: '/artigos' },
          { label: article.title },
        ]}
      />
      <AdminPageCard>
        <ArticleForm
          mode="edit"
          articleId={article.id}
          initialValues={{
            slug: article.slug,
            title: article.title,
            excerpt: article.excerpt,
            coverImageUrl: article.coverImageUrl ?? '',
            body: article.body,
            type: article.type,
            status: article.status,
            seoTitle: article.seoTitle ?? '',
            seoDescription: article.seoDescription ?? '',
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
          }}
        />
      </AdminPageCard>
    </>
  );
}
