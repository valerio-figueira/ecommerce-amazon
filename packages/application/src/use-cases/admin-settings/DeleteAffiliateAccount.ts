import {
  EntityNotFoundError,
  type AffiliateAccountRepository,
} from '@ecommerce-amazon/domain';

import type { AffiliateScaleGateService } from '../../services/AffiliateScaleGateService.js';

export type DeleteAffiliateAccountInput = {
  accountId: string;
};

export class DeleteAffiliateAccount {
  constructor(
    private readonly affiliateAccountRepository: AffiliateAccountRepository,
    private readonly gateService: AffiliateScaleGateService,
  ) {}

  async execute(input: DeleteAffiliateAccountInput): Promise<{ deleted: true }> {
    const account = await this.affiliateAccountRepository.findById(input.accountId);
    if (!account) {
      throw new EntityNotFoundError('AffiliateAccount', input.accountId);
    }

    await this.affiliateAccountRepository.delete(input.accountId);
    await this.gateService.invalidateSettingsCache();

    return { deleted: true };
  }
}
