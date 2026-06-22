import { describe, expect, it } from 'vitest';

import { computeMaxZoomForCrop, computeMinZoomToFitMedia } from './admin-image-crop';

describe('computeMinZoomToFitMedia', () => {
  const cropAspect = 4 / 3;

  it('returns 1 when media matches crop aspect', () => {
    expect(computeMinZoomToFitMedia(cropAspect, 1200, 900)).toBe(1);
  });

  it('allows zooming out for portrait uploads', () => {
    const minZoom = computeMinZoomToFitMedia(cropAspect, 900, 1200);
    expect(minZoom).toBeLessThan(1);
    expect(minZoom).toBeCloseTo(0.5625, 4);
  });

  it('allows zooming out for wide uploads', () => {
    const minZoom = computeMinZoomToFitMedia(cropAspect, 1600, 900);
    expect(minZoom).toBeLessThan(1);
    expect(minZoom).toBeCloseTo(0.75, 4);
  });
});

describe('computeMaxZoomForCrop', () => {
  it('keeps enough zoom-in range for small min zoom values', () => {
    expect(computeMaxZoomForCrop(0.25)).toBeGreaterThanOrEqual(4);
  });
});
