import type { LayoutItem, WidgetType } from '@/types/dashboard';

export const DESKTOP_GRID_COLUMNS = 12;
// Keep intentional breathing room, but prevent persisted layouts from creating
// several hundred pixels of empty space after reload or widget removal.
const MAX_PRESERVED_EMPTY_ROWS = 3;
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
  todo: { w: 6, h: 3 },
  weather: { w: 4, h: 3 },
  news: { w: 6, h: 3 },
  pomodoro: { w: 4, h: 3 },
  calendar: { w: 4, h: 4 },
  notes: { w: 4, h: 3 },
  analytics: { w: 8, h: 3 },
  bookmarks: { w: 4, h: 3 },
  goals: { w: 4, h: 3 },
};

export function getWidgetSizing(type: WidgetType): WidgetSizing {
  return widgetSizing[type];
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
  const candidates = Array.from({ length: columns }, (_, x) => x)
    .sort((first, second) => Math.abs(first - preferredX) - Math.abs(second - preferredX));

  for (let y = preferredY; y <= preferredY + occupied.length + 20; y += 1) {
    for (const x of candidates) {
      const candidate = { ...item, x, y };
      if (!hasLayoutCollision(candidate, occupied)) return candidate;
    }
  }

  return { ...item, x: 0, y: preferredY + occupied.length + 1 };
}

export function withWidgetSizing(item: LayoutItem): LayoutItem {
  const sizing = getWidgetSizing(item.type);
  return { ...item, w: sizing.w, h: sizing.h };
}

function isLegacyThreeColumnLayout(layout: LayoutItem[]): boolean {
  return layout.length > 0 && layout.every((item) => item.w <= 3 && item.x <= 3);
}

export function normalizeLayout(layout: LayoutItem[], columns = DESKTOP_GRID_COLUMNS): LayoutItem[] {
  const legacy = columns === DESKTOP_GRID_COLUMNS && isLegacyThreeColumnLayout(layout);
  const normalized: LayoutItem[] = [];

  for (const item of layout) {
    const sized = withWidgetSizing(item);
    const previousBottom = normalized.reduce((bottom, current) => Math.max(bottom, current.y + current.h), 0);
    const preferredY = normalized.length === 0
      ? Math.min(Math.max(0, Math.round(item.y)), MAX_PRESERVED_EMPTY_ROWS)
      : Math.min(Math.max(0, Math.round(item.y)), previousBottom + MAX_PRESERVED_EMPTY_ROWS);
    const candidate = {
      ...sized,
      x: legacy ? item.x * 4 : item.x,
      y: preferredY,
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

export function addWidgetToLayout(layout: LayoutItem[], item: LayoutItem): LayoutItem[] {
  const sized = withWidgetSizing(item);
  const nextRow = layout.reduce((bottom, current) => Math.max(bottom, current.y + current.h), 0);
  const appended = { ...sized, x: 0, y: nextRow };
  return [...layout, findFreePosition(appended, layout, DESKTOP_GRID_COLUMNS)];
}
