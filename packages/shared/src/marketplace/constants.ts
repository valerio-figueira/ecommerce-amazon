export const MARKETPLACE_VALUES = ['amazon_br', 'shopee_br', 'mercadolivre_br'] as const;

export type MarketplaceValue = (typeof MARKETPLACE_VALUES)[number];
