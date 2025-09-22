// src/components/dashboard-grid.tsx
'use client';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useDashboard } from '@/contexts/dashboard-context';
import { SortableWidget } from './sortable-widget';
import { WidgetRenderer } from './widget-renderer';
import { motion } from 'framer-motion';
import { easeOut } from 'framer-motion';

// Анимации для контейнера и элементов
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const itemVariants = { 
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { duration: 0.4, ease: easeOut },
  }, 
};

export function DashboardGrid() {
  const { state, updateLayout } = useDashboard();
  const { layout, isEditing, widgets } = state;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = layout.findIndex((item) => item.i === active.id);
      const newIndex = layout.findIndex((item) => item.i === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newLayout = arrayMove(layout, oldIndex, newIndex);
        updateLayout(newLayout);
      }
    }
  }

  // Функция для получения виджета по ID
  const getWidgetById = (id: string) => {
    return widgets.find(widget => widget.id === id);
  };

  // Режим просмотра (без drag-and-drop)
  if (!isEditing) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {layout.map((item) => {
          const widget = getWidgetById(item.i);
          return widget ? (
            <motion.div
              key={item.i}
              variants={itemVariants}
              className={item.w > 1 ? 'lg:col-span-2' : ''}
            >
              <WidgetRenderer widget={widget} />
            </motion.div>
          ) : null;
        })}
      </motion.div>
    );
  }

  // Режим редактирования (с drag-and-drop)
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={layout.map(item => item.i)} strategy={rectSortingStrategy}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {layout.map((item) => {
            const widget = getWidgetById(item.i);
            return widget ? (
              <motion.div
                key={item.i}
                variants={itemVariants}
                className={item.w > 1 ? 'lg:col-span-2' : ''}
              >
                <SortableWidget id={item.i} type={item.type} />
              </motion.div>
            ) : null;
          })}
        </motion.div>
      </SortableContext>
    </DndContext>
  );
}