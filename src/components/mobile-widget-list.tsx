'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { GripVertical } from 'lucide-react';
import type { LayoutItem, WidgetType } from '@/types/dashboard';
import { getMobileWidgetFrameClass } from '@/lib/dashboard-layout';

interface MobileWidgetListProps {
  items: LayoutItem[];
  isEditing: boolean;
  renderWidget: (item: LayoutItem, className: string) => ReactNode;
  onReorder: (activeId: string, overId: string) => void;
}

type ActiveDrag = { id: string; pointerId: number };

export type MobileDragEndReason = 'pointerup' | 'pointercancel' | 'lostpointercapture' | 'cleanup';

export function finishMobileDrag(active: ActiveDrag | null, pointerId: number, _reason: MobileDragEndReason): ActiveDrag | null {
  return active?.pointerId === pointerId ? null : active;
}

function labelForType(type: WidgetType) {
  return type === 'todo' ? 'Tasks' : type[0].toUpperCase() + type.slice(1);
}

export function MobileWidgetList({ items, isEditing, renderWidget, onReorder }: MobileWidgetListProps) {
  const activeDragRef = useRef<ActiveDrag | null>(null);
  const activeHandleRef = useRef<HTMLButtonElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const finishDrag = useCallback((event?: ReactPointerEvent<HTMLButtonElement>, reason: MobileDragEndReason = 'cleanup') => {
    const active = activeDragRef.current;
    if (!active) return;
    const pointerId = event?.pointerId ?? active.pointerId;
    if (active.pointerId !== pointerId) return;
    const handle = event?.currentTarget ?? activeHandleRef.current;
    if (handle?.hasPointerCapture(pointerId)) {
      handle.releasePointerCapture(pointerId);
    }
    activeDragRef.current = finishMobileDrag(active, pointerId, reason);
    activeHandleRef.current = null;
    setActiveId(null);
  }, []);

  useEffect(() => {
    if (!activeId) return undefined;
    const finishFromWindow = () => finishDrag(undefined, 'pointerup');
    window.addEventListener('pointerup', finishFromWindow, true);
    window.addEventListener('pointercancel', finishFromWindow, true);
    return () => {
      window.removeEventListener('pointerup', finishFromWindow, true);
      window.removeEventListener('pointercancel', finishFromWindow, true);
    };
  }, [activeId, finishDrag]);

  useEffect(() => {
    if (isEditing) return undefined;
    finishDrag();
    return undefined;
  }, [finishDrag, isEditing]);

  useEffect(() => () => finishDrag(), [finishDrag]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>, id: string) => {
    if (!isEditing) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    activeHandleRef.current = event.currentTarget;
    activeDragRef.current = { id, pointerId: event.pointerId };
    setActiveId(id);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const active = activeDragRef.current;
    if (!active || active.pointerId !== event.pointerId) return;
    event.preventDefault();
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-mobile-widget-id]');
    const overId = target?.dataset.mobileWidgetId;
    if (overId && overId !== active.id) onReorder(active.id, overId);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, id: string) => {
    if (!isEditing) return;
    const index = items.findIndex((item) => item.i === id);
    if (event.key === 'ArrowUp' && index > 0) {
      event.preventDefault();
      onReorder(id, items[index - 1].i);
    } else if (event.key === 'ArrowDown' && index >= 0 && index < items.length - 1) {
      event.preventDefault();
      onReorder(id, items[index + 1].i);
    }
  };

  return (
    <div
      className={`ff-mobile-widget-grid ${activeId ? 'ff-mobile-widget-grid-dragging' : ''}`}
      role="list"
      aria-label="Mobile dashboard widgets"
    >
      {items.map((item) => (
        <div
          key={item.i}
          data-mobile-widget-id={item.i}
          className={`ff-mobile-widget-grid-item ${getMobileWidgetFrameClass(item.type)} ${activeId === item.i ? 'ff-mobile-widget-grid-item-dragging' : ''}`}
          role="listitem"
        >
          {isEditing && (
            <button
              type="button"
              data-no-drag
              className="ff-mobile-widget-drag-handle"
              aria-label={`Reorder ${labelForType(item.type)} widget`}
              aria-pressed={activeId === item.i}
              title="Drag to reorder"
              onPointerDown={(event) => handlePointerDown(event, item.i)}
              onPointerMove={handlePointerMove}
              onPointerUp={(event) => finishDrag(event, 'pointerup')}
              onPointerCancel={(event) => finishDrag(event, 'pointercancel')}
              onLostPointerCapture={(event) => finishDrag(event, 'lostpointercapture')}
              onKeyDown={(event) => handleKeyDown(event, item.i)}
            >
              <GripVertical size={16} aria-hidden="true" />
            </button>
          )}
          <div className="ff-mobile-widget-grid-item-content">
            {renderWidget(item, `ff-mobile-widget-grid-item-renderer ${getMobileWidgetFrameClass(item.type)}`)}
          </div>
        </div>
      ))}
    </div>
  );
}
