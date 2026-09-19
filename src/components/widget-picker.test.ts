import { describe, expect, it } from 'vitest';
import {
  WIDGET_TYPES,
  canAddWidget,
  getWidgetAvailability,
  shouldCloseWidgetPickerOnKey,
} from './widget-picker';

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

  it('keeps the complete registry calm when every widget is already added', () => {
    const result = getWidgetAvailability(WIDGET_TYPES.map(({ type }) => ({ type })));

    expect(result.available).toHaveLength(0);
    expect(result.onDashboard).toHaveLength(WIDGET_TYPES.length);
    expect(canAddWidget(result.available, 'todo')).toBe(false);
  });

  it('allows only currently available widget types to be added', () => {
    const result = getWidgetAvailability([{ type: 'todo' }]);

    expect(canAddWidget(result.available, 'weather')).toBe(true);
    expect(canAddWidget(result.available, 'todo')).toBe(false);
  });

  it('identifies Escape as the picker close key', () => {
    expect(shouldCloseWidgetPickerOnKey('Escape')).toBe(true);
    expect(shouldCloseWidgetPickerOnKey('Enter')).toBe(false);
  });
});
