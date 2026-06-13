import type { WishlistItem } from '../entities/WishlistItem.js';
import type { Marketplace } from '../enums/index.js';

export interface WishlistRepository {
  findBySessionId(sessionId: string): Promise<WishlistItem[]>;
  add(item: WishlistItem): Promise<void>;
  remove(id: string, sessionId: string): Promise<void>;
  countBySessionAndMarketplace(sessionId: string, marketplace: Marketplace): Promise<number>;
}
