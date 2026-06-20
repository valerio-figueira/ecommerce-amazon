import { EntityNotFoundError, type PageBlock, type PageRepository } from '@ecommerce-amazon/domain';
import { err, ok, type Result } from '@ecommerce-amazon/shared';
import { type PageBlockDto, type PageLayoutDto } from '@ecommerce-amazon/shared/cms';

function toBlockDto(block: PageBlock): PageBlockDto {
  return {
    id: block.id,
    type: block.type,
    sortOrder: block.sortOrder,
    visibility: block.visibility,
    props: block.props,
  };
}

export class GetAdminPageLayout {
  constructor(private readonly pageRepository: PageRepository) {}

  async execute(input: { slug: string }): Promise<Result<PageLayoutDto, EntityNotFoundError>> {
    const page = await this.pageRepository.findPageBySlug(input.slug);
    if (!page) {
      return err(new EntityNotFoundError('Page', input.slug));
    }

    const sortedBlocks = [...page.blocks].sort((a, b) => a.sortOrder - b.sortOrder);

    return ok({
      slug: page.layout.slug,
      title: page.layout.title,
      seoTitle: page.layout.seoTitle,
      seoDescription: page.layout.seoDescription,
      blocks: sortedBlocks.map(toBlockDto),
    });
  }
}
