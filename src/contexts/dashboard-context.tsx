// src/contexts/dashboard-context.tsx
'use client';
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { WidgetType } from '@/types/dashboard';

// Типы
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

// Типы действий
type DashboardAction =
  | { type: 'ADD_WIDGET'; payload: Widget }
  | { type: 'REMOVE_WIDGET'; payload: string }
  | { type: 'UPDATE_LAYOUT'; payload: LayoutItem[] }
  | { type: 'LOAD_STATE'; payload: DashboardState }
  | { type: 'TOGGLE_EDIT' };

// Начальное состояние
const initialState: DashboardState = {
  widgets: [
    { id: 'todo-1', type: 'todo', colSpan: 1, rowSpan: 2 },
    { id: 'weather-1', type: 'weather', colSpan: 1, rowSpan: 1 },
    { id: 'news-1', type: 'news', colSpan: 2, rowSpan: 1 },
    { id: 'pomodoro-1', type: 'pomodoro', colSpan: 1, rowSpan: 1 },
    { id: 'calendar-1', type: 'calendar', colSpan: 1, rowSpan: 2 },
    { id: 'stocks-1', type: 'stocks', colSpan: 1, rowSpan: 1 },
    { id: 'notes-1', type: 'notes', colSpan: 1, rowSpan: 1 },
    { id: 'analytics-1', type: 'analytics', colSpan: 2, rowSpan: 2 },
    { id: 'bookmarks-1', type: 'bookmarks', colSpan: 1, rowSpan: 1 },
    { id: 'goals-1', type: 'goals', colSpan: 1, rowSpan: 1 },
  ],
  layout: [
    { i: 'todo-1', x: 0, y: 0, w: 1, h: 2, type: 'todo', minW: 1, minH: 1 },
    { i: 'weather-1', x: 1, y: 0, w: 1, h: 1, type: 'weather', minW: 1, minH: 1 },
    { i: 'news-1', x: 0, y: 2, w: 2, h: 1, type: 'news', minW: 2, minH: 1 },
    { i: 'pomodoro-1', x: 2, y: 0, w: 1, h: 1, type: 'pomodoro', minW: 1, minH: 1 },
    { i: 'calendar-1', x: 3, y: 0, w: 1, h: 2, type: 'calendar', minW: 1, minH: 2 },
    { i: 'stocks-1', x: 1, y: 1, w: 1, h: 1, type: 'stocks', minW: 1, minH: 1 },
    { i: 'notes-1', x: 2, y: 1, w: 1, h: 1, type: 'notes', minW: 1, minH: 1 },
    { i: 'analytics-1', x: 0, y: 3, w: 2, h: 2, type: 'analytics', minW: 2, minH: 2 },
    { i: 'bookmarks-1', x: 3, y: 2, w: 1, h: 1, type: 'bookmarks', minW: 1, minH: 1 },
    { i: 'goals-1', x: 3, y: 3, w: 1, h: 1, type: 'goals', minW: 1, minH: 1 },
  ],
  isEditing: false,
};

// Редюсер
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'ADD_WIDGET':
      return {
        ...state,
        widgets: [...state.widgets, action.payload],
      };

    case 'REMOVE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.filter(w => w.id !== action.payload),
        layout: state.layout.filter(item => item.i !== action.payload),
      };

    case 'UPDATE_LAYOUT':
      return {
        ...state,
        layout: action.payload,
      };

    case 'LOAD_STATE':
      return action.payload;

    case 'TOGGLE_EDIT':
      return {
        ...state,
        isEditing: !state.isEditing,
      };

    default:
      return state;
  }
}

// Тип контекста
interface DashboardContextType {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  addWidget: (type: WidgetType, config?: { title?: string; colSpan?: number; rowSpan?: number }) => void;
  removeWidget: (id: string) => void;
  updateLayout: (items: LayoutItem[]) => void;
  toggleEdit: () => void;
}

// Создаем контекст
const DashboardContext = createContext<DashboardContextType | null>(null);

// Провайдер
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Функции-хелперы
  const addWidget = (type: WidgetType, config?: { title?: string; colSpan?: number; rowSpan?: number }) => {
    const defaultConfigs: Record<WidgetType, { colSpan: number; rowSpan: number }> = {
      todo: { colSpan: 1, rowSpan: 2 },
      weather: { colSpan: 1, rowSpan: 1 },
      news: { colSpan: 2, rowSpan: 1 },
      pomodoro: { colSpan: 1, rowSpan: 1 },
      calendar: { colSpan: 1, rowSpan: 2 },
      stocks: { colSpan: 1, rowSpan: 1 },
      notes: { colSpan: 1, rowSpan: 1 },
      analytics: { colSpan: 2, rowSpan: 2 },
      bookmarks: { colSpan: 1, rowSpan: 1 },
      goals: { colSpan: 1, rowSpan: 1 },
    };

    const defaultConfig = defaultConfigs[type];
    
    const newWidget: Widget = {
      id: `${type}-${Date.now()}`,
      type,
      colSpan: config?.colSpan || defaultConfig.colSpan,
      rowSpan: config?.rowSpan || defaultConfig.rowSpan,
      title: config?.title,
      config: config,
    };
    
    dispatch({ type: 'ADD_WIDGET', payload: newWidget });
  };

  const removeWidget = (id: string) => {
    dispatch({ type: 'REMOVE_WIDGET', payload: id });
  };

  const updateLayout = (items: LayoutItem[]) => {
    dispatch({ type: 'UPDATE_LAYOUT', payload: items });
  };

  const toggleEdit = () => {
    dispatch({ type: 'TOGGLE_EDIT' });
  };

  return (
    <DashboardContext.Provider
      value={{
        state,
        dispatch,
        addWidget,
        removeWidget,
        updateLayout,
        toggleEdit,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

// Хук для использования контекста
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}