'use client';

import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatedWidget } from '@/components/animated-widget';
import { useTasks } from '@/hooks/use-tasks';
import { getCalendarPriorityAccent } from '@/lib/calendar-priority';
import { calendarMonthCells, calendarSummary, localDateKey, taskDeadlineKey, tasksForCalendarDate, upcomingTasksWithinDays } from '@/lib/calendar-agenda';
import type { Task } from '@/types/task';

interface CalendarWidgetProps {
  widgetId: string;
  title?: string;
}

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
const dayFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' });
const shortDayFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function statusLabel(status: Task['status']) {
  return status === 'in_progress' ? 'In Progress' : status === 'todo' ? 'To Do' : 'Done';
}

function priorityDotClass(priority: Task['priority']) {
  return `ff-calendar-priority-dot ${getCalendarPriorityAccent(priority) ?? ''}`;
}

function AgendaRow({ task, showDate }: { task: Task; showDate: boolean }) {
  return (
    <div className="ff-calendar-agenda-row">
      <span className={priorityDotClass(task.priority)} aria-label={`${task.priority} priority`} title={`${task.priority} priority`} />
      <span className="ff-calendar-agenda-task" title={task.title}>{task.title}</span>
      <span className="ff-calendar-agenda-status">{statusLabel(task.status)}</span>
      {showDate && taskDeadlineKey(task.dueDate) ? <time className="ff-calendar-agenda-date" dateTime={taskDeadlineKey(task.dueDate) ?? undefined}>{shortDayFormatter.format(new Date(`${taskDeadlineKey(task.dueDate)}T00:00:00`))}</time> : null}
    </div>
  );
}

export default function CalendarWidget({ title }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const { data: tasks = [] } = useTasks();
  const today = new Date();
  const todayKey = localDateKey(today);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthCells = useMemo(() => calendarMonthCells(currentDate), [currentDate]);
  const monthLabel = monthFormatter.format(currentDate);
  const selectedTasks = selectedDateKey ? tasksForCalendarDate(tasks, selectedDateKey) : [];
  const upcomingTasks = upcomingTasksWithinDays(tasks, today).slice(0, 5);
  const summary = calendarSummary(tasks, today);
  const selectedDate = selectedDateKey ? new Date(`${selectedDateKey}T00:00:00`) : null;

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1));
    setSelectedDateKey(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateKey(todayKey);
  };

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <AnimatedWidget className="ff-calendar-focus text-slate-800">
      <div className="ff-calendar-focus-shell">
        <header className="ff-calendar-focus-header">
          <div className="flex items-center gap-2">
            <CalendarIcon size={18} className="text-indigo-600" aria-hidden="true" />
            <h3 className="widget-drag-handle cursor-grab select-none text-lg font-semibold active:cursor-grabbing">{title || 'Calendar'}</h3>
          </div>
          <span className="ff-calendar-focus-caption">Month overview</span>
        </header>

        <div className="ff-calendar-month-nav">
          <button type="button" className="ff-calendar-nav-button" onClick={() => navigateMonth('prev')} aria-label="Previous month"><ChevronLeft size={17} /></button>
          <strong>{monthLabel}</strong>
          <button type="button" className="ff-calendar-nav-button" onClick={() => navigateMonth('next')} aria-label="Next month"><ChevronRight size={17} /></button>
          {!isCurrentMonth || selectedDateKey ? <button type="button" className="ff-calendar-today-action" onClick={goToToday}>Today</button> : null}
        </div>

        <section className="ff-calendar-month-panel" aria-label={`${monthLabel} calendar`}>
          <div className="ff-calendar-weekdays">
            {weekdays.map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="ff-calendar-month-grid">
            {monthCells.map((day, index) => {
              if (day === null) return <span key={`empty-${index}`} className="ff-calendar-day ff-calendar-day-empty" aria-hidden="true" />;
              const dateKey = localDateKey(new Date(year, month, day));
              const dueTasks = tasksForCalendarDate(tasks, dateKey);
              const selected = selectedDateKey === dateKey;
              const current = todayKey === dateKey;
              const priorities: Task['priority'][] = ['high', 'medium', 'low'];
              return (
                <button
                  key={dateKey}
                  type="button"
                  className={`ff-calendar-day${current ? ' is-today' : ''}${selected ? ' is-selected' : ''}`}
                  onClick={() => setSelectedDateKey(dateKey)}
                  aria-label={`${dayFormatter.format(new Date(year, month, day))}${dueTasks.length ? `, ${dueTasks.length} task${dueTasks.length === 1 ? '' : 's'}` : ''}`}
                  aria-pressed={selected}
                >
                  <span className="ff-calendar-day-number">{day}</span>
                  {dueTasks.length > 0 ? <span className="ff-calendar-day-markers" aria-hidden="true">
                    {priorities.filter((priority) => dueTasks.some((task) => task.priority === priority)).slice(0, 3).map((priority) => <i key={priority} className={priorityDotClass(priority)} />)}
                    {dueTasks.length > 3 ? <b>+{dueTasks.length - 3}</b> : null}
                  </span> : null}
                </button>
              );
            })}
          </div>
        </section>

        <section className="ff-calendar-lower" aria-live="polite">
          <div className="ff-calendar-agenda">
            <div className="ff-calendar-section-heading">
              <div>
                <h4>{selectedDate ? dayFormatter.format(selectedDate) : 'Upcoming · Next 7 days'}</h4>
                <p>{selectedDate ? `${selectedTasks.length} task${selectedTasks.length === 1 ? '' : 's'} scheduled` : 'Current task deadlines'}</p>
              </div>
              {selectedDate ? <button type="button" className="ff-calendar-clear-selection" onClick={() => setSelectedDateKey(null)}>Show upcoming</button> : null}
            </div>
            <div className="ff-calendar-agenda-list">
              {(selectedDate ? selectedTasks : upcomingTasks).map((task) => <AgendaRow key={task.id} task={task} showDate={!selectedDate} />)}
            </div>
            {(selectedDate ? selectedTasks : upcomingTasks).length === 0 ? <div className="ff-calendar-empty-agenda"><CalendarIcon size={16} aria-hidden="true" /><span>{selectedDate ? 'No tasks scheduled' : 'No deadlines this week'}</span></div> : null}
          </div>

          <aside className="ff-calendar-summary" aria-label="Calendar summary">
            <h4>Summary</h4>
            <div><span>Upcoming</span><strong>{summary.upcoming}</strong></div>
            <div><span>Overdue</span><strong>{summary.overdue}</strong></div>
            <div><span>High priority</span><strong>{summary.highPriority}</strong></div>
          </aside>
        </section>
      </div>
    </AnimatedWidget>
  );
}
