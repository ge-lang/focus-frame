// src/components/widget-context-menu.tsx
'use client';
import { useState } from 'react';
import { useDashboard } from '@/contexts/dashboard-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Settings, MoreVertical } from 'lucide-react';

interface WidgetContextMenuProps {
  widgetId: string;
  children: React.ReactNode;
}

export function WidgetContextMenu({ widgetId, children }: WidgetContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { state, removeWidget } = useDashboard();

  const handleDelete = () => {
    if (confirm('Are you sure you want to remove this widget?')) {
      removeWidget(widgetId);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Триггер контекстного меню */}
      {state.isEditing && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-2 right-2 z-20 bg-white/80 backdrop-blur-sm text-gray-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          title="Widget options"
        >
          <MoreVertical size={16} />
        </button>
      )}

      {children}

      {/* Контекстное меню */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Меню */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-8 right-0 z-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]"
            >
              <button
                onClick={handleDelete}
                className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm"
              >
                <Trash2 size={14} />
                <span>Remove</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}