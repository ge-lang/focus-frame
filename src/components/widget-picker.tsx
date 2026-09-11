// src/components/widget-picker.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { useDashboard } from '@/contexts/dashboard-context';
import { WidgetType } from '@/types/dashboard';
import { AnimatedButton } from './animated-button';
import {
  BarChart3,
  Bookmark,
  CalendarDays,
  Check,
  ClipboardList,
  CloudSun,
  LayoutGrid,
  Newspaper,
  StickyNote,
  Target,
  Timer,
  X,
  type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WIDGET_TYPES: { 
  type: WidgetType; 
  label: string; 
  icon: LucideIcon;
  description: string;
}[] = [
  { type: 'todo', label: 'Tasks', icon: ClipboardList, description: 'Manage your to-do list' },
  { type: 'weather', label: 'Weather', icon: CloudSun, description: 'Check current weather' },
  { type: 'news', label: 'News', icon: Newspaper, description: 'Latest news feed' },
  { type: 'pomodoro', label: 'Pomodoro', icon: Timer, description: 'Focus timer' },
  { type: 'calendar', label: 'Calendar', icon: CalendarDays, description: 'Upcoming events' },
  { type: 'notes', label: 'Notes', icon: StickyNote, description: 'Quick notes' },
  { type: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Productivity stats' },
  { type: 'bookmarks', label: 'Bookmarks', icon: Bookmark, description: 'Website links' },
  { type: 'goals', label: 'Goals', icon: Target, description: 'Personal goals' },
];

export function getWidgetAvailability(widgets: { type: WidgetType }[]) {
  const presentTypes = new Set(widgets.map((widget) => widget.type));
  return {
    available: WIDGET_TYPES.filter((widget) => !presentTypes.has(widget.type)),
    onDashboard: WIDGET_TYPES.filter((widget) => presentTypes.has(widget.type)),
  };
}

export function WidgetPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const { addWidget, state } = useDashboard();
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { available, onDashboard } = getWidgetAvailability(state.widgets);

  const handleAddWidget = (type: WidgetType) => {
    if (!available.some((widget) => widget.type === type)) return;
    const widgetConfig = WIDGET_TYPES.find(w => w.type === type);
    if (widgetConfig) {
      addWidget(type, {
        title: widgetConfig.label,
      });
    }
    setIsOpen(false);
  };

  const renderWidgetRow = (widget: (typeof WIDGET_TYPES)[number], isAvailable: boolean) => (
    <motion.button
      key={widget.type}
      type="button"
      whileHover={isAvailable ? { scale: 1.02 } : undefined}
      whileTap={isAvailable ? { scale: 0.98 } : undefined}
      onClick={() => handleAddWidget(widget.type)}
      disabled={!isAvailable}
      className={`ff-picker-row mb-1 flex w-full items-start rounded-lg p-3 text-left transition-all ${
        isAvailable
          ? 'cursor-pointer hover:border-indigo-200 hover:bg-indigo-50'
          : 'ff-picker-row-added cursor-default'
      }`}
    >
      <span className={`ff-picker-icon mr-3 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isAvailable ? 'bg-indigo-50 text-indigo-600' : ''}`}>
        {isAvailable ? <widget.icon size={18} aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}
      </span>
      <span className="flex-1">
        <span className="font-medium text-gray-900">{widget.label}</span>
        <span className="mt-1 block text-sm text-gray-600">{widget.description}</span>
      </span>
      {!isAvailable && <span className="ff-picker-added-label ml-2 mt-1 text-xs font-medium">Added</span>}
    </motion.button>
  );

  return (
    <div className="relative" ref={pickerRef}>
      {/* Add button — use motion.button instead of AnimatedButton for animations */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="ff-header-action ff-glass-control ff-glass-control-primary inline-flex h-8 items-center gap-1.5 px-2.5 text-sm font-medium text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50/80"
      >
        <LayoutGrid className="ff-widget-icon" size={17} aria-hidden="true" />
        <span>Widget</span>
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ff-widget-picker-backdrop fixed inset-0 z-[var(--ff-z-modal)] bg-black bg-opacity-50"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Selection menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="ff-widget-picker-menu absolute right-0 top-full z-[var(--ff-z-dialog)] mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Add Widget</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close add widget menu"
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Widget list */}
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-4 p-2">
                  <section aria-labelledby="available-widgets-heading">
                    <h4 id="available-widgets-heading" className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Available to add</h4>
                    {available.length > 0 ? available.map((widget) => renderWidgetRow(widget, true)) : <p className="px-2 py-3 text-sm text-slate-500">All widgets are already on your dashboard.</p>}
                  </section>
                  <section aria-labelledby="dashboard-widgets-heading">
                    <h4 id="dashboard-widgets-heading" className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">On your dashboard</h4>
                    {onDashboard.map((widget) => renderWidgetRow(widget, false))}
                  </section>
                </div>
              </div>

              {/* Informational footer */}
              <div className="border-t border-slate-100 bg-slate-50/70 p-3">
                <p className="text-xs text-gray-500 text-center">
                  {onDashboard.length} of {WIDGET_TYPES.length} widget types on dashboard · {available.length} available
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
