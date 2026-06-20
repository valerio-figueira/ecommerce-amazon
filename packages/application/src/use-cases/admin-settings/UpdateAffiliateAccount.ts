import {
  AffiliateAccountStatus,
  EntityNotFoundError,
  ValidationError,
  parseAffiliateAccountStatus,
  type AffiliateAccountRepository,
} from '@ecommerce-amazon/domain';

import type { AffiliateScaleGateService } from '../../services/AffiliateScaleGateService.js';
import type { AffiliateAccountDto } from './ListAffiliateAccounts.js';
import { ListAffiliateAccounts } from './ListAffiliateAccounts.js';

export type UpdateAffiliateAccountInput = {
  accountId: string;
  operatorEmail: string;
  affiliateTag?: string;
  status?: string;
  validationNotes?: string | null;
  checklistConfirmed?: boolean;
};

export class UpdateAffiliateAccount {
  constructor(
    private readonly affiliateAccountRepository: AffiliateAccountRepository,
    private readonly gateService: AffiliateScaleGateService,
  ) {}

  async execute(input: UpdateAffiliateAccountInput): Promise<AffiliateAccountDto> {
    const account = await this.affiliateAccountRepository.findById(input.accountId);
    if (!account) {
      throw new EntityNotFoundError('AffiliateAccount', input.accountId);
    }

    const nextStatus =
      input.status !== undefined
        ? parseAffiliateAccountStatus(input.status)
        : account.status;

    if (
      nextStatus === AffiliateAccountStatus.ACTIVE &&
      account.status !== AffiliateAccountStatus.ACTIVE &&
      !input.checklistConfirmed
    ) {
      throw new ValidationError(
        'Checklist de validação manual deve ser confirmado para ativar a conta',
      );
    }

    await this.affiliateAccountRepository.update(input.accountId, {
      ...(input.affiliateTag !== undefined ? { affiliateTag: input.affiliateTag } : {}),
      ...(input.status !== undefined ? { status: nextStatus } : {}),
      ...(input.validationNotes !== undefined ? { validationNotes: input.validationNotes } : {}),
      ...(nextStatus === AffiliateAccountStatus.ACTIVE
        ? {
            validatedBy: input.operatorEmail,
            validatedAt: new Date(),
          }
        : {}),
    });

    await this.gateService.invalidateSettingsCache();

    const mapper = new ListAffiliateAccounts(this.affiliateAccountRepository);
    const listed = await mapper.execute();
    const dto = listed.items.find((item) => item.id === input.accountId);
    if (!dto) {
      throw new EntityNotFoundError('AffiliateAccount', input.accountId);
    }

    return dto;
  }
}
