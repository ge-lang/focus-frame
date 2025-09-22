// src/components/add-widget-dialog.tsx
'use client';
import { useState } from 'react';
import { useDashboard } from '@/contexts/dashboard-context';
import { WidgetType } from '@/types/dashboard';
import { AnimatedButton } from './animated-button';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';

interface WidgetOption {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
  defaultColSpan: number;
}

const widgetOptions: WidgetOption[] = [
  { type: 'todo', name: 'Tasks', description: 'Manage your to-do list', icon: '✅', defaultColSpan: 1 },
  { type: 'weather', name: 'Weather', description: 'Check current weather', icon: '🌤️', defaultColSpan: 1 },
  { type: 'news', name: 'News', description: 'Latest news feed', icon: '📰', defaultColSpan: 2 },
  { type: 'pomodoro', name: 'Pomodoro', description: 'Focus timer', icon: '⏱️', defaultColSpan: 1 },
  { type: 'calendar', name: 'Calendar', description: 'Upcoming events', icon: '📅', defaultColSpan: 1 },
  { type: 'stocks', name: 'Stocks', description: 'Stock market data', icon: '📈', defaultColSpan: 1 },
  { type: 'notes', name: 'Notes', description: 'Quick notes', icon: '📝', defaultColSpan: 1 },
  { type: 'analytics', name: 'Analytics', description: 'Productivity stats', icon: '📊', defaultColSpan: 2 },
  { type: 'bookmarks', name: 'Bookmarks', description: 'Website links', icon: '🔖', defaultColSpan: 1 },
  { type: 'goals', name: 'Goals', description: 'Personal goals', icon: '🎯', defaultColSpan: 1 },
];

export default function AddWidgetDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const { addWidget, state } = useDashboard();

  const handleAddWidget = (type: WidgetType) => {
    const config = widgetOptions.find(opt => opt.type === type);
    if (config) {
      addWidget(type, {
        colSpan: config.defaultColSpan,
        title: config.name
      });
      setIsOpen(false);
      setSelectedType(null);
    }
  };

  const canAddWidget = (type: WidgetType) => {
    // Можно добавить логику ограничений если нужно
    return true;
  };

  return (
    <>
      {/* Кнопка добавления */}
      <AnimatedButton
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
      >
        <Plus size={24} />
      </AnimatedButton>

      {/* Модальное окно */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Затемнение фона */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />
            
            {/* Диалоговое окно */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl p-6 w-11/12 max-w-4xl max-h-[80vh] overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Widget</h2>
                <button
                  onClick={() => setIsOpen(false)}
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
                        ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                        : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{option.icon}</span>
                      <h3 className="font-semibold text-gray-900">{option.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                    <div className="text-xs text-gray-500">
                      Size: {option.defaultColSpan} column{option.defaultColSpan > 1 ? 's' : ''}
                    </div>
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