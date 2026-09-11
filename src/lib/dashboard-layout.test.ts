import { describe, expect, it } from 'vitest';
import {
  addWidgetToLayout,
  COMPACT_LAYOUT_VERSION,
  migrateToCompactLayout,
  canPersistDesktopLayout,
  compactLayoutForColumns,
  getGridHeightForContent,
  getWidgetSizing,
  hasLayoutCollision,
  applyLayoutHeightOverrides,
  normalizeLayout,
  normalizeDesktopOrigin,
  reconcileLayoutTypes,
  removeWidgetFromLayout,
  resizeWidgetInLayout,
  stackLayoutForMobile,
} from './dashboard-layout';

describe('dashboard layout normalization', () => {
  it('defines fixed desktop dimensions for each widget type', () => {
    for (const type of ['todo', 'news', 'analytics', 'weather', 'pomodoro', 'calendar', 'notes', 'bookmarks', 'goals'] as const) {
      expect(getWidgetSizing(type)).toEqual({ w: 4, h: 2 });
    }
  });

  it('migrates every existing widget to the exact compact 3x3 arrangement once', () => {
    const types = ['todo', 'news', 'pomodoro', 'weather', 'calendar', 'analytics', 'notes', 'goals', 'bookmarks'] as const;
    const widgets = types.map((type, index) => ({ id: `${type}-${index}`, type, colSpan: 8, rowSpan: 4 }));
    const oldLayout = widgets.map((widget, index) => ({ i: widget.id, x: index, y: index * 7, w: 8, h: 4, type: widget.type }));
    const migrated = migrateToCompactLayout(oldLayout, widgets, 0);

    expect(migrated.migrated).toBe(true);
    expect(migrated.layout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }))).toEqual([
      { i: 'todo-0', x: 0, y: 0, w: 4, h: 2 },
      { i: 'news-1', x: 4, y: 0, w: 4, h: 2 },
      { i: 'pomodoro-2', x: 8, y: 0, w: 4, h: 2 },
      { i: 'weather-3', x: 0, y: 2, w: 4, h: 2 },
      { i: 'calendar-4', x: 4, y: 2, w: 4, h: 2 },
      { i: 'analytics-5', x: 8, y: 2, w: 4, h: 2 },
      { i: 'notes-6', x: 0, y: 4, w: 4, h: 2 },
      { i: 'goals-7', x: 4, y: 4, w: 4, h: 2 },
      { i: 'bookmarks-8', x: 8, y: 4, w: 4, h: 2 },
    ]);
    expect(migrated.widgets.every((widget) => widget.colSpan === 4 && widget.rowSpan === 2)).toBe(true);
  });

  it('does not reset user positions after the compact version is persisted', () => {
    const widgets = [{ id: 'weather-1', type: 'weather' as const, colSpan: 4, rowSpan: 2 }];
    const moved = [{ i: 'weather-1', x: 8, y: 8, w: 4, h: 2, type: 'weather' as const }];
    const result = migrateToCompactLayout(moved, widgets, COMPACT_LAYOUT_VERSION);

    expect(result.migrated).toBe(false);
    expect(result.layout[0]).toMatchObject({ i: 'weather-1', x: 8, y: 8, w: 4, h: 2 });
  });

  it('migrates only widgets that exist and does not fabricate missing slots', () => {
    const widgets = [
      { id: 'todo-1', type: 'todo' as const, colSpan: 8, rowSpan: 3 },
      { id: 'goals-1', type: 'goals' as const, colSpan: 4, rowSpan: 3 },
    ];
    const result = migrateToCompactLayout([], widgets, 0);

    expect(result.layout).toEqual([
      { i: 'todo-1', x: 0, y: 0, w: 4, h: 2, type: 'todo' },
      { i: 'goals-1', x: 4, y: 4, w: 4, h: 2, type: 'goals' },
    ]);
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
    expect(expanded[1]).toMatchObject({ i: 'notes-1', x: 0, y: 5 });
    expect(expanded.every((item) => !hasLayoutCollision(item, expanded))).toBe(true);
  });

  it('preserves explicit positions while applying compact dimensions', () => {
    const layout = normalizeLayout([
      { i: 'weather-1', x: 2, y: 0, w: 1, h: 1, type: 'weather' },
      { i: 'pomodoro-1', x: 0, y: 1, w: 1, h: 1, type: 'pomodoro' },
    ]);

    expect(layout[0]).toMatchObject({ i: 'weather-1', x: 2, y: 0, w: 4, h: 2 });
    expect(layout[1]).toMatchObject({ i: 'pomodoro-1', x: 0, y: 2, w: 4, h: 2 });
  });

  it('preserves valid twelve-column positions and applies fixed dimensions', () => {
    const layout = normalizeLayout([
      { i: 'notes-1', x: 7, y: 5, w: 4, h: 1, type: 'notes' },
    ]);

    expect(layout[0]).toMatchObject({ i: 'notes-1', x: 7, y: 5, w: 4, h: 2 });
  });

  it('keeps canonical desktop widths when a responsive layout is normalized', () => {
    const normalized = normalizeLayout([
      { i: 'todo-1', x: 0, y: 0, w: 10, h: 3, type: 'todo' },
      { i: 'analytics-1', x: 0, y: 3, w: 10, h: 3, type: 'analytics' },
    ]);

    expect(normalized).toMatchObject([
      { i: 'todo-1', w: 4 },
      { i: 'analytics-1', w: 4 },
    ]);
  });

  it('reconciles a corrupted Tasks layout item from authoritative widget metadata', () => {
    const reconciled = reconcileLayoutTypes([
      { i: 'todo-123', x: 0, y: 0, w: 4, h: 3, type: 'notes' },
    ], [{ id: 'todo-123', type: 'todo' }]);
    const normalized = normalizeLayout(reconciled);

    expect(normalized[0]).toMatchObject({ i: 'todo-123', type: 'todo', w: 4, h: 2 });
  });

  it('reconciles News and Analytics layout identity before sizing', () => {
    const normalized = normalizeLayout(reconcileLayoutTypes([
      { i: 'news-123', x: 0, y: 0, w: 4, h: 3, type: 'notes' },
      { i: 'analytics-123', x: 8, y: 0, w: 8, h: 3, type: 'notes' },
    ], [
      { id: 'news-123', type: 'news' },
      { id: 'analytics-123', type: 'analytics' },
    ]));

    expect(normalized).toMatchObject([
      { i: 'news-123', type: 'news', w: 4 },
      { i: 'analytics-123', type: 'analytics', w: 4 },
    ]);
  });

  it('keeps matching types and ignores orphan layout items', () => {
    const reconciled = reconcileLayoutTypes([
      { i: 'weather-1', x: 0, y: 0, w: 4, h: 3, type: 'weather' },
      { i: 'orphan', x: 4, y: 0, w: 4, h: 3, type: 'notes' },
    ], [{ id: 'weather-1', type: 'weather' }]);

    expect(reconciled).toEqual([
      { i: 'weather-1', x: 0, y: 0, w: 4, h: 3, type: 'weather' },
    ]);
  });

  it('migrates old saved desktop widths to the new type-derived widths', () => {
    const migrated = normalizeLayout([
      { i: 'todo-1', x: 0, y: 0, w: 6, h: 3, type: 'todo' },
      { i: 'news-1', x: 0, y: 3, w: 6, h: 3, type: 'news' },
      { i: 'analytics-1', x: 8, y: 0, w: 8, h: 3, type: 'analytics' },
    ]);

    expect(migrated).toMatchObject([
      { i: 'todo-1', w: 4 },
      { i: 'news-1', w: 4 },
      { i: 'analytics-1', w: 4 },
    ]);
    expect(migrated.every((item, index) => !hasLayoutCollision(item, migrated.slice(index + 1)))).toBe(true);
  });

  it('is idempotent for canonical desktop layouts after reload', () => {
    const persisted = [
      { i: 'todo-1', x: 0, y: 0, w: 4, h: 2, type: 'todo' as const },
      { i: 'weather-1', x: 8, y: 0, w: 4, h: 2, type: 'weather' as const },
      { i: 'analytics-1', x: 0, y: 4, w: 4, h: 2, type: 'analytics' as const },
    ];

    const firstLoad = normalizeLayout(persisted);
    const reload = normalizeLayout(firstLoad);

    expect(reload).toEqual(firstLoad);
    expect(reload).toMatchObject([
      { i: 'todo-1', w: 4 },
      { i: 'weather-1', w: 4 },
      { i: 'analytics-1', w: 4 },
    ]);
  });

  it('preserves intentional vertical gaps during normalization', () => {
    const layout = normalizeLayout([
      { i: 'analytics-1', x: 0, y: 0, w: 8, h: 3, type: 'analytics' },
      { i: 'notes-1', x: 0, y: 1000, w: 4, h: 3, type: 'notes' },
    ]);

    expect(layout[0]).toMatchObject({ x: 0, y: 0 });
    expect(layout[1]).toMatchObject({ x: 0, y: 1000 });
  });

  it('preserves free-form x/y placement across multiple reload normalizations', () => {
    const layout = [
      { i: 'todo-1', x: 0, y: 0, w: 8, h: 3, type: 'todo' as const },
      { i: 'weather-1', x: 8, y: 0, w: 4, h: 3, type: 'weather' as const },
      { i: 'news-1', x: 0, y: 10, w: 8, h: 3, type: 'news' as const },
      { i: 'calendar-1', x: 8, y: 10, w: 4, h: 4, type: 'calendar' as const },
      { i: 'notes-1', x: 4, y: 20, w: 4, h: 3, type: 'notes' as const },
      { i: 'goals-1', x: 8, y: 25, w: 4, h: 3, type: 'goals' as const },
    ];

    const first = normalizeLayout(layout);
    const second = normalizeLayout(first);
    const third = normalizeLayout(second);

    expect(first.map(({ i, x, y }) => ({ i, x, y }))).toEqual(layout.map(({ i, x, y }) => ({ i, x, y })));
    expect(second).toEqual(first);
    expect(third).toEqual(second);
  });

  it('preserves a valid horizontal separation exactly', () => {
    const layout = normalizeLayout([
      { i: 'todo-1', x: 0, y: 0, w: 8, h: 3, type: 'todo' as const },
      { i: 'weather-1', x: 8, y: 0, w: 4, h: 3, type: 'weather' as const },
    ]);

    expect(layout).toMatchObject([
      { i: 'todo-1', x: 0, y: 0 },
      { i: 'weather-1', x: 8, y: 0 },
    ]);
  });

  it('normalizes only the global vertical origin', () => {
    const layout = [
      { i: 'news-1', x: 0, y: 3, w: 8, h: 3, type: 'news' as const },
      { i: 'analytics-1', x: 8, y: 7, w: 4, h: 3, type: 'analytics' as const },
      { i: 'todo-1', x: 0, y: 20, w: 8, h: 3, type: 'todo' as const },
    ];
    const normalized = normalizeDesktopOrigin(layout);

    expect(normalized).toMatchObject([
      { i: 'news-1', x: 0, y: 0 },
      { i: 'analytics-1', x: 8, y: 4 },
      { i: 'todo-1', x: 0, y: 17 },
    ]);
    expect(normalized[2].y - normalized[1].y).toBe(layout[2].y - layout[1].y);
    expect(normalizeDesktopOrigin(normalized)).toEqual(normalized);
  });

  it('clamps positions and resolves overlaps deterministically', () => {
    const layout = normalizeLayout([
      { i: 'goals-1', x: 20, y: 0, w: 1, h: 1, type: 'goals' },
      { i: 'bookmarks-1', x: 20, y: 0, w: 1, h: 1, type: 'bookmarks' },
    ]);

    expect(layout[0]).toMatchObject({ x: 8, y: 0, w: 4, h: 2 });
    expect(layout[1]).toMatchObject({ x: 8, y: 2, w: 4, h: 2 });
    expect(hasLayoutCollision(layout[0], [layout[1]])).toBe(false);
  });

  it('applies runtime height changes without replacing canonical positions', () => {
    const canonical = [
      { i: 'news-1', x: 0, y: 0, w: 8, h: 3, type: 'news' as const },
      { i: 'weather-1', x: 8, y: 35, w: 4, h: 3, type: 'weather' as const },
    ];

    const rendered = applyLayoutHeightOverrides(canonical, { 'weather-1': 6 });

    expect(rendered.find((item) => item.i === 'weather-1')).toMatchObject({
      x: 8,
      y: 35,
      w: 4,
      h: 6,
    });
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

  it('moves only the conflicting item while preserving a distant widget', () => {
    const normalized = normalizeLayout([
      { i: 'weather-1', x: 0, y: 0, w: 4, h: 3, type: 'weather' as const },
      { i: 'notes-1', x: 0, y: 0, w: 4, h: 3, type: 'notes' as const },
      { i: 'goals-1', x: 8, y: 20, w: 4, h: 3, type: 'goals' as const },
    ]);

    expect(normalized[0]).toMatchObject({ i: 'weather-1', x: 0, y: 0 });
    expect(normalized[1]).toMatchObject({ i: 'notes-1', x: 0, y: 2 });
    expect(normalized[2]).toMatchObject({ i: 'goals-1', x: 8, y: 20 });
  });

  it('adds widgets after the occupied layout without moving existing widgets', () => {
    const existing = [{ i: 'todo-1', x: 0, y: 0, w: 8, h: 3, type: 'todo' as const }];
    const next = addWidgetToLayout(existing, { i: 'weather-1', x: 0, y: 0, w: 1, h: 1, type: 'weather' });

    expect(next[0]).toMatchObject({ ...existing[0], w: 4, h: 2 });
    expect(next[1]).toMatchObject({ i: 'weather-1', x: 0, y: 2, w: 4, h: 2 });
    expect(hasLayoutCollision(next[1], [next[0]])).toBe(false);
  });

  it('keeps repeated widget types in separate appended positions', () => {
    const existing = [{ i: 'pomodoro-1', x: 4, y: 2, w: 4, h: 3, type: 'pomodoro' as const }];
    const next = addWidgetToLayout(existing, { i: 'pomodoro-2', x: 0, y: 0, w: 1, h: 1, type: 'pomodoro' });

    expect(next[1]).toMatchObject({ i: 'pomodoro-2', x: 0, y: 4, w: 4, h: 2 });
    expect(next[0]).toMatchObject({ x: 4, y: 2 });
    expect(hasLayoutCollision(next[1], next.slice(0, 1))).toBe(false);
  });

  it('places a new widget on the next free row when the preferred row is full', () => {
    const existing = [
      { i: 'weather-1', x: 0, y: 0, w: 4, h: 3, type: 'weather' as const },
      { i: 'notes-1', x: 4, y: 0, w: 4, h: 3, type: 'notes' as const },
      { i: 'goals-1', x: 8, y: 0, w: 4, h: 3, type: 'goals' as const },
    ];
    const next = addWidgetToLayout(existing, { i: 'weather-1', x: 0, y: 0, w: 1, h: 1, type: 'weather' });

    expect(next[3]).toMatchObject({ i: 'weather-1', x: 0, y: 2, w: 4, h: 2 });
    expect(next.every((item, index) => !hasLayoutCollision(item, next.slice(index + 1)))).toBe(true);
  });

  it('normalizes a stale re-added widget position before insertion', () => {
    const existing = [
      { i: 'todo-1', x: 0, y: 0, w: 6, h: 3, type: 'todo' as const },
      { i: 'bookmarks-1', x: 4, y: 0, w: 4, h: 3, type: 'bookmarks' as const },
    ];
    const next = addWidgetToLayout(existing, {
      i: 'bookmarks-2', x: 4, y: 0, w: 4, h: 3, type: 'bookmarks',
    });

    expect(next[0]).toMatchObject({ i: 'todo-1', x: 0, y: 0 });
    expect(next[1]).toMatchObject({ i: 'bookmarks-1', x: 4, y: 0 });
    expect(next[2]).toMatchObject({ i: 'bookmarks-2', x: 0, y: 2 });
    expect(next.every((item, index) => !hasLayoutCollision(item, next.slice(index + 1)))).toBe(true);
  });

  it('removes a widget without affecting the rest of the layout', () => {
    const layout = [
      { i: 'weather-1', x: 0, y: 0, w: 4, h: 3, type: 'weather' as const },
      { i: 'notes-1', x: 4, y: 0, w: 4, h: 3, type: 'notes' as const },
    ];

    expect(removeWidgetFromLayout(layout, 'weather-1')).toEqual([{ ...layout[1], h: 2 }]);
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

  it('derives a two-column compact tablet layout without changing desktop data', () => {
    const desktop = [
      { i: 'todo-1', x: 0, y: 0, w: 4, h: 2, type: 'todo' as const },
      { i: 'news-1', x: 4, y: 0, w: 4, h: 2, type: 'news' as const },
      { i: 'weather-1', x: 0, y: 2, w: 4, h: 2, type: 'weather' as const },
    ];
    const tablet = compactLayoutForColumns(desktop, 10);

    expect(tablet).toMatchObject([
      { i: 'todo-1', x: 0, y: 0, w: 5, h: 2 },
      { i: 'news-1', x: 5, y: 0, w: 5, h: 2 },
      { i: 'weather-1', x: 0, y: 2, w: 5, h: 2 },
    ]);
    expect(desktop[2]).toMatchObject({ x: 0, y: 2, w: 4, h: 2 });
  });
});
