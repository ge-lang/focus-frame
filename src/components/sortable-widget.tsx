// src/components/sortable-widget.tsx
'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WidgetRenderer } from './widget-renderer';
import { useDashboard } from '@/contexts/dashboard-context';

interface SortableWidgetProps {
  id: string;
  type: string;
}

export function SortableWidget({ id, type }: SortableWidgetProps) {
  const { state } = useDashboard();
  const { widgets } = state;
  
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

  // Находим виджет по ID
  const widget = widgets.find(w => w.id === id);

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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'opacity-50' : ''}
    >
      <WidgetRenderer widget={widget} />
    </div>
  );
}