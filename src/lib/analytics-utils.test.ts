import { describe, expect, it } from 'vitest';
import {
  calculateProductivity,
  calculateStreak,
  calculateTrend,
  localDayKey,
  startOfLocalRange,
  sumDurations,
} from './analytics-utils';

describe('analytics helpers', () => {
  it('uses the local calendar date for day keys around midnight', () => {
    const date = new Date(2025, 0, 2, 0, 15);
    expect(localDayKey(date)).toBe('2025-01-02');
    expect(localDayKey(new Date(2025, 0, 1, 23, 59))).toBe('2025-01-01');
  });

  it('starts ranges at local midnight', () => {
    const start = startOfLocalRange(3, new Date(2025, 0, 10, 18, 30));
    expect(start).toEqual(new Date(2025, 0, 8, 0, 0, 0, 0));
  });

  it('sums empty and populated duration collections', () => {
    expect(sumDurations([])).toBe(0);
    expect(sumDurations([{ duration: 60 }, { duration: 90 }])).toBe(150);
  });

  it('keeps productivity and trend finite when goals or history are zero', () => {
    expect(calculateProductivity(0, 0, 0, 0)).toBe(0);
    expect(calculateProductivity(60, 0, 1, 0)).toBe(0);
    expect(calculateTrend(0, 0)).toBe(0);
    expect(calculateTrend(60, 0)).toBe(100);
  });

  it('calculates normal productivity and streak transitions', () => {
    expect(calculateProductivity(50, 100, 1, 2)).toBe(50);
    expect(calculateStreak(new Set(['2025-01-08', '2025-01-09']), new Date(2025, 0, 9, 12))).toBe(2);
    expect(calculateStreak(new Set(['2025-01-08']), new Date(2025, 0, 9, 12))).toBe(0);
  });
});
