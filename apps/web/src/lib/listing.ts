export const VITRINE_LISTING_PAGE_SIZE = 24;

export function totalListingPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
