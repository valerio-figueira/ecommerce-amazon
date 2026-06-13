import { Marketplace } from '../enums/index.js';
import { ProductId, toProductId } from '../value-objects/index.js';

export class WishlistItem {
  constructor(
    readonly id: string,
    readonly sessionId: string,
    readonly productId: ProductId,
    readonly marketplace: Marketplace,
    readonly sortOrder: number,
    readonly addedAt: Date,
  ) {}

  static create(props: {
    id: string;
    sessionId: string;
    productId: string;
    marketplace: Marketplace;
    sortOrder: number;
    addedAt: Date;
  }): WishlistItem {
    return new WishlistItem(
      props.id,
      props.sessionId,
      toProductId(props.productId),
      props.marketplace,
      props.sortOrder,
      props.addedAt,
    );
  }
}
