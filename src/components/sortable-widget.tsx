// src/components/sortable-widget.tsx
'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WidgetRenderer } from './widget-renderer';
import { motion } from 'framer-motion';
import { WidgetType } from '@/types/dashboard'; // Добавляем импорт

export function SortableWidget({ id, type }: { id: string; type: WidgetType }) { // Меняем string на WidgetType
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

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isDragging ? 0.6 : 1,
        scale: isDragging ? 1.05 : 1,
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`cursor-grab active:cursor-grabbing ${
        isDragging ? 'z-50 rotate-2' : ''
      }`}
    >
      <WidgetRenderer type={type} id={id} />
    </motion.div>
  );
}