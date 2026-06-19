import { ArticleStatus } from '@ecommerce-amazon/domain';

export function adminArticleStatusLabel(status: ArticleStatus): string {
  return status === ArticleStatus.PUBLISHED ? 'Publicado' : 'Rascunho';
}

export function formatAdminArticleUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
