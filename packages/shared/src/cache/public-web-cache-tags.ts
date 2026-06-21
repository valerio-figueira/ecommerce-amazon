/** Next.js `unstable_cache` / fetch tags invalidated via POST /api/revalidate. */
export const PUBLIC_WEB_CACHE_TAGS = {
  categoryNavTree: 'public:category-nav-tree',
  institutionalPage: (slug: string) => `public:institutional:${slug}`,
  publicTeamMembers: 'public:team-members',
} as const;
