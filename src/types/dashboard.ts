// src/types/dashboard.ts
export type WidgetType = 'todo' | 'weather' | 'news' | 'calendar' | 'pomodoro';

export interface Widget {
  id: string;
  type: WidgetType;
  colSpan: number;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
}

export interface DashboardState {
  widgets: Widget[];
  layout: LayoutItem[];
  isEditing: boolean;
}