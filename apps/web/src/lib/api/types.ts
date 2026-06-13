export type {
  CategoryDto,
  ProductListItemDto,
  ProductsPageDto,
  WishlistItemDto,
} from '@/lib/api/schemas';

export type ProductPriceDto = {
  amount: number | null;
  currency: string;
  isStale: boolean;
  updatedAt: string;
  strikethrough?: number | undefined;
};
