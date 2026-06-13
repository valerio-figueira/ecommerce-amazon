import { type CacheStore, type PageBlock, type PageRepository } from '@ecommerce-amazon/domain';
import { parseBlockProps, type PageBlockDto, type PageLayoutDto } from '@ecommerce-amazon/shared/cms';

function toBlockDto(block: PageBlock): PageBlockDto {
  return {
    id: block.id,
    type: block.type,
    sortOrder: block.sortOrder,
    visibility: block.visibility,
    props: parseBlockProps(block.type, block.props),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPageLayoutDto(value: unknown): value is PageLayoutDto {
  return isRecord(value) && typeof value['slug'] === 'string' && Array.isArray(value['blocks']);
}

export type GetPublishedPageLayoutResult = PageLayoutDto;

export class GetPublishedPageLayout {
  constructor(
    private readonly pageRepository: PageRepository,
    private readonly cache: CacheStore,
  ) {}

  async execute(slug: string): Promise<GetPublishedPageLayoutResult | null> {
    const cacheKey = `vitrine:page:slug:${slug}`;
    const cached = await this.cache.get(cacheKey);
    if (isPageLayoutDto(cached)) {
      return cached;
    }

    const result = await this.pageRepository.findPublishedBySlug(slug);
    if (!result) return null;

    const response: PageLayoutDto = {
      slug: result.layout.slug,
      title: result.layout.title,
      ...(result.layout.seoTitle !== undefined ? { seoTitle: result.layout.seoTitle } : {}),
      ...(result.layout.seoDescription !== undefined
        ? { seoDescription: result.layout.seoDescription }
        : {}),
      blocks: result.blocks.map(toBlockDto),
    };

    await this.cache.set(cacheKey, response, 300);
    return response;
  }
}
