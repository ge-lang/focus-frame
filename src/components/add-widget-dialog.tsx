// src/components/add-widget-dialog.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { useDashboard } from '@/contexts/dashboard-context';
import { WidgetType } from '@/types/dashboard';
import { AnimatedButton } from './animated-button';
import { motion, AnimatePresence } from 'framer-motion';
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

interface WidgetOption {
  type: WidgetType;
  name: string;
  description: string;
  icon: LucideIcon;
}

const widgetOptions: WidgetOption[] = [
  { type: 'todo', name: 'Tasks', description: 'Manage your to-do list', icon: ClipboardList },
  { type: 'weather', name: 'Weather', description: 'Check current weather', icon: CloudSun },
  { type: 'news', name: 'News', description: 'Latest news feed', icon: Newspaper },
  { type: 'pomodoro', name: 'Pomodoro', description: 'Focus timer', icon: Timer },
  { type: 'calendar', name: 'Calendar', description: 'Upcoming events', icon: CalendarDays },
  { type: 'notes', name: 'Notes', description: 'Quick notes', icon: StickyNote },
  { type: 'analytics', name: 'Analytics', description: 'Productivity stats', icon: BarChart3 },
  { type: 'bookmarks', name: 'Bookmarks', description: 'Website links', icon: Bookmark },
  { type: 'goals', name: 'Goals', description: 'Personal goals', icon: Target },
];

export default function AddWidgetDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { addWidget, state } = useDashboard();

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [isOpen]);

  const handleAddWidget = (type: WidgetType) => {
    const config = widgetOptions.find(opt => opt.type === type);
    if (config) {
      addWidget(type, {
        title: config.name
      });
      setIsOpen(false);
      setSelectedType(null);
    }
  };

  const canAddWidget = (type: WidgetType) => {
    // Add limit logic here if needed
    return true;
  };

  return (
    <>
      {/* Add button */}
      <AnimatedButton
        onClick={() => setIsOpen(true)}
        ariaLabel="Add widget"
        className="ff-glass-control fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full text-indigo-700 shadow-sm hover:bg-indigo-50/90"
      >
        <Plus size={24} />
      </AnimatedButton>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />
            
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-widget-title"
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl p-6 w-11/12 max-w-4xl max-h-[80vh] overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 id="add-widget-title" className="text-2xl font-bold text-gray-900">Add Widget</h2>
                <button
                  ref={closeButtonRef}
                  onClick={() => setIsOpen(false)}
                  aria-label="Close add widget dialog"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[60vh]">
                {widgetOptions.map((option) => (
                  <motion.button
                    key={option.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddWidget(option.type)}
                    disabled={!canAddWidget(option.type)}
                    className={`p-4 text-left rounded-lg border-2 transition-all ${
                      canAddWidget(option.type)
                        ? 'cursor-pointer border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                        : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <span className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <option.icon size={18} aria-hidden="true" />
                      </span>
                      <h3 className="font-semibold text-gray-900">{option.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  {state.widgets.length} widgets on dashboard
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
