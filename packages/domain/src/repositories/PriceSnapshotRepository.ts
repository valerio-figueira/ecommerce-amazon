import type { PriceSnapshot } from '../entities/PriceSnapshot.js';

export interface PriceSnapshotRepository {
  findByProductId(productId: string, days: number): Promise<PriceSnapshot[]>;
  insertBatch(snapshots: PriceSnapshot[]): Promise<void>;
}
