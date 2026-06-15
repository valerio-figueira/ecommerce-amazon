import type {
  ContentClusterPublishedMember,
  ContentClusterRepository,
} from '@ecommerce-amazon/domain';

export type ArticleClusterPublic = {
  name: string;
  slug: string;
  description: string | null;
  role: 'pilar' | 'spoke';
  pilarArticle: { slug: string; title: string };
  members: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverImageUrl: string | null;
    publishedAt: Date | null;
    isPilar: boolean;
  }>;
};

export function buildArticleClusterPublic(params: {
  cluster: {
    name: string;
    slug: string;
    description: string | null;
    pilarArticleId: string | null;
  };
  articleId: string;
  publishedMembers: ContentClusterPublishedMember[];
}): ArticleClusterPublic | null {
  const { cluster, articleId, publishedMembers } = params;

  if (publishedMembers.length === 0) {
    return null;
  }

  const pilarMember =
    publishedMembers.find((member) => member.isPilar) ??
    (cluster.pilarArticleId
      ? publishedMembers.find((member) => member.id === cluster.pilarArticleId)
      : undefined);

  if (!pilarMember) {
    return null;
  }

  const role = articleId === pilarMember.id ? 'pilar' : 'spoke';
  const spokes = publishedMembers
    .filter((member) => member.id !== pilarMember.id)
    .sort((a, b) => {
      const aTime = a.publishedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bTime = b.publishedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

  const members = [pilarMember, ...spokes];

  return {
    name: cluster.name,
    slug: cluster.slug,
    description: cluster.description,
    role,
    pilarArticle: {
      slug: pilarMember.slug,
      title: pilarMember.title,
    },
    members: members.map((member) => ({
      id: member.id,
      slug: member.slug,
      title: member.title,
      excerpt: member.excerpt,
      coverImageUrl: member.coverImageUrl,
      publishedAt: member.publishedAt,
      isPilar: member.isPilar,
    })),
  };
}

export async function resolveArticleClusterPublic(
  contentClusterRepository: ContentClusterRepository,
  articleId: string,
  clusterId: string | null,
): Promise<ArticleClusterPublic | null> {
  if (!clusterId) return null;

  const cluster = await contentClusterRepository.findById(clusterId);
  if (!cluster) return null;

  const publishedMembers = await contentClusterRepository.listPublishedMembers(clusterId);
  return buildArticleClusterPublic({
    cluster,
    articleId,
    publishedMembers,
  });
}
