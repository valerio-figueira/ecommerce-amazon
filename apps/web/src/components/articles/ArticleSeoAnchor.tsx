import Link from 'next/link';

import type { ArticleClusterPublic } from '@ecommerce-amazon/shared/admin';

type ArticleSeoAnchorProps = {
  cluster: ArticleClusterPublic;
  currentSlug: string;
};

export function ArticleSeoAnchor({
  cluster,
  currentSlug,
}: ArticleSeoAnchorProps): React.JSX.Element | null {
  if (cluster.role !== 'pilar') {
    return null;
  }

  const spokes = cluster.members.filter((member) => !member.isPilar);
  if (spokes.length === 0) {
    return null;
  }

  return (
    <nav
      className="mb-8 rounded-[var(--radius)] border border-neutral-200 bg-neutral-50 p-5"
      aria-label="Índice do guia"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Neste guia</p>
      <h2 className="mt-1 text-lg font-semibold text-neutral-900">{cluster.name}</h2>
      {cluster.description ? (
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">{cluster.description}</p>
      ) : null}
      <ol className="mt-4 space-y-2 border-l-2 border-emerald-200 pl-4">
        {spokes.map((member, index) => {
          const isCurrent = member.slug === currentSlug;
          return (
            <li key={member.id}>
              <Link
                href={`/artigos/${member.slug}`}
                className={`block text-sm leading-snug transition hover:text-emerald-700 ${
                  isCurrent
                    ? 'font-semibold text-emerald-700'
                    : 'text-neutral-700 underline decoration-neutral-300 underline-offset-2'
                }`}
                {...(isCurrent ? { 'aria-current': 'page' as const } : {})}
              >
                <span className="mr-2 text-xs text-neutral-400">{index + 1}.</span>
                {member.title}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
