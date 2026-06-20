'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import type {
  EngagementEventTypeValue,
  EngagementPlacementValue,
} from '@ecommerce-amazon/shared/analytics';

import { recordEngagement } from '@/lib/api/engagement';
import { resolveReferrerPath } from '@/lib/attribution/context';
import { useWishlist } from '@/components/wishlist/WishlistProvider';

type TrackEngagementProps = {
  eventType: EngagementEventTypeValue;
  articleId: string;
  placement?: EngagementPlacementValue;
  blockId?: string;
};

export function TrackEngagement({
  eventType,
  articleId,
  placement,
  blockId,
}: TrackEngagementProps): null {
  const pathname = usePathname();
  const { sessionId } = useWishlist();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;

    const referrerPath = resolveReferrerPath();
    void recordEngagement({
      eventType,
      articleId,
      pagePath: pathname,
      ...(placement !== undefined ? { placement } : {}),
      ...(blockId !== undefined ? { blockId } : {}),
      ...(sessionId !== undefined ? { sessionId } : {}),
      ...(referrerPath !== undefined ? { referrerPath } : {}),
    });
  }, [articleId, blockId, eventType, pathname, placement, sessionId]);

  return null;
}
