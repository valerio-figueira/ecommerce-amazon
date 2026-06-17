import { describe, expect, it, vi } from 'vitest';

import { Marketplace, type CredentialCipher } from '@ecommerce-amazon/domain';

import { MarketplaceCredentialResolver } from '../../services/MarketplaceCredentialResolver.js';
import { GetMarketplaceCredentialsStatus } from './GetMarketplaceCredentialsStatus.js';
import { SaveMarketplaceCredentials } from './SaveMarketplaceCredentials.js';

class MockCipher implements CredentialCipher {
  encrypt(plaintext: string): string {
    return `enc:${plaintext}`;
  }

  decrypt(ciphertext: string): string {
    return ciphertext.replace(/^enc:/, '');
  }
}

describe('GetMarketplaceCredentialsStatus', () => {
  it('never exposes secret fields', async () => {
    const useCase = new GetMarketplaceCredentialsStatus({
      findAll: vi.fn().mockResolvedValue([
        {
          id: '1',
          marketplace: Marketplace.AMAZON_BR,
          authType: 'static_keys',
          credentialsEncrypted: 'encrypted-blob',
          publicMetadata: { accessKeyIdLast4: 'XY12' },
          healthStatus: 'connected',
          healthMessage: 'OK',
          updatedAt: new Date(),
        },
      ]),
    } as never);

    const result = await useCase.execute();
    expect(result.items).toHaveLength(2);
    expect(JSON.stringify(result)).not.toContain('encrypted-blob');
    expect(JSON.stringify(result)).not.toContain('secretAccessKey');
  });
});

describe('SaveMarketplaceCredentials', () => {
  it('encrypts credentials and invalidates cache', async () => {
    const cipher = new MockCipher();
    const repository = {
      upsert: vi.fn().mockResolvedValue({
        id: '1',
        marketplace: Marketplace.AMAZON_BR,
        authType: 'static_keys',
        credentialsEncrypted: 'blob',
        publicMetadata: {},
        healthStatus: 'not_configured',
        updatedAt: new Date(),
      }),
      findAll: vi.fn().mockResolvedValue([]),
    };
    const cache = {
      del: vi.fn().mockResolvedValue(undefined),
      get: vi.fn(),
      set: vi.fn(),
    };
    const resolver = new MarketplaceCredentialResolver(repository as never, cipher, cache as never);
    const useCase = new SaveMarketplaceCredentials(repository as never, cipher, resolver);

    await useCase.execute({
      marketplace: Marketplace.AMAZON_BR,
      credentials: {
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      },
      updatedBy: 'operator-1',
    });

    expect(repository.upsert).toHaveBeenCalled();
    const upsertArg = repository.upsert.mock.calls[0]?.[0];
    expect(upsertArg.credentialsEncrypted).toMatch(/^enc:/);
    expect(upsertArg.credentialsEncrypted).not.toBe(
      JSON.stringify({
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      }),
    );
    expect(cache.del).toHaveBeenCalledWith('vitrine:marketplace-credentials:amazon_br');
  });
});

describe('MarketplaceCredentialResolver', () => {
  it('uses cache on second resolve', async () => {
    const cipher = new MockCipher();
    const encrypted = cipher.encrypt(
      JSON.stringify({
        partnerId: '123',
        partnerKey: 'secret-key-value',
      }),
    );
    const repository = {
      findByMarketplace: vi.fn().mockResolvedValue({
        id: '1',
        marketplace: Marketplace.SHOPEE_BR,
        authType: 'static_keys',
        credentialsEncrypted: encrypted,
        publicMetadata: {},
        healthStatus: 'connected',
        updatedAt: new Date(),
      }),
      touchLastUsed: vi.fn().mockResolvedValue(undefined),
    };
    const cache = {
      get: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({
        marketplace: Marketplace.SHOPEE_BR,
        partnerId: '123',
        partnerKey: 'secret-key-value',
      }),
      set: vi.fn().mockResolvedValue(undefined),
      del: vi.fn(),
    };

    const resolver = new MarketplaceCredentialResolver(repository as never, cipher, cache as never);
    const first = await resolver.resolve(Marketplace.SHOPEE_BR);
    const second = await resolver.resolve(Marketplace.SHOPEE_BR);

    expect(first?.marketplace).toBe(Marketplace.SHOPEE_BR);
    expect(second?.marketplace).toBe(Marketplace.SHOPEE_BR);
    expect(repository.findByMarketplace).toHaveBeenCalledTimes(1);
    expect(cache.set).toHaveBeenCalledTimes(1);
  });
});
