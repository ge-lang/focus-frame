import { describe, expect, it } from 'vitest';
import { clampWidgetSize, getWidgetSizing, withWidgetSizing } from './dashboard-layout';

describe('dashboard layout sizing', () => {
  it('defines practical constraints for each widget type', () => {
    expect(getWidgetSizing('todo')).toEqual({ minW: 2, maxW: 3, minH: 2, maxH: 4 });
    expect(getWidgetSizing('news')).toEqual({ minW: 2, maxW: 3, minH: 1, maxH: 2 });
    expect(getWidgetSizing('weather')).toEqual({ minW: 1, maxW: 2, minH: 1, maxH: 2 });
  });

  it('clamps resized dimensions to the widget rules', () => {
    expect(clampWidgetSize('analytics', 1, 8)).toEqual({ w: 3, h: 3 });
    expect(clampWidgetSize('bookmarks', 4, 0)).toEqual({ w: 2, h: 1 });
  });

  it('normalizes persisted layout dimensions without changing identity', () => {
    expect(withWidgetSizing({ i: 'news-1', x: 0, y: 0, w: 1, h: 4, type: 'news' })).toEqual({
      i: 'news-1', x: 0, y: 0, w: 2, h: 2, type: 'news', minW: 2, maxW: 3, minH: 1, maxH: 2,
    });
  });
});
