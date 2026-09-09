// src/components/sortable-widget.tsx (improved version)
'use client';
import { WidgetRenderer } from './widget-renderer';
import { useDashboard } from '@/contexts/dashboard-context';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface SortableWidgetProps {
  id: string;
  type: string;
}

export function SortableWidget({ id, type }: SortableWidgetProps) {
  const { state, removeWidget } = useDashboard();
  const widget = state.widgets.find(w => w.id === id);

  if (!widget) {
    return <div className="rounded-lg border border-dashed border-gray-300 p-4">Widget not found: {id}</div>;
  }

  const handleRemove = () => {
    if (window.confirm(`Remove ${type} widget from your dashboard?`)) removeWidget(id);
  };

  return (
    <motion.div
      className="group relative h-full"
    >
      {/* Widget with a context menu */}
      <WidgetRenderer widget={widget} />

      {state.isEditing && (
        <button
          type="button"
          aria-label={`Remove ${type} widget`}
          title="Remove widget"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={handleRemove}
          className="absolute right-2 top-2 z-10 rounded-md p-1.5 text-slate-400 opacity-60 transition hover:bg-red-50 hover:text-red-600 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          <Trash2 size={14} />
        </button>
      )}

    </motion.div>
  );
}
