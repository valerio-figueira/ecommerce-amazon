import { BlockType, BlockVisibility } from '../enums/cms.js';

export class PageBlock {
  constructor(
    readonly id: string,
    readonly pageId: string,
    readonly type: BlockType,
    readonly sortOrder: number,
    readonly props: Record<string, unknown>,
    readonly visibility: BlockVisibility,
  ) {}

  static create(props: {
    id: string;
    pageId: string;
    type: BlockType;
    sortOrder: number;
    props: Record<string, unknown>;
    visibility?: BlockVisibility;
  }): PageBlock {
    return new PageBlock(
      props.id,
      props.pageId,
      props.type,
      props.sortOrder,
      props.props,
      props.visibility ?? BlockVisibility.ALL,
    );
  }
}
