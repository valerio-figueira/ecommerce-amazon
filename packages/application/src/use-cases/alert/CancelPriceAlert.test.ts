import { describe, expect, it, vi } from 'vitest';

import {
  AlertStatus,
  Email,
  PriceAlert,
  ValidationError,
  type PriceAlertRepository,
} from '@ecommerce-amazon/domain';

import { CancelPriceAlert } from './CancelPriceAlert.js';

function createAlert(status: AlertStatus): PriceAlert {
  return new PriceAlert(
    'a1111111-1111-4111-8111-111111111111',
    'b1111111-1111-4111-8111-111111111111',
    Email.create('user@example.com'),
    99.9,
    status,
    'confirm-token-abc',
    new Date(),
  );
}

describe('CancelPriceAlert', () => {
  it('expires an active alert by confirm token', async () => {
    const alert = createAlert(AlertStatus.ACTIVE);
    const alertRepository: PriceAlertRepository = {
      findById: vi.fn(),
      findByConfirmToken: vi.fn().mockResolvedValue(alert),
      findActiveByProductId: vi.fn(),
      countActiveByEmail: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      findActiveForProduct: vi.fn(),
      updateStatus: vi.fn(),
    };

    const useCase = new CancelPriceAlert(alertRepository);
    const result = await useCase.execute('confirm-token-abc');

    expect(result.ok).toBe(true);
    expect(alertRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: AlertStatus.EXPIRED }),
    );
  });

  it('returns idempotent success for already expired alerts', async () => {
    const alert = createAlert(AlertStatus.EXPIRED);
    const alertRepository: PriceAlertRepository = {
      findById: vi.fn(),
      findByConfirmToken: vi.fn().mockResolvedValue(alert),
      findActiveByProductId: vi.fn(),
      countActiveByEmail: vi.fn(),
      save: vi.fn(),
      findActiveForProduct: vi.fn(),
      updateStatus: vi.fn(),
    };

    const useCase = new CancelPriceAlert(alertRepository);
    const result = await useCase.execute('confirm-token-abc');

    expect(result.ok).toBe(true);
    expect(alertRepository.save).not.toHaveBeenCalled();
  });

  it('returns validation error for unknown token', async () => {
    const alertRepository: PriceAlertRepository = {
      findById: vi.fn(),
      findByConfirmToken: vi.fn().mockResolvedValue(null),
      findActiveByProductId: vi.fn(),
      countActiveByEmail: vi.fn(),
      save: vi.fn(),
      findActiveForProduct: vi.fn(),
      updateStatus: vi.fn(),
    };

    const useCase = new CancelPriceAlert(alertRepository);
    const result = await useCase.execute('missing');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });
});
