import { bentoHubMixPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { BentoHubMixGrid } from '@/components/blocks/BentoHubMixGrid';

export function BentoHubMixBlock({ block }: BlockComponentProps): React.JSX.Element {
  bentoHubMixPropsSchema.parse(block.props);

  return <BentoHubMixGrid rendered={block.renderedBentoHubMix} blockId={block.id} />;
}
