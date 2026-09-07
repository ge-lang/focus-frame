import type { LayoutItem, WidgetType } from '@/types/dashboard';

export const GRID_ROW_HEIGHT = 180;

export interface WidgetSizing {
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
}

const widgetSizing: Record<WidgetType, WidgetSizing> = {
  todo: { minW: 2, maxW: 3, minH: 2, maxH: 4 },
  weather: { minW: 1, maxW: 2, minH: 1, maxH: 2 },
  news: { minW: 2, maxW: 3, minH: 1, maxH: 2 },
  pomodoro: { minW: 1, maxW: 2, minH: 1, maxH: 2 },
  calendar: { minW: 1, maxW: 2, minH: 2, maxH: 3 },
  notes: { minW: 1, maxW: 2, minH: 1, maxH: 3 },
  analytics: { minW: 2, maxW: 3, minH: 2, maxH: 3 },
  bookmarks: { minW: 1, maxW: 2, minH: 1, maxH: 2 },
  goals: { minW: 1, maxW: 2, minH: 1, maxH: 2 },
};

export function getWidgetSizing(type: WidgetType): WidgetSizing {
  return widgetSizing[type];
}

export function clampWidgetSize(type: WidgetType, width: number, height: number) {
  const sizing = getWidgetSizing(type);
  return {
    w: Math.min(sizing.maxW, Math.max(sizing.minW, Math.round(width))),
    h: Math.min(sizing.maxH, Math.max(sizing.minH, Math.round(height))),
  };
}

export function withWidgetSizing(item: LayoutItem): LayoutItem {
  const sizing = getWidgetSizing(item.type);
  const size = clampWidgetSize(item.type, item.w, item.h);
  return { ...item, ...sizing, ...size };
}

export function getGridSpanClass(width: number): string {
  return width >= 3 ? 'lg:col-span-3' : width === 2 ? 'lg:col-span-2' : 'lg:col-span-1';
}
