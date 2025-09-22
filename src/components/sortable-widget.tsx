// src/components/sortable-widget.tsx (улучшенная версия)
'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WidgetRenderer } from './widget-renderer';
import { useDashboard } from '@/contexts/dashboard-context';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';

interface SortableWidgetProps {
  id: string;
  type: string;
}

export function SortableWidget({ id, type }: SortableWidgetProps) {
  const { state } = useDashboard();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const widget = state.widgets.find(w => w.id === id);

  if (!widget) {
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <div className="p-4 border border-dashed border-gray-300 rounded-lg">
          Widget not found: {id}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'opacity-50' : ''}`}
      whileHover={{ scale: 1.01 }}
    >
      {/* Ручка для перетаскивания */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -top-2 -left-2 z-10 bg-gray-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shadow-lg"
        title="Drag to rearrange"
      >
        <GripVertical size={14} />
      </div>

      {/* Виджет с контекстным меню */}
      <WidgetRenderer widget={widget} />
    </motion.div>
  );
}