// src/types/dashboard.ts
export type WidgetType = 
  | 'todo' 
  | 'weather' 
  | 'news' 
  | 'pomodoro'
  | 'calendar'
  | 'stocks'       // New: stocks
  | 'notes'        // New: notes
  | 'analytics'    // New: analytics
  | 'bookmarks'    // New: bookmarks
  | 'goals';       // New: goals

export interface Widget {
  id: string;
  type: WidgetType;
  colSpan: number;
  rowSpan?: number;
  title?: string;
  config?: Record<string, any>;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: WidgetType;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface DashboardState {
  widgets: Widget[];
  layout: LayoutItem[];
  isEditing: boolean;
}
