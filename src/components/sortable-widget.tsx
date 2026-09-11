// src/components/sortable-widget.tsx (improved version)
'use client';
import { WidgetRenderer } from './widget-renderer';
import { useDashboard } from '@/contexts/dashboard-context';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { ModalPortal } from './modal-portal';
import { useState } from 'react';

interface SortableWidgetProps {
  id: string;
  type: string;
  compact?: boolean;
  onContentHeightChange?: (widgetId: string, height: number) => void;
}

export function SortableWidget({ id, type, compact = false, onContentHeightChange }: SortableWidgetProps) {
  const { state, removeWidget } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);
  const widget = state.widgets.find(w => w.id === id);

  if (!widget) {
    return <div className="rounded-lg border border-dashed border-gray-300 p-4">Widget not found: {id}</div>;
  }

  const handleRemove = () => {
    if (window.confirm(`Remove ${type} widget from your dashboard?`)) removeWidget(id);
  };

  return (
    <>
      <motion.div className="group relative h-full">
      {/* Widget with a context menu */}
      <WidgetRenderer widget={widget} variant={compact ? 'compact' : 'full'} onOpen={() => setIsOpen(true)} onContentHeightChange={onContentHeightChange} />

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

    {isOpen && compact && (
      <ModalPortal>
        <div className="ff-modal-backdrop fixed inset-0 z-[var(--ff-z-modal)] flex items-start justify-center overflow-y-auto p-4 pt-[max(4rem,10vh)]" onClick={() => setIsOpen(false)}>
          <div className="ff-focus-view w-full max-w-[1020px] max-h-[85vh] overflow-y-auto" data-no-drag onClick={(event) => event.stopPropagation()}>
            <div className="mb-2 flex justify-end"><button type="button" onClick={() => setIsOpen(false)} className="ff-focus-view-close rounded px-2 py-1 text-sm" aria-label={`Close ${type} focus view`}>Close</button></div>
            <WidgetRenderer widget={widget} onContentHeightChange={onContentHeightChange} />
          </div>
        </div>
      </ModalPortal>
    )}
    </>
  );
}
