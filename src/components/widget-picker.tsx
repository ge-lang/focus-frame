// src/components/widget-picker.tsx
'use client';
import { useState } from 'react';
import { useDashboard } from '@/contexts/dashboard-context';
import { WidgetType } from '@/types/dashboard';
import { AnimatedButton } from './animated-button';
import { Plus } from 'lucide-react';

const WIDGET_TYPES: { type: WidgetType; label: string; icon: React.ReactNode }[] = [
  { type: 'todo', label: 'Todo List', icon: '📝' },
  { type: 'weather', label: 'Weather', icon: '🌤️' },
  { type: 'news', label: 'News', icon: '📰' },
  { type: 'pomodoro', label: 'Pomodoro', icon: '⏰' },
  { type: 'calendar', label: 'Calendar', icon: '📅' },
];

export function WidgetPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const { addWidget } = useDashboard();

  const handleAddWidget = (type: WidgetType) => {
    addWidget(type);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <AnimatedButton
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-green-500"
      >
        <Plus size={18} />
        <span>Add Widget</span>
      </AnimatedButton>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Choose widget</h3>
            <div className="space-y-1">
              {WIDGET_TYPES.map((widget) => (
                <button
                  key={widget.type}
                  onClick={() => handleAddWidget(widget.type)}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <span>{widget.icon}</span>
                  <span>{widget.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overlay для закрытия по клику вне меню */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}