import type { PriceAlert } from '../entities/PriceAlert.js';
import { AlertStatus } from '../enums/index.js';

export interface PriceAlertRepository {
  findById(id: string): Promise<PriceAlert | null>;
  findByConfirmToken(token: string): Promise<PriceAlert | null>;
  findActiveByProductId(productId: string): Promise<PriceAlert[]>;
  countActiveByEmail(email: string): Promise<number>;
  save(alert: PriceAlert): Promise<void>;
  findActiveForProduct(productId: string): Promise<PriceAlert[]>;
  updateStatus(id: string, status: AlertStatus, triggeredAt?: Date): Promise<void>;
}
