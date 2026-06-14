import Image from 'next/image';
import Link from 'next/link';

import type { ArticlePublicDetail } from '@ecommerce-amazon/shared/admin';

type ArticlePostFooterProps = {
  article: ArticlePublicDetail;
};

export function ArticlePostFooter({
  article,
}: ArticlePostFooterProps): React.JSX.Element | null {
  const author = article.author;
  const authorName = author?.name ?? 'Redação Vitrine';

  if (!article.category && !author) {
    return null;
  }

  return (
    <footer className="mt-10 border-t border-neutral-100 pt-6" aria-label="Informações do artigo">
      {article.category ? (
        <p>
          <Link
            href={`/artigos?categoria=${encodeURIComponent(article.category.slug)}`}
            className="text-base text-neutral-500 underline decoration-neutral-300 underline-offset-[3px] transition hover:text-neutral-800"
          >
            #{article.category.slug}
          </Link>
        </p>
      ) : null}

      {author && (author.bio || author.avatarUrl) ? (
        <div className={`flex items-start gap-3 ${article.category ? 'mt-6' : ''}`}>
          {author.avatarUrl ? (
            <Image
              src={author.avatarUrl}
              alt={authorName}
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : null}
          <div className="min-w-0 text-sm text-neutral-600">
            <p className="font-medium text-neutral-900">{authorName}</p>
            {author.bio ? <p className="mt-1 leading-relaxed">{author.bio}</p> : null}
          </div>
        </div>
      ) : null}
    </footer>
  );
}
