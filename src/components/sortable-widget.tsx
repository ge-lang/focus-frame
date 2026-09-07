// src/components/sortable-widget.tsx (improved version)
'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WidgetRenderer } from './widget-renderer';
import { useDashboard } from '@/contexts/dashboard-context';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { GripVertical, Maximize2, Trash2 } from 'lucide-react';
import { clampWidgetSize, GRID_ROW_HEIGHT } from '@/lib/dashboard-layout';

interface SortableWidgetProps {
  id: string;
  type: string;
}

export function SortableWidget({ id, type }: SortableWidgetProps) {
  const { state, updateLayout, removeWidget } = useDashboard();
  const [isResizing, setIsResizing] = useState(false);
  const [previewSize, setPreviewSize] = useState<{ w: number; h: number } | null>(null);
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
    setPreviewSize(size);
    updateLayout(state.layout.map((item) => item.i === id ? { ...item, ...size } : item));
    return size;
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
    setIsResizing(true);
    event.currentTarget.setPointerCapture(event.pointerId);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      resize(
        startWidth + (moveEvent.clientX - startX) / columnWidth,
        startHeight + (moveEvent.clientY - startY) / rowHeight,
      );
    };
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      setIsResizing(false);
      setPreviewSize(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
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

  const handleRemove = () => {
    if (window.confirm(`Remove ${type} widget from your dashboard?`)) removeWidget(id);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-2xl ring-1 ring-inset transition-shadow ${isResizing ? 'ring-2 ring-indigo-400 shadow-md' : 'ring-indigo-200/70'} ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Drag ${type} widget to rearrange`}
        className="absolute -left-2 -top-2 z-10 cursor-grab rounded-full bg-indigo-600 p-1 text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 active:cursor-grabbing"
        title="Drag to rearrange"
      >
        <GripVertical size={14} />
      </button>

      {/* Widget with a context menu */}
      <WidgetRenderer widget={widget} />

      <button
        type="button"
        aria-label={`Remove ${type} widget`}
        title="Remove widget"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={handleRemove}
        className="absolute right-2 top-2 z-10 rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
      >
        <Trash2 size={14} />
      </button>

      {isResizing && previewSize && (
        <div className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-md bg-slate-900/85 px-2 py-1 text-[11px] font-medium text-white">
          {previewSize.w} × {previewSize.h}
        </div>
      )}

      <button
        type="button"
        aria-label={`Resize ${type} widget`}
        title="Resize widget"
        onPointerDown={handleResizePointerDown}
        onKeyDown={handleResizeKeyDown}
        className="absolute bottom-1 right-1 z-10 block cursor-nwse-resize rounded-md bg-white p-2 text-indigo-600 shadow-sm ring-1 ring-indigo-300 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <Maximize2 size={14} />
      </button>
    </motion.div>
  );
}
