import {
  AffiliateAccountStatus,
  Marketplace,
  ValidationError,
  type AffiliateAccountRepository,
} from '@ecommerce-amazon/domain';

import type { AffiliateScaleGateService } from '../../services/AffiliateScaleGateService.js';
import type { AffiliateAccountDto } from './ListAffiliateAccounts.js';
import { ListAffiliateAccounts } from './ListAffiliateAccounts.js';

export type CreateAffiliateAccountInput = {
  marketplace: Marketplace;
  affiliateTag: string;
};

export class CreateAffiliateAccount {
  constructor(
    private readonly affiliateAccountRepository: AffiliateAccountRepository,
    private readonly gateService: AffiliateScaleGateService,
  ) {}

  async execute(input: CreateAffiliateAccountInput): Promise<AffiliateAccountDto> {
    const existing = await this.affiliateAccountRepository.findByMarketplace(input.marketplace);
    if (existing) {
      throw new ValidationError('Já existe uma conta de afiliado para este marketplace');
    }

    const created = await this.affiliateAccountRepository.create({
      marketplace: input.marketplace,
      affiliateTag: input.affiliateTag.trim(),
      status: AffiliateAccountStatus.PENDING,
    });

    await this.gateService.invalidateSettingsCache();

    const mapper = new ListAffiliateAccounts(this.affiliateAccountRepository);
    const listed = await mapper.execute();
    const dto = listed.items.find((item) => item.id === created.id);
    if (!dto) {
      throw new ValidationError('Falha ao carregar conta de afiliado criada');
    }

    return dto;
  }
}
