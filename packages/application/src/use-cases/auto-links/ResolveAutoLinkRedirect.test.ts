import { describe, expect, it, vi } from 'vitest';

import {
  AffiliateAccountStatus,
  AutoLink,
  AutoLinkApplyTo,
  EntityNotFoundError,
  Marketplace,
  type AffiliateAccountRepository,
  type AffiliateLinkBuilder,
  type AutoLinkRepository,
} from '@ecommerce-amazon/domain';

import { ResolveAutoLinkRedirect } from './ResolveAutoLinkRedirect.js';

const autoLink = AutoLink.create({
  id: 'a1111111-1111-4111-8111-111111111111',
  keyword: 'oferta amazon',
  targetUrl: 'https://www.amazon.com.br/dp/B001?tag=test',
  applyTo: AutoLinkApplyTo.BOTH,
});

describe('ResolveAutoLinkRedirect', () => {
  it('redirects active external auto-link with tracking', async () => {
    const autoLinkRepository: AutoLinkRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(autoLink),
      findByKeywordNormalized: vi.fn(),
      findAllActiveSortedByPriority: vi.fn(),
      listPaginated: vi.fn(),
      delete: vi.fn(),
    };
    const affiliateAccountRepository: AffiliateAccountRepository = {
      findByMarketplace: vi.fn().mockResolvedValue({
        status: AffiliateAccountStatus.ACTIVE,
        affiliateTag: 'tag-20',
      }),
      findById: vi.fn(),
      listAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const affiliateLinkBuilder: AffiliateLinkBuilder = {
      build: vi.fn(),
      buildBatchCheckout: vi.fn(),
      buildWithTracking: vi.fn(),
      appendTrackingToStoredUrl: vi
        .fn()
        .mockReturnValue('https://www.amazon.com.br/dp/B001?tag=test&utm_source=auto'),
    };

    const useCase = new ResolveAutoLinkRedirect(
      autoLinkRepository,
      affiliateAccountRepository,
      affiliateLinkBuilder,
    );

    const result = await useCase.execute({ id: autoLink.id, origin: 'auto_link' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.targetUrl).toContain('utm_source=auto');
    }
    expect(affiliateLinkBuilder.appendTrackingToStoredUrl).toHaveBeenCalledWith(
      autoLink.targetUrl,
      Marketplace.AMAZON_BR,
      expect.objectContaining({ origin: 'auto_link' }),
      'tag-20',
    );
  });

  it('returns not found for inactive auto-link', async () => {
    const inactive = autoLink.deactivate();
    const autoLinkRepository: AutoLinkRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(inactive),
      findByKeywordNormalized: vi.fn(),
      findAllActiveSortedByPriority: vi.fn(),
      listPaginated: vi.fn(),
      delete: vi.fn(),
    };
    const useCase = new ResolveAutoLinkRedirect(
      autoLinkRepository,
      {} as AffiliateAccountRepository,
      {} as AffiliateLinkBuilder,
    );

    const result = await useCase.execute({ id: autoLink.id });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(EntityNotFoundError);
    }
  });
});
