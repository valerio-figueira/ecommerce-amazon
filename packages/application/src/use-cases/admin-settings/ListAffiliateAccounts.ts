import type { AffiliateAccount } from '@ecommerce-amazon/domain';
import type { AffiliateAccountRepository } from '@ecommerce-amazon/domain';

export type AffiliateAccountDto = {
  id: string;
  marketplace: string;
  affiliateTag: string;
  status: string;
  validatedBy: string | null;
  validatedAt: string | null;
  validationNotes: string | null;
};

function mapAffiliateAccount(account: AffiliateAccount): AffiliateAccountDto {
  return {
    id: account.id,
    marketplace: account.marketplace,
    affiliateTag: account.affiliateTag,
    status: account.status,
    validatedBy: account.validatedBy ?? null,
    validatedAt: account.validatedAt?.toISOString() ?? null,
    validationNotes: account.validationNotes ?? null,
  };
}

export class ListAffiliateAccounts {
  constructor(private readonly affiliateAccountRepository: AffiliateAccountRepository) {}

  async execute(): Promise<{ items: AffiliateAccountDto[] }> {
    const accounts = await this.affiliateAccountRepository.findAll();
    return {
      items: accounts.map(mapAffiliateAccount),
    };
  }
}
