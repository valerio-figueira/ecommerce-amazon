import {
  AffiliateAccountStatus,
  type AffiliateAccountRepository,
  type SyncJobLogRepository,
} from '@ecommerce-amazon/domain';
import { loadEnv } from '@ecommerce-amazon/shared';
import type { OperationalStatusResponse } from '@ecommerce-amazon/shared/admin';

export class GetOperationalStatus {
  constructor(
    private readonly affiliateAccountRepository: AffiliateAccountRepository,
    private readonly syncJobLogRepository: SyncJobLogRepository,
  ) {}

  async execute(): Promise<OperationalStatusResponse> {
    const env = loadEnv();
    const ga4PropertyId = process.env['GA4_PROPERTY_ID']?.trim();
    const ga4Credentials = process.env['GA4_SERVICE_ACCOUNT_JSON']?.trim();
    const accounts = await this.affiliateAccountRepository.findAll();
    const pendingMarketplaces = accounts
      .filter((account) => account.status === AffiliateAccountStatus.PENDING)
      .map((account) => account.marketplace);

    const recentSyncFailures = await this.syncJobLogRepository.findRecent({
      limit: 10,
      status: 'failed',
    });

    return {
      env: {
        resendConfigured: Boolean(env.RESEND_API_KEY),
        ga4Configured: Boolean(ga4PropertyId && ga4Credentials),
        storageDriver: env.STORAGE_DRIVER,
      },
      affiliateGate: {
        readyForScale: pendingMarketplaces.length === 0,
        pendingMarketplaces,
        accounts: accounts.map((account) => ({
          marketplace: account.marketplace,
          status: account.status as 'pending_manual_validation' | 'active' | 'suspended',
        })),
      },
      recentSyncFailures: recentSyncFailures.map((log) => ({
        id: log.id,
        jobType: log.jobType,
        status: log.status,
        itemsProcessed: log.itemsProcessed,
        errors: log.errors,
        startedAt: log.startedAt.toISOString(),
        finishedAt: log.finishedAt?.toISOString() ?? null,
      })),
    };
  }
}
