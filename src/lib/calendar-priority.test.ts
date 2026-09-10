import { describe, expect, it } from 'vitest';
import { getCalendarPriorityAccent } from './calendar-priority';

describe('calendar priority accents', () => {
  it('maps task priority to the shared semantic accent classes', () => {
    expect(getCalendarPriorityAccent('low')).toBe('ff-accent-green');
    expect(getCalendarPriorityAccent('medium')).toBe('ff-accent-amber');
    expect(getCalendarPriorityAccent('high')).toBe('ff-accent-rose');
  });

  it('keeps entries without task priority neutral', () => {
    expect(getCalendarPriorityAccent(undefined)).toBeNull();
    expect(getCalendarPriorityAccent('')).toBeNull();
  });
});
