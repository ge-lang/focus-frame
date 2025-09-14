// src/contexts/dashboard-context.tsx
'use client';
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { WidgetType } from '@/types/dashboard';

// Типы
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
    { id: 'todo-1', type: 'todo', colSpan: 1 },
    { id: 'weather-1', type: 'weather', colSpan: 1 },
    { id: 'news-1', type: 'news', colSpan: 2 },
  ],
  layout: [
    { i: 'todo-1', x: 0, y: 0, w: 1, h: 2 },
    { i: 'weather-1', x: 1, y: 0, w: 1, h: 1 },
    { i: 'news-1', x: 0, y: 2, w: 2, h: 1 },
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
  addWidget: (type: WidgetType) => void;
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
  const addWidget = (type: WidgetType) => {
    const newWidget: Widget = {
      id: `${type}-${Date.now()}`,
      type,
      colSpan: type === 'news' ? 2 : 1,
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