import { describe, expect, it } from 'vitest';
import { isUsableContainerWidth } from './use-stable-container-width';

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
});
