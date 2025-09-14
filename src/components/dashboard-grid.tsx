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
import { WidgetRenderer } from './widget-renderer'; // Добавляем импорт

export function DashboardGrid() {
  const { state, updateLayout } = useDashboard();
  const { layout, isEditing } = state;

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

  if (!isEditing) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {layout.map((item) => (
          <div key={item.i} className={item.w > 1 ? 'lg:col-span-2' : ''}>
            <WidgetRenderer type={item.i.split('-')[0]} id={item.i} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={layout.map(item => item.i)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {layout.map((item) => (
            <div key={item.i} className={item.w > 1 ? 'lg:col-span-2' : ''}>
              <SortableWidget id={item.i} type={item.i.split('-')[0]} />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}