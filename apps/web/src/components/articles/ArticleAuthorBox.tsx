import Image from 'next/image';

import type { ArticleAuthorPublic } from '@ecommerce-amazon/shared/admin';

type ArticleAuthorBoxProps = {
  author: ArticleAuthorPublic;
};

export function ArticleAuthorBox({ author }: ArticleAuthorBoxProps): React.JSX.Element | null {
  if (!author.bio && !author.avatarUrl) {
    return null;
  }

  return (
    <section
      className="mt-10 flex gap-4 rounded-2xl bg-gray-50 p-6"
      aria-label="Sobre o autor"
    >
      {author.avatarUrl ? (
        <Image
          src={author.avatarUrl}
          alt={author.name}
          width={80}
          height={80}
          className="h-20 w-20 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-lg font-semibold text-neutral-600"
          aria-hidden
        >
          {author.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-lg font-semibold text-neutral-900">{author.name}</p>
        {author.bio ? (
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">{author.bio}</p>
        ) : null}
      </div>
    </section>
  );
}
