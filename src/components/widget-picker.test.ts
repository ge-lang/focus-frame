import { describe, expect, it } from 'vitest';
import { getWidgetAvailability } from './widget-picker';

describe('widget picker availability', () => {
  it('classifies present and missing widget types from the actual dashboard state', () => {
    const result = getWidgetAvailability([
      { type: 'todo' },
      { type: 'weather' },
      { type: 'goals' },
    ]);

    expect(result.onDashboard.map((widget) => widget.type)).toEqual(['todo', 'weather', 'goals']);
    expect(result.available.map((widget) => widget.type)).toEqual([
      'news', 'pomodoro', 'calendar', 'notes', 'analytics', 'bookmarks',
    ]);
  });

  it('keeps duplicate stored instances in the dashboard group without offering another add action', () => {
    const result = getWidgetAvailability([
      { type: 'todo' },
      { type: 'todo' },
    ]);

    expect(result.onDashboard.filter((widget) => widget.type === 'todo')).toHaveLength(1);
    expect(result.available.some((widget) => widget.type === 'todo')).toBe(false);
  });

  it('returns accurate available and dashboard counts when a widget is removed', () => {
    const result = getWidgetAvailability([
      { type: 'todo' },
      { type: 'weather' },
      { type: 'notes' },
    ]);

    expect(result.onDashboard).toHaveLength(3);
    expect(result.available).toHaveLength(6);
  });
});
