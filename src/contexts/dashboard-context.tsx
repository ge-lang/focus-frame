// src/contexts/dashboard-context.tsx
'use client';
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { WidgetType } from '@/types/dashboard';

// Types
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

// Action types
type DashboardAction =
  | { type: 'ADD_WIDGET'; payload: Widget }
  | { type: 'REMOVE_WIDGET'; payload: string }
  | { type: 'UPDATE_LAYOUT'; payload: LayoutItem[] }
  | { type: 'LOAD_STATE'; payload: DashboardState }
  | { type: 'TOGGLE_EDIT' };

// Initial state
// src/contexts/dashboard-context.tsx
const initialState: DashboardState = {
  widgets: [
    { id: 'todo-1', type: 'todo', colSpan: 2, rowSpan: 2 }, // ← set colSpan to 2
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
    { i: 'todo-1', x: 0, y: 0, w: 2, h: 2, type: 'todo', minW: 1, minH: 1 }, // ← w: 2
    { i: 'weather-1', x: 2, y: 0, w: 1, h: 1, type: 'weather', minW: 1, minH: 1 },
    { i: 'news-1', x: 0, y: 2, w: 2, h: 1, type: 'news', minW: 2, minH: 1 },
    { i: 'pomodoro-1', x: 2, y: 1, w: 1, h: 1, type: 'pomodoro', minW: 1, minH: 1 },
    { i: 'calendar-1', x: 3, y: 0, w: 1, h: 2, type: 'calendar', minW: 1, minH: 2 },
    { i: 'stocks-1', x: 2, y: 2, w: 1, h: 1, type: 'stocks', minW: 1, minH: 1 },
    { i: 'notes-1', x: 3, y: 2, w: 1, h: 1, type: 'notes', minW: 1, minH: 1 },
    { i: 'analytics-1', x: 0, y: 3, w: 2, h: 2, type: 'analytics', minW: 2, minH: 2 },
    { i: 'bookmarks-1', x: 2, y: 3, w: 1, h: 1, type: 'bookmarks', minW: 1, minH: 1 },
    { i: 'goals-1', x: 3, y: 3, w: 1, h: 1, type: 'goals', minW: 1, minH: 1 },
  ],
  isEditing: false,
};

// Reducer
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

// Context type
interface DashboardContextType {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  addWidget: (type: WidgetType, config?: { title?: string; colSpan?: number; rowSpan?: number }) => void;
  removeWidget: (id: string) => void;
  updateLayout: (items: LayoutItem[]) => void;
  toggleEdit: () => void;
}

// Create the context
const DashboardContext = createContext<DashboardContextType | null>(null);

// Provider
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  
 
 // Updated addWidget function for dashboard-context.tsx

// addWidget function in dashboard-context.tsx
const addWidget = (type: WidgetType, config?: { title?: string; colSpan?: number; rowSpan?: number }) => {
  // Define default settings for each widget type
  const defaultConfigs: Record<WidgetType, { colSpan: number; rowSpan: number }> = {
    todo: { colSpan: 2, rowSpan: 2 },        // Wide widget (2 columns)
    weather: { colSpan: 1, rowSpan: 1 },     // Narrow widget (1 column)
    news: { colSpan: 2, rowSpan: 1 },        // Wide widget (2 columns)
    pomodoro: { colSpan: 1, rowSpan: 1 },    // Narrow widget
    calendar: { colSpan: 1, rowSpan: 2 },    // Narrow but tall
    stocks: { colSpan: 1, rowSpan: 1 },      // Narrow widget
    notes: { colSpan: 1, rowSpan: 1 },       // Narrow widget
    analytics: { colSpan: 2, rowSpan: 2 },   // Large widget (2x2)
    bookmarks: { colSpan: 1, rowSpan: 1 },   // Narrow widget
    goals: { colSpan: 1, rowSpan: 1 },       // Narrow widget
  };

  // Get the default settings for this widget type
  const defaultConfig = defaultConfigs[type];
  
  // Create a widget using the supplied settings or the defaults
  const newWidget: Widget = {
    id: `${type}-${Date.now()}`,
    type,
    colSpan: config?.colSpan || defaultConfig.colSpan,      // Use config or defaultConfig
    rowSpan: config?.rowSpan || defaultConfig.rowSpan,      // Use config or defaultConfig
    title: config?.title,
    config: config,
  };
  
  // Create a new layout item
  const newLayoutItem: LayoutItem = {
    i: newWidget.id,
    x: 0, // Temporary position
    y: 0, // Temporary position
    w: newWidget.colSpan,    // Use the widget's colSpan
    h: newWidget.rowSpan || 1, // Use the widget's rowSpan
    type: newWidget.type,
    minW: 1,
    minH: 1,
  };

  // Find the maximum Y position to place the widget at the bottom
  const maxY = state.layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
  newLayoutItem.y = maxY;

  // Find a free X position
  const gridColumns = 3; // Assume three columns
  let placed = false;
  
  for (let x = 0; x <= gridColumns - newLayoutItem.w; x++) {
    const isOccupied = state.layout.some(item => 
      item.y <= newLayoutItem.y && newLayoutItem.y < item.y + item.h &&
      item.x <= x && x < item.x + item.w
    );
    
    if (!isOccupied) {
      newLayoutItem.x = x;
      placed = true;
      break;
    }
  }

  // If there is no space in the current row, place it in a new one
  if (!placed) {
    newLayoutItem.x = 0;
    newLayoutItem.y = maxY + 1;
  }

  // Dispatch the updates
  dispatch({ 
    type: 'ADD_WIDGET', 
    payload: newWidget 
  });
  
  dispatch({ 
    type: 'UPDATE_LAYOUT', 
    payload: [...state.layout, newLayoutItem]
  });
};
    
   /* dispatch({ type: 'ADD_WIDGET', payload: newWidget });
  };*/

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

// Hook for using the context
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
