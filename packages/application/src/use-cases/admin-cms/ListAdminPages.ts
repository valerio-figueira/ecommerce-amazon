import type { AdminPageSummary, PageRepository } from '@ecommerce-amazon/domain';
import { ok, type Result } from '@ecommerce-amazon/shared';

export class ListAdminPages {
  constructor(private readonly pageRepository: PageRepository) {}

  async execute(): Promise<Result<AdminPageSummary[], never>> {
    const pages = await this.pageRepository.listPages();
    return ok(pages);
  }
}
