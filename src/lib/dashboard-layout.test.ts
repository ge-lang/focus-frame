import { describe, expect, it } from 'vitest';
import {
  addWidgetToLayout,
  canPersistDesktopLayout,
  getGridHeightForContent,
  getWidgetSizing,
  hasLayoutCollision,
  normalizeLayout,
  removeWidgetFromLayout,
  resizeWidgetInLayout,
  stackLayoutForMobile,
} from './dashboard-layout';

describe('dashboard layout normalization', () => {
  it('defines fixed desktop dimensions for each widget type', () => {
    expect(getWidgetSizing('todo')).toEqual({ w: 6, h: 3 });
    expect(getWidgetSizing('analytics')).toEqual({ w: 8, h: 3 });
    expect(getWidgetSizing('weather')).toEqual({ w: 4, h: 3 });
  });

  it('converts rendered content height into grid rows', () => {
    expect(getGridHeightForContent(200, 72, 16, 3)).toBe(3);
    expect(getGridHeightForContent(360, 72, 16, 3)).toBe(5);
  });

  it('rejects transient or non-desktop measurements for canonical persistence', () => {
    expect(canPersistDesktopLayout(false, 1440, 'lg')).toBe(false);
    expect(canPersistDesktopLayout(true, 0, 'lg')).toBe(false);
    expect(canPersistDesktopLayout(true, 800, 'md')).toBe(false);
    expect(canPersistDesktopLayout(true, 1440, 'lg')).toBe(true);
  });

  it('expands a widget without leaving layout collisions', () => {
    const layout = [
      { i: 'weather-1', x: 0, y: 0, w: 4, h: 3, type: 'weather' as const },
      { i: 'notes-1', x: 0, y: 3, w: 4, h: 3, type: 'notes' as const },
    ];

    const expanded = resizeWidgetInLayout(layout, 'weather-1', 5);

    expect(expanded[0]).toMatchObject({ i: 'weather-1', x: 0, y: 0, h: 5 });
    expect(expanded[1]).toMatchObject({ i: 'notes-1', x: 4, y: 3 });
    expect(expanded.every((item) => !hasLayoutCollision(item, expanded))).toBe(true);
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

    expect(layout[0]).toMatchObject({ i: 'notes-1', x: 7, y: 3, w: 4, h: 3 });
  });

  it('limits pathological vertical gaps without compacting normal spacing', () => {
    const layout = normalizeLayout([
      { i: 'analytics-1', x: 0, y: 0, w: 8, h: 3, type: 'analytics' },
      { i: 'notes-1', x: 0, y: 1000, w: 4, h: 3, type: 'notes' },
    ]);

    expect(layout[0]).toMatchObject({ x: 0, y: 0 });
    expect(layout[1].y).toBe(6);
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

  it('repairs several persisted intersections deterministically', () => {
    const persisted = [
      { i: 'todo-1', x: 0, y: 0, w: 6, h: 3, type: 'todo' as const },
      { i: 'bookmarks-1', x: 0, y: 0, w: 4, h: 3, type: 'bookmarks' as const },
      { i: 'goals-1', x: 0, y: 0, w: 4, h: 3, type: 'goals' as const },
    ];
    const normalized = normalizeLayout(persisted);

    expect(normalized.every((item, index) => !hasLayoutCollision(item, normalized.slice(index + 1)))).toBe(true);
    expect(normalized).toEqual(normalizeLayout(persisted));
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

  it('normalizes a stale re-added widget position before insertion', () => {
    const existing = [
      { i: 'todo-1', x: 0, y: 0, w: 6, h: 3, type: 'todo' as const },
      { i: 'bookmarks-1', x: 6, y: 0, w: 4, h: 3, type: 'bookmarks' as const },
    ];
    const next = addWidgetToLayout(existing, {
      i: 'bookmarks-2', x: 6, y: 0, w: 4, h: 3, type: 'bookmarks',
    });

    expect(next[0]).toMatchObject({ i: 'todo-1', x: 0, y: 0 });
    expect(next[1]).toMatchObject({ i: 'bookmarks-1', x: 6, y: 0 });
    expect(next[2]).toMatchObject({ i: 'bookmarks-2', y: 3 });
    expect(next.every((item, index) => !hasLayoutCollision(item, next.slice(index + 1)))).toBe(true);
  });

  it('removes a widget without affecting the rest of the layout', () => {
    const layout = [
      { i: 'weather-1', x: 0, y: 0, w: 4, h: 3, type: 'weather' as const },
      { i: 'notes-1', x: 4, y: 0, w: 4, h: 3, type: 'notes' as const },
    ];

    expect(removeWidgetFromLayout(layout, 'weather-1')).toEqual([layout[1]]);
  });

  it('derives a deterministic one-column mobile layout without changing desktop data', () => {
    const desktop = [
      { i: 'weather-1', x: 8, y: 4, w: 4, h: 3, type: 'weather' as const },
      { i: 'notes-1', x: 0, y: 0, w: 4, h: 3, type: 'notes' as const },
    ];
    const mobile = stackLayoutForMobile(desktop, 2);

    expect(mobile).toMatchObject([
      { i: 'weather-1', x: 0, y: 0, w: 2, h: 6 },
      { i: 'notes-1', x: 0, y: 6, w: 2, h: 5 },
    ]);
    expect(desktop).toMatchObject([
      { i: 'weather-1', x: 8, y: 4, w: 4, h: 3 },
      { i: 'notes-1', x: 0, y: 0, w: 4, h: 3 },
    ]);
    expect(mobile.every((item, index) => !hasLayoutCollision(item, mobile.slice(index + 1)))).toBe(true);
  });
});
