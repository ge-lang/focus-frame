import { describe, expect, it } from 'vitest';
import { finishMobileDrag, type MobileDragEndReason } from './mobile-widget-list';

describe('mobile reorder pointer cleanup', () => {
  it.each(['pointerup', 'pointercancel', 'lostpointercapture', 'cleanup'] as MobileDragEndReason[])('clears drag state on %s', (reason) => {
    expect(finishMobileDrag({ id: 'weather-1', pointerId: 7 }, 7, reason)).toBeNull();
  });

  it('does not clear a different active pointer', () => {
    expect(finishMobileDrag({ id: 'weather-1', pointerId: 7 }, 8, 'pointerup')).toEqual({ id: 'weather-1', pointerId: 7 });
  });
});
