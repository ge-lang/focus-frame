// src/components/widget-picker.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { useDashboard } from '@/contexts/dashboard-context';
import { WidgetType } from '@/types/dashboard';
import { AnimatedButton } from './animated-button';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WIDGET_TYPES: { 
  type: WidgetType; 
  label: string; 
  icon: string;
  description: string;
  colSpan: number;
}[] = [
  { type: 'todo', label: 'Tasks', icon: '✅', description: 'Manage your to-do list', colSpan: 1 },
  { type: 'weather', label: 'Weather', icon: '🌤️', description: 'Check current weather', colSpan: 1 },
  { type: 'news', label: 'News', icon: '📰', description: 'Latest news feed', colSpan: 2 },
  { type: 'pomodoro', label: 'Pomodoro', icon: '⏱️', description: 'Focus timer', colSpan: 1 },
  { type: 'calendar', label: 'Calendar', icon: '📅', description: 'Upcoming events', colSpan: 1 },
  { type: 'stocks', label: 'Stocks', icon: '📈', description: 'Stock market data', colSpan: 1 },
  { type: 'notes', label: 'Notes', icon: '📝', description: 'Quick notes', colSpan: 1 },
  { type: 'analytics', label: 'Analytics', icon: '📊', description: 'Productivity stats', colSpan: 2 },
  { type: 'bookmarks', label: 'Bookmarks', icon: '🔖', description: 'Website links', colSpan: 1 },
  { type: 'goals', label: 'Goals', icon: '🎯', description: 'Personal goals', colSpan: 1 },
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
        colSpan: widgetConfig.colSpan
      });
    }
    setIsOpen(false);
  };

  const canAddWidget = (type: WidgetType) => {
    return true;
  };

  return (
    <div className="relative" ref={pickerRef}>
      {/* Кнопка добавления - используем motion.button вместо AnimatedButton для анимаций */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus size={18} />
        <span>Add Widget</span>
      </motion.button>

      {/* Выпадающее меню */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Затемнение фона */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Меню выбора */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* Заголовок */}
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Add Widget</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Список виджетов */}
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
                          ? 'hover:bg-blue-50 hover:border-blue-200 cursor-pointer'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-2xl mr-3 mt-1">{widget.icon}</span>
                      <div className="text-left flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{widget.label}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {widget.colSpan} col
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{widget.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Футер с информацией */}
              <div className="p-3 border-t border-gray-100 bg-gray-50">
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