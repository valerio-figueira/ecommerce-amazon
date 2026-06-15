import {
  EntityNotFoundError,
  type AutoLinkRepository,
  type CacheStore,
  type PublicWebRevalidator,
} from '@ecommerce-amazon/domain';
import { AUTO_LINKS_CACHE_KEY } from '@ecommerce-amazon/shared/seo';

export class DeleteAutoLink {
  constructor(
    private readonly autoLinkRepository: AutoLinkRepository,
    private readonly cache: CacheStore,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.autoLinkRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError('AutoLink', id);
    }

    await this.autoLinkRepository.delete(id);
    await this.cache.del(AUTO_LINKS_CACHE_KEY);
    await this.webRevalidator.revalidate({
      layoutPaths: ['/artigos'],
    });
  }
}
