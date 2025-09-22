// src/types/dashboard.ts
export type WidgetType = 
  | 'todo' 
  | 'weather' 
  | 'news' 
  | 'pomodoro'
  | 'calendar'
  | 'stocks'       // Новый: акции
  | 'notes'        // Новый: заметки  
  | 'analytics'    // Новый: аналитика
  | 'bookmarks'    // Новый: закладки
  | 'goals';       // Новый: цели

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