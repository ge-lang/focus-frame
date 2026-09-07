// src/components/sortable-widget.tsx (improved version)
'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WidgetRenderer } from './widget-renderer';
import { useDashboard } from '@/contexts/dashboard-context';
import { motion } from 'framer-motion';
import { GripVertical, Maximize2 } from 'lucide-react';
import { clampWidgetSize, GRID_ROW_HEIGHT } from '@/lib/dashboard-layout';

interface SortableWidgetProps {
  id: string;
  type: string;
}

export function SortableWidget({ id, type }: SortableWidgetProps) {
  const { state, updateLayout } = useDashboard();
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
  const layoutItem = state.layout.find(item => item.i === id);

  if (!widget) {
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <div className="p-4 border border-dashed border-gray-300 rounded-lg">
          Widget not found: {id}
        </div>
      </div>
    );
  }

  if (!layoutItem) return null;

  const resize = (width: number, height: number) => {
    const size = clampWidgetSize(layoutItem.type, width, height);
    updateLayout(state.layout.map((item) => item.i === id ? { ...item, ...size } : item));
  };

  const handleResizePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = layoutItem.w;
    const startHeight = layoutItem.h;
    const widgetWidth = event.currentTarget.parentElement?.getBoundingClientRect().width ?? 240;
    const columnWidth = Math.max(widgetWidth / startWidth, 120);
    const rowHeight = GRID_ROW_HEIGHT;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      resize(
        startWidth + (moveEvent.clientX - startX) / columnWidth,
        startHeight + (moveEvent.clientY - startY) / rowHeight,
      );
    };
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleResizeKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 2 : 1;
    if (event.key === 'ArrowRight') resize(layoutItem.w + step, layoutItem.h);
    if (event.key === 'ArrowLeft') resize(layoutItem.w - step, layoutItem.h);
    if (event.key === 'ArrowDown') resize(layoutItem.w, layoutItem.h + step);
    if (event.key === 'ArrowUp') resize(layoutItem.w, layoutItem.h - step);
    if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-2xl ring-1 ring-indigo-200/70 ring-inset ${isDragging ? 'opacity-50' : ''}`}
      whileHover={{ scale: 1.01 }}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -top-2 -left-2 z-10 rounded-full bg-indigo-500 p-1 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 cursor-grab"
        title="Drag to rearrange"
      >
        <GripVertical size={14} />
      </div>

      {/* Widget with a context menu */}
      <WidgetRenderer widget={widget} />

      <button
        type="button"
        aria-label={`Resize ${type} widget`}
        title="Resize widget"
        onPointerDown={handleResizePointerDown}
        onKeyDown={handleResizeKeyDown}
        className="absolute bottom-1 right-1 z-10 block cursor-nwse-resize rounded-md bg-white/90 p-1.5 text-indigo-600 shadow-sm ring-1 ring-indigo-200 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <Maximize2 size={14} />
      </button>
    </motion.div>
  );
}
