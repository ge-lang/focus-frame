import type { LayoutItem, Widget, WidgetType } from '@/types/dashboard';

export const DESKTOP_GRID_COLUMNS = 12;
export const OBJECT_LAYOUT_VERSION = 5;
export const COMPACT_LAYOUT_VERSION = OBJECT_LAYOUT_VERSION;
export const OBJECT_GRID_MARGIN = 16;
const mobileWidgetHeights: Record<WidgetType, number> = {
  todo: 7,
  weather: 6,
  news: 7,
  pomodoro: 6,
  calendar: 7,
  notes: 5,
  analytics: 7,
  bookmarks: 5,
  goals: 5,
};

export interface WidgetSizing {
  w: number;
  h: number;
}

const widgetSizing: Record<WidgetType, WidgetSizing> = {
  todo: { w: 4, h: 2 },
  weather: { w: 2, h: 2 },
  news: { w: 12, h: 1 },
  pomodoro: { w: 2, h: 2 },
  calendar: { w: 2, h: 2 },
  notes: { w: 2, h: 2 },
  analytics: { w: 2, h: 2 },
  bookmarks: { w: 2, h: 2 },
  goals: { w: 4, h: 2 },
};

const compactDefaultPositions: Record<WidgetType, { x: number; y: number }> = {
  news: { x: 0, y: 0 },
  todo: { x: 0, y: 1 },
  goals: { x: 4, y: 1 },
  pomodoro: { x: 8, y: 1 },
  calendar: { x: 10, y: 1 },
  weather: { x: 0, y: 3 },
  analytics: { x: 2, y: 3 },
  notes: { x: 4, y: 3 },
  bookmarks: { x: 6, y: 3 },
};

export function getWidgetSizing(type: WidgetType): WidgetSizing {
  return widgetSizing[type];
}

export function canonicalizeWidgetMetadata(widgets: Widget[]): Widget[] {
  return widgets.map((widget) => {
    const sizing = getWidgetSizing(widget.type);
    return { ...widget, colSpan: sizing.w, rowSpan: sizing.h };
  });
}

export function getGridHeightForContent(
  contentHeight: number,
  rowHeight = 72,
  rowMargin = 16,
  minimumHeight = 1,
): number {
  const safeHeight = Math.max(0, Math.ceil(contentHeight));
  return Math.max(minimumHeight, Math.ceil((safeHeight + rowMargin) / (rowHeight + rowMargin)));
}

export function getSquareGridUnit(containerWidth: number, columns: number, margin = OBJECT_GRID_MARGIN): number {
  if (!Number.isFinite(containerWidth) || columns < 1) return 1;
  return Math.max(1, (containerWidth - margin * (columns - 1)) / columns);
}

export function canPersistDesktopLayout(
  isHydrated: boolean,
  width: number,
  breakpoint: string,
  minimumWidth = 1024,
): boolean {
  return isHydrated && breakpoint === 'lg' && Number.isFinite(width) && width >= minimumWidth;
}

function overlaps(first: LayoutItem, second: LayoutItem): boolean {
  return first.x < second.x + second.w &&
    first.x + first.w > second.x &&
    first.y < second.y + second.h &&
    first.y + first.h > second.y;
}

export function hasLayoutCollision(item: LayoutItem, layout: LayoutItem[]): boolean {
  return layout.some((other) => other.i !== item.i && overlaps(item, other));
}

function clampX(x: number, width: number, columns: number): number {
  return Math.min(Math.max(Math.round(x), 0), Math.max(columns - width, 0));
}

function findFreePosition(item: LayoutItem, occupied: LayoutItem[], columns: number): LayoutItem {
  const preferredX = clampX(item.x, item.w, columns);
  const preferredY = Math.max(0, Math.round(item.y));
  for (let y = preferredY; ; y += 1) {
    const candidate = { ...item, x: preferredX, y };
    if (!hasLayoutCollision(candidate, occupied)) return candidate;
  }
}

export function withWidgetSizing(item: LayoutItem): LayoutItem {
  const sizing = getWidgetSizing(item.type);
  return { ...item, w: sizing.w, h: sizing.h };
}

export function reconcileLayoutTypes(
  layout: LayoutItem[],
  widgets: Pick<Widget, 'id' | 'type'>[],
): LayoutItem[] {
  const widgetTypes = new Map(widgets.map((widget) => [widget.id, widget.type]));

  return layout.flatMap((item) => {
    const type = widgetTypes.get(item.i);
    return type ? [{ ...item, type }] : [];
  });
}

export interface CompactMigrationResult {
  layout: LayoutItem[];
  widgets: Widget[];
  migrated: boolean;
}

export function migrateToCompactLayout(
  layout: LayoutItem[],
  widgets: Widget[],
  layoutVersion = 0,
): CompactMigrationResult {
  const canonicalWidgets = canonicalizeWidgetMetadata(widgets);
  if (layoutVersion >= OBJECT_LAYOUT_VERSION) {
    const reconciled = reconcileLayoutTypes(layout, canonicalWidgets);
    return {
      widgets: canonicalWidgets,
      layout: normalizeLayout(reconciled),
      migrated: false,
    };
  }

  // Version 4 already used object coordinates. Turn News into a full-width
  // strip in place and only move items that now intersect its footprint.
  if (layoutVersion === OBJECT_LAYOUT_VERSION - 1 && layout.length > 0) {
    const reconciled = reconcileLayoutTypes(layout, canonicalWidgets);
    return {
      widgets: canonicalWidgets,
      layout: normalizeLayout(reconciled),
      migrated: true,
    };
  }

  const occupied: LayoutItem[] = [];
  const migratedLayout = canonicalWidgets.flatMap((widget) => {
    const sizing = getWidgetSizing(widget.type);
    const position = compactDefaultPositions[widget.type];
    const candidate: LayoutItem = {
      i: widget.id,
      x: position.x,
      y: position.y,
      w: sizing.w,
      h: sizing.h,
      type: widget.type,
    };
    const placed = findFreePosition(candidate, occupied, DESKTOP_GRID_COLUMNS);
    occupied.push(placed);
    return [placed];
  });

  return { widgets: canonicalWidgets, layout: migratedLayout, migrated: true };
}

export function normalizeDesktopOrigin(layout: LayoutItem[]): LayoutItem[] {
  if (layout.length === 0) return layout;

  const minY = Math.min(...layout.map((item) => item.y));
  if (!Number.isFinite(minY) || minY <= 0) return layout;

  return layout.map((item) => ({ ...item, y: item.y - minY }));
}

export function normalizeLayout(layout: LayoutItem[], columns = DESKTOP_GRID_COLUMNS): LayoutItem[] {
  const normalized: LayoutItem[] = [];

  for (const item of layout) {
    const sized = withWidgetSizing(item);
    const candidate = {
      ...sized,
      x: item.x,
      y: item.y,
    };
    normalized.push(findFreePosition(candidate, normalized, columns));
  }

  return normalized;
}

export function removeWidgetFromLayout(layout: LayoutItem[], widgetId: string): LayoutItem[] {
  return normalizeLayout(layout.filter((item) => item.i !== widgetId));
}

export function stackLayoutForMobile(layout: LayoutItem[], columns: number): LayoutItem[] {
  let y = 0;
  return layout.map((item) => {
    const stacked = {
      ...item,
      x: 0,
      y,
      w: columns,
      h: Math.max(item.h, mobileWidgetHeights[item.type]),
    };
    y += stacked.h;
    return stacked;
  });
}

export function compactLayoutForColumns(layout: LayoutItem[], columns: number): LayoutItem[] {
  if (columns < 6) return stackLayoutForMobile(layout, columns);

  let x = 0;
  let y = 0;
  return [...layout]
    .sort((first, second) => first.y - second.y || first.x - second.x)
    .map((item) => {
      const sizing = getWidgetSizing(item.type);
      if (x > 0 && x + sizing.w > columns) {
        x = 0;
        y += 3;
      }
      const next = { ...item, x, y, w: Math.min(sizing.w, columns), h: sizing.h };
      x += next.w;
      if (x >= columns) {
        x = 0;
        y += 3;
      }
      return next;
    });
}

export function addWidgetToLayout(layout: LayoutItem[], item: LayoutItem): LayoutItem[] {
  const normalized = normalizeLayout(layout);
  const sized = withWidgetSizing(item);
  const candidate = { ...sized, x: Math.max(0, Math.round(item.x)), y: Math.max(0, Math.round(item.y)) };
  return [...normalized, findFreePosition(candidate, normalized, DESKTOP_GRID_COLUMNS)];
}

export function resizeWidgetInLayout(layout: LayoutItem[], widgetId: string, height: number): LayoutItem[] {
  const target = layout.find((item) => item.i === widgetId);
  if (!target) return layout;

  const resizedTarget = { ...target, h: Math.max(1, Math.round(height)) };
  const ordered = [resizedTarget, ...layout.filter((item) => item.i !== widgetId)];
  const resolved: LayoutItem[] = [];

  for (const item of ordered) {
    resolved.push(resolved.length === 0 ? item : findFreePosition(item, resolved, DESKTOP_GRID_COLUMNS));
  }

  return layout.map((item) => resolved.find((candidate) => candidate.i === item.i) ?? item);
}

export function applyLayoutHeightOverrides(
  layout: LayoutItem[],
  heightOverrides: Record<string, number>,
): LayoutItem[] {
  let nextLayout = layout.map((item) => {
    const height = heightOverrides[item.i];
    return height === undefined ? item : { ...item, h: Math.max(1, Math.round(height)) };
  });

  for (const [widgetId, height] of Object.entries(heightOverrides)) {
    if (nextLayout.some((item) => item.i === widgetId)) {
      nextLayout = resizeWidgetInLayout(nextLayout, widgetId, height);
    }
  }

  return nextLayout;
}
