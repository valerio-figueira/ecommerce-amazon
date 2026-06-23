import { describe, expect, it } from 'vitest';

import {
  clampSourceCrop,
  computeContainDrawRect,
  computeMaxZoomForCrop,
  computeMinZoomToFitMedia,
} from './admin-image-crop';

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

describe('clampSourceCrop', () => {
  it('clamps crop coordinates to image bounds', () => {
    expect(clampSourceCrop({ x: -10, y: -5, width: 200, height: 150 }, 120, 90)).toEqual({
      x: 0,
      y: 0,
      width: 120,
      height: 90,
    });
  });
});

describe('computeContainDrawRect', () => {
  it('centers a portrait region inside a landscape canvas', () => {
    expect(computeContainDrawRect(1200, 900, 600, 900)).toEqual({
      x: 300,
      y: 0,
      width: 600,
      height: 900,
    });
  });

  it('fills the canvas when aspects match', () => {
    expect(computeContainDrawRect(1200, 900, 800, 600)).toEqual({
      x: 0,
      y: 0,
      width: 1200,
      height: 900,
    });
  });
});
