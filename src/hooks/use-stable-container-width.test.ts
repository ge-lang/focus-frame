import { describe, expect, it } from 'vitest';
import { advanceStableWidth, isUsableContainerWidth, type StableWidthSnapshot } from './use-stable-container-width';

const initialSnapshot: StableWidthSnapshot = {
  initialized: false,
  width: 0,
  candidateWidth: null,
  candidateFrames: 0,
};

describe('stable container width guard', () => {
  it('rejects invalid transient measurements', () => {
    expect(isUsableContainerWidth(0)).toBe(false);
    expect(isUsableContainerWidth(-1)).toBe(false);
    expect(isUsableContainerWidth(Number.NaN)).toBe(false);
    expect(isUsableContainerWidth(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it('accepts a positive finite container width', () => {
    expect(isUsableContainerWidth(1440)).toBe(true);
  });

  it('requires two initial samples before becoming ready', () => {
    const first = advanceStableWidth(initialSnapshot, 1440);
    const ready = advanceStableWidth(first, 1440);

    expect(first.initialized).toBe(false);
    expect(ready).toMatchObject({ initialized: true, width: 1440 });
  });

  it('keeps readiness and the last valid width after invalid measurements', () => {
    const ready = advanceStableWidth(advanceStableWidth(initialSnapshot, 1440), 1440);
    const afterZero = advanceStableWidth(ready, 0);

    expect(afterZero).toBe(ready);
    expect(afterZero).toMatchObject({ initialized: true, width: 1440 });
  });

  it('ignores one-pixel and subpixel jitter without remounting the grid', () => {
    const ready = advanceStableWidth(advanceStableWidth(initialSnapshot, 1427.61), 1427.58);
    const afterJitter = advanceStableWidth(ready, 1428.4);

    expect(ready.initialized).toBe(true);
    expect(afterJitter).toBe(ready);
  });

  it('accepts a meaningful resize while remaining ready', () => {
    const ready = advanceStableWidth(advanceStableWidth(initialSnapshot, 1440), 1440);
    const resized = advanceStableWidth(ready, 1200);

    expect(resized).toMatchObject({ initialized: true, width: 1200 });
  });
});
