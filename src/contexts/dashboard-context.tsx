'use client';

import React, { createContext, useContext, useEffect, useReducer, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { WidgetType } from '@/types/dashboard';
import { addWidgetToLayout, COMPACT_LAYOUT_VERSION, getWidgetSizing, migrateToCompactLayout, normalizeLayout, removeWidgetFromLayout } from '@/lib/dashboard-layout';
import { resolveHydrationPersistence, shouldPersistDashboard } from '@/lib/dashboard-persistence';

export interface Widget {
  id: string;
  type: WidgetType;
  colSpan: number;
  rowSpan?: number;
  title?: string;
  config?: Record<string, unknown>;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: WidgetType;
}

export interface DashboardState {
  widgets: Widget[];
  layout: LayoutItem[];
  layoutVersion: number;
  isEditing: boolean;
}

type DashboardAction =
  | { type: 'ADD_WIDGET'; payload: Widget }
  | { type: 'REMOVE_WIDGET'; payload: string }
  | { type: 'UPDATE_LAYOUT'; payload: LayoutItem[] }
  | { type: 'UPDATE_WIDGET_CONFIG'; payload: { id: string; config: Record<string, unknown> } }
  | { type: 'LOAD_STATE'; payload: DashboardState }
  | { type: 'TOGGLE_EDIT' };

const initialState: DashboardState = {
  widgets: [
    { id: 'todo-1', type: 'todo', colSpan: 6, rowSpan: 3 },
    { id: 'weather-1', type: 'weather', colSpan: 3, rowSpan: 3 },
    { id: 'news-1', type: 'news', colSpan: 6, rowSpan: 3 },
    { id: 'pomodoro-1', type: 'pomodoro', colSpan: 3, rowSpan: 3 },
    { id: 'calendar-1', type: 'calendar', colSpan: 3, rowSpan: 3 },
    { id: 'notes-1', type: 'notes', colSpan: 3, rowSpan: 3 },
    { id: 'analytics-1', type: 'analytics', colSpan: 3, rowSpan: 3 },
    { id: 'bookmarks-1', type: 'bookmarks', colSpan: 3, rowSpan: 3 },
    { id: 'goals-1', type: 'goals', colSpan: 6, rowSpan: 3 },
  ],
  layout: [
    { i: 'todo-1', x: 0, y: 0, w: 6, h: 3, type: 'todo' },
    { i: 'pomodoro-1', x: 6, y: 0, w: 3, h: 3, type: 'pomodoro' },
    { i: 'calendar-1', x: 9, y: 0, w: 3, h: 3, type: 'calendar' },
    { i: 'goals-1', x: 0, y: 3, w: 6, h: 3, type: 'goals' },
    { i: 'weather-1', x: 6, y: 3, w: 3, h: 3, type: 'weather' },
    { i: 'analytics-1', x: 9, y: 3, w: 3, h: 3, type: 'analytics' },
    { i: 'news-1', x: 0, y: 6, w: 6, h: 3, type: 'news' },
    { i: 'notes-1', x: 6, y: 6, w: 3, h: 3, type: 'notes' },
    { i: 'bookmarks-1', x: 9, y: 6, w: 3, h: 3, type: 'bookmarks' },
  ],
  layoutVersion: COMPACT_LAYOUT_VERSION,
  isEditing: false,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'ADD_WIDGET':
      return { ...state, widgets: [...state.widgets, action.payload] };
    case 'REMOVE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.filter((widget) => widget.id !== action.payload),
        layout: removeWidgetFromLayout(state.layout, action.payload),
      };
    case 'UPDATE_LAYOUT':
      return { ...state, layout: action.payload };
    case 'UPDATE_WIDGET_CONFIG':
      return {
        ...state,
        widgets: state.widgets.map((widget) => widget.id === action.payload.id
          ? { ...widget, config: { ...widget.config, ...action.payload.config } }
          : widget),
      };
    case 'LOAD_STATE':
      return action.payload;
    case 'TOGGLE_EDIT':
      return { ...state, isEditing: !state.isEditing };
    default:
      return state;
  }
}

interface DashboardContextType {
  state: DashboardState;
  isHydrated: boolean;
  dispatch: React.Dispatch<DashboardAction>;
  addWidget: (type: WidgetType, config?: { title?: string; colSpan?: number; rowSpan?: number }) => void;
  removeWidget: (id: string) => void;
  updateLayout: (items: LayoutItem[], options?: { markDirty?: boolean }) => void;
  updateWidgetConfig: (id: string, config: Record<string, unknown>) => void;
  toggleEdit: () => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const [dashboardHydration, setDashboardHydration] = useState<'loading' | 'ready' | 'error'>('loading');
  const { status: sessionStatus } = useSession();
  const isDirtyRef = React.useRef(false);
  const mutationVersionRef = React.useRef(0);

  const markDirty = () => {
    isDirtyRef.current = true;
    mutationVersionRef.current += 1;
  };

  useEffect(() => {
    if (sessionStatus !== 'authenticated') {
      isDirtyRef.current = false;
      setDashboardHydration('loading');
      return;
    }

    let isMounted = true;
    setDashboardHydration('loading');

    fetch('/api/dashboard')
      .then((response) => {
        if (!response.ok) throw new Error(`Dashboard load failed (${response.status})`);
        return response.json();
      })
      .then((data) => {
        if (isMounted && data?.state) {
          const migrated = migrateToCompactLayout(data.state.layout, data.state.widgets, data.state.layoutVersion ?? 0);
          dispatch({
            type: 'LOAD_STATE',
            payload: {
              ...data.state,
              widgets: migrated.widgets,
              layout: migrated.layout,
              layoutVersion: COMPACT_LAYOUT_VERSION,
              isEditing: false,
            },
          });
          const hydrationPersistence = resolveHydrationPersistence(migrated.migrated, mutationVersionRef.current);
          mutationVersionRef.current = hydrationPersistence.mutationVersion;
          isDirtyRef.current = hydrationPersistence.isDirty;
        }
        if (isMounted) {
          if (!data?.state) isDirtyRef.current = false;
          setDashboardHydration('ready');
        }
      })
      .catch((error) => {
        console.error('Failed to load dashboard:', error);
        if (isMounted) setDashboardHydration('error');
      });

    return () => {
      isMounted = false;
    };
  }, [sessionStatus]);

  useEffect(() => {
    if (!shouldPersistDashboard(dashboardHydration, sessionStatus, isDirtyRef.current)) return;

    const mutationVersion = mutationVersionRef.current;
    const timeoutId = window.setTimeout(() => {
      fetch('/api/dashboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: { widgets: state.widgets, layout: state.layout, layoutVersion: state.layoutVersion } }),
      }).then((response) => {
        if (response.ok && mutationVersion === mutationVersionRef.current) {
          isDirtyRef.current = false;
        }
      }).catch((error) => console.error('Failed to save dashboard:', error));
    }, 750);

    return () => window.clearTimeout(timeoutId);
  }, [dashboardHydration, sessionStatus, state.widgets, state.layout, state.layoutVersion]);

  const addWidget = (type: WidgetType, config?: { title?: string; colSpan?: number; rowSpan?: number }) => {
    markDirty();
    const sizing = getWidgetSizing(type);
    const newWidget: Widget = {
      id: `${type}-${Date.now()}`,
      type,
      colSpan: sizing.w,
      rowSpan: sizing.h,
      title: config?.title,
      config,
    };
    const newLayoutItem: LayoutItem = {
      i: newWidget.id,
      x: 0,
      y: 0,
      w: sizing.w,
      h: sizing.h,
      type,
    };

    dispatch({ type: 'ADD_WIDGET', payload: newWidget });
      dispatch({ type: 'UPDATE_LAYOUT', payload: addWidgetToLayout(state.layout, newLayoutItem) });
  };

  const removeWidget = (id: string) => {
    markDirty();
    dispatch({ type: 'REMOVE_WIDGET', payload: id });
  };
  const updateLayout = (items: LayoutItem[], options?: { markDirty?: boolean }) => {
    if (options?.markDirty !== false) markDirty();
    dispatch({ type: 'UPDATE_LAYOUT', payload: items });
  };
  const updateWidgetConfig = (id: string, config: Record<string, unknown>) => {
    markDirty();
    dispatch({ type: 'UPDATE_WIDGET_CONFIG', payload: { id, config } });
  };
  const toggleEdit = () => dispatch({ type: 'TOGGLE_EDIT' });

  return (
    <DashboardContext.Provider value={{ state, isHydrated: dashboardHydration === 'ready', dispatch, addWidget, removeWidget, updateLayout, updateWidgetConfig, toggleEdit }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
  return context;
}
