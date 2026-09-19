// src/components/widget-picker.tsx
'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useDashboard } from '@/contexts/dashboard-context';
import { ModalPortal } from './modal-portal';
import type { WidgetType } from '@/types/dashboard';
import {
  BarChart3,
  Bookmark,
  CalendarDays,
  Check,
  ClipboardList,
  CloudSun,
  LayoutGrid,
  Newspaper,
  Plus,
  StickyNote,
  Target,
  Timer,
  X,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export type WidgetPickerDefinition = {
  type: WidgetType;
  label: string;
  icon: LucideIcon;
  description: string;
};

// The picker and dashboard continue to share this one widget vocabulary.
export const WIDGET_TYPES: WidgetPickerDefinition[] = [
  { type: 'todo', label: 'Tasks', icon: ClipboardList, description: 'Manage your to-do list' },
  { type: 'weather', label: 'Weather', icon: CloudSun, description: 'Check current weather' },
  { type: 'news', label: 'News', icon: Newspaper, description: 'Latest news feed' },
  { type: 'pomodoro', label: 'Pomodoro', icon: Timer, description: 'Focus timer' },
  { type: 'calendar', label: 'Calendar', icon: CalendarDays, description: 'Upcoming events' },
  { type: 'notes', label: 'Notes', icon: StickyNote, description: 'Quick notes' },
  { type: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Productivity stats' },
  { type: 'bookmarks', label: 'Bookmarks', icon: Bookmark, description: 'Website links' },
  { type: 'goals', label: 'Goals', icon: Target, description: 'Personal goals' },
];

export function getWidgetAvailability(widgets: readonly { type: WidgetType }[]) {
  const presentTypes = new Set(widgets.map((widget) => widget.type));
  return {
    available: WIDGET_TYPES.filter((widget) => !presentTypes.has(widget.type)),
    onDashboard: WIDGET_TYPES.filter((widget) => presentTypes.has(widget.type)),
  };
}

export function canAddWidget(available: readonly { type: WidgetType }[], type: WidgetType) {
  return available.some((widget) => widget.type === type);
}

export function shouldCloseWidgetPickerOnKey(key: string) {
  return key === 'Escape';
}

function WidgetPreview({ widget }: { widget: WidgetPickerDefinition }) {
  const Icon = widget.icon;

  switch (widget.type) {
    case 'pomodoro':
      return (
        <span className="ff-picker-preview ff-picker-preview-pomodoro" aria-hidden="true">
          <span className="ff-picker-preview-pomodoro-ring">25</span>
        </span>
      );
    case 'weather':
      return (
        <span className="ff-picker-preview ff-picker-preview-weather" aria-hidden="true">
          <CloudSun size={22} strokeWidth={1.7} />
          <span className="ff-picker-preview-weather-line" />
        </span>
      );
    case 'calendar':
      return (
        <span className="ff-picker-preview ff-picker-preview-calendar" aria-hidden="true">
          <span className="ff-picker-preview-calendar-top" />
          <span className="ff-picker-preview-calendar-grid">
            {Array.from({ length: 9 }, (_, index) => <span key={index} className={index === 4 ? 'is-active' : ''} />)}
          </span>
        </span>
      );
    case 'analytics':
      return (
        <span className="ff-picker-preview ff-picker-preview-analytics" aria-hidden="true">
          <span className="ff-picker-preview-bars">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span className="ff-picker-preview-kpi">84%</span>
        </span>
      );
    case 'notes':
      return (
        <span className="ff-picker-preview ff-picker-preview-notes" aria-hidden="true">
          <span className="ff-picker-preview-paper-line ff-picker-preview-paper-line-long" />
          <span className="ff-picker-preview-paper-line" />
          <span className="ff-picker-preview-paper-line ff-picker-preview-paper-line-short" />
        </span>
      );
    case 'bookmarks':
      return (
        <span className="ff-picker-preview ff-picker-preview-bookmarks" aria-hidden="true">
          <Bookmark size={21} strokeWidth={1.7} />
          <span className="ff-picker-preview-bookmark-line" />
        </span>
      );
    case 'goals':
      return (
        <span className="ff-picker-preview ff-picker-preview-goals" aria-hidden="true">
          <span className="ff-picker-preview-goals-arc" />
          <span className="ff-picker-preview-goals-dot" />
        </span>
      );
    case 'news':
      return (
        <span className="ff-picker-preview ff-picker-preview-news" aria-hidden="true">
          <span className="ff-picker-preview-news-image" />
          <span className="ff-picker-preview-news-lines">
            <span />
            <span />
            <span />
          </span>
        </span>
      );
    case 'todo':
      return (
        <span className="ff-picker-preview ff-picker-preview-todo" aria-hidden="true">
          <span className="ff-picker-preview-todo-item"><span /><i /></span>
          <span className="ff-picker-preview-todo-item"><span /><i /></span>
          <span className="ff-picker-preview-todo-item"><span /><i /></span>
        </span>
      );
    default:
      return (
        <span className="ff-picker-preview" aria-hidden="true">
          <Icon size={20} strokeWidth={1.7} />
        </span>
      );
  }
}

export function WidgetPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null);
  const { addWidget, state } = useDashboard();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closePicker = () => {
    setIsOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const updateAnchor = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setAnchor({
        top: Math.round(rect.bottom + 8),
        right: Math.max(12, Math.round(window.innerWidth - rect.right)),
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldCloseWidgetPickerOnKey(event.key)) {
        event.preventDefault();
        closePicker();
      }
    };

    updateAnchor();
    window.addEventListener('resize', updateAnchor);
    window.addEventListener('scroll', updateAnchor, true);
    const focusFrame = window.requestAnimationFrame(() => window.requestAnimationFrame(() => closeButtonRef.current?.focus()));
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener('resize', updateAnchor);
      window.removeEventListener('scroll', updateAnchor, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const { available, onDashboard } = getWidgetAvailability(state.widgets);

  const handleAddWidget = (type: WidgetType) => {
    if (!canAddWidget(available, type)) return;
    const widgetConfig = WIDGET_TYPES.find((widget) => widget.type === type);
    if (widgetConfig) {
      addWidget(type, { title: widgetConfig.label });
    }
    closePicker();
  };

  const renderWidgetRow = (widget: WidgetPickerDefinition, isAvailable: boolean) => (
    <motion.button
      key={widget.type}
      type="button"
      whileHover={isAvailable ? { scale: 1.01 } : undefined}
      whileTap={isAvailable ? { scale: 0.985 } : undefined}
      onClick={() => handleAddWidget(widget.type)}
      disabled={!isAvailable}
      className={`ff-picker-row ${isAvailable ? 'ff-picker-row-available' : 'ff-picker-row-added'}`}
    >
      <WidgetPreview widget={widget} />
      <span className="ff-picker-row-copy">
        <span className="ff-picker-row-title">{widget.label}</span>
        <span className="ff-picker-row-description">{widget.description}</span>
      </span>
      {isAvailable ? (
        <span className="ff-picker-add-affordance"><Plus size={15} strokeWidth={2.2} /> <span>Add</span></span>
      ) : (
        <span className="ff-picker-added-label"><Check size={14} strokeWidth={2.4} /> <span>Added</span></span>
      )}
    </motion.button>
  );

  return (
    <div className="relative">
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls="widget-picker-dialog"
        className="ff-header-action ff-glass-control ff-glass-control-primary inline-flex h-8 items-center gap-1.5 px-2.5 text-sm font-medium text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50/80"
      >
        <LayoutGrid className="ff-widget-icon" size={17} aria-hidden="true" />
        <span>Widget</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <ModalPortal>
            <div className="ff-widget-picker-layer fixed inset-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ff-widget-picker-backdrop absolute inset-0"
                onClick={closePicker}
                aria-hidden="true"
              />

              <motion.div
                id="widget-picker-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="widget-picker-title"
                aria-describedby="widget-picker-description"
                initial={{ opacity: 0, scale: 0.97, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -8 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={anchor ? {
                  '--ff-picker-anchor-top': `${anchor.top}px`,
                  '--ff-picker-anchor-right': `${anchor.right}px`,
                } as CSSProperties : undefined}
                className="ff-widget-picker-menu fixed overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                onClick={(event) => event.stopPropagation()}
              >
              <div className="ff-picker-header">
                <div>
                  <h2 id="widget-picker-title" className="ff-picker-heading">Add Widget</h2>
                  <p id="widget-picker-description" className="ff-picker-subheading">Customize your workspace</p>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closePicker}
                  aria-label="Close add widget menu"
                  className="ff-picker-close"
                >
                  <X size={17} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>

              <div className="ff-widget-picker-scroll">
                <div className="ff-picker-list">
                  <section aria-labelledby="available-widgets-heading">
                    <div className="ff-picker-section-heading">
                      <h3 id="available-widgets-heading">Available</h3>
                      <span>{available.length}</span>
                    </div>
                    {available.length > 0 ? (
                      available.map((widget) => renderWidgetRow(widget, true))
                    ) : (
                      <p className="ff-picker-empty">All widgets are already on your dashboard.</p>
                    )}
                  </section>

                  <section aria-labelledby="dashboard-widgets-heading">
                    <div className="ff-picker-section-heading">
                      <h3 id="dashboard-widgets-heading">On your dashboard</h3>
                      <span>{onDashboard.length}</span>
                    </div>
                    {onDashboard.map((widget) => renderWidgetRow(widget, false))}
                  </section>
                </div>
              </div>

              <div className="ff-picker-status" aria-live="polite">
                {onDashboard.length} of {WIDGET_TYPES.length} widget types added
              </div>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>
    </div>
  );
}
