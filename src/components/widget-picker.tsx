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
  ClipboardList,
  CloudSun,
  Newspaper,
  Plus,
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

  const handleAddWidget = (type: WidgetType) => {
    const widgetConfig = WIDGET_TYPES.find(w => w.type === type);
    if (widgetConfig) {
      addWidget(type, {
        title: widgetConfig.label,
      });
    }
    setIsOpen(false);
  };

  const canAddWidget = (type: WidgetType) => {
    return true;
  };

  return (
    <div className="relative" ref={pickerRef}>
      {/* Add button — use motion.button instead of AnimatedButton for animations */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="ff-glass-control ff-glass-control-primary inline-flex h-9 items-center gap-2 px-3.5 text-sm font-medium text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50/80"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus size={18} />
        <span>Add Widget</span>
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
                <div className="p-2">
                  {WIDGET_TYPES.map((widget) => (
                    <motion.button
                      key={widget.type}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddWidget(widget.type)}
                      disabled={!canAddWidget(widget.type)}
                      className={`w-full flex items-start p-3 rounded-lg mb-1 transition-all ${
                        canAddWidget(widget.type)
                          ? 'cursor-pointer hover:border-indigo-200 hover:bg-indigo-50'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span className="mr-3 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <widget.icon size={18} aria-hidden="true" />
                      </span>
                      <div className="text-left flex-1">
                        <span className="font-medium text-gray-900">{widget.label}</span>
                        <p className="text-sm text-gray-600 mt-1">{widget.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Informational footer */}
              <div className="border-t border-slate-100 bg-slate-50/70 p-3">
                <p className="text-xs text-gray-500 text-center">
                  {state.widgets.length} widgets on dashboard
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
