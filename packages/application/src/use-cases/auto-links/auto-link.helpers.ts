import {
  ConflictError,
  normalizeAutoLinkKeyword,
  type AutoLinkRepository,
} from '@ecommerce-amazon/domain';

export async function assertUniqueAutoLinkKeyword(
  repository: AutoLinkRepository,
  keyword: string,
  excludeId?: string,
): Promise<void> {
  const existing = await repository.findByKeywordNormalized(keyword);
  if (existing && existing.id !== excludeId) {
    throw new ConflictError('Keyword já cadastrada');
  }
}

export function keywordsConflict(currentKeyword: string, nextKeyword: string): boolean {
  return normalizeAutoLinkKeyword(currentKeyword) !== normalizeAutoLinkKeyword(nextKeyword);
}
