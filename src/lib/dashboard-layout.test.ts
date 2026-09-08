import { describe, expect, it } from 'vitest';
import {
  addWidgetToLayout,
  getWidgetSizing,
  hasLayoutCollision,
  normalizeLayout,
  removeWidgetFromLayout,
} from './dashboard-layout';

describe('dashboard layout normalization', () => {
  it('defines fixed desktop dimensions for each widget type', () => {
    expect(getWidgetSizing('todo')).toEqual({ w: 6, h: 3 });
    expect(getWidgetSizing('analytics')).toEqual({ w: 8, h: 3 });
    expect(getWidgetSizing('weather')).toEqual({ w: 4, h: 3 });
  });

  it('converts legacy three-column positions to the twelve-column grid', () => {
    const layout = normalizeLayout([
      { i: 'weather-1', x: 2, y: 0, w: 1, h: 1, type: 'weather' },
      { i: 'pomodoro-1', x: 0, y: 1, w: 1, h: 1, type: 'pomodoro' },
    ]);

    expect(layout[0]).toMatchObject({ i: 'weather-1', x: 8, y: 0, w: 4, h: 3 });
    expect(layout[1]).toMatchObject({ i: 'pomodoro-1', x: 0, y: 1, w: 4, h: 3 });
  });

  it('preserves valid twelve-column positions and applies fixed dimensions', () => {
    const layout = normalizeLayout([
      { i: 'notes-1', x: 7, y: 5, w: 4, h: 1, type: 'notes' },
    ]);

    expect(layout[0]).toMatchObject({ i: 'notes-1', x: 7, y: 5, w: 4, h: 3 });
  });

  it('clamps positions and resolves overlaps deterministically', () => {
    const layout = normalizeLayout([
      { i: 'goals-1', x: 20, y: 0, w: 1, h: 1, type: 'goals' },
      { i: 'bookmarks-1', x: 20, y: 0, w: 1, h: 1, type: 'bookmarks' },
    ]);

    expect(layout[0]).toMatchObject({ x: 8, y: 0, w: 4, h: 3 });
    expect(layout[1]).toMatchObject({ x: 4, y: 0, w: 4, h: 3 });
    expect(hasLayoutCollision(layout[0], [layout[1]])).toBe(false);
  });

  it('adds widgets after the occupied layout without moving existing widgets', () => {
    const existing = [{ i: 'todo-1', x: 0, y: 0, w: 6, h: 3, type: 'todo' as const }];
    const next = addWidgetToLayout(existing, { i: 'weather-1', x: 0, y: 0, w: 1, h: 1, type: 'weather' });

    expect(next[0]).toEqual(existing[0]);
    expect(next[1]).toMatchObject({ i: 'weather-1', x: 0, y: 3, w: 4, h: 3 });
    expect(hasLayoutCollision(next[1], [next[0]])).toBe(false);
  });

  it('keeps repeated widget types in separate appended positions', () => {
    const existing = [{ i: 'pomodoro-1', x: 4, y: 2, w: 4, h: 3, type: 'pomodoro' as const }];
    const next = addWidgetToLayout(existing, { i: 'pomodoro-2', x: 0, y: 0, w: 1, h: 1, type: 'pomodoro' });

    expect(next[1]).toMatchObject({ i: 'pomodoro-2', x: 0, y: 5, w: 4, h: 3 });
    expect(next[0]).toMatchObject({ x: 4, y: 2 });
    expect(hasLayoutCollision(next[1], next.slice(0, 1))).toBe(false);
  });

  it('places a new widget on the next free row when the preferred row is full', () => {
    const existing = [
      { i: 'todo-1', x: 0, y: 0, w: 6, h: 3, type: 'todo' as const },
      { i: 'news-1', x: 6, y: 0, w: 6, h: 3, type: 'news' as const },
    ];
    const next = addWidgetToLayout(existing, { i: 'weather-1', x: 0, y: 0, w: 1, h: 1, type: 'weather' });

    expect(next[2]).toMatchObject({ i: 'weather-1', x: 0, y: 3, w: 4, h: 3 });
    expect(next.every((item, index) => !hasLayoutCollision(item, next.slice(index + 1)))).toBe(true);
  });

  it('removes a widget without affecting the rest of the layout', () => {
    const layout = [
      { i: 'weather-1', x: 0, y: 0, w: 4, h: 3, type: 'weather' as const },
      { i: 'notes-1', x: 4, y: 0, w: 4, h: 3, type: 'notes' as const },
    ];

    expect(removeWidgetFromLayout(layout, 'weather-1')).toEqual([layout[1]]);
  });
});
